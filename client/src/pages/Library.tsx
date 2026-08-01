import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface Collection {
  _id: string;
  name: string;
  description: string;
  stories: any[];
}

export default function Library() {
  const { user, authLoading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"continue" | "lists">("continue");
  const [history, setHistory] = useState<any[]>([]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCollections() {
      if (!user) return;
      try {
        const data = await apiFetch("/api/collections");
        if (data) setCollections(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (!authLoading) {
      if (user) {
        fetchCollections();
      } else {
        setLoading(false);
      }
    }
    
    const storedHistory = localStorage.getItem('storyverse_history');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (parsedHistory && parsedHistory.length > 0) {
          setHistory(parsedHistory);
          
          // Verify with backend that stories still exist
          const ids = parsedHistory.map((s: any) => s._id).join(',');
          apiFetch(`/api/stories?ids=${ids}`).then((activeStories) => {
            if (activeStories && Array.isArray(activeStories)) {
              const activeIds = activeStories.map((s: any) => s._id);
              const filteredHistory = parsedHistory.filter((s: any) => activeIds.includes(s._id));
              
              if (filteredHistory.length !== parsedHistory.length) {
                setHistory(filteredHistory);
                localStorage.setItem('storyverse_history', JSON.stringify(filteredHistory));
              }
            }
          }).catch(console.error);
        }
      } catch (e) {}
    }
  }, [user, authLoading]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingLoading(true);
    setError("");

    try {
      const newList = await apiFetch("/api/collections", {
        method: "POST",
        body: JSON.stringify({
          name: newListName,
          description: newListDesc,
        }),
      });
      if (newList) {
        setCollections([newList, ...collections]);
        setIsCreating(false);
        setNewListName("");
        setNewListDesc("");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create list");
    } finally {
      setCreatingLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Log in to view your library</h2>
        <Link to="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 min-h-screen">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Library
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Continue reading your stories and manage your curated lists.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New List
        </Button>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8">
        <button 
          onClick={() => setActiveTab("continue")}
          className={`px-4 py-2 text-sm font-semibold transition ${activeTab === 'continue' ? 'border-b-2 border-blue-600 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
        >
          Continue Reading ({history.length})
        </button>
        <button 
          onClick={() => setActiveTab("lists")}
          className={`px-4 py-2 text-sm font-semibold transition ${activeTab === 'lists' ? 'border-b-2 border-blue-600 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}`}
        >
          Reading Lists ({collections.length})
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <h3 className="text-lg font-bold mb-4">Create New Reading List</h3>
          <form onSubmit={handleCreateList} className="space-y-4 max-w-md">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">List Name</label>
              <input
                type="text"
                required
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-sm"
                placeholder="e.g. Must Read Fantasy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">Description (optional)</label>
              <textarea
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-2 text-sm resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={creatingLoading}>
                {creatingLoading ? "Creating..." : "Create List"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "continue" ? (
        <div>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <BookOpen className="h-10 w-10 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                No reading history yet
              </h3>
              <p className="mt-1 text-sm text-zinc-500 mb-6 max-w-sm text-center">
                Once you start reading chaptered serials, they'll sync here.
              </p>
              <Link to="/search">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Browse Stories
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((story: any) => (
                <Link
                  key={story._id}
                  to={`/stories/${story._id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 transition hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100/40 dark:bg-zinc-900/40"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center">
                    {story.coverImage ? (
                      <img src={story.coverImage} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center transition duration-300 group-hover:scale-105">
                        <BookOpen className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="flex flex-grow flex-col justify-between p-5">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-1">
                        {story.title}
                      </h3>
                      <p className="mt-2 text-xs text-zinc-500">
                        Viewed recently
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {collections.length === 0 && !isCreating ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <BookOpen className="h-10 w-10 text-zinc-400 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your reading shelf is empty
              </h3>
              <p className="mt-1 text-sm text-zinc-500 mb-6 max-w-sm text-center">
                Create a list and start adding stories to read later.
              </p>
              <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                Create First List
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map(col => (
                <div key={col._id} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:shadow-md transition">
                  <h3 className="text-xl font-bold">{col.name}</h3>
                  <p className="text-sm text-zinc-500 mt-1 mb-4">{col.stories.length} stories</p>
                  {col.description && <p className="text-sm text-zinc-700 dark:text-zinc-400 mb-4 line-clamp-2">{col.description}</p>}
                  
                  {col.stories.length > 0 ? (
                    <div className="flex gap-2 mb-4">
                      {col.stories.filter(Boolean).slice(0, 3).map((s: any, idx: number) => (
                        <Link to={`/stories/${s._id}`} key={idx} className="w-12 h-16 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden cursor-pointer hover:opacity-80 transition block">
                          {s.coverImage && <img src={s.coverImage} className="w-full h-full object-cover" />}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full py-4 text-xs font-semibold uppercase tracking-wider text-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900 rounded-lg mb-4">
                      Empty List
                    </div>
                  )}
                  <Link to="/search">
                    <Button variant="outline" className="w-full text-xs" size="sm">Add Stories</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
