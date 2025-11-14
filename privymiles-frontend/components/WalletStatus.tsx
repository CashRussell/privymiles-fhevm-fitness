'use client';

import { useMetaMaskEthersSigner } from '@/hooks/metamask/useMetaMaskEthersSigner';

export function WalletStatus() {
  // Wallet connection state management with EIP-6963 support
  const { provider, accounts, chainId, isConnected, connect } = useMetaMaskEthersSigner();
  const address = accounts?.[0];
  const disconnect = () => console.log('Disconnect not implemented in MetaMask provider');
  if (!isConnected) {
    return (
      <button
        onClick={connect}
        style={{
          padding: 'var(--spacing-xs) var(--spacing-md)',
        }}
      >
        Connect Wallet
      </button>
    );
  }
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--spacing-sm)',
      alignItems: 'center',
      padding: 'var(--spacing-xs) var(--spacing-sm)',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--color-surface)',
      border: '1.5px solid var(--color-border)',
    }}>
      <span style={{
        fontFamily: 'monospace',
        fontSize: 'var(--size-sm)',
        color: 'var(--color-text)',
      }}>
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
      <span style={{
        fontSize: 'var(--size-xs)',
        color: 'var(--color-text-muted)',
      }}>
        #{chainId}
      </span>
      <button
        onClick={disconnect}
        style={{
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          fontSize: 'var(--size-sm)',
          background: 'var(--color-text-muted)',
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
