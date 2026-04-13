import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSuccess } from "./utils";
import { ToastContainer } from "react-toastify";

const API_BASE_URL = "http://localhost:3000";

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Dessert", value: "dessert" },
  { label: "Beverage", value: "beverage" },
];

const HomePage = () => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // Set of recipe IDs that the current user has saved
  const [savedIds, setSavedIds] = useState(new Set());
  // Tracks which save buttons are mid-request (to prevent double-click)
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    setLoggedInUser(user || "");
    // Kick off both data fetches after mount — never during render
    fetchRecipes();
    fetchSavedIds();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("loggedInUser");
    handleSuccess("Logged out successfully");
    setTimeout(() => navigate("/login"), 500);
  };

  // ── Fetch all recipes ──────────────────────────────────────────────────
  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      if (Array.isArray(data)) setRecipes(data);
      else if (data?.recipes && Array.isArray(data.recipes)) setRecipes(data.recipes);
      else if (data?.data && Array.isArray(data.data)) setRecipes(data.data);
      else setRecipes([]);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch saved recipe IDs so we can pre-highlight saved cards ─────────
  const fetchSavedIds = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/recipes/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      const list = data.recipes || data.data || data || [];
      if (Array.isArray(list)) {
        setSavedIds(new Set(list.map((r) => r._id)));
      }
    } catch (err) {
      console.error("Error fetching saved IDs:", err);
    }
  };

  // (both fetches are triggered in the useEffect above)

  // ── Toggle save / unsave ───────────────────────────────────────────────
  const handleToggleSave = async (e, recipeId) => {
    // Prevent the card click (modal open) from firing
    e.stopPropagation();

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
    if (savingId === recipeId) return; // already in-flight

    setSavingId(recipeId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/save`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save");

      // Optimistically update the local saved set
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) {
          next.add(recipeId);
          handleSuccess("Recipe saved! 🔖");
        } else {
          next.delete(recipeId);
          handleSuccess("Recipe removed from saved.");
        }
        return next;
      });
    } catch (err) {
      console.error("Toggle save error:", err);
    } finally {
      setSavingId(null);
    }
  };

  // ── Image helper ──────────────────────────────────────────────────────
  const getImageUrl = (rawPath) => {
    if (!rawPath) return null;
    const pathStr = String(rawPath);
    const uploadsIndex = pathStr.toLowerCase().indexOf("uploads");
    if (uploadsIndex !== -1) {
      let cleanPath = pathStr.substring(uploadsIndex).replace(/\\/g, "/");
      return `${API_BASE_URL}/${cleanPath}`;
    }
    return pathStr.startsWith("/uploads") ? `${API_BASE_URL}${pathStr}` : null;
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      activeCategory === "all" ||
      (recipe.category && recipe.category.toLowerCase() === activeCategory);
    const matchesSearch =
      searchQuery.trim() === "" ||
      (recipe.title && recipe.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === "easy") return "#4caf50";
    if (difficulty === "medium") return "#ff9800";
    return "#f44336";
  };

  return (
    <>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <img src="/images/bghome.jpg" alt="background" className="landing-bg" />

      <div className="hp-greeting">
        <h1 className="hp-greeting-title">
          {getGreeting()}, {loggedInUser || "Guest"}
        </h1>
        <p className="hp-greeting-sub">May you Have a Delicious Day...</p>
      </div>

      <div className="hp-root">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search for a recipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="cat-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`cat-btn${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && (
          <p className="hp-result-count">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Recipe Grid */}
        {loading ? (
          <p className="hp-loading-text">Loading delicious recipes...</p>
        ) : (
          <div className="recipe-grid">
            {filteredRecipes.length === 0 ? (
              <div className="no-results">
                <div className="no-results-emoji">🍽️</div>
                <div className="no-results-text">No recipes found. Try a different search!</div>
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                const imageUrl = getImageUrl(
                  recipe.images?.[0] || recipe.image || recipe.thumbnail
                );
                const isSaved = savedIds.has(recipe._id);
                const isLoading = savingId === recipe._id;

                return (
                  <div
                    key={recipe._id}
                    className="recipe-card"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="recipe-card-img-wrap">
                      <img
                        src={
                          imageUrl ||
                          "https://placehold.co/400x210/e8d5b0/7a5c1e?text=No+Image"
                        }
                        alt={recipe.title}
                        className="recipe-card-img"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/400x210/e8d5b0/7a5c1e?text=No+Image";
                        }}
                      />
                      {recipe.category && (
                        <span className="recipe-card-badge">{recipe.category}</span>
                      )}

                      {/* ── SAVE / BOOKMARK BUTTON ── */}
                      <button
                        className={`recipe-save-btn${isSaved ? " saved" : ""}`}
                        onClick={(e) => handleToggleSave(e, recipe._id)}
                        disabled={isLoading}
                        title={isSaved ? "Remove from saved" : "Save recipe"}
                        aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
                      >
                        {isLoading ? (
                          <span className="save-spinner" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            fill={isSaved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="recipe-card-body">
                      <h3 className="recipe-card-title">{recipe.title}</h3>
                      <p className="recipe-card-desc">
                        {recipe.shortDescription || recipe.description}
                      </p>
                      <div className="recipe-card-meta">
                        {recipe.cookTime && (
                          <span className="recipe-meta-pill">⏱ {recipe.cookTime} min</span>
                        )}
                        {recipe.servings && (
                          <span className="recipe-meta-pill">🍽 {recipe.servings} servings</span>
                        )}
                        {recipe.difficulty && (
                          <span
                            className="recipe-difficulty"
                            style={{ background: getDifficultyColor(recipe.difficulty) }}
                          >
                            {recipe.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRecipe(null)}>
              ✕
            </button>

            {(() => {
              const img = getImageUrl(
                selectedRecipe.images?.[0] || selectedRecipe.image || selectedRecipe.thumbnail
              );
              return (
                <img
                  src={img || "https://placehold.co/720x280/e8d5b0/7a5c1e?text=No+Image"}
                  alt={selectedRecipe.title}
                  className="modal-img"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/720x280/e8d5b0/7a5c1e?text=No+Image";
                  }}
                />
              );
            })()}

            <div className="modal-content">
              {selectedRecipe.category && (
                <span className="modal-category">{selectedRecipe.category}</span>
              )}
              <h2 className="modal-title">{selectedRecipe.title}</h2>
              <p className="modal-desc">{selectedRecipe.description}</p>

              <div className="modal-stats">
                {selectedRecipe.cookTime && (
                  <div className="modal-stat">
                    <span className="modal-stat-val">⏱ {selectedRecipe.cookTime}m</span>
                    <span className="modal-stat-label">Cook Time</span>
                  </div>
                )}
                {selectedRecipe.servings && (
                  <div className="modal-stat">
                    <span className="modal-stat-val">🍽 {selectedRecipe.servings}</span>
                    <span className="modal-stat-label">Servings</span>
                  </div>
                )}
                {selectedRecipe.difficulty && (
                  <div className="modal-stat">
                    <span
                      className="modal-stat-val"
                      style={{ color: getDifficultyColor(selectedRecipe.difficulty) }}
                    >
                      {selectedRecipe.difficulty.charAt(0).toUpperCase() +
                        selectedRecipe.difficulty.slice(1)}
                    </span>
                    <span className="modal-stat-label">Difficulty</span>
                  </div>
                )}
                {selectedRecipe.cuisine && (
                  <div className="modal-stat">
                    <span className="modal-stat-val">🌍</span>
                    <span className="modal-stat-label">{selectedRecipe.cuisine}</span>
                  </div>
                )}
                {selectedRecipe.averageRating > 0 && (
                  <div className="modal-stat">
                    <span className="modal-stat-val">
                      ⭐ {selectedRecipe.averageRating.toFixed(1)}
                    </span>
                    <span className="modal-stat-label">Rating</span>
                  </div>
                )}
              </div>

              {selectedRecipe.ingredients?.length > 0 && (
                <>
                  <h3 className="modal-section-title">Ingredients</h3>
                  <ul className="ingredient-list">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="ingredient-item">
                        <span>🥄</span>
                        <span>
                          <strong>
                            {ing.quantity} {ing.unit}
                          </strong>{" "}
                          {ing.name}
                          {ing.isOptional && (
                            <em className="ingredient-optional"> (optional)</em>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selectedRecipe.steps?.length > 0 && (
                <>
                  <h3 className="modal-section-title">Instructions</h3>
                  <ul className="step-list">
                    {selectedRecipe.steps.map((step, i) => (
                      <li key={i} className="step-item">
                        <span className="step-num">{step.stepNumber || i + 1}</span>
                        <span className="step-text">{step.instruction}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {selectedRecipe.tips?.length > 0 && (
                <>
                  <h3 className="modal-section-title">💡 Tips</h3>
                  <div className="modal-tips">
                    {selectedRecipe.tips.map((tip, i) => (
                      <p key={i} className="modal-tip">
                        • {tip}
                      </p>
                    ))}
                  </div>
                </>
              )}

              {selectedRecipe.nutrition &&
                Object.values(selectedRecipe.nutrition).some((v) => v !== null) && (
                  <>
                    <h3 className="modal-section-title">Nutrition (per serving)</h3>
                    <div className="modal-stats modal-stats--nutrition">
                      {selectedRecipe.nutrition.calories && (
                        <div className="modal-stat">
                          <span className="modal-stat-val">
                            {selectedRecipe.nutrition.calories}
                          </span>
                          <span className="modal-stat-label">Calories</span>
                        </div>
                      )}
                      {selectedRecipe.nutrition.protein && (
                        <div className="modal-stat">
                          <span className="modal-stat-val">
                            {selectedRecipe.nutrition.protein}g
                          </span>
                          <span className="modal-stat-label">Protein</span>
                        </div>
                      )}
                      {selectedRecipe.nutrition.carbs && (
                        <div className="modal-stat">
                          <span className="modal-stat-val">
                            {selectedRecipe.nutrition.carbs}g
                          </span>
                          <span className="modal-stat-label">Carbs</span>
                        </div>
                      )}
                      {selectedRecipe.nutrition.fat && (
                        <div className="modal-stat">
                          <span className="modal-stat-val">{selectedRecipe.nutrition.fat}g</span>
                          <span className="modal-stat-label">Fat</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

              {selectedRecipe.tags?.length > 0 && (
                <>
                  <h3 className="modal-section-title">Tags</h3>
                  <div className="modal-tags">
                    {selectedRecipe.tags.map((tag, i) => (
                      <span key={i} className="modal-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default HomePage;