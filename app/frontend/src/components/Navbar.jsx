import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, TrendingUp, FileText, Briefcase, LayoutDashboard, LogOut, Bot } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/career-predictor', icon: TrendingUp, label: 'Career Predictor' },
    { path: '/resume-validator', icon: FileText, label: 'Resume Validator' },
    { path: '/recommendations', icon: Briefcase, label: 'Jobs & Learning' },
    { path: '/chatbot', icon: Bot, label: 'AI Advisor' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold gradient-text">CareerIQ</span>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className={isActive ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      data-testid={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600" data-testid="user-name">Welcome, {user?.name}</span>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-red-500 text-red-500 hover:bg-red-50"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
