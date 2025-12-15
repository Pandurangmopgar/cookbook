import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI SDR - MemoryStack Powered Sales Assistant',
  description: 'AI Sales Development Representative with persistent memory',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
