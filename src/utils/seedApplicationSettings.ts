import { supabase } from "@/integrations/supabase/client";

export interface DefaultSetting {
  category: string;
  setting_type?: string;
  setting_key: string;
  setting_value: any;
  display_order: number;
  is_active: boolean;
}

export const getDefaultSettings = (): DefaultSetting[] => [
  // Personal Settings - Titles
  { category: 'personal', setting_type: 'title', setting_key: 'mr', setting_value: { value: 'Mr' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'title', setting_key: 'mrs', setting_value: { value: 'Mrs' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'title', setting_key: 'miss', setting_value: { value: 'Miss' }, display_order: 3, is_active: true },
  { category: 'personal', setting_type: 'title', setting_key: 'ms', setting_value: { value: 'Ms' }, display_order: 4, is_active: true },
  { category: 'personal', setting_type: 'title', setting_key: 'dr', setting_value: { value: 'Dr' }, display_order: 5, is_active: true },
  { category: 'personal', setting_type: 'title', setting_key: 'prof', setting_value: { value: 'Prof' }, display_order: 6, is_active: true },

  // Personal Settings - Boroughs (London)
  { category: 'personal', setting_type: 'borough', setting_key: 'barking_dagenham', setting_value: { value: 'Barking and Dagenham' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'barnet', setting_value: { value: 'Barnet' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'bexley', setting_value: { value: 'Bexley' }, display_order: 3, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'brent', setting_value: { value: 'Brent' }, display_order: 4, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'bromley', setting_value: { value: 'Bromley' }, display_order: 5, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'camden', setting_value: { value: 'Camden' }, display_order: 6, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'croydon', setting_value: { value: 'Croydon' }, display_order: 7, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'ealing', setting_value: { value: 'Ealing' }, display_order: 8, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'enfield', setting_value: { value: 'Enfield' }, display_order: 9, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'greenwich', setting_value: { value: 'Greenwich' }, display_order: 10, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'hackney', setting_value: { value: 'Hackney' }, display_order: 11, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'hammersmith_fulham', setting_value: { value: 'Hammersmith and Fulham' }, display_order: 12, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'haringey', setting_value: { value: 'Haringey' }, display_order: 13, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'harrow', setting_value: { value: 'Harrow' }, display_order: 14, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'havering', setting_value: { value: 'Havering' }, display_order: 15, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'hillingdon', setting_value: { value: 'Hillingdon' }, display_order: 16, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'hounslow', setting_value: { value: 'Hounslow' }, display_order: 17, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'islington', setting_value: { value: 'Islington' }, display_order: 18, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'kensington_chelsea', setting_value: { value: 'Kensington and Chelsea' }, display_order: 19, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'kingston', setting_value: { value: 'Kingston upon Thames' }, display_order: 20, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'lambeth', setting_value: { value: 'Lambeth' }, display_order: 21, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'lewisham', setting_value: { value: 'Lewisham' }, display_order: 22, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'merton', setting_value: { value: 'Merton' }, display_order: 23, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'newham', setting_value: { value: 'Newham' }, display_order: 24, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'redbridge', setting_value: { value: 'Redbridge' }, display_order: 25, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'richmond', setting_value: { value: 'Richmond upon Thames' }, display_order: 26, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'southwark', setting_value: { value: 'Southwark' }, display_order: 27, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'sutton', setting_value: { value: 'Sutton' }, display_order: 28, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'tower_hamlets', setting_value: { value: 'Tower Hamlets' }, display_order: 29, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'waltham_forest', setting_value: { value: 'Waltham Forest' }, display_order: 30, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'wandsworth', setting_value: { value: 'Wandsworth' }, display_order: 31, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'westminster', setting_value: { value: 'Westminster' }, display_order: 32, is_active: true },
  { category: 'personal', setting_type: 'borough', setting_key: 'city_of_london', setting_value: { value: 'City of London' }, display_order: 33, is_active: true },

  // Personal Settings - Languages
  { category: 'personal', setting_type: 'language', setting_key: 'english', setting_value: { value: 'English' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'spanish', setting_value: { value: 'Spanish' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'french', setting_value: { value: 'French' }, display_order: 3, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'german', setting_value: { value: 'German' }, display_order: 4, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'polish', setting_value: { value: 'Polish' }, display_order: 5, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'romanian', setting_value: { value: 'Romanian' }, display_order: 6, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'portuguese', setting_value: { value: 'Portuguese' }, display_order: 7, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'arabic', setting_value: { value: 'Arabic' }, display_order: 8, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'bengali', setting_value: { value: 'Bengali' }, display_order: 9, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'urdu', setting_value: { value: 'Urdu' }, display_order: 10, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'punjabi', setting_value: { value: 'Punjabi' }, display_order: 11, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'mandarin', setting_value: { value: 'Mandarin' }, display_order: 12, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'italian', setting_value: { value: 'Italian' }, display_order: 13, is_active: true },
  { category: 'personal', setting_type: 'language', setting_key: 'other', setting_value: { value: 'Other' }, display_order: 14, is_active: true },

  // Personal Settings - English Proficiency
  { category: 'personal', setting_type: 'english_proficiency', setting_key: 'native', setting_value: { value: 'Native Speaker' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'english_proficiency', setting_key: 'fluent', setting_value: { value: 'Fluent' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'english_proficiency', setting_key: 'intermediate', setting_value: { value: 'Intermediate' }, display_order: 3, is_active: true },
  { category: 'personal', setting_type: 'english_proficiency', setting_key: 'basic', setting_value: { value: 'Basic' }, display_order: 4, is_active: true },
  { category: 'personal', setting_type: 'english_proficiency', setting_key: 'learning', setting_value: { value: 'Learning' }, display_order: 5, is_active: true },

  // Personal Settings - DBS Options
  { category: 'personal', setting_type: 'dbs', setting_key: 'enhanced', setting_value: { value: 'Enhanced DBS' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'dbs', setting_key: 'standard', setting_value: { value: 'Standard DBS' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'dbs', setting_key: 'basic', setting_value: { value: 'Basic DBS' }, display_order: 3, is_active: true },
  { category: 'personal', setting_type: 'dbs', setting_key: 'update_service', setting_value: { value: 'DBS Update Service' }, display_order: 4, is_active: true },
  { category: 'personal', setting_type: 'dbs', setting_key: 'none', setting_value: { value: 'No DBS' }, display_order: 5, is_active: true },

  // Personal Settings - Personal Care
  { category: 'personal', setting_type: 'personal_care', setting_key: 'experienced', setting_value: { value: 'Yes - Experienced' }, display_order: 1, is_active: true },
  { category: 'personal', setting_type: 'personal_care', setting_key: 'willing', setting_value: { value: 'Yes - Willing to Learn' }, display_order: 2, is_active: true },
  { category: 'personal', setting_type: 'personal_care', setting_key: 'no', setting_value: { value: 'No' }, display_order: 3, is_active: true },

  // Emergency Settings - Relationships
  { category: 'emergency', setting_type: 'relationship', setting_key: 'parent', setting_value: { value: 'Parent' }, display_order: 1, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'sibling', setting_value: { value: 'Sibling' }, display_order: 2, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'spouse', setting_value: { value: 'Spouse' }, display_order: 3, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'partner', setting_value: { value: 'Partner' }, display_order: 4, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'friend', setting_value: { value: 'Friend' }, display_order: 5, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'colleague', setting_value: { value: 'Colleague' }, display_order: 6, is_active: true },
  { category: 'emergency', setting_type: 'relationship', setting_key: 'other', setting_value: { value: 'Other' }, display_order: 7, is_active: true },

  // Emergency Settings - How Did You Hear About Us
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'job_board', setting_value: { value: 'Job Board' }, display_order: 1, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'social_media', setting_value: { value: 'Social Media' }, display_order: 2, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'website', setting_value: { value: 'Company Website' }, display_order: 3, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'referral', setting_value: { value: 'Referral' }, display_order: 4, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'walk_in', setting_value: { value: 'Walk-in' }, display_order: 5, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'agency', setting_value: { value: 'Recruitment Agency' }, display_order: 6, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'newspaper', setting_value: { value: 'Newspaper' }, display_order: 7, is_active: true },
  { category: 'emergency', setting_type: 'hear_about', setting_key: 'other', setting_value: { value: 'Other' }, display_order: 8, is_active: true },

  // Shift Settings
  { category: 'shift', setting_key: 'early_shift', setting_value: { name: 'early_shift', label: 'Early Shift', start_time: '06:00', end_time: '14:00' }, display_order: 1, is_active: true },
  { category: 'shift', setting_key: 'day_shift', setting_value: { name: 'day_shift', label: 'Day Shift', start_time: '09:00', end_time: '17:00' }, display_order: 2, is_active: true },
  { category: 'shift', setting_key: 'late_shift', setting_value: { name: 'late_shift', label: 'Late Shift', start_time: '14:00', end_time: '22:00' }, display_order: 3, is_active: true },
  { category: 'shift', setting_key: 'night_shift', setting_value: { name: 'night_shift', label: 'Night Shift', start_time: '22:00', end_time: '06:00' }, display_order: 4, is_active: true },
  { category: 'shift', setting_key: 'split_shift', setting_value: { name: 'split_shift', label: 'Split Shift', start_time: '07:00', end_time: '21:00' }, display_order: 5, is_active: true },
  { category: 'shift', setting_key: 'on_call', setting_value: { name: 'on_call', label: 'On-Call', start_time: '00:00', end_time: '23:59' }, display_order: 6, is_active: true },

  // Skills Settings - Categories
  { category: 'skills', setting_type: 'category', setting_key: 'personal_care', setting_value: { id: 'personal_care', name: 'Personal Care' }, display_order: 1, is_active: true },
  { category: 'skills', setting_type: 'category', setting_key: 'medical_support', setting_value: { id: 'medical_support', name: 'Medical Support' }, display_order: 2, is_active: true },
  { category: 'skills', setting_type: 'category', setting_key: 'specialized_care', setting_value: { id: 'specialized_care', name: 'Specialized Care' }, display_order: 3, is_active: true },
  { category: 'skills', setting_type: 'category', setting_key: 'household', setting_value: { id: 'household', name: 'Household Tasks' }, display_order: 4, is_active: true },
  { category: 'skills', setting_type: 'category', setting_key: 'additional', setting_value: { id: 'additional', name: 'Additional Skills' }, display_order: 5, is_active: true },

  // Skills Settings - Personal Care Skills
  { category: 'skills', setting_type: 'skill', setting_key: 'bathing', setting_value: { name: 'Bathing/Showering', category_id: 'personal_care' }, display_order: 1, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'dressing', setting_value: { name: 'Dressing', category_id: 'personal_care' }, display_order: 2, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'grooming', setting_value: { name: 'Grooming', category_id: 'personal_care' }, display_order: 3, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'toileting', setting_value: { name: 'Toileting', category_id: 'personal_care' }, display_order: 4, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'mobility', setting_value: { name: 'Mobility Assistance', category_id: 'personal_care' }, display_order: 5, is_active: true },

  // Skills Settings - Medical Support Skills
  { category: 'skills', setting_type: 'skill', setting_key: 'medication', setting_value: { name: 'Medication Administration', category_id: 'medical_support' }, display_order: 6, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'catheter', setting_value: { name: 'Catheter Care', category_id: 'medical_support' }, display_order: 7, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'peg_feeding', setting_value: { name: 'PEG Feeding', category_id: 'medical_support' }, display_order: 8, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'stoma', setting_value: { name: 'Stoma Care', category_id: 'medical_support' }, display_order: 9, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'wound_care', setting_value: { name: 'Wound Care', category_id: 'medical_support' }, display_order: 10, is_active: true },

  // Skills Settings - Specialized Care Skills
  { category: 'skills', setting_type: 'skill', setting_key: 'dementia', setting_value: { name: 'Dementia Care', category_id: 'specialized_care' }, display_order: 11, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'learning_disabilities', setting_value: { name: 'Learning Disabilities', category_id: 'specialized_care' }, display_order: 12, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'mental_health', setting_value: { name: 'Mental Health Support', category_id: 'specialized_care' }, display_order: 13, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'palliative', setting_value: { name: 'Palliative Care', category_id: 'specialized_care' }, display_order: 14, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'autism', setting_value: { name: 'Autism Support', category_id: 'specialized_care' }, display_order: 15, is_active: true },

  // Skills Settings - Household Tasks Skills
  { category: 'skills', setting_type: 'skill', setting_key: 'meal_prep', setting_value: { name: 'Meal Preparation', category_id: 'household' }, display_order: 16, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'housekeeping', setting_value: { name: 'Light Housekeeping', category_id: 'household' }, display_order: 17, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'laundry', setting_value: { name: 'Laundry', category_id: 'household' }, display_order: 18, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'shopping', setting_value: { name: 'Shopping', category_id: 'household' }, display_order: 19, is_active: true },

  // Skills Settings - Additional Skills
  { category: 'skills', setting_type: 'skill', setting_key: 'first_aid', setting_value: { name: 'First Aid', category_id: 'additional' }, display_order: 20, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'manual_handling', setting_value: { name: 'Manual Handling', category_id: 'additional' }, display_order: 21, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'infection_control', setting_value: { name: 'Infection Control', category_id: 'additional' }, display_order: 22, is_active: true },
  { category: 'skills', setting_type: 'skill', setting_key: 'record_keeping', setting_value: { name: 'Record Keeping', category_id: 'additional' }, display_order: 23, is_active: true },

  // Status Settings
  { category: 'status', setting_key: 'new', setting_value: { status_name: 'New' }, display_order: 1, is_active: true },
  { category: 'status', setting_key: 'under_review', setting_value: { status_name: 'Under Review' }, display_order: 2, is_active: true },
  { category: 'status', setting_key: 'interview_scheduled', setting_value: { status_name: 'Interview Scheduled' }, display_order: 3, is_active: true },
  { category: 'status', setting_key: 'interviewed', setting_value: { status_name: 'Interviewed' }, display_order: 4, is_active: true },
  { category: 'status', setting_key: 'offer_extended', setting_value: { status_name: 'Offer Extended' }, display_order: 5, is_active: true },
  { category: 'status', setting_key: 'accepted', setting_value: { status_name: 'Accepted' }, display_order: 6, is_active: true },
  { category: 'status', setting_key: 'rejected', setting_value: { status_name: 'Rejected' }, display_order: 7, is_active: true },
  { category: 'status', setting_key: 'withdrawn', setting_value: { status_name: 'Withdrawn' }, display_order: 8, is_active: true },

  // Position Settings
  { category: 'position', setting_key: 'care_worker', setting_value: { title: 'Care Worker', description: 'Provide direct care and support to service users', department: 'Care Services', location: 'Various Locations' }, display_order: 1, is_active: true },
  { category: 'position', setting_key: 'senior_care_worker', setting_value: { title: 'Senior Care Worker', description: 'Lead care delivery and support junior staff', department: 'Care Services', location: 'Various Locations' }, display_order: 2, is_active: true },
  { category: 'position', setting_key: 'team_leader', setting_value: { title: 'Team Leader', description: 'Manage care teams and ensure quality service delivery', department: 'Care Services', location: 'Various Locations' }, display_order: 3, is_active: true },
  { category: 'position', setting_key: 'care_coordinator', setting_value: { title: 'Care Coordinator', description: 'Coordinate care plans and manage schedules', department: 'Care Services', location: 'Office Based' }, display_order: 4, is_active: true },
  { category: 'position', setting_key: 'support_worker', setting_value: { title: 'Support Worker', description: 'Provide practical and emotional support', department: 'Support Services', location: 'Various Locations' }, display_order: 5, is_active: true },
  { category: 'position', setting_key: 'healthcare_assistant', setting_value: { title: 'Healthcare Assistant', description: 'Assist with medical and personal care needs', department: 'Healthcare', location: 'Various Locations' }, display_order: 6, is_active: true },
];

export async function seedApplicationSettings(): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const defaultSettings = getDefaultSettings();
    
    // Delete all existing settings first
    const { error: deleteError } = await supabase
      .from('job_application_settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    // Insert default settings
    const { error: insertError, count } = await supabase
      .from('job_application_settings')
      .insert(defaultSettings);

    if (insertError) {
      throw insertError;
    }

    return { success: true, count: defaultSettings.length };
  } catch (error: any) {
    console.error('Error seeding application settings:', error);
    return { success: false, error: error.message };
  }
}
