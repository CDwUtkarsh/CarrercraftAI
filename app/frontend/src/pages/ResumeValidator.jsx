import React, { useState } from 'react';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Upload } from 'lucide-react';

const ResumeValidator = () => {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text');
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) { toast.error('Please select a PDF file'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleAnalyze = async () => {
    if (inputMode === 'text' && !resumeText.trim()) { toast.error('Please enter your resume text'); return; }
    if (inputMode === 'file' && !selectedFile) { toast.error('Please select a PDF file'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (inputMode === 'text') formData.append('resume_text', resumeText);
      else formData.append('file', selectedFile);
      const response = await axiosInstance.post('/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      try {
        localStorage.setItem('last_resume_analysis', JSON.stringify(response.data));
        window.dispatchEvent(new Event('resumeAnalysisUpdated'));
      } catch (e) {}
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#63ebda';
    if (score >= 40) return '#fbbf24';
    return '#f87171';
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .rv-root { min-height:100vh; background:#080c10; padding:100px 24px 64px; position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }
        .rv-glow { position:absolute; top:0; left:50%; transform:translateX(-50%); width:800px; height:400px; background:radial-gradient(ellipse,rgba(99,235,218,0.07) 0%,transparent 70%); pointer-events:none; }
        .rv-grid-bg { position:absolute; inset:0; opacity:0.02; background-image:linear-gradient(#63ebda 1px,transparent 1px),linear-gradient(90deg,#63ebda 1px,transparent 1px); background-size:60px 60px; pointer-events:none; }
        .rv-inner { max-width:1200px; margin:0 auto; position:relative; z-index:10; }
        .rv-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); color:#63ebda; font-size:12px; font-weight:500; margin-bottom:14px; }
        .rv-badge-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; animation:rvPulse 2s infinite; }
        @keyframes rvPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .rv-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(28px,4vw,42px); color:#fff; margin-bottom:8px; }
        .rv-accent { background:linear-gradient(90deg,#63ebda,#fff 50%,#63ebda); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:rvShimmer 4s linear infinite; }
        @keyframes rvShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .rv-sub { color:#8b949e; font-size:15px; margin-bottom:40px; }
        .rv-layout { display:grid; gap:20px; }
        @media(min-width:1024px){ .rv-layout{grid-template-columns:1fr 1fr;} }
        .rv-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:28px; transition:border-color 0.3s; }
        .rv-card-header { display:flex; align-items:center; gap:10px; margin-bottom:5px; }
        .rv-card-icon { width:36px; height:36px; border-radius:10px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rv-card-title { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:#fff; }
        .rv-card-sub { color:#8b949e; font-size:13px; margin-bottom:20px; }
        .rv-tabs { display:flex; background:rgba(255,255,255,0.04); border-radius:12px; padding:4px; margin-bottom:20px; gap:4px; }
        .rv-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px; border-radius:9px; font-size:13px; font-weight:500; cursor:pointer; border:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .rv-tab.active { background:#63ebda; color:#080c10; font-weight:600; }
        .rv-tab.inactive { background:transparent; color:#8b949e; }
        .rv-tab.inactive:hover { color:#fff; background:rgba(255,255,255,0.04); }
        .rv-textarea { width:100%; min-height:300px; padding:14px; border-radius:12px; font-size:13px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.09); color:#f0f6fc; outline:none; resize:vertical; transition:border-color 0.2s; font-family:'DM Mono',monospace; line-height:1.6; }
        .rv-textarea:focus { border-color:rgba(99,235,218,0.4); background:rgba(99,235,218,0.02); }
        .rv-textarea::placeholder { color:#484f58; }
        .rv-dropzone { border:2px dashed rgba(255,255,255,0.12); border-radius:16px; padding:48px 24px; text-align:center; cursor:pointer; transition:all 0.3s; }
        .rv-dropzone.over { border-color:rgba(99,235,218,0.5); background:rgba(99,235,218,0.04); }
        .rv-dropzone:hover { border-color:rgba(99,235,218,0.3); }
        .rv-drop-icon { width:56px; height:56px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }
        .rv-drop-text { color:#8b949e; font-size:14px; margin-bottom:6px; }
        .rv-drop-link { color:#63ebda; font-weight:600; cursor:pointer; }
        .rv-drop-hint { font-size:12px; color:#484f58; }
        .rv-file-selected { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:11px; background:rgba(99,235,218,0.05); border:1px solid rgba(99,235,218,0.15); margin-top:12px; }
        .rv-file-name { font-size:13px; font-weight:500; color:#f0f6fc; flex:1; }
        .rv-file-size { font-size:12px; color:#8b949e; }
        .rv-btn { width:100%; padding:13px; border-radius:12px; border:none; font-size:14px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#63ebda,#2dd4bf); color:#080c10; font-family:'Syne',sans-serif; transition:all 0.2s; margin-top:16px; }
        .rv-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,235,218,0.35); }
        .rv-btn:disabled { opacity:0.45; cursor:not-allowed; }
        .rv-results { display:flex; flex-direction:column; gap:16px; }
        .rv-score-box { text-align:center; padding:28px; border-radius:16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); }
        .rv-score-num { font-family:'Syne',sans-serif; font-weight:800; font-size:68px; line-height:1; margin-bottom:4px; }
        .rv-score-label { font-size:13px; color:#8b949e; margin-bottom:6px; }
        .rv-score-feedback { font-size:13px; font-weight:500; margin-bottom:16px; }
        .rv-prog-bg { height:7px; background:rgba(255,255,255,0.06); border-radius:999px; overflow:hidden; }
        .rv-prog-fill { height:100%; border-radius:999px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
        .rv-stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
        .rv-stat { padding:12px; border-radius:11px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); text-align:center; }
        .rv-stat-val { font-family:'Syne',sans-serif; font-weight:700; font-size:22px; color:#63ebda; margin-bottom:3px; }
        .rv-stat-lbl { font-size:11px; color:#8b949e; }
        .rv-section-title { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:#f0f6fc; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
        .rv-skill-chip { display:inline-flex; align-items:center; padding:5px 12px; border-radius:8px; background:rgba(99,235,218,0.08); border:1px solid rgba(99,235,218,0.18); color:#63ebda; font-size:12px; font-weight:500; margin:3px; }
        .rv-bias-chip { display:inline-flex; align-items:center; padding:5px 12px; border-radius:8px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); color:#f87171; font-size:12px; font-weight:500; margin:3px; }
        .rv-course-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .rv-course { border-radius:14px; overflow:hidden; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); text-decoration:none; display:block; transition:all 0.25s; }
        .rv-course:hover { border-color:rgba(99,235,218,0.25); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.3); }
        .rv-course-img { width:100%; height:80px; object-fit:cover; background:#161b22; }
        .rv-course-body { padding:10px 12px; }
        .rv-course-title { font-size:12px; font-weight:600; color:#f0f6fc; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.45; }
        .rv-course-meta { display:flex; justify-content:space-between; align-items:center; }
        .rv-course-platform { font-size:11px; color:#8b949e; }
        .rv-course-price { font-size:12px; font-weight:600; color:#34d399; }
        .rv-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:420px; }
        .rv-empty-icon { width:80px; height:80px; border-radius:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
        .rv-empty-text { color:#484f58; font-size:15px; text-align:center; max-width:260px; line-height:1.6; }
        .rv-warn-card { background:rgba(248,113,113,0.04); border:1px solid rgba(248,113,113,0.15); border-radius:14px; padding:16px; }
        .rv-warn-title { display:flex; align-items:center; gap:8px; font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:#f87171; margin-bottom:10px; }
      `}</style>

      <div className="rv-root">
        <div className="rv-glow"/><div className="rv-grid-bg"/>
        <div className="rv-inner" data-testid="resume-validator-page">

          {/* Header */}
          <div className="rv-badge"><span className="rv-badge-dot"/>NLP-Powered Analysis</div>
          <h1 className="rv-title">Resume <span className="rv-accent">Validator</span></h1>
          <p className="rv-sub">Get instant AI-powered feedback on your resume quality and ATS compatibility</p>

          <div className="rv-layout">
            {/* Input Card */}
            <div className="rv-card" data-testid="resume-input-card">
              <div className="rv-card-header">
                <div className="rv-card-icon"><FileText size={16} color="#63ebda"/></div>
                <span className="rv-card-title">Upload or Paste Resume</span>
              </div>
              <p className="rv-card-sub">Choose text input or upload a PDF file (max 5MB)</p>

              {/* Mode Tabs */}
              <div className="rv-tabs">
                <button className={`rv-tab ${inputMode==='text'?'active':'inactive'}`}
                  onClick={()=>setInputMode('text')} data-testid="text-input-tab">
                  <FileText size={13}/> Text Input
                </button>
                <button className={`rv-tab ${inputMode==='file'?'active':'inactive'}`}
                  onClick={()=>setInputMode('file')} data-testid="file-upload-tab">
                  <Upload size={13}/> Upload PDF
                </button>
              </div>

              {inputMode === 'text' ? (
                <textarea className="rv-textarea" data-testid="resume-text-input"
                  placeholder={"Paste your resume text here...\n\nExample:\nJohn Doe\nSoftware Engineer\n\nExperience:\n- Developed web apps using Python and React\n- Led a team of 5 developers"}
                  value={resumeText} onChange={e=>setResumeText(e.target.value)}/>
              ) : (
                <div>
                  <label htmlFor="resume-file">
                    <div className={`rv-dropzone ${dragOver?'over':''}`}
                      onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                      onDragLeave={()=>setDragOver(false)}
                      onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFileSelect({target:{files:[f]}})}}>
                      <div className="rv-drop-icon"><Upload size={22} color="#8b949e"/></div>
                      <p className="rv-drop-text"><span className="rv-drop-link">Click to upload</span> or drag and drop</p>
                      <p className="rv-drop-hint">PDF files only · Max 5MB</p>
                    </div>
                  </label>
                  <input id="resume-file" type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" style={{display:'none'}} data-testid="file-input"/>
                  {selectedFile && (
                    <div className="rv-file-selected">
                      <div className="rv-card-icon" style={{width:'30px',height:'30px'}}><FileText size={14} color="#63ebda"/></div>
                      <span className="rv-file-name">{selectedFile.name}</span>
                      <span className="rv-file-size">{(selectedFile.size/1024).toFixed(0)} KB</span>
                    </div>
                  )}
                </div>
              )}

              <button className="rv-btn" onClick={handleAnalyze} disabled={loading} data-testid="analyze-btn">
                {loading ? 'Analyzing...' : '✦ Analyze Resume'}
              </button>
            </div>

            {/* Results */}
            <div>
              {result ? (
                <div className="rv-results">
                  {/* Score Card */}
                  <div className="rv-card" data-testid="scores-card">
                    <div className="rv-card-header">
                      <div className="rv-card-icon"><TrendingUp size={16} color="#63ebda"/></div>
                      <span className="rv-card-title">Resume Score</span>
                    </div>
                    <p className="rv-card-sub">ML-powered quality assessment</p>

                    <div className="rv-score-box">
                      <div className="rv-score-num" style={{color:getScoreColor(result.resume_score||0)}} data-testid="resume-score">
                        {result.resume_score||0}
                      </div>
                      <div className="rv-score-label">ML-Powered Resume Score</div>
                      <div className="rv-score-feedback" style={{color:getScoreColor(result.resume_score||0)}}>{result.feedback}</div>
                      <div className="rv-prog-bg">
                        <div className="rv-prog-fill" style={{width:`${result.resume_score||0}%`,background:`linear-gradient(90deg,${getScoreColor(result.resume_score||0)},#2dd4bf)`}}/>
                      </div>
                      <div className="rv-stats">
                        <div className="rv-stat">
                          <div className="rv-stat-val">{result.analysis?.word_count||0}</div>
                          <div className="rv-stat-lbl">Words</div>
                        </div>
                        <div className="rv-stat">
                          <div className="rv-stat-val">{result.analysis?.skills_count||0}</div>
                          <div className="rv-stat-lbl">Skills</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="rv-card" data-testid="skills-card">
                    <div className="rv-card-header">
                      <div className="rv-card-icon"><CheckCircle size={16} color="#63ebda"/></div>
                      <span className="rv-card-title">Detected Skills ({result.skills?.length||0})</span>
                    </div>
                    <div style={{marginTop:'10px'}}>
                      {result.skills?.length > 0
                        ? result.skills.map((skill,idx)=>(
                          <span key={idx} className="rv-skill-chip" data-testid={`skill-${idx}`}>{skill}</span>
                        ))
                        : <p style={{color:'#484f58',fontSize:'13px'}}>No specific skills detected. Consider adding more technical skills.</p>
                      }
                    </div>
                  </div>

                  {/* Bias Warning */}
                  {result.bias_detected?.length > 0 && (
                    <div className="rv-warn-card" data-testid="bias-card">
                      <div className="rv-warn-title"><AlertTriangle size={14}/> Bias Detected</div>
                      <div style={{marginBottom:'10px'}}>
                        {result.bias_detected.map((word,idx)=>(
                          <span key={idx} className="rv-bias-chip" data-testid={`bias-${idx}`}>{word}</span>
                        ))}
                      </div>
                      <p style={{fontSize:'12px',color:'#8b949e'}}>Consider removing gendered language to avoid potential bias.</p>
                    </div>
                  )}

                  {/* Courses */}
                  <div className="rv-card" data-testid="tips-card">
                    <div className="rv-card-header">
                      <div className="rv-card-icon"><Lightbulb size={16} color="#fbbf24"/></div>
                      <span className="rv-card-title">Recommended Courses</span>
                    </div>
                    <div style={{marginTop:'14px'}}>
                      {result.courses?.length > 0 ? (
                        <div className="rv-course-grid">
                          {result.courses.slice(0,4).map((course,idx)=>(
                            <a key={idx} href={course.link||'#'} target="_blank" rel="noopener noreferrer"
                              className="rv-course" data-testid={`course-card-${idx}`}>
                              <img className="rv-course-img" src={course.thumbnail||'https://via.placeholder.com/300x170?text=Course'} alt={course.title}
                                onError={e=>{try{e.currentTarget.onerror=null;e.currentTarget.src='https://via.placeholder.com/300x170?text=Course';}catch(_){}}}/>
                              <div className="rv-course-body">
                                <div className="rv-course-title">{course.title}</div>
                                <div className="rv-course-meta">
                                  <span className="rv-course-platform">{course.platform}</span>
                                  <span className="rv-course-price">{course.price}</span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p style={{color:'#484f58',fontSize:'13px'}}>No courses available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rv-card rv-empty">
                  <div className="rv-empty-icon"><FileText size={32} color="#484f58"/></div>
                  <p className="rv-empty-text">Paste your resume and click analyze to get instant feedback</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeValidator;