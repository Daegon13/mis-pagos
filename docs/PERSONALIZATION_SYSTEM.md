# Mis Pagos — Personalization System

## Status
Product contract for visual personalization and identity. Complements `ENGAGEMENT_SYSTEM.md`.

## 1. Purpose
Personalization should make Mis Pagos feel like **the user's app**, not a generic finance utility.

It should increase:
- visual ownership;
- recognition;
- emotional attachment;
- curiosity about `Tu espacio`;
- differentiation.

It must never reduce financial clarity.

## 2. Core rule
Personalization changes appearance and atmosphere, never financial behavior.

Interests, themes and space style must never be used to:
- infer spending habits;
- change calculations;
- generate different financial advice;
- rank users;
- recommend purchases;
- target ads.

Interests are aesthetic context only.

## 3. Entry point
After financial setup, Mis Pagos may offer:

> Hagamos Mis Pagos un poco más tuyo.

This step must be:
- brief;
- optional;
- skippable;
- reversible later.

Do not create a long personality test.

## 4. Interests
Allow up to 3 interests.

Initial examples:
- Naturaleza
- Libros
- Gaming
- Música
- Animales
- Café
- Viajes
- Arte
- Noche
- Tecnología
- Hogar
- Minimalismo

They affect only visual composition of `Tu espacio`.

## 5. Ambient style
Allow one preferred atmosphere.

Initial options:
- Cálido
- Natural
- Minimalista
- Nocturno
- Colorido

This may influence:
- palette;
- lighting;
- decorative accents;
- compatible scene details.

## 6. App theme / color
Use curated themes rather than an unrestricted RGB picker.

Suggested themes:
- Bosque
- Océano
- Lavanda
- Terracota
- Noche
- Arena

Themes must preserve contrast, accessibility and brand quality.

## 7. Theme architecture
Use semantic design tokens, for example:
- `primary`
- `primarySurface`
- `accent`
- `background`
- `surface`
- `secondarySurface`
- `textPrimary`
- `textSecondary`
- `positive`
- `negative`
- `border`

Components should consume semantic tokens instead of unrelated hard-coded colors.

## 8. Accessibility
Every theme must preserve:
- readable contrast;
- clear selected/unselected states;
- adequate touch targets;
- financial meaning that does not depend only on color.

## 9. `Tu espacio` as a modular scene
Do not build a completely separate room for every profile.

Prefer reusable slots:
- base room/background;
- palette/lighting;
- primary object;
- secondary object;
- decorative detail;
- optional ambient element.

This avoids combinatorial asset explosion.

## 10. Interest mapping
Examples:

### Naturaleza
- plants
- wood
- natural textures

### Libros
- shelf
- books
- reading lamp

### Gaming
- monitor
- subtle ambient light
- controller-like detail

### Música
- headphones
- speaker
- vinyl/record detail

### Café
- mug
- small table
- coffee corner

### Tecnología
- desk
- clean device
- minimal technical accents

Mappings should remain subtle and reusable.

## 11. Combination rules
Multiple interests should combine through compatible slots.

Example:
- Libros + Café + Cálido
  - shelf/books
  - mug
  - reading lamp
  - warm room

Example:
- Gaming + Tecnología + Nocturno
  - monitor/device
  - subtle light accent
  - darker ambience

Use deterministic rules and avoid one-off custom rooms.

## 12. Space naming
Allow an optional custom space name.

Examples:
- Mi rincón
- El refugio
- Base
- Casa

Naming is cosmetic only and must not affect progression.

## 13. Personalization vs progression
Personalization answers:

> ¿Cómo quiero que se vea?

Progression answers:

> ¿Cómo ha evolucionado con mi organización?

Changing theme/interests must never erase engagement progress.

## 14. Persistence
Keep personalization local-first.

Possible persisted fields:
- selected theme id;
- selected interests;
- selected atmosphere;
- custom space name;
- selected/unlocked visual choices.

Do not couple personalization directly to `FinancialProfile` or `Payment`.

If persistence needs schema changes:
- use a minimal dedicated structure;
- add a forward-only migration;
- never modify published migrations.

## 15. Optionality
The user must be able to:
- skip personalization;
- use defaults;
- change preferences later.

Core finance functionality must never depend on personalization.

## 16. Initial scope — PERS-01

### Required
- curated theme selector;
- persisted theme;
- optional interest selection;
- optional atmosphere selection;
- modular `Tu espacio` variation using reusable components/assets;
- optional custom space name;
- ability to edit preferences later;
- zero impact on financial calculations.

### Prefer if cheap
- live theme preview;
- immediate visual update;
- deterministic scene variation from selected interests.

### Not required yet
- large inventory;
- free-form room editor;
- drag-and-drop;
- store;
- premium cosmetics;
- pets;
- seasonal content;
- many custom illustrations;
- social sharing.

## 17. Future expansion
Only after validation:
- more themes;
- more interests;
- larger decorative library;
- advanced room customization;
- ambient pet/character;
- milestone-linked objects;
- premium cosmetic packs;
- before-vs-now history.

## 18. Non-negotiables
Personalization must never:
- alter financial truth;
- infer financial behavior from interests;
- reduce accessibility;
- hide negative states;
- require payment for core finance;
- punish preference changes;
- erase engagement progress;
- create mandatory setup friction;
- become more important than Disponible real.

## 19. Success criteria
Success means users increasingly feel:

> Esta app se siente mía.

Useful signals:
- theme use;
- interest selection;
- space naming;
- voluntary visits to `Tu espacio`;
- remembered visual identity;
- no added financial friction.

Do not optimize for time spent customizing.

## 20. Product test
Before shipping any personalization feature ask:

1. Does it increase ownership or recognition?
2. Does it preserve financial clarity?
3. Can the user skip it?
4. Does it avoid sensitive inference?
5. Is it reusable rather than asset-heavy?
6. Does it preserve accessibility?
7. Is the impact worth the implementation cost?

If not, do not ship it.
