import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Aki Enterprise - 14-Day Guarantee",
  description:
    "Official Return and Refund Policy for Aki Enterprise. 14-day return window, transparent refund processing, and full Google Merchant Center compliance.",
};

export default function ReturnsPage() {
  return (
    <PolicyLayout
      title="Return & Refund Policy"
      subtitle="14-day hassle-free returns, clear inspection terms, and full customer protection across Ghana."
      policyKey="returnRefundPolicy"
      badge="Google Merchant Certified"
    />
  );
}
