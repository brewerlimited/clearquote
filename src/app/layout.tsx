import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClearQuote',
  description: 'Anonymous quote feedback for trades.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
