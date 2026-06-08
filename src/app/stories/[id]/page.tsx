"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, User, Play, Book } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Author {
  _id: string;
  username: string;
  image?: string;
  bio?: string;
}

interface Story {
  _id: string;
  title: string;
  coverImage?: string;
  description: string;
  views: number;
  likes: number;
  createdAt: string;
  author: Author;
}

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  createdAt: string;
}

export default function StoryDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { id } = params;
  const { data: session } = useSession();
  const router = useRouter();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStoryDetails() {
      try {
        const res = await fetch(`/api/stories/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Story not found");
          throw new Error("Failed to fetch story details");
        }
        const data = await res.json();
        setStory(data.story);
        setChapters(data.chapters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchStoryDetails();
  }, [id]);

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

  if (error || !story) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-zinc-300">Story not found</h2>
          <p className="mt-2 text-sm text-zinc-500">{error || "The story you are trying to view does not exist."}</p>
          <Link href="/" className="mt-6">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = session?.user?.id === story.author._id;

  // Render Cover Fallback using gradients
  const StoryCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
    if (coverImage && coverImage.trim() !== "") {
      return (
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-orange-500 to-purple-600 p-6">
        <div className="flex justify-between">
          <Book className="h-6 w-6 text-white/80" />
          <span className="text-[10px] uppercase tracking-wider text-white/50">StoryVerse</span>
        </div>
        <span className="font-serif text-2xl font-bold leading-tight text-white drop-shadow-md">
          {title}
        </span>
        <div className="h-1.5 w-1/4 rounded bg-white/40" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-8">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Stories
        </Link>

        {/* Story Banner / Details Section */}
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {/* Cover Art */}
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 md:col-span-1 shadow-lg shadow-black/40">
            <StoryCover coverImage={story.coverImage} title={story.title} />
          </div>

          {/* Book Info */}
          <div className="flex flex-col justify-between md:col-span-2 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-4xl">
                {story.title}
              </h1>

              {/* Author profile link */}
              <div className="flex items-center gap-2">
                <Link href={`/profile/${story.author._id}`} className="group flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200 group-hover:bg-orange-500 group-hover:text-white transition">
                    {story.author.image ? (
                      <img src={story.author.image} alt={story.author.username} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      story.author.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition">
                    By <strong className="font-semibold">{story.author.username}</strong>
                  </span>
                </Link>
              </div>



              <div className="pt-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Synopsis</h3>
                <p className="mt-2 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {story.description}
                </p>
              </div>
            </div>

            {/* Actions for Reading */}
            <div className="flex flex-wrap items-center gap-3 pt-6">
              {chapters.length > 0 ? (
                <Link href={`/stories/${story._id}/chapters/${chapters[0]._id}`}>
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-600 font-semibold text-white hover:opacity-90 transition px-6 flex items-center gap-1.5">
                    <Play className="h-4 w-4 fill-white" />
                    Start Reading
                  </Button>
                </Link>
              ) : (
                <Button disabled className="bg-zinc-800 text-zinc-500">
                  No Chapters Published
                </Button>
              )}

              {isAuthor && (
                <Link href={`/stories/${story._id}/chapters/create`}>
                  <Button variant="outline" className="border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-800">
                    <Plus className="mr-1.5 h-4 w-4 text-orange-500" />
                    Add Chapter
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <section className="mt-16 border-t border-zinc-900 pt-10">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Table of Contents
            </h2>
            <span className="text-xs text-zinc-500 font-semibold uppercase">
              {chapters.length} Chapters
            </span>
          </div>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-zinc-700" />
              <h3 className="mt-4 text-sm font-medium text-zinc-400">No chapters yet</h3>
              {isAuthor ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Create your first chapter to make this story available to readers.
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-500">
                  The author has not published any chapters yet. Stay tuned!
                </p>
              )}

              {isAuthor && (
                <Link href={`/stories/${story._id}/chapters/create`} className="mt-4">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Publish First Chapter
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 divide-y divide-zinc-900">
              {chapters.map((chapter) => (
                <Link
                  key={chapter._id}
                  href={`/stories/${story._id}/chapters/${chapter._id}`}
                  className="group flex items-center justify-between py-4 hover:px-2 transition rounded-lg hover:bg-zinc-900/40"
                >
                  <div className="flex items-center">
                    <span className="w-8 font-serif text-sm font-semibold text-zinc-600 group-hover:text-orange-500">
                      {chapter.chapterNumber}.
                    </span>
                    <span className="font-medium text-zinc-300 group-hover:text-zinc-100 transition">
                      {chapter.title}
                    </span>
                  </div>

                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// Loader helper
function Loader2({ className }: { className?: string }) {
  return <BookOpen className={`animate-pulse ${className}`} />;
}
