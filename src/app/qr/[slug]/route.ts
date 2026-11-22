import { NextRequest, NextResponse } from "next/server";
import { INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  let destination = "/products";
  let campaignId = "";

  // 1. Try fetching campaign from Supabase
  if (isSupabaseConfigured) {
    try {
      const client = getServiceSupabase();
      const { data: dbCampaign } = await client
        .from("qr_campaigns")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (dbCampaign) {
        destination = dbCampaign.destination_path || "/products";
        campaignId = dbCampaign.id;

        // Record scan count & log in background
        Promise.all([
          client
            .from("qr_campaigns")
            .update({
              scans_count: (dbCampaign.scans_count || 0) + 1,
            })
            .eq("id", dbCampaign.id),
          client.from("qr_scans").insert({
            campaign_id: dbCampaign.id,
            user_agent: request.headers.get("user-agent") || "unknown",
          }),
        ]).catch((err) => console.warn("QR scan tracking warning:", err));
      }
    } catch (err) {
      console.warn("QR database lookup exception:", err);
    }
  }

  // 2. Fallback to initial mock campaigns if not found in Supabase
  if (!campaignId) {
    const mockCampaign = INITIAL_QR_CAMPAIGNS.find((c) => c.slug === slug);
    if (mockCampaign) {
      destination = mockCampaign.destination_path;
      campaignId = mockCampaign.id;
    }
  }

  // Construct absolute URL
  const redirectUrl = new URL(destination, request.nextUrl.origin);
  redirectUrl.searchParams.set("utm_source", "in_store_qr");
  if (campaignId) {
    redirectUrl.searchParams.set("qr_campaign", campaignId);
  }

  return NextResponse.redirect(redirectUrl, { status: 307 });
}
