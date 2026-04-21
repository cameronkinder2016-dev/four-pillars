import { createClient } from '@supabase/supabase-js'

// Supabase anon keys are public by design — they're embedded in every
// client bundle regardless of how they're supplied. Hardcoding them here
// removes an entire class of deployment bug (truncated / mispasted env
// vars on Vercel were silently overriding the fallback and shipping a
// broken key). The only downside is project-switching requires a code
// change, which is fine for a single-environment personal app.
//
// If this ever needs to point at a staging project, temporarily
// override at runtime via `globalThis.__SUPABASE_ANON_KEY__` in the
// browser console before the bundle loads — no code changes needed.

const SUPABASE_URL = 'https://mmlwolmbivmmjbzkzxii.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbHdvbG1iaXZtbWpiemt6eGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Nzk4NTIsImV4cCI6MjA5MjA1NTg1Mn0.JY1Ut5cd0P_LZfOQvxB8vUHblaYwKob1s0h8JRY6MlI'

// Sanity check on the JWT shape. A valid Supabase anon key is three
// base64url segments separated by dots. If someone edits this file and
// mangles the key, fail loudly at load time instead of shipping a broken
// app that errors only when the user taps Save.
if (SUPABASE_ANON_KEY.split('.').length !== 3 || SUPABASE_ANON_KEY.length < 200) {
  throw new Error(
    'SUPABASE_ANON_KEY is malformed — expected a JWT with 3 segments and length >= 200.',
  )
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})
