# PLAY-01 — Preparación de Google Play

Estado: **AAB técnico preparado; ficha y declaraciones manuales pendientes. No se ha enviado nada a Play Console**. Alcance: Internal Testing → Closed Testing, nunca producción en esta tarea.

## Identidad y Android

- Nombre `Mis Pagos`; paquete fijo `com.diegomarin.mispagos`; proyecto EAS `@daegon13/mis-pagos` sin cambio.
- Versión `0.4.0`, `versionCode` 4. Es mayor que la Alpha 0.2 subida solo a EAS; comprobar unicidad en Play Console antes de la primera carga y aumentar el código en cualquier actualización posterior.
- Expo SDK 57.0.24; React Native 0.86.3; Node 22.
- **Requisito actual de Google Play para apps móviles nuevas y actualizaciones: target API 36+.** [Android Developers](https://developer.android.com/google/play/requirements/target-sdk).
- `react-native/gradle/libs.versions.toml` instalado fija `compileSdk=36`, `targetSdk=36`, `minSdk=24`; el proyecto Android generado usa esos valores mediante `expo-root-project` y `rootProject.ext`. El manifiesto del **AAB firmado** confirma `compileSdk=36`, `targetSdk=36`, `minSdk=24`. [Matriz oficial Expo SDK 57](https://docs.expo.dev/versions/latest/). **Estado API 36: PASS.**

## Artefacto y firma

- `eas.json` ya define `production` como Android `app-bundle`; `preview` conserva el APK interno. No se necesita perfil duplicado. Google Play recibirá un **AAB**, no un APK.
- EAS gestiona la credencial remota Android de tipo JKS. `preview` y `production` muestran la misma configuración de credencial `Sc2AMg_pRZ` y el SHA-256 público `08:F8:88:93:A1:08:4B:A0:57:46:90:24:FA:5C:0A:3A:65:EB:CC:B1:E9:56:51:6E:9C:96:EB:28:88:D9:BB:72`; coincide con la firma comprobada de PREVIEW-04. No se exportó clave ni contraseña. La inscripción a Play App Signing se hará manualmente y debe comprobarse el certificado de subida aceptado por Play.
- Build profile: `production`; build ID `2ecbacab-f7ad-4473-a3bf-23435875d555` **FINISHED**. [Artefacto AAB](https://expo.dev/artifacts/eas/QOv4zmJqIVZHoGpfoFTwWLCdiVhAmIA0RdZVfIlw0u0.aab), **77,312,354 bytes**. `bundletool validate` pasó; el manifiesto confirma paquete, versión, código y SDK. `keytool -printcert -jarfile` mostró el mismo SHA-256 de las builds preview; `jarsigner -verify` indicó `jar verified`. La verificación estricta advierte que el certificado de carga Android es autofirmado, habitual antes de Play App Signing.
- El AAB se mantiene fuera de Git. No hay configuración de subida automática a Play.

## Datos, política y entrega

- Permisos innecesarios de almacenamiento legado, superposición y vibración bloqueados en `app.json`. El manifiesto del AAB contiene solo `INTERNET`, `ACCESS_NETWORK_STATE` y el permiso propio de receptor no exportado `com.diegomarin.mispagos.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. Ninguno requiere aviso peligroso al primer uso. El permiso propio es de framework y protección `signature`; no concede acceso a datos del dispositivo.
- [Google Play exige privacidad y Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469) para Closed Testing. Auditoría y hoja de trabajo: `PLAY_DATA_SAFETY_AUDIT.md` y `PLAY_DATA_SAFETY_WORKSHEET.md`. Las respuestas de recolección/compartición permanecen bloqueadas hasta verificar SDK/tráfico.
- Política preparada en `docs/legal/PRIVACY_POLICY.md`, con entrada en Ayuda y página estática en `play-store/privacy/index.html`. **PUBLIC PRIVACY URL: PENDING**; completar identidad, contacto y auditoría antes de publicar el texto.
- Ficha y recursos: `play-store/listing/es-419.md`, `play-store/STORE_ASSET_PLAN.md`. BRAND-01 integró la fuente canónica `assets/branding/source/Calendario y monedas apiladas.png`, iconos combinados de 1024/512, foreground adaptativo transparente, feature graphic y seis capturas reales de un APK 0.4.0 anterior a BRAND-01. Monocromático sigue diferido por silueta ambigua en miniatura. El correo de feedback aprobado sigue pendiente (`FEEDBACK_EMAIL_REQUIRED`); Ayuda deja los dos borradores `mailto:` preparados y ocultos hasta fijar una dirección real.
- `expo config` y `expo prebuild --platform android --no-install` validaron las rutas de iconos. Tras completar el NDK 27.1 local, `assembleDebug` produjo un APK de QA que se instaló en un emulador Android 35 separado. Las vistas previas de máscara circular, cuadrada redondeada y tipo squircle preservan calendario, check y monedas. La captura del launcher final en fondo claro y oscuro conserva los tres elementos sin halo blanco ni recorte; no equivale a QA de entrega por Play.
- Pasos manuales y controles: `PLAY_CLOSED_BETA.md`, `PLAY_CONSOLE_CHECKLIST.md`.

## Validación pendiente de distribución

Como comprobación limitada, el APK independiente PREVIEW-04 (`0.4.0`/4) ya instalado
en `emulator-5554` se reinició con Wi-Fi y datos móviles desactivados y mostró
Home, movimientos, plan, Ayuda, Tu espacio y Descubrimientos. Se restauró la
conectividad previa. No se capturaron paquetes ni se ejercitó la nueva página
Privacidad en ese APK anterior. La nueva página Privacidad sí abrió y volvió a
la portada de Ayuda en Expo Go, Android API 35; esa verificación usa Metro y no
prueba el AAB firmado.

El AAB contiene los 16 recursos de `assets/space/runtime`; `empty-room.jpg` coincide en SHA-256 con su fuente runtime. No incluye los nombres de las fuentes visuales sin optimizar, `master-reference.jpg`, recursos de tutorial/plantilla sin uso ni archivos con nombres de secretos. El JPEG maestro tampoco aparece como bytes idénticos. Se inspeccionaron 1365 entradas del ZIP. Esta búsqueda no prueba la ausencia de cualquier secreto dentro de los binarios; no se identificaron secretos obvios en el contenido Git rastreado. La prueba de APK PREVIEW-04 offline no sustituye el AAB nuevo. En Internal Testing verificar instalación/actualización entregada por Play, 360×640 dp, icono/nombre, Ayuda→Privacidad, temas, Tu espacio, Descubrimientos, primer uso sin avisos de permisos inesperados y flujos principales sin red. No declarar pruebas de red a nivel de paquetes ni QA del split hasta realizarlas.
