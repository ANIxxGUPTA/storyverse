import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { Button } from "../ui/button";
import { apiFetch } from "../../lib/api";

interface AiAssistantSidebarProps {
  content: string;
  onSuggestionAccept: (suggestion: string) => void;
}

export function AiAssistantSidebar({ content, onSuggestionAccept }: AiAssistantSidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/ai/generate-chapter", { method: "POST", body: JSON.stringify({ prompt, context: content }) });
      if (res && res.content) {
        setSuggestion(res.content);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate ideas. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full rounded-2xl border border-indigo-500/30 bg-white dark:bg-zinc-900/50 p-5 shadow-sm flex flex-col">
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">AI Co-Writer</h3>
      </div>
      
      <div className="mt-4 flex-grow flex flex-col gap-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Need help expanding a scene, writing dialogue, or fixing grammar? Ask the AI co-writer.
        </p>

        <textarea
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none resize-none"
          rows={4}
          placeholder="e.g. Describe the dark enchanted forest vividly..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        
        {error && <p className="text-red-500 text-xs">{error}</p>}
        
        <Button 
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {loading ? "Thinking..." : "Generate Ideas"}
        </Button>

        {suggestion && (
          <div className="mt-4 flex-grow flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
            <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-wider">Suggestion</span>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap flex-grow overflow-y-auto max-h-48 mb-3">
              {suggestion}
            </div>
            <Button 
              size="sm"
              onClick={() => {
                onSuggestionAccept(suggestion);
                setSuggestion("");
                setPrompt("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
            >
              Accept & Insert
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
