# Mis Pagos — Currency System

## Status
Product and architecture contract for currencies and exchange-rate references.

This document separates:
1. **principal accounting currency**
2. **reference currencies**

The first affects financial truth. The second is informational only.

## 1. Purpose
Mis Pagos should support users across Latin America without becoming a full multi-currency accounting engine.

Initial strategy:

> one principal accounting currency + up to two optional reference currencies.

## 2. Principal accounting currency
The principal currency is used for:
- FinancialProfile balance;
- Payment amounts;
- Disponible real;
- committed expenses;
- expected income;
- Projection;
- all financial calculations.

Persist money in integer minor units. Never floats.

## 3. Reference currencies
Reference currencies are informational conversions.

Example:

`$ 31.250 UYU`

with:

`≈ USD 795`
`≈ BRL 4.310`

Reference values:
- do not modify Payment amounts;
- do not modify FinancialProfile balance;
- do not participate in financial calculations;
- are derived from cached exchange rates.

## 4. Initial limit
Allow zero, one or two reference currencies.

Keep them visually secondary to the principal amount.

## 5. Supported currencies
Prioritize common LATAM currencies plus major references.

Recommended initial set:
- UYU — Uruguayan Peso
- ARS — Argentine Peso
- BRL — Brazilian Real
- CLP — Chilean Peso
- COP — Colombian Peso
- MXN — Mexican Peso
- PEN — Peruvian Sol
- PYG — Paraguayan Guaraní
- BOB — Boliviano
- VES — Venezuelan Bolívar
- USD — US Dollar
- EUR — Euro

Additional currencies may be added later.

Currency metadata must support currency-specific fraction digits.

Do not assume every currency has exactly two decimals.

## 6. Money representation
Persist financial values as integer minor units.

Currency metadata must define fraction digits for parsing and formatting.

Do not hard-code two decimals as universal once broader currency support is introduced.

## 7. Changing principal currency
Changing principal currency is financially meaningful.

Never implement it as a symbol swap.

Forbidden:

`30000 UYU → 30000 USD`

just because the selected code changed.

### No meaningful financial data
A direct principal-currency change may be allowed.

### Existing financial data
The app must use an explicit safe flow.

Possible strategies:

#### A. Convert existing data
Use one explicit exchange-rate snapshot and show:
- old currency;
- new currency;
- rate used;
- rate date/timestamp;
- resulting values.

#### B. Start fresh
Reset/re-enter financial data in the new currency after explicit destructive confirmation.

### Current contract
Do not silently choose A or B.

A later implementation task must define the exact conversion flow before modifying stored financial data.

## 8. Multi-currency Payments are out of scope initially
The first currency expansion does NOT mean:
- each Payment can use a different currency;
- several balances exist;
- FX gains/losses are tracked;
- historical transactions are revalued.

For now:

> every Payment belongs to the principal accounting currency.

Reference currencies are display-only.

## 9. Exchange-rate architecture
Use a provider abstraction such as:

`ExchangeRateProvider`

Responsibilities:
- fetch supported rates;
- expose provider rate timestamp/date;
- normalize rate data;
- surface network/provider errors.

UI/business logic must not depend directly on one provider response shape.

Provider selection must be evaluated separately for:
- LATAM currency coverage;
- reliability;
- update frequency;
- licensing/terms;
- rate limits;
- cost;
- API quality;
- maintainability.

## 10. Local-first behavior
Mis Pagos must remain fully useful offline.

### Online
- fetch rates when appropriate;
- cache locally;
- store timestamp/date;
- refresh references.

### Offline
- keep all financial functionality;
- use last cached rate if available;
- identify stale rate clearly.

Example:

> Tipo de cambio del 28 sep.

If no cached rate exists:
- hide the reference or show unavailable;
- do not block Home;
- do not invent a rate.

## 11. Rate freshness
Displayed reference conversion must expose enough metadata to avoid pretending stale rates are live.

Examples:
- `Actualizado hoy`
- `Tipo de cambio del 28 sep.`

Do not say “actual” when freshness is unknown.

## 12. Conversion math
Avoid uncontrolled floating-point money arithmetic.

Recommended:
- treat provider rates as decimal data;
- normalize/store rates deterministically;
- convert principal minor units with controlled rounding;
- never rewrite principal stored amounts for reference display.

Use `≈` where appropriate because reference conversion is approximate.

## 13. Rate cache
Persist only what is needed:
- base/principal currency;
- reference currency;
- rate;
- provider rate timestamp/date;
- fetched-at timestamp.

Avoid unnecessary historical FX storage initially.

## 14. Home presentation
Principal currency remains dominant.

Example:

> Disponible real  
> $ 31.250 UYU

Then, if enabled:

> ≈ USD 795  
> ≈ BRL 4.310

Reference conversions must not look like additional balances owned by the user.

## 15. Currency settings
Conceptual structure:

### Moneda principal
`UYU`

### Monedas de referencia
`USD`
`BRL`

Users may freely change reference currencies.

Principal currency change must use the safe flow once financial data exists.

## 16. Formatting
Use currency-aware formatting:
- code/symbol;
- grouping;
- fraction digits;
- locale-friendly presentation where appropriate.

Avoid ambiguous `$` when multiple currencies are visible.

Prefer explicit codes such as UYU, USD or ARS when needed.

## 17. Persistence principles
Current financial persistence remains one principal currency.

Possible future storage:
- principal currency preference;
- selected reference currency ids;
- exchange-rate cache.

Do not add a currency field to every Payment only to implement reference conversion.

If migration is needed:
- forward-only migration;
- never modify published migrations;
- keep FX cache/preferences separate from financial truth where practical.

## 18. Privacy and network behavior
Exchange-rate requests must not send:
- user balance;
- Payment titles;
- Payment amounts;
- notes;
- personal financial history.

Only send what is necessary to request rates, such as currency identifiers.

## 19. Initial scope — FX-01

### Required
- expanded currency metadata;
- zero to two reference currencies;
- provider abstraction;
- one provider chosen after explicit evaluation;
- local cached rates;
- stale-rate indication;
- Home reference display;
- offline-safe behavior;
- no change to core financial calculations.

### Principal currency
At minimum:
- expose it clearly;
- allow safe change when no meaningful financial data exists.

If financial data exists:
- do not implement silent switching.

A full existing-data conversion flow may be a later iteration.

### Not required yet
- per-Payment currencies;
- multiple balances;
- FX history charts;
- investment FX tracking;
- exchange-rate alerts;
- automatic historical revaluation;
- cross-currency budgeting.

## 20. Future expansion
Possible later capabilities:
- safe conversion of existing principal-currency data;
- multiple balances;
- per-Payment currency;
- transaction rate snapshots;
- travel mode;
- cross-border planning.

These require separate product design.

## 21. Non-negotiables
The currency system must never:
- change only the symbol without converting value;
- present reference currency as owned balance;
- show stale rates as current;
- break offline financial use;
- send private financial data to the FX provider;
- persist money with floats;
- make provider availability necessary to open Home;
- silently convert stored financial history.

## 22. Success criteria
The first currency system succeeds if:
- users can choose a familiar principal currency;
- reference currencies are useful and understandable;
- offline use remains intact;
- approximate/stale conversion is clear;
- Home remains simple;
- financial calculations remain stable.

## 23. Product test
Before shipping any currency feature ask:

1. Does principal financial truth remain unambiguous?
2. Is stored money protected from symbol-only changes?
3. Can the app still work offline?
4. Are stale rates clearly identified?
5. Is reference conversion informational only?
6. Is private financial data kept away from the provider?
7. Does this avoid turning the MVP into a full FX accounting engine?

If not, do not ship it.
