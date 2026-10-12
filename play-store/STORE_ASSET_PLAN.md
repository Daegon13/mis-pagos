# PLAY-01 — Recursos visuales para la ficha

Requisitos según [Google Play Console](https://support.google.com/googleplay/android-developer/answer/9866151). Preparación; no hay imágenes de marketing finales.

| Recurso | Requisito | Estado / acción |
|---|---|---|
| Icono de ficha | PNG 32-bit con alpha, 512 × 512 px, máximo 1024 KB | `assets/images/icon.png` mide 1024 × 1024 y 799005 bytes, pero muestra el icono genérico de Expo. No existe export de ficha de 512 × 512. Requiere identidad visual aprobada y export. |
| Icono adaptativo del launcher | Foreground/background/monochrome configurados | Archivos de 512 × 512, 512 × 512 y 432 × 432; muestran la marca de Expo. Probar máscara, contraste y tamaño en Android. Decisión de marca pendiente. |
| Feature graphic | 1024 × 500 px, JPEG o PNG 24-bit sin alpha | Pendiente de diseñar/exportar con marca aprobada; no simular funciones. |
| Capturas de teléfono | Mínimo 2 para ficha; recomendar 4 o más retratos reales, dentro de dimensiones y relaciones admitidas por Play | Pendientes de capturar de build de distribución, sin datos financieros reales. |

Capturas propuestas, todas con UI real y datos de prueba coherentes:

1. **Home / Disponible real:** saldo, compromisos próximos y cifra de Disponible real visible; sin ingresos futuros mezclados.
2. **Planificación:** plan mensual guardado con Reserva objetivo y Libre para usar, asignaciones opcionales si caben.
3. **¿Puedo gastar esto?:** simulación abierta con un importe de prueba y resultado que explique su efecto sin alterar el saldo.
4. **Tu espacio:** habitación con recursos de runtime y una personalización real; no usar el máster de calibración.
5. **Descubrimientos:** hitos reales desbloqueados por datos de prueba, sin recompensas inventadas.
6. **Ayuda:** tema y glosario legibles, si aporta claridad a la ficha.

Probar la legibilidad en miniatura y todos los temas usados para capturas. Confirmar requisitos exactos en Play Console antes de cargar; no fabricar estados de producto.
