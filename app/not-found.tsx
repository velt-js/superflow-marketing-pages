// Global 404 page — Next.js renders this automatically for routes outside
// any layout that already provides chrome. Routes inside the (features)
// route group have their own colocated not-found.tsx that omits the Nav
// (since (features)/layout.tsx already renders one), preventing the double-
// Nav we'd otherwise get for unknown root-level URLs.

import Nav from "@/components/home/Nav";
import { NotFoundContent } from "@/components/NotFoundContent";

// Bare title — the root layout's title.template ("%s | Velt") appends
// the suffix. A pre-suffixed string here would render "Page not found | Velt | Velt".
export const metadata = {
  title: "Page not found",
  description:
    "The page you're looking for doesn't exist. Head back home or jump into the Velt docs.",
};

export default function NotFound() {
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
      <NotFoundContent />
    </>
  );
}
