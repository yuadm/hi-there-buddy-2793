import { CheckCircle, Lock, User, Calendar, Phone, Briefcase, FileText, Award, ClipboardCheck, FileSignature } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepNavigationCardsProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  canAccessStep: (step: number) => boolean;
}

const stepTitles = [
  'Personal Information',
  'Availability',
  'Emergency Contact',
  'Employment History',
  'References',
  'Skills & Experience',
  'Declaration',
  'Terms & Policy'
];

const stepIcons = [User, Calendar, Phone, Briefcase, FileText, Award, ClipboardCheck, FileSignature];

export function StepNavigationCards({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  canAccessStep
}: StepNavigationCardsProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />
      <div 
        className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500 hidden sm:block"
        style={{ height: `${(completedSteps.length / totalSteps) * 100}%` }}
      />

      {/* Mobile: Horizontal Scrollable */}
      <div className="sm:hidden overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max px-1">
          {Array.from({ length: totalSteps }, (_, i) => {
            const step = i + 1;
            const isCompleted = completedSteps.includes(step);
            const isCurrent = step === currentStep;
            const canAccess = canAccessStep(step);
            const isLocked = !canAccess && step > currentStep;
            const Icon = stepIcons[i];

            return (
              <button
                key={step}
                onClick={() => canAccess && onStepClick(step)}
                disabled={!canAccess}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-xl min-w-[90px]",
                  "transition-all duration-300 ease-smooth",
                  isCurrent && "glass shadow-glow scale-105",
                  isCompleted && !isCurrent && "bg-success-soft border border-success/20",
                  !isCompleted && !isCurrent && canAccess && "bg-card border border-border hover:border-primary/50",
                  isLocked && "bg-muted opacity-60 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCurrent && "bg-primary text-primary-foreground animate-pulse shadow-glow",
                  isCompleted && !isCurrent && "bg-success text-white",
                  !isCompleted && !isCurrent && canAccess && "bg-muted text-muted-foreground",
                  isLocked && "bg-muted-hover text-muted-foreground"
                )}>
                  {isCompleted && !isCurrent ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium text-center",
                  isCurrent && "text-primary",
                  isCompleted && !isCurrent && "text-success",
                  isLocked && "text-muted-foreground"
                )}>
                  Step {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical Timeline */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const canAccess = canAccessStep(step);
          const isLocked = !canAccess && step > currentStep;
          const Icon = stepIcons[i];

          return (
            <button
              key={step}
              onClick={() => canAccess && onStepClick(step)}
              disabled={!canAccess}
              className={cn(
                "relative flex items-center gap-4 p-4 rounded-xl",
                "transition-all duration-300 ease-smooth group",
                isCurrent && "glass shadow-glow scale-105",
                isCompleted && !isCurrent && "bg-success-soft border border-success/20 hover:scale-102",
                !isCompleted && !isCurrent && canAccess && "bg-card border border-border hover:border-primary/50 hover:shadow-md",
                isLocked && "bg-muted opacity-60 cursor-not-allowed"
              )}
            >
              {/* Icon Circle */}
              <div className={cn(
                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                "transition-all duration-300",
                isCurrent && "bg-primary text-primary-foreground shadow-glow ring-4 ring-primary/20",
                isCompleted && !isCurrent && "bg-success text-white",
                !isCompleted && !isCurrent && canAccess && "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                isLocked && "bg-muted-hover text-muted-foreground"
              )}>
                {isCompleted && !isCurrent ? (
                  <CheckCircle className="w-6 h-6" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className={cn(
                  "text-xs font-medium mb-1",
                  isCurrent && "text-primary",
                  isCompleted && !isCurrent && "text-success",
                  isLocked && "text-muted-foreground"
                )}>
                  Step {step}
                </div>
                <div className={cn(
                  "text-sm font-semibold leading-tight",
                  isCurrent && "text-primary",
                  isCompleted && !isCurrent && "text-success",
                  !isCompleted && !isCurrent && "text-foreground",
                  isLocked && "text-muted-foreground"
                )}>
                  {stepTitles[i]}
                </div>
              </div>

              {/* Current Step Indicator */}
              {isCurrent && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
