import { Navbar } from "@/components/layout/navbar";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-32 text-center">
        <div className="rounded-full border border-zinc-800 px-4 py-2 text-sm text-zinc-400">
          Writers • Readers • Communities
        </div>

        <h1 className="mt-8 max-w-4xl text-6xl font-bold tracking-tight">
          The Operating System for Storytellers
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-zinc-400">
          Publish stories, grow communities, share reels, and turn your stories
          into franchises.
        </p>

        <div className="mt-10 flex gap-4">
          <button className="rounded-lg bg-white px-6 py-3 font-medium text-black">
            Start Reading
          </button>

          <button className="rounded-lg border border-zinc-700 px-6 py-3">
            Become a Creator
          </button>
        </div>
      </section>
    </main>
  );
}