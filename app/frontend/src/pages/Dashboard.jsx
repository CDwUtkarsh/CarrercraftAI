import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Award, Activity, Target } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────
  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axiosInstance.get('/dashboard');
      setAnalytics(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#63ebda', '#a78bfa', '#fbbf24', '#34d399', '#f87171'];

  // ── UI ────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#080c10',display:'flex',alignItems:'center',justifyContent:'center',paddingTop:'80px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{
          width:'48px',height:'48px',borderRadius:'14px',
          background:'rgba(99,235,218,0.1)',border:'1px solid rgba(99,235,218,0.25)',
          display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'
        }}>
          <div style={{width:'20px',height:'20px',border:'2px solid #63ebda',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
        <p style={{color:'#8b949e',fontSize:'14px',fontFamily:'DM Sans,sans-serif'}}>Loading your dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const metrics = [
    { label: 'Predictions Made', value: analytics?.predictions_made || 0, icon: TrendingUp, color: '#63ebda', bg: 'rgba(99,235,218,0.1)', border: 'rgba(99,235,218,0.2)', badge: '+3 this week', testid: 'predictions-stat' },
    { label: 'Resumes Analyzed', value: analytics?.resumes_analyzed || 0, icon: Activity, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', badge: 'NLP powered', testid: 'analyses-stat' },
    { label: 'User Level', value: analytics?.user_level, icon: Target, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', badge: 'Keep going!', testid: 'level-stat' },
    { label: 'Badges Earned', value: analytics?.badges?.length || 0, icon: Award, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', badge: 'Top 20%', testid: 'badges-stat' },
  ];

  const customTooltipStyle = {
    background: '#161b22', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', color: '#f0f6fc', fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .dash-root { min-height:100vh; background:#080c10; padding-top:96px; padding-bottom:64px; position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }
        .dash-glow { position:absolute; top:0; left:50%; transform:translateX(-50%); width:700px; height:300px; background:radial-gradient(ellipse,rgba(99,235,218,0.06) 0%,transparent 70%); pointer-events:none; }
        .dash-inner { max-width:1280px; margin:0 auto; padding:0 24px; position:relative; z-index:10; }
        .dash-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; background:rgba(99,235,218,0.1); border:1px solid rgba(99,235,218,0.2); color:#63ebda; font-size:12px; font-weight:500; margin-bottom:14px; }
        .dash-badge-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .dash-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(28px,4vw,40px); color:#fff; margin-bottom:6px; }
        .dash-sub { color:#8b949e; font-size:14px; margin-bottom:32px; }
        .dash-metrics { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; margin-bottom:24px; }
        @media(min-width:1024px){ .dash-metrics{grid-template-columns:repeat(4,1fr);} }
        .dash-metric { border-radius:18px; padding:20px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); transition:all 0.3s; }
        .dash-metric:hover { border-color:rgba(99,235,218,0.2); transform:translateY(-3px); box-shadow:0 16px 48px rgba(0,0,0,0.3); }
        .dash-metric-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
        .dash-metric-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; }
        .dash-metric-badge { font-size:10px; padding:3px 8px; border-radius:999px; background:rgba(52,211,153,0.12); color:#34d399; font-weight:500; white-space:nowrap; }
        .dash-metric-val { font-family:'Syne',sans-serif; font-weight:700; font-size:26px; color:#fff; margin-bottom:3px; }
        .dash-metric-lbl { color:#8b949e; font-size:12px; }
        .dash-charts { display:grid; gap:20px; margin-bottom:20px; }
        @media(min-width:1024px){ .dash-charts{grid-template-columns:3fr 2fr;} }
        .dash-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px; }
        .dash-card-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:#fff; margin-bottom:4px; }
        .dash-card-sub { color:#8b949e; font-size:12px; margin-bottom:22px; }
        .dash-skill-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .dash-skill-num { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
        .dash-skill-name { color:#f0f6fc; font-size:13px; font-weight:500; flex:1; }
        .dash-skill-pct { color:#8b949e; font-size:12px; width:32px; text-align:right; flex-shrink:0; }
        .dash-skill-bar-bg { height:5px; background:rgba(255,255,255,0.06); border-radius:999px; flex:1; overflow:hidden; }
        .dash-skill-bar { height:100%; border-radius:999px; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
        .dash-badges { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px; }
        .dash-badge-item { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:999px; background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.2); margin-right:10px; margin-bottom:10px; }
        .dash-badge-text { font-size:13px; color:#fbbf24; font-weight:500; }
        .dash-badge-empty { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:999px; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.12); }
        .dash-badge-empty-text { font-size:13px; color:#484f58; }
      `}</style>

      <div className="dash-root">
        <div className="dash-glow"/>
        <div className="dash-inner">

          {/* Header */}
          <div>
            <div className="dash-badge">
              <span className="dash-badge-dot"/>
              Live Analytics
            </div>
            <h1 className="dash-title">Career Dashboard</h1>
            <p className="dash-sub">Your career intelligence at a glance</p>
          </div>

          {/* Metric Cards */}
          <div className="dash-metrics" data-testid="dashboard-page">
            {metrics.map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="dash-metric" data-testid={m.testid}>
                  <div className="dash-metric-top">
                    <div className="dash-metric-icon" style={{background:m.bg, border:`1px solid ${m.border}`}}>
                      <Icon size={16} color={m.color}/>
                    </div>
                    <span className="dash-metric-badge">{m.badge}</span>
                  </div>
                  <div className="dash-metric-val" style={{color:m.color}}>{m.value}</div>
                  <div className="dash-metric-lbl">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="dash-charts">
            {/* Salary Bar Chart */}
            <div className="dash-card" data-testid="salary-trends-card">
              <div className="dash-card-title">Average Salary by Role</div>
              <div className="dash-card-sub">Industry salary benchmarks</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics?.salary_trends || []} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                  <XAxis dataKey="role" tick={{fontSize:11, fill:'#8b949e', fontFamily:'DM Sans'}} axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={60}/>
                  <YAxis tick={{fontSize:11, fill:'#8b949e', fontFamily:'DM Sans'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
                  <Tooltip contentStyle={customTooltipStyle} cursor={{fill:'rgba(255,255,255,0.03)'}} formatter={v=>[`$${v.toLocaleString()}`, 'Avg Salary']}/>
                  <Bar dataKey="avg_salary" fill="url(#barGrad)" radius={[8,8,0,0]}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#63ebda"/>
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skills Pie Chart */}
            <div className="dash-card" data-testid="skills-demand-card">
              <div className="dash-card-title">Top Skills in Demand</div>
              <div className="dash-card-sub">Market demand percentage</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={analytics?.top_skills || []} dataKey="demand" nameKey="skill"
                    cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                    label={({skill, demand}) => `${skill} ${demand}%`}
                    labelLine={{stroke:'rgba(255,255,255,0.15)'}}>
                    {(analytics?.top_skills || []).map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skills Detail */}
          <div className="dash-card" style={{marginBottom:'20px'}} data-testid="skills-detail-card">
            <div className="dash-card-title">Skills Demand Details</div>
            <div className="dash-card-sub">Breakdown by market demand</div>
            {analytics?.top_skills?.map((skill, idx) => (
              <div key={idx} className="dash-skill-row" data-testid={`skill-detail-${idx}`}>
                <div className="dash-skill-num"
                  style={{background:`${COLORS[idx%COLORS.length]}15`,color:COLORS[idx%COLORS.length],border:`1px solid ${COLORS[idx%COLORS.length]}25`}}>
                  {idx+1}
                </div>
                <span className="dash-skill-name">{skill.skill}</span>
                <div className="dash-skill-bar-bg" style={{minWidth:'120px'}}>
                  <div className="dash-skill-bar" style={{width:`${skill.demand}%`,background:COLORS[idx%COLORS.length]}}/>
                </div>
                <span className="dash-skill-pct">{skill.demand}%</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          {analytics?.badges && analytics.badges.length > 0 && (
            <div className="dash-badges" data-testid="badges-card">
              <div className="dash-card-title" style={{marginBottom:'4px'}}>Achievements</div>
              <div className="dash-card-sub">Badges you've unlocked</div>
              <div>
                {analytics.badges.map((badge, idx) => (
                  <span key={idx} className="dash-badge-item" data-testid={`badge-${idx}`}>
                    <span>🏆</span>
                    <span className="dash-badge-text">{badge}</span>
                  </span>
                ))}
                <span className="dash-badge-empty">
                  <span className="dash-badge-empty-text">More badges unlocking...</span>
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Dashboard;