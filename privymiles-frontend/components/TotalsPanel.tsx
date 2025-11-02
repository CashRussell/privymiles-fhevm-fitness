'use client';

import { useEffect, useState } from 'react';
import { useFitnessLeaderboardFull } from '../hooks/useFitnessLeaderboardFull';

export function TotalsPanel() {
  const { userStats, userLatest, refreshUserStats, refreshUserLatest, loading, isConnected } = useFitnessLeaderboardFull();
  const [hasTriedLoadStats, setHasTriedLoadStats] = useState(false);
  const [hasTriedLoadLatest, setHasTriedLoadLatest] = useState(false);
  
  useEffect(() => {
    if (isConnected && !hasTriedLoadStats && !loading) {
      setHasTriedLoadStats(true);
      refreshUserStats();
    }
  }, [isConnected, hasTriedLoadStats, loading]);

  useEffect(() => {
    if (isConnected && userStats && userStats.submissionCount > 0 && !hasTriedLoadLatest && !loading) {
      setHasTriedLoadLatest(true);
      refreshUserLatest();
    }
  }, [isConnected, userStats, hasTriedLoadLatest, loading]);

  return (
    <section className="card">
      {loading && !userStats ? (
        <div style={{
          fontSize: 'var(--size-base)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}>
          Loading your stats...
        </div>
      ) : userStats && userStats.submissionCount > 0 ? (
        <>
          <div className="grid-3">
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
            }}>
              <div style={{
                fontSize: 'var(--size-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                My Total Steps
              </div>
              <div style={{
                fontSize: 'var(--size-2xl)',
                fontWeight: 700,
                color: 'var(--color-primary)',
              }}>
                {userStats.steps}
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
            }}>
              <div style={{
                fontSize: 'var(--size-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                My Total Minutes
              </div>
              <div style={{
                fontSize: 'var(--size-2xl)',
                fontWeight: 700,
                color: 'var(--color-secondary)',
              }}>
                {userStats.minutes}
              </div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
            }}>
              <div style={{
                fontSize: 'var(--size-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-xs)',
              }}>
                My Total Calories
              </div>
              <div style={{
                fontSize: 'var(--size-2xl)',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}>
                {userStats.calories}
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 'var(--spacing-md)',
            padding: 'var(--spacing-sm)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 'var(--size-sm)', color: 'var(--color-text-muted)' }}>
              Total Submissions: 
            </span>
            <span style={{ 
              fontSize: 'var(--size-lg)', 
              fontWeight: 700, 
              color: 'var(--color-primary)',
              marginLeft: 'var(--spacing-xs)',
            }}>
              {userStats.submissionCount}
            </span>
          </div>
          {userLatest && (
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h3 style={{
                fontSize: 'var(--size-lg)',
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-text)',
              }}>
                Latest Submission
              </h3>
              <div className="grid-3">
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                }}>
                  <div style={{
                    fontSize: 'var(--size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    Latest Steps
                  </div>
                  <div style={{
                    fontSize: 'var(--size-xl)',
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                  }}>
                    {userLatest.steps}
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                }}>
                  <div style={{
                    fontSize: 'var(--size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    Latest Minutes
                  </div>
                  <div style={{
                    fontSize: 'var(--size-xl)',
                    fontWeight: 700,
                    color: 'var(--color-secondary)',
                  }}>
                    {userLatest.minutes}
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                }}>
                  <div style={{
                    fontSize: 'var(--size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    Latest Calories
                  </div>
                  <div style={{
                    fontSize: 'var(--size-xl)',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                  }}>
                    {userLatest.calories}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{
          fontSize: 'var(--size-base)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}>
          No submissions yet. Submit your activity data to see your stats.
        </div>
      )}
      <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          disabled={loading}
          onClick={refreshUserStats}
          style={{
            flex: 1,
          }}
        >
          {loading ? 'Loading...' : 'Refresh Stats'}
        </button>
        {userStats && userStats.submissionCount > 0 && (
          <button
            disabled={loading}
            onClick={refreshUserLatest}
            style={{
              flex: 1,
            }}
          >
            {loading ? 'Loading...' : 'Refresh Latest'}
          </button>
        )}
      </div>
    </section>
  );
}
