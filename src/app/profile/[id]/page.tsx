"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, User as UserIcon, ArrowLeft, Loader2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Story {
  _id: string;
  title: string;
  coverImage?: string;
  description: string;
  views: number;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  likes: string[];
  createdAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  bio?: string;
  image?: string;
  createdAt: string;
}

export default function GuestProfilePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { id } = params;
  const { data: session } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "posts">("stories");
  const [error, setError] = useState("");

  useEffect(() => {
    // If the viewed user is the logged-in user, redirect to /dashboard
    if (session?.user?.id === id) {
      router.push("/dashboard");
    }
  }, [id, session, router]);

  useEffect(() => {
    async function fetchGuestData() {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("User profile not found");
          throw new Error("Failed to load user profile");
        }
        const data = await res.json();
        setProfile(data.user);
        setStories(data.stories);
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchGuestData();
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

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-zinc-300">Profile not found</h2>
          <p className="mt-2 text-sm text-zinc-500">{error || "The user you are trying to view does not exist."}</p>
          <Link href="/" className="mt-6">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Cover image helper for cards
  const StoryCardCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
    if (coverImage && coverImage.trim() !== "") {
      return (
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      );
    }

    return (
      <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-orange-500 to-purple-600 p-4 transition duration-300 group-hover:scale-105">
        <BookOpen className="h-4 w-4 text-white/80" />
        <span className="font-serif text-sm font-bold leading-tight text-white line-clamp-2 drop-shadow">
          {title}
        </span>
        <div className="h-1 w-1/4 rounded bg-white/40" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-8">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Stories
        </Link>

        {/* Profile Card Header */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 font-extrabold text-white text-3xl shadow-lg">
              {profile.image ? (
                <img src={profile.image} alt={profile.username} className="h-full w-full rounded-full object-cover" />
              ) : (
                profile.username?.[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-grow space-y-3">
              <div>
                <h1 className="text-2xl font-extrabold text-zinc-100">{profile.username}</h1>

              </div>

              <div className="pt-2 border-t border-zinc-850">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bio</h3>
                <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  {profile.bio || `No bio published yet. Just a creative soul on StoryVerse.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-10 border-b border-zinc-900 flex gap-6">
          <button
            onClick={() => setActiveTab("stories")}
            className={`pb-4 text-sm font-semibold transition border-b-2 ${
              activeTab === "stories"
                ? "border-orange-500 text-orange-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Stories Published ({stories.length})
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-4 text-sm font-semibold transition border-b-2 ${
              activeTab === "posts"
                ? "border-purple-500 text-purple-500"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Posts Published ({posts.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "stories" ? (
            stories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-10 w-10 text-zinc-800" />
                <h3 className="mt-4 font-semibold text-zinc-400">No stories published yet</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  {profile.username} has not uploaded any stories to StoryVerse yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <Link
                    key={story._id}
                    href={`/stories/${story._id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/10 transition hover:border-zinc-850 hover:bg-zinc-900/30"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-zinc-950">
                      <StoryCardCover coverImage={story.coverImage} title={story.title} />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-zinc-200 group-hover:text-orange-400 transition line-clamp-1">
                        {story.title}
                      </h4>
                      <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                        {story.description}
                      </p>

                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <UserIcon className="h-10 w-10 text-zinc-800" />
              <h3 className="mt-4 font-semibold text-zinc-400">No posts published yet</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {profile.username} has not posted anything on the social feed yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-5 hover:border-zinc-850 transition"
                >

                  <p className="mt-2.5 text-sm text-zinc-300 leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {post.content}
                  </p>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
