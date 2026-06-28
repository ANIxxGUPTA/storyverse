"use client";

import { useState, useEffect, use } from "react";
import rehypeRaw from "rehype-raw";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Loader2, Heart, Type, CheckCircle2, Play, Pause, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

interface Chapter {
  _id: string;
  title: string;
  chapterNumber: number;
  content: string;
  likes?: string[];
}

interface Story {
  _id: string;
  title: string;
}

interface NavigationChapter {
  _id: string;
  title: string;
  chapterNumber?: number;
}

export default function ReadingPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const params = use(paramsPromise);
  const { id, chapterId } = params;
  const { data: session } = useSession();
  const router = useRouter();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [prevChapter, setPrevChapter] = useState<NavigationChapter | null>(null);
  const [nextChapter, setNextChapter] = useState<NavigationChapter | null>(null);
  const [allChapters, setAllChapters] = useState<NavigationChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reading settings
  const [fontSize, setFontSize] = useState("medium"); // small, medium, large, xlarge
  const [fontFamily, setFontFamily] = useState("serif"); // serif, sans, mono
  const [readingTheme, setReadingTheme] = useState("dark"); // dark, sepia, light
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Chapter voting/liking
  const [chapterLikes, setChapterLikes] = useState<string[]>([]);

  // Scroll position bar percentage
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sync state
  const [syncStatus, setSyncStatus] = useState("");
  const [showChaptersDrawer, setShowChaptersDrawer] = useState(false);

  // Translation State
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Original");
  const [isTranslating, setIsTranslating] = useState(false);
  const LANGUAGES = ["Original", "Spanish", "French", "Japanese"];

  const handleTranslate = async (lang: string) => {
    setTargetLanguage(lang);
    if (lang === "Original") {
      setTranslatedContent(null);
      setTranslatedTitle(null);
      return;
    }
    
    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chapter?.content, title: chapter?.title, targetLanguage: lang })
      });
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedContent(data.translatedText);
      }
      if (data.translatedTitle) {
        setTranslatedTitle(data.translatedTitle);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Live Reactions State
  const [liveReactions, setLiveReactions] = useState<{ id: string; emoji: string; isLocal: boolean }[]>([]);

  useEffect(() => {
    if (!chapterId) return;
    const sse = new EventSource(`/api/live/reactions?chapterId=${chapterId}`);
    sse.onmessage = (e) => {
      try {
        const reaction = JSON.parse(e.data);
        if (session?.user?.id && reaction.userId === session.user.id) return;
        setLiveReactions(prev => [...prev, { ...reaction, isLocal: false }]);
        setTimeout(() => {
          setLiveReactions(prev => prev.filter(r => r.id !== reaction.id));
        }, 3000);
      } catch (err) {}
    };
    return () => sse.close();
  }, [chapterId, session]);

  const sendReaction = (emoji: string) => {
    const id = Math.random().toString(36).substring(7);
    setLiveReactions(prev => [...prev, { id, emoji, isLocal: true }]);
    setTimeout(() => {
      setLiveReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);

    fetch("/api/live/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, emoji, userId: session?.user?.id || "anon" })
    }).catch(console.error);
  };
  // Highlight state
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightMenuPos, setHighlightMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setHighlightMenuPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 40 // above selection
      });
      setSelectedText(selection.toString());
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  };

  const saveHighlight = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    try {
      await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: id, chapterId, text: selectedText }),
      });
      setSyncStatus("Highlight saved!");
      setTimeout(() => setSyncStatus(""), 2000);
      setShowHighlightMenu(false);
      window.getSelection()?.removeAllRanges();
    } catch (err) {
      console.error(err);
    }
  };

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const toggleTTS = () => {
    if (!chapter) return;
    
    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      // Clean markdown and HTML for better TTS reading
      const cleanContent = (translatedContent || chapter.content)
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown completely
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags like videos
        .replace(/[#*_>\[\]()\-`]/g, '') // Remove formatting characters
        .trim();
        
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const stopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Track Reading Session for Analytics
  useEffect(() => {
    if (!session || !chapter || !story) return;
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const durationInSeconds = Math.floor((endTime - startTime) / 1000);
      const wordsRead = chapter.content?.split(/\s+/).filter(Boolean).length || 0;

      // Only log if they read for at least 5 seconds
      if (durationInSeconds >= 5) {
        fetch("/api/users/journey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyId: story._id,
            chapterId: chapter._id,
            durationInSeconds,
            wordsRead
          }),
          keepalive: true
        }).catch(console.error);
      }
    };
  }, [session, chapter, story]);

  const trackScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const percentage = (window.scrollY / totalHeight) * 100;
      setScrollProgress(percentage);
    }
  };

  const registerReadingProgress = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/reading-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: id, chapterId }),
      });
      if (res.ok) {
        setSyncStatus("Progress saved.");
        setTimeout(() => setSyncStatus(""), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", trackScroll);
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);

  useEffect(() => {
    async function fetchChapterDetails() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/stories/${id}/chapters/${chapterId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Chapter not found");
          throw new Error("Failed to load chapter content");
        }
        const data = await res.json();
        setChapter(data.chapter);
        setStory(data.story);
        setPrevChapter(data.prevChapter);
        setNextChapter(data.nextChapter);
        setAllChapters(data.allChapters || []);
        setChapterLikes(data.chapter.likes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchChapterDetails();
  }, [id, chapterId]);

  // Sync progress once loaded and session is ready
  useEffect(() => {
    if (chapter && session) {
      registerReadingProgress();
    }
  }, [chapter, session]);

  // Load preferences from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFontSize(localStorage.getItem("pref-font-size") || "medium");
      setFontFamily(localStorage.getItem("pref-font-family") || "serif");
      setReadingTheme(localStorage.getItem("pref-reading-theme") || "dark");
    }
  }, []);

  const handleChapterLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/stories/${id}/chapters/${chapterId}/vote`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setChapterLikes(data.likes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !chapter || !story) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-300">Content unavailable</h2>
          <p className="mt-2 text-sm text-zinc-500">{error || "Unable to display this chapter."}</p>
          <Link href={`/stories/${id}`} className="mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Story</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Reading time
  const wordCount = chapter.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  // Style mappings
  const FONT_SIZES: Record<string, string> = {
    small: "text-sm leading-relaxed",
    medium: "text-base sm:text-lg leading-relaxed",
    large: "text-lg sm:text-xl leading-relaxed",
    xlarge: "text-xl sm:text-2xl leading-relaxed"
  };

  const FONT_FAMILIES: Record<string, string> = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono"
  };

  const THEMES: Record<string, { wrapper: string; text: string; uiText: string; uiBg: string; border: string; popover: string; button: string }> = {
    dark: { 
      wrapper: "bg-zinc-950 text-zinc-300", 
      text: "text-zinc-300", 
      uiText: "text-zinc-400 hover:text-white", 
      uiBg: "bg-zinc-900/40", 
      border: "border-zinc-800", 
      popover: "bg-zinc-900 border-zinc-800 text-zinc-200",
      button: "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700"
    },
    sepia: { 
      wrapper: "bg-[#f4ecd8] text-[#5b4636]", 
      text: "text-[#5b4636]", 
      uiText: "text-[#7a5e48] hover:text-[#3d2f24]", 
      uiBg: "bg-[#e8dcc4]/50", 
      border: "border-[#d8c5a3]", 
      popover: "bg-[#e8dcc4] border-[#d8c5a3] text-[#5b4636]",
      button: "border-[#d8c5a3] bg-[#e8dcc4]/40 text-[#7a5e48] hover:text-[#3d2f24] hover:border-[#c4b08a]"
    },
    light: { 
      wrapper: "bg-white text-zinc-900", 
      text: "text-zinc-800", 
      uiText: "text-zinc-600 hover:text-zinc-900", 
      uiBg: "bg-zinc-100/40", 
      border: "border-zinc-200", 
      popover: "bg-white border-zinc-200 text-zinc-800",
      button: "border-zinc-300 bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:border-zinc-400"
    }
  };

  const activeTheme = THEMES[readingTheme] || THEMES.dark;
  const isChapterLiked = session && chapterLikes.includes(session.user.id);

  return (
    <div className={`flex min-h-screen flex-col transition-all duration-300 ${activeTheme.wrapper}`}>
      
      {/* Scroll indicator bar at very top */}
      <div className="fixed top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-900 z-50">
        <div className="bg-blue-600 hover:bg-blue-700 h-full transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-grow px-6 py-8 relative">
        
        {/* Navigation to Story Details */}
        <div className={`flex items-center justify-between border-b ${activeTheme.border} pb-4`}>
          <Link href={`/stories/${id}`} className={`flex items-center gap-1.5 text-xs transition ${activeTheme.uiText}`}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Story
          </Link>
          
          <div className="flex items-center gap-4">
            {/* TTS trigger */}
            <button
              onClick={toggleTTS}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition ${activeTheme.uiText} ${activeTheme.border} ${activeTheme.uiBg} hover:opacity-80`}
              title="AI Voice Narration"
            >
              {isPlaying && !isPaused ? <Pause className="h-4 w-4 text-blue-500" /> : <Play className="h-4 w-4 text-blue-500" />}
              <span className="hidden sm:inline">{isPlaying && !isPaused ? "Pause Narration" : "AI Audiobook"}</span>
            </button>
            {isPlaying && (
              <button
                onClick={stopTTS}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/20`}
                title="Stop TTS"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Translation Dropdown */}
            <div className="relative group">
              <button
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition ${activeTheme.uiText} ${activeTheme.border} ${activeTheme.uiBg} hover:opacity-80`}
                title="AI Translation"
              >
                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin text-purple-500" /> : <Type className="h-4 w-4 text-purple-500" />}
                <span className="hidden sm:inline">{targetLanguage}</span>
              </button>
              <div className={`absolute right-0 mt-2 w-32 rounded-xl border p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${activeTheme.popover}`}>
                <div className="flex flex-col space-y-1">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => handleTranslate(lang)}
                      className={`text-left px-3 py-1.5 text-xs font-semibold rounded transition ${targetLanguage === lang ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preferences trigger */}
            <div className="flex items-center gap-3">
              {allChapters.length > 0 && (
                <button
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition hover:opacity-80 shadow-sm ${activeTheme.uiBg}`}
                  onClick={() => {
                    setShowChaptersDrawer(!showChaptersDrawer);
                    setShowConfigDrawer(false);
                  }}
                  title="Chapters"
                >
                  <BookOpen className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                  <span className="hidden sm:inline">Chapters</span>
                </button>
              )}
              <button
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition hover:opacity-80 shadow-sm ${activeTheme.uiBg}`}
                onClick={() => {
                  setShowConfigDrawer(!showConfigDrawer);
                  setShowChaptersDrawer(false);
                }}
                title="Aa Settings"
              >
                <Type className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                <span>Settings</span>
              </button>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block ${activeTheme.uiText}`}>
              {story.title}
            </span>
          </div>
        </div>

        {/* Floating preference drawer if toggled */}
        {showChaptersDrawer && (
          <div className={`absolute right-6 top-16 z-30 w-72 rounded-xl border p-4 shadow-xl animate-fadeIn max-h-[70vh] overflow-y-auto ${activeTheme.popover}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${activeTheme.border}`}>
              Table of Chapters
            </h4>
            <div className="mt-2 space-y-1">
              {allChapters.map((ch) => (
                <button
                  key={ch._id}
                  onClick={() => {
                    if (ch._id !== chapterId) {
                      router.push(`/stories/${id}/chapters/${ch._id}`);
                    }
                  }}
                  className={`w-full text-left rounded px-2 py-2 text-xs font-medium transition ${
                    ch._id === chapterId ? "bg-blue-600/10 text-blue-600 dark:text-blue-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {ch.chapterNumber}. {ch.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {showConfigDrawer && (
          <div className={`absolute right-6 top-16 z-30 w-72 rounded-xl border p-4 shadow-xl animate-fadeIn ${activeTheme.popover}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider pb-2 border-b ${activeTheme.border}`}>
              Reading Controls
            </h4>
            
            <div className="mt-4 space-y-4 text-xs">
              {/* Font face */}
              <div className="space-y-1.5">
                <span className="opacity-70 block text-[10px] uppercase font-semibold">Font Style</span>
                <div className="flex gap-2">
                  {["serif", "sans", "mono"].map((font) => (
                    <button
                      key={font}
                      onClick={() => {
                        setFontFamily(font);
                        localStorage.setItem("pref-font-family", font);
                      }}
                      className={`rounded px-2.5 py-1 capitalize font-medium transition ${
                        fontFamily === font ? "bg-blue-600 hover:bg-blue-700 text-white" : `${activeTheme.uiBg} hover:opacity-80`
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="space-y-1.5">
                <span className="opacity-70 block text-[10px] uppercase font-semibold">Font Size</span>
                <div className="flex gap-2">
                  {["small", "medium", "large", "xlarge"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setFontSize(sz);
                        localStorage.setItem("pref-font-size", sz);
                      }}
                      className={`rounded px-2.5 py-1 capitalize font-medium transition ${
                        fontSize === sz ? "bg-blue-600 hover:bg-blue-700 text-white" : `${activeTheme.uiBg} hover:opacity-80`
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette theme */}
              <div className="space-y-1.5">
                <span className="opacity-70 block text-[10px] uppercase font-semibold">Background Theme</span>
                <div className="flex gap-2">
                  {[
                    { id: "dark", label: "Dark" },
                    { id: "sepia", label: "Sepia" },
                    { id: "light", label: "Light" }
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        setReadingTheme(th.id);
                        localStorage.setItem("pref-reading-theme", th.id);
                        document.documentElement.setAttribute("data-reading-theme", th.id);
                      }}
                      className={`rounded px-2.5 py-1 capitalize font-medium transition ${
                        readingTheme === th.id ? "bg-blue-600 hover:bg-blue-700 text-white" : `${activeTheme.uiBg} hover:opacity-80`
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reader Container */}
        <article className="mt-12 py-6">
          {/* Header */}
          <header className="text-center">
            <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-widest block">
              Chapter {chapter.chapterNumber}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl font-serif">
              {translatedTitle || chapter.title}
            </h1>
            
            <div className="mt-8 flex justify-center">
              <div className={`h-1 w-12 rounded ${activeTheme.uiBg}`} />
            </div>
          </header>

          {/* Reading body */}
          <div 
            className={`mt-12 max-w-2xl mx-auto prose prose-sm dark:prose-invert max-w-none select-text selection:bg-blue-500/30 dark:selection:bg-blue-500/40 selection:text-zinc-900 dark:selection:text-white ${FONT_SIZES[fontSize]} ${FONT_FAMILIES[fontFamily]} ${activeTheme.text}`}
            onMouseUp={handleSelection}
            onTouchEnd={handleSelection}
          >
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-purple-500" />
                <p className="text-sm font-semibold uppercase tracking-wider text-purple-500">AI Translating to {targetLanguage}...</p>
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{translatedContent || chapter.content}</ReactMarkdown>
            )}
          </div>
          
          {/* Highlight Tooltip Popup */}
          {showHighlightMenu && (
            <div 
              className="fixed z-50 transform -translate-x-1/2 -translate-y-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn"
              style={{ top: highlightMenuPos.y, left: highlightMenuPos.x }}
            >
              <button onClick={saveHighlight} className="hover:text-blue-400 transition">Save Highlight</button>
              <span className="w-px h-3 bg-zinc-700 dark:bg-zinc-300 mx-1" />
              <button onClick={() => setShowHighlightMenu(false)} className="hover:text-red-400 transition">Cancel</button>
            </div>
          )}
        </article>

        {/* Chapter Liking / Voting Section */}
        <div className={`mt-12 border-t ${activeTheme.border} pt-6 flex flex-col items-center`}>
          <button
            onClick={handleChapterLike}
            className={`flex items-center gap-1.5 rounded-full border px-6 py-2.5 text-xs font-bold transition shadow ${
              isChapterLiked
                ? "bg-red-500 text-white border-red-600"
                : activeTheme.button
            }`}
          >
            <Heart className={`h-4 w-4 ${isChapterLiked ? "fill-white" : ""}`} />
            <span>Appreciate Chapter{chapterLikes.length > 0 ? ` (${chapterLikes.length})` : ""}</span>
          </button>
          <span className={`text-[9px] mt-2 block text-center ${activeTheme.uiText}`}>Enjoyed this chapter? Cast your appreciation vote!</span>
        </div>

        {/* Navigation footer */}
        <div className={`mt-20 border-t ${activeTheme.border} pt-8 flex items-center justify-between`}>
          <div>
            {prevChapter ? (
              <Link href={`/stories/${id}/chapters/${prevChapter._id}`}>
                <Button variant="outline" className={`flex items-center gap-1 ${activeTheme.button}`}>
                  <ChevronLeft className="h-4 w-4" />
                  <div className="text-left hidden sm:block">
                    <span className="block text-[9px] uppercase tracking-wider opacity-70">Previous</span>
                    <span className="block text-xs font-semibold max-w-[120px] truncate">{prevChapter.title}</span>
                  </div>
                </Button>
              </Link>
            ) : (
              <div className="w-10 h-1" />
            )}
          </div>

          <div className={`text-xs font-semibold ${activeTheme.uiText}`}>
            Chapter {chapter.chapterNumber}
          </div>

          <div>
            {nextChapter ? (
              <Link href={`/stories/${id}/chapters/${nextChapter._id}`}>
                <Button className={`flex items-center gap-1 ${activeTheme.button}`}>
                  <div className="text-right hidden sm:block">
                    <span className="block text-[9px] uppercase tracking-wider opacity-70">Next</span>
                    <span className="block text-xs font-semibold max-w-[120px] truncate">{nextChapter.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-900 dark:text-white" />
                </Button>
              </Link>
            ) : (
              <Link href={`/stories/${id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 hover:opacity-90">
                  <span>Story Details</span>
                  <BookOpen className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Live Reactions Container */}
        <div className="fixed bottom-32 right-12 z-50 pointer-events-none flex flex-col-reverse items-center justify-end h-64 w-16">
          {liveReactions.map(r => (
            <div 
              key={r.id} 
              className="absolute text-4xl animate-float-up opacity-0"
              style={{ 
                left: `${(r.id.charCodeAt(0) % 40) - 20}px`,
                animationDelay: `${r.isLocal ? '0ms' : '100ms'}`
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Floating Reaction Bar */}
        <div className={`fixed bottom-20 right-6 z-40 rounded-full border shadow-xl flex flex-col gap-2 p-2 ${activeTheme.popover}`}>
          {["❤️", "😂", "🤯", "🔥"].map(emoji => (
            <button 
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
