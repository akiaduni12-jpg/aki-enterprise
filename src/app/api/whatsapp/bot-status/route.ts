import { NextRequest, NextResponse } from "next/server";
import { isAgentSessionActive, getAgentSessionInfo, setAgentSession } from "@/lib/whatsapp-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    const clean = phone.replace(/\D/g, "");
    const session = await getAgentSessionInfo(clean);
    const isPaused = Boolean(session && Date.now() < session.pausedUntil);

    return NextResponse.json(
      {
        success: true,
        phone: clean,
        isPaused,
        session: session || null,
        remainingMinutes: session ? Math.max(0, Math.round((session.pausedUntil - Date.now()) / 60000)) : 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[Bot Status GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, action, durationHours = 2, reason = "Admin toggled" } = body;

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    const clean = phone.replace(/\D/g, "");
    const shouldPause = action === "pause";

    await setAgentSession(clean, shouldPause, durationHours, reason);

    const session = await getAgentSessionInfo(clean);

    return NextResponse.json({
      success: true,
      phone: clean,
      isPaused: shouldPause,
      session,
      remainingMinutes: session ? Math.max(0, Math.round((session.pausedUntil - Date.now()) / 60000)) : 0,
    });
  } catch (err: any) {
    console.error("[Bot Status POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
