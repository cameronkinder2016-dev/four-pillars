import { createClient } from '@supabase/supabase-js'

// Supabase anon keys are designed to be public — they're embedded in the
// client bundle at build time regardless of where they come from. Hardcoding
// them here as fallback eliminates a class of deployment bugs (env var not
// set, truncated, or mispasted in Vercel's dashboard). Environment variables
// still win if set, so switching projects or running against a staging DB
// doesn't require a code change.

const FALLBACK_URL = 'https://mmlwolmbivmmjbzkzxii.supabase.co'
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbHdvbG1iaXZtbWpiemt6eGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Nzk4NTIsImV4cCI6MjA5MjA1NTg1Mn0.JY1Ut5cd0P_LZfOQvxB8vUHblaYwKob1s0h8JRY6MlI'

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL
const anonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  FALLBACK_ANON_KEY

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
})
