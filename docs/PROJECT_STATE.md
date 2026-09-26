# Mis Pagos — Current Project State

## Product

Android local-first app initially focused on Latin America.
Core promise: show how much money the user has, how much is committed,
and how much is truly available.
The app is not a bank and does not connect to financial institutions.

## Stack

- React Native, Expo SDK 57, TypeScript strict, Expo Router.
- SQLite through `expo-sqlite` (declared range `~57.0.3`).
- npm and Node.js 22 LTS.

## Architecture

`UI → feature/domain logic → repository → SQLite`.
`SQLiteProvider` owns the database connection; UI never executes SQL.
State uses React state and hooks, with SQLite as the persistent source.
`src/app` is reserved for routes, layouts and associated navigation.
Do not introduce backend, authentication, cloud sync, ORM, Redux/Zustand,
banking integration or AI without explicit authorization.
Settled contracts: [ARCHITECTURE.md](ARCHITECTURE.md) and [DECISIONS.md](DECISIONS.md).

## Persistent model

- `FinancialProfile`: `id = 1`, `currencyCode`, `availableBalanceMinor`,
  `balanceDate`, `createdAt`, `updatedAt`.
- `Payment`: `id`, `type: expense | income`, `title`, `amountMinor`,
  `dueDate`, `status: pending | completed | cancelled`, optional `notes`,
  `createdAt`, `updatedAt`.

One main currency in the MVP; no automatic currency conversion.
Income and expenses are not separate persistent entities.
Details and invariants: [DATA_MODEL.md](DATA_MODEL.md).

## Money and dates

Persist money as integer minor units, never floats; `Payment.amountMinor > 0`.
For two-decimal currencies: `10.99 → 1099`; `30000 UYU → 3000000`.
Financial civil dates use `YYYY-MM-DD`; technical timestamps use ISO UTC.
Do not convert civil financial dates through UTC in ways that change the day.

## Database and repositories

- Database: `mis-pagos.db`; schema version: `1`.
- Tables: `financial_profile`, `payments`.
- Migrations use `PRAGMA user_version`; applied/published migrations are immutable.
- Payment API: `createPayment`, `getPaymentById`, `listPayments`,
  `updatePayment`, `deletePayment`.
- Explicit deletion is hard delete; `cancelled` preserves the record.
- FinancialProfile API: `getFinancialProfile`, `saveFinancialProfile`.
- Profile saves upsert the singleton with `id = 1`.

## Completed and current behavior

Sprint 0: COMPLETE. Foundation includes Expo, SQLite initialization,
migrations, domain models, repositories and SQL parameter binding.
Android persistence across restart was validated in the foundation audit.
S1-T01: COMPLETE — financial setup and empty Home state.
Payment creation is also implemented (`40d6fe6`).

- No profile → financial setup → save profile → Home.
- Existing profile → Home.
- Home → Agregar movimiento → save expense/income → Home confirmation.
- New payments persist as `pending`; creation does not change the current balance.
- Home currently shows the profile balance and a static empty movements state;
  it does not yet list saved movements or calculate financial summaries.

## Current Sprint

Sprint 1 — Core product experience, in progress.
Next work: Home with real movements and core financial calculations.
Payment creation is complete, not an upcoming feature.
README's statement that Sprint 1 has not started predates these implementations.

## Home product direction (pending implementation)

Primary concept: **Disponible real**.
`Disponible real = current available balance − pending expenses in the active horizon`.
Do not include expected future income in Disponible real.
`Projection = current available balance − pending expenses + pending income`.
Use the same active horizon for the pending amounts in these summaries.
Initial MVP horizon: next 30 days; exact boundary inclusion must be explicit
in the task implementing the calculation, as required by DATA_MODEL.md.

Home hierarchy:

1. Disponible real
2. Hoy tenés
3. Comprometido
4. Ingresos previstos
5. Proyección
6. Próximos movimientos
7. Agregar movimiento

Home should feel simple, warm, modern and non-banking; avoid dashboard overload.

## Product principles and execution

Priority: simplicity → stability → maintainability → sophistication.
Answer quickly: “How much of my money is committed, and how much can I really use?”
Full product scope: [PRODUCT.md](PRODUCT.md).
Prefer larger coherent feature iterations now that the foundation is stable.
Do not split a feature into microtasks unless risk justifies it.
Use high reasoning only for substantial or important iterations;
keep routine tasks small and inexpensive.
