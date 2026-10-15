# Mis Pagos — Sistema de ayuda

## Estado

HELP-01 está implementado. El contenido es local, funciona sin red y explica el producto actual. No ejecuta cálculos financieros ni modifica datos persistentes.

SPACE-02/ACH-02 actualiza los temas Tu espacio, Tema, Intereses y Descubrimientos para explicar controles manuales, Automático frente a Vacío, paleta independiente y recompensas persistentes. El glosario usa los mismos significados actuales.

## Estructura

`/help` es una ruta permanente, disponible desde el `?` discreto del encabezado de Home después de configurar el perfil financiero. Presenta cinco secciones: **Entender tu dinero**, **Planificar el mes**, **Movimientos**, **Tu espacio** y **Descubrimientos**. Cada sección ofrece temas breves. El glosario reúne definiciones de una a tres frases. La pantalla permite volver al nivel anterior o a la pantalla de origen.

El registro `src/features/help/helpContent.ts` es la fuente única del contenido. Cada tema tiene un ID estable, categoría, título, explicación breve, cuerpo, definición opcional de glosario y vínculos relacionados. Los accesos contextuales usan esos IDs, muestran una explicación corta mediante un diálogo nativo y ofrecen **Ver más** para abrir el tema. Se reservan para conceptos donde aclaran una decisión: Disponible real, Proyección, Reserva objetivo, Libre para usar, Ritmo de referencia, Tu espacio y Descubrimientos. Sus botones tienen etiqueta accesible y área táctil de al menos 44 puntos.

PLAY-01 agrega **Privacidad** como entrada informativa independiente al final de la portada de Ayuda. Explica el almacenamiento local, los límites de la auditoría de red y la eliminación de datos sin alterar las cinco categorías ni el glosario. La política completa está en `docs/legal/PRIVACY_POLICY.md` y en `https://mis-pagos-website.vercel.app/privacidad`; Ayuda muestra el contacto `mispagos.soporte@gmail.com` y abre la URL pública al pedir el texto completo. El resumen local sigue disponible sin red.

BETA-FEEDBACK-01 agrega **Ayudanos a decidir** como entrada destacada. Sus respuestas y comentario opcional quedan en SQLite local hasta que la persona abra y envíe explícitamente un borrador de correo. Puede revisar el contenido antes de enviarlo; cancelar el correo conserva las respuestas. El registro y el contrato están en `docs/BETA_FEEDBACK_SYSTEM.md`. No altera las cinco categorías educativas, el glosario ni los cálculos financieros.

## Significado de los términos

- **Saldo actual**: cifra registrada como disponible hoy; se actualiza manualmente o al completar un movimiento eligiendo ajustar el saldo.
- **Comprometido**: gastos pendientes vencidos y dentro del horizonte inclusivo de hoy a 30 días.
- **Disponible real**: saldo actual menos esos compromisos. No incluye ingresos futuros ni descuenta la reserva personal.
- **Proyección**: saldo actual menos los gastos relevantes más ingresos pendientes de los próximos 30 días. No suma ingresos vencidos y no equivale a dinero disponible hoy.
- **Reserva objetivo**: monto que la persona elige intentar conservar al cierre del mes; es una intención separada de la verdad financiera. El porcentaje se fija como monto al guardar el plan.
- **Libre para usar**: Disponible real menos Reserva objetivo, mostrado como cero si la resta es negativa; es una interpretación de planificación, no un saldo nuevo. El faltante para llegar a la reserva se muestra aparte.
- **Ritmo de referencia**: guía aproximada diaria o semanal del margen hasta fin de mes; no es permiso ni prohibición.
- **Asignaciones**: reparto porcentual opcional del margen. No clasifican movimientos ni cambian datos financieros.
- **¿Puedo gastar esto?**: simulación hipotética. No crea movimientos, no gasta, no ajusta saldo ni reserva. Su primera ejecución explícita puede guardar un descubrimiento independiente.
- **Movimientos**: gastos e ingresos nacen pendientes. Al completarlos se elige **Ajustar el saldo** si aún no está reflejado, o **Ya está reflejado** si el saldo ya lo incluye. Cancelar conserva el registro; cancelar o eliminar nunca reescribe automáticamente el saldo.
- **Tu espacio**: memoria visual de organización, con progresión de habitación, planta y escritorio con libros. La decoración automática sigue intereses; Descubrimientos habilitan edición manual por zona. Automático devuelve el control al resolvedor y Vacío mantiene libre la zona. Las anclas no se editan.
- **Descubrimientos**: siete hitos actuales, persistentes y de una sola activación. Cada uno muestra su condición y la capacidad de personalización de Tu espacio que concede. No son puntos, rangos, rachas ni premios por riqueza o gasto.

## Voz y límites

Usar español rioplatense claro, humano y breve. La persona debe poder encontrar un concepto, entenderlo en segundos y regresar a su tarea. No introducir tutorial obligatorio, ventanas automáticas, búsqueda remota, API, CMS ni dependencia. No prometer funciones futuras, recompensas específicas ni renombrar conceptos centrales sin decisión de producto. Los contratos financieros y de planificación siguen siendo la autoridad para cálculos y reglas; la ayuda solo los explica.

## Verificación

Las pruebas del registro cubren IDs únicos, categorías pobladas, términos obligatorios del glosario, temas centrales, vínculos contextuales y relacionados, y ausencia de importaciones de escritura financiera. La QA de interfaz debe comprobar navegación, legibilidad en todos los temas, Peonía y Ciruela, ancho de 360 puntos, acceso sin teclado, funcionamiento sin red y ausencia de cambios financieros.
