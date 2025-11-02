'use client';

import { useState } from 'react';
import { useFitnessLeaderboardFull } from '../../hooks/useFitnessLeaderboardFull';

export default function SubmitPage() {
  const { submitActivity, loading, isConnected, connect, fhevmStatus, fhevmError } = useFitnessLeaderboardFull();
  const [steps, setSteps] = useState('');
  const [minutes, setMinutes] = useState('');
  const [calories, setCalories] = useState('');
  
  const isFhevmReady = fhevmStatus === 'ready';
  const isFhevmLoading = fhevmStatus === 'loading';

  return (
    <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'var(--size-2xl)',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--color-text)',
        }}>
          Encrypt & Submit
        </h2>
        <p style={{
          fontSize: 'var(--size-base)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--spacing-xl)',
        }}>
          Enter your fitness data to submit encrypted activity metrics on-chain.
        </p>
        
        {!isConnected && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
              Please connect your wallet to submit activity data.
            </p>
            <button
              onClick={connect}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                fontSize: 'var(--size-base)',
              }}
            >
              Connect Wallet
            </button>
          </div>
        )}
        
        {isConnected && isFhevmLoading && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
              Initializing FHEVM... ({fhevmStatus})
            </p>
            <p style={{ fontSize: 'var(--size-sm)', color: 'var(--color-text-muted)' }}>
              This may take a few moments. Please wait.
            </p>
          </div>
        )}
        
        {isConnected && fhevmError && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', textAlign: 'center', backgroundColor: 'var(--color-error, #fee)' }}>
            <p style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-error-text, #c00)' }}>
              FHEVM Error: {fhevmError.message || 'Unknown error'}
            </p>
          </div>
        )}
        
        <div className="card">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await submitActivity({ steps: Number(steps), minutes: Number(minutes), calories: Number(calories) });
                setSteps('');
                setMinutes('');
                setCalories('');
              } catch (err: any) {
                alert(err.message || 'Submission failed');
              }
            }}
            style={{ display: 'grid', gap: 'var(--spacing-lg)' }}
          >
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--size-base)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text)',
              }}>
                Steps
              </label>
              <input
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                inputMode="numeric"
                placeholder="e.g., 8500"
                required
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--size-base)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text)',
              }}>
                Minutes
              </label>
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                inputMode="numeric"
                placeholder="e.g., 45"
                required
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--size-base)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text)',
              }}>
                Calories
              </label>
              <input
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                inputMode="numeric"
                placeholder="e.g., 350"
                required
              />
            </div>
            <button
              disabled={loading || !isConnected || !isFhevmReady}
              type="submit"
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                fontSize: 'var(--size-base)',
                marginTop: 'var(--spacing-sm)',
              }}
            >
              {loading ? 'Submitting...' : !isFhevmReady ? 'Initializing FHEVM...' : 'Encrypt & Submit'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
