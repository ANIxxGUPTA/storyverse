export function Navbar() {
  return (
    <header className="border-b border-zinc-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <h1 className="text-xl font-bold">StoryVerse</h1>

        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <span>Stories</span>
          <span>Reels</span>
          <span>Community</span>
          <span>Dashboard</span>
        </nav>
      </div>
    </header>
  );
}