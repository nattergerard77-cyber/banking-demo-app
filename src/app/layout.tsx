import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { MessageProvider } from '@/context/MessageContext';
import HtmlLangUpdater from '@/components/shared/HtmlLangUpdater';
import { ThemeInitializer } from '@/components/shared/ThemeInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Raiffeisen',
  description: 'Espace bancaire sécurisé Raiffeisen.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-global text-main antialiased`}>
        <ThemeInitializer />
        <LanguageProvider>
          <NotificationProvider>
            <MessageProvider>
              <HtmlLangUpdater />
              {children}
            </MessageProvider>
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
