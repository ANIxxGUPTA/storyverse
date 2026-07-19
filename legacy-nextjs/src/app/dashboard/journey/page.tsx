"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, BookOpen, Clock, Heart, Loader2, Sparkles, User, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface JourneyData {
  totalWords: number;
  totalHours: string;
  averageWPM: number;
  topGenres: { name: string; count: number }[];
  favoriteAuthors: { username: string; count: number }[];
  heatmap: Record<string, number>;
}

export default function ReaderJourneyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/users/journey")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setJourney(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (loading || status === "loading") {
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

  // Generate heatmap boxes for the last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = journey?.heatmap[dateStr] || 0;
    return { dateStr, count };
  });

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-grow px-6 py-8">
        <Link href="/library" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition mb-6">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Library
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-500" />
            Your Reader Journey
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Insights and analytics about your reading habits, speed, and favorites.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Stat Cards */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Activity className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Avg Reading Speed</h3>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {journey?.averageWPM || 0} <span className="text-sm font-semibold text-zinc-500">WPM</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <Clock className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Total Time Read</h3>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {journey?.totalHours || "0.0"} <span className="text-sm font-semibold text-zinc-500">Hours</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/40 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <BookOpen className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Total Words</h3>
            </div>
            <div className="text-3xl font-black text-zinc-900 dark:text-white">
              {journey?.totalWords.toLocaleString() || 0} <span className="text-sm font-semibold text-zinc-500">Words</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Top Genres */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Heart className="h-4 w-4 text-rose-500" />
              Top Genres
            </h3>
            {journey?.topGenres && journey.topGenres.length > 0 ? (
              <ul className="space-y-3">
                {journey.topGenres.map((g, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{g.name}</span>
                    <span className="text-xs text-zinc-500 font-medium bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{g.count} reads</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500">No genre data yet. Start reading!</p>
            )}
          </div>

          {/* Favorite Authors */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <User className="h-4 w-4 text-indigo-500" />
              Favorite Authors
            </h3>
            {journey?.favoriteAuthors && journey.favoriteAuthors.length > 0 ? (
              <ul className="space-y-3">
                {journey.favoriteAuthors.map((a, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">@{a.username}</span>
                    <span className="text-xs text-zinc-500 font-medium bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{a.count} interactions</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500">No author data yet.</p>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <CalendarDays className="h-4 w-4 text-emerald-500" />
            Reading Activity (Last 30 Days)
          </h3>
          
          <div className="flex flex-wrap gap-1 mt-4">
            {last30Days.map((day, i) => {
              let colorClass = "bg-zinc-200 dark:bg-zinc-800";
              if (day.count > 0) colorClass = "bg-emerald-300 dark:bg-emerald-800";
              if (day.count > 2) colorClass = "bg-emerald-400 dark:bg-emerald-600";
              if (day.count > 5) colorClass = "bg-emerald-500 dark:bg-emerald-500";
              
              return (
                <div 
                  key={i} 
                  title={`${day.dateStr}: ${day.count} sessions`}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${colorClass} transition hover:scale-110 cursor-pointer`}
                />
              )
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
