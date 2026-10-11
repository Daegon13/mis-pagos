# Mis Pagos — Tu espacio / Space Renderer Contract

## Status

Normative visual-renderer and asset-manifest contract for `Tu espacio`.

This document exists so implementation tasks do not have to infer which uploaded image is:

- the approved master reference;
- the empty production room;
- a technical mask;
- a modular object asset;
- a development-only calibration reference.

Asset roles are contractual. Exact physical filenames are taken from `assets/assets mis pagos/` and must not be renamed or overwritten silently. During the one-time VIS-01 reconciliation only, trailing upload-generated parenthetical numeric suffixes immediately before `.png` were ignored when matching each documented asset to exactly one source file. The filenames below now reflect the repository files; future work should use them directly.

If optimized runtime derivatives are created, they must be new files and their mapping back to the canonical source filename must remain documented.

---

## 1. Canonical scene coordinate system

All scene composition uses the approved master canvas:

- width: `1448`
- height: `1086`
- aspect ratio: `4:3`

All positions, dimensions and anchors are defined in this canonical coordinate space.

Never persist device pixels or screen `dp` as scene coordinates.

At runtime, scale the whole composition proportionally to the actual rendered scene size.

---

## 2. Master visual reference — calibration only

### Canonical source filename

`Rincón de trabajo acogedor y minimalista(5).png`

### Role

This is the approved **MASTER STYLE + SPATIAL REFERENCE**.

It defines:

- camera and perspective;
- framing;
- visual scale;
- lighting direction;
- material language;
- relative visual weight of furniture and objects;
- intended spatial relationship between objects;
- overall art direction.

### Production rule

This image is **NOT** the production background.

It must not be used as the runtime room scene.

It may be used only for:

- development calibration;
- visual comparison;
- overlay/debug tooling;
- determining canonical asset placement.

If included in the repository for calibration, it must be development-only and excluded from the production runtime asset registry.

---

## 3. Empty production room

### Canonical source filename

`Rincón minimalista bañado por el sol.png`

### Role

This is the approved **EMPTY ROOM BASE**.

It contains the fixed architectural shell:

- walls;
- corner/column geometry;
- window;
- window frame and sill;
- baseboards;
- floor;
- original architectural lighting and shadows;
- exterior visible through the window.

It does not contain movable furniture or decorative objects.

### Production rule

This file is the visual base layer from which the modular scene is assembled.

Do not replace it with the decorated master image.

---

## 4. Technical masks

The generated black-and-white files are source segmentation references.

They must be normalized deterministically before production use.

Recommended normalization:

- source luminance `>= 128` → alpha `255`
- source luminance `< 128` → alpha `0`

The normalized runtime masks should contain no generated gray noise.

### 4.1 Wall mask

Canonical source filename:

`Máscara minimalista de habitación en blanco y negro.png`

Meaning:

- white = recolorable painted wall surfaces;
- black = everything else.

It includes both visible wall planes and the painted corner/column surfaces.

It excludes:

- floor;
- window glass;
- window frame;
- sill;
- baseboards;
- exterior.

Runtime semantic role:

`wallMask`

Primary use:

theme-controlled wall tint while preserving the empty-room lighting underneath.

---

### 4.2 Floor mask

Canonical source filename:

`Máscara binaria de habitación vacía.png`

Meaning:

- white = visible wooden floor;
- black = everything else.

The white region includes illuminated and shadowed floor areas equally.

Runtime semantic role:

`floorMask`

Primary use:

optional subtle floor tint.

Do not use it to replace the original wood texture.

---

### 4.3 Window-glass mask

Canonical source filename:

`Máscara minimalista de ventana blanca.png`

Meaning:

- white = visible window-glass/opening region;
- black = everything else.

It excludes the frame, sill and surrounding wall.

Runtime semantic role:

`windowMask`

Primary use:

optional atmosphere tint or later window/environment treatments.

---

## 5. Modular object asset manifest

The files below are modular object sources.

They are NOT room backgrounds.

They must preserve their own aspect ratio when placed in the scene.

Never stretch them non-uniformly to imitate the master.

### 5.1 Structural / anchor assets

| Registry ID | Canonical source filename | Intended role |
|---|---|---|
| `desk` | `Escritorio escandinavo de madera clara.png` | Main desk/furniture anchor |
| `shelf` | `Estantería modular de madera clara.png` | Secondary furniture / storage anchor |
| `monitor` | `Monitor moderno minimalista en fondo transparente.png` | Desk-center technology/gaming anchor |
| `deskLamp` | `Lámpara de escritorio verde oliva.png` | Desk-left warm/light detail |
| `plantLarge` | `Planta frondosa en maceta crema.png` | Large nature/progression anchor |
| `plantSmall` | `Planta pothos en maceta cerámica.png` | Small desk/detail plant |

---

### 5.2 Interest / detail assets

| Registry ID | Canonical source filename | Main interest / use |
|---|---|---|
| `books` | `Pila de libros en tonos cálidos.png` | Libros / Hogar |
| `mug` | `Taza cerámica bicolor sobre fondo transparente.png` | Café / Hogar |
| `gamepad` | `Controlador gamer moderno en grafito.png` | Gaming |
| `speakerVinyl` | `Altavoz moderno y disco de vinilo.png` | Música |
| `moonLamp` | `Lámpara de luna sobre base de madera.png` | Noche / Nocturno |
| `catFigurine` | `Gato cerámico minimalista y sereno.png` | Animales |

---

## 6. Known asset-quality exception

### `Gato cerámico minimalista y sereno.png`

Before production integration, verify its alpha channel.

If the source contains an opaque rectangular background, it must be cleaned into a proper transparent asset before inclusion.

Do not solve this at runtime with color-key removal.

Do not silently ship an opaque square around the object.

---

## 7. Source assets vs production derivatives

The canonical source filenames above are immutable references.

Do not rename or overwrite them.

For production, optimized derivatives may be created.

Recommended policy:

### Large / structural assets

Target maximum dimension:

`768 px`

Examples:

- desk;
- shelf;
- monitor;
- plantLarge.

### Smaller/detail assets

Target maximum dimension:

`512 px`

Examples:

- mug;
- books;
- gamepad;
- moonLamp;
- catFigurine;
- speakerVinyl;
- deskLamp;
- plantSmall.

Preferred runtime format:

WebP with alpha, when supported by the existing Expo/RN toolchain.

Do not add a dependency only for image conversion.

If derivatives use normalized filenames, keep a manifest mapping:

`runtime derivative → canonical source filename`

---

## 8. Layer model

Recommended production order:

1. empty room base;
2. wall tint clipped by `wallMask`;
3. optional floor tint clipped by `floorMask`;
4. optional window/atmosphere tint clipped by `windowMask`;
5. rear furniture;
6. main desk/furniture;
7. desk objects / interest objects;
8. achievement/discovery details;
9. subtle global atmosphere treatment if needed.

The decorated master is never part of this runtime layer stack.

---

## 9. Tint philosophy

The original empty-room image already contains:

- lighting;
- shadows;
- material texture;
- perspective;
- architectural depth.

Do not regenerate those at runtime.

Theme/atmosphere should mainly alter:

- wall color;
- very subtle floor tint;
- very subtle window tint;
- optional soft global atmosphere.

Avoid repainting every object according to the selected theme.

Object art should remain materially coherent and mostly neutral.

---

## 10. Semantic slots

Use semantic slots rather than arbitrary free placement.

Initial slot vocabulary:

- `floorLeft`
- `desk`
- `booksAnchor` (fixed stage-2 books)
- `deskLeft`
- `deskCenter`
- `deskRight`
- `floorRight`
- `detailLeft`
- `detailCenter`
- `detailRight`

Each slot must define canonical-scene coordinates and an anchor type.

Suggested anchor types:

- `bottomCenter`
- `bottomLeft`
- `center`

Asset eligibility is defined separately from slot geometry.

---

## 11. Asset selection rules

The scene resolver must be deterministic.

Current mappings:

- Naturaleza → `plantLarge`, `plantSmall`
- Libros → `books`
- Gaming → `monitor`, `gamepad`
- Música → `speakerVinyl`
- Animales → `catFigurine`
- Café → `mug`
- Noche → `moonLamp`
- Tecnología → `monitor`
- Hogar → `deskLamp`, `plantSmall`, `mug`
- Minimalismo → reduce optional object density

Do not invent a missing asset.

If an interest has no supplied asset, omit a dedicated object rather than fabricating one in code.

---

## 12. Engagement-stage integration

Existing engagement milestone rules remain unchanged.

Visual interpretation:

### Stage 0

- empty room shell;
- theme / atmosphere treatment.

### Stage 1

- add established plant progression anchor.

### Stage 2

- add established desk/books progression anchor;
- allow richer interest/personalization composition.

Achievements do not determine engagement stage.

Achievements may add secondary details only.

---

## 13. Achievement/discovery density

Do not render every unlocked achievement as an object.

Initial maximum:

- structural anchors as required by stage;
- up to 3 optional interest/detail objects;
- up to 3 achievement/discovery details.

`Minimalismo` should reduce optional detail density.

Avoid clutter.

---

## 14. Z-order contract

Use explicit deterministic z-order.

Conceptual ranges:

- `0` — room background;
- `10` — tint/mask treatments;
- `20` — rear/floor furniture;
- `30` — main desk/furniture;
- `40` — objects resting on furniture;
- `50` — foreground details;
- `60` — foreground plant or deliberate occluder.

Do not rely accidentally on JSX declaration order as the product contract.

---

## 15. Master-reference calibration

Use:

`Rincón de trabajo acogedor y minimalista(5).png`

as the calibration overlay.

The master establishes:

- approximate placement;
- relative scale;
- visual balance;
- intended support surfaces.

It does NOT require isolated assets to match the exact master silhouette.

Rule:

> The master determines coordinates and visual relationships; each isolated asset preserves its own proportions.

Do not non-uniformly stretch an asset to force pixel-for-pixel silhouette matching.

---

## 16. Development-only calibration mode

A VIS-01 implementation should provide a development-only calibration mode.

Purpose:

overlay the modular scene against:

`Rincón de trabajo acogedor y minimalista(5).png`

and inspect/adjust canonical:

- `x`
- `y`
- width / scale
- `zIndex`

Recommended adjustment steps:

- `1 px`
- `5 px`
- `10 px`

No persistent database state is required.

The final calibrated values belong in the static layout registry.

The master reference must not be part of the production asset registry.

---

## 17. Runtime constraints

Do not perform image segmentation, resizing or alpha cleanup at runtime.

All normalization happens before bundling.

No animation loop is required.

Recompute scene composition only when relevant state changes:

- engagement stage;
- selected interests;
- atmosphere;
- theme;
- unlocked achievements.

`Tu espacio` remains secondary to the financial Home hierarchy.

---

## 18. Asset budget

Production visual additions should target:

- ideal: `<= 2 MB`
- acceptable: `<= 3 MB`
- hard stop: `> 5 MB` requires explicit authorization.

Measure production derivatives, not only source masters.

---

## 19. Implementation source of truth

For any task involving `Tu espacio` rendering, assets, masks, placement, themes or visual composition:

1. read `docs/PROJECT_STATE.md`;
2. read this file;
3. read only the specific engagement/personalization/achievement contract required by the task;
4. do not infer image roles from filenames outside this manifest;
5. do not rename canonical source files silently.

If a supplied image conflicts with the role documented here, stop and report the conflict before implementing.

---

## 20. VIS-01 production implementation

The physical source directory is `assets/assets mis pagos/`. VIS-01 reconciled the three upload-suffix differences shown in sections 3, 4.1 and 5.1 by unique basename matching; source files were not renamed or overwritten.

`scripts/build-space-assets.ps1` creates deterministic derivatives. The production folder is `assets/space/runtime/`. The development calibration reference is a separate 900×675 JPEG at `assets/space/calibration/master-reference.jpg`, derived from `Rincón de trabajo acogedor y minimalista(5).png`; it is absent from the production object registry and never used as the room base.

| Runtime derivative | Physical source filename |
|---|---|
| `empty-room.jpg` | `Rincón minimalista bañado por el sol.png` |
| `wall-mask.png` | `Máscara minimalista de habitación en blanco y negro.png` |
| `floor-mask.png` | `Máscara binaria de habitación vacía.png` |
| `window-mask.png` | `Máscara minimalista de ventana blanca.png` |
| `desk.png` | `Escritorio escandinavo de madera clara.png` |
| `shelf.png` | `Estantería modular de madera clara.png` |
| `monitor.png` | `Monitor moderno minimalista en fondo transparente.png` |
| `desk-lamp.png` | `Lámpara de escritorio verde oliva.png` |
| `plant-large.png` | `Planta frondosa en maceta crema.png` |
| `plant-small.png` | `Planta pothos en maceta cerámica.png` |
| `books.png` | `Pila de libros en tonos cálidos.png` |
| `mug.png` | `Taza cerámica bicolor sobre fondo transparente.png` |
| `gamepad.png` | `Controlador gamer moderno en grafito.png` |
| `speaker-vinyl.png` | `Altavoz moderno y disco de vinilo.png` |
| `moon-lamp.png` | `Lámpara de luna sobre base de madera.png` |
| `cat-figurine.png` | `Gato cerámico minimalista y sereno.png` |

The three masks retain 1448×1086 and have binary alpha from source luminance `>=128`; RGB is white. The opaque cat source receives deterministic warm-background removal during preprocessing. Its source is preserved. No runtime segmentation or color key is used. Object derivatives preserve aspect ratio and are cropped to their visible alpha bounds. Large objects are at most 600 px on the longest side; details are at most 360 px. PNG retains alpha, while the opaque room uses JPEG. The 17 raw sources total **19,921,272 bytes**; the 16 production derivatives total **2,836,895 bytes**. The dev-only master derivative is outside that production total.

Final canonical slot geometry lives in `src/features/space/spaceScene.ts`. Values below are `x,y,maxWidth,maxHeight`, where `x,y` is the bottom-center anchor in the 1448×1086 scene:

| Slot | Geometry | Z layer |
|---|---:|---:|
| `floorLeft` | 255,1030,500,610 | 60 |
| `desk` | 800,1040,1020,680 | 30 |
| `booksAnchor` | 490,510,190,155 | 40 |
| `deskLeft` | 645,515,145,170 | 40 |
| `deskCenter` | 820,510,390,320 | 40 |
| `deskRight` | 1120,515,165,170 | 40 |
| `floorRight` | 1270,1015,270,390 | 20 |
| `detailLeft` | 345,510,155,245 | 40 |
| `detailCenter` | 765,525,155,105 | 50 |
| `detailRight` | 1250,515,145,180 | 50 |

Object z order can override the slot layer where foreground occlusion is intentional. Room tints use theme semantic tokens. Wall alpha is 0.22, or 0.32 for Nocturno; floor alpha is 0.08; window alpha is 0.08, or 0.18 for Nocturno; Cálido uses an additional 0.05 ambient treatment. These treatments leave the base lighting visible.

SPACE-02 keeps the books at their previous geometry in `booksAnchor` and adds a separate editable decorative `deskLeft` layer. Home and `/space` render the same automatic scene plus valid manual overrides. See `SPACE_CUSTOMIZATION_SYSTEM.md` for persistence, entitlements and editor semantics.

`/space-calibration` redirects to Home in production. Its master require is behind `__DEV__`; an Android production export excludes both the raw master and calibration derivative. In development it overlays the modular scene on the approved master derivative, supports 0–100% scene opacity, selectable visible objects and temporary ±1/±5/±10 adjustments to x, y, width and zIndex. Accepted values are copied into the static registry; calibration does not persist them.
