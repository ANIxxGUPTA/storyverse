"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, BookOpen, User, Sparkles, Loader2, Heart, MessageSquare, Share2, Compass, FolderHeart, Flame, Tag, CheckCircle2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Author {
  _id: string;
  username: string;
  image?: string;
}

interface Comment {
  _id: string;
  author: Author;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  author: Author;
  likes: string[]; // User IDs
  comments?: Comment[];
  createdAt: string;
}

interface StorySuggestion {
  _id: string;
  title: string;
  genre: string;
}

function FeedContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState("");

  // Comment section state
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Sidebar details
  const [suggestedStories, setSuggestedStories] = useState<StorySuggestion[]>([]);
  
  // Notification Toast alert
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      const textarea = document.getElementById("post-textarea");
      textarea?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch posts
        const res = await fetch("/api/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }

        // Fetch suggested stories
        const storiesRes = await fetch("/api/stories");
        if (storiesRes.ok) {
          const storiesData = await storiesRes.json();
          setSuggestedStories(storiesData.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    setPostError("");
    setPublishing(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image: "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post");
      }

      setPosts([data, ...posts]);
      setContent("");
      showToast("Post shared successfully!");
      
      if (searchParams.get("create") === "true") {
        router.replace("/feed");
      }
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
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
          posts.map((post) =>
            post._id === postId ? { ...post, likes: data.likes } : post
          )
        );
        showToast(data.likes.includes(session.user.id) ? "Liked post" : "Unliked post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }

    setOpenCommentsPostId(postId);
    
    // Fetch comments for this post if not fetched
    const targetPost = posts.find(p => p._id === postId);
    if (targetPost && !targetPost.comments) {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      try {
        const res = await fetch(`/api/posts/${postId}/comment`);
        if (res.ok) {
          const commentsData = await res.json();
          setPosts(posts.map(p => p._id === postId ? { ...p, comments: commentsData } : p));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }

    const commentText = commentInputs[postId] || "";
    if (!commentText.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(p => {
          if (p._id === postId) {
            const existingComments = p.comments || [];
            return { ...p, comments: [...existingComments, data.comment] };
          }
          return p;
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        showToast("Comment added!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSharePost = (postId: string) => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/feed#post-${postId}`;
      navigator.clipboard.writeText(shareUrl);
      showToast("Post link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 flex-grow">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-blue-400 shadow-xl shadow-black/40 animate-slideIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid Layout: Feed Main Column + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Feed items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Card */}
          {session ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 backdrop-blur-md shadow-lg shadow-black/10">
              <form onSubmit={handleCreatePost} className="space-y-4">
                {postError && (
                  <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                    {postError}
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 font-bold text-zinc-900 dark:text-white text-xs shadow">
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user.name || "Me"} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      session.user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <textarea
                      id="post-textarea"
                      required
                      rows={3}
                      className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none resize-none leading-relaxed"
                      placeholder="Share a story update, a reading list, or thoughts with the StoryVerse..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-zinc-200 dark:border-zinc-900/60 pt-3">
                  <Button
                    type="submit"
                    disabled={publishing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{publishing ? "Sharing..." : "Share Post"}</span>
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Join StoryVerse to create feed posts and interact with others.</p>
              <div className="mt-4 flex gap-3 justify-center">
                <Link href="/login">
                  <Button size="sm" variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Register</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Feed list */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 py-16 text-center">
                <BookOpen className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
                <h3 className="mt-4 font-semibold text-zinc-600 dark:text-zinc-400">Social feed is quiet</h3>
                <p className="mt-1 text-sm text-zinc-500 max-w-xs">
                  Nobody has posted yet. Type a story update above to break the silence!
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const likedCount = Array.isArray(post.likes) ? post.likes.length : 0;
                const hasLiked = session && post.likes.includes(session.user.id);
                const commentsList = post.comments || [];
                const commentsCount = commentsList.length;

                return (
                  <div
                    key={post._id}
                    id={`post-${post._id}`}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 transition duration-200 hover:border-zinc-300 dark:border-zinc-800 shadow"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.author?._id || ""}`} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-blue-500 hover:text-zinc-900 dark:text-white transition">
                            {post.author?.image ? (
                              <img src={post.author.image} alt={post.author.username} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              post.author?.username?.[0]?.toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-white transition">
                              {post.author?.username || "Anonymous"}
                            </h4>
                            <span className="text-[10px] text-zinc-500 block">
                              {new Date(post.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="mt-4 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Interaction Actions Bar */}
                    <div className="mt-5 border-t border-zinc-200 dark:border-zinc-900 pt-3 flex items-center justify-start gap-6 text-xs text-zinc-500">
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center gap-1.5 transition ${
                          hasLiked ? "text-red-500 font-medium" : "hover:text-red-400"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{likedCount}</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post._id)}
                        className={`flex items-center gap-1.5 transition hover:text-indigo-400 ${
                          openCommentsPostId === post._id ? "text-indigo-400" : ""
                        }`}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{commentsCount}</span>
                      </button>

                      <button
                        onClick={() => handleSharePost(post._id)}
                        className="flex items-center gap-1.5 transition hover:text-cyan-400"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Comment Section (Collapsible Accordion Pane) */}
                    {openCommentsPostId === post._id && (
                      <div className="mt-5 border-t border-zinc-200 dark:border-zinc-900 pt-4 space-y-4 animate-fadeIn">
                        
                        {/* Writing a comment */}
                        {session ? (
                          <form
                            onSubmit={(e) => handleCommentSubmit(e, post._id)}
                            className="flex gap-2"
                          >
                            <input
                              type="text"
                              required
                              placeholder="Write a comment..."
                              value={commentInputs[post._id] || ""}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                              }
                              className="flex-grow rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none focus:border-indigo-500"
                            />
                            <Button
                              type="submit"
                              disabled={submittingComment[post._id]}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4"
                            >
                              Post
                            </Button>
                          </form>
                        ) : (
                          <p className="text-[10px] text-zinc-500 italic text-center">Log in to comment.</p>
                        )}

                        {/* Loading comments loader */}
                        {commentsLoading[post._id] ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-900 dark:text-white" />
                          </div>
                        ) : commentsList.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 text-center py-2">No comments yet. Write the first reply!</p>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {commentsList.map((c) => (
                              <div key={c._id} className="flex items-start gap-2.5 text-xs">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] font-bold text-zinc-700 dark:text-zinc-300">
                                  {c.author?.image ? (
                                    <img src={c.author.image} alt="" className="h-full w-full rounded-full object-cover" />
                                  ) : (
                                    c.author?.username?.[0]?.toUpperCase()
                                  )}
                                </div>
                                <div className="flex-grow rounded-xl bg-zinc-100/40 dark:bg-zinc-900/40 p-2.5 border border-zinc-200 dark:border-zinc-900">
                                  <div className="flex justify-between items-center pb-1">
                                    <span className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">{c.author?.username || "User"}</span>
                                    <span className="text-[8px] text-zinc-500">
                                      {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                                    {c.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Genre Communities Quick Widget */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 backdrop-blur-md shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <FolderHeart className="h-4 w-4 text-zinc-900 dark:text-white" />
              Genre Communities
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { id: "fantasy", name: "Fantasy", bg: "bg-indigo-900/20 text-indigo-400 border-indigo-900/30" },
                { id: "sci-fi", name: "Sci-Fi", bg: "bg-cyan-900/20 text-cyan-400 border-cyan-900/30" },
                { id: "romance", name: "Romance", bg: "bg-pink-900/20 text-pink-500 dark:text-pink-400 border-pink-900/30" },
                { id: "mystery", name: "Mystery", bg: "bg-amber-900/20 text-sky-600 dark:text-sky-400 border-amber-900/30" },
                { id: "thriller", name: "Thriller", bg: "bg-red-900/20 text-red-600 dark:text-red-400 border-red-900/30" },
                { id: "adventure", name: "Adventure", bg: "bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-900/30" }
              ].map((g) => (
                <Link key={g.id} href={`/communities/${g.id}`}>
                  <button className={`w-full rounded-lg border py-2 text-center text-[10px] font-semibold transition hover:opacity-90 ${g.bg}`}>
                    {g.name} Hub
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Suggested stories sidebar */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 backdrop-blur-md shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-900">
              <Flame className="h-4 w-4 text-zinc-900 dark:text-white" />
              Popular Serials
            </h3>
            <div className="mt-4 space-y-3.5">
              {suggestedStories.length === 0 ? (
                <p className="text-[10px] text-zinc-500 text-center py-2">No trending stories yet.</p>
              ) : (
                suggestedStories.map((story) => (
                  <Link key={story._id} href={`/stories/${story._id}`} className="block group">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors line-clamp-1">
                        {story.title}
                      </span>
                      <span className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800/80 px-1.5 py-0.5 text-[8px] text-zinc-900 dark:text-white uppercase tracking-widest shrink-0">
                        {story.genre || "Fiction"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Tag cloud sidebar */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5 backdrop-blur-md shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-900">
              <Tag className="h-4 w-4 text-zinc-900 dark:text-white" />
              Trending Tags
            </h3>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["magic", "space", "cyberpunk", "love", "detective", "hero", "rebellion", "epic"].map((tag) => (
                <Link key={tag} href={`/search?tag=${tag}`}>
                  <span className="rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-800 text-[10px] text-indigo-600 dark:text-indigo-300 px-2 py-1 cursor-pointer transition">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <Suspense fallback={
        <div className="flex flex-grow items-center justify-center">
          <BookOpen className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
      }>
        <FeedContent />
      </Suspense>
      <Footer />
    </div>
  );
}
