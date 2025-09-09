import React, { useState } from 'react';
import { 
  Brain, 
  FileText, 
  Target, 
  CheckCircle, 
  Upload, 
  Eye, 
  Zap,
  Star,
  ArrowRight,
  //Users,
  TrendingUp,
  Shield,
  Clock,
  X,
  Mail,
  Lock,
  User,
  Sparkles
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onLogin }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('signup'); // 'signup', 'login', 'success', 'forgot-password'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    resetEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setMessage('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '', resetEmail: '' });
    setMessage('');
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    if (modalType === 'forgot-password') {
      // Handle forgot password
      const response = await fetch("http://127.0.0.1:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.resetEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password reset instructions sent to your email!');
        setTimeout(() => {
          setModalType('login');
          setMessage('');
        }, 3000);
      } else {
        setMessage(data.error || 'Failed to send reset email');
      }
      return;
    }

    // Handle signup/login
    const endpoint = modalType === "signup" 
      ? "http://127.0.0.1:5000/api/auth/signup" 
      : "http://127.0.0.1:5000/api/auth/login";

    const payload = {
      username: formData.name, 
      email: formData.email,
      password: formData.password,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Something went wrong");
      return;
    }

    if (modalType === "signup") {
      setModalType("success"); // show success modal
      setTimeout(() => closeModal(), 2000);
    } else {
      // Call the onLogin callback to update parent state
      onLogin(data.user, data.token);
      onLogin(data.user, data.token);
      closeModal();
    }
  } catch (err) {
    console.error("Error:", err);
    setMessage("Server error, try again later.");
  } finally {
    setLoading(false);
  }
};



  const switchModalType = () => {
    setModalType(modalType === 'signup' ? 'login' : 'signup');
    setFormData({ name: '', email: '', password: '', resetEmail: '' });
    setMessage('');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-icon-wrapper">
              <Brain className="nav-icon" />
              <div className="nav-icon-glow"></div>
            </div>
            <span className="nav-title">AI Resume Pro</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <button className="nav-cta" onClick={() => openModal('login')}>Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
          <div className="floating-element element-4"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <Sparkles className="badge-icon" />
                <span>Powered by Advanced AI</span>
              </div>
              <h1 className="hero-title">
                Build Smarter Resumes 
                <span className="hero-highlight"> with AI</span>
              </h1>
              <p className="hero-subtitle">
                Upload your resume, match with job descriptions, and get AI-powered career insights 
                that help you land your dream job faster.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary" onClick={() => openModal('signup')}>
                  <span>Get Started Free</span>
                  <ArrowRight className="btn-icon" />
                  <div className="btn-glow"></div>
                </button>
                <button className="btn-secondary" onClick={() => openModal('signup')}>
                  <Eye className="btn-icon" />
                  <span>Watch Demo</span>
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Resumes Analyzed</span>
                </div>
                <div className="stat">
                  <span className="stat-number">94%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
                <div className="stat">
                  <span className="stat-number">15min</span>
                  <span className="stat-label">Average Time</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-3d-scene">
                <div className="scene-element laptop-3d">
                  <div className="laptop-base"></div>
                  <div className="laptop-screen">
                    <div className="screen-glow"></div>
                    <div className="screen-content">
                      <div className="resume-lines">
                        <div className="line line-1"></div>
                        <div className="line line-2"></div>
                        <div className="line line-3"></div>
                        <div className="line line-4"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="scene-element ai-orb">
                  <div className="orb-core">
                    <Brain className="orb-icon" />
                  </div>
                  <div className="orb-ring ring-1"></div>
                  <div className="orb-ring ring-2"></div>
                  <div className="orb-ring ring-3"></div>
                  <div className="orb-particles">
                    <div className="particle particle-1"></div>
                    <div className="particle particle-2"></div>
                    <div className="particle particle-3"></div>
                    <div className="particle particle-4"></div>
                  </div>
                </div>
                <div className="scene-element resume-card">
                  <div className="card-header"></div>
                  <div className="card-body">
                    <div className="card-line"></div>
                    <div className="card-line"></div>
                    <div className="card-line short"></div>
                  </div>
                  <FileText className="card-icon" />
                </div>
                <div className="scene-element job-card">
                  <div className="job-header"></div>
                  <div className="job-body">
                    <Target className="job-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Powerful AI Features</h2>
            <p className="section-subtitle">
              Transform your resume with cutting-edge AI technology
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Target />
                <div className="icon-glow"></div>
              </div>
              <h3 className="feature-title">Resume ↔ Job Matching</h3>
              <p className="feature-description">
                Check how well your resume fits a job description with AI-powered 
                similarity scoring and get specific improvement suggestions.
              </p>
              <div className="feature-3d-element">
                <div className="matching-visual">
                  <div className="match-bar">
                    <div className="match-fill"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
                <div className="icon-glow"></div>
              </div>
              <h3 className="feature-title">Career Path Prediction</h3>
              <p className="feature-description">
                Discover next steps in your career journey and identify skill gaps 
                to advance to your desired position.
              </p>
              <div className="feature-3d-element">
                <div className="career-path">
                  <div className="path-node active"></div>
                  <div className="path-line"></div>
                  <div className="path-node next"></div>
                  <div className="path-line"></div>
                  <div className="path-node future"></div>
                </div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle />
                <div className="icon-glow"></div>
              </div>
              <h3 className="feature-title">ATS Optimization</h3>
              <p className="feature-description">
                Simulate Applicant Tracking Systems and optimize your resume 
                to pass through automated screening processes.
              </p>
              <div className="feature-3d-element">
                <div className="ats-scanner">
                  <div className="scanner-line"></div>
                  <div className="scan-result good"></div>
                </div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Upload />
                <div className="icon-glow"></div>
              </div>
              <h3 className="feature-title">Instant Resume Analysis</h3>
              <p className="feature-description">
                Easily upload PDF/DOCX resumes for instant AI analysis with 
                detailed feedback and actionable recommendations.
              </p>
              <div className="feature-3d-element">
                <div className="upload-zone">
                  <div className="upload-icon">
                    <Upload />
                  </div>
                  <div className="upload-progress">
                    <div className="progress-bar"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get AI-powered resume insights in just three simple steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <div className="step-icon-3d">
                  <div className="icon-cube">
                    <div className="cube-face front">
                      <Upload />
                    </div>
                    <div className="cube-face back"></div>
                    <div className="cube-face right"></div>
                    <div className="cube-face left"></div>
                    <div className="cube-face top"></div>
                    <div className="cube-face bottom"></div>
                  </div>
                </div>
                <h3 className="step-title">Upload Your Resume</h3>
                <p className="step-description">
                  Simply drag and drop your PDF or DOCX resume file, 
                  and our AI will instantly parse all the information.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <div className="step-icon-3d">
                  <div className="icon-cube">
                    <div className="cube-face front">
                      <FileText />
                    </div>
                    <div className="cube-face back"></div>
                    <div className="cube-face right"></div>
                    <div className="cube-face left"></div>
                    <div className="cube-face top"></div>
                    <div className="cube-face bottom"></div>
                  </div>
                </div>
                <h3 className="step-title">Add Job Description</h3>
                <p className="step-description">
                  Paste the job description you're targeting or describe 
                  your career goals for personalized analysis.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <div className="step-icon-3d">
                  <div className="icon-cube">
                    <div className="cube-face front">
                      <Zap />
                    </div>
                    <div className="cube-face back"></div>
                    <div className="cube-face right"></div>
                    <div className="cube-face left"></div>
                    <div className="cube-face top"></div>
                    <div className="cube-face bottom"></div>
                  </div>
                </div>
                <h3 className="step-title">Get AI Insights</h3>
                <p className="step-description">
                  Receive instant feedback, match scores, and specific 
                  recommendations to improve your resume's effectiveness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="demo">
        <div className="section-container">
          <div className="demo-content">
            <div className="demo-text">
              <h2 className="demo-title">See AI Transform Your Resume</h2>
              <p className="demo-subtitle">
                Watch how our AI analyzes your resume and provides instant, 
                actionable insights to boost your job search success.
              </p>
              <div className="demo-features">
                <div className="demo-feature">
                  <CheckCircle className="check-icon" />
                  <span>Real-time ATS compatibility scoring</span>
                </div>
                <div className="demo-feature">
                  <CheckCircle className="check-icon" />
                  <span>Keyword optimization suggestions</span>
                </div>
                <div className="demo-feature">
                  <CheckCircle className="check-icon" />
                  <span>Skills gap analysis</span>
                </div>
                <div className="demo-feature">
                  <CheckCircle className="check-icon" />
                  <span>Industry-specific recommendations</span>
                </div>
              </div>
              <button className="demo-cta" onClick={() => openModal('signup')}>
                Try Demo Now
                <ArrowRight className="btn-icon" />
              </button>
            </div>
            <div className="demo-visual">
              <div className="demo-dashboard-3d">
                <div className="dashboard-container">
                  <div className="dashboard-header">
                    <div className="dashboard-title">AI Analysis Results</div>
                    <div className="dashboard-score">
                      <span className="score-label">Match Score</span>
                      <div className="score-circle">
                        <div className="score-progress"></div>
                        <span className="score-value">87%</span>
                      </div>
                    </div>
                  </div>
                  <div className="dashboard-content">
                    <div className="insight-item">
                      <div className="insight-icon good">
                        <CheckCircle />
                      </div>
                      <span>Strong technical skills alignment</span>
                      <div className="insight-glow"></div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon warning">
                        <Clock />
                      </div>
                      <span>Add more leadership experience</span>
                      <div className="insight-glow"></div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon good">
                        <Shield />
                      </div>
                      <span>ATS-friendly format detected</span>
                      <div className="insight-glow"></div>
                    </div>
                  </div>
                </div>
                <div className="dashboard-shadow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Join thousands who've landed their dream jobs with AI Resume Pro
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-3d-bg"></div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">
                "This tool helped me land my first interview at Google! The AI suggestions 
                were spot-on and improved my resume's ATS score by 40%."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span>SM</span>
                  <div className="avatar-glow"></div>
                </div>
                <div className="author-info">
                  <div className="author-name">Sarah Martinez</div>
                  <div className="author-title">Software Engineer</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-3d-bg"></div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">
                "As a recent graduate, I had no idea how to make my resume stand out. 
                The AI insights helped me highlight my skills perfectly."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span>MJ</span>
                  <div className="avatar-glow"></div>
                </div>
                <div className="author-info">
                  <div className="author-name">Michael Johnson</div>
                  <div className="author-title">Marketing Graduate</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-3d-bg"></div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">
                "The career path predictions opened my eyes to opportunities I never 
                considered. Got promoted within 6 months!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <span>EL</span>
                  <div className="avatar-glow"></div>
                </div>
                <div className="author-info">
                  <div className="author-name">Emily Liu</div>
                  <div className="author-title">Data Analyst</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-subtitle">
              Start free and upgrade when you're ready for advanced features
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-3d-bg"></div>
              <div className="pricing-header">
                <h3 className="pricing-title">Free</h3>
                <div className="pricing-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">0</span>
                  <span className="price-period">/month</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Basic resume analysis</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>1 job matching per month</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Basic ATS feedback</span>
                </div>
              </div>
              <button className="pricing-btn" onClick={() => openModal('signup')}>
                Get Started
                <div className="btn-glow"></div>
              </button>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-badge">
                <Sparkles className="badge-icon" />
                Most Popular
              </div>
              <div className="pricing-3d-bg featured-bg"></div>
              <div className="pricing-header">
                <h3 className="pricing-title">Pro</h3>
                <div className="pricing-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">19</span>
                  <span className="price-period">/month</span>
                </div>
              </div>
              <div className="pricing-features">
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Unlimited resume analysis</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Unlimited job matching</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Advanced ATS optimization</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Career path predictions</span>
                </div>
                <div className="pricing-feature">
                  <CheckCircle className="feature-check" />
                  <span>Priority support</span>
                </div>
              </div>
              <button className="pricing-btn featured-btn" onClick={() => openModal('signup')}>
                Start Pro Trial
                <div className="btn-glow"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-footer">
        <div className="cta-3d-bg">
          <div className="cta-particle cta-particle-1"></div>
          <div className="cta-particle cta-particle-2"></div>
          <div className="cta-particle cta-particle-3"></div>
        </div>
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Build Your AI-Powered Resume?</h2>
            <p className="cta-subtitle">
              Join thousands of successful job seekers who've transformed their careers with AI
            </p>
            <button className="cta-button" onClick={() => openModal('signup')}>
              <span>Try It Now – Free</span>
              <ArrowRight className="btn-icon" />
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-icon-wrapper">
              <Brain className="footer-icon" />
              <div className="footer-icon-glow"></div>
            </div>
            <span className="footer-title">AI Resume Pro</span>
          </div>
          {/*<div className="footer-links">
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>*/}
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 AI Resume Pro. All rights reserved.</p>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X />
            </button>
            
            {modalType === 'success' ? (
              <div className="success-content">
                <div className="success-icon">
                  <CheckCircle />
                  <div className="success-glow"></div>
                </div>
                <h2 className="success-title">Welcome to AI Resume Pro!</h2>
                <p className="success-message">
                  Your account has been created successfully. Get ready to transform your career!
                </p>
                <div className="success-animation">
                  <div className="success-particle"></div>
                  <div className="success-particle"></div>
                  <div className="success-particle"></div>
                </div>
              </div>
            ) : modalType === 'forgot-password' ? (
              <div className="auth-content">
                <div className="auth-header">
                  <div className="auth-icon">
                    <Mail />
                    <div className="auth-icon-glow"></div>
                  </div>
                  <h2 className="auth-title">Reset Password</h2>
                  <p className="auth-subtitle">
                    Enter your email address and we'll send you instructions to reset your password
                  </p>
                </div>
                
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="resetEmail"
                        placeholder="Email Address"
                        value={formData.resetEmail}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="auth-submit" disabled={loading}>
                    <span>
                      {loading ? 'Sending...' : 'Send Reset Instructions'}
                    </span>
                    <ArrowRight className="btn-icon" />
                    <div className="btn-glow"></div>
                  </button>
                </form>
                
                {message && (
                  <div className={`auth-message ${message.includes('sent') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                
                <div className="auth-switch">
                  <span>Remember your password?</span>
                  <button className="switch-btn" onClick={() => setModalType('login')}>
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-content">
                <div className="auth-header">
                  <div className="auth-icon">
                    <Brain />
                    <div className="auth-icon-glow"></div>
                  </div>
                  <h2 className="auth-title">
                    {modalType === 'signup' ? 'Join AI Resume Pro' : 'Welcome Back'}
                  </h2>
                  <p className="auth-subtitle">
                    {modalType === 'signup' 
                      ? 'Start building smarter resumes with AI today' 
                      : 'Sign in to continue your journey'
                    }
                  </p>
                </div>
                
                <form className="auth-form" onSubmit={handleSubmit}>
                  {modalType === 'signup' && (
                    <div className="form-group">
                      <div className="input-wrapper">
                        <User className="input-icon" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <Mail className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="input-wrapper">
                      <Lock className="input-icon" />
                      <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="auth-submit" disabled={loading}>
                    <span>
                      {loading ? 'Please wait...' : (modalType === 'signup' ? 'Create Account' : 'Sign In')}
                    </span>
                    <ArrowRight className="btn-icon" />
                    <div className="btn-glow"></div>
                  </button>
                </form>
                
                {message && (
                  <div className={`auth-message ${message.includes('success') ? 'success' : 'error'}`}>
                    {message}
                  </div>
                )}
                
                {modalType === 'login' && (
                  <div className="forgot-password">
                    <button 
                      className="forgot-password-btn" 
                      onClick={() => setModalType('forgot-password')}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                
                <div className="auth-switch">
                  <span>
                    {modalType === 'signup' 
                      ? 'Already have an account?' 
                      : "Don't have an account?"
                    }
                  </span>
                  <button className="switch-btn" onClick={switchModalType}>
                    {modalType === 'signup' ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
                
                {modalType === 'signup' && (
                  <div className="auth-benefits">
                    <div className="benefit-item">
                      <CheckCircle className="benefit-icon" />
                      <span>Free forever plan</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle className="benefit-icon" />
                      <span>Instant AI analysis</span>
                    </div>
                    <div className="benefit-item">
                      <CheckCircle className="benefit-icon" />
                      <span>No credit card required</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;