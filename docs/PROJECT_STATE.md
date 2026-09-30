# Mis Pagos — Current Project State

## Product

Android local-first app initially focused on Latin America.

Core promise:

Show how much money the user has,
how much is committed,
and how much is truly available.

The app is not a bank and does not connect to financial institutions.

## Stack

- React Native
- Expo SDK 57
- TypeScript strict
- Expo Router
- SQLite through `expo-sqlite`
- npm
- Node.js 22 LTS

## Architecture

`UI → feature/domain logic → repository → SQLite`

`SQLiteProvider` owns the database connection.

State uses React state and hooks, with SQLite as the persistent source.

`src/app` is reserved for routes, layouts and associated navigation.

Do not introduce without explicit authorization:

- backend;
- authentication;
- cloud sync;
- ORM;
- Redux/Zustand;
- banking integration;
- AI.

Settled architecture remains documented in `ARCHITECTURE.md` and `DECISIONS.md`.

## Persistent financial model

### FinancialProfile

- id = 1
- currencyCode
- availableBalanceMinor
- balanceDate
- createdAt
- updatedAt

### Payment

- id
- type: expense | income
- title
- amountMinor
- dueDate
- status: pending | completed | cancelled
- notes
- createdAt
- updatedAt

One main currency in the MVP.

Income and expenses are not separate persistent entities.

## Money and dates

Persist money as integer minor units, never floats.

Financial civil dates use:

`YYYY-MM-DD`

Technical timestamps use ISO UTC.

Do not convert civil financial dates through UTC in ways that change the selected day.

## Database and repositories

Database:

`mis-pagos.db`

Current financial tables:

- `financial_profile`
- `payments`

Independent cosmetic table: `engagement_progress` (singleton `stage`, 0–2).
Schema version 2 adds it through `002_engagement`; migration 001 is unchanged.

Migrations use `PRAGMA user_version`.

Published/applied migrations are immutable.

Payment repository includes:

- createPayment
- getPaymentById
- listPayments
- updatePayment
- deletePayment

FinancialProfile repository includes:

- getFinancialProfile
- saveFinancialProfile

Explicit deletion is hard delete.

`cancelled` preserves the Payment record.

`paymentLifecycle` composes existing repositories inside exclusive SQLite
transactions for pending-only edits/cancellation, completion with optional
balance reconciliation, manual balance updates and coherent financial reads.
No new schema or dependency is required by S2-MOVEMENTS.

## Completed foundation

Sprint 0: COMPLETE.

Includes:

- Expo foundation;
- SQLite initialization;
- migrations;
- domain models;
- repositories;
- native persistence validation;
- financial setup;
- Android QA.

## Current implemented product

Payment creation: COMPLETE.

Current user flow:

no FinancialProfile
→ financial setup
→ save profile
→ Home

existing FinancialProfile
→ Home

Home
→ Agregar movimiento
→ create expense/income
→ return to refreshed Home

New Payments persist as `pending`.

Creating a future movement does not directly modify the current FinancialProfile balance.

## Full movement lifecycle

S2-MOVEMENTS: COMPLETE.

- `/payments`: pending groups and completed/cancelled history, ordered by date;
- `/payments/[id]`: detail, shared-form pending edits, cancellation and hard delete;
- completion explicitly offers a balance adjustment or “Ya está reflejado”;
- status and any selected balance adjustment commit or roll back together;
- `/balance`: exact manual balance input, including zero and negative values;
- Home links to management, surfaces overdue review and reloads a consistent
  balance/movements snapshot on focus, app activation and civil-date refresh.

Completed/cancelled records are read-only except for deletion. Cancellation and
deletion never adjust the balance. No reopening, schema changes or migration 003.
Existing engagement rules and visuals remain intact; the optional first-completion
milestone is deferred.

Validation: 21 automated tests, including all eight previous Home/engagement
tests and SQLite rollback/duplicate-resolution coverage. Typecheck, lint and
diff checks pass. Android emulator QA covers navigation, both edits, cancellation,
deletion, all four reconciliation choices, overdue calculations, negative/zero/
positive manual balances, history, Home refresh and full restart persistence.
Original financial and engagement data was restored after QA.

## Core Home implementation

S1-HOME: COMPLETE.

Implemented:

- real Payment loading;
- current balance;
- committed pending expenses;
- expected pending income;
- Disponible real;
- Projection;
- next-30-days horizon;
- 30-day boundary inclusive;
- upcoming pending movements;
- human relative timing;
- empty state;
- negative Disponible real state;
- refresh after movement creation;
- restart persistence.

Current financial formulas, overdue treatment and inclusive horizon boundaries
are defined in `HOME_UX.md`. Future expected income is not included in
Disponible real; only relevant pending movements participate in calculations.

## Current product-design direction

S1-HOME-V2: implemented. Disponible real dominates a dark-green hero, with
current balance minus commitments beneath it. Projection appears only when
expected income adds information. The nearest five movements use dates,
signed amounts and relative timing; the compact Add Movement CTA stays in-flow.

Deterministic messages distinguish no planned commitments, covered commitments
and a shortfall (with its amount). Successful creation returns to refreshed
Home with an inline, dismissible confirmation and the updated available amount.
S1-HOME-V2 preserved the formulas and inclusive 30-day horizon; S2-MOVEMENTS
adds the overdue treatment specified in `HOME_UX.md`.

Validation: eight automated tests (five existing Home tests plus feedback,
milestone and SQLite migration/non-regression coverage), typecheck and lint pass.
Android API 35 QA covers empty, expense-only, income-only, mixed and shortfall
states, creation feedback, all three scene states, restart persistence and
financial independence, including cosmetic write failure. Original emulator
data was restored after QA.

Home direction:

- make Disponible real the strongest visual answer;
- reduce redundant information;
- visually explain current money vs committed money;
- show Projection with stronger emphasis only when it adds useful information;
- make upcoming movements more human and scannable;
- preserve the existing settled calculations;
- keep the Home warm, modern, simple and non-banking.

Detailed Home behavior lives in:

`docs/HOME_UX.md`

## Engagement system direction

A product engagement layer has been approved.

MVP v0 is implemented as a compact, secondary “Tu espacio” scene made with
React Native primitives. Three persistent states: window; plant after the first
pending movement from today onward; table/books when pending expenses and
income are both represented. These signals include dates beyond Home's horizon.
Progress never decreases and does not use amounts or transaction counts.
One surprise message accompanies the first transition to the final state.
Cosmetic persistence failures leave the financial summary usable and offer retry.
Persistence rationale and exact milestone rules: D-019 in `DECISIONS.md`.

Its purpose is to make financial organization feel:

- rewarding;
- reassuring;
- warm;
- worth returning to.

Primary emotional target:

**relief and control**

supported by:

- curiosity;
- ownership;
- gentle visual progress.

The central metaphor is a persistent living personal space that evolves through useful financial organization.

Core constraints:

- progress never regresses because of absence;
- never reward spending;
- never reward artificial transaction quantity;
- no punitive streaks;
- no guilt-based pet/plant mechanics;
- no financial anxiety used for retention;
- no pay-to-win progress;
- no advertising interrupting success/relief moments;
- negative financial situations never damage the space;
- the user may ignore the engagement layer without losing core financial value.

Detailed contract:

`docs/ENGAGEMENT_SYSTEM.md`

## Roadmap direction

Development now prioritizes:

1. highest expected product impact;
2. lowest reasonable implementation cost;
3. coherent functional iterations;
4. validation before expensive expansion.

Next product direction:

- validate repeated use of movement management;
- recurrence;
- reminders;
- engagement expansion;
- polish;
- launch preparation.

Detailed roadmap:

`docs/PRODUCT_ROADMAP.md`

## Product principles

Priority:

simplicity
→ stability
→ maintainability
→ sophistication

The product should answer quickly:

> How much of my money is committed, and how much can I really use?

New features do not automatically earn a place on Home.

The product should optimize for recurring usefulness, not maximum time spent inside the app.

## Execution strategy

Prefer larger coherent feature iterations now that the foundation is stable.

Do not split a feature into microtasks unless risk justifies it.

Use high reasoning for substantial or important iterations.

Keep routine tasks small and inexpensive.

Use:

- `AGENTS.md` for permanent repository rules;
- `docs/PROJECT_STATE.md` for compact current state;
- specific product contracts such as `HOME_UX.md` and `ENGAGEMENT_SYSTEM.md` only when the task needs them;
- direct task prompts for the current implementation work.

Do not make Codex re-read the entire documentation set by default.
