import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",                    // Main dashboard route
    icon: (
      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Recipes",
    path: "/admin/recipes",
    icon: (
      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: (
      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Comments",
    path: "/admin/comments",
    icon: (
      <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

const styles = {
  sidebar: {
    width: "215px",
    height: "100vh",
    backgroundColor: "#141C2E",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
    position: "sticky",
    top: 0,
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "32px",
    gap: "10px",
  },
  logoBox: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #E8531C",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  logoText: {
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    fontFamily: "inherit",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "0 10px",
    flexGrow: 1,
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    color: active ? "#fff" : "#8A9BB5",
    backgroundColor: active ? "#E8531C" : "transparent",
    fontWeight: active ? "600" : "400",
    fontSize: "14px",
    transition: "all 0.18s ease",
    userSelect: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
  }),
  bottom: {
    padding: "0 10px",
    marginTop: "auto",
  },
  divider: {
    height: "1px",
    backgroundColor: "#1E2A40",
    marginBottom: "10px",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#FF6B6B",
    backgroundColor: "transparent",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.18s ease",
    userSelect: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontFamily: "inherit",
  },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoArea}>
        <div style={styles.logoBox}>
          <img
            src="/images/logo.png"
            alt="Recipe Nest Logo"
            style={styles.logoImg}
          />
        </div>
        <span style={styles.logoText}>Recipe Nest</span>
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === "/admin"
              ? location.pathname === "/admin" || 
                location.pathname === "/admin/" ||
                location.pathname === "/admin/dashboard"  // Added support for /admin/dashboard if you use it
              : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              style={styles.navItem(active)}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "#1E2A40";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#8A9BB5";
                }
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout always at bottom */}
      <div style={styles.bottom}>
        <div style={styles.divider} />
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2A1A1A";
            e.currentTarget.style.color = "#FF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#FF6B6B";
          }}
        >
          <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}