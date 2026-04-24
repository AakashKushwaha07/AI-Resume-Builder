import React, { useEffect, useMemo, useState } from "react";

const JobMatcher = ({ resumeData, jobDescription: initialJobDescription = "", onJobMatchResults, onJobDescriptionChange }) => {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJobDescription(initialJobDescription || "");
  }, [initialJobDescription]);

  const handleMatch = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setError("Both resume and job description are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch("http://localhost:5000/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resumeData,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();
      const report = data?.evaluation_report ?? data;

      if (!report || !report.details) {
        throw new Error("Invalid response format from backend.");
      }

      setResult(report);
      if (onJobMatchResults) {
        onJobMatchResults(report);
      }
    } catch (err) {
      setError("Error matching job: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const safe = (v, fallback) => (v === undefined || v === null ? fallback : v);

  // compute totals (because backend doesn't send totals per bucket)
  const bucketTotal = (bucket) => (bucket?.matched?.length || 0) + (bucket?.missing?.length || 0);

  const bucketMatchText = (bucket) => {
    const total = bucketTotal(bucket);
    if (total === 0) return "Not specified";
    const ratio = typeof bucket?.match_ratio === "number" ? bucket.match_ratio : 0;
    return `${ratio.toFixed(2)}%`;
  };

  const scoreColor = useMemo(() => {
    const s = Number(result?.final_score ?? 0);
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-indigo-600";
    if (s >= 40) return "text-yellow-600";
    return "text-red-600";
  }, [result]);

  const summaryMandatoryText = useMemo(() => {
    const matched = Number(safe(result?.summary?.matched_mandatory_count, 0));
    const total = Number(safe(result?.summary?.total_mandatory_count, 0));
    if (total === 0) return "Mandatory: Not specified";
    return `Mandatory: ${matched} / ${total}`;
  }, [result]);

  const renderSkillBucket = (title, bucket) => {
    if (!bucket) return null;
    const matched = bucket.matched || [];
    const missing = bucket.missing || [];
    const total = bucketTotal(bucket);

    return (
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500 mt-1">
              Match: <span className="font-semibold">{bucketMatchText(bucket)}</span>
              {total > 0 ? (
                <span className="text-gray-400"> • {matched.length}/{total} matched</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Matched ({matched.length})
          </div>

          {matched.length ? (
            <div className="flex flex-wrap gap-2">
              {matched.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs border bg-indigo-50 text-indigo-700 border-indigo-200"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">{total === 0 ? "Not specified in JD" : "None"}</div>
          )}
        </div>

        {missing.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-red-600 mb-2">
              Missing ({missing.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((s, i) => (
                <span
                  key={i}
                  className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex justify-center items-start min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          AI Job Matcher
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Paste a job description and get a breakdown.
        </p>

        <textarea
          value={jobDescription}
          onChange={(e) => {
            const value = e.target.value;
            setJobDescription(value);
            if (onJobDescriptionChange) {
              onJobDescriptionChange(value);
            }
          }}
          placeholder="Paste job description here..."
          rows={7}
          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 resize-none shadow-sm mb-4"
        />

        <button
          onClick={handleMatch}
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Match Job"}
        </button>

        {error && (
          <div className="mt-4 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Score Card */}
            <div className="text-center bg-gray-50 border rounded-2xl p-6">
              {/* (Optional) Hide eligibility completely */}
              {/* <div className="text-sm text-gray-600">
                Eligibility: <span className="font-semibold">{result.eligibility}</span>
              </div> */}

              <div className={`text-5xl font-extrabold mt-1 ${scoreColor}`}>
                {safe(result.final_score, 0)}%
              </div>

              <div className="mt-3 text-sm text-gray-600">
                {summaryMandatoryText}
                <span className="text-gray-400"> • </span>
                Experience:{" "}
                <span className="font-semibold">
                  {safe(result.summary?.experience_found_years, 0)}
                </span>{" "}
                /{" "}
                <span className="font-semibold">
                  {safe(result.summary?.experience_required_years, 0)}
                </span>{" "}
                yrs
                <span className="text-gray-400"> • </span>
                Projects:{" "}
                <span className="font-semibold">
                  {safe(result.summary?.projects_found_count, 0)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education */}
              <div className="bg-gray-50 p-5 rounded-2xl border">
                <h4 className="font-semibold mb-3">🎓 Education</h4>
                <div className="text-gray-600 text-sm">
                  <div>
                    <span className="font-medium">Required:</span>{" "}
                    {result.details.education?.required?.length
                      ? result.details.education.required.join(", ")
                      : "Not specified"}
                  </div>
                  <div className="mt-1">
                    <span className="font-medium">Found:</span>{" "}
                    {result.details.education?.found?.length
                      ? result.details.education.found.join(", ")
                      : "Not found"}
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-gray-50 p-5 rounded-2xl border">
                <h4 className="font-semibold mb-3">🧠 Experience</h4>
                <div className="text-gray-600 text-sm">
                  Required:{" "}
                  <span className="font-semibold">
                    {safe(result.details.experience?.required_years, 0)}
                  </span>{" "}
                  yrs • Found:{" "}
                  <span className="font-semibold">
                    {safe(result.details.experience?.found_years, 0)}
                  </span>{" "}
                  yrs
                  {Number(result.details.experience?.gap_years ?? 0) > 0 && (
                    <div className="mt-1 text-red-600">
                      Gap:{" "}
                      <span className="font-semibold">
                        {result.details.experience.gap_years}
                      </span>{" "}
                      yrs
                    </div>
                  )}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-gray-50 p-5 rounded-2xl border">
                <h4 className="font-semibold mb-3">📁 Projects</h4>
                <div className="text-gray-600 text-sm">
                  Required:{" "}
                  <span className="font-semibold">
                    {result.details.projects?.required ? "Yes" : "No"}
                  </span>{" "}
                  • Found:{" "}
                  <span className="font-semibold">
                    {safe(result.details.projects?.found_count, 0)}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 p-5 rounded-2xl border md:col-span-2">
                <h4 className="font-semibold mb-4">🛠 Skills</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSkillBucket("Mandatory Skills", result.details.skills?.mandatory)}
                  {renderSkillBucket("Preferred Skills (Bonus)", result.details.skills?.preferred)}
                  {renderSkillBucket("Soft Skills (Bonus)", result.details.skills?.soft)}
                </div>
              </div>
            </div>

            {/* Optional: show extracted skills list */}
            {/* <div className="bg-gray-50 p-5 rounded-2xl border">
              <h4 className="font-semibold mb-3">Extracted Resume Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(result.details.skills?.resume_all_skills || []).map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs border bg-white">
                    {s}
                  </span>
                ))}
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcher;
