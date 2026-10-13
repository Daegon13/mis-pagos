# BRAND-01 — Recursos visuales para Google Play

Requisitos verificados en [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9866151). La carga en Play Console sigue pendiente.

| Recurso | Estado |
|---|---|
| Fuente canónica aprobada | `assets/branding/source/Calendario y monedas apiladas.png` (1254 × 1254, opaca). |
| Icono general/Android | `assets/branding/runtime/app-icon-1024.png` (1024 × 1024); configurado en `app.json`. Expo prebuild generó mipmaps y `assembleDebug` produjo un APK de QA con NDK 27.1. Instalado en Android 35: el launcher muestra calendario, check y monedas completos en fondo claro y oscuro, sin halo blanco ni recorte. |
| Icono de ficha | `assets/branding/runtime/play-icon-512.png`: PNG RGBA 32-bit, 512 × 512, 378453 bytes; cuadrado opaco, sin esquinas redondeadas, marco, texto ni sombra externa. Límite Play: 1024 KB. |
| Icono adaptativo | `assets/branding/runtime/adaptive-foreground.png`: 1024 × 1024 con fondo transparente, derivado de la fuente mediante umbral suave del canal rojo (márgenes originales R=0–4) y centrado en zona segura. `app.json` usa fondo `#023A2D`. Vistas previas circular, cuadrada redondeada y tipo squircle conservan calendario, check y tres monedas. `MONOCHROME_ICON: DEFERRED`: la silueta blanca en 96 px no distingue bien el check ni la pila. |
| Feature graphic | `play-store/graphics/feature-graphic-1024x500.png`: PNG RGB 24-bit, 1024 × 500, sin alfa; texto grande «Sabé cuánto realmente podés usar» y formas simples de monedas/check con la paleta de marca. |
| Capturas | Seis capturas de UI Android real, 1080 × 1920, PNG RGB 24-bit, desde APK independiente 0.4.0 anterior a BRAND-01 con datos sintéticos del emulador. La simulación se recortó de una captura real de 1080 × 2400 para mantener la proporción 9:16. Ninguna contiene datos financieros privados ni superposiciones de desarrollo. |
| Política estática | `play-store/privacy/index.html`; contenido sustantivo del borrador aprobado. `play-store/privacy/README.md` contiene los pasos de publicación. **PUBLIC PRIVACY URL: PENDING.** |
| Comentarios beta | **FEEDBACK_EMAIL_REQUIRED.** No se encontró dirección aprobada. La UI de Ayuda deja preparados asunto y cuerpo; los accesos solo aparecen al configurar una dirección real. |

## Orden recomendado de capturas

1. `play-store/screenshots/es-419/01-home-disponible-real.png` — Disponible real y compromisos.
2. `play-store/screenshots/es-419/02-planificacion.png` — reserva, Libre para usar y ritmo.
3. `play-store/screenshots/es-419/03-tu-espacio.png` — habitación personalizada real.
4. `play-store/screenshots/es-419/04-puedo-gastar-esto.png` — simulación de gasto con resultado.
5. `play-store/screenshots/es-419/05-descubrimientos.png` — ejemplos desbloqueados. Los siete hitos están desbloqueados en este perfil de prueba; falta una captura de un perfil con un hito bloqueado si se quiere mostrar ese contraste.
6. `play-store/screenshots/es-419/06-ayuda.png` — portada del Centro de Ayuda.

Antes de cargar en Play, revisar el conjunto en miniatura, verificar las dimensiones y volver a capturar desde la build final distribuida si la UI cambia. La QA de launcher/ícono sobre la build nueva es independiente de estas capturas.
