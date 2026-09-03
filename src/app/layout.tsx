'use client';
import { useEffect } from 'react';
import './globals.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamically load Bootstrap JS on client side
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  );
}