interface GalleryProps {
  props?: {
    images?: Array<{ url: string; alt?: string }>;
    bento?: boolean;
    compact?: boolean;
    fullBleed?: boolean;
    radius?: "none" | "sm" | "md" | "lg" | "full";
  };
}

export default function GallerySection({ props }: GalleryProps) {
  const images = props?.images || [];
  const isBento = props?.bento || false;
  const isCompact = props?.compact || false;
  const isFullBleed = props?.fullBleed || false;
  const radius = props?.radius || "md";

  // Radius map definitions
  const radiusMap = {
    none: "rounded-none",
    sm: "rounded-md",
    md: "rounded-2xl",
    lg: "rounded-3xl",
    full: "rounded-[2rem]",
  };

  const radiusClass = (isCompact || isFullBleed) ? "rounded-none" : (radiusMap[radius] || radiusMap.md);
  const gapClass = isCompact ? "gap-0" : "gap-8";
  const borderClass = (isCompact || isFullBleed) ? "border-none bg-transparent" : "border border-border/60 bg-muted/20";
  const hoverScaleClass = isFullBleed ? "group-hover:scale-100" : "group-hover:scale-[1.02]";

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-12 text-center text-muted-foreground font-mono text-xs">
        No images configured for this gallery. Add assets inside this layout block in the studio.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${gapClass}`}>
      {images.map((img, i) => {
        // Evaluate bento pattern column rules when bento layout is checked
        let spanClass = "col-span-1";
        let aspectClass = isFullBleed ? "h-auto" : "aspect-video";

        if (isBento && !isFullBleed) {
          // Bento spans: index 0 and index 3 (first and fourth items) span full grid widths
          if (i % 3 === 0) {
            spanClass = "md:col-span-2";
            aspectClass = "aspect-video md:aspect-[21/9]";
          } else {
            spanClass = "col-span-1";
            aspectClass = "aspect-square md:aspect-video";
          }
        } else if (isFullBleed) {
          // In full bleed with no aspect spans, allow images to span full width or alternate naturally
          spanClass = "col-span-1 md:col-span-2";
        }

        return (
          <div
            key={i}
            className={`group relative ${spanClass} ${aspectClass} w-full overflow-hidden ${borderClass} ${radiusClass}`}
          >
            {img.url.endsWith(".mp4") ? (
              <video
                src={img.url}
                autoPlay
                muted
                loop
                className={`w-full h-full object-cover transition-transform duration-700 ease-out ${hoverScaleClass}`}
              />
            ) : (
              <img
                src={img.url}
                alt={img.alt || `Gallery item ${i + 1}`}
                className={`w-full ${isFullBleed ? "h-auto" : "h-full object-cover"} transition-transform duration-700 ease-out ${hoverScaleClass}`}
                loading="lazy"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
