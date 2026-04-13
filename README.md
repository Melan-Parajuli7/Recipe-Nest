# 🍽️ RecipeNest

**RecipeNest** is a full-stack recipe sharing web application where food lovers can discover, create, save, and manage recipes. With a clean dark-themed UI and an intuitive navigation system, RecipeNest makes it easy for anyone to share their culinary creations with the world.

---

## 📁 Project Structure

```
RECIPENEST CODE/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── app.js
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── App.jsx
│       └── main.jsx
└── webfiles/
```

---

## 🚀 Tech Stack

- **Frontend:** React (Vite), CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT-based authentication
- **File Uploads:** Multer

---

## 📸 App Pages

---

### 1. 🏠 Landing Page

The entry point of the application. Users are greeted with a visually rich food background and two call-to-action buttons — **Get Started** (registration) and **Sign In** (login).

![Landing Page](webfiles/landing.png)

---

### 2. 🔐 Login Page

A glassmorphism-styled login form overlaid on the same food-themed background. Users enter their **email** and **password** to sign in, or navigate to the registration page via the **Register** link.

![Login Page](webfiles/login.png)

---

### 3. 🏡 Home Page

After logging in, users land on the Home page, which displays a personalized greeting, a **search bar**, and category filter pills — **All, Breakfast, Lunch, Dinner, Dessert, Beverage**. Recipes are shown as beautifully styled cards with cover images, descriptions, cook time, servings, and difficulty level. A success toast confirms the login.

![Home Page](webfiles/homepage.png)

---

### 4. 📋 My Recipes Page

The dedicated page for viewing all recipes posted by the currently logged-in user. Includes the same category filters and a recipe count badge. When no recipes exist yet, an empty state is shown with an **+ Add Recipe** call-to-action button.

![My Recipes Page](webfiles/Recipes.png)

---

### 5. ➕ Add Recipe Page

A full-featured recipe creation form where users can:
- Upload a **Cover Photo**
- Add up to **5 Gallery Images**
- Fill in **Basic Info** (title, description, category, cook time, servings, difficulty)
- Add ingredients and step-by-step instructions

The page includes a **Publish** button in the top-right corner to submit the recipe.

![Add Recipe Page](webfiles/addRecipesPage.png)

---

### 6. 🔖 Saved Recipes Page

Displays the user's personal collection of bookmarked recipes. Includes a **search bar** to filter saved items. Each recipe card shows the cover image, title, short description, cook time, servings, and difficulty. The bookmark icon turns filled/orange when a recipe is saved.

![Saved Recipes Page](webfiles/SavedRecipes.png)

---

### 7. 👤 Profile Page — My Recipes Tab

The Profile page shows the user's avatar, display name, and three stats: **Recipes Posted, Saved, and Total Views**. Three tabs are available: **My Recipes**, **Saved**, and **Settings**. By default, the My Recipes tab is active and lists the user's published recipes.

![Profile Page](webfiles/MainProfilePage.png)

---

### 8. 🔖 Profile Page — Saved Tab

Clicking the **Saved** tab on the Profile page shows a compact list view of the user's bookmarked recipes, including the recipe thumbnail, title, cook time, and the author's name.

![Profile Saved Tab](webfiles/UserSavedRecipe.png)

---

### 9. ⚙️ Profile Page — Settings Tab (Profile Picture)

The **Settings** tab allows the user to manage their profile. The first section — **Profile Picture** — displays the current avatar with options to **Change Photo** or **Remove** it.

![Profile Settings - Photo](webfiles/MainUserUpdatePage.png)

---

### 10. ⚙️ Profile Page — Settings Tab (Edit Profile & Account)

Scrolling further in the Settings tab reveals the **Edit Profile** section (name field with a **Save Changes** button) and the **Account** section which contains the **Logout** button.

![Profile Settings - Edit & Account](webfiles/MainUserUpdatePage2.png)

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Create a .env file with your MongoDB URI and JWT secret
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌟 Features Summary

| Feature | Description |
|---|---|
| 🔐 Authentication | Register & login with JWT |
| 🏠 Home Feed | Browse all recipes with category filters & search |
| ➕ Add Recipe | Upload cover photo, gallery images, ingredients & steps |
| 🔖 Save Recipes | Bookmark favourite recipes |
| 👤 User Profile | View stats, manage recipes, edit name & avatar |
| 🚪 Logout | Secure session termination from profile settings |

---

## 📄 License

This project is for educational purposes.

---

> Built with ❤️ by the RecipeNest Team
