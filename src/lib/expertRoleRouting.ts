import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * When `user_roles` has not synced yet, `isExpert` can be false while the account
 * is still an expert (invite metadata or profiles.role). Guards use this to avoid
 * sending experts to the assuré dashboard or /onboarding (mandat).
 */
export function isExpertUserMetadata(user: User): boolean {
  const role = (user.user_metadata as { role?: unknown } | undefined)?.role;
  return String(role ?? "").trim() === "expert";
}

export async function expertMisfitRedirectPath(
  client: SupabaseClient,
  user: User,
  isExpert: boolean,
): Promise<"/expert/onboarding" | "/expert/dossiers" | null> {
  if (isExpert) return null;
  const metaExpert = isExpertUserMetadata(user);
  const { data } = await client.from("profiles").select("role,prenom,nom").eq("id", user.id).maybeSingle();
  const profileExpert = data?.role === "expert";
  if (!metaExpert && !profileExpert) return null;
  const complete = !!(data?.prenom?.trim() && data?.nom?.trim());
  return complete ? "/expert/dossiers" : "/expert/onboarding";
}
