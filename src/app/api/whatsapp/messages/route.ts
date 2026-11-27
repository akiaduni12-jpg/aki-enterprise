import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppMessages, markWhatsAppMessagesAsRead } from "@/lib/whatsapp-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const sinceTimestamp = since ? parseInt(since, 10) : undefined;

    const messages = await getWhatsAppMessages(sinceTimestamp);

    return NextResponse.json(
      {
        success: true,
        messages,
        serverTime: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[WhatsApp Messages API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone } = body;

    if (action === "mark_read" && phone) {
      const updated = await markWhatsAppMessagesAsRead(phone);
      return NextResponse.json({ success: true, updatedCount: updated });
    }

    return NextResponse.json({ error: "Invalid action or missing phone" }, { status: 400 });
  } catch (err: any) {
    console.error("[WhatsApp Messages API POST] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
