import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_HERO_BANNERS } from "@/lib/mock-data";
import { HeroBanner } from "@/types/ecommerce";

function formatBannerRow(row: any): HeroBanner {
  let mobile_image_url = row.mobile_image_url;
  let clicks_count = Number(row.clicks_count) || 0;
  let hide_text_overlay = Boolean(row.hide_text_overlay);
  let secondary_cta_link = row.secondary_cta_link;

  // Unpack metadata if encoded in secondary_cta_link
  if (typeof secondary_cta_link === "string" && secondary_cta_link.startsWith("__meta__:")) {
    try {
      const meta = JSON.parse(secondary_cta_link.replace("__meta__:", ""));
      mobile_image_url = meta.mobile_image_url || mobile_image_url;
      clicks_count = Number(meta.clicks) || clicks_count;
      hide_text_overlay = meta.hide_text === true;
      secondary_cta_link = meta.link || null;
    } catch {
      // ignore
    }
  }

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    badge: row.badge,
    accent_color: row.accent_color || "#F26A00",
    image_url: row.image_url,
    mobile_image_url: mobile_image_url || undefined,
    cta_text: row.cta_text || "Shop Now",
    cta_link: row.cta_link || "/products",
    secondary_cta_text: row.secondary_cta_text || undefined,
    secondary_cta_link: secondary_cta_link || undefined,
    display_order: Number(row.display_order) || 1,
    is_active: row.is_active !== false,
    hide_text_overlay,
    clicks_count,
    created_at: row.created_at || new Date().toISOString(),
  };
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, banners: INITIAL_HERO_BANNERS });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("hero_banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, banners: INITIAL_HERO_BANNERS, fallback: true });
    }

    const formatted = data.map(formatBannerRow);
    return NextResponse.json({ success: true, banners: formatted });
  } catch (err: any) {
    return NextResponse.json({ success: true, banners: INITIAL_HERO_BANNERS, fallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bannerData = await request.json();

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, banner: bannerData, localOnly: true });
    }

    const client = getServiceSupabase();

    // Pack mobile image, clicks, and hide_text_overlay into metadata payload
    const metaPayload = {
      mobile_image_url: bannerData.mobile_image_url || null,
      clicks: Number(bannerData.clicks_count) || 0,
      hide_text: Boolean(bannerData.hide_text_overlay),
      link: bannerData.secondary_cta_link || null,
    };
    const packedSecondaryLink = `__meta__:${JSON.stringify(metaPayload)}`;

    const { data, error } = await client
      .from("hero_banners")
      .upsert({
        id: bannerData.id?.startsWith("banner-") ? undefined : bannerData.id,
        title: bannerData.title,
        subtitle: bannerData.subtitle,
        badge: bannerData.badge,
        accent_color: bannerData.accent_color || "#F26A00",
        image_url: bannerData.image_url,
        cta_text: bannerData.cta_text || "Shop Now",
        cta_link: bannerData.cta_link || "/products",
        secondary_cta_text: bannerData.secondary_cta_text || null,
        secondary_cta_link: packedSecondaryLink,
        display_order: Number(bannerData.display_order) || 1,
        is_active: bannerData.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, banner: formatBannerRow(data) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();
    if (!id || !isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const client = getServiceSupabase();
    const { data: current } = await client
      .from("hero_banners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (current && action === "click") {
      let meta: any = { clicks: 0 };
      if (typeof current.secondary_cta_link === "string" && current.secondary_cta_link.startsWith("__meta__:")) {
        try {
          meta = JSON.parse(current.secondary_cta_link.replace("__meta__:", ""));
        } catch {}
      }
      meta.clicks = (Number(meta.clicks) || 0) + 1;
      const updatedMeta = `__meta__:${JSON.stringify(meta)}`;

      await client
        .from("hero_banners")
        .update({ secondary_cta_link: updatedMeta })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const client = getServiceSupabase();
    await client.from("hero_banners").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
