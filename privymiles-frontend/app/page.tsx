'use client';

import Link from 'next/link';

export default function Page() {
  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <section className="card" style={{
        background: 'var(--color-surface)',
        padding: 'var(--spacing-xl)',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 'var(--size-2xl)',
          marginBottom: 'var(--spacing-md)',
          color: 'var(--color-primary)',
        }}>
          Private Fitness Leaderboards powered by FHE
        </h1>
        <p style={{
          maxWidth: '720px',
          marginBottom: 'var(--spacing-lg)',
          fontSize: 'var(--size-lg)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.8,
        }}>
          Encrypt your workouts. Own your stats. Share only what matters — public totals and badges without revealing individual values.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <Link href="/submit">
            <button style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: 'var(--size-base)',
            }}>
              Enter App
            </button>
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById('how');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              fontSize: 'var(--size-base)',
              background: 'var(--color-secondary)',
            }}
          >
            How it works
          </button>
        </div>
      </section>

      <section id="how" style={{
        marginTop: 'var(--spacing-xl)',
        maxWidth: '800px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <h2 style={{
          fontSize: 'var(--size-xl)',
          marginBottom: 'var(--spacing-md)',
          color: 'var(--color-text)',
        }}>
          How It Works
        </h2>
        <ol style={{
          listStyle: 'none',
          counterReset: 'step-counter',
          display: 'grid',
          gap: 'var(--spacing-md)',
        }}>
          {[
            'Connect wallet (silent restore on refresh)',
            'Encrypt steps/minutes/calories in-browser',
            'Submit encrypted activity on-chain',
            'View public totals and badges after decryption authorization',
          ].map((text, i) => (
            <li
              key={i}
              style={{
                counterIncrement: 'step-counter',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-md)',
              }}
            >
              <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                color: 'var(--color-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 'var(--size-base)',
              }}>
                {i + 1}
              </div>
              <span style={{
                fontSize: 'var(--size-base)',
                lineHeight: 1.8,
                color: 'var(--color-text)',
              }}>
                {text}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}



