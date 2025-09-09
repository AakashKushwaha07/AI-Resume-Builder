import React, { useState } from 'react';

const JobMatcher = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [score, setScore] = useState(null);
  const [error, setError] = useState(null);

  const handleMatch = async () => {
    if (!resumeData) {
      setError('No resume uploaded or resume text missing.');
      return;
    }

    const resumeText = resumeData || ''; // Ensure this matches the structure of resume data

    if (!resumeText || !jobDescription) {
      setError('Both resume and job description are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      const data = await response.json();
      setScore(data.similarity);
      setError(null);
    } catch (err) {
      setError('Error matching job: ' + err.message);
    }
  };

  return (
  <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Job Matching
      </h2>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste job description here..."
        rows={6}
        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 resize-none shadow-sm"
      />

      <button
        onClick={handleMatch}
        className="w-full mt-4 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition duration-300"
      >
        Match Job
      </button>

      {error && (
        <div className="mt-4 text-center text-red-500 font-medium">{error}</div>
      )}

      {score !== null && (
        <div className="mt-4 text-center text-green-600 font-semibold text-lg">
          Match Score: {score}%
        </div>
      )}
    </div>
  </div>
);

};

export default JobMatcher;
