import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppMessages } from "@/lib/whatsapp-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get("since");
    const sinceTimestamp = since ? parseInt(since, 10) : undefined;

    const messages = getWhatsAppMessages(sinceTimestamp);

    return NextResponse.json({
      success: true,
      messages,
      serverTime: Date.now(),
    });
  } catch (err: any) {
    console.error("[WhatsApp Messages API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
