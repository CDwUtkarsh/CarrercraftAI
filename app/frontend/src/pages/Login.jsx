import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "@/App";
import { toast } from "sonner";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", loginData);
      const token = response.data.access_token;
      const user = { name: response.data.name, email: response.data.email };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const err = error?.response?.data?.detail;
      if (Array.isArray(err)) toast.error(err[0].msg);
      else toast.error(err || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/auth/signup", signupData);
      toast.success("Account created successfully!");
      const loginResponse = await axiosInstance.post("/auth/login", {
        email: signupData.email,
        password: signupData.password,
      });
      const token = loginResponse.data.access_token;
      const user = { name: loginResponse.data.name, email: loginResponse.data.email };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      navigate("/");
    } catch (error) {
      const err = error?.response?.data?.detail;
      if (Array.isArray(err)) toast.error(err[0].msg);
      else toast.error(err || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .login-root {
          min-height: 100vh;
          background: #080c10;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .login-bg-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 400px;
          background: radial-gradient(ellipse, rgba(99,235,218,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-bg-grid {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.02;
          background-image: linear-gradient(#63ebda 1px,transparent 1px),linear-gradient(90deg,#63ebda 1px,transparent 1px);
          background-size: 60px 60px;
        }
        .login-grid { position: relative; z-index: 10; width: 100%; max-width: 900px; display: grid; gap: 40px; align-items: center; }
        @media (min-width: 768px) { .login-grid { grid-template-columns: 1fr 1fr; } }
        .login-left { display: none; }
        @media (min-width: 768px) { .login-left { display: block; animation: fadeUp 0.6s ease both; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
        .login-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #63ebda, #2dd4bf);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(99,235,218,0.4);
        }
        .login-logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #fff; }
        .login-logo-text span { color: #63ebda; }
        .login-headline {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(32px, 4vw, 44px); color: #fff;
          line-height: 1.1; margin-bottom: 16px;
        }
        .login-headline-accent {
          background: linear-gradient(90deg, #63ebda, #fff 50%, #63ebda);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .login-desc { color: #8b949e; font-size: 15px; line-height: 1.65; margin-bottom: 28px; }
        .login-features { display: flex; flex-direction: column; gap: 10px; }
        .login-feature { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #8b949e; }
        .login-feature-check {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          background: rgba(99,235,218,0.12); border: 1px solid rgba(99,235,218,0.3);
          display: flex; align-items: center; justify-content: center;
        }
        .login-card {
          background: rgba(13,17,23,0.8);
          border: 1px solid rgba(99,235,218,0.2);
          border-radius: 24px; padding: 32px;
          backdrop-filter: blur(16px);
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .login-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: #fff; margin-bottom: 4px; }
        .login-card-sub { color: #8b949e; font-size: 13px; margin-bottom: 24px; }
        .login-tabs { display: flex; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 4px; margin-bottom: 24px; }
        .login-tab {
          flex: 1; padding: 9px; text-align: center; border-radius: 9px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          border: none; transition: all 0.2s ease;
        }
        .login-tab.active { background: #63ebda; color: #080c10; font-weight: 600; }
        .login-tab.inactive { background: transparent; color: #8b949e; }
        .login-tab.inactive:hover { color: #fff; }
        .login-field { margin-bottom: 16px; }
        .login-label { display: block; font-size: 11px; font-weight: 500; color: #8b949e; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; }
        .login-input {
          width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #f0f6fc; outline: none; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .login-input::placeholder { color: #484f58; }
        .login-input:focus { border-color: rgba(99,235,218,0.45); background: rgba(99,235,218,0.04); }
        .login-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          background: linear-gradient(135deg, #63ebda, #2dd4bf);
          color: #080c10; font-family: 'Syne', sans-serif;
          transition: all 0.2s ease; margin-top: 8px;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,235,218,0.35); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="login-root">
        <div className="login-bg-glow"/>
        <div className="login-bg-grid"/>

        <div className="login-grid">
          {/* Left panel */}
          <div className="login-left">
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#080c10" strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="2" fill="#080c10"/>
                </svg>
              </div>
              <div className="login-logo-text">Career<span>Craft</span></div>
            </div>

            <h1 className="login-headline">
              Your Career,<br/><span className="login-headline-accent">Reimagined</span>
            </h1>
            <p className="login-desc">
              Predict career success, validate your resume, and discover personalized
              job recommendations powered by AI and Machine Learning.
            </p>

            <div className="login-features">
              {['ML-powered career success prediction', 'NLP resume analysis & scoring', 'Personalized job recommendations', 'AI Career Advisor chatbot'].map((f, i) => (
                <div key={i} className="login-feature">
                  <div className="login-feature-check">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#63ebda" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <div className="login-card">
            <div className="login-card-title">Welcome back</div>
            <div className="login-card-sub">Sign in to continue your career journey</div>

            {/* Tabs */}
            <div className="login-tabs">
              <button className={`login-tab ${tab === 'login' ? 'active' : 'inactive'}`} onClick={() => setTab('login')}>Sign In</button>
              <button className={`login-tab ${tab === 'signup' ? 'active' : 'inactive'}`} onClick={() => setTab('signup')}>Sign Up</button>
            </div>

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="login-field">
                  <label className="login-label">Email</label>
                  <input type="email" placeholder="you@example.com" className="login-input"
                    value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} required/>
                </div>
                <div className="login-field">
                  <label className="login-label">Password</label>
                  <input type="password" placeholder="••••••••" className="login-input"
                    value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required/>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup}>
                <div className="login-field">
                  <label className="login-label">Full Name</label>
                  <input type="text" placeholder="John Doe" className="login-input"
                    value={signupData.name} onChange={e => setSignupData({...signupData, name: e.target.value})} required/>
                </div>
                <div className="login-field">
                  <label className="login-label">Email</label>
                  <input type="email" placeholder="you@example.com" className="login-input"
                    value={signupData.email} onChange={e => setSignupData({...signupData, email: e.target.value})} required/>
                </div>
                <div className="login-field">
                  <label className="login-label">Password</label>
                  <input type="password" placeholder="••••••••" className="login-input"
                    value={signupData.password} onChange={e => setSignupData({...signupData, password: e.target.value})} required/>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;