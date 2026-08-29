# 🎮 Operación: Código Arixu

Plataforma web interactiva y panel de control comunitario para la creadora de contenido **Arixu**. Diseñada para gestionar, visualizar y celebrar el apoyo de la comunidad mediante el uso del **Código de Creador en Fortnite**, metas mensuales, sorteos interactivos y recompensas exclusivas.

---

## 🌟 ¿En qué consiste este proyecto?

Este repositorio es una aplicación web dinámica con estética *gamer/cyberpunk/Twitch* que automatiza y gamifica el seguimiento de los miembros activos que apoyan a **Arixu** en la tienda de Fortnite.

### ✨ Funcionalidades Principales

1. **📊 Dashboard de la Meta Central**:
   - Barra de progreso reactiva en tiempo real y contador de usuarios activos respecto a la meta comunitaria (ej. 400 apoyos).
   - Animaciones y efectos visuales al alcanzar la meta.

2. **🌟 El Paseo de la Fama (VIP Activos)**:
   - Cuadrícula dinámica que muestra a los usuarios verificados con código activo.
   - Soporte para avatares generados automáticamente y visualización de capturas o vídeos (`.mp4`, `.mov`, `.jpg`, `.png`, etc.) de validación.

3. **📋 Extractor Rápido de Nombres**:
   - Herramienta integrada en un clic para extraer y copiar al portapapeles la lista completa de usuarios activos formateada para sorteos o registros.

4. **🎰 Ruleta de la Fortuna Gamer**:
   - Ruleta interactiva desarrollada en HTML5 Canvas con física de giro desacelerada.
   - Permite seleccionar ganadores aleatorios entre los miembros activos o importar listas personalizadas.

5. **🏆 Sistema de Recompensas y Sorteos de Skins**:
   - Tarjetas de recompensas bloqueadas que se liberan automáticamente al llegar a la meta.
   - Motor de confeti festivo en Canvas y asignación automática de ganadores a cada una de las 3 skins sorteadas.

6. **🔄 Sincronización Automática de Capturas**:
   - Script de automatización en PowerShell (`actualizar.ps1`) y Batch (`actualizar.bat`) que escanea la carpeta `Capturas/` y actualiza automáticamente la base de datos `data.js`.

---

## 📁 Estructura del Repositorio

```text
Codigo-Arixu/
├── Capturas/             # Capturas de pantalla y clips de validación de los usuarios
├── index.html            # Estructura principal de la aplicación web
├── style.css             # Estilos neón/gaming, animaciones y diseño responsivo
├── script.js             # Lógica de la aplicación, ruleta, confeti y recompensas
├── data.js               # Base de datos local de usuarios y sus estados
├── actualizar.ps1        # Script PowerShell de sincronización automática
├── actualizar.bat        # Acceso directo para ejecutar la sincronización en Windows
└── README.md             # Documentación del proyecto
```

---

## 🚀 Flujo de Trabajo y Actualización

Para validar a nuevos usuarios o actualizar renovaciones de código:

1. **Guardar la captura**: Añade la imagen o vídeo en la carpeta `Capturas/` con el nombre exacto del usuario (por ejemplo: `Capturas/NombreUsuario.jpg`).
2. **Ejecutar sincronización**: Haz doble clic en `actualizar.bat` o ejecuta en terminal:
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File .\actualizar.ps1
   ```
3. El script detectará las capturas nuevas, marcará al usuario como `activo` y vinculará su comprobante automáticamente en `data.js`.