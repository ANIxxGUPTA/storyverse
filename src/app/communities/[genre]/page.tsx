"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Send, Users, ShieldAlert, Sparkles, MessageSquare, Heart, Share2, Eye } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  likes: string[];
  views: number;
  author: {
    username: string;
  };
}

interface Post {
  _id: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: any[];
  author: {
    _id: string;
    username: string;
    image?: string;
  };
}

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

export default function GenreCommunityHub({
  params: paramsPromise,
}: {
  params: Promise<{ genre: string }>;
}) {
  const params = use(paramsPromise);
  const { genre } = params;
  const { data: session } = useSession();
  const router = useRouter();

  const config = GENRE_MAP[genre.toLowerCase()] || {
    title: `${genre} Community`,
    genreKey: genre,
    desc: `Gathering hub for ${genre} enthusiasts and writers.`,
    gradient: "from-blue-500 to-indigo-650",
  };

  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHubData = async () => {
    try {
      // Fetch genre stories
      const storiesRes = await fetch(`/api/stories?genre=${config.genreKey}`);
      const storiesData = await storiesRes.json();
      setStories(storiesData);

      // Fetch community posts
      const postsRes = await fetch(`/api/posts?communityGenre=${config.genreKey}`);
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err) {
      console.error("Failed to load community hub details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();

    // Connect to Live SSE stream
    const sse = new EventSource(`/api/live/chat?genre=${config.genreKey}`);
    sse.onmessage = (event) => {
      try {
        const newPost = JSON.parse(event.data);
        setPosts((prev) => {
          // Avoid duplicating the post if we just created it
          if (prev.some((p) => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
      } catch (err) {
        // Ignored (heartbeats or parse errors)
      }
    };

    return () => {
      sse.close();
    };
  }, [genre]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    if (!postContent.trim()) return;

    setSubmittingPost(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent,
          communityGenre: config.genreKey,
        }),
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => {
          if (prev.some(p => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
        setPostContent("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPosts(
          posts.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
        );
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleSharePost = (postId: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/feed#post-${postId}`;
      navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      {/* Hero Banner */}
      <div className={`w-full bg-zinc-200 dark:bg-zinc-800 py-16 text-center shadow-sm relative overflow-hidden`}>
        <div className="relative mx-auto max-w-4xl px-6">
          <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-4">
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

      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-12">
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
                <Link href="/stories/create" className="mt-4 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white hover:bg-blue-600">
                    Write Story
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {stories.map((story, idx) => {
                  const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
                  return (
                    <Link
                      key={story._id}
                      href={`/stories/${story._id}`}
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

            {/* Posting text box */}
            {session ? (
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
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-4 text-center">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Please log in to write posts in this community.</p>
                <Link href="/login" className="mt-3 inline-block">
                  <Button size="xs" variant="outline" className="border-zinc-300 dark:border-zinc-800 text-xs">
                    Login
                  </Button>
                </Link>
              </div>
            )}

            {/* Feed chat list */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {posts.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 dark:text-zinc-400 text-xs">
                  Nothing posted here yet. Start the conversation!
                </div>
              ) : (
                posts.map((post) => {
                  const likedCount = Array.isArray(post.likes) ? post.likes.length : 0;
                  const hasLiked = session && post.likes.includes(session.user.id);
                  return (
                    <div
                      key={post._id}
                      className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                          {post.author?.image ? (
                            <img src={post.author.image} alt="User" className="h-full w-full rounded-full object-cover" />
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

      <Footer />
    </div>
  );
}
