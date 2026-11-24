"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category, Brand, ProductVariant } from "@/types/ecommerce";
import {
  getStoredProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getStoredCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getStoredBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} from "@/lib/catalog-store";
import { formatGHS, getConditionBadge } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Package,
  FolderTree,
  Tag,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ShieldCheck,
  BatteryCharging,
  Layers,
  ArrowRight,
  Loader2,
  Cloud,
} from "lucide-react";

export default function AdminCatalogPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "brands">("products");

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State: Product
  const [pTitle, setPTitle] = useState("");
  const [pSlug, setPSlug] = useState("");
  const [pCategorySlug, setPCategorySlug] = useState("");
  const [pBrandName, setPBrandName] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pBasePrice, setPBasePrice] = useState<number>(1000);
  const [pOriginalPrice, setPOriginalPrice] = useState<number | undefined>(1200);
  const [pStock, setPStock] = useState<number>(10);
  const [pCondition, setPCondition] = useState<"brand_new" | "uk_used">("brand_new");
  const [pBatteryHealth, setPBatteryHealth] = useState("100%");
  const [pWarrantyMonths, setPWarrantyMonths] = useState(12);
  const [pStorage, setPStorage] = useState("128GB");
  const [pRam, setPRam] = useState("8GB");
  const [pColor, setPColor] = useState("Natural Titanium");
  const [pColorHex, setPColorHex] = useState("#9a978f");
  const [pAvailableStorages, setPAvailableStorages] = useState("128GB, 256GB, 512GB");

  // Detailed Features & Specs
  const [pFeatures, setPFeatures] = useState(
    "A17 Pro Chip with 6-core GPU\nGrade 5 Titanium design with textured matte glass\n48MP Main Camera with 5x Telephoto zoom\nUSB-C connector with fast 10Gb/s transfer\nAll-day battery life with certified health warranty"
  );
  const [pSpecDisplay, setPSpecDisplay] = useState("6.7-inch Super Retina XDR OLED 120Hz ProMotion");
  const [pSpecProcessor, setPSpecProcessor] = useState("Apple A17 Pro (3nm) / Octa-Core High Performance");
  const [pSpecCamera, setPSpecCamera] = useState("48MP Main + 12MP Ultra-Wide + 5x Telephoto");
  const [pSpecOS, setPSpecOS] = useState("iOS 18 (Upgradable) / Android 15");
  const [pSpecNetwork, setPSpecNetwork] = useState("5G / Dual SIM + eSIM Unlocked (MTN, Telecel, AT)");

  const [pImages, setPImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [pFeatured, setPFeatured] = useState(false);
  const [pBestSeller, setPBestSeller] = useState(false);

  // Form State: Category
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [cName, setCName] = useState("");
  const [cSlug, setCSlug] = useState("");
  const [cDescription, setCDescription] = useState("");
  const [cIcon, setCIcon] = useState("Smartphone");
  const [cImageUrl, setCImageUrl] = useState("");

  // Form State: Brand
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [bName, setBName] = useState("");
  const [bSlug, setBSlug] = useState("");
  const [bLogoUrl, setBLogoUrl] = useState("");
  const [bCountry, setBCountry] = useState("USA");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshData = () => {
    setProducts(getStoredProducts());
    const cats = getStoredCategories();
    setCategories(cats);
    if (cats.length > 0 && !pCategorySlug) {
      setPCategorySlug(cats[0].slug);
    }
    const brs = getStoredBrands();
    setBrands(brs);
    if (brs.length > 0 && !pBrandName) {
      setPBrandName(brs[0].name);
    }
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener("catalog_updated", handleUpdate);
    return () => window.removeEventListener("catalog_updated", handleUpdate);
  }, []);

  // Handle image file upload with Cloudinary CDN integration
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    destination: "product" | "category" | "brand"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    showToast("Uploading to Cloudinary CDN...");

    try {
      const folderMap = {
        product: "aki_enterprise/products",
        category: "aki_enterprise/categories",
        brand: "aki_enterprise/brands",
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folderMap[destination]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      const uploadedUrl = data.url;

      if (destination === "product") {
        setPImages((prev) => [...prev, uploadedUrl]);
        showToast(
          data.provider === "cloudinary"
            ? "Image hosted on Cloudinary CDN!"
            : "Image uploaded to product gallery!"
        );
      } else if (destination === "category") {
        setCImageUrl(uploadedUrl);
        showToast(
          data.provider === "cloudinary"
            ? "Category image hosted on Cloudinary CDN!"
            : "Category image attached!"
        );
      } else if (destination === "brand") {
        setBLogoUrl(uploadedUrl);
        showToast(
          data.provider === "cloudinary"
            ? "Brand logo hosted on Cloudinary CDN!"
            : "Brand logo attached!"
        );
      }
    } catch (err: any) {
      console.error("Cloudinary upload failed, using local reader fallback", err);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (destination === "product") {
          setPImages((prev) => [...prev, result]);
          showToast("Image attached locally.");
        } else if (destination === "category") {
          setCImageUrl(result);
          showToast("Category image attached locally.");
        } else if (destination === "brand") {
          setBLogoUrl(result);
          showToast("Brand logo attached locally.");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  // Open Create Product Modal
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setPTitle("");
    setPSlug("");
    setPDescription("Certified electronics with official store warranty.");
    setPBasePrice(1200);
    setPOriginalPrice(1400);
    setPStock(10);
    setPCondition("brand_new");
    setPBatteryHealth("100%");
    setPWarrantyMonths(12);
    setPStorage("128GB");
    setPRam("8GB");
    setPColor("Space Black");
    setPColorHex("#222222");
    setPImages([
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
    ]);
    setPFeatured(false);
    setPBestSeller(false);
    setIsProductModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim()) return;

    const selectedCategory = categories.find((c) => c.slug === pCategorySlug) || categories[0];
    const categoryName = selectedCategory?.name || "Smartphones";
    const selectedBrand = brands.find((b) => b.name === pBrandName) || brands[0];
    const brandName = selectedBrand?.name || "Aki Enterprise";

    const generatedSlug =
      pSlug.trim() ||
      pTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Parse features from lines
    const parsedFeatures = pFeatures.trim()
      ? pFeatures
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean)
      : [
          `Original ${brandName} certified unit`,
          `${pCondition === "uk_used" ? "Grade A UK-Used" : "Brand New Factory Sealed"}`,
          `${pWarrantyMonths} Months Aki Enterprise Store Warranty`,
          `Battery Health: ${pCondition === "uk_used" ? pBatteryHealth : "100% Factory"}`,
        ];

    // Build specs record
    const parsedSpecs: Record<string, string> = {
      Display: pSpecDisplay.trim() || "OLED Super Retina 120Hz",
      Processor: pSpecProcessor.trim() || "Octa-Core High Performance",
      Main_Camera: pSpecCamera.trim() || "High-Res AI Camera System",
      OS: pSpecOS.trim() || "Latest OS",
      Network: pSpecNetwork.trim() || "5G / 4G LTE Unlocked (MTN, Telecel, AT)",
      Storage: pStorage,
      RAM: pRam,
    };

    // Parse multi-storage options
    const storageList = pAvailableStorages
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const storagesToUse = storageList.length > 0 ? storageList : [pStorage];

    const variantsToSave: ProductVariant[] = storagesToUse.map((st, idx) => {
      // Step pricing for larger capacities
      const stepPrice = idx === 0 ? Number(pBasePrice) : Number(pBasePrice) + idx * 1500;
      const stepOriginal = pOriginalPrice ? Number(pOriginalPrice) + idx * 1500 : undefined;
      return {
        id: `var-${Date.now()}-${idx}`,
        product_id: editingProductId || `prod-${Date.now()}`,
        sku: `${generatedSlug}-${st}-${pCondition}`.toUpperCase(),
        condition: pCondition,
        storage: st,
        ram: pRam,
        color: pColor,
        color_hex: pColorHex,
        battery_health: pCondition === "uk_used" ? pBatteryHealth : "100%",
        warranty_months: pWarrantyMonths,
        price: stepPrice,
        original_price: stepOriginal,
        stock_quantity: Math.max(1, Math.round(Number(pStock) / storagesToUse.length)),
      };
    });

    if (editingProductId) {
      updateProduct(editingProductId, {
        title: pTitle,
        slug: generatedSlug,
        category_slug: pCategorySlug,
        category_name: categoryName,
        category_id: selectedCategory?.id,
        brand_name: brandName,
        brand_id: selectedBrand?.id,
        description: pDescription,
        base_price: Number(pBasePrice),
        images: pImages.length > 0 ? pImages : ["/placeholder.png"],
        featured: pFeatured,
        best_seller: pBestSeller,
        features: parsedFeatures,
        specs: parsedSpecs,
        variants: variantsToSave,
      });
      showToast("Product updated successfully!");
    } else {
      await addProduct({
        title: pTitle,
        slug: generatedSlug,
        category_slug: pCategorySlug,
        category_name: categoryName,
        category_id: selectedCategory?.id,
        brand_name: brandName,
        brand_id: selectedBrand?.id,
        description: pDescription,
        base_price: Number(pBasePrice),
        images: pImages.length > 0 ? pImages : ["/placeholder.png"],
        featured: pFeatured,
        best_seller: pBestSeller,
        new_arrival: true,
        features: parsedFeatures,
        specs: parsedSpecs,
        variants: variantsToSave,
      });
      showToast("New Product successfully added to store!");
    }

    setIsProductModalOpen(false);
    refreshData();
  };

  // Edit Product trigger
  const handleEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setPTitle(prod.title);
    setPSlug(prod.slug);

    const matchedCategory = categories.find(
      (c) => c.slug === prod.category_slug || c.id === prod.category_id || c.name === prod.category_name
    );
    setPCategorySlug(matchedCategory?.slug || prod.category_slug || "smartphones");

    setPBrandName(prod.brand_name || "Apple");
    setPDescription(prod.description);
    setPBasePrice(prod.base_price);
    setPImages(prod.images || []);
    setPFeatured(!!prod.featured);
    setPBestSeller(!!prod.best_seller);

    if (prod.features && prod.features.length > 0) {
      setPFeatures(prod.features.join("\n"));
    }
    if (prod.specs) {
      setPSpecDisplay(prod.specs.Display || prod.specs.Screen || "");
      setPSpecProcessor(prod.specs.Processor || prod.specs.Chipset || "");
      setPSpecCamera(prod.specs.Main_Camera || prod.specs.Camera || "");
      setPSpecOS(prod.specs.OS || "");
      setPSpecNetwork(prod.specs.Network || "");
    }

    const storages = Array.from(new Set(prod.variants.map((v) => v.storage).filter(Boolean)));
    if (storages.length > 0) {
      setPAvailableStorages(storages.join(", "));
    }

    const firstVar = prod.variants?.[0];
    if (firstVar) {
      setPCondition(firstVar.condition === "uk_used" ? "uk_used" : "brand_new");
      setPBatteryHealth(firstVar.battery_health || "90%+");
      setPWarrantyMonths(firstVar.warranty_months || 12);
      setPStorage(firstVar.storage || "128GB");
      setPRam(firstVar.ram || "8GB");
      setPColor(firstVar.color || "Natural Titanium");
      setPColorHex(firstVar.color_hex || "#9a978f");
      setPStock(firstVar.stock_quantity || 10);
      setPOriginalPrice(firstVar.original_price);
    }
    setIsProductModalOpen(true);
  };

  // Delete Product
  const handleDeleteProduct = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteProduct(id);
      showToast("Product deleted.");
      refreshData();
    }
  };

  // Category Modal Handlers
  const handleOpenNewCategory = () => {
    setEditingCategoryId(null);
    setCName("");
    setCSlug("");
    setCDescription("");
    setCIcon("FolderTree");
    setCImageUrl("");
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCName(cat.name);
    setCSlug(cat.slug);
    setCDescription(cat.description || "");
    setCIcon(cat.icon || "FolderTree");
    setCImageUrl(cat.image_url || "");
    setIsCategoryModalOpen(true);
  };

  // Save Category (Create or Update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;

    const generatedSlug = cSlug || cName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: cName,
        slug: generatedSlug,
        description: cDescription,
        icon: cIcon,
        image_url: cImageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
      });
      showToast("Category updated successfully!");
    } else {
      await addCategory({
        name: cName,
        slug: generatedSlug,
        description: cDescription,
        icon: cIcon,
        image_url: cImageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80",
      });
      showToast("New Category added!");
    }

    setCName("");
    setCSlug("");
    setCDescription("");
    setCImageUrl("");
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
    refreshData();
  };

  // Delete Category
  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      deleteCategory(id);
      showToast("Category removed.");
      refreshData();
    }
  };

  // Brand Modal Handlers
  const handleOpenNewBrand = () => {
    setEditingBrandId(null);
    setBName("");
    setBSlug("");
    setBLogoUrl("");
    setBCountry("USA");
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setBName(brand.name);
    setBSlug(brand.slug);
    setBLogoUrl(brand.logo_url || "");
    setBCountry((brand as any).country || "USA");
    setIsBrandModalOpen(true);
  };

  // Save Brand (Create or Update)
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bName.trim()) return;

    const generatedSlug = bSlug || bName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (editingBrandId) {
      updateBrand(editingBrandId, {
        name: bName,
        slug: generatedSlug,
        logo_url: bLogoUrl || "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=300&q=80",
      });
      showToast("Brand updated successfully!");
    } else {
      await addBrand({
        name: bName,
        slug: generatedSlug,
        logo_url: bLogoUrl || "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=300&q=80",
        country: bCountry,
      });
      showToast("New Brand added!");
    }

    setBName("");
    setBSlug("");
    setBLogoUrl("");
    setEditingBrandId(null);
    setIsBrandModalOpen(false);
    refreshData();
  };

  // Delete Brand
  const handleDeleteBrand = (id: string, name: string) => {
    if (confirm(`Delete brand "${name}"?`)) {
      deleteBrand(id);
      showToast("Brand removed.");
      refreshData();
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = filterCategory === "all" || prod.category_slug === filterCategory;
    const matchCondition =
      filterCondition === "all" ||
      prod.variants.some((v) => v.condition === filterCondition);

    return matchSearch && matchCategory && matchCondition;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171717] border border-orange-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FF8A24]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600/20 text-[#FF8A24] border border-orange-600/30">
              Aki Enterprise CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Storefront Catalog &amp; Inventory Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Full administrative control: add products with custom images, manage categories, and curate brand partnerships.
          </p>
        </div>

        {/* Action Buttons based on tab */}
        <div className="flex items-center gap-3">
          {activeTab === "products" && (
            <button
              onClick={handleOpenNewProduct}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}

          {activeTab === "categories" && (
            <button
              onClick={handleOpenNewCategory}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          )}

          {activeTab === "brands" && (
            <button
              onClick={handleOpenNewBrand}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "products"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "bg-slate-900 text-gray-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "categories"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "bg-slate-900 text-gray-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("brands")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "brands"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "bg-slate-900 text-gray-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Brands ({brands.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 1. PRODUCTS TAB */}
      {/* ==================================================================== */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products by title, brand or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-hidden focus:border-orange-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
              >
                <option value="all">All Conditions</option>
                <option value="brand_new">Brand New Sealed</option>
                <option value="uk_used">Tested UK-Used</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-gray-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Product Image &amp; Title</th>
                    <th className="py-3 px-4">Brand / Category</th>
                    <th className="py-3 px-4">Condition &amp; Battery</th>
                    <th className="py-3 px-4">Base Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Storefront Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-normal">
                  {filteredProducts.map((prod) => {
                    const totalStock = prod.variants.reduce(
                      (acc, v) => acc + (v.stock_quantity || 0),
                      0
                    );
                    const primaryCondition = prod.variants[0]?.condition || "brand_new";
                    const badge = getConditionBadge(primaryCondition);
                    const battery = prod.variants[0]?.battery_health;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-900/50 transition">
                        {/* Title & Image */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                              <Image
                                src={prod.images[0] || "/placeholder.png"}
                                alt={prod.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white line-clamp-1">{prod.title}</p>
                              <p className="text-[10px] text-gray-500 font-mono">/{prod.slug}</p>
                              {prod.images.length > 1 && (
                                <span className="text-[9px] text-[#FF8A24] font-semibold">
                                  +{prod.images.length - 1} more images
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Brand / Category */}
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">{prod.brand_name}</span>
                          <span className="text-gray-500 block text-[10px]">{prod.category_name}</span>
                        </td>

                        {/* Condition & Battery */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                primaryCondition === "brand_new"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {badge.label}
                            </span>
                            {battery && (
                              <span className="block text-[10px] text-gray-400">
                                Battery: {battery}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-white text-sm">
                            {formatGHS(prod.base_price)}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              totalStock > 5
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {totalStock} units
                          </span>
                        </td>

                        {/* Status Badges */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {prod.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/20 text-[#FF8A24] border border-orange-500/30 font-bold">
                                Featured
                              </span>
                            )}
                            {prod.best_seller && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                                Best Seller
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold">
                              Live
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/product/${prod.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                              title="Preview on Storefront"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-1.5 text-gray-400 hover:text-[#FF8A24] rounded-lg hover:bg-slate-800 transition"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.title)}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. CATEGORIES TAB */}
      {/* ==================================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-orange-500/40 transition shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#FF8A24]">
                        <FolderTree className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">/{cat.slug}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {cat.description || "Electronics product category for Aki Enterprise store."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-500">
                    {products.filter((p) => p.category_slug === cat.slug).length} products listed
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products?category=${cat.slug}`}
                      target="_blank"
                      className="text-gray-400 hover:text-white"
                      title="View on store"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      className="text-gray-400 hover:text-[#FF8A24] transition"
                      title="Edit category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-gray-400 hover:text-red-400 transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. BRANDS TAB */}
      {/* ==================================================================== */}
      {activeTab === "brands" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {brands.map((br) => (
              <div
                key={br.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-orange-500/40 transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                    {br.logo_url ? (
                      <Image
                        src={br.logo_url}
                        alt={br.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-black text-[#FF8A24] text-sm">
                        {br.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{br.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">/{br.slug}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400">
                    {products.filter((p) => p.brand_name.toLowerCase() === br.name.toLowerCase()).length} products
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/products?brand=${encodeURIComponent(br.slug || br.name)}`}
                      target="_blank"
                      className="text-gray-400 hover:text-white transition"
                      title="View on store"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleOpenEditBrand(br)}
                      className="text-gray-400 hover:text-[#FF8A24] transition"
                      title="Edit brand"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(br.id, br.name)}
                      className="text-gray-400 hover:text-red-400 transition"
                      title="Delete brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ==================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white">
                  {editingProductId ? "Edit Product Listing" : "Add New Product Entry"}
                </h2>
                <p className="text-xs text-gray-400">
                  Configure device specifications, condition grade, battery health, and images.
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Product Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 16 Pro Max (256GB)"
                    value={pTitle}
                    onChange={(e) => setPTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Storefront Slug (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated from title"
                    value={pSlug}
                    onChange={(e) => setPSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Category & Brand Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={pCategorySlug}
                    onChange={(e) => setPCategorySlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Brand *
                  </label>
                  <select
                    value={pBrandName}
                    onChange={(e) => setPBrandName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  >
                    {brands.map((br) => (
                      <option key={br.id} value={br.name}>
                        {br.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Selling Price (GHS) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pBasePrice}
                    onChange={(e) => setPBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Original / Strike Price (GHS)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pOriginalPrice || ""}
                    onChange={(e) =>
                      setPOriginalPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="e.g. 19500"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pStock}
                    onChange={(e) => setPStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Condition, Battery Health & Warranty */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-[#FF8A24] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Quality &amp; Condition Specs</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Device Condition
                    </label>
                    <select
                      value={pCondition}
                      onChange={(e) => setPCondition(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    >
                      <option value="brand_new">Brand New Sealed</option>
                      <option value="uk_used">Tested UK-Used Grade A</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Battery Health
                    </label>
                    <input
                      type="text"
                      value={pBatteryHealth}
                      onChange={(e) => setPBatteryHealth(e.target.value)}
                      placeholder="e.g. 100% or 90%+"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Warranty (Months)
                    </label>
                    <select
                      value={pWarrantyMonths}
                      onChange={(e) => setPWarrantyMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    >
                      <option value={6}>6 Months</option>
                      <option value={12}>12 Months (Standard)</option>
                      <option value={24}>24 Months Extended</option>
                    </select>
                  </div>
                </div>

                {/* Storage & RAM & Color Swatches */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Base Storage
                    </label>
                    <input
                      type="text"
                      value={pStorage}
                      onChange={(e) => setPStorage(e.target.value)}
                      placeholder="e.g. 128GB"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      RAM
                    </label>
                    <input
                      type="text"
                      value={pRam}
                      onChange={(e) => setPRam(e.target.value)}
                      placeholder="e.g. 8GB"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Color Name &amp; Swatch
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pColorHex}
                        onChange={(e) => setPColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                        title="Pick visual color"
                      />
                      <input
                        type="text"
                        value={pColor}
                        onChange={(e) => setPColor(e.target.value)}
                        placeholder="e.g. Natural Titanium"
                        className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Color Presets */}
                <div className="pt-2">
                  <label className="text-[10px] text-gray-400 block mb-1.5 font-semibold">
                    Quick Color Swatch Presets:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: "Natural Titanium", hex: "#9a978f" },
                      { name: "Space Black", hex: "#1e293b" },
                      { name: "Ocean Blue", hex: "#2563eb" },
                      { name: "Rose Pink", hex: "#ec4899" },
                      { name: "Pure White", hex: "#f8fafc" },
                      { name: "Gold", hex: "#eab308" },
                      { name: "Deep Purple", hex: "#581c87" },
                      { name: "Forest Green", hex: "#15803d" },
                    ].map((swatch) => (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() => {
                          setPColor(swatch.name);
                          setPColorHex(swatch.hex);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                          pColor === swatch.name
                            ? "border-orange-500 bg-orange-500/20 text-orange-300"
                            : "border-slate-800 bg-slate-900/80 text-gray-300 hover:border-slate-700"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span>{swatch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multiple Storage Variants Chips */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Multiple Storage Option Chips (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={pAvailableStorages}
                    onChange={(e) => setPAvailableStorages(e.target.value)}
                    placeholder="e.g. 128GB, 256GB, 512GB, 1TB"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Creates the interactive storage selector buttons on the product detail page.
                  </p>
                </div>
              </div>

              {/* Product Images Management */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 block">
                  Product Images (Multi-Image Support) *
                </label>

                {/* Image Previews Gallery */}
                <div className="flex flex-wrap gap-3">
                  {pImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 group shrink-0"
                    >
                      <Image src={img} alt={`Preview ${idx}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setPImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm z-10"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {img.includes("res.cloudinary.com") && (
                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[7px] bg-blue-600/90 text-white font-bold flex items-center gap-0.5">
                          <Cloud className="w-2.5 h-2.5" /> CDN
                        </span>
                      )}
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded text-[8px] bg-black/70 text-white font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Cloudinary CDN Upload Button */}
                  <label className={`w-20 h-20 rounded-xl border border-dashed border-slate-700 hover:border-orange-500 bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition text-gray-400 hover:text-white shrink-0 ${isUploadingImage ? "pointer-events-none opacity-50" : ""}`}>
                    {isUploadingImage ? (
                      <Loader2 className="w-5 h-5 text-[#FF8A24] animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-[#FF8A24]" />
                    )}
                    <span className="text-[9px] mt-1 font-semibold">
                      {isUploadingImage ? "Uploading..." : "Cloudinary"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "product")}
                    />
                  </label>
                </div>

                {/* Add Image by URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. Unsplash or CDN)"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setPImages((prev) => [...prev, newImageUrl.trim()]);
                        setNewImageUrl("");
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Product Overview Description
                </label>
                <textarea
                  rows={3}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Provide device highlights, condition summary, and packaging contents..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 resize-none"
                />
              </div>

              {/* Key Highlights (Bullet Points) */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1 flex items-center justify-between">
                  <span>Key Highlights (Bullet Points, 1 per line)</span>
                  <span className="text-[10px] text-gray-500 font-normal">Shows with checkmarks on product page</span>
                </label>
                <textarea
                  rows={4}
                  value={pFeatures}
                  onChange={(e) => setPFeatures(e.target.value)}
                  placeholder="e.g.&#10;A17 Pro Chip with 6-core GPU&#10;Grade 5 Titanium design with textured matte glass&#10;48MP Main Camera with 5x Telephoto zoom&#10;USB-C connector with 10Gb/s transfer speeds"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 resize-none font-mono"
                />
              </div>

              {/* Technical Specifications Table */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-[#FF8A24] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Technical Specifications (Detailed Specs Table)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Display / Screen
                    </label>
                    <input
                      type="text"
                      value={pSpecDisplay}
                      onChange={(e) => setPSpecDisplay(e.target.value)}
                      placeholder="e.g. 6.7-inch Super Retina XDR OLED 120Hz"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Processor / Chipset
                    </label>
                    <input
                      type="text"
                      value={pSpecProcessor}
                      onChange={(e) => setPSpecProcessor(e.target.value)}
                      placeholder="e.g. Apple A17 Pro (3nm) / Snapdragon 8 Gen 3"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Main Camera
                    </label>
                    <input
                      type="text"
                      value={pSpecCamera}
                      onChange={(e) => setPSpecCamera(e.target.value)}
                      placeholder="e.g. 48MP Main + 12MP Ultra-Wide + 5x Telephoto"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Operating System (OS)
                    </label>
                    <input
                      type="text"
                      value={pSpecOS}
                      onChange={(e) => setPSpecOS(e.target.value)}
                      placeholder="e.g. iOS 18 (Upgradable) / Android 15"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Network &amp; Connectivity
                  </label>
                  <input
                    type="text"
                    value={pSpecNetwork}
                    onChange={(e) => setPSpecNetwork(e.target.value)}
                    placeholder="e.g. 5G / 4G LTE Unlocked (MTN, Telecel, AT)"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Badges / Visibility */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pFeatured}
                    onChange={(e) => setPFeatured(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-orange-600 focus:ring-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span>Feature on Storefront Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pBestSeller}
                    onChange={(e) => setPBestSeller(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-orange-600 focus:ring-orange-500 bg-slate-900 border-slate-700"
                  />
                  <span>Mark as Best Seller Badge</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-gray-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-lg shadow-orange-600/30 hover:from-[#d95e00] transition active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingProductId ? "Save Changes" : "Publish Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD CATEGORY */}
      {/* ==================================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white">
                {editingCategoryId ? "Edit Category" : "Create New Category"}
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drones &amp; Action Cams"
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Category Slug
                </label>
                <input
                  type="text"
                  placeholder="auto-generated slug"
                  value={cSlug}
                  onChange={(e) => setCSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of items in this category"
                  value={cDescription}
                  onChange={(e) => setCDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Category Image URL or Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">
                  Category Thumbnail Image
                </label>

                {cImageUrl && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <Image src={cImageUrl} alt="Category preview" fill className="object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL"
                    value={cImageUrl}
                    onChange={(e) => setCImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#FF8A24]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "category")}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-gray-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  {editingCategoryId ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD BRAND */}
      {/* ==================================================================== */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-black text-white">
                {editingBrandId ? "Edit Partner Brand" : "Add Partner Brand"}
              </h2>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-900 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony, Anker, JBL"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Brand Slug
                </label>
                <input
                  type="text"
                  placeholder="auto-generated slug"
                  value={bSlug}
                  onChange={(e) => setBSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Country of Origin
                </label>
                <input
                  type="text"
                  placeholder="e.g. Japan, USA, South Korea"
                  value={bCountry}
                  onChange={(e) => setBCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Brand Logo URL or Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 block">
                  Brand Logo (Image or PNG)
                </label>

                {bLogoUrl && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <Image src={bLogoUrl} alt="Brand logo preview" fill className="object-cover" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Paste logo image URL"
                    value={bLogoUrl}
                    onChange={(e) => setBLogoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                  />
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shrink-0 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#FF8A24]" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "brand")}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-gray-400 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  {editingBrandId ? "Update Brand" : "Save Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
