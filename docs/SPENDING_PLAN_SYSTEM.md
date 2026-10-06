# Mis Pagos — Spending Plan System

## Status
Product and architecture contract for the decision-support layer built on top of `Disponible real`.

This system does not replace the existing financial truth. It helps answer:

> ¿Qué puedo hacer con el dinero que realmente tengo libre sin comprometer lo que ya sé que viene?

## 1. Product thesis
Mis Pagos should not become another traditional expense tracker.

### Financial truth
> ¿Cuánto de mi dinero ya está comprometido y cuánto está realmente disponible?

### Spending plan
> ¿Qué parte de ese disponible quiero proteger, cómo quiero repartir el resto y qué efecto tendría gastar una cantidad hoy?

The product should remain useful even if the user does not categorize every transaction.

## 2. Three layers
### Reality
- current balance;
- committed pending expenses;
- expected income;
- Disponible real;
- Projection where applicable.

### Intention
- closing reserve;
- flexible amount;
- optional allocations.

### Decision
- safe spending pace;
- `¿Puedo gastar esto?` simulation;
- later, estimated period close.

## 3. Preserve the meaning of Disponible real
Never redefine `Disponible real`.

Use separate derived concepts:
- Disponible real;
- Reserva objetivo;
- Libre para usar.

Example:
- Current balance: 58,000
- Committed: 28,000
- Disponible real: 30,000
- Reserve target: 6,000
- Libre para usar: 24,000

## 4. Closing reserve
The user may define an amount to preserve at the end of the planning period.

Initial options:
- percentage of current Disponible real;
- fixed amount.

Suggested presets:
- 0%
- 10%
- 20%
- 30%
- custom

A percentage reserve must be converted into a concrete amount when the plan is created or reset.

Do not continuously recalculate the target from a shrinking balance.

Example:
- Disponible real at creation: 30,000
- Selected reserve: 20%
- Stored reserve target: 6,000

The 6,000 remains the target unless the user explicitly changes it.

## 5. Planning period
Initial model:
- current calendar month;
- closing date = final day of the month.

Future options may include custom payday cycles, fortnightly or weekly plans, but not before the monthly model is validated.

## 6. Libre para usar
Conceptually:

`Libre para usar = Disponible real - Reserva objetivo`

If Disponible real is below the reserve target, do not hide the shortfall.

Example:
- Disponible real: 4,000
- Reserva objetivo: 6,000
- Reserva shortfall: 2,000
- no positive flexible amount under the current plan.

`Libre para usar` is a planning interpretation, not a separate balance.

## 7. Allocations
The user may optionally divide `Libre para usar` into broad personal allocations.

Examples:
- Necesidades
- Disfrute
- Objetivos
- Comida
- Salidas
- Juegos
- Facultad
- Viajes
- Ahorro para PC
- Otros

These are planning buckets, not mandatory transaction categories.

Rules:
- optional;
- percentages total 100%;
- amounts derived from current flexible amount;
- changing percentages never modifies financial data;
- allocations are guidance, not accounting commitments.

Do not require every real purchase to be categorized later.

## 8. Safe spending pace
Translate flexible money into a time-based reference.

Basic concept:

`safe pace = Libre para usar / remaining days in period`

Possible UI:
- `≈ $1.200 por día`
- `≈ $8.400 por semana`

This is guidance, not permission or prohibition.

Preferred language:
- `Podés usar aproximadamente...`
- `Tu ritmo de referencia es...`
- `Si querés llegar a tu reserva...`

Avoid:
- `Debés gastar...`
- `Tenés permitido...`
- `No podés gastar...`

## 9. ¿Puedo gastar esto?
Core decision-support feature.

The user enters a hypothetical amount. The app simulates consequences without changing any stored financial state.

### Case A — within flexible amount
Explain:
- remaining flexible amount;
- reserve preserved;
- updated safe pace.

### Case B — uses reserve but known commitments remain covered
Explain:
- known commitments still covered;
- reserve target partially/fully consumed;
- exact reserve shortfall.

### Case C — exceeds Disponible real
Explain calmly:
- amount exceeding current real availability;
- known commitments would no longer be fully covered.

The system explains consequences; it does not forbid spending.

## 10. Simulation rules
A simulation must be:
- deterministic;
- side-effect free;
- based on current financial truth;
- based on current planning settings;
- easy to discard.

It must not:
- create a Payment;
- update balance;
- modify reserve;
- modify allocations;
- affect engagement progress.

## 11. Estimated period close — future
A later version may estimate:

> A este ritmo terminarías el mes con aproximadamente $7.400.

Then compare against the reserve target.

Possible interpretations:
- `Vas camino a cumplir tu reserva.`
- `A este ritmo quedarías aproximadamente $1.800 por debajo de tu reserva.`

This should only appear when enough reliable data exists.

## 12. Balance snapshots — future
Estimated close may later use:
- periodic balance snapshots;
- known completed/pending Payments;
- expected income;
- elapsed time.

It must remain an estimate and must never pretend the app knows exactly where money went.

## 13. Home integration
Do not turn Home into a dense budget dashboard.

Recommended hierarchy:
1. Disponible real;
2. reserve summary;
3. Libre para usar;
4. one simple pace interpretation;
5. `¿Puedo gastar esto?` action;
6. upcoming movements;
7. `Tu espacio`.

Allocations may live in a secondary planning screen.

## 14. Suggested Home summary
Example:

Disponible real
$30.000

Reserva de cierre
20% · $6.000

Libre para usar
$24.000

Ritmo de referencia
≈ $1.200 por día hasta el 31 oct.

[ ¿Puedo gastar esto? ]

## 15. Persistence concepts
Possible future entities:

### SpendingPlan
- id
- periodStart
- periodEnd
- reserveMode
- reservePercent
- reserveTargetMinor
- createdFromAvailableMinor
- createdAt
- updatedAt

### SpendingAllocation
- id
- spendingPlanId
- name
- exact percentage representation
- sortOrder

Exact schema belongs to implementation design.

Use forward-only migrations.

## 16. Exact arithmetic
- money remains integer minor units;
- percentages use deterministic exact arithmetic;
- avoid binary floating-point for financial results;
- rounding rules must be explicit and tested.

## 17. Reserve modification
Changing reserve must show the consequence before saving.

Example:
- current reserve: 6,000
- new reserve: 9,000
- Libre para usar changes from 24,000 to 21,000

Changing reserve never alters balance or Payment data.

## 18. Negative states
If Disponible real is negative:
- keep the true value visible;
- do not show fake positive flexible money;
- do not congratulate the situation;
- do not damage `Tu espacio`.

Possible message:

> Tus compromisos conocidos superan tu saldo actual. Tu plan de reserva queda en pausa hasta recuperar margen.

## 19. Local-first requirement
The planning system must work fully offline.

No network is required for:
- reserve;
- allocations;
- safe pace;
- simulations;
- period calculations.

## 20. No AI dependency
The first version does not need AI.

Initial behavior should be deterministic.

Do not introduce an LLM merely to phrase consequences.

## 21. Initial implementation scope — PLAN-01
Required:
- monthly planning period;
- reserve target;
- derived Libre para usar;
- optional allocation percentages;
- safe spending pace;
- `¿Puedo gastar esto?` simulation;
- local persistence;
- calm Home summary;
- exact arithmetic;
- no change to existing financial formulas.

Not required yet:
- estimated period close;
- automatic spending inference;
- historical plan analytics;
- balance-snapshot trend estimation;
- transaction categorization;
- bank connections;
- AI.

## 22. Future implementation — PLAN-02
Potential later layer:
- periodic balance snapshots;
- estimated period close;
- reserve-target comparison;
- historical period outcomes;
- lightweight trend interpretation.

Only after PLAN-01 is validated.

## 23. Achievement compatibility
Valid future milestones may include:
- first reserve created;
- first plan configured;
- first spending simulation;
- first period reaching the user's own reserve;
- first period with known commitments fully planned.

Do not reward higher wealth, higher income or higher spending.

## 24. Success criteria
The user should be able to answer quickly:
- How much is truly available?
- How much do I want to preserve?
- How much is flexible?
- What pace keeps me near that goal?
- What happens if I spend X today?

## 25. Product guardrails
Never:
- redefine Disponible real;
- hide known commitments;
- shrink reserve automatically as the user spends;
- force transaction categorization;
- shame the user for exceeding a target;
- treat allocation targets as accounting truth;
- prohibit spending;
- pretend estimates are certain;
- use planning goals to damage engagement progress;
- create artificial urgency.

## 26. Product test
Any planning feature must pass:
1. Does it help a real decision today?
2. Is financial truth still visible?
3. Is the user's target separate from accounting reality?
4. Can the consequence be understood without budgeting jargon?
5. Does it avoid exhaustive tracking?
6. Does it preserve autonomy?
7. Can it work offline?
8. Is the value greater than the maintenance burden?

If not, do not ship it.
