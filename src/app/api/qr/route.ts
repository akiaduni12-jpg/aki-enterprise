import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_QR_CAMPAIGNS } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, campaigns: INITIAL_QR_CAMPAIGNS });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("qr_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, campaigns: INITIAL_QR_CAMPAIGNS });
    }

    return NextResponse.json({ success: true, campaigns: data });
  } catch (error: any) {
    console.error("[QR API] GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch QR campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      campaign_name,
      slug,
      destination_path = "/products",
      location_tag = "Main Shop Display",
    } = body;

    if (!campaign_name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const cleanSlug =
      slug ||
      campaign_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newCampaign = {
      campaign_name,
      slug: cleanSlug,
      destination_path,
      location_tag,
      is_active: true,
      scans_count: 0,
      orders_count: 0,
      total_revenue: 0,
    };

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from("qr_campaigns")
        .insert(newCampaign)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ success: true, campaign: data });
    }

    return NextResponse.json({
      success: true,
      campaign: {
        id: `qr-${Date.now()}`,
        ...newCampaign,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[QR API] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create QR campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { error } = await client.from("qr_campaigns").delete().eq("id", id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("[QR API] DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete QR campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const client = getServiceSupabase();
      const { data, error } = await client
        .from("qr_campaigns")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, campaign: data });
    }

    return NextResponse.json({ success: true, id, is_active });
  } catch (error: any) {
    console.error("[QR API] PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update QR campaign" },
      { status: 500 }
    );
  }
}
