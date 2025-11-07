import { useEnhancedSkills } from '@/hooks/useEnhancedSkills'
import type { JobApplicationData } from './types'
import { Award, Star, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EnhancedSkillsSectionProps {
  data: JobApplicationData
  applicationId?: string
}

export function EnhancedSkillsSection({ data, applicationId }: EnhancedSkillsSectionProps) {
  const { data: enhancedSkills, isLoading } = useEnhancedSkills(data, applicationId)

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Skills & Experience</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  const skillEntries = Object.entries(enhancedSkills || {})

  const getSkillLevel = (level: string) => {
    const levelStr = String(level).toLowerCase()
    if (levelStr.includes('expert') || levelStr.includes('advanced')) return 'expert'
    if (levelStr.includes('good') || levelStr.includes('proficient')) return 'good'
    return 'basic'
  }

  const getSkillStars = (level: string) => {
    const skillLevel = getSkillLevel(level)
    if (skillLevel === 'expert') return 3
    if (skillLevel === 'good') return 2
    return 1
  }

  const getSkillColor = (level: string) => {
    const skillLevel = getSkillLevel(level)
    if (skillLevel === 'expert') return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (skillLevel === 'good') return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-amber-600 bg-amber-50 border-amber-200'
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Skills & Experience</h3>
      </div>
      
      {skillEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No skills listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skillEntries.map(([skill, level], index) => {
            const stars = getSkillStars(String(level))
            const colorClass = getSkillColor(String(level))
            
            return (
              <div
                key={skill}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all duration-300",
                  "hover:scale-105 hover:shadow-lg cursor-default",
                  colorClass,
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate mb-1">
                      {skill}
                    </h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5 transition-all",
                            i < stars ? "fill-current" : "stroke-current opacity-30"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <CheckCircle2 className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="mt-2 text-xs font-medium opacity-75">
                  {String(level)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
