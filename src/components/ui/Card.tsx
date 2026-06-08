import { cn } from '@/lib/cn';
export default function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("bg-card rounded-xl shadow-sm border border-border p-6", className)}>{children}</div>;
}
