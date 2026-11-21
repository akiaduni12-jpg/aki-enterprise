import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Warranty Protection & Policy | Aki Enterprise",
  description:
    "12-Month warranty on Brand New items, 6-Month warranty on certified UK-Used smartphones, and 85%+ battery health guarantee at Aki Enterprise Ghana.",
};

export default function WarrantyPolicyPage() {
  return (
    <PolicyLayout
      title="Shop Warranty & Protection Policy"
      subtitle="Transparent 12-month and 6-month coverage terms, battery health guarantees, and claim procedures."
      policyKey="warrantyPolicy"
      badge="Warranty Backed"
    />
  );
}
