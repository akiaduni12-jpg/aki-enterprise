import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { BRANDS } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, brands: BRANDS });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, brands: BRANDS, fallback: true });
    }

    return NextResponse.json({ success: true, brands: data });
  } catch (err: any) {
    return NextResponse.json({ success: true, brands: BRANDS, fallback: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, brand: body, localOnly: true });
    }

    const client = getServiceSupabase();
    const slug =
      body.slug ||
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const { data, error } = await client
      .from("brands")
      .upsert(
        {
          name: body.name,
          slug,
          logo_url: body.logo_url || null,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, brand: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, slug, updates } = await req.json();
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const client = getServiceSupabase();
    const dbUpdates: Record<string, any> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.logo_url !== undefined) dbUpdates.logo_url = updates.logo_url;

    const matchQuery = slug
      ? client.from("brands").update(dbUpdates).eq("slug", slug)
      : client.from("brands").update(dbUpdates).eq("id", id);

    const { data, error } = await matchQuery.select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const client = getServiceSupabase();
    const matchQuery = slug
      ? client.from("brands").delete().eq("slug", slug)
      : client.from("brands").delete().eq("id", id);

    const { error } = await matchQuery;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
