import { supabase } from '@/integrations/supabase/client';

export async function setupStorageBucket(): Promise<{ success: boolean; error?: string }> {
  try {
    // Create bucket with configuration
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('company-assets', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
      });

    // Bucket might already exist, which is fine
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    // Note: RLS policies are handled by SQL migration
    // This function creates the bucket if it doesn't exist
    
    return { success: true };
  } catch (error: any) {
    console.error('Error setting up storage bucket:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to setup storage bucket' 
    };
  }
}
