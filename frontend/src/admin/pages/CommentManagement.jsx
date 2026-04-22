import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../shared/components/SideBar";       
import { getAllComments, deleteComment, getAllUsers } from "../api";

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

function StarRating({ rating }) {
  if (!rating) return <span style={{ color: "#ddd", fontSize: "12px" }}>No rating</span>;
  return (
    <div style={{ display: "flex", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= rating ? "#F59E0B" : "#E5E7EB", fontSize: "13px" }}>★</span>
      ))}
    </div>
  );
}

// SAME AVATAR LOGIC AS UserManagement.jsx
function AuthorAvatar({ author }) {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  if (!author?.avatar) {
    return <InitialsAvatar author={author} />;
  }

  let path = author.avatar.trim();
  if (path.startsWith('/')) path = path.slice(1);

  const avatarUrl = `${BASE_URL}/${path}`;

  return (
    <>
      <img
        src={avatarUrl}
        alt={author.name || "User"}
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
        onError={(e) => {
          e.target.style.display = "none";
          const fallback = e.target.nextElementSibling;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <InitialsAvatar author={author} style={{ display: "none" }} />
    </>
  );
}

function InitialsAvatar({ author, style = {} }) {
  const initials = (author?.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const COLORS = ["#E8531C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
  const bgColor = COLORS[(author?.name?.charCodeAt(0) || 0) % COLORS.length];

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        backgroundColor: bgColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "700",
        flexShrink: 0,
        ...style,
      }}
    >
      {initials || "??"}
    </div>
  );
}

function DeleteModal({ comment, onConfirm, onCancel }) {
  const preview = comment?.content?.slice(0, 60) + (comment?.content?.length > 60 ? "…" : "");
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", padding: "32px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: "inherit" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
        </div>
        <h3 style={{ textAlign: "center", fontSize: "17px", fontWeight: "700", color: "#1A1A2E", marginBottom: "10px" }}>Delete Comment?</h3>
        <div style={{ backgroundColor: "#F8F5F2", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
          <p style={{ margin: 0, fontSize: "13px", color: "#555", lineHeight: 1.5, fontStyle: "italic" }}>"{preview}"</p>
        </div>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginBottom: "24px" }}>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "1.5px solid #E0DDD8", background: "transparent", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#555" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", borderRadius: "9px", border: "none", background: "#DC2626", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
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
  filterRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  searchBar: { display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fff", borderRadius: "50px", padding: "10px 20px", flex: 1, maxWidth: "380px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  searchInput: { border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#333", width: "100%", fontFamily: "inherit" },
  select: { padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #E0DDD8", background: "#fff", fontSize: "13.5px", fontFamily: "inherit", color: "#444", cursor: "pointer", outline: "none" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" },
  statCard: { backgroundColor: "#fff", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  statLabel: { fontSize: "12px", color: "#888", marginBottom: "5px", fontWeight: "500" },
  statValue: { fontSize: "22px", fontWeight: "700", color: "#1A1A2E" },
  tableCard: { backgroundColor: "#fff", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" },
  th: { textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#888", paddingBottom: "12px", borderBottom: "2px solid #F0EDE8", textTransform: "uppercase", letterSpacing: "0.5px" },
  td: { padding: "14px 0", fontSize: "13.5px", color: "#333", borderBottom: "1px solid #F5F2EE", verticalAlign: "top" },
};

export default function CommentManagement() {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [ratingFilter, setRating] = useState("");
  const [typeFilter, setType]     = useState("");
  const [deleteTarget, setDelete] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const [page, setPage]           = useState(1);
  const PER_PAGE = 15;

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [commentsRes, usersRes] = await Promise.all([
        getAllComments({ limit: 200 }),
        getAllUsers(),
      ]);

      let commentsList = commentsRes.data || commentsRes.comments || (Array.isArray(commentsRes) ? commentsRes : []);
      let usersList = usersRes?.data?.users || usersRes?.users || [];

      const usersMap = {};
      if (Array.isArray(usersList)) {
        usersList.forEach((user) => {
          usersMap[user._id] = user;
        });
      }

      const enrichedComments = commentsList.map((comment) => {
        if (comment.author && comment.author._id && usersMap[comment.author._id]) {
          return {
            ...comment,
            author: {
              ...comment.author,
              avatar: usersMap[comment.author._id].avatar,
            },
          };
        }
        return comment;
      });

      setComments(enrichedComments);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filtered = comments.filter((c) => {
    const q = search.toLowerCase();
    const okSearch = !q || c.content?.toLowerCase().includes(q) || c.author?.name?.toLowerCase().includes(q) || c.recipe?.title?.toLowerCase().includes(q);
    const okRating = !ratingFilter || (ratingFilter === "rated" ? c.rating != null : c.rating == null);
    const okType   = !typeFilter || (typeFilter === "reply" ? c.parentComment != null : c.parentComment == null);
    return okSearch && okRating && okType;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(deleteTarget._id);
      await deleteComment(deleteTarget._id);
      setComments((p) => p.filter((c) => c._id !== deleteTarget._id));
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setDeleting(null);
      setDelete(null);
    }
  };

  const withRating = comments.filter((c) => c.rating != null).length;
  const avgRating  = withRating > 0
    ? (comments.filter((c) => c.rating).reduce((s, c) => s + c.rating, 0) / withRating).toFixed(1)
    : "—";
  const replies = comments.filter((c) => c.parentComment != null).length;

  return (
    <div style={s.page}>
      <Sidebar />
      <main style={s.main}>
        <h1 style={s.heading}>Comment Management</h1>
        <p style={s.sub}>Moderate and manage all comments across recipes</p>

        <div style={s.filterRow}>
          <div style={s.searchBar}>
            <svg width="16" height="16" fill="none" stroke="#bbb" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input style={s.searchInput} placeholder="Search comment, author or recipe…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: "18px", lineHeight: 1 }}>×</button>}
          </div>
          <select style={s.select} value={ratingFilter} onChange={(e) => { setRating(e.target.value); setPage(1); }}>
            <option value="">All Comments</option>
            <option value="rated">With Rating</option>
            <option value="unrated">Without Rating</option>
          </select>
          <select style={s.select} value={typeFilter} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="top">Top-level</option>
            <option value="reply">Replies</option>
          </select>
          <button onClick={fetchComments} style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#E8531C", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>↻ Refresh</button>
        </div>

        <div style={s.statsRow}>
          {[
            { label: "Total Comments", value: comments.length },
            { label: "With Ratings", value: withRating },
            { label: "Replies", value: replies },
            { label: "Avg Rating", value: avgRating },
          ].map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={s.statValue}>{loading ? "…" : st.value}</div>
            </div>
          ))}
        </div>

        <div style={s.tableCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#1A1A2E" }}>All Comments</span>
            <span style={{ fontSize: "12px", color: "#aaa" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "52px 0", color: "#aaa" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #F0EDE8", borderTopColor: "#E8531C", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading comments from MongoDB…
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: "center", padding: "44px 0" }}>
              <p style={{ color: "#DC2626", fontWeight: "600", marginBottom: "8px" }}>Failed to load comments</p>
              <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>{error}</p>
              <button onClick={fetchComments} style={{ padding: "9px 20px", borderRadius: "8px", border: "none", background: "#E8531C", color: "#fff", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
            </div>
          )}

          {!loading && !error && (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["#", "Author", "Comment", "Recipe", "Rating", "Likes", "Type", "Date", "Action"].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr><td colSpan={9} style={{ ...s.td, textAlign: "center", color: "#bbb", padding: "44px 0" }}>No comments match your filters.</td></tr>
                  )}
                  {paginated.map((comment, idx) => (
                    <tr key={comment._id} style={{ opacity: comment.isDeleted ? 0.45 : 1 }}>
                      <td style={{ ...s.td, color: "#ccc", fontSize: "12px", width: "32px" }}>{(page - 1) * PER_PAGE + idx + 1}</td>
                      <td style={{ ...s.td, minWidth: 130 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <AuthorAvatar author={comment.author} />
                          <div>
                            <div style={{ fontWeight: "600", color: "#1A1A2E", fontSize: "13px" }}>{comment.author?.name || "Unknown"}</div>
                            <div style={{ fontSize: "11px", color: "#bbb" }}>{comment.author?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...s.td, maxWidth: 260 }}>
                        <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {comment.isDeleted ? <em style={{ color: "#bbb" }}>[Deleted]</em> : comment.content}
                        </div>
                        {comment.isEdited && <span style={{ fontSize: "11px", color: "#aaa", fontStyle: "italic" }}>edited</span>}
                      </td>
                      <td style={{ ...s.td, maxWidth: 150 }}>
                        <div style={{ fontSize: "12.5px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
                          {comment.recipe?.title || "—"}
                        </div>
                      </td>
                      <td style={s.td}><StarRating rating={comment.rating} /></td>
                      <td style={{ ...s.td, color: "#888", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <svg width="12" height="12" fill="none" stroke="#E8531C" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                          {comment.likeCount || 0}
                        </div>
                      </td>
                      {/* Changed: Now plain text like other columns */}
                      <td style={s.td}>
                        {comment.parentComment ? "Reply" : "Top-level"}
                      </td>
                      <td style={{ ...s.td, fontSize: "12px", color: "#999", minWidth: 90 }}>
                        <div>{formatDate(comment.createdAt)}</div>
                        <div style={{ fontSize: "11px" }}>{formatTime(comment.createdAt)}</div>
                      </td>
                      <td style={s.td}>
                        {!comment.isDeleted ? (
                          <button
                            onClick={() => setDelete(comment)}
                            disabled={deleting === comment._id}
                            style={{ padding: "5px 12px", borderRadius: "7px", border: "1.5px solid #FCA5A5", background: "transparent", color: "#DC2626", fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
                            {deleting === comment._id ? "…" : "Delete"}
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#ccc", fontStyle: "italic" }}>Deleted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ padding: "7px 14px", borderRadius: "8px", border: "1.5px solid #E0DDD8", background: "transparent", cursor: page === 1 ? "default" : "pointer", fontSize: "13px", fontFamily: "inherit", color: page === 1 ? "#ccc" : "#444" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 34, height: 34, borderRadius: "8px", border: "none", background: p === page ? "#E8531C" : "transparent", color: p === page ? "#fff" : "#555", fontSize: "13px", fontWeight: p === page ? "700" : "400", cursor: "pointer", fontFamily: "inherit" }}>
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ padding: "7px 14px", borderRadius: "8px", border: "1.5px solid #E0DDD8", background: "transparent", cursor: page === totalPages ? "default" : "pointer", fontSize: "13px", fontFamily: "inherit", color: page === totalPages ? "#ccc" : "#444" }}>
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteModal
          comment={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDelete(null)}
        />
      )}
    </div>
  );
}