"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, LogOut, User as UserIcon, LayoutDashboard, Rss, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-white hover:opacity-90">
          <BookOpen className="h-5 w-5 text-orange-500" />
          <span className="text-lg">StoryVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className={`flex items-center gap-1.5 transition hover:text-zinc-100 ${
              isActive("/") ? "font-semibold text-zinc-100" : "text-zinc-400"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          <Link
            href="/feed"
            className={`flex items-center gap-1.5 transition hover:text-zinc-100 ${
              isActive("/feed") ? "font-semibold text-zinc-100" : "text-zinc-400"
            }`}
          >
            <Rss className="h-4 w-4" />
            <span>Feed</span>
          </Link>

          {status === "authenticated" && (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 transition hover:text-zinc-100 ${
                  isActive("/dashboard") ? "font-semibold text-zinc-100" : "text-zinc-400"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-xs text-zinc-500">Loading...</span>
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-zinc-400 sm:inline-block">
                Hi, <strong className="text-zinc-200">{session.user?.name}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:opacity-90">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}