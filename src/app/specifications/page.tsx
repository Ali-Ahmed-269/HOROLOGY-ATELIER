'use client'
import Link from 'next/link'

const SPECS = [
  { label: 'Calibre', value: 'CA-01' },
  { label: 'Movement type', value: 'Manual-winding mechanical' },
  { label: 'Frequency', value: '28,800 vph / 4 Hz' },
  { label: 'Power reserve', value: '72 hours' },
  { label: 'Jewels', value: '27 jewels' },
  { label: 'Components', value: '312 parts' },
  { label: 'Case diameter', value: '40 mm' },
  { label: 'Case thickness', value: '9.8 mm' },
  { label: 'Case material', value: 'Grade 5 titanium / 18k rose gold' },
  { label: 'Crystal', value: 'Sapphire, AR-coated, 1.77 IOR' },
  { label: 'Water resistance', value: '50 m / 5 ATM' },
  { label: 'Limited edition', value: '50 pieces per annum' },
]

export default function SpecificationsPage() {
  return (
    <main className="min-h-dvh bg-void" style={{ position: 'relative', zIndex: 10 }}>
      <div style={{ padding: 'var(--sp-12) var(--gutter)', maxWidth: '800px', margin: '0 auto' }}>
        <p className="font-tech spec-label" style={{ color: 'var(--color-rose-gold)', marginBottom: 'var(--sp-5)' }}>
          TECHNICAL DATA
        </p>
        <h1 className="font-editorial" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 300, marginBottom: 'var(--sp-8)', color: 'var(--color-platinum-white)' }}>
          Technical <em style={{ color: 'var(--color-rose-gold-bright)', fontStyle: 'italic' }}>Specifications</em>
        </h1>
        <span className="rule-rose" aria-hidden="true" />
        <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(212,175,55,0.1)' }}>
          {SPECS.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--sp-4) var(--sp-5)',
                background: 'var(--color-void)',
                gap: 'var(--sp-4)',
              }}
            >
              <span className="font-tech spec-label">{label}</span>
              <span style={{ color: 'var(--color-platinum-white)', fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', textAlign: 'right' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--sp-12)', display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <Link href="/reserve" className="btn-atelier">
            Reserve a Timepiece
          </Link>
          <Link href="/" className="btn-atelier" style={{ background: 'transparent', borderColor: 'var(--color-platinum-dim)' }}>
            View the Movement
          </Link>
        </div>
      </div>
    </main>
  )
}
