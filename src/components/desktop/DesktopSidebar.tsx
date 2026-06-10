'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navigationItems } from '@/data/navigation';
import AppLogo from '../shared/AppLogo';
import { 
  LayoutDashboard, Wallet, ArrowRightLeft, CreditCard, 
  PiggyBank, Users, MessageSquare, Bell, Settings 
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { useMessages } from '@/context/MessageContext';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Wallet, ArrowRightLeft, CreditCard,
  PiggyBank, Users, MessageSquare, Bell, Settings
};

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { unreadCount } = useNotifications();
  const { unreadMessagesCount } = useMessages();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="sticky top-0 h-screen w-[280px] bg-card border-r border-border flex-col hidden lg:flex">
      <div className="p-6">
        <AppLogo />
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = IconMap[item.iconName];
          const exactActive = 'exactActive' in item ? item.exactActive : false;
          const isActive = exactActive 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
          const badgeCount = item.href === '/notifications'
            ? unreadCount
            : item.href === '/messagerie'
              ? unreadMessagesCount
              : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                "flex items-center justify-between px-3 py-3 rounded-xl transition-colors text-sm font-medium",
                isActive 
                  ? "bg-navy text-white" 
                  : "text-text-secondary hover:bg-gray-50 hover:text-navy"
              )}
            >
              <div className="flex items-center gap-3">
                {Icon && <Icon size={20} className={isActive ? "text-white" : "text-text-muted"} />}
                <span>{t(`sidebar.nav.${item.href.replace('/', '')}`)}</span>
              </div>
              {mounted && badgeCount > 0 && (
                <div className="bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {badgeCount}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-xl p-4 border border-border text-sm">
          <p className="font-bold text-navy mb-1">{t("sidebar.help.title")}</p>
          <p className="text-text-secondary mb-3 text-xs">{t("sidebar.help.subtitle")}</p>
          <p className="font-bold text-navy">+352 2450 1234</p>
        </div>
      </div>
    </div>
  );
}
