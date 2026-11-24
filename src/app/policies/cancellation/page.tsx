import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Cancellation Policy | AKI ADUNI VENTURES (Aki Enterprise)",
  description:
    "Official Order Cancellation Policy for AKI ADUNI VENTURES. Learn how to cancel orders prior to dispatch with 100% immediate refunds via Paystack Mobile Money and Cards.",
};

export default function CancellationPolicyPage() {
  return (
    <PolicyLayout
      title="Order Cancellation Policy"
      subtitle="Transparent, hassle-free order cancellation terms and refund procedures for AKI ADUNI VENTURES customers."
      policyKey="cancellationPolicy"
      badge="Order Cancellation Terms"
      lastUpdated="November 2026"
    />
  );
}
