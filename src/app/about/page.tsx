'use client'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-void" style={{ position: 'relative', zIndex: 10 }}>
      <div style={{ padding: 'var(--sp-12) var(--gutter)', maxWidth: '800px', margin: '0 auto' }}>
        <p className="font-tech spec-label" style={{ color: 'var(--color-rose-gold)', marginBottom: 'var(--sp-5)' }}>
          THE MAISON
        </p>
        <h1 className="font-editorial" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 300, marginBottom: 'var(--sp-8)', color: 'var(--color-platinum-white)' }}>
          About <em style={{ color: 'var(--color-rose-gold-bright)', fontStyle: 'italic' }}>Chronos Atelier</em>
        </h1>
        <span className="rule-rose" aria-hidden="true" />
        <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <p style={{ color: 'var(--color-platinum-mid)', lineHeight: 1.8, fontSize: '1.1rem', fontFamily: 'var(--font-cormorant)' }}>
            Founded in the tradition of the Vallée de Joux, Chronos Atelier is a maison
            dedicated to the pursuit of mechanical perfection. Every timepiece is conceived,
            engineered, and finished by a single watchmaker — from the first sketch to the
            final regulation.
          </p>
          <p style={{ color: 'var(--color-platinum-mid)', lineHeight: 1.8, fontSize: '1.1rem', fontFamily: 'var(--font-cormorant)' }}>
            We do not manufacture watches at scale. Each Calibre 01 represents approximately
            120 hours of hand labour — chamfered bridges, blued screws heated to oxidation
            point, and a movement regulated to within two seconds per day.
          </p>
          <p style={{ color: 'var(--color-platinum-mid)', lineHeight: 1.8, fontSize: '1.1rem', fontFamily: 'var(--font-cormorant)' }}>
            Production is limited to 50 pieces per annum. There is no waitlist bypass.
            There is no exception to the standard.
          </p>
        </div>
        <div style={{ marginTop: 'var(--sp-12)', display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <Link href="/reserve" className="btn-atelier">
            Reserve a Timepiece
          </Link>
          <Link href="/contact" className="btn-atelier" style={{ background: 'transparent', borderColor: 'var(--color-platinum-dim)' }}>
            Contact the Atelier
          </Link>
        </div>
      </div>
    </main>
  )
}
