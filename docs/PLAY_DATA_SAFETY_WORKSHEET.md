# PRE-BETA-AUDIT-01 — Hoja de trabajo de Data Safety

**Borrador, no enviado a Play Console (12 de octubre de 2026).** Los estados se refieren a la versión `0.4.0`/`versionCode 4`. [Google Play](https://support.google.com/googleplay/android-developer/answer/10787469) exige incluir la actividad de SDK; la recolección implica transmisión fuera del dispositivo, no solo SQLite local. La auditoría y sus límites están en `PLAY_DATA_SAFETY_AUDIT.md`.

| Pregunta | Estado y evidencia | Acción pendiente |
|---|---|---|
| ¿Recoge datos de usuario? | **MANUAL VERIFICATION STILL REQUIRED.** Código propio sin transmisión; 0 bytes del UID observados en la APK independiente con red activa. Falta AAB entregado por Play y conducta nativa definitiva. | Revisar tráfico/SDK del paquete entregado; responder por tipo de dato. |
| ¿Comparte datos con terceros? | **MANUAL VERIFICATION STILL REQUIRED.** No se identificó compartición propia ni SDK de anuncios/analítica; la ausencia observada no prueba todo el paquete. | Confirmar destinatarios/excepciones de Google antes de marcar «No». |
| ¿Envía datos financieros? | **VERIFIED NO** para código propio y flujo observado de la APK; **MANUAL VERIFICATION STILL REQUIRED** para el AAB entregado por Play. | Confirmar que ninguna transmisión nativa incluye contenido financiero. |
| ¿Envía metadatos de app/dispositivo? | **MANUAL VERIFICATION STILL REQUIRED.** `expo-updates` deshabilitado, sin URL/canal; no hubo bytes atribuibles al UID en el recorrido. Otros SDK o el sistema podrían actuar fuera de lo medido. | Inspeccionar tráfico del paquete final y guías de SDK. |
| ¿Están cifrados los datos en tránsito? | **MANUAL VERIFICATION STILL REQUIRED.** No se observó transmisión de la app y no hubo captura de protocolos. | Si se identifica transmisión declarable, verificar TLS/cifrado de cada destino. |
| ¿Se pueden eliminar los datos? | **VERIFIED YES** para movimientos/plan desde UI y datos locales al borrar almacenamiento o desinstalar; sin cuenta ni solicitud de borrado de cuenta. `allowBackup=true` permite comportamiento de respaldo/restauración del sistema. | Explicar alcance local; no prometer borrado de copias del sistema. Si aparece recolección, revisar exigencia de eliminación de esos datos. |
| ¿Datos almacenados localmente? | **VERIFIED YES.** Perfil, movimientos, plan, preferencias, Tu espacio y Descubrimientos en SQLite. | Reflejar en política de privacidad; almacenamiento local por sí solo no es «recogido» en Play. |
| ¿Se crea una cuenta? | **VERIFIED NO.** Sin autenticación, cuenta o perfil remoto. | Declarar acceso libre. |
| ¿Hay anuncios? | **VERIFIED NO.** Sin SDK/interfaz publicitaria. | Marcar «No» en anuncios. |
| ¿Hay analítica/Insights? | **VERIFIED NO.** Sin SDK, integración o instrumentación; `expo-observe` no instalado. | Revalidar si cambia el grafo. |
| ¿Hay informes de fallos? | **VERIFIED NO.** Sin SDK ni envío de crash reporting de producto. | Revalidar si cambia el grafo. |
| ¿Hay otros SDK de red? | **MANUAL VERIFICATION STILL REQUIRED.** Expo/React Native y módulos nativos tienen capacidad de red, sin llamadas propias ni destino identificado. | Verificar AAB entregado por Play y documentación de proveedores. |

Internal Testing aislado puede estar exento de mostrar Data Safety; Closed Testing requiere la sección según la [guía de Google](https://support.google.com/googleplay/android-developer/answer/10787469). No se ha enviado ninguna respuesta.
