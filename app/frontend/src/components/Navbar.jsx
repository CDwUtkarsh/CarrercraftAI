import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, FileText, Briefcase, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/career-predictor', icon: TrendingUp, label: 'Career Predictor' },
    { path: '/resume-validator', icon: FileText, label: 'Resume Validator' },
    { path: '/recommendations', icon: Briefcase, label: 'Jobs & Learning' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  return (
    <>
      <style>{`
        .nav-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-root.scrolled {
          background: rgba(8,12,16,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 10px 0;
        }
        .nav-root.top { background: transparent; padding: 18px 0; }
        .nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-logo-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #63ebda, #2dd4bf);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(99,235,218,0.35);
        }
        .nav-logo-text { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #fff; letter-spacing: -0.3px; }
        .nav-logo-text span { color: #63ebda; }
        .nav-logo-ai { font-size: 9px; color: rgba(99,235,218,0.6); letter-spacing: 2px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 400; margin-left: 2px; }
        .nav-links { display: flex; align-items: center; gap: 2px; }
        .nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 10px;
          font-size: 13px; font-weight: 500; text-decoration: none;
          color: #8b949e; transition: all 0.2s ease; white-space: nowrap;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nav-link.active {
          color: #63ebda;
          background: rgba(99,235,218,0.1);
          border: 1px solid rgba(99,235,218,0.2);
        }
        .nav-link svg { width: 14px; height: 14px; flex-shrink: 0; }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .nav-user {
          display: flex; align-items: center; gap: 8px;
          padding: 6px 12px 6px 6px; border-radius: 999px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
        }
        .nav-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #63ebda, #2dd4bf);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #080c10;
        }
        .nav-username { font-size: 13px; color: #f0f6fc; font-weight: 500; }
        .nav-logout {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: #8b949e; transition: all 0.2s ease;
        }
        .nav-logout:hover { border-color: rgba(239,68,68,0.4); color: #f87171; background: rgba(239,68,68,0.06); }
        .nav-logout svg { width: 13px; height: 13px; }
        .nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; color: #8b949e; padding: 4px; }
        .nav-mobile-btn:hover { color: #fff; }
        .nav-mobile-menu {
          margin: 8px 16px 0; border-radius: 16px;
          background: #0d1117; border: 1px solid rgba(255,255,255,0.08);
          padding: 12px; overflow: hidden;
        }
        .nav-mobile-link {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; text-decoration: none;
          color: #8b949e; transition: all 0.2s;
        }
        .nav-mobile-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-mobile-link.active { color: #63ebda; background: rgba(99,235,218,0.08); }
        .nav-mobile-link svg { width: 15px; height: 15px; }
        .nav-mobile-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
        .nav-mobile-logout {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          background: none; border: none; color: #f87171; width: 100%;
          transition: all 0.2s;
        }
        .nav-mobile-logout:hover { background: rgba(239,68,68,0.06); }
        .nav-mobile-logout svg { width: 15px; height: 15px; }
        @media (max-width: 768px) {
          .nav-links, .nav-right { display: none; }
          .nav-mobile-btn { display: block; }
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#080c10" strokeWidth="1.5"/>
                <circle cx="8" cy="8" r="2" fill="#080c10"/>
              </svg>
            </div>
            <div>
              <div className="nav-logo-text">Career<span>Craft</span><span className="nav-logo-ai">AI</span></div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}>
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right */}
          <div className="nav-right">
            <div className="nav-user">
              <div className="nav-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              <span className="nav-username">{user?.name}</span>
            </div>
            <button className="nav-logout" onClick={onLogout} data-testid="logout-btn">
              <LogOut size={13} /> Sign out
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            }
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="nav-mobile-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                  className={`nav-mobile-link ${isActive ? 'active' : ''}`}>
                  <Icon size={15} /> {item.label}
                </Link>
              );
            })}
            <div className="nav-mobile-divider"/>
            <button className="nav-mobile-logout" onClick={onLogout}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;