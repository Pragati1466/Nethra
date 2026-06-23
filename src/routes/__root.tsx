import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../lib/theme-provider";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <svg className="w-64 h-64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill="var(--primary)" fillOpacity="0.1" />
            <circle cx="100" cy="100" r="60" fill="var(--primary)" fillOpacity="0.15" />
            <path d="M100 40 L100 100 L140 120" stroke="var(--primary)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="100" r="8" fill="var(--primary)" />
            <circle cx="140" cy="120" r="5" fill="var(--primary)" fillOpacity="0.6" />
            <path d="M60 140 Q100 180 140 140" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.5" />
            <text x="100" y="75" textAnchor="middle" fill="var(--foreground)" fontSize="48" fontWeight="bold" fontFamily="monospace">404</text>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Route Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The operational route you're trying to access doesn't exist or has been decommissioned. Let's get you back to command center.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NETHRA — Smart City Traffic OS" },
      { name: "description", content: "Predict, simulate, plan, deploy and monitor traffic operations end-to-end." },
      { name: "author", content: "NETHRA" },
      { property: "og:title", content: "NETHRA — Smart City Traffic OS" },
      { property: "og:description", content: "An operational decision-making platform for traffic police, planners and emergency response." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /><Toaster /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="nethra-ui-theme">
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
