import { NextRequest, NextResponse } from "next/server";
import { uploadBufferToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function GET() {
  const configured = isCloudinaryConfigured();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || null;
  return NextResponse.json({
    isConfigured: configured,
    cloudName: cloudName ? cloudName.slice(0, 3) + "***" : null,
    provider: "Cloudinary CDN",
  });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Multipart form data upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "aki_enterprise/products";

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form data" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // If Cloudinary keys are configured, upload to Cloudinary
      if (isCloudinaryConfigured()) {
        const uploadResult = await uploadBufferToCloudinary(buffer, folder);
        return NextResponse.json({
          success: true,
          provider: "cloudinary",
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        });
      } else {
        // Fallback: If Cloudinary keys are not set yet, return base64 Data URI so the app keeps functioning seamlessly
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
          success: true,
          provider: "local_fallback",
          url: dataUrl,
          message:
            "Cloudinary credentials missing in .env.local. Stored as local image fallback. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to enable direct Cloudinary CDN hosting.",
        });
      }
    }

    // 2. JSON Base64 upload
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { image, folder = "aki_enterprise/products" } = body;

      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: "Invalid image payload: string expected" },
          { status: 400 }
        );
      }

      // If image is already a remote URL (e.g. unsplash or existing cloudinary), return as is
      if (image.startsWith("http://") || image.startsWith("https://")) {
        return NextResponse.json({
          success: true,
          url: image,
          provider: "existing_remote",
        });
      }

      // If base64 data url
      if (image.startsWith("data:")) {
        const base64Data = image.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");

        if (isCloudinaryConfigured()) {
          const uploadResult = await uploadBufferToCloudinary(buffer, folder);
          return NextResponse.json({
            success: true,
            provider: "cloudinary",
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
          });
        } else {
          return NextResponse.json({
            success: true,
            provider: "local_fallback",
            url: image,
            message:
              "Cloudinary credentials missing in .env.local. Stored as local image fallback.",
          });
        }
      }

      return NextResponse.json(
        { error: "Unrecognized image format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type" },
      { status: 415 }
    );
  } catch (error: any) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
