"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Creamos el cliente solo una vez
  //const [queryClient] = useState(() => new QueryClient());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 min
          },
        },
      })
  );


  return (
        <QueryClientProvider client={queryClient}>
        {children}
        </QueryClientProvider>

  );
}
