import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg text-text-primary lg:hidden flex flex-col">
      <MobileHeader />
      <main className="flex-1 px-4 pb-[120px] pt-4">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
