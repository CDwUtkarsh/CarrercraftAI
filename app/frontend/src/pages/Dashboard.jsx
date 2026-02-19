import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Activity, Target } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

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

  const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto" data-testid="dashboard-page">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Dashboard</h1>
          <p className="text-lg text-gray-600">Your career insights and analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card" data-testid="predictions-stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Predictions Made</p>
                  <p className="text-3xl font-bold text-blue-600">{analytics?.predictions_made || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="analyses-stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resumes Analyzed</p>
                  <p className="text-3xl font-bold text-green-600">{analytics?.resumes_analyzed || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="level-stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">User Level</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics?.user_level}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="badges-stat">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Badges Earned</p>
                  <p className="text-3xl font-bold text-orange-600">{analytics?.badges?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {analytics?.badges && analytics.badges.length > 0 && (
          <Card className="glass-card mb-8 fade-in" data-testid="badges-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Your Badges
              </CardTitle>
              <CardDescription>Achievements unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {analytics.badges.map((badge, idx) => (
                  <Badge key={idx} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm" data-testid={`badge-${idx}`}>
                    <Award className="h-4 w-4 mr-2" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Salary Trends */}
          <Card className="glass-card fade-in" data-testid="salary-trends-card">
            <CardHeader>
              <CardTitle>Average Salary by Role</CardTitle>
              <CardDescription>Industry salary trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.salary_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="avg_salary" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Skills Demand */}
          <Card className="glass-card fade-in" data-testid="skills-demand-card">
            <CardHeader>
              <CardTitle>Top Skills in Demand</CardTitle>
              <CardDescription>Market demand percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.top_skills || []}
                    dataKey="demand"
                    nameKey="skill"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ skill, demand }) => `${skill}: ${demand}%`}
                  >
                    {(analytics?.top_skills || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Skills Detail List */}
        <Card className="glass-card mt-8 fade-in" data-testid="skills-detail-card">
          <CardHeader>
            <CardTitle>Skills Demand Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.top_skills?.map((skill, idx) => (
                <div key={idx} className="flex items-center justify-between" data-testid={`skill-detail-${idx}`}>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="font-medium">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${skill.demand}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">{skill.demand}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
