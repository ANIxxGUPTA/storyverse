import Link from "next/link";
import { BookOpen, PenTool, Book } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import User from "@/models/User"; // Required for Mongoose populate to work

export const dynamic = "force-dynamic";

interface Author {
  _id: string;
  username: string;
  image?: string;
}

interface IStory {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: Date;
  author: Author;
}

export default async function HomePage() {
  await connectDB();

  // Fetch all stories (sorted by createdAt, limit 9)
  const storiesRaw = await Story.find({})
    .populate("author", "username image")
    .sort({ createdAt: -1 })
    .limit(9);

  const stories = JSON.parse(JSON.stringify(storiesRaw)) as IStory[];

  // Fallback Cover image component using gradients
  const StoryCover = ({ coverImage, title, index }: { coverImage?: string; title: string; index: number }) => {
    if (coverImage && coverImage.trim() !== "") {
      return (
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      );
    }

    const gradients = [
      "from-orange-500 to-amber-600",
      "from-purple-600 to-indigo-700",
      "from-pink-500 to-rose-600",
      "from-emerald-500 to-teal-600",
      "from-cyan-500 to-blue-600",
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <div className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${gradient} p-4 transition duration-300 group-hover:scale-105`}>
        <div className="flex justify-between">
          <Book className="h-5 w-5 text-white/70" />
          <span className="text-[10px] uppercase tracking-wider text-white/50">StoryVerse</span>
        </div>
        <span className="font-serif text-lg font-bold leading-tight text-white drop-shadow-md">
          {title}
        </span>
        <div className="h-1 w-1/3 rounded bg-white/40" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32">
          {/* Neon background glows */}
          <div className="absolute top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[128px]" />
          <div className="absolute top-10 left-1/3 -z-10 h-72 w-72 rounded-full bg-orange-500/10 blur-[120px]" />

          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-400 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              Writers • Readers • Communities
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
              Read, Write, and Share{" "}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Stories
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              Discover self-published tales, publish your own serial chapters, and share small snippets with a growing community of storytelling fans.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="#discover">
                <button className="h-11 rounded-lg bg-white px-8 font-semibold text-black hover:bg-zinc-200 transition duration-200 shadow-md">
                  Start Reading
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="h-11 rounded-lg border border-zinc-700 bg-zinc-900/40 px-8 font-semibold text-zinc-200 hover:bg-zinc-800/60 transition duration-200 backdrop-blur-sm">
                  Start Writing
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Unified Discover Stories Section */}
        <section id="discover" className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">Discover Stories</h2>
          </div>

          {stories.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 py-16 text-center">
              <BookOpen className="h-10 w-10 text-zinc-600" />
              <h3 className="mt-4 text-base font-semibold text-zinc-300">No stories yet</h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-xs">
                Be the very first story creator! Start publishing your chapters today.
              </p>
              <Link href="/dashboard" className="mt-5">
                <button className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600 transition">
                  <PenTool className="h-3.5 w-3.5" />
                  Write a Story
                </button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, idx) => (
                <Link
                  key={story._id}
                  href={`/stories/${story._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/20 transition hover:border-zinc-800 hover:bg-zinc-900/40"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                    <StoryCover coverImage={story.coverImage} title={story.title} index={idx} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="flex flex-grow flex-col justify-between p-5">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-100 group-hover:text-orange-400 transition line-clamp-1">
                        {story.title}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {story.description}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
                      <span className="hover:text-zinc-300 transition">
                        By {story.author?.username || "Unknown"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-12 text-center text-zinc-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-zinc-400">StoryVerse</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} StoryVerse. Built with passion for readers and writers.
          </p>
          <div className="flex gap-4 text-xs">
            <Link href="/" className="hover:text-zinc-300 transition">Home</Link>
            <Link href="/feed" className="hover:text-zinc-300 transition">Feed</Link>
            <Link href="/dashboard" className="hover:text-zinc-350 transition">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}