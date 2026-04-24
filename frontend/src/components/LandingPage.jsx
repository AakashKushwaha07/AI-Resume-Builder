import React, { useState } from "react";
import {
  Brain,
  FileText,
  Target,
  CheckCircle,
  TrendingUp,
  Upload,
  Mail,
  Lock,
  User,
  X,
  Sparkles,
  ShieldCheck,
  Clock,
  BadgeCheck,
} from "lucide-react";

const LandingPage = ({ onLogin }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("login"); // login | signup
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", email: "", password: "" });
    setMessage("");
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        modalType === "signup"
          ? "http://127.0.0.1:5000/api/auth/signup"
          : "http://127.0.0.1:5000/api/auth/login";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Brain className="text-blue-600" />
            AI Resume Pro
          </div>
          <button
            onClick={() => openModal("login")}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-xs font-semibold text-blue-700 mb-5">
            <Sparkles className="w-4" /> ATS + Job Match + Career Growth
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Build job-ready resumes with{" "}
            <span className="text-blue-600">AI</span>
          </h1>

          <p className="mt-4 text-gray-600">
            Upload your resume, match it with job descriptions, and get instant
            AI-powered feedback to improve ATS compatibility.
          </p>

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => openModal("signup")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get Started
            </button>
            <button className="px-6 py-3 border rounded-lg text-sm font-medium bg-white hover:bg-gray-100 transition">
              View Demo
            </button>
          </div>

          {/* Quick highlights */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MiniStat icon={<Clock className="w-4" />} title="Fast" desc="Results in seconds" />
            <MiniStat icon={<ShieldCheck className="w-4" />} title="Safe" desc="Privacy-first" />
            <MiniStat icon={<BadgeCheck className="w-4" />} title="ATS Ready" desc="Hiring optimized" />
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-blue-600" />
            <h3 className="font-semibold">AI Resume Analysis</h3>
          </div>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <CheckCircle className="text-green-600 w-4" /> ATS compatibility
              score
            </li>
            <li className="flex gap-2">
              <CheckCircle className="text-green-600 w-4" /> Skill gap detection
            </li>
            <li className="flex gap-2">
              <CheckCircle className="text-green-600 w-4" /> Job match insights
            </li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <Feature
            icon={<Target />}
            title="Resume–Job Matching"
            desc="See how well your resume matches a job description."
          />
          <Feature
            icon={<TrendingUp />}
            title="Career Insights"
            desc="Discover next career steps and missing skills."
          />
          <Feature
            icon={<Upload />}
            title="Instant Analysis"
            desc="Upload PDF/DOCX resumes for immediate feedback."
          />
        </div>
      </section>

      {/* ✅ BENEFITS (replaces Pricing) */}
      <section className="py-20 border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Benefits of Using AI Resume Pro</h2>
            <p className="text-gray-600 mt-3">
              Built for freshers and professionals to pass ATS filters, improve
              job relevance, and grow faster.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BenefitCard
              icon={<Brain className="text-blue-600" />}
              title="Smarter than keyword matching"
              desc="Understands skills contextually and highlights what recruiters actually care about."
            />
            <BenefitCard
              icon={<Target className="text-blue-600" />}
              title="Job-specific resume improvements"
              desc="Shows missing skills, key gaps, and which parts of your resume to improve for that JD."
            />
            <BenefitCard
              icon={<FileText className="text-blue-600" />}
              title="ATS-friendly feedback"
              desc="Improves your resume structure so it performs better in real ATS systems."
            />
            <BenefitCard
              icon={<TrendingUp className="text-blue-600" />}
              title="Career path guidance"
              desc="Suggests roles you can target next and the skills to learn to reach them."
            />
            <BenefitCard
              icon={<Clock className="text-blue-600" />}
              title="Save hours"
              desc="No manual rewriting — analyze multiple job descriptions quickly and confidently."
            />
            <BenefitCard
              icon={<ShieldCheck className="text-blue-600" />}
              title="Privacy-first"
              desc="Your data stays secure and is only used to generate your results."
            />
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => openModal("signup")}
              className="px-7 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Start Using AI Resume Pro
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Create an account to save your results and access the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        © 2025 AI Resume Pro. All rights reserved.
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {modalType === "signup" ? "Create Account" : "Sign In"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalType === "signup" && (
                <Input
                  icon={<User />}
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                />
              )}

              <Input
                icon={<Mail />}
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />

              <Input
                icon={<Lock />}
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />

              {message && <p className="text-sm text-red-500">{message}</p>}

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {loading
                  ? "Please wait..."
                  : modalType === "signup"
                  ? "Sign Up"
                  : "Sign In"}
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              {modalType === "signup" ? "Already have an account?" : "No account?"}{" "}
              <button
                className="text-blue-600 font-medium hover:underline"
                onClick={() =>
                  setModalType(modalType === "signup" ? "login" : "signup")
                }
              >
                {modalType === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* Reusable components */

const Feature = ({ icon, title, desc }) => (
  <div className="p-6 border rounded-xl bg-gray-50">
    <div className="text-blue-600 mb-3">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm text-gray-600 mt-2">{desc}</p>
  </div>
);

const BenefitCard = ({ icon, title, desc }) => (
  <div className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-lg bg-blue-50 border flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const MiniStat = ({ icon, title, desc }) => (
  <div className="p-4 border rounded-xl bg-white shadow-sm">
    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
      {icon} {title}
    </div>
    <div className="text-xs text-gray-500 mt-1">{desc}</div>
  </div>
);

const Input = ({ icon, ...props }) => (
  <div className="flex items-center border rounded-lg px-3 bg-white">
    <span className="text-gray-400">{icon}</span>
    <input {...props} required className="w-full py-2 px-2 text-sm outline-none" />
  </div>
);

export default LandingPage;
