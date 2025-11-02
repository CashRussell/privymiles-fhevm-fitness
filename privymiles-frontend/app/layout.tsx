import { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Providers } from './providers';

export const metadata = {
  title: 'PrivyMiles',
  description: 'Private Fitness Leaderboards powered by FHE',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}



