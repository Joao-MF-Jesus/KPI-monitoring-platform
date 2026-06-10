import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://ibsvxajuyvzszvgluqtx.supabase.co";
const fallbackSupabasePublishableKey = "sb_publishable_ZrSXk8ACQWwmVVfLaVcKbA_0RjuDZ40";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackSupabaseUrl;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  fallbackSupabasePublishableKey;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
