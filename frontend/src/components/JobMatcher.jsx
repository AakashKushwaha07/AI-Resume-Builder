import React, { useEffect, useState } from "react";
import { FileSignature, FileText, RefreshCw, SlidersHorizontal, Sparkles, Copy, CheckCheck, Trophy, UploadCloud, Download } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const JobMatcher = ({
  resumeData,
  jobDescription: initialJobDescription = "",
  onJobMatchResults,
  onJobDescriptionChange,
}) => {
  const [activeTab, setActiveTab] = useState("analyzer");
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [analysis, setAnalysis] = useState("");
  const [textToRephrase, setTextToRephrase] = useState("");
  const [rephrasedText, setRephrasedText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [rankInputMode, setRankInputMode] = useState("dataset");
  const [candidateFile, setCandidateFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [candidateRankings, setCandidateRankings] = useState([]);
  const [rankingCsv, setRankingCsv] = useState("");
  const [topN, setTopN] = useState(100);
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(512);
  const [showParameters, setShowParameters] = useState(false);
  const [error, setError] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setJobDescription(initialJobDescription || "");
  }, [initialJobDescription]);

  const readError = async (response, fallback) => {
    const data = await response.json().catch(() => ({}));
    return data?.message || data?.error || fallback;
  };

  const handleAnalyze = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError("Both resume and job description are required.");
      return;
    }
    try {
      setLoadingAction("analyze");
      setError(null);
      setAnalysis("");
      const response = await fetch(`${API_URL}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeData, job_description: jobDescription, temperature, max_tokens: maxTokens }),
      });
      if (!response.ok) throw new Error(await readError(response, "Resume analysis failed."));
      const data = await response.json();
      const nextAnalysis = data?.analysis || data?.evaluation_report?.analysis || "";
      if (!nextAnalysis) throw new Error("Invalid response format from backend.");
      setAnalysis(nextAnalysis);
      onJobMatchResults?.({ analysis: nextAnalysis, source: data?.source || "groq" });
    } catch (err) {
      setError(err?.message || "Resume analysis failed.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRephrase = async () => {
    if (!textToRephrase.trim()) {
      setError("Enter text to rephrase.");
      return;
    }
    try {
      setLoadingAction("rephrase");
      setError(null);
      setRephrasedText("");
      const response = await fetch(`${API_URL}/api/rephrase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRephrase, temperature, max_tokens: maxTokens }),
      });
      if (!response.ok) throw new Error(await readError(response, "Text rephrase failed."));
      const data = await response.json();
      const nextText = data?.rephrased_text || "";
      if (!nextText) throw new Error("Invalid response format from backend.");
      setRephrasedText(nextText);
    } catch (err) {
      setError(err?.message || "Text rephrase failed.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCoverLetter = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError("Both resume and job description are required.");
      return;
    }
    try {
      setLoadingAction("cover-letter");
      setError(null);
      setCoverLetter("");
      const response = await fetch(`${API_URL}/api/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeData, job_description: jobDescription, temperature, max_tokens: maxTokens }),
      });
      if (!response.ok) throw new Error(await readError(response, "Cover letter generation failed."));
      const data = await response.json();
      const nextCoverLetter = data?.cover_letter || "";
      if (!nextCoverLetter) throw new Error("Invalid response format from backend.");
      setCoverLetter(nextCoverLetter);
    } catch (err) {
      setError(err?.message || "Cover letter generation failed.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRankCandidates = async () => {
    if (!jobDescription.trim()) {
      setError("Paste the job description before ranking.");
      return;
    }
    if (rankInputMode === "dataset" && !candidateFile) {
      setError("Upload a candidate JSON/JSONL file.");
      return;
    }
    if (rankInputMode === "resumes" && resumeFiles.length === 0) {
      setError("Upload at least one resume PDF or DOCX.");
      return;
    }
    try {
      setLoadingAction("rank-candidates");
      setError(null);
      setCandidateRankings([]);
      setRankingCsv("");

      const formData = new FormData();
      formData.append("job_description", jobDescription);
      formData.append("top_n", String(topN));
      const endpoint = rankInputMode === "resumes" ? "/api/rank-resumes" : "/api/rank-candidates";

      if (rankInputMode === "resumes") {
        resumeFiles.forEach((file) => formData.append("resumes", file));
      } else {
        formData.append("candidates", candidateFile);
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await readError(response, "Ranking failed."));
      const data = await response.json();
      setCandidateRankings(data?.rankings || []);
      setRankingCsv(data?.csv || "");
    } catch (err) {
      setError(err?.message || "Ranking failed.");
    } finally {
      setLoadingAction(null);
    }
  };

  const addResumeFiles = (files) => {
    const nextFiles = Array.from(files || []).filter((file) => /\.(pdf|docx)$/i.test(file.name));
    if (!nextFiles.length) return;
    setResumeFiles((current) => [...current, ...nextFiles]);
  };

  const removeResumeFile = (indexToRemove) => {
    setResumeFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
    onJobDescriptionChange?.(value);
  };

  const getOutputContent = () => {
    if (activeTab === "analyzer") return { content: analysis, title: "ATS Analysis", empty: "Run an analysis to see match percentage, missing keywords, final thoughts, and recommendations." };
    if (activeTab === "rephraser") return { content: rephrasedText, title: "Rephrased Content", empty: "Rephrased ATS-friendly content will appear here." };
    if (activeTab === "ranker") return { content: rankingCsv, title: "Candidate Ranking", empty: "Upload candidates or resumes and run the ranker to preview the best matches and export a CSV." };
    return { content: coverLetter, title: "Cover Letter", empty: "Generate a tailored ATS-friendly cover letter from your resume and job description." };
  };

  const handleCopy = () => {
    const { content } = getOutputContent();
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadRankingCsv = () => {
    if (!rankingCsv) return;
    const blob = new Blob([rankingCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = rankInputMode === "resumes" ? "resume_ranking.csv" : "candidate_ranking_submission.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const isAnalyzing = loadingAction === "analyze";
  const isRephrasing = loadingAction === "rephrase";
  const isGeneratingCoverLetter = loadingAction === "cover-letter";
  const isRankingCandidates = loadingAction === "rank-candidates";
  const isLoading = !!loadingAction;

  const tabs = [
    { id: "analyzer", label: "Resume Analyzer", icon: FileText },
    { id: "ranker", label: "Candidate Ranker", icon: Trophy },
    { id: "rephraser", label: "Content Rephraser", icon: Sparkles },
    { id: "cover-letter", label: "Cover Letter", icon: FileSignature },
  ];

  const { content: outputContent, title: outputTitle, empty: emptyText } = getOutputContent();

  return (
    <div style={styles.page}>
      {/* Ambient background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerBadge}>AI-Powered</div>
          <h1 style={styles.headerTitle}>Resume Intelligence</h1>
          <p style={styles.headerSub}>Optimize your resume, rephrase content, and craft standout cover letters in seconds.</p>
        </header>

        {/* Tab Bar */}
        <div style={styles.tabBar}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === id ? styles.tabBtnActive : {}),
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowParameters((v) => !v)}
            style={{
              ...styles.paramBtn,
              ...(showParameters ? styles.paramBtnActive : {}),
            }}
          >
            <SlidersHorizontal size={15} />
            Parameters
          </button>
        </div>

        {/* Parameters Panel */}
        {showParameters && (
          <div style={styles.paramPanel}>
            <div style={styles.paramRow}>
              <div style={styles.paramItem}>
                <div style={styles.paramLabel}>
                  <span>Temperature</span>
                  <span style={styles.paramValue}>{temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range" min="0" max="1" step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  style={styles.rangeInput}
                />
                <div style={styles.rangeHints}><span>Precise</span><span>Creative</span></div>
              </div>
              <div style={styles.paramItem}>
                <div style={styles.paramLabel}>
                  <span>Max Tokens</span>
                  <span style={styles.paramValue}>{maxTokens}</span>
                </div>
                <input
                  type="range" min="50" max="1024" step="1"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  style={styles.rangeInput}
                />
                <div style={styles.rangeHints}><span>Short</span><span>Long</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>
              {activeTab === "rephraser" ? "Text to Rephrase" : "Job Description"}
            </span>
            {activeTab === "rephraser" ? null : (
              <span style={styles.cardHint}>Paste the full job posting for best results</span>
            )}
          </div>

          {activeTab === "ranker" && (
            <div style={styles.rankerPanel}>
              <div style={styles.modeSwitch}>
                <button
                  type="button"
                  onClick={() => setRankInputMode("dataset")}
                  style={{ ...styles.modeBtn, ...(rankInputMode === "dataset" ? styles.modeBtnActive : {}) }}
                >
                  JSON Dataset
                </button>
                <button
                  type="button"
                  onClick={() => setRankInputMode("resumes")}
                  style={{ ...styles.modeBtn, ...(rankInputMode === "resumes" ? styles.modeBtnActive : {}) }}
                >
                  Resume PDFs
                </button>
              </div>

              <div style={styles.rankerControls}>
                {rankInputMode === "dataset" ? (
                  <label style={styles.fileDrop}>
                    <UploadCloud size={22} />
                    <span style={styles.fileDropText}>
                      {candidateFile ? candidateFile.name : "Upload sample_candidates.json or candidates.jsonl"}
                    </span>
                    <input
                      type="file"
                      accept=".json,.jsonl,application/json"
                      onChange={(e) => setCandidateFile(e.target.files?.[0] || null)}
                      style={styles.hiddenFile}
                    />
                  </label>
                ) : (
                  <label style={styles.fileDrop}>
                    <UploadCloud size={22} />
                    <span style={styles.fileDropText}>
                      Add resume PDFs/DOCX files ({resumeFiles.length} selected)
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      multiple
                      onChange={(e) => addResumeFiles(e.target.files)}
                      style={styles.hiddenFile}
                    />
                  </label>
                )}
                <label style={styles.topNControl}>
                  <span>Top candidates</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={topN}
                    onChange={(e) => setTopN(Math.max(1, Math.min(100, Number(e.target.value) || 100)))}
                    style={styles.topNInput}
                  />
                </label>
              </div>

              {rankInputMode === "resumes" && resumeFiles.length > 0 && (
                <div style={styles.resumeFileList}>
                  {resumeFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} style={styles.resumeFileItem}>
                      <span style={styles.resumeFileName}>{file.name}</span>
                      <button type="button" onClick={() => removeResumeFile(index)} style={styles.removeFileBtn}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rephraser" ? (
            <textarea
              value={textToRephrase}
              onChange={(e) => setTextToRephrase(e.target.value)}
              placeholder="Paste resume content to rewrite for ATS optimization..."
              style={styles.textarea}
              rows={10}
            />
          ) : (
            <textarea
              value={jobDescription}
              onChange={(e) => handleJobDescriptionChange(e.target.value)}
              placeholder="Paste job description here..."
              style={styles.textarea}
              rows={10}
            />
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={
              activeTab === "analyzer" ? handleAnalyze
              : activeTab === "ranker" ? handleRankCandidates
              : activeTab === "rephraser" ? handleRephrase
              : handleCoverLetter
            }
            disabled={isLoading}
            style={{ ...styles.actionBtn, ...(isLoading ? styles.actionBtnDisabled : {}) }}
          >
            <RefreshCw size={16} style={isLoading ? styles.spinIcon : {}} />
            {isAnalyzing ? "Analyzing..."
              : isRankingCandidates ? "Ranking candidates..."
              : isRephrasing ? "Rephrasing..."
              : isGeneratingCoverLetter ? "Generating..."
              : activeTab === "analyzer" ? "Analyze Resume"
              : activeTab === "ranker" ? (rankInputMode === "resumes" ? "Rank Resumes" : "Rank Candidates")
              : activeTab === "rephraser" ? "Rephrase Content"
              : "Generate Cover Letter"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorDot} />
            {error}
          </div>
        )}

        {/* Output Section */}
        <div style={styles.outputCard}>
          <div style={styles.outputHeader}>
            <span style={styles.outputTitle}>{outputTitle}</span>
            {outputContent && activeTab !== "ranker" && (
              <button type="button" onClick={handleCopy} style={styles.copyBtn}>
                {copied ? <><CheckCheck size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            )}
            {rankingCsv && activeTab === "ranker" && (
              <button type="button" onClick={downloadRankingCsv} style={styles.copyBtn}>
                <Download size={14} /> CSV
              </button>
            )}
          </div>

          <div style={styles.outputBody}>
            {activeTab === "ranker" && candidateRankings.length > 0 ? (
              <div style={styles.rankingTableWrap}>
                <table style={styles.rankingTable}>
                  <thead>
                    <tr>
                      <th style={styles.rankTh}>Rank</th>
                      <th style={styles.rankTh}>{rankInputMode === "resumes" ? "Resume" : "Candidate"}</th>
                      <th style={styles.rankTh}>Score</th>
                      <th style={styles.rankTh}>Reasoning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateRankings.slice(0, 20).map((row) => (
                      <tr key={row.candidate_id}>
                        <td style={styles.rankTd}>{row.rank}</td>
                        <td style={styles.rankTdStrong}>{rankInputMode === "resumes" ? (row.filename || row.candidate_id) : row.candidate_id}</td>
                        <td style={styles.rankTd}>{Number(row.score).toFixed(4)}</td>
                        <td style={styles.rankTd}>{row.reasoning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={styles.tableHint}>Showing top {Math.min(candidateRankings.length, 20)} of {candidateRankings.length}. Download CSV for the full ranked submission.</p>
              </div>
            ) : outputContent ? (
              <pre style={styles.outputText}>{outputContent}</pre>
            ) : isLoading ? (
              <div style={styles.loadingState}>
                <div style={styles.loadingDots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
                <p style={styles.loadingText}>Processing your request…</p>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>
                  {activeTab === "analyzer" ? <FileText size={32} /> : activeTab === "ranker" ? <Trophy size={32} /> : activeTab === "rephraser" ? <Sparkles size={32} /> : <FileSignature size={32} />}
                </div>
                <p style={styles.emptyText}>{emptyText}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        textarea:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

        input[type=range] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #2d2d3d;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #1a1a2e;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d2d3d; border-radius: 3px; }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#0d0d18",
    fontFamily: "'DM Sans', sans-serif",
    color: "#e2e2f0",
    position: "relative",
    overflowX: "hidden",
    paddingBottom: "80px",
  },
  blob1: {
    position: "fixed",
    top: "-120px",
    left: "-120px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob2: {
    position: "fixed",
    bottom: "-100px",
    right: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "820px",
    margin: "0 auto",
    padding: "48px 24px 0",
  },

  // Header
  header: {
    textAlign: "center",
    marginBottom: "40px",
    animation: "fadeIn 0.6s ease both",
  },
  headerBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#818cf8",
    background: "rgba(99,102,241,0.12)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "20px",
    padding: "4px 14px",
    marginBottom: "16px",
  },
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: "800",
    background: "linear-gradient(135deg, #e2e2f0 20%, #818cf8 80%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.1,
    marginBottom: "12px",
  },
  headerSub: {
    fontSize: "15px",
    color: "#7474a0",
    maxWidth: "480px",
    margin: "0 auto",
    lineHeight: 1.6,
  },

  // Tabs
  tabBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "24px",
    alignItems: "center",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 18px",
    borderRadius: "10px",
    border: "1px solid #1e1e30",
    background: "#131320",
    color: "#7474a0",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  tabBtnActive: {
    background: "rgba(99,102,241,0.15)",
    border: "1px solid rgba(99,102,241,0.4)",
    color: "#a5b4fc",
  },
  paramBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 18px",
    borderRadius: "10px",
    border: "1px solid #1e1e30",
    background: "transparent",
    color: "#7474a0",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    marginLeft: "auto",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  paramBtnActive: {
    border: "1px solid #2d2d3d",
    color: "#a5b4fc",
  },

  // Parameters
  paramPanel: {
    background: "#111122",
    border: "1px solid #1e1e30",
    borderRadius: "14px",
    padding: "20px 24px",
    marginBottom: "20px",
    animation: "fadeIn 0.3s ease both",
  },
  paramRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  paramItem: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  paramLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#9090b8",
    fontWeight: "500",
  },
  paramValue: {
    color: "#a5b4fc",
    fontWeight: "600",
    fontFamily: "'Syne', sans-serif",
  },
  rangeInput: {
    width: "100%",
  },
  rangeHints: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    color: "#4a4a6a",
  },
  rankerPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "16px",
  },
  modeSwitch: {
    display: "inline-flex",
    alignSelf: "flex-start",
    border: "1px solid #1e1e30",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#0d0d18",
  },
  modeBtn: {
    border: "none",
    background: "transparent",
    color: "#7474a0",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  modeBtnActive: {
    background: "rgba(99,102,241,0.16)",
    color: "#a5b4fc",
  },
  rankerControls: {
    display: "grid",
    gridTemplateColumns: "1fr 150px",
    gap: "12px",
  },
  fileDrop: {
    minHeight: "58px",
    border: "1px dashed #2d2d4a",
    borderRadius: "12px",
    background: "#0d0d18",
    color: "#9090b8",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    cursor: "pointer",
    overflow: "hidden",
  },
  fileDropText: {
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  hiddenFile: {
    display: "none",
  },
  topNControl: {
    minHeight: "58px",
    border: "1px solid #1e1e30",
    borderRadius: "12px",
    background: "#0d0d18",
    color: "#7474a0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "5px",
    padding: "10px 12px",
    fontSize: "11px",
  },
  topNInput: {
    width: "100%",
    border: "1px solid #2d2d3d",
    borderRadius: "8px",
    background: "#111122",
    color: "#c4c4e0",
    padding: "6px 8px",
    fontSize: "13px",
  },
  resumeFileList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "180px",
    overflowY: "auto",
    border: "1px solid #1e1e30",
    borderRadius: "12px",
    background: "#0d0d18",
    padding: "10px",
  },
  resumeFileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "8px",
    background: "#111122",
  },
  resumeFileName: {
    color: "#c4c4e0",
    fontSize: "12px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  removeFileBtn: {
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.08)",
    color: "#f87171",
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "11px",
    cursor: "pointer",
    flexShrink: 0,
  },

  // Input Card
  card: {
    background: "#111122",
    border: "1px solid #1e1e30",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    animation: "fadeIn 0.5s ease both",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  cardLabel: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    color: "#c4c4e0",
    letterSpacing: "0.02em",
  },
  cardHint: {
    fontSize: "12px",
    color: "#4a4a6a",
  },
  textarea: {
    width: "100%",
    background: "#0d0d18",
    border: "1px solid #1e1e30",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "14px",
    color: "#c4c4e0",
    lineHeight: "1.7",
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    display: "block",
    marginBottom: "16px",
    minHeight: "220px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.04em",
    cursor: "pointer",
    boxShadow: "0 4px 24px rgba(99,102,241,0.25)",
    transition: "opacity 0.2s, transform 0.15s",
  },
  actionBtnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  spinIcon: {
    animation: "spin 0.9s linear infinite",
  },

  // Error
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: "12px",
    padding: "14px 18px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "20px",
  },
  errorDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#ef4444",
    flexShrink: 0,
  },

  // Output Card
  outputCard: {
    background: "#111122",
    border: "1px solid #1e1e30",
    borderRadius: "16px",
    overflow: "hidden",
    animation: "fadeIn 0.6s ease 0.1s both",
  },
  outputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #1a1a2e",
    background: "#0d0d18",
  },
  outputTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    color: "#c4c4e0",
    letterSpacing: "0.02em",
  },
  copyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid #2d2d3d",
    background: "transparent",
    color: "#7474a0",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  outputBody: {
    padding: "24px",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
  },
  outputText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "#b0b0d0",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  rankingTableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  rankingTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "680px",
  },
  rankTh: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "1px solid #1e1e30",
    color: "#818cf8",
    fontSize: "12px",
    fontWeight: "700",
  },
  rankTd: {
    padding: "12px",
    borderBottom: "1px solid #1a1a2e",
    color: "#b0b0d0",
    fontSize: "13px",
    lineHeight: 1.5,
    verticalAlign: "top",
  },
  rankTdStrong: {
    padding: "12px",
    borderBottom: "1px solid #1a1a2e",
    color: "#e2e2f0",
    fontSize: "13px",
    fontWeight: "700",
    verticalAlign: "top",
    whiteSpace: "nowrap",
  },
  tableHint: {
    marginTop: "14px",
    color: "#4a4a6a",
    fontSize: "12px",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    color: "#2d2d4a",
  },
  emptyText: {
    fontSize: "14px",
    color: "#4a4a6a",
    maxWidth: "360px",
    lineHeight: "1.6",
  },
  loadingState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "40px",
  },
  loadingDots: {
    display: "flex",
    gap: "8px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6366f1",
    animation: "bounce 1.2s ease-in-out infinite",
    display: "inline-block",
  },
  loadingText: {
    fontSize: "13px",
    color: "#4a4a6a",
  },
};

export default JobMatcher;
