# Sitio público de Mis Pagos

Sitio estático en HTML y CSS, sin build, dependencias, cookies ni analítica.

## Publicar en Vercel

1. Importar el repositorio Git actual en Vercel y crear un proyecto para el sitio web.
2. Configurar **Root Directory** como `website`.
3. Elegir **Framework Preset: Other**.
4. Dejar **Build Command** vacío; no hay comando de compilación.
5. Desplegar y comprobar que `/` y `/privacidad` responden por HTTPS.
6. Copiar las URL HTTPS resultantes a la documentación y configuración de Google Play.

Responsable público: Diego Marin. Correo de soporte y privacidad: `mispagos.soporte@gmail.com`. El sitio ya responde por HTTPS; después de este cambio hay que desplegar la versión actualizada de la política. La verificación de SDK y red indicada en `docs/PLAY_DATA_SAFETY_AUDIT.md` sigue pendiente antes de cerrar Data Safety.

`PUBLIC_SITE_URL=https://mis-pagos-website.vercel.app/`

`PUBLIC_PRIVACY_URL=https://mis-pagos-website.vercel.app/privacidad`
