import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "About Us | AKI ADUNI VENTURES (Trading as Aki Enterprise)",
  description:
    "Learn about AKI ADUNI VENTURES (Trading as Aki Enterprise), officially registered Ghanaian retailer of original smartphones, certified UK-used iPhones, GaN chargers, and electronics located in Miaso, Kwahu East. 100% on-hand physical stock with verified store warranty.",
};

export default function AboutPage() {
  return (
    <PolicyLayout
      title="About AKI ADUNI VENTURES"
      subtitle="Registered Ghanaian commercial retailer (BN: AKI ADUNI VENTURES • ID: 2118270) trading as Aki Enterprise. Authentic smartphones, physical in-stock inventory, and dependable electronics service."
      policyKey="aboutUs"
      badge="Registered Business Entity • Form A"
      lastUpdated="November 2026"
    />
  );
}
