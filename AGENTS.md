# Reglas permanentes del repositorio

Este archivo es normativo para cualquier persona o agente que trabaje en **Mis Pagos**. Ante un conflicto, prevalecen las instrucciones explícitas de la tarea; el conflicto debe señalarse y no debe resolverse ampliando el alcance de forma silenciosa.

## Antes de cambiar código

Todo agente debe:

1. leer la tarea completa;
2. inspeccionar los archivos afectados;
3. respetar `ALLOWED FILES`;
4. respetar `FORBIDDEN FILES`;
5. leer `docs/PROJECT_STATE.md` como contexto principal;
6. consultar `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` o `docs/DATA_MODEL.md`
   solamente cuando la tarea toque directamente una decisión arquitectónica,
   modelo persistente, migraciones o exista un conflicto;
7. leer contratos de producto específicos solo cuando la tarea los toque;
8. no ampliar el alcance silenciosamente.

Contratos específicos:

- `docs/PRODUCT_THESIS.md`: cambios de producto, prioridad, Home o roadmap;
- `docs/HOME_UX.md`: comportamiento y jerarquía de Home;
- `docs/SPENDING_PLAN_SYSTEM.md`: reserva, Libre para usar, asignaciones, ritmo y simulación;
- `docs/ENGAGEMENT_SYSTEM.md`: progresión emocional y `Tu espacio`;
- `docs/ACHIEVEMENT_SYSTEM.md`: logros, desbloqueos y recompensas;
- `docs/PERSONALIZATION_SYSTEM.md`: temas, intereses, atmósfera e identidad visual;
- `docs/CURRENCY_SYSTEM.md`: moneda principal, referencias y FX;
- `docs/PRODUCT_ROADMAP.md`: planificación/prioridades, no como lectura por defecto.
- `docs/HELP_SYSTEM.md`: educación del usuario, terminología, glosario, explicaciones contextuales o Help Center.

No leer todos estos documentos para cada tarea.

---

## Responsabilidad de `src/app`

`src/app` pertenece exclusivamente a Expo Router. Puede contener:

- rutas;
- layouts;
- navegación asociada a rutas.

No debe contener:

- SQL;
- repositories;
- modelos de dominio;
- lógica financiera;
- utilidades generales;
- componentes reutilizables generales.

## Dependencias

No instalar dependencias nuevas salvo autorización explícita de la tarea. Si una parece necesaria, detener el trabajo y reportar:

```text
Dependency:
Reason:
Problem solved:
Native/existing alternative:
Alternatives considered:
Recommended option:
```

## Arquitectura

No cambiar sin autorización explícita:

- arquitectura;
- persistencia;
- estrategia de navegación;
- estrategia de estado;
- modelos centrales;
- estructura principal.

## Alcance

Una tarea pequeña no debería modificar normalmente más de **5 archivos de producción**. No cuentan en ese límite:

- tests directamente asociados;
- documentación solicitada;
- lockfiles automáticos.

Si una tarea aparentemente pequeña requiere muchos archivos, detener el trabajo y reportarlo antes de ampliar el alcance.

## Dirección de producto

`docs/PRODUCT_THESIS.md` define el criterio de producto de alto nivel.

No convertir Mis Pagos silenciosamente en:

- un tracker exhaustivo de gastos;
- una app que exige categorizar cada transacción;
- una agenda financiera genérica;
- un dashboard bancario;
- un sistema dependiente de IA.

`Disponible real` conserva su significado financiero establecido.

Los objetivos personales de planificación, como una reserva, son una capa separada y
no deben alterar silenciosamente la verdad financiera.

Cuando una tarea implemente `¿Puedo gastar esto?`, reservas, asignaciones o ritmo de
gasto, respetar `docs/SPENDING_PLAN_SYSTEM.md`.


## Dinero

Nunca persistir dinero con floats. Usar unidades monetarias menores enteras; por ejemplo:

```text
10.99 → 1099
```

El nombre recomendado es `amountMinor`.

## Modelo financiero del MVP

El modelo financiero aprobado para el MVP es `FinancialProfile` + `Payment`.

`Payment` representa tanto gastos como ingresos mediante su campo `type`.

No separar ingresos y gastos en entidades persistentes distintas sin una decisión arquitectónica explícita.

## Fechas

Distinguir siempre entre:

- **fecha civil financiera:** `YYYY-MM-DD`, para vencimientos y fechas elegidas por el usuario;
- **instante técnico:** timestamp ISO en UTC, para `createdAt`, `updatedAt` y eventos técnicos.

No convertir una fecha civil en un instante si el dominio no requiere una hora.

## SQLite

SQLite está incorporado como persistencia local. Respetar este flujo:

```text
UI
↓
feature/domain logic
↓
repository
↓
SQLite
```

La UI nunca ejecuta SQL directamente.

## Estado

No instalar Redux, Zustand u otro gestor externo sin una necesidad demostrada y autorización explícita. La preferencia inicial es:

```text
React state
+
hooks
+
SQLite como fuente persistente
```

## Migraciones

Una migración aplicada o publicada nunca se modifica. Todo cambio posterior requiere una migración nueva.

## TypeScript

Mantener `strict: true`. No ocultar problemas mediante `any`, `@ts-ignore` o `@ts-nocheck`, salvo una excepción expresamente autorizada y documentada.

## Git

Un commit debe representar una sola intención. Usar mensajes claros y acotados, por ejemplo:

```text
feat: add payment creation
fix: validate payment amount
docs: establish architecture contract
```

No mezclar refactors, formateos o cambios ajenos a la tarea.

## Ejecución de tareas

- Use `docs/TASK_TEMPLATE.md` for architectural, risky or unusually complex tasks.
- For ordinary coherent feature work, a compact explicit task prompt is sufficient.
- Ejecutar los checks solicitados antes de cerrar una tarea.
- No hacer refactors amplios dentro de tareas no relacionadas.
- Si una instrucción contradice `docs/DECISIONS.md`, detenerse y solicitar autorización para registrar una nueva decisión.

## Context efficiency

- Treat `docs/PROJECT_STATE.md` as the compact current-state reference.
- Route to the narrowest relevant product contract instead of reading every document.
- Read `PRODUCT_THESIS.md` only for product-direction/scope decisions or when a feature may change the product's core proposition.
- Do not re-derive or restate settled architecture.
- If a decision already exists in `docs/DECISIONS.md`, treat it as settled unless the current task explicitly changes it.
- Read only files relevant to the current task.
- Prefer targeted searches over repository-wide exploration.
- Do not scan the entire repository unless necessary.
- Do not summarize documentation before implementing unless requested.
- Do not produce long implementation plans unless requested.
- Do not narrate routine tool usage or obvious implementation steps.
- Reuse existing utilities, components and patterns before creating new ones.
- Keep final reports concise and focused on material changes, validation and blockers.
- Stop only for real architectural conflicts, missing dependencies, failed gates, or scope expansion that materially changes the task.

## Execution efficiency

For medium or large tasks:

1. read `docs/PROJECT_STATE.md`;
2. inspect only the relevant implementation files;
3. form a short internal plan;
4. implement the complete coherent feature;
5. run required checks;
6. report only material results.

Do not break a coherent feature into multiple artificial sub-tasks unless the task explicitly requires it.

- `docs/SPACE_RENDERER.md`: required for any task involving Tu espacio assets,
  masks, placement, themes, scene composition or renderer behavior.
- `docs/SPACE_CUSTOMIZATION_SYSTEM.md`: required for tasks involving manual Tu espacio
  editing, decoration overrides or Discovery customization rewards.
- `docs/PLAY_STORE_RELEASE.md`: required for Google Play releases, AAB, signing,
  store submission and testing tracks.
- `docs/PLAY_DATA_SAFETY_AUDIT.md`: required before changing privacy or Data Safety
  declarations.
the new assets can be found in C:\Users\Usuario\Documents\GitHub\mis-pagos\assets\assets mis pagos
