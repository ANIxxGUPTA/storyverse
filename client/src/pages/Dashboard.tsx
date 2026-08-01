import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Plus, Heart, Eye, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

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

export default function Dashboard() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [stories, setStories] = useState<Story[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);
  const [userStats, setUserStats] = useState<UserStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }
      try {
        const userRes = await apiFetch(`/api/users/${user._id}`);
        if (userRes) {
          setStories(userRes.stories || []);
          setReadingProgress(userRes.readingProgress || null);
          setUserStats(userRes.userStats || null);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchDashboardData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (!user) return null;

  const totalLikes = stories.reduce((acc, s) => acc + (Array.isArray(s.likes) ? s.likes.length : 0), 0);
  const totalStories = stories.length;

  const StoryMiniCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
    if (coverImage && coverImage.trim() !== "") {
      return <img src={coverImage} alt={title} className="h-full w-full object-cover" />;
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-600 font-bold text-[8px] text-center px-1 font-serif">
        {title.slice(0, 10)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-8">
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
            <Link to="/stories/create">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold text-white flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" />
                <span>Write Story</span>
              </Button>
            </Link>
          </div>
        </div>

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
              <Link to={`/stories/${readingProgress.storyId._id}/chapters/${readingProgress.chapterId._id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">Resume</Button>
              </Link>
            </div>
          </div>
        )}

        <section className="mt-8 grid gap-4 grid-cols-2">
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
        </section>

        <div className="mt-8 border-b border-zinc-200 dark:border-zinc-900 flex gap-6 overflow-x-auto pb-0.5">
          <div className="pb-3 text-sm font-semibold whitespace-nowrap border-b-2 border-blue-500 text-zinc-900 dark:text-white">
            My Stories ({stories.length})
          </div>
        </div>

        <section className="mt-6">
          {stories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center">
              <BookOpen className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
              <h3 className="mt-4 font-bold text-zinc-600 dark:text-zinc-400">Write your first epic story</h3>
              <p className="mt-1.5 text-xs text-zinc-500 max-w-sm mx-auto">
                Create a container for your story wrappers and begin drafting chapters today.
              </p>
              <Link to="/stories/create" className="mt-6 inline-block">
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
                    <Link to={`/stories/${story._id}`} className="flex items-center hover:opacity-80 transition-opacity">
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
                    </Link>

                    <div className="mt-4 sm:mt-0 flex gap-2 w-full sm:w-auto">
                      <Link to={`/stories/${story._id}`}>
                        <Button size="xs" variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">View Details</Button>
                      </Link>
                      <Link to={`/stories/${story._id}/chapters/create`}>
                        <Button size="xs" className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px]">
                          + Chapter
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
