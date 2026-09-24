# Modelo de datos inicial

## Propósito y estado

Este documento define el modelo conceptual mínimo del MVP. No es un esquema SQL ni autoriza implementar SQLite. Los nombres podrán traducirse a tipos y tablas en tareas posteriores, conservando estas reglas e invariantes.

## Convenciones comunes

### Identidad

Cada registro persistente tendrá un identificador local estable `id`. La estrategia concreta de generación se decidirá al diseñar la persistencia.

### Dinero

- `amountMinor` es un entero expresado en la unidad menor de la moneda.
- Los importes del modelo son no negativos; la dirección del dinero depende del tipo de registro, no del signo.
- `currencyCode` identifica la moneda de forma explícita.
- No se realizan sumas entre monedas diferentes ni conversión automática.

### Fechas

- Las fechas financieras usan `YYYY-MM-DD` y representan un día civil.
- `createdAt` y `updatedAt` usan timestamps ISO en UTC.

## Entidades iniciales

### Saldo disponible (`AvailableBalance`)

Representa la cantidad que el usuario declara disponible actualmente para una moneda.

| Campo | Tipo conceptual | Regla |
| --- | --- | --- |
| `id` | identificador | estable y único localmente |
| `amountMinor` | entero | puede representar el saldo declarado; nunca float |
| `currencyCode` | texto | moneda explícita |
| `asOfDate` | fecha civil | día al que corresponde el saldo |
| `createdAt` | instante UTC | auditoría técnica |
| `updatedAt` | instante UTC | auditoría técnica |

En el MVP debe existir como máximo un saldo vigente por moneda. El mecanismo para reemplazar o historizar valores se decidirá antes de implementar persistencia.

### Pago futuro (`Payment`)

Representa una salida de dinero prevista e ingresada manualmente.

| Campo | Tipo conceptual | Regla |
| --- | --- | --- |
| `id` | identificador | estable y único localmente |
| `title` | texto | descripción visible, obligatoria |
| `amountMinor` | entero | mayor que cero; nunca float |
| `currencyCode` | texto | moneda explícita |
| `dueDate` | fecha civil | vencimiento elegido por el usuario |
| `category` | categoría | gasto, servicio, suscripción, alquiler, cuota, préstamo u otro |
| `status` | estado | inicialmente `pending` o `paid` |
| `notes` | texto opcional | información libre del usuario |
| `createdAt` | instante UTC | auditoría técnica |
| `updatedAt` | instante UTC | auditoría técnica |

Una recurrencia o un plan de cuotas no forma parte de este registro inicial: cada obligación futura puede representarse como un pago concreto hasta que una decisión posterior defina otra cosa.

### Ingreso previsto (`ExpectedIncome`)

Representa una entrada de dinero futura e ingresada manualmente.

| Campo | Tipo conceptual | Regla |
| --- | --- | --- |
| `id` | identificador | estable y único localmente |
| `title` | texto | descripción visible, obligatoria |
| `amountMinor` | entero | mayor que cero; nunca float |
| `currencyCode` | texto | moneda explícita |
| `expectedDate` | fecha civil | fecha esperada elegida por el usuario |
| `status` | estado | inicialmente `expected` o `received` |
| `notes` | texto opcional | información libre del usuario |
| `createdAt` | instante UTC | auditoría técnica |
| `updatedAt` | instante UTC | auditoría técnica |

## Derivaciones, no entidades

Los siguientes valores se calculan y no deben persistirse como fuente de verdad en el modelo inicial:

- **total comprometido:** suma de pagos `pending` dentro del horizonte consultado y de la misma moneda;
- **total de ingresos previstos:** suma de ingresos `expected` dentro del horizonte consultado y de la misma moneda;
- **disponible estimado:** saldo disponible + ingresos previstos − pagos comprometidos, siempre por moneda.

El horizonte temporal y la inclusión exacta de los límites deberán ser explícitos en la funcionalidad que implemente el cálculo.

## Relaciones y eliminaciones

Las tres entidades son independientes en el MVP. No se definen cuentas bancarias, usuarios ni relaciones remotas. La política de eliminación (física o lógica) se decidirá junto con el diseño de persistencia; no debe asumirse silenciosamente.

## Fuera del modelo inicial

- usuarios y autenticación;
- cuentas bancarias o credenciales;
- movimientos descargados;
- sincronización y conflictos cloud;
- tipos de cambio;
- recurrencias automáticas;
- adjuntos;
- categorías personalizables complejas;
- analytics o agregados persistidos.
