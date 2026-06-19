import React, { useState, useRef } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const ResumeUpload = ({ onResumeData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadMessage("");
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select or drop a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      setUploadMessage("");
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        const rawText = result?.resume_json?.raw_text;
        if (!rawText) {
          setUploadMessage("Resume uploaded, but no readable text was found.");
          return;
        }
        setUploadMessage("Resume uploaded successfully.");
        onResumeData(rawText);
      } else {
        setUploadMessage(result.message || result.error || "Upload failed.");
      }
    } catch (error) {
      setUploadMessage(`Upload failed: ${error?.message || "Could not reach backend."}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewResume = () => {
    if (!selectedFile) return;
    const fileURL = URL.createObjectURL(selectedFile);
    window.open(fileURL, "_blank");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white">

      {/* 🔥 Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-400/20 blur-3xl rounded-full" />
      </div>

      {/* ✨ Main Content */}
      <div className="text-center max-w-xl px-6">

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Upload your resume
        </h1>

        <p className="mt-4 text-slate-400">
          Drag & drop your file or browse to get AI-powered insights instantly.
        </p>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`mt-10 cursor-pointer rounded-2xl border border-white/10 backdrop-blur-xl p-10 transition-all
          ${
            isDragging
              ? "border-indigo-400 bg-white/5 scale-105"
              : "hover:border-indigo-400 hover:bg-white/5"
          }`}
        >
          <p className="text-lg font-medium">
            {selectedFile ? selectedFile.name : "Drop your resume here"}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            PDF or DOCX • Max 5MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/20"
          >
            {isUploading ? "Uploading..." : "Upload Resume"}
          </button>

          {selectedFile && (
            <button
              onClick={handleViewResume}
              className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/10 transition"
            >
              View
            </button>
          )}
        </div>

        {/* Message */}
        {uploadMessage && (
          <p
            className={`mt-6 text-sm ${
              uploadMessage.includes("success")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {uploadMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
