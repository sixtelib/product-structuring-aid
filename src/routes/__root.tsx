import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

import appCss from "../styles.css?url";

const GOOGLE_FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

const asyncCssActivationScript = `(function(){
  document.querySelectorAll('link[data-async-css]').forEach(function(link){
    if (link.sheet) { link.media = 'all'; return; }
    link.addEventListener('load', function(){ link.media = 'all'; });
  });
})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-glow"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vertual ,  Expert d'assuré en ligne" },
      {
        name: "description",
        content:
          "Vertual défend les assurés sinistrés face à leurs assureurs. Analyse gratuite de votre dossier, success fee uniquement.",
      },
      { property: "og:title", content: "Vertual ,  Expert d'assuré en ligne" },
      { property: "og:description", content: "Vertual défend les assurés sinistrés face à leurs assureurs." },
      { property: "og:url", content: "https://vertual.fr" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vertual ,  Expert d'assuré en ligne" },
      {
        name: "twitter:description",
        content: "Vertual défend les assurés sinistrés face à leurs assureurs.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", href: appCss, as: "style" },
      { rel: "preload", href: GOOGLE_FONT_STYLESHEET, as: "style", crossOrigin: "anonymous" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
        <link rel="stylesheet" href={appCss} media="print" data-async-css />
        <link
          rel="stylesheet"
          href={GOOGLE_FONT_STYLESHEET}
          media="print"
          crossOrigin="anonymous"
          data-async-css
        />
        <noscript>
          <link rel="stylesheet" href={appCss} />
          <link rel="stylesheet" href={GOOGLE_FONT_STYLESHEET} crossOrigin="anonymous" />
        </noscript>
        <script dangerouslySetInnerHTML={{ __html: asyncCssActivationScript }} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-81EYKE18FC" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-81EYKE18FC');
`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") {
        console.log("Token rafraîchi automatiquement");
      }

      if (event === "SIGNED_OUT") {
        const path = window.location.pathname;
        const publicPaths = [
          "/",
          "/login",
          "/auth",
          "/reset-password",
          "/onboarding",
          "/comment-ca-marche",
          "/tarifs",
          "/faq",
          "/a-propos",
          "/guides",
          "/sinistres",
          "/experts",
        ];

        const isPublic = publicPaths.some(
          (p) =>
            path === p ||
            path.startsWith("/guides/") ||
            path.startsWith("/sinistres/") ||
            path.startsWith("/experts/"),
        );

        if (!isPublic) {
          window.location.href = "/login";
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
