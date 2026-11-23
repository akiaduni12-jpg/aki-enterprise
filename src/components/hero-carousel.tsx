"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroBanner } from "@/types/ecommerce";
import { ArrowRight, ChevronLeft, ChevronRight, QrCode } from "lucide-react";

interface HeroCarouselProps {
  banners: HeroBanner[];
  onBannerClick?: (bannerId: string) => void;
  autoPlayInterval?: number;
}

export function HeroCarousel({
  banners,
  onBannerClick,
  autoPlayInterval = 6500,
}: HeroCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const bannerCount = banners.length;

  const nextSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setActiveSlide((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = useCallback(() => {
    if (bannerCount <= 1) return;
    setActiveSlide((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  // Auto-play timer
  useEffect(() => {
    if (bannerCount <= 1 || isPaused || isDragging) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [bannerCount, isPaused, isDragging, autoPlayInterval, nextSlide]);

  // Mobile Touch Handlers with Real-Time Drag Physics
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    touchStartXRef.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartXRef.current;
    // Apply slight resistance at boundaries
    if (
      (activeSlide === 0 && diff > 0) ||
      (activeSlide === bannerCount - 1 && diff < 0)
    ) {
      setDragOffset(diff * 0.4);
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 50; // px to trigger slide change
    if (dragOffset < -threshold) {
      nextSlide();
    } else if (dragOffset > threshold) {
      prevSlide();
    }
    setDragOffset(0);
    touchStartXRef.current = null;
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ================================================================== */}
      {/* 1. MOBILE HERO SLIDING CAROUSEL (< 640px) */}
      {/* ================================================================== */}
      <div className="sm:hidden select-none overflow-hidden rounded-3xl">
        {/* Sliding Track */}
        <div
          className={`flex ${
            isDragging
              ? "transition-none"
              : "transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
          }`}
          style={{
            transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((banner, idx) => {
            const isActive = idx === activeSlide;
            const mobileImage = banner.mobile_image_url || banner.image_url;

            return (
              <div key={banner.id || idx} className="w-full min-w-full shrink-0">
                {banner.hide_text_overlay ? (
                  /* Clean Graphic Banner Mode on Mobile */
                  <Link
                    href={banner.cta_link || "/products"}
                    onClick={() => onBannerClick?.(banner.id)}
                    className="relative h-48 rounded-3xl overflow-hidden block shadow-xl border border-white/10 group cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <Image
                      src={mobileImage}
                      alt={banner.title}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        isActive ? "scale-100" : "scale-105"
                      }`}
                      sizes="100vw"
                      priority={idx === 0}
                    />
                    <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-lg">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 text-[#FF8A24]" />
                    </div>
                  </Link>
                ) : (
                  /* Styled Mobile Hero Card with Rich Text */
                  <div className="relative h-44 rounded-3xl overflow-hidden bg-[#141414] border border-white/10 p-5 flex items-center justify-between shadow-xl">
                    {/* Glowing Accent Bloom */}
                    <div
                      className="absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-75 blur-2xl pointer-events-none transition-colors duration-700"
                      style={{
                        background: `radial-gradient(circle, ${
                          banner.accent_color || "#F26A00"
                        } 0%, transparent 70%)`,
                      }}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-transparent to-[#141414] z-10 pointer-events-none" />

                    {/* Left Text & CTA */}
                    <div className="relative z-20 max-w-[170px] space-y-1.5">
                      <div
                        className={`transition-all duration-500 delay-100 ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-2"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-[#FF8A24] uppercase tracking-wider block">
                          {banner.badge || "Up to 20% OFF"}
                        </span>
                      </div>

                      <h2
                        className={`text-xl font-black text-white leading-tight tracking-tight drop-shadow-sm transition-all duration-500 delay-200 ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        }`}
                      >
                        {banner.title}
                      </h2>

                      <div
                        className={`pt-1 transition-all duration-500 delay-300 ${
                          isActive
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-3"
                        }`}
                      >
                        <Link
                          href={banner.cta_link || "/products"}
                          onClick={() => onBannerClick?.(banner.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] text-white text-xs font-black shadow-md shadow-orange-600/40 active:scale-95 transition"
                        >
                          <span>{banner.cta_text || "Shop Now"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Hero Image */}
                    <div className="relative z-10 w-32 h-36 shrink-0">
                      <Image
                        src={mobileImage}
                        alt={banner.title}
                        fill
                        className={`object-contain drop-shadow-2xl transition-all duration-700 ${
                          isActive
                            ? "scale-100 opacity-100"
                            : "scale-90 opacity-70"
                        }`}
                        sizes="(max-width: 640px) 140px, 200px"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Modern Progress Dots */}
        {bannerCount > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeSlide
                    ? "w-6 h-1.5 bg-[#F26A00] shadow-xs shadow-orange-500/50"
                    : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* 2. DESKTOP HERO SLIDING CAROUSEL (>= 640px) */}
      {/* ================================================================== */}
      <div className="hidden sm:block relative w-full aspect-[21/9] lg:aspect-[16/9] min-h-[460px] max-h-[640px] rounded-3xl overflow-hidden shadow-2xl bg-[#171717] group">
        {/* Animated Carousel Track */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {banners.map((banner, idx) => {
            const isActive = idx === activeSlide;

            return (
              <div
                key={banner.id || idx}
                className="relative h-full w-full min-w-full shrink-0 overflow-hidden"
              >
                {banner.hide_text_overlay ? (
                  /* Clean Banner Mode: Entire Image is a Clickable Link */
                  <Link
                    href={banner.cta_link || "/products"}
                    onClick={() => onBannerClick?.(banner.id)}
                    className="absolute inset-0 block cursor-pointer z-0 group/clean"
                    title={`View ${banner.title}`}
                  >
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      fill
                      className={`object-cover transition-transform duration-1000 ${
                        isActive ? "scale-100 group-hover/clean:scale-[1.03]" : "scale-105"
                      }`}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      priority={idx === 0}
                    />
                  </Link>
                ) : (
                  <>
                    {/* Active Banner Photography */}
                    <Image
                      src={banner.image_url}
                      alt={banner.title}
                      fill
                      className={`object-cover transition-transform duration-1000 ${
                        isActive ? "scale-100 group-hover:scale-[1.03]" : "scale-105"
                      }`}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      priority={idx === 0}
                    />

                    {/* Cinematic Scrim Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/60 to-black/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Dynamic Ambient Accent Bloom */}
                    <div
                      className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-3xl opacity-35 pointer-events-none transition-all duration-700"
                      style={{ backgroundColor: banner.accent_color || "#F26A00" }}
                    />

                    {/* Glowing Abstract Arc SVG Overlay */}
                    <svg
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-25"
                      viewBox="0 0 1200 675"
                      fill="none"
                    >
                      <circle
                        cx="950"
                        cy="337"
                        r="280"
                        stroke="#FF8A24"
                        strokeWidth="1"
                        strokeOpacity="0.4"
                        strokeDasharray="4 8"
                      />
                      <circle
                        cx="950"
                        cy="337"
                        r="420"
                        stroke="#F26A00"
                        strokeWidth="1.5"
                        strokeOpacity="0.25"
                      />
                      <path
                        d="M 400 0 C 700 240, 850 450, 1200 600"
                        stroke="#FF8A24"
                        strokeWidth="2"
                        strokeOpacity="0.5"
                      />
                    </svg>

                    {/* Overlay Content with Staggered Entrance Animations */}
                    <div className="absolute inset-0 p-6 sm:p-12 lg:p-16 flex flex-col justify-between z-10">
                      {/* Top Row: Pill Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#FF8A24] text-xs font-black tracking-wide shadow-lg pointer-events-auto transition-all duration-700 delay-100 ${
                            isActive
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 -translate-y-4"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#FF8A24]" />
                          <span>{banner.badge}</span>
                        </div>
                      </div>

                      {/* Middle: Headline, Subtitle & Action Buttons */}
                      <div className="max-w-2xl space-y-4 sm:space-y-6 pointer-events-auto">
                        <h1
                          className={`text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-lg transition-all duration-700 delay-200 ${
                            isActive
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-8"
                          }`}
                        >
                          {banner.title}
                        </h1>

                        <p
                          className={`text-xs sm:text-base text-gray-200 leading-relaxed max-w-xl drop-shadow-md transition-all duration-700 delay-300 ${
                            isActive
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-6"
                          }`}
                        >
                          {banner.subtitle}
                        </p>

                        {/* Action Buttons */}
                        <div
                          className={`flex flex-wrap items-center gap-3 pt-2 transition-all duration-700 delay-400 ${
                            isActive
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-4"
                          }`}
                        >
                          <Link
                            href={banner.cta_link || "/products"}
                            onClick={() => onBannerClick?.(banner.id)}
                            className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#F26A00] to-[#FF8A24] hover:from-[#d95e00] hover:to-[#F26A00] text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-600/40 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                          >
                            <span>{banner.cta_text || "Shop Now"}</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>

                          {banner.secondary_cta_text && (
                            <Link
                              href={banner.secondary_cta_link || "/products"}
                              onClick={() => onBannerClick?.(banner.id)}
                              className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25 font-bold text-xs sm:text-sm transition cursor-pointer"
                            >
                              {banner.secondary_cta_text}
                            </Link>
                          )}

                          <Link
                            href="/qr"
                            className="hidden sm:inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-orange-400 border border-orange-500/30 text-xs font-bold transition"
                            title="Open Store QR Scanner"
                          >
                            <QrCode className="w-4 h-4 text-[#FF8A24]" />
                            <span>Scan &amp; Shop</span>
                          </Link>
                        </div>
                      </div>

                      {/* Spacer for bottom controls */}
                      <div className="h-6" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Desktop Bottom Navigation Bar (Overlays Slides) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:px-12 lg:px-16 flex items-center justify-between z-20 pointer-events-auto">
          {/* Glassmorphic Pagination Pill Indicators */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-lg">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  activeSlide === idx
                    ? "w-10 bg-gradient-to-r from-[#F26A00] to-[#FF8A24] shadow-md shadow-orange-500/50"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 active:scale-95 shadow-lg hover:border-orange-500/50 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 active:scale-95 shadow-lg hover:border-orange-500/50 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Smooth Top Progress Countdown Bar */}
        {bannerCount > 1 && !isPaused && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
            <div
              key={activeSlide}
              className="h-full bg-gradient-to-r from-[#F26A00] via-[#FF8A24] to-[#F26A00] animate-[carousel-progress_6.5s_linear_infinite]"
              style={{
                animationDuration: `${autoPlayInterval}ms`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
