// routes/admin.routes.js
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middlewares/auth.middleware");

// Import controllers (we'll use existing ones where possible)
const userController = require("../controllers/user.controller");
const recipeController = require("../controllers/recipes.controller");
const commentController = require("../controllers/comments.controller");

// Apply protection + admin check to **ALL** routes in this file
router.use(protect);
router.use(adminOnly);

// ======================
// ADMIN DASHBOARD & STATS
// ======================
router.get("/dashboard", async (req, res) => {
  try {
    const User = require('../models/users.models');  
    const Recipe = require('../models/recipes.models'); 
    const Comment = require('../models/comments.models');  

    const [totalUsers, totalRecipes, totalComments] = await Promise.all([
      User.countDocuments(),
      Recipe.countDocuments(),
      Comment.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRecipes,
        totalComments,
        // Add more stats later (active users, pending recipes, etc.)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======================
// USER MANAGEMENT
// ======================
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUserById);
router.delete("/users/:id", userController.deactivateUser);
// router.put("/users/:id/role", userController.changeUserRole); // if needed later

// ======================
// RECIPE MANAGEMENT (Admin)
// ======================
router.get("/recipes", recipeController.getAllRecipes);           // reuse if it works for admin
router.patch("/recipes/:id/feature", recipeController.toggleFeatured);
router.patch("/recipes/:id/status", recipeController.changeRecipeStatus);
// router.delete("/recipes/:id", recipeController.adminDeleteRecipe); // if you want force delete

// ======================
// COMMENT MANAGEMENT (Admin)
// ======================
router.get("/comments", commentController.getAllComments);
router.delete("/comments/:id/admin", commentController.deleteComment); // already exists

module.exports = router;