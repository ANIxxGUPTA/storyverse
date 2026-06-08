"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText, Loader2, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Story {
  title: string;
  author: string;
}

export default function CreateChapterPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingStory, setFetchingStory] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchStoryMeta() {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (!res.ok) throw new Error("Failed to load story details");
        const data = await res.json();
        setStory(data.story);

        // Verify that the logged-in user is indeed the author
        if (session && data.story.author._id !== session.user.id) {
          router.push(`/stories/${id}`);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading story details");
      } finally {
        setFetchingStory(false);
      }
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchStoryMeta();
    }
  }, [id, session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/stories/${id}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish chapter");
      }

      router.push(`/stories/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || fetchingStory) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-12">
        <Link href={`/stories/${id}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Story details
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-1.5 pb-4 border-b border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Drafting for: {story?.title || "Story"}
            </span>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <h1 className="text-2xl font-bold text-zinc-100">Publish New Chapter</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="chapterTitle" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Chapter Title
                </label>
                <input
                  id="chapterTitle"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Chapter 1: The Gathering Storm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="content" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Chapter Content
                  </label>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {content.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  id="content"
                  required
                  rows={16}
                  className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y leading-relaxed font-serif"
                  placeholder="Write your story's next epic chapter here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800/80 pt-6">
              <Link href={`/stories/${id}`}>
                <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white">
                  Cancel Draft
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-purple-600 font-semibold text-white hover:opacity-90 transition duration-200"
              >
                {loading ? "Publishing..." : "Publish Chapter"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
