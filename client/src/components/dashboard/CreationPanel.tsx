import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { apiFetch } from "../../lib/api";

const GENRES = ["Fiction", "Fantasy", "Sci-Fi", "Romance", "Mystery", "Thriller", "Horror"];

export function CreationPanel({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Client-side validation
    if (!title.trim() || title.length > 100) {
      setError("Title must be between 1 and 100 characters");
      return;
    }
    if (!description.trim() || description.length > 5000) {
      setError("Description must be between 1 and 5000 characters");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/stories", {
        method: "POST",
        body: JSON.stringify({ title, coverImage, description, genre, tags }),
      });
      setTitle("");
      setCoverImage("");
      setDescription("");
      setGenre("Fiction");
      setTags("");
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <BookOpen className="h-5 w-5 text-zinc-900 dark:text-white" />
        <h3 className="font-bold text-sm">Create New Story</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-2 text-xs text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Story Title</label>
          <input 
            type="text" 
            required 
            maxLength={100}
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950" 
            placeholder="e.g. The Legend of the Lost Realm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Cover Image URL (Optional)</label>
          <input 
            type="text" 
            value={coverImage} 
            onChange={e => setCoverImage(e.target.value)} 
            className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950" 
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
          <textarea 
            required 
            maxLength={5000}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950 resize-none h-24" 
            placeholder="Summarize your story here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Genre</label>
            <select 
              value={genre} 
              onChange={e => setGenre(e.target.value)} 
              className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950"
            >
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags} 
              onChange={e => setTags(e.target.value)} 
              className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950" 
              placeholder="magic, dragons"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Story"}
          </Button>
        </div>
      </form>
    </div>
  );
}
