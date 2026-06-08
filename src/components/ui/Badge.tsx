import { cn } from '@/lib/cn';
export default function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-light text-navy-main", className)}>{children}</span>;
}
