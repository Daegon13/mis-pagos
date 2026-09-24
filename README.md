# Mis Pagos

Aplicación Android local-first para registrar manualmente pagos futuros, ingresos previstos y saldo disponible, y así entender cuánto dinero está comprometido y cuánto queda realmente disponible.

Mis Pagos no es una aplicación bancaria: no conecta cuentas, no solicita credenciales financieras, no descarga movimientos y no mueve dinero.

## Estado del proyecto

El proyecto se encuentra en la etapa inicial del MVP. La base Expo ya existe y las decisiones de producto, arquitectura y datos están documentadas. SQLite está aprobado para una tarea futura, pero todavía no está incorporado.

## Stack aprobado

- React Native
- Expo SDK 57
- TypeScript strict
- Expo Router
- SQLite (pendiente de incorporación)
- npm
- Node.js 22 LTS

## Documentación

- [Producto y alcance del MVP](docs/PRODUCT.md)
- [Contrato arquitectónico](docs/ARCHITECTURE.md)
- [Modelo de datos inicial](docs/DATA_MODEL.md)
- [Registro de decisiones técnicas](docs/DECISIONS.md)
- [Plantilla obligatoria de tareas](docs/TASK_TEMPLATE.md)
- [Reglas permanentes para agentes](AGENTS.md)

Estas fuentes son normativas para futuros cambios. Cualquier modificación de arquitectura o alcance debe estar autorizada explícitamente y registrarse como una nueva decisión.

## Desarrollo

Requisito: Node.js 22 LTS y npm.

```bash
npm install
npm run start
```

Comprobaciones disponibles:

```bash
npm run typecheck
npm run lint
```

La navegación usa Expo Router. `src/app` está reservado para rutas, layouts y navegación asociada; la lógica financiera y la persistencia deben permanecer fuera de esa carpeta.
