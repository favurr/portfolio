"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryProps {
  props?: {
    images?: Array<{ url: string; alt?: string }>;
    bento?: boolean;
    compact?: boolean;
    fullBleed?: boolean;
    radius?: "none" | "sm" | "md" | "lg" | "full";
    fitMode?: "cover" | "contain" | "natural";
    aspectRatio?: "video" | "square" | "4-3" | "21-9" | "auto";
    gapSize?: "none" | "sm" | "md" | "lg";
    lightbox?: boolean;
    carousel?: boolean;
  };
}

export default function GallerySection({ props }: GalleryProps) {
  const [activeZoom, setActiveZoom] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth * 0.85, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.85, behavior: "smooth" });
    }
  };

  const images = props?.images || [];
  const isBento = props?.bento || false;
  const isCompact = props?.compact || false;
  const isFullBleed = props?.fullBleed || false;
  const radius = props?.radius || "md";
  const fitMode = props?.fitMode || "cover";
  const aspectRatio = props?.aspectRatio || "video";
  const gapSize = props?.gapSize || "md";
  const hasLightbox = props?.lightbox || false;
  const isCarousel = props?.carousel || false;

  // Radius map definitions
  const radiusMap = {
    none: "rounded-none",
    sm: "rounded-md",
    md: "rounded-2xl",
    lg: "rounded-3xl",
    full: "rounded-[2rem]",
  };

  // Gap class resolution
  const gapClassMap = {
    none: "gap-0",
    sm: "gap-4",
    md: "gap-8",
    lg: "gap-16",
  };
  const gapClass = isCompact ? "gap-0" : (gapClassMap[gapSize] || gapClassMap.md);

  // Aspect ratio class resolution
  const aspectClassMap = {
    video: "aspect-video",
    square: "aspect-square",
    "4-3": "aspect-[4/3]",
    "21-9": "aspect-[21/9]",
    auto: "h-auto",
  };

  const radiusClass = (isCompact || isFullBleed) ? "rounded-none" : (radiusMap[radius] || radiusMap.md);
  const borderClass = (isCompact || isFullBleed) ? "border-none bg-transparent" : "border border-border/60 bg-muted/20";
  const hoverScaleClass = isFullBleed ? "group-hover:scale-100" : "group-hover:scale-[1.02]";

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground font-mono text-xs">
        No images configured for this gallery. Add assets inside this layout block in the studio.
      </div>
    );
  }

  // Render Carousel Layout
  if (isCarousel) {
    return (
      <>
        <div className="relative w-full group/carousel">
          <div
            ref={scrollRef}
            className={`flex overflow-x-auto snap-x snap-mandatory ${isCompact ? "gap-0" : "gap-6"} no-scrollbar pb-4`}
          >
            {images.map((img, i) => {
              let aspectClass = isFullBleed ? "h-[300px] md:h-[500px]" : (aspectClassMap[aspectRatio] || aspectClassMap.video);
              let fitClass = "object-cover h-full w-full";
              let slideStyle: React.CSSProperties = {};

              if (isFullBleed) {
                slideStyle = { width: "100%" };
              } else if (fitMode === "natural") {
                // Natural aspect: lock height and let width scale naturally based on image content
                fitClass = "h-full w-auto object-contain";
                aspectClass = "h-[300px] md:h-[500px] w-auto";
                slideStyle = { width: "auto" };
              } else {
                // Contain or Cover aspect: set responsive maximum widths to allow peek previews
                fitClass = fitMode === "contain" 
                  ? "object-contain h-full w-full bg-black/10 dark:bg-white/5" 
                  : "object-cover h-full w-full";
                slideStyle = { width: "calc(80vw - 2rem)", maxWidth: "800px" };
              }

              return (
                <div
                  key={i}
                  className={`group relative shrink-0 snap-start ${aspectClass} overflow-hidden ${borderClass} ${radiusClass} ${hasLightbox ? "cursor-zoom-in" : ""}`}
                  style={slideStyle}
                  onClick={() => hasLightbox && setActiveZoom(img.url)}
                >
                  {img.url.endsWith(".mp4") ? (
                    <video
                      src={img.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className={`${fitClass} transition-transform duration-700 ease-out ${hoverScaleClass}`}
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt={img.alt || `Gallery item ${i + 1}`}
                      className={`${fitClass} transition-transform duration-700 ease-out ${hoverScaleClass}`}
                      loading="lazy"
                    />
                  )}

                  {hasLightbox && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Slider navigation control arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollLeft}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-border bg-background/80 hover:bg-background text-foreground backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 cursor-pointer hidden md:flex z-10 shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full border border-border bg-background/80 hover:bg-background text-foreground backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 cursor-pointer hidden md:flex z-10 shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Lightbox Portal Container */}
        {mounted && activeZoom && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-200"
            onClick={() => setActiveZoom(null)}
          >
            <button
              type="button"
              className="absolute top-6 right-6 p-2 rounded-full border border-border hover:bg-muted transition-colors text-foreground cursor-pointer z-50"
              onClick={() => setActiveZoom(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              {activeZoom.endsWith(".mp4") ? (
                <video src={activeZoom} controls autoPlay className="max-w-screen max-h-[85vh] rounded-lg shadow-2xl" />
              ) : (
                <img
                  src={activeZoom}
                  alt="Enlarged gallery view"
                  className="max-w-screen max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Render standard grid layouts
  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gapClass}`}>
        {images.map((img, i) => {
          let spanClass = "col-span-1";
          let aspectClass = isFullBleed ? "h-auto" : (aspectClassMap[aspectRatio] || aspectClassMap.video);

          if (isBento && !isFullBleed) {
            // Bento spans: index 0 and index 3 (first and fourth items) span full grid widths
            if (i % 3 === 0) {
              spanClass = "md:col-span-2";
              aspectClass = aspectRatio === "video" ? "aspect-video md:aspect-[21/9]" : (aspectClassMap[aspectRatio] || aspectClassMap.video);
            } else {
              spanClass = "col-span-1";
              aspectClass = aspectRatio === "video" ? "aspect-square md:aspect-video" : (aspectClassMap[aspectRatio] || aspectClassMap.video);
            }
          } else if (isFullBleed) {
            spanClass = "col-span-1 md:col-span-2";
          }

          // Image fit mode styles
          let fitClass = "object-cover h-full";
          if (fitMode === "contain") {
            fitClass = "object-contain h-full bg-black/10 dark:bg-white/5";
          } else if (fitMode === "natural") {
            fitClass = "w-full h-auto object-contain";
            aspectClass = "h-auto"; // Natural aspect overrides aspect class container constraints
          }

          return (
            <div
              key={i}
              className={`group relative ${spanClass} ${aspectClass} w-full overflow-hidden ${borderClass} ${radiusClass} ${hasLightbox ? "cursor-zoom-in" : ""}`}
              onClick={() => hasLightbox && setActiveZoom(img.url)}
            >
              {img.url.endsWith(".mp4") ? (
                <video
                  src={img.url}
                  autoPlay
                  muted
                  loop
                  className={`w-full ${fitClass} transition-transform duration-700 ease-out ${hoverScaleClass}`}
                />
              ) : (
                <img
                  src={img.url}
                  alt={img.alt || `Gallery item ${i + 1}`}
                  className={`w-full ${fitClass} transition-transform duration-700 ease-out ${hoverScaleClass}`}
                  loading="lazy"
                />
              )}

              {hasLightbox && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Portal Overlay */}
      {mounted && activeZoom && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-200"
          onClick={() => setActiveZoom(null)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-2 rounded-full border border-border hover:bg-muted transition-colors text-foreground cursor-pointer z-50"
            onClick={() => setActiveZoom(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {activeZoom.endsWith(".mp4") ? (
              <video src={activeZoom} controls autoPlay className="max-w-screen max-h-[85vh] rounded-lg shadow-2xl" />
            ) : (
              <img
                src={activeZoom}
                alt="Enlarged gallery view"
                className="max-w-screen max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
