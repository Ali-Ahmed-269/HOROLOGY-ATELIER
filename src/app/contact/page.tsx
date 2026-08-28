'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-dvh bg-void" style={{ position: 'relative', zIndex: 10 }}>
      <div style={{ padding: 'var(--sp-12) var(--gutter)', maxWidth: '600px', margin: '0 auto' }}>
        <p className="font-tech spec-label" style={{ color: 'var(--color-rose-gold)', marginBottom: 'var(--sp-5)' }}>
          GET IN TOUCH
        </p>
        <h1 className="font-editorial" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 300, marginBottom: 'var(--sp-8)', color: 'var(--color-platinum-white)' }}>
          Contact <em style={{ color: 'var(--color-rose-gold-bright)', fontStyle: 'italic' }}>the Atelier</em>
        </h1>
        <span className="rule-rose" aria-hidden="true" />
        {!submitted ? (
          <div style={{ marginTop: 'var(--sp-8)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            {[
              { label: 'Full Name', type: 'text', id: 'name', placeholder: 'Your name' },
              { label: 'Email Address', type: 'email', id: 'email', placeholder: 'your@email.com' },
              { label: 'Subject', type: 'text', id: 'subject', placeholder: 'Enquiry subject' },
            ].map(({ label, type, id, placeholder }) => (
              <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                <label htmlFor={id} className="font-tech spec-label">{label}</label>
                <input
                  type={type}
                  id={id}
                  placeholder={placeholder}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '2px',
                    padding: 'var(--sp-3) var(--sp-4)',
                    color: 'var(--color-platinum-white)',
                    fontSize: '16px',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <label htmlFor="message" className="font-tech spec-label">Message</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Your message..."
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: '2px',
                  padding: 'var(--sp-3) var(--sp-4)',
                  color: 'var(--color-platinum-white)',
                  fontSize: '16px',
                  outline: 'none',
                  width: '100%',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={() => setSubmitted(true)}
              className="btn-atelier"
              style={{ marginTop: 'var(--sp-4)', alignSelf: 'flex-start' }}
            >
              Send Message
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 'var(--sp-8)', textAlign: 'center', padding: 'var(--sp-12) 0' }}>
            <p style={{ color: 'var(--color-rose-gold)', fontSize: '1.5rem', fontFamily: 'var(--font-cormorant)', marginBottom: 'var(--sp-4)' }}>
              Message received.
            </p>
            <p style={{ color: 'var(--color-platinum-mid)', fontFamily: 'var(--font-cormorant)' }}>
              A member of the atelier will respond within 48 hours.
            </p>
            <Link href="/" className="btn-atelier" style={{ display: 'inline-block', marginTop: 'var(--sp-8)' }}>
              Return Home
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
