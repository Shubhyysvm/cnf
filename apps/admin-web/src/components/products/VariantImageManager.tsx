"use client";

import React, { useState } from "react";
import { Upload, Trash2, Star, Info, Image as ImageIcon, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import type { ProductImage, ProductVariant } from "@countrynaturalfoods/admin-types";

type ImageType = "hero-card" | "info-card" | "other";

interface VariantImageManagerProps {
  productId: string;
  variants: ProductVariant[];
  images: ProductImage[];
  onImageUpload: (variantId: string, variantWeight: string, imageType: ImageType, file: File) => Promise<void>;
  onImageDelete: (imageId: string) => Promise<void>;
  onImageReorder: (variantId: string, imageIds: string[]) => Promise<void>;
}

export const VariantImageManager: React.FC<VariantImageManagerProps> = ({
  productId,
  variants,
  images,
  onImageUpload,
  onImageDelete,
  onImageReorder,
}) => {
  const [activeVariantId, setActiveVariantId] = useState<string>(variants[0]?.id || "");
  const [dragging, setDragging] = useState<string | null>(null);

  const activeVariant = variants.find((v) => v.id === activeVariantId);
  const variantImages = images.filter(
    (img: any) => img.variantId === activeVariantId && !img._pendingDelete
  );

  const heroImage = variantImages.find((img) => img.imageType === "hero-card");
  const infoImage = variantImages.find((img) => img.imageType === "info-card");
  const otherImages = variantImages
    .filter((img) => img.imageType === "other");

  const handleFileSelect = async (imageType: ImageType, file: File) => {
    if (!activeVariant) {
      toast.error("Please select a variant first");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      await onImageUpload(activeVariant.id!, activeVariant.weight || "", imageType, file);
      toast.success(`${imageType === "hero-card" ? "Hero" : imageType === "info-card" ? "Info" : "Gallery"} image uploaded`);
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
  };

  const handleDelete = async (imageId: string, imageType: string) => {
    if (!confirm(`Delete this ${imageType} image?`)) return;

    try {
      await onImageDelete(imageId);
      toast.success("Image deleted");
    } catch (error) {
      toast.error("Failed to delete image");
      console.error(error);
    }
  };

  const ImageCard: React.FC<{
    image: ProductImage | undefined;
    imageType: ImageType;
    title: string;
    description: string;
    icon: React.ReactNode;
    maxImages: number;
  }> = ({ image, imageType, title, description, icon, maxImages }) => (
    <div className="rounded-lg border-2 border-slate-200 bg-white overflow-hidden hover:border-emerald-300 transition">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-600">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {image ? (
          <div className="space-y-3">
            <div className="relative group rounded-lg overflow-hidden">
              <img src={image.imageUrl} alt={image.altText || title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <label className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium cursor-pointer hover:bg-blue-700 transition">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(imageType, file);
                    }}
                  />
                </label>
                <button
                  onClick={() => handleDelete(image.id!, imageType)}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
            <input
              type="text"
              value={image.altText || ""}
              placeholder="Alt text for accessibility"
              className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100"
              readOnly
            />
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(imageType, file);
              }}
            />
            <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition">
              <Upload size={24} className="mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-medium text-slate-700">Click to upload</p>
              <p className="text-xs text-slate-500 mt-1">Max {maxImages} image{maxImages > 1 ? "s" : ""}</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Variant Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {variants.map((variant) => {
          const variantImageCount = images.filter((img) => img.variantId === variant.id).length;
          return (
            <button
              key={variant.id}
              onClick={() => setActiveVariantId(variant.id!)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition flex items-center gap-2 ${
                activeVariantId === variant.id
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              {variant.weight || `Variant ${variant.id?.slice(0, 4)}`}
              {variant.isDefault && <Star size={14} className="fill-current" />}
              {variantImageCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeVariantId === variant.id ? "bg-emerald-500" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {variantImageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!activeVariant && (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <ImageIcon size={32} className="mx-auto mb-3 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">No variant selected</p>
          <p className="text-xs text-slate-500 mt-1">Create variants first to manage images</p>
        </div>
      )}

      {activeVariant && (
        <>
          {/* Hero & Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageCard
              image={heroImage}
              imageType="hero-card"
              title="Hero Card"
              description="Main product showcase (1 max)"
              icon={<Star size={16} />}
              maxImages={1}
            />
            <ImageCard
              image={infoImage}
              imageType="info-card"
              title="Info Card"
              description="Benefits/features (1 max)"
              icon={<Info size={16} />}
              maxImages={1}
            />
          </div>

          {/* Other Images Gallery */}
          <div className="rounded-lg border-2 border-slate-200 bg-white overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <ImageIcon size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Gallery Images</h4>
                    <p className="text-xs text-slate-600">Additional product photos (unlimited)</p>
                  </div>
                </div>
                <label className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium cursor-pointer hover:bg-emerald-700 transition inline-flex items-center gap-2">
                  <Upload size={14} /> Add Image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach((file) => handleFileSelect("other", file));
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="p-4">
              {otherImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {otherImages.map((img: any, idx: number) => (
                    <div
                      key={img.id || img._id || `${idx}`}
                      className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group hover:shadow-md transition"
                    >
                      <div className="relative">
                        <img src={img.imageUrl} alt={img.altText || "Gallery"} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button
                            onClick={() => handleDelete((img.id || img._id)!, "other")}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-900/80 text-white text-xs font-bold">
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="p-2">
                        <input
                          type="text"
                          value={img.altText || ""}
                          placeholder="Alt text"
                          className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:border-emerald-500"
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <ImageIcon size={32} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">No gallery images yet</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Add Image" above to upload</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Help Text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h5 className="text-xs font-bold text-blue-900 mb-2">💡 Image Management Tips:</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>Hero Card:</strong> Main image shown on product listing and homepage</li>
          <li>• <strong>Info Card:</strong> Secondary image for benefits or features</li>
          <li>• <strong>Gallery:</strong> Additional product angles or usage photos</li>
          <li>• Uploading a new hero/info card automatically replaces the old one</li>
          <li>• Each variant has its own separate images</li>
        </ul>
      </div>
    </div>
  );
};
