'use client';

import { BucketsPanel } from '../../components/BucketsPanel';

export default function LeaderboardPage() {
  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <h2 style={{
        fontSize: 'var(--size-2xl)',
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-text)',
      }}>
        Leaderboard
      </h2>
      <p style={{
        fontSize: 'var(--size-base)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        Public distributions and quantiles (no individual values).
      </p>
      <BucketsPanel />
    </main>
  );
}



