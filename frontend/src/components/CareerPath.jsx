import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const CareerPath = ({ resumeText }) => {
  const [predictedCareer, setPredictedCareer] = useState('');
  const [score, setScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [method, setMethod] = useState('');
  const [topRoles, setTopRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/career-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_data: resumeText }),
      });
      const result = await response.json();
      setPredictedCareer(result.predicted_career || 'Not Found');
      setScore(result.score || 0);
      setMatchedSkills(result.matched_skills || []);
      setMethod(result.method || '');
      setTopRoles(result.top_roles || []);
    } catch (err) {
      setError('Failed to predict career path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 38;
  const strokeDash = score ? circumference - (score / 100) * circumference : circumference;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .cp-root {
          width: 100%;
          min-height: 100vh;
          background: #090910;
          font-family: 'DM Sans', sans-serif;
          color: #dde1f0;
          padding: 52px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .cp-root::before {
          content: '';
          position: fixed;
          top: -160px; left: -160px;
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%);
          pointer-events: none;
        }
        .cp-root::after {
          content: '';
          position: fixed;
          bottom: -120px; right: -120px;
          width: 440px; height: 440px;
          background: radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .cp-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
        }

        /* HEADER */
        .cp-header {
          text-align: center;
          margin-bottom: 44px;
          animation: cpFade 0.6s ease both;
        }
        .cp-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(139,92,246,0.1);
          border: 1px solid rgba(139,92,246,0.22);
          border-radius: 20px;
          padding: 4px 14px;
          margin-bottom: 16px;
        }
        .cp-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          background: linear-gradient(135deg, #e2e2f0 20%, #a78bfa 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .cp-sub {
          font-size: 14px;
          color: #5c6080;
          line-height: 1.6;
        }

        /* BUTTON */
        .cp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 15px 24px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          box-shadow: 0 4px 28px rgba(124,58,237,0.3);
          transition: opacity 0.2s, transform 0.15s;
          margin-bottom: 36px;
          animation: cpFade 0.5s ease 0.1s both;
        }
        .cp-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .cp-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

        .cp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: cpSpin 0.8s linear infinite;
        }

        /* ERROR */
        .cp-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          padding: 13px 18px;
          font-size: 13px;
          color: #f87171;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        /* RESULTS */
        .cp-results {
          animation: cpFade 0.5s ease both;
        }

        /* PRIMARY CARD */
        .cp-primary {
          background: #0f0f1a;
          border: 1px solid #1c1c2e;
          border-radius: 18px;
          padding: 28px 28px 24px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }

        /* SCORE RING */
        .cp-ring-wrap {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .cp-ring {
          transform: rotate(-90deg);
        }
        .cp-ring-bg { fill: none; stroke: #1c1c2e; stroke-width: 6; }
        .cp-ring-fill {
          fill: none;
          stroke: url(#ringGrad);
          stroke-width: 6;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s ease;
        }
        .cp-ring-label {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #5c6080;
        }

        /* PRIMARY INFO */
        .cp-primary-info { flex: 1; min-width: 200px; }
        .cp-primary-role-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a78bfa;
          margin-bottom: 6px;
        }
        .cp-primary-role {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #e2e2f0;
          margin-bottom: 14px;
          line-height: 1.15;
        }
        .cp-skills-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 14px;
        }
        .cp-skill-chip {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          background: rgba(20,184,166,0.1);
          border: 1px solid rgba(20,184,166,0.22);
          color: #5eead4;
        }
        .cp-method {
          font-size: 12px;
          color: #3d3d5c;
          font-style: italic;
        }

        /* DIVIDER LABEL */
        .cp-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }
        .cp-divider-line {
          flex: 1;
          height: 1px;
          background: #1c1c2e;
        }
        .cp-divider-text {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3d3d5c;
          white-space: nowrap;
        }

        /* ROLE CARDS */
        .cp-roles-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .cp-role-card {
          background: #0f0f1a;
          border: 1px solid #1c1c2e;
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          transition: border-color 0.2s;
        }
        .cp-role-card:hover { border-color: rgba(139,92,246,0.3); }
        .cp-role-name {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #c4c4e0;
          margin-bottom: 4px;
        }
        .cp-role-meta {
          font-size: 12px;
          color: #5c6080;
        }
        .cp-role-score-pill {
          flex-shrink: 0;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.22);
          color: #a5b4fc;
        }

        @keyframes cpFade {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="cp-root">
        <div className="cp-inner">

          {/* HEADER */}
          <div className="cp-header">
            <div className="cp-badge">AI-Powered</div>
            <h2 className="cp-title">Career Path Prediction</h2>
            <p className="cp-sub">Discover the roles best matched to your skills and experience.</p>
          </div>

          {/* BUTTON */}
          <button className="cp-btn" onClick={handlePredict} disabled={loading}>
            {loading
              ? <><div className="cp-spinner" /> Analyzing Resume…</>
              : '⚡ Predict My Career Path'
            }
          </button>

          {/* ERROR */}
          {error && (
            <div className="cp-error">
              <span style={{ color: '#ef4444', fontSize: '16px' }}>●</span>
              {error}
            </div>
          )}

          {/* RESULTS */}
          {predictedCareer && (
            <div className="cp-results">

              {/* PRIMARY RESULT */}
              <div className="cp-primary">
                {/* Score Ring */}
                <div className="cp-ring-wrap">
                  <svg width="96" height="96" className="cp-ring" viewBox="0 0 96 96">
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                    <circle className="cp-ring-bg" cx="48" cy="48" r="38" />
                    <circle
                      className="cp-ring-fill"
                      cx="48" cy="48" r="38"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDash}
                    />
                    <text
                      x="48" y="48"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fill: '#e2e2f0',
                        fontSize: '18px',
                        fontWeight: '800',
                        fontFamily: 'Syne, sans-serif',
                        transform: 'rotate(90deg)',
                        transformOrigin: '48px 48px',
                      }}
                    >
                      {score}%
                    </text>
                  </svg>
                  <span className="cp-ring-label">Match</span>
                </div>

                {/* Info */}
                <div className="cp-primary-info">
                  <div className="cp-primary-role-label">Best Match</div>
                  <div className="cp-primary-role">{predictedCareer}</div>
                  {matchedSkills.length > 0 && (
                    <div className="cp-skills-wrap">
                      {matchedSkills.slice(0, 8).map((skill, i) => (
                        <span key={i} className="cp-skill-chip">{skill}</span>
                      ))}
                      {matchedSkills.length > 8 && (
                        <span className="cp-skill-chip">+{matchedSkills.length - 8} more</span>
                      )}
                    </div>
                  )}
                  {method && <div className="cp-method">Method: {method}</div>}
                </div>
              </div>

              {/* OTHER ROLES */}
              {topRoles.length > 1 && (
                <>
                  <div className="cp-divider">
                    <div className="cp-divider-line" />
                    <span className="cp-divider-text">Other Strong Fits</span>
                    <div className="cp-divider-line" />
                  </div>
                  <div className="cp-roles-grid">
                    {topRoles.slice(1, 4).map((role, i) => (
                      <div key={i} className="cp-role-card">
                        <div>
                          <div className="cp-role-name">{role.career_path}</div>
                          <div className="cp-role-meta">
                            {role.matched_skills?.length ?? 0} matched skills
                          </div>
                        </div>
                        <div className="cp-role-score-pill">{role.final_score}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CareerPath;