# PLAY-01 — SDK, permisos y datos

Fecha: 12 de octubre de 2026. Auditoría de código/configuración y dependencias instaladas; la observación de tráfico en una instalación entregada por Play está pendiente. **NEEDS MANUAL VERIFICATION** significa que no se debe convertir esta inferencia en una respuesta definitiva de Data Safety.

## Datos propios

`src/` no contiene llamadas a `fetch`, URL remotas, SDK de publicidad/analítica/crash, autenticación ni cliente de nube. `expo-sqlite` guarda perfil financiero, movimientos, plan, preferencias, Tu espacio y Descubrimientos en `mis-pagos.db`. No hay login, conexión bancaria ni envío propio de registros financieros. La búsqueda de código no prueba por sí sola el comportamiento de SDK nativos ni del sistema operativo.

En la tabla, **acceso** describe datos que el componente puede recibir durante su función; **recolección** significa transmisión fuera del dispositivo según [Google Play](https://support.google.com/googleplay/android-developer/answer/10787469). «No observada» no equivale a prueba de ausencia. **Compartición** refiere a terceros, no a almacenamiento local.

| Dependencia runtime | Propósito y acceso potencial | Red y recolección potencial | Compartición / declaración | Confianza o pendiente |
|---|---|---|---|---|
| `react`, `react-dom`, `react-native`, `react-native-web` | UI y runtime; recibe estado mostrado, incluida información financiera en memoria | React Native puede ofrecer APIs de red; no hay envío propio localizado | No se identificó compartición de datos de la app | Alta para código propio; tráfico nativo pendiente |
| `expo`, `expo-constants` | Runtime y configuración; datos técnicos de app/dispositivo | Capacidad de red del runtime; sin telemetría confirmada | **NEEDS MANUAL VERIFICATION** para identificadores o diagnósticos del runtime | Media |
| `expo-router`, `expo-linking` | Navegación y enlaces; rutas/URL | No se localizaron enlaces salientes de producto | Ninguna observada | Alta en código; paquete final pendiente |
| `expo-sqlite` | Persistencia local; datos financieros, plan y personalización | No requiere red para las operaciones de base | No se identificó compartición propia | Alta para ruta de datos; respaldo Android separado |
| `expo-image`, `expo-file-system` (transitiva) | Imágenes de Tu espacio y archivos del runtime; acceso potencial a caché/archivos | Bibliotecas con capacidad de descargar imágenes/archivos; las imágenes de producto son locales | No se identificó descarga o carga de datos de usuario | Media; revisar tráfico y manifiesto final |
| `expo-device` | Información de dispositivo | Instalado; no se localizaron llamadas de aplicación | No se identificó compartición; **NEEDS MANUAL VERIFICATION** de conducta nativa | Media |
| `expo-font`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui`, `expo-symbols`, `expo-glass-effect` | Presentación, fuentes e interfaz del sistema | No se identificó función remota de producto | Ninguna observada | Media/alta |
| `@expo/ui`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`, `react-native-safe-area-context`, `react-native-screens` | Controles y navegación nativos; interacción de UI | No se identificó función remota | Ninguna observada | Media/alta |
| `expo-web-browser` | Apertura de navegador externo | Instalado; no se localizaron llamadas de producto | No se identificó compartición desde la app | Media |

`npm ls --all` no encontró `expo-updates`, Firebase, Sentry, notificaciones ni SDK de anuncios entre las dependencias instaladas consultadas; tampoco figuran como dependencias directas atribución, redes sociales, ubicación, autenticación ni analítica. No se configuró actualización remota OTA ni informe remoto de fallos de producto. EAS Build es una herramienta de construcción, no un SDK de telemetría incorporado deliberadamente en la app. Volver a comprobar el grafo final y el AAB antes de responder en Play Console. `INTERNET` permite red aun cuando el flujo principal sea local. La configuración nativa generada incluye `allowBackup=true`; respaldos/restauración de Android son comportamiento del sistema, no sincronización propia.

## Permisos Android

El manifiesto **efectivo del AAB firmado** contiene exactamente `INTERNET`, `ACCESS_NETWORK_STATE` y `com.diegomarin.mispagos.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. Las declaraciones `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` y `VIBRATE` quedaron eliminadas. No hay permisos de contactos, SMS, llamadas, localización, micrófono, cámara, fotos, ID publicitario ni notificaciones. `expo-updates.ENABLED=false` aparece en los metadatos nativos.

| Permiso | Clasificación | Acción |
|---|---|---|
| `INTERNET` | Framework/runtime; sensible para evaluar datos, no permiso de aviso | Conservar y auditar tráfico |
| `ACCESS_NETWORK_STATE` | Framework/runtime de `expo-image` | Presente; no pide aviso |
| `com.diegomarin.mispagos.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` | Framework/runtime; permiso propio de receptor no exportado, protección `signature` | Presente; no pide aviso ni acceso sensible externo |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` | Innecesarios; acceso a almacenamiento legado | Bloqueados en `app.json`; ausentes del AAB |
| `SYSTEM_ALERT_WINDOW`, `VIBRATE` | Innecesarios para esta app | Bloqueados en `app.json`; ausentes del AAB |

## Pendientes obligatorios

1. Ejecutar la build entregada por Play en Internal Testing, sin red y con captura de tráfico o auditoría equivalente para identificar cualquier llamada del framework. No afirmar prueba a nivel de paquetes hasta realizarla.
2. Confirmar en documentación/soporte del proveedor cualquier recolección técnica de SDK que el tráfico local no pueda resolver.
3. Comparar resultados con la política y la hoja de Data Safety antes de enviar Closed Testing.
