import pkg from "react-helmet-async";

const { HelmetProvider } = pkg;

export function AppHelmetProvider({ children }: { children: React.ReactNode }) {
  return <HelmetProvider>{children}</HelmetProvider>;
}
