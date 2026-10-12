# PLAY-01 — SDK, permisos y datos

Fecha: 12 de octubre de 2026. Auditoría de código/configuración, dependencias instaladas y observación limitada de la APK independiente `0.4.0`. La instalación entregada por Play aún no se observó. **MANUAL VERIFICATION STILL REQUIRED** significa que no se debe convertir la inferencia en una respuesta definitiva de Data Safety.

## Resultado PRE-BETA-AUDIT-01

**Código y configuración de producción.** `app.json` no define URL/canal OTA; `npm ls --all` no encuentra `expo-updates`, `expo-observe`/Insights, Firebase, Sentry, notificaciones ni SDK de anuncios entre las dependencias instaladas consultadas. La búsqueda de `src/` no encontró `fetch`, `XMLHttpRequest`, `WebSocket`, URL HTTP, apertura de navegador o llamadas a módulos de dispositivo. El manifiesto del AAB firmado declara `expo.modules.updates.ENABLED=false`; también declara `EXPO_UPDATES_CHECK_ON_LAUNCH=ALWAYS`, pero `ENABLED=false` y la ausencia de URL impiden la búsqueda remota: se carga el bundle incorporado según la [documentación de Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/). No se identificó una petición OTA al iniciar, un endpoint OTA ni metadatos de dispositivo enviados por ese módulo. No corresponde cambiar su configuración para esta beta: ya está deshabilitado. Habilitar OTA después sí cambiaría el flujo de actualizaciones y exigiría una nueva auditoría.

| Componente con capacidad de red | Función / activo en producción | Destino y datos potenciales | Datos financieros / Data Safety | Confianza |
|---|---|---|---|---|
| Código propio (`src/`) | Cálculo, UI y SQLite; **sin transmisión implementada** | Ningún endpoint localizado; datos del usuario permanecen en SQLite local | Sin envío propio identificable; no basta para declarar «no recoge datos» a nivel de app | Alta para código/configuración |
| `expo-updates` | OTA; **NO** instalado en grafo consultado, **NO** habilitado en AAB | Sin URL/canal; si se habilitara podría solicitar actualizaciones y enviar metadatos técnicos de app/dispositivo | No hay ruta OTA activa ni envío de contenido financiero identificado | Alta para configuración del AAB; observar build entregada por Play |
| Expo/React Native, `expo-constants`, `expo-device`, `expo-image`, `expo-file-system`, `expo-linking`, `expo-web-browser` | Framework y módulos nativos presentes o transitivos; capacidad de red/metadata, sin llamadas remotas propias localizadas | No se identificó endpoint; podrían manejar metadatos de app/dispositivo si una función remota se activa | Ningún envío de contenido financiero observado; recolección técnica nativa no cerrada | Media: requiere verificación del paquete entregado y documentación de proveedores |
| EAS Build / EAS Observe / Insights | Build remota fuera del runtime; Observe/Insights **NO** instalado/configurado como SDK | EAS Build recibe artefacto de compilación, no registros financieros del usuario | No se identificó recolección runtime por estas herramientas; [Expo Observe requiere instalar `expo-observe`](https://docs.expo.dev/versions/latest/sdk/observe/) | Alta para dependencias/configuración |
| Analítica, crash reporting, ads, atribución, autenticación/nube | **NO** SDK ni integración identificados | Ninguno | Ninguna declaración por estos SDK identificada | Alta para grafo instalado y código; revalidar si cambian dependencias |

**Comportamiento observado.** En Android API 35, con red Wi-Fi validada (prueba de conectividad exitosa), se hizo arranque frío de la APK `preview` independiente `0.4.0` y se abrieron Home, Movimientos, Plan, Ayuda, Tu espacio y Descubrimientos sin editar datos. El UID de la app (`10209`) no figuraba en `dumpsys netstats` `mAppUidStatsMap` antes ni después del recorrido: **0 bytes atribuibles observados** en ese contador. No se capturaron paquetes, destinos, DNS ni cuerpos; el contador puede omitir tráfico atribuido a otros UID y esta APK no es el AAB de producción distribuido por Play. Por ello, ninguna ausencia observada prueba ausencia universal de recolección.

**Conclusión por pregunta.** Datos financieros transmitidos: **VERIFIED NO** para código propio y flujo observado de la APK; **MANUAL VERIFICATION STILL REQUIRED** para el AAB entregado por Play. Metadatos de app/dispositivo transmitidos, datos de usuario recogidos o compartidos a nivel de paquete final, y cifrado en tránsito de cualquier transmisión real: **MANUAL VERIFICATION STILL REQUIRED**. Cuenta, anuncios, analítica y crash reporting de producto: **VERIFIED NO** según código/configuración/grafo actual. Almacenamiento SQLite local: **VERIFIED YES**. El manifiesto efectivo tiene `allowBackup=true`; copias/restauraciones del sistema operativo deben considerarse por separado del envío propio de la app. Según [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469), «recogidos» incluye datos enviados fuera del dispositivo por SDK y «compartidos» depende del destinatario/excepciones; no equivale al simple almacenamiento local.

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
