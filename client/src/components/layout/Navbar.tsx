import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeProvider";
import { BookOpen, LogOut, LayoutDashboard, Home, Search, Settings, User as UserIcon, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, logout, authLoading } = useAuth();
  const status = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";
  const session = user ? { user: { name: user.username } } : null;
  
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-90 transition">
          <BookOpen className="h-5 w-5 text-zinc-900 dark:text-white" />
          <span className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">StoryVerse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/"
            className={`flex items-center gap-1.5 transition ${
              isActive("/") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          
          <Link
            to="/search"
            className={`flex items-center gap-1.5 transition ${
              isActive("/search") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Link>

          {status === "authenticated" && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 transition ${
                  isActive("/dashboard") ? "font-semibold text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

            </>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition min-w-[34px] min-h-[34px]"
          >
            {mounted ? (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <div className="h-4 w-4" />}
          </button>

          {status === "loading" ? (
            <span className="text-xs text-zinc-500">Loading...</span>
          ) : status === "authenticated" ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-zinc-600 dark:text-zinc-400 sm:inline-block">
                Hi, <strong className="text-zinc-800 dark:text-zinc-200">{session?.user?.name}</strong>
              </span>



              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white hover:opacity-90">
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
