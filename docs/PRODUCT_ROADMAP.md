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

The product should then make maintaining that clarity feel rewarding rather than tedious.

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
| Private Android alpha | Very high | Medium | P0 | COMPLETE |
| APK size audit | High | Low | P0 | NEXT |
| Curated app themes | High | Low/medium | P0 | NEXT |
| Optional interests + atmosphere | High | Medium | P0 | NEXT |
| Modular personalized `Tu espacio` | Very high | Medium | P0 | NEXT |
| Optional space naming | Medium/high | Low | P0 | NEXT |
| Expanded currency metadata | High | Low/medium | P1 | PLANNED |
| Up to two reference currencies | High | Medium | P1 | PLANNED |
| Cached offline FX references | High | Medium | P1 | PLANNED |
| Safe principal-currency change | High | Medium/high | P1 | PLANNED |
| Recurring movements | Very high | Medium/high | P1 | AFTER DOGFOODING V2 |
| Reminders / due-date notifications | High | Medium | P1 | AFTER RECURRENCE |
| Larger engagement inventory | Medium | High | P2 | DEFERRED |
| Ambient pet/character | Potentially high | High | P3 | DEFERRED |
| Complex animation / seasonal system | Medium | High recurring cost | P3 | DEFERRED |

Current prioritization reflects alpha dogfooding findings: the product is functionally
usable, but identity, personalization, currency flexibility and install size now need
validation before more feature breadth.

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

## 7. Phase 2.5 — Alpha learning and size audit — CURRENT

### Objective

Use the first installable APK to identify product problems that were invisible in the
emulator/development loop.

Current alpha observations:

- the direct-install APK is approximately 100 MB and needs composition analysis;
- the app still feels visually too generic despite `Tu espacio`;
- personalization has strong potential to create ownership at relatively low cost;
- principal-currency management is too rigid;
- reference currencies would add practical value without requiring full multi-currency accounting.

### Immediate work

#### SIZE-01

Audit what actually contributes to APK size before removing dependencies or changing
architecture.

Do not optimize blindly.

The result should identify, at minimum:

- native libraries;
- JavaScript bundle contribution;
- assets;
- architecture/ABI contribution where visible;
- realistic opportunities for reduction;
- difference between direct APK size and future store-delivered build considerations.

No functional changes are required for the audit itself.

---

## 8. Phase 3 — Identity and personalization

### Objective

Make Mis Pagos recognizable and personally meaningful without harming financial clarity.

Normative contract:

`docs/PERSONALIZATION_SYSTEM.md`

### PERS-01

Prioritize:

- curated theme/color selector;
- persisted theme choice;
- optional interests;
- optional ambient style;
- optional custom name for `Tu espacio`;
- modular room composition from reusable visual slots;
- editing preferences later;
- complete independence from financial calculations.

Keep the personalization step optional and short.

Do not build:

- a free-form room editor;
- a large inventory;
- pets;
- a store;
- dozens of unique illustrations.

### Goal

Validate:

> “This feels like my Mis Pagos, not just another finance app.”

---

## 9. Phase 4 — Currency flexibility

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
- one evaluated exchange-rate provider;
- local cached rates;
- stale-rate disclosure;
- offline-safe Home behavior;
- no effect on core financial calculations.

Principal currency remains the accounting currency.

Reference currencies are informational only.

Do not add per-Payment currencies in this phase.

A principal-currency change with existing financial data must never be a symbol-only
switch and may require its own explicit conversion iteration.

### Goal

Validate:

> “The app fits my currency context without making the financial model confusing.”

---

## 10. Phase 5 — Dogfooding V2

### Objective

Run the personalized/currency-aware alpha on real devices before adding more automation.

Observe:

- whether users understand Disponible real without explanation;
- whether personalization increases recognition/attachment;
- whether users voluntarily interact with `Tu espacio`;
- whether reference currencies are useful or distracting;
- whether currency settings are understandable;
- whether recurring manual entry becomes the dominant pain point;
- whether APK size materially affects tester willingness to install.

Use findings to decide what deserves the next investment.

---

## 11. Phase 6 — Recurrence and reminders

### Objective

Reduce repetitive manual work only after repeated-use pain is validated.

Implement after explicit recurrence design:

- recurring expenses;
- recurring expected income;
- installment-like commitments where appropriate;
- reminder scheduling;
- due-soon states;
- useful local notifications.

Notifications must remain useful, factual and non-manipulative.

Never use guilt-based engagement notifications.

### Goal

Validate:

> “The app remembers what matters so I do not have to recreate my financial future every month.”

---

## 12. Phase 7 — Engagement expansion

Expand only if the personalized living-space concept proves useful and non-intrusive.

Possible additions:

- first larger object collection;
- dedicated space view;
- additional meaningful milestones;
- richer modular combinations;
- before-vs-now progression;
- optional ambient character.

Still avoid:

- pets requiring care;
- rankings;
- visible XP economy;
- streak loss;
- minigames;
- engagement that competes with the financial product.

---

## 13. Phase 8 — Polish

### Objective

Improve perceived quality after the core loops and identity system are proven.

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

## 14. Phase 9 — Launch preparation

The launch version should feel complete without being huge.

Suggested engagement target:

- one polished modular living-space system;
- clear progression;
- meaningful personalization;
- a small high-quality visual library;
- several meaningful milestones;
- polished financial feedback;
- no punishment mechanics.

Suggested core-product readiness:

- stable setup;
- stable Home;
- reliable persistence;
- full movement management;
- currency behavior understood and tested;
- recurring movements if validated and ready;
- local reminders if reliable;
- useful empty/error/negative states;
- Android QA;
- production build process;
- privacy/store materials;
- crash and data-loss review;
- acceptable install/download footprint.

Launch should not wait for:

- dozens of collections;
- a pet system;
- social features;
- complex gamification;
- hundreds of cosmetic assets.

---

## 15. Phase 10 — Post-launch learning

After launch, investment should follow actual user behavior.

Measure questions such as:

- Do users return?
- Do they enter commitments in advance?
- Do they repeatedly consult Disponible real?
- Do they personalize the app?
- Do they use `Tu espacio` voluntarily?
- Are reference currencies useful?
- Does engagement improve retention without increasing friction?
- Which features create confusion?
- Which parts are ignored?

Use evidence before expanding expensive branches.

---

## 16. Potential later expansion

Only after validation:

- more visual themes;
- premium cosmetic packs;
- larger collections;
- alternate spaces;
- optional ambient pets;
- seasonal visual content;
- advanced planning horizons;
- richer insights;
- multiple financial currencies / balances;
- additional financial organization tools.

These are opportunities, not current commitments.

---

## 17. Permanent guardrails

Across all phases:

- financial truth comes first;
- Disponible real remains understandable;
- future income must not be presented as currently available;
- personalization never changes financial logic;
- interests are aesthetic only;
- engagement never punishes absence;
- economic difficulty never damages cosmetic progress;
- no ad may interrupt a success/relief moment;
- no pay-to-win engagement progress;
- reference FX must not masquerade as owned balance;
- stale exchange rates must not appear current;
- offline financial use must continue without the FX provider;
- no feature earns Home space automatically;
- no new dependency without explicit authorization;
- avoid expanding scope simply because competitors contain a feature.

---

## 18. Launch philosophy

Mis Pagos should launch as:

> a small product that feels intentional, personal and trustworthy

not:

> a large product that feels unfinished.

Prefer a few polished loops and a recognizable identity over feature count.

---

