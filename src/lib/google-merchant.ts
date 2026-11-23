import { Product } from "@/types/ecommerce";

/**
 * Escapes characters for XML compliance (&, <, >, ", ')
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Maps store category slugs to official Google Product Category taxonomies
 */
function mapGoogleCategory(slug: string): string {
  const s = (slug || "").toLowerCase();
  if (s.includes("smartphones") || s.includes("phone")) {
    return "Electronics > Communications > Telephony > Mobile Phones";
  }
  if (s.includes("laptop") || s.includes("computer")) {
    return "Electronics > Computers > Laptops";
  }
  if (s.includes("audio") || s.includes("earbud") || s.includes("headphone")) {
    return "Electronics > Audio > Audio Components > Headphones &amp; Headsets";
  }
  if (s.includes("watch") || s.includes("wearable")) {
    return "Electronics > Electronics Accessories > Wearable Technology > Smartwatches";
  }
  if (s.includes("charger") || s.includes("power-bank") || s.includes("cable")) {
    return "Electronics > Electronics Accessories > Power > Power Adapters &amp; Chargers";
  }
  return "Electronics > Communications > Telephony > Mobile Phone Accessories";
}

/**
 * Maps condition to Google's accepted values: "new" | "refurbished" | "used"
 */
function mapCondition(condition?: string): "new" | "refurbished" | "used" {
  if (condition === "uk_used") return "refurbished";
  if (condition === "open_box") return "used";
  return "new";
}

/**
 * Generates an official RSS 2.0 / Google Base XML Product Feed
 */
export function generateGoogleMerchantXml(products: Product[], baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");

  let itemsXml = "";

  for (const product of products) {
    const variants = product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: product.id,
            condition: "brand_new",
            price: product.base_price,
            stock_quantity: 5,
            storage: undefined,
            color: undefined,
          },
        ];

    for (const v of variants) {
      const id = `${product.id}-${v.id}`;
      
      // Build title with variant details (Storage / Color / Condition)
      const variantDetails: string[] = [];
      if (v.storage) variantDetails.push(v.storage);
      if (v.color && v.color !== "Default") variantDetails.push(v.color);
      if (v.condition === "uk_used") variantDetails.push("UK Used Grade A");
      else variantDetails.push("Brand New");

      const title = `${product.title} ${variantDetails.length > 0 ? `(${variantDetails.join(" • ")})` : ""}`;
      const description = product.description || `Buy genuine ${product.title} in Ghana at Aki Enterprise. Guaranteed quality with store warranty and fast delivery across Accra and nationwide.`;
      const link = `${cleanBase}/product/${product.slug}`;
      const mainImage = product.images?.[0] || `${cleanBase}/icons/logo-icon.webp`;
      const additionalImages = (product.images || []).slice(1, 10);
      const condition = mapCondition(v.condition);
      const availability = (v.stock_quantity ?? 0) > 0 ? "in_stock" : "out_of_stock";
      const price = `${Number(v.price || product.base_price).toFixed(2)} GHS`;
      const brand = product.brand_name || "Aki Enterprise";
      const googleCategory = mapGoogleCategory(product.category_slug);
      const productType = product.category_name || "Electronics";

      itemsXml += `
    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImages.map((img) => `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("\n")}
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>GH</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>0.00 GHS</g:price>
      </g:shipping>
    </item>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Aki Enterprise - Official Google Merchant Center Product Feed</title>
    <link>${escapeXml(cleanBase)}</link>
    <description>Live product catalog for Aki Enterprise. Certified smart devices, smartphones, chargers, and accessories in Ghana.</description>
    ${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generates Google Merchant Tab-Separated Values (TSV) format
 */
export function generateGoogleMerchantTsv(products: Product[], baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");

  const headers = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "condition",
    "availability",
    "price",
    "brand",
    "google_product_category",
    "product_type",
    "identifier_exists",
    "shipping(country:service:price)",
  ];

  const rows: string[] = [headers.join("\t")];

  for (const product of products) {
    const variants = product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: product.id,
            condition: "brand_new",
            price: product.base_price,
            stock_quantity: 5,
            storage: undefined,
            color: undefined,
          },
        ];

    for (const v of variants) {
      const id = `${product.id}-${v.id}`;
      const variantDetails: string[] = [];
      if (v.storage) variantDetails.push(v.storage);
      if (v.color && v.color !== "Default") variantDetails.push(v.color);
      if (v.condition === "uk_used") variantDetails.push("UK Used");
      else variantDetails.push("New");

      const title = `${product.title} ${variantDetails.length > 0 ? `(${variantDetails.join(" ")})` : ""}`.replace(/[\t\n\r]/g, " ");
      const description = (product.description || `Genuine ${product.title} available at Aki Enterprise with store warranty and Ghana-wide delivery.`).replace(/[\t\n\r]/g, " ");
      const link = `${cleanBase}/product/${product.slug}`;
      const mainImage = product.images?.[0] || `${cleanBase}/icons/logo-icon.webp`;
      const condition = mapCondition(v.condition);
      const availability = (v.stock_quantity ?? 0) > 0 ? "in_stock" : "out_of_stock";
      const price = `${Number(v.price || product.base_price).toFixed(2)} GHS`;
      const brand = (product.brand_name || "Aki Enterprise").replace(/[\t\n\r]/g, " ");
      const googleCategory = mapGoogleCategory(product.category_slug).replace(/&amp;/g, "&");
      const productType = (product.category_name || "Electronics").replace(/[\t\n\r]/g, " ");

      const row = [
        id,
        title,
        description,
        link,
        mainImage,
        condition,
        availability,
        price,
        brand,
        googleCategory,
        productType,
        "no",
        "GH:Standard:0.00 GHS",
      ];

      rows.push(row.join("\t"));
    }
  }

  return rows.join("\n");
}
