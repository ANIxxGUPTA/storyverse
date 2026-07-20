import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";
import { useFetch } from "../lib/hooks/useFetch";
import { ChapterList } from "../components/dashboard/ChapterList";

export default function StoryEditor() {
  const { id } = useParams();
  const { data, loading, error } = useFetch<any>(`/api/stories/${id}`);

  if (loading) {
    return (
      <div className="flex flex-grow items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-red-500">
        Error loading story.
      </div>
    );
  }

  const { story, chapters } = data;

  return (
    <main className="mx-auto w-full max-w-4xl flex-grow px-6 py-8">
      <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition mb-6">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6 sticky top-24">
            {story.coverImage ? (
              <img src={story.coverImage} className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm mb-4" />
            ) : (
              <div className="w-full aspect-[2/3] bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-800">
                <BookOpen className="h-10 w-10 text-zinc-400" />
              </div>
            )}
            <h2 className="text-xl font-bold">{story.title}</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">{story.genre}</p>
            <p className="text-sm mt-4 text-zinc-600 dark:text-zinc-400 line-clamp-4">{story.description}</p>
          </div>
        </div>

        <div className="md:w-2/3">
          <ChapterList storyId={story._id} initialChapters={chapters} />
        </div>
      </div>
    </main>
  );
}
