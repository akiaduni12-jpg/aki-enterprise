"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

interface ImageUploaderProps {
  label?: string;
  description?: string;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  aspectRatio?: "16/9" | "1/1" | "4/3" | "auto";
  className?: string;
}

export function ImageUploader({
  label = "Upload Image",
  description = "Supports JPG, PNG, WEBP up to 10MB. Hosted on Cloudinary CDN.",
  folder = "aki_enterprise/products",
  multiple = false,
  maxFiles = 6,
  value,
  onChange,
  aspectRatio = "auto",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{
    isConfigured: boolean;
    provider: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for uniform handling
  const currentImages: string[] = Array.isArray(value)
    ? value
    : value
    ? [value]
    : [];

  // Check Cloudinary backend status on mount
  useEffect(() => {
    fetch("/api/upload")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.isConfigured === "boolean") {
          setCloudinaryStatus({
            isConfigured: data.isConfigured,
            provider: data.provider || "Cloudinary",
          });
        }
      })
      .catch(() => {
        // Silent fallback
      });
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (fileArray.length === 0) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (!multiple && fileArray.length > 1) {
      setUploadError("Single file upload mode: please select one image.");
      return;
    }

    if (multiple && currentImages.length + fileArray.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploadedUrls: string[] = [];

      for (const file of fileArray) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      if (multiple) {
        const combined = [...currentImages, ...uploadedUrls];
        onChange(combined);
        setUploadSuccess(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
      } else {
        onChange(uploadedUrls[0]);
        setUploadSuccess("Image uploaded successfully to Cloudinary!");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadSuccess(null), 4000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (multiple) {
      const filtered = currentImages.filter((_, idx) => idx !== indexToRemove);
      onChange(filtered);
    } else {
      onChange("");
    }
  };

  const handleAddDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setUploadError("Please enter a valid HTTP/HTTPS image URL.");
      return;
    }

    if (multiple) {
      if (currentImages.length >= maxFiles) {
        setUploadError(`Maximum ${maxFiles} images allowed.`);
        return;
      }
      onChange([...currentImages, trimmed]);
    } else {
      onChange(trimmed);
    }

    setUrlInput("");
    setShowUrlInput(false);
    setUploadError(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label & Status Header */}
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="text-sm font-semibold text-zinc-900 dark:text-white">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-zinc-700 dark:text-zinc-300">{description}</p>
          )}
        </div>

        {/* Cloudinary CDN Status Badge */}
        {cloudinaryStatus && (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              cloudinaryStatus.isConfigured
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
            }`}
            title={
              cloudinaryStatus.isConfigured
                ? "Cloudinary CDN is active and connected."
                : "Cloudinary keys missing from .env.local; using local fallback."
            }
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                cloudinaryStatus.isConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {cloudinaryStatus.isConfigured ? "Cloudinary CDN" : "Local Image Mode"}
          </div>
        )}
      </div>

      {/* Upload Dropzone */}
      {(!multiple && currentImages.length === 0) || multiple ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-primary/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = ""; // Reset
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                {isUploading ? (
                  <span>Uploading to Cloudinary CDN...</span>
                ) : (
                  <span>
                    Click to browse or <span className="text-primary underline">drag & drop</span>
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Supports PNG, JPG, WEBP, GIF (Max 10MB)
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Alternative URL button */}
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-primary transition"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? "Hide URL input" : "Or paste direct image URL"}
        </button>

        {multiple && (
          <span className="text-zinc-600 dark:text-zinc-400">
            {currentImages.length} / {maxFiles} images
          </span>
        )}
      </div>

      {/* Direct URL Input Modal/Bar */}
      {showUrlInput && (
        <form onSubmit={handleAddDirectUrl} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://res.cloudinary.com/... or https://images.unsplash.com/..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Attach
          </button>
        </form>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Previews / Gallery */}
      {currentImages.length > 0 && (
        <div
          className={`grid gap-3 ${
            multiple
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {currentImages.map((imgUrl, index) => {
            const isCloudinary = imgUrl.includes("res.cloudinary.com");
            return (
              <div
                key={`${imgUrl}-${index}`}
                className={`relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm ${
                  aspectRatio === "16/9"
                    ? "aspect-video"
                    : aspectRatio === "1/1"
                    ? "aspect-square"
                    : "aspect-video sm:aspect-square"
                }`}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Upload preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cloudinary Badge overlay */}
                {isCloudinary && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600/90 text-white backdrop-blur-xs shadow-xs">
                    Cloudinary CDN
                  </span>
                )}

                {/* Cover indicator for 1st image in multiple */}
                {multiple && index === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900/80 text-white backdrop-blur-xs">
                    Primary Cover
                  </span>
                )}

                {/* Action buttons overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/90 text-zinc-800 hover:bg-white transition"
                    title="Open original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
