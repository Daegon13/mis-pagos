# PLAY-01 — Lista manual de Play Console

Ninguna casilla de Play Console está marcada como completa. Este archivo no autoriza crear, subir, enviar o publicar nada.

## Cuenta y desarrollador

- [ ] Cuenta y verificación de identidad confirmadas.
- [ ] Nombre público e información de contacto verificados en Play Console. Datos aprobados para cargar: Diego Marin y `mispagos.soporte@gmail.com`.
- [ ] Requisito personal 12/14 verificado en esta cuenta.

## Contenido de la app

- [ ] URL pública de política de privacidad cargada en Play Console.
  - Requisito de URL pública accesible: **COMPLETE**. `https://mis-pagos-website.vercel.app/privacidad` respondió 200 por HTTPS; el sitio `https://mis-pagos-website.vercel.app/` también. Responsable: Diego Marin; contacto: `mispagos.soporte@gmail.com`. La versión actualizada de la política aún debe desplegarse y la verificación de SDK/red sigue pendiente para Data Safety. La página en `play-store/privacy/index.html` continúa como artefacto preparado.
- [ ] Declaración de anuncios: No, tras reconfirmar el AAB.
- [ ] Acceso a la app: sin cuenta, confirmar en Play.
- [ ] Público objetivo seleccionado según producto real.
- [ ] Cuestionario y clasificación de contenido completos.
- [ ] Data Safety cerrado tras la auditoría de SDK/red.
- [ ] Declaración de funciones financieras, si Play la solicita, completada según funciones reales.
- [ ] Declaraciones de permisos, si aplican al manifiesto final, completadas.

## Ficha

- [ ] Nombre, descripción breve y descripción completa copiados y comprobados con contadores.
- [ ] Icono de ficha de marca aprobada cargado.
  - Archivo listo: `assets/branding/runtime/play-icon-512.png` (512 × 512, RGBA, 378453 bytes).
- [ ] Feature graphic cargada.
  - Archivo listo: `play-store/graphics/feature-graphic-1024x500.png` (RGB, sin alfa).
- [ ] Al menos dos capturas reales de teléfono cargadas; preferiblemente cuatro o más.
  - Seis capturas reales listas y ordenadas en `play-store/STORE_ASSET_PLAN.md`; verificar en miniatura y con la build final.
- [ ] Categoría verificada y elegida.
- [ ] Correo de contacto aprobado cargado y verificado en Play Console.
  - Correo aprobado: `mispagos.soporte@gmail.com`. Ayuda muestra "Enviar comentarios" y "Reportar un error"; queda verificar los enlaces con un cliente de correo Android.
- [ ] Sitio web `https://mis-pagos-website.vercel.app/` cargado en Play Console.

## Lanzamiento de prueba

- [ ] Inscripción a Play App Signing revisada manualmente.
- [ ] Clave de subida EAS y continuidad de firma verificadas contra AAB.
- [ ] AAB subido manualmente con `versionCode` único.
- [ ] Track Internal Testing creado y QA de distribución de Play realizada.
  - Verificar icono de launcher en la nueva build y fondos claro/oscuro; foreground adaptativo preparado y máscaras circular, cuadrada redondeada y tipo squircle revisadas en vista previa. Monochrome sigue diferido.
- [ ] Track Closed Testing creado después de resolver bloqueos.
- [ ] Lista/grupo de participantes y vínculo de adhesión configurados.
- [ ] Canal de comentarios confirmado y comunicado a participantes.
