import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim().toLowerCase())) {
      setSkills([...skills, skillInput.trim().toLowerCase()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleGetJobs = async () => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/recommend_jobs', { skills });
      setJobs(response.data.jobs || []);
      toast.success('Jobs loaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLearningPath = async () => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/learning_path', { skills, target_role: targetRole });
      setLearningPath(response.data);
      toast.success('Learning path generated!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate learning path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto" data-testid="job-recommendations-page">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Jobs & Learning</h1>
          <p className="text-lg text-gray-600">Discover personalized job recommendations and learning paths</p>
        </div>

        {/* Skills Input */}
        <Card className="glass-card mb-8" data-testid="skills-input-card">
          <CardHeader>
            <CardTitle>Your Skills</CardTitle>
            <CardDescription>Add your current skills to get personalized recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., python, javascript, react"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                data-testid="skill-input"
              />
              <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700" data-testid="add-skill-btn">
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2" data-testid="skills-list">
                {skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 pr-1" data-testid={`skill-badge-${idx}`}>
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 hover:bg-blue-200 rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="jobs" data-testid="jobs-tab">
              <Briefcase className="h-4 w-4 mr-2" />
              Job Recommendations
            </TabsTrigger>
            <TabsTrigger value="learning" data-testid="learning-tab">
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Path
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-center">
              <Button
                onClick={handleGetJobs}
                disabled={loading || skills.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="get-jobs-btn"
              >
                {loading ? 'Loading...' : 'Get Job Recommendations'}
              </Button>
            </div>

            {jobs.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="jobs-grid">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-xl transition-all duration-300" data-testid={`job-card-${job.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                          <CardDescription>{job.company}</CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800" data-testid={`job-match-${job.id}`}>
                          {job.match_score}% match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                        <p className="text-sm">{job.skills}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Learning Path Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Target Role</CardTitle>
                <CardDescription>Select your desired career path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['software_engineer', 'data_scientist', 'frontend_developer', 'devops_engineer', 'ml_engineer'].map((role) => (
                    <Button
                      key={role}
                      variant={targetRole === role ? 'default' : 'outline'}
                      onClick={() => setTargetRole(role)}
                      className={targetRole === role ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      data-testid={`role-${role}`}
                    >
                      {role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={handleGetLearningPath}
                  disabled={loading || skills.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  data-testid="generate-path-btn"
                >
                  {loading ? 'Generating...' : 'Generate Learning Path'}
                </Button>
              </CardContent>
            </Card>

            {learningPath && (
              <div className="space-y-6 fade-in" data-testid="learning-path-result">
                {/* Gap Analysis */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Skill Gap Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Required Skills</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {learningPath.required_skills?.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" data-testid={`required-skill-${idx}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Skills to Learn</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {learningPath.skill_gap?.map((skill, idx) => (
                          <Badge key={idx} className="bg-orange-100 text-orange-800" data-testid={`gap-skill-${idx}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Estimated Timeline: {learningPath.estimated_timeline}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Courses */}
                <div>
                  <h3 className="text-2xl font-bold mb-4">Recommended Courses</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
                    {learningPath.recommended_courses?.map((course) => (
                      <Card key={course.id} className="hover:shadow-xl transition-all duration-300" data-testid={`course-card-${course.id}`}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                              <CardDescription>{course.platform}</CardDescription>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800" data-testid={`course-relevance-${course.id}`}>
                              {course.relevance_score}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{course.price}</span>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-2">Focus Areas:</p>
                            <p className="text-sm">{course.skills}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobRecommendations;
