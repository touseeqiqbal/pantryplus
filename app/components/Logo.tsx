import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 32, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
    hero: { icon: 80, text: 'text-6xl', gap: 'gap-6' }
  };

  const current = sizes[size];

  return (
    <Link href="/dashboard" className={`flex items-center ${current.gap} ${className}`}>
      {/* Icon Container */}
      <div 
        className="relative overflow-hidden rounded-xl flex-shrink-0 shadow-sm" 
        style={{ 
          width: current.icon, 
          height: current.icon, 
          background: '#0a0f18' 
        }}
      >
        <div 
          className="absolute inset-0 scale-[2.2]" 
          style={{ transform: `scale(2.2) translateY(12%)` }}
        >
          <Image
            src="/logo.png"
            alt=""
            fill
            sizes={`${current.icon}px`}
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={`${current.text} font-black tracking-tighter text-gray-900 dark:text-gray-100 flex items-center gap-1 transition-colors`}>
          Pantry <span className="text-primary-600 font-light">Plus</span>
        </span>
      )}
    </Link>
  );
}
