# Mis Pagos — Engagement System

## Status

Product contract for the emotional engagement layer of Mis Pagos.

This document defines the purpose, principles, limits and staged scope of the system.
It is intentionally product-focused. Implementation details may evolve, but the non-negotiable constraints in this document must be preserved.

---

## 1. Purpose

The engagement system exists to make financial organization feel rewarding, reassuring and worth returning to.

It must reinforce the core product promise:

> Help the user know what money is already committed, what is truly available, and what is coming next.

The system must never become more important than the financial product itself.

The desired emotional loop is:

financial uncertainty
→ useful action
→ clearer future
→ immediate relief
→ occasional visual reward
→ curiosity and ownership
→ voluntary return

The target emotion is not excitement for its own sake.

The primary target emotion is:

**relief and control**

supported by:

- curiosity;
- ownership;
- gentle progress;
- visual warmth.

---

## 2. Core design philosophy

Mis Pagos must retain users by being useful and pleasant, not by making them afraid to leave.

The engagement layer should feel like a small reward for organizing the future.

It must not feel like:

- another task;
- a game the user has to maintain;
- a streak system;
- a ranking system;
- a guilt mechanism;
- a source of financial pressure.

The user must be able to ignore the engagement layer completely and still receive the full core financial value of Mis Pagos.

---

## 3. The living space

The main emotional metaphor is a persistent **living personal space**.

The space represents:

> “I am putting my financial life in order.”

It does **not** represent:

- wealth;
- income level;
- net worth;
- how much the user spends;
- social status;
- financial success compared with other users.

A user with little money and a user with a large income must be equally capable of progressing if both keep their financial information organized.

### Initial metaphor

The first version should use one small visual scene.

Possible visual elements:

- window;
- plant;
- table/chair;
- lamp;
- books;
- small decorative details.

The scene evolves gradually.

It must begin simple and become warmer and more personal over time.

The first implementation does not require free-form decoration or a complex room editor.

---

## 4. Non-negotiable product constraints

These rules apply now and in future versions unless the product philosophy is explicitly changed.

### 4.1 Progress never regresses because of absence

Never:

- reset progress because the user did not open the app;
- destroy unlocked items;
- make a plant die;
- make a pet sad, hungry or sick;
- remove rewards;
- reset a visible streak;
- punish inactivity.

The space represents what the user has built, not whether they obeyed the app today.

### 4.2 Never reward spending

Spending more money must never produce more engagement progress.

The system rewards organization and reduced uncertainty, not consumption.

### 4.3 Never reward artificial quantity

Do not create mechanics where the optimal strategy is to:

- create many small movements;
- split one transaction into several;
- repeatedly create/delete entries;
- open the app without a useful purpose.

Progress should be based on useful states and meaningful milestones.

### 4.4 Never use financial anxiety as a retention mechanic

Do not use language such as:

- “Come back before it is too late.”
- “You are losing control.”
- “Your finances are in danger.”
- manipulative countdowns;
- exaggerated warnings designed to increase opens.

Financial alerts may be important, but they must be factual, calm and actionable.

### 4.5 Never hide core relief behind monetization

Core financial information must not require:

- watching an advertisement;
- Premium;
- buying a cosmetic item;
- engagement progress.

This includes, at minimum:

- current balance;
- committed amount;
- Disponible real;
- expected income;
- Projection;
- upcoming commitments.

### 4.6 Never interrupt an emotional success moment with advertising

Forbidden pattern:

completed useful action
→ success/relief
→ advertisement

Examples:

- completing rent payment followed by an ad;
- unlocking an item that requires an ad to claim;
- “watch this video to double your reward.”

### 4.7 No pay-to-win progress

Premium cosmetics may exist.

Paying money must never purchase:

- engagement progress;
- organization points;
- faster progression;
- financial status;
- artificial achievement.

### 4.8 No mandatory daily loop

The system must not require daily usage to preserve progress.

Mis Pagos should fit the user's real financial rhythm.

### 4.9 Never hide negative financial reality

The emotional layer must never make financial information misleading.

If Disponible real is negative, show it.

If commitments exceed the current balance, explain it calmly.

The space must not be used to visually pretend that the financial situation is better than it is.

### 4.10 Financial difficulty never damages the space

A negative balance, unpaid commitment or difficult month must not:

- break the room;
- darken it as punishment;
- remove items;
- shame the user.

The space reflects organization progress, not economic privilege.

---

## 5. What the system should reward

The engagement system should reward useful financial organization.

Examples of valid signals:

- registering the first real future commitment;
- registering an expected income;
- completing a commitment;
- keeping useful future information up to date;
- reviewing or updating the current balance when appropriate;
- having enough information entered to understand the coming period;
- completing a meaningful organization milestone;
- returning later and keeping the financial picture current.

These signals are examples, not a visible point system.

The user should not need to understand an internal scoring model.

---

## 6. What the system must not reward

Do not reward:

- spending more;
- creating more transactions merely for quantity;
- app opens without useful action;
- ad views;
- purchases;
- consecutive-day attendance;
- keeping the app open longer;
- adding fake information;
- frequent tapping.

The system should reinforce better financial clarity, not engagement metrics for their own sake.

---

## 7. Two kinds of reward

### 7.1 Functional reward — always

Every useful action should immediately improve clarity.

Example:

> Listo. Ya lo estamos teniendo en cuenta.

Followed by a meaningful consequence when useful:

> Tu disponible real ahora es $18.000.

This is the primary reward.

It creates relief.

### 7.2 Emotional reward — occasional

Some meaningful actions or milestones may produce a visual surprise.

Example:

> Algo cambió en tu espacio.

This reward should not occur after every action.

It exists to create curiosity without becoming noise.

Desired combination:

**certainty every time + surprise sometimes**

---

## 8. Progress model

Progress should be persistent and non-decreasing.

The user does not need visible XP.

Avoid displaying:

- XP counters;
- arbitrary levels;
- optimization-oriented point values;
- leaderboards.

Internally, implementation may use deterministic progress state if useful, but the visible experience should be expressed through:

- scene evolution;
- unlocked details;
- meaningful milestones;
- occasional choices.

Progress must be based on useful states, not raw tap counts.

---

## 9. MVP living-space states

The initial implementation should be deliberately small.

Recommended first version:

### State 0 — Beginning

Minimal space.

Example elements:

- window.

### State 1 — First organization progress

Add one warm detail.

Example:

- plant.

### State 2 — Taking shape

Add a useful visual anchor.

Example:

- chair/table.

### State 3 — Established

Add more personality.

Example:

- books or a larger furniture element.

### State 4 — Warm and lived-in

Add final MVP details.

Example:

- lamp;
- second plant;
- small decoration.

These states are conceptual.

Final art direction may use different assets while preserving the same progression structure.

The MVP requires only one scene and approximately 3–5 meaningful visual states.

---

## 10. First-time experience

The engagement system must not introduce a long tutorial.

Suggested flow:

financial setup
→ Home
→ user adds meaningful financial information
→ first useful feedback
→ first small space change appears soon enough to teach that progression exists

The first visual reward should happen relatively early.

The objective is to teach:

> “When I organize my future, this place changes too.”

without explaining a complicated game system.

---

## 11. First personalization

After the concept is understood, the system may offer one small choice.

Example:

> Elegí un detalle para tu espacio.

Possible choices:

- plant;
- books;
- lamp.

The purpose is ownership.

One meaningful choice is more valuable than a large customization screen in the early product.

---

## 12. Home integration

The living space is secondary to financial clarity.

Home priority remains:

1. Disponible real;
2. financial explanation;
3. relevant upcoming movements;
4. primary financial action;
5. emotional layer.

The space must not push Disponible real below the fold or dominate the Home.

Recommended Home integration:

- a compact “Tu espacio” card;
- one visual preview;
- one calm contextual message;
- optional entry into the full space later.

Example:

> Tu espacio  
> Todo organizado por ahora.

The Home is:

**finance with an emotional layer**

The dedicated space view, if introduced later, is:

**emotional progression backed by useful financial behavior**

---

## 13. Contextual language

Tone should be warm, calm and human.

Preferred examples:

- “Listo. Ya lo estamos teniendo en cuenta.”
- “Ese pago ya no te puede tomar por sorpresa.”
- “Todo organizado por ahora.”
- “Tus próximos pagos están cubiertos.”
- “Ya sabés qué viene.”
- “Algo cambió en tu espacio.”

Avoid exaggerated gamification language:

- “LEVEL UP!”
- “+300 XP!”
- “EPIC REWARD!”
- “You lost your streak!”

Avoid banking language when a human phrase is clearer.

---

## 14. Negative financial states

The engagement system must coexist safely with difficult financial situations.

If commitments exceed the current balance:

Financial layer:

> Tus compromisos superan tu saldo actual.

Emotional layer may reinforce clarity without celebrating the problem:

> Ya tenés claro qué viene. Eso también es avanzar.

Do not congratulate debt, lack of funds or overspending.

Reward the act of gaining clarity, not the negative financial condition.

---

## 15. Notifications

Engagement notifications must be rare.

Never:

- “Your room misses you.”
- “Your pet is sad.”
- “Come back to keep your streak.”
- daily emotional pressure.

Financial notifications may be useful:

- upcoming payment;
- due today;
- relevant reminder.

An occasional engagement notification may eventually exist, for example:

> Hay algo nuevo en tu espacio.

but it must not become a daily retention mechanism.

---

## 16. Monetization principles

The preferred long-term monetization path for the emotional layer is cosmetic.

Possible paid content:

- visual themes;
- decorative packs;
- alternate styles;
- advanced personalization;
- premium collections.

Core financial usefulness remains independent.

Paid cosmetics must not:

- improve financial outcomes;
- accelerate progress;
- unlock core calculations;
- grant status advantages.

Free users must still experience meaningful progression.

---

## 17. Future ambient characters

A pet or character may eventually exist as an optional ambient element.

If introduced:

- it does not require care;
- it does not become hungry;
- it does not become ill;
- it does not become sad because of absence;
- it does not create guilt;
- it does not gate progression.

Its purpose is atmosphere and attachment, not obligation.

This is not part of the first MVP.

---

## 18. Engagement success criteria

The system should not optimize primarily for time spent in the app.

Short useful sessions are acceptable and often desirable.

Relevant long-term signals include:

- users returning voluntarily;
- future commitments entered in advance;
- repeated use of Disponible real;
- useful updates to financial information;
- completion/management of commitments;
- retention;
- voluntary interaction with the living space;
- personalization usage.

The product should seek:

**more recurring usefulness, not more captured minutes**

---

## 19. MVP scope

The first engagement MVP should contain only high-impact, relatively low-cost elements.

### Required

- immediate useful feedback after financial actions;
- deterministic contextual messages;
- one simple living-space scene;
- approximately 3–5 persistent visual progression states;
- non-regressing progress;
- at least one occasional visual surprise;
- calm integration with Home;
- no punishment mechanics.

### Not required yet

- free-form room editor;
- large inventory;
- many collections;
- pets;
- seasonal events;
- sounds;
- complex animations;
- social features;
- rankings;
- minigames;
- premium store;
- dozens of assets.

---

## 20. Implementation contract

When implementation begins:

- reuse the existing Mis Pagos architecture;
- do not add a new dependency without explicit authorization;
- progress must persist locally;
- the engagement layer must not modify the financial truth;
- engagement calculations must not live in route files;
- Home financial calculations remain independent from cosmetic progression;
- no schema change may be made silently.

If persistent engagement state requires database changes:

1. explicitly define the required model;
2. add a new forward-only migration;
3. do not modify an existing published migration;
4. keep the model minimal.

The implementation task must specify the persistence approach before changing the schema.

---

## 21. Product test

Any future engagement feature must pass this test:

1. Does it make useful financial organization feel better?
2. Does it preserve the user's autonomy?
3. Can the user ignore it without losing core value?
4. Does it avoid guilt, fear or artificial obligation?
5. Does it reward organization rather than consumption?
6. Does it keep financial truth visible?
7. Is its value worth the additional complexity?

If the answer to any critical question is no, the feature should not ship.
