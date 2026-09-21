"use client";

// Registers this site's tools with the browser's WebMCP API.
//
// Mounted once in app/layout.tsx, so every route is covered without each page
// wiring anything up. The tool list is derived from the path (see
// lib/webmcp/tools.ts), so a client-side navigation swaps the page's tools the
// same way a full load would.
//
// In a browser without WebMCP - which today is nearly all of them, the API
// being an origin trial - `getModelContext()` returns null and this renders
// nothing and does nothing. There is no polyfill and no fallback path: the
// site's other agent surfaces (/api/mcp, the .md copies, the discovery
// documents in app/.well-known/) are what serve those clients, and they are
// unaffected by anything here.
//
// Registration is asynchronous and the effect can be torn down mid-flight (a
// fast navigation, React's development double-invoke), so every registration
// is tied to an AbortController that the cleanup aborts. Aborting the signal
// is the spec's only way to unregister a tool, and it also covers the case
// where the promise resolves after the effect is gone.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { toolsForPath } from "@/lib/webmcp/tools";
import { getModelContext } from "@/lib/webmcp/types";

export function WebMcpProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const modelContext = getModelContext();
    if (!modelContext) return;

    const controller = new AbortController();

    void (async () => {
      try {
        for (const tool of toolsForPath(pathname ?? "/")) {
          if (controller.signal.aborted) return;
          await modelContext.registerTool(tool, { signal: controller.signal });
        }
      } catch {
        // A browser mid-spec-change can reject a descriptor this build thinks
        // is valid. That is not worth breaking the page over: the tools are an
        // enhancement, and every one of them is reachable over /api/mcp too.
      }
    })();

    return () => controller.abort();
  }, [pathname]);

  return null;
}
