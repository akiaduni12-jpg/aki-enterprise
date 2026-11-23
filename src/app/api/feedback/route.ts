import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  INITIAL_PRODUCT_REVIEWS,
  INITIAL_STORE_TESTIMONIALS,
} from "@/lib/feedback-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'reviews' or 'testimonials'
    const productId = searchParams.get("productId");

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        reviews: INITIAL_PRODUCT_REVIEWS,
        testimonials: INITIAL_STORE_TESTIMONIALS,
      });
    }

    const client = getServiceSupabase();

    if (type === "testimonials") {
      const { data, error } = await client
        .from("store_testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return NextResponse.json({ success: true, testimonials: INITIAL_STORE_TESTIMONIALS });
      }
      return NextResponse.json({ success: true, testimonials: data });
    }

    if (type === "reviews") {
      let query = client.from("reviews").select("*").order("created_at", { ascending: false });
      if (productId) {
        query = query.eq("product_id", productId);
      }
      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return NextResponse.json({
          success: true,
          reviews: productId
            ? INITIAL_PRODUCT_REVIEWS.filter((r) => r.product_id === productId)
            : INITIAL_PRODUCT_REVIEWS,
        });
      }
      return NextResponse.json({ success: true, reviews: data });
    }

    // Default: return both
    const [revRes, testRes] = await Promise.all([
      client.from("reviews").select("*").order("created_at", { ascending: false }),
      client.from("store_testimonials").select("*").order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      reviews: revRes.data && revRes.data.length > 0 ? revRes.data : INITIAL_PRODUCT_REVIEWS,
      testimonials:
        testRes.data && testRes.data.length > 0 ? testRes.data : INITIAL_STORE_TESTIMONIALS,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      reviews: INITIAL_PRODUCT_REVIEWS,
      testimonials: INITIAL_STORE_TESTIMONIALS,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data: feedbackData } = body;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, data: feedbackData, localOnly: true });
    }

    const client = getServiceSupabase();

    if (type === "testimonial") {
      const { data, error } = await client
        .from("store_testimonials")
        .insert({
          customer_name: feedbackData.customer_name,
          city: feedbackData.city,
          rating: feedbackData.rating || 5,
          highlight: feedbackData.highlight,
          content: feedbackData.content,
          verified_buyer: feedbackData.verified_buyer !== false,
          featured: feedbackData.featured || false,
          status: feedbackData.status || "approved",
        })
        .select()
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, testimonial: data });
    }

    if (type === "review") {
      const { data, error } = await client
        .from("reviews")
        .insert({
          product_id: feedbackData.product_id,
          product_slug: feedbackData.product_slug,
          product_title: feedbackData.product_title,
          customer_name: feedbackData.customer_name,
          rating: feedbackData.rating || 5,
          title: feedbackData.title,
          comment: feedbackData.comment,
          verified_purchase: feedbackData.verified_purchase || false,
          status: feedbackData.status || "approved",
        })
        .select()
        .single();

      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, review: data });
    }

    return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, status } = body;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const client = getServiceSupabase();
    const table = type === "testimonial" ? "store_testimonials" : "reviews";

    const { data, error } = await client
      .from(table)
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'review' or 'testimonial'
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, localOnly: true });
    }

    const client = getServiceSupabase();
    const table = type === "testimonial" ? "store_testimonials" : "reviews";

    const { error } = await client.from(table).delete().eq("id", id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

