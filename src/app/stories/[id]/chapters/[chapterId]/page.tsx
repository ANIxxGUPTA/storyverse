"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  content: string;
}

interface Story {
  _id: string;
  title: string;
}

interface NavigationChapter {
  _id: string;
  title: string;
}

export default function ReadingPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const params = use(paramsPromise);
  const { id, chapterId } = params;
  const router = useRouter();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [prevChapter, setPrevChapter] = useState<NavigationChapter | null>(null);
  const [nextChapter, setNextChapter] = useState<NavigationChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchChapterDetails() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/stories/${id}/chapters/${chapterId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Chapter not found");
          throw new Error("Failed to load chapter content");
        }
        const data = await res.json();
        setChapter(data.chapter);
        setStory(data.story);
        setPrevChapter(data.prevChapter);
        setNextChapter(data.nextChapter);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchChapterDetails();
  }, [id, chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error || !chapter || !story) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-zinc-300">Content unavailable</h2>
          <p className="mt-2 text-sm text-zinc-500">{error || "Unable to display this chapter."}</p>
          <Link href={`/stories/${id}`} className="mt-6">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Back to Story</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-8">
        {/* Navigation to Story Details */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <Link href={`/stories/${id}`} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Table of Contents
          </Link>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            {story.title}
          </span>
        </div>

        {/* Reader Container */}
        <article className="mt-12 py-6">
          {/* Header */}
          <header className="text-center">
            <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
              Chapter {chapter.chapterNumber}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl font-serif">
              {chapter.title}
            </h1>
            <div className="mt-8 flex justify-center">
              <div className="h-1 w-12 rounded bg-zinc-800" />
            </div>
          </header>

          {/* Reading body */}
          <div className="mt-12 text-zinc-300 leading-relaxed font-serif text-base sm:text-lg space-y-6 max-w-2xl mx-auto whitespace-pre-wrap select-text selection:bg-orange-500/30 selection:text-orange-200">
            {chapter.content}
          </div>
        </article>

        {/* Navigation footer */}
        <div className="mt-20 border-t border-zinc-900 pt-8 flex items-center justify-between">
          <div>
            {prevChapter ? (
              <Link href={`/stories/${id}/chapters/${prevChapter._id}`}>
                <Button variant="outline" className="border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  <div className="text-left hidden sm:block">
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Previous</span>
                    <span className="block text-xs font-semibold max-w-[120px] truncate">{prevChapter.title}</span>
                  </div>
                </Button>
              </Link>
            ) : (
              <div className="w-10 h-1" />
            )}
          </div>

          <div className="text-xs text-zinc-500">
            Chapter {chapter.chapterNumber}
          </div>

          <div>
            {nextChapter ? (
              <Link href={`/stories/${id}/chapters/${nextChapter._id}`}>
                <Button className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 flex items-center gap-1">
                  <div className="text-right hidden sm:block">
                    <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Next</span>
                    <span className="block text-xs font-semibold max-w-[120px] truncate">{nextChapter.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-orange-500" />
                </Button>
              </Link>
            ) : (
              <Link href={`/stories/${id}`}>
                <Button className="bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold flex items-center gap-1">
                  <span>Story Details</span>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
