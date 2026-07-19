import { useState } from "react";
import { User, Edit2, Check, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export function ProfileSidebar({ profile, setProfile }: { profile: any, setProfile: (p: any) => void }) {
  const { user } = useAuth();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarInput, setAvatarInput] = useState("");
  const [error, setError] = useState("");

  const handleEditBio = () => {
    setBioInput(profile?.bio || "");
    setIsEditingBio(true);
  };

  const handleEditAvatar = () => {
    setAvatarInput(profile?.image || "");
    setIsEditingAvatar(true);
  };

  const handleSaveBio = async () => {
    if (bioInput.length > 500) {
      setError("Bio cannot exceed 500 characters");
      return;
    }
    setError("");
    const originalProfile = { ...profile };
    // Optimistic Update
    setProfile({ ...profile, bio: bioInput });
    setIsEditingBio(false);

    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ bio: bioInput })
      });
    } catch (err: any) {
      // Rollback
      setProfile(originalProfile);
      setError(err.message || "Failed to update bio");
    }
  };

  const handleSaveAvatar = async () => {
    setError("");
    const originalProfile = { ...profile };
    // Optimistic Update
    setProfile({ ...profile, image: avatarInput });
    setIsEditingAvatar(false);

    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ image: avatarInput })
      });
    } catch (err: any) {
      // Rollback
      setProfile(originalProfile);
      setError(err.message || "Failed to update avatar");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-100/10 dark:bg-zinc-900/10 p-6">
      {error && <div className="mb-4 text-xs text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</div>}
      
      <div className="flex flex-col items-center text-center">
        <div className="relative group mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white dark:border-zinc-950 shadow-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            {profile?.image ? (
              <img src={profile.image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-zinc-400" />
            )}
          </div>
          <button 
            onClick={handleEditAvatar}
            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {isEditingAvatar ? (
          <div className="w-full mt-2 space-y-2">
            <input 
              type="text" 
              value={avatarInput} 
              onChange={e => setAvatarInput(e.target.value)}
              placeholder="Avatar URL"
              className="w-full text-xs p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950"
            />
            <div className="flex justify-center gap-2">
              <Button size="xs" variant="ghost" onClick={() => setIsEditingAvatar(false)}><X className="h-3 w-3" /></Button>
              <Button size="xs" className="bg-blue-600 text-white" onClick={handleSaveAvatar}><Check className="h-3 w-3" /></Button>
            </div>
          </div>
        ) : (
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {profile?.username || user?.username}
          </h2>
        )}

        <div className="w-full mt-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">About Me</h3>
            {!isEditingBio && (
              <button onClick={handleEditBio} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {isEditingBio ? (
            <div className="space-y-2">
              <textarea 
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
                maxLength={500}
                className="w-full text-sm p-2 rounded border dark:border-zinc-800 dark:bg-zinc-950 resize-none h-24"
                placeholder="Write a short bio..."
              />
              <div className="flex justify-end gap-2 text-xs text-zinc-500">
                <span>{bioInput.length}/500</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(false)}>Cancel</Button>
                <Button size="sm" className="bg-blue-600 text-white" onClick={handleSaveBio}>Save</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {profile?.bio || "No bio added yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
