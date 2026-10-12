# PLAY-01 — Hoja de trabajo de Data Safety

**Preparación, no enviada a Play Console.** No elegir respuestas definitivas mientras el comportamiento de red de los SDK siga marcado **BLOCKED / NEEDS MANUAL VERIFICATION** en `PLAY_DATA_SAFETY_AUDIT.md`. Google exige reflejar también los datos transmitidos por SDK de terceros: [guía oficial](https://support.google.com/googleplay/android-developer/answer/10787469).

| Pregunta / respuesta propuesta | EVIDENCE | CONFIDENCE | MANUAL PLAY CONSOLE ACTION |
|---|---|---|---|
| ¿Recoge datos de usuario? **BLOCKED / NEEDS MANUAL VERIFICATION.** El código propio no envía datos financieros; SDK y tráfico final pendientes. | Búsqueda en `src/`, auditoría de dependencias; `INTERNET` presente. | Alta para código propio, insuficiente para paquete completo. | Verificar red/SDK y contestar cada tipo de dato según resultado. |
| ¿Comparte datos con terceros? **BLOCKED / NEEDS MANUAL VERIFICATION.** No hay compartición propia localizada. | No hay backend, SDK de anuncios o analítica directos. | Media; falta comportamiento nativo final. | Revisar proveedores y Play SDK Index; declarar cualquier transmisión relevante. |
| ¿Datos cifrados en tránsito? **BLOCKED / NEEDS MANUAL VERIFICATION.** | No hay tráfico de datos de producto implementado; las conexiones técnicas no se caracterizaron. | Insuficiente. | Si existe transmisión declarable, verificar protocolo y responder exactamente. |
| ¿Se pueden eliminar datos? **Sí, localmente:** movimientos/planes en UI; borrar datos o desinstalar. No existe solicitud de eliminación de cuenta. | Repositorios y rutas actuales; no hay cuenta. Android permite respaldo del sistema. | Alta para datos locales; restauración de respaldo depende del sistema. | Responder con el alcance de datos realmente recogidos y reglas de Play; no prometer borrado de copias del sistema. |
| ¿Se almacenan datos en el dispositivo? **Sí.** Perfil, movimientos, plan, preferencias, Tu espacio y Descubrimientos. | `expo-sqlite`, migraciones v1–v6 y repositorios. | Alta. | Reflejar en política; no confundir almacenamiento local con «recolección» de Play. |
| ¿Hay SDK de terceros? **Sí:** Expo, React Native y módulos nativos enumerados en la auditoría. | `package.json`, `package-lock.json`, manifiestos de `node_modules`. | Alta para dependencias instaladas; empaquetado exacto pendiente. | Verificar AAB final y guías de los SDK. |
| ¿Se crea una cuenta? **No.** | No hay autenticación ni perfil remoto. | Alta. | Declarar acceso libre; no inventar credenciales de revisión. |
| ¿Contiene anuncios? **No.** | Sin SDK de anuncios ni interfaz publicitaria. | Alta. | Marcar «No» en declaración de anuncios. |

El formulario de Play Console debe completarse para Closed Testing aunque Internal Testing aislado pueda estar exento de mostrar la sección. No se ha enviado ninguna respuesta.
