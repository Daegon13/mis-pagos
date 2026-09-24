# Registro de decisiones técnicas

Este archivo registra decisiones aceptadas que condicionan futuras tareas. Una decisión no se cambia silenciosamente: debe añadirse una entrada nueva que reemplace explícitamente a la anterior.

## Formato

Cada entrada incluye estado, contexto, decisión y consecuencias. Estados posibles: `Propuesta`, `Aceptada`, `Reemplazada` o `Rechazada`.

---

## D-001 — Expo SDK 57 estable

- **Estado:** Aceptada
- **Contexto:** El repositorio existente usa Expo y necesita una base estable.
- **Decisión:** Mantener React Native con Expo SDK 57 como base estable aprobada para el MVP, con npm y Node.js 22 LTS.
- **Consecuencias:** No se recreará el proyecto ni se cambiarán el SDK o el package manager sin autorización y una nueva decisión.

## D-002 — SQLite local-first

- **Estado:** Aceptada arquitectónicamente; implementación pendiente
- **Contexto:** Los datos estructurados y los cálculos deben funcionar sin conectividad ni infraestructura remota.
- **Decisión:** Usar SQLite como persistencia local detrás de una capa repository cuando una tarea posterior autorice su incorporación.
- **Consecuencias:** Esta decisión no instala dependencias ni define todavía biblioteca, esquema o repositories concretos. La UI no ejecutará SQL directamente.

## D-003 — TypeScript strict

- **Estado:** Aceptada
- **Contexto:** El proyecto necesita una base tipada y mantenible.
- **Decisión:** Mantener TypeScript en modo `strict`.
- **Consecuencias:** No se ocultarán errores con `any`, `@ts-ignore` o `@ts-nocheck` salvo autorización expresa y documentada.

## D-004 — Expo Router

- **Estado:** Aceptada
- **Contexto:** El repositorio ya adopta navegación basada en archivos con Expo.
- **Decisión:** Usar Expo Router como estrategia de navegación.
- **Consecuencias:** Cambiar la estrategia de navegación exige autorización y una nueva decisión.

## D-005 — `src/app` reservado a rutas

- **Estado:** Aceptada
- **Contexto:** Mezclar navegación, dominio y persistencia dificultaría las pruebas y la evolución.
- **Decisión:** Reservar `src/app` exclusivamente para rutas, layouts y navegación asociada a rutas.
- **Consecuencias:** SQL, repositories, modelos de dominio, lógica financiera, utilidades generales y componentes reutilizables generales vivirán fuera de `src/app`.

## D-006 — Dinero en enteros de unidades menores

- **Estado:** Aceptada
- **Contexto:** Los floats introducen errores de precisión inaceptables para importes monetarios.
- **Decisión:** Persistir importes como enteros en unidades monetarias menores, con nombres como `amountMinor` y `availableBalanceMinor`.
- **Consecuencias:** `10.99` se representa como `1099` para monedas de dos decimales.

## D-007 — Fechas financieras `YYYY-MM-DD`

- **Estado:** Aceptada
- **Contexto:** Un vencimiento es un día civil, mientras que la auditoría técnica representa un instante global.
- **Decisión:** Usar `YYYY-MM-DD` para fechas financieras y timestamps ISO UTC para `createdAt`, `updatedAt` y eventos técnicos.
- **Consecuencias:** Las fechas civiles no deben cambiar de día por conversiones de zona horaria.

## D-008 — Una moneda principal en el MVP

- **Estado:** Aceptada
- **Contexto:** El MVP no necesita gestión multidivisa.
- **Decisión:** Mantener una única moneda principal, identificada por `FinancialProfile.currencyCode`, sin conversión automática.
- **Consecuencias:** Los cálculos del MVP se realizan únicamente en esa moneda.

## D-009 — Sin gestor externo de estado inicialmente

- **Estado:** Aceptada
- **Contexto:** El MVP no ha demostrado necesitar una biblioteca global de estado.
- **Decisión:** Empezar con estado de React, hooks y SQLite como fuente persistente.
- **Consecuencias:** Redux, Zustand u otro gestor externo requieren necesidad demostrada, autorización explícita y una nueva decisión.

## D-010 — Sin ORM inicialmente

- **Estado:** Aceptada
- **Contexto:** No se ha demostrado que un ORM aporte valor suficiente al alcance inicial.
- **Decisión:** No incorporar un ORM al implementar inicialmente SQLite.
- **Consecuencias:** Añadir uno posteriormente requiere justificar la dependencia, recibir autorización y registrar una decisión.

## D-011 — Sin backend, login o cloud obligatorio en el MVP

- **Estado:** Aceptada
- **Contexto:** La propuesta de valor permite gestionar manualmente las finanzas previstas sin credenciales ni servicios remotos.
- **Decisión:** El MVP será una aplicación Android local-first sin backend, login, cuentas de usuario ni sincronización cloud obligatoria.
- **Consecuencias:** Los datos residen en el dispositivo. Backup, sincronización, colaboración y resolución de conflictos quedan fuera del alcance inicial.

## D-012 — Migraciones SQLite desde la primera versión de base de datos

- **Estado:** Aceptada
- **Contexto:** La evolución segura del esquema requiere cambios ordenados y reproducibles.
- **Decisión:** Incorporar migraciones desde la primera versión de la base de datos SQLite.
- **Consecuencias:** Toda migración aplicada o publicada será inmutable; los cambios posteriores exigirán una migración nueva.

## D-013 — Recurrencias postergadas hasta Sprint 2

- **Estado:** Aceptada
- **Contexto:** El modelo inicial debe mantenerse mínimo y aún no se ha definido la semántica de recurrencia.
- **Decisión:** Mantener las recurrencias fuera del modelo inicial y diseñarlas antes de Sprint 2.
- **Consecuencias:** Cada movimiento futuro se representa individualmente hasta que una decisión posterior apruebe el modelo recurrente.

## D-014 — Organización por feature y capa de datos simple

- **Estado:** Aceptada
- **Contexto:** Se necesita separar presentación, reglas financieras y persistencia sin introducir complejidad innecesaria.
- **Decisión:** Usar organización orientada a features y una capa de datos simple, con dirección `UI → feature/domain logic → repository → SQLite`.
- **Consecuencias:** SQLite permanece como detalle de infraestructura detrás de repositories; las capas inferiores no importan UI ni rutas.

## D-015 — No crear carpetas arquitectónicas vacías

- **Estado:** Aceptada
- **Contexto:** La estructura anticipada sin implementaciones reales añade ruido y cristaliza abstracciones prematuras.
- **Decisión:** Crear carpetas fuera de `src/app` sólo cuando una necesidad concreta las requiera y priorizar, en orden, simplicidad, estabilidad, mantenibilidad y sofisticación.
- **Consecuencias:** No se crearán esqueletos arquitectónicos ni abstracciones «por si acaso», no se añadirán dependencias sin autorización y no se harán refactors amplios en tareas no relacionadas.

## D-016 — `Payment` representa ingresos y gastos

- **Estado:** Aceptada
- **Contexto:** Separar movimientos futuros por dirección duplica entidades y reglas sin aportar valor al MVP.
- **Decisión:** `Payment` representa tanto ingresos como gastos mediante `type = income | expense`.
- **Consecuencias:** Ambos tipos comparten campos y estados. No se crearán entidades persistentes separadas para ingresos y gastos sin una nueva decisión arquitectónica.

## D-017 — `FinancialProfile` contiene saldo y moneda principal

- **Estado:** Aceptada
- **Contexto:** El saldo disponible y la moneda principal forman la configuración financiera mínima del MVP.
- **Decisión:** `FinancialProfile` contiene `availableBalanceMinor`, `balanceDate` y `currencyCode`, además de identidad y auditoría técnica.
- **Consecuencias:** El saldo disponible no es una entidad independiente. Los cálculos proyectados se derivan del perfil y de los movimientos, y no se persisten como fuente de verdad.
