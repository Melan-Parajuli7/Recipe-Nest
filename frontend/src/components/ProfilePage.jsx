import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const API_BASE_URL = "http://localhost:3000";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("myRecipes");
  const [user, setUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const avatarInputRef = useRef(null);

  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState("");

  const [editRecipe, setEditRecipe] = useState(null);
  const [editRecipeData, setEditRecipeData] = useState({});
  const [editRecipeLoading, setEditRecipeLoading] = useState(false);

  const token = localStorage.getItem("jwtToken");
  const authHeader = { Authorization: `Bearer ${token}` };

  const getImageUrl = (rawPath) => {
    if (!rawPath) return null;
    const pathStr = String(rawPath).replace(/\\/g, "/");
    if (pathStr.startsWith("http")) return pathStr;
    const normalized = pathStr.replace("profilePics", "profile_pics");
    const idx = normalized.toLowerCase().indexOf("uploads/");
    if (idx !== -1) return `${API_BASE_URL}/${normalized.substring(idx)}`;
    return `${API_BASE_URL}/uploads/profile_pics/${normalized}`;
  };

  // ── Fetch profile ───────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, { headers: authHeader });
      const data = await res.json();
      if (data.success) {
        const userData = data.data?.user || data.user || data.data;
        setUser(userData);
        setEditName(userData?.name || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch MY recipes ────────────────────────────────────
  const fetchMyRecipes = async () => {
    setRecipeLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/my-recipes`, {
        headers: authHeader,
      });
      const data = await res.json();
      setMyRecipes(data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRecipeLoading(false);
    }
  };

  // ── Fetch saved recipes ─────────────────────────────────
  const fetchSavedRecipes = async () => {
    setRecipeLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/saved`, {
        headers: authHeader,
      });
      const data = await res.json();
      setSavedRecipes(data.recipes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRecipeLoading(false);
    }
  };

  useEffect(() => {
    setUser(null);
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === "myRecipes") fetchMyRecipes();
    if (activeTab === "saved") fetchSavedRecipes();
  }, [user, activeTab]);

  // ── Update profile ──────────────────────────────────────
  const handleUpdateProfile = async () => {
    setEditLoading(true);
    setEditMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (data.success) {
        const userData = data.data?.user || data.user || data.data;
        setUser(userData);
        localStorage.setItem("loggedInUser", editName);
        setEditMsg("✅ Profile updated!");
      } else {
        setEditMsg("❌ " + (data.message || "Update failed"));
      }
    } catch (err) {
      setEditMsg("❌ Network error");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Update avatar ───────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: "PATCH",
        headers: authHeader,
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        fetchProfile();
        setEditMsg("✅ Avatar updated!");
      } else setEditMsg("❌ " + (data.message || "Avatar update failed"));
    } catch (err) {
      setEditMsg("❌ Network error");
    }
  };

  // ── Delete avatar ───────────────────────────────────────
  const handleDeleteAvatar = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/avatar`, {
        method: "DELETE",
        headers: authHeader,
      });
      const data = await res.json();
      if (data.success) {
        fetchProfile();
        setEditMsg("✅ Avatar removed");
      }
    } catch (err) {
      setEditMsg("❌ Network error");
    }
  };

  // ── Delete recipe ───────────────────────────────────────
  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}`, {
        method: "DELETE",
        headers: authHeader,
      });
      const data = await res.json();
      if (data.success)
        setMyRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Toggle publish / draft ──────────────────────────────
  const handleToggleStatus = async (recipe) => {
    const newStatus = recipe.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/recipes/${recipe._id}/status`,
        {
          method: "PATCH",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMyRecipes((prev) =>
          prev.map((r) =>
            r._id === recipe._id ? { ...r, status: newStatus } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ── Open edit recipe modal ──────────────────────────────
  const openEditRecipe = (recipe) => {
    setEditRecipe(recipe);
    setEditRecipeData({
      title: recipe.title,
      description: recipe.description,
      shortDescription: recipe.shortDescription || "",
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine || "",
    });
  };

  const handleSaveEditRecipe = async () => {
    setEditRecipeLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${editRecipe._id}`, {
        method: "PUT",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify(editRecipeData),
      });
      const data = await res.json();
      if (data.success) {
        setMyRecipes((prev) =>
          prev.map((r) =>
            r._id === editRecipe._id ? { ...r, ...editRecipeData } : r
          )
        );
        setEditRecipe(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditRecipeLoading(false);
    }
  };

  // ── Logout ──────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        headers: authHeader,
      });
    } catch (_) {}
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0e0b08",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8955a",
          fontFamily: "Georgia, serif",
          fontSize: 18,
        }}
      >
        Loading profile...
      </div>
    );

  const avatarUrl = getImageUrl(user?.avatar);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .pp-root { min-height: 100vh; background: #0e0b08; color: #f0e8dc; font-family: 'DM Sans', sans-serif; padding-bottom: 90px; }

        .pp-hero {
          position: relative;
          padding: 50px 20px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          overflow: hidden;
        }
        .pp-hero-bg {
          position: absolute; inset: 0;
          background: url('/images/bghome.jpg') center/cover no-repeat;
          filter: brightness(0.25);
        }
        .pp-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, #0e0b08 100%);
        }
        .pp-avatar-wrap { position: relative; z-index: 1; width: 88px; height: 88px; }
        .pp-avatar { width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 2.5px solid #e8955a; }
        .pp-avatar-placeholder {
          width: 88px; height: 88px; border-radius: 50%;
          background: rgba(232,149,90,0.15); border: 2.5px solid #e8955a;
          display: flex; align-items: center; justify-content: center; font-size: 34px;
        }
        .pp-name { position: relative; z-index: 1; font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 600; text-align: center; }
        .pp-stats { position: relative; z-index: 1; display: flex; gap: 28px; margin-top: 6px; }
        .pp-stat { text-align: center; }
        .pp-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: #e8955a; display: block; }
        .pp-stat-label { font-size: 11px; color: rgba(240,232,220,0.45); text-transform: uppercase; letter-spacing: 0.8px; }

        .pp-tabs {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: sticky; top: 0;
          background: rgba(14,11,8,0.95);
          backdrop-filter: blur(12px); z-index: 10;
        }
        .pp-tab {
          background: none; border: none; color: rgba(240,232,220,0.4);
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          padding: 16px 8px; cursor: pointer;
          border-bottom: 2px solid transparent; transition: all 0.2s;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
        }
        .pp-tab.active { color: #e8955a; border-bottom-color: #e8955a; }
        .pp-tab-icon { font-size: 18px; }

        .pp-body { padding: 20px 18px; }

        .pp-recipe-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          display: flex; gap: 12px;
          padding: 12px; margin-bottom: 14px;
          align-items: flex-start;
        }
        .pp-recipe-thumb { width: 78px; height: 78px; object-fit: cover; border-radius: 10px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.08); }
        .pp-recipe-thumb-placeholder {
          width: 78px; height: 78px; border-radius: 10px;
          background: rgba(232,149,90,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.06);
        }
        .pp-recipe-info { flex: 1; min-width: 0; }
        .pp-recipe-title { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pp-recipe-meta { font-size: 12px; color: rgba(240,232,220,0.45); margin-bottom: 8px; }
        .pp-recipe-actions { display: flex; gap: 7px; flex-wrap: wrap; }
        .pp-action-btn { font-size: 11px; padding: 5px 12px; border-radius: 16px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.18s; }
        .pp-btn-edit { background: rgba(232,149,90,0.15); color: #e8955a; border: 1px solid rgba(232,149,90,0.3); }
        .pp-btn-edit:hover { background: rgba(232,149,90,0.25); }
        .pp-btn-delete { background: rgba(244,67,54,0.1); color: #f77; border: 1px solid rgba(244,67,54,0.25); }
        .pp-btn-delete:hover { background: rgba(244,67,54,0.2); }
        .pp-btn-status { background: rgba(255,255,255,0.06); color: rgba(240,232,220,0.6); border: 1px solid rgba(255,255,255,0.1); }
        .pp-btn-status:hover { background: rgba(255,255,255,0.1); }
        .pp-status-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; margin-left: 6px; font-weight: 500; }
        .pp-badge-published { background: rgba(76,175,80,0.15); color: #81c784; border: 1px solid rgba(76,175,80,0.25); }
        .pp-badge-draft { background: rgba(255,193,7,0.12); color: #ffd54f; border: 1px solid rgba(255,193,7,0.25); }

        .pp-settings { display: flex; flex-direction: column; gap: 20px; }
        .pp-settings-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
        .pp-settings-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #e8955a; font-weight: 600; }
        .pp-label { font-size: 11px; color: rgba(240,232,220,0.45); letter-spacing: 0.8px; text-transform: uppercase; }
        .pp-input, .pp-textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f0e8dc; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 11px 13px; width: 100%; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
        .pp-input:focus, .pp-textarea:focus { border-color: rgba(232,149,90,0.6); }
        .pp-save-btn { background: linear-gradient(135deg, #e8955a, #c9612a); border: none; color: #fff; padding: 12px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(232,149,90,0.35); }
        .pp-save-btn:hover { transform: translateY(-1px); }
        .pp-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .pp-edit-msg { font-size: 13px; text-align: center; padding: 6px 0; }
        .pp-avatar-actions { display: flex; gap: 10px; }
        .pp-avatar-btn { flex: 1; padding: 10px; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.18s; }
        .pp-avatar-btn-change { background: rgba(232,149,90,0.12); border: 1px solid rgba(232,149,90,0.3); color: #e8955a; }
        .pp-avatar-btn-change:hover { background: rgba(232,149,90,0.2); }
        .pp-avatar-btn-remove { background: rgba(244,67,54,0.08); border: 1px solid rgba(244,67,54,0.2); color: #f77; }
        .pp-avatar-btn-remove:hover { background: rgba(244,67,54,0.15); }
        .pp-logout-btn { background: rgba(244,67,54,0.08); border: 1px solid rgba(244,67,54,0.25); color: #f77; padding: 14px; border-radius: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; width: 100%; transition: all 0.2s; }
        .pp-logout-btn:hover { background: rgba(244,67,54,0.15); }

        .pp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 999; display: flex; align-items: flex-end; }
        .pp-modal { background: #1a1410; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 24px 20px 100px; width: 100%; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
        .pp-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: #e8955a; margin-bottom: 4px; }
        .pp-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pp-modal-save { background: linear-gradient(135deg, #e8955a, #c9612a); border: none; color: #fff; padding: 13px; border-radius: 10px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .pp-modal-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .pp-modal-cancel { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,232,220,0.6); padding: 13px; border-radius: 10px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; }

        .pp-empty { text-align: center; padding: 50px 20px; color: rgba(240,232,220,0.3); }
        .pp-empty-icon { font-size: 44px; margin-bottom: 12px; }
        .pp-empty-text { font-size: 15px; font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <div className="pp-root">
        {/* Hero */}
        <div className="pp-hero">
          <div className="pp-hero-bg" />
          <div className="pp-hero-overlay" />
          <div className="pp-avatar-wrap">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="pp-avatar"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="pp-avatar-placeholder">👤</div>
            )}
          </div>
          <div className="pp-name">
            {user?.name || localStorage.getItem("loggedInUser") || "Chef"}
          </div>
          <div className="pp-stats">
            <div className="pp-stat">
              <span className="pp-stat-val">{myRecipes.length}</span>
              <span className="pp-stat-label">Recipes</span>
            </div>
            <div className="pp-stat">
              <span className="pp-stat-val">{savedRecipes.length}</span>
              <span className="pp-stat-label">Saved</span>
            </div>
            <div className="pp-stat">
              <span className="pp-stat-val">
                {myRecipes.reduce((a, r) => a + (r.viewCount || 0), 0)}
              </span>
              <span className="pp-stat-label">Views</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pp-tabs">
          <button
            className={`pp-tab ${activeTab === "myRecipes" ? "active" : ""}`}
            onClick={() => setActiveTab("myRecipes")}
          >
            <span className="pp-tab-icon">🍳</span>My Recipes
          </button>
          <button
            className={`pp-tab ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <span className="pp-tab-icon">🔖</span>Saved
          </button>
          <button
            className={`pp-tab ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="pp-tab-icon">⚙️</span>Settings
          </button>
        </div>

        <div className="pp-body">
          {/* MY RECIPES */}
          {activeTab === "myRecipes" &&
            (recipeLoading ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">⏳</div>
                <div className="pp-empty-text">Loading your recipes...</div>
              </div>
            ) : myRecipes.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">🍽️</div>
                <div className="pp-empty-text">You haven't posted any recipes yet</div>
              </div>
            ) : (
              myRecipes.map((recipe) => {
                const imgUrl = getImageUrl(recipe.thumbnail || recipe.images?.[0]);
                return (
                  <div key={recipe._id} className="pp-recipe-card">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={recipe.title}
                        className="pp-recipe-thumb"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="pp-recipe-thumb-placeholder">🍳</div>
                    )}
                    <div className="pp-recipe-info">
                      <div className="pp-recipe-title">
                        {recipe.title}
                        <span className={`pp-status-badge ${recipe.status === "published" ? "pp-badge-published" : "pp-badge-draft"}`}>
                          {recipe.status}
                        </span>
                      </div>
                      <div className="pp-recipe-meta">
                        ⏱ {recipe.cookTime}m · 🍽 {recipe.servings} · {recipe.category}
                      </div>
                      <div className="pp-recipe-actions">
                        <button className="pp-action-btn pp-btn-edit" onClick={() => openEditRecipe(recipe)}>✏️ Edit</button>
                        <button className="pp-action-btn pp-btn-status" onClick={() => handleToggleStatus(recipe)}>
                          {recipe.status === "published" ? "⬇️ Draft" : "🚀 Publish"}
                        </button>
                        <button className="pp-action-btn pp-btn-delete" onClick={() => handleDeleteRecipe(recipe._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ))}

          {/* SAVED */}
          {activeTab === "saved" &&
            (recipeLoading ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">⏳</div>
                <div className="pp-empty-text">Loading saved recipes...</div>
              </div>
            ) : savedRecipes.length === 0 ? (
              <div className="pp-empty">
                <div className="pp-empty-icon">🔖</div>
                <div className="pp-empty-text">No saved recipes yet</div>
              </div>
            ) : (
              savedRecipes.map((recipe) => {
                const imgUrl = getImageUrl(recipe.thumbnail || recipe.images?.[0]);
                return (
                  <div key={recipe._id} className="pp-recipe-card">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={recipe.title}
                        className="pp-recipe-thumb"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="pp-recipe-thumb-placeholder">🍳</div>
                    )}
                    <div className="pp-recipe-info">
                      <div className="pp-recipe-title">{recipe.title}</div>
                      <div className="pp-recipe-meta">
                        ⏱ {recipe.cookTime}m · by {recipe.author?.name || "Chef"}
                      </div>
                    </div>
                  </div>
                );
              })
            ))}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="pp-settings">
              {/* Profile Picture */}
              <div className="pp-settings-section">
                <div className="pp-settings-title">Profile Picture</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid #e8955a" }}
                    />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(232,149,90,0.15)", border: "2px solid #e8955a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                      👤
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <div className="pp-avatar-actions">
                  <button className="pp-avatar-btn pp-avatar-btn-change" onClick={() => avatarInputRef.current?.click()}>
                    📷 Change Photo
                  </button>
                  {avatarUrl && (
                    <button className="pp-avatar-btn pp-avatar-btn-remove" onClick={handleDeleteAvatar}>
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Profile — name only */}
              <div className="pp-settings-section">
                <div className="pp-settings-title">Edit Profile</div>
                <span className="pp-label">Name</span>
                <input
                  className="pp-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
                {editMsg && <div className="pp-edit-msg">{editMsg}</div>}
                <button className="pp-save-btn" onClick={handleUpdateProfile} disabled={editLoading}>
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* Account */}
              <div className="pp-settings-section">
                <div className="pp-settings-title">Account</div>
                <button className="pp-logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Recipe Bottom Sheet */}
      {editRecipe && (
        <div className="pp-modal-overlay" onClick={() => setEditRecipe(null)}>
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal-title">Edit Recipe</div>
            <span className="pp-label">Title</span>
            <input
              className="pp-input"
              value={editRecipeData.title}
              onChange={(e) => setEditRecipeData({ ...editRecipeData, title: e.target.value })}
            />
            <span className="pp-label">Short Description</span>
            <input
              className="pp-input"
              value={editRecipeData.shortDescription}
              onChange={(e) => setEditRecipeData({ ...editRecipeData, shortDescription: e.target.value })}
            />
            <span className="pp-label">Description</span>
            <textarea
              className="pp-textarea"
              value={editRecipeData.description}
              onChange={(e) => setEditRecipeData({ ...editRecipeData, description: e.target.value })}
            />
            <div className="pp-modal-row">
              <div>
                <span className="pp-label">Cook Time (min)</span>
                <input
                  className="pp-input"
                  type="number"
                  value={editRecipeData.cookTime}
                  onChange={(e) => setEditRecipeData({ ...editRecipeData, cookTime: e.target.value })}
                />
              </div>
              <div>
                <span className="pp-label">Servings</span>
                <input
                  className="pp-input"
                  type="number"
                  value={editRecipeData.servings}
                  onChange={(e) => setEditRecipeData({ ...editRecipeData, servings: e.target.value })}
                />
              </div>
            </div>
            <div className="pp-modal-row">
              <div>
                <span className="pp-label">Difficulty</span>
                <select
                  className="pp-input"
                  value={editRecipeData.difficulty}
                  onChange={(e) => setEditRecipeData({ ...editRecipeData, difficulty: e.target.value })}
                  style={{ background: "#1a1410" }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <span className="pp-label">Cuisine</span>
                <input
                  className="pp-input"
                  value={editRecipeData.cuisine}
                  onChange={(e) => setEditRecipeData({ ...editRecipeData, cuisine: e.target.value })}
                />
              </div>
            </div>
            <button className="pp-modal-save" onClick={handleSaveEditRecipe} disabled={editRecipeLoading}>
              {editRecipeLoading ? "Saving..." : "Save Changes"}
            </button>
            <button className="pp-modal-cancel" onClick={() => setEditRecipe(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProfilePage;