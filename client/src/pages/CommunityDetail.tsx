import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Send, MessageSquare, Heart, Share2, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { useStories } from "../lib/hooks/useStories";
import { useFeed } from "../lib/hooks/useFeed";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const GENRE_MAP: Record<string, { title: string; genreKey: string; desc: string; gradient?: string }> = {
  fantasy: {
    title: "Fantasy Haven",
    genreKey: "Fantasy",
    desc: "Spells, magic swords, mythical beasts, and realms beyond imagination.",
    gradient: "from-indigo-600 to-indigo-700",
  },
  "sci-fi": {
    title: "Sci-Fi Nexus",
    genreKey: "Sci-Fi",
    desc: "Space operas, cyberpunk grids, AI rebellions, and distant stars.",
    gradient: "from-cyan-600 to-blue-700",
  },
  romance: {
    title: "Romance Oasis",
    genreKey: "Romance",
    desc: "Wholesome relationships, dramatic encounters, and heart-melting stories.",
    gradient: "from-pink-500 to-rose-600",
  },
  mystery: {
    title: "Mystery Vault",
    genreKey: "Mystery",
    desc: "Clues, noir detectives, hidden truths, and plot twists.",
    gradient: "from-sky-500 to-blue-600",
  },
  thriller: {
    title: "Thriller Station",
    genreKey: "Thriller",
    desc: "High stakes, psychological loops, suspense, and immediate action.",
    gradient: "from-red-655 to-red-800",
  },
  adventure: {
    title: "Adventure Guild",
    genreKey: "Adventure",
    desc: "Lost realms, pirate voyages, ancient ruins, and survival."
  },
};

export default function CommunityDetail() {
  const { genre = "" } = useParams();
  const { user } = useAuth();

  const config = GENRE_MAP[genre.toLowerCase()] || {
    title: `${genre} Community`,
    genreKey: genre,
    desc: `Gathering hub for ${genre} enthusiasts and writers.`,
    gradient: "from-blue-500 to-indigo-650",
  };

  const { stories, loading: storiesLoading } = useStories({ genre });
  const { feed: posts, loading: feedLoading, refetch } = useFeed({ genre: config.genreKey });
  
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const loading = storiesLoading || feedLoading;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setSubmittingPost(true);
    try {
      await apiFetch("/api/feed", {
        method: "POST",
        body: JSON.stringify({ content: postContent, communityGenre: config.genreKey }),
      });
      setPostContent("");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    try {
      await apiFetch(`/api/feed/${postId}/like`, { method: "POST" });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSharePost = (postId: string) => {
    const url = `${window.location.origin}/feed#post-${postId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-transparent w-full">
      {/* Hero Banner */}
      <div className={`w-full bg-zinc-200 dark:bg-zinc-800 py-16 text-center shadow-sm relative overflow-hidden`}>
        <div className="relative mx-auto max-w-4xl px-6">
          <Link to="/communities" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Communities
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-zinc-900 dark:text-white">
            {config.title}
          </h1>
          <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-200 max-w-xl mx-auto leading-relaxed">
            {config.desc}
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left Column: Stories in this Genre */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-900">
              <BookOpen className="h-5 w-5 text-zinc-900 dark:text-white" />
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Featured {config.genreKey} Serials</h2>
            </div>

            {stories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 py-16 text-center">
                <BookOpen className="h-10 w-10 text-zinc-500 dark:text-zinc-400 mx-auto" />
                <h3 className="mt-4 font-semibold text-zinc-700 dark:text-zinc-300">No stories in this genre yet</h3>
                <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto">
                  Be the first one to create a {config.genreKey} legend! Go to write.
                </p>
                <Link to="/dashboard" className="mt-4 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-600">
                    Write Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {stories.map((story: any) => {
                  const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
                  return (
                    <Link
                      key={story._id}
                      to={`/stories/${story._id}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100/30 dark:bg-zinc-900/30 transition duration-200"
                    >
                      <div className="p-5">
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                          {story.title}
                        </h4>
                        <p className="mt-2.5 text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">
                          {story.description}
                        </p>
                      </div>

                      <div className="border-t border-zinc-200 dark:border-zinc-900/60 p-4 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>By {story.author?.username || "Unknown"}</span>
                        <div className="flex items-center gap-2.5">
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
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Local Feed Chat */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-900">
              <MessageSquare className="h-5 w-5 text-zinc-900 dark:text-white" />
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Community Chat</h2>
            </div>

            <form onSubmit={handleCreatePost} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/60 p-4">
              <textarea
                required
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={`Share thoughts with fellow ${config.genreKey} fans...`}
                className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none resize-none leading-relaxed"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  type="submit"
                  disabled={submittingPost}
                  size="sm"
                  className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-300 text-white dark:text-zinc-900 font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="h-3 w-3" />
                  <span>{submittingPost ? "Posting..." : "Post to Hub"}</span>
                </Button>
              </div>
            </form>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {posts.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 dark:text-zinc-400 text-xs">
                  Nothing posted here yet. Start the conversation!
                </div>
              ) : (
                posts.map((post: any) => {
                  const likedCount = Array.isArray(post.likes) ? post.likes.length : 0;
                  const hasLiked = user && post.likes?.includes(user._id);
                  return (
                    <div
                      key={post._id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                          {post.author?.image ? (
                            <img src={post.author.image} alt="User" className="h-full w-full rounded-full object-cover" loading="lazy" />
                          ) : (
                            post.author?.username?.[0]?.toUpperCase()
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{post.author?.username || "Anonymous"}</span>
                      </div>

                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-900/40">
                        <button
                          onClick={() => handleLikePost(post._id)}
                          className={`flex items-center gap-1 transition ${hasLiked ? "text-red-500" : "hover:text-red-400"}`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
                          <span>{likedCount}</span>
                        </button>

                        <button
                          onClick={() => handleSharePost(post._id)}
                          className="flex items-center gap-1 hover:text-cyan-400 transition"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>{copiedId === post._id ? "Copied" : "Share"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
