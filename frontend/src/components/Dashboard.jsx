import React, { useReducer, useState } from "react";
import {
  Upload,
  Briefcase,
  TrendingUp,
  FileCheck,
  User,
  LogOut,
  Bot,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ChevronRight,
} from "lucide-react";

import ResumeUpload from "./ResumeUpload";
import JobMatcher from "./JobMatcher";
import CareerPath from "./CareerPath";
import ATSFeedback from "./ATSFeedback";
import ResumeOptimizer from "./ResumeOptimizer";

/* ── STATE ── */
const initialState = {
  resume: null,
  job: null,
  jobDescription: "",
  career: null,
  ats: null,
  optimizer: null,
};
function reducer(state, action) {
  return { ...state, ...action };
}

/* ── DASHBOARD ── */
export default function Dashboard({ user, onLogout }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "#upload",    label: "Upload" },
    { href: "#job",       label: "Jobs" },
    { href: "#optimizer", label: "Optimizer" },
    { href: "#career",    label: "Career" },
    { href: "#ats",       label: "ATS" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body, #root {
          background: #090910;
          color: #dde1f0;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
        }

        /* ── SCROLLBAR ── */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1c1c2e; border-radius: 3px; }

        /* ── NAVBAR ── */
        .db-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(9,9,16,0.82);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .db-nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 28px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .db-logo {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800;
          background: linear-gradient(135deg, #e2e2f0, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
          text-decoration: none;
        }
        .db-nav-links {
          display: flex; gap: 32px; list-style: none;
        }
        .db-nav-links a {
          font-size: 13px; font-weight: 500;
          color: #7474a0; text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .db-nav-links a:hover { color: #a5b4fc; }
        .db-nav-right {
          display: flex; align-items: center; gap: 16px;
        }
        .db-user {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #7474a0;
        }
        .db-user-dot {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700; color: #fff;
        }
        .db-logout {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #5c6080;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          padding: 7px 14px; border-radius: 10px;
          border: 1px solid #1c1c2e;
          transition: all 0.2s;
        }
        .db-logout:hover { color: #f87171; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.06); }
        .db-menu-toggle {
          display: none; background: none; border: none;
          color: #7474a0; cursor: pointer;
        }
        @media (max-width: 768px) {
          .db-nav-links { display: none; }
          .db-menu-toggle { display: block; }
          .db-nav-links.mobile-open {
            display: flex; flex-direction: column;
            position: fixed; top: 64px; left: 0; right: 0;
            background: rgba(9,9,16,0.97);
            border-bottom: 1px solid #1c1c2e;
            padding: 20px 28px;
            gap: 20px; z-index: 99;
          }
        }

        /* ── GLOBAL PAGE BG ── */
        .db-page {
          background: #090910;
          min-height: 100vh;
          position: relative;
        }

        /* ── HERO BAND ── */
        .db-hero {
          position: relative; overflow: hidden;
          padding: 80px 28px 60px;
          text-align: center;
        }
        .db-hero::before {
          content: '';
          position: absolute; top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 500px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 65%);
          pointer-events: none;
        }
        .db-hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase;
          color: #818cf8;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 20px; padding: 5px 16px;
          margin-bottom: 20px;
        }
        .db-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800; line-height: 1.08;
          background: linear-gradient(135deg, #e2e2f0 30%, #818cf8 70%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }
        .db-hero-sub {
          font-size: 16px; color: #5c6080; max-width: 520px; margin: 0 auto 36px;
          line-height: 1.7;
        }
        .db-hero-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.06em;
          cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 28px rgba(99,102,241,0.3);
          transition: opacity 0.2s, transform 0.15s;
        }
        .db-hero-cta:hover { opacity: 0.88; transform: translateY(-2px); }

        /* ── SECTION DIVIDER ── */
        .db-section-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(99,102,241,0.15) 20%,
            rgba(99,102,241,0.25) 50%,
            rgba(99,102,241,0.15) 80%,
            transparent 100%
          );
          margin: 0;
        }

        /* ── SECTION LABEL ── */
        .db-section-label {
          max-width: 1200px; margin: 0 auto;
          padding: 48px 28px 0;
          display: flex; align-items: center; gap: 14px;
        }
        .db-section-label-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #818cf8;
          flex-shrink: 0;
        }
        .db-section-label-text h3 {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700; color: #c4c4e0;
        }
        .db-section-label-text p {
          font-size: 13px; color: #4a4a6a; margin-top: 2px;
        }

        /* ── FOOTER ── */
        .db-footer {
          background: #060609;
          border-top: 1px solid #13131f;
          padding: 56px 28px 32px;
          margin-top: 0;
        }
        .db-footer-inner {
          max-width: 1200px; margin: 0 auto;
        }
        .db-footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        @media (max-width: 768px) {
          .db-footer-top { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .db-footer-top { grid-template-columns: 1fr; }
        }
        .db-footer-brand h4 {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800;
          background: linear-gradient(135deg, #e2e2f0, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        .db-footer-brand p {
          font-size: 13px; color: #3d3d5c; line-height: 1.7; max-width: 240px;
        }
        .db-footer-social {
          display: flex; gap: 10px; margin-top: 20px;
        }
        .db-footer-social a {
          width: 36px; height: 36px; border-radius: 10px;
          border: 1px solid #1c1c2e;
          display: flex; align-items: center; justify-content: center;
          color: #5c6080; text-decoration: none;
          transition: all 0.2s;
        }
        .db-footer-social a:hover {
          border-color: rgba(99,102,241,0.4);
          color: #818cf8; background: rgba(99,102,241,0.08);
        }
        .db-footer-col h5 {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #3d3d5c; margin-bottom: 16px;
        }
        .db-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .db-footer-col ul a {
          font-size: 13px; color: #5c6080; text-decoration: none;
          transition: color 0.2s;
        }
        .db-footer-col ul a:hover { color: #a5b4fc; }
        .db-footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 28px; border-top: 1px solid #13131f;
          flex-wrap: wrap; gap: 12px;
        }
        .db-footer-copy {
          font-size: 12px; color: #2d2d4a;
        }
        .db-footer-tagline {
          font-size: 12px; color: #2d2d4a;
          display: flex; align-items: center; gap: 5px;
        }

        @keyframes dbFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="db-page">

        {/* ── NAVBAR ── */}
        <nav className="db-nav">
          <div className="db-nav-inner">
            <a href="#" className="db-logo">AI Resume Builder</a>

            <ul className={`db-nav-links${mobileOpen ? " mobile-open" : ""}`}>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>
                </li>
              ))}
            </ul>

            <div className="db-nav-right">
              <div className="db-user">
                <div className="db-user-dot">
                  {(user?.username || "U")[0].toUpperCase()}
                </div>
                <span style={{ color: "#7474a0", fontSize: "13px" }}>
                  {user?.username || "User"}
                </span>
              </div>
              <button className="db-logout" onClick={onLogout}>
                <LogOut size={14} /> Logout
              </button>
              <button
                className="db-menu-toggle"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO BAND ── */}
        <div className="db-hero" style={{ animation: "dbFade 0.7s ease both" }}>
          <div className="db-hero-badge">
            <Bot size={12} /> AI-Powered Resume Intelligence
          </div>
          <h1 className="db-hero-title">
            Build Resumes That<br />Get You Hired
          </h1>
          <p className="db-hero-sub">
            Upload your resume, match it to jobs, get ATS feedback, and let Jarvis
            optimize every word — all in one place.
          </p>
          <a href="#upload" className="db-hero-cta">
            Get Started <ChevronRight size={16} />
          </a>
        </div>

        {/* ════════════════════════════════════════
            SECTION 1 — Resume Upload  (hero position)
        ════════════════════════════════════════ */}
        <div className="db-section-divider" />
        <SectionLabel
          id="upload"
          icon={<Upload size={16} />}
          title="Upload Resume"
          subtitle="Parse your resume to unlock all features below"
        />
        <section id="upload-content">
          <ResumeUpload
            onResumeData={(data) => dispatch({ resume: data })}
          />
        </section>

        {/* ════════════════════════════════════════
            SECTION 2 — Job Matcher
        ════════════════════════════════════════ */}
        <div className="db-section-divider" />
        <SectionLabel
          id="job"
          icon={<Briefcase size={16} />}
          title="Job Matcher"
          subtitle="Match your resume against any job description"
        />
        <section id="job-content">
          <JobMatcher
            resumeData={state.resume}
            onJobMatchResults={(data) => dispatch({ job: data })}
            onJobDescriptionChange={(jd) => dispatch({ jobDescription: jd })}
          />
        </section>

        {/* ════════════════════════════════════════
            SECTION 3 — Jarvis Optimizer
        ════════════════════════════════════════ */}
        <div className="db-section-divider" />
        <SectionLabel
          id="optimizer"
          icon={<Bot size={16} />}
          title="Jarvis AI Optimizer"
          subtitle="Voice-powered conversational resume coach"
        />
        <section id="optimizer-content">
          <ResumeOptimizer
            resumeData={state.resume}
            jobDescription={state.jobDescription}
            onOptimizationResults={(data) => dispatch({ optimizer: data })}
          />
        </section>

        {/* ════════════════════════════════════════
            SECTION 4 — Career Path
        ════════════════════════════════════════ */}
        <div className="db-section-divider" />
        <SectionLabel
          id="career"
          icon={<TrendingUp size={16} />}
          title="Career Path"
          subtitle="AI-powered career growth suggestions"
        />
        <section id="career-content">
          <CareerPath
            resumeText={state.resume}
            onCareerPathResults={(data) => dispatch({ career: data })}
          />
        </section>

        {/* ════════════════════════════════════════
            SECTION 5 — ATS Feedback
        ════════════════════════════════════════ */}
        <div className="db-section-divider" />
        <SectionLabel
          id="ats"
          icon={<FileCheck size={16} />}
          title="ATS Feedback"
          subtitle="Check how ATS-friendly your resume is"
        />
        <section id="ats-content">
          <ATSFeedback
            resumeText={state.resume}
            onATSResults={(data) => dispatch({ ats: data })}
          />
        </section>

        {/* ── FOOTER ── */}
        <div className="db-section-divider" />
        <footer className="db-footer">
          <div className="db-footer-inner">
            <div className="db-footer-top">
              {/* Brand */}
              <div className="db-footer-brand">
                <h4>AI Resume Builder</h4>
                <p>
                  An intelligent platform to craft, optimize, and tailor your
                  resume using cutting-edge AI tools and voice assistants.
                </p>
                <div className="db-footer-social">
                  <a href="#"><Github size={15} /></a>
                  <a href="#"><Twitter size={15} /></a>
                  <a href="#"><Linkedin size={15} /></a>
                  <a href="#"><Mail size={15} /></a>
                </div>
              </div>

              {/* Features */}
              <div className="db-footer-col">
                <h5>Features</h5>
                <ul>
                  <li><a href="#upload">Resume Upload</a></li>
                  <li><a href="#job">Job Matcher</a></li>
                  <li><a href="#optimizer">Jarvis Optimizer</a></li>
                  <li><a href="#career">Career Path</a></li>
                  <li><a href="#ats">ATS Feedback</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="db-footer-col">
                <h5>Resources</h5>
                <ul>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">API Reference</a></li>
                  <li><a href="#">Resume Tips</a></li>
                  <li><a href="#">Blog</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="db-footer-col">
                <h5>Legal</h5>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                  <li><a href="#">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="db-footer-bottom">
              <span className="db-footer-copy">
                © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
              </span>
              <span className="db-footer-tagline">
                Built with <span style={{ color: "#818cf8" }}>AAKASH</span> using AI
              </span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ── SECTION LABEL (replaces FeatureSection wrapper) ── */
function SectionLabel({ id, icon, title, subtitle }) {
  return (
    <div className="db-section-label" id={id}>
      <div className="db-section-label-icon">{icon}</div>
      <div className="db-section-label-text">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}