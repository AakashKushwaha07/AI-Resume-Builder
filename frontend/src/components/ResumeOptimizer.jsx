import React, { useEffect, useRef, useState } from 'react';
import './ResumeOptimizer.css';

const ResumeOptimizer = ({ resumeData, jobDescription: initialJobDescription = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const generateMessageId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const updateMessageById = (messageId, updater) => {
    setMessages((prev) => prev.map((message) => (message.id === messageId ? updater(message) : message)));
  };

  useEffect(() => {
    if (!resumeData) {
      return;
    }

    if (typeof resumeData === 'object' && resumeData.raw_text) {
      setResumeText(resumeData.raw_text);
    } else if (typeof resumeData === 'string') {
      setResumeText(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
    setJobDescription(initialJobDescription || '');
  }, [initialJobDescription]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startOptimizationSession = async () => {
    if (!resumeText.trim()) {
      setError('Please enter or upload your resume text first');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      console.log('Starting optimization session with:', {
        resume_length: resumeText.length,
        job_description_length: jobDescription.length,
      });

      const response = await fetch('http://localhost:5000/api/optimizer/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription || '',
        }),
      });

      const data = await response.json();
      console.log('Session response:', data);

      if (response.ok) {
        setSessionId(data.session_id);
        setIsSessionStarted(true);
        setMessages([
          {
            type: 'assistant',
            content: data.message || 'Session started! How can I help you optimize your resume?',
            timestamp: new Date(),
          },
          ...(data.initial_analysis
            ? [
                {
                  type: 'assistant',
                  content: data.initial_analysis,
                  timestamp: new Date(),
                },
              ]
            : []),
        ]);
      } else {
        setError(data.error || data.message || 'Failed to start session');
        console.error('Backend error:', data);
      }
    } catch (fetchError) {
      console.error('Error:', fetchError);
      setError(`Error starting optimization session: ${fetchError.message}`);
    }

    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) {
      return;
    }

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    const userMessageId = generateMessageId();
    const assistantMessageId = generateMessageId();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        type: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
      {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    try {
      let response = await fetch('http://localhost:5000/api/optimizer/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
      });

      if (!response.ok || !response.body) {
        response = await fetch('http://localhost:5000/api/optimizer/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: userMessage,
          }),
        });

        const data = await response.json();

        updateMessageById(assistantMessageId, (message) => ({
          ...message,
          content: response.ok
            ? data.response || 'I understand. How else can I help?'
            : `Error: ${data.error || 'Unknown error'}`,
          timestamp: new Date(),
          streaming: false,
        }));
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        while (buffer.includes('\n\n')) {
          const eventEnd = buffer.indexOf('\n\n');
          const rawEvent = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);

          const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));
          if (!dataLine) {
            continue;
          }

          try {
            const payload = JSON.parse(dataLine.slice(6));
            if (payload.error) {
              throw new Error(payload.error);
            }

            if (payload.chunk) {
              assistantText += payload.chunk;
              updateMessageById(assistantMessageId, (message) => ({
                ...message,
                content: assistantText,
                timestamp: new Date(),
                streaming: true,
              }));
            }

            if (payload.done) {
              updateMessageById(assistantMessageId, (message) => ({
                ...message,
                content: assistantText || 'I understand. How else can I help?',
                timestamp: new Date(),
                streaming: false,
              }));
            }
          } catch (parseError) {
            console.error('Stream parse error:', parseError);
          }
        }
      }

      updateMessageById(assistantMessageId, (message) => ({
        ...message,
        content: assistantText || message.content || 'I understand. How else can I help?',
        timestamp: new Date(),
        streaming: false,
      }));
    } catch (fetchError) {
      console.error('Error:', fetchError);
      updateMessageById(assistantMessageId, (message) => ({
        ...message,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        streaming: false,
      }));
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    const text =
      typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content
              .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
              .join('\n')
          : JSON.stringify(content ?? '');

    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r\n/g, '\n');

    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n?[•●▪◦-]\s(.*?)(?=\n[•●▪◦-]\s|\n\n|$)/gs, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="resume-optimizer">
      <div className="optimizer-header">
        <h2>AI Career Assistant</h2>
        <p>Get personalized guidance on your resume, skills, and job readiness</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>x</button>
        </div>
      )}

      {!isSessionStarted ? (
        <div className="session-setup">
          {resumeData && (
            <div className="info-banner">
              Your previously uploaded resume will be used for optimization.
            </div>
          )}

          <div className="input-section">
            <h3>Your Resume</h3>
            {resumeData ? (
              <>
                <div className="resume-preview">{resumeText.substring(0, 200)}...</div>
                <button
                  className="edit-resume-btn"
                  onClick={() => {
                    const newText = prompt('Edit your resume:', resumeText);
                    if (newText) {
                      setResumeText(newText);
                    }
                  }}
                >
                  Edit Resume
                </button>
              </>
            ) : (
              <textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
              />
            )}
          </div>

          <div className="input-section">
            <h3>Job Description (Optional)</h3>
            <textarea
              placeholder="Paste the job description for personalized career guidance..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />
          </div>

          <button
            className="start-session-btn"
            onClick={startOptimizationSession}
            disabled={isLoading || !resumeText.trim()}
          >
            {isLoading ? 'Starting Session...' : 'Start AI Optimization Session'}
          </button>
        </div>
      ) : (
        <div className="chat-interface">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={message.id || index} className={`message ${message.type}`}>
                <div className="message-avatar">{message.type === 'user' ? 'User' : 'AI'}</div>
                <div className="message-content">
                  {message.streaming && !message.content ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  )}
                  <div className="message-time">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Ask me anything about optimizing your resume..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
              Send
            </button>
          </div>

          <div className="chat-suggestions">
            <p>Try asking:</p>
            <div className="suggestion-buttons">
              <button onClick={() => setInputMessage('How can I improve my resume?')}>
                Improve Resume
              </button>
              <button onClick={() => setInputMessage('What skills should I learn next?')}>
                Skill Gaps
              </button>
              <button onClick={() => setInputMessage('Is my resume good for this role?')}>
                Resume Fit
              </button>
              <button onClick={() => setInputMessage('Rewrite this bullet point')}>
                Rewrite Bullet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;
