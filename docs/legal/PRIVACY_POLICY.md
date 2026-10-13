# Política de privacidad de Mis Pagos

**Borrador para la beta cerrada — 13 de octubre de 2026.** La verificación de SDK y red indicada en `docs/PLAY_DATA_SAFETY_AUDIT.md` sigue pendiente.

**Responsable:** Diego Marin.

**Contacto de privacidad:** mispagos.soporte@gmail.com.

**URL pública de esta política:** https://mis-pagos-website.vercel.app/privacidad.

## Datos que guarda la aplicación

Mis Pagos permite registrar manualmente saldo, moneda, movimientos (título, importe, fecha, estado y notas), planes mensuales, reserva y asignaciones. También guarda en el dispositivo preferencias de aspecto, nombre opcional de Tu espacio, decoración, progreso visual y Descubrimientos. Estos datos se guardan en una base SQLite local para mostrar los cálculos y conservar las elecciones de la persona.

Mis Pagos no exige cuenta, no conecta bancos y no incorpora un servicio propio de sincronización o almacenamiento en la nube. Las funciones financieras principales funcionan sin conexión. El código de la aplicación no envía deliberadamente esos registros financieros a un servidor del desarrollador.

## Red y componentes de terceros

La aplicación contiene componentes de Expo y React Native que pueden usar la red para funciones del sistema o del marco. La configuración Android incluye acceso a Internet. La auditoría del paquete final y la comprobación de red de esos componentes siguen **pendientes**. Por ello no afirmamos que el paquete nunca haga conexiones o que ningún SDK transmita datos técnicos. Antes de publicar la beta cerrada se revisará el comportamiento efectivo y se actualizarán esta política y la declaración de Data Safety cuando corresponda.

No se han integrado SDK de anuncios, analítica de producto, autenticación, conexión bancaria ni informes de fallos específicos del desarrollador. Google Play y el sistema operativo pueden tratar datos conforme a sus propias políticas cuando distribuyen, instalan o respaldan la app.

## Conservación, eliminación y respaldo

Los registros permanecen en el dispositivo hasta que la persona los edita o elimina, borra los datos de la aplicación, o la desinstala. Los movimientos y planes pueden eliminarse desde la app; algunas preferencias y Descubrimientos se conservan mientras permanezcan los datos de la app. Desinstalarla normalmente borra sus datos locales de ese dispositivo. La configuración nativa permite el respaldo administrado por Android; si el respaldo del dispositivo está habilitado, una copia puede conservarse y restaurarse según las opciones y políticas del proveedor del sistema. Mis Pagos no ofrece hoy exportación, respaldo propio ni recuperación desde una cuenta de Mis Pagos.

La información financiera local no se cifra por una función propia de Mis Pagos. La protección del dispositivo, sus copias y el acceso a la aplicación dependen de las funciones configuradas en Android. Evitá compartir capturas de pantalla o comentarios que incluyan saldos, nombres o importes sensibles.

## Comentarios y contacto

Desde Ayuda podés enviar comentarios o reportar errores a mispagos.soporte@gmail.com mediante tu aplicación de correo. Su uso es voluntario. No solicitaremos detalles financieros sensibles para atender comentarios.

Se notificará cualquier cambio material de esta política mediante una nueva fecha y versión en la página pública. Las consultas de privacidad se dirigirán al contacto indicado arriba.
