# Mis Pagos — Achievement System

## ACH-02 — Recompensas explícitas

Los siete Descubrimientos vigentes muestran hito, estado y capacidad de personalización. Cada desbloqueo concede control manual específico de Tu espacio; la escena automática sigue funcionando antes del desbloqueo. El registro está en `src/domain/achievementRewards.ts` y el contrato completo en `docs/SPACE_CUSTOMIZATION_SYSTEM.md`. La capacidad se deriva de `achievement_unlocks`, sin estado de recompensa duplicado. Un desbloqueo existente tiene efecto inmediato y nunca se revoca.

SPACE-04 muestra una vista previa con los objetos existentes o muestras de color que representan el control concedido. «En uso» también contempla un color personalizado de pared o ambiente. La imagen de objeto es un ejemplo de elección compatible, no un objeto concedido automáticamente.

## Status
Product contract for achievements and milestone discovery in Mis Pagos.

ACH-01 implements seven active discoveries in a static registry. Unlocks persist in
`achievement_unlocks` (schema v5), independently of finances, engagement stage,
planning and personalization. The period-close milestone remains inactive.
Existing pending or completed expenses/income, completed movements, current plans
with a positive reserve and non-default preferences are safely derived. Historical
overdue resolutions and simulations are not inferred without event evidence.
New overdue resolution requires completion or intentional cancellation of an
already overdue pending movement; deletion does not qualify. The simulator's
financial calculation remains pure; a separate explicit valid simulation action
may persist only its one-time discovery. Unlock writes never roll back the primary
financial action. The discovery screen and a compact `Tu espacio` count present
the history without points or competitive progress.
VIS-01 adds bounded secondary scene details from existing unlock IDs. It does not
change unlock rules, persistence or engagement stages; interactive Android QA for
that visual mapping is pending.
PRE-BETA-SPACE-FIX-01 usa dos IDs financieros distintos ya desbloqueados para
alcanzar la etapa 2, sin alterar las reglas de desbloqueo ni sus recompensas.

Achievements exist to help the user understand that `Tu espacio` can continue evolving and to create memory around meaningful financial-organization milestones.

They must not become an XP system, streak system or transaction-count game.

This document complements:
- `ENGAGEMENT_SYSTEM.md`
- `PERSONALIZATION_SYSTEM.md`
- `SPENDING_PLAN_SYSTEM.md`

## 1. Purpose
Achievements should answer:

> ¿Qué cosas significativas puedo llegar a construir o descubrir usando Mis Pagos?

Their purpose is:
- discovery;
- anticipation;
- memory;
- ownership;
- visible long-term possibility.

## 2. Achievement philosophy
Achievements represent meaningful organization milestones.

They must not reward:
- wealth;
- income level;
- total amount saved;
- spending more;
- transaction quantity;
- daily app opens;
- streaks;
- ad views;
- purchases.

Users with very different incomes should have equal access to core achievements through useful organization.

## 3. Engagement progress vs achievements
### Engagement progress
Controls broad evolution of `Tu espacio`.

### Achievements
Represent specific meaningful milestones.

Achievements may unlock/reveal cosmetic details, but should not be the only way the space progresses.

Do not make the room dependent on completing a checklist.

## 4. Personalization compatibility
Achievements must not override preferences.

The same conceptual milestone may receive a visual reward compatible with the user's theme/interests/atmosphere.

Changing personalization never removes achievements.

## 5. First achievement categories
### Organización
- Primer compromiso registrado
- Primer ingreso previsto
- Primer movimiento resuelto
- Primer saldo actualizado
- Primer vencido resuelto

### Planificación
- Primera reserva creada
- Primer plan de asignación
- Primera simulación `¿Puedo gastar esto?`
- Primer período planificado
- Primer período llegando a la reserva elegida

### Espacio
- Primer detalle descubierto
- Primer cambio de tema
- Primer nombre personalizado
- Primera combinación de intereses

These are candidates, not all mandatory for the first release.

## 6. Avoid raw counters
Do not use achievements such as:
- `Registrá 10 movimientos`
- `Registrá 100 movimientos`
- `Abrí la app 7 días`
- `Completá 30 días seguidos`

unless a future case clearly justifies them as meaningful and resistant to farming.

## 7. Visible and hidden achievements
A mixed model may work well.

### Visible milestones
Enough to teach that more progression exists.

### Hidden discoveries
A few may appear as:

> Algo especial todavía está oculto.

Do not hide critical product behavior behind unknown conditions.

## 8. Presentation
Prefer calm discovery language.

Examples:

> Nuevo hito
> Tu primera reserva ya forma parte de tu espacio.

or:

> Descubriste algo nuevo.

Avoid:
- LEVEL UP
- EPIC
- +500 XP
- multipliers
- rarity economies in the first version.

## 9. Achievement screen
A lightweight screen may show:
- discovered achievements;
- undiscovered silhouettes/placeholders;
- short descriptions;
- optional related cosmetic reward.

Do not build a large inventory system.

## 10. Tu espacio integration
Some achievements may unlock modular cosmetic details.

Examples:
- lamp;
- books;
- mug;
- framed art;
- plant variant;
- desk object;
- ambient detail.

Avoid one giant image per achievement.

## 11. No regression
Once unlocked, an achievement stays unlocked.

Absence, negative balance or preference changes must never remove it.

Achievements are memories of useful organization.

## 12. No financial privilege
Avoid milestones such as:
- saved $10,000;
- reached $100,000 balance;
- earned $X this month.

Prefer personal/relative milestones:
- reached the user's own reserve target;
- planned a period;
- resolved an overdue item.

## 13. Persistence
Possible model:

### AchievementUnlock
- achievementId
- unlockedAt
- optional context/version

Do not store redundant financial data inside achievement records.

## 14. Unlock evaluation
Rules belong in feature/domain logic, not route files.

Unlocks must be triggered by meaningful states/actions, not taps or screen visits.

## 15. Idempotency
Unlock evaluation must be idempotent.

Reloading or repeating the same completed operation must not:
- duplicate records;
- replay the same reward indefinitely;
- create repeated progress.

## 16. Notifications
Do not create push notifications for every achievement.

Prefer in-app discovery.

An occasional subtle message is enough:

> Algo cambió en tu espacio.

## 17. Initial implementation — ACH-01
Suggested scope:
- small achievement registry;
- 5–8 meaningful achievements;
- persistent unlocks;
- lightweight discovery screen;
- optional modular cosmetic reward mapping;
- no XP;
- no streaks;
- no ranks.

## 18. Initial candidate set
Recommended candidates:
1. Primer compromiso organizado
2. Primer ingreso previsto
3. Primer movimiento resuelto
4. Primer vencido resuelto
5. Primera reserva creada
6. Primera simulación `¿Puedo gastar esto?`
7. Primer período llegando a la reserva
8. Primer espacio personalizado

Achievements tied to unimplemented features must remain inactive until those features exist.

## 19. Success criteria
Users should understand:
- the space can keep evolving;
- useful organization creates meaningful history;
- there is more to discover;
- progress is personal rather than competitive.

## 20. Product guardrails
Never:
- use streak loss;
- punish inactivity;
- reward higher spending;
- reward higher wealth;
- create leaderboards;
- sell core achievement progress;
- require achievements for financial functionality;
- turn achievements into a second currency;
- create artificial scarcity pressure.

## 21. Product test
Any achievement must pass:
1. Does it represent useful organization?
2. Can users of different income levels reach it fairly?
3. Is it resistant to farming?
4. Does it create curiosity rather than pressure?
5. Does it respect personalization?
6. Does it preserve financial truth?
7. Is the reward worth the implementation cost?

If not, do not ship it.
