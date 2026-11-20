import { NextRequest, NextResponse } from "next/server";
import { INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  // Match campaign by slug
  const campaign = INITIAL_QR_CAMPAIGNS.find((c) => c.slug === slug);

  const destination = campaign ? campaign.destination_path : "/products";

  // Construct absolute URL
  const redirectUrl = new URL(destination, request.nextUrl.origin);

  // Append attribution query parameters
  redirectUrl.searchParams.set("utm_source", "in_store_qr");
  if (campaign) {
    redirectUrl.searchParams.set("qr_campaign", campaign.id);
  }

  return NextResponse.redirect(redirectUrl, { status: 307 });
}
