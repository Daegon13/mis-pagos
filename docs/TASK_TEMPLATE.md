# Plantilla obligatoria de tarea

Toda tarea futura debe usar esta plantilla. Ninguna sección debe omitirse; escribir `N/A` y justificar cuando una sección no aplique.

```markdown
# [ID] — [Título breve]

## OBJECTIVE

[Resultado único, concreto y verificable de la tarea.]

## CONTEXT

[Estado relevante del repositorio, necesidad de producto y decisiones relacionadas.]

## SCOPE

### In scope

- [Cambio incluido.]

### Out of scope

- [Cambio explícitamente excluido.]

## ALLOWED FILES

- `ruta/al/archivo`

## FORBIDDEN FILES

- `ruta/o/patrón`

## REQUIREMENTS

1. [Requisito observable.]
2. [Regla o invariante que debe respetarse.]

## ACCEPTANCE CRITERIA

- [ ] [Criterio verificable desde el comportamiento o el repositorio.]
- [ ] No se añadieron dependencias salvo autorización explícita.
- [ ] No se amplió el alcance ni se hicieron refactors ajenos.

## REQUIRED CHECKS

```bash
npm run typecheck
npm run lint
```

## MANUAL VERIFICATION

1. [Paso reproducible.]
2. [Resultado esperado.]

## DEPENDENCIES

[Indicar “No se permiten nuevas dependencias” o listar únicamente las autorizadas.]

## ARCHITECTURE / DECISIONS

- [Referencias a `docs/ARCHITECTURE.md` y decisiones `D-xxx` aplicables.]
- [Indicar si la tarea está autorizada a cambiar alguna decisión.]

## DELIVERABLE

[Lista exacta de artefactos esperados.]
```

## Regla ante una dependencia no autorizada

Detener el trabajo y reportar:

```text
Dependency:
Reason:
Problem solved:
Native/existing alternative:
Alternatives considered:
Recommended option:
```

## Regla ante expansión de alcance

Si una tarea aparentemente pequeña requiere normalmente más de 5 archivos de producción, afecta un archivo prohibido o exige cambiar arquitectura, persistencia, navegación, estado, modelos centrales o estructura principal, detener el trabajo y solicitar autorización. No redefinir la tarea de manera implícita.
