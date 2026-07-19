"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Loader2, Save, CloudOff, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { AiAssistantSidebar } from "@/components/story/ai-assistant-sidebar";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useAutosave } from "@/hooks/useAutosave";

interface Story {
  title: string;
  author: any;
  authorId?: string;
}

export default function CreateChapterPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { id } = params;
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStory, setFetchingStory] = useState(true);
  const [error, setError] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  const [chapterStatus, setChapterStatus] = useState("draft");

  const { value: title, setValue: setTitle, clearAutosave: clearTitleAutosave } = useAutosave("", { key: `draft-title-${id}` });
  const { value: content, setValue: setContent, isSaved, lastSaved, clearAutosave: clearContentAutosave } = useAutosave("", { key: `draft-content-${id}` });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    async function fetchStoryMeta() {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (!res.ok) throw new Error("Failed to load story details");
        const data = await res.json();
        setStory(data.story);

        const isAuthor = 
          data.story?.authorId?.toString() === session?.user?.id || 
          data.story?.author?._id === session?.user?.id;

        if (session && !isAuthor) {
          router.push(`/stories/${id}`);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading story details");
      } finally {
        setFetchingStory(false);
      }
    }

    if (authStatus === "authenticated" && session?.user?.id) {
      fetchStoryMeta();
    }
  }, [id, session, authStatus, router]);

  const wordCount = content.trim() ? content.trim().split(/\\s+/).length : 0;
  const charCount = content.length;
  const readingTime = Math.ceil(wordCount / 200);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/stories/${id}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          content,
          status: chapterStatus,
          wordCount
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish chapter");
      }
      
      clearTitleAutosave();
      clearContentAutosave();
      router.push(`/stories/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || fetchingStory) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className={`mx-auto w-full flex-grow px-6 py-12 transition-all duration-300 ${isAiOpen ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="flex items-center justify-between mb-6">
          <Link href={`/stories/${id}`} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Story Details
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {isSaved ? (
                <span className="flex items-center gap-1"><Save className="h-3 w-3" /> Saved locally</span>
              ) : (
                <span className="flex items-center gap-1"><CloudOff className="h-3 w-3" /> Unsaved changes...</span>
              )}
              {lastSaved && <span>({lastSaved.toLocaleTimeString()})</span>}
            </div>
            
            <button 
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full transition-all border ${isAiOpen ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-900/20' : 'bg-white dark:bg-zinc-900 text-blue-600 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800'}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isAiOpen ? "Close AI Suite" : "AI Author Suite"}
            </button>
          </div>
        </div>

        <div className={`grid gap-6 transition-all duration-500 ${isAiOpen ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-sm ${isAiOpen ? 'lg:col-span-2' : ''}`}>
            <div className="flex flex-col gap-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Drafting for: {story?.title || "Story"}
              </span>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-zinc-900 dark:text-white" />
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">Craft New Chapter</h1>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="chapterTitle" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Chapter Title
                </label>
                <input
                  id="chapterTitle"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Chapter 1: The Gathering Storm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Chapter Content
                  </label>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} chars</span>
                  </div>
                </div>
                <MarkdownEditor 
                  value={content} 
                  onChange={setContent} 
                  placeholder="Write your story's next epic chapter using Markdown..."
                  minHeight="500px"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setChapterStatus("draft")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${chapterStatus === "draft" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => setChapterStatus("published")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${chapterStatus === "published" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                >
                  Publish Immediately
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => router.push(`/stories/${id}`)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title || !content}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold text-white hover:opacity-90 px-8"
                >
                  {loading ? "Saving..." : (chapterStatus === "draft" ? "Save Draft" : "Publish")}
                </Button>
              </div>
            </div>
          </form>
        </div>
        
        {isAiOpen && (
          <div className="lg:col-span-1 h-[calc(100vh-12rem)] sticky top-24">
            <AiAssistantSidebar 
              content={content} 
              onSuggestionAccept={(suggestion) => {
                setContent(prev => prev + "\n\n" + suggestion);
              }} 
            />
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
