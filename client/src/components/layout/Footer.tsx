import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Send, CheckCircle } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="border-t border-blue-500/20 bg-zinc-50 dark:bg-blue-950/10 text-zinc-600 dark:text-zinc-400 py-16 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-zinc-900 dark:text-white hover:opacity-90 transition">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">StoryVerse</span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500">
              The premier digital arena for writers and avid readers alike. Craft serial stories, connect with genre hubs, and track your creative analytics seamlessly.
            </p>
          </div>

          {/* Explore Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Company</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/search" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Advanced Search
                </Link>
              </li>
              <li>
                <Link to="/communities" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Genre Hubs
                </Link>
              </li>
              <li>
                <Link to="/#discover" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Trending Tales
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Info Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Platform</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <span className="cursor-not-allowed text-zinc-600">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-not-allowed text-zinc-600">Privacy Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Interactive */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">Newsletter</h4>
            <p className="text-xs leading-relaxed text-zinc-500">
              Receive updates on new collections, genre communities, and platform features.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-600 outline-none transition focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white"
              />
              <button
                type="submit"
                className="absolute right-1.5 rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700 transition"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {subscribed && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 animate-fadeIn">
                <CheckCircle className="h-3 w-3" />
                <span>Subscription successful! Welcome aboard.</span>
              </div>
            )}
          </div>
        </div>

        {/* Copyright Panel */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center border-t border-zinc-200 dark:border-zinc-900 pt-8 text-center">
          <p className="text-[10px] text-zinc-600">
            © {new Date().getFullYear()} StoryVerse Inc. All rights reserved. Crafted for visual elegance.
          </p>
        </div>
      </div>
    </footer>
  );
}
