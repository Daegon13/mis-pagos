# Registro de decisiones técnicas

Este archivo registra decisiones aceptadas que condicionan futuras tareas. Una decisión no se cambia silenciosamente: debe añadirse una entrada nueva que reemplace explícitamente a la anterior.

## Formato

Cada entrada incluye estado, contexto, decisión y consecuencias. Estados posibles: `Propuesta`, `Aceptada`, `Reemplazada` o `Rechazada`.

---

## D-001 — Expo SDK 57 estable

- **Estado:** Aceptada
- **Contexto:** El repositorio existente usa Expo y necesita una base estable.
- **Decisión:** Mantener React Native con Expo SDK 57 como base estable aprobada para el MVP, con npm y Node.js 22 LTS.
- **Consecuencias:** No se recreará el proyecto ni se cambiarán el SDK o el package manager sin autorización y una nueva decisión.

## D-002 — SQLite local-first

- **Estado:** Aceptada; implementada
- **Contexto:** Los datos estructurados y los cálculos deben funcionar sin conectividad ni infraestructura remota.
- **Decisión:** Usar SQLite como persistencia local detrás de una capa repository.
- **Consecuencias:** Implementada mediante `expo-sqlite`, con esquema inicial, migraciones y repositories de `FinancialProfile` y `Payment`. La UI no ejecuta SQL directamente.

## D-003 — TypeScript strict

- **Estado:** Aceptada
- **Contexto:** El proyecto necesita una base tipada y mantenible.
- **Decisión:** Mantener TypeScript en modo `strict`.
- **Consecuencias:** No se ocultarán errores con `any`, `@ts-ignore` o `@ts-nocheck` salvo autorización expresa y documentada.

## D-004 — Expo Router

- **Estado:** Aceptada
- **Contexto:** El repositorio ya adopta navegación basada en archivos con Expo.
- **Decisión:** Usar Expo Router como estrategia de navegación.
- **Consecuencias:** Cambiar la estrategia de navegación exige autorización y una nueva decisión.

## D-005 — `src/app` reservado a rutas

- **Estado:** Aceptada
- **Contexto:** Mezclar navegación, dominio y persistencia dificultaría las pruebas y la evolución.
- **Decisión:** Reservar `src/app` exclusivamente para rutas, layouts y navegación asociada a rutas.
- **Consecuencias:** SQL, repositories, modelos de dominio, lógica financiera, utilidades generales y componentes reutilizables generales vivirán fuera de `src/app`.

## D-006 — Dinero en enteros de unidades menores

- **Estado:** Aceptada
- **Contexto:** Los floats introducen errores de precisión inaceptables para importes monetarios.
- **Decisión:** Persistir importes como enteros en unidades monetarias menores, con nombres como `amountMinor` y `availableBalanceMinor`.
- **Consecuencias:** `10.99` se representa como `1099` para monedas de dos decimales.

## D-007 — Fechas financieras `YYYY-MM-DD`

- **Estado:** Aceptada
- **Contexto:** Un vencimiento es un día civil, mientras que la auditoría técnica representa un instante global.
- **Decisión:** Usar `YYYY-MM-DD` para fechas financieras y timestamps ISO UTC para `createdAt`, `updatedAt` y eventos técnicos.
- **Consecuencias:** Las fechas civiles no deben cambiar de día por conversiones de zona horaria.

## D-008 — Una moneda principal en el MVP

- **Estado:** Aceptada
- **Contexto:** El MVP no necesita gestión multidivisa.
- **Decisión:** Mantener una única moneda principal, identificada por `FinancialProfile.currencyCode`, sin conversión automática.
- **Consecuencias:** Los cálculos del MVP se realizan únicamente en esa moneda.

## D-009 — Sin gestor externo de estado inicialmente

- **Estado:** Aceptada
- **Contexto:** El MVP no ha demostrado necesitar una biblioteca global de estado.
- **Decisión:** Empezar con estado de React, hooks y SQLite como fuente persistente.
- **Consecuencias:** Redux, Zustand u otro gestor externo requieren necesidad demostrada, autorización explícita y una nueva decisión.

## D-010 — Sin ORM inicialmente

- **Estado:** Aceptada
- **Contexto:** No se ha demostrado que un ORM aporte valor suficiente al alcance inicial.
- **Decisión:** No incorporar un ORM al implementar inicialmente SQLite.
- **Consecuencias:** Añadir uno posteriormente requiere justificar la dependencia, recibir autorización y registrar una decisión.

## D-011 — Sin backend, login o cloud obligatorio en el MVP

- **Estado:** Aceptada
- **Contexto:** La propuesta de valor permite gestionar manualmente las finanzas previstas sin credenciales ni servicios remotos.
- **Decisión:** El MVP será una aplicación Android local-first sin backend, login, cuentas de usuario ni sincronización cloud obligatoria.
- **Consecuencias:** Los datos residen en el dispositivo. Backup, sincronización, colaboración y resolución de conflictos quedan fuera del alcance inicial.

## D-012 — Migraciones SQLite desde la primera versión de base de datos

- **Estado:** Aceptada
- **Contexto:** La evolución segura del esquema requiere cambios ordenados y reproducibles.
- **Decisión:** Incorporar migraciones desde la primera versión de la base de datos SQLite.
- **Consecuencias:** Toda migración aplicada o publicada será inmutable; los cambios posteriores exigirán una migración nueva.

## D-013 — Recurrencias postergadas hasta Sprint 2

- **Estado:** Aceptada
- **Contexto:** El modelo inicial debe mantenerse mínimo y aún no se ha definido la semántica de recurrencia.
- **Decisión:** Mantener las recurrencias fuera del modelo inicial y diseñarlas antes de Sprint 2.
- **Consecuencias:** Cada movimiento futuro se representa individualmente hasta que una decisión posterior apruebe el modelo recurrente.

## D-014 — Organización por feature y capa de datos simple

- **Estado:** Aceptada
- **Contexto:** Se necesita separar presentación, reglas financieras y persistencia sin introducir complejidad innecesaria.
- **Decisión:** Usar organización orientada a features y una capa de datos simple, con dirección `UI → feature/domain logic → repository → SQLite`.
- **Consecuencias:** SQLite permanece como detalle de infraestructura detrás de repositories; las capas inferiores no importan UI ni rutas.

## D-015 — No crear carpetas arquitectónicas vacías

- **Estado:** Aceptada
- **Contexto:** La estructura anticipada sin implementaciones reales añade ruido y cristaliza abstracciones prematuras.
- **Decisión:** Crear carpetas fuera de `src/app` sólo cuando una necesidad concreta las requiera y priorizar, en orden, simplicidad, estabilidad, mantenibilidad y sofisticación.
- **Consecuencias:** No se crearán esqueletos arquitectónicos ni abstracciones «por si acaso», no se añadirán dependencias sin autorización y no se harán refactors amplios en tareas no relacionadas.

## D-016 — `Payment` representa ingresos y gastos

- **Estado:** Aceptada
- **Contexto:** Separar movimientos futuros por dirección duplica entidades y reglas sin aportar valor al MVP.
- **Decisión:** `Payment` representa tanto ingresos como gastos mediante `type = income | expense`.
- **Consecuencias:** Ambos tipos comparten campos y estados. No se crearán entidades persistentes separadas para ingresos y gastos sin una nueva decisión arquitectónica.

## D-017 — `FinancialProfile` contiene saldo y moneda principal

- **Estado:** Aceptada
- **Contexto:** El saldo disponible y la moneda principal forman la configuración financiera mínima del MVP.
- **Decisión:** `FinancialProfile` contiene `availableBalanceMinor`, `balanceDate` y `currencyCode`, además de identidad y auditoría técnica.
- **Consecuencias:** El saldo disponible no es una entidad independiente. Los cálculos proyectados se derivan del perfil y de los movimientos, y no se persisten como fuente de verdad.

## D-018 — Explicit deletion uses hard delete

- **Estado:** Aceptada
- **Contexto:** Cancelar un compromiso financiero y eliminar un registro incorrecto o que el usuario no desea conservar son acciones distintas.
- **Decisión:** El estado `cancelled` conserva el registro de un compromiso financiero que existió y fue cancelado. La eliminación explícita mediante `deletePayment()` elimina físicamente la fila (hard delete). No existe soft-delete en el MVP.
- **Consecuencias:** Un registro borrado no es recuperable desde la app. La restauración y undo quedan fuera de esta etapa.

## D-019 — Progreso cosmético local independiente

- **Estado:** Aceptada; autorizada por S1-HOME-V2.
- **Contexto:** Conservar la evolución de «Tu espacio» cuando los movimientos dejan de estar pendientes requiere estado persistente independiente del modelo financiero.
- **Decisión:** La migración forward-only `002_engagement` añade `engagement_progress` con una fila (`id = 1`) y `stage` entero entre 0 y 2. Los hitos son inicio, al menos un movimiento pendiente desde hoy, y gastos e ingresos pendientes representados simultáneamente desde hoy. Incluye fechas posteriores al horizonte de Home; no usa importes ni cantidades. Un UPDATE condicional sólo permite avanzar desde el repository.
- **Consecuencias:** No se modifica la migración 001 ni los campos financieros. Cancelaciones, eliminación, ausencia y cambios de saldo no reducen el progreso. La única sorpresa se emite al persistir por primera vez el estado 2; no necesita otro contador ni repetirse al abrir. Si ese mensaje no llega a mostrarse por un cierre, la escena igualmente queda conservada. Un fallo cosmético no bloquea los datos financieros. Se usan tres estados porque el MVP actual no justifica más hitos sin premiar volumen artificial.

## D-020 — Plan mensual independiente de la verdad financiera

- **Estado:** Aceptada; autorizada por PLAN-01.
- **Contexto:** La reserva personal y las asignaciones deben apoyar decisiones sin convertirse en compromisos contables ni alterar `Disponible real`.
- **Decisión:** La migración forward-only `004_spending_plan` agrega planes por mes civil y asignaciones opcionales. La reserva porcentual se fija en unidades menores al crearla o editarla explícitamente; `createdFromAvailableMinor` conserva el origen del plan. `Libre para usar` se limita a cero y el faltante de reserva se muestra por separado. Los porcentajes internos usan puntos base; los residuos de asignación se reparten por mayor resto y orden estable. La simulación es pura y no escribe datos.
- **Consecuencias:** No hay rollover automático. El plan y sus asignaciones se pueden eliminar sin tocar finanzas, progreso o personalización. El ritmo es una guía calculada con días civiles restantes, incluido hoy; se presenta diario hasta 14 días y semanal después.

## D-021 — Descubrimientos persistentes independientes

- **Estado:** Aceptada; autorizada por ACH-01.
- **Contexto:** Los hitos útiles deben sobrevivir cambios de saldo, apariencia y etapa, sin premiar riqueza ni volumen.
- **Decisión:** `005_achievements` agrega `achievement_unlocks` con ID único y fecha técnica. Siete hitos activos se definen en código; sólo se persiste el desbloqueo. La evaluación cosmética ocurre después de la acción primaria y sus fallos no revierten finanzas. Se derivan retrospectivamente movimiento pendiente o completado, resolución completada, reserva actual positiva y personalización no predeterminada. Simulación y resolución de vencidos requieren un evento nuevo comprobable; el cierre de período queda futuro.
- **Consecuencias:** La etapa de `Tu espacio` sigue independiente. Eliminar datos o cambiar apariencia no quita desbloqueos. Un fallo de persistencia cosmética se reintenta cuando vuelva a existir evidencia derivable.

## D-022 — Etapa 2 por hitos financieros distintos

- **Estado:** Aceptada; autorizada por PRE-BETA-SPACE-FIX-01. Sustituye el criterio de etapa 2 de D-019 y la independencia entre etapa y Descubrimientos indicada en D-021.
- **Contexto:** Exigir gasto e ingreso pendientes al mismo tiempo impedía alcanzar el escritorio a quienes organizan solo un tipo de movimiento, incluso después de otros hitos útiles.
- **Decisión:** La etapa 1 conserva el primer movimiento pendiente desde hoy. La etapa 2 se alcanza con al menos dos IDs distintos desbloqueados entre `FIRST_COMMITMENT`, `FIRST_EXPECTED_INCOME`, `FIRST_RESOLVED_MOVEMENT`, `FIRST_OVERDUE_RESOLVED`, `FIRST_RESERVE` y `FIRST_SPENDING_SIMULATION`. `FIRST_PERSONALIZED_SPACE` no cuenta. No se usan importes, cantidad de movimientos ni rachas.
- **Consecuencias:** La etapa sigue guardada en `engagement_progress` y solo puede avanzar. Los desbloqueos permanecen en su tabla; no hay migración ni cambio de finanzas. Al leer Home, Descubrimientos o Tu espacio se derivan los hitos que el estado actual permite reconstruir antes de actualizar la etapa.

## D-023 — Bienvenida inicial omitible y estado educativo local

- **Estado:** Aceptada; autorizada por ONB-02.
- **Contexto:** La primera experiencia debe explicar Disponible real sin añadir ejemplos a los datos reales. `HELP_SYSTEM.md` excluía ventanas automáticas.
- **Decisión:** Se permite una única bienvenida automática omitible para instalaciones sin perfil. La migración forward-only `011_onboarding` guarda estado educativo independiente y marca como `legacy` las instalaciones que ya tienen `financial_profile`. La configuración financiera existente sigue siendo necesaria aunque se omita el tutorial. La demostración usa sólo estado de React; Ayuda permite repetirla sin escribir estado histórico.
- **Consecuencias:** No cambian fórmulas, perfil, movimientos, planificación, logros ni personalización. No se introduce una regla general para ventanas automáticas, telemetría ni servicios externos.
