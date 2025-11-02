'use client';

import { useEffect, useState } from 'react';
import { useFitnessLeaderboardFull } from '../hooks/useFitnessLeaderboardFull';

const STEP_LABELS = ['0-2K', '2K-5K', '5K-10K', '10K-20K', '20K+'];
const MINUTE_LABELS = ['0-30', '30-60', '60-90', '90-120', '120+'];
const CALORIE_LABELS = ['0-200', '200-400', '400-600', '600-800', '800+'];

const COLORS = ['#20B2AA', '#3CB371', '#48D1CC', '#00CED1', '#00FA9A'];

function PieChart({ buckets, labels, title, colors }: { buckets: number[] | null; labels: string[]; title: string; colors: string[] }) {
  const total = buckets ? buckets.reduce((sum, count) => sum + count, 0) : 0;
  const hasData = buckets && total > 0;
  
  let currentAngle = -90;
  const segments = buckets ? buckets.map((count, idx) => {
    const angle = hasData ? (count / total) * 360 : 0;
    const segment = { ...{idx, count, angle, color: colors[idx], label: labels[idx], currentAngle} };
    currentAngle += angle;
    return segment;
  }) : [];
  
  return (
    <div style={{
      marginBottom: 'var(--spacing-xl)',
    }}>
      <h4 style={{
        fontSize: 'var(--size-lg)',
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text)',
      }}>
        {title}
      </h4>
      
      {hasData ? (
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '0 0 200px' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ display: 'block' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--color-surface)" strokeWidth="20" />
              {segments.map((seg, idx) => {
                if (seg.angle <= 0) return null;
                const largeArcFlag = seg.angle > 180 ? 1 : 0;
                const x1 = 100 + 90 * Math.cos((seg.currentAngle * Math.PI) / 180);
                const y1 = 100 + 90 * Math.sin((seg.currentAngle * Math.PI) / 180);
                const x2 = 100 + 90 * Math.cos(((seg.currentAngle + seg.angle) * Math.PI) / 180);
                const y2 = 100 + 90 * Math.sin(((seg.currentAngle + seg.angle) * Math.PI) / 180);
                return (
                  <path
                    key={idx}
                    d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="var(--color-background)"
                    strokeWidth="2"
                  />
                );
              })}
              <text x="100" y="105" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-sans)">
                {total}
              </text>
              <text x="100" y="125" textAnchor="middle" fontSize="12" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">
                Total
              </text>
            </svg>
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            {segments.map((seg, idx) => {
              if (seg.count === 0) return null;
              const percentage = ((seg.count / total) * 100).toFixed(1);
              return (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-sm)',
                    background: seg.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 'var(--size-sm)', color: 'var(--color-text-muted)', minWidth: '60px' }}>
                    {seg.label}
                  </span>
                  <span style={{ fontSize: 'var(--size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {seg.count}
                  </span>
                  <span style={{ fontSize: 'var(--size-xs)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: 'var(--size-sm)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--spacing-md)',
        }}>
          No data
        </div>
      )}
    </div>
  );
}

export function BucketsPanel() {
  const { stepBuckets, minuteBuckets, calorieBuckets, refreshBuckets, loading, isConnected } = useFitnessLeaderboardFull();
  const [hasTriedLoad, setHasTriedLoad] = useState(false);
  
  useEffect(() => {
    if (isConnected && !hasTriedLoad && !loading) {
      setHasTriedLoad(true);
      refreshBuckets();
    }
  }, [isConnected, hasTriedLoad, loading]);
  
  const hasAnyData = stepBuckets || minuteBuckets || calorieBuckets;
  
  return (
    <section className="card">
      {loading && !hasAnyData ? (
        <div style={{
          fontSize: 'var(--size-base)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}>
          Loading distribution...
        </div>
      ) : hasAnyData ? (
        <>
          <PieChart buckets={stepBuckets} labels={STEP_LABELS} title="Step Distribution" colors={COLORS} />
          <PieChart buckets={minuteBuckets} labels={MINUTE_LABELS} title="Duration Distribution" colors={COLORS} />
          <PieChart buckets={calorieBuckets} labels={CALORIE_LABELS} title="Calorie Distribution" colors={COLORS} />
        </>
      ) : (
        <p style={{
          fontSize: 'var(--size-base)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: 'var(--spacing-lg)',
        }}>
          No data available
        </p>
      )}
      
      <button
        disabled={loading}
        onClick={refreshBuckets}
        style={{
          marginTop: 'var(--spacing-lg)',
          width: '100%',
        }}
      >
        {loading ? 'Loading...' : 'Refresh Distribution'}
      </button>
    </section>
  );
}

