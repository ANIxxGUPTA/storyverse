import { Sparkles, Wand2, Image as ImageIcon, Bot } from "lucide-react";

export function AiFeaturesBanner() {
  return (
    <div className="mt-8 mb-8 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 border border-purple-500/30 p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-20 transform rotate-12">
        <Sparkles className="h-48 w-48 text-purple-300" />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          Supercharge Your Writing with AI
        </h2>
        <p className="text-sm text-zinc-300 mb-8 max-w-2xl">
          Unlock your creative potential with our suite of AI-powered tools designed specifically for storytellers. Here is where you can find them:
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-indigo-500/50 transition duration-300 shadow-xl group">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wand2 className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white mb-1">AI Story Generator</h3>
            <p className="text-xs text-zinc-400 mb-4 line-clamp-2">Stuck on ideas? Generate complete story outlines, titles, and tags instantly.</p>
            <div className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 inline-block px-2.5 py-1 rounded-md">
              📍 Location: <strong>Write Story</strong> page
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-pink-500/50 transition duration-300 shadow-xl group">
            <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ImageIcon className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="font-bold text-white mb-1">AI Cover Art</h3>
            <p className="text-xs text-zinc-400 mb-4 line-clamp-2">Bring your world to life with stunning, AI-generated book covers based on your prompts.</p>
            <div className="text-[10px] font-mono text-pink-300 bg-pink-500/20 border border-pink-500/30 inline-block px-2.5 py-1 rounded-md">
              📍 Location: <strong>Write Story</strong> page
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition duration-300 shadow-xl group">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-bold text-white mb-1">AI Co-Writer</h3>
            <p className="text-xs text-zinc-400 mb-4 line-clamp-2">Your personal editor. Expand scenes, rewrite dialogue, and overcome writer's block.</p>
            <div className="text-[10px] font-mono text-purple-300 bg-purple-500/20 border border-purple-500/30 inline-block px-2.5 py-1 rounded-md">
              📍 Location: <strong>Chapter Editor</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
