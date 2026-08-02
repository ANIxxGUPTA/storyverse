import { useEffect, useState } from "react";
import { ProfileSidebar } from "../components/dashboard/ProfileSidebar";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(user);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

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
