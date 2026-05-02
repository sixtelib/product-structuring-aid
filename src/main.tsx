import { supabase } from "@/integrations/supabase/client";

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      supabase.auth.refreshSession().catch(() => {
        window.location.reload();
      });
    }
  });
}
