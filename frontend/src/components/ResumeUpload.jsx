import React, { useState } from 'react';

const ResumeUpload = ({ onResumeData }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadMessage('Resume uploaded successfully.');
        onResumeData(result.data.text);  // Save resume text for other components
      } else {
        setUploadMessage(result.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      setUploadMessage('Failed to upload resume');
    }
  };

  return (
  <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        Upload Resume
      </h2>

      <div className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 
            file:mr-4 file:py-2 file:px-4 
            file:rounded-full file:border-0 
            file:text-sm file:font-semibold 
            file:bg-indigo-50 file:text-indigo-600 
            hover:file:bg-indigo-100
            cursor-pointer"
        />

        <button
          onClick={handleUpload}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold 
            rounded-xl shadow-md hover:bg-indigo-700 transition duration-300"
        >
          Upload Resume
        </button>
      </div>

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
