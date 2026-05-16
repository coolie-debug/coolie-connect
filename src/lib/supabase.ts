import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// During SSR the env vars are available; if missing fall back to a no-op.
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : (createClient<Database>("https://placeholder.supabase.co", "placeholder", {
      realtime: { params: { eventsPerSecond: 0 } },
    }) as ReturnType<typeof createClient<Database>>);

export { isConfigured as supabaseConfigured };
