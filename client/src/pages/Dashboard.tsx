import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, MessageSquare, Heart, Eye, CheckCircle2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../lib/hooks/useFetch";
import { ProfileSidebar } from "../components/dashboard/ProfileSidebar";
import { CreationPanel } from "../components/dashboard/CreationPanel";
import { FeedComposer } from "../components/dashboard/FeedComposer";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: storiesData, loading: storiesLoading, refetch: refetchStories } = useFetch<any>('/api/users/me/stories');
  const { data: feedData, loading: feedLoading, refetch: refetchFeed } = useFetch<any>('/api/users/me/feed');
  
  const stories = storiesData || [];
  const posts = feedData || [];
  const loading = storiesLoading || feedLoading;

  const [activeTab, setActiveTab] = useState<"stories" | "posts" | "analytics">("stories");
  const [toastMsg, setToastMsg] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user && !profile) {
      // Initialize profile from context, it'll get overridden if we fetch a fresh one
      setProfile(user);
    }
  }, [user]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  const totalViews = stories.reduce((acc: any, s: any) => acc + (s.views || 0), 0);
  const totalLikes = stories.reduce((acc: any, s: any) => acc + (Array.isArray(s.likes) ? s.likes.length : 0), 0);

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-8">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-blue-600 shadow-xl animate-slideIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-200 dark:border-zinc-900 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent text-3xl font-extrabold tracking-tight sm:text-4xl">
              Creator Hub
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Overview of stories, feed posts, and analytics dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        {/* LEFT SIDEBAR: PROFILE */}
        <div className="lg:col-span-1">
          <ProfileSidebar profile={profile} setProfile={setProfile} />
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-3">
          <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <span>Total Reads</span>
                <Eye className="h-4 w-4 text-zinc-900 dark:text-white" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalViews}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <span>Total Likes</span>
                <Heart className="h-4 w-4 text-red-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalLikes}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <span>Stories</span>
                <BookOpen className="h-4 w-4 text-zinc-900 dark:text-white" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{stories.length}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                <span>Posts</span>
                <MessageSquare className="h-4 w-4 text-zinc-900 dark:text-white" />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{posts.length}</p>
            </div>
          </section>

          <div className="mt-8 border-b border-zinc-200 dark:border-zinc-900 flex gap-6 overflow-x-auto pb-0.5">
            {[
              { id: "stories", label: `My Stories (${stories.length})` },
              { id: "posts", label: `Snippets (${posts.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-500 text-zinc-900 dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="mt-6">
            {activeTab === "stories" && (
              <div className="space-y-6">
                <CreationPanel onCreated={() => { triggerToast("Story created successfully!"); refetchStories(); }} />

                <div className="grid gap-4">
                  {stories.map((story: any) => {
                    const likesCount = Array.isArray(story.likes) ? story.likes.length : 0;
                    return (
                      <div key={story._id} className="group flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-4">
                        <div className="flex items-center">
                          <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-white dark:bg-zinc-950 shadow border border-zinc-850">
                            {story.coverImage ? (
                              <img src={story.coverImage} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-[8px] text-center px-1 font-serif">
                                {story.title.slice(0,10)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold text-sm">{story.title}</h4>
                            <div className="flex items-center gap-3.5 text-[10px] text-zinc-500 mt-1">
                              <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white font-semibold uppercase tracking-wider">{story.genre || "Fiction"}</span>
                              <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {story.views || 0}</span>
                              <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-red-500" /> {likesCount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                          <Link to={`/stories/${story._id}`}>
                            <Button size="xs" variant="ghost">View</Button>
                          </Link>
                          <Link to={`/stories/${story._id}/edit`}>
                            <Button size="xs" className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 gap-1.5">
                              <Edit3 className="h-3 w-3" /> Edit & Chapters
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="space-y-6">
                <FeedComposer onPosted={() => { triggerToast("Post published!"); refetchFeed(); }} />

                <div className="grid gap-4">
                  {posts.map((post: any) => (
                    <div key={post._id} className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-5 space-y-2">
                      <span className="text-[9px] text-zinc-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                      <p className="text-xs">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
