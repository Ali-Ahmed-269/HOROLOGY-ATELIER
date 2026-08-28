'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import LenisProvider from '@/components/LenisProvider'
import LoadingVeil from '@/components/LoadingVeil'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/* ── Dynamic imports for client-only 3D canvas ─────────────────────── */
const SceneCanvas = dynamic(
  () => import('@/components/canvas/SceneCanvas'),
  { ssr: false }
)

/* ─────────────────────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────────────────────── */
function Navigation() {
  const activeId = useActiveSection()
  const { reducedMotion, setManualOverride } = useReducedMotion()

  const handleToggle = () => {
    // Cycle: if currently overridden, check if we should clear it
    // Simple toggle: flip the effective state and store as manual override
    setManualOverride(!reducedMotion)
  }

  return (
    <header className="nav-bar" role="banner">
      <a href="#hero" className="nav-logotype" aria-label="CHRONOS ATELIER — Return to top">
        CHRONOS ATELIER
      </a>

      <nav aria-label="Primary navigation">
        <ul className="nav-links">
          {[
            { href: '#movement',      label: 'Movement',       scroll: true  },
            { href: '#craftsmanship', label: 'Craftsmanship',  scroll: true  },
            { href: '#specs',         label: 'Specifications', scroll: true  },
            { href: '#reserve',       label: 'Reserve',        scroll: true  },
            { href: '/about',         label: 'About',          scroll: false },
            { href: '/contact',       label: 'Contact',        scroll: false },
          ].map(({ href, label, scroll }) => {
            const sectionId = href.startsWith('#') ? href.slice(1) : href.slice(1)
            const isActive = activeId === sectionId
            return (
              <li key={href}>
                {scroll ? (
                  <a
                    href={href}
                    className={`nav-link${isActive ? ' active' : ''}`}
                    id={`nav-${sectionId}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {label}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="nav-link"
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Reduce-motion toggle — small accessible icon button */}
      <button
        id="nav-reduce-motion"
        type="button"
        aria-label="Reduce motion"
        aria-pressed={reducedMotion}
        onClick={handleToggle}
        title={reducedMotion ? 'Motion reduced — click to restore' : 'Click to reduce motion'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          background: reducedMotion
            ? 'rgba(212, 175, 55, 0.12)'
            : 'transparent',
          border: `1px solid ${reducedMotion ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`,
          borderRadius: 0,
          cursor: 'pointer',
          color: reducedMotion
            ? 'var(--color-rose-gold-bright)'
            : 'var(--color-platinum-dim)',
          transition:
            'color 120ms ease, background 120ms ease, border-color 120ms ease',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-rose-gold-bright)'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.5)'
        }}
        onMouseLeave={e => {
          if (!reducedMotion) {
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-platinum-dim)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,175,55,0.2)'
          }
        }}
      >
        {reducedMotion ? (
          // Motion-off icon: eye with a diagonal line through it
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          // Motion-on icon: eye
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </header>
  )
}

/* ─────────────────────────────────────────────────────────────
   Shared Section Rule
   ───────────────────────────────────────────────────────────── */
function SectionRule() {
  return <span className="rule-rose" aria-hidden="true" />
}

/* ─────────────────────────────────────────────────────────────
   Section 01 — Hero
   ───────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      id="hero"
      className="section-atelier"
      aria-labelledby="hero-heading"
      style={{ minHeight: '100vh', justifyContent: 'flex-end', paddingBottom: 'var(--sp-12)' }}
    >
      <div className="section-inner">
        {/* Eyebrow */}
        <p
          className="font-tech spec-label"
          style={{ marginBottom: 'var(--sp-5)', color: 'var(--color-rose-gold)' }}
          aria-hidden="true"
        >
          REF. CA-01 · CALIBRE 01 · 2024
        </p>

        {/* Hero headline — Cormorant Garamond, extreme scale */}
        <h1
          id="hero-heading"
          className="font-editorial tracking-display text-platinum-white"
          style={{
            fontSize: 'var(--text-hero)',
            fontWeight: 300,
            lineHeight: 0.95,
            letterSpacing: '0.03em',
            maxWidth: '14ch',
            marginBottom: 'var(--sp-8)',
          }}
        >
          CHRONOS
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--color-rose-gold-bright)' }}>
            ATELIER
          </em>
        </h1>

        {/* Calibre designation */}
        <p
          className="font-tech spec-value"
          style={{
            fontSize: 'var(--text-title)',
            marginBottom: 'var(--sp-6)',
            letterSpacing: '0.1em',
          }}
        >
          CALIBRE&nbsp;01
        </p>

        <SectionRule />

        {/* Editorial subtitle */}
        <p
          className="font-editorial"
          style={{
            fontSize: 'var(--text-subtitle)',
            color: 'var(--color-platinum-mid)',
            fontStyle: 'italic',
            maxWidth: '42ch',
            marginTop: 'var(--sp-6)',
            marginBottom: 'var(--sp-8)',
            lineHeight: 1.5,
          }}
        >
          A movement built in the tradition of the Vallée de Joux — every bridge
          chamfered by hand, every jewel set under 40× magnification.
        </p>

        {/* CTA pair */}
        <div className="hero-actions" style={{ display: 'flex', gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
          <a
            href="#movement"
            className="btn-atelier"
            id="hero-explore-cta"
            aria-label="Explore the movement architecture"
          >
            Explore the Movement
          </a>
          <a
            href="#reserve"
            className="btn-atelier"
            id="hero-reserve-cta"
            style={{ borderColor: 'rgba(212,175,55,0.35)', color: 'var(--color-platinum-mid)' }}
            aria-label="Reserve or inquire about this timepiece"
          >
            Reserve a Timepiece
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 'var(--sp-8)',
            right: 'var(--gutter)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--sp-3)',
          }}
        >
          <span
            className="font-tech spec-label"
            style={{ writingMode: 'vertical-rl', letterSpacing: '0.15em' }}
          >
            SCROLL
          </span>
          <svg width="1" height="48" aria-hidden="true">
            <line
              x1="0.5" y1="0" x2="0.5" y2="48"
              stroke="var(--color-rose-gold)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section 02 — The Movement
   ───────────────────────────────────────────────────────────── */
function MovementSection() {
  return (
    <section
      id="movement"
      className="section-atelier"
      aria-labelledby="movement-heading"
      style={{ minHeight: '200vh' }} // tall: scroll-locked exploded view
    >
      <div
        className="section-inner"
        style={{ position: 'sticky', top: '25vh' }}
      >
        {/* Section index */}
        <p className="font-tech spec-label" style={{ marginBottom: 'var(--sp-5)' }}>
          02 / ARCHITECTURE
        </p>

        <SectionRule />

        <h2
          id="movement-heading"
          className="font-editorial tracking-display text-platinum-white"
          style={{
            fontSize: 'var(--text-display)',
            fontWeight: 300,
            lineHeight: 1.05,
            marginTop: 'var(--sp-6)',
            marginBottom: 'var(--sp-6)',
            maxWidth: '20ch',
          }}
        >
          Exploded{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--color-rose-gold-bright)' }}>
            Architecture
          </em>
        </h2>

        <p
          className="font-editorial"
          style={{
            fontSize: 'var(--text-subtitle)',
            color: 'var(--color-platinum-mid)',
            fontStyle: 'italic',
            maxWidth: '48ch',
            lineHeight: 1.55,
            marginBottom: 'var(--sp-10)',
          }}
        >
          Scroll to disassemble Calibre 01 into its 4 constituent
          components. Each part occupies its exact functional position — there
          is no aesthetic arrangement.
        </p>

        {/* Spec trio */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--sp-7)',
            maxWidth: '640px',
          }}
          role="list"
          aria-label="Movement specifications"
        >
          {[
            { label: 'Jewels',       value: '27 J',     id: 'spec-jewels'     },
            { label: 'Frequency',    value: '4 Hz',     id: 'spec-frequency'  },
            { label: 'Power reserve', value: '72 h',    id: 'spec-reserve'    },
          ].map(({ label, value, id }) => (
            <div key={id} role="listitem" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: 'var(--sp-5)' }}>
              <p className="spec-label" id={id} style={{ marginBottom: 'var(--sp-2)' }}>
                {label}
              </p>
              <p className="spec-value" aria-labelledby={id}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section 03 — Craftsmanship
   ───────────────────────────────────────────────────────────── */
function CraftsmanshipSection() {
  return (
    <section
      id="craftsmanship"
      className="section-atelier"
      aria-labelledby="craftsmanship-heading"
      style={{ minHeight: '120vh' }}
    >
      <div className="section-inner">
        <p className="font-tech spec-label" style={{ marginBottom: 'var(--sp-5)' }}>
          03 / FINISHING
        </p>

        <SectionRule />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--sp-9)',
            marginTop: 'var(--sp-8)',
            alignItems: 'end',
          }}
        >
          {/* Left — headline */}
          <div>
            <h2
              id="craftsmanship-heading"
              className="font-editorial text-platinum-white"
              style={{
                fontSize: 'var(--text-display)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '0.03em',
              }}
            >
              Hand&#8209;Finished{' '}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-rose-gold-bright)' }}>
                Precision
              </em>
            </h2>
          </div>

          {/* Right — editorial body */}
          <div>
            <p
              className="font-editorial"
              style={{
                fontSize: 'var(--text-subtitle)',
                color: 'var(--color-platinum-mid)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                marginBottom: 'var(--sp-7)',
              }}
            >
              Each bridge and plate receives Geneva Stripes applied by
              hand, then edge chamfering — the beveling of every visible edge under
              40× magnification — before a final hand-polishing pass that takes
              a skilled finisher approximately 120 hours per movement.
            </p>

            {/* Finishing technique list */}
            <ul
              style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
              aria-label="Finishing techniques applied"
            >
              {[
                'Geneva Stripes',
                'Hand-chamfered edges',
                'Perlage — circular graining on hidden surfaces',
                'Blued screws — heated to oxidation point',
              ].map((technique, i) => (
                <li
                  key={i}
                  className="font-tech"
                  style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-platinum-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-4)',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 20,
                      height: 1,
                      background: 'var(--color-rose-gold)',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  {technique}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section 04 — Technical Specifications
   ───────────────────────────────────────────────────────────── */
function SpecsSection() {
  const specs = [
    { label: 'Reference',         value: 'CA-[REFERENCE]',      id: 'ref-number'    },
    { label: 'Calibre',           value: 'CA-01',               id: 'calibre'       },
    { label: 'Movement type',     value: 'Mechanical, manual',  id: 'mv-type'       },
    { label: 'Frequency',         value: '28,800 vph / 4 Hz',   id: 'frequency'     },
    { label: 'Power reserve',     value: '72 hours',            id: 'power-reserve' },
    { label: 'Jewels',            value: '27 jewels',           id: 'jewels'        },
    { label: 'Components',        value: '312 parts',           id: 'components'    },
    { label: 'Balance wheel',     value: '[TYPE]',              id: 'balance'       },
    { label: 'Escapement',        value: '[TYPE]',              id: 'escapement'    },
    { label: 'Case material',     value: 'Rose gold 18k',       id: 'case-mat'      },
    { label: 'Case diameter',     value: '[Nmm]',               id: 'diameter'      },
    { label: 'Case height',       value: '[N.N mm]',            id: 'height'        },
    { label: 'Crystal',           value: 'Sapphire, double AR', id: 'crystal'       },
    { label: 'Water resistance',  value: '50 m / 5 ATM',        id: 'water'         },
    { label: 'Strap',             value: '[MATERIAL], [CLASP]', id: 'strap'         },
    { label: 'Limited edition',   value: '50 pieces',           id: 'edition'       },
  ]

  return (
    <section
      id="specs"
      className="section-atelier"
      aria-labelledby="specs-heading"
      style={{ minHeight: '100vh' }}
    >
      <div className="section-inner">
        <p className="font-tech spec-label" style={{ marginBottom: 'var(--sp-5)' }}>
          04 / SPECIFICATIONS
        </p>

        <SectionRule />

        <h2
          id="specs-heading"
          className="font-editorial text-platinum-white"
          style={{
            fontSize: 'var(--text-display)',
            fontWeight: 300,
            lineHeight: 1.05,
            marginTop: 'var(--sp-6)',
            marginBottom: 'var(--sp-10)',
            letterSpacing: '0.03em',
          }}
        >
          Horological{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--color-rose-gold-bright)' }}>
            Specifications
          </em>
        </h2>

        {/* Specification table — architectural list layout */}
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0',
            maxWidth: '900px',
          }}
          aria-label="Full technical specifications"
        >
          {specs.map(({ label, value, id }, i) => (
            <div
              key={id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridColumn: '1 / -1',
                padding: 'var(--sp-5) 0',
                borderBottom: '1px solid rgba(212, 175, 55, 0.10)',
                gap: 'var(--sp-6)',
                alignItems: 'baseline',
                opacity: i < 4 ? 1 : 0.85,
              }}
            >
              <dt
                className="font-ui spec-label"
                id={id}
                style={{ fontSize: 'var(--text-caption)' }}
              >
                {label}
              </dt>
              <dd
                className="font-tech spec-value"
                aria-labelledby={id}
                style={{ textAlign: 'right' }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Dossier download link */}
        <div style={{ marginTop: 'var(--sp-10)' }}>
          <a
            href="#reserve"
            className="btn-atelier"
            id="specs-dossier-cta"
            aria-label="Request the technical dossier for this reference"
          >
            Request Technical Dossier
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Section 05 — Reserve / Acquisition
   ───────────────────────────────────────────────────────────── */
function ReserveSection() {
  return (
    <section
      id="reserve"
      className="section-atelier"
      aria-labelledby="reserve-heading"
      style={{ minHeight: '100vh' }}
    >
      <div className="section-inner">
        <p className="font-tech spec-label" style={{ marginBottom: 'var(--sp-5)' }}>
          05 / ACQUISITION
        </p>

        <SectionRule />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--sp-9)',
            marginTop: 'var(--sp-8)',
          }}
        >
          {/* Left — headline + editorial */}
          <div>
            <h2
              id="reserve-heading"
              className="font-editorial text-platinum-white"
              style={{
                fontSize: 'var(--text-display)',
                fontWeight: 300,
                lineHeight: 1.05,
                marginBottom: 'var(--sp-6)',
                letterSpacing: '0.03em',
              }}
            >
              Acquisition{' '}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--color-rose-gold-bright)' }}>
                &amp; Inquiry
              </em>
            </h2>

            <p
              className="font-editorial"
              style={{
                fontSize: 'var(--text-subtitle)',
                color: 'var(--color-platinum-mid)',
                fontStyle: 'italic',
                lineHeight: 1.65,
                maxWidth: '42ch',
                marginBottom: 'var(--sp-8)',
              }}
            >
              CHRONOS ATELIER does not sell watches. It places them. Each
              reference is presented in a private consultation — in Geneva,
              London, or New York — with a member of the atelier.
            </p>

            <p
              className="font-tech"
              style={{
                fontSize: 'var(--text-caption)',
                color: 'var(--color-platinum-dim)',
                letterSpacing: '0.04em',
                lineHeight: 1.8,
              }}
            >
              Production: 50 pieces per annum
              <br />
              Current waitlist: 18 months
              <br />
              Price available upon private inquiry
            </p>
          </div>

          {/* Right — inquiry form */}
          <div>
            <form
              aria-label="Private inquiry form"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}
              onSubmit={(e) => e.preventDefault()}
            >
              {[
                { id: 'form-name',        label: 'Full name',          type: 'text',  placeholder: ''                },
                { id: 'form-email',       label: 'Email address',      type: 'email', placeholder: ''                },
                { id: 'form-reference',   label: 'Reference of interest', type: 'text', placeholder: 'e.g. CA-01'   },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  <label
                    htmlFor={id}
                    className="font-tech spec-label"
                    style={{ fontSize: 'var(--text-micro)' }}
                  >
                    {label}
                  </label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    autoComplete={type === 'email' ? 'email' : type === 'text' && id === 'form-name' ? 'name' : 'off'}
                    style={{
                      background: 'var(--color-obsidian-3)',
                      border: '1px solid rgba(212,175,55,0.18)',
                      borderRadius: 0,
                      padding: '14px 16px',
                      color: 'var(--color-platinum-white)',
                      fontFamily: 'var(--font-space-grotesk, sans-serif)',
                      fontSize: '16px',
                      letterSpacing: '0.01em',
                      outline: 'none',
                      width: '100%',
                      transition: 'border-color var(--dur-fast) var(--ease-sweep)',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-rose-gold)' }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)' }}
                  />
                </div>
              ))}

              {/* Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                <label
                  htmlFor="form-message"
                  className="font-tech spec-label"
                  style={{ fontSize: 'var(--text-micro)' }}
                >
                  Message (optional)
                </label>
                <textarea
                  id="form-message"
                  rows={4}
                  style={{
                    background: 'var(--color-obsidian-3)',
                    border: '1px solid rgba(212,175,55,0.18)',
                    borderRadius: 0,
                    padding: '14px 16px',
                    color: 'var(--color-platinum-white)',
                    fontFamily: 'var(--font-space-grotesk, sans-serif)',
                    fontSize: '16px',
                    letterSpacing: '0.01em',
                    outline: 'none',
                    width: '100%',
                    resize: 'vertical',
                    transition: 'border-color var(--dur-fast) var(--ease-sweep)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-rose-gold)' }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.18)' }}
                />
              </div>

              <button
                type="submit"
                className="btn-atelier"
                id="reserve-submit-cta"
                style={{ alignSelf: 'flex-start' }}
                aria-label="Submit private inquiry to CHRONOS ATELIER"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>

        {/* Footer rule + credit */}
        <div style={{ marginTop: 'var(--sp-12)', paddingTop: 'var(--sp-6)', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
          <p
            className="font-tech text-micro"
            style={{ color: 'var(--color-platinum-dim)', letterSpacing: '0.08em' }}
          >
            CHRONOS ATELIER · MANUFACTURE HORLOGÈRE · GENEVA
            <span style={{ margin: '0 var(--sp-4)', color: 'var(--color-rose-gold-deep)' }}>·</span>
            All specifications subject to change without notice.
            Placeholder values marked [BRACKET] are to be replaced with confirmed product data.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   Page — Root composition
   ───────────────────────────────────────────────────────────── */
export default function Home() {
  const [canvasReady, setCanvasReady] = useState(false)
  const handleCanvasReady = useCallback(() => setCanvasReady(true), [])

  return (
    <LenisProvider>
      {/* Precision loading veil — fades once canvas hydrates */}
      <LoadingVeil isReady={canvasReady} />

      {/* Fixed WebGL canvas — z-index 0, pointer-events none */}
      <SceneCanvas onReady={handleCanvasReady} />
      <div id="hud-overlay" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 15,
        pointerEvents: 'none',
      }}>
        {([
          { id: 'caseback', label: 'MAINSPRING BARREL',      spec: '72-Hour Power Reserve',        top: '65%', left: '72%' },
          { id: 'bridges',  label: 'MOVEMENT ARCHITECTURE',  spec: 'Geneva Stripes · Blued Screws', top: '55%', left: '72%' },
          { id: 'dial',     label: 'DIAL & HOUR MARKERS',    spec: 'Applied Indices · Rose Gold',   top: '45%', left: '72%' },
          { id: 'crystal',  label: 'SAPPHIRE CRYSTAL',       spec: 'AR Coated · 1.77 IOR',          top: '35%', left: '72%' },
          { id: 'hands',    label: 'WATCH HANDS',             spec: 'Rhodium-Plated · Rose Gold Seconds', top: '25%', left: '72%' },
        ] as const).map(({ id, label, spec, top, left }) => (
          <div
            key={id}
            id={`hud-${id}`}
            className="hud-callout"
            style={{
              position: 'absolute',
              top,
              left,
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          >
            <span className="hud-label">{label}</span>
            <span className="hud-spec">{spec}</span>
          </div>
        ))}
      </div>

      {/* Scrollable HTML overlay — z-index 10 */}
      <div
        style={{ position: 'relative', zIndex: 10 }}
        role="main"
        id="main-content"
      >
        {/* Skip to main content — accessibility */}
        <a
          href="#hero"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 'auto',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
          onFocus={(e) => {
            e.currentTarget.style.left = 'var(--gutter)'
            e.currentTarget.style.top = '80px'
            e.currentTarget.style.width = 'auto'
            e.currentTarget.style.height = 'auto'
            e.currentTarget.style.overflow = 'visible'
          }}
          onBlur={(e) => {
            e.currentTarget.style.left = '-9999px'
          }}
        >
          Skip to main content
        </a>

        <Navigation />

        <main>
          <HeroSection />
          <MovementSection />
          <CraftsmanshipSection />
          <SpecsSection />
          <ReserveSection />
        </main>
      </div>
    </LenisProvider>
  )
}
