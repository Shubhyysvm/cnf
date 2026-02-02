"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Package, Plus, Save, Trash2, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import { AdminApiClient } from "@countrynaturalfoods/admin-api-client";
import type { Product, ProductImage, ProductVariant } from "@countrynaturalfoods/admin-types";
import { PrimaryCard, SecondaryCard, MetaCard, AdminSection, FormField, TextInput, SelectInput, TextArea } from "@countrynaturalfoods/ui";
import { VariantImageManager } from "@/components/products/VariantImageManager";

// Casting UI primitives to loosen TS inference for JSX in app router without affecting runtime
const SafeLink = Link as unknown as React.FC<any>;
const ArrowLeftIcon = ArrowLeft as unknown as React.FC<any>;
const Loader2Icon = Loader2 as unknown as React.FC<any>;
const PackageIcon = Package as unknown as React.FC<any>;
const PlusIcon = Plus as unknown as React.FC<any>;
const SaveIcon = Save as unknown as React.FC<any>;
const Trash2Icon = Trash2 as unknown as React.FC<any>;
const UploadIcon = Upload as unknown as React.FC<any>;
const XIcon = X as unknown as React.FC<any>;

// Shared UI components are now provided by @countrynaturalfoods/ui

type FormState = Partial<
  Pick<
    Product,
    | "name"
    | "slug"
    | "shortDescription"
    | "description"
    | "ingredients"
    | "price"
    | "sku"
    | "isActive"
    | "isFeatured"
    | "isBestSeller"
    | "isLatestArrival"
    | "categoryId"
    | "badges"
  >
> & {
  stockQuantity?: number;
  lowStockThreshold?: number;
  shelfLife?: string;
  discountPrice?: number;
  discount?: number;
};

type VariantForm = Partial<ProductVariant> & { _id: string; _isNew?: boolean; isDefault?: boolean; weight?: string };
type ImageForm = Partial<ProductImage> & {
  _id: string;
  _isNew?: boolean;
  _file?: File;
  _pendingDelete?: boolean;
};

const createTempId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function CreateProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get("edit"); // Check if we're in edit mode
  const isEditMode = !!editId;

  const apiClient = useMemo(
    () => new AdminApiClient(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"),
    []
  );

  const [loading, setLoading] = useState(isEditMode);
  const [initial, setInitial] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    ingredients: "",
    price: undefined,
    sku: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isLatestArrival: false,
    badges: [],
    stockQuantity: 100, // Default stock quantity
    lowStockThreshold: 10, // Default low stock threshold
    shelfLife: "180 DAYS", // Default shelf life
    discountPrice: undefined,
    discount: undefined,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [images, setImages] = useState<ImageForm[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBadge, setNewBadge] = useState("");
  const [showImages, setShowImages] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [defaultWeight, setDefaultWeight] = useState("");
  const [isBasicInfoDefault, setIsBasicInfoDefault] = useState(true); // Track if basic info is default
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [slugValidation, setSlugValidation] = useState<{ available: boolean; suggestion?: string } | null>(null);
  const [slugValidating, setSlugValidating] = useState(false);

  // Load product data in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      const loadProduct = async () => {
        try {
          const res = await apiClient.products.getById(editId);
          const product = res.data;
          setInitial(product);
          
          // Find the default variant (or use first variant if no default)
          let defaultVariant = null;
          if (product.variants && product.variants.length > 0) {
            defaultVariant = (product.variants as any).find((v: any) => v.isDefault) || product.variants[0];
          }

          // Pre-populate form with product data + default variant data
          setForm({
            name: product.name || "",
            slug: product.slug || "",
            shortDescription: product.shortDescription || "",
            description: product.description || "",
            ingredients: product.ingredients || "",
            // Use default variant's price, not product's price
            price: defaultVariant?.price ?? product.price ?? undefined,
            sku: defaultVariant?.sku ?? product.sku ?? "",
            categoryId: (product as any).categoryId || (product as any).category?.id || "",
            isActive: product.isActive ?? true,
            isFeatured: product.isFeatured ?? false,
            isBestSeller: product.isBestSeller ?? false,
            isLatestArrival: product.isLatestArrival ?? false,
            badges: product.badges || [],
            // All variant-specific fields from default variant
            stockQuantity: defaultVariant?.stockQuantity ?? 0,
            lowStockThreshold: defaultVariant?.lowStockThreshold ?? 0,
            shelfLife: defaultVariant?.shelfLife ?? "",
            // Ensure discountPrice and discount are never null
            discountPrice: defaultVariant?.discountPrice ?? undefined,
            discount: defaultVariant?.discount ?? undefined,
          });

          // Set default weight/size from default variant
          if (defaultVariant) {
            setDefaultWeight(defaultVariant.weight || "");
            setIsBasicInfoDefault((defaultVariant as any).isDefault !== false);
            
            // Load additional variants (exclude the default one)
            const additionalVariants = product.variants!
              .filter(v => v.id !== defaultVariant!.id)
              .map(v => ({
                ...v,
                _id: v.id || createTempId(),
                _isNew: false,
              }));
            setVariants(additionalVariants);
            if (additionalVariants.length > 0) {
              setShowVariants(true);
            }
          }

          // Load images
          if (product.images && product.images.length > 0) {
            setImages(product.images.map(img => ({
              ...img,
              _id: img.id || createTempId(),
              _isNew: false,
            })));
            setShowImages(true);
          }

          setSlugManuallyEdited(true); // Prevent auto-slug in edit mode
        } catch (err) {
          toast.error("Failed to load product");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [isEditMode, editId, apiClient]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiClient.categories.getAll();
        if (res?.data) setCategories(res.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    loadCategories();
  }, [apiClient]);

  const updateField = useCallback((key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const generateSlug = useCallback((value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  const validateWeight = useCallback((weight: string): { valid: boolean; error?: string } => {
    if (!weight || !weight.trim()) {
      return { valid: false, error: "Weight/Size is required" };
    }
    // Pattern: number followed by optional space and valid unit
    const validUnits = ["kg", "gm", "grams", "g", "l", "ml", "milliletres", "millilitres"];
    const pattern = new RegExp(`^\\d+(\\.\\d+)?\\s*(${validUnits.join("|")})$`, "i");
    if (!pattern.test(weight.trim())) {
      return {
        valid: false,
        error: "Please enter valid weight/size (e.g., 500ml, 1kg, 100gm)",
      };
    }
    return { valid: true };
  }, []);

  const generateSKU = useCallback((productName: string, weight: string) => {
    if (!productName || !weight) return "";
    // Take first 2 words of product name
    const productPart = productName
      .toUpperCase()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .join("")
      .replace(/[^A-Z0-9]/g, "");
    // Keep weight as-is but remove spaces and make uppercase
    const weightPart = weight
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "");
    const sku = `${productPart}-${weightPart}`;
    // Limit to 20 chars, prioritizing weight/size info
    if (sku.length > 20) {
      return sku.substring(0, 20);
    }
    return sku;
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => {
      const next = { ...prev, name } as FormState;
      if (!slugManuallyEdited || !prev.slug) {
        const autoSlug = generateSlug(name);
        next.slug = autoSlug;

        // Validate slug availability in real-time
        if (autoSlug && autoSlug !== prev.slug) {
          setSlugValidating(true);
          apiClient.products.checkSlugAvailability(autoSlug)
            .then((res: any) => {
              setSlugValidation(res.data);
              if (!res.data.available && res.data.suggestion) {
                // Slug is taken, show suggestion
                toast.success(`Slug "${autoSlug}" is taken. Try "${res.data.suggestion}" instead!`, {
                  duration: 4000,
                });
              }
            })
            .catch((err: any) => {
              console.error('[Slug Validation] Error:', err);
            })
            .finally(() => {
              setSlugValidating(false);
            });
        }
      }
      // Always regenerate SKU when product name changes (if weight exists and is valid)
      if (name && defaultWeight && validateWeight(defaultWeight).valid) {
        next.sku = generateSKU(name, defaultWeight);
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For manually-entered slugs, allow lowercase, alphanumerics, and dashes
    // Backend will do the final normalization
    const newSlug = e.target.value.toLowerCase().trim();
    setSlugManuallyEdited(true);
    updateField("slug", newSlug);
    
    // Validate manually-entered slug availability
    if (newSlug && !isEditMode) {
      setSlugValidating(true);
      apiClient.products.checkSlugAvailability(newSlug)
        .then((res: any) => {
          setSlugValidation(res.data);
        })
        .catch((err: any) => {
          console.error('[Slug Validation] Error:', err);
        })
        .finally(() => {
          setSlugValidating(false);
        });
    }
  };

  const addBadge = () => {
    if (!newBadge.trim()) return;
    updateField("badges", [...(form.badges || []), newBadge.trim()]);
    setNewBadge("");
  };

  const removeBadge = (idx: number) => {
    updateField(
      "badges",
      (form.badges || []).filter((_, i) => i !== idx)
    );
  };

  const processImageFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    setImages((prev) => {
      const next = [...prev];

      fileArray.forEach((file, index) => {
        next.push({
          _id: createTempId(),
          _file: file,
          altText: file.name,
          _isNew: true,
        });
      });

      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // New variant-based image handlers
  const handleVariantImageUpload = async (
    variantId: string,
    variantWeight: string,
    imageType: "hero-card" | "info-card" | "other",
    file: File
  ) => {
    // Stage image locally; actual upload happens on Save Changes
    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => {
      let next = [...prev];

      if (imageType === "hero-card" || imageType === "info-card") {
        // If replacing hero/info: mark existing saved image for delete and drop any previously staged new one
        next = next.map((img) => {
          if (img.variantId === variantId && img.imageType === imageType && !img._isNew) {
            return { ...img, _pendingDelete: true } as any;
          }
          return img;
        }).filter((img) => !(img.variantId === variantId && img.imageType === imageType && (img as any)._isNew));
      }

      next.push({
        id: undefined,
        productId: editId || "",
        variantId,
        variantWeight,
        imageType,
        imageUrl: previewUrl,
        altText: file.name,
        _file: file,
        _id: createTempId(),
        _isNew: true,
      } as any);
      return next;
    });
    toast.success("Image staged. It will upload on Save.");
  };

  const handleVariantImageDelete = async (imageId: string) => {
    // Stage deletion locally; apply on Save
    setImages((prev) => {
      const idx = prev.findIndex((img) => (img.id || img._id) === imageId);
      if (idx === -1) return prev;
      const target = prev[idx];
      // If this is a newly staged image, remove it entirely
      if (target._isNew) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      }
      // For existing images, mark for deletion
      const copy = [...prev];
      copy[idx] = { ...target, _pendingDelete: true } as any;
      return copy;
    });
    toast.success("Image deletion staged. It will apply on Save.");
  };

  const handleVariantImageReorder = async (variantId: string, imageIds: string[]) => {
    // TODO: Implement reorder endpoint
    console.log("Reorder images for variant", variantId, imageIds);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const addVariant = () => {
    setShowVariants(true);
    setVariants((prev) => [
      ...prev,
      {
        _id: createTempId(),
        name: "",
        sku: "",
        price: 0,
        discountPrice: undefined,
        stockQuantity: 100, // Default stock quantity
        lowStockThreshold: 10, // Default low stock threshold
        shelfLife: "180 DAYS", // Default shelf life
        isActive: true,
        _isNew: true,
      },
    ]);
  };

  const updateVariant = (id: string | undefined, key: keyof VariantForm, value: any) => {
    if (!id) return;
    setVariants((prev) => {
      // If setting isDefault to true, unset it on all other variants and mark basic info as not default
      let updated = prev;
      if (key === "isDefault" && value === true) {
        setIsBasicInfoDefault(false); // Basic info is no longer default
        updated = prev.map((v) => (v._id === id || v.id === id ? { ...v } : { ...v, isDefault: false }));
      }

      // If unchecking isDefault and it's the only default variant, mark basic info as default
      if (key === "isDefault" && value === false) {
        const willHaveOtherDefault = prev.some((v) => (v._id === id || v.id === id ? false : v.isDefault === true));
        if (!willHaveOtherDefault) {
          setIsBasicInfoDefault(true); // Basic info becomes default again
        }
      }

      // Now update the specific variant
      return updated.map((v) => {
        if (v._id === id || v.id === id) {
          const variantUpdated = { ...v, [key]: value };

          // Enforce max 99% discount
          if (key === "discount" && value > 99) {
            variantUpdated.discount = 99;
          }

          // Auto-calculate discount when price or discountPrice changes
          if (key === "price" || key === "discountPrice") {
            const price = key === "price" ? value : variantUpdated.price;
            const discountPrice = key === "discountPrice" ? value : variantUpdated.discountPrice;

            if (price && discountPrice && discountPrice > 0) {
              const discountPercent = Math.round(((price - discountPrice) / price) * 100);
              variantUpdated.discount = Math.min(discountPercent, 99);
            }
          }

          // Auto-calculate discountPrice when price or discount changes
          if (key === "price" || key === "discount") {
            const price = key === "price" ? value : variantUpdated.price;
            const discount = key === "discount" ? value : variantUpdated.discount;

            if (price && discount && discount > 0) {
              const newDiscountPrice = Math.round(price * (1 - discount / 100) * 100) / 100;
              variantUpdated.discountPrice = newDiscountPrice;
            }
          }

          return variantUpdated;
        }
        return v;
      });
    });
  };

  const removeVariant = (id: string | undefined) => {
    setVariants((prev) => prev.filter((v) => v._id !== id && v.id !== id));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    // Validate basic required fields
    if (!form.name || !form.name.trim()) {
      newErrors.name = "Product Name is required";
    }
    if (!form.slug || !form.slug.trim()) {
      newErrors.slug = "URL Slug is required";
    }
    if (!form.categoryId || !form.categoryId.trim()) {
      newErrors.categoryId = "Category is required";
    }
    if (!form.price || form.price <= 0 || Number.isNaN(form.price)) {
      newErrors.price = "Price must be greater than 0";
    }

    // Validate weight/size
    if (!defaultWeight || !defaultWeight.trim()) {
      newErrors.weight = "Weight / Size is required";
    } else {
      const weightValidation = validateWeight(defaultWeight);
      if (!weightValidation.valid) {
        newErrors.weight = weightValidation.error || "Please enter valid weight/size (e.g., 500ml, 1kg)";
      }
    }

    // Validate mandatory stock fields for basic info variant
    if (!form.stockQuantity || form.stockQuantity <= 0) {
      newErrors.stockQuantity = "Stock Quantity must be greater than 0";
    }
    if (!form.lowStockThreshold || form.lowStockThreshold <= 0) {
      newErrors.lowStockThreshold = "Low Stock Threshold must be greater than 0";
    }
    if (form.lowStockThreshold && form.stockQuantity && form.lowStockThreshold >= form.stockQuantity) {
      newErrors.lowStockThreshold = "Low Stock Threshold must be less than Stock Quantity";
    }

    // Validate mandatory stock fields for additional variants
    for (const variant of variants) {
      if (!variant.stockQuantity || variant.stockQuantity <= 0) {
        newErrors[`variant-stock-${variant._id || variant.id || variant.weight || "new"}`] = `Stock Quantity required for variant "${variant.weight || 'variant'}"`;
        break;
      }
      if (!variant.lowStockThreshold || variant.lowStockThreshold <= 0) {
        newErrors[`variant-low-${variant._id || variant.id || variant.weight || "new"}`] = `Low Stock Threshold required for variant "${variant.weight || 'variant'}"`;
        break;
      }
      if (variant.lowStockThreshold >= variant.stockQuantity) {
        newErrors[`variant-low-${variant._id || variant.id || variant.weight || "new"}`] = `Low Stock Threshold must be less than Stock Quantity for variant "${variant.weight || 'variant'}"`;
        break;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Collect all error messages and display them all to user
      const errorMessages = Object.values(newErrors);
      const allErrorsText = errorMessages.length > 1 
        ? errorMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n')
        : errorMessages[0];
      toast.error(allErrorsText, {
        duration: 5000, // Show longer for multiple errors
        style: {
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxWidth: '400px',
        },
      });
      return;
    }

    // For manually-edited slugs in create mode, check if validation shows it's not available
    if (!isEditMode && slugManuallyEdited && slugValidation && !slugValidation.available) {
      toast.error(`Slug "${form.slug}" is already taken. Please choose another one or use the suggestion.`);
      setSaving(false);
      return;
    }

    setSaving(true);
    let payload: any;
    try {
      let productId = editId;

      // Normalize payload (ensure price is numeric, trim strings)
      // Note: We do NOT send autoAdjustSlug anymore since slug is pre-validated
      payload = {
        name: form.name?.trim() || "",
        slug: form.slug?.trim() || "",
        shortDescription: form.shortDescription?.trim() || "",
        description: form.description?.trim() || "",
        ingredients: form.ingredients?.trim() || "",
        price: form.price !== undefined ? Number(form.price) : undefined,
        sku: form.sku?.trim() || undefined,
        categoryId: form.categoryId || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        isLatestArrival: form.isLatestArrival,
        badges: form.badges,
      } as any;

      console.info('[Admin Product] Submitting payload', payload);

      if (isEditMode && editId) {
        // Update existing product
        await apiClient.products.update(editId, payload);
        toast.success("Product updated successfully");
      } else {
        // Create new product
        const productRes = await apiClient.products.create(payload);
        productId = productRes.data.id;
        toast.success("Product created successfully");
      }

      // Check if any additional variant is marked as default
      const hasVariantDefault = variants.some((v) => v.isDefault === true);

      const defaultVariantPayload = {
        weight: defaultWeight || form.name || "Default",
        productName: form.name || "Product",
        sku: form.sku || form.slug || "default-sku",
        price: form.price || 0,
        discountPrice: form.discountPrice || undefined,
        discount: form.discount || undefined,
        stockQuantity: form.stockQuantity || 0,
        lowStockThreshold: form.lowStockThreshold || 0,
        shelfLife: form.shelfLife || undefined,
        isActive: form.isActive !== false,
        isDefault: !hasVariantDefault, // Only default if no other variant is default
      } as any;

      // Get the ID of the default variant from loaded data
      let defaultVariantIdToUpdate: string | null = null;
      if (isEditMode && initial?.variants && initial.variants.length > 0) {
        const loadedDefaultVariant = (initial.variants as any).find((v: any) => v.isDefault) || initial.variants[0];
        defaultVariantIdToUpdate = loadedDefaultVariant?.id || null;
      }

      let resolvedDefaultVariantId: string | null = defaultVariantIdToUpdate || null;
      try {
        if (defaultVariantIdToUpdate) {
          // Update existing default variant
          await apiClient.variants.update(productId!, defaultVariantIdToUpdate, defaultVariantPayload);
        } else {
          // Create new default variant if it doesn't exist yet and capture its id
          const createRes = await apiClient.variants.create(productId!, defaultVariantPayload);
          resolvedDefaultVariantId = createRes?.data?.id || null;
        }
      } catch (err) {
        console.error("Failed to save default variant", err);
        toast.error("Failed to save default variant");
      }

      // Remap any staged images that reference a placeholder default variant id
      const PLACEHOLDER_DEFAULT_ID = "temp-default";
      const imagesForProcessing = images.map((img) => {
        if ((img as any).variantId === PLACEHOLDER_DEFAULT_ID && resolvedDefaultVariantId) {
          return { ...img, variantId: resolvedDefaultVariantId } as any;
        }
        return img;
      });

      // First apply deletions for any existing images staged for delete
      if (imagesForProcessing.some((img) => img._pendingDelete && img.id)) {
        for (const img of imagesForProcessing) {
          if (!productId) continue;
          if (img._pendingDelete && img.id) {
            try {
              await apiClient.images.deleteImage(productId, img.id);
            } catch (err) {
              console.error("Failed to delete image", err);
            }
          }
        }
      }

      // Then process staged uploads/replacements
      if (imagesForProcessing.some((img) => img._file)) {
        for (const [idx, img] of imagesForProcessing.entries()) {
          if (!img._file || !productId) continue;
          try {
            if (img.variantId) {
              // Variant-scoped upload (hero-card/info-card or other)
              await apiClient.images.uploadVariantImage(
                productId,
                img.variantId,
                (img.imageType as any) || "other",
                img._file,
                {
                  variantWeight: (img as any).variantWeight,
                  altText: img.altText || "",
                }
              );
            } else if (img._isNew || !img.id) {
              // Product-level image upload
              await apiClient.images.uploadImage(productId, img._file, {
                altText: img.altText || "",
              });
            } else {
              // Product-level replace
              await apiClient.images.replaceImage(productId, img.id, img._file);
            }
          } catch (err) {
            // Surface server error details if available
            const anyErr = err as any;
            const msg = anyErr?.response?.data?.message || anyErr?.message || "Unknown error";
            console.error("Failed to process image:", msg, anyErr?.response?.data);
            toast.error(`Image upload failed: ${msg}`);
          }
        }
        toast.success("Images processed");
      }

      if (variants.length > 0) {
        for (const variant of variants) {
          try {
            if (variant._isNew) {
              // Create new variant
              await apiClient.variants.create(productId!, {
                weight: variant.weight || "",
                productName: form.name,
                sku: variant.sku || "",
                price: variant.price || 0,
                discountPrice: variant.discountPrice || undefined,
                discount: variant.discount || undefined,
                stockQuantity: variant.stockQuantity || 0,
                lowStockThreshold: variant.lowStockThreshold || 0,
                shelfLife: variant.shelfLife || undefined,
                isActive: variant.isActive !== false,
                isDefault: variant.isDefault === true,
              } as any);
            } else if (variant.id && !variant._isNew) {
              // Update existing variant
              await apiClient.variants.update(productId!, variant.id, {
                weight: variant.weight || "",
                productName: form.name,
                sku: variant.sku || "",
                price: variant.price || 0,
                discountPrice: variant.discountPrice || undefined,
                discount: variant.discount || undefined,
                stockQuantity: variant.stockQuantity || 0,
                lowStockThreshold: variant.lowStockThreshold || 0,
                shelfLife: variant.shelfLife || undefined,
                isActive: variant.isActive !== false,
                isDefault: variant.isDefault === true,
              } as any);
            }
          } catch (err) {
            console.error("Failed to save variant", err);
          }
        }
        toast.success(isEditMode ? "Variants updated" : "Variants added");
      }

      router.push("/admin/products");
    } catch (err: any) {
      // Surface backend validation/constraint errors to the UI for easier debugging
      const apiMessage = err?.response?.data?.message;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const responseData = err?.response?.data;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join("; ")
        : apiMessage || err?.message || (isEditMode ? "Failed to update product" : "Failed to create product");

      const fallback = (isEditMode ? "Failed to update product" : "Failed to create product") + (status ? ` (HTTP ${status})` : "");
      const detailText = message || fallback;

      toast.error(detailText);

      console.error("[Admin Product] Save failed", {
        status,
        statusText,
        data: responseData,
        message,
        payload,
        raw: err,
      });
      if (responseData) {
        try {
          console.error("[Admin Product] Response data (stringified)", JSON.stringify(responseData));
        } catch {}
      }
    } finally {
      setSaving(false);
    }
  };

  // Section summaries for collapsed views
  const imagesSummary = images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} uploaded` : "No images";
  const priceValues = [form.price, ...variants.map((v) => v.price)].filter(
    (v): v is number => typeof v === "number" && !Number.isNaN(v)
  );
  const priceMin = priceValues.length ? Math.min(...priceValues) : undefined;
  const priceMax = priceValues.length ? Math.max(...priceValues) : undefined;
  const variantsSummary = variants.length > 0
    ? `${variants.length} variant${variants.length > 1 ? "s" : ""}${priceMin !== undefined ? ` · ₹${priceMin}${priceMax !== undefined && priceMax !== priceMin ? ` – ₹${priceMax}` : ""}` : ""}`
    : priceMin !== undefined
      ? `Base price · ₹${priceMin}`
      : "No variants";
  const seoSummary = !seoTitle
    ? "Meta title missing"
    : `${seoTitle.length}/60 title · ${seoDescription.length}/160 desc`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-4" />
          <p className="text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SafeLink
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            >
              <ArrowLeftIcon size={16} /> Back
            </SafeLink>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {isEditMode ? (initial?.name || "Edit Product") : "Add New Product"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Complete all required fields to publish</p>
            </div>
          </div>
          {/* Save button moved to sidebar to avoid duplication */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header Section */}
        <div className="mb-8">
          <div className="inline-block">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Products</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              {isEditMode ? "Edit Product" : "Create Product"}
            </h2>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* LEFT COLUMN - 70% (Primary Content) */}
          <div className="lg:col-span-3 relative">
            <div className="absolute inset-0 rounded-2xl bg-slate-50/70 -z-0" aria-hidden="true" />
            <div className="relative z-10 space-y-8">
        {/* SECTION 1: BASIC INFORMATION */}
        <PrimaryCard>
          <AdminSection
            variant="primary"
            title="Basic Information"
            description="Core product details. All fields marked with * are required."
          >
            <div className="space-y-6">
              {/* Product Name - PRIMARY - Full Width & Emphasized */}
              <FormField label="Product Name" required error={errors.name}>
                <TextInput
                  type="text"
                  variant="primary"
                  value={form.name || ""}
                  onChange={handleNameChange}
                  placeholder="e.g., Organic Coconut Oil"
                  error={!!errors.name}
                />
              </FormField>

              {/* Row 1: Slug & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  label="URL Slug" 
                  required 
                  error={errors.slug || (slugValidation && !slugValidation.available ? "Slug is already taken" : undefined)}
                  helpText={
                    slugValidating 
                      ? "Checking availability..."
                      : slugValidation && !slugValidation.available && slugValidation.suggestion
                      ? `Suggested: ${slugValidation.suggestion}`
                      : slugValidation && slugValidation.available
                      ? "✓ Slug is available"
                      : undefined
                  }
                >
                  <TextInput
                    type="text"
                    value={form.slug || ""}
                    onChange={handleSlugChange}
                    placeholder="e.g., organic-coconut-oil"
                    error={!!errors.slug || (slugValidation && !slugValidation.available && slugManuallyEdited) || false}
                  />
                </FormField>
                {/* Category REMOVED from Basic Info - Now in Right Sidebar */}
              </div>

              {/* Row 2: Price - EMPHASIZED */}
              <FormField label="Base Price (₹)" required error={errors.price}>
                <TextInput
                  type="number"
                  step="0.01"
                  variant="primary"
                  value={form.price === undefined ? "" : form.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = e.target.value;
                    if (val === "") {
                      updateField("price", undefined);
                    } else {
                      const parsed = parseFloat(val);
                      updateField("price", Number.isNaN(parsed) ? undefined : parsed);
                    }
                  }}
                  placeholder="0.00"
                  error={!!errors.price}
                />
              </FormField>

              {/* Row 3: Discount Price & Discount % */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Discount Price (₹)">
                  <TextInput
                    type="number"
                    step="0.01"
                    value={form.discountPrice === undefined || form.discountPrice === 0 ? "" : form.discountPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (val === "") {
                        updateField("discountPrice", undefined);
                      } else {
                        const parsed = parseFloat(val);
                        if (!Number.isNaN(parsed)) {
                          updateField("discountPrice", parsed);
                          if (form.price && parsed > 0) {
                            const discountPercent = Math.round(((form.price - parsed) / form.price) * 100);
                            updateField("discount", Math.min(discountPercent, 99));
                          }
                        }
                      }
                    }}
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Discount %">
                  <TextInput
                    type="number"
                    step="1"
                    value={form.discount === undefined || form.discount === 0 ? "" : form.discount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (val === "") {
                        updateField("discount", undefined);
                      } else {
                        let parsed = parseInt(val) || 0;
                        parsed = Math.min(parsed, 99);
                        updateField("discount", parsed);
                        if (form.price && parsed > 0) {
                          const newDiscountPrice = Math.round(form.price * (1 - parsed / 100) * 100) / 100;
                          updateField("discountPrice", newDiscountPrice);
                        }
                      }
                    }}
                    placeholder="0"
                    min="0"
                    max="99"
                  />
                </FormField>
                <div />
              </div>

              {/* Row 4: SKU & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="SKU">
                  <TextInput
                    type="text"
                    value={form.sku || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("sku", e.target.value)}
                    placeholder="e.g., COCONUT-500ML"
                  />
                </FormField>
                <FormField label="Weight / Size" required error={errors.weight}>
                  <TextInput
                    type="text"
                    value={defaultWeight}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newWeight = e.target.value;
                      setDefaultWeight(newWeight);
                      if (form.name && newWeight) {
                        const validation = validateWeight(newWeight);
                        if (validation.valid) {
                          const generatedSKU = generateSKU(form.name, newWeight);
                          updateField("sku", generatedSKU);
                        }
                      }
                    }}
                    placeholder="e.g., 500ml, 1kg, 100gm"
                    error={!!errors.weight || (defaultWeight ? !validateWeight(defaultWeight).valid : false)}
                  />
                  {defaultWeight && !validateWeight(defaultWeight).valid && (
                    <p className="text-xs text-red-600 mt-2">{validateWeight(defaultWeight).error}</p>
                  )}
                </FormField>
              </div>

              {/* Row 5: Stock & Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Stock Quantity" required error={errors.stockQuantity}>
                  <TextInput
                    type="number"
                    value={form.stockQuantity || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (val === "") {
                        updateField("stockQuantity", 0);
                      } else {
                        const parsed = parseInt(val);
                        const newStock = Number.isNaN(parsed) ? 0 : parsed;
                        updateField("stockQuantity", newStock);
                        if (form.lowStockThreshold && form.lowStockThreshold >= newStock) {
                          updateField("lowStockThreshold", 0);
                          toast.success("Low Stock Threshold reset as it exceeded Stock Quantity");
                        }
                      }
                    }}
                    placeholder="0"
                    min="0"
                    error={!!errors.stockQuantity}
                  />
                </FormField>
                <FormField label="Low Stock Threshold" required error={errors.lowStockThreshold}>
                  <TextInput
                    type="number"
                    value={form.lowStockThreshold || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (val === "") {
                        updateField("lowStockThreshold", 0);
                      } else {
                        const parsed = parseInt(val);
                        const newThreshold = Number.isNaN(parsed) ? 0 : parsed;
                        if (form.stockQuantity && newThreshold >= form.stockQuantity) {
                          toast.error(`Low Stock Threshold must be less than Stock Quantity (${form.stockQuantity})`);
                          return;
                        }
                        updateField("lowStockThreshold", newThreshold);
                      }
                    }}
                    placeholder="0"
                    min="0"
                    error={!!errors.lowStockThreshold}
                  />
                </FormField>
                <FormField label="Shelf Life">
                  <TextInput
                    type="text"
                    value={form.shelfLife || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("shelfLife", e.target.value)}
                    placeholder="e.g., 180 DAYS"
                  />
                </FormField>
              </div>

              {/* Row 6: Short Description */}
              <FormField label="Short Description" helpText="Brief description for product cards">
                <TextInput
                  type="text"
                  maxLength={100}
                  value={form.shortDescription || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField("shortDescription", e.target.value)}
                  placeholder="Your product's value prop"
                />
                <p className="text-xs text-slate-500 mt-2">{(form.shortDescription || "").length}/100</p>
              </FormField>

              {/* Row 7: Full Description */}
              <FormField label="Full Description">
                <TextArea
                  value={form.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("description", e.target.value)}
                  placeholder="Detailed product description, benefits, usage..."
                  rows={5}
                />
              </FormField>

              {/* Row 8: Ingredients */}
              <FormField label="Ingredients">
                <TextArea
                  value={form.ingredients || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateField("ingredients", e.target.value)}
                  placeholder="e.g., Organic Coconut (100%)"
                  rows={3}
                />
              </FormField>


            </div>
          </AdminSection>
        </PrimaryCard>

        {/* SECTION 2: IMAGES */}
        <SecondaryCard>
          <AdminSection
            variant="secondary"
            title="Product Images"
            description="Upload photos for each variant with hero, info, and gallery images."
            collapsible
            isOpen={showImages}
            onToggle={() => setShowImages(!showImages)}
            summaryContent={imagesSummary}
          >
            {isEditMode ? (
              <VariantImageManager
                productId={editId!}
                variants={[
                  // Include default variant from form data
                  {
                    id: initial?.variants?.find((v: any) => v.isDefault)?.id || "temp-default",
                    weight: defaultWeight || "Default",
                    isDefault: true,
                    isActive: true,
                  } as ProductVariant,
                  // Include additional variants
                  ...variants.filter((v) => v.id).map((v) => ({
                    ...v,
                    id: v.id!,
                  })) as ProductVariant[],
                ]}
                images={images as ProductImage[]}
                onImageUpload={handleVariantImageUpload}
                onImageDelete={handleVariantImageDelete}
                onImageReorder={handleVariantImageReorder}
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <UploadIcon size={32} className="mx-auto mb-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">Save the product first</p>
                <p className="text-xs text-slate-500 mt-1">Images can be uploaded after creating the product</p>
              </div>
            )}
          </AdminSection>
        </SecondaryCard>

        {/* SECTION 3: VARIANTS */}
        <SecondaryCard>
          <AdminSection
            variant="secondary"
            title="Product Variants"
            description="Add sizes, weights, or options with independent pricing (optional)."
            action={
              showVariants && (
                <button
                  onClick={addVariant}
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition text-sm font-medium"
                >
                  <PlusIcon size={16} /> Add Variant
                </button>
              )
            }
            collapsible
            isOpen={showVariants}
            onToggle={() => setShowVariants(!showVariants)}
            summaryContent={variantsSummary}
          >
            <div className="space-y-4">
              {variants.length > 0 ? (
                <div className="space-y-4">
                  {variants.map((variant, idx) => (
                    <div key={variant._id || variant.id} className="rounded-lg border border-slate-200 p-6 space-y-4 bg-slate-50 hover:shadow-sm transition">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">Variant {idx + 1}</h4>
                        <button
                          onClick={() => removeVariant(variant._id || variant.id)}
                          type="button"
                          className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                        >
                          <Trash2Icon size={16} />
                        </button>
                      </div>

                      {/* Variant Name, SKU, Price */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Variant Name</label>
                          <input
                            type="text"
                            value={variant.weight || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const newName = e.target.value;
                              updateVariant(variant._id || variant.id, "weight", newName);
                              // Always regenerate SKU when variant name changes (if product name exists)
                              if (form.name && newName && validateWeight(newName).valid) {
                                const generatedSKU = generateSKU(form.name, newName);
                                updateVariant(variant._id || variant.id, "sku", generatedSKU);
                              }
                            }}
                            placeholder="e.g., 500ml, 1kg"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                          {variant.weight && !validateWeight(variant.weight).valid && (
                            <p className="text-xs text-red-600 mt-1">{validateWeight(variant.weight).error}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">SKU</label>
                          <input
                            type="text"
                            value={variant.sku || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(variant._id || variant.id, "sku", e.target.value)}
                            placeholder="Auto-generated"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.price === undefined || variant.price === null || variant.price === 0 ? "" : variant.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = e.target.value;
                              updateVariant(variant._id || variant.id, "price", val === "" ? 0 : parseFloat(val) || 0);
                            }}
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                      </div>

                      {/* Discount Price, Discount %, Stock Qty */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Discount Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.discountPrice === undefined || variant.discountPrice === null || variant.discountPrice === 0 ? "" : variant.discountPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = e.target.value;
                              updateVariant(variant._id || variant.id, "discountPrice", val === "" ? 0 : parseFloat(val) || 0);
                            }}
                            placeholder="0.00"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Discount %</label>
                          <input
                            type="number"
                            step="1"
                            value={variant.discount === undefined || variant.discount === null || variant.discount === 0 ? "" : variant.discount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = e.target.value;
                              let numVal = val === "" ? 0 : parseInt(val) || 0;
                              numVal = Math.min(numVal, 99); // Enforce max 99%
                              updateVariant(variant._id || variant.id, "discount", numVal);
                            }}
                            placeholder="0"
                            min="0"
                            max="99"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Stock Qty</label>
                          <input
                            type="number"
                            value={variant.stockQuantity === undefined || variant.stockQuantity === null || variant.stockQuantity === 0 ? "" : variant.stockQuantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const val = e.target.value;
                              const newStock = val === "" ? 0 : parseInt(val) || 0;
                              updateVariant(variant._id || variant.id, "stockQuantity", newStock);
                              // Auto-reset low stock threshold if it's >= new stock quantity
                              if (variant.lowStockThreshold && variant.lowStockThreshold >= newStock) {
                                updateVariant(variant._id || variant.id, "lowStockThreshold", 0);
                                toast.success(`Low Stock Threshold reset for variant "${variant.weight || 'variant'}"`);
                              }
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                      </div>

                      {/* Low Stock Threshold, Shelf Life */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Low Stock Threshold</label>
                          <input
                            type="number"
                            value={variant.lowStockThreshold === undefined || variant.lowStockThreshold === null || variant.lowStockThreshold === 0 ? "" : variant.lowStockThreshold}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newThreshold = val === "" ? 0 : parseInt(val) || 0;
                              // Validate that low stock threshold < stock quantity
                              if (variant.stockQuantity && newThreshold >= variant.stockQuantity) {
                                toast.error(
                                  `Low Stock Threshold must be less than Stock Quantity (${variant.stockQuantity}) for variant "${variant.weight || 'variant'}"`
                                );
                                return;
                              }
                              updateVariant(variant._id || variant.id, "lowStockThreshold", newThreshold);
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-900 mb-2">Shelf Life</label>
                          <input
                            type="text"
                            value={variant.shelfLife || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateVariant(variant._id || variant.id, "shelfLife", e.target.value)}
                            placeholder="e.g., 180 DAYS"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition text-sm"
                          />
                        </div>
                      </div>

                      {/* Offer Label removed */}

                      {/* Checkboxes: Active, Default */}
                      <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={variant.isActive !== false}
                            onChange={(e) => updateVariant(variant._id || variant.id, "isActive", e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">Active</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={variant.isDefault === true}
                            onChange={(e) => updateVariant(variant._id || variant.id, "isDefault", e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">Default Variant</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
                  <PackageIcon size={32} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-600">No variants yet. Click "Add Variant" to create product options.</p>
                </div>
              )}
            </div>
          </AdminSection>
        </SecondaryCard>

        {/* SECTION 4: SEO */}
        <SecondaryCard>
          <AdminSection
            variant="secondary"
            title="SEO Settings"
            description="Help your product rank better in search engines (optional)."
            collapsible
            isOpen={showSeo}
            onToggle={() => setShowSeo(!showSeo)}
            summaryContent={seoSummary}
          >
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-medium">💡 SEO Tip:</p>
                <p className="mt-1 text-xs">A good meta title and description help your product appear higher in Google search results and attract more clicks.</p>
              </div>

              <FormField label="Meta Title for Google" helpText="60 characters recommended">
                <TextInput
                  type="text"
                  maxLength={60}
                  value={seoTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeoTitle(e.target.value)}
                  placeholder="What Google shows in search results"
                />
                <p className="text-xs text-slate-500 mt-2">{seoTitle.length}/60</p>
              </FormField>

              <FormField label="Meta Description" helpText="160 characters recommended">
                <TextArea
                  maxLength={160}
                  value={seoDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeoDescription(e.target.value)}
                  placeholder="Brief description shown below title in search results"
                  rows={3}
                />
                <p className="text-xs text-slate-500 mt-2">{seoDescription.length}/160</p>
              </FormField>

              <FormField label="Keywords">
                <TextInput
                  type="text"
                  value={seoKeywords}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeoKeywords(e.target.value)}
                  placeholder="Comma-separated keywords (e.g., organic, coconut oil, cold-pressed)"
                />
              </FormField>
            </div>
          </AdminSection>
        </SecondaryCard>
            </div>
          </div>

          {/* RIGHT COLUMN - 30% (Secondary - Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Save Button - Prominent */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-400"
              >
                {saving ? (
                  <>
                    <Loader2Icon size={18} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon size={18} /> {isEditMode ? "Save Changes" : "Save Product"}
                  </>
                )}
              </button>

              {/* STATUS & VISIBILITY */}
              <MetaCard>
                <AdminSection variant="meta" title="Status & Visibility" description="">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => updateField("isActive", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition">Published</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => updateField("isFeatured", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition">Featured</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isBestSeller}
                        onChange={(e) => updateField("isBestSeller", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition">Best Seller</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isLatestArrival}
                        onChange={(e) => updateField("isLatestArrival", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition">Latest Arrival</span>
                    </label>
                  </div>
                </AdminSection>
              </MetaCard>

              {/* CATEGORY */}
              <MetaCard>
                <AdminSection variant="meta" title="Category" description="">
                  <FormField label="Select Category" required error={errors.categoryId}>
                    <SelectInput
                      value={form.categoryId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateField("categoryId", e.target.value)}
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>
                </AdminSection>
              </MetaCard>

              {/* BADGES */}
              <MetaCard>
                <AdminSection variant="meta" title="Badges" description="">
                  <div className="space-y-4">
                    {form.badges && form.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {form.badges.map((badge, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
                          >
                            {badge}
                            <button
                              type="button"
                              onClick={() => removeBadge(idx)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <XIcon size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <TextInput
                        type="text"
                        placeholder="e.g., Organic, Vegan"
                        value={newBadge}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBadge(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addBadge();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addBadge}
                        className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium text-sm"
                      >
                        <PlusIcon size={16} />
                      </button>
                    </div>
                  </div>
                </AdminSection>
              </MetaCard>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
}

