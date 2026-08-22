# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Three.js / @react-three/fiber / @react-three/drei / @react-three/postprocessing · GSAP 3 · Lenis (smooth scroll) · Lucide React. Delegated: stack was pre-installed by the user before init.

## Users

**Primary:** Ultra-high-net-worth individuals (UHNWI), serious collectors, and connoisseurs of Haute Horlogerie — typically 35–65, global, fluent in the language of complications, finishing, and provenance. They arrive with intent; they are not being sold to, they are being received.

**Secondary:** Authorised retailers, press attachés, and watch journalists researching new references and manufacture credentials.

**Context:** Desktop-first evaluation — often a large screen in a quiet, well-lit study. The visitor takes time. Speed of impression matters less than depth of craftsmanship felt through the interface itself.

## Product Purpose

CHRONOS ATELIER is the digital maison of a Haute Horlogerie manufacture. Its purpose is to present mechanical timepieces — movements, complications, and finishing — as the apex of human craft, and to make a remote visitor feel the weight, precision, and permanence of the object before they ever hold it. Success means the visitor requests a private appointment, downloads a reference dossier, or enters the waitlist for a limited edition.

## Positioning

Every pixel is a material choice — the site is itself a finished surface. Unlike category competitors that lean on product photography alone, CHRONOS ATELIER uses WebGL to let the visitor rotate, dissect, and study a movement in real time — the same intellectual engagement as handling a watch at the counter. No other atelier site offers a scroll-locked exploded view that syncs gear rotation to scroll position in physical time.

## Operating Context

- Visitors navigate to a collection reference from a press mention, a collector forum, or a direct maison invitation (email, PDF lookbook).
- Key micro-rituals: inspecting the movement architecture, reading the technical specifications, watching the complication demo, and finally requesting a consultation.
- The site lives alongside PDF dossiers, physical maison visits, and Authorised Retailer touchpoints. It does not replace; it qualifies and elevates.
- Staff may share a deep-link to a specific reference during a call with a prospect.

## Capabilities and Constraints

- **WebGL mandatory:** Three.js scenes with depth-of-field post-processing, PBR materials (rose gold, brushed steel, sapphire crystal), and physically correct gear rotation. No canvas fallback to a flat image — degrade gracefully to a still render only on devices that fail capability checks.
- **Scroll choreography:** GSAP ScrollTrigger + Lenis for scroll-locked exploded-view sequences. Scroll speed maps to mechanical rotation angle (1 scroll unit = N degrees, defined per section).
- **No e-commerce or checkout:** All acquisition paths end in human contact (appointment request form, WhatsApp concierge, or PDF download). No cart, no price display by default.
- **Multilingual intent:** Architecture must support `next-intl` or equivalent i18n layer in a future sprint; all copy lives in a single source file per locale from day one. *(Undecided: exact locale set — EN + FR confirmed, others open.)*
- **Performance ceiling:** LCP < 2.5 s on a fast desktop connection even with WebGL active. Lazy-load heavy Three.js bundles behind a loading veil with a precision progress indicator.
- **Accessibility floor:** WCAG 2.1 AA for all non-WebGL copy, navigation, and forms. Motion must respect `prefers-reduced-motion`; provide a static version of every animated section.

## Brand Commitments

- **Name:** CHRONOS ATELIER (all-caps in logotype; mixed case in body text where natural).
- **Voice:** Assured, unhurried, precise. No superlatives, no exclamation marks, no urgency mechanics. Sentences are short and declarative or long and clause-dense — never middling. Think: *Patek Philippe* catalogue prose meets *A. Lange & Söhne* technical rigour.
- **Visual identity (user-confirmed, binding):**
  - Background: Deep obsidian `#0A0A0C` — never pure black `#000000`.
  - Primary accent: Rose gold `#D4AF37` / `#E5C158`.
  - Surface metal: Brushed platinum — expressed as light-grey gradients and metallic sheen CSS/Three.js materials, not a flat colour.
  - Heading typeface: **Cormorant Garamond** (editorial weight, italic where evocative).
  - Technical / spec typeface: **JetBrains Mono** or **Space Grotesk** (specs, measurements, serial numbers, complication labels).
- **Anti-patterns (hard blocks, user-confirmed):**
  - No neon or high-chroma colours outside the rose-gold palette.
  - No bounce or spring easings — only cubic/quint/expo curves, or physically-driven (GSAP CustomEase matching a mechanical escapement waveform).
  - No card grids — collections are presented as full-bleed editorial sequences or architectural list layouts.
  - No generic SaaS hero layouts (headline + subtext + CTA button centred on a gradient blob).
  - No pure `#000000` black anywhere in the rendered output.

## Evidence on Hand

- Project repository: Next.js scaffold, Three.js installed, Lenis + GSAP installed.
- No product photography, 3D model files, or copy assets supplied yet. Future work must not fabricate watch names, prices, movement specs, or brand history. Use clearly labelled placeholder copy (`[REFERENCE NAME]`, `[CALIBRE NUMBER]`, etc.) until real assets are supplied.
- No logo file supplied. Logotype is typeset: `CHRONOS ATELIER` in Cormorant Garamond Semibold, tracked at +0.3em.

## Product Principles

1. **The interface is a finished surface.** Every spacing decision, easing curve, and colour value is a craft statement — identical discipline to a movement's finishing.
2. **Reveal depth slowly.** The visitor earns complexity. Lead with the whole, then the movement, then the complication, then the micron-level detail. Never front-load information.
3. **Physical coherence.** Motion must obey mechanical logic: gear rotation angles are arithmetically correct, easing curves model escapement impulse, scroll speed is constant and predictable.
4. **Contact over conversion.** No dark patterns, countdown timers, or inventory scarcity theatre. The acquisition path ends in a human being.
5. **Material honesty.** Placeholder content is labelled. Fabricated specifications, testimonials, or provenance claims are never acceptable at any stage of development.

## Accessibility & Inclusion

- WCAG 2.1 AA minimum for all non-WebGL surfaces.
- All Three.js scenes must have an `aria-label` describing the displayed object and a static fallback image served when `prefers-reduced-motion: reduce` is active or WebGL is unavailable.
- Focus management: keyboard navigation must reach every interactive element. No trap on the WebGL canvas.
- Colour contrast: all body text on obsidian background must meet 4.5:1. Rose-gold accent text on obsidian must be tested — use `#E5C158` (lighter variant) where contrast requires it.
