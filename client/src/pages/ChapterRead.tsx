import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { apiFetch } from "../lib/api";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";

export default function ChapterRead() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [story, setStory] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [currentChapter, setCurrentChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStoryAndChapter = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/stories/${id}`);
        if (res) {
          setStory(res.story);
          setChapters(res.chapters);
          
          const chapter = res.chapters.find((c: any) => c._id === chapterId);
          if (chapter) {
            setCurrentChapter(chapter);
          } else {
            setError("Chapter not found");
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && user) {
      fetchStoryAndChapter();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [id, chapterId, authLoading, user]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center text-center py-20 min-h-[60vh]">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Log in to Read Stories</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">
          You need an account to read chapters.
        </p>
        <Link to="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Log In or Sign Up</Button>
        </Link>
      </div>
    );
  }

  if (error || !currentChapter) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center text-center py-20 min-h-[60vh]">
        <BookOpen className="h-10 w-10 text-zinc-400 mb-4" />
        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300">Chapter not found</h2>
        <p className="mt-2 text-sm text-zinc-500">{error}</p>
        <Link to={`/stories/${id}`} className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Story</Button>
        </Link>
      </div>
    );
  }

  // Find prev/next chapters
  const currentIndex = chapters.findIndex((c) => c._id === currentChapter._id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-transparent">
      <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-8 md:py-12">
        <Link to={`/stories/${id}`} className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {story?.title || "Story"}
        </Link>

        <article className="bg-white dark:bg-zinc-950 rounded-2xl p-8 md:p-12 shadow-sm border border-zinc-200 dark:border-zinc-900">
          <header className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-2">
              Chapter {currentChapter.chapterNumber}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {currentChapter.title}
            </h1>
          </header>

          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-loose prose-p:text-zinc-700 dark:prose-p:text-zinc-300">
            <ReactMarkdown>{currentChapter.content || ""}</ReactMarkdown>
          </div>
        </article>

        <div className="mt-8 flex items-center justify-between">
          {prevChapter ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/stories/${id}/chapters/${prevChapter._id}`)}
              className="flex items-center gap-2 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Chapter
            </Button>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Button
              onClick={() => navigate(`/stories/${id}/chapters/${nextChapter._id}`)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next Chapter
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate(`/stories/${id}`)}
              className="flex items-center gap-2 border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              Finish Story
              <BookOpen className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
