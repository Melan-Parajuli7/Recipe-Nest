/**
 * api.js — Recipe Nest Admin API Helper
 *
 * Reads the JWT token from localStorage (key: "token").
 * All admin calls use the Authorization: Bearer <token> header.
 *
 * Base URL reads from VITE_API_URL env var, falls back to localhost:5000.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// Internal fetch wrapper
// ─────────────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem("jwtToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ═════════════════════════════════════════════
// USER ENDPOINTS  (Admin only)
// ═════════════════════════════════════════════

/**
 * GET /api/users
 * Returns all registered users.
 */
export const getAllUsers = () => request("/api/users");

/**
 * GET /api/users/:id
 * Returns a single user by ID.
 */
export const getUserById = (id) => request(`/api/users/${id}`);

/**
 * DELETE /api/users/:id
 * Deactivates (soft-deletes) a user.
 */
export const deactivateUser = (id) =>
  request(`/api/users/${id}`, { method: "DELETE" });

// ═════════════════════════════════════════════
// RECIPE ENDPOINTS
// ═════════════════════════════════════════════

/**
 * GET /api/recipes?page=&limit=&status=&category=
 * Returns paginated recipes (public).
 * Pass query params as an object: { page, limit, status, category }
 */
export const getAllRecipes = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return request(`/api/recipes${qs ? `?${qs}` : ""}`);
};

/**
 * DELETE /api/recipes/:id
 * Deletes a recipe (owner or admin).
 */
export const deleteRecipe = (id) =>
  request(`/api/recipes/${id}`, { method: "DELETE" });

/**
 * PATCH /api/recipes/:id/feature
 * Toggles the isFeatured flag (admin only).
 */
export const toggleFeaturedRecipe = (id) =>
  request(`/api/recipes/${id}/feature`, { method: "PATCH" });

/**
 * PATCH /api/recipes/:id/status
 * Changes recipe status: "draft" | "published" | "archived"
 */
export const changeRecipeStatus = (id, status) =>
  request(`/api/recipes/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// ═════════════════════════════════════════════
// COMMENT ENDPOINTS  (Admin)
// ═════════════════════════════════════════════

/**
 * GET /api/comments?page=&limit=&recipeId=&authorId=
 * Returns all comments across the platform (admin only).
 */
export const getAllComments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
  ).toString();
  return request(`/api/comments${qs ? `?${qs}` : ""}`);
};

export const deleteUser = async (userId) => {
  const token = localStorage.getItem("token");
  return axios.delete(`/api/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Add this function in your api.js
export const toggleUserStatus = async (userId) => {
  const token = localStorage.getItem('token');
  return axios.patch(`/api/admin/users/${userId}/status`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

/**
 * DELETE /api/comments/:id/admin
 * Force-deletes any comment regardless of ownership (admin only).
 */
export const deleteComment = (id) =>
  request(`/api/comments/${id}/admin`, { method: "DELETE" });