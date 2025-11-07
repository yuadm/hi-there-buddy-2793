import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
}

export function FloatingLabelInput({ 
  label, 
  icon: Icon, 
  error, 
  success,
  className,
  ...props 
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value !== undefined && props.value !== '';
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <Input
          {...props}
          className={cn(
            "peer pt-6 pb-2 transition-all duration-200",
            Icon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-success focus-visible:ring-success",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        <label
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none",
            Icon && "left-10",
            isActive
              ? "top-2 text-xs text-primary font-medium"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          )}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1 animate-fade-in">{error}</p>
      )}
    </div>
  );
}
