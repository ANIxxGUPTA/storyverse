"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Bold, Italic, Heading1, Heading2, Link as LinkIcon, Image as ImageIcon, Video, List, Quote, Loader2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = "400px" }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [cursorQueue, setCursorQueue] = useState<{ start: number; end: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [isUploading, setIsUploading] = useState(false);

  // Reliably set cursor position after React re-renders with new value
  useEffect(() => {
    if (cursorQueue && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorQueue.start, cursorQueue.end);
      setCursorQueue(null);
    }
  }, [value, cursorQueue]);

  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    setCursorQueue({ start: start + before.length, end: end + before.length });
  };

  const uploadFile = async (file: File, type: "image" | "video") => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (type === "video" || file.type.startsWith("video/")) {
          insertText(`<video src="${data.url}" controls width="100%"></video>`, "");
        } else {
          insertText(`![${file.name}](${data.url})`, "");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, uploadType);
  };

  const triggerUpload = (type: "image" | "video") => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleLink = () => {
    const url = window.prompt("Enter URL for the link:", "https://");
    if (url) insertText("[", `](${url})`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (tab !== "write") return;
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      const type = file.type.startsWith("video/") ? "video" : "image";
      uploadFile(file, type);
    }
  };

  const ToolbarButton = ({ icon: Icon, onClick, title, disabled = false }: { icon: any, onClick: () => void, title: string, disabled?: boolean }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition ${disabled ? "opacity-50 cursor-not-allowed text-zinc-400" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"}`}
    >
      <Icon className={`h-4 w-4 ${disabled && isUploading ? "animate-spin" : ""}`} />
    </button>
  );

  return (
    <div className="flex flex-col rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept={uploadType === "video" ? "video/*" : "image/*"} 
        className="hidden" 
      />
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              tab === "write" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              tab === "preview" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Live Preview
          </button>
        </div>
        
        {tab === "write" && (
          <div className="flex items-center gap-1 border-l border-zinc-300 dark:border-zinc-700 pl-3 ml-1">
            <ToolbarButton icon={Bold} title="Bold" onClick={() => insertText("**", "**")} />
            <ToolbarButton icon={Italic} title="Italic" onClick={() => insertText("*", "*")} />
            <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => insertText("# ", "")} />
            <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => insertText("## ", "")} />
            <ToolbarButton icon={Quote} title="Quote" onClick={() => insertText("> ", "")} />
            <ToolbarButton icon={List} title="Bullet List" onClick={() => insertText("- ", "")} />
            <ToolbarButton icon={LinkIcon} title="Link" onClick={handleLink} />
            <ToolbarButton icon={isUploading && uploadType === "image" ? Loader2 : ImageIcon} title="Upload Image" onClick={() => triggerUpload("image")} disabled={isUploading} />
            <ToolbarButton icon={isUploading && uploadType === "video" ? Loader2 : Video} title="Upload Video" onClick={() => triggerUpload("video")} disabled={isUploading} />
          </div>
        )}
      </div>

      <div 
        className="relative" 
        style={{ minHeight }}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
      >
        {tab === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write your story... You can drag and drop images or videos here."}
            className="absolute inset-0 w-full h-full resize-none p-4 text-sm text-zinc-900 dark:text-zinc-100 bg-transparent outline-none font-serif leading-relaxed"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none font-serif leading-relaxed text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900/20">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-zinc-500 italic">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
