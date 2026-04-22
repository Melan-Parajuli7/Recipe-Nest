import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        .footer-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: rgba(18, 14, 10, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 1000;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .footer-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
          color: rgba(255,255,255,0.4);
        }

        .footer-btn:hover {
          color: rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.05);
        }

        .footer-btn.active {
          color: #e8955a;
        }

        .footer-btn svg {
          width: 22px;
          height: 22px;
          transition: transform 0.2s ease;
        }

        .footer-btn:hover svg {
          transform: translateY(-1px);
        }

        .footer-btn-label {
          font-size: 10px;
          font-family: 'Georgia', serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* The big + button */
        .footer-add-btn {
          background: linear-gradient(135deg, #e8955a, #c9612a);
          border: none;
          cursor: pointer;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(232, 149, 90, 0.45);
          transition: all 0.2s ease;
          margin-top: -18px;
        }

        .footer-add-btn:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 28px rgba(232, 149, 90, 0.6);
        }

        .footer-add-btn:active {
          transform: scale(0.96);
        }

        .footer-add-btn svg {
          width: 26px;
          height: 26px;
          color: #fff;
          transition: transform 0.3s ease;
        }

        .footer-add-btn:hover svg {
          transform: rotate(90deg);
        }

        /* Active dot indicator */
        .footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #e8955a;
          margin-top: -2px;
        }

        /* Page padding so content isn't hidden behind footer */
        .page-with-footer {
          padding-bottom: 80px;
        }
      `}</style>

      <nav className="footer-nav">
        {/* Home */}
        <button
          className={`footer-btn ${isActive("/home") ? "active" : ""}`}
          onClick={() => navigate("/home")}
        >
          <svg viewBox="0 0 24 24" fill={isActive("/home") ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
          <span className="footer-btn-label">Home</span>
          {isActive("/home") && <span className="footer-dot" />}
        </button>

        {/* Recipes list / explore */}
        <button
          className={`footer-btn ${isActive("/recipes") ? "active" : ""}`}
          onClick={() => navigate("/recipes")}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6M9 16h4" />
          </svg>
          <span className="footer-btn-label">Recipes</span>
          {isActive("/recipes") && <span className="footer-dot" />}
        </button>

        {/* Add Recipe — center prominent button */}
        <button
          className="footer-add-btn"
          onClick={() => navigate("/add-recipe")}
          title="Add New Recipe"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* Saved */}
        <button
          className={`footer-btn ${isActive("/saved") ? "active" : ""}`}
          onClick={() => navigate("/saved")}
        >
          <svg viewBox="0 0 24 24" fill={isActive("/saved") ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
          </svg>
          <span className="footer-btn-label">Saved</span>
          {isActive("/saved") && <span className="footer-dot" />}
        </button>

        {/* Profile */}
        <button
          className={`footer-btn ${isActive("/profile") ? "active" : ""}`}
          onClick={() => navigate("/profile")}
        >
          <svg viewBox="0 0 24 24" fill={isActive("/profile") ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span className="footer-btn-label">Profile</span>
          {isActive("/profile") && <span className="footer-dot" />}
        </button>
      </nav>
    </>
  );
};

export default Footer;