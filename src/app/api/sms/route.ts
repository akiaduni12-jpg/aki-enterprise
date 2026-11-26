import { NextRequest, NextResponse } from "next/server";
import {
  checkArkeselBalance,
  sendArkeselSMS,
  getSMSLogs,
  DEFAULT_SMS_CONFIG,
} from "@/lib/arkesel-sms";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const balanceResult = await checkArkeselBalance();
    const logs = getSMSLogs();

    return NextResponse.json({
      success: true,
      balance: balanceResult.balance,
      senderId: DEFAULT_SMS_CONFIG.senderId,
      senderIdStatus: "pending_approval", // Noted by user: pending network approval on Arkesel
      adminPhone: DEFAULT_SMS_CONFIG.adminPhone,
      config: DEFAULT_SMS_CONFIG,
      recentLogs: logs,
    });
  } catch (error: any) {
    console.error("[SMS API] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch SMS status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
    }

    const body = await request.json();
    const { to, message, senderId, apiKey, schedule } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient phone number ('to') and 'message' are required." },
        { status: 400 }
      );
    }

    const result = await sendArkeselSMS({
      to,
      message,
      senderId,
      apiKey,
      schedule,
      type: "custom_test",
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      details: result.response,
    });
  } catch (error: any) {
    console.error("[SMS API] POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch SMS" },
      { status: 500 }
    );
  }
}
