import { Metadata } from "next";
import { PolicyLayout } from "@/components/policies/policy-layout";

export const metadata: Metadata = {
  title: "Delivery & Shipping Policy | Aki Enterprise Ghana",
  description:
    "Nationwide express delivery across Ghana. Free delivery on orders over GH₵ 500. Same-day dispatch and physical store pickup in Miaso, Kwahu East.",
};

export default function DeliveryPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="Nationwide delivery rates, dispatch timelines, and in-store pickup options."
      policyKey="deliveryPolicy"
      badge="Fast Dispatch"
    />
  );
}
