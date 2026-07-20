import { useParams, Link } from "react-router-dom";
import { BookOpen, Book, ArrowLeft, Heart, Eye, FolderHeart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetch } from "../lib/hooks/useFetch";
import { useAuth } from "../context/AuthContext";

export default function StoryDetail() {
  const { id = "" } = useParams();
  const { user } = useAuth();

  const { data, loading } = useFetch<any>(`/api/stories/${id}`);
  const story = data?.story || null;
  const chapters = data?.chapters || [];

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center text-center py-20">
        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300">Story not found</h2>
        <p className="mt-2 text-sm text-zinc-500">The story you are trying to view does not exist.</p>
        <Link to="/" className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
  const hasLiked = user && story.likes?.includes(user._id);

  const StoryCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
    if (coverImage && coverImage.trim() !== "") {
      return (
        <img
          src={coverImage}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
        <Book className="h-24 w-24 text-white/20 drop-shadow-sm" />
      </div>
    );
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-8">
      <Link to="/" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Stories
      </Link>

      <div className="mt-6 flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-lg shadow-black/40">
            <StoryCover coverImage={story.coverImage} title={story.title} />
          </div>
        </div>

        <div className="flex flex-col flex-grow space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-900 dark:text-white uppercase font-bold tracking-wider">
                {story.genre || "Fiction"}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                <Eye className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                {story.views || 0} views
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              {story.title}
            </h1>

            <div className="flex items-center gap-2">
              <Link to={`/profile/${story.author?._id || ""}`} className="group flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-zinc-900 dark:group-hover:text-white transition">
                  {story.author?.image ? (
                    <img src={story.author.image} alt="User" loading="lazy" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    story.author?.username?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:text-zinc-200 transition">
                  By <strong className="font-semibold">{story.author?.username || "Unknown"}</strong>
                </span>
              </Link>
            </div>

            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {story.tags.map((tag: string, tIdx: number) => (
                  <Link key={tIdx} to={`/search?tag=${tag}`}>
                    <span className="rounded bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-900/30 text-xs text-indigo-400 px-2 py-0.5 cursor-pointer transition">
                      #{tag}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Synopsis</h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {story.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6">
            {chapters.length > 0 ? (
              <Button className="bg-blue-600 hover:bg-blue-700 font-semibold text-white hover:opacity-90 transition px-6 flex items-center gap-1.5">
                <Play className="h-4 w-4 fill-white" />
                Start Reading
              </Button>
            ) : (
              <Button disabled className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-900">
                No Chapters Published
              </Button>
            )}

            <button
              className={`flex items-center gap-1.5 border rounded-lg px-4 py-2 text-xs font-semibold transition ${
                hasLiked
                  ? "bg-red-900/20 border-red-500/30 text-red-500"
                  : "border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-700 hover:text-zinc-900 dark:text-white"
              }`}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500" : ""}`} />
              <span>{likedCount} Likes</span>
            </button>

            <button className="flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-700 hover:text-zinc-900 dark:text-white rounded-lg px-4 py-2 text-xs font-semibold transition">
              <FolderHeart className="h-4 w-4" />
              <span>Add to List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-3 mb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
            <BookOpen className="h-5 w-5 text-zinc-900 dark:text-white" />
            Table of Contents
          </h2>
          <span className="text-xs text-zinc-500 font-semibold uppercase">
            {chapters.length} Chapters
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter: any) => (
            <div
              key={chapter._id}
              className="group flex flex-col justify-between p-4 transition rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start gap-3 flex-grow">
                <span className="font-serif text-sm font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition mt-0.5">
                  {chapter.chapterNumber}.
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-2">
                  {chapter.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
