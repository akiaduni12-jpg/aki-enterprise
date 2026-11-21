import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEFAULT_STORE_SETTINGS } from "@/lib/settings-store";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, settings: DEFAULT_STORE_SETTINGS });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("store_settings")
      .select("*")
      .eq("id", "current")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: true, settings: DEFAULT_STORE_SETTINGS, fallback: true });
    }

    // Map DB columns back to StoreSettings shape
    const mappedSettings = {
      storeName: data.store_name || DEFAULT_STORE_SETTINGS.storeName,
      tagline: data.tagline || DEFAULT_STORE_SETTINGS.tagline,
      businessName: data.business_name || DEFAULT_STORE_SETTINGS.businessName,
      ownerName: data.owner_name || DEFAULT_STORE_SETTINGS.ownerName,
      phone: data.phone || DEFAULT_STORE_SETTINGS.phone,
      whatsapp: data.whatsapp || DEFAULT_STORE_SETTINGS.whatsapp,
      email: data.email || DEFAULT_STORE_SETTINGS.email,
      address: data.address || DEFAULT_STORE_SETTINGS.address,
      city: data.city || DEFAULT_STORE_SETTINGS.city,
      region: data.region || DEFAULT_STORE_SETTINGS.region,
      country: data.country || DEFAULT_STORE_SETTINGS.country,
      currency: data.currency || DEFAULT_STORE_SETTINGS.currency,
      announcementText: data.announcement_text || DEFAULT_STORE_SETTINGS.announcementText,
      announcementEnabled: data.announcement_enabled !== false,
      deliveryFee: Number(data.delivery_fee) || DEFAULT_STORE_SETTINGS.deliveryFee,
      freeDeliveryThreshold:
        Number(data.free_delivery_threshold) || DEFAULT_STORE_SETTINGS.freeDeliveryThreshold,
      socials: { ...DEFAULT_STORE_SETTINGS.socials, ...(data.socials || {}) },
      policies: { ...DEFAULT_STORE_SETTINGS.policies, ...(data.policies || {}) },
      googleMerchant: {
        ...DEFAULT_STORE_SETTINGS.googleMerchant,
        ...(data.google_merchant || {}),
      },
    };

    return NextResponse.json({ success: true, settings: mappedSettings });
  } catch (err: any) {
    return NextResponse.json({ success: true, settings: DEFAULT_STORE_SETTINGS, fallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, settings, localOnly: true });
    }

    const client = getServiceSupabase();
    const { data, error } = await client
      .from("store_settings")
      .upsert({
        id: "current",
        store_name: settings.storeName,
        tagline: settings.tagline,
        business_name: settings.businessName,
        owner_name: settings.ownerName,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        address: settings.address,
        city: settings.city,
        region: settings.region,
        country: settings.country,
        currency: settings.currency || "GH₵",
        announcement_text: settings.announcementText,
        announcement_enabled: settings.announcementEnabled !== false,
        delivery_fee: Number(settings.deliveryFee) || 30,
        free_delivery_threshold: Number(settings.freeDeliveryThreshold) || 500,
        socials: settings.socials || {},
        policies: settings.policies || {},
        google_merchant: settings.googleMerchant || {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
