import React, { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle,
  ChevronRight,
  FileText,
  Lock,
  Mail,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  User,
  X,
} from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";

const features = [
  {
    icon: Upload,
    title: "Resume Upload & Parsing",
    description:
      "Upload PDF or DOCX resumes and instantly extract skills, education, experience, projects, and core resume content.",
  },
  {
    icon: Sparkles,
    title: "Jarvis AI Optimizer",
    description:
      "Chat with Jarvis to improve resume wording, tailor content for roles, and get smart suggestions with voice input and audio responses.",
  },
  {
    icon: ShieldCheck,
    title: "ATS Feedback",
    description:
      "Get an ATS compatibility score with actionable advice on keywords, formatting, structure, and role-specific improvements.",
  },
  {
    icon: Target,
    title: "Job Matching",
    description:
      "Compare your resume to job descriptions using AI/NLP matching to uncover missing skills, keywords, and improvement areas.",
  },
  {
    icon: TrendingUp,
    title: "Career Path Prediction",
    description:
      "Discover suitable career paths, identify skill gaps, and get next-step guidance for growth and better opportunities.",
  },
  {
    icon: BarChart3,
    title: "Smart User Dashboard",
    description:
      "Manage uploads, review match results, track ATS improvements, and explore personalized recommendations in one place.",
  },
];

const benefits = [
  "Save time optimizing every application",
  "Improve ATS score with practical fixes",
  "Find missing skills before applying",
  "Tailor your resume for each job role",
  "Get personalized career growth guidance",
];

const steps = [
  {
    number: "01",
    title: "Upload your resume",
    description:
      "Import your PDF or DOCX resume and let the platform extract the important details automatically.",
  },
  {
    number: "02",
    title: "Add a job description",
    description:
      "Paste the role you want and compare your current resume against the requirements that matter.",
  },
  {
    number: "03",
    title: "Get AI-powered insights",
    description:
      "Receive ATS feedback, match scores, missing keywords, and tailored suggestions from Jarvis.",
  },
  {
    number: "04",
    title: "Improve and apply confidently",
    description:
      "Refine your resume, close skill gaps, and submit stronger applications with more confidence.",
  },
];

const stats = [
  { label: "ATS Match Score", value: "92%" },
  { label: "Resume Sections Parsed", value: "8+" },
  { label: "Missing Skills Identified", value: "14" },
  { label: "Career Paths Suggested", value: "5" },
];

function Button({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  type = "button",
  disabled = false,
  onClick,
}) {
  const styles =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
    >
      {children}
      {Icon ? <Icon className="h-4 w-4" /> : null}
    </button>
  );
}

function SectionHeading({ badge, title, description, center = true }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mt-0.5 rounded-full bg-emerald-50 p-1 text-emerald-600">
        <CheckCircle className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium text-slate-700">{text}</p>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Input({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50">
      <Icon className="h-5 w-5 text-slate-400" />
      <input
        {...props}
        required
        className="w-full px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

function MockupCard() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -left-10 top-8 hidden h-28 w-28 rounded-full bg-indigo-200/40 blur-3xl lg:block" />
      <div className="absolute -right-8 bottom-10 hidden h-32 w-32 rounded-full bg-sky-200/40 blur-3xl lg:block" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Resume Analysis Dashboard
              </p>
              <p className="text-xs text-slate-500">
                AI-powered insights for job readiness
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ready to Improve
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800">
                    Resume Health
                  </span>
                </div>
                <span className="text-sm font-bold text-indigo-600">88/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 w-[88%] rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                <div className="rounded-lg bg-white p-2 text-center">
                  Format <span className="block font-semibold text-slate-800">Strong</span>
                </div>
                <div className="rounded-lg bg-white p-2 text-center">
                  Keywords <span className="block font-semibold text-slate-800">Needs Work</span>
                </div>
                <div className="rounded-lg bg-white p-2 text-center">
                  Clarity <span className="block font-semibold text-slate-800">Good</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">Job Match</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">82%</div>
                  <p className="text-xs text-slate-500">
                    Match with Product Analyst role
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  6 skills missing
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">
                  ATS Feedback
                </span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Add more role-specific keywords
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Quantify project impact with metrics
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-500" />
                  Improve technical skills section structure
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-sky-500 p-5 text-white">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <p className="font-semibold">Jarvis AI Assistant</p>
              </div>
              <p className="mt-3 text-sm text-indigo-50">
                Your resume is strong for entry-level analyst roles. Add SQL,
                A/B testing, and dashboard reporting keywords to improve your
                match rate.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-indigo-100">
                <Mic className="h-4 w-4" />
                Voice-ready assistance enabled
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">
                  Suggested Career Paths
                </span>
              </div>
              <div className="space-y-2">
                {["Data Analyst", "Business Analyst", "Product Operations"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm text-slate-700">{item}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Missing Skill Highlights
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["SQL", "Power BI", "A/B Testing", "Stakeholder Reporting"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ onLogin }) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setMessage("");
    setIsForgotPassword(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", email: "", password: "" });
    setResetEmail("");
    setMessage("");
    setLoading(false);
    setIsForgotPassword(false);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint =
        modalType === "signup"
          ? `${API_URL}/api/auth/signup`
          : `${API_URL}/api/auth/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      if (modalType === "login") {
        onLogin(data.user, data.token);
        closeModal();
      } else {
        setMessage("Account created successfully. Please sign in.");
        setModalType("login");
      }
    } catch {
      setMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage("Reset link sent to your email");
      }
    } catch {
      setMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 overflow-hidden">
        <div className="mx-auto h-[520px] max-w-7xl bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%),radial-gradient(circle_at_20%_30%,_rgba(14,165,233,0.10),_transparent_25%)]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-600/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight">AI Resume Pro</p>
              <p className="text-xs text-slate-500">AI-powered resume optimization</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900">
              How it works
            </a>
            <a href="#benefits" className="text-sm text-slate-600 hover:text-slate-900">
              Benefits
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => openModal("login")}>
              Sign In
            </Button>
            <Button icon={ArrowRight} onClick={() => openModal("signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Built for students, freshers, and job seekers
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Build job-ready resumes with AI
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Upload your resume, match it with job descriptions, get ATS
              feedback, and receive AI-powered suggestions to improve your
              chances of getting shortlisted.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                icon={ArrowRight}
                onClick={() => openModal("signup")}
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={scrollToFeatures}
              >
                View Demo
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>

          <MockupCard />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center text-sm text-slate-500 md:flex-row md:px-8 md:text-left">
          <p>Designed to help users create cleaner, stronger, ATS-friendly resumes.</p>
          <div className="flex flex-wrap items-center gap-6 text-slate-400">
            <span className="font-semibold">Resume Parsing</span>
            <span className="font-semibold">ATS Insights</span>
            <span className="font-semibold">Job Matching</span>
            <span className="font-semibold">Career Growth</span>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            badge="Core platform features"
            title="Everything needed to improve resumes with confidence"
            description="AI Resume Pro brings parsing, optimization, ATS analysis, job matching, and career guidance into one polished workflow."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            badge="How it works"
            title="A simple workflow from upload to application"
            description="Users can move from resume upload to clear, actionable feedback in just a few steps."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <div className="mb-4 text-sm font-bold text-indigo-600">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <SectionHeading
              center={false}
              badge="Why users choose it"
              title="Built to increase clarity, confidence, and interview readiness"
              description="The platform helps users understand exactly where their resume stands and what to improve next."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <BenefitItem key={benefit} text={benefit} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Meet Jarvis</h3>
                <p className="text-sm text-slate-500">Your AI resume assistant</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                Can you tailor my resume for a software engineering internship?
              </div>
              <div className="rounded-2xl bg-indigo-600 p-4 text-sm text-white">
                Absolutely. I will improve your summary, highlight relevant
                projects, and align your skills with the job description.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <Mic className="mb-2 h-5 w-5 text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-900">Voice Input</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Ask questions naturally using voice support.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <Briefcase className="mb-2 h-5 w-5 text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-900">Role Tailoring</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Get targeted advice for specific jobs and industries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-14 text-white shadow-2xl">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-indigo-100">
                <Sparkles className="h-4 w-4" />
                Ready when your next opportunity is
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to improve your resume?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Build stronger, ATS-friendly resumes, discover missing skills,
                and apply with more confidence using AI Resume Pro.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  icon={ArrowRight}
                  onClick={() => openModal("signup")}
                >
                  Get Started
                </Button>
                <Button
                  variant="secondary"
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto"
                  onClick={scrollToFeatures}
                >
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-800">AI Resume Pro</p>
            <p className="mt-1">
              AI-powered resume optimization for job seekers, students, and professionals.
            </p>
          </div>
          <p>(c) 2026 AI Resume Pro. All rights reserved.</p>
        </div>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close authentication modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 pr-10">
              <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isForgotPassword
                  ? "Reset your password"
                  : modalType === "signup"
                    ? "Create your account"
                    : "Welcome back"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isForgotPassword
                  ? "Enter your email and we will send a reset link."
                  : modalType === "signup"
                    ? "Start improving your resume with AI Resume Pro."
                    : "Sign in to continue to your dashboard."}
              </p>
            </div>

            {isForgotPassword ? (
              <div className="space-y-4">
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                />

                {message && <p className="text-sm text-red-500">{message}</p>}

                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={handleForgotPassword}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  className="block w-full text-center text-sm font-semibold text-white hover:text-gray-200"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setMessage("");
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === "signup" && (
                  <Input
                    icon={User}
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                )}

                <Input
                  icon={Mail}
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />

                <Input
                  icon={Lock}
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />

                {modalType === "login" && (
                  <button
                    type="button"
                    className="block w-full text-center text-sm font-semibold text-white hover:text-gray-200"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setMessage("");
                    }}
                  >
                    Forgot Password?
                  </button>
                )}

                {message && <p className="text-sm text-red-500">{message}</p>}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : modalType === "signup"
                      ? "Sign Up"
                      : "Sign In"}
                </Button>
              </form>
            )}

            {!isForgotPassword && (
              <p className="mt-5 text-center text-sm text-slate-500">
                {modalType === "signup" ? "Already have an account?" : "No account?"}{" "}
                <button
                  type="button"
                  className="font-semibold text-white hover:text-gray-200"
                  onClick={() => {
                    setModalType(modalType === "signup" ? "login" : "signup");
                    setMessage("");
                  }}
                >
                  {modalType === "signup" ? "Sign In" : "Sign Up"}
                </button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
