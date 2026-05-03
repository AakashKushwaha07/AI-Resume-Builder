import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Send, Upload, Volume2, MicOff, FileText, X } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

/* ─── Animated waveform shown while speaking / listening ─── */
const WaveBar = ({ delay, isActive }) => (
  <span
    style={{
      display: "inline-block",
      width: "3px",
      borderRadius: "2px",
      background: isActive ? "var(--accent)" : "var(--muted)",
      animationName: isActive ? "wave" : "none",
      animationDuration: "0.9s",
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
      animationDelay: delay,
      height: isActive ? "20px" : "4px",
      transition: "height 0.3s, background 0.3s",
    }}
  />
);

const WaveVisualizer = ({ isActive, barCount = 28 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "3px",
      height: "32px",
    }}
  >
    {Array.from({ length: barCount }).map((_, i) => (
      <WaveBar
        key={i}
        isActive={isActive}
        delay={`${(i / barCount) * 0.8}s`}
      />
    ))}
  </div>
);

/* ─── Single chat bubble ─── */
const Bubble = ({ message, onPlay }) => {
  const isUser = message.type === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "18px",
        animation: "fadeUp 0.35s ease both",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: isUser ? "var(--accent-soft)" : "var(--teal)",
          marginBottom: "6px",
          paddingLeft: isUser ? 0 : "4px",
          paddingRight: isUser ? "4px" : 0,
        }}
      >
        {isUser ? "You" : "Jarvis"}
      </span>
      <div
        style={{
          maxWidth: "78%",
          background: isUser ? "var(--bubble-user)" : "var(--bubble-ai)",
          border: isUser ? "1px solid var(--border-user)" : "1px solid var(--border-ai)",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "13px 18px",
          fontSize: "14px",
          lineHeight: "1.75",
          color: "var(--text-primary)",
          boxShadow: isUser
            ? "0 2px 12px rgba(99,102,241,0.12)"
            : "0 2px 12px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        {message.pending ? (
          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Thinking
            <span style={{ animation: "dotFlash 1.4s infinite" }}>...</span>
          </span>
        ) : (
          message.content
        )}
        {message.audio && !message.pending && (
          <button
            type="button"
            onClick={() => onPlay(message.audio)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "10px",
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.3)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "12px",
              color: "var(--teal)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            <Volume2 size={13} /> Play voice
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const ResumeOptimizer = ({
  resumeData,
  jobDescription: initialJobDescription = "",
  onOptimizationResults,
}) => {
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      content: "Hello, I am Jarvis. Tell me what you need and I will keep it sharp.",
      audio: null,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [audioSource, setAudioSource] = useState("");
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const resumeText = useMemo(() => {
    if (!resumeData) return "";
    if (typeof resumeData === "object" && resumeData.raw_text) return resumeData.raw_text;
    if (typeof resumeData === "string") return resumeData;
    return "";
  }, [resumeData]);

  useEffect(() => { setJobDescription(initialJobDescription || ""); }, [initialJobDescription]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const readError = async (response, fallback) => {
    const data = await response.json().catch(() => ({}));
    return data?.message || data?.error || fallback;
  };

  const sendMessage = async (messageOverride = "") => {
    const message =
      typeof messageOverride === "string" && messageOverride
        ? messageOverride.trim()
        : inputMessage.trim();
    if (!message || isLoading) return;

    const history = messages
      .filter((item) => item.type === "user" || item.type === "assistant")
      .reduce((pairs, item) => {
        if (item.type === "user") pairs.push({ user: item.content, assistant: "" });
        else if (pairs.length && !pairs[pairs.length - 1].assistant)
          pairs[pairs.length - 1].assistant = item.content;
        return pairs;
      }, []);

    setInputMessage("");
    setError("");
    setIsLoading(true);
    setMessages((cur) => [
      ...cur,
      { type: "user", content: message, timestamp: new Date() },
      { type: "assistant", content: "Thinking...", pending: true, timestamp: new Date() },
    ]);

    try {
      const response = await fetch(`${API_URL}/api/optimizer/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });
      if (!response.ok) throw new Error(await readError(response, "Jarvis could not respond."));
      const data = await response.json();
      const reply = data?.reply || "I heard you, but I do not have a useful response yet.";
      setAudioSource(data?.audio || "");
      setMessages((cur) => [
        ...cur.slice(0, -1),
        { type: "assistant", content: reply, audio: data?.audio || null, timestamp: new Date() },
      ]);
      onOptimizationResults?.({ reply, source: data?.source || "groq" });
      if (data?.audio) setIsSpeaking(true);
    } catch (err) {
      setMessages((cur) => cur.slice(0, -1));
      setError(err?.message || "Jarvis could not respond.");
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice commands need Chrome or Edge.");
      return;
    }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    let finalTranscript = "";

    recognition.onstart = () => { setError(""); setIsListening(true); setInputMessage(""); };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0]?.transcript || "").join(" ").trim();
      setInputMessage(transcript);
      const finals = Array.from(event.results).filter((r) => r.isFinal).map((r) => r[0]?.transcript || "");
      finalTranscript = finals.join(" ").trim() || transcript;
    };
    recognition.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Microphone permission was blocked." : `Voice error: ${event.error}`);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) sendMessage(finalTranscript.trim());
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  /* ── File upload: accept PDF and text files ── */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["application/pdf", "text/plain", "text/markdown"];
    const allowedExt = [".pdf", ".txt", ".md"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(file.type) && !allowedExt.includes(ext)) {
      setError("Please upload a PDF or text file (.pdf, .txt, .md).");
      event.target.value = "";
      return;
    }

    setUploadedFile({ name: file.name, type: file.type });
    setIsTranscribing(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/optimizer/voice-to-text`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await readError(response, "Could not read file."));
      const data = await response.json();
      setInputMessage(data?.text || "");
    } catch (err) {
      setError(err?.message || "Could not process file.");
      setUploadedFile(null);
    } finally {
      setIsTranscribing(false);
      event.target.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeWave = isListening || isSpeaking;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

        :root {
          --bg:          #090910;
          --surface:     #0f0f1a;
          --surface2:    #13131f;
          --border:      #1c1c2e;
          --border-ai:   rgba(20,184,166,0.2);
          --border-user: rgba(99,102,241,0.25);
          --accent:      #6366f1;
          --accent-soft: #a5b4fc;
          --teal:        #14b8a6;
          --teal-soft:   #5eead4;
          --text-primary:#dde1f0;
          --text-muted:  #5c6080;
          --bubble-ai:   rgba(20,184,166,0.06);
          --bubble-user: rgba(99,102,241,0.1);
          --muted:       #2a2a3a;
          --font-head:   'Rajdhani', sans-serif;
          --font-body:   'DM Mono', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes wave {
          0%,100% { height: 4px; }
          50%      { height: 22px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotFlash {
          0%,20%  { opacity: 0; }
          50%     { opacity: 1; }
          80%,100%{ opacity: 0; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        @keyframes tealPulse {
          0%   { box-shadow: 0 0 0 0 rgba(20,184,166,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(20,184,166,0); }
          100% { box-shadow: 0 0 0 0 rgba(20,184,166,0); }
        }
        @keyframes scanline {
          0%   { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }

        .jarvis-root {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          font-family: var(--font-body);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .jarvis-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 15% 10%, rgba(99,102,241,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 85% 90%, rgba(20,184,166,0.07) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* HEADER */
        .jarvis-head {
          position: relative;
          z-index: 2;
          padding: 28px 32px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(15,15,26,0.95) 0%, transparent 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .jarvis-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .jarvis-orb {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--teal));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-head);
          font-size: 17px; font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(99,102,241,0.35);
        }
        .jarvis-title-wrap h2 {
          font-family: var(--font-head);
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #fff;
        }
        .jarvis-title-wrap p {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-top: 2px;
        }
        .jarvis-badges {
          display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
        }
        .badge {
          font-family: var(--font-head);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .badge-online {
          background: rgba(20,184,166,0.12);
          border: 1px solid rgba(20,184,166,0.3);
          color: var(--teal-soft);
        }
        .badge-ctx {
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          color: var(--accent-soft);
          cursor: pointer;
          transition: background 0.2s;
        }
        .badge-ctx:hover { background: rgba(99,102,241,0.18); }

        /* AGENT VISUALIZER */
        .agent-viz {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 32px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          gap: 10px;
        }
        .agent-label {
          font-family: var(--font-head);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .agent-label.active { color: var(--teal); }
        .agent-label.listening { color: var(--accent-soft); }

        /* CONTEXT PANEL */
        .context-panel {
          position: relative;
          z-index: 2;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 20px 32px;
          animation: fadeUp 0.3s ease both;
        }
        .context-label {
          font-family: var(--font-head);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
        }
        .context-panel textarea {
          width: 100%;
          background: #090910;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          font-family: var(--font-body);
          color: var(--text-primary);
          resize: vertical;
          min-height: 90px;
          transition: border-color 0.2s;
        }
        .context-panel textarea:focus {
          outline: none;
          border-color: rgba(20,184,166,0.4);
        }

        /* ERROR */
        .jarvis-error {
          position: relative; z-index: 2;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(239,68,68,0.08);
          border-bottom: 1px solid rgba(239,68,68,0.2);
          padding: 10px 32px;
          font-size: 13px;
          color: #f87171;
        }
        .jarvis-error button {
          background: none; border: none; color: #f87171; cursor: pointer; font-size: 16px;
        }

        /* CHAT */
        .chat-area {
          position: relative; z-index: 2;
          flex: 1;
          overflow-y: auto;
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          scroll-behavior: smooth;
        }
        .chat-area::-webkit-scrollbar { width: 5px; }
        .chat-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

        /* AUDIO */
        .jarvis-player {
          position: relative; z-index: 2;
          width: 100%;
          background: var(--surface2);
          border-top: 1px solid var(--border);
          padding: 8px 32px;
        }
        .jarvis-player audio { width: 100%; height: 36px; }

        /* INPUT ROW */
        .input-section {
          position: relative; z-index: 2;
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 16px 24px 20px;
        }
        .input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 960px;
          margin: 0 auto;
        }
        .input-textarea {
          flex: 1;
          background: #090910;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: var(--font-body);
          color: var(--text-primary);
          resize: none;
          line-height: 1.6;
          transition: border-color 0.2s;
          min-height: 50px;
        }
        .input-textarea:focus { outline: none; border-color: rgba(99,102,241,0.4); }
        .input-textarea::placeholder { color: var(--text-muted); }

        .icon-btn {
          width: 46px; height: 46px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface2);
          color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .icon-btn:hover:not(:disabled) {
          border-color: rgba(99,102,241,0.4);
          color: var(--accent-soft);
          background: rgba(99,102,241,0.08);
        }
        .icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .icon-btn.mic-active {
          border-color: rgba(99,102,241,0.6);
          background: rgba(99,102,241,0.15);
          color: var(--accent-soft);
          animation: pulseRing 1.5s infinite;
        }
        .icon-btn.speaking {
          border-color: rgba(20,184,166,0.6);
          background: rgba(20,184,166,0.12);
          color: var(--teal-soft);
          animation: tealPulse 1.5s infinite;
        }

        .send-btn {
          height: 46px;
          padding: 0 20px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--accent), #7c3aed);
          color: #fff;
          font-family: var(--font-head);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 7px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(99,102,241,0.25);
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .upload-label {
          position: relative;
          display: flex;
        }
        .upload-label input[type=file] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }

        .uploaded-chip {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; color: var(--teal-soft);
          background: rgba(20,184,166,0.08);
          border: 1px solid rgba(20,184,166,0.2);
          border-radius: 8px; padding: 4px 12px;
          margin: 0 auto 10px;
          max-width: 960px;
          width: fit-content;
        }
        .uploaded-chip button {
          background: none; border: none; color: var(--teal-soft); cursor: pointer;
          display: flex; align-items: center;
        }
      `}</style>

      <div className="jarvis-root">
        {/* HEADER */}
        <header className="jarvis-head">
          <div className="jarvis-brand">
            <div className="jarvis-orb">J</div>
            <div className="jarvis-title-wrap">
              <h2>JARVIS</h2>
              <p>Resume Intelligence · Voice-Enabled Agent</p>
            </div>
          </div>
          <div className="jarvis-badges">
            <span className="badge badge-online">● Online</span>
            <button
              type="button"
              className="badge badge-ctx"
              onClick={() => setShowContext((v) => !v)}
            >
              {showContext ? "Hide Context" : "Job Context"}
            </button>
          </div>
        </header>

        {/* AGENT WAVE VISUALIZER */}
        <div className="agent-viz">
          <span className={`agent-label ${isListening ? "listening" : isSpeaking ? "active" : ""}`}>
            {isListening ? "Listening…" : isSpeaking ? "Speaking…" : isLoading ? "Processing…" : "Standby"}
          </span>
          <WaveVisualizer isActive={activeWave || isLoading} barCount={36} />
        </div>

        {/* ERROR */}
        {error && (
          <div className="jarvis-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* JOB CONTEXT */}
        {showContext && (
          <div className="context-panel">
            <div className="context-label">Job Description Context</div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description so Jarvis can tailor advice…"
              rows={4}
            />
          </div>
        )}

        {/* CHAT */}
        <div className="chat-area">
          {messages.map((message, index) => (
            <Bubble
              key={`${message.type}-${index}`}
              message={message}
              onPlay={(src) => { setAudioSource(src); setIsSpeaking(true); }}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* AUDIO PLAYER */}
        {audioSource && (
          <div className="jarvis-player">
            <audio
              ref={audioRef}
              controls
              autoPlay
              src={audioSource}
              onEnded={() => setIsSpeaking(false)}
              style={{ width: "100%", height: "36px" }}
            >
              <track kind="captions" />
            </audio>
          </div>
        )}

        {/* INPUT */}
        <div className="input-section">
          {uploadedFile && (
            <div className="uploaded-chip">
              <FileText size={13} />
              {uploadedFile.name}
              <button type="button" onClick={() => setUploadedFile(null)}>
                <X size={13} />
              </button>
            </div>
          )}
          <div className="input-row">
            {/* Mic button */}
            <button
              type="button"
              className={`icon-btn ${isListening ? "mic-active" : ""}`}
              onClick={startVoiceCommand}
              disabled={isLoading || isTranscribing}
              title={isListening ? "Stop listening" : "Voice command"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* File upload — PDF and text */}
            <label
              className={`icon-btn upload-label ${isTranscribing ? "speaking" : ""}`}
              title="Upload PDF or text file"
              style={{ cursor: "pointer" }}
            >
              <Upload size={18} />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                onChange={handleFileUpload}
                disabled={isLoading || isTranscribing}
              />
            </label>

            {/* Text input */}
            <textarea
              className="input-textarea"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Listening…"
                : isTranscribing ? "Reading file…"
                : "Message Jarvis…  (Enter to send)"
              }
              rows={2}
              disabled={isLoading}
            />

            {/* Send */}
            <button
              type="button"
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send size={15} />
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeOptimizer;