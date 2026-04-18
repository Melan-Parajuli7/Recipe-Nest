    /**
     * CommentSection.jsx
     *
     * Embeds inside the recipe detail modal.
     * Connects to:
     *   GET  /api/comments/recipe/:recipeId   — load comments
     *   POST /api/comments/recipe/:recipeId   — post comment (with optional star rating)
     *   POST /api/comments/:id/like           — toggle like
     *   POST /api/comments/recipe/:recipeId   — post reply (parentComment in body)
     *   DELETE /api/comments/:id              — delete own comment
     *   PATCH  /api/comments/:id              — edit own comment
     */

    import { useState, useEffect, useRef } from "react";

    const API_BASE_URL = "http://localhost:3000";

    // ── Star Rating Component ───────────────────────────────────────────────────
    const StarRating = ({ value, onChange, readonly = false }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="cs-stars" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
            key={star}
            type="button"
            className={`cs-star ${star <= (hovered || value) ? "cs-star--filled" : ""}`}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange && onChange(star === value ? 0 : star)}
            disabled={readonly}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            >
            ★
            </button>
        ))}
        </div>
    );
    };

    // ── Single Comment Card ─────────────────────────────────────────────────────
    const CommentCard = ({
    comment,
    currentUserId,
    token,
    recipeId,
    onDeleted,
    onLiked,
    depth = 0,
    }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyLoading, setReplyLoading] = useState(false);
    const [liked, setLiked] = useState(
        comment.likes?.some((id) =>
        id === currentUserId || id?._id === currentUserId || id?.toString?.() === currentUserId
        ) || false
    );
    const [likeCount, setLikeCount] = useState(comment.likeCount ?? comment.likes?.length ?? 0);
    const [replies, setReplies] = useState(comment.replies || []);
    const [loadingLike, setLoadingLike] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [editLoading, setEditLoading] = useState(false);
    const [displayContent, setDisplayContent] = useState(comment.content);
    const [isEdited, setIsEdited] = useState(comment.isEdited || false);
    const textareaRef = useRef(null);
    const editTextareaRef = useRef(null);

    const isOwner = comment.author?._id === currentUserId || comment.author === currentUserId;
    const avatarUrl = comment.author?.avatar
        ? `${API_BASE_URL}/${String(comment.author.avatar).replace(/\\/g, "/").split("uploads").pop()?.replace(/^\//, "")}`
        : null;

    const timeAgo = (dateStr) => {
        const diff = (Date.now() - new Date(dateStr)) / 1000;
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    const handleLike = async () => {
        if (!token || loadingLike) return;
        setLoadingLike(true);
        try {
        const res = await fetch(`${API_BASE_URL}/api/comments/${comment._id}/like`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
            setLiked(data.liked);
            setLikeCount(data.likeCount);
            onLiked?.(comment._id, data.liked, data.likeCount);
        }
        } catch (err) {
        console.error("Like error:", err);
        } finally {
        setLoadingLike(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this comment?")) return;
        try {
        const res = await fetch(`${API_BASE_URL}/api/comments/${comment._id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) onDeleted?.(comment._id);
        } catch (err) {
        console.error("Delete error:", err);
        }
    };

    const handleEditSave = async () => {
        if (!editText.trim() || editLoading) return;
        if (editText.trim() === displayContent) { setIsEditing(false); return; }
        setEditLoading(true);
        try {
        const res = await fetch(`${API_BASE_URL}/api/comments/${comment._id}`, {
            method: "PATCH",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: editText.trim() }),
        });
        const data = await res.json();
        if (data.success) {
            setDisplayContent(editText.trim());
            setIsEdited(true);
            setIsEditing(false);
        }
        } catch (err) {
        console.error("Edit error:", err);
        } finally {
        setEditLoading(false);
        }
    };

    useEffect(() => {
        if (isEditing && editTextareaRef.current) {
        editTextareaRef.current.focus();
        const len = editTextareaRef.current.value.length;
        editTextareaRef.current.setSelectionRange(len, len);
        }
    }, [isEditing]);

    const handleReply = async () => {
        if (!replyText.trim() || replyLoading) return;
        setReplyLoading(true);
        try {
        const res = await fetch(`${API_BASE_URL}/api/comments/recipe/${recipeId}`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: replyText.trim(), parentComment: comment._id }),
        });
        const data = await res.json();
        if (data.success) {
            setReplies((prev) => [...prev, data.comment]);
            setReplyText("");
            setShowReplyBox(false);
        }
        } catch (err) {
        console.error("Reply error:", err);
        } finally {
        setReplyLoading(false);
        }
    };

    useEffect(() => {
        if (showReplyBox && textareaRef.current) textareaRef.current.focus();
    }, [showReplyBox]);

    return (
        <div className={`cs-comment ${depth > 0 ? "cs-comment--reply" : ""}`}>
        {/* Avatar + meta row */}
        <div className="cs-comment-header">
            <div className="cs-avatar">
            {avatarUrl ? (
                <img src={avatarUrl} alt={comment.author?.name} onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
                <span className="cs-avatar-initial">
                {comment.author?.name?.[0]?.toUpperCase() || "?"}
                </span>
            )}
            </div>
            <div className="cs-comment-meta">
            <span className="cs-author-name">{comment.author?.name || "Chef"}</span>
            {comment.rating && (
                <StarRating value={comment.rating} readonly />
            )}
            <span className="cs-timestamp">{timeAgo(comment.createdAt)}</span>
            </div>
            {isOwner && (
            <div className="cs-owner-actions">
                <button
                className="cs-edit-btn"
                onClick={() => { setIsEditing(true); setEditText(displayContent); }}
                title="Edit comment"
                >
                ✏️
                </button>
                <button className="cs-delete-btn" onClick={handleDelete} title="Delete comment">
                🗑
                </button>
            </div>
            )}
        </div>

        {/* Comment text or edit box */}
        {isEditing ? (
            <div className="cs-edit-box">
            <textarea
                ref={editTextareaRef}
                className="cs-textarea cs-edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleEditSave();
                if (e.key === "Escape") { setIsEditing(false); setEditText(displayContent); }
                }}
                rows={3}
                maxLength={1000}
            />
            <div className="cs-reply-actions">
                <button
                className="cs-reply-cancel"
                onClick={() => { setIsEditing(false); setEditText(displayContent); }}
                >
                Cancel
                </button>
                <button
                className="cs-reply-submit"
                onClick={handleEditSave}
                disabled={!editText.trim() || editLoading}
                >
                {editLoading ? "Saving…" : "Save Edit"}
                </button>
            </div>
            </div>
        ) : (
            <p className="cs-comment-text">
            {displayContent}
            {isEdited && <span className="cs-edited"> (edited)</span>}
            </p>
        )}

        {/* Actions */}
        <div className="cs-comment-actions">
            <button
            className={`cs-action-btn cs-like-btn ${liked ? "cs-like-btn--active" : ""}`}
            onClick={handleLike}
            disabled={!token || loadingLike}
            title={liked ? "Unlike" : "Like"}
            >
            <span className="cs-like-icon">♥</span>
            <span>{likeCount > 0 ? likeCount : ""}</span>
            </button>

            {depth === 0 && token && (
            <button
                className="cs-action-btn cs-reply-btn"
                onClick={() => setShowReplyBox((v) => !v)}
            >
                ↩ Reply
            </button>
            )}
        </div>

        {/* Reply input box */}
        {showReplyBox && (
            <div className="cs-reply-box">
            <textarea
                ref={textareaRef}
                className="cs-reply-input"
                placeholder={`Reply to ${comment.author?.name || "Chef"}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                maxLength={1000}
            />
            <div className="cs-reply-actions">
                <button
                className="cs-reply-cancel"
                onClick={() => { setShowReplyBox(false); setReplyText(""); }}
                >
                Cancel
                </button>
                <button
                className="cs-reply-submit"
                onClick={handleReply}
                disabled={!replyText.trim() || replyLoading}
                >
                {replyLoading ? "Posting…" : "Post Reply"}
                </button>
            </div>
            </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
            <div className="cs-replies">
            {replies.map((reply) => (
                <CommentCard
                key={reply._id}
                comment={reply}
                currentUserId={currentUserId}
                token={token}
                recipeId={recipeId}
                depth={1}
                onDeleted={(id) => setReplies((prev) => prev.filter((r) => r._id !== id))}
                onLiked={() => {}}
                />
            ))}
            </div>
        )}
        </div>
    );
    };

    // ── Main CommentSection ─────────────────────────────────────────────────────
    const CommentSection = ({ recipeId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [text, setText] = useState("");
    const [rating, setRating] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("jwtToken");
    const currentUserId = (() => {
        try {
        if (!token) return null;
        return JSON.parse(atob(token.split(".")[1])).id;
        } catch { return null; }
    })();

    // ── Fetch comments ──────────────────────────────────────────────────────
    const fetchComments = async (pageNum = 1, append = false) => {
        if (!recipeId) return;
        try {
        const res = await fetch(
            `${API_BASE_URL}/api/comments/recipe/${recipeId}?page=${pageNum}&limit=5`
        );
        const data = await res.json();
        if (data.success) {
            const incoming = data.comments || [];
            setComments((prev) => append ? [...prev, ...incoming] : incoming);
            setTotalCount(data.totalCount || 0);
            setHasMore(pageNum < (data.totalPages || 1));
            setPage(pageNum);
        }
        } catch (err) {
        console.error("Fetch comments error:", err);
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        setComments([]);
        setPage(1);
        setLoading(true);
        fetchComments(1, false);
    }, [recipeId]);

    // ── Post comment ────────────────────────────────────────────────────────
    const handlePost = async () => {
        if (!text.trim()) { setError("Please write something first."); return; }
        if (!token) { setError("You must be logged in to comment."); return; }
        setError("");
        setPosting(true);
        try {
        const body = { content: text.trim() };
        if (rating > 0) body.rating = rating;

        const res = await fetch(`${API_BASE_URL}/api/comments/recipe/${recipeId}`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
            setComments((prev) => [data.comment, ...prev]);
            setTotalCount((c) => c + 1);
            setText("");
            setRating(0);
        } else {
            setError(data.message || "Failed to post comment.");
        }
        } catch (err) {
        setError("Network error. Please try again.");
        } finally {
        setPosting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handlePost();
    };

    return (
        <>
        <style>{`
            /* ══════════════════════════════════════════════════
            CommentSection — Light Modal Theme
            Accent: #c9612a (warm orange)
            Text: #2d1f0e (dark brown)
            ══════════════════════════════════════════════════ */

            .cs-root {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #f0e0cc;
            }

            /* ── Heading ─────────────────────────────────── */
            .cs-heading {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 20px;
            font-weight: 700;
            color: #2d1f0e;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            }

            .cs-count-badge {
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            font-weight: 600;
            padding: 2px 10px;
            border-radius: 20px;
            background: #fde8d8;
            border: 1px solid #e8955a;
            color: #c9612a;
            }

            /* ── Compose box ─────────────────────────────── */
            .cs-compose {
            background: #fdf6f0;
            border: 1.5px solid #e8c4a0;
            border-radius: 14px;
            padding: 18px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(180, 100, 40, 0.07);
            }

            .cs-compose-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 11px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #a07050;
            margin-bottom: 10px;
            font-weight: 600;
            }

            .cs-compose-rating-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            }

            .cs-compose-rating-label {
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            color: #7a5c3a;
            font-weight: 500;
            }

            /* Stars */
            .cs-stars {
            display: flex;
            gap: 3px;
            }

            .cs-star {
            background: none;
            border: none;
            font-size: 22px;
            cursor: pointer;
            color: #d9c4ae;
            padding: 0;
            line-height: 1;
            transition: color 0.15s ease, transform 0.1s ease;
            }

            .cs-star:hover { transform: scale(1.2); }
            .cs-star--filled { color: #e8955a; }
            .cs-star:disabled { cursor: default; }
            .cs-star:disabled:hover { transform: none; }

            /* Textarea */
            .cs-textarea {
            width: 100%;
            background: #fff;
            border: 1.5px solid #ddc8b0;
            border-radius: 10px;
            color: #2d1f0e;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            padding: 12px 14px;
            resize: none;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            line-height: 1.6;
            }

            .cs-textarea::placeholder { color: #b89878; }
            .cs-textarea:focus {
            border-color: #c9612a;
            box-shadow: 0 0 0 3px rgba(201, 97, 42, 0.1);
            }

            .cs-compose-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 10px;
            flex-wrap: wrap;
            gap: 8px;
            }

            .cs-char-count {
            font-size: 11px;
            color: #b89878;
            font-family: 'DM Sans', sans-serif;
            }

            .cs-post-btn {
            background: linear-gradient(135deg, #e8955a, #c9612a);
            border: none;
            border-radius: 50px;
            color: #fff;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: 600;
            padding: 10px 24px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(201, 97, 42, 0.35);
            letter-spacing: 0.3px;
            }

            .cs-post-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(201, 97, 42, 0.5);
            }

            .cs-post-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            transform: none;
            }

            .cs-error {
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            color: #c0392b;
            margin-top: 8px;
            background: #fdecea;
            border-radius: 6px;
            padding: 6px 10px;
            border: 1px solid #f5c6c2;
            }

            .cs-login-prompt {
            text-align: center;
            padding: 16px;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            color: #7a5c3a;
            background: #fdf6f0;
            border: 1.5px dashed #e8c4a0;
            border-radius: 10px;
            margin-bottom: 24px;
            }

            /* ── Comments list ─────────────────────────── */
            .cs-list {
            display: flex;
            flex-direction: column;
            gap: 0;
            }

            .cs-empty {
            text-align: center;
            padding: 32px 0;
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            color: #a07050;
            }

            .cs-empty-icon { font-size: 36px; margin-bottom: 10px; }

            /* ── Individual Comment ──────────────────── */
            .cs-comment {
            padding: 16px 0;
            border-bottom: 1px solid #f0e0cc;
            animation: csSlideIn 0.3s ease both;
            }

            .cs-comment:last-child { border-bottom: none; }

            @keyframes csSlideIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
            }

            .cs-comment--reply {
            padding: 12px 0 12px 16px;
            border-bottom: none;
            border-left: 3px solid #e8c4a0;
            margin-left: 4px;
            background: #fdf8f4;
            border-radius: 0 8px 8px 0;
            padding-right: 10px;
            margin-top: 8px;
            }

            .cs-comment-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 8px;
            }

            .cs-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            background: #fde8d8;
            border: 2px solid #e8955a;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            }

            .cs-avatar img { width: 100%; height: 100%; object-fit: cover; }

            .cs-avatar-initial {
            font-size: 15px;
            font-weight: 700;
            color: #c9612a;
            font-family: 'DM Sans', sans-serif;
            }

            .cs-comment-meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
            flex: 1;
            }

            .cs-author-name {
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: 700;
            color: #2d1f0e;
            }

            .cs-timestamp {
            font-size: 11px;
            color: #b89878;
            font-family: 'DM Sans', sans-serif;
            }

            .cs-edited {
            font-size: 10px;
            color: #b89878;
            font-style: italic;
            font-family: 'DM Sans', sans-serif;
            }

            .cs-delete-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 15px;
            opacity: 0.4;
            padding: 2px 5px;
            border-radius: 4px;
            transition: opacity 0.2s ease, background 0.2s ease;
            flex-shrink: 0;
            margin-left: auto;
            }

            .cs-delete-btn:hover {
            opacity: 1;
            background: #fdecea;
            }

            .cs-owner-actions {
            display: flex;
            gap: 4px;
            margin-left: auto;
            flex-shrink: 0;
            }

            .cs-edit-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            opacity: 0.4;
            padding: 2px 5px;
            border-radius: 4px;
            transition: opacity 0.2s ease, background 0.2s ease;
            }

            .cs-edit-btn:hover {
            opacity: 1;
            background: #fde8d8;
            }

            .cs-edit-box {
            margin: 0 0 10px 46px;
            animation: csSlideIn 0.2s ease both;
            }

            .cs-edit-textarea {
            margin-bottom: 0;
            }

            .cs-comment-text {
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            color: #4a3520;
            line-height: 1.65;
            margin: 0 0 10px 46px;
            white-space: pre-wrap;
            word-break: break-word;
            }

            /* ── Actions ────────────────────────────── */
            .cs-comment-actions {
            display: flex;
            gap: 6px;
            margin-left: 46px;
            }

            .cs-action-btn {
            background: none;
            border: 1px solid transparent;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            color: #a07050;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 20px;
            transition: all 0.2s ease;
            font-weight: 500;
            }

            .cs-action-btn:hover:not(:disabled) {
            color: #c9612a;
            background: #fde8d8;
            border-color: #e8c4a0;
            }

            .cs-action-btn:disabled { cursor: default; opacity: 0.5; }

            .cs-like-btn--active {
            color: #c9612a !important;
            background: #fde8d8 !important;
            border-color: #e8955a !important;
            }

            .cs-like-icon { font-size: 14px; }

            /* ── Reply box ───────────────────────────── */
            .cs-reply-box {
            margin: 12px 0 0 46px;
            animation: csSlideIn 0.2s ease both;
            }

            .cs-reply-input {
            width: 100%;
            background: #fff;
            border: 1.5px solid #ddc8b0;
            border-radius: 10px;
            color: #2d1f0e;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            padding: 10px 12px;
            resize: none;
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }

            .cs-reply-input::placeholder { color: #b89878; }
            .cs-reply-input:focus {
            border-color: #c9612a;
            box-shadow: 0 0 0 3px rgba(201, 97, 42, 0.1);
            }

            .cs-reply-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 8px;
            }

            .cs-reply-cancel {
            background: none;
            border: 1.5px solid #ddc8b0;
            border-radius: 20px;
            color: #7a5c3a;
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            padding: 6px 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: 500;
            }

            .cs-reply-cancel:hover {
            border-color: #c9612a;
            color: #c9612a;
            background: #fdf6f0;
            }

            .cs-reply-submit {
            background: linear-gradient(135deg, #e8955a, #c9612a);
            border: none;
            border-radius: 20px;
            color: #fff;
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 18px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(201, 97, 42, 0.3);
            }

            .cs-reply-submit:hover:not(:disabled) {
            box-shadow: 0 4px 12px rgba(201, 97, 42, 0.45);
            transform: translateY(-1px);
            }

            .cs-reply-submit:disabled { opacity: 0.45; cursor: not-allowed; }

            /* ── Replies container ───────────────────── */
            .cs-replies {
            margin-top: 12px;
            margin-left: 34px;
            display: flex;
            flex-direction: column;
            gap: 0;
            }

            /* ── Load more ───────────────────────────── */
            .cs-load-more {
            display: block;
            width: 100%;
            margin-top: 16px;
            padding: 12px;
            background: #fdf6f0;
            border: 1.5px solid #e8c4a0;
            border-radius: 10px;
            color: #c9612a;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            }

            .cs-load-more:hover {
            background: #fde8d8;
            border-color: #c9612a;
            box-shadow: 0 2px 8px rgba(201, 97, 42, 0.15);
            }

            .cs-loading {
            text-align: center;
            padding: 28px 0;
            color: #a07050;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            }
        `}</style>

        <div className="cs-root">
            {/* Heading */}
            <div className="cs-heading">
            💬 Community Notes
            {totalCount > 0 && (
                <span className="cs-count-badge">{totalCount}</span>
            )}
            </div>

            {/* Compose box or login prompt */}
            {token ? (
            <div className="cs-compose">
                <div className="cs-compose-label">Leave a note for the chef</div>

                {/* Star rating row */}
                <div className="cs-compose-rating-row">
                <span className="cs-compose-rating-label">Rate this recipe:</span>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                    <button
                    style={{
                        background: "none",
                        border: "none",
                        color: "#b89878",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                    }}
                    onClick={() => setRating(0)}
                    >
                    clear
                    </button>
                )}
                </div>

                <textarea
                className="cs-textarea"
                placeholder="Share a tip, substitution, or how it turned out for you… (Ctrl+Enter to post)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
                maxLength={1000}
                />

                <div className="cs-compose-footer">
                <span className="cs-char-count">{text.length}/1000</span>
                <button
                    className="cs-post-btn"
                    onClick={handlePost}
                    disabled={posting || !text.trim()}
                >
                    {posting ? "Posting…" : "Post Note"}
                </button>
                </div>

                {error && <div className="cs-error">⚠ {error}</div>}
            </div>
            ) : (
            <div className="cs-login-prompt">
                🔒 <strong>Log in</strong> to leave a comment or rating
            </div>
            )}

            {/* Comments list */}
            {loading ? (
            <div className="cs-loading">Loading comments…</div>
            ) : comments.length === 0 ? (
            <div className="cs-empty">
                <div className="cs-empty-icon">🍴</div>
                Be the first to leave a note for the chef!
            </div>
            ) : (
            <>
                <div className="cs-list">
                {comments.map((comment) => (
                    <CommentCard
                    key={comment._id}
                    comment={comment}
                    currentUserId={currentUserId}
                    token={token}
                    recipeId={recipeId}
                    onDeleted={(id) => {
                        setComments((prev) => prev.filter((c) => c._id !== id));
                        setTotalCount((c) => c - 1);
                    }}
                    onLiked={() => {}}
                    />
                ))}
                </div>

                {hasMore && (
                <button
                    className="cs-load-more"
                    onClick={() => fetchComments(page + 1, true)}
                >
                    Load more comments
                </button>
                )}
            </>
            )}
        </div>
        </>
    );
    };

    export default CommentSection;