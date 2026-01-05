import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Singleton pattern to ensure only one Supabase client instance
let supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    )
  }
  return supabaseClient
}

// Export the client instance
export const supabase = getSupabaseClient()