# Registro de decisiones técnicas

Este archivo registra decisiones aceptadas que condicionan futuras tareas. Una decisión no se cambia silenciosamente: debe añadirse una entrada nueva que reemplace explícitamente a la anterior.

## Formato

Cada entrada incluye estado, contexto, decisión y consecuencias. Estados posibles: `Propuesta`, `Aceptada`, `Reemplazada` o `Rechazada`.

---

## D-001 — Aplicación móvil local-first

- **Estado:** Aceptada
- **Contexto:** La propuesta de valor requiere que una persona gestione manualmente sus finanzas previstas sin entregar credenciales ni depender de conectividad o infraestructura remota.
- **Decisión:** El MVP será una aplicación Android local-first. No tendrá backend, login, cuentas de usuario ni sincronización cloud obligatoria.
- **Consecuencias:** Los datos residen en el dispositivo. Backup, sincronización, colaboración y resolución de conflictos quedan fuera del alcance inicial.

## D-002 — Stack base

- **Estado:** Aceptada
- **Contexto:** El repositorio existente usa Expo y necesita una base estable, tipada y mantenible.
- **Decisión:** Usar React Native, Expo SDK 57, TypeScript en modo strict, Expo Router, npm y Node.js 22 LTS.
- **Consecuencias:** No se recreará el proyecto ni se cambiará el package manager. La navegación se implementará con Expo Router.

## D-003 — SQLite como persistencia local

- **Estado:** Aceptada arquitectónicamente; implementación pendiente
- **Contexto:** Los datos estructurados y los cálculos del producto requieren persistencia local fiable.
- **Decisión:** Usar SQLite detrás de una capa repository cuando una tarea posterior autorice su incorporación.
- **Consecuencias:** Esta decisión no instala una dependencia ni define aún esquema, biblioteca o migraciones. La UI no podrá ejecutar SQL directamente y las migraciones publicadas serán inmutables.

## D-004 — Separación por capas

- **Estado:** Aceptada
- **Contexto:** Mezclar rutas, reglas financieras y persistencia dificultaría las pruebas y la evolución del producto.
- **Decisión:** La dirección será `UI → feature/domain logic → repository → SQLite`. `src/app` queda reservado para rutas, layouts y navegación asociada a rutas.
- **Consecuencias:** SQL, repositories, modelos de dominio, lógica financiera, utilidades generales y componentes reutilizables generales vivirán fuera de `src/app`.

## D-005 — Representación de dinero y moneda

- **Estado:** Aceptada
- **Contexto:** Los floats introducen errores de precisión inaceptables para importes monetarios.
- **Decisión:** Persistir importes como enteros en unidades monetarias menores, preferentemente con el nombre `amountMinor`, junto con una moneda explícita.
- **Consecuencias:** `10.99` se representa como `1099` para monedas de dos decimales. No se mezclan monedas ni se realiza conversión automática.

## D-006 — Semántica de fechas

- **Estado:** Aceptada
- **Contexto:** Un vencimiento es un día elegido por el usuario, mientras que la auditoría técnica representa un instante global.
- **Decisión:** Usar `YYYY-MM-DD` para fechas civiles financieras y timestamps ISO UTC para `createdAt`, `updatedAt` y eventos técnicos.
- **Consecuencias:** Las fechas civiles no deben cambiar de día por conversiones de zona horaria.

## D-007 — Estado de aplicación mínimo

- **Estado:** Aceptada
- **Contexto:** El MVP no ha demostrado necesitar una biblioteca global de estado.
- **Decisión:** Empezar con estado de React, hooks y SQLite como fuente persistente.
- **Consecuencias:** Redux, Zustand u otro gestor externo requieren necesidad demostrada, autorización explícita y una nueva decisión.

## D-008 — Prioridad de simplicidad

- **Estado:** Aceptada
- **Contexto:** La anticipación de casos futuros aumenta el coste y el riesgo sin validar valor de producto.
- **Decisión:** Priorizar, en orden, simplicidad, estabilidad, mantenibilidad y sofisticación.
- **Consecuencias:** No se crean abstracciones “por si acaso”, no se agregan dependencias sin autorización y no se realizan refactors amplios en tareas no relacionadas.
