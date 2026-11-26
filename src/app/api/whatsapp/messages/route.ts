import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppMessages } from "@/lib/whatsapp-store";

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
