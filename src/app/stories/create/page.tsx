"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function CreateStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, coverImage, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create story");
      }

      router.push(`/stories/${data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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

      <main className="mx-auto w-full max-w-2xl flex-grow px-6 py-12">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/80">
            <BookOpen className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-zinc-100">Create New Story</h1>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Story Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. The Legend of the Lost Realm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="coverImage" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Cover Image URL <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="coverImage"
                  type="url"
                  className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. https://images.unsplash.com/... (or leave blank for custom cover)"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Story Description / Synopsis
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  className="mt-2 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none leading-relaxed"
                  placeholder="Summarize your story here. Hook your readers with an exciting synopsis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-800/80 pt-6">
              <Link href="/dashboard">
                <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-amber-600 font-semibold text-white hover:opacity-90 transition duration-200"
              >
                {loading ? "Creating story..." : "Create Story"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
