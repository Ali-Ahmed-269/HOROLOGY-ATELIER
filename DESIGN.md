# Design

<!-- impeccable:design-schema 1 -->

## Visual World

**Name:** Obsidian Manufacture  
**Mode:** Experience → Persuade  
**Era / Reference:** Swiss Haute Horlogerie maison, contemporary — the spatial language of a Vallée de Joux atelier: raw stone, brushed metal, velvet darkness, pools of precise light.  
**Governing metaphor:** The inside of a movement. Every surface is either a finished plate, a chamfered jewel, or the controlled void between components. Nothing decorates; everything is structural.

---

## Colour System

All values are confirmed and binding. Deviation is a design defect.

| Token | Hex | Usage |
|---|---|---|
| `--color-void` | `#0A0A0C` | Global background, body, canvas |
| `--color-obsidian-1` | `#111114` | Raised surfaces (nav, drawer, cards if ever used) |
| `--color-obsidian-2` | `#1A1A1F` | Subtle section demarcation |
| `--color-obsidian-3` | `#242428` | Input fills, inactive states |
| `--color-platinum-dim` | `#6B6B78` | Tertiary text, dividers |
| `--color-platinum-mid` | `#9D9DAA` | Secondary text, captions |
| `--color-platinum-bright` | `#C8C8D4` | Body text, labels |
| `--color-platinum-white` | `#E8E8F0` | Primary text, high-emphasis |
| `--color-rose-gold-deep` | `#B8962E` | Hover states, pressed, borders at rest |
| `--color-rose-gold` | `#D4AF37` | Primary accent — icons, rule lines, active indicators |
| `--color-rose-gold-bright` | `#E5C158` | Accent text on dark surfaces (contrast-safe) |
| `--color-rose-gold-sheen` | `#F0D880` | Specular highlight tip on metallic elements |
| `--color-sapphire` | `#1E2B4A` | Rare accent — dial colour reference, deep-link highlight |
| `--color-error` | `#C0392B` | Form errors only |
| `--color-success` | `#27634A` | Confirmation states |

**Hard bans:**
- `#000000` — never used anywhere in the rendered output.
- Any RGB value with saturation > 80% outside the rose-gold or sapphire tokens.
- Any "neon" hue (hue angle 60–180° at lightness > 60%).

### Metallic Sheen (CSS)

Brushed platinum surfaces use a directional linear gradient, never a flat colour:

```css
background: linear-gradient(
  105deg,
  #2A2A30 0%,
  #3C3C44 25%,
  #4E4E58 50%,
  #3A3A42 75%,
  #28282E 100%
);
```

Rose-gold accent borders animate a subtle lustre shift on hover via `@keyframes rose-sheen`.

---

## Typography

### Typeface Stack

| Role | Family | Weights | Notes |
|---|---|---|---|
| Editorial headings | Cormorant Garamond | 300, 400, 600 (Semibold) | Use italic for evocative pulls, e.g. section titles, watch names |
| Technical / spec | JetBrains Mono | 400, 500 | Calibre numbers, measurements, serial references |
| Interface labels | Space Grotesk | 300, 400, 500 | Nav, CTA, caption text, UI chrome |

Google Fonts import (in layout.tsx or globals.css):

```
Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600
Space+Grotesk:wght@300;400;500
JetBrains+Mono:wght@400;500
```

### Scale (fluid, `clamp`-based)

| Token | Value | Usage |
|---|---|---|
| `--text-hero` | `clamp(3.5rem, 7vw, 8rem)` | Single hero headline per scene |
| `--text-display` | `clamp(2.5rem, 4.5vw, 5.5rem)` | Section headings |
| `--text-title` | `clamp(1.75rem, 2.5vw, 2.75rem)` | Reference names, sub-section titles |
| `--text-subtitle` | `clamp(1.125rem, 1.5vw, 1.375rem)` | Editorial pull quotes |
| `--text-body` | `1rem` (16px) | Body text |
| `--text-caption` | `0.8125rem` (13px) | Spec labels, footnotes |
| `--text-micro` | `0.6875rem` (11px) | Legal, watermarks |
| `--text-spec` | `0.875rem` (14px) · JetBrains Mono | Technical readouts |

### Letter Spacing

- Hero / display: `0.04em` to `0.08em` (editorial wideness)
- CHRONOS ATELIER logotype: `0.3em` (binding, confirmed)
- Spec text: `0.06em` (monospaced legibility)
- Interface labels (Space Grotesk, uppercase): `0.12em`
- Body: `0.01em`

### Rules

- Never mix Cormorant Garamond and JetBrains Mono in the same line of text.
- Italic Cormorant Garamond is permitted only in headings and pull quotes, never in body or UI chrome.
- Spec typography (JetBrains Mono) is always non-italic, always tabular-nums, always colour `--color-rose-gold-bright`.

---

## Spacing & Layout

### Grid

Desktop (≥ 1280px): 12-column, `--gutter: 2rem`, max content width `1440px`.  
Tablet (768–1279px): 8-column, `--gutter: 1.5rem`.  
Mobile (< 768px): 4-column, `--gutter: 1rem`.

```css
--layout-max: 1440px;
--gutter: clamp(1rem, 2.5vw, 2rem);
--col: calc((100% - 11 * var(--gutter)) / 12);
```

### Spacing Scale (8px base)

```
2px · 4px · 8px · 12px · 16px · 24px · 32px · 48px · 64px · 96px · 128px · 192px · 256px
```

Tokens: `--sp-1` through `--sp-13` mapping to this scale.

### Vertical Rhythm

Sections are separated by `--sp-12` (192px) on desktop. This deliberate breathing room is the typographic equivalent of a velvet watch cushion — the void is the point.

---

## Motion & Easing

### Easing Library

All animations use one of these three custom curves. No bounce, spring, or elastic easings are permitted.

| Name | CSS / GSAP value | Character |
|---|---|---|
| `ease-mechanical` | `cubic-bezier(0.25, 0.00, 0.10, 1.00)` | Impulsive start, precise stop — escapement impulse |
| `ease-sweep` | `cubic-bezier(0.60, 0.00, 0.40, 1.00)` | Symmetric, blade-like — used for transitions |
| `ease-settle` | `cubic-bezier(0.05, 0.70, 0.10, 1.00)` | Slow start, decelerate into position — hand setting |

Registered in GSAP as CustomEase IDs `mechanical`, `sweep`, `settle`.

### Duration Scale

| Token | Value | Usage |
|---|---|---|
| `--dur-instant` | `120ms` | Hover colour flips |
| `--dur-fast` | `280ms` | UI state transitions |
| `--dur-mid` | `500ms` | Panel open/close, fade in |
| `--dur-slow` | `900ms` | Section entrances |
| `--dur-cinematic` | `1800ms` | Hero transitions, exploded-view sequences |

### Scroll Choreography

- **Driver:** Lenis smooth scroll → GSAP ScrollTrigger.
- **Physical mapping:** 1 Lenis scroll unit (1px of scroll progress) = a defined rotation angle per scene (e.g., `0.15°` per px for main movement overview). Values live in a `scroll.config.ts` constants file, not inline.
- **Exploded view sequence:** ScrollTrigger `scrub: true` pins the scene; component parts tween on `progress`. Z-axis explosion depth defined in scene config, not hard-coded per component.
- **No parallax on text.** Only geometry and subtle background planes receive scroll-driven parallax. Text scrolls at native speed.

### Reduced Motion

When `prefers-reduced-motion: reduce` is active:
- All GSAP timelines get `duration: 0`.
- Three.js scenes render a still image (pre-rendered PNG export at scene start position).
- Lenis scroll disabled; browser-native scroll used.
- Transition durations capped at `120ms`.

---

## Three.js / WebGL Conventions

### Materials

| Surface | Material type | Key params |
|---|---|---|
| Rose-gold case | `MeshPhysicalMaterial` | `color: #D4AF37`, `metalness: 0.95`, `roughness: 0.12`, `reflectivity: 1` |
| Brushed platinum bridges | `MeshPhysicalMaterial` | `color: #9D9DAA`, `metalness: 0.98`, `roughness: 0.35`, anisotropy map (brushed direction) |
| Sapphire crystal | `MeshPhysicalMaterial` | `color: #C8D8F0`, `transmission: 0.95`, `thickness: 2`, `ior: 1.77` |
| Blued screws | `MeshStandardMaterial` | `color: #2A3F6A`, `metalness: 1`, `roughness: 0.05` |
| Côtes de Genève stripes | Normal/roughness maps on movement plate | — |

### Lighting Rig

- **Key:** `DirectionalLight` at `[4, 6, 3]`, intensity `2.5`, warm (temperature ~4000K → `#FFF5E0`).
- **Fill:** `DirectionalLight` at `[-3, 2, -2]`, intensity `0.4`, cool (`#D0E0FF`).
- **Rim:** `SpotLight` at `[0, 8, -4]`, intensity `1.2`, rose-gold tint (`#D4AF37`), for metallic edge definition.
- **Ambient:** `AmbientLight` intensity `0.15` — minimal; let shadows do the work.

### Post-Processing (via @react-three/postprocessing)

- `DepthOfField`: `focusDistance` animates with GSAP on scene transitions. When not transitioning, follow mouse cursor for subtle parallax DOF.
- `Bloom`: `luminanceThreshold: 0.6`, `intensity: 0.4` — rose-gold specular highlights only. Not applied globally.
- `Vignette`: `offset: 0.4`, `darkness: 0.7` — persistent, deepens the obsidian corners.
- `ChromaticAberration`: `radialModulation: true`, `offset: [0.0005, 0.0005]` — subtle, for the sapphire crystal refraction moment only.
- No film grain. No scanlines. No retro effects.

### Performance

- Gear/movement geometry: target < 200K triangles total per scene.
- Draco compression on all GLTF models.
- `Suspense` + custom loading veil component (progress mapped to a precision arc indicator in rose gold).
- `useFrame` rate-limited to 30fps when tab is not focused.
- All textures: WebP or KTX2, max 2048×2048.

---

## Component Conventions

### Naming

PascalCase components, kebab-case CSS custom properties, camelCase GSAP timeline refs.

### Button / CTA

No filled primary buttons at launch. All CTAs are:
- **Bordered:** `1px solid var(--color-rose-gold)` with inner padding `12px 28px`. On hover: border brightens to `--color-rose-gold-bright`, text fades to `--color-rose-gold-sheen`, and a `4px` horizontal rule sweeps in from left (GSAP `ease-sweep`, `280ms`).
- **Text link:** Space Grotesk 500, uppercase, letter-spacing `0.12em`, `--color-rose-gold-bright`. Underline only on focus (keyboard), never on hover.

Never use filled solid colour buttons. The brand does not shout; it extends an invitation.

### Navigation

- Fixed top bar, `backdrop-filter: blur(16px)`, background `rgba(10, 10, 12, 0.85)`.
- Logotype left, utility links right (Space Grotesk 300, `--color-platinum-mid`).
- Active section indicated by a `1px` rose-gold rule beneath the link — never a bold weight change or background highlight.
- Mobile: hamburger opens a full-screen overlay (background `#0A0A0C`, no blur). Menu items animate in sequentially, `ease-settle`, staggered by `60ms`.

### Dividers

A single `1px` horizontal rule coloured `--color-rose-gold` at 20% opacity separates major sections. No decorative ornaments, no gradients on the rule itself.

### Photography / Imagery

- All watch photography: full-bleed, edge-to-edge, no white matting.
- Caption typography: JetBrains Mono, `--text-caption`, `--color-platinum-dim`.
- No stock photography of people. People are referenced only if real brand photography is supplied.

---

## Surface Briefs

*(Written as new surfaces are built — do not pre-populate.)*

---

## Anti-Pattern Registry

These are confirmed, user-mandated hard blocks. Flag any component that approaches one.

| Anti-pattern | Description | Correct alternative |
|---|---|---|
| Pure black background | `#000000` anywhere in rendered output | Use `#0A0A0C` (`--color-void`) |
| Neon accent colours | Any hue outside rose-gold/sapphire palette at high saturation | Stay within token system |
| Bounce / spring easings | `spring()`, `elastic`, CSS `cubic-bezier` with overshoot | Use `ease-mechanical`, `ease-sweep`, `ease-settle` |
| Card grid | Product presented in a repeating card grid | Full-bleed editorial sequences or architectural list layout |
| Generic SaaS hero | Centred H1 + subtitle + CTA on a gradient blob | Scroll-driven reveal, material-focused opener |
| Flat black-and-gold | Gold text on plain black with no texture or depth | Metallic sheen gradients, Three.js PBR materials, depth of field |
| Decorative icons | Emoji, generic icon packs used as decoration | Lucide React for functional icons only; no decorative iconography |
| Fabricated content | Invented watch names, specs, prices, or history during development | Bracketed placeholder copy `[REFERENCE NAME]` etc. |
