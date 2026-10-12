# PLAY-01 — Ruta de beta cerrada

Esta guía prepara acciones **manuales**. No se creó una app en Play Console ni se publicó un track.

1. Confirmar cuenta de desarrollador, nombre público y datos de contacto; crear manualmente la app `Mis Pagos` con paquete `com.diegomarin.mispagos`.
2. Completar App content: acceso sin cuenta, anuncios, público objetivo, clasificación de contenido, funciones financieras si Play las pregunta y permisos especiales si el AAB los muestra.
3. Publicar la política de privacidad revisada en una URL pública; registrar la misma URL en Play Console. **PUBLIC PRIVACY URL: PENDING.**
4. Cerrar la auditoría de tráfico/SDK y completar Data Safety con la hoja de trabajo, sin convertir sus bloqueos en «No» automáticos.
5. Cargar nombre, descripciones y recursos reales de la ficha. Completar correo de contacto; sitio web solo si existe.
6. Confirmar Play App Signing y la clave de subida administrada por EAS; conservar copia/gestión segura de credenciales. Subir manualmente el AAB validado.
7. Publicar primero **Internal Testing** a un grupo pequeño de confianza. Verificar instalación, primer inicio, permiso solicitado, icono/nombre, navegación, uso sin red, actualización y firma de la versión entregada por Play.
8. Corregir cualquier incidencia y cargar un AAB con `versionCode` mayor cuando haga falta. Repetir las declaraciones si cambia el comportamiento de datos.
9. Publicar **Closed Testing** a 15–20 personas invitadas, crear el grupo/lista y compartir el vínculo de participación. Registrar fecha de adhesión, dispositivos y feedback sin pedir detalles financieros sensibles.
10. Recoger comentarios sobre: qué intentaban hacer, qué esperaban, qué pasó, qué confundió y qué desearían que la app hiciera automáticamente. **FEEDBACK DESTINATION REQUIRED**: falta un correo/formulario verificado, así que la app no muestra un enlace inerte. Una vez confirmado, añadir en Ayuda → «Enviar comentarios» un `mailto:` con esas cinco preguntas y una indicación de no incluir saldos, importes, nombres ni capturas sensibles; verificar que el dispositivo tiene un cliente de correo o proporcionar otro destino real.
11. Resolver problemas por prioridad y ofrecer actualizaciones en el mismo track, con código creciente y QA de migración/uso sin red. El paso a producción exige una decisión posterior separada.

**VERIFY ACCOUNT REQUIREMENT IN PLAY CONSOLE.** Las cuentas personales creadas después del 13 de noviembre de 2023 pueden necesitar 12 participantes inscritos continuamente durante al menos 14 días antes de pedir acceso a producción. No se ha verificado si se aplica a esta cuenta. [Requisito oficial](https://support.google.com/googleplay/android-developer/answer/14151465).
