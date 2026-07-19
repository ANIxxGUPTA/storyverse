"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, BookOpen, Heart, Eye, ArrowUpDown, Tag, Sparkles } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const GENRES = ["All", "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Adventure", "Drama", "Comedy", "Fiction"];
const POPULAR_TAGS = ["magic", "space", "cyberpunk", "love", "detective", "hero", "rebellion", "epic", "daily", "survival"];

interface Author {
  _id: string;
  username: string;
  image?: string;
}

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  genre: string;
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  author: Author;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get("genre") || "All");
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "recent");
  const [isSemantic, setIsSemantic] = useState(false);
  
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("search", query);
      if (selectedGenre && selectedGenre !== "All") params.append("genre", selectedGenre);
      if (selectedTag) params.append("tag", selectedTag);
      if (selectedSort) params.append("sort", selectedSort);

      const res = await fetch(`/api/stories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [selectedGenre, selectedTag, selectedSort, searchParams]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSemantic && query) {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: query })
        });
        const data = await res.json();
        if (data.recommendations) {
          setStories(data.recommendations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      const params = new URLSearchParams(searchParams);
      if (query) params.set("search", query);
      else params.delete("search");
      router.replace(`/search?${params.toString()}`);
    }
  };

  const handleClearFilters = () => {
    setQuery("");
    setSelectedGenre("All");
    setSelectedTag("");
    setSelectedSort("recent");
    router.replace("/search");
  };

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
        <BookOpen className="h-16 w-16 text-white/20 drop-shadow-sm" />
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 flex-grow">
      {/* Header Info */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pb-6 border-b border-zinc-200 dark:border-zinc-900">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-zinc-900 dark:text-white" />
            Explore Stories
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Search across user-published titles, genres, and tag directories.
          </p>
        </div>

        {/* Total found status */}
        <div className="text-xs text-zinc-500 font-semibold bg-zinc-100/60 dark:bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 self-start md:self-auto">
          {stories.length} {stories.length === 1 ? "Story" : "Stories"} Found
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        {/* Left Side Filters Pane */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-300 dark:border-zinc-800/80">
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-zinc-900 dark:text-white" />
                Filters
              </span>
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
              >
                Reset All
              </button>
            </div>

            {/* Genres list */}
            <div className="mt-5 space-y-3">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Genre</span>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`rounded-lg px-2.5 py-1 text-xs transition ${
                      selectedGenre === genre
                        ? "bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-800 hover:text-zinc-900 dark:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular tags list */}
            <div className="mt-6 space-y-3">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trending Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition ${
                      selectedTag === tag
                        ? "bg-indigo-600 text-zinc-900 dark:text-white font-semibold"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-800 hover:text-zinc-900 dark:text-white"
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting toggler */}
            <div className="mt-6 space-y-3">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sort Results</span>
              <div className="relative">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none transition focus:border-zinc-900 dark:focus:border-white"
                >
                  <option value="recent">Recently Published</option>
                  <option value="views">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-2.5 h-3 w-3 text-zinc-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Search results panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar input form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={isSemantic ? "Describe a concept or theme (e.g. 'A dystopian world with hope')" : "Search stories by title or keywords..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full rounded-xl border ${isSemantic ? 'border-purple-500/50 focus:border-purple-500 shadow-sm shadow-purple-500/10' : 'border-zinc-300 dark:border-zinc-800 focus:border-zinc-700'} bg-zinc-100/40 dark:bg-zinc-900/40 py-3 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none transition`}
              />
              {isSemantic ? (
                <Sparkles className="absolute left-3.5 top-3.5 h-4 w-4 text-purple-500" />
              ) : (
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSemantic(!isSemantic)}
              className={`px-4 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${isSemantic ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
              title="Toggle Vibe Search"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Find by Vibe</span>
            </button>
            <Button type="submit" className={`${isSemantic ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold px-6 transition`}>
              Search
            </Button>
          </form>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
            </div>
          ) : stories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 py-20 text-center">
              <BookOpen className="h-12 w-12 text-zinc-800" />
              <h3 className="mt-4 font-semibold text-zinc-700 dark:text-zinc-300">No stories match your criteria</h3>
              <p className="mt-1.5 text-xs text-zinc-500 max-w-xs">
                Try refining your keywords, changing the genre, or resetting filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story, idx) => {
                const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
                return (
                  <Link
                    key={story._id}
                    href={`/stories/${story._id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-100/30 dark:bg-zinc-900/30 transition duration-200"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-white dark:bg-zinc-950">
                      <StoryCover coverImage={story.coverImage} title={story.title} index={idx} />
                      <div className="absolute top-2.5 right-2.5 rounded-full bg-white/80 dark:bg-zinc-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-400 border border-blue-500/25">
                        {story.genre || "Fiction"}
                      </div>
                    </div>
                    
                    <div className="flex flex-grow flex-col justify-between p-4">
                      <div>
                        <h3 className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                          {story.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {story.description}
                        </p>
                      </div>

                      {/* Info footer */}
                      <div className="mt-5 border-t border-zinc-200 dark:border-zinc-900 pt-3">
                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span className="text-zinc-500 truncate max-w-[100px]">
                            By {story.author?.username || "Unknown"}
                          </span>
                          <div className="flex items-center gap-2.5 text-zinc-500">
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3 w-3 text-red-500" />
                              {likedCount}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-3 w-3 text-zinc-900 dark:text-white" />
                              {story.views || 0}
                            </span>
                          </div>
                        </div>

                        {/* Display tags */}
                        {story.tags && story.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {story.tags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] px-1 py-0.2"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <Suspense fallback={
        <div className="flex flex-grow items-center justify-center">
          <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  );
}
