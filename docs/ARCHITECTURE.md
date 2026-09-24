# Contrato arquitectónico

## Estado

Este documento define la arquitectura aprobada para el MVP de **Mis Pagos**. Es un contrato: los cambios requieren autorización explícita y deben quedar registrados en `DECISIONS.md`.

## Objetivos arquitectónicos

- Operar local-first y conservar la funcionalidad principal sin conexión.
- Mantener separadas la presentación, la lógica del dominio y la persistencia.
- Favorecer una solución pequeña, estable y fácil de mantener.
- Evitar infraestructura, abstracciones y dependencias que el MVP no necesita.

## Stack aprobado

```text
React Native
Expo SDK 57
TypeScript strict
Expo Router
SQLite
npm
Node.js 22 LTS
```

SQLite está aprobado como persistencia local, pero su incorporación, paquete, configuración, esquema y migraciones deben realizarse en una tarea posterior explícita. Este contrato no autoriza instalarlo todavía.

## Capas y dirección de dependencias

```text
UI / rutas
↓
feature y lógica de dominio
↓
repository (contrato y adaptación)
↓
SQLite
```

- La UI muestra datos, captura acciones y delega comportamiento.
- La capa de feature/dominio contiene reglas y cálculos financieros independientes de la navegación y del motor de persistencia.
- Los repositories representan el límite de persistencia.
- SQLite será un detalle de infraestructura detrás de los repositories.
- Las dependencias avanzan hacia abajo; las capas inferiores no importan UI ni rutas.
- La UI nunca contiene ni ejecuta SQL directamente.

Este flujo no presupone repositories concretos ni separados por clase de movimiento; esos contratos se diseñarán al implementar la persistencia.

## Modelo financiero del MVP

El modelo aprobado se limita a `FinancialProfile` + `Payment`. `FinancialProfile` contiene el saldo disponible y la moneda principal. `Payment` representa tanto gastos como ingresos mediante su campo `type`; no existen entidades persistentes separadas para cada dirección del movimiento.

## Navegación y organización

Expo Router es la estrategia de navegación aprobada. `src/app` se reserva exclusivamente para rutas, layouts y navegación asociada a rutas. Modelos de dominio, SQL, repositories, lógica financiera, utilidades generales y componentes reutilizables generales deben vivir fuera de `src/app`.

La estructura concreta fuera de `src/app` debe crecer sólo al implementar una necesidad real. Este documento no prescribe carpetas especulativas.

## Estado

La estrategia inicial es:

```text
React state + hooks + SQLite como fuente persistente
```

No se aprueba Redux, Zustand ni otro gestor externo. Incorporar uno requiere demostrar la necesidad, recibir autorización y registrar una decisión.

## Persistencia y migraciones

- SQLite será la fuente persistente local cuando se incorpore.
- El acceso se realizará mediante repositories, nunca desde componentes o rutas.
- Las migraciones deben ser ordenadas, reproducibles y acumulativas.
- Una migración aplicada o publicada es inmutable; una modificación del esquema exige una migración nueva.
- No se presupone sincronización remota.

## Dinero, moneda y precisión

- Los importes persistidos usan enteros en la unidad monetaria menor, nunca floats.
- El nombre recomendado para un importe es `amountMinor`.
- `10.99` se representa como `1099` cuando la moneda utiliza dos decimales.
- La moneda se identifica explícitamente con un código, sin conversión automática entre monedas.
- La suma o resta sólo es válida entre importes de la misma moneda.

## Fechas y tiempo

- Los vencimientos y fechas elegidas por el usuario son fechas civiles financieras con formato `YYYY-MM-DD`.
- `createdAt`, `updatedAt` y otros eventos técnicos son timestamps ISO en UTC.
- Una fecha civil no debe atravesar conversiones de zona horaria que puedan cambiar el día seleccionado.

## TypeScript y calidad

- Debe conservarse el modo `strict`.
- No se usan `any`, `@ts-ignore` ni `@ts-nocheck` para ocultar errores, salvo autorización expresa.
- Los cambios deben pasar, como mínimo, los scripts existentes de typecheck y lint.
- Una tarea acotada no debe incluir refactors generales ni infraestructura no solicitada.

## Restricciones del MVP

No forman parte de esta arquitectura inicial: backend, autenticación, servicios cloud, conexión bancaria, IA, colaboración multiusuario, conversión automática de divisas, analytics avanzados ni una aplicación web dedicada. Véase `PRODUCT.md` para el alcance completo.
