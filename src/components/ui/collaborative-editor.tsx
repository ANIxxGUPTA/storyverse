"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mark, mergeAttributes } from "@tiptap/core";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Bold, Italic, Heading1, Heading2, Quote, List, Users, MessageSquarePlus, PenTool } from "lucide-react";

const CommentMark = Mark.create({
  name: "comment",
  addAttributes() {
    return { commentId: { default: null } };
  },
  parseHTML() {
    return [{ tag: "span[data-comment-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "bg-yellow-200 dark:bg-yellow-900/50 cursor-pointer border-b-2 border-yellow-400" }), 0];
  },
});

const SuggestionMark = Mark.create({
  name: "suggestion",
  addAttributes() {
    return { type: { default: "addition" } }; // addition or deletion
  },
  parseHTML() {
    return [{ tag: "span[data-suggestion-type]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const isAddition = HTMLAttributes.type === "addition";
    const className = isAddition 
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 underline decoration-green-500" 
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 line-through decoration-red-500";
    return ["span", mergeAttributes(HTMLAttributes, { class: className }), 0];
  },
});
import { useSession } from "next-auth/react";

interface CollaborativeEditorProps {
  value: string;
  onChange: (val: string) => void;
  chapterId: string;
  minHeight?: string;
}

const colors = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444"];

export function CollaborativeEditor({ value, onChange, chapterId, minHeight = "500px" }: CollaborativeEditorProps) {
  const { data: session } = useSession();
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const ydocRef = useRef(new Y.Doc());
  const [usersCount, setUsersCount] = useState(1);

  // Set up the Yjs document and WebSocket provider once on mount
  useEffect(() => {
    const ydoc = ydocRef.current;
    
    // Connect to a public demo server (ideal for local testing / prototyping without backend)
    // For production, replace this with a Liveblocks or custom Hocuspocus URL.
    const wsProvider = new WebsocketProvider(
      "wss://demos.yjs.dev/ws",
      `storyverse-chapter-${chapterId}`,
      ydoc
    );

    // Provide user awareness
    const userName = session?.user?.name || "Anonymous Co-author";
    const userColor = colors[Math.floor(Math.random() * colors.length)];
    
    wsProvider.awareness.setLocalStateField("user", {
      name: userName,
      color: userColor,
    });

    wsProvider.awareness.on("change", () => {
      setUsersCount(wsProvider.awareness.getStates().size);
    });

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [chapterId, session]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // @ts-ignore - Tiptap Collaboration requires disabling default history
        history: false, 
      }),
      CommentMark,
      SuggestionMark,
      Collaboration.configure({
        document: ydocRef.current,
      }),
      CollaborationCursor.configure({
        provider: provider as any,
        user: {
          name: session?.user?.name || "Anonymous",
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Return HTML for persistence
      onChange(editor.getHTML());
    },
  });

  if (!editor || !provider) {
    return (
      <div className="flex h-64 items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const ToolbarButton = ({ icon: Icon, onClick, isActive = false, title }: { icon: any, onClick: () => void, isActive?: boolean, title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition ${
        isActive 
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex flex-col rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2">
        <div className="flex items-center gap-1">
          <ToolbarButton 
            icon={Bold} 
            title="Bold" 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')} 
          />
          <ToolbarButton 
            icon={Italic} 
            title="Italic" 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')} 
          />
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <ToolbarButton 
            icon={Heading1} 
            title="Heading 1" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            isActive={editor.isActive('heading', { level: 1 })} 
          />
          <ToolbarButton 
            icon={Heading2} 
            title="Heading 2" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            isActive={editor.isActive('heading', { level: 2 })} 
          />
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <ToolbarButton 
            icon={Quote} 
            title="Quote" 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            isActive={editor.isActive('blockquote')} 
          />
          <ToolbarButton 
            icon={List} 
            title="Bullet List" 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')} 
          />
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1" />
          <ToolbarButton 
            icon={MessageSquarePlus} 
            title="Add Comment" 
            onClick={() => {
              const id = Math.random().toString(36).substring(7);
              editor.chain().focus().setMark('comment', { commentId: id }).run();
            }} 
            isActive={editor.isActive('comment')} 
          />
          <ToolbarButton 
            icon={PenTool} 
            title="Suggest Change" 
            onClick={() => {
              editor.chain().focus().setMark('suggestion', { type: 'addition' }).run();
            }} 
            isActive={editor.isActive('suggestion')} 
          />
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${provider.wsconnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
            <span className="relative flex h-2 w-2">
              {provider.wsconnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${provider.wsconnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
            </span>
            {provider.wsconnected ? 'Live Sync' : 'Connecting...'}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 border-l border-zinc-300 dark:border-zinc-700 pl-3 ml-1" title={`${usersCount} users co-authoring`}>
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold">{usersCount}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm dark:prose-invert max-w-none p-6 font-serif leading-relaxed min-h-[500px] outline-none"
        />
      </div>
      
      {/* Global CSS for Collaboration Cursors */}
      <style dangerouslySetInnerHTML={{__html: `
        .collaboration-cursor__caret {
          position: relative;
          margin-left: -1px;
          margin-right: -1px;
          border-left: 2px solid #000;
          border-right: 2px solid #000;
          word-break: normal;
          pointer-events: none;
        }
        .collaboration-cursor__label {
          position: absolute;
          top: -1.4em;
          left: -2px;
          font-size: 10px;
          font-family: sans-serif;
          font-style: normal;
          font-weight: 600;
          line-height: normal;
          user-select: none;
          color: #fff;
          padding: 0.1rem 0.3rem;
          border-radius: 3px 3px 3px 0;
          white-space: nowrap;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}} />
    </div>
  );
}
