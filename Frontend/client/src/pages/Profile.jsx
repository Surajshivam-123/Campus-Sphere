import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Save, X, Edit2, Loader2 } from "lucide-react";
import API_URL from "../config/api";
import fetchWithAuth from "../config/fetchWithAuth";
import { formatDate } from "../utils/helpers";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullname, setFullname] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [avatarPrompt, setAvatarPrompt] = useState("");
  const [aiAvatarUrl, setAiAvatarUrl] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleGenerateAIAvatar = async () => {
    if (!avatarPrompt.trim()) {
      setError("Please enter a prompt to generate an avatar.");
      return;
    }
    setIsGeneratingAvatar(true);
    setError("");
    setMessage("");
    try {
      const response = await fetchWithAuth(`${API_URL}/api/cpsh/users/generate-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: avatarPrompt }),
        timeout: 60000,
      });
      const result = await response.json();
      if (response.ok && result?.data?.url) {
        setAiAvatarUrl(result.data.url);
        setAvatarPreview(result.data.url);
        setAvatarFile(null); // Clear manual upload file if they choose AI
      } else {
        setError(result?.message || "Failed to generate AI avatar.");
      }
    } catch (err) {
      console.error("AI avatar generation error:", err);
      setError("Something went wrong generating avatar.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/cpsh/users/profile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result?.statusCode === 200) {
        setUser(result?.data);
        setFullname(result?.data?.fullname || "");
        setAvatarPreview(result?.data?.avatar || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAiAvatarUrl("");
    }
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!fullname.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (aiAvatarUrl) {
        formData.append("avatarUrl", aiAvatarUrl);
      }

      const response = await fetchWithAuth(`${API_URL}/api/cpsh/users/profile`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();
      if (response.ok || result?.success || result?.statusCode === 200) {
        setUser(result?.data);
        setMessage("Profile updated successfully!");
        setIsEditing(false);
        setAvatarFile(null);
        // Reload to ensure everything is refreshed
        window.location.reload();
      } else {
        setError(result?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFullname(user?.fullname || "");
    setAvatarPreview(user?.avatar || "");
    setAvatarFile(null);
    setAvatarPrompt("");
    setAiAvatarUrl("");
    setIsEditing(false);
    setError("");
    setMessage("");
  };

  if (!user)
    return (
      <div
        className="flex justify-center items-center min-h-screen text-sm"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}
      >
        Loading profile…
      </div>
    );

  return (
    <div
      className="min-h-screen flex justify-center items-center py-12 px-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md mx-auto p-8 rounded-lg shadow-sm border relative overflow-hidden"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Subtle decorative gold top line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

        <div className="flex flex-col items-center">
          
          {/* Avatar Container */}
          <div className="relative mb-6 group">
            {avatarPreview ? (
              <img
                className="w-28 h-28 rounded-xl object-cover border shadow-md"
                style={{ borderColor: "var(--color-border)" }}
                src={avatarPreview}
                alt="Profile"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-xl border flex items-center justify-center text-white text-4xl font-bold select-none shadow-md"
                style={{ backgroundColor: "var(--color-navy)", borderColor: "var(--color-border)" }}
              >
                {fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            {/* Camera Overlay when Editing */}
            {isEditing && (
              <button
                type="button"
                onClick={handleTriggerFileSelect}
                className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="h-6 w-6 animate-pulse" />
              </button>
            )}

            {isGeneratingAvatar && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="view-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col items-center"
              >
                <h2
                  className="font-heading text-2xl font-bold tracking-tight mb-1"
                  style={{ color: "var(--color-navy)" }}
                >
                  {user.fullname}
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>

                <div
                  className="w-16 h-[2px] mb-6"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-gold) 40%, transparent)" }}
                />

                <div className="w-full text-left space-y-5">
                  <div>
                    <h3
                      className="text-xs font-semibold uppercase tracking-widest border-b pb-2 mb-3"
                      style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
                    >
                      User details
                    </h3>
                    <div className="space-y-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      <p className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Username</span>
                        <span className="font-semibold" style={{ color: "var(--color-navy)" }}>{user.username}</span>
                      </p>
                      <p className="flex justify-between">
                        <span style={{ color: "var(--color-text-muted)" }}>Joined</span>
                        <span className="font-semibold" style={{ color: "var(--color-navy)" }}>{formatDate(user.createdAt)}</span>
                      </p>
                    </div>
                  </div>

                  {message && (
                    <p className="text-xs text-center text-success font-medium bg-success/5 border border-success/15 py-2 px-3 rounded">{message}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full btn-gold py-2.5 flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-md"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="edit-profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSave}
                className="w-full space-y-4"
              >
                <div>
                  <label
                    htmlFor="fullname"
                    className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="input-base"
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Email Address
                  </label>
                  <input
                    type="text"
                    className="input-base opacity-60 cursor-not-allowed"
                    value={user.email}
                    disabled
                  />
                  <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                    Email address cannot be changed.
                  </span>
                </div>

                <div className="border-t pt-4 space-y-2" style={{ borderColor: "var(--color-border)" }}>
                  <label
                    className="block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Generate AI Avatar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. A cool panda wearing sunglasses"
                      value={avatarPrompt}
                      onChange={(e) => setAvatarPrompt(e.target.value)}
                      className="input-base flex-grow text-sm"
                      disabled={isGeneratingAvatar || isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={handleGenerateAIAvatar}
                      disabled={isGeneratingAvatar || isSubmitting || !avatarPrompt.trim()}
                      className="btn-primary py-2 px-3 text-xs font-semibold shrink-0"
                      style={{
                        background: "linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))",
                        color: "var(--color-navy)",
                      }}
                    >
                      {isGeneratingAvatar ? "Generating..." : "Generate"}
                    </button>
                  </div>
                  <span className="text-[10px] block" style={{ color: "var(--color-text-muted)" }}>
                    Or click the camera overlay on your avatar to upload a file manually.
                  </span>
                </div>

                {error && (
                  <p className="text-xs text-center text-error font-medium bg-error/5 border border-error/15 py-2 px-3 rounded">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="w-1/2 btn-secondary py-2.5 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 btn-gold py-2.5 flex items-center justify-center gap-1.5 cursor-pointer font-semibold shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
