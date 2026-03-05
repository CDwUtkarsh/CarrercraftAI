import React, { useState } from 'react';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { TrendingUp, Award, Lightbulb } from 'lucide-react';

const CareerPredictor = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    age: 28,
    experience_years: 5,
    education_level: 2,
    num_skills: 8,
    location_tier: 1,
    job_changes: 2,
  });

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/predict', formData);
      setResult(response.data);
      toast.success('Prediction generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const getSuccessLevel = (prob) => {
    if (prob >= 80) return { label: 'Excellent', color: '#34d399' };
    if (prob >= 60) return { label: 'Good', color: '#63ebda' };
    if (prob >= 40) return { label: 'Moderate', color: '#fbbf24' };
    return { label: 'Developing', color: '#f87171' };
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .cp-root { min-height:100vh; background:#080c10; padding:100px 24px 64px; position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }
        .cp-glow1 { position:absolute; top:0; left:50%; transform:translateX(-50%); width:800px; height:400px; background:radial-gradient(ellipse,rgba(99,235,218,0.07) 0%,transparent 70%); pointer-events:none; }
        .cp-glow2 { position:absolute; bottom:0; right:0; width:400px; height:400px; background:radial-gradient(ellipse,rgba(167,139,250,0.05) 0%,transparent 70%); pointer-events:none; }
        .cp-grid-bg { position:absolute; inset:0; opacity:0.02; background-image:linear-gradient(#63ebda 1px,transparent 1px),linear-gradient(90deg,#63ebda 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
        .cp-inner { max-width:1200px; margin:0 auto; position:relative; z-index:10; }
        .cp-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); color:#63ebda; font-size:12px; font-weight:500; margin-bottom:14px; }
        .cp-badge-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; animation:cpPulse 2s infinite; }
        @keyframes cpPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .cp-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(28px,4vw,42px); color:#fff; margin-bottom:8px; }
        .cp-title-accent { background:linear-gradient(90deg,#63ebda,#fff 50%,#63ebda); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:cpShimmer 4s linear infinite; }
        @keyframes cpShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .cp-sub { color:#8b949e; font-size:15px; margin-bottom:40px; }
        .cp-layout { display:grid; gap:20px; }
        @media(min-width:1024px){ .cp-layout{grid-template-columns:1fr 1fr;} }
        .cp-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:28px; transition:border-color 0.3s; }
        .cp-card:hover { border-color:rgba(99,235,218,0.15); }
        .cp-card-header { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
        .cp-card-icon { width:36px; height:36px; border-radius:10px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); display:flex; align-items:center; justify-content:center; }
        .cp-card-title { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:#fff; }
        .cp-card-sub { color:#8b949e; font-size:13px; margin-bottom:24px; }
        .cp-field-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
        .cp-field { margin-bottom:16px; }
        .cp-label { display:block; font-size:11px; font-weight:500; color:#8b949e; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:7px; }
        .cp-input { width:100%; padding:11px 14px; border-radius:11px; font-size:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); color:#f0f6fc; outline:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .cp-input:focus { border-color:rgba(99,235,218,0.4); background:rgba(99,235,218,0.03); }
        .cp-input::-webkit-inner-spin-button,.cp-input::-webkit-outer-spin-button{opacity:0.4;}
        .cp-select { width:100%; padding:11px 14px; border-radius:11px; font-size:14px; background:#0d1117; border:1px solid rgba(255,255,255,0.09); color:#f0f6fc; outline:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4L6 8L10 4' stroke='%238b949e' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; }
        .cp-select:focus { border-color:rgba(99,235,218,0.4); }
        .cp-select option { background:#0d1117; color:#f0f6fc; }
        .cp-btn { width:100%; padding:13px; border-radius:12px; border:none; font-size:14px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#63ebda,#2dd4bf); color:#080c10; font-family:'Syne',sans-serif; transition:all 0.2s; margin-top:4px; }
        .cp-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,235,218,0.35); }
        .cp-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .cp-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; }
        .cp-empty-icon { width:80px; height:80px; border-radius:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .cp-empty-text { color:#484f58; font-size:15px; text-align:center; max-width:260px; line-height:1.6; }
        .cp-result-score { text-align:center; padding:28px; border-radius:16px; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); margin-bottom:20px; }
        .cp-score-num { font-family:'Syne',sans-serif; font-weight:800; font-size:72px; line-height:1; margin-bottom:6px; }
        .cp-score-label { font-size:15px; color:#8b949e; margin-bottom:16px; }
        .cp-progress-bg { height:8px; background:rgba(255,255,255,0.06); border-radius:999px; overflow:hidden; }
        .cp-progress-fill { height:100%; border-radius:999px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); background:linear-gradient(90deg,#63ebda,#2dd4bf); }
        .cp-section-title { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:#f0f6fc; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .cp-factor { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:11px; background:rgba(99,235,218,0.05); border:1px solid rgba(99,235,218,0.1); margin-bottom:8px; }
        .cp-factor-num { width:24px; height:24px; border-radius:7px; background:rgba(99,235,218,0.15); color:#63ebda; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .cp-factor-text { color:#f0f6fc; font-size:13px; font-weight:500; text-transform:capitalize; }
        .cp-rec { display:flex; align-items:flex-start; gap:10px; padding:11px 14px; border-radius:11px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); margin-bottom:8px; }
        .cp-rec-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; flex-shrink:0; margin-top:6px; }
        .cp-rec-text { color:#8b949e; font-size:13px; line-height:1.55; }
      `}</style>

      <div className="cp-root">
        <div className="cp-glow1"/><div className="cp-glow2"/><div className="cp-grid-bg"/>

        <div className="cp-inner" data-testid="career-predictor-page">
          {/* Header */}
          <div className="cp-badge"><span className="cp-badge-dot"/>ML-Powered Prediction</div>
          <h1 className="cp-title">Career Success <span className="cp-title-accent">Predictor</span></h1>
          <p className="cp-sub">Enter your profile details to predict your career success probability using our ML model</p>

          <div className="cp-layout">
            {/* Form Card */}
            <div className="cp-card" data-testid="prediction-form-card">
              <div className="cp-card-header">
                <div className="cp-card-icon"><TrendingUp size={16} color="#63ebda"/></div>
                <span className="cp-card-title">Your Profile</span>
              </div>
              <p className="cp-card-sub">Fill in your career details</p>

              <form onSubmit={handleSubmit}>
                <div className="cp-field-row">
                  <div>
                    <label className="cp-label">Age</label>
                    <input type="number" className="cp-input" value={formData.age} min="18" max="70" required
                      data-testid="input-age"
                      onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}/>
                  </div>
                  <div>
                    <label className="cp-label">Experience (years)</label>
                    <input type="number" className="cp-input" value={formData.experience_years} min="0" max="50" required
                      data-testid="input-experience"
                      onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value)})}/>
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Education Level</label>
                  <select className="cp-select" value={formData.education_level} data-testid="input-education"
                    onChange={e => setFormData({...formData, education_level: parseInt(e.target.value)})}>
                    <option value="1">High School</option>
                    <option value="2">Bachelor's Degree</option>
                    <option value="3">Master's Degree</option>
                    <option value="4">PhD</option>
                  </select>
                </div>

                <div className="cp-field-row">
                  <div>
                    <label className="cp-label">Number of Skills</label>
                    <input type="number" className="cp-input" value={formData.num_skills} min="1" max="30" required
                      data-testid="input-skills"
                      onChange={e => setFormData({...formData, num_skills: parseInt(e.target.value)})}/>
                  </div>
                  <div>
                    <label className="cp-label">Location Tier</label>
                    <select className="cp-select" value={formData.location_tier} data-testid="input-location"
                      onChange={e => setFormData({...formData, location_tier: parseInt(e.target.value)})}>
                      <option value="1">Tier 1 (Major City)</option>
                      <option value="2">Tier 2 (Mid-size City)</option>
                      <option value="3">Tier 3 (Small City)</option>
                    </select>
                  </div>
                </div>

                <div className="cp-field">
                  <label className="cp-label">Job Changes</label>
                  <input type="number" className="cp-input" value={formData.job_changes} min="0" max="20" required
                    data-testid="input-job-changes"
                    onChange={e => setFormData({...formData, job_changes: parseInt(e.target.value)})}/>
                </div>

                <button type="submit" className="cp-btn" disabled={loading} data-testid="predict-btn">
                  {loading ? 'Predicting...' : '✦ Predict Success'}
                </button>
              </form>
            </div>

            {/* Results Panel */}
            <div>
              {result ? (
                <div className="cp-card" data-testid="result-card">
                  <div className="cp-card-header">
                    <div className="cp-card-icon"><Award size={16} color="#63ebda"/></div>
                    <span className="cp-card-title">Success Prediction</span>
                  </div>
                  <p className="cp-card-sub">Your ML-generated career analysis</p>

                  {/* Score */}
                  <div className="cp-result-score">
                    <div className="cp-score-num" style={{color: getSuccessLevel(result.success_probability).color}} data-testid="success-probability">
                      {result.success_probability}%
                    </div>
                    <div className="cp-score-label">
                      <span style={{color: getSuccessLevel(result.success_probability).color, fontWeight:600}}>
                        {getSuccessLevel(result.success_probability).label}
                      </span> Potential
                    </div>
                    <div className="cp-progress-bg" data-testid="success-progress">
                      <div className="cp-progress-fill" style={{
                        width:`${result.success_probability}%`,
                        background:`linear-gradient(90deg, ${getSuccessLevel(result.success_probability).color}, #2dd4bf)`
                      }}/>
                    </div>
                  </div>

                  {/* Top Factors */}
                  {result.top_factors?.length > 0 && (
                    <div style={{marginBottom:'20px'}}>
                      <div className="cp-section-title">
                        <TrendingUp size={14} color="#63ebda"/> Top Influencing Factors
                      </div>
                      {result.top_factors.map((factor, idx) => (
                        <div key={idx} className="cp-factor" data-testid={`factor-${idx}`}>
                          <div className="cp-factor-num">{idx+1}</div>
                          <span className="cp-factor-text">{factor.replace(/_/g,' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations?.length > 0 && (
                    <div>
                      <div className="cp-section-title">
                        <Lightbulb size={14} color="#fbbf24"/> Recommendations
                      </div>
                      {result.recommendations.map((rec, idx) => (
                        <div key={idx} className="cp-rec" data-testid={`recommendation-${idx}`}>
                          <div className="cp-rec-dot"/>
                          <span className="cp-rec-text">{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="cp-card cp-empty" style={{minHeight:'480px'}}>
                  <div className="cp-empty-icon">
                    <TrendingUp size={32} color="#484f58"/>
                  </div>
                  <p className="cp-empty-text">Fill out the form to see your career success prediction</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerPredictor;