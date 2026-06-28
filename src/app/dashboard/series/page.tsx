"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Plus, FolderHeart, Loader2, BookOpen, Settings } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Series {
  _id: string;
  name: string;
  description: string;
  stories: string[]; // ObjectIDs
  createdAt: string;
}

export default function SeriesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchSeries = async () => {
    try {
      const res = await fetch(`/api/series`);
      if (res.ok) {
        const data = await res.json();
        setSeriesList(data.series);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchSeries();
    }
  }, [status, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc })
      });
      if (res.ok) {
        const data = await res.json();
        setSeriesList([...seriesList, data.series]);
        setIsCreating(false);
        setNewName("");
        setNewDesc("");
      } else {
        const err = await res.json();
        setError(err.error || "Failed to create series");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-12">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <FolderHeart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Series Management</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Group your stories together into epic sagas</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {isCreating ? "Cancel" : <><Plus className="h-4 w-4 mr-1.5" /> Create Series</>}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg text-center font-semibold">
            {error}
          </div>
        )}

        {isCreating && (
          <form onSubmit={handleCreate} className="mb-10 p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 uppercase tracking-wider">New Series Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Series Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500" 
                  placeholder="e.g. The Lord of the Rings"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none h-20" 
                  placeholder="Briefly describe the overarching plot of this series..."
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto font-bold">
                Save Series
              </Button>
            </div>
          </form>
        )}

        {seriesList.length === 0 && !isCreating ? (
          <div className="text-center py-20 bg-zinc-100/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl">
            <FolderHeart className="h-12 w-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No Series Yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-2">
              Group your stories together so readers can follow along with your epic adventures sequentially!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.map((series) => (
              <div key={series._id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-2xl hover:border-blue-500/50 transition">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white truncate">{series.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 min-h-[32px]">{series.description || "No description provided."}</p>
                
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{series.stories?.length || 0} Stories</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
