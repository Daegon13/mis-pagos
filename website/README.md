# Sitio público de Mis Pagos

Sitio estático en HTML y CSS, sin build, dependencias, cookies ni analítica.

## Publicar en Vercel

1. Importar el repositorio Git actual en Vercel y crear un proyecto para el sitio web.
2. Configurar **Root Directory** como `website`.
3. Elegir **Framework Preset: Other**.
4. Dejar **Build Command** vacío; no hay comando de compilación.
5. Desplegar y comprobar que `/` y `/privacidad` responden por HTTPS.
6. Copiar las URL HTTPS resultantes a la documentación y configuración de Google Play.

Correo de soporte aprobado para el sitio: `mispagos.soporte@gmail.com`. Antes de publicar la política, confirmar la identidad pública del responsable y terminar la verificación de SDK y red indicada en `docs/PLAY_DATA_SAFETY_AUDIT.md`. Sincronizar `docs/legal/PRIVACY_POLICY.md` con `website/privacidad/index.html`: el documento fuente todavía tiene el contacto y el canal de comentarios pendientes. No usar un dominio supuesto.

Marcadores pendientes: `PUBLIC_SITE_URL=PENDING`, `PUBLIC_PRIVACY_URL=PENDING`.
