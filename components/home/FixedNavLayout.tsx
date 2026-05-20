// Shared layout wrapper that renders a fixed-position Nav above the page
// content. Used by every route whose only chrome contribution is the
// homepage Nav (most marketing pages). Each route's layout.tsx re-exports
// this as default, so future Nav-chrome changes happen in one file:
//
//   // app/{route}/layout.tsx
//   export { FixedNavLayout as default } from "@/components/home/FixedNavLayout";
//
// Routes that need additional layout-level content (JSON-LD, breadcrumb
// nodes, etc. — see app/book-demo/layout.tsx) compose their own layout
// instead of re-exporting this one.

import Nav from "@/components/home/Nav";

export function FixedNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <Nav />
      </div>
      {children}
    </>
  );
}
