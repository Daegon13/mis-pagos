# Mis Pagos — Home UX Contract

## Purpose

The Home must answer within a few seconds:

1. How much money do I have today?
2. How much is already committed?
3. How much can I actually use?
4. What movements are coming next?

It must not behave like a generic finance dashboard.

## Primary metric

### Disponible real

Disponible real =
current available balance
- pending expenses inside the active horizon

Future income is NOT included.

Reason:
money that has not arrived yet must not be presented as currently spendable.

## Projection

Projection =
current available balance
- pending expenses
+ pending income

Projection is secondary to Disponible real.

## Initial horizon

Next 30 days.

Use the same horizon for:
- committed expenses;
- expected income;
- projection;
- upcoming movements.

Boundary rules must be explicit in implementation.

## Home hierarchy

1. Disponible real
2. Hoy tenés
3. Comprometido
4. Ingresos previstos
5. Proyección
6. Próximos movimientos
7. + Agregar movimiento

## Financial hero

Primary visual element:

Disponible real
$18.000

Supporting copy:

Lo que te queda después de tus compromisos.

Secondary breakdown:

Hoy tenés
Comprometido
Ingresos previstos
Proyección próximos 30 días

Do not give Projection greater visual weight than Disponible real.

## Upcoming movements

Show 3–5 nearest pending movements ordered chronologically.

Each item should communicate:

- short date;
- title;
- relative time;
- amount;
- income/expense direction.

Examples:

28 SEP
Alquiler
vence en 3 días
-$8.000

05 OCT
Sueldo
entra en 10 días
+$15.000

Prefer human relative language:

expense:
- vence hoy
- vence mañana
- vence en X días

income:
- entra hoy
- entra mañana
- entra en X días

Exact date may remain secondary.

## Empty state

The financial summary remains visible even with zero movements.

Show:

- current balance;
- committed = 0;
- expected income = 0;
- disponible real = current balance;
- projection = current balance.

Explain briefly that adding future payments and income will reveal committed money.

Primary CTA:
+ Agregar movimiento

Never show a meaningless blank dashboard.

## Negative state

If committed expenses exceed current balance:

Disponible real may be negative.

Do not hide or clamp it.

Show calm explanatory copy such as:

Tus compromisos superan tu saldo actual.

Do not use alarmist language.

Negative current balances are also valid.

## Visual direction

The app should feel:

- warm;
- modern;
- simple;
- trustworthy;
- non-banking;
- non-accounting.

Current visual direction:

- dark green primary;
- warm light background;
- light surfaces/cards;
- strong numerical hierarchy;
- restrained negative color;
- positive secondary green.

Avoid:

- dashboard overload;
- pie charts;
- graphs without a concrete purpose;
- many cards competing for attention;
- customizable widget dashboards;
- crypto/banking visual language;
- heavy gamification.

## Interaction principles

Registering a movement must remain fast.

Do not require:
- categories;
- account selection;
- tags;
- budgets;
- payment method;
- other accounting metadata

unless a later product decision explicitly adds them.

## Home density

Above or around the first viewport, prioritize only:

- Disponible real;
- breakdown;
- upcoming movements;
- Add movement CTA.

New features do not automatically earn a place on Home.

## Five-second rule

A user opening Home should quickly understand:

- what they have;
- what is committed;
- what they can really use;
- what is coming next.

If a design change makes these answers harder to obtain, it is a regression.