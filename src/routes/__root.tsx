import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import { queryClient } from "../lib/query-client";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Recipe Roundup",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: () => (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Header />
        <Outlet />
      </RootDocument>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gradient-to-b from-[#292B49] to-[#7E9FC8] h-screen">
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
