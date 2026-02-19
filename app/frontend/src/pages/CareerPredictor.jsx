import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
    if (prob >= 80) return { label: 'Excellent', color: 'green' };
    if (prob >= 60) return { label: 'Good', color: 'blue' };
    if (prob >= 40) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Developing', color: 'orange' };
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto" data-testid="career-predictor-page">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Career Success Predictor</h1>
          <p className="text-lg text-gray-600">Enter your profile details to predict your career success probability using our ML model</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="glass-card" data-testid="prediction-form-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Your Profile
              </CardTitle>
              <CardDescription>Fill in your career details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      min="18"
                      max="70"
                      required
                      data-testid="input-age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                      min="0"
                      max="50"
                      required
                      data-testid="input-experience"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select
                    value={formData.education_level.toString()}
                    onValueChange={(value) => setFormData({ ...formData, education_level: parseInt(value) })}
                  >
                    <SelectTrigger data-testid="input-education">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High School</SelectItem>
                      <SelectItem value="2">Bachelor's Degree</SelectItem>
                      <SelectItem value="3">Master's Degree</SelectItem>
                      <SelectItem value="4">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Number of Skills</Label>
                    <Input
                      id="skills"
                      type="number"
                      value={formData.num_skills}
                      onChange={(e) => setFormData({ ...formData, num_skills: parseInt(e.target.value) })}
                      min="1"
                      max="30"
                      required
                      data-testid="input-skills"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Tier</Label>
                    <Select
                      value={formData.location_tier.toString()}
                      onValueChange={(value) => setFormData({ ...formData, location_tier: parseInt(value) })}
                    >
                      <SelectTrigger data-testid="input-location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Tier 1 (Major City)</SelectItem>
                        <SelectItem value="2">Tier 2 (Mid-size City)</SelectItem>
                        <SelectItem value="3">Tier 3 (Small City)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-changes">Job Changes</Label>
                  <Input
                    id="job-changes"
                    type="number"
                    value={formData.job_changes}
                    onChange={(e) => setFormData({ ...formData, job_changes: parseInt(e.target.value) })}
                    min="0"
                    max="20"
                    required
                    data-testid="input-job-changes"
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading} data-testid="predict-btn">
                  {loading ? 'Predicting...' : 'Predict Success'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="glass-card fade-in" data-testid="result-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Success Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-6xl font-bold gradient-text mb-2" data-testid="success-probability">
                        {result.success_probability}%
                      </div>
                      <div className="text-lg text-gray-600">
                        {getSuccessLevel(result.success_probability).label} Potential
                      </div>
                      <Progress value={result.success_probability} className="h-4 mt-4" data-testid="success-progress" />
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Top Influencing Factors
                      </h4>
                      <div className="space-y-2">
                        {result.top_factors?.map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg" data-testid={`factor-${idx}`}>
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="capitalize">{factor.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card fade-in" data-testid="recommendations-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.recommendations?.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-testid={`recommendation-${idx}`}>
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <TrendingUp className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Fill out the form to see your career success prediction</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPredictor;
