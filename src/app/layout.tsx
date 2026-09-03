'use client';
import { useEffect } from 'react';
import './globals.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.png?v=2" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}