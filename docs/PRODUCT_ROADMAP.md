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

| Capability | Expected impact | Cost | Priority |
|---|---|---|---|
| Immediate feedback after useful actions | Very high | Very low | P0 |
| Contextual financial interpretation | Very high | Low | P0 |
| Home UX refinement | Very high | Medium | P0 |
| Simple living space with 3–5 states | Very high | Medium | P0 |
| Persistent non-regressing progress | High | Medium | P0 |
| Occasional visual surprise | High | Low/medium | P0 |
| First aesthetic choice | High | Medium | P1 |
| Small object collection | High | Medium | P1 |
| Dedicated space screen | Medium/high | Medium | P1 |
| Payment completion/edit/cancel UX | Very high | Medium | P1 |
| Recurring movements | Very high | Medium/high | P1 |
| Reminders / due-date notifications | High | Medium | P1 |
| Before/after progression history | High | Medium | P2 |
| Multiple themes / collections | Medium | High | P2 |
| Advanced personalization | Medium | High | P2 |
| Ambient pet/character | Potentially high | High | P3 |
| Complex animation system | Medium | High | P3 |
| Seasonal content | Medium | High recurring cost | P3 |

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

## 7. Phase 3 — Recurrence and reminders

### Objective

Reduce repetitive manual work.

Implement after explicit recurrence design:

- recurring expenses;
- recurring expected income;
- installment-like future commitments where appropriate;
- reminder scheduling;
- due-soon states;
- useful local notifications.

### Notification philosophy

Notifications should be:

- useful;
- factual;
- infrequent enough to retain trust.

Never use guilt-based engagement notifications.

### Goal of Phase 3

Validate:

> “The app remembers what matters so I do not have to recreate my financial future every month.”

---

## 8. Phase 4 — Engagement system initial expansion

Only expand after the first living-space concept proves useful and non-intrusive.

Potential additions:

- first aesthetic choice;
- dedicated space view;
- small persistent inventory;
- approximately 5–10 visual objects;
- meaningful milestones;
- a first small collection;
- more contextual copy.

Still avoid:

- large room editor;
- pets requiring care;
- rankings;
- visible XP economy;
- streak loss;
- minigames.

### Goal of Phase 4

Validate:

> “This feels like my space, not just a feature.”

---

## 9. Phase 5 — Polish

### Objective

Improve perceived quality after the core loops are proven.

Potential work:

- refined illustrations;
- microanimations;
- transitions;
- optional haptic feedback;
- improved loading/error states;
- more natural copy;
- accessibility audit;
- typography and spacing refinement;
- visual consistency;
- first-use polish;
- before/after space progression;
- optional ambient effects.

Do not spend heavily on polish before the underlying behavior is validated.

---

## 10. Phase 6 — Launch preparation

The launch version should feel complete without being huge.

Suggested engagement content target:

- one polished living space;
- 3–5 progression stages;
- roughly 10–15 visual details/objects;
- at least one personalization decision;
- several meaningful milestones;
- polished financial feedback;
- no punishment mechanics.

Suggested core-product readiness:

- stable setup;
- stable Home;
- reliable persistence;
- creation and management of movements;
- recurring movements if they are ready to the required quality;
- local reminders if they are reliable;
- useful empty/error/negative states;
- Android QA;
- production build process;
- privacy and store materials;
- crash and data-loss review.

The launch should not wait for:

- dozens of collections;
- a pet system;
- social features;
- complex gamification;
- hundreds of cosmetic assets.

---

## 11. Phase 7 — Post-launch learning

After launch, investment should follow actual user behavior.

Measure questions such as:

- Do users return?
- Do they enter commitments in advance?
- Do they repeatedly consult Disponible real?
- Do they use the living space?
- Do they personalize it?
- Do they ignore it but still value the finance product?
- Does engagement improve retention without increasing friction?
- Which features create confusion?
- Which parts of the product are not used?

Use evidence before expanding expensive branches.

---

## 12. Potential later expansion

Only after validation:

- multiple visual themes;
- premium cosmetic packs;
- larger collections;
- alternate spaces;
- optional ambient pets;
- seasonal visual content;
- more advanced planning horizons;
- richer insights;
- additional financial organization tools.

These are opportunities, not current commitments.

---

## 13. Permanent guardrails

Across all phases:

- financial truth comes first;
- Disponible real remains understandable;
- future income must not be presented as money currently available;
- engagement never punishes absence;
- economic difficulty never damages cosmetic progress;
- no ad may interrupt a success/relief moment;
- no pay-to-win engagement progress;
- no feature earns Home space automatically;
- no new dependency without explicit authorization;
- avoid expanding scope simply because competitors contain a feature.

---

## 14. Launch philosophy

Mis Pagos should launch as:

> a small product that feels intentional and trustworthy

not:

> a large product that feels unfinished.

Prefer a few polished loops over many half-built systems.
