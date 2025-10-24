-- Seed Job Application Settings with Default Values

-- Personal Settings - Titles
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'title', 'mr', '{"value": "Mr"}', 1, true),
('personal', 'title', 'mrs', '{"value": "Mrs"}', 2, true),
('personal', 'title', 'miss', '{"value": "Miss"}', 3, true),
('personal', 'title', 'ms', '{"value": "Ms"}', 4, true),
('personal', 'title', 'dr', '{"value": "Dr"}', 5, true),
('personal', 'title', 'prof', '{"value": "Prof"}', 6, true);

-- Personal Settings - Boroughs
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'borough', 'barking_dagenham', '{"value": "Barking and Dagenham"}', 1, true),
('personal', 'borough', 'barnet', '{"value": "Barnet"}', 2, true),
('personal', 'borough', 'bexley', '{"value": "Bexley"}', 3, true),
('personal', 'borough', 'brent', '{"value": "Brent"}', 4, true),
('personal', 'borough', 'bromley', '{"value": "Bromley"}', 5, true),
('personal', 'borough', 'camden', '{"value": "Camden"}', 6, true),
('personal', 'borough', 'croydon', '{"value": "Croydon"}', 7, true),
('personal', 'borough', 'ealing', '{"value": "Ealing"}', 8, true),
('personal', 'borough', 'enfield', '{"value": "Enfield"}', 9, true),
('personal', 'borough', 'greenwich', '{"value": "Greenwich"}', 10, true),
('personal', 'borough', 'hackney', '{"value": "Hackney"}', 11, true),
('personal', 'borough', 'hammersmith_fulham', '{"value": "Hammersmith and Fulham"}', 12, true),
('personal', 'borough', 'haringey', '{"value": "Haringey"}', 13, true),
('personal', 'borough', 'harrow', '{"value": "Harrow"}', 14, true),
('personal', 'borough', 'havering', '{"value": "Havering"}', 15, true),
('personal', 'borough', 'hillingdon', '{"value": "Hillingdon"}', 16, true),
('personal', 'borough', 'hounslow', '{"value": "Hounslow"}', 17, true),
('personal', 'borough', 'islington', '{"value": "Islington"}', 18, true),
('personal', 'borough', 'kensington_chelsea', '{"value": "Kensington and Chelsea"}', 19, true),
('personal', 'borough', 'kingston', '{"value": "Kingston upon Thames"}', 20, true),
('personal', 'borough', 'lambeth', '{"value": "Lambeth"}', 21, true),
('personal', 'borough', 'lewisham', '{"value": "Lewisham"}', 22, true),
('personal', 'borough', 'merton', '{"value": "Merton"}', 23, true),
('personal', 'borough', 'newham', '{"value": "Newham"}', 24, true),
('personal', 'borough', 'redbridge', '{"value": "Redbridge"}', 25, true),
('personal', 'borough', 'richmond', '{"value": "Richmond upon Thames"}', 26, true),
('personal', 'borough', 'southwark', '{"value": "Southwark"}', 27, true),
('personal', 'borough', 'sutton', '{"value": "Sutton"}', 28, true),
('personal', 'borough', 'tower_hamlets', '{"value": "Tower Hamlets"}', 29, true),
('personal', 'borough', 'waltham_forest', '{"value": "Waltham Forest"}', 30, true),
('personal', 'borough', 'wandsworth', '{"value": "Wandsworth"}', 31, true),
('personal', 'borough', 'westminster', '{"value": "Westminster"}', 32, true),
('personal', 'borough', 'city_of_london', '{"value": "City of London"}', 33, true);

-- Personal Settings - Languages
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'language', 'english', '{"value": "English"}', 1, true),
('personal', 'language', 'spanish', '{"value": "Spanish"}', 2, true),
('personal', 'language', 'french', '{"value": "French"}', 3, true),
('personal', 'language', 'german', '{"value": "German"}', 4, true),
('personal', 'language', 'polish', '{"value": "Polish"}', 5, true),
('personal', 'language', 'romanian', '{"value": "Romanian"}', 6, true),
('personal', 'language', 'portuguese', '{"value": "Portuguese"}', 7, true),
('personal', 'language', 'arabic', '{"value": "Arabic"}', 8, true),
('personal', 'language', 'bengali', '{"value": "Bengali"}', 9, true),
('personal', 'language', 'urdu', '{"value": "Urdu"}', 10, true),
('personal', 'language', 'punjabi', '{"value": "Punjabi"}', 11, true),
('personal', 'language', 'mandarin', '{"value": "Mandarin"}', 12, true),
('personal', 'language', 'italian', '{"value": "Italian"}', 13, true),
('personal', 'language', 'other', '{"value": "Other"}', 14, true);

-- Personal Settings - English Proficiency
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'english_proficiency', 'native', '{"value": "Native Speaker"}', 1, true),
('personal', 'english_proficiency', 'fluent', '{"value": "Fluent"}', 2, true),
('personal', 'english_proficiency', 'intermediate', '{"value": "Intermediate"}', 3, true),
('personal', 'english_proficiency', 'basic', '{"value": "Basic"}', 4, true),
('personal', 'english_proficiency', 'learning', '{"value": "Learning"}', 5, true);

-- Personal Settings - DBS Options
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'dbs', 'enhanced', '{"value": "Enhanced DBS"}', 1, true),
('personal', 'dbs', 'standard', '{"value": "Standard DBS"}', 2, true),
('personal', 'dbs', 'basic', '{"value": "Basic DBS"}', 3, true),
('personal', 'dbs', 'update_service', '{"value": "DBS Update Service"}', 4, true),
('personal', 'dbs', 'none', '{"value": "No DBS"}', 5, true);

-- Personal Settings - Personal Care
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('personal', 'personal_care', 'experienced', '{"value": "Yes - Experienced"}', 1, true),
('personal', 'personal_care', 'willing', '{"value": "Yes - Willing to Learn"}', 2, true),
('personal', 'personal_care', 'no', '{"value": "No"}', 3, true);

-- Emergency Settings - Relationships
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('emergency', 'relationship', 'parent', '{"value": "Parent"}', 1, true),
('emergency', 'relationship', 'sibling', '{"value": "Sibling"}', 2, true),
('emergency', 'relationship', 'spouse', '{"value": "Spouse"}', 3, true),
('emergency', 'relationship', 'partner', '{"value": "Partner"}', 4, true),
('emergency', 'relationship', 'friend', '{"value": "Friend"}', 5, true),
('emergency', 'relationship', 'colleague', '{"value": "Colleague"}', 6, true),
('emergency', 'relationship', 'other', '{"value": "Other"}', 7, true);

-- Emergency Settings - How Did You Hear About Us
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('emergency', 'hear_about', 'job_board', '{"value": "Job Board"}', 1, true),
('emergency', 'hear_about', 'social_media', '{"value": "Social Media"}', 2, true),
('emergency', 'hear_about', 'website', '{"value": "Company Website"}', 3, true),
('emergency', 'hear_about', 'referral', '{"value": "Referral"}', 4, true),
('emergency', 'hear_about', 'walk_in', '{"value": "Walk-in"}', 5, true),
('emergency', 'hear_about', 'agency', '{"value": "Recruitment Agency"}', 6, true),
('emergency', 'hear_about', 'newspaper', '{"value": "Newspaper"}', 7, true),
('emergency', 'hear_about', 'other', '{"value": "Other"}', 8, true);

-- Shift Settings
INSERT INTO job_application_settings (category, setting_key, setting_value, display_order, is_active) VALUES
('shift', 'early_shift', '{"name": "early_shift", "label": "Early Shift", "start_time": "06:00", "end_time": "14:00"}', 1, true),
('shift', 'day_shift', '{"name": "day_shift", "label": "Day Shift", "start_time": "09:00", "end_time": "17:00"}', 2, true),
('shift', 'late_shift', '{"name": "late_shift", "label": "Late Shift", "start_time": "14:00", "end_time": "22:00"}', 3, true),
('shift', 'night_shift', '{"name": "night_shift", "label": "Night Shift", "start_time": "22:00", "end_time": "06:00"}', 4, true),
('shift', 'split_shift', '{"name": "split_shift", "label": "Split Shift", "start_time": "07:00", "end_time": "21:00"}', 5, true),
('shift', 'on_call', '{"name": "on_call", "label": "On-Call", "start_time": "00:00", "end_time": "23:59"}', 6, true);

-- Skills Settings - Categories
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'category', 'personal_care', '{"id": "personal_care", "name": "Personal Care"}', 1, true),
('skills', 'category', 'medical_support', '{"id": "medical_support", "name": "Medical Support"}', 2, true),
('skills', 'category', 'specialized_care', '{"id": "specialized_care", "name": "Specialized Care"}', 3, true),
('skills', 'category', 'household', '{"id": "household", "name": "Household Tasks"}', 4, true),
('skills', 'category', 'additional', '{"id": "additional", "name": "Additional Skills"}', 5, true);

-- Skills Settings - Personal Care Skills
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'skill', 'bathing', '{"name": "Bathing/Showering", "category_id": "personal_care"}', 1, true),
('skills', 'skill', 'dressing', '{"name": "Dressing", "category_id": "personal_care"}', 2, true),
('skills', 'skill', 'grooming', '{"name": "Grooming", "category_id": "personal_care"}', 3, true),
('skills', 'skill', 'toileting', '{"name": "Toileting", "category_id": "personal_care"}', 4, true),
('skills', 'skill', 'mobility', '{"name": "Mobility Assistance", "category_id": "personal_care"}', 5, true);

-- Skills Settings - Medical Support Skills
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'skill', 'medication', '{"name": "Medication Administration", "category_id": "medical_support"}', 6, true),
('skills', 'skill', 'catheter', '{"name": "Catheter Care", "category_id": "medical_support"}', 7, true),
('skills', 'skill', 'peg_feeding', '{"name": "PEG Feeding", "category_id": "medical_support"}', 8, true),
('skills', 'skill', 'stoma', '{"name": "Stoma Care", "category_id": "medical_support"}', 9, true),
('skills', 'skill', 'wound_care', '{"name": "Wound Care", "category_id": "medical_support"}', 10, true);

-- Skills Settings - Specialized Care Skills
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'skill', 'dementia', '{"name": "Dementia Care", "category_id": "specialized_care"}', 11, true),
('skills', 'skill', 'learning_disabilities', '{"name": "Learning Disabilities", "category_id": "specialized_care"}', 12, true),
('skills', 'skill', 'mental_health', '{"name": "Mental Health Support", "category_id": "specialized_care"}', 13, true),
('skills', 'skill', 'palliative', '{"name": "Palliative Care", "category_id": "specialized_care"}', 14, true),
('skills', 'skill', 'autism', '{"name": "Autism Support", "category_id": "specialized_care"}', 15, true);

-- Skills Settings - Household Tasks Skills
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'skill', 'meal_prep', '{"name": "Meal Preparation", "category_id": "household"}', 16, true),
('skills', 'skill', 'housekeeping', '{"name": "Light Housekeeping", "category_id": "household"}', 17, true),
('skills', 'skill', 'laundry', '{"name": "Laundry", "category_id": "household"}', 18, true),
('skills', 'skill', 'shopping', '{"name": "Shopping", "category_id": "household"}', 19, true);

-- Skills Settings - Additional Skills
INSERT INTO job_application_settings (category, setting_type, setting_key, setting_value, display_order, is_active) VALUES
('skills', 'skill', 'first_aid', '{"name": "First Aid", "category_id": "additional"}', 20, true),
('skills', 'skill', 'manual_handling', '{"name": "Manual Handling", "category_id": "additional"}', 21, true),
('skills', 'skill', 'infection_control', '{"name": "Infection Control", "category_id": "additional"}', 22, true),
('skills', 'skill', 'record_keeping', '{"name": "Record Keeping", "category_id": "additional"}', 23, true);

-- Status Settings
INSERT INTO job_application_settings (category, setting_key, setting_value, display_order, is_active) VALUES
('status', 'new', '{"status_name": "New"}', 1, true),
('status', 'under_review', '{"status_name": "Under Review"}', 2, true),
('status', 'interview_scheduled', '{"status_name": "Interview Scheduled"}', 3, true),
('status', 'interviewed', '{"status_name": "Interviewed"}', 4, true),
('status', 'offer_extended', '{"status_name": "Offer Extended"}', 5, true),
('status', 'accepted', '{"status_name": "Accepted"}', 6, true),
('status', 'rejected', '{"status_name": "Rejected"}', 7, true),
('status', 'withdrawn', '{"status_name": "Withdrawn"}', 8, true);

-- Position Settings
INSERT INTO job_application_settings (category, setting_key, setting_value, display_order, is_active) VALUES
('position', 'care_worker', '{"title": "Care Worker", "description": "Provide direct care and support to service users", "department": "Care Services", "location": "Various Locations"}', 1, true),
('position', 'senior_care_worker', '{"title": "Senior Care Worker", "description": "Lead care delivery and support junior staff", "department": "Care Services", "location": "Various Locations"}', 2, true),
('position', 'team_leader', '{"title": "Team Leader", "description": "Manage care teams and ensure quality service delivery", "department": "Care Services", "location": "Various Locations"}', 3, true),
('position', 'care_coordinator', '{"title": "Care Coordinator", "description": "Coordinate care plans and manage schedules", "department": "Care Services", "location": "Office Based"}', 4, true),
('position', 'support_worker', '{"title": "Support Worker", "description": "Provide practical and emotional support", "department": "Support Services", "location": "Various Locations"}', 5, true),
('position', 'healthcare_assistant', '{"title": "Healthcare Assistant", "description": "Assist with medical and personal care needs", "department": "Healthcare", "location": "Various Locations"}', 6, true);