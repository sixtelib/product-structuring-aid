import { supabase } from "@/integrations/supabase/client";

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    supabase.auth.refreshSession().catch(() => {
      window.location.reload();
    });
  }
});
