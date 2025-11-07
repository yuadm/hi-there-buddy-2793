import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function GlassmorphicCard({ children, className, hover = false, ...props }: GlassmorphicCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/30",
        "bg-gradient-to-br from-card/80 to-background/60",
        "backdrop-blur-xl backdrop-saturate-150",
        "shadow-lg shadow-card-shadow",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
