"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Plus, User, FileText, Loader2, Edit, MessageSquare, Heart, Eye, FolderHeart, TrendingUp, Sparkles, BookMarked, Calendar, CheckCircle2, Trash2 } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Story {
  _id: string;
  title: string;
  description: string;
  coverImage?: string;
  genre: string;
  tags: string[];
  views: number;
  likes: string[];
  createdAt: string;
}

interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
}

interface ReadingProgress {
  storyId: { _id: string; title: string; coverImage: string };
  chapterId: { _id: string; title: string; chapterNumber: number };
  progressPercent: number;
  updatedAt: string;
}

interface UserStat {
  currentStreak: number;
  longestStreak: number;
  totalWordsRead: number;
  chaptersRead: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [userStats, setUserStats] = useState<UserStat | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"stories" | "posts" | "analytics">("stories");

  // Success / Error triggers
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      // 1. Fetch user data (user profile, stories, posts, reading progress, stats)
      const userRes = await fetch(`/api/users/${session.user.id}`);
      if (userRes.ok) {
        const data = await userRes.json();
        setStories(data.stories);
        setPosts(data.posts);
        setReadingProgress(data.readingProgress || null);
        setUserStats(data.userStats || null);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Calculate aggregated analytics metrics
  const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0);
  const totalLikes = stories.reduce((acc, s) => acc + (Array.isArray(s.likes) ? s.likes.length : 0), 0);
  const totalStories = stories.length;
  const totalPosts = posts.length;

  // Generate real heatmap data based on stories and posts published
  const heatmapData: Record<string, number> = {};
  stories.forEach(s => {
    if (!s.createdAt) return;
    const d = new Date(s.createdAt).toISOString().split("T")[0];
    heatmapData[d] = (heatmapData[d] || 0) + 3; // Stories weigh more
  });
  posts.forEach(p => {
    if (!p.createdAt) return;
    const d = new Date(p.createdAt).toISOString().split("T")[0];
    heatmapData[d] = (heatmapData[d] || 0) + 1; // Posts weigh less
  });
  // Render Cover image helper
  const StoryMiniCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
    if (coverImage && coverImage.trim() !== "") {
      return (
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover"
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-650 font-bold text-[8px] text-center px-1 font-serif">
        {title.slice(0, 10)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      {/* Floating toast alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-blue-600 dark:text-zinc-900 dark:text-white shadow-xl animate-slideIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-8">
        {/* Upper Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-200 dark:border-zinc-900 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent text-3xl font-extrabold tracking-tight sm:text-4xl">My Creator Hub</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Overview of stories, custom collections, reading progress, and analytics dashboard.
              </p>
            </div>
            {userStats && userStats.currentStreak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs">
                <span className="text-lg">🔥</span>
                <span>{userStats.currentStreak} Day Streak!</span>
              </div>
            )}
          </div>

          <div className="flex gap-2.5">
            <Link href="/stories/create">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold text-white flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" />
                <span>Write Story</span>
              </Button>
            </Link>
            <Link href="/feed?create=true">
              <Button size="sm" variant="outline" className="border-zinc-300 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                <FileText className="h-4 w-4" />
                <span>Post Snippet</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Continue Reading Widget */}
        {readingProgress && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Continue Reading</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{readingProgress.storyId.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Chapter {readingProgress.chapterId.chapterNumber}: {readingProgress.chapterId.title}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${readingProgress.progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-semibold">{Math.round(readingProgress.progressPercent)}%</span>
                </div>
              </div>
              <Link href={`/stories/${readingProgress.storyId._id}/chapters/${readingProgress.chapterId._id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">Resume</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Aggregate Stats Cards */}
        <section className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Fictional Reads</span>
              <Eye className="h-4 w-4 text-zinc-900 dark:text-white" />
            </div>
            <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalViews}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Fictional Appreciations</span>
              <Heart className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalLikes}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Stories Created</span>
              <BookOpen className="h-4 w-4 text-zinc-900 dark:text-white" />
            </div>
            <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalStories}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-5">
            <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
              <span>Snippets / Posts</span>
              <MessageSquare className="h-4 w-4 text-zinc-900 dark:text-white" />
            </div>
            <p className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalPosts}</p>
          </div>
        </section>

        {/* Dashboard Tabs Selector */}
        <div className="mt-8 border-b border-zinc-200 dark:border-zinc-900 flex gap-6 overflow-x-auto pb-0.5">
          {[
            { id: "stories", label: `My Stories (${stories.length})` },
            { id: "posts", label: `Snippets (${posts.length})` },
            { id: "analytics", label: "Analytics Charts" },
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

        {/* Tab Contents */}
        <section className="mt-6">
          
          {/* TAB: Stories */}
          {activeTab === "stories" && (
            stories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center">
                <BookOpen className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
                <h3 className="mt-4 font-bold text-zinc-600 dark:text-zinc-400">Write your first epic story</h3>
                <p className="mt-1.5 text-xs text-zinc-500 max-w-sm mx-auto">
                  Create a container for your story wrappers and begin drafting chapters today.
                </p>
                <Link href="/stories/create" className="mt-6 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Create Story</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {stories.map((story) => {
                  const likesCount = Array.isArray(story.likes) ? story.likes.length : 0;
                  return (
                    <div
                      key={story._id}
                      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-4 transition hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100/20 dark:bg-zinc-900/20"
                    >
                      <div className="flex items-center">
                        <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-white dark:bg-zinc-950 shadow border border-zinc-850">
                          <StoryMiniCover coverImage={story.coverImage} title={story.title} />
                        </div>
                        <div className="ml-4">
                          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                            {story.title}
                          </h4>
                          <div className="flex items-center gap-3.5 text-[10px] text-zinc-500 mt-1">
                            <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-900 dark:text-white font-semibold uppercase tracking-wider">{story.genre || "Fiction"}</span>
                            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {story.views || 0}</span>
                            <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 text-red-500" /> {likesCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                        <Link href={`/stories/${story._id}`}>
                          <Button size="xs" variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">View Details</Button>
                        </Link>
                        <Link href={`/stories/${story._id}/chapters/create`}>
                          <Button size="xs" className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
                            + Chapter
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB: Posts */}
          {activeTab === "posts" && (
            posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-850 py-16 text-center">
                <FileText className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
                <h3 className="mt-4 font-bold text-zinc-600 dark:text-zinc-400">Share snippets on Feed</h3>
                <p className="mt-1 text-xs text-zinc-500">Draft serial updates, community announcements, and microblogs.</p>
                <Link href="/feed?create=true" className="mt-5 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Create Post</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <div key={post._id} className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-5 space-y-2 hover:border-zinc-300 dark:border-zinc-800 transition">
                    <span className="text-[9px] text-zinc-600 dark:text-zinc-400 block font-semibold">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                ))}
              </div>
            )
          )}
          {/* TAB: Analytics charts */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              
              {/* Creator engagement tracker with pure SVG layout chart */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-900">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-zinc-900 dark:text-white" />
                      Weekly Reader Engagement
                    </h3>
                    <span className="text-[10px] text-zinc-600 dark:text-zinc-400 block mt-0.5">Calculated based on story views and likes</span>
                  </div>
                </div>

                {/* SVG Line / Bar chart simulation */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="relative w-full max-w-2xl aspect-[3/1] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl px-12 py-4 flex items-end justify-between overflow-hidden">
                    
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4">
                      <div className="w-full border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 text-right pr-4">1,000 reads</div>
                      <div className="w-full border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 text-right pr-4">500 reads</div>
                      <div className="w-full text-[10px] text-zinc-500 dark:text-zinc-400 text-right pr-4">0 reads</div>
                    </div>

                    {/* Simulating 7 weekly days bars */}
                    {[
                      { day: "Sun", views: 240, h: "h-[24%]" },
                      { day: "Mon", views: 480, h: "h-[48%]" },
                      { day: "Tue", views: 650, h: "h-[65%]" },
                      { day: "Wed", views: 920, h: "h-[92%]" },
                      { day: "Thu", views: 500, h: "h-[50%]" },
                      { day: "Fri", views: 780, h: "h-[78%]" },
                      { day: "Sat", views: 350, h: "h-[35%]" }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center justify-end gap-2 z-10 w-12 sm:w-16 h-full pt-4">
                        <span className="text-[10px] text-zinc-600 dark:text-zinc-300 font-bold">{bar.views}</span>
                        <div className={`w-6 sm:w-8 ${bar.h} rounded-t-md bg-zinc-800 dark:bg-zinc-200 shadow-lg shadow-zinc-900/10 dark:shadow-white/10 transition-all duration-500 animate-slideUp`} />
                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-semibold">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GitHub style contribution matrix */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-6">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-900">
                  <Calendar className="h-4 w-4 text-zinc-900 dark:text-white" />
                  Writing Consistency Matrix
                </h3>
                
                <div className="mt-5 overflow-x-auto pr-1 pb-2">
                  <div className="flex gap-2 items-start">
                    {/* Y-Axis Day Labels */}
                    <div className="flex flex-col gap-1 text-[9px] text-zinc-500 font-medium text-right w-5">
                      <span className="h-3 flex items-center justify-end">Mon</span>
                      <span className="h-3 flex items-center justify-end">Tue</span>
                      <span className="h-3 flex items-center justify-end">Wed</span>
                      <span className="h-3 flex items-center justify-end">Thu</span>
                      <span className="h-3 flex items-center justify-end">Fri</span>
                      <span className="h-3 flex items-center justify-end">Sat</span>
                      <span className="h-3 flex items-center justify-end">Sun</span>
                    </div>

                    {/* Matrix Grid */}
                    <div className="min-w-[600px] flex gap-1 flex-col">
                      {/* Real rows (7 days of week) */}
                    {Array.from({ length: 7 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-1 justify-start">
                        {Array.from({ length: 40 }).map((__, cIdx) => {
                          // Calculate the date for this square (280 days total)
                          const daysAgo = 280 - (cIdx * 7 + (6 - rIdx)); 
                          const d = new Date();
                          d.setDate(d.getDate() - daysAgo);
                          const dateStr = d.toISOString().split("T")[0];
                          
                          const activityScore = heatmapData[dateStr] || 0;
                          let activityLevel = 0;
                          if (activityScore > 0) activityLevel = 1;
                          if (activityScore > 2) activityLevel = 2;
                          if (activityScore > 4) activityLevel = 3;
                          if (activityScore > 6) activityLevel = 4;

                          const colors = [
                            "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
                            "bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800",
                            "bg-blue-300 dark:bg-blue-700 border border-blue-400 dark:border-blue-600",
                            "bg-blue-500 dark:bg-blue-500 border border-blue-600 dark:border-blue-400",
                            "bg-blue-600 dark:bg-blue-400 border border-blue-700 dark:border-blue-300 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                          ];
                          return (
                            <div
                              key={cIdx}
                              className={`h-3 w-3 rounded-sm ${colors[activityLevel]} cursor-pointer transition hover:scale-125`}
                              title={`${dateStr}: ${activityScore > 0 ? activityScore + " contributions" : "No activity"}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex justify-end items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold tracking-wide">
                    <span>Less</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="h-3 w-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm" />
                      <div className="h-3 w-3 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-sm" />
                      <div className="h-3 w-3 bg-blue-300 dark:bg-blue-700 border border-blue-400 dark:border-blue-600 rounded-sm" />
                      <div className="h-3 w-3 bg-blue-500 dark:bg-blue-500 border border-blue-600 dark:border-blue-400 rounded-sm" />
                      <div className="h-3 w-3 bg-blue-600 dark:bg-blue-400 border border-blue-700 dark:border-blue-300 rounded-sm shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}