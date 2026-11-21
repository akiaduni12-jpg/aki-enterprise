import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "About Us | Aki Enterprise - Ghana Electronics & Smart Devices",
  description:
    "Learn about Aki Enterprise, Ghana's certified retailer of original smartphones, certified UK-used iPhones, GaN chargers, and electronics located in Miaso, Kwahu East.",
};

export default function AboutPage() {
  return (
    <PolicyLayout
      title="About Aki Enterprise"
      subtitle="Authentic smart electronics, certified UK-used devices, and dependable customer service in Ghana."
      policyKey="aboutUs"
      badge="About Our Store"
    />
  );
}
