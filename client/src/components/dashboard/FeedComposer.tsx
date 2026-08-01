import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { apiFetch } from "../../lib/api";

export function FeedComposer({ onPosted }: { onPosted: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim() || content.length > 1000) {
      setError("Post must be between 1 and 1000 characters");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/feed", {
        method: "POST",
        body: JSON.stringify({ content })
      });
      setContent("");
      onPosted();
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <FileText className="h-5 w-5 text-zinc-900 dark:text-white" />
        <h3 className="font-bold text-sm">Create New Feed Post</h3>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error && <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</div>}
        
        <textarea
          required
          maxLength={1000}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind? Share a snippet..."
          className="w-full text-sm p-3 rounded border dark:border-zinc-800 dark:bg-zinc-950 resize-none h-32 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{content.length}/1000</span>
          <Button type="submit" size="sm" disabled={loading || !content.trim()} className="bg-blue-600 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
