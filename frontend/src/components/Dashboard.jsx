import React, { useReducer, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  Upload,
  Briefcase,
  TrendingUp,
  FileCheck,
  Menu,
  X,
  User,
  LogOut,
  CheckCircle,
  Bot,
  Sparkles,
  ArrowRight,
  // eslint-disable-next-line no-unused-vars
  Target,
  Zap,
} from "lucide-react";

import ResumeUpload from "./ResumeUpload";
import JobMatcher from "./JobMatcher";
import CareerPath from "./CareerPath";
import ATSFeedback from "./ATSFeedback";
import ResumeOptimizer from "./ResumeOptimizer";

/* ------------------ STATE ------------------ */

const initialState = {
  resume: null,
  job: null,
  jobDescription: '',
  career: null,
  ats: null,
  optimizer: null,
  section: "resume",
};

function reducer(state, action) {
  return { ...state, ...action };
}

/* ------------------ THREE.JS BACKGROUND ------------------ */

function ThreeBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x6366f1,
      transparent: true,
      opacity: 0.6,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create gradient sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, -3);
    scene.add(sphere);

    // Second sphere
    const sphere2Geometry = new THREE.SphereGeometry(1, 32, 32);
    const sphere2Material = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
    });
    const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
    sphere2.position.set(-2, 1, -4);
    scene.add(sphere2);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;

      sphere.rotation.y += 0.002;
      sphere.rotation.x += 0.001;

      sphere2.rotation.y -= 0.001;
      sphere2.rotation.x -= 0.002;

      // Smooth camera movement
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    />
  );
}

/* ------------------ PROGRESS CARD ------------------ */

function ProgressCard({ icon: Icon, label, progress, color, active }) {
  const colors = {
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', glow: 'shadow-blue-500/25' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/25' },
    green: { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/25' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/25' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-rose-500/25' },
  };

  const theme = colors[color] || colors.blue;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl transition-all duration-300
        ${active 
          ? 'bg-white/20 border-2 border-white/30 shadow-lg' 
          : 'bg-white/10 border border-white/10 hover:bg-white/15'
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br from-white/20 to-white/5 ${theme.text}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/60">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${theme.bg} to-white/50 rounded-full`}
              />
            </div>
            <span className={`text-sm font-semibold ${theme.text}`}>{progress}%</span>
          </div>
        </div>
      </div>
      {active && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-2 right-2 w-2 h-2 rounded-full ${theme.bg} shadow-lg ${theme.glow}`}
        />
      )}
    </motion.div>
  );
}

/* ------------------ HERO SECTION ------------------ */

function HeroSection({ user, onLogout, progress }) {
  const totalProgress = Math.round(
    (Object.values(progress).filter(Boolean).length / 5) * 100
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-slate-900/50 backdrop-blur-xl border border-white/10 p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <Sparkles className="text-amber-400" size={20} />
            <span className="text-sm font-medium text-white/70">AI-Powered Career Dashboard</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-2"
          >
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {user?.username || "Professional"}
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-xl"
          >
            Your AI resume builder is ready. Complete each step to optimize your career profile.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6"
        >
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/10"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: 251 }}
                  animate={{ strokeDasharray: 251 - (251 * totalProgress) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{totalProgress}%</span>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-2">Profile Complete</p>
          </div>

          <button
            onClick={onLogout}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors group"
          >
            <LogOut className="text-white/70 group-hover:text-red-400 transition-colors" size={20} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------ NAVIGATION TABS ------------------ */

function NavigationTabs({ nav, activeSection, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {nav.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(item.id)}
            className={`relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 whitespace-nowrap
              ${isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
          >
            <Icon size={18} />
            <span className="font-medium">{item.label}</span>
            {item.done && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckCircle size={12} className="text-white" />
              </motion.span>
            )}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ------------------ SECTION CARD ------------------ */

function Section({ title, subtitle, active, children, icon: Icon }) {
  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {Icon && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                    <Icon className="text-indigo-400" size={24} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-white">{title}</h2>
                  <p className="text-sm text-white/50">{subtitle}</p>
                </div>
              </div>
              <ArrowRight className="text-white/30" size={20} />
            </div>
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------ MAIN DASHBOARD ------------------ */

export default function Dashboard({ user, onLogout }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nav = [
    { id: "resume", label: "Resume Upload", icon: Upload, done: !!state.resume },
    { id: "job", label: "Job Matcher", icon: Briefcase, done: !!state.job },
    { id: "optimizer", label: "AI Optimizer", icon: Bot, done: !!state.optimizer },
    { id: "career", label: "Career Path", icon: TrendingUp, done: !!state.career },
    { id: "ats", label: "ATS Feedback", icon: FileCheck, done: !!state.ats },
  ];

  const progress = {
    resume: state.resume,
    job: state.job,
    optimizer: state.optimizer,
    career: state.career,
    ats: state.ats,
  };

  // eslint-disable-next-line no-unused-vars
const sectionIcons = {
    resume: Upload,
    job: Briefcase,
    optimizer: Bot,
    career: TrendingUp,
    ats: FileCheck,
  };

  const sectionTitles = {
    resume: "Resume Upload",
    job: "Job Matcher",
    optimizer: "AI Resume Optimizer",
    career: "Career Path",
    ats: "ATS Feedback",
  };

  const sectionSubtitles = {
    resume: "Upload and parse your resume",
    job: "Match your resume with job descriptions",
    optimizer: "Conversational AI for personalized resume optimization",
    career: "AI-powered growth recommendations",
    ats: "Optimize resume for ATS systems",
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Overlay gradient for readability */}
      <div className="fixed inset-0 bg-slate-900/50 pointer-events-none z-0" />

      <div className="relative z-10">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AI Resume Builder</h1>
                  <p className="text-xs text-white/50">Career Intelligence</p>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg bg-white/10 text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">
                    {user?.username || "User"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <LogOut className="text-white/60 group-hover:text-red-400 transition-colors" size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Hero Section */}
          <HeroSection user={user} onLogout={onLogout} progress={progress} />

          {/* Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {nav.map((item, index) => {
              const Icon = item.icon;
              const isActive = state.section === item.id;
              const progressValue = progress[item.id] ? 100 : 0;
              const colors = ['blue', 'purple', 'green', 'amber', 'rose'];
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => dispatch({ section: item.id })}
                  className="cursor-pointer"
                >
                  <ProgressCard
                    icon={Icon}
                    label={item.label}
                    progress={progressValue}
                    color={colors[index % colors.length]}
                    active={isActive}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Navigation Tabs */}
          <NavigationTabs
            nav={nav}
            activeSection={state.section}
            onSelect={(id) => dispatch({ section: id })}
          />

          {/* Content Sections */}
          <Section
            active={state.section === "resume"}
            title={sectionTitles.resume}
            subtitle={sectionSubtitles.resume}
            icon={Upload}
          >
            <ResumeUpload
              onResumeData={(data) => dispatch({ resume: data })}
            />
          </Section>

          <Section
            active={state.section === "job"}
            title={sectionTitles.job}
            subtitle={sectionSubtitles.job}
            icon={Briefcase}
          >
            <JobMatcher
              resumeData={state.resume}
              jobDescription={state.jobDescription}
              onJobMatchResults={(data) => dispatch({ job: data })}
              onJobDescriptionChange={(jobDescription) => dispatch({ jobDescription })}
            />
          </Section>

          <Section
            active={state.section === "optimizer"}
            title={sectionTitles.optimizer}
            subtitle={sectionSubtitles.optimizer}
            icon={Bot}
          >
            <ResumeOptimizer
              resumeData={state.resume}
              jobDescription={state.jobDescription}
              onOptimizationResults={(data) => dispatch({ optimizer: data })}
            />
          </Section>

          <Section
            active={state.section === "career"}
            title={sectionTitles.career}
            subtitle={sectionSubtitles.career}
            icon={TrendingUp}
          >
            <CareerPath
              resumeText={state.resume}
              onCareerPathResults={(data) => dispatch({ career: data })}
            />
          </Section>

          <Section
            active={state.section === "ats"}
            title={sectionTitles.ats}
            subtitle={sectionSubtitles.ats}
            icon={FileCheck}
          >
            <ATSFeedback
              resumeText={state.resume}
              onATSResults={(data) => dispatch({ ats: data })}
            />
          </Section>
        </main>
      </div>
    </div>
  );
}

