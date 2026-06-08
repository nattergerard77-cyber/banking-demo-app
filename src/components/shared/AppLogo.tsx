import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

interface AppLogoProps {
  compact?: boolean;
  className?: string;
}

export default function AppLogo({ compact = false, className }: AppLogoProps) {
  return (
    <div className={twMerge('flex items-center', className)}>
      <Image
        src="/brand/logo.png"
        alt="Raiffeisen"
        width={190}
        height={54}
        priority
        className={twMerge('h-auto object-contain', compact ? 'w-[150px] sm:w-[165px]' : 'w-[170px] sm:w-[185px]')}
      />
    </div>
  );
}
