/**
 * OPERACIÓN: CÓDIGO ARIXU - COMPORTAMIENTO & LOGICA REACTIVA DEFINITIVA
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS DEL DOM ---
  const activeUsersGrid = document.getElementById("active-users-grid");
  const suspendedUsersGrid = document.getElementById("suspended-users-grid");
  const progressFill = document.getElementById("progress-fill");
  const activeRatio = document.getElementById("active-ratio");
  
  // Recompensas
  const rewardsSection = document.getElementById("recompensas");
  const rewardCards = document.querySelectorAll(".reward-card");
  const rewardsTitle = document.getElementById("rewards-title");
  const rewardsSubtitle = document.getElementById("rewards-subtitle");
  const dynamicStatusMessage = document.getElementById("dynamic-status-message");
  
  // Modal de imagen
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalVideo = document.getElementById("modal-video");
  const modalCaption = document.getElementById("modal-caption");

  // --- VARIABLES DE ESTADO ---
  const TARGET_GOAL = 300;
  
  // --- INICIALIZACIÓN ---
  initApp();

  function initApp() {
    renderApp();
    setupModal();
  }

  // --- RENDERIZADO PRINCIPAL ---
  function renderApp() {
    // 1. Limpiar cuadrículas
    activeUsersGrid.innerHTML = "";
    suspendedUsersGrid.innerHTML = "";
    
    // 2. Filtrar desde el array usuariosNexo cargado de data.js
    const activeUsers = usuariosNexo.filter(u => u.estado === 'activo');
    const suspendedUsers = usuariosNexo.filter(u => u.estado === 'suspendido');
    
    const activeCount = activeUsers.length;
    
    // 3. Renderizar cuadrícula de Activos
    if (activeUsers.length === 0) {
      activeUsersGrid.innerHTML = `
        <div class="no-users-msg" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px; border: 1px dashed var(--border-green); border-radius: 12px; background: rgba(0, 255, 136, 0.02); font-family: var(--font-gaming);">
          <i class="fa-solid fa-bolt-lightning" style="font-size: 2rem; color: var(--neon-green); margin-bottom: 12px; display: block; filter: drop-shadow(0 0 8px var(--neon-green-glow));"></i>
          ¡La Meta Central está inactiva! Aún no hay ningún usuario verificado este mes.
        </div>`;
    } else {
      activeUsers.forEach(usuario => {
        activeUsersGrid.appendChild(createUserCard(usuario, 'activo'));
      });
    }

    // 4. Renderizar cuadrícula de Suspendidos (Zona de Renovación)
    if (suspendedUsers.length === 0) {
      suspendedUsersGrid.innerHTML = `
        <div class="no-users-msg" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 30px; border: 1px dashed rgba(255, 255, 255, 0.05); border-radius: 12px;">
          <i class="fa-solid fa-shield-halved" style="font-size: 2rem; color: var(--neon-cyan); margin-bottom: 12px; display: block; filter: drop-shadow(0 0 8px var(--neon-cyan-glow));"></i>
          ¡Perfecto! Todos los usuarios de la comunidad mantienen su código renovado.
        </div>`;
    } else {
      suspendedUsers.forEach(usuario => {
        suspendedUsersGrid.appendChild(createUserCard(usuario, 'suspendido'));
      });
    }

    // 5. Barra de progreso y contador
    const progressPercent = Math.min((activeCount / TARGET_GOAL) * 100, 100);
    progressFill.style.width = `${progressPercent}%`;
    activeRatio.textContent = `${activeCount} / ${TARGET_GOAL}`;
    
    // 6. Estado de las Recompensas
    updateRewards(activeCount);
  }

  // --- GENERACIÓN DE TARJETA ---
  function createUserCard(usuario, estado) {
    const card = document.createElement("div");
    card.className = "user-card";
    
    const initials = usuario.nombre.substring(0, 2).toUpperCase();
    const dotClass = estado === 'activo' ? 'dot-active' : 'dot-suspended';
    
    const imgUrl = usuario.url_captura ? usuario.url_captura : "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80";
    
    const isVideo = imgUrl.toLowerCase().endsWith(".mp4") || imgUrl.toLowerCase().endsWith(".mov");
    const mediaHtml = isVideo 
      ? `<video src="${imgUrl}" muted playsinline autoplay loop class="user-thumbnail-video" style="width: 100%; height: 100%; object-fit: cover; pointer-events: none;"></video>`
      : `<img src="${imgUrl}" alt="Captura de ${usuario.nombre}" loading="lazy">`;
    
    card.innerHTML = `
      <div class="user-card-hdr">
        <div class="user-avatar-sphere">${initials}</div>
        <div class="user-title-name" title="${usuario.nombre}">${usuario.nombre}</div>
        <span class="status-dot-indicator ${dotClass}"></span>
      </div>
      <div class="user-thumbnail">
        ${mediaHtml}
        <div class="user-thumbnail-hover-overlay">
          <i class="fa-solid fa-expand"></i>
        </div>
      </div>
    `;
    
    // Clic en miniatura
    const thumbnail = card.querySelector(".user-thumbnail");
    thumbnail.addEventListener("click", () => {
      const statusText = estado === 'activo' ? 'Activo' : 'Pendiente de Renovación';
      if (usuario.url_captura) {
        openModal(usuario.url_captura, `${usuario.nombre} (${statusText})`);
      } else {
        openModal("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80", `${usuario.nombre} (Imagen de muestra - Sin captura adjunta aún)`);
      }
    });
    
    return card;
  }

  // --- CONTROL DE RECOMPENSAS (META DE 300) ---
  function updateRewards(activeCount) {
    const remaining = TARGET_GOAL - activeCount;
    
    if (activeCount >= TARGET_GOAL) {
      // DESBLOQUEADO
      rewardsSection.classList.remove("locked");
      rewardsSection.classList.add("unlocked");
      
      rewardCards.forEach(card => {
        card.classList.remove("locked");
        card.classList.add("unlocked-celebration");
        const lockIcon = card.querySelector(".lock-circle i");
        if (lockIcon) {
          lockIcon.className = "fa-solid fa-circle-check";
          lockIcon.style.color = "var(--neon-gold)";
        }
      });
      
      rewardsTitle.innerHTML = `<i class="fa-solid fa-trophy" style="color: var(--neon-gold); text-shadow: 0 0 15px var(--neon-gold-glow)"></i> ¡META CONSEGUIDA: RECOMPENSAS DESBLOQUEADAS!`;
      rewardsTitle.classList.add("highlight-text");
      rewardsSubtitle.textContent = "¡Felicitaciones a toda la comunidad! Hemos alcanzado los 300 códigos activos. Los sorteos de las 3 Skins están habilitados.";
      dynamicStatusMessage.innerHTML = `<span class="highlight-text" style="font-size:1.35rem; color: var(--neon-gold); font-family: var(--font-gaming);">🏆 ¡SORTEO DE LAS 3 SKINS DESBLOQUEADO CON ÉXITO! 🏆</span>`;
      
      startConfetti();
    } else {
      // BLOQUEADO
      rewardsSection.classList.add("locked");
      rewardsSection.classList.remove("unlocked");
      
      rewardCards.forEach(card => {
        card.classList.add("locked");
        card.classList.remove("unlocked-celebration");
        const lockIcon = card.querySelector(".lock-circle i");
        if (lockIcon) {
          lockIcon.className = "fa-solid fa-lock";
          lockIcon.style.color = "";
        }
      });
      
      rewardsTitle.innerHTML = `<i class="fa-solid fa-lock"></i> Recompensas Bloqueadas`;
      rewardsTitle.classList.remove("highlight-text");
      rewardsSubtitle.textContent = "Al alcanzar los 300 códigos activos, desbloquearemos los siguientes premios:";
      
      // Mensaje dinámico exacto de resta
      dynamicStatusMessage.innerHTML = `Faltan <span id="users-remaining" class="status-highlight">${remaining}</span> usuarios activos para desbloquear la recompensa final.`;
      
      stopConfetti();
    }
  }

// --- CONTROL DE MODAL (BLINDADO Y CON CLONADO DE NODOS) ---
  function setupModal() {
    const modal = document.getElementById("image-modal");
    const btnCerrarModal = document.getElementById("btnCerrarModal");

    if (!modal) return;

    if (btnCerrarModal) {
      btnCerrarModal.onclick = function(e) {
        e.preventDefault();
        closeModal();
      };
    }

    modal.addEventListener("click", (e) => {
      if (e.target !== modalImg && e.target !== modalCaption && e.target.id !== "modal-video") {
        closeModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function openModal(imgSrc, captionText) {
    const modalVideo = document.getElementById("modal-video"); // Lo buscamos en caliente
    
    modal.style.display = "flex";
    modal.classList.add("active", "show");
    
    const isVideo = imgSrc.toLowerCase().endsWith(".mp4") || imgSrc.toLowerCase().endsWith(".mov");
    
    if (isVideo && modalVideo) {
      modalImg.style.display = "none";
      modalVideo.style.display = "block";
      modalVideo.src = imgSrc;
      modalVideo.play().catch(() => {});
    } else {
      if (modalVideo) {
        modalVideo.style.display = "none";
        modalVideo.pause();
        modalVideo.src = "";
      }
      modalImg.style.display = "block";
      modalImg.src = imgSrc;
    }
    
    modalCaption.textContent = captionText;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modalVideo = document.getElementById("modal-video"); // Lo buscamos en caliente
    
    modal.style.display = "none";
    modal.classList.remove("active", "show");
    modalImg.src = "";
    
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = "";
    }
    
    modalCaption.textContent = "";
    document.body.style.overflow = "auto";
  }

  // --- MOTOR DE CONFETI EN CANVAS ---
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  let confettiActive = false;
  let particles = [];
  const particleCount = 140;
  const colors = ["#00f0ff", "#9d4edd", "#ffd700", "#ff007f", "#00ff88", "#ffffff"];
  let animationFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);

  class ConfettiParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 + 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
        this.speedY = Math.random() * 3 + 2;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function startConfetti() {
    if (confettiActive) return;
    confettiActive = true;
    resizeCanvas();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
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
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationFrameId = requestAnimationFrame(animateConfetti);
  }

});
