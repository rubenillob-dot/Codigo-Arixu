// OPERACIÓN: CÓDIGO ARIXU - COMPORTAMIENTO & LOGICA REACTIVA DEFINITIVA

function startApp() {
  // --- ELEMENTOS DEL DOM ---
  var activeUsersGrid = document.getElementById("active-users-grid");
  var progressFill = document.getElementById("progress-fill");
  var activeRatio = document.getElementById("active-ratio");
  
  // Recompensas
  var rewardsSection = document.getElementById("recompensas");
  var rewardCards = document.querySelectorAll(".reward-card");
  var rewardsTitle = document.getElementById("rewards-title");
  var rewardsSubtitle = document.getElementById("rewards-subtitle");
  var dynamicStatusMessage = document.getElementById("dynamic-status-message");

  // Ruleta de la suerte DOM y estado
  var ruletaCanvas = document.getElementById("ruleta-canvas");
  var btnGirar = document.getElementById("btn-girar-ruleta");
  var winnerName = document.getElementById("resultado-nombre");
  var winnerDisplay = document.getElementById("ruleta-resultado-box");
  var participantCountEl = document.getElementById("ruleta-contador-activos");

  var activeParticipants = [];
  var assignedWinners = [];
  var currentAngle = 0; // en radianes
  var isSpinning = false;
  var animationId = null;

  var wheelColors = [
    "#9146FF", // Morado Twitch Emblemático
    "#00F0FF", // Cían Neón Vibrante
    "#772CE8", // Violeta Twitch Profundo
    "#A970FF", // Morado Twitch Brillante
    "#00FF88"  // Verde Neón Esmeralda
  ];
  
  // --- VARIABLES DE ESTADO ---
  var TARGET_GOAL = 300;
  var MANUAL_ACTIVE_COUNT = 340; // Conteo manual para pruebas / inicio de mes
  
  // --- BOTÓN DE REINICIAR GANADORES DE SKINS ---
  var btnResetGanadores = document.getElementById("btn-reset-ganadores");
  if (btnResetGanadores) {
    btnResetGanadores.addEventListener("click", function() {
      resetWinners();
    });
  }

  // --- EXTRACTOR E INYECTOR MANUAL DE LA RULETA ---
  var btnExtraer = document.getElementById("btn-extraer-nombres");
  var inputExtraidos = document.getElementById("nombres-extraidos-input");
  var btnCopiar = document.getElementById("btn-copiar-nombres");
  var btnCargar = document.getElementById("btn-cargar-ruleta");
  var inputNombres = document.getElementById("ruleta-nombres-input");

  if (btnExtraer) {
    btnExtraer.addEventListener("click", function() {
      var nameCards = document.querySelectorAll("#active-users-grid .user-title-name");
      var names = [];
      var i;
      for (i = 0; i < nameCards.length; i++) {
        names.push(nameCards[i].textContent.trim());
      }
      if (inputExtraidos) {
        inputExtraidos.value = names.join(", ");
      }
    });
  }

  if (btnCopiar) {
    btnCopiar.addEventListener("click", function() {
      if (inputExtraidos && inputExtraidos.value) {
        navigator.clipboard.writeText(inputExtraidos.value);
        var originalText = btnCopiar.innerHTML;
        btnCopiar.innerHTML = '<i class="fa-solid fa-check"></i> ¡Copiado!';
        setTimeout(function() {
          btnCopiar.innerHTML = originalText;
        }, 1500);
      }
    });
  }

  if (btnCargar) {
    btnCargar.addEventListener("click", function() {
      if (inputNombres) {
        var val = inputNombres.value;
        var namesRaw = val.split(",");
        var finalParticipants = [];
        var j;
        for (j = 0; j < namesRaw.length; j++) {
          var trimmed = namesRaw[j].trim();
          if (trimmed != "") {
            finalParticipants.push({
              nombre: trimmed,
              estado: "activo",
              url_captura: ""
            });
          }
        }
        
        activeParticipants = finalParticipants;
        if (participantCountEl) {
          participantCountEl.textContent = activeParticipants.length;
        }

        if (activeParticipants.length == 0) {
          drawEmptyWheel(ruletaCanvas);
          if (btnGirar) btnGirar.disabled = true;
        } else {
          if (btnGirar) btnGirar.disabled = false;
          drawWheel(ruletaCanvas);
        }
      }
    });
  }

  // VINCULACIÓN ESTÁTICA DEL BOTÓN GIRAR (Garantiza funcionalidad 100%)
  if (btnGirar) {
    btnGirar.addEventListener("click", function() {
      spin(ruletaCanvas, btnGirar, winnerDisplay, winnerName);
    });
  }

  // --- INICIALIZACIÓN ---
  initApp();

  function initApp() {
    renderApp();
  }

  // --- RENDERIZADO PRINCIPAL ---
  function renderApp() {
    // 1. Limpiar cuadrículas
    activeUsersGrid.innerHTML = "";
    
    // 2. Filtrar desde el array usuariosNexo cargado de data.js
    var activeUsers = usuariosNexo.filter(function(u) {
      return u.estado == 'activo';
    });
    
    var activeCount = MANUAL_ACTIVE_COUNT != null ? MANUAL_ACTIVE_COUNT : activeUsers.length;
    
    // 3. Renderizar cuadrícula de Activos
    if (activeUsers.length == 0) {
      activeUsersGrid.innerHTML = 
        '<div class="no-users-msg" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px; border: 1px dashed var(--border-green); border-radius: 12px; background: rgba(0, 255, 136, 0.02); font-family: var(--font-gaming);">' +
        '  <i class="fa-solid fa-bolt-lightning" style="font-size: 2rem; color: var(--neon-green); margin-bottom: 12px; display: block; filter: drop-shadow(0 0 8px var(--neon-green-glow));"></i>' +
        '  ¡La Meta Central está inactiva! Aún no hay ningún usuario verificado este mes.' +
        '</div>';
    } else {
      activeUsers.forEach(function(usuario) {
        activeUsersGrid.appendChild(createUserCard(usuario, 'activo'));
      });
    }

    // 5. Barra de progreso y contador
    var progressPercent = Math.min((activeCount / TARGET_GOAL) * 100, 100);
    progressFill.style.width = progressPercent + "%";
    activeRatio.textContent = activeCount + " / " + TARGET_GOAL;
    
    // 6. Estado de las Recompensas
    updateRewards(activeCount);
    
    // 7. Renderizar Ruleta de la Suerte
    renderRuleta(activeUsers);
  }

  // --- GENERACIÓN DE TARJETA ---
  function createUserCard(usuario, estado) {
    var card = document.createElement("div");
    card.className = "user-card";
    
    var initials = usuario.nombre.substring(0, 2).toUpperCase();
    
    var imgUrl = usuario.url_captura ? usuario.url_captura : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80";
    
    var isVideo = imgUrl.toLowerCase().endsWith(".mp4") || imgUrl.toLowerCase().endsWith(".mov");
    var mediaHtml = isVideo 
      ? '<video src="' + imgUrl + '" muted playsinline autoplay loop class="user-thumbnail-video" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>'
      : '<img src="' + imgUrl + '" alt="Captura de ' + usuario.nombre + '" loading="lazy">';
    
    card.innerHTML = 
      '<div class="user-card-hdr">' +
      '  <div class="user-avatar-sphere">' + initials + '</div>' +
      '  <div class="user-title-name" title="' + usuario.nombre + '">' + usuario.nombre + '</div>' +
      '</div>' +
      '<div class="user-thumbnail">' +
      '  ' + mediaHtml +
      '</div>';
    
    return card;
  }

  // --- CONTROL DE RECOMPENSAS (META DE 300) ---
  function updateRewards(activeCount) {
    var remaining = TARGET_GOAL - activeCount;
    
    if (activeCount >= TARGET_GOAL) {
      // DESBLOQUEADO
      rewardsSection.classList.remove("locked");
      rewardsSection.classList.add("unlocked");
      
      rewardCards.forEach(function(card) {
        card.classList.remove("locked");
        card.classList.add("unlocked-celebration");
        var lockIcon = card.querySelector(".lock-circle i");
        if (lockIcon) {
          lockIcon.className = "fa-solid fa-circle-check";
          lockIcon.style.color = "var(--neon-gold)";
        }
      });
      
      rewardsTitle.innerHTML = '<i class="fa-solid fa-trophy" style="color: var(--neon-gold); text-shadow: 0 0 15px var(--neon-gold-glow)"></i> ¡META CONSEGUIDA: RECOMPENSAS DESBLOQUEADAS!';
      rewardsTitle.classList.add("highlight-text");
      rewardsSubtitle.textContent = "¡Felicitaciones a toda la comunidad! Hemos alcanzado los 300 códigos activos. Los sorteos de las 3 Skins están habilitados.";
      dynamicStatusMessage.innerHTML = 
        '<div class="highlight-text" style="font-size:1.35rem; color: var(--neon-gold); font-family: var(--font-gaming); display: inline-block;">🏆 ¡SORTEO DE LAS 3 SKINS DESBLOQUEADO CON ÉXITO! 🏆</div>' +
        '<div class="status-announcement-box">' +
        '  ¡Familia Arixu! 📢 Como sabéis, nuestro código de creador está temporalmente en boxes por un bug del sistema, pero que nadie decaiga porque ¡LO VAMOS A RECUPERAR MUY PRONTO! 🛡️ Ya estamos gestionando todo con soporte para que vuelva a estar activo. Guardad esos paVos y esa energía, porque en cuanto vuelva, lo vamos a celebrar por todo lo alto. ¡Mil gracias por no soltarnos la mano!' +
        '</div>';
      
      startConfetti();
    } else {
      // BLOQUEADO
      rewardsSection.classList.add("locked");
      rewardsSection.classList.remove("unlocked");
      
      rewardCards.forEach(function(card) {
        card.classList.add("locked");
        card.classList.remove("unlocked-celebration");
        var lockIcon = card.querySelector(".lock-circle i");
        if (lockIcon) {
          lockIcon.className = "fa-solid fa-lock";
          lockIcon.style.color = "";
        }
      });
      
      rewardsTitle.innerHTML = '<i class="fa-solid fa-lock"></i> Recompensas Bloqueadas';
      rewardsTitle.classList.remove("highlight-text");
      rewardsSubtitle.textContent = "Al alcanzar los 300 códigos activos, desbloquearemos los siguientes premios:";
      
      // Mensaje dinámico exacto de resta
      dynamicStatusMessage.innerHTML = 'Faltan <span id="users-remaining" class="status-highlight">' + remaining + '</span> usuarios activos para desbloquear la recompensa final.';
      
      stopConfetti();
    }
  }

  // --- MOTOR DE CONFETI EN CANVAS ---
  var canvas = document.getElementById("confetti-canvas");
  var ctx = canvas.getContext("2d");
  var confettiActive = false;
  var particles = [];
  var particleCount = 140;
  var colors = ["#00f0ff", "#9d4edd", "#ffd700", "#ff007f", "#00ff88", "#ffffff"];
  var animationFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);

  function ConfettiParticle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height;
    this.size = Math.random() * 8 + 4;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 + 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
  }

  ConfettiParticle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;

    if (this.y > canvas.height) {
      this.y = -20;
      this.x = Math.random() * canvas.width;
      this.speedY = Math.random() * 3 + 2;
    }
  };

  ConfettiParticle.prototype.draw = function() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  };

  function startConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    resizeCanvas();
    particles = [];
    var i;
    for (i = 0; i < particleCount; i++) {
      particles.push(new ConfettiParticle());
    }
    animateConfetti();
  }

  function stopConfetti() {
    confettiActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function animateConfetti() {
    if (!confettiActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(function(p) {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animateConfetti);
  }

  // --- RULETA DE LA SUERTE DILIGENTE ---
  function renderRuleta(activeUsers) {
    ruletaCanvas = document.getElementById("ruleta-canvas");
    btnGirar = document.getElementById("btn-girar-ruleta");
    winnerName = document.getElementById("resultado-nombre");
    winnerDisplay = document.getElementById("ruleta-resultado-box");
    participantCountEl = document.getElementById("ruleta-contador-activos");

    if (!ruletaCanvas) return;

    activeParticipants = activeUsers;
    if (participantCountEl) {
      participantCountEl.textContent = activeParticipants.length;
    }

    if (activeParticipants.length == 0) {
      drawEmptyWheel(ruletaCanvas);
      if (btnGirar) btnGirar.disabled = true;
      return;
    }

    if (btnGirar) btnGirar.disabled = false;
    drawWheel(ruletaCanvas);
  }

  function drawEmptyWheel(canvasElement) {
    var ctxWheel = canvasElement.getContext("2d");
    var cx = canvasElement.width / 2;
    var cy = canvasElement.height / 2;
    var radius = cx - 10;

    ctxWheel.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctxWheel.beginPath();
    ctxWheel.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctxWheel.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctxWheel.fill();
    ctxWheel.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctxWheel.lineWidth = 2;
    ctxWheel.stroke();

    ctxWheel.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctxWheel.font = "bold 18px 'Rajdhani'";
    ctxWheel.textAlign = "center";
    ctxWheel.textBaseline = "middle";
    ctxWheel.fillText("Sin participantes activos", cx, cy);
  }

  function drawWheel(canvasElement) {
    var ctxWheel = canvasElement.getContext("2d");
    var cx = canvasElement.width / 2;
    var cy = canvasElement.height / 2;
    var radius = cx - 10;

    ctxWheel.clearRect(0, 0, canvasElement.width, canvasElement.height);

    var numSectors = activeParticipants.length;
    var arc = (2 * Math.PI) / numSectors;
    var i;

    for (i = 0; i < numSectors; i++) {
      var angle = currentAngle + i * arc;
      var isEven = (i % 2 == 0);

      // 1. Dibujar el sector (Fondo Oscuro Desaturado)
      ctxWheel.beginPath();
      ctxWheel.moveTo(cx, cy);
      ctxWheel.arc(cx, cy, radius, angle, angle + arc);
      ctxWheel.closePath();

      // Alternar fondos oscuros desaturados (Verde azulado apagado / Amatista apagado)
      ctxWheel.fillStyle = isEven ? "#162829" : "#231a29";
      ctxWheel.fill();

      // 2. Dibujar bordes del sector (Tonos más suaves)
      ctxWheel.beginPath();
      ctxWheel.moveTo(cx, cy);
      ctxWheel.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctxWheel.arc(cx, cy, radius, angle, angle + arc);
      ctxWheel.lineTo(cx, cy);
      ctxWheel.closePath();

      ctxWheel.strokeStyle = isEven ? "#4d9093" : "#8f7ea6"; // Teal apagado o Amatista desaturado
      ctxWheel.lineWidth = 2;
      ctxWheel.stroke();

      // 3. Dibujar borde circular exterior (suave)
      ctxWheel.beginPath();
      ctxWheel.arc(cx, cy, radius, angle, angle + arc);
      ctxWheel.strokeStyle = isEven ? "#4d9093" : "#8f7ea6";
      ctxWheel.lineWidth = 4;
      ctxWheel.stroke();

      // 4. Dibujar el texto radial
      ctxWheel.save();
      ctxWheel.translate(cx, cy);
      ctxWheel.rotate(angle + arc / 2);

      ctxWheel.fillStyle = "#e0e0e0"; // Texto ligeramente grisáceo / desaturado para reducir fatiga visual
      ctxWheel.font = numSectors > 30 ? "bold 11px 'Rajdhani'" : numSectors > 20 ? "bold 13px 'Rajdhani'" : "bold 15px 'Rajdhani'";
      ctxWheel.textAlign = "right";
      ctxWheel.textBaseline = "middle";

      // Sombra suave desaturada
      ctxWheel.shadowColor = isEven ? "rgba(77, 144, 147, 0.6)" : "rgba(143, 126, 166, 0.6)";
      ctxWheel.shadowBlur = 4;

      var name = activeParticipants[i].nombre;
      var maxLen = numSectors > 30 ? 10 : 15;
      var displayName = name.length > maxLen ? name.substring(0, maxLen) + ".." : name;

      ctxWheel.fillText(displayName, radius - 25, 0);
      ctxWheel.restore();
    }

    // Actualizar caja de sector actual estáticamente (si no está girando)
    if (!isSpinning) {
      var initialWinner = getWinner();
      var sectorActualNombreEl = document.getElementById("sector-actual-nombre");
      if (sectorActualNombreEl && initialWinner) {
        sectorActualNombreEl.textContent = initialWinner.nombre;
      }
    }
  }

  function spin(canvasElement, btn, display, nameEl) {
    if (isSpinning || activeParticipants.length == 0) return;

    isSpinning = true;
    if (btn) btn.disabled = true;
    if (display) {
      display.classList.remove("winner-active");
      display.classList.remove("activo");
      var label = display.querySelector(".resultado-etiqueta");
      if (label) label.textContent = "Girando...";
    }
    if (nameEl) nameEl.textContent = "???";

    var spinAngleStart = Math.random() * 8 + 12; // Velocidad inicial
    var spinTime = 0;
    var spinTimeTotal = Math.random() * 2000 + 4000; // De 4 a 6 segundos

    var lastSectorIndex = -1;

    function easeOut(t) {
      return t * (2 - t);
    }

    function animateSpin() {
      spinTime += 16.67;

      if (spinTime >= spinTimeTotal) {
        isSpinning = false;
        if (btn) btn.disabled = false;

        var winner = getWinner();
        if (display) {
          display.classList.add("activo");
          display.classList.add("winner-active");
          var label = display.querySelector(".resultado-etiqueta");
          if (label) label.textContent = "🏆 ¡GANADOR ENCONTRADO! 🏆";
        }
        if (nameEl) nameEl.textContent = winner.nombre;

        // Asignar ganador a la tarjeta de Skin Especial correspondiente
        assignWinnerToReward(winner);

        startConfetti();
        setTimeout(function() {
          if (!isSpinning) {
            stopConfetti();
          }
        }, 5000);
        return;
      }

      var percent = spinTime / spinTimeTotal;
      var speed = spinAngleStart * (1 - easeOut(percent));
      currentAngle += (speed * Math.PI / 180);

      drawWheel(canvasElement);

      // Manejar vibración visual de la aguja
      var currentWinnerIndex = getWinnerIndex();
      if (currentWinnerIndex != lastSectorIndex) {
        lastSectorIndex = currentWinnerIndex;
        var pointer = document.querySelector(".ruleta-pointer");
        if (pointer) {
          pointer.style.transform = "translateX(-50%) scale(1.2)";
          setTimeout(function() {
            pointer.style.transform = "translateX(-50%) scale(1.0)";
          }, 50);
        }
      }

      // Actualizar el sector actual dinámicamente en cada fotograma
      var currentWinner = getWinner();
      var sectorActualNombreEl = document.getElementById("sector-actual-nombre");
      if (sectorActualNombreEl && currentWinner) {
        sectorActualNombreEl.textContent = currentWinner.nombre;
      }

      animationId = requestAnimationFrame(animateSpin);
    }

    animateSpin();
  }

  function getWinnerIndex() {
    if (activeParticipants.length == 0) return -1;
    var numSectors = activeParticipants.length;
    var arc = (2 * Math.PI) / numSectors;

    var needleAngle = (3 * Math.PI / 2) - currentAngle;
    needleAngle = needleAngle % (2 * Math.PI);
    if (needleAngle < 0) needleAngle += 2 * Math.PI;

    return Math.floor(needleAngle / arc) % numSectors;
  }

  function getWinner() {
    var idx = getWinnerIndex();
    return activeParticipants[idx];
  }

  // --- ASIGNACIÓN DE GANADORES A SKINS DE RECOMPENSA ---
  function assignWinnerToReward(winner) {
    if (!winner) return;
    assignedWinners.push(winner);

    var slotNum = ((assignedWinners.length - 1) % 3) + 1;

    var card = document.getElementById("reward-card-" + slotNum);
    var badge = document.getElementById("reward-badge-" + slotNum);
    var icon = document.getElementById("reward-icon-" + slotNum);
    var title = document.getElementById("reward-title-" + slotNum);
    var desc = document.getElementById("reward-desc-" + slotNum);
    var btnReset = document.getElementById("btn-reset-ganadores");

    if (btnReset) btnReset.style.display = "inline-flex";

    if (card) {
      card.classList.add("assigned-winner-card");

      if (badge) {
        badge.textContent = "🏆 GANADOR SKIN " + slotNum;
      }

      if (icon) {
        icon.className = "fa-solid fa-crown crown-icon";
      }

      if (title) {
        title.textContent = winner.nombre;
      }

      if (desc) {
        desc.textContent = "¡Ganador/a asignado/a para la Skin Especial " + slotNum + "!";
      }

      // Desplazamiento suave para enfocar el premio ganado
      setTimeout(function() {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 900);
    }
  }

  function resetWinners() {
    assignedWinners = [];
    var btnReset = document.getElementById("btn-reset-ganadores");
    if (btnReset) btnReset.style.display = "none";

    var i;
    for (i = 1; i <= 3; i++) {
      var card = document.getElementById("reward-card-" + i);
      var badge = document.getElementById("reward-badge-" + i);
      var icon = document.getElementById("reward-icon-" + i);
      var title = document.getElementById("reward-title-" + i);
      var desc = document.getElementById("reward-desc-" + i);

      if (card) card.classList.remove("assigned-winner-card");
      if (badge) badge.textContent = "Skin Especial " + i;
      if (icon) icon.className = "fa-solid fa-gift gift-icon";
      if (title) {
        var nombresOrd = ["primera", "segunda", "tercera"];
        title.textContent = "Sorteo de la " + nombresOrd[i - 1] + " skin";
      }
      if (desc) desc.textContent = "Se desbloquea al alcanzar los 300 usuarios activos.";
    }
  }
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
