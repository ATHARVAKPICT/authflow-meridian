import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuthFlow – AI-Native Pre-Auth & Cashless Claims Copilot | Meridian Health',
  description: 'AuthFlow by Meridian Health – an AI-native copilot for insurance pre-authorisation and cashless claims. Builds, checks and tracks auth as one continuous case file from admission to discharge. SYNTHETIC DATA ONLY – Prototype.',
  keywords: ['hospital insurance', 'pre-authorisation', 'cashless claims', 'AI copilot', 'health insurance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
