# Mis Pagos — Current Project State

## Product

Android local-first app initially focused on Latin America.

Core promise:

Show how much money the user has,
how much is committed,
and how much is truly available.

The app is not a bank and does not connect to financial institutions.

## SPACE-02 + ACH-02 — Tu espacio editable

El esquema actual es v6 (`006_space_customization`). `/space` muestra la misma escena 4:3 que Home en tamaño mayor y permite anular zonas decorativas mediante Automático, objeto o Vacío. La planta y el escritorio con libros siguen siendo anclas de etapa; `deskLeft` agrega una capa decorativa junto a los libros. Paleta de habitación y ambiente de ventana se guardan aparte de las preferencias generales. Las siete recompensas se derivan de `achievement_unlocks`, incluso para usuarios previos; cada Descubrimiento explica su hito y el control que habilita. Ver `docs/SPACE_CUSTOMIZATION_SYSTEM.md`.

Validación local: 55 pruebas automatizadas, typecheck, lint y diff check. Android API 35 en Expo Go cubrió la navegación, editor, estados manuales, duplicados, los siete Descubrimientos, paleta separada del tema de la app, ambiente, reinicio y 360×640 dp. El movimiento vencido temporal se canceló y eliminó; su Descubrimiento persistente quedó desbloqueado como corresponde. Se restauraron interés, tema, decoración automática, paleta y ambiente originales. Esta evidencia no equivale a una APK autónoma ni a un dispositivo físico.

## HELP-01 — Ayuda permanente

`/help` ofrece cinco categorías y un glosario local, accesibles desde el `?` discreto de Home después del alta financiera. El registro centralizado contiene temas con IDs estables; Disponible real, Proyección, Reserva objetivo, Libre para usar, Ritmo de referencia, Tu espacio y Descubrimientos tienen acceso contextual con explicación breve y **Ver más**. No hay persistencia, dependencia nueva ni cambios en cálculos financieros. El contrato vigente está en `docs/HELP_SYSTEM.md`.

Validación HELP-01: 50 pruebas automatizadas (46 previas y cuatro nuevas), typecheck, lint y `git diff --check` pasan. En Android API 35 Expo Go se comprobaron entrada global, cinco categorías, glosario, navegación contextual de Disponible real, Reserva, Libre para usar, Ritmo, Tu espacio y Descubrimientos, vista de 360×640 dp y uso del contenido ya cargado con Wi-Fi y datos apagados. El saldo visible y Disponible real siguieron iguales tras reiniciar Expo Go. Los ocho temas superan la prueba de contraste de texto; Océano y las vistas previas de Peonía/Ciruela se inspeccionaron visualmente. No es evidencia de APK autónoma sin conexión ni de cada tema abierto dentro de Ayuda.

## VIS-01 — Modular Tu espacio renderer

The implementation replaces the production primitive drawing with an image-based
1448×1086 room, normalized wall/floor/window masks, a static asset and slot
registry, deterministic stage/interest/achievement composition, and a development
calibration route. Bosque, Océano, Lavanda, Terracota, Noche and Arena remain;
Peonía and Ciruela are added. The 17 canonical source images remain untouched.
Sixteen production derivatives total 2,836,895 bytes, including the cleaned
transparent cat. The approved master is used only as a separate development
calibration derivative. No dependency, persistence, engagement rule or financial
formula changed.

The 46 current tests, including four focused scene tests, pass, as do typecheck,
lint and Android Metro export. Six static compositions were inspected alongside
the master and corrected for desk support and foreground order. Android API 35
Expo Go QA loaded through the LAN Metro address after the localhost connection
failed. It covered stages 0/1/2, six profile compositions, masks, the DEV master
overlay, achievement details, a cold restart and a 360×640 dp viewport. The
temporary QA income was deleted and the original preferences restored. The
emulator's engagement stage remains 2 because progression does not regress.

## ACH-01 — Meaningful discoveries

Implemented in schema v5 (`005_achievements`): seven fixed, non-regressing
discoveries stored as independent `achievement_unlocks` rows. Home's `Tu espacio`
shows a small count and links to `/achievements`. Financial actions, a positive
reserve, an explicit valid simulation and a saved non-default appearance can each
unlock one milestone. Cosmetic writes occur after primary writes, so their failure
cannot roll back financial truth. Existing persistent movements, a current positive
reserve and non-default preferences are derived on safe evaluation. Historical
overdue resolution and simulations are never inferred. Period-close success remains
future-only.

Android API 35 Expo Go QA on `emulator-5554` observed the v4 data and stage after
migration, three retroactive discoveries, a new reserve and valid simulation
unlock, no repeated simulation announcement, locked/mystery entries, entry from
`Tu espacio`, a cold Expo Go restart with five unlocks, a 360×640 dp viewport,
and five unlocks retained while `Disponible real` was negative and after a
Noche → Bosque → Noche theme change. With Wi-Fi and
mobile data disabled, the already loaded Home still showed the count; Metro
remained connected over ADB reverse, so this is not standalone offline proof.
The temporary plan and movement were removed, the original available amount,
theme selection and viewport returned, and networking was restored. This is emulator-only development
build evidence, not a standalone APK upgrade or physical-device test.

## Private Android Alpha 0.2 (PREVIEW-02)

Current release: Mis Pagos `0.2.0`, Android `versionCode: 2`, package
`com.diegomarin.mispagos`. EAS `preview` build
`f031a929-48ef-44ff-b597-99e48fe94fff` is **FINISHED**.
[Build / install](https://expo.dev/accounts/daegon13/projects/mis-pagos/builds/f031a929-48ef-44ff-b597-99e48fe94fff).
The universal APK is `110,430,306` bytes (`110.43 MB`, `105.31 MiB`),
`30,440` bytes (`0.029 MiB`, `0.0276%`) above Alpha 0.1. It still contains
four ABIs; there is no material size regression.

On Android API 35, Alpha 0.1 with UYU `1,234.56` balance, two pending movements,
one completed movement, one cancelled movement and the fully evolved `Tu espacio`
was updated in place using `adb install -r`. Android retained the first install
time and accepted the same package/signing certificate. Alpha 0.2 opened Home
without setup; balance, currency, movement amounts/dates/statuses, Disponible real
and the evolved space survived. The v2→v3 migration created Bosque/Natural/empty
interest defaults. The automated migration test also checks the unchanged
FinancialProfile row, including `balanceDate`; the release APK does not expose
that database field directly for inspection.

Standalone QA verified theme/interests/atmosphere/name persistence, rejection of a
fourth interest, and distinct Bosque/Naturaleza/Hogar and
Noche/Gaming/Música/Tecnología scenes. Financial smoke QA covered movement creation,
pending edit, completion, cancellation, hard delete, balance update, native date
picker, natural money input and overdue handling. A force-stop/relaunch passed
with Metro absent, Expo Go stopped and emulator networking disabled. The temporary
regression movements were deleted and the test balance restored. No physical
device was available for this validation. Tester guidance: `ALPHA_TESTING.md`.

## Private Android Alpha 0.1 (PREVIEW-01)

Mis Pagos 0.1 Alpha preview configuration is ready for private dogfooding and
alpha testers. Permanent Android package: `com.diegomarin.mispagos`.
Alpha 0.1 version: `0.1.0`; Android `versionCode`: `1`. Increment versionCode
for every future Android build. EAS uses local app versioning.

EAS project: `@daegon13/mis-pagos`. `preview` produces an internal release APK;
`production` is prepared for a future AAB. No store submission or iOS build.
Preview APK build `ae90dec6-0011-4e77-9376-2b4946fe3838`: **FINISHED**.
[Build / install](https://expo.dev/accounts/daegon13/projects/mis-pagos/builds/ae90dec6-0011-4e77-9376-2b4946fe3838).
Existing Expo template icon/adaptive icon/splash assets are retained for this alpha.

Validation (2026-10-01): 26 automated tests, typecheck, lint and diff check pass.
Fresh APK installation on Android API 35 emulator passed setup/currency,
natural money input, native dates, expense/income creation, available/projection
calculations, overdue expense/income behavior, pending edits, cancellation,
hard delete, explicit expense deduction/income addition and manual balance.
Force-stop/relaunch preserved profile, pending/completed/cancelled movements
and Tu espacio's window/plant/table/books state. Metro was stopped and Expo Go
force-stopped throughout APK QA. No physical device was connected; physical
dogfooding remains next. Only this fresh APK's QA data was cleared afterward.
Tester guidance: `ALPHA_TESTING.md`. APKs and signing credentials stay out of Git.

## Alpha dogfooding findings (2026-10-02)

The first real APK is being tested outside the development loop.

Observed product issues:

- the direct-install APK felt too large for the product;
- principal-currency selection is too rigid after setup;
- the product does not yet support informational reference currencies;
- `Tu espacio` was directionally positive but initially too generic/basic to strongly differentiate Mis Pagos;
- visual personalization and user interests appeared promising for product identity;
- the product needed a stronger functional reason to exist beyond being a polished agenda.

### SIZE-01 — COMPLETE

The exact PREVIEW-01 artifact was audited.

Measured universal APK:

- `110,399,866` bytes;
- `110.40 MB`;
- `105.29 MiB`;
- four Android ABIs.

Main composition:

- native `lib/`: about `88.55 MB`, approximately 80.2% of the APK;
- DEX: about `15.63 MB` compressed;
- JS bundle: `2,320,964` bytes, about `2.21 MiB` / 2.1%;
- `resources.arsc`: about `1.66 MB`;
- `res/`: about `1.15 MB`;
- source visual assets: about `1.41 MB`.

The three ABIs other than `arm64-v8a` account for about `62.25 MiB` combined.
The large direct-install APK is therefore dominated by native multi-ABI packaging,
not by Mis Pagos visual/product content.

An equivalent single-ABI APK was estimated from the artifact at roughly 36–44 MiB,
depending on architecture. This is an estimate, not a measured build.

The production profile is already configured for AAB, so future Play delivery can use
device-specific splits.

Decision:

- do not block product work because of the current universal APK size;
- do not remove React Native, Hermes, SQLite or `@expo/ui` for speculative savings;
- keep asset growth disciplined;
- use `docs/APK_SIZE_AUDIT.md` as the size baseline.

### PERS-01 — COMPLETE

Personalization is now implemented:

- six curated semantic themes;
- Bosque default;
- up to three optional interests;
- five atmospheres;
- optional custom space name;
- dedicated `/personalize` route;
- modular `Tu espacio` composition;
- local SQLite persistence;
- forward-only `003_personalization` migration;
- financial data and engagement milestone rules unchanged.

Validation:

- 31 automated tests pass;
- typecheck, lint and diff checks pass;
- Android QA covered all themes, all atmospheres, three materially distinct profiles,
  negative Disponible real, cold restart and a 360×640 dp viewport;
- no new dependency;
- no new visual asset bytes.

The standalone Alpha 0.1 → Alpha 0.2 APK update passed real artifact-level
upgrade QA in PREVIEW-02.

### New product learning

The strongest emerging product thesis is not “a better financial agenda”.

Mis Pagos should help the user move from:

> “¿Cuánto tengo?”

to:

> “¿Cuánto realmente puedo usar y qué pasa si gasto X hoy?”

That direction is captured in:

- `docs/PRODUCT_THESIS.md`;
- `docs/SPENDING_PLAN_SYSTEM.md`;
- `docs/ACHIEVEMENT_SYSTEM.md`.

Current response:

1. validate `PLAN-01` through repeated use;
2. validate the implemented `ACH-01` discovery layer in continued use;
3. implement `FX-01`;
4. run Dogfooding V2;
5. return to recurrence/reminders after these hypotheses are tested.

---

## Stack

### PLAN-01 implementation

The first monthly spending-plan layer is implemented through forward-only schema v4 (`004_spending_plan`). It adds an independent frozen reserve target, optional allocations, `Libre para usar`, inclusive civil-day reference pace, and a pure three-outcome spending simulation. Home keeps the canonical `Disponible real` formula and adds a compact plan section. Plans do not roll over automatically; no default plan is created. Automated validation covers v3→v4, fresh v4, preservation of financial/engagement/personalization rows, exact arithmetic and side-effect-free simulation. Android API 35 Expo Go QA covered creation, fixed-reserve editing, 100% allocations, all three simulation states, restart persistence, negative Disponible real, plan removal, a 360×640 dp viewport, offline creation and the existing personalization/space UI. The original financial balance, network and viewport were restored; the QA plan was deleted. This does not validate a new standalone APK.

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

Independent cosmetic tables: `engagement_progress` (singleton `stage`, 0–2)
and `personalization_preferences` (singleton theme, interests, atmosphere,
space name). Schema version 4 added the independent monthly planning tables through
`004_spending_plan`; schema v5 adds independent `achievement_unlocks` through
`005_achievements`. Migrations 001–004 are unchanged.

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

## Daily-use UX (S2.1)

- One contextual Home message prioritizes overdue review over covered/shortfall
  interpretations, with at most two overdue previews and one review action.
- Natural money entry validates grouping and decimals using exact minor units;
  active-currency previews clarify both movement amounts and manual balances.
- Create/edit share a native date picker from the already installed `@expo/ui`,
  human Spanish dates and a tested civil-date adapter. No new dependency.
- Form focus, spacing, bounded notes and scroll dismissal support small screens;
  the balance update action stays subtle beside “Hoy tenés”.
- Financial formulas, lifecycle, horizon, schema and Tu espacio are unchanged.

Automated coverage: 26 tests, including precedence, overdue previews, natural
amounts and date roundtrips in five timezones, plus all previous lifecycle tests.
Typecheck, lint and diff checks pass. Android API 35 QA covers the four Home
states, all five money formats, create/edit native dates, a full restart in
America/Montevideo, positive/zero/negative balances, keyboard/scroll at 360×640,
edit/complete/cancel/delete and Tu espacio. Original data and viewport were
restored; no migration or financial formula changed.

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

MVP v0 established a compact, secondary “Tu espacio” scene. VIS-01 replaces its
primitive drawing with modular images. Three persistent states remain: window; plant after the first
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

## Personalization system direction

Alpha testing showed that a single generic `Tu espacio` scene is not enough to create
a strong product identity.

`PERS-01` introduced six curated semantic themes; VIS-01 adds Peonía and Ciruela, so eight cover the main app
surfaces, with Bosque as the default. Optional choices are up to three interests,
one of five atmospheres, and a space name of up to 24 characters. A dedicated
`/personalize` route is reachable from Tu espacio; skipping leaves financial
setup and Home usable. Preferences persist independently in SQLite. Existing
engagement stages still determine the window, plant, table and books milestones;
theme, atmosphere and interest details only change the presentation.

Validation: 31 automated tests, typecheck, lint and diff checks pass. Android
API 35 Expo Go QA covered all six themes, all atmospheres, three distinct visual
profiles, a cold restart, negative Disponible real, movement create/edit/delete,
balance update and a 360×640 dp viewport. Existing financial rows and stage 1
were preserved. Automated SQLite tests cover both a v2-to-v3 upgrade and a fresh
installation; the standalone alpha APK upgrade itself was not exercised. QA-only
balance, movement, preferences and emulator size were restored. No new visual
asset or dependency was added.

Direction:

- curated app color/themes;
- optional selection of up to a few interests;
- optional ambient style;
- optional custom space name;
- modular scene composition using reusable visual slots;
- preferences editable later;
- no effect on financial calculations;
- interests must not be used to infer financial behavior or targeting.

Changing appearance must never erase engagement progress.

Detailed contract:

`docs/PERSONALIZATION_SYSTEM.md`

## Product thesis direction

Mis Pagos is not intended to become a generic expense tracker, budgeting suite,
financial agenda or spreadsheet replacement.

Its current internal thesis is:

> No te decimos en qué gastaste tu dinero. Te ayudamos a decidir qué podés hacer con el que todavía tenés.

Operationally:

> Mis Pagos te dice cuánto de tu dinero realmente podés usar, teniendo en cuenta lo que ya sabés que viene.

The product ladder is:

1. **Reality** — current balance, commitments and Disponible real;
2. **Intention** — reserve target and optional allocations;
3. **Decision** — safe spending pace and “¿Puedo gastar esto?” simulation;
4. **Forecasting later** — estimated period close from lightweight balance updates.

This thesis is normative for roadmap decisions.

Detailed contract:

`docs/PRODUCT_THESIS.md`

## Spending-plan system direction

`PLAN-01` is now a high-priority product iteration because it deepens the reason for
Mis Pagos to exist instead of merely adding another convenience feature.

The first planning layer should preserve the exact meaning of Disponible real.

It adds separate concepts:

- **Reserva objetivo** — an amount the user chooses to preserve for the period;
- **Libre para usar** — Disponible real minus that reserve target;
- **Asignaciones** — optional percentage guidance over Libre para usar;
- **Ritmo seguro/de referencia** — a time-based guide for the remaining period;
- **¿Puedo gastar esto?** — side-effect-free simulation of a hypothetical purchase.

A percentage reserve is converted to a concrete amount when the plan is created or
changed. It must not shrink automatically as the user spends.

The system should explain consequences rather than prohibit decisions.

The initial planning layer must work offline and does not require AI, bank connections
or exhaustive transaction categorization.

Detailed contract:

`docs/SPENDING_PLAN_SYSTEM.md`

## Achievement system direction

Achievements are approved as a discovery/memory layer, not as an XP economy.

Their purpose is to make it obvious that `Tu espacio` can continue evolving and to
remember meaningful organization milestones.

Valid examples include:

- first commitment organized;
- first income planned;
- first movement resolved;
- first overdue item resolved;
- first reserve created;
- first spending simulation;
- first period reaching the user's own reserve target;
- first personalized space.

Achievements must not reward:

- wealth;
- income level;
- spending amount;
- transaction quantity;
- app-open streaks;
- ad views.

Unlocked achievements never regress and must remain independent from financial truth.

Detailed contract:

`docs/ACHIEVEMENT_SYSTEM.md`

## Currency system direction

Mis Pagos will continue to use one principal accounting currency for financial truth.

The next currency iteration (`FX-01`) introduces:

- broader currency metadata;
- zero to two optional reference currencies;
- informational automatic conversion;
- provider-agnostic exchange-rate access;
- local rate cache;
- stale-rate disclosure;
- offline-safe financial behavior.

Reference currencies do not modify stored Payment amounts, current balance,
Disponible real or Projection.

A principal-currency change with existing financial data must never be implemented as
a symbol-only switch.

Detailed contract:

`docs/CURRENCY_SYSTEM.md`

## Roadmap direction

Development continues to prioritize:

1. highest expected product impact;
2. lowest reasonable implementation cost;
3. coherent functional iterations;
4. validation before expensive expansion;
5. the product thesis over generic competitor feature parity.

Immediate order:

1. `FX-01` — expanded currency metadata and up to two reference currencies;
2. Dogfooding V2 on physical devices, including repeated PLAN-01 and ACH-01 use;
3. recurrence design/implementation;
4. reminders;
5. `VIS-01` visual expansion (completed);
6. polish and launch preparation.

`PREVIEW-02`, `PLAN-01` and `ACH-01` are implemented. Planning remains separate from
financial truth and should be validated through repeated use.

Detailed roadmap:

`docs/PRODUCT_ROADMAP.md`

---

## Product principles

Priority:

simplicity
→ stability
→ maintainability
→ decision usefulness
→ sophistication

The product should answer quickly:

> How much of my money is committed, and how much can I really use?

As planning evolves, it should also answer:

> What happens if I spend this today?

The user should not need a spreadsheet, exhaustive categorization or bank connection
to receive core value.

New features do not automatically earn a place on Home.

Home space should primarily help answer:

1. what do I have?
2. what is committed?
3. what is truly available?
4. what needs attention?
5. what can I safely do next?

The product should optimize for recurring usefulness and better decisions, not maximum
time spent inside the app.

---

## Execution strategy

Prefer larger coherent feature iterations now that the foundation is stable.

Do not split a feature into microtasks unless risk justifies it.

Use high reasoning for substantial or important iterations.

Keep routine tasks small and inexpensive.

Use:

- `AGENTS.md` for permanent repository rules;
- `docs/PROJECT_STATE.md` for compact current state;
- `docs/PRODUCT_THESIS.md` when a task changes product scope, Home priority or roadmap direction;
- `docs/HOME_UX.md` for existing Home behavior when relevant;
- `docs/SPENDING_PLAN_SYSTEM.md` for reserve/allocation/safe-pace/spending-simulation work;
- `docs/ENGAGEMENT_SYSTEM.md` for engagement rules when relevant;
- `docs/ACHIEVEMENT_SYSTEM.md` for milestones/unlocks/rewards;
- `docs/PERSONALIZATION_SYSTEM.md` for themes/interests/space identity tasks;
- `docs/CURRENCY_SYSTEM.md` for currency/FX tasks;
- `docs/PRODUCT_ROADMAP.md` only when planning or changing roadmap priorities;
- direct task prompts for the current implementation work.

Do not make Codex re-read the entire documentation set by default.

---
