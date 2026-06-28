"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Loader2, Sparkles, X } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function CreateStoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState("");

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    try {
      const res = await fetch("/api/ai/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, prompt: coverPrompt })
      });
      const data = await res.json();
      if (data.coverUrl) {
        setCoverImage(data.coverUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const GENRES = ["Fiction", "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror"];

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
        body: JSON.stringify({ title, coverImage, description, genre, tags }),
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
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const handleGenerateIdea = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.genre) setGenre(data.genre);
      if (data.tags) setTags(data.tags);
      
      setShowAIAssistant(false);
    } catch (err) {
      console.error("AI Generation Error", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-grow px-6 py-12">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-300 dark:border-zinc-800/80 justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-zinc-900 dark:text-white" />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create New Story</h1>
            </div>
            <Button 
              type="button" 
              onClick={() => setShowAIAssistant(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              AI Story Generator
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Story Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="e.g. The Legend of the Lost Realm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Cover Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter prompt to generate AI cover, or paste a URL..."
                    value={coverPrompt || coverImage}
                    onChange={(e) => {
                      setCoverPrompt(e.target.value);
                      setCoverImage(e.target.value);
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateCover}
                    disabled={isGeneratingCover || !coverPrompt}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-800 transition"
                  >
                    {isGeneratingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                    <span className="text-xs font-semibold">AI Generate</span>
                  </Button>
                </div>
                {coverImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative group bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center min-h-[200px]">
                    <img 
                      src={coverImage} 
                      alt="Cover Preview" 
                      className="w-full max-h-[400px] object-cover transition-opacity duration-300" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                    {!coverImage.startsWith('http') && (
                      <span className="absolute text-xs text-zinc-500">Preview will appear here</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Story Description / Synopsis
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white resize-none leading-relaxed"
                  placeholder="Summarize your story here. Hook your readers with an exciting synopsis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="genre" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Genre
                  </label>
                  <select
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tags" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Tags <span className="text-zinc-500 font-normal">(comma separated)</span>
                  </label>
                  <input
                    id="tags"
                    type="text"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                    placeholder="magic, dragons, epic"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-300 dark:border-zinc-800/80 pt-6">
              <Link href="/dashboard">
                <Button type="button" variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 font-semibold text-white hover:opacity-90 transition duration-200"
              >
                {loading ? "Creating story..." : "Create Story"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* AI Assistant Overlay */}
      {showAIAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowAIAssistant(false)}
              className="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">AI Story Generator</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Stuck? Describe what kind of story you want to write, or just generate a random idea, and let AI set up your title, synopsis, and tags.
            </p>
            <textarea
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none mb-4"
              rows={3}
              placeholder="E.g. A fantasy story about a dragon who loves to bake..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button
              onClick={handleGenerateIdea}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Idea"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
