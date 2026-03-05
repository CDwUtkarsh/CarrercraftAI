import React, { useState, useEffect } from 'react';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { Briefcase, BookOpen, Target, MapPin, DollarSign, Clock, X } from 'lucide-react';

const JobRecommendations = () => {
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [targetRole, setTargetRole] = useState('software_engineer');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [learningPath, setLearningPath] = useState(null);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────
  useEffect(() => {
    const loadFromResume = () => {
      try {
        const raw = localStorage.getItem('last_resume_analysis');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed?.skills?.length > 0) {
          const normalized = parsed.skills.map(s => s.toLowerCase().trim());
          setSkills(prev => Array.from(new Set([...normalized, ...prev])));
        }
      } catch (e) {}
    };
    loadFromResume();
    window.addEventListener('resumeAnalysisUpdated', loadFromResume);
    return () => window.removeEventListener('resumeAnalysisUpdated', loadFromResume);
  }, []);

  useEffect(() => {
    if (skills.length > 0 && !autoLoaded) {
      setAutoLoaded(true);
      handleGetJobs();
      handleGetLearningPath();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skills]);

  const convertToINR = (salary) => {
    if (!salary || salary === "Not disclosed") return "Not disclosed";
    try {
      const numbers = String(salary).match(/[\d.]+/g);
      if (!numbers) return salary;
      const firstNum = parseFloat(numbers[0]);
      const isAlreadyINR = firstNum > 10000;
      let inrValues;
      if (isAlreadyINR) inrValues = numbers.map(num => parseFloat(num).toLocaleString("en-IN"));
      else { const rate = 83; inrValues = numbers.map(num => (parseFloat(num) * rate).toLocaleString("en-IN")); }
      if (inrValues.length === 2) return `₹ ${inrValues[0]} - ₹ ${inrValues[1]}`;
      return `₹ ${inrValues[0]}`;
    } catch { return salary; }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim().toLowerCase())) {
      setSkills([...skills, skillInput.trim().toLowerCase()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => setSkills(skills.filter(s => s !== skillToRemove));

  const handleGetJobs = async () => {
    if (skills.length === 0) { toast.error('Please add at least one skill'); return; }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/recommend_jobs', { skills });
      setJobs(response.data.jobs || []);
      toast.success('Jobs loaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load jobs');
    } finally { setLoading(false); }
  };

  const handleGetLearningPath = async () => {
    if (skills.length === 0) { toast.error('Please add at least one skill'); return; }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/learning_path', { skills, target_role: targetRole });
      setLearningPath(response.data);
      toast.success('Learning path generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate learning path');
    } finally { setLoading(false); }
  };

  const roles = ['software_engineer','data_scientist','frontend_developer','devops_engineer','ml_engineer'];

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .jr-root { min-height:100vh; background:#080c10; padding:100px 24px 64px; position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }
        .jr-glow { position:absolute; top:0; left:50%; transform:translateX(-50%); width:800px; height:400px; background:radial-gradient(ellipse,rgba(99,235,218,0.07) 0%,transparent 70%); pointer-events:none; }
        .jr-grid-bg { position:absolute; inset:0; opacity:0.02; background-image:linear-gradient(#63ebda 1px,transparent 1px),linear-gradient(90deg,#63ebda 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
        .jr-inner { max-width:1280px; margin:0 auto; position:relative; z-index:10; }
        .jr-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); color:#63ebda; font-size:12px; font-weight:500; margin-bottom:14px; }
        .jr-badge-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; animation:jrPulse 2s infinite; }
        @keyframes jrPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .jr-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(28px,4vw,42px); color:#fff; margin-bottom:8px; }
        .jr-accent { background:linear-gradient(90deg,#63ebda,#fff 50%,#63ebda); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:jrShimmer 4s linear infinite; }
        @keyframes jrShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .jr-sub { color:#8b949e; font-size:15px; margin-bottom:36px; }
        .jr-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px; margin-bottom:20px; transition:border-color 0.3s; }
        .jr-card-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:#fff; margin-bottom:4px; }
        .jr-card-sub { color:#8b949e; font-size:13px; margin-bottom:18px; }
        .jr-skill-row { display:flex; gap:10px; margin-bottom:14px; }
        .jr-skill-input { flex:1; padding:11px 14px; border-radius:11px; font-size:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); color:#f0f6fc; outline:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .jr-skill-input:focus { border-color:rgba(99,235,218,0.4); background:rgba(99,235,218,0.03); }
        .jr-skill-input::placeholder { color:#484f58; }
        .jr-add-btn { padding:11px 20px; border-radius:11px; border:none; background:rgba(99,235,218,0.12); border:1px solid rgba(99,235,218,0.25); color:#63ebda; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Syne',sans-serif; white-space:nowrap; }
        .jr-add-btn:hover { background:rgba(99,235,218,0.2); }
        .jr-skills-list { display:flex; flex-wrap:wrap; gap:8px; }
        .jr-skill-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:9px; background:rgba(99,235,218,0.08); border:1px solid rgba(99,235,218,0.18); color:#63ebda; font-size:12px; font-weight:500; }
        .jr-skill-remove { display:flex; align-items:center; cursor:pointer; color:rgba(99,235,218,0.5); transition:color 0.2s; background:none; border:none; padding:0; }
        .jr-skill-remove:hover { color:#f87171; }
        .jr-tabs { display:flex; background:rgba(255,255,255,0.04); border-radius:14px; padding:4px; margin-bottom:24px; gap:4px; }
        .jr-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:11px; border-radius:11px; font-size:13px; font-weight:500; cursor:pointer; border:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .jr-tab.active { background:#63ebda; color:#080c10; font-weight:600; }
        .jr-tab.inactive { background:transparent; color:#8b949e; }
        .jr-tab.inactive:hover { color:#fff; background:rgba(255,255,255,0.04); }
        .jr-fetch-btn { display:block; margin:0 auto 28px; padding:12px 32px; border-radius:12px; border:none; font-size:14px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#63ebda,#2dd4bf); color:#080c10; font-family:'Syne',sans-serif; transition:all 0.2s; }
        .jr-fetch-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,235,218,0.35); }
        .jr-fetch-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .jr-jobs-grid { display:grid; gap:16px; }
        @media(min-width:768px){ .jr-jobs-grid{grid-template-columns:1fr 1fr;} }
        @media(min-width:1024px){ .jr-jobs-grid{grid-template-columns:1fr 1fr 1fr;} }
        .jr-job { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:20px; cursor:pointer; transition:all 0.3s; text-decoration:none; display:block; }
        .jr-job:hover { border-color:rgba(99,235,218,0.25); transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.35); }
        .jr-job-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:14px; }
        .jr-job-title { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; color:#fff; margin-bottom:3px; }
        .jr-job-company { font-size:13px; color:#8b949e; }
        .jr-match { padding:4px 10px; border-radius:999px; background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.2); color:#34d399; font-size:11px; font-weight:600; white-space:nowrap; flex-shrink:0; }
        .jr-job-meta { display:flex; align-items:center; gap:6px; font-size:12px; color:#8b949e; margin-bottom:8px; }
        .jr-job-skills { font-size:12px; color:#8b949e; margin-bottom:14px; line-height:1.5; }
        .jr-apply-btn { width:100%; padding:9px; border-radius:10px; border:1px solid rgba(99,235,218,0.25); background:rgba(99,235,218,0.06); color:#63ebda; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Syne',sans-serif; }
        .jr-apply-btn:hover { background:rgba(99,235,218,0.12); border-color:rgba(99,235,218,0.4); }
        .jr-roles-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin-bottom:16px; }
        @media(min-width:768px){ .jr-roles-grid{grid-template-columns:repeat(3,1fr);} }
        .jr-role-btn { padding:11px; border-radius:11px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.02); color:#8b949e; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; text-align:center; }
        .jr-role-btn.active { background:rgba(99,235,218,0.1); border-color:rgba(99,235,218,0.3); color:#63ebda; font-weight:600; }
        .jr-role-btn:hover:not(.active) { border-color:rgba(255,255,255,0.2); color:#fff; }
        .jr-gen-btn { width:100%; padding:13px; border-radius:12px; border:none; font-size:14px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#63ebda,#2dd4bf); color:#080c10; font-family:'Syne',sans-serif; transition:all 0.2s; }
        .jr-gen-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,235,218,0.35); }
        .jr-gen-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .jr-roadmap { margin-bottom:20px; }
        .jr-roadmap-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:#fff; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
        .jr-roadmap-step { display:flex; gap:14px; margin-bottom:12px; align-items:flex-start; }
        .jr-step-circle { width:30px; height:30px; border-radius:50%; background:rgba(99,235,218,0.12); border:1px solid rgba(99,235,218,0.3); color:#63ebda; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:2px; }
        .jr-step-text { font-size:13px; color:#8b949e; line-height:1.55; padding-top:5px; }
        .jr-gap-section { margin-bottom:14px; }
        .jr-gap-label { font-size:11px; font-weight:500; color:#8b949e; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
        .jr-skill-tag { display:inline-flex; padding:4px 10px; border-radius:7px; background:rgba(99,235,218,0.08); border:1px solid rgba(99,235,218,0.15); color:#63ebda; font-size:12px; font-weight:500; margin:3px; }
        .jr-gap-tag { display:inline-flex; padding:4px 10px; border-radius:7px; background:rgba(251,191,36,0.08); border:1px solid rgba(251,191,36,0.2); color:#fbbf24; font-size:12px; font-weight:500; margin:3px; }
        .jr-timeline { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; background:rgba(99,235,218,0.05); border:1px solid rgba(99,235,218,0.12); margin-top:14px; }
        .jr-timeline-text { font-size:13px; color:#f0f6fc; font-weight:500; }
        .jr-courses-grid { display:grid; gap:14px; }
        @media(min-width:768px){ .jr-courses-grid{grid-template-columns:1fr 1fr;} }
        @media(min-width:1024px){ .jr-courses-grid{grid-template-columns:1fr 1fr 1fr;} }
        .jr-course { border-radius:16px; overflow:hidden; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); text-decoration:none; display:block; transition:all 0.3s; }
        .jr-course:hover { border-color:rgba(99,235,218,0.25); transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.35); }
        .jr-course-img { width:100%; height:140px; object-fit:cover; background:#161b22; transition:transform 0.3s; }
        .jr-course:hover .jr-course-img { transform:scale(1.05); }
        .jr-course-body { padding:14px; }
        .jr-course-title { font-size:13px; font-weight:600; color:#f0f6fc; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.45; transition:color 0.2s; }
        .jr-course:hover .jr-course-title { color:#63ebda; }
        .jr-course-footer { display:flex; justify-content:space-between; align-items:center; }
        .jr-course-platform { font-size:12px; color:#8b949e; font-weight:500; }
        .jr-course-price { font-size:13px; font-weight:700; color:#34d399; }
        .jr-course-rel { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
        .jr-rel-badge { font-size:11px; padding:3px 8px; border-radius:999px; background:rgba(167,139,250,0.1); color:#a78bfa; border:1px solid rgba(167,139,250,0.2); }
        .jr-dur { display:flex; align-items:center; gap:4px; font-size:11px; color:#8b949e; margin-top:6px; }
        .jr-empty-jobs { text-align:center; padding:60px 24px; color:#484f58; font-size:14px; }
      `}</style>

      <div className="jr-root">
        <div className="jr-glow"/><div className="jr-grid-bg"/>
        <div className="jr-inner" data-testid="job-recommendations-page">

          {/* Header */}
          <div className="jr-badge"><span className="jr-badge-dot"/>AI-Matched Opportunities</div>
          <h1 className="jr-title">Jobs & <span className="jr-accent">Learning</span></h1>
          <p className="jr-sub">Discover personalized job recommendations and learning paths</p>

          {/* Skills Input */}
          <div className="jr-card" data-testid="skills-input-card">
            <div className="jr-card-title">Your Skills</div>
            <p className="jr-card-sub">Add your current skills to get personalized recommendations</p>
            <div className="jr-skill-row">
              <input className="jr-skill-input" placeholder="e.g., python, javascript, react"
                value={skillInput} data-testid="skill-input"
                onChange={e=>setSkillInput(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addSkill()}/>
              <button className="jr-add-btn" onClick={addSkill} data-testid="add-skill-btn">+ Add</button>
            </div>
            {skills.length > 0 && (
              <div className="jr-skills-list" data-testid="skills-list">
                {skills.map((skill,idx)=>(
                  <span key={idx} className="jr-skill-chip" data-testid={`skill-badge-${idx}`}>
                    {skill}
                    <button className="jr-skill-remove" onClick={()=>removeSkill(skill)}>
                      <X size={11}/>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Main Tabs */}
          <div className="jr-tabs">
            <button className={`jr-tab ${activeTab==='jobs'?'active':'inactive'}`} onClick={()=>setActiveTab('jobs')} data-testid="jobs-tab">
              <Briefcase size={14}/> Job Recommendations
            </button>
            <button className={`jr-tab ${activeTab==='learning'?'active':'inactive'}`} onClick={()=>setActiveTab('learning')} data-testid="learning-tab">
              <BookOpen size={14}/> Learning Path
            </button>
          </div>

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div>
              <button className="jr-fetch-btn" onClick={handleGetJobs} disabled={loading||skills.length===0} data-testid="get-jobs-btn">
                {loading ? 'Loading...' : '✦ Get Job Recommendations'}
              </button>

              {jobs.length > 0 ? (
                <div className="jr-jobs-grid" data-testid="jobs-grid">
                  {jobs.map(job=>(
                    <div key={job.id} className="jr-job" onClick={()=>window.open(job.apply_link,'_blank')} data-testid={`job-card-${job.id}`}>
                      <div className="jr-job-top">
                        <div>
                          <div className="jr-job-title">{job.title}</div>
                          <div className="jr-job-company">{job.company}</div>
                        </div>
                        <span className="jr-match" data-testid={`job-match-${job.id}`}>{job.match_score}% match</span>
                      </div>
                      <div className="jr-job-meta"><MapPin size={12}/>{job.location}</div>
                      <div className="jr-job-meta"><DollarSign size={12}/>💰 {convertToINR(job.salary)}</div>
                      <div className="jr-job-skills">
                        <span style={{color:'#484f58',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.7px'}}>Skills: </span>
                        {job.skills}
                      </div>
                      <button className="jr-apply-btn" onClick={e=>{e.stopPropagation();window.open(job.apply_link,'_blank')}}>
                        Apply Now →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="jr-empty-jobs">Add skills and click "Get Job Recommendations" to see matching opportunities</div>
              )}
            </div>
          )}

          {/* Learning Tab */}
          {activeTab === 'learning' && (
            <div>
              <div className="jr-card">
                <div className="jr-card-title" style={{display:'flex',alignItems:'center',gap:'8px'}}><Target size={16} color="#63ebda"/>Target Role</div>
                <p className="jr-card-sub">Select your desired career path</p>
                <div className="jr-roles-grid">
                  {roles.map(role=>(
                    <button key={role} className={`jr-role-btn ${targetRole===role?'active':''}`}
                      onClick={()=>setTargetRole(role)} data-testid={`role-${role}`}>
                      {role.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                    </button>
                  ))}
                </div>
                <button className="jr-gen-btn" onClick={handleGetLearningPath} disabled={loading||skills.length===0} data-testid="generate-path-btn">
                  {loading ? 'Generating...' : '✦ Generate Learning Path'}
                </button>
              </div>

              {learningPath && (
                <div data-testid="learning-path-result">
                  {/* Roadmap */}
                  {learningPath?.roadmap?.length > 0 && (
                    <div className="jr-card jr-roadmap">
                      <div className="jr-roadmap-title">🗺️ AI Career Roadmap</div>
                      {learningPath.roadmap.map((step,index)=>(
                        <div key={index} className="jr-roadmap-step">
                          <div className="jr-step-circle">{index+1}</div>
                          <div className="jr-step-text">{step}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Gap Analysis */}
                  <div className="jr-card" style={{marginBottom:'20px'}}>
                    <div className="jr-card-title" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'16px'}}>
                      <Target size={15} color="#63ebda"/> Skill Gap Analysis
                    </div>
                    <div className="jr-gap-section">
                      <div className="jr-gap-label">Required Skills</div>
                      <div>
                        {learningPath.required_skills?.length > 0
                          ? learningPath.required_skills.map((s,i)=><span key={i} className="jr-skill-tag" data-testid={`required-skill-${i}`}>{s}</span>)
                          : <span style={{color:'#484f58',fontSize:'13px'}}>No data available</span>}
                      </div>
                    </div>
                    <div className="jr-gap-section">
                      <div className="jr-gap-label">Skills to Learn</div>
                      <div>
                        {learningPath.skill_gap?.length > 0
                          ? learningPath.skill_gap.map((s,i)=><span key={i} className="jr-gap-tag" data-testid={`gap-skill-${i}`}>{s}</span>)
                          : <span style={{color:'#34d399',fontSize:'13px'}}>✓ All required skills covered!</span>}
                      </div>
                    </div>
                    <div className="jr-timeline">
                      <Clock size={15} color="#63ebda"/>
                      <span className="jr-timeline-text">Estimated Timeline: <strong style={{color:'#63ebda'}}>{learningPath.estimated_timeline||'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* Courses */}
                  {learningPath.recommended_courses?.length > 0 && (
                    <div>
                      <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:'700',fontSize:'18px',color:'#fff',marginBottom:'16px'}}>
                        Recommended Courses
                      </h3>
                      <div className="jr-courses-grid" data-testid="courses-grid">
                        {learningPath.recommended_courses.map((course,index)=>(
                          <a key={index} href={course.link||'#'} target="_blank" rel="noopener noreferrer"
                            className="jr-course" data-testid={`course-card-${index}`}>
                            <div style={{overflow:'hidden',height:'140px',background:'#161b22'}}>
                              <img className="jr-course-img"
                                src={course.thumbnail||'https://via.placeholder.com/400x225?text=Course'} alt={course.title}
                                onError={e=>{try{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/400x225?text=Course';}catch(_){}}}/>
                            </div>
                            <div className="jr-course-body">
                              {course.relevance_score && (
                                <div className="jr-course-rel">
                                  <span/>
                                  <span className="jr-rel-badge">{course.relevance_score}% relevant</span>
                                </div>
                              )}
                              <div className="jr-course-title">{course.title}</div>
                              <div className="jr-course-footer">
                                <span className="jr-course-platform">{course.platform}</span>
                                <span className="jr-course-price">{course.price}</span>
                              </div>
                              {course.duration && (
                                <div className="jr-dur"><Clock size={10}/>{course.duration}</div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobRecommendations;