'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletStatus } from './WalletStatus';

export function Navbar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav style={{
      borderBottom: '1.5px solid var(--color-border)',
      background: 'var(--color-white)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-md) 0',
        }}>
          <Link href="/" style={{
            fontSize: 'var(--size-2xl)',
            fontWeight: 800,
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}>
            PrivyMiles
          </Link>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
          }}>
            <Link
              href="/leaderboard"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive('/leaderboard') ? 700 : 400,
                color: isActive('/leaderboard') ? 'var(--color-primary)' : 'var(--color-text)',
                background: isActive('/leaderboard') ? 'var(--color-surface)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              }}
            >
              Leaderboard
            </Link>
            <Link
              href="/badges"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive('/badges') ? 700 : 400,
                color: isActive('/badges') ? 'var(--color-primary)' : 'var(--color-text)',
                background: isActive('/badges') ? 'var(--color-surface)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              }}
            >
              Badges
            </Link>
            <Link
              href="/stats"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive('/stats') ? 700 : 400,
                color: isActive('/stats') ? 'var(--color-primary)' : 'var(--color-text)',
                background: isActive('/stats') ? 'var(--color-surface)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              }}
            >
              Stats
            </Link>
            <Link
              href="/submit"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: isActive('/submit') ? 700 : 400,
                color: isActive('/submit') ? 'var(--color-primary)' : 'var(--color-text)',
                background: isActive('/submit') ? 'var(--color-surface)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              }}
            >
              Submit
            </Link>
            <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />
            <WalletStatus />
          </div>
        </div>
      </div>
    </nav>
  );
}


