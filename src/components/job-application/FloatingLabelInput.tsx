import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, icon: Icon, error, success, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';
    const isActive = focused || hasValue;

    return (
      <div className="relative">
        <div className="relative">
          {Icon && (
            <Icon className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200",
              error ? "text-destructive" : 
              success ? "text-green-500" :
              focused ? "text-primary" : "text-muted-foreground"
            )} />
          )}
          
          <input
            ref={ref}
            className={cn(
              "peer w-full px-4 py-3 rounded-lg border-2 bg-background",
              "transition-all duration-200 outline-none",
              Icon && "pl-11",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20",
              success && "border-green-500 focus:border-green-500 focus:ring-green-500/20",
              !error && !success && "border-border focus:border-primary focus:ring-primary/20",
              "focus:ring-4",
              "placeholder:text-transparent",
              className
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={label}
            {...props}
          />
          
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none",
              Icon && "left-11",
              isActive 
                ? "-top-2.5 text-xs bg-background px-1 font-medium" 
                : "top-1/2 -translate-y-1/2 text-sm",
              error ? "text-destructive" :
              success ? "text-green-500" :
              focused ? "text-primary" : "text-muted-foreground"
            )}
          >
            {label}
          </label>
        </div>
        
        {error && (
          <p className="text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';
