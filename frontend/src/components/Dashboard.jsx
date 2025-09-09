import React, { useState, useReducer, useEffect, useRef } from 'react';
import { 
  Upload, 
  Briefcase, 
  TrendingUp, 
  FileCheck, 
  Menu, 
  X, 
  ArrowUp,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  BarChart3,
  User,
  Clock,
  Star,
  Bell,
  Settings,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import './Dashboard.css';
import ResumeUpload from './ResumeUpload';
import JobMatcher from './JobMatcher';
import CareerPath from './CareerPath';
import ATSFeedback from './ATSFeedback';

// Enhanced initial state with more comprehensive tracking
const initialState = {
  resumeData: null,
  jobDescription: '',
  matchResults: null,
  careerSuggestions: null,
  atsResults: null,
  loading: {
    resume: false,
    job: false,
    career: false,
    ats: false
  },
  errors: {
    resume: null,
    job: null,
    career: null,
    ats: null
  },
  activeSection: 'resume-upload',
  analyticsData: {
    totalUploads: 0,
    averageScore: 0,
    improvementsMade: 0,
    sessionsToday: 1,
    lastActivity: new Date().toISOString()
  },
  notifications: [],
  preferences: {
    autoScroll: true,
    showHints: true,
    theme: 'light'
  }
};

// Enhanced reducer with additional actions
function dashboardReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.section]: action.value }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.section]: action.error }
      };
    case 'SET_RESUME_DATA':
      return {
        ...state,
        resumeData: action.data,
        errors: { ...state.errors, resume: null },
        analyticsData: {
          ...state.analyticsData,
          totalUploads: state.analyticsData.totalUploads + 1,
          lastActivity: new Date().toISOString()
        }
      };
    case 'SET_JOB_DESCRIPTION':
      return {
        ...state,
        jobDescription: action.description
      };
    case 'SET_MATCH_RESULTS':
      return {
        ...state,
        matchResults: action.results,
        errors: { ...state.errors, job: null },
        analyticsData: {
          ...state.analyticsData,
          lastActivity: new Date().toISOString()
        }
      };
    case 'SET_CAREER_SUGGESTIONS':
      return {
        ...state,
        careerSuggestions: action.suggestions,
        errors: { ...state.errors, career: null },
        analyticsData: {
          ...state.analyticsData,
          lastActivity: new Date().toISOString()
        }
      };
    case 'SET_ATS_RESULTS':
      return {
        ...state,
        atsResults: action.results,
        errors: { ...state.errors, ats: null },
        analyticsData: {
          ...state.analyticsData,
          averageScore: action.results.score || state.analyticsData.averageScore,
          improvementsMade: state.analyticsData.improvementsMade + (action.results.suggestions?.length || 0),
          lastActivity: new Date().toISOString()
        }
      };
    case 'SET_ACTIVE_SECTION':
      return {
        ...state,
        activeSection: action.section
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.notification]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((_, index) => index !== action.index)
      };
    case 'CLEAR_SECTION':
      return {
        ...state,
        [action.section]: null,
        errors: { ...state.errors, [action.section]: null }
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.preferences }
      };
    default:
      return state;
  }
}


const Dashboard = ({ user, onLogout }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  // Enhanced scroll tracking and section management
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      
      
      // Advanced active section detection
      const sections = ['resume-upload', 'job-matcher', 'career-path', 'ats-feedback'];
      const currentSection = sections.find(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          const scrollPosition = window.scrollY + 250;
          return scrollPosition >= elementTop && scrollPosition < elementBottom;
        }
        return false;
      });
      
      if (currentSection && currentSection !== state.activeSection) {
        dispatch({ type: 'SET_ACTIVE_SECTION', section: currentSection });
      }
    };

    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [state.activeSection]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Throttle function for performance optimization
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  };

  // Enhanced navigation sections with progress tracking
  const navigationSections = [
    { 
      id: 'resume-upload', 
      label: 'Resume Upload', 
      icon: Upload, 
      description: 'Upload and parse your resume',
      color: 'blue',
      priority: 1
    },
    { 
      id: 'job-matcher', 
      label: 'Job Matcher', 
      icon: Briefcase, 
      description: 'Match with job opportunities',
      color: 'purple',
      priority: 2
    },
    { 
      id: 'career-path', 
      label: 'Career Path', 
      icon: TrendingUp, 
      description: 'Discover growth opportunities',
      color: 'green',
      priority: 3
    },
    { 
      id: 'ats-feedback', 
      label: 'ATS Feedback', 
      icon: FileCheck, 
      description: 'Optimize for applicant tracking systems',
      color: 'orange',
      priority: 4
    }
  ];

  // Enhanced notification system
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', notification });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', index: 0 });
    }, 5000);
  };

  // Enhanced scroll to section with offset compensation
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.offsetTop - headerOffset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
      
      setSidebarOpen(false);
      dispatch({ type: 'SET_ACTIVE_SECTION', section: sectionId });
    }
  };

  // Smooth scroll to top with easing
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced resume upload with comprehensive error handling
  const handleResumeData = (data) => {
    dispatch({ type: 'SET_RESUME_DATA', data });
    addNotification('success', 'Resume uploaded and analyzed successfully!');
    
    // Auto-scroll to next section if preference is enabled
    if (state.preferences.autoScroll) {
      setTimeout(() => scrollToSection('job-matcher'), 1000);
    }
  };

  // Handle job matching results
  const handleJobMatchResults = (results) => {
    dispatch({ type: 'SET_MATCH_RESULTS', results });
    addNotification('success', `Job analysis complete! ${results.similarity || 'Analysis'}% compatibility found.`);
    
    if (state.preferences.autoScroll) {
      setTimeout(() => scrollToSection('career-path'), 1000);
    }
  };

  // Handle career path results
  const handleCareerPathResults = (suggestions) => {
    dispatch({ type: 'SET_CAREER_SUGGESTIONS', suggestions });
    addNotification('success', 'Career path analysis complete with personalized recommendations!');
    
    if (state.preferences.autoScroll) {
      setTimeout(() => scrollToSection('ats-feedback'), 1000);
    }
  };

  // Handle ATS feedback results
  const handleATSResults = (results) => {
    dispatch({ type: 'SET_ATS_RESULTS', results });
    addNotification('success', `ATS analysis complete! Score: ${results.ats_score || results.score}%`);
  };

  // Legacy handler for backward compatibility
  const handleResumeUpload = async (file) => {
    dispatch({ type: 'SET_LOADING', section: 'resume', value: true });
    dispatch({ type: 'SET_ERROR', section: 'resume', error: null });

    try {
      // Simulate file validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload a file smaller than 5MB.');
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF or Word document.');
      }

      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Enhanced mock parsed resume data
      const parsedData = {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0123',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'GraphQL'],
        experience: [
          {
            title: 'Senior Frontend Engineer',
            company: 'TechFlow Inc.',
            duration: '2022-Present',
            description: 'Led development of React-based web applications serving 100K+ users',
            achievements: ['Improved app performance by 40%', 'Led team of 4 developers']
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'Stanford University',
            year: '2020',
            gpa: '3.8'
          }
        ],
        certifications: ['AWS Solutions Architect', 'React Developer Certification']
      };

      handleResumeData(parsedData);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', section: 'resume', error: error.message });
      addNotification('error', `Upload failed: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', section: 'resume', value: false });
    }
  };

  // Enhanced job matching with detailed analysis
  const handleJobMatch = async (jobDescription) => {
    if (!state.resumeData) {
      const error = 'Please upload a resume first to use job matching';
      dispatch({ type: 'SET_ERROR', section: 'job', error });
      addNotification('warning', error);
      scrollToSection('resume-upload');
      return;
    }

    dispatch({ type: 'SET_LOADING', section: 'job', value: true });
    dispatch({ type: 'SET_ERROR', section: 'job', error: null });

    try {
      // Simulate comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Enhanced mock match results with detailed insights
      const matchResults = {
        similarity: 87,
        overallFit: 'Excellent',
        matchedSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        missingSkills: ['Kubernetes', 'Machine Learning', 'Data Analytics'],
        partialSkills: ['GraphQL', 'DevOps'],
        recommendations: [
          'Consider gaining Kubernetes experience for DevOps roles',
          'Highlight your AWS expertise more prominently',
          'Add quantifiable metrics to your React projects'
        ]
      };

      dispatch({ type: 'SET_MATCH_RESULTS', results: matchResults });
      dispatch({ type: 'SET_JOB_DESCRIPTION', description: jobDescription });
      addNotification('success', `Job analysis complete! ${matchResults.similarity}% compatibility found.`);
      
      if (state.preferences.autoScroll) {
        setTimeout(() => scrollToSection('career-path'), 1000);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', section: 'job', error: error.message });
      addNotification('error', `Job analysis failed: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', section: 'job', value: false });
    }
  };

  // Enhanced career path analysis with comprehensive insights
  const handleCareerPath = async () => {
    if (!state.resumeData) {
      const error = 'Please upload a resume first to get career recommendations';
      dispatch({ type: 'SET_ERROR', section: 'career', error });
      addNotification('warning', error);
      scrollToSection('resume-upload');
      return;
    }

    dispatch({ type: 'SET_LOADING', section: 'career', value: true });
    dispatch({ type: 'SET_ERROR', section: 'career', error: null });

    try {
      // Simulate advanced career analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Comprehensive career suggestions with market insights
      const careerSuggestions = {
        currentLevel: 'Senior Software Engineer',
        experience: '4+ years',
        marketPosition: 'Top 15%',
        nextRoles: [
          {
            title: 'Technical Lead',
            probability: 92,
            timeframe: '6-12 months',
            requiredSkills: ['Team Leadership', 'System Architecture', 'Mentoring'],
            salaryRange: '$160,000 - $180,000'
          },
          {
            title: 'Engineering Manager',
            probability: 78,
            timeframe: '12-18 months',
            requiredSkills: ['People Management', 'Strategic Planning', 'Budget Management'],
            salaryRange: '$170,000 - $200,000'
          }
        ],
        skillGaps: [
          { 
            skill: 'Kubernetes', 
            importance: 'High', 
            courses: ['Certified Kubernetes Administrator', 'Cloud Native Computing'],
            timeToLearn: '3-6 months'
          }
        ]
      };

      dispatch({ type: 'SET_CAREER_SUGGESTIONS', suggestions: careerSuggestions });
      addNotification('success', 'Career path analysis complete with personalized recommendations!');
      
      if (state.preferences.autoScroll) {
        setTimeout(() => scrollToSection('ats-feedback'), 1000);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', section: 'career', error: error.message });
      addNotification('error', `Career analysis failed: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', section: 'career', value: false });
    }
  };

  // Enhanced ATS feedback with detailed scoring
  const handleATSFeedback = async () => {
    if (!state.resumeData) {
      const error = 'Please upload a resume first to get ATS feedback';
      dispatch({ type: 'SET_ERROR', section: 'ats', error });
      addNotification('warning', error);
      scrollToSection('resume-upload');
      return;
    }

    dispatch({ type: 'SET_LOADING', section: 'ats', value: true });
    dispatch({ type: 'SET_ERROR', section: 'ats', error: null });

    try {
      // Simulate comprehensive ATS analysis
      await new Promise(resolve => setTimeout(resolve, 2800));
      
      // Detailed ATS results with actionable insights
      const atsResults = {
        score: 82,
        grade: 'A-',
        category: 'ATS Optimized',
        strengths: [
          'Clear section headers with standard naming',
          'Relevant keywords properly distributed',
          'Consistent formatting throughout',
          'Contact information easily parseable'
        ],
        improvements: [
          'Add more industry-specific keywords in experience section',
          'Include quantifiable achievements with metrics',
          'Optimize section order for ATS scanning priority',
          'Consider adding a professional summary section'
        ]
      };

      dispatch({ type: 'SET_ATS_RESULTS', results: atsResults });
      addNotification('success', `ATS analysis complete! Score: ${atsResults.score}% (${atsResults.grade})`);
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', section: 'ats', error: error.message });
      addNotification('error', `ATS analysis failed: ${error.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', section: 'ats', value: false });
    }
  };

  // Enhanced completion tracking with detailed progress
  const getCompletionStatus = () => {
    return {
      resumeupload: !!state.resumeData,
      jobmatcher: !!state.matchResults,
      careerpath: !!state.careerSuggestions,
      atsfeedback: !!state.atsResults
    };
  };

  const completionStatus = getCompletionStatus();
  const completedSteps = Object.values(completionStatus).filter(Boolean).length;
  const progressPercentage = (completedSteps / 4) * 100;
  const nextStep = navigationSections.find(section => 
    !completionStatus[section.id.replace('-', '')]
  );

  return (
    <div className="dashboard">
      {/* Enhanced Header with Search and Notifications */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="header-branding">
              <div className="logo-container">
                <Target size={32} />
                <div className="logo-pulse" />
              </div>
              <div className="header-text">
                <h1 className="dashboard-title">AI Resume Builder Dashboard</h1>
                <span className="dashboard-subtitle">Professional Dashboard</span>
              </div>
            </div>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => {}}>
                <Filter size={16} />
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <div className="progress-container">
              <div className="progress-info">
                <span>{completedSteps}/4 Complete</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {nextStep && (
                <button 
                  className="next-step-hint"
                  onClick={() => scrollToSection(nextStep.id)}
                  title={`Next: ${nextStep.label}`}
                >
                  Next: {nextStep.label}
                </button>
              )}
            </div>
            
            <div className="header-actions">
              <button className="notification-btn" title="Notifications">
                <Bell size={20} />
                {state.notifications.length > 0 && (
                  <span className="notification-badge">{state.notifications.length}</span>
                )}
              </button>
              
              <button className="settings-btn" title="Settings">
                <Settings size={20} />
              </button>
              
              <div className="user-avatar" ref={dropdownRef}>
  {/* Avatar with status indicator */}
  <User 
    size={20} 
    onClick={() => setShowUserDropdown(!showUserDropdown)}
    style={{ cursor: 'pointer' }}
  />
  <div className="status-indicator online" />

  {/* Render dropdown only when active */}
  {showUserDropdown && (
    <div className="user-dropdown absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50">
      <div className="dropdown-header px-4 py-2 border-b">
        <div className="user-info">
          <div className="user-name font-semibold">{user?.username || 'User'}</div>
          <div className="user-email text-sm text-blue-500">{user?.email || 'user@example.com'}</div>
        </div>
      </div>

      <div className="dropdown-item px-4 py-2  text-red-600 hover:bg-green-100 flex items-center cursor-pointer">
        <User size={16} className="mr-2" />
        <span>Profile Settings</span>
      </div>

      <div className="dropdown-item px-4 py-2  text-red-600 hover:bg-green-100 flex items-center cursor-pointer">
        <Settings size={16} className="mr-2" />
        <span>Account Settings</span>
      </div>

      <div className="dropdown-divider border-t my-1"></div>

      <div
        className="dropdown-item px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center cursor-pointer"
        onClick={onLogout}
      >
        <ArrowRight size={16} className="mr-2" />
        <span>Sign Out</span>
      </div>
    </div>
  )}
</div>


            </div>
          </div>
        </div>
        
        {/* Notifications Toast Container */}
        <div className="notifications-container">
          {state.notifications.map((notification, index) => (
            <div key={notification.id} className={`notification toast ${notification.type}`}>
              <div className="notification-content">
                <span>{notification.message}</span>
                <button 
                  onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', index })}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Enhanced Sidebar with Advanced Features */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-content">
            {/* Enhanced Navigation with Progress Indicators */}
            <nav className="sidebar-nav">
              <div className="nav-header">
                <h3>Navigation</h3>
                <span>{completedSteps}/4 completed</span>
              </div>
              <ul className="nav-list">
                {navigationSections.map((section) => {
                  const Icon = section.icon;
                  const isCompleted = completionStatus[section.id.replace('-', '')];
                  const isActive = state.activeSection === section.id;
                  const isLoading = state.loading[section.id.split('-')[0]] || state.loading[section.id.replace('-', '')];
                  
                  return (
                    <li key={section.id}>
                      <button
                        className={`nav-item ${isCompleted ? 'nav-item-completed' : ''} ${isActive ? 'nav-item-active' : ''} ${isLoading ? 'nav-item-loading' : ''}`}
                        onClick={() => scrollToSection(section.id)}
                      >
                        <div className={`nav-item-icon ${section.color}`}>
                          {isLoading ? (
                            <Loader2 size={20} className="loading-spinner" />
                          ) : (
                            <Icon size={20} />
                          )}
                        </div>
                        <div className="nav-item-content">
                          <span className="nav-item-label">{section.label}</span>
                          <span className="nav-item-description">{section.description}</span>
                          <div className="nav-item-meta">
                            <span>Priority {section.priority}</span>
                          </div>
                        </div>
                        <div className="nav-item-status">
                          {isCompleted && <CheckCircle size={16} />}
                          {isLoading && <div className="pulse-indicator" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Enhanced Analytics Dashboard */}
            <div className="sidebar-analytics">
              <h4>Session Analytics</h4>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-icon blue">
                    <BarChart3 size={18} />
                  </div>
                  <div className="analytics-content">
                    <span className="analytics-number">{state.analyticsData.totalUploads}</span>
                    <span className="analytics-label">Resumes</span>
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="analytics-icon green">
                    <Star size={18} />
                  </div>
                  <div className="analytics-content">
                    <span className="analytics-number">{state.analyticsData.averageScore}%</span>
                    <span className="analytics-label">Avg Score</span>
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="analytics-icon purple">
                    <Award size={18} />
                  </div>
                  <div className="analytics-content">
                    <span className="analytics-number">{state.analyticsData.improvementsMade}</span>
                    <span className="analytics-label">Insights</span>
                  </div>
                </div>
                
                <div className="analytics-item">
                  <div className="analytics-icon orange">
                    <Clock size={18} />
                  </div>
                  <div className="analytics-content">
                    <span className="analytics-number">{state.analyticsData.sessionsToday}</span>
                    <span className="analytics-label">Sessions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Center */}
            <div className="sidebar-actions">
              <div className="action-group">
                <h5>Quick Actions</h5>
                <button 
                  className="action-btn primary"
                  onClick={() => scrollToSection('resume-upload')}
                >
                  <Upload size={16} />
                  New Analysis
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => window.location.reload()}
                >
                  <Target size={16} />
                  Reset Session
                </button>
              </div>
              
              {nextStep && (
                <div className="next-step-card">
                  <div className="next-step-header">
                    <span>Next Step</span>
                    <nextStep.icon size={16} />
                  </div>
                  <button
                    className="next-step-btn"
                    onClick={() => scrollToSection(nextStep.id)}
                  >
                    {nextStep.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="main-content">
          {/* Enhanced Hero Section with Dynamic Insights */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-header">
                <h2>Transform Your Career with AI-Powered Resume Intelligence</h2>
                <p>
                  Upload your resume and unlock personalized insights, job compatibility analysis, and career growth recommendations. 
                  Our advanced AI provides instant feedback on ATS optimization and strategic career planning.
                </p>
              </div>
              
              <div className="hero-features">
                <div className="feature-highlight">
                  <div className="feature-icon blue">
                    <Target size={28} />
                  </div>
                  <div className="feature-text">
                    <h4>Smart Analysis</h4>
                    <p>AI-powered resume parsing with 95% accuracy</p>
                    <div className="feature-metrics">
                      <span>2.5s avg processing</span>
                    </div>
                  </div>
                </div>
                
                <div className="feature-highlight">
                  <div className="feature-icon purple">
                    <Briefcase size={28} />
                  </div>
                  <div className="feature-text">
                    <h4>Job Matching</h4>
                    <p>Find opportunities with 87% average compatibility</p>
                    <div className="feature-metrics">
                      <span>500K+ jobs analyzed</span>
                    </div>
                  </div>
                </div>
                
                <div className="feature-highlight">
                  <div className="feature-icon green">
                    <TrendingUp size={28} />
                  </div>
                  <div className="feature-text">
                    <h4>Career Growth</h4>
                    <p>Personalized roadmaps for advancement</p>
                    <div className="feature-metrics">
                      <span>30% faster promotions</span>
                    </div>
                  </div>
                </div>
                
                <div className="feature-highlight">
                  <div className="feature-icon orange">
                    <FileCheck size={28} />
                  </div>
                  <div className="feature-text">
                    <h4>ATS Optimization</h4>
                    <p>Maximize recruiter visibility and callbacks</p>
                    <div className="feature-metrics">
                      <span>40% more interviews</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-number">{completedSteps}</div>
                  <div className="stat-label">Steps Completed</div>
                  <div className="stat-progress">
                    <div className="stat-bar">
                      <div className="stat-fill" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{state.resumeData ? '1' : '0'}</div>
                  <div className="stat-label">Resume Analyzed</div>
                  <div className="stat-meta">
                    {state.resumeData ? 'Ready for analysis' : 'Upload to begin'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{state.matchResults ? '1' : '0'}</div>
                  <div className="stat-label">Job Matches</div>
                  <div className="stat-meta">
                    {state.matchResults ? `${state.matchResults.similarity}% compatibility` : 'Pending analysis'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{state.atsResults ? `${state.atsResults.score}%` : '0%'}</div>
                  <div className="stat-label">ATS Score</div>
                  <div className="stat-meta">
                    {state.atsResults ? `Grade: ${state.atsResults.grade}` : 'Not analyzed'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Feature Sections */}
          <section id="resume-upload" className="feature-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon blue">
                  <Upload size={32} />
                </div>
                <div className="section-info">
                  <h3>Resume Upload & Analysis</h3>
                  <p>Upload your resume to begin comprehensive AI analysis</p>
                  <div className="section-meta">
                    <span>Supports PDF, DOC, DOCX</span>
                    <span>•</span>
                    <span>Max 5MB</span>
                    <span>•</span>
                    <span>95% accuracy</span>
                  </div>
                </div>
              </div>
              <div className="section-status">
                {state.loading.resume && <Loader2 size={24} />}
                {state.resumeData && <CheckCircle size={24} />}
                {!state.resumeData && !state.loading.resume && (
                  <div className="status-badge pending">
                    <Clock size={16} />
                    Ready to Upload
                  </div>
                )}
              </div>
            </div>
            
            <div className="feature-card">
              {state.errors.resume && (
                <div className="alert error">
                  <AlertCircle size={16} />
                  <span>{state.errors.resume}</span>
                </div>
              )}
              
              <ResumeUpload
                onResumeData={handleResumeData}
                loading={state.loading.resume}
                resumeData={state.resumeData}
                error={state.errors.resume}
              />
            </div>
          </section>

          <section id="job-matcher" className="feature-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon purple">
                  <Briefcase size={32} />
                </div>
                <div className="section-info">
                  <h3>Smart Job Matcher</h3>
                  <p>Find perfect job matches with AI-powered compatibility analysis</p>
                  <div className="section-meta">
                    <span>Real-time analysis</span>
                    <span>•</span>
                    <span>Skills mapping</span>
                    <span>•</span>
                    <span>Salary insights</span>
                  </div>
                </div>
              </div>
              <div className="section-status">
                {state.loading.job && <Loader2 size={24} />}
                {state.matchResults && (
                  <div className={`status-badge ${state.matchResults.similarity >= 80 ? 'success' : state.matchResults.similarity >= 60 ? 'warning' : 'error'}`}>
                    <Star size={16} />
                    {state.matchResults.similarity}% Match
                  </div>
                )}
                {!state.matchResults && !state.loading.job && (
                  <div className="status-badge pending">
                    <Clock size={16} />
                    {state.resumeData ? 'Ready to Analyze' : 'Upload Resume First'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="feature-card">
              {state.errors.job && (
                <div className="alert error">
                  <AlertCircle size={16} />
                  <span>{state.errors.job}</span>
                </div>
              )}
              
              <JobMatcher
                resumeData={state.resumeData}
                onJobMatchResults={handleJobMatchResults}
                loading={state.loading.job}
                matchResults={state.matchResults}
                error={state.errors.job}
              />
            </div>
          </section>

          <section id="career-path" className="feature-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon green">
                  <TrendingUp size={32} />
                </div>
                <div className="section-info">
                  <h3>Career Path Intelligence</h3>
                  <p>Discover strategic career moves and growth opportunities with market insights</p>
                  <div className="section-meta">
                    <span>Market trends</span>
                    <span>•</span>
                    <span>Skill development</span>
                    <span>•</span>
                    <span>Salary projections</span>
                  </div>
                </div>
              </div>
              <div className="section-status">
                {state.loading.career && <Loader2 size={24} />}
                {state.careerSuggestions && <CheckCircle size={24} />}
                {!state.careerSuggestions && !state.loading.career && (
                  <div className="status-badge pending">
                    <Clock size={16} />
                    {state.resumeData ? 'Ready to Analyze' : 'Upload Resume First'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="feature-card">
              {state.errors.career && (
                <div className="alert error">
                  <AlertCircle size={16} />
                  <span>{state.errors.career}</span>
                </div>
              )}
              
              <CareerPath
                resumeText={state.resumeData}
                onCareerPathResults={handleCareerPathResults}
                loading={state.loading.career}
                careerSuggestions={state.careerSuggestions}
                error={state.errors.career}
              />
            </div>
          </section>

          <section id="ats-feedback" className="feature-section">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-icon orange">
                  <FileCheck size={32} />
                </div>
                <div className="section-info">
                  <h3>ATS Optimization Engine</h3>
                  <p>Maximize resume visibility with comprehensive ATS compatibility analysis</p>
                  <div className="section-meta">
                    <span>Multi-ATS testing</span>
                    <span>•</span>
                    <span>Keyword optimization</span>
                    <span>•</span>
                    <span>Format validation</span>
                  </div>
                </div>
              </div>
              <div className="section-status">
                {state.loading.ats && <Loader2 size={24} />}
                {state.atsResults && (
                  <div className={`status-badge ${state.atsResults.score >= 80 ? 'success' : state.atsResults.score >= 60 ? 'warning' : 'error'}`}>
                    <Award size={16} />
                    Grade: {state.atsResults.grade}
                  </div>
                )}
                {!state.atsResults && !state.loading.ats && (
                  <div className="status-badge pending">
                    <Clock size={16} />
                    {state.resumeData ? 'Ready to Analyze' : 'Upload Resume First'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="feature-card">
              {state.errors.ats && (
                <div className="alert error">
                  <AlertCircle size={16} />
                  <span>{state.errors.ats}</span>
                </div>
              )}
              
              <ATSFeedback
                resumeText={state.resumeData}
                onATSResults={handleATSResults}
                loading={state.loading.ats}
                atsResults={state.atsResults}
                error={state.errors.ats}
              />
            </div>
          </section>

          {/* Enhanced Footer with Additional Information */}
          <footer className="dashboard-footer">
            <div className="footer-content">
              <div className="footer-section">
                <div className="footer-branding">
                  <Target size={24} />
                  <div className="footer-text">
                    <h4>AI Resume Builder</h4>
                    <p>Empowering careers through intelligent technology</p>
                  </div>
                </div>
              </div>
              
              <div className="footer-section">
                <h5>Features</h5>
                <ul>
                  <li><a href="#resume-upload">Resume Analysis</a></li>
                  <li><a href="#job-matcher">Job Matching</a></li>
                  <li><a href="#career-path">Career Planning</a></li>
                  <li><a href="#ats-feedback">ATS Optimization</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h5>Support</h5>
                <ul>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">Contact Support</a></li>
                  <li><a href="#">Feature Requests</a></li>
                </ul>
              </div>
              
              <div className="footer-section">
                <h5>Legal</h5>
                <ul>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Data Security</a></li>
                  <li><a href="#">GDPR Compliance</a></li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>
                © 2025 AI Resume Builder. All rights reserved. 
                <span>v2.1.0</span>
              </p>
              <div>
                <span>Built to support your career growth</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Enhanced Back to Top with Progress Indicator */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
          <div className="scroll-progress">
            <svg width="60" height="60">
              <circle
                cx="30"
                cy="30"
                r="26"
                strokeWidth="4"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                strokeWidth="4"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeDasharray={`${progressPercentage * 1.63} 163`}
                transform="rotate(-90 30 30)"
              />
            </svg>
          </div>
        </button>
      )}

      {/* Enhanced Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;