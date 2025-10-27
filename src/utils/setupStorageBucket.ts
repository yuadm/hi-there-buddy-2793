import { supabase } from '@/integrations/supabase/client';

export async function setupStorageBucket(): Promise<{ success: boolean; error?: string; needsMigration?: boolean }> {
  try {
    // Check if bucket exists by listing buckets
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      throw listError;
    }

    // Check if company-assets bucket exists
    const bucketExists = buckets?.some(bucket => bucket.id === 'company-assets');

    if (bucketExists) {
      return { 
        success: true,
        needsMigration: false 
      };
    }

    // Bucket doesn't exist - needs SQL migration
    return { 
      success: false,
      needsMigration: true,
      error: 'Storage bucket not found. Please run the SQL migration to create it.'
    };
    
  } catch (error: any) {
    console.error('Error checking storage bucket:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to check storage bucket status' 
    };
  }
}
