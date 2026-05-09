"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 4_000,          // data fresh for 4 s before background refetch
            gcTime:    5 * 60_000,     // cache for 5 min
            retry:     1,
            refetchOnWindowFocus: true,
          },
        },
      }),
    []
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
