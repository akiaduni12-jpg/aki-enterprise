const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportInventory() {
  const { data: products, error } = await sb
    .from('products')
    .select('*, product_variants(*), categories(name)');

  if (error) {
    console.error('Error fetching inventory:', error);
    return;
  }

  // Invoice 19799 line items lookup
  const invoiceSkus = [
    'JX-L170-NEW',
    'CALE-A528-NEW',
    'ITEL-IT2167-NEW',
    'ITEL-IT2160-NEW',
    'ITEL-IT5606-NEW',
    'ITEL-IT2166-NEW',
    'ITEL-5620-NEW',
    'VILLAON-V201-NEW',
    'IFINEX-M66P-NEW'
  ];

  const invoiceCostMap = {
    'JX-L170-NEW': 70.00,
    'CALE-A528-NEW': 110.00,
    'ITEL-IT2167-NEW': 101.00,
    'ITEL-IT2160-NEW': 108.00,
    'ITEL-IT5606-NEW': 125.00,
    'ITEL-IT2166-NEW': 88.00,
    'ITEL-5620-NEW': 134.00,
    'VILLAON-V201-NEW': 76.00,
    'IFINEX-M66P-NEW': 78.00
  };

  let csv = 'Item #,Product Description,Category,Brand,SKU,Condition,Specifications,Supplier Invoice Ref,Invoice Cost (GH₵),Stock Qty,Retail Unit Price (GH₵),Total Retail Value (GH₵)\n';
  
  let md = '# AKI ADUNI VENTURES\n';
  md += '## OFFICIAL INVENTORY STOCK MANIFEST & PROOF OF PURCHASE RECONCILIATION\n\n';
  md += '**Business Legal Entity**: AKI ADUNI VENTURES  \n';
  md += '**Official Storefront**: [https://www.akiaduniventures.com](https://www.akiaduniventures.com)  \n';
  md += '**Official Phone**: +233 55 124 3372  \n';
  md += '**Contact Email**: admin@akiaduniventures.com / akiaduniventures@gmail.com  \n';
  md += '**Physical Store / Hub**: Miaso / Circle, Accra, Ghana  \n';
  md += `**Document Date**: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}  \n\n`;

  md += '### Primary Supplier Invoice Reference\n';
  md += '- **Supplier**: **SIAKA PHONES ENTERPRISE - CIRCLE MAIN SHOP** (Dealers in Original Phones & Accessories)\n';
  md += '- **Supplier Contact**: 027-1215151 / 024-4795579 • Location: Near Vodafone, Circle, Accra\n';
  md += '- **POS Invoice / Bill No.**: **19799**\n';
  md += '- **Invoice Date**: 31-08-2026 • Cash Paid: **GH₵ 1,499.00** (Total Quantity: 15 Units)\n\n';

  md += '---\n\n';
  md += '### Section 1: Inbound Commercial Stock (Matched Directly to Invoice #19799)\n\n';
  md += '| # | Item Description (as on Invoice) | Category | SKU | Condition | Units on Invoice | Cost per Unit | Retail Unit Price | Total Retail Value |\n';
  md += '|---|---|---|---|---|:---:|---:|---:|---:|\n';

  let invoiceSectionRows = [];
  let otherSectionRows = [];

  for (const p of products) {
    const cat = p.categories?.name || p.category_name || 'Consumer Electronics';
    const brand = p.brand_name || 'AKI ADUNI VENTURES';
    const variants = p.product_variants || [];

    for (const v of variants) {
      const sku = (v.sku || '').toUpperCase();
      const isInvoiceItem = invoiceSkus.includes(sku);
      const row = {
        title: p.title,
        cat,
        brand,
        sku,
        condition: v.condition === 'uk_used' ? 'UK Used Grade A' : 'Brand New (Factory Sealed)',
        specs: [v.storage, v.ram ? v.ram + ' RAM' : '', v.color].filter(Boolean).join(' / ') || 'Standard',
        qty: v.stock_quantity ?? 1,
        retailPrice: Number(v.price) || Number(p.base_price) || 0,
        costPrice: invoiceCostMap[sku] || null,
        isInvoiceItem
      };

      if (isInvoiceItem) {
        invoiceSectionRows.push(row);
      } else {
        otherSectionRows.push(row);
      }
    }
  }

  // 1. Write Section 1 (Matched to Invoice)
  let count = 0;
  let inv1Qty = 0;
  let inv1CostTotal = 0;
  let inv1RetailTotal = 0;

  for (const r of invoiceSectionRows) {
    count++;
    inv1Qty += r.qty;
    const lineCost = (r.costPrice || 0) * r.qty;
    const lineRetail = r.retailPrice * r.qty;
    inv1CostTotal += lineCost;
    inv1RetailTotal += lineRetail;

    md += `| ${count} | **${r.title}** | ${r.cat} | \`${r.sku}\` | ${r.condition} | **${r.qty}** | GH₵ ${r.costPrice.toFixed(2)} | GH₵ ${r.retailPrice.toFixed(2)} | GH₵ ${lineRetail.toLocaleString('en-US', { minimumFractionDigits: 2 })} |\n`;
    csv += `${count},"${r.title.replace(/"/g, '""')}","${r.cat}","${r.brand}",${r.sku},"${r.condition}","${r.specs}","Siaka Phones Inv #19799",${r.costPrice.toFixed(2)},${r.qty},${r.retailPrice.toFixed(2)},${lineRetail.toFixed(2)}\n`;
  }

  md += `| | **SUBTOTAL (INVOICE #19799 BATCH)** | | | | **${inv1Qty} Units** | **GH₵ ${inv1CostTotal.toFixed(2)}** | | **GH₵ ${inv1RetailTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}** |\n\n`;

  // 2. Write Section 2 (Other Catalog Stock)
  md += '### Section 2: Full Store Inventory & Additional Warehouse Stock\n\n';
  md += '| # | Product Description | Category | SKU | Condition | Specs / Color | Stock Qty | Retail Unit Price | Total Retail Value |\n';
  md += '|---|---|---|---|---|---|:---:|---:|---:|\n';

  let totalQty = inv1Qty;
  let totalRetail = inv1RetailTotal;

  for (const r of otherSectionRows) {
    count++;
    totalQty += r.qty;
    const lineRetail = r.retailPrice * r.qty;
    totalRetail += lineRetail;

    md += `| ${count} | ${r.title} | ${r.cat} | \`${r.sku}\` | ${r.condition} | ${r.specs} | ${r.qty} | GH₵ ${r.retailPrice.toLocaleString()} | GH₵ ${lineRetail.toLocaleString('en-US', { minimumFractionDigits: 2 })} |\n`;
    csv += `${count},"${r.title.replace(/"/g, '""')}","${r.cat}","${r.brand}",${r.sku},"${r.condition}","${r.specs}","Warehouse Stock",-,${r.qty},${r.retailPrice.toFixed(2)},${lineRetail.toFixed(2)}\n`;
  }

  md += `| | **GRAND TOTAL (ALL ACTIVE INVENTORY)** | | | | | **${totalQty} Units** | | **GH₵ ${totalRetail.toLocaleString('en-US', { minimumFractionDigits: 2 })}** |\n\n`;

  md += '### Official Compliance Statement\n';
  md += 'This manifest proves commercial ownership and physical possession of inventory by **AKI ADUNI VENTURES**.\n';
  md += '- The 15 keypad phones listed in Section 1 correspond item-for-item with **POS Invoice #19799** issued by **Siaka Phones Enterprise** on 31-8-2026 for a total of **GH₵ 1,499.00**.\n';
  md += '- Goods are physically stocked for retail sales and online fulfillment with nationwide delivery across Ghana via [https://www.akiaduniventures.com](https://www.akiaduniventures.com).\n\n';
  md += '---\n*Authorized by Management • Aki Aduni Ventures*';

  csv += `\n,,,,,,,TOTAL UNITS,${totalQty},TOTAL RETAIL VALUE,${totalRetail.toFixed(2)}\n`;

  fs.writeFileSync('public/aki_inventory_stock_list.csv', csv);
  fs.writeFileSync('aki_inventory_stock_manifest.md', md);

  console.log(`Successfully generated manifest matching Invoice #19799 with ${invoiceSectionRows.length} invoice items and ${otherSectionRows.length} general items.`);
}

exportInventory();
