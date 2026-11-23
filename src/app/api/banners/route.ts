import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_HERO_BANNERS } from "@/lib/mock-data";

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

    return NextResponse.json({ success: true, banners: data });
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
        secondary_cta_link: bannerData.secondary_cta_link || null,
        display_order: bannerData.display_order || 1,
        is_active: bannerData.is_active !== false,
        hide_text_overlay: bannerData.hide_text_overlay === true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, banner: data });
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
