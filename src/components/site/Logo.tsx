import { Link } from "@tanstack/react-router";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "light" ? "text-primary-foreground" : "text-primary";
  const accentColor = "text-accent";

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:-rotate-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" />
          <path d="m9 12 2 2 4-4" className={accentColor} />
        </svg>
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${textColor}`}>
        Recours
      </span>
    </Link>
  );
}
