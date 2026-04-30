import { useEffect } from "react";

/** Injects JSON-LD script tags into document.head (for Rich Results); removes them on unmount. */
export function useJsonLdInHead(...schemas: object[]): void {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];
    for (const data of schemas) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
      scripts.push(script);
    }
    return () => {
      for (const s of scripts) {
        s.remove();
      }
    };
  }, []);
}
