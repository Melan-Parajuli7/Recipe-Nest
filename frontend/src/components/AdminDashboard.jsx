import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";        // ← This was missing!

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRecipes: 0,
    totalUsers: 0,
    totalComments: 0,
    avgRating: "4.2",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");

        const res = await fetch("http://localhost:3000/api/admin/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (data.success) {
          setStats({
            totalRecipes: data.data.totalRecipes || 0,
            totalUsers: data.data.totalUsers || 0,
            totalComments: data.data.totalComments || 0,
            avgRating: "4.2",
          });
        } else {
          setError(data.message || "Failed to load dashboard");
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(/images/adminBackground.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div style={{
          backgroundColor: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "30px 50px",
          borderRadius: "12px",
          fontSize: "1.3rem"
        }}>
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(/images/adminBackground.jpg)`,
        backgroundSize: "cover",
      }}>
        <div style={{
          backgroundColor: "rgba(220, 38, 38, 0.9)",
          color: "white",
          padding: "30px 40px",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Modern inline styles
  const styles = {
    page: {
      minHeight: "100vh",
      backgroundImage: `url(/images/adminBackground.jpg)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      display: "flex",
    },

    main: {
      flex: 1,
      marginLeft: "215px",           // ← Changed to match your Sidebar width (215px)
      padding: "30px",
      backgroundColor: "rgba(255, 255, 255, 0.94)",
      minHeight: "100vh",
      overflow: "auto",
    },

    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },

    heading: {
      fontSize: "2.2rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: 0,
    },

    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },

    statCard: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },

    statLabel: {
      fontSize: "0.95rem",
      color: "#6b7280",
      marginBottom: "8px",
    },

    statValue: {
      fontSize: "2.4rem",
      fontWeight: "700",
      color: "#1f2937",
      marginBottom: "6px",
    },

    statChange: {
      fontSize: "0.9rem",
      color: "#10b981",
    },

    actionRow: {
      display: "flex",
      gap: "15px",
      marginBottom: "40px",
      flexWrap: "wrap",
    },

    actionBtn: {
      padding: "14px 28px",
      backgroundColor: "#E8531C",        // Matched with sidebar accent color
      color: "white",
      border: "none",
      borderRadius: "10px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(232, 83, 28, 0.3)",
    },

    section: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      marginBottom: "30px",
    },
  };

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <h1 style={styles.heading}>Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Recipes</div>
            <div style={styles.statValue}>{stats.totalRecipes}</div>
            <div style={styles.statChange}>↑ 2 this week</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Users</div>
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statChange}>↑ 12 this month</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Comments</div>
            <div style={styles.statValue}>{stats.totalComments}</div>
            <div style={styles.statChange}>↑ 156 this month</div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statLabel}>Average Rating</div>
            <div style={styles.statValue}>{stats.avgRating}</div>
            <div style={styles.statChange}>↑ 0.2 this month</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actionRow}>
          <button
            style={styles.actionBtn}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#d43f0f")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#E8531C")}
            onClick={() => navigate("/admin/recipes")}
          >
            Manage Recipes
          </button>

          <button
            style={styles.actionBtn}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#d43f0f")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#E8531C")}
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>

          <button
            style={styles.actionBtn}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#d43f0f")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#E8531C")}
            onClick={() => navigate("/admin/comments")}
          >
            View All Comments
          </button>
        </div>


      </main>
    </div>
  );
};

export default AdminDashboard;