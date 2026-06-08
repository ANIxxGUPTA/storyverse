"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Plus, User, FileText, Loader2, Edit, MessageSquare } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  views: number;
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ storiesCount: 0, postsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "posts">("stories");

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/users/${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();
      setProfile(data.user);
      setStories(data.stories);
      setPosts(data.posts);
      setStats(data.stats);
      setEditBio(data.user.bio || "");
      setEditImage(data.user.image || "");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio: editBio, image: editImage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">My Workspace</h1>
        <p className="mt-1.5 text-sm text-zinc-400">
          Unifying your stories, feed updates, and creator profile in one place.
        </p>

        {/* Dashboard Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* User Profile Card & Stats */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 font-bold text-white text-xl">
                  {profile?.image ? (
                    <img src={profile.image} alt={profile.username} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    profile?.username?.[0]?.toUpperCase() || <User className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">{profile?.username}</h2>
                  <p className="text-xs text-zinc-500">{profile?.email}</p>
                </div>
              </div>

              {!isEditing ? (
                <>
                  <div className="mt-5 border-t border-zinc-800/80 pt-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bio</h3>
                    <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed">
                      {profile?.bio || "No bio set yet. Click edit below to add one."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 w-full"
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit Profile
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="mt-5 border-t border-zinc-800/80 pt-4 space-y-4">
                  {editError && (
                    <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-2.5 text-xs text-destructive text-center">
                      {editError}
                    </div>
                  )}

                  <div>
                    <label htmlFor="editImage" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Avatar URL
                    </label>
                    <input
                      id="editImage"
                      type="url"
                      className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-700 shadow-sm focus:border-orange-500 focus:outline-none"
                      placeholder="https://example.com/avatar.jpg"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="editBio" className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                      Bio
                    </label>
                    <textarea
                      id="editBio"
                      rows={3}
                      className="mt-1.5 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white placeholder-zinc-700 shadow-sm focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="Tell readers about yourself..."
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-zinc-500 text-xs"
                      onClick={() => {
                        setIsEditing(false);
                        setEditBio(profile?.bio || "");
                        setEditImage(profile?.image || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      size="sm"
                      className="bg-orange-500 text-white hover:bg-orange-600 text-xs"
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              )}
            </div>



            {/* Quick Actions */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-sm shadow-md">
              <h3 className="text-sm font-bold text-zinc-200">Create</h3>
              <div className="mt-4 space-y-3">
                <Link href="/stories/create" className="block">
                  <Button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:opacity-90">
                    <Plus className="h-4 w-4" />
                    Write New Story
                  </Button>
                </Link>
                <Link href="/feed?create=true" className="block">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-1.5 border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                    <FileText className="h-4 w-4" />
                    Publish Feed Post
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* User's Creations Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-sm">
              {/* Tab Selector */}
              <div className="border-b border-zinc-800 flex gap-6 pb-4">
                <button
                  onClick={() => setActiveTab("stories")}
                  className={`pb-2 text-sm font-semibold transition border-b-2 ${
                    activeTab === "stories"
                      ? "border-orange-500 text-orange-500"
                      : "border-transparent text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  My Stories ({stories.length})
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`pb-2 text-sm font-semibold transition border-b-2 ${
                    activeTab === "posts"
                      ? "border-purple-550 text-purple-500"
                      : "border-transparent text-zinc-500 hover:text-zinc-350"
                  }`}
                >
                  My Feed Posts ({posts.length})
                </button>
              </div>

              {activeTab === "stories" ? (
                stories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <BookOpen className="h-12 w-12 text-zinc-700 animate-pulse" />
                    <h3 className="mt-4 font-semibold text-zinc-400">No stories yet</h3>
                    <p className="mt-1 text-sm text-zinc-500 max-w-sm">
                      Ready to start your digital writing legacy? Create your first story wrapper.
                    </p>
                    <Link href="/stories/create" className="mt-6">
                      <Button size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                        Create a Story
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {stories.map((story) => (
                      <div
                        key={story._id}
                        className="group flex flex-col justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-4 transition hover:border-zinc-800 hover:bg-zinc-900/30 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center">
                          <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-950">
                            {story.coverImage ? (
                              <img src={story.coverImage} alt={story.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-zinc-800 font-serif text-[10px] font-bold text-zinc-500 text-center px-1">
                                {story.title.substring(0, 10)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-zinc-200 group-hover:text-orange-400 transition">
                              {story.title}
                            </h4>
                            <p className="mt-1 text-xs text-zinc-400 line-clamp-1 max-w-md">
                              {story.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 sm:mt-0">
                          <Link href={`/stories/${story._id}`}>
                            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                              View
                            </Button>
                          </Link>
                          <Link href={`/stories/${story._id}/chapters/create`}>
                            <Button size="sm" className="bg-zinc-850 text-zinc-200 hover:bg-zinc-700">
                              + Chapter
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <MessageSquare className="h-12 w-12 text-zinc-700" />
                  <h3 className="mt-4 font-semibold text-zinc-400">No posts published yet</h3>
                  <p className="mt-1 text-sm text-zinc-500 max-w-sm">
                    Publish your thoughts or story updates on the social feed.
                  </p>
                  <Link href="/feed" className="mt-6">
                    <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700">
                      Go to Feed
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-5 hover:border-zinc-800 transition duration-150"
                    >
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}