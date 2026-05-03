import React, { useState, useEffect, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

/* ── Animated score bar ── */
const ScoreBar = ({ value, color }) => (
  <div style={{
    height: "4px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    marginTop: "10px",
    overflow: "hidden",
  }}>
    <div style={{
      height: "100%",
      width: `${value}%`,
      background: color,
      borderRadius: "2px",
      transition: "width 1.1s cubic-bezier(0.22,1,0.36,1)",
    }} />
  </div>
);

/* ── Keyword chip ── */
const Chip = ({ label, variant }) => {
  const colors = {
    green: { bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.25)", color: "#5eead4" },
    red:   { bg: "rgba(239,68,68,0.09)", border: "rgba(239,68,68,0.22)",  color: "#f87171" },
    amber: { bg: "rgba(251,191,36,0.09)", border: "rgba(251,191,36,0.22)", color: "#fcd34d" },
  };
  const c = colors[variant] || colors.green;
  return (
    <span style={{
      fontSize: "12px",
      fontWeight: "500",
      padding: "4px 12px",
      borderRadius: "20px",
      background: c.bg,
      border: `1px solid ${c.border}`,
      color: c.color,
      display: "inline-block",
    }}>
      {label}
    </span>
  );
};

const ATSFeedback = ({ resumeText }) => {
  const [atsFeedback, setAtsFeedback] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  /* fetch roles on mount */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/job-roles`);
        const data = await res.json();
        if (data.roles) {
          setRoles(data.roles);
          setJobRole(data.roles[0]);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const fetchAtsFeedback = useCallback(async () => {
    if (!resumeText) { setError("Please upload or paste a resume first."); return; }
    if (!jobRole)    { setError("Please select a job role to analyze.");   return; }

    setLoading(true);
    setError(null);
    setAtsFeedback(null);

    try {
      const response = await fetch(`${API_URL}/api/ats-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data: resumeText, job_role: jobRole }),
      });
      if (!response.ok) throw new Error("Server error. Please try again.");

      const result = await response.json();
      const payload = result?.ats_feedback ?? result ?? {};

      setAtsFeedback({
        ats_score:        typeof payload.ats_score      === "number" ? payload.ats_score      : 0,
        keyword_score:    typeof payload.keyword_score  === "number" ? payload.keyword_score  : 0,
        section_score:    typeof payload.section_score  === "number" ? payload.section_score  : 0,
        feedback:         Array.isArray(payload.feedback)          ? payload.feedback          : payload.feedback ? [String(payload.feedback)] : [],
        matched_keywords: Array.isArray(payload.matched_keywords)  ? payload.matched_keywords  : [],
        missing_keywords: Array.isArray(payload.missing_keywords)  ? payload.missing_keywords  : [],
        missing_sections: Array.isArray(payload.missing_sections)  ? payload.missing_sections  : [],
      });
      setHasAnalyzed(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [resumeText, jobRole]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .ats-root {
          width: 100%;
          min-height: 100vh;
          background: #090910;
          font-family: 'DM Sans', sans-serif;
          color: #dde1f0;
          padding: 52px 24px 90px;
          position: relative;
          overflow: hidden;
        }
        .ats-root::before {
          content: '';
          position: fixed;
          top: -180px; right: -140px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .ats-root::after {
          content: '';
          position: fixed;
          bottom: -120px; left: -100px;
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .ats-inner {
          position: relative; z-index: 1;
          max-width: 760px;
          margin: 0 auto;
        }

        /* HEADER */
        .ats-header {
          text-align: center;
          margin-bottom: 44px;
          animation: atsFade 0.6s ease both;
        }
        .ats-badge {
          display: inline-block;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase;
          color: #818cf8;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 20px; padding: 4px 14px;
          margin-bottom: 16px;
        }
        .ats-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          background: linear-gradient(135deg, #e2e2f0 20%, #818cf8 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1; margin-bottom: 10px;
        }
        .ats-sub {
          font-size: 14px; color: #5c6080; line-height: 1.6;
        }

        /* CONTROLS */
        .ats-controls {
          display: flex; gap: 12px; align-items: stretch;
          flex-wrap: wrap;
          margin-bottom: 36px;
          animation: atsFade 0.5s ease 0.1s both;
        }
        .ats-select-wrap {
          flex: 1; min-width: 200px;
          position: relative;
        }
        .ats-select-wrap::after {
          content: '▾';
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #5c6080; font-size: 13px;
          pointer-events: none;
        }
        .ats-select {
          width: 100%; height: 52px;
          background: #0f0f1a;
          border: 1px solid #1c1c2e;
          border-radius: 14px;
          padding: 0 40px 0 16px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #c4c4e0;
          -webkit-appearance: none; appearance: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .ats-select:focus {
          outline: none;
          border-color: rgba(99,102,241,0.45);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .ats-btn {
          height: 52px; padding: 0 28px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          box-shadow: 0 4px 24px rgba(99,102,241,0.25);
          display: flex; align-items: center; gap: 9px;
          white-space: nowrap;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .ats-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .ats-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .ats-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: atsSpinAnim 0.8s linear infinite;
        }

        /* ERROR */
        .ats-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 13px 18px;
          font-size: 13px; color: #f87171;
          margin-bottom: 28px;
          display: flex; align-items: center; gap: 9px;
          animation: atsFade 0.3s ease both;
        }

        /* EMPTY STATE */
        .ats-empty {
          text-align: center;
          padding: 60px 20px;
          animation: atsFade 0.5s ease 0.2s both;
        }
        .ats-empty-icon {
          font-size: 48px; margin-bottom: 18px; opacity: 0.18;
        }
        .ats-empty-text {
          font-size: 15px; color: #3d3d5c; line-height: 1.6;
        }

        /* LOADING STATE */
        .ats-loading-state {
          display: flex; flex-direction: column;
          align-items: center; gap: 18px;
          padding: 60px 20px;
          animation: atsFade 0.3s ease both;
        }
        .ats-loading-bars {
          display: flex; align-items: flex-end; gap: 5px; height: 36px;
        }
        .ats-loading-bar {
          width: 4px; border-radius: 2px;
          background: #4f46e5;
          animation: atsBarBounce 1s ease-in-out infinite;
        }
        .ats-loading-label {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #3d3d5c;
        }

        /* RESULTS */
        .ats-results { animation: atsFade 0.55s ease both; }

        /* SCORE GRID */
        .ats-score-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }
        @media (max-width: 520px) { .ats-score-grid { grid-template-columns: 1fr; } }
        .ats-score-card {
          background: #0f0f1a;
          border: 1px solid #1c1c2e;
          border-radius: 16px;
          padding: 20px 20px 16px;
          transition: border-color 0.2s;
        }
        .ats-score-card:hover { border-color: rgba(99,102,241,0.3); }
        .ats-score-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #5c6080; margin-bottom: 8px;
        }
        .ats-score-value {
          font-family: 'Syne', sans-serif;
          font-size: 2rem; font-weight: 800;
        }

        /* SECTION */
        .ats-section {
          background: #0f0f1a;
          border: 1px solid #1c1c2e;
          border-radius: 16px;
          padding: 22px 24px;
          margin-bottom: 14px;
        }
        .ats-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #5c6080; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .ats-section-title::before {
          content: '';
          display: inline-block;
          width: 3px; height: 14px;
          border-radius: 2px;
          background: currentColor;
        }

        /* FEEDBACK LIST */
        .ats-feedback-list {
          list-style: none; padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 10px;
        }
        .ats-feedback-item {
          display: flex; gap: 12px; align-items: flex-start;
          font-size: 14px; color: #a0a0c0; line-height: 1.6;
        }
        .ats-feedback-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4f46e5; flex-shrink: 0; margin-top: 8px;
        }

        /* CHIPS WRAP */
        .ats-chips { display: flex; flex-wrap: wrap; gap: 8px; }

        /* DIVIDER */
        .ats-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .ats-divider-line { flex: 1; height: 1px; background: #1c1c2e; }
        .ats-divider-text {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #2d2d4a; white-space: nowrap;
        }

        @keyframes atsFade {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes atsSpinAnim { to { transform: rotate(360deg); } }
        @keyframes atsBarBounce {
          0%,100% { height: 8px; opacity: 0.4; }
          50%     { height: 32px; opacity: 1; }
        }
      `}</style>

      <div className="ats-root">
        <div className="ats-inner">

          {/* HEADER */}
          <div className="ats-header">
            <div className="ats-badge">ATS Intelligence</div>
            <h2 className="ats-title">Resume Role Fit Analyzer</h2>
            <p className="ats-sub">
              Select a target role and run an analysis to see how well your resume passes ATS filters.
            </p>
          </div>

          {/* CONTROLS */}
          <div className="ats-controls">
            <div className="ats-select-wrap">
              <select
                className="ats-select"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              >
                {roles.length > 0
                  ? roles.map((role, i) => <option key={i} value={role}>{role}</option>)
                  : <option>Loading roles…</option>
                }
              </select>
            </div>
            <button
              className="ats-btn"
              onClick={fetchAtsFeedback}
              disabled={loading}
            >
              {loading
                ? <><div className="ats-spinner" /> Analyzing…</>
                : <>⚡ Analyze Role Fit</>
              }
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="ats-error">
              <span style={{ color: "#ef4444" }}>●</span>
              {error}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="ats-loading-state">
              <div className="ats-loading-bars">
                {[0,0.15,0.3,0.45,0.6,0.45,0.3,0.15,0].map((delay, i) => (
                  <div
                    key={i}
                    className="ats-loading-bar"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
              <span className="ats-loading-label">Scanning Resume…</span>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !hasAnalyzed && !error && (
            <div className="ats-empty">
              <div className="ats-empty-icon">⚙</div>
              <p className="ats-empty-text">
                Choose a role above and click <strong style={{ color: "#818cf8" }}>Analyze Role Fit</strong> to<br />
                see your ATS scores, matched keywords, and feedback.
              </p>
            </div>
          )}

          {/* RESULTS — only shown after button clicked */}
          {!loading && atsFeedback && (
            <div className="ats-results">

              {/* SCORE CARDS */}
              <div className="ats-score-grid">
                <div className="ats-score-card">
                  <div className="ats-score-label">Role Fit</div>
                  <div className="ats-score-value" style={{ color: "#818cf8" }}>
                    {atsFeedback.ats_score}%
                  </div>
                  <ScoreBar value={atsFeedback.ats_score} color="linear-gradient(90deg,#4f46e5,#7c3aed)" />
                </div>
                <div className="ats-score-card">
                  <div className="ats-score-label">Keyword Coverage</div>
                  <div className="ats-score-value" style={{ color: "#5eead4" }}>
                    {atsFeedback.keyword_score}%
                  </div>
                  <ScoreBar value={atsFeedback.keyword_score} color="linear-gradient(90deg,#0d9488,#14b8a6)" />
                </div>
                <div className="ats-score-card">
                  <div className="ats-score-label">Section Coverage</div>
                  <div className="ats-score-value" style={{ color: "#fcd34d" }}>
                    {atsFeedback.section_score}%
                  </div>
                  <ScoreBar value={atsFeedback.section_score} color="linear-gradient(90deg,#d97706,#fbbf24)" />
                </div>
              </div>

              {/* DIVIDER */}
              <div className="ats-divider">
                <div className="ats-divider-line" />
                <span className="ats-divider-text">Detailed Analysis</span>
                <div className="ats-divider-line" />
              </div>

              {/* FEEDBACK */}
              {atsFeedback.feedback.length > 0 && (
                <div className="ats-section">
                  <div className="ats-section-title" style={{ color: "#818cf8" }}>Feedback</div>
                  <ul className="ats-feedback-list">
                    {atsFeedback.feedback.map((msg, i) => (
                      <li key={i} className="ats-feedback-item">
                        <span className="ats-feedback-dot" />
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* MATCHED KEYWORDS */}
              <div className="ats-section">
                <div className="ats-section-title" style={{ color: "#5eead4" }}>
                  Matched Keywords
                  {atsFeedback.matched_keywords.length > 0 &&
                    <span style={{ color: "#5c6080", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: "12px" }}>
                      ({atsFeedback.matched_keywords.length} found)
                    </span>
                  }
                </div>
                {atsFeedback.matched_keywords.length > 0 ? (
                  <div className="ats-chips">
                    {atsFeedback.matched_keywords.map((kw, i) => (
                      <Chip key={i} label={kw} variant="green" />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "14px", color: "#3d3d5c" }}>None detected</span>
                )}
              </div>

              {/* MISSING KEYWORDS */}
              <div className="ats-section">
                <div className="ats-section-title" style={{ color: "#f87171" }}>
                  Missing Keywords
                  {atsFeedback.missing_keywords.length > 0 &&
                    <span style={{ color: "#5c6080", fontWeight: 500, textTransform: "none", letterSpacing: 0, fontSize: "12px" }}>
                      ({atsFeedback.missing_keywords.length} missing)
                    </span>
                  }
                </div>
                {atsFeedback.missing_keywords.length > 0 ? (
                  <div className="ats-chips">
                    {atsFeedback.missing_keywords.map((kw, i) => (
                      <Chip key={i} label={kw} variant="red" />
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "14px", color: "#3d3d5c" }}>None — great coverage!</span>
                )}
              </div>

              {/* MISSING SECTIONS */}
              {atsFeedback.missing_sections.length > 0 && (
                <div className="ats-section">
                  <div className="ats-section-title" style={{ color: "#fcd34d" }}>Missing Sections</div>
                  <div className="ats-chips">
                    {atsFeedback.missing_sections.map((s, i) => (
                      <Chip key={i} label={s} variant="amber" />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ATSFeedback;