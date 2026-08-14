"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "@tiptap/markdown";
import { common, createLowlight } from "lowlight";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Type,
  Minus,
  RotateCcw,
  RotateCw
} from "lucide-react";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUploadClick?: () => void;
  onImageUploadClick2?: () => void;
}

export function TiptapEditor({ content, onChange, onImageUploadClick }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default to allow CodeBlockLowlight to handle highlights
        heading: {
          levels: [3, 4, 5, 6],
        },
        // Disable built-ins we configure separately below to avoid duplicate extension warnings
        link: false,
        underline: false,
      }),
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg border border-border/80 bg-zinc-950 font-mono text-xs p-4 my-4 overflow-x-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-foreground underline underline-offset-4 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl border border-border/60 max-w-full my-4",
        },
      }),
      Placeholder.configure({
        placeholder: "Type '/' or paste markdown to begin formatting...",
      }),
      Markdown.configure({
        html: true,
        transformCopiedText: true,
        transformPastedText: true
      } as any),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none min-h-[250px] font-sans text-sm md:text-base leading-relaxed text-muted-foreground",
      },
    },
  });

  // Keep content synced if updated externally
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content, false as any);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full border border-border/60 rounded-xl overflow-hidden bg-background/30 focus-within:border-foreground transition-colors">
      {/* Editor Toolbar (Rich control options) */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/40 p-2 bg-muted/10">
        
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
          title="Undo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
          title="Redo"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("bold") ? "bg-muted text-foreground" : ""}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("italic") ? "bg-muted text-foreground" : ""}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("underline") ? "bg-muted text-foreground" : ""}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("strike") ? "bg-muted text-foreground" : ""}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Headings H3-H6 */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("heading", { level: 3 }) ? "bg-muted text-foreground" : ""}`}
          title="H3"
        >
          <span className="font-mono text-xs font-bold">H3</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("heading", { level: 4 }) ? "bg-muted text-foreground" : ""}`}
          title="H4"
        >
          <span className="font-mono text-xs font-bold">H4</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("heading", { level: 5 }) ? "bg-muted text-foreground" : ""}`}
          title="H5"
        >
          <span className="font-mono text-xs font-bold">H5</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("heading", { level: 6 }) ? "bg-muted text-foreground" : ""}`}
          title="H6"
        >
          <span className="font-mono text-xs font-bold">H6</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("paragraph") ? "bg-muted text-foreground" : ""}`}
          title="Paragraph text"
        >
          <Type className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* Lists & Blocks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("bulletList") ? "bg-muted text-foreground" : ""}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("orderedList") ? "bg-muted text-foreground" : ""}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("blockquote") ? "bg-muted text-foreground" : ""}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("code") ? "bg-muted text-foreground" : ""}`}
          title="Monospace Font Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer ${editor.isActive("codeBlock") ? "bg-muted text-foreground" : ""}`}
          title="Code Block"
        >
          <span className="font-mono text-xs font-bold">{"{}"}</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Horizontal separator line"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {onImageUploadClick && (
          <button
            type="button"
            onClick={onImageUploadClick}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Bubble Menu for Inline Text selections */}
      {editor && (
        <BubbleMenu
          editor={editor}
          {...{ tippyOptions: { duration: 150 } } as any}
          className="flex items-center gap-0.5 bg-zinc-950 border border-border/80 rounded-lg p-1 shadow-2xl z-50"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${editor.isActive("bold") ? "text-foreground" : ""}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${editor.isActive("italic") ? "text-foreground" : ""}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${editor.isActive("underline") ? "text-foreground" : ""}`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${editor.isActive("strike") ? "text-foreground" : ""}`}
          >
            <span className="font-mono text-xs px-1 line-through scale-90">S</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${editor.isActive("code") ? "text-foreground" : ""}`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </BubbleMenu>
      )}

      {/* Main Content Area */}
      <div className="p-4 bg-background/10">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
