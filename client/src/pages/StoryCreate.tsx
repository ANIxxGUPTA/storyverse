import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

export default function StoryCreate() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState("");
  const [aiError, setAiError] = useState("");
  const [coverError, setCoverError] = useState("");

  const GENRES = ["Fiction", "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror"];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    setCoverError("");
    try {
      const res = await apiFetch("/api/ai/generate-cover", { method: "POST", body: JSON.stringify({ title, genre, prompt: coverPrompt }) });
      if (res && res.coverUrl) {
        setCoverImage(res.coverUrl);
      }
    } catch (err: any) {
      console.error(err);
      setCoverError(err.response?.data?.error || "Failed to generate cover image");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleGenerateIdea = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setAiError("");
    try {
      const res = await apiFetch("/api/ai/generate-story", { method: "POST", body: JSON.stringify({ prompt: aiPrompt }) });
      const data = res;
      
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.genre) setGenre(data.genre);
      if (data.tags) {
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);
      }
      
      setShowAIAssistant(false);
    } catch (err: any) {
      console.error("AI Generation Error", err);
      setAiError(err.response?.data?.error || "Failed to generate story idea");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/api/stories", {
        method: "POST", body: JSON.stringify({ title, coverImage, description, genre, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
      });
      navigate(`/stories/${res._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <main className="mx-auto w-full max-w-2xl flex-grow px-6 py-12">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-300 dark:border-zinc-800/80 justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-zinc-900 dark:text-white" />
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create New Story</h1>
            </div>
            <Button 
              type="button" 
              onClick={() => setShowAIAssistant(true)}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-xs font-bold gap-1.5 shadow-md shadow-purple-500/20 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              ✨ AI Story Generator
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Story Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                  placeholder="e.g. The Legend of the Lost Realm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                  Cover Image URL <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter prompt to generate AI cover, or paste a URL..."
                    value={coverPrompt || coverImage}
                    onChange={(e) => {
                      setCoverPrompt(e.target.value);
                      setCoverImage(e.target.value);
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateCover}
                    disabled={isGeneratingCover || !coverPrompt}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-zinc-200 dark:border-zinc-800 transition"
                  >
                    {isGeneratingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                    <span className="text-xs font-semibold">AI Generate</span>
                  </Button>
                </div>
                {coverError && <p className="text-red-500 text-xs mb-2">{coverError}</p>}
                {coverImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative group bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center min-h-[200px]">
                    <img 
                      src={coverImage} 
                      alt="Cover Preview" 
                      className="w-full max-h-[400px] object-cover transition-opacity duration-300" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                    {!coverImage.startsWith('http') && (
                      <span className="absolute text-xs text-zinc-500">Preview will appear here</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Story Description / Synopsis
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white resize-none leading-relaxed"
                  placeholder="Summarize your story here. Hook your readers with an exciting synopsis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="genre" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Genre
                  </label>
                  <select
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tags" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Tags <span className="text-zinc-500 font-normal">(comma separated)</span>
                  </label>
                  <input
                    id="tags"
                    type="text"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 shadow-sm transition focus:border-zinc-900 dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
                    placeholder="magic, dragons, epic"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-zinc-300 dark:border-zinc-800/80 pt-6">
              <Link to="/dashboard">
                <Button type="button" variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 font-semibold text-white hover:opacity-90 transition duration-200"
              >
                {loading ? "Creating story..." : "Create Story"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {showAIAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-indigo-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowAIAssistant(false)}
              className="absolute top-4 right-4 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">AI Story Generator</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Stuck? Describe what kind of story you want to write, or just generate a random idea, and let AI set up your title, synopsis, and tags.
            </p>
            <textarea
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none mb-4"
              rows={3}
              placeholder="E.g. A fantasy story about a dragon who loves to bake..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            {aiError && <p className="text-red-500 text-xs mb-4">{aiError}</p>}
            <Button
              onClick={handleGenerateIdea}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Idea"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
