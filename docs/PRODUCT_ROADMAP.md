# Mis Pagos — Product Roadmap

## Status

High-level implementation map for the current MVP path.

This roadmap prioritizes:

**highest product impact + lowest reasonable implementation cost**

It is not a commitment to ship every later idea.

Later phases should be validated by real usage before investment increases.

---

## 1. Current product objective

Mis Pagos should help the user answer quickly:

- how much money they have now;
- how much is already committed;
- how much is truly available;
- what is coming next.

The product should then help the user decide:

- how much of that real availability they want to preserve;
- how much remains flexible;
- what spending pace fits that intention;
- what happens if they spend a specific amount today.

The current product thesis is:

> No te decimos en qué gastaste tu dinero. Te ayudamos a decidir qué podés hacer con el que todavía tenés.

Detailed thesis:

`docs/PRODUCT_THESIS.md`

---

## 2. Prioritization rule

Use this mental model:

**Priority ≈ expected product impact / implementation cost**

Prefer:

- small features with a strong effect on clarity;
- emotional improvements close to existing user actions;
- coherent vertical iterations.

Avoid:

- large systems before their value is validated;
- content-heavy features that require many assets;
- broad complexity added only because competitors have it.

---

## 3. Priority map

| Capability | Expected impact | Cost | Priority | Status |
|---|---|---|---|---|
| Core Home / Disponible real | Very high | Medium | P0 | COMPLETE |
| Full movement lifecycle | Very high | Medium | P0 | COMPLETE |
| Daily-use UX polish | Very high | Low/medium | P0 | COMPLETE |
| Private Android Alpha 0.1 | Very high | Medium | P0 | COMPLETE |
| APK size audit | High | Low | P0 | COMPLETE |
| Curated themes / interests / atmosphere | High | Medium | P0 | COMPLETE |
| Modular personalized `Tu espacio` | Very high | Medium | P0 | COMPLETE |
| Alpha 0.2 real-upgrade validation | High | Low/medium | P0 | NEXT |
| Reserve + Libre para usar | Very high | Medium | P0 | COMPLETE (PLAN-01) |
| “¿Puedo gastar esto?” simulation | Very high | Medium | P0 | COMPLETE (PLAN-01) |
| Safe spending pace | Very high | Low/medium | P0 | COMPLETE (PLAN-01) |
| Optional planning allocations | High | Medium | P0 | COMPLETE (PLAN-01) |
| Small achievement/discovery layer | High | Medium | P1 | COMPLETE (ACH-01) |
| Editable `Tu espacio` and explicit Discovery rewards | High | Medium | P1 | COMPLETE (SPACE-02 + ACH-02) |
| Expanded currency metadata | High | Low/medium | P1 | PLANNED |
| Up to two reference currencies | High | Medium | P1 | PLANNED |
| Cached offline FX references | High | Medium | P1 | PLANNED |
| Safe principal-currency change | High | Medium/high | P1 | PLANNED |
| Recurring movements | Very high | Medium/high | P1 | AFTER DOGFOODING V2 |
| Reminders / due-date notifications | High | Medium | P1 | AFTER RECURRENCE |
| Estimated period close / snapshots | Potentially very high | Medium/high | P2 | PLAN-02 |
| Larger visual asset library | Medium/high | Medium/high | P2 | VALIDATE FIRST |
| Ambient pet/character | Potentially high | High | P3 | DEFERRED |
| Complex animation / seasonal system | Medium | High recurring cost | P3 | DEFERRED |

Current prioritization reflects two alpha learnings:

1. identity/personalization meaningfully improves ownership without meaningful asset cost;
2. the stronger differentiation opportunity is decision support built on Disponible real,
   not generic feature parity with finance trackers or agendas.

---

## 4. Phase 0 — Current stable foundation

Already established:

- Expo / React Native;
- TypeScript strict;
- Expo Router;
- SQLite local-first persistence;
- FinancialProfile;
- Payment;
- payment creation;
- Home core calculations;
- Disponible real;
- committed expenses;
- expected income;
- Projection;
- 30-day horizon;
- upcoming movements.

The next work should build on this foundation instead of redesigning the data architecture without need.

---

## 5. Phase 1 — Immediate implementation

HELP-01 (ayuda permanente, glosario y explicaciones contextuales): completado. La siguiente iteración visual mayor prevista es SPACE-02 + ACH-02; no forma parte de HELP-01.

### Objective

Make the current product feel significantly clearer, warmer and more rewarding with limited additional complexity.

### Product work

#### Home UX v2

Refine:

- visual hierarchy;
- Disponible real as the dominant answer;
- explanation of current balance vs committed money;
- projection only when it adds information;
- upcoming movement readability;
- reduced visual redundancy;
- calmer use of color;
- stronger product identity.

Do not change settled financial formulas.

#### Immediate feedback

After useful actions, provide clear consequence-oriented feedback.

Example:

> Listo. Ya lo estamos teniendo en cuenta.

When useful:

> Tu disponible real ahora es $X.

#### Contextual interpretation

Introduce deterministic, calm messages.

Examples:

> Todo bajo control.  
> Tus próximos compromisos están cubiertos.

or:

> Tus compromisos superan tu saldo actual en $X.

No AI is required.

#### Engagement MVP v0

Introduce:

- one compact living-space visual;
- 3–5 progression states;
- persistent progress;
- no regression;
- one occasional surprise;
- minimal Home presence.

### Goal of Phase 1

Validate:

> “Organizing my future here feels useful and satisfying.”

---

## 6. Phase 2 — Core product completion

Core financial scope: COMPLETE in S2-MOVEMENTS, with automated and Android QA.
Movement lifecycle, overdue review and explicit balance reconciliation are
implemented. Existing engagement remains unchanged; new action milestones are
still optional future work. Next: validate repeated real use before Phase 3 design.

### Objective

Make Mis Pagos genuinely usable as a recurring personal finance tool.

Implement or complete:

- movements list;
- movement detail;
- edit movement;
- cancel movement;
- delete movement;
- mark expense as completed;
- mark income as received/completed;
- overdue state;
- balance update/reconciliation flow;
- clearer management of past vs future commitments.

### Engagement integration

Use real financial actions as natural engagement signals.

Do not create artificial gamified tasks.

Potential signals:

- first completed commitment;
- first updated balance;
- first resolved overdue item;
- first well-defined planning period.

### Goal of Phase 2

Validate:

> “I can actually manage my upcoming financial life with this app.”

---

## 7. Phase 2.5 — Alpha learning, size audit and personalization — COMPLETE

### SIZE-01

The PREVIEW-01 universal APK was measured at:

- 105.29 MiB;
- four ABIs;
- approximately 80.2% native `lib/`;
- approximately 2.21 MiB JS bundle;
- approximately 1.41 MB source visual assets.

The three non-arm64 ABIs contribute about 62.25 MiB combined.

Conclusion:

- the APK size is not mainly caused by product content;
- visual personalization does not need to be blocked;
- future Play/AAB delivery should benefit from device-specific splits;
- avoid speculative framework removal.

### PERS-01

Implemented:

- Bosque, Océano, Lavanda, Terracota, Noche and Arena;
- optional interests;
- five atmospheres;
- optional space name;
- modular personalized `Tu espacio`;
- local persistence through `003_personalization`;
- no new dependency;
- no added visual asset bytes;
- no financial or engagement-rule coupling.

Validation: 31 automated tests plus Android QA.

The real Alpha 0.1 → Alpha 0.2 APK update remains to be validated.

---

## 8. Phase 3 — Alpha 0.2 release validation — CURRENT

### Objective

Turn PERS-01 into the next real installable alpha and verify upgrade safety.

### PREVIEW-02

Required:

- app version `0.2.0`;
- Android `versionCode` incremented;
- same permanent Android package;
- install over an existing Alpha 0.1 without uninstalling;
- verify migration v2→v3 on the real app artifact;
- preserve FinancialProfile, Payments and engagement progress;
- verify personalization after upgrade;
- compare artifact size with SIZE-01 baseline;
- dogfood the new identity on physical devices.

Do not add product features inside PREVIEW-02.

### Goal

Validate:

> “A real existing user can upgrade safely and the personalized product still feels stable.”

---

## 9. Phase 4 — Decision support / spending plan

### Objective

Deepen the product's core reason to exist.

Normative contracts:

- `docs/PRODUCT_THESIS.md`
- `docs/SPENDING_PLAN_SYSTEM.md`

### PLAN-01 — COMPLETE

The first planning layer is implemented without redefining Disponible real.

Required concepts:

- monthly planning period;
- reserve target;
- percentage reserve converted to a concrete target amount;
- derived `Libre para usar`;
- optional percentage allocations;
- safe/reference spending pace;
- side-effect-free “¿Puedo gastar esto?” simulation;
- calm Home summary;
- exact arithmetic;
- local-first persistence.

The planning layer must explain consequences rather than forbid decisions.

Do not require:

- bank connections;
- AI;
- exhaustive transaction categorization;
- receipt tracking;
- complete spending history.

### Goal

Validate:

> “Before spending, I can understand what this decision does to the rest of my month.”

---

## 10. Phase 5 — Achievement discovery layer

### Objective

Make progression depth visible without turning Mis Pagos into an XP/streak system.

Normative contract:

`docs/ACHIEVEMENT_SYSTEM.md`

### ACH-01 — COMPLETE

Implemented scope:

- seven meaningful active discoveries;
- deterministic persistent unlocks;
- lightweight discovery/history view;
- optional modular cosmetic reward mapping;
- no XP;
- no streaks;
- no rankings;
- no wealth-based achievements.

Candidate milestones include:

- first commitment organized;
- first income planned;
- first movement resolved;
- first overdue resolved;
- first reserve created;
- first “¿Puedo gastar esto?” simulation;
- first period reaching the user's reserve;
- first personalized space.

Achievements tied to unavailable functionality remain inactive until that functionality exists.

### Goal

Validate:

> “I understand that my space and organization history can keep evolving.”

---

## 11. Phase 6 — Currency flexibility

### Objective

Support a broader Latin American audience while preserving simple financial truth.

Normative contract:

`docs/CURRENCY_SYSTEM.md`

### FX-01

Prioritize:

- broader currency metadata;
- principal currency shown clearly;
- zero to two optional reference currencies;
- provider-agnostic exchange-rate architecture;
- one evaluated provider;
- local cached rates;
- stale-rate disclosure;
- offline-safe Home behavior;
- no effect on core financial calculations.

Principal currency remains the accounting currency.

Reference currencies are informational only.

Do not add per-Payment currencies in this phase.

A principal-currency change with existing financial data must never be a symbol-only switch.

### Goal

Validate:

> “The app fits my currency context without making the financial model confusing.”

---

## 12. Phase 7 — Dogfooding V2

### Objective

Test the personalized, planning-aware and currency-aware product on real devices.

Observe:

- whether Disponible real is understood without explanation;
- whether reserve vs Disponible real is understood;
- whether `Libre para usar` helps real decisions;
- whether “¿Puedo gastar esto?” is used naturally;
- whether safe pace feels useful rather than prescriptive;
- whether personalization increases recognition/attachment;
- whether users understand that achievements represent organization rather than wealth;
- whether reference currencies are useful or distracting;
- whether recurring manual entry becomes the dominant pain point;
- whether APK size materially affects tester willingness to install.

Use evidence to decide what deserves the next investment.

---

## 13. Phase 8 — Recurrence and reminders

### Objective

Reduce repetitive manual work after repeated-use pain is validated.

Implement after explicit recurrence design:

- recurring expenses;
- recurring expected income;
- installment-like commitments where appropriate;
- reminder scheduling;
- due-soon states;
- useful local notifications.

Notifications must remain factual and non-manipulative.

### Goal

Validate:

> “The app remembers what matters so I do not have to recreate my financial future every month.”

---

## 14. Phase 9 — PLAN-02 / forecasting

Only after PLAN-01 and Dogfooding V2 prove useful.

Potential additions:

- lightweight balance snapshots;
- estimated period close;
- comparison against reserve target;
- historical planning-period outcomes;
- simple trend interpretation.

Do not pretend estimates are transaction-level truth.

No AI is required by default.

---

## 15. Phase 10 — Engagement and visual expansion

Expand only when the personalized living-space concept and achievements show real value.

Possible additions:

- real visual asset library;
- milestone-linked modular objects;
- larger object collection;
- dedicated space view;
- richer combinations;
- before-vs-now progression;
- optional ambient character.

Maintain asset discipline.

Prefer reusable objects/layers over many full-room images.

Still avoid:

- pets requiring care;
- rankings;
- XP economy;
- streak loss;
- minigames;
- engagement that competes with the financial product.

---

## 16. Phase 11 — Polish

Potential work:

- refined illustrations;
- microanimations;
- transitions;
- optional haptics;
- loading/error states;
- copy refinement;
- accessibility audit;
- typography/spacing refinement;
- visual consistency;
- first-use polish;
- ambient effects.

Do not spend heavily on polish before behavior is validated.

---

## 17. Phase 12 — Launch preparation

The launch version should feel complete without being huge.

Suggested core readiness:

- stable setup;
- stable Home;
- reliable persistence;
- full movement management;
- validated decision-support layer;
- understood currency behavior;
- recurrence/reminders if validated and ready;
- useful empty/error/negative states;
- Android QA;
- production build process;
- privacy/store materials;
- crash and data-loss review;
- acceptable install/download footprint.

Suggested engagement readiness:

- polished modular space;
- meaningful personalization;
- small high-quality visual library;
- meaningful milestones;
- no punishment mechanics.

Launch should not wait for:

- dozens of collections;
- a pet system;
- social features;
- complex gamification;
- hundreds of cosmetic assets.

---

## 18. Post-launch learning

Measure:

- repeated consultation of Disponible real;
- reserve-plan creation and reuse;
- use of “¿Puedo gastar esto?”;
- whether plans reduce uncertainty;
- personalization usage;
- voluntary interaction with `Tu espacio`;
- achievement discovery;
- usefulness of reference currencies;
- recurrence usage;
- confusion or abandonment points.

Optimize for recurring usefulness, not captured minutes.

---

## 19. Potential later expansion

Only after validation:

- more curated visual themes;
- premium cosmetic packs;
- larger collections;
- alternate spaces;
- optional ambient pets;
- seasonal content;
- custom planning cycles;
- richer forecasts;
- multiple financial currencies/balances;
- additional financial organization tools.

These are opportunities, not commitments.

---

## 20. Permanent guardrails

Across all phases:

- financial truth comes first;
- Disponible real keeps its settled meaning;
- personal reserve is separate from accounting truth;
- future income must not be presented as currently available;
- planning should explain consequences rather than prohibit choices;
- no mandatory exhaustive categorization;
- personalization never changes financial logic;
- interests are aesthetic only;
- achievements do not reward wealth, spending or raw quantity;
- engagement never punishes absence;
- economic difficulty never damages cosmetic progress;
- no pay-to-win engagement progress;
- reference FX must not masquerade as owned balance;
- stale exchange rates must not appear current;
- offline core use remains available;
- no feature earns Home space automatically;
- no new dependency without explicit authorization;
- do not add features only because competitors contain them.

---

## 21. Launch philosophy

Mis Pagos should launch as:

> a small product that feels intentional, personal and useful at the exact moment of a money decision

not:

> a large product that feels unfinished.

Prefer a few polished decision loops and a recognizable identity over feature count.

---
