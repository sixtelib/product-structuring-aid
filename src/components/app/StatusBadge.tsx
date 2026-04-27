import { CASE_STATUS_LABELS } from "@/lib/claim-types";

const TONE_CLASSES: Record<string, string> = {
  info: "bg-secondary text-primary",
  warning: "bg-accent/15 text-accent-foreground border border-accent/30",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30",
  danger: "bg-destructive/15 text-destructive border border-destructive/30",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const meta = CASE_STATUS_LABELS[status] ?? { label: status, tone: "muted" as const };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[meta.tone]}`}>
      {meta.label}
    </span>
  );
}
