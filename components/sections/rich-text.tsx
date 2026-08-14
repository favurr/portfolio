interface RichTextProps {
  content?: string | null;
  props?: {
    bgStyle?: "transparent" | "card";
    animation?: "none" | "fade" | "slide" | "scale";
  };
}

export default function RichTextSection({ content, props }: RichTextProps) {
  const bgStyle = props?.bgStyle || "transparent";

  const bgStyleClass =
    bgStyle === "card"
      ? "p-8 md:p-10 bg-muted/10 border border-border/40 rounded-2xl shadow-sm"
      : "transparent";

  return (
    <div className={`font-sans max-w-4xl leading-relaxed text-muted-foreground text-base sm:text-lg text-left ${bgStyleClass}`}>
      {content ? (
        <div 
          className="space-y-4 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground prose-a:text-foreground prose-a:underline break-inside-avoid"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      ) : (
        <p className="text-muted-foreground/60 font-mono text-xs italic">
          No text content provided for this section.
        </p>
      )}
    </div>
  );
}
