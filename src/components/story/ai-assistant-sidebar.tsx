"use client";

import { useState } from "react";
import { Loader2, Sparkles, PenTool, Lightbulb, Zap } from "lucide-react";

interface AiAssistantSidebarProps {
  content: string;
  onSuggestionAccept?: (suggestion: string) => void;
}

export function AiAssistantSidebar({ content, onSuggestionAccept }: AiAssistantSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setLoading(true);
    setSuggestion(null);
    try {
      const selectedText = window.getSelection()?.toString();
      const textToProcess = selectedText ? selectedText : content;
      
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: textToProcess })
      });
      const data = await res.json();
      setSuggestion(data.suggestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 rounded-r-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/10">
        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">AI Writing Companion</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Highlight text in the editor and choose an AI action to enhance your writing.</p>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleAction("rewrite_polish")} 
              className="flex items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition gap-3 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 text-left"
            >
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                <PenTool className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Rewrite & Polish</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Improve flow and vocabulary</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleAction("expand_scene")} 
              className="flex items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition gap-3 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 text-left"
            >
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Expand Scene</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Add sensory details and depth</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleAction("brainstorm_next")} 
              className="flex items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition gap-3 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 text-left"
            >
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Brainstorm Next Steps</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Generate ideas for what happens next</div>
              </div>
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center p-6 gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[10px] font-semibold animate-pulse">AI is thinking...</span>
            </div>
          )}

          {suggestion && !loading && (
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 text-sm text-zinc-800 dark:text-zinc-200 relative animate-in fade-in slide-in-from-bottom-2 shadow-sm">
              <h4 className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">AI Suggestion</h4>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{suggestion}</p>
              {onSuggestionAccept && (
                <button 
                  onClick={() => onSuggestionAccept(suggestion)}
                  className="mt-4 w-full py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Insert to Editor
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
