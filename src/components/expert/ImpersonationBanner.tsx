import { useNavigate } from "@tanstack/react-router";
import { clearImpersonation } from "@/lib/expertImpersonation";

type ImpersonationBannerProps = {
  expertName: string;
};

export function ImpersonationBanner({ expertName }: ImpersonationBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-amber-300/60 bg-amber-100 px-4 py-3 text-amber-950 sm:px-6"
      role="status"
    >
      <p className="text-sm font-medium">
        Mode aperçu — Vous visualisez en tant que <span className="font-semibold">{expertName}</span>
      </p>
      <button
        type="button"
        onClick={() => {
          clearImpersonation();
          void navigate({ to: "/admin", replace: true });
        }}
        className="rounded-lg bg-amber-900 px-3 py-1.5 text-sm font-semibold text-amber-50 transition-colors hover:bg-amber-950"
      >
        Retour admin
      </button>
    </div>
  );
}
