import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BookOpen, Book, ArrowLeft, Heart, Plus, Loader2, CheckCircle2, Pencil, Trash2, Eye, ChevronDown, Play, FolderHeart } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

function SortableChapterItem({ chapter, story, isAuthor, navigate, handleDeleteChapter }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isAuthor ? attributes : {})}
      {...(isAuthor ? listeners : {})}
      onClick={() => navigate(`/stories/${story._id}/chapters/${chapter._id}`)}
      className="group flex flex-col justify-between p-4 transition rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-3 flex-grow">
        <span className="font-serif text-sm font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition mt-0.5">
          {chapter.chapterNumber}.
        </span>
        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition line-clamp-2">
          {chapter.title}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthor && (
            <>
              <Link 
                to={`/stories/${story._id}/chapters/${chapter._id}/edit`}
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteChapter(chapter._id); }}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
          {Math.max(1, Math.round((chapter.content?.split(/\s+/).filter(Boolean).length || 0) / 200))} min read
        </span>
      </div>
    </div>
  );
}

interface Author {
  _id: string;
  username: string;
  image?: string;
  bio?: string;
}

interface Story {
  _id: string;
  title: string;
  coverImage?: string;
  description: string;
  genre: string;
  tags: string[];
  views: number;
  likes: string[]; // User IDs
  createdAt: string;
  author: Author;
  authorId?: string;
}

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  content?: string;
  createdAt: string;
}

interface CollectionItem {
  _id: string;
  name: string;
  stories: string[] | any[];
}

export default function StoryDetail() {
  const { id = "" } = useParams();
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showListDropdown, setShowListDropdown] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((c) => c._id === active.id);
        const newIndex = items.findIndex((c) => c._id === over.id);
        const newChapters = arrayMove(items, oldIndex, newIndex);
        
        const updatedChapters = newChapters.map((ch, idx) => ({ ...ch, chapterNumber: idx + 1 }));
        
        const chapterIds = updatedChapters.map(c => c._id);
        apiFetch(`/api/stories/${id}/chapters/reorder`, {
          method: "PUT",
          body: JSON.stringify({ chapterIds })
        }).catch(err => {
          console.error("Failed to reorder", err);
          triggerToast("Failed to reorder chapters");
        });

        return updatedChapters;
      });
    }
  };


  const fetchStoryDetails = async () => {
    try {
      const res = await apiFetch(`/api/stories/${id}`);
        if (res) {
          setStory(res.story);
          setChapters(res.chapters || []);

          // Add to local storage for "Continue Reading" history
          try {
            const historyStr = localStorage.getItem('storyverse_history') || '[]';
            let history = JSON.parse(historyStr);
            
            // Remove if already exists to push it to the top
            history = history.filter((s: any) => s._id !== res.story._id);
            history.unshift({
              _id: res.story._id,
              title: res.story.title,
              coverImage: res.story.coverImage,
              genre: res.story.genre,
              author: res.story.author,
              views: res.story.views,
              viewedAt: new Date().toISOString()
            });
            
            // Keep only latest 10
            if (history.length > 10) history = history.slice(0, 10);
            
            localStorage.setItem('storyverse_history', JSON.stringify(history));
          } catch (e) {
            console.error('Failed to save reading history', e);
          }
        }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch story details");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!user?._id) return;
    try {
      const res = await apiFetch(`/api/collections`);
      if (res) {
        setCollections(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchStoryDetails();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [id, authLoading, user]);

  useEffect(() => {
    if (user) {
      fetchCollections();
    }
  }, [user]);

  const handleLikeToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const res = await apiFetch(`/api/stories/${id}/like`, { method: "POST" });
      if (res) {
        if (story) {
          setStory({ ...story, likes: res.likes });
          triggerToast(res.likes.includes(user._id) ? "Liked story!" : "Unliked story.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCollection = async (listId: string) => {
    try {
      const res = await apiFetch(`/api/collections/${listId}/add`, { method: "POST", body: JSON.stringify({ storyId: id }) });
      if (res) {
        triggerToast("Added to reading list!");
        setShowListDropdown(false);
        fetchCollections();
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.response?.data?.error || "Failed to add to list");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm("Are you sure you want to delete this chapter? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/stories/${id}/chapters/${chapterId}`, { method: "DELETE" });
      triggerToast("Chapter deleted");
      setChapters(chapters.filter((c) => c._id !== chapterId));
    } catch (err) {
      console.error(err);
      triggerToast("Failed to delete chapter");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center text-center py-20 min-h-[60vh]">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Log in to Read Stories</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-sm">
          You need an account to read stories, add them to your library, and support authors.
        </p>
        <Link to="/login">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Log In or Sign Up</Button>
        </Link>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center text-center py-20 min-h-screen">
        <h2 className="text-xl font-bold text-zinc-700 dark:text-zinc-300">Story not found</h2>
        <p className="mt-2 text-sm text-zinc-500">{error || "The story you are trying to view does not exist."}</p>
        <Link to="/" className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isAuthor = user && (user._id === story.author?._id || user._id === story.authorId?.toString());
  const likedCount = Array.isArray(story.likes) ? story.likes.length : 0;
  const hasLiked = user && story.likes.includes(user._id);

  const StoryCover = ({ coverImage, title }: { coverImage?: string; title: string }) => {
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
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
        <Book className="h-24 w-24 text-white/20 drop-shadow-sm" />
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-3 text-xs text-zinc-900 dark:text-white shadow-xl animate-slideIn">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-8">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Stories
        </Link>

        <div className="mt-6 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-lg shadow-black/40">
              <StoryCover coverImage={story.coverImage} title={story.title} />
            </div>
          </div>

          <div className="flex flex-col flex-grow space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-900 dark:text-white uppercase font-bold tracking-wider">
                  {story.genre || "Fiction"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                  <Eye className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                  {story.views || 0} views
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                {story.title}
              </h1>

              <div className="flex items-center gap-2">
                <Link to={`/profile/${story.author?._id || ""}`} className="group flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-zinc-900 dark:group-hover:text-white transition">
                    {story.author?.image ? (
                      <img src={story.author.image} alt="User" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      story.author?.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:text-zinc-200 transition">
                    By <strong className="font-semibold">{story.author?.username || "Unknown"}</strong>
                  </span>
                </Link>
              </div>

              {story.tags && story.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {story.tags.map((tag, tIdx) => (
                    <Link key={tIdx} to={`/search?tag=${tag}`}>
                      <span className="rounded bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-900/30 text-xs text-indigo-400 px-2 py-0.5 cursor-pointer transition">
                        #{tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Synopsis</h3>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {story.description}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6">
              {chapters.length > 0 ? (
                <Link to={`/stories/${story._id}/chapters/${chapters[0]._id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white border border-transparent flex items-center gap-1.5 shadow-md">
                    <Play className="h-4 w-4 fill-white" />
                    Start Reading
                  </Button>
                </Link>
              ) : (
                <Button disabled className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 border border-zinc-200 dark:border-zinc-900">
                  No Chapters Published
                </Button>
              )}

              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-1.5 border rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  hasLiked
                    ? "bg-red-900/20 border-red-500/30 text-red-500"
                    : "border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-700 hover:text-zinc-900 dark:text-white"
                }`}
              >
                <Heart className={`h-4 w-4 ${hasLiked ? "fill-red-500" : ""}`} />
                <span>{likedCount} Likes</span>
              </button>

              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowListDropdown(!showListDropdown)}
                    className="flex items-center gap-1.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-700 hover:text-zinc-900 dark:text-white rounded-lg px-4 py-2 text-xs font-semibold transition"
                  >
                    <FolderHeart className="h-4 w-4" />
                    <span>Add to List</span>
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </button>

                  {showListDropdown && (
                    <div className="absolute left-0 mt-1.5 z-40 w-48 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-2 shadow-xl animate-fadeIn">
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold p-1 border-b border-zinc-300 dark:border-zinc-800">
                        My Reading Lists:
                      </span>
                      {collections.length === 0 ? (
                        <div className="p-2 text-[10px] text-zinc-500 text-center">
                          Create reading lists on your dashboard first.
                        </div>
                      ) : (
                        <div className="space-y-1 pt-1 max-h-[160px] overflow-y-auto">
                          {collections.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => handleAddToCollection(c._id)}
                              className="w-full text-left rounded px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-800 hover:text-zinc-900 dark:text-white transition truncate"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isAuthor && (
                <Link to={`/stories/${story._id}/chapters/create`}>
                  <Button variant="outline" className="border-zinc-300 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                    <Plus className="mr-1.5 h-4 w-4 text-zinc-900 dark:text-white" />
                    Add Chapter
                  </Button>
                </Link>
              )}


            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-3 mb-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
              <BookOpen className="h-5 w-5 text-zinc-900 dark:text-white" />
              Table of Contents
            </h2>
            <span className="text-xs text-zinc-500 font-semibold uppercase">
              {chapters.length} Chapters
            </span>
          </div>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-100/40 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <BookOpen className="h-10 w-10 text-zinc-400 dark:text-zinc-600 animate-pulse" />
              <h3 className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">No chapters yet</h3>
              {isAuthor ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Create your first chapter to make this story available to readers.
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-500">
                  The author has not published any chapters yet. Stay tuned!
                </p>
              )}
              {isAuthor && (
                <Link to={`/stories/${story._id}/chapters/create`} className="mt-5">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    Publish First Chapter
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <SortableContext items={chapters.map(c => c._id)} strategy={rectSortingStrategy}>
                  {chapters.map((chapter) => (
                    <SortableChapterItem 
                      key={chapter._id} 
                      chapter={chapter} 
                      story={story} 
                      isAuthor={isAuthor} 
                      navigate={navigate} 
                      handleDeleteChapter={handleDeleteChapter} 
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>
      </main>
      

    </div>
  );
}
