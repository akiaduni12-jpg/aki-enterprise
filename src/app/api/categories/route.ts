import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/mock-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, categories: CATEGORIES });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, categories: CATEGORIES, fallback: true });
    }

    return NextResponse.json({ success: true, categories: data });
  } catch (err: any) {
    return NextResponse.json({ success: true, categories: CATEGORIES, fallback: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, category: body, localOnly: true });
    }

    const client = getServiceSupabase();
    const slug =
      body.slug ||
      body.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const { data, error } = await client
      .from("categories")
      .upsert(
        {
          name: body.name,
          slug,
          description: body.description || "",
          icon: body.icon || "FolderTree",
          image_url: body.image_url || null,
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, category: data });
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
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;

    const matchQuery = slug
      ? client.from("categories").update(dbUpdates).eq("slug", slug)
      : client.from("categories").update(dbUpdates).eq("id", id);

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
      ? client.from("categories").delete().eq("slug", slug)
      : client.from("categories").delete().eq("id", id);

    const { error } = await matchQuery;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
