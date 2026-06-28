"use client";

import Link from "next/link";
import { FolderHeart, Sparkles, BookOpen, Flame, Compass, MessageSquare } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const COMMUNITIES = [
  {
    id: "fantasy",
    name: "Fantasy Haven",
    genre: "Fantasy",
    description: "Spells, magic swords, mythical beasts, and realms beyond imagination. Discuss fantasy serials and share magical ideas.",
    color: "from-indigo-650 to-indigo-700",
    gradient: "from-indigo-600 to-indigo-750",
    glow: "bg-indigo-600/10",
    tagline: "Unleash Your Inner Mage",
  },
  {
    id: "sci-fi",
    name: "Sci-Fi Nexus",
    genre: "Sci-Fi",
    description: "Space operas, cyberpunk grids, AI rebellions, and distant stars. Connect with fellow futurists and hard sci-fi fans.",
    color: "from-cyan-600 to-blue-700",
    gradient: "from-cyan-500 to-blue-700",
    glow: "bg-cyan-550/10",
    tagline: "Explore the Cosmic Grid",
  },
  {
    id: "romance",
    name: "Romance Oasis",
    genre: "Romance",
    description: "Wholesome relationships, dramatic encounters, and heart-melting serial chapters. Meet romance storytellers here.",
    color: "from-pink-500 to-rose-650",
    gradient: "from-pink-500 to-rose-600",
    glow: "bg-pink-500/10",
    tagline: "Chronicle Heartfelt Journeys",
  },
  {
    id: "mystery",
    name: "Mystery Vault",
    genre: "Mystery",
    description: "Clues, noir detectives, hidden truths, and plot twists. Solve puzzles and review thrillers with the community.",
    color: "from-sky-600 to-blue-700",
    gradient: "from-sky-500 to-blue-600",
    glow: "bg-blue-500/10",
    tagline: "Decode Unsolved Secrets",
  },
  {
    id: "thriller",
    name: "Thriller Station",
    genre: "Thriller",
    description: "High stakes, psychological loops, suspense, and immediate action. Discuss the fastest-paced serials.",
    color: "from-red-650 to-red-800",
    gradient: "from-red-600 to-red-800",
    glow: "bg-red-600/10",
    tagline: "Adrenaline-fueled Serials",
  },
  {
    id: "adventure",
    name: "Adventure Guild",
    genre: "Adventure",
    description: "Lost realms, pirate voyages, ancient ruins, and survival. Swap tales of epic expeditions and heroism.",
    color: "from-emerald-600 to-teal-700",
    gradient: "from-emerald-500 to-teal-650",
    glow: "bg-emerald-500/10",
    tagline: "Embark on Epic Quests",
  },
];

export default function CommunitiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-6 py-12">
        {/* Hero Header */}
        <section className="relative text-center pb-12 border-b border-zinc-200 dark:border-zinc-900">
          <div className="absolute top-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
          
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 backdrop-blur-md">
            <FolderHeart className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
            Genre Hub Communities
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Join a{" "}
            <span className="bg-gradient-to-r from-orange-450 via-rose-500 to-indigo-600 bg-clip-text text-transparent">
              Genre Community
            </span>
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Participate in localized chat feeds, discover stories filtered by category, and collaborate directly with niche readers.
          </p>
        </section>

        {/* Communities Grid */}
        <section className="mt-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITIES.map((c) => (
              <div
                key={c.id}
                className="relative group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-6 transition duration-300 hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100/40 dark:bg-zinc-900/40"
              >
                {/* Glowing glow bubble on hover */}
                <div className={`absolute -right-12 -top-12 -z-10 h-32 w-32 rounded-full ${c.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                  {c.tagline}
                </span>

                <h3 className="mt-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  {c.name}
                </h3>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-h-[60px]">
                  {c.description}
                </p>

                {/* Info Pills */}
                <div className="mt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-900 pt-4">
                  <div className="flex items-center gap-3 text-[10px] text-zinc-550 text-zinc-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-zinc-900 dark:text-white/80" />
                      <span>{c.genre} Category</span>
                    </span>
                  </div>

                  <Link href={`/communities/${c.id}`}>
                    <button className={`rounded-lg bg-gradient-to-r ${c.gradient} px-4 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white hover:opacity-90 transition`}>
                      Enter Hub
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
