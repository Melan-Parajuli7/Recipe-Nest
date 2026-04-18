import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { getAllUsers, deleteUser } from "./api";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getRoleBadge = (role) => {
  const map = {
    admin:    { bg: "#FEE2E2", color: "#DC2626" },
    user:     { bg: "#DBEAFE", color: "#1D4ED8" },
    customer: { bg: "#F3F4F6", color: "#374151" },
  };
  return map[role] || map.customer;
};

function UserAvatar({ user }) {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (!user?.avatar) {
    return <InitialsAvatar user={user} />;
  }

  // Clean path and prevent double slash
  let path = user.avatar.trim();
  if (path.startsWith('/')) path = path.slice(1);

  const avatarUrl = `${BASE_URL}/${path}`;

  return (
    <>
      <img
        src={avatarUrl}
        alt={user.name || "User"}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.style.display = "none";
          const fallback = e.target.nextElementSibling;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <InitialsAvatar user={user} style={{ display: "none" }} />
    </>
  );
}

function InitialsAvatar({ user, style = {} }) {
  const initials = (user?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const COLORS = ["#E8531C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
  const bgColor = COLORS[(user?.name?.charCodeAt(0) || 0) % COLORS.length];

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "700",
        border: "2px solid #fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials || "??"}
    </div>
  );
}

function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "32px", width: "380px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "inherit" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <h3 style={{ textAlign: "center", fontSize: "17px", fontWeight: "700", color: "#1A1A2E", marginBottom: "8px" }}>Delete User?</h3>
        <p style={{ textAlign: "center", fontSize: "13.5px", color: "#666", marginBottom: "24px", lineHeight: 1.6 }}>
          Are you sure you want to permanently delete <strong>{user?.name}</strong>?<br />
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={onCancel} 
            style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "1.5px solid #E0DDD8", background: "transparent", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#555" }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "none", background: "#DC2626", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Outfit', 'Nunito', sans-serif", backgroundColor: "#141C2E" },
  main: { flex: 1, backgroundColor: "#F5F0EB", padding: "32px 36px", overflowY: "auto" },
  heading: { fontSize: "26px", fontWeight: "700", color: "#E8531C", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#888", margin: "0 0 22px 0" },
  row: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchBar: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", borderRadius: "50px", padding: "10px 20px", flex: 1, maxWidth: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  searchInput: { border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#333", width: "100%", fontFamily: "inherit" },
  select: { padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E0DDD8", background: "#fff", fontSize: "13.5px", fontFamily: "inherit", color: "#444", cursor: "pointer", outline: "none" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "22px" },
  statCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "18px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  statLabel: { fontSize: "12.5px", color: "#888", marginBottom: "5px", fontWeight: "500" },
  statValue: { fontSize: "24px", fontWeight: "700", color: "#1A1A2E" },
  tableCard: { backgroundColor: "#fff", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  th: { 
    textAlign: "center", 
    fontSize: "12px", 
    fontWeight: "700", 
    color: "#888", 
    paddingBottom: "12px", 
    borderBottom: "2px solid #F0EDE8", 
    textTransform: "uppercase", 
    letterSpacing: "0.5px" 
  },
  td: { 
    padding: "13px 0", 
    fontSize: "13.5px", 
    color: "#333", 
    borderBottom: "1px solid #F5F2EE", 
    verticalAlign: "middle",
    textAlign: "center" 
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRole] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllUsers();
      let list = res?.data?.users || res?.users || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const safeUsers = Array.isArray(users) ? users : [];

  const filtered = safeUsers.filter((u) => {
    const q = search.toLowerCase();
    const okSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const okRole = !roleFilter || u.role === roleFilter;
    const okStatus = !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);
    return okSearch && okRole && okStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete user: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div style={s.page}>
      <Sidebar />
      <main style={s.main}>
        <h1 style={s.heading}>Users Management</h1>
        <p style={s.sub}>View and manage all registered users from MongoDB</p>

        {/* Filters */}
        <div style={s.row}>
          <div style={s.searchBar}>
            <svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input 
              style={s.searchInput} 
              placeholder="Search by name or email…" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: "18px", lineHeight: 1 }}>×</button>}
          </div>
          <select style={s.select} value={roleFilter} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="customer">Customer</option>
          </select>
          <select style={s.select} value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button onClick={fetchUsers} style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#E8531C", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" }}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: "Total Users", value: safeUsers.length },
            { label: "Active Users", value: safeUsers.filter(u => u.isActive).length },
            { label: "Admin Users", value: safeUsers.filter(u => u.role === "admin").length },
          ].map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statValue}>{loading ? "…" : st.value}</div>
            </div>
          ))}
        </div>

        {/* Table - Improved Alignment */}
        <div style={s.tableCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1A1A2E" }}>All Users</span>
            <span style={{ fontSize: "12px", color: "#aaa" }}>{filtered.length} results</span>
          </div>

          {loading && <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>Loading users...</div>}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#DC2626" }}>
              <p>{error}</p>
              <button onClick={fetchUsers} style={{ marginTop: "10px", padding: "8px 20px", background: "#E8531C", color: "#fff", border: "none", borderRadius: "8px" }}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["#", "User", "Email", "Role", "Phone", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ ...s.td, textAlign: "center", padding: "60px 0", color: "#bbb" }}>No users found</td></tr>
                )}
                {filtered.map((user, idx) => (
                  <tr key={user._id}>
                    <td style={{ ...s.td, color: "#ccc", width: "32px" }}>{idx + 1}</td>
                    
                    <td style={{ ...s.td, minWidth: "220px", textAlign: "left", paddingLeft: "0px", paddingRight: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-start", width: "100%" }}>
                        <div style={{ flexShrink: 0 }}>
                          <UserAvatar user={user} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: "600", 
                            color: "#1A1A2E",
                            fontSize: "13.5px",
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            display: "block"
                          }}>
                            {user.name || "Unknown User"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ ...s.td, color: "#555" }}>{user.email}</td>

                    <td style={s.td}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          backgroundColor: getRoleBadge(user.role).bg, 
                          color: getRoleBadge(user.role).color,
                          whiteSpace: "nowrap"
                        }}>
                          {user.role}
                        </span>
                      </div>
                    </td>

                    <td style={{ ...s.td, color: "#888" }}>{user.phone || "—"}</td>

                    <td style={s.td}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <span style={{ 
                          padding: "4px 12px", 
                          borderRadius: "20px", 
                          fontSize: "12px", 
                          backgroundColor: user.isActive ? "#DCFCE7" : "#FEE2E2", 
                          color: user.isActive ? "#16A34A" : "#DC2626",
                          whiteSpace: "nowrap"
                        }}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td style={{ ...s.td, color: "#888", fontSize: "12.5px" }}>{formatDate(user.createdAt)}</td>

                    <td style={s.td}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <button 
                          onClick={() => setDeleteTarget(user)}
                          style={{ 
                            padding: "7px 16px", 
                            borderRadius: "8px", 
                            border: "1.5px solid #ef4444", 
                            background: "transparent", 
                            color: "#ef4444", 
                            fontSize: "13px", 
                            fontWeight: "600", 
                            cursor: "pointer" 
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}