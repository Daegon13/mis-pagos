# Mis Pagos

Aplicación Android local-first para registrar manualmente pagos futuros, ingresos previstos y saldo disponible, y así entender cuánto dinero está comprometido y cuánto queda realmente disponible.

Mis Pagos no es una aplicación bancaria: no conecta cuentas, no solicita credenciales financieras, no descarga movimientos y no mueve dinero.

## Estado del proyecto

Sprint 0 complete — foundation ready for product development.

La fundación incluye Expo Router, TypeScript strict, SQLite con migraciones y los modelos y repositories de `FinancialProfile` y `Payment`. La auditoría S0-T05 verificó constraints, validaciones, rollback y persistencia tras cerrar completamente y reabrir Expo Go en un emulador Android. Los datos de prueba y la instrumentación temporal fueron eliminados. Sprint 1 todavía no está iniciado.

## Stack aprobado

- React Native
- Expo SDK 57
- TypeScript strict
- Expo Router
- SQLite mediante `expo-sqlite`
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
