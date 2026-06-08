'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, CreditCard, Settings } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '@/context/LanguageContext';

const navItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, exactActive: true },
  { label: 'Comptes', href: '/comptes', icon: Wallet },
  { label: 'Virements', href: '/virements', icon: ArrowRightLeft },
  { label: 'Cartes', href: '/cartes', icon: CreditCard },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-card border-t border-border flex items-center justify-around px-2 pb-safe z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exactActive 
          ? pathname === item.href 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={twMerge(
              "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors",
              isActive ? "text-green-accent" : "text-text-muted hover:text-text-secondary"
            )}
          >
            <Icon size={22} className={isActive ? "text-green-accent" : ""} />
            <span className="text-[9.5px] tracking-tight font-medium px-0.5 truncate w-full text-center">
              {t(`sidebar.nav.${item.href.replace('/', '')}`)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
