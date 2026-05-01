import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, BarChart2, CreditCard, FolderOpen, LayoutDashboard, LogOut, Menu, Star, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/admin_/utilisateurs/$userId")({
  component: ProfilUtilisateur,
});

function AdminProfileShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const navItems = [
    { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
    { to: "/admin/dossiers", label: "Dossiers", icon: FolderOpen },
    { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { to: "/admin/experts", label: "Experts", icon: Star },
    { to: "/admin/reporting", label: "Reporting", icon: BarChart2 },
    { to: "/admin/facturation", label: "Facturation", icon: CreditCard },
  ] as const;

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  const Sidebar = (
    <aside className="flex h-full w-[240px] flex-col bg-[#111827] text-white">
      <div className="p-6">
        <img src="/logo-vertual.png" alt="Vertual" className="h-8 w-auto" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              activeOptions={{ exact: item.exact ?? false }}
              className="flex items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium transition-colors"
              activeProps={{
                className: "bg-[#1F2937] text-white",
                style: { borderLeft: "3px solid #5B50F0" },
              }}
              inactiveProps={{ className: "text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white" }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="min-w-0 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-[#9CA3AF]">{user?.email}</p>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="mt-3 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-[#1F2937] hover:text-red-200"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Se déconnecter
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="flex min-h-screen">
        {!isMobile ? (
          <div className="sticky top-0 h-screen shrink-0">{Sidebar}</div>
        ) : (
          sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <button
                type="button"
                aria-label="Fermer la navigation"
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="relative h-full">{Sidebar}</div>
            </div>
          )
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 h-[60px] border-b border-[#E5E7EB] bg-white">
            <div className="flex h-full items-center justify-between gap-4 px-8">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#111827] hover:bg-gray-100"
                    aria-label="Ouvrir la navigation"
                  >
                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                )}
                <p className="text-sm font-semibold text-[#111827]">{title}</p>
              </div>

              <p className="text-sm text-[#6B7280]">{todayLabel}</p>
            </div>
          </header>

          <main className="min-h-[calc(100vh-60px)] flex-1 overflow-y-auto bg-[#F8F9FF] p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function ProfilUtilisateur() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    assureur_principal: "",
    adresse: "",
    numero_contrat: "",
    email_contact: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        const { data: dossiersData, error: dossiersError } = await supabase
          .from("dossiers")
          .select("*")
          .eq("user_id", userId)
          .order("date_ouverture", { ascending: false });

        if (dossiersError) throw dossiersError;
        if (!isMounted) return;

        setProfile(profileData);
        if (profileData) {
          setForm({
            prenom: profileData.prenom || "",
            nom: profileData.nom || "",
            telephone: profileData.telephone || "",
            assureur_principal: profileData.assureur_principal || "",
            adresse: profileData.adresse || "",
            numero_contrat: profileData.numero_contrat || "",
            email_contact: profileData.email_contact || "",
          });
        }
        setDossiers(dossiersData ?? []);
      } catch (err: any) {
        console.error("Erreur chargement profil:", err);
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  function Field({ label, value, field }: { label: string; value: string; field: string }) {
    return (
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6B7280",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        {editing ? (
          <input
            value={form[field as keyof typeof form]}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [field]: e.target.value,
              }))
            }
            style={{
              border: "1px solid #5B50F0",
              borderRadius: "6px",
              padding: "6px 10px",
              width: "100%",
              fontSize: "0.95rem",
            }}
          />
        ) : (
          <p>{value || "Non renseigné"}</p>
        )}
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({ id: userId, ...form });

      if (error) throw error;

      await supabase
        .from("dossiers")
        .update({
          nom_assure: form.nom,
          prenom_assure: form.prenom,
          assureur: form.assureur_principal,
        })
        .eq("user_id", userId);

      setProfile((prev: any) => ({ ...prev, ...form }));
      setEditing(false);
      setSuccessMsg("Profil mis à jour");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  try {
    if (loading)
      return (
        <AdminProfileShell title="Utilisateurs">
          <div style={{ padding: "40px", textAlign: "center" }}>Chargement...</div>
        </AdminProfileShell>
      );

    if (error)
      return (
        <AdminProfileShell title="Utilisateurs">
          <div style={{ padding: "40px" }}>
            <p style={{ color: "red" }}>Erreur : {error}</p>
            <button type="button" onClick={() => navigate({ to: "/admin/utilisateurs" })}>
              Retour
            </button>
          </div>
        </AdminProfileShell>
      );

    return (
      <AdminProfileShell title="Utilisateurs">
      <div style={{ maxWidth: "900px" }}>
            {successMsg && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              background: "#D4EDDA",
              border: "1px solid #C3E6CB",
              color: "#155724",
              padding: "12px 20px",
              borderRadius: "8px",
              zIndex: 1000,
              fontWeight: 500,
            }}
          >
            ✓ Profil mis à jour
          </div>
        )}
        <button
          onClick={() => navigate({ to: "/admin/utilisateurs" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#5B50F0",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "0.875rem",
          }}
        >
          <ArrowLeft size={16} /> Utilisateurs
        </button>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "8px" }}>
          {profile?.prenom || ""} {profile?.nom || "Profil utilisateur"}
        </h1>
        <p style={{ color: "#6B7280", marginBottom: "32px" }}>ID : {userId.slice(0, 8)}...</p>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontWeight: 600, marginBottom: 0 }}>Informations</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                ✏️ Modifier
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    background: "#5B50F0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Sauvegarde..." : "✓ Sauvegarder"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (profile) {
                      setForm({
                        prenom: profile.prenom || "",
                        nom: profile.nom || "",
                        telephone: profile.telephone || "",
                        assureur_principal: profile.assureur_principal || "",
                        adresse: profile.adresse || "",
                        numero_contrat: profile.numero_contrat || "",
                        email_contact: profile.email_contact || "",
                      });
                    }
                  }}
                  style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Prénom" value={form.prenom} field="prenom" />
            <Field label="Nom" value={form.nom} field="nom" />
            <Field label="Téléphone" value={form.telephone} field="telephone" />
            <Field label="Assureur" value={form.assureur_principal} field="assureur_principal" />
            <Field label="Adresse" value={form.adresse} field="adresse" />
            <Field label="Numéro de contrat" value={form.numero_contrat} field="numero_contrat" />
            <Field label="Email contact" value={form.email_contact} field="email_contact" />
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ fontWeight: 600, marginBottom: "16px" }}>Dossiers ({dossiers.length})</h2>
          {dossiers.length === 0 ? (
            <p style={{ color: "#6B7280" }}>Aucun dossier</p>
          ) : (
            dossiers.map((d) => (
              <div
                key={d.id}
                onClick={() =>
                  navigate({
                    to: "/admin/dossiers/$dossierId",
                    params: { dossierId: d.id },
                  })
                }
                style={{
                  padding: "16px",
                  border: "1px solid #F3F4F6",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontWeight: 500 }}>{d.type_sinistre}</p>
                  <p style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    {d.statut} ·{" "}
                    {d.montant_estime ? d.montant_estime + " €" : "Montant non renseigné"}
                  </p>
                </div>
                <span style={{ color: "#5B50F0", fontSize: "0.875rem" }}>Voir →</span>
              </div>
            ))
          )}
        </div>
      </div>
      </AdminProfileShell>
    );
  } catch (err) {
    return (
      <AdminProfileShell title="Utilisateurs">
        <div style={{ padding: "40px" }}>
          <h2 style={{ color: "red" }}>Erreur de rendu</h2>
          <pre>{String(err)}</pre>
          <button type="button" onClick={() => window.history.back()}>
            Retour
          </button>
        </div>
      </AdminProfileShell>
    );
  }
}
