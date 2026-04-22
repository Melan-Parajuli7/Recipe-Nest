import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../shared/components/Footer";

const API_BASE_URL = "http://localhost:3000";

const CATEGORIES = [
  "breakfast","lunch","dinner","appetizer","snack",
  "dessert","beverage","soup","salad","side-dish","sauce","other",
];
const DIET_TYPES = [
  "vegetarian","vegan","gluten-free","dairy-free","nut-free",
  "keto","paleo","low-carb","sugar-free","halal","kosher",
];

const AddRecipe = () => {
  const navigate = useNavigate();

  // ── Basic Info ──────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState(1);
  const [dietType, setDietType] = useState([]);
  const [tags, setTags] = useState("");
  const [tips, setTips] = useState("");
  const [equipment, setEquipment] = useState("");
  const [status, setStatus] = useState("published");

  // ── Images ──────────────────────────────────────────────
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // ── Ingredients ─────────────────────────────────────────
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "", isOptional: false },
  ]);

  // ── Steps ───────────────────────────────────────────────
  const [steps, setSteps] = useState([
    { stepNumber: 1, instruction: "", duration: "" },
  ]);

  // ── Nutrition ───────────────────────────────────────────
  const [nutrition, setNutrition] = useState({
    calories: "", protein: "", carbs: "", fat: "", fiber: "", sugar: "", sodium: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Helpers ─────────────────────────────────────────────
  const toggleDiet = (val) =>
    setDietType((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // Ingredient helpers
  const updateIngredient = (i, field, val) => {
    const updated = [...ingredients];
    updated[i][field] = val;
    setIngredients(updated);
  };
  const addIngredient = () =>
    setIngredients([...ingredients, { name: "", quantity: "", unit: "", isOptional: false }]);
  const removeIngredient = (i) =>
    setIngredients(ingredients.filter((_, idx) => idx !== i));

  // Step helpers
  const updateStep = (i, field, val) => {
    const updated = [...steps];
    updated[i][field] = val;
    setSteps(updated);
  };
  const addStep = () =>
    setSteps([...steps, { stepNumber: steps.length + 1, instruction: "", duration: "" }]);
  const removeStep = (i) =>
    setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, stepNumber: idx + 1 })));

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async (submitStatus) => {
    setError("");
    if (!title || !description || !category || !cookTime) {
      setError("Please fill in all required fields (title, description, category, cook time).");
      return;
    }
    if (ingredients.some((ing) => !ing.name || !ing.quantity)) {
      setError("Each ingredient needs a name and quantity.");
      return;
    }
    if (steps.some((s) => !s.instruction)) {
      setError("Each step needs an instruction.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("shortDescription", shortDescription);
      formData.append("category", category);
      formData.append("cuisine", cuisine);
      formData.append("difficulty", difficulty);
      formData.append("cookTime", cookTime);
      formData.append("servings", servings);
      formData.append("status", submitStatus);
      formData.append("isPublic", "true");

      formData.append("dietType", JSON.stringify(dietType));
      formData.append(
        "tags",
        JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))
      );
      formData.append(
        "tips",
        JSON.stringify(tips.split("\n").map((t) => t.trim()).filter(Boolean))
      );
      formData.append(
        "equipment",
        JSON.stringify(equipment.split(",").map((e) => e.trim()).filter(Boolean))
      );
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append(
        "steps",
        JSON.stringify(
          steps.map((s) => ({
            ...s,
            duration: s.duration ? Number(s.duration) : null,
          }))
        )
      );

      const nutritionData = {};
      Object.entries(nutrition).forEach(([k, v]) => {
        if (v !== "") nutritionData[k] = Number(v);
      });
      if (Object.keys(nutritionData).length > 0)
        formData.append("nutrition", JSON.stringify(nutritionData));

      if (thumbnail) formData.append("thumbnail", thumbnail);
      images.forEach((img) => formData.append("images", img));

      const res = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create recipe");

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .ar-root {
          min-height: 100vh;
          background: #0e0b08;
          color: #f0e8dc;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 90px;
        }

        /* Header */
        .ar-header {
          position: relative;
          height: 160px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: 24px;
        }
        .ar-header-bg {
          position: absolute;
          inset: 0;
          background: url('/images/bghome.jpg') center/cover no-repeat;
          filter: brightness(0.35);
        }
        .ar-header-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .ar-back-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          color: #f0e8dc;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: background 0.2s;
        }
        .ar-back-btn:hover { background: rgba(255,255,255,0.18); }
        .ar-header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #f0e8dc;
        }
        .ar-publish-btn {
          background: linear-gradient(135deg, #e8955a, #c9612a);
          border: none;
          color: #fff;
          padding: 8px 20px;
          border-radius: 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(232,149,90,0.4);
        }
        .ar-publish-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,149,90,0.5); }
        .ar-publish-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Form body */
        .ar-body { padding: 20px 18px; display: flex; flex-direction: column; gap: 28px; }

        /* Section */
        .ar-section { display: flex; flex-direction: column; gap: 14px; }
        .ar-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          color: #e8955a;
          border-bottom: 1px solid rgba(232,149,90,0.2);
          padding-bottom: 8px;
          letter-spacing: 0.3px;
        }

        /* Image upload */
        .ar-img-upload-box {
          border: 1.5px dashed rgba(232,149,90,0.4);
          border-radius: 14px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: rgba(232,149,90,0.04);
          position: relative;
          overflow: hidden;
        }
        .ar-img-upload-box:hover { border-color: #e8955a; background: rgba(232,149,90,0.08); }
        .ar-img-upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .ar-img-upload-icon { font-size: 32px; }
        .ar-img-upload-text { font-size: 13px; color: rgba(240,232,220,0.5); text-align: center; }
        .ar-img-preview {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid rgba(232,149,90,0.3);
        }
        .ar-gallery-previews { display: flex; gap: 8px; flex-wrap: wrap; }
        .ar-gallery-thumb {
          width: 72px; height: 72px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(232,149,90,0.3);
        }

        /* Inputs */
        .ar-label { font-size: 12px; color: rgba(240,232,220,0.55); letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: -6px; }
        .ar-input, .ar-select, .ar-textarea {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f0e8dc;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          padding: 12px 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .ar-input:focus, .ar-select:focus, .ar-textarea:focus {
          border-color: rgba(232,149,90,0.6);
          background: rgba(255,255,255,0.07);
        }
        .ar-textarea { resize: vertical; min-height: 90px; }
        .ar-select option { background: #1a1410; color: #f0e8dc; }

        /* Row */
        .ar-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ar-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

        /* Diet type pills */
        .ar-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .ar-pill {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          color: rgba(240,232,220,0.6);
          font-size: 12px;
          padding: 6px 14px;
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
        }
        .ar-pill.active {
          background: rgba(232,149,90,0.18);
          border-color: #e8955a;
          color: #e8955a;
        }

        /* Ingredient / Step cards */
        .ar-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }
        .ar-card-header { display: flex; align-items: center; justify-content: space-between; }
        .ar-card-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: #e8955a;
          font-weight: 600;
        }
        .ar-remove-btn {
          background: rgba(244,67,54,0.1);
          border: 1px solid rgba(244,67,54,0.2);
          color: #f44336;
          width: 28px; height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .ar-remove-btn:hover { background: rgba(244,67,54,0.2); }

        .ar-add-btn {
          background: rgba(232,149,90,0.08);
          border: 1.5px dashed rgba(232,149,90,0.35);
          color: #e8955a;
          border-radius: 10px;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }
        .ar-add-btn:hover { background: rgba(232,149,90,0.14); }

        /* Checkbox */
        .ar-check-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .ar-check-row input { accent-color: #e8955a; width: 16px; height: 16px; }
        .ar-check-row span { font-size: 13px; color: rgba(240,232,220,0.6); }

        /* Nutrition grid */
        .ar-nutrition-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Error */
        .ar-error {
          background: rgba(244,67,54,0.1);
          border: 1px solid rgba(244,67,54,0.3);
          border-radius: 10px;
          color: #f88;
          padding: 12px 16px;
          font-size: 13px;
        }

        /* Draft btn */
        .ar-draft-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(240,232,220,0.7);
          padding: 14px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }
        .ar-draft-btn:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <div className="ar-root">
        {/* Header */}
        <div className="ar-header">
          <div className="ar-header-bg" />
          <div className="ar-header-content">
            <button className="ar-back-btn" onClick={() => navigate(-1)}>←</button>
            <span className="ar-header-title">New Recipe</span>
            <button
              className="ar-publish-btn"
              onClick={() => handleSubmit("published")}
              disabled={loading}
            >
              {loading ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>

        <div className="ar-body">
          {error && <div className="ar-error">⚠️ {error}</div>}

          {/* Thumbnail */}
          <div className="ar-section">
            <div className="ar-section-title">📸 Cover Photo</div>
            {thumbnailPreview ? (
              <img src={thumbnailPreview} alt="thumbnail" className="ar-img-preview" />
            ) : (
              <label className="ar-img-upload-box">
                <input type="file" accept="image/*" onChange={handleThumbnail} />
                <span className="ar-img-upload-icon">🖼️</span>
                <span className="ar-img-upload-text">Tap to add a cover photo</span>
              </label>
            )}
            {thumbnailPreview && (
              <label className="ar-img-upload-box" style={{ padding: "12px" }}>
                <input type="file" accept="image/*" onChange={handleThumbnail} />
                <span style={{ fontSize: 13, color: "rgba(232,149,90,0.8)" }}>Change photo</span>
              </label>
            )}
          </div>

          {/* Gallery */}
          <div className="ar-section">
            <div className="ar-section-title">🖼️ Gallery (up to 5)</div>
            <label className="ar-img-upload-box" style={{ padding: "14px" }}>
              <input type="file" accept="image/*" multiple onChange={handleImages} />
              <span className="ar-img-upload-icon">➕</span>
              <span className="ar-img-upload-text">Add up to 5 gallery images</span>
            </label>
            {imagePreviews.length > 0 && (
              <div className="ar-gallery-previews">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} className="ar-gallery-thumb" alt={`img-${i}`} />
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="ar-section">
            <div className="ar-section-title">📋 Basic Info</div>
            <span className="ar-label">Title *</span>
            <input className="ar-input" placeholder="e.g. Creamy Butter Chicken" value={title} onChange={(e) => setTitle(e.target.value)} />
            <span className="ar-label">Short Description</span>
            <input className="ar-input" placeholder="One-liner for cards..." value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={200} />
            <span className="ar-label">Full Description *</span>
            <textarea className="ar-textarea" placeholder="Tell the story of this recipe..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
            <div className="ar-row">
              <div>
                <span className="ar-label">Category *</span>
                <select className="ar-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <span className="ar-label">Difficulty</span>
                <select className="ar-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="ar-row">
              <div>
                <span className="ar-label">Cook Time (min) *</span>
                <input className="ar-input" type="number" min="0" placeholder="30" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
              </div>
              <div>
                <span className="ar-label">Servings</span>
                <input className="ar-input" type="number" min="1" placeholder="4" value={servings} onChange={(e) => setServings(e.target.value)} />
              </div>
            </div>
            <span className="ar-label">Cuisine</span>
            <input className="ar-input" placeholder="e.g. Indian, Italian, Mexican..." value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
          </div>

          {/* Diet Type */}
          <div className="ar-section">
            <div className="ar-section-title">🥗 Diet Type</div>
            <div className="ar-pills">
              {DIET_TYPES.map((d) => (
                <span key={d} className={`ar-pill${dietType.includes(d) ? " active" : ""}`} onClick={() => toggleDiet(d)}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="ar-section">
            <div className="ar-section-title">🥄 Ingredients</div>
            {ingredients.map((ing, i) => (
              <div key={i} className="ar-card">
                <div className="ar-card-header">
                  <span className="ar-card-num">#{i + 1}</span>
                  {ingredients.length > 1 && (
                    <button className="ar-remove-btn" onClick={() => removeIngredient(i)}>✕</button>
                  )}
                </div>
                <input className="ar-input" placeholder="Ingredient name *" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} />
                <div className="ar-row">
                  <input className="ar-input" placeholder="Quantity *" value={ing.quantity} onChange={(e) => updateIngredient(i, "quantity", e.target.value)} />
                  <input className="ar-input" placeholder="Unit (cups, g...)" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)} />
                </div>
                <label className="ar-check-row">
                  <input type="checkbox" checked={ing.isOptional} onChange={(e) => updateIngredient(i, "isOptional", e.target.checked)} />
                  <span>Optional ingredient</span>
                </label>
              </div>
            ))}
            <button className="ar-add-btn" onClick={addIngredient}>+ Add Ingredient</button>
          </div>

          {/* Steps */}
          <div className="ar-section">
            <div className="ar-section-title">👨‍🍳 Cooking Steps</div>
            {steps.map((step, i) => (
              <div key={i} className="ar-card">
                <div className="ar-card-header">
                  <span className="ar-card-num">Step {step.stepNumber}</span>
                  {steps.length > 1 && (
                    <button className="ar-remove-btn" onClick={() => removeStep(i)}>✕</button>
                  )}
                </div>
                <textarea className="ar-textarea" placeholder="Describe this step in detail..." value={step.instruction} onChange={(e) => updateStep(i, "instruction", e.target.value)} style={{ minHeight: 70 }} />
                <input className="ar-input" type="number" placeholder="Duration (minutes, optional)" value={step.duration} onChange={(e) => updateStep(i, "duration", e.target.value)} />
              </div>
            ))}
            <button className="ar-add-btn" onClick={addStep}>+ Add Step</button>
          </div>

          {/* Nutrition */}
          <div className="ar-section">
            <div className="ar-section-title">💊 Nutrition (per serving)</div>
            <div className="ar-nutrition-grid">
              {Object.keys(nutrition).map((key) => (
                <div key={key}>
                  <span className="ar-label">{key.charAt(0).toUpperCase() + key.slice(1)} {key === "sodium" ? "(mg)" : key !== "calories" ? "(g)" : "(kcal)"}</span>
                  <input className="ar-input" type="number" placeholder="0" value={nutrition[key]} onChange={(e) => setNutrition({ ...nutrition, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          {/* Extra Info */}
          <div className="ar-section">
            <div className="ar-section-title">✨ Extra Info</div>
            <span className="ar-label">Tags (comma separated)</span>
            <input className="ar-input" placeholder="comfort food, quick, spicy..." value={tags} onChange={(e) => setTags(e.target.value)} />
            <span className="ar-label">Tips & Notes (one per line)</span>
            <textarea className="ar-textarea" placeholder="Marinate overnight for best results..." value={tips} onChange={(e) => setTips(e.target.value)} />
            <span className="ar-label">Equipment needed (comma separated)</span>
            <input className="ar-input" placeholder="Oven, Blender, Cast iron pan..." value={equipment} onChange={(e) => setEquipment(e.target.value)} />
          </div>

          {/* Save as Draft */}
          <button className="ar-draft-btn" onClick={() => handleSubmit("draft")} disabled={loading}>
            💾 Save as Draft
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AddRecipe;