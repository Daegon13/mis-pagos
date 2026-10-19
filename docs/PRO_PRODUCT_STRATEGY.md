# Mis Pagos Pro — Product contract

## Principle

**Free helps people understand and decide. Pro may automate, deepen and personalize.** Mis Pagos must remain useful without a subscription, internet access, an account or a purchase. Pro must never change the meaning of financial results or make an existing Free capability less useful.

This document is the source of truth for the Free/Pro boundary. Candidate Pro items are proposals, not entitlements or a commitment to ship. A future feature needs its own product and implementation decision before it is gated.

## Permanently Free

- Financial setup and current balance.
- Known commitments, expected income, `Disponible real`, Projection and upcoming movements, including negative states.
- Core movement creation, editing, completion and deletion.
- Critical reminders about known financial obligations.
- Basic spending plan, reserve and `¿Puedo gastar esto?` simulation needed to understand the consequence of a decision. Existing planning functionality stays Free.
- Existing themes, personalization, `Tu espacio` progression and discoveries, including already earned rewards and manual controls.
- Access to local data and the ability to keep using the core app offline.

Free financial truth cannot be obscured by a paywall, ad, cosmetic reward or progress condition. A change in entitlement cannot alter stored balances, payments, plans, discoveries or the calculations derived from them.

## Candidate Pro additions

- Advanced planning views and interpretation beyond the current plan and basic simulation.
- Optional recurrence and automation that save effort without removing manual movement management.
- Optional AI interpretation of deterministic results, with separate privacy review and no AI dependency for core answers.
- Premium 2.5D effects, visual styles and decorative packs, while retaining the current static scene and base progression.
- Backup or sync and household/shared finances only after separate architecture, privacy and security decisions. They are not part of this contract's implementation.

An advanced addition must have a useful Free baseline, explicit user value, clear data handling, and a graceful fallback when Pro is unavailable. Financial calculations and factual alerts remain the same for both tiers.

## Entitlement boundary

`src/domain/entitlement.ts` defines the only current interface: an `EntitlementSource` returns `free | pro`, and `resolveEntitlement(source?)` normalizes the result. It returns `free` when no source exists, a source throws or rejects, or a source returns an unrecognized value. The interface accepts synchronous or asynchronous sources and has no persistence or side effects. Future provider adapters may use Play Billing, but feature/domain code should query this boundary and never import billing APIs directly.

No feature is gated by this initial boundary. A future implementation must distinguish temporary verification failure from a confirmed entitlement change before deciding what premium access to show, while keeping all Free capabilities available. Purchase restoration, billing state, caching and offline premium policy require a separate decision.

## Non-goals and anti-dark-pattern rules

- No billing SDK, purchase, subscription, paywall, backend, login, cloud service or AI call in PRO-00.
- No artificial urgency, manipulative countdown, shame, ad interruption after a useful action or pressure tied to a negative balance.
- No purchase of engagement progress, discoveries, financial status or better financial outcomes.
- No degradation of accuracy, hiding of commitments, forced transaction categorization or loss of access to existing local data.
- No inference of sensitive financial behavior from cosmetic preferences.

Pro should be optional and plainly explained. The app must still answer what money is committed, what remains available and what a planned expense would mean when a user stays on Free.
