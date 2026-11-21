import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Terms and Conditions | Aki Enterprise Ghana",
  description:
    "Terms and Conditions governing product sales, device warranties, and store policies at Aki Enterprise in Ghana.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions of Service"
      subtitle="Legal agreement governing online orders, in-store purchases, and device service."
      policyKey="termsConditions"
      badge="Legal Agreement"
    />
  );
}
