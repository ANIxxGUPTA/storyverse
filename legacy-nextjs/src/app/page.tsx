import Link from "next/link";
import { BookOpen, PenTool, Book, Heart, Eye, FolderHeart, Tag, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
  genre?: string;
  tags?: string[];
  likes?: string[];
  views?: number;
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
      "from-blue-600 to-indigo-700",
      "from-indigo-500 to-violet-700",
      "from-sky-400 to-blue-600",
      "from-emerald-400 to-teal-600",
      "from-rose-400 to-red-600",
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} p-4 transition duration-300 group-hover:scale-105`}>
        <Book className="h-16 w-16 text-white/20 drop-shadow-sm" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 py-24 text-center sm:py-32">

          <div className="mx-auto flex max-w-4xl flex-col items-center">

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-7xl drop-shadow-sm">
              Read, Write, and Share{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
                Stories
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
              Discover self-published tales, build personalized reading lists, join genre community hubs, and track creator progress dynamically.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="#discover">
                <button className="h-11 rounded-lg bg-blue-600 px-8 font-semibold text-white hover:bg-blue-700 transition duration-200 shadow-md">
                  Start Reading
                </button>
              </Link>

              <Link href="/dashboard">
                <button className="h-11 rounded-lg border border-blue-600/30 bg-blue-600/10 px-8 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition duration-200 backdrop-blur-sm">
                  Start Writing
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Communities Showcase Quick Jumps */}
        <section className="mx-auto max-w-7xl px-6 py-6 border-b border-zinc-200 dark:border-zinc-900/60">
          <div className="flex items-center gap-2 pb-4">
            <FolderHeart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Genre Communities</h2>
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mt-4">
            {[
              { id: "fantasy", name: "Fantasy", style: "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
              { id: "sci-fi", name: "Sci-Fi", style: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-700 dark:text-blue-300" },
              { id: "romance", name: "Romance", style: "border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-700 dark:text-rose-300" },
              { id: "mystery", name: "Mystery", style: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300" },
              { id: "thriller", name: "Thriller", style: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-700 dark:text-red-300" },
              { id: "adventure", name: "Adventure", style: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
            ].map((c) => (
              <Link key={c.id} href={`/communities/${c.id}`}>
                <div className={`rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 ${c.style}`}>
                  <span className="block text-xs font-semibold">{c.name} Hub</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Discover Stories Section */}
        <section id="discover" className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-900/80 pb-4">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">Discover Stories</h2>
          </div>

          {stories.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 py-16 text-center">
              <BookOpen className="h-10 w-10 text-zinc-500" />
              <h3 className="mt-4 text-base font-semibold text-zinc-700 dark:text-zinc-300">No stories yet</h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-xs">
                Be the very first story creator! Start publishing your chapters today.
              </p>
              <Link href="/dashboard" className="mt-5">
                <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 transition">
                  <PenTool className="h-3.5 w-3.5" />
                  Write a Story
                </button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, idx) => {
                const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
                return (
                  <Link
                    key={story._id}
                    href={`/stories/${story._id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 transition hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100/40 dark:bg-zinc-900/40"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-white dark:bg-zinc-950">
                      <StoryCover coverImage={story.coverImage} title={story.title} index={idx} />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 right-3 rounded-full bg-blue-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        {story.genre || "Fiction"}
                      </div>
                    </div>
                    <div className="flex flex-grow flex-col justify-between p-5">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                          {story.title}
                        </h3>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {story.description}
                        </p>
                      </div>
                      <div className="mt-6 border-t border-zinc-200 dark:border-zinc-900/60 pt-4 flex items-center justify-between text-xs text-zinc-500">
                        <span className="hover:text-zinc-700 dark:text-zinc-300 transition">
                          By {story.author?.username || "Unknown"}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            {likedCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-zinc-900 dark:text-white" />
                            {story.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}