import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernProgressTimelineProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  canAccessStep: (step: number) => boolean;
}

const stepTitles = [
  'Personal Info',
  'Availability',
  'Emergency',
  'Employment',
  'References',
  'Skills',
  'Declaration',
  'Terms'
];

export function ModernProgressTimeline({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
  canAccessStep
}: ModernProgressTimelineProps) {
  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden md:flex items-center justify-between relative">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;
          const canAccess = canAccessStep(step);
          const isLocked = !canAccess;

          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {/* Connecting line */}
              {i < totalSteps - 1 && (
                <div 
                  className={cn(
                    "absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}

              {/* Step circle */}
              <button
                onClick={() => canAccess && onStepClick(step)}
                disabled={isLocked}
                className={cn(
                  "relative w-10 h-10 rounded-full border-2 transition-all duration-300",
                  "flex items-center justify-center group",
                  isCurrent && "scale-125 shadow-lg shadow-primary/30 border-primary bg-primary",
                  isCompleted && !isCurrent && "border-primary bg-primary",
                  !isCompleted && !isCurrent && canAccess && "border-border bg-background hover:border-primary/50 hover:scale-110",
                  isLocked && "border-border bg-muted opacity-50 cursor-not-allowed"
                )}
              >
                {isCompleted && !isCurrent && (
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                )}
                {isCurrent && (
                  <Circle className="w-5 h-5 text-primary-foreground fill-primary-foreground animate-pulse" />
                )}
                {!isCompleted && !isCurrent && !isLocked && (
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                    {step}
                  </span>
                )}
                {isLocked && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {/* Step label */}
              <span 
                className={cn(
                  "mt-2 text-xs font-medium text-center transition-colors duration-200",
                  isCurrent && "text-primary font-bold",
                  isCompleted && !isCurrent && "text-foreground",
                  !isCompleted && !isCurrent && "text-muted-foreground"
                )}
              >
                {stepTitles[i]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile dots indicator */}
      <div className="flex md:hidden items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = completedSteps.includes(step);
          const isCurrent = step === currentStep;

          return (
            <button
              key={step}
              onClick={() => canAccessStep(step) && onStepClick(step)}
              disabled={!canAccessStep(step)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent && "w-8 bg-primary",
                isCompleted && !isCurrent && "w-2 bg-primary",
                !isCompleted && !isCurrent && "w-2 bg-border"
              )}
            />
          );
        })}
      </div>

      {/* Progress stats */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="font-medium text-primary">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
    </div>
  );
}
