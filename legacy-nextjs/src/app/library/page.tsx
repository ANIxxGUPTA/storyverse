"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Plus, Loader2, Heart, Eye, FolderHeart, BookMarked, CheckCircle2, Trash2, Search } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface ReadingProgressItem {
  _id: string;
  storyId: {
    _id: string;
    title: string;
    coverImage?: string;
    authorName?: string;
  };
  chapterId: {
    _id: string;
    title: string;
    chapterNumber: number;
  };
  progressPercent: number;
  lastReadAt: string;
}

interface ReadingList {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  stories: {
    _id: string;
    title: string;
    coverImage?: string;
  }[];
}

export default function LibraryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [readingProgress, setReadingProgress] = useState<ReadingProgressItem[]>([]);
  const [collections, setCollections] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"progress" | "collections">("progress");

  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [newCollectionPrivate, setNewCollectionPrivate] = useState(false);
  const [creatingList, setCreatingList] = useState(false);

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

  const fetchLibraryData = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      const progressRes = await fetch("/api/reading-progress");
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setReadingProgress(progressData);
      }

      const collectionsRes = await fetch(`/api/collections?userId=${session.user.id}`);
      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json();
        setCollections(collectionsData);
      }
    } catch (error) {
      console.error("Library fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchLibraryData();
    }
  }, [session, status]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreatingList(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDesc,
          isPrivate: newCollectionPrivate,
        }),
      });

      if (res.ok) {
        const newList = await res.json();
        setCollections([newList, ...collections]);
        setNewCollectionName("");
        setNewCollectionDesc("");
        setNewCollectionPrivate(false);
        triggerToast("Reading list created successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteCollection = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this reading list?")) return;

    try {
      const res = await fetch(`/api/collections/${listId}`, { method: "DELETE" });
      if (res.ok) {
        setCollections(collections.filter(c => c._id !== listId));
        triggerToast("Reading list deleted.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
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
      <div className="flex h-full w-full items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-[8px] text-center px-1 font-serif">
        {title.slice(0, 10)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-zinc-900 dark:text-white shadow-xl animate-slideIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-200 dark:border-zinc-900 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">My Library</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Continue reading your stories and manage your curated lists.
            </p>
          </div>
          <Link href="/search">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 font-semibold text-white flex items-center gap-1.5 hover:opacity-90">
              <Search className="h-4 w-4" />
              <span>Discover Stories</span>
            </Button>
          </Link>
        </div>

        <div className="mt-8 border-b border-zinc-200 dark:border-zinc-900 flex gap-6 overflow-x-auto pb-0.5">
          {[
            { id: "progress", label: `Continue Reading (${readingProgress.length})` },
            { id: "collections", label: `Reading Lists (${collections.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-500 text-zinc-900 dark:text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="mt-6">
          {activeTab === "progress" && (
            readingProgress.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 py-16 text-center">
                <BookMarked className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mx-auto" />
                <h3 className="mt-4 font-bold text-zinc-600 dark:text-zinc-300">Your reading shelf is empty</h3>
                <p className="mt-1 text-xs text-zinc-500">Once you start reading chaptered serials, they'll sync here.</p>
                <Link href="/search" className="mt-5 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">Browse Stories</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {readingProgress.map((item) => (
                  <div key={item._id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800">
                          <StoryMiniCover coverImage={item.storyId?.coverImage} title={item.storyId?.title || "Story"} />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-xs line-clamp-1">{item.storyId?.title || "Deleted Story"}</h4>
                          <span className="text-[9px] text-zinc-500">By {item.storyId?.authorName || "Author"}</span>
                        </div>
                      </div>
                      <div className="mt-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-2 text-[10px]">
                        <span className="text-zinc-500 font-semibold block">Last Read Chapter:</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-bold mt-0.5 block truncate">
                          Ch {item.chapterId?.chapterNumber || 1}: {item.chapterId?.title || "Intro"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-600 dark:text-zinc-400 pb-1">
                        <span>Reading Progress</span>
                        <span className="font-bold">{item.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-900">
                        <div className="bg-zinc-800 dark:bg-zinc-200 h-full transition-all duration-300" style={{ width: `${item.progressPercent}%` }} />
                      </div>
                      <Link href={`/stories/${item.storyId?._id}/chapters/${item.chapterId?._id}`} className="block mt-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 flex items-center justify-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Resume Reading</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "collections" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-zinc-900 dark:text-white" />
                    Create Reading List
                  </h3>
                  <form onSubmit={handleCreateCollection} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">List Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chill Sci-Fi"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</label>
                      <textarea
                        rows={3}
                        placeholder="Explain list curation criteria (optional)..."
                        value={newCollectionDesc}
                        onChange={(e) => setNewCollectionDesc(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-900 dark:focus:border-white resize-none leading-relaxed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Make Private</label>
                      <input
                        type="checkbox"
                        checked={newCollectionPrivate}
                        onChange={(e) => setNewCollectionPrivate(e.target.checked)}
                        className="h-3.5 w-3.5 accent-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={creatingList}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 mt-2"
                    >
                      {creatingList ? "Creating..." : "Save List"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                {collections.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                    You have not curated any reading lists yet. Define one on the left.
                  </div>
                ) : (
                  collections.map((list) => (
                    <div key={list._id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 p-5">
                      <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{list.name}</h4>
                            <span className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2 py-0.5 text-[8px] text-zinc-500 uppercase">
                              {list.isPrivate ? "Private" : "Public"}
                            </span>
                          </div>
                          {list.description && (
                            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{list.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCollection(list._id)}
                          className="text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition"
                          title="Delete List"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Stories in this List:</span>
                        {list.stories.length === 0 ? (
                          <p className="text-[10px] text-zinc-500 italic mt-1.5">No stories added. Browse story detail pages to add them.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2.5 mt-2">
                            {list.stories.map((story) => (
                              <Link key={story._id} href={`/stories/${story._id}`}>
                                <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                                  <div className="h-6 w-4 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-900">
                                    <StoryMiniCover coverImage={story.coverImage} title={story.title} />
                                  </div>
                                  <span className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate max-w-[120px] font-medium">{story.title}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
