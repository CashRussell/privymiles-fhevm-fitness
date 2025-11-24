'use client';

import { useEffect, useState } from 'react';
import { useFitnessLeaderboardFull } from '../../hooks/useFitnessLeaderboardFull';

const BADGES = [
  { key: 'marathoner', name: 'Marathoner', desc: 'Total steps >= 42,195', icon: '🏃' },
  { key: 'centurion', name: 'Centurion', desc: 'Single activity >= 100 min', icon: '⏱️' },
  { key: 'calorieKing', name: 'Calorie King', desc: 'Single activity >= 1000 cal', icon: '👑' },
  { key: 'consistent', name: 'Consistent', desc: 'Total submissions >= 7', icon: '📅' },
  { key: 'committed', name: 'Committed', desc: 'Total minutes >= 500', icon: '💪' },
];

export default function BadgesPage() {
  const { userBadges, refreshUserBadges, loading, isConnected } = useFitnessLeaderboardFull();
  const [hasTriedLoad, setHasTriedLoad] = useState(false);
  
  useEffect(() => {
    if (isConnected && !hasTriedLoad && !loading) {
      setHasTriedLoad(true);
      refreshUserBadges();
    }
  }, [isConnected, hasTriedLoad, loading]);
  
  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <h2 style={{
        fontSize: 'var(--size-2xl)',
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-text)',
      }}>
        Badges
      </h2>
      <p style={{
        fontSize: 'var(--size-base)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        Achieve milestones to unlock encrypted badges.
      </p>
      
      <div className="card">
        {loading && !userBadges ? (
          <div style={{
            fontSize: 'var(--size-base)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: 'var(--spacing-lg)',
          }}>
            Loading badges...
          </div>
        ) : userBadges ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-lg)' }}>
            {BADGES.map((badge) => {
              const earned = userBadges[badge.key as keyof typeof userBadges];
              return (
                <div
                  key={badge.key}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    background: earned ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--color-surface)',
                    border: earned ? 'none' : '2px solid var(--color-border)',
                    transition: 'all 0.3s ease',
                    opacity: earned ? 1 : 0.6,
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-sm)' }}>
                    {earned ? badge.icon : '🔒'}
                  </div>
                  <div style={{
                    fontSize: 'var(--size-lg)',
                    fontWeight: 700,
                    color: earned ? 'white' : 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    {badge.name}
                  </div>
                  <div style={{
                    fontSize: 'var(--size-xs)',
                    color: earned ? 'rgba(255,255,255,0.9)' : 'var(--color-text-muted)',
                  }}>
                    {badge.desc}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            fontSize: 'var(--size-base)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
          }}>
            No badges available. Submit your activity data to start earning!
          </div>
        )}
        
        <button
          disabled={loading}
          onClick={refreshUserBadges}
          style={{
            marginTop: 'var(--spacing-lg)',
            width: '100%',
          }}
        >
          {loading ? 'Loading...' : 'Refresh Badges'}
        </button>
      </div>
    </main>
  );
}



