import { useEffect, useState } from 'react';
import { Check, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  lastSaved?: Date;
}

export function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastSaved) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50",
      "px-3 py-2 rounded-lg",
      "bg-success-soft border border-success/20",
      "flex items-center gap-2",
      "text-xs font-medium text-success",
      "animate-fade-in shadow-md"
    )}>
      <Check className="w-3.5 h-3.5" />
      <span>Draft saved</span>
    </div>
  );
}
