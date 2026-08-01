import { useEffect, useState } from "react";
import { ProfileSidebar } from "../components/dashboard/ProfileSidebar";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/users/me");
        if (res) {
          setProfile(res);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 min-h-screen flex justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Profile Settings
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your personal information and bio.
          </p>
        </div>
        <ProfileSidebar profile={profile} setProfile={setProfile} />
      </div>
    </div>
  );
}
