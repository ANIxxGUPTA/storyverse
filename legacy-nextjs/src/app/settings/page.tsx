"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, User, Eye, Lock, Type, Palette, Save, CheckCircle2, AlertCircle } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Local preferences
  const [fontSize, setFontSize] = useState("medium");
  const [fontFamily, setFontFamily] = useState("serif");
  const [readingTheme, setReadingTheme] = useState("dark");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Load initial user details
    async function loadUserData() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUsername(data.user.username || "");
          setEmail(data.user.email || "");
          setBio(data.user.bio || "");
          setImage(data.user.image || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Load local storage preferences
    if (typeof window !== "undefined") {
      setFontSize(localStorage.getItem("pref-font-size") || "medium");
      setFontFamily(localStorage.getItem("pref-font-family") || "serif");
      setReadingTheme(localStorage.getItem("pref-reading-theme") || "dark");
    }

    if (status === "authenticated") {
      loadUserData();
    }
  }, [session, status]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (password && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const payload: any = { username, email, bio, image };
      if (password) payload.password = password;

      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings");
      }

      setSuccessMsg("Settings updated successfully!");
      setPassword("");
      setConfirmPassword("");

      // Update next-auth session
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: username,
            image: image,
          }
        });
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("pref-font-size", fontSize);
      localStorage.setItem("pref-font-family", fontFamily);
      localStorage.setItem("pref-reading-theme", readingTheme);
      
      // Update reading mode wrapper dynamically if exists
      document.documentElement.setAttribute("data-reading-theme", readingTheme);
    }
    setSuccessMsg("Reading preferences saved!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col bg-transparent">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <span className="text-sm text-zinc-500">Syncing settings profile...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-grow px-6 py-12">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200 transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspace
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Account Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Modify your creator credentials, biography details, and default reading panels.
        </p>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shrink-0">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Configurations Grid */}
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          
          {/* Main User Settings Forms */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Account Credentials block */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 pb-4 border-b border-zinc-300 dark:border-zinc-800/80">
                <User className="h-4 w-4 text-zinc-900 dark:text-white" />
                Profile Credentials
              </h2>

              <form onSubmit={handleProfileSubmit} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Avatar Image URL</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or similar image URL"
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Biographical Summary</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your writing credentials, interests, and profile details."
                    className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white resize-none leading-relaxed"
                  />
                </div>

                {/* Password block inside */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-zinc-900 dark:text-white" />
                    Change Account Password <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-normal">(Leave blank to keep current)</span>
                  </h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="mt-1.5 block w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "Saving Changes..." : "Save Account Settings"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side Preferences pane */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 p-6 backdrop-blur-md">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 pb-4 border-b border-zinc-300 dark:border-zinc-800/80">
                <Palette className="h-4 w-4 text-zinc-900 dark:text-white" />
                Reading Preferences
              </h2>

              <form onSubmit={handlePreferenceSave} className="mt-5 space-y-5">
                {/* Font Face selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Type className="h-3.5 w-3.5" />
                    Default Reading Font
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                  >
                    <option value="serif">Classical Serif (Merriweather)</option>
                    <option value="sans">Modern Sans (Geist)</option>
                    <option value="mono">Developer Mono (Space Mono)</option>
                  </select>
                </div>

                {/* Font Size selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Font Size Selection</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["small", "medium", "large"].map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`rounded-lg py-1.5 text-xs border font-medium capitalize transition ${
                          fontSize === size
                            ? "bg-indigo-600 border-indigo-500 text-white"
                            : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Reading Theme Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "dark", label: "Midnight", color: "bg-zinc-950 text-zinc-100 border-zinc-800" },
                      { id: "sepia", label: "Sepia", color: "bg-amber-100 text-amber-900 border-amber-200" },
                      { id: "light", label: "Daylight", color: "bg-white text-zinc-900 border-zinc-200" }
                    ].map((theme) => (
                      <button
                        type="button"
                        key={theme.id}
                        onClick={() => setReadingTheme(theme.id)}
                        className={`rounded-lg py-1.5 text-xs border font-medium transition ${theme.color} ${
                          readingTheme === theme.id
                            ? "ring-2 ring-zinc-900 dark:ring-white border-transparent font-semibold"
                            : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save preferences */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Apply Preferences</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
