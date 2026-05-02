export type LogoProps = {
  variant?: "dark" | "light";
  className?: string;
};

export function Logo({ variant = "dark", className = "" }: LogoProps) {
  const src = variant === "light" ? "/logo-light.svg" : "/logo-dark.svg";
  return <img src={src} alt="Vertual" className={className} />;
}
