import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const client = getServiceSupabase();
    let query = client
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `);

    // Match by UUID or order_number
    if (id.startsWith("AKI-")) {
      query = query.eq("order_number", id);
    } else {
      query = query.eq("id", id);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { order_status, payment_status, staff_notes } = body;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (staff_notes !== undefined) updateData.staff_notes = staff_notes;

    const client = getServiceSupabase();
    let query = client.from("orders").update(updateData);

    if (id.startsWith("AKI-")) {
      query = query.eq("order_number", id);
    } else {
      query = query.eq("id", id);
    }

    const { data: updated, error } = await query.select(`*, items:order_items(*)`).single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
