"use client";

import { useEffect, useState, use, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, BookOpen, User, Sparkles, Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Author {
  _id: string;
  username: string;
  image?: string;
}

interface Post {
  _id: string;
  content: string;
  author: Author;
  likes: string[]; // User IDs
  createdAt: string;
}

function FeedContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState("");

  useEffect(() => {
    // Check if ?create=true was passed to automatically focus writing box
    if (searchParams.get("create") === "true") {
      const textarea = document.getElementById("post-textarea");
      textarea?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, image: "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish post");
      }

      setPosts([data, ...posts]);
      setContent("");
      
      // Clean query parameter if present
      if (searchParams.get("create") === "true") {
        router.replace("/feed");
      }
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-8 flex-grow">
      {/* Create Post Card */}
      {session && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm shadow-lg shadow-black/20">
          <form onSubmit={handleCreatePost} className="space-y-4">
            {postError && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                {postError}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 font-bold text-white text-xs">
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
                  className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="Share a story update, a reading list, or thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-zinc-900 pt-3">
              <Button
                type="submit"
                disabled={publishing}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{publishing ? "Sharing..." : "Share Post"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Feed list */}
      <div className="mt-8 space-y-6">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 py-16 text-center">
            <BookOpen className="h-10 w-10 text-zinc-700" />
            <h3 className="mt-4 font-semibold text-zinc-400">Social feed is quiet</h3>
            <p className="mt-1 text-sm text-zinc-500 max-w-xs">
              Nobody has posted yet. Type a story update above to break the silence!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-5 transition duration-200 hover:border-zinc-800"
            >
              {/* Author Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${post.author?._id || ""}`} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-200 hover:bg-orange-500 hover:text-white transition">
                      {post.author?.image ? (
                        <img src={post.author.image} alt={post.author.username} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        post.author?.username?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100 hover:text-orange-400 transition">
                        {post.author?.username || "Anonymous"}
                      </h4>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Content body */}
              <p className="mt-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />
      <Suspense fallback={
        <div className="flex flex-grow items-center justify-center">
          <BookOpen className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }>
        <FeedContent />
      </Suspense>
    </div>
  );
}
