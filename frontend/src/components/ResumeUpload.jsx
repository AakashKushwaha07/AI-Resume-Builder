import React, { useState, useRef } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const ResumeUpload = ({ onResumeData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Handle file select
  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadMessage("");
  };

  // Input change
  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // Drag & Drop handlers
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

  // Upload logic
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage("Please select or drop a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadMessage("Resume uploaded successfully.");
        //onResumeData(result.data.text);
        onResumeData(result.resume_json.raw_text);
      } else {
        setUploadMessage(result.error || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("Upload failed.");
    }
  };

  // View resume
  const handleViewResume = () => {
    if (!selectedFile) return;
    const fileURL = URL.createObjectURL(selectedFile);
    window.open(fileURL, "_blank");
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Upload Resume
        </h2>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition
            ${
              isDragging
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400"
            }`}
        >
          <p className="text-gray-600 font-medium">
            Drag & drop your resume here
          </p>
          <p className="text-sm text-gray-400 mt-1">
            or click to browse (.pdf, .docx)
          </p>

          {selectedFile && (
            <p className="mt-3 text-sm font-semibold text-indigo-600">
              {selectedFile.name}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpload}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-xl
              hover:bg-indigo-700 transition"
          >
            Upload
          </button>

          {selectedFile && (
            <button
              onClick={handleViewResume}
              className="flex-1 py-2 px-4 border border-indigo-600 text-indigo-600
                font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              View
            </button>
          )}
        </div>

        {/* Status Message */}
        {uploadMessage && (
          <p
            className={`mt-4 text-center font-medium ${
              uploadMessage.includes("successfully")
                ? "text-green-600"
                : "text-red-500"
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
