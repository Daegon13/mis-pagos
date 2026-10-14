# SPACE-02 — Edición de Tu espacio

Este contrato rige la edición manual de Tu espacio y las recompensas de Descubrimientos. `SPACE_RENDERER.md` conserva la geometría y los recursos visuales.

## Composición

La escena de VIS-01 se resuelve primero según etapa, intereses, atmósfera y Descubrimientos. Después se aplican únicamente los cambios manuales válidos y desbloqueados. Sin cambios manuales, la escena automática es la misma. Los intereses siguen guiando la composición automática; no limitan elecciones manuales. Minimalismo reduce la densidad automática, pero nunca elimina un objeto elegido explícitamente.

La planta de etapa 1 y el escritorio con libros de etapa 2 son anclas fijas. Los libros ocupan `booksAnchor`; `deskLeft` es una capa decorativa contigua que se puede editar sin quitarlos. La edición no cambia la etapa ni permite simular una etapa futura. Un objeto decorativo único aparece como máximo una vez: una elección manual desplaza su aparición automática, y no se puede elegir explícitamente en dos zonas.

## Estados y persistencia

La migración aditiva `006_space_customization` eleva el esquema a v6. `space_slot_overrides(slot_id, asset_id, updated_at)` usa ausencia de fila para **Automático**, fila con ID para **objeto elegido** y fila con `asset_id NULL` para **Vacío**. Vacío suprime el objeto automático de esa zona. La base no guarda coordenadas. `space_visual_preferences` es una fila única con `room_palette_id` y `window_mood_id` opcionales; `NULL` sigue tema o atmósfera de personalización.

Antes de guardar se validan ID de zona, ID de objeto, `allowedSlots`, etapa, capacidad desbloqueada y ausencia de elección explícita duplicada. La operación se hace en una transacción. Un ID antiguo o desconocido guardado se ignora para renderizar y esa zona vuelve a Automático; el dato se conserva hasta que la persona lo cambie o restablezca. **Restablecer decoración sugerida** elimina solo las filas de zonas. Las opciones de paleta y ventana se restablecen por separado. Ninguna operación modifica finanzas, preferencias generales, etapa o Descubrimientos.

## Capacidades

Las capacidades se derivan de `achievement_unlocks`; no existe tabla ni moneda de recompensas. Un desbloqueo previo sirve de inmediato y nunca retrocede.

| Descubrimiento | Capacidad | Control |
|---|---|---|
| `FIRST_PERSONALIZED_SPACE` | `editCoreDecor` | `deskCenter`, `deskRight`, `detailLeft` |
| `FIRST_COMMITMENT` | `editDeskLeft` | `deskLeft` |
| `FIRST_EXPECTED_INCOME` | `editFloorRight` | `floorRight` |
| `FIRST_RESOLVED_MOVEMENT` | `editDetailCenter` | `detailCenter` |
| `FIRST_OVERDUE_RESOLVED` | `editDetailRight` | `detailRight` |
| `FIRST_RESERVE` | `roomPaletteOverride` | Paleta de habitación independiente |
| `FIRST_SPENDING_SIMULATION` | `windowMoodOverride` | Ambiente de ventana independiente |

Un control bloqueado no afecta la decoración automática existente. La paleta usa los ocho temas curados y no cambia el tema de la app. El ambiente de ventana reutiliza las atmósferas y tratamientos sutiles existentes, sin clima ni animación. Home y `/space` usan el mismo compositor y renderizador. La pantalla `/space` ofrece vista 4:3, estados Automático/objeto/Vacío, opciones bloqueadas con su Descubrimiento y acceso a personalización para editar nombre e intereses.

POLISH-01 deja los controles desbloqueados de pared/paleta y luz/ventana visibles junto a la escena, sin exigir abrir el editor de objetos. Las muestras de color muestran la paleta antes de elegirla. Descubrimientos distingue bloqueado, desbloqueado y en uso: este último significa que existe una anulación manual en una zona concedida, o una paleta/ambiente propio activo. La vista de objetos en cada tarjeta es un ejemplo de lo que permite el control, no un objeto otorgado automáticamente.

SPACE-04 añade una alternativa **Personalizado** a cada control visual desbloqueado. La pared y el ambiente/ventana aceptan por separado un color hexadecimal `#RRGGBB`; se normaliza y persiste en las columnas nuevas `wall_color` y `ambient_color` de la migración aditiva 007. Elegir uno de los ocho presets de pared limpia solo el color personalizado de pared; elegir un ambiente o «Seguir atmósfera actual» limpia solo el color personalizado de ambiente. «Seguir tema de la app» limpia el color de pared y vuelve al valor predeterminado. La interfaz general nunca usa esos colores; su contraste sigue regido por los temas semánticos. El color se limita a máscaras y un tratamiento ambiental moderado para conservar sombras y legibilidad visual. No se instala un selector de color.

SPACE-ASSET-02 amplía las opciones de los controles existentes con 15 objetos. Animales prioriza gato, taza y marco; Naturaleza, peonías, flores secas y cuarzo; Arte, tarot, marco, cuaderno y espejo; Noche, velas, tarot, cuarzo y lámpara cálida; Hogar, lámpara, tocador, joyero, espejo, perfume, velas y flores. Libros puede sumar cuaderno y tarot; Café puede sumar taza gatito. Peonía, Ciruela, Terracota, Arena y Noche alteran la prioridad automática según afinidad visual. Los intereses nunca filtran la selección manual; Minimalismo conserva su límite automático sin afectar objetos elegidos. Los cinco controles de objeto en Descubrimientos muestran miniaturas nuevas con nombre corto y zona correspondiente. Los siete Descubrimientos y sus capacidades no cambian. QA local comprobó selección/duplicados, colores personalizados y persistencia mediante tests SQLite; Android API 35 confirmó selección manual de Joyero y pared `#8D6FAA` después de reiniciar la app de desarrollo.
