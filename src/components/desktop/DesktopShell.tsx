import DesktopSidebar from './DesktopSidebar';
import DesktopTopbar from './DesktopTopbar';

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-app-bg text-text-primary hidden lg:flex">
      <DesktopSidebar />
      <div className="min-w-0 flex-1 flex flex-col">
        <DesktopTopbar />
        <main className="flex-1 p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
