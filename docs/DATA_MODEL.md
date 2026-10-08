# Modelo de datos inicial

## Propósito y estado

Este documento define el modelo conceptual mínimo del MVP, implementado en tipos de dominio y tablas SQLite. El esquema SQL se define en las migraciones, conservando estas reglas e invariantes.

## Convenciones comunes

### Identidad

Cada registro persistente tiene un identificador local estable `id`. `FinancialProfile` usa el identificador fijo `1`; SQLite genera el identificador entero de cada `Payment` al insertarlo.

### Dinero

- `amountMinor` es un entero expresado en la unidad menor de la moneda.
- `Payment.amountMinor` es siempre positivo; la dirección del dinero depende de `Payment.type`, no del signo.
- `currencyCode` identifica la moneda de forma explícita.
- No se realizan sumas entre monedas diferentes ni conversión automática.

### Fechas

- Las fechas financieras usan `YYYY-MM-DD` y representan un día civil.
- `createdAt` y `updatedAt` usan timestamps ISO en UTC.

## Entidades iniciales

### Perfil financiero (`FinancialProfile`)

Representa la configuración financiera principal y el saldo que el usuario declara disponible actualmente. Existe un único perfil financiero y una única moneda principal en el MVP.

| Campo | Tipo conceptual | Regla |
| --- | --- | --- |
| `id` | identificador | estable y único localmente |
| `currencyCode` | texto | moneda explícita |
| `availableBalanceMinor` | entero | saldo disponible en unidades monetarias menores; nunca float |
| `balanceDate` | fecha civil | día al que corresponde el saldo |
| `createdAt` | instante UTC | auditoría técnica |
| `updatedAt` | instante UTC | auditoría técnica |

No se realiza conversión automática de monedas. `saveFinancialProfile()` crea o actualiza el único perfil mediante upsert, sin conservar un historial de versiones.

### Pago futuro (`Payment`)

Representa cualquier movimiento financiero futuro ingresado manualmente, tanto un gasto como un ingreso.

| Campo | Tipo conceptual | Regla |
| --- | --- | --- |
| `id` | identificador | estable y único localmente |
| `type` | tipo | `expense` o `income` |
| `title` | texto | descripción visible, obligatoria |
| `amountMinor` | entero | mayor que cero; nunca float |
| `dueDate` | fecha civil | vencimiento elegido por el usuario |
| `status` | estado | `pending`, `completed` o `cancelled` |
| `notes` | texto opcional | información libre del usuario |
| `createdAt` | instante UTC | auditoría técnica |
| `updatedAt` | instante UTC | auditoría técnica |

La UI puede presentar un movimiento `expense` con estado `completed` como «Pagado» y uno `income` con estado `completed` como «Cobrado». El dominio conserva en ambos casos el único estado interno `completed`.

Una recurrencia o un plan de cuotas no forma parte de este registro inicial: cada movimiento futuro se representa como un pago concreto hasta que el diseño de recurrencias se defina antes de Sprint 2.

## Derivaciones, no entidades

Los siguientes valores se calculan y no deben persistirse como fuente de verdad en el modelo inicial:

- **total comprometido:** suma de `Payment.amountMinor` con `type = expense` y `status = pending` dentro del horizonte futuro consultado;
- **total de ingresos previstos:** suma de `Payment.amountMinor` con `type = income` y `status = pending` dentro del horizonte futuro consultado;
- **disponible proyectado:** `FinancialProfile.availableBalanceMinor` + ingresos futuros pendientes − gastos futuros pendientes.

El horizonte temporal y la inclusión exacta de los límites deberán ser explícitos en la funcionalidad que implemente el cálculo.

## Relaciones y eliminaciones

`FinancialProfile` establece la moneda principal aplicable a los movimientos del MVP. No se definen cuentas bancarias, usuarios ni relaciones remotas. Según D-018, `deletePayment()` elimina físicamente el registro (hard delete), mientras que el estado `cancelled` lo conserva. No existe soft-delete en el MVP.

## Capa de planificación mensual (PLAN-01)

La migración `004_spending_plan` agrega `spending_plans` y `spending_allocations`, independientes de `FinancialProfile`, `Payment`, progreso e identidad visual. Cada plan cubre un mes civil y `period_start` es único. No se crea un plan por defecto ni se heredan planes al mes siguiente.

`SpendingPlan` guarda `periodStart`, `periodEnd`, `reserveMode` (`percentage` o `fixed`), `reservePercentBasisPoints` opcional, `reserveTargetMinor`, `createdFromAvailableMinor`, `createdAt` y `updatedAt`. El origen financiero se fija al crear el plan. Una reserva porcentual se convierte a unidades menores al crear o editar explícitamente la reserva; las modificaciones financieras o de asignaciones no reducen ese objetivo.

`SpendingAllocation` guarda `spendingPlanId`, nombre, `percentageBasisPoints`, orden y timestamps. Su FK usa `ON DELETE CASCADE`: eliminar un plan borra sólo sus asignaciones. Las asignaciones son opcionales y, si existen, suman exactamente 10.000 puntos base. Los importes de cada asignación se derivan del `Libre para usar` actual; no se persisten ni clasifican `Payment`.

`Libre para usar`, faltante de reserva, ritmo de referencia y simulación son cálculos del dominio, no saldos persistidos. `Disponible real` mantiene su fórmula previa.

## Descubrimientos (ACH-01)

La migración `005_achievements` agrega `achievement_unlocks`, independiente de
finanzas, plan, progreso y personalización. Sólo guarda `achievement_id` (clave
primaria) y `unlocked_at` (instante ISO UTC). Título, descripción, visibilidad y
orden viven en un registro estático. `INSERT OR IGNORE` hace idempotente el
desbloqueo; no hay importes ni relaciones con `Payment`.

## Fuera del modelo inicial

- usuarios y autenticación;
- cuentas bancarias o credenciales;
- movimientos descargados;
- sincronización y conflictos cloud;
- tipos de cambio;
- recurrencias automáticas, cuyo diseño se posterga hasta antes de Sprint 2;
- adjuntos;
- categorías personalizables complejas;
- analytics o agregados persistidos.
