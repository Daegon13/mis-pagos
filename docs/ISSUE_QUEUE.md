# Cola aprobable de issues — Mis Pagos

Este documento **no sustituye** a docs/PROJECT_STATE.md ni a docs/PRODUCT_ROADMAP.md.
Es una cola de publicación derivada de esas fuentes. Antes de añadir una tarea, comprobar
el estado actual y docs/DECISIONS.md. Usar docs/TASK_TEMPLATE.md como contrato.

## Estados

- PROPOSED: borrador; no se crea el issue.
- BLOCKED: no publicar, aunque la tarea esté descrita.
- READY: tarea aprobada; GitHub Actions crea el issue al integrar este archivo en main.

Cada bloque necesita un ID estable y un título que empiece con ese mismo ID.
No cambiar el ID después de publicar. Una tarea READY debe conservar todas las
secciones de docs/TASK_TEMPLATE.md, con N/A justificado cuando corresponda.
La automatización **no** modifica issues existentes, no asigna agentes y no
ejecuta código. También evita republicar un issue ya cerrado.

## Ejemplo basado en el estado actual (sin autorización de publicación)

<!-- ISSUE:START id=BETA-DISTRIBUTION-QA status=PROPOSED -->
# [BETA-DISTRIBUTION-QA] — Verificar actualización real de la beta con SQLite v10

## OBJECTIVE

Confirmar una actualización real desde un APK anterior firmado de forma compatible,
conservando los datos del usuario y verificando el borrador de correo del feedback beta.

## CONTEXT

Según docs/PROJECT_STATE.md, BETA-FEEDBACK-01 aprobó las pruebas locales,
pero su QA de distribución sigue pendiente. docs/BETA_FEEDBACK_SYSTEM.md define
el alcance. No confundir la variante QA con el package de producción.

## SCOPE

### In scope

- Actualización real con identidad y firma compatibles.
- Verificación de persistencia tras la migración v10.
- Inspección de un borrador de correo con una cuenta configurada.
- Evidencia reproducible de los resultados.

### Out of scope

- Modificar fórmulas financieras, migraciones ya aplicadas o arquitectura.
- Enviar respuestas de usuarios reales sin su acción explícita.
- Publicar la app en Google Play.

## ALLOWED FILES

- Documentación de QA directamente asociada, si resulta necesario.

## FORBIDDEN FILES

- Migraciones SQLite ya publicadas.
- Código financiero y de persistencia no relacionado.

## REQUIREMENTS

1. Usar un APK previo con identidad y certificado de firma compatibles.
2. No resetear datos para simular la actualización.
3. Documentar claramente dispositivo, versión y resultado.

## ACCEPTANCE CRITERIA

- [ ] Los datos anteriores sobreviven al upgrade real.
- [ ] El borrador de email no incluye datos financieros.
- [ ] Los resultados y limitaciones están documentados.
- [ ] No se añaden dependencias ni se amplía el alcance.

## REQUIRED CHECKS

- Validaciones de migración y pruebas de integración pertinentes.
- Registrar versiones, identidad y firma usadas.

## MANUAL VERIFICATION

1. Instalar una build previa compatible e introducir datos de prueba.
2. Actualizar sin desinstalar y comprobar persistencia.
3. Abrir feedback beta, editar respuestas y revisar el borrador.

## DEPENDENCIES

- APK anterior compatible, build nueva y dispositivo Android de prueba.
- No se autorizan nuevas dependencias de software.

## ARCHITECTURE / DECISIONS

- Mantener el contrato local-first y las migraciones inmutables.
- Ningún cambio arquitectónico autorizado.

## DELIVERABLE

- Informe corto con evidencias PASS/FAIL, versiones y bloqueos.
<!-- ISSUE:END -->

Para publicar este ejemplo, primero revisarlo contra el estado más reciente,
decidir si sigue vigente y cambiar solamente su estado a READY en un PR aprobado.
