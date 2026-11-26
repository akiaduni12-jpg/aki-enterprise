import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  signAdminToken,
  ADMIN_COOKIE_NAME,
  isAuthorizedAdminEmail,
  AdminSession,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    let authenticated = false;
    let userRole: "owner" | "admin" | "manager" = "admin";
    let fullName = "Store Administrator";

    // 1. Authenticate with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session && data.user) {
        const metadataRole = (data.user.user_metadata?.role as any) || "admin";
        const isWhitelisted = isAuthorizedAdminEmail(email);

        if (
          isWhitelisted ||
          metadataRole === "owner" ||
          metadataRole === "admin" ||
          metadataRole === "manager"
        ) {
          authenticated = true;
          userRole = metadataRole === "owner" ? "owner" : metadataRole === "manager" ? "manager" : "admin";
          fullName =
            data.user.user_metadata?.full_name ||
            (userRole === "owner" ? "Store Owner (Aki)" : "Store Administrator");
        }
      }
    }

    // 2. Strict Fallback check against server environment variables
    const serverAdminEmail = (process.env.ADMIN_EMAIL || "admin@akiaduniventures.com").toLowerCase();
    const serverAdminPass = process.env.ADMIN_PASSWORD || "AkiEnterprise2026!";

    if (!authenticated && email === serverAdminEmail && password === serverAdminPass) {
      authenticated = true;
      userRole = "owner";
      fullName = "Store Owner (Aki)";
    }

    // 3. Strict rejection if unauthorized
    if (!authenticated) {
      return NextResponse.json(
        { error: "Invalid admin email or password. Access is restricted to authorized administrators." },
        { status: 401 }
      );
    }

    const sessionPayload: AdminSession = {
      email,
      role: userRole,
      full_name: fullName,
      signedInAt: new Date().toISOString(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const token = await signAdminToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        email: sessionPayload.email,
        role: sessionPayload.role,
        full_name: sessionPayload.full_name,
      },
    });

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during admin authentication." },
      { status: 500 }
    );
  }
}
