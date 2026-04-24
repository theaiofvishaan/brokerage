import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = createClient()

export interface Contact {
  id: string
  created_at: string
  first_name: string | null
  last_name: string | null
  organization: string | null
  vendor_type: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  website: string | null
  notes: string | null
  last_conversation_date: string | null
  last_conversation_notes: string | null
  personal_notes: string | null
  added_by: string | null
}

export interface NewContact {
  first_name: string
  last_name: string
  organization?: string
  vendor_type?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  website?: string
  notes?: string
}
