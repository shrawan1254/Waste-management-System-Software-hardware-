import React, { createContext, useContext } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '../utils/supabase/client'

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined)

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Get the singleton Supabase client instance
  const supabase = getSupabaseClient()
  
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  )
}