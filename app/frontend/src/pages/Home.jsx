import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, FileText, Briefcase, LayoutDashboard, CheckCircle, Target, Zap } from 'lucide-react';

const Home = ({ user }) => {
  const features = [
    { icon: '📈', title: 'Career Predictor', desc: 'ML-powered success forecasting based on your profile, skills, and market data.', href: '/career-predictor', tag: 'Machine Learning' },
    { icon: '📄', title: 'Resume Analyzer', desc: 'NLP-driven resume scoring with actionable feedback and real course suggestions.', href: '/resume-validator', tag: 'NLP' },
    { icon: '💼', title: 'Job Recommendations', desc: 'Personalized job matches and curated learning paths aligned to your goals.', href: '/recommendations', tag: 'AI Matching' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track your progress, skill gaps, and career trajectory with live insights.', href: '/dashboard', tag: 'Analytics' },
  ];

  const benefits = [
    'ML-powered career success predictions',
    'NLP-based resume analysis',
    'Personalized job recommendations',
    'Custom learning paths',
  ];
  const stats = [
    { value: '94%', label: 'Prediction Accuracy' },
    { value: '12k+', label: 'Careers Shaped' },
    { value: '200+', label: 'Job Categories' },
    { value: '4.9★', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-[#080c10] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#63ebda]/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-[#2dd4bf]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{backgroundImage:'linear-gradient(#63ebda 1px,transparent 1px),linear-gradient(90deg,#63ebda 1px,transparent 1px)', backgroundSize:'60px 60px'}}/>
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#63ebda]/10 border border-[#63ebda]/20 text-[#63ebda] text-sm font-medium mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[#63ebda] animate-pulse"/>
            AI-Powered Career Intelligence Platform
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 text-white leading-[1.05] mb-6 animate-fade-up-delay-1">
            Transform Your<br/>
            <span className="shimmer-text">Career Journey</span>
          </h1>

          <p className="text-[#8b949e] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up-delay-2">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Your intelligent career platform powered by
            Machine Learning and NLP to help you achieve professional success.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up-delay-3">
            <a href="/career-predictor"
              className="btn-primary px-8 py-3.5 rounded-xl font-display font-600 text-sm inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z"/></svg>
              Get Started
            </a>
            <a href="/dashboard"
              className="btn-ghost px-8 py-3.5 rounded-xl font-display font-600 text-sm inline-flex items-center gap-2">
              View Dashboard
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1L13 7L7 13M13 7H1"/></svg>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24 animate-fade-up-delay-4">
          {stats.map((s, i) => (
            <div key={i} className="glass card-hover rounded-2xl p-6 text-center">
              <div className="font-display text-3xl font-800 text-[#63ebda] mb-1">{s.value}</div>
              <div className="text-[#8b949e] text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-700 text-white mb-3">Powerful Features</h2>
            <p className="text-[#8b949e]">Everything you need to accelerate your career growth</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <a key={i} href={f.href}
                className="glass card-hover rounded-2xl p-6 block group">
                <div className="w-12 h-12 rounded-xl bg-[#63ebda]/10 border border-[#63ebda]/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#63ebda]/10 text-[#63ebda] text-[10px] font-medium tracking-wide uppercase mb-3">
                  {f.tag}
                </div>
                <h3 className="font-display font-700 text-white text-lg mb-2">{f.title}</h3>
                <p className="text-[#8b949e] text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[#63ebda] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1L13 7L7 13M13 7H1"/></svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
