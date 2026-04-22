import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleSuccess } from "../../shared/utils/utils";  
 
const API_BASE_URL = "http://localhost:3000";

const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);        // ← This was missing
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [unsavingId, setUnsavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  // Fetch Saved Recipes
  const fetchSavedRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/recipes/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("jwtToken");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch (Status: ${response.status})`);
      }

      const data = await response.json();
      const list = data.recipes || data.data || [];
      setSavedRecipes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      setError(err.message);
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, [navigate]);

  // Unsave / Toggle Handler
  const handleUnsave = async (e, recipeId) => {
    e.stopPropagation();
    if (unsavingId === recipeId) return;

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setUnsavingId(recipeId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${recipeId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unsave recipe");
      }

      if (data.saved === false) {
        setSavedRecipes((prev) => prev.filter((r) => r._id !== recipeId));
        if (selectedRecipe?._id === recipeId) setSelectedRecipe(null);
        handleSuccess("Recipe removed from saved.");
      }
    } catch (err) {
      console.error("Unsave error:", err);
    } finally {
      setUnsavingId(null);
    }
  };

  const getImageUrl = (rawPath) => {
    if (!rawPath) return null;
    const pathStr = String(rawPath);
    const uploadsIndex = pathStr.toLowerCase().indexOf("uploads");
    if (uploadsIndex !== -1) {
      return `${API_BASE_URL}/${pathStr.substring(uploadsIndex).replace(/\\/g, "/")}`;
    }
    return pathStr.startsWith("/uploads") ? `${API_BASE_URL}${pathStr}` : null;
  };

  const getDifficultyColor = (d) =>
    d === "easy" ? "#4caf50" : d === "medium" ? "#ff9800" : "#f44336";

  const filteredRecipes = savedRecipes.filter(
    (r) =>
      !searchQuery || r?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <img src="/images/bghome.jpg" alt="background" className="landing-bg" />

      <div className="hp-greeting">
        <h1 className="hp-greeting-title">🔖 Saved Recipes</h1>
        <p className="hp-greeting-sub">Your personal collection of favourites</p>
      </div>

      <div className="hp-root">
        {/* Search Bar */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search saved recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {!loading && !error && (
          <p className="hp-result-count">
            {filteredRecipes.length} saved recipe{filteredRecipes.length !== 1 ? "s" : ""}
          </p>
        )}

        {error && (
          <div className="error-message" style={{ color: "red", textAlign: "center", padding: "20px" }}>
            <p>{error}</p>
            <button onClick={fetchSavedRecipes}>Try Again</button>
          </div>
        )}

        {loading ? (
          <p className="hp-loading-text">Fetching your saved recipes...</p>
        ) : filteredRecipes.length === 0 && !error ? (
          <div className="no-results">
            <div className="no-results-emoji">🔖</div>
            <div className="no-results-text">
              {searchQuery
                ? "No saved recipes match your search."
                : "You haven't saved any recipes yet. Go explore and bookmark some!"}
            </div>
          </div>
        ) : (
          <div className="recipe-grid">
            {filteredRecipes.map((recipe) => {
              const imageUrl = getImageUrl(
                recipe?.images?.[0] || recipe?.thumbnail || recipe?.image
              );
              const isRemoving = unsavingId === recipe._id;

              return (
                <div
                  key={recipe._id}
                  className="recipe-card"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="recipe-card-img-wrap">
                    <img
                      src={imageUrl || "https://placehold.co/400x210/e8d5b0/7a5c1e?text=No+Image"}
                      alt={recipe.title || "Recipe"}
                      className="recipe-card-img"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x210/e8d5b0/7a5c1e?text=No+Image";
                      }}
                    />
                    {recipe.category && (
                      <span className="recipe-card-badge">{recipe.category}</span>
                    )}

                    <button
                      className="recipe-save-btn saved"
                      onClick={(e) => handleUnsave(e, recipe._id)}
                      disabled={isRemoving}
                      title="Remove from saved"
                    >
                      {isRemoving ? (
                        <span className="save-spinner" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="recipe-card-body">
                    <h3 className="recipe-card-title">{recipe.title || "Untitled Recipe"}</h3>
                    <p className="recipe-card-desc">
                      {recipe.shortDescription || recipe.description || "No description available"}
                    </p>
                    <div className="recipe-card-meta">
                      {recipe.cookTime && <span className="recipe-meta-pill">⏱ {recipe.cookTime} min</span>}
                      {recipe.servings && <span className="recipe-meta-pill">🍽 {recipe.servings} servings</span>}
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
            })}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal - Keep your existing modal code here */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedRecipe(null)}>✕</button>

            {/* Your modal content (image, title, ingredients, steps, etc.) goes here */}
            {/* ... paste your existing modal JSX ... */}

            <button
              className="modal-unsave-btn"
              onClick={(e) => handleUnsave(e, selectedRecipe._id)}
              disabled={unsavingId === selectedRecipe._id}
            >
              {unsavingId === selectedRecipe._id ? "Removing..." : "🔖 Remove from Saved"}
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default SavedRecipes;