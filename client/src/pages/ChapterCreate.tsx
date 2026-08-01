import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Loader2, Save, CloudOff, Sparkles } from "lucide-react";
import { AiAssistantSidebar } from "../components/story/AiAssistantSidebar";
import { Button } from "../components/ui/button";
import { MarkdownEditor } from "../components/ui/markdown-editor";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

interface Story {
  title: string;
  author: any;
  authorId?: string;
}

export default function ChapterCreate() {
  const { id = "" } = useParams();
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStory, setFetchingStory] = useState(true);
  const [error, setError] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  const [chapterStatus, setChapterStatus] = useState("draft");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    async function fetchStoryMeta() {
      try {
        const res = await apiFetch(`/api/stories/${id}`);
        if (res) {
          setStory(res.story);
          
          const isAuthor = 
            res.story?.authorId?.toString() === user?._id || 
            res.story?.author?._id === user?._id;

          if (user && !isAuthor) {
            navigate(`/stories/${id}`);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Error loading story details");
      } finally {
        setFetchingStory(false);
      }
    }

    if (user && id) {
      fetchStoryMeta();
    }
  }, [id, user, navigate]);

  // Simulate autosave
  useEffect(() => {
    if (title || content) {
      setIsSaved(false);
      const timer = setTimeout(() => {
        setIsSaved(true);
        setLastSaved(new Date());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [title, content]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch(`/api/stories/${id}/chapters`, {
        method: "POST",
        body: JSON.stringify({
          title, 
          content,
          status: chapterStatus,
          wordCount
        })
      });
      navigate(`/stories/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to publish chapter");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchingStory) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <main className={`mx-auto w-full flex-grow px-6 py-12 transition-all duration-300 ${isAiOpen ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="flex items-center justify-between mb-6">
          <Link to={`/stories/${id}`} className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Story Details
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {isSaved ? (
                <span className="flex items-center gap-1"><Save className="h-3 w-3" /> Saved locally</span>
              ) : (
                <span className="flex items-center gap-1"><CloudOff className="h-3 w-3" /> Unsaved changes...</span>
              )}
              {lastSaved && <span>({lastSaved.toLocaleTimeString()})</span>}
            </div>
            
            <button 
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all duration-300 border ${
                isAiOpen 
                  ? 'bg-zinc-800 text-white border-zinc-700 shadow-md' 
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-transparent hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 animate-[pulse_3s_ease-in-out_infinite]'
              }`}
            >
              <Sparkles className={`h-4 w-4 ${!isAiOpen && 'animate-spin-slow'}`} />
              {isAiOpen ? "Close AI Suite" : "✨ AI Author Suite"}
            </button>
          </div>
        </div>

        <div className={`grid gap-6 transition-all duration-500 ${isAiOpen ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
          <div className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 shadow-sm ${isAiOpen ? 'lg:col-span-2' : ''}`}>
            <div className="flex flex-col gap-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Drafting for: {story?.title || "Story"}
              </span>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-zinc-900 dark:text-white" />
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">Craft New Chapter</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="chapterTitle" className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                    Chapter Title
                  </label>
                  <input
                    id="chapterTitle"
                    type="text"
                    required
                    className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Chapter 1: The Gathering Storm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Chapter Content
                    </label>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>{charCount} chars</span>
                    </div>
                  </div>
                  <MarkdownEditor 
                    value={content} 
                    onChange={setContent} 
                    placeholder="Write your story's next epic chapter using Markdown..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-6">
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setChapterStatus("draft")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${chapterStatus === "draft" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setChapterStatus("published")}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${chapterStatus === "published" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}
                  >
                    Publish Immediately
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" onClick={() => navigate(`/stories/${id}`)} className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !title || !content}
                    className="bg-blue-600 hover:bg-blue-700 font-semibold text-white hover:opacity-90 px-8"
                  >
                    {loading ? "Saving..." : (chapterStatus === "draft" ? "Save Draft" : "Publish")}
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          {isAiOpen && (
            <div className="lg:col-span-1 h-[calc(100vh-12rem)] sticky top-24">
              <AiAssistantSidebar 
                content={content} 
                onSuggestionAccept={(suggestion) => {
                  setContent(prev => prev + "\n\n" + suggestion);
                }} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
