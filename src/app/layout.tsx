import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/contexts/SessionContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'App Anime Conexión',
  description: 'Selección colaborativa de animes para ver en pareja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}