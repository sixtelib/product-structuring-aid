import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/experts")({
  component: AdminExpertsPage,
});

function AdminExpertsPage() {
  return (
    <div className="min-h-[60vh] bg-[#F8F9FF]">
      <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">Experts</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Section en construction 🚧</p>
    </div>
  );
}

