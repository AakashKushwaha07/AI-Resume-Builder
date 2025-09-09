
import React, { useState } from 'react';

const CareerPath = ({ resumeText }) => {
  const [predictedCareer, setPredictedCareer] = useState('');
  const [score, setScore] = useState(null);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [method, setMethod] = useState('');

  const handlePredict = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/career-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume_data: resumeText }),
      });

      const result = await response.json();

      setPredictedCareer(result.predicted_career || 'Not Found');
      setScore(result.score || 0);
      setMatchedSkills(result.matched_skills || []);
      setMethod(result.method || '');
    } catch (error) {
      console.error('Error predicting career path:', error);
    }
  };

  return (
  <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Career Path Prediction
      </h2>

      <button
        onClick={handlePredict}
        className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-xl shadow-md hover:bg-purple-700 transition duration-300"
      >
        Predict Career Path
      </button>

      {predictedCareer && (
        <div className="mt-6 bg-gray-50 rounded-xl p-5 shadow-inner border border-gray-200">
          <p className="text-lg text-gray-800 mb-2">
            <strong>Predicted Career:</strong> {predictedCareer}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Score:</strong> {score}%
          </p>

          {matchedSkills.length > 0 ? (
            <p className="text-gray-700 mb-2">
              <strong>Matched Skills:</strong> {matchedSkills.join(", ")}
            </p>
          ) : (
            <p className="text-gray-500 mb-2">
              <strong>Matched Skills:</strong> None
            </p>
          )}

          <p className="text-sm text-gray-500 italic mt-2">
            (Method used: {method})
          </p>
        </div>
      )}
    </div>
  </div>
);

};

export default CareerPath;

