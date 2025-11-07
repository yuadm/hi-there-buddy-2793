import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgeProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function TrustBadge({ icon: Icon, text, className }: TrustBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
      "bg-primary-soft border border-primary/20",
      "text-xs font-medium text-primary",
      "transition-all duration-200 hover:scale-105",
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
}
