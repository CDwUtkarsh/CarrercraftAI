import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/App';
import { toast } from 'sonner';
import { FileText, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Upload } from 'lucide-react';

const ResumeValidator = () => {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'
  const [result, setResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const handleAnalyze = async () => {
    if (inputMode === 'text' && !resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }
    if (inputMode === 'file' && !selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      if (inputMode === 'text') {
        formData.append('resume_text', resumeText);
      } else {
        formData.append('file', selectedFile);
      }

      const response = await axiosInstance.post('/analyze_resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getSentimentBadge = (sentiment) => {
    const variants = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-blue-100 text-blue-800',
      negative: 'bg-red-100 text-red-800',
    };
    return variants[sentiment] || variants.neutral;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto" data-testid="resume-validator-page">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 gradient-text">Resume Validator</h1>
          <p className="text-lg text-gray-600">Get instant AI-powered feedback on your resume quality and ATS compatibility</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="glass-card" data-testid="resume-input-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Upload or Paste Resume
              </CardTitle>
              <CardDescription>Choose text input or upload a PDF file (max 5MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={inputMode} onValueChange={setInputMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" data-testid="text-input-tab">
                    <FileText className="h-4 w-4 mr-2" />
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger value="file" data-testid="file-upload-tab">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <Textarea
                    placeholder="Paste your resume text here...\n\nExample:\nJohn Doe\nSoftware Engineer\n\nExperience:\n- Developed web applications using Python and React\n- Led a team of 5 developers\n- Improved application performance by 40%"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[350px] font-mono text-sm"
                    data-testid="resume-text-input"
                  />
                </TabsContent>

                <TabsContent value="file" className="space-y-4 mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <label htmlFor="resume-file" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-semibold">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <p className="text-sm text-gray-500 mt-2">PDF files only (max 5MB)</p>
                    </label>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="file-input"
                    />
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button
                onClick={handleAnalyze}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
                data-testid="analyze-btn"
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Scores Card */}
                <Card className="glass-card fade-in" data-testid="scores-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Analysis Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-4xl font-bold ${getScoreColor(result.ats_score)} mb-2`} data-testid="ats-score">
                          {result.ats_score}
                        </div>
                        <div className="text-sm text-gray-600">ATS Compatibility</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-4xl font-bold ${getScoreColor(result.readability_score)} mb-2`} data-testid="readability-score">
                          {result.readability_score.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Readability Score</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Sentiment</span>
                        <Badge className={getSentimentBadge(result.sentiment)} data-testid="sentiment-badge">
                          {result.sentiment}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Card */}
                <Card className="glass-card fade-in" data-testid="skills-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Detected Skills ({result.skills?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800" data-testid={`skill-${idx}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No specific skills detected. Consider adding more technical skills.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Bias Detection */}
                {result.bias_detected?.length > 0 && (
                  <Card className="glass-card fade-in border-orange-200" data-testid="bias-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Bias Detected
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {result.bias_detected.map((word, idx) => (
                          <Badge key={idx} variant="destructive" data-testid={`bias-${idx}`}>
                            {word}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Consider removing gendered language to avoid potential bias.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Improvement Tips */}
                <Card className="glass-card fade-in" data-testid="tips-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      Improvement Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {result.improvement_tips?.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-testid={`tip-${idx}`}>
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <FileText className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Paste your resume and click analyze to get instant feedback</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeValidator;
