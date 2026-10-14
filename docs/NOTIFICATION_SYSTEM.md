# NOTIF-01 — Recordatorios locales

## Alcance y permiso

Android e iOS programan avisos del dispositivo. No hay backend, push token ni uso de notificaciones remotas. La opción global empieza apagada; al activarla se solicita el permiso nativo. Si se deniega, permanece apagada. En web la pantalla informa que los avisos del dispositivo se configuran en Android. La versión web del proyecto todavía tiene el bloqueo SQLite documentado en `PROJECT_STATE.md`.

El manifiesto fusionado de release generado localmente declara `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` y `WAKE_LOCK` además de los permisos previos. Los permisos de mensajería remota y badges se excluyen en `app.json`. La auditoría y los límites de verificación están en `PLAY_DATA_SAFETY_AUDIT.md`.

## Reglas

Las seis categorías configurables son: vencimientos próximos, movimientos vencidos, ingresos previstos, revisión del plan/reserva, Descubrimientos/Tu espacio y reenganche suave. No se muestra importe ni nombre de movimiento en el aviso, para reducir exposición en la pantalla bloqueada. Los vencidos usan un tono claro y amable; los avances usan copy positivo; los demás son neutros. Hay variantes de texto por fecha y emojis discretos.

Se calcula un horizonte de siete días de fechas civiles locales. Se agrupan movimientos de la misma categoría y se elige **un máximo de un aviso por día**: vencidos > próximos > ingresos > plan > descubrimientos > reenganche. El recordatorio de vencidos se repite como máximo cada tres días dentro del horizonte, y solo mientras el movimiento continúe pendiente al recalcular. Vencimientos próximos se programan el día anterior (o el mismo día si el movimiento se creó ese día). La revisión del plan se propone el domingo cuando hay un plan vigente. El reenganche se propone tras siete días sin abrir. La franja predeterminada es 09:00–20:00; la persona puede elegir inicio 09–12 y fin 19–22. No se programan horas fuera de la ventana.

Al abrir/reactivar la app, navegar o guardar un movimiento, plan, descubrimiento o preferencia, se recalculan las próximas fechas y se cancelan avisos nativos obsoletos. Los IDs de día son estables y los contenidos iguales no se duplican. `notification_days` evita volver a programar un aviso de un día cuyo horario ya pasó. Una notificación ya entregada no puede retirarse de la bandeja por una edición posterior; la cancelación afecta avisos pendientes. Android puede retrasar una alarma por ahorro de batería.

## Verificación de esta iteración

Tests unitarios cubren preferencias persistentes, límite diario, prioridad, estado pendiente, categoría desactivada y horario. Typecheck, lint, export/compilación Android y manifiesto fusionado se reportan en el cierre de tarea. En el APK independiente de QA se verificaron el arranque, la solicitud del permiso al activar avisos y la persistencia de la preferencia tras reiniciar. La entrega efectiva y la cancelación de una alarma programada después de editar un movimiento aún requieren prueba temporal en dispositivo. El AAB distribuido por Play y su tráfico siguen como verificación separada.
