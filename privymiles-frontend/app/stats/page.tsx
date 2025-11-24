'use client';

import { TotalsPanel } from '../../components/TotalsPanel';

export default function StatsPage() {
  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <h2 style={{
        fontSize: 'var(--size-2xl)',
        marginBottom: 'var(--spacing-lg)',
        color: 'var(--color-text)',
      }}>
        Stats
      </h2>
      <TotalsPanel />
    </main>
  );
}



