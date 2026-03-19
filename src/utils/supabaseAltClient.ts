import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_MY_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_MY_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("⚠️ Missing VITE_MY_SUPABASE_URL or VITE_MY_SUPABASE_ANON_KEY. Alternative Supabase client may not work correctly.");
}

// Export the alternative client for payment links and receipts
export const supabaseAltClient = createClient(
    SUPABASE_URL || "",
    SUPABASE_ANON_KEY || ""
);
