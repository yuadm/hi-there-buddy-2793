import { supabase } from "@/integrations/supabase/client";

export interface TimeSlotMapping {
  label: string;
  timeRange: string;
}

// Cache for time slot mappings
let timeSlotCache: Record<string, TimeSlotMapping> | null = null;

export async function getTimeSlotMappings(): Promise<Record<string, TimeSlotMapping>> {
  if (timeSlotCache) {
    return timeSlotCache;
  }

  try {
    const { data, error } = await supabase
      .from('job_application_settings')
      .select('id, setting_value, is_active')
      .eq('category', 'shift')
      .order('display_order', { ascending: true });

    if (error) throw error;

    timeSlotCache = {};
    data?.forEach(slot => {
      if (timeSlotCache) {
        let label, startTime, endTime;
        try {
          const shiftValue = typeof slot.setting_value === 'string' 
            ? JSON.parse(slot.setting_value) 
            : slot.setting_value;
          label = (shiftValue as any)?.label || (shiftValue as any)?.name || slot.id;
          startTime = (shiftValue as any)?.start_time || '';
          endTime = (shiftValue as any)?.end_time || '';
        } catch {
          label = (slot.setting_value as any)?.label || (slot.setting_value as any)?.name || slot.id;
          startTime = (slot.setting_value as any)?.start_time || '';
          endTime = (slot.setting_value as any)?.end_time || '';
        }
        
        // Format time range
        const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';
        
        // Add "(Archived)" suffix for inactive shifts
        const finalLabel = slot.is_active ? label : `${label} (Archived)`;
        
        timeSlotCache[slot.id] = {
          label: finalLabel,
          timeRange
        };
      }
    });

    return timeSlotCache || {};
  } catch (error) {
    console.error('Error fetching time slot mappings:', error);
    return {};
  }
}

export function mapTimeSlotIds(timeSlots: Record<string, any>, mappings: Record<string, TimeSlotMapping>): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  Object.entries(timeSlots).forEach(([slotId, days]) => {
    const mapping = mappings[slotId];
    if (mapping) {
      const displayLabel = mapping.timeRange 
        ? `${mapping.label} (${mapping.timeRange})`
        : mapping.label;
      mapped[displayLabel] = days;
    } else {
      mapped['[Unknown Shift]'] = days;
    }
  });
  
  return mapped;
}