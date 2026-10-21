# ONB-01 — Diseño de bienvenida interactiva

## Estado y alcance

Propuesta para la beta posterior a `main` (19 de octubre de 2026). **Diseño solamente**: no hay implementación, prueba en dispositivo ni validación con testers en esta iteración. El objetivo es que una persona nueva entienda qué dinero tiene hoy, qué compromisos restan de ese dinero y por qué los ingresos futuros sólo aparecen en Proyección. No se incorporan datos de Mis Pagos Pro.

El tutorial es opcional, funciona sin red y no escribe ejemplos en los datos financieros. Mantiene la jerarquía de Home y las fórmulas de `docs/HOME_UX.md`; las reservas y `Libre para usar` quedan fuera de esta primera explicación.

## Auditoría de `main`

| Área | Hallazgo y consecuencia para ONB-01 |
| --- | --- |
| Entrada | `src/app/_layout.tsx` inicializa SQLite y monta personalización, notificaciones y Expo Router. `src/app/index.tsx` espera `useFinancialProfile`: sin perfil muestra `FinancialSetup`; con perfil muestra `Home`. No existe puerta de onboarding ni ruta de repetición. |
| Configuración | `FinancialSetup.tsx` pide moneda principal y saldo, admite cero y negativo, y guarda un único `FinancialProfile` mediante `useFinancialProfile.ts` y su repository. Al guardar, la misma ruta muestra Home. El tutorial debe insertarse alrededor de este paso, sin volver a pedir esos datos. |
| Home | `Home.tsx` muestra primero Disponible real y el desglose «Hoy tenés − Comprometido»; Proyección sólo aparece si hay ingresos esperados. `useHome.ts` lee una instantánea financiera al enfocar/activar y `calculateHome` deriva cifras sin persistirlas. No debe superponerse un ejemplo que parezca un saldo real. |
| Movimientos | `/payments/new` ofrece `PaymentForm` real y devuelve a Home con confirmación tras guardar. Un ejemplo de onboarding no debe invocar `useCreatePayment` ni los repositories de movimientos, logros o progreso de Tu espacio. |
| Ayuda | El botón `?` de Home abre `/help`; `HelpScreen` contiene temas y glosario locales, y `ContextualHelp` ya explica Disponible real y Proyección. `docs/HELP_SYSTEM.md` dice expresamente «No introducir tutorial obligatorio, ventanas automáticas». La instrucción ONB-01 propone una excepción para una bienvenida **omitible**: debe aprobarse y actualizarse ese contrato antes de implementar la aparición automática. |
| Visual y accesibilidad | Existen `ThemeTokens`, superficies y botones de Home/Setup, `SafeAreaView`, tipografía escalable y controles con etiquetas accesibles. Hay `react-native-reanimated@4.5.1` y `react-native-worklets@0.10.1` en `package.json`/lockfile, pero no se detectó uso de Reanimated, configuración Babel propia ni comprobación de animación en Android. La presencia del paquete no prueba funcionamiento ni respeto de reducción de movimiento; verificarlo en una tarea de implementación sin cambiar configuración a ciegas. |
| Persistencia | SQLite llega a la migración 010. No hay estado de tutorial. `FinancialProfile` sólo permite inferir si se configuró el saldo; no distingue tutorial terminado, omitido o interrumpido. |

Componentes reutilizables: tokens de `themes.ts`, formato monetario de `money.ts`, presentación de `FinancialSetup`, anatomía del héroe/desglose de `Home`, navegación Expo Router, `HelpScreen` y contenido breve de `helpContent.ts`. Reutilizar patrones visuales y funciones puras; la demostración no debe renderizar `Home` con repositories reales ni usar una base de datos de prueba dentro de la app. Los PNG de `assets/assets mis pagos` no son necesarios para explicar las cifras; incorporarlos requeriría un diseño visual y revisión de licencias/tamaño separados.

## Enfoque recomendado

**Híbrido acotado**: una bienvenida breve antes de configurar el saldo; después de guardar el perfil, cuatro tarjetas interactivas de demostración en una ruta propia; al final, una salida a Home o al formulario real. La ruta propia mantiene ejemplo y datos reales inequívocamente separados. Los elementos se parecen al héroe y desglose de Home, pero cada tarjeta lleva la banda fija «Ejemplo · no se guarda» y un paso accionable. Ayuda ofrece «Volver a ver el recorrido» sólo para personas con perfil, sin iniciar una nueva configuración.

Pantallas independientes puras harían la explicación más larga y pasiva. Una guía sobre Home mezclaría importes ficticios con cifras reales, competiría con tarjetas ya densas y exigiría anclar focos a una pantalla que cambia por datos, tema y tamaño. El híbrido usa un solo contenedor de tutorial con pasos internos, no seis rutas nuevas ni un overlay persistente.

### Relato, interacción y movimiento

Ejemplo fijo en unidades menores, formateado con la moneda elegida: saldo 30.000, gasto pendiente 8.000, Disponible real 22.000, ingreso futuro 12.000, Proyección 34.000. Cada paso indica que son cifras de ejemplo. El gasto de ejemplo vence dentro de los próximos 30 días; el ingreso también. El contenido se adapta a monedas soportadas con `formatBalance`, sin conversión FX.

| Paso | Pantalla y acción de la persona | Respuesta y mensaje esencial |
| --- | --- | --- |
| 1. Bienvenida | Marca «Mis Pagos», frase «Descubrí cuánto de tu dinero podés usar hoy». Botones «Comenzar» y «Omitir tutorial». | Entrada suave de marca y cifra esquemática, ≤300 ms; sin animación continua. «Comenzar» abre la configuración existente de moneda/saldo. «Omitir» también lleva a esa configuración si falta perfil. |
| 2. Tu dinero de hoy | Tras guardar el saldo, tarjeta «Hoy tenés»; tocarla revela «Es el saldo que registraste para hoy. Podés actualizarlo cuando cambie». Botón «Seguir». | Mostrar la cifra real recién guardada en esta etapa, con rótulo «Tu saldo». No pedirla de nuevo. Aclarar que registrar un gasto **pendiente** no cambia directamente ese saldo. |
| 3. Tus compromisos | Tarjeta separada con los importes de ejemplo. Tocar «Agregar gasto de ejemplo» revela «Alquiler · 8.000 · pendiente» y mueve 8.000 hacia «Comprometido». | Etiqueta «Ejemplo · no se guarda» siempre visible. La acción modifica sólo estado React en memoria; nunca abre el formulario real ni escribe Payment, descubrimientos o Tu espacio. «Seguir» disponible aunque no toque el ejemplo. |
| 4. Disponible real | Tocar «Ver qué queda» revela la resta `30.000 − 8.000 = 22.000`; el resultado recibe el mayor énfasis visual. | Texto «Es lo que queda después de tus gastos pendientes vencidos o dentro de los próximos 30 días». Un gasto posterior al horizonte no entra en este ejemplo. Permitir repetir la revelación. |
| 5. Proyección | Tocar «Sumar ingreso futuro al ejemplo» revela `22.000 + 12.000 = 34.000` en una superficie secundaria. | Mantener 22.000 visible como Disponible real. Texto «El ingreso todavía no llegó: cambia tu Proyección, no lo que podés usar hoy». No enseñar ingresos vencidos como esperados. |
| 6. Primera acción | «Registrar mi primer movimiento», «Explorar sin registrar» y «Omitir tutorial». | Las dos primeras opciones marcan el recorrido completo y abren, respectivamente, `/payments/new` vacío o Home. «Omitir» marca omitido y abre Home. No sugerir que deba registrar cada gasto ni crear un dato ficticio. |

En pasos 2–6, «Omitir tutorial» permanece accesible arriba y sale a Home; en pasos 1–6, el gesto Android Atrás no deja una tarjeta atrapada: vuelve al paso anterior o ofrece salir, según el estado de configuración. Una interrupción de la app no cuenta como omisión. Progreso visible «N de 6», con botón «Volver» y avance explícito; las revelaciones por toque son opcionales para que la interacción no bloquee a lectores de pantalla o usuarios con motricidad limitada.

Animar sólo opacidad y desplazamientos cortos de tarjetas/indicadores; no animar cada dígito ni recalcular finanzas cuadro a cuadro. Limitar a una transición breve por acción, evitar trabajo en el hilo JS durante navegación y cancelar transiciones al salir. Con reducción de movimiento activa, reemplazar todas las transiciones por cambios inmediatos; no depender del color, el movimiento o el orden de animación para explicar la fórmula. Anunciar el nuevo resultado con texto y región accesible, controlar el foco al cambiar de paso, admitir fuente grande y 360×640 dp con scroll y CTA visible. Verificar contraste en Bosque, Peonía, Ciruela y Noche. Reanimated instalado es candidato; usar `AccessibilityInfo`/API de reducción de movimiento disponible y confirmar el comportamiento en Android antes de elegirlo. Un cambio de Babel/plugin o una biblioteca adicional se trataría como trabajo nuevo que requiere aprobación.

## Navegación y estados propuestos

```mermaid
flowchart TD
  A[Inicio: esperar SQLite y leer perfil + estado ONB] --> B{¿Existe perfil?}
  B -- Sí, sin estado ONB --> H[Home: usuario existente]
  B -- Sí, completado u omitido --> H
  B -- Sí, recorrido activo --> R[Retomar paso 2–6]
  B -- No, sin estado --> W[Bienvenida]
  B -- No, activo u omitido --> S[Configuración financiera existente]
  W -- Comenzar --> S
  W -- Omitir --> S
  S -- Guardar perfil --> C{¿Estado ONB?}
  C -- activo --> R
  C -- omitido --> H
  R -- Omitir --> H
  R -- Completar y explorar --> H
  R -- Completar y registrar --> P[/payments/new real]
  H -- Ayuda: repetir voluntariamente --> V[Recorrido de ejemplo, sesión de repetición]
  V -- Salir --> H
```

Regla de arranque: nunca decidir por un `profile === null` mientras la consulta esté cargando o falló. Si el perfil existe y no hay fila ONB, tratarlo como usuario anterior y mostrar Home. Si no hay perfil y la persona omitió, la configuración financiera sigue siendo necesaria; el indicador de omisión impide que la bienvenida vuelva a abrirse. Una repetición desde Ayuda vuelve al origen y no borra el estado terminal ni repite la configuración.

### Persistencia propuesta para la implementación futura

Usar SQLite local detrás de un repository de onboarding, con migración **nueva, aditiva, v11** y una única fila de metadatos (`id=1`, `status: active | completed | skipped`, `stepId` estable, `updatedAt` técnico ISO UTC). No modificar migraciones 001–010 ni `FinancialProfile` o `Payment`. Guardar `active` al comenzar; guardar el paso al avanzar; guardar `skipped` antes de salir por Omitir y `completed` antes de navegar al formulario/Home. Un fallo de escritura deja la salida visible con opción de reintentar; no debe escribir ni borrar datos financieros. Las microinteracciones de revelar cifras no necesitan persistencia. El modo de repetición es estado sólo de sesión y no altera el registro terminal. Esta tabla evita usar la existencia de un movimiento como proxy de aprendizaje y evita mezclar preferencias cosméticas con progreso educativo.

La nueva migración y el punto de entrada son cambios de persistencia/navegación que **requieren autorización explícita para implementarse** bajo `AGENTS.md`, `docs/ARCHITECTURE.md` y `docs/DECISIONS.md`. Antes de codificar, registrar la excepción al «no tutorial automático» de `docs/HELP_SYSTEM.md`. Una alternativa de almacenamiento tipo key/value requeriría otra fuente persistente y no mejora el aislamiento del esquema actual; no se recomienda. No se precisa nueva dependencia.

## Validación beta y privacidad

Priorizar pruebas moderadas con usuarios nuevos, observando tareas y respuestas sin capturar saldos: tras el paso 4, preguntar «Con 30.000 hoy y 8.000 pendientes, ¿cuánto te queda?»; tras el 5, «¿Podés usar hoy los 12.000 que todavía no entraron?»; luego pedir que registre un gasto propio sin ayuda. Registrar manualmente si lo completa, dónde duda y sus palabras, sólo con consentimiento de la prueba. Incluir perfiles que omiten, usuarios con poca experiencia financiera y uso con lector de pantalla.

Para abandono, basta contar manualmente la última etapa observada en sesiones beta. **No se recomienda telemetría persistente por paso en v1**: el beneficio es bajo con pocos testers y aumenta la superficie de privacidad. El `stepId` local permite reanudar, no se exporta ni se envía. Si luego se decide medir abandono sin moderador, proponer por separado contadores locales sin importes ni identificadores y una exportación explícita revisable; no incorporarlos tácitamente al correo de feedback. Las dificultades pueden recogerse mediante entrevista o la Ayuda/beta feedback ya existente, evitando pedir datos financieros sensibles.

## Riesgos y decisiones pendientes

| Riesgo | Mitigación / decisión |
| --- | --- |
| Contrato de Ayuda contrario a ventanas automáticas | Aprobar una excepción limitada a primera experiencia omitible y actualizar `HELP_SYSTEM.md` al implementar. Si no se aprueba, ofrecer recorrido sólo desde Ayuda/Home. |
| Usuario existente ve tutorial tras actualización | Prioridad absoluta al perfil existente sin estado; pruebas de actualización v10→v11 con datos reales de prueba. |
| Ejemplo confundido con saldo propio | Banda «Ejemplo · no se guarda», espacio visual separado, ninguna escritura financiera y contraste entre etapa 2 real y etapas 3–5 ficticias. |
| Saldo negativo/cero o ingresos futuros mal explicados | Etapa 2 muestra el saldo tal cual, sin juicio; el ejemplo usa cifras positivas sólo para la operación. La definición real conserva vencidos, horizonte inclusivo y exclusión de ingresos futuros. |
| Interrupción, error de lectura/escritura y navegación repetida | Estado `active` recuperable, transiciones idempotentes, carga antes de decidir ruta y acciones deshabilitadas mientras se guarda. |
| Animación o foco inaccesible en Android modesto | Transición corta opcional, reducción de movimiento, lectura lineal, CTA alcanzable con fuente grande y pruebas en dispositivo. |
| Implementación coherente supera cinco archivos de producción | Planificar ONB-01 como feature mediana autorizada con entregas acotadas; cada cambio de persistencia o navegación se revisa antes de codificar. No ampliar esta iteración. |

Decisiones para aprobación: (1) bienvenida automática omitible como excepción del contrato de Ayuda; (2) estado local dedicado con migración v11; (3) recorrido híbrido con ejemplo aislado y repetición desde Ayuda; (4) si el botón final lleva directamente a `/payments/new` o primero a Home. La propuesta recomienda las cuatro opciones descritas arriba.

## Plan de implementación futuro y criterios de aceptación

Estimación relativa total: **media**; la dificultad principal es la puerta de primera ejecución y la QA de actualización, no la animación. Dependencias externas: **ninguna nueva**. Reanimated ya está declarado, pero su ejecución y reducción de movimiento requieren verificación en el build objetivo.

1. **Contrato y estado (media):** aprobar la excepción de Ayuda, añadir migración v11, repository y función pura que resuelva arranque. Aceptar: perfil previo sin fila abre Home; nuevo sin perfil abre bienvenida; `active` retoma; `skipped`/`completed` sobreviven cierre real; los datos financieros v10 se preservan.
2. **Interfaz del recorrido (media):** construir un contenedor de feature con seis pasos, demostración puramente en memoria y textos accesibles. Aceptar: ejemplo nunca llega a SQLite; saldo se captura una sola vez; cada paso puede omitirse; fórmula y jerarquía coinciden con Home; funciona offline y a 360×640 con fuente ampliada.
3. **Entrada, salida y repetición (media):** conectar `index`, la ruta de onboarding y la entrada en Ayuda; conservar `src/app` sólo para ruta/navegación. Aceptar: primera acción abre formulario vacío, explorar abre Home, Atrás no crea bucles, repetir no modifica estado terminal ni vuelve a pedir saldo.
4. **Animación y QA (baja/media):** comprobar Reanimated en Android real/QA, añadir transiciones cortas y sustitución instantánea con reducción de movimiento. Aceptar: sin bloqueo del hilo ni contenido oculto por animación; lector de pantalla anuncia resultados; ningún paquete nuevo.

El corte de implementación debe revisarse contra el límite de cinco archivos de producción por tarea pequeña. Si la integración requiere más, autorizar explícitamente la feature mediana y sus archivos antes de empezar; no ocultar el alcance en tareas artificiales.

### Pruebas previstas

**Automatizadas:** tabla de decisión para perfil/estado/error y repetición; repository y migración fresca/v10→v11; persistencia de omitir/completar/reanudar; idempotencia ante doble toque; prueba que compare filas financieras, planes, descubrimientos y feedback antes/después del recorrido; fórmulas del ejemplo y ausencia de importaciones de escritura financiera en su módulo. Ejecutar `npm test`, `npm run typecheck`, `npm run lint` y `git diff --check` cuando exista implementación.

**Manuales Android:** instalación limpia; omitir antes y después de configurar perfil; cierre forzado y reapertura en cada etapa; upgrade de una instalación v10 con perfil y movimientos; perfiles cero/negativo; moneda distinta de UYU; sin red; rotación no requerida por configuración portrait; tamaño 360×640 y fuente grande; TalkBack, orden de foco y reducción de movimiento; repetir desde Ayuda y salir; guardar un gasto real desde el final y comprobar Home; comparar conteos/valores de `financial_profile`, `payments`, plan, logros y beta feedback antes/después del ejemplo. Una prueba de código o Expo Go no sustituye la prueba de actualización de un paquete firmado compatible.

**Esta iteración:** sólo se verifican fuentes y contratos del repositorio. No se ejecutan pruebas de interfaz, migración ni animación porque aún no existe implementación.
