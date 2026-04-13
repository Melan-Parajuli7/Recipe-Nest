import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000";

const Recipe = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Beverage"];

  const difficultyColor = {
    easy: "#4caf8a",
    medium: "#e8955a",
    hard: "#e05a5a",
  };

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

  useEffect(() => {
    const fetchUserRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("jwtToken");
        if (!token) {
          navigate("/login");
          return;
        }

        // No need to decode userId — the backend reads req.user._id from the JWT via `protect` middleware
        const response = await fetch(`${API_BASE_URL}/api/recipes/my-recipes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        setRecipes(data.recipes || data.data || data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipes();
  }, [navigate]);

  const filteredRecipes =
    activeFilter === "All"
      ? recipes
      : recipes.filter(
          (r) =>
            r.category?.toLowerCase() === activeFilter.toLowerCase() ||
            r.mealType?.toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .recipes-page {
          min-height: 100vh;
          background: #0f0d0b;
          padding-bottom: 100px;
          font-family: 'DM Sans', sans-serif;
          color: #f0ebe4;
        }

        .rp-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 20px 20px 16px;
          background: linear-gradient(180deg, #0f0d0b 70%, transparent);
        }

        .rp-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .rp-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0ebe4;
          letter-spacing: -0.3px;
        }

        .rp-count-badge {
          background: rgba(232,149,90,0.15);
          border: 1px solid rgba(232,149,90,0.3);
          color: #e8955a;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }

        .rp-filters {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .rp-filters::-webkit-scrollbar { display: none; }

        .rp-filter-pill {
          flex-shrink: 0;
          padding: 7px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .rp-filter-pill:hover {
          border-color: rgba(232,149,90,0.4);
          color: rgba(232,149,90,0.8);
        }

        .rp-filter-pill.active {
          background: linear-gradient(135deg, #e8955a, #c9612a);
          border-color: transparent;
          color: #fff;
          font-weight: 500;
          box-shadow: 0 4px 14px rgba(232,149,90,0.35);
        }

        .rp-grid {
          padding: 16px 16px 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        @media (min-width: 600px) {
          .rp-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .rp-card {
          background: #1a1612;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          animation: cardIn 0.4s ease both;
        }

        .rp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          border-color: rgba(232,149,90,0.2);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rp-card:nth-child(1) { animation-delay: 0.05s; }
        .rp-card:nth-child(2) { animation-delay: 0.10s; }
        .rp-card:nth-child(3) { animation-delay: 0.15s; }
        .rp-card:nth-child(4) { animation-delay: 0.20s; }
        .rp-card:nth-child(5) { animation-delay: 0.25s; }
        .rp-card:nth-child(6) { animation-delay: 0.30s; }

        .rp-card-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #2a2218;
        }

        .rp-card-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .rp-card:hover .rp-card-thumb img {
          transform: scale(1.06);
        }

        .rp-card-category {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(18,14,10,0.85);
          backdrop-filter: blur(8px);
          color: #e8955a;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid rgba(232,149,90,0.25);
        }

        .rp-card-body {
          padding: 12px 12px 14px;
        }

        .rp-card-name {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 600;
          color: #f0ebe4;
          line-height: 1.35;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rp-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .rp-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }

        .rp-meta-item svg {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }

        .rp-difficulty {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          margin-left: auto;
        }

        .rp-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 16px;
        }

        .rp-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(232,149,90,0.15);
          border-top-color: #e8955a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .rp-loading-text {
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .rp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 45vh;
          gap: 12px;
          padding: 20px;
          text-align: center;
        }

        .rp-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background: rgba(232,149,90,0.08);
          border: 1px solid rgba(232,149,90,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .rp-empty-icon svg {
          width: 30px;
          height: 30px;
          color: rgba(232,149,90,0.5);
        }

        .rp-empty h3 {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          color: #f0ebe4;
          font-weight: 600;
        }

        .rp-empty p {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          max-width: 240px;
          line-height: 1.6;
        }

        .rp-empty-btn {
          margin-top: 8px;
          padding: 11px 28px;
          background: linear-gradient(135deg, #e8955a, #c9612a);
          border: none;
          border-radius: 50px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(232,149,90,0.35);
          transition: all 0.2s ease;
        }

        .rp-empty-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(232,149,90,0.5);
        }

        .rp-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 45vh;
          gap: 12px;
          padding: 20px;
          text-align: center;
        }

        .rp-error p {
          font-size: 14px;
          color: rgba(255,100,100,0.7);
        }

        .rp-retry-btn {
          padding: 10px 24px;
          background: rgba(232,149,90,0.1);
          border: 1px solid rgba(232,149,90,0.3);
          border-radius: 50px;
          color: #e8955a;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rp-retry-btn:hover { background: rgba(232,149,90,0.2); }
      `}</style>

      <div className="recipes-page">
        <div className="rp-header">
          <div className="rp-header-top">
            <h1 className="rp-title">My Recipes</h1>
            {!loading && !error && (
              <span className="rp-count-badge">
                {filteredRecipes.length}{" "}
                {filteredRecipes.length === 1 ? "recipe" : "recipes"}
              </span>
            )}
          </div>

          <div className="rp-filters">
            {filters.map((f) => (
              <button
                key={f}
                className={`rp-filter-pill ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="rp-loading">
            <div className="rp-spinner" />
            <span className="rp-loading-text">Loading your recipes…</span>
          </div>
        ) : error ? (
          <div className="rp-error">
            <p>{error}</p>
            <button className="rp-retry-btn" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="rp-empty">
            <div className="rp-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <h3>No recipes yet</h3>
            <p>
              {activeFilter !== "All"
                ? `You haven't added any ${activeFilter} recipes yet.`
                : "Start sharing your culinary creations with the world."}
            </p>
            <button className="rp-empty-btn" onClick={() => navigate("/add-recipe")}>
              + Add Recipe
            </button>
          </div>
        ) : (
          <div className="rp-grid">
            {filteredRecipes.map((recipe) => {
              const imageUrl = getImageUrl(
                recipe.images?.[0] || recipe.image || recipe.thumbnail
              );

              return (
                <div
                  key={recipe._id}
                  className="rp-card"
                  onClick={() => navigate(`/recipe/${recipe._id}`)}
                >
                  <div className="rp-card-thumb">
                    <img
                      src={imageUrl || "https://placehold.co/400x300/1e1810/e8955a?text=No+Image"}
                      alt={recipe.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/400x300/1e1810/e8955a?text=No+Image";
                      }}
                    />
                    {recipe.category && (
                      <span className="rp-card-category">{recipe.category}</span>
                    )}
                  </div>

                  <div className="rp-card-body">
                    <div className="rp-card-name">{recipe.title}</div>

                    <div className="rp-card-meta">
                      {(recipe.cookTime || recipe.prepTime) && (
                        <span className="rp-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {recipe.cookTime || recipe.prepTime} min
                        </span>
                      )}

                      {recipe.servings && (
                        <span className="rp-meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                          </svg>
                          {recipe.servings}
                        </span>
                      )}

                      {recipe.difficulty && (
                        <span
                          className="rp-difficulty"
                          style={{
                            color: difficultyColor[recipe.difficulty?.toLowerCase()] || "#e8955a",
                            background: `${difficultyColor[recipe.difficulty?.toLowerCase()] || "#e8955a"}18`,
                          }}
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
    </>
  );
};

export default Recipe;