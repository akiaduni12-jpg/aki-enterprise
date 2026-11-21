import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Privacy Notice | Aki Enterprise - Ghana Data Protection",
  description:
    "Official Privacy Policy of Aki Enterprise. Compliant with Ghana Data Protection Act 2012 (Act 843). We protect your personal and payment details.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy & Data Protection Policy"
      subtitle="How Aki Enterprise collects, secures, and safeguards your order and contact details."
      policyKey="privacyPolicy"
      badge="Data Protection Compliant"
    />
  );
}
