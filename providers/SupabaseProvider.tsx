"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect } from 'react'

const Context = createContext(null)

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === null) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
