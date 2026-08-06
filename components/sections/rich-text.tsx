interface RichTextProps {
  content?: string | null;
  props?: {
    align?: "left" | "center" | "right";
    columns?: number;
  };
}

export default function RichTextSection({ content, props }: RichTextProps) {
  const alignClass =
    props?.align === "center"
      ? "text-center mx-auto"
      : props?.align === "right"
      ? "text-right ml-auto"
      : "text-left";

  return (
    <div className={`font-sans max-w-3xl leading-relaxed text-muted-foreground text-base sm:text-lg ${alignClass}`}>
      {content ? (
        <div 
          className="space-y-4 prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground prose-a:text-foreground prose-a:underline"
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
