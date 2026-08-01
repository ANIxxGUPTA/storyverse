import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Send, Heart, Share2, Loader2, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { useFeed } from "../lib/hooks/useFeed";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function Feed() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { feed: posts, loading, refetch } = useFeed();
  
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocus = searchParams.get("create") === "true";

  useEffect(() => {
    if (shouldFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [shouldFocus]);

  useEffect(() => {
    if (window.location.hash && posts.length > 0) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect briefly
          el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-zinc-950');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'dark:ring-offset-zinc-950');
          }, 2000);
        }
      }, 100);
    }
  }, [posts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setSubmittingPost(true);
    try {
      await apiFetch("/api/feed", {
        method: "POST",
        body: JSON.stringify({ content: postContent }),
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

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-grow items-center justify-center py-20 min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-12 min-h-screen">
      <div className="flex items-center gap-2 pb-6 border-b border-zinc-200 dark:border-zinc-900 mb-8">
        <FileText className="h-6 w-6 text-zinc-900 dark:text-white" />
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Global Feed</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Discover announcements, updates, and thoughts from the community.</p>
        </div>
      </div>

      <form onSubmit={handleCreatePost} className="mb-8 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/60 p-4 shadow-sm focus-within:border-blue-500/50 transition">
        <textarea
          ref={textareaRef}
          required
          rows={3}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Share an idea, an update, or what you are currently working on..."
          className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-500 dark:placeholder-zinc-400 outline-none resize-none leading-relaxed"
        />
        <div className="mt-3 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <span className="text-[10px] text-zinc-400 font-semibold">{postContent.length} / 1000</span>
          <Button
            type="submit"
            disabled={submittingPost || !postContent.trim() || postContent.length > 1000}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-md px-6"
          >
            {submittingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{submittingPost ? "Posting..." : "Create Post"}</span>
          </Button>
        </div>
      </form>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-100/10 dark:bg-zinc-900/10">
            <MessageSquare className="h-10 w-10 mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nothing posted yet</h3>
            <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts with the community!</p>
          </div>
        ) : (
          posts.map((post: any) => {
            const likedCount = Array.isArray(post.likes) ? post.likes.length : 0;
            const hasLiked = user && post.likes?.includes(user._id);
            return (
              <div
                id={`post-${post._id}`}
                key={post._id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 space-y-4 hover:border-zinc-300 dark:border-zinc-800 transition shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                    {post.author?.image ? (
                      <img src={post.author.image} alt="User" className="h-full w-full rounded-full object-cover" loading="lazy" />
                    ) : (
                      post.author?.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">{post.author?.username || "Anonymous"}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {post.communityGenre && <span className="ml-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">{post.communityGenre}</span>}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 text-xs text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-900/60">
                  <button 
                    onClick={() => handleLikePost(post._id)}
                    className={`flex items-center gap-1.5 transition font-semibold ${hasLiked ? "text-red-500" : "hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 -ml-2 rounded"}`}
                  >
                    <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500" : ""}`} />
                    <span>{likedCount}</span>
                  </button>

                  <button
                    onClick={() => handleSharePost(post._id)}
                    className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-2 py-1 -ml-2 rounded transition font-semibold"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{copiedId === post._id ? "Copied Link!" : "Share"}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
