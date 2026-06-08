import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { MessageProvider } from '@/context/MessageContext';
import HtmlLangUpdater from '@/components/shared/HtmlLangUpdater';

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(() => { try { const theme = localStorage.getItem("theme"); document.documentElement.classList.toggle("dark", theme === "dark"); } catch (_) {} })();',
          }}
        />
      </head>
      <body className={`${inter.className} bg-global text-main antialiased`}>
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
