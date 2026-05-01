import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RootErrorFallback } from "./routes/__root";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RootErrorFallback,
  });

  return router;
};
