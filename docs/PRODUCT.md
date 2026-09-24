# Producto y alcance del MVP

## Propósito

**Mis Pagos** es una aplicación Android local-first, orientada inicialmente a Latinoamérica. Ayuda a responder una pregunta concreta:

> ¿Cuánto dinero tengo comprometido en pagos futuros y cuánto me queda realmente disponible?

No es una aplicación bancaria. Es una herramienta personal de planificación basada en información que el usuario registra manualmente.

## Usuario y problema

El MVP está dirigido a una persona que necesita reunir en un solo lugar sus compromisos e ingresos próximos para entender su disponibilidad real de dinero. Debe privilegiar claridad y confianza por encima de automatización o sofisticación.

## Información ingresada manualmente

El usuario podrá registrar y mantener:

- gastos;
- servicios;
- suscripciones;
- alquiler;
- cuotas;
- préstamos;
- otros pagos futuros;
- ingresos previstos;
- saldo disponible actual.

## Resultado central

A partir del saldo disponible actual, los ingresos previstos y los pagos futuros, el producto presentará una visión comprensible del dinero comprometido y del remanente estimado. Los cálculos son informativos y dependen de los datos ingresados por el usuario.

## Principios del MVP

La prioridad técnica y de producto es:

```text
simplicidad
↓
estabilidad
↓
mantenibilidad
↓
sofisticación
```

Por lo tanto:

- no se anticipan funcionalidades innecesarias;
- no se crean abstracciones “por si acaso”;
- no se añaden dependencias sin autorización;
- no se cambia la arquitectura silenciosamente;
- no se hacen refactors amplios dentro de tareas no relacionadas;
- la experiencia principal debe funcionar de forma local, sin depender de una cuenta o de conectividad.

## Límites del producto

Mis Pagos:

- no conecta cuentas bancarias;
- no solicita ni almacena credenciales financieras;
- no descarga movimientos automáticamente;
- no inicia transferencias ni mueve dinero;
- no reemplaza el estado de cuenta de una institución ni constituye asesoramiento financiero.

## Fuera del alcance inicial

- backend;
- login;
- cuentas de usuario;
- Supabase;
- Firebase;
- inteligencia artificial;
- conexión bancaria;
- sincronización cloud obligatoria;
- colaboración multiusuario;
- conversión automática de divisas;
- analytics avanzados;
- versión web dedicada.

Incluir cualquiera de estos elementos exige una tarea explícita y una decisión arquitectónica registrada.
