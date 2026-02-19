import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, FileText, Briefcase, LayoutDashboard, CheckCircle, Target, Zap } from 'lucide-react';

const Home = ({ user }) => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Career Success Predictor',
      description: 'AI-powered predictions based on your profile',
      link: '/career-predictor',
      color: 'blue',
      testId: 'feature-career-predictor'
    },
    {
      icon: FileText,
      title: 'Resume Validator',
      description: 'Get instant feedback on your resume quality',
      link: '/resume-validator',
      color: 'green',
      testId: 'feature-resume-validator'
    },
    {
      icon: Briefcase,
      title: 'Job Recommendations',
      description: 'Discover jobs matching your skills',
      link: '/recommendations',
      color: 'purple',
      testId: 'feature-job-recommendations'
    },
    {
      icon: LayoutDashboard,
      title: 'Analytics Dashboard',
      description: 'Track your progress and insights',
      link: '/dashboard',
      color: 'orange',
      testId: 'feature-dashboard'
    },
  ];

  const benefits = [
    'ML-powered career success predictions',
    'NLP-based resume analysis',
    'Personalized job recommendations',
    'Custom learning paths',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4" data-testid="hero-section">
        <div className="max-w-7xl mx-auto text-center fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 gradient-text">
            Transform Your Career Journey
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Welcome back, {user?.name}! Your intelligent career platform powered by Machine Learning and NLP to help you achieve professional success.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/career-predictor">
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg" data-testid="get-started-btn">
                <Zap className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg" data-testid="view-dashboard-btn">
                <Target className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} to={feature.link}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer" data-testid={feature.testId}>
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 text-${feature.color}-600`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="text-blue-600 p-0 h-auto hover:bg-transparent">
                        Explore →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4" data-testid="benefits-section">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">Why Choose CareerIQ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg text-gray-700">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Start by predicting your career success or validating your resume today.
          </p>
          <Link to="/career-predictor">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg" data-testid="start-now-btn">
              Start Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
