import React, { useState, useEffect } from "react";

const ATSFeedback = ({ resumeText }) => {
  const [atsFeedback, setAtsFeedback] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [roles, setRoles] = useState([]);  // <-- dynamic roles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/job-roles");
        const data = await res.json();
        if (data.roles) {
          setRoles(data.roles);
          setJobRole(data.roles[0]); // default first role
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const handleAtsFeedback = async () => {
    if (!resumeText) {
      setError("Please upload or paste a resume first.");
      return;
    }
    setLoading(true);
    setError(null);
    setAtsFeedback(null);

    try {
      const response = await fetch("http://localhost:5000/api/ats-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_data: resumeText, job_role: jobRole }),
      });

      if (!response.ok) throw new Error("Server error. Please try again.");

      const result = await response.json();

      const payload = result && result.ats_feedback ? result.ats_feedback : result || {};

      const normalized = {
        ats_score: typeof payload.ats_score === "number" ? payload.ats_score : 0,
        feedback: Array.isArray(payload.feedback)
          ? payload.feedback
          : payload.feedback
          ? [String(payload.feedback)]
          : [],
        matched_keywords: Array.isArray(payload.matched_keywords)
          ? payload.matched_keywords
          : [],
        missing_keywords: Array.isArray(payload.missing_keywords)
          ? payload.missing_keywords
          : [],
      };

      setAtsFeedback(normalized);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Get ATS Feedback
      </h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select Job Role:
        </label>
        <select
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {roles.length > 0 ? (
            roles.map((role, i) => (
              <option key={i} value={role}>
                {role}
              </option>
            ))
          ) : (
            <option>Loading...</option>
          )}
        </select>
      </div>

      <button
        onClick={handleAtsFeedback}
        disabled={loading}
        className={`w-full py-2 px-4 font-semibold rounded-xl shadow-md transition duration-300 ${
          loading
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {loading ? "Analyzing..." : "Get ATS Feedback"}
      </button>

      {error && (
        <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
      )}

      {atsFeedback && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200">
          <p className="text-lg text-gray-800 mb-3">
            <strong>ATS Score:</strong>{" "}
            <span className="text-indigo-600 font-bold">
              {atsFeedback.ats_score}%
            </span>
          </p>

          {atsFeedback.feedback.length > 0 && (
            <div className="mb-4">
              <strong className="block text-gray-700 mb-2">Feedback:</strong>
              <ul className="list-disc pl-6 text-gray-600">
                {atsFeedback.feedback.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <strong className="block text-gray-700 mb-2">
              Matched Keywords:
            </strong>
            {atsFeedback.matched_keywords.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {atsFeedback.matched_keywords.map((kw, i) => (
                  <li
                    key={i}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {kw}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>

          <div>
            <strong className="block text-gray-700 mb-2">
              Missing Keywords:
            </strong>
            {atsFeedback.missing_keywords.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {atsFeedback.missing_keywords.map((kw, i) => (
                  <li
                    key={i}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                  >
                    {kw}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">None</span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default ATSFeedback;
