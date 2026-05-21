"use client";

// Shared client-side billing-period state for the /pricing page.
// The PricingTiers toggle writes here; both PricingTiers cards and the
// PricingComparisonTable header read from it, so toggling Monthly ↔
// Annually re-renders the comparison-table prices in sync with the
// cards above.

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type BillingPeriod = "monthly" | "annual";

type Ctx = {
  billing: BillingPeriod;
  setBilling: (next: BillingPeriod) => void;
};

const BillingCtx = createContext<Ctx | null>(null);

export function BillingProvider({ children }: { children: ReactNode }) {
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  return (
    <BillingCtx.Provider value={{ billing, setBilling }}>
      {children}
    </BillingCtx.Provider>
  );
}

export function useBilling(): Ctx {
  const ctx = useContext(BillingCtx);
  if (!ctx) {
    throw new Error("useBilling must be used inside <BillingProvider>");
  }
  return ctx;
}
