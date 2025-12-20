import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Sparkles,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  RefreshCw,
  BarChart3,
  FileSearch,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  score: number;
  overallAssessment: string;
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string; priority: 'high' | 'medium' | 'low' }[];
  keywords: { word: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }[];
  sectionScores: { section: string; score: number; feedback: string }[];
  formatAnalysis: { aspect: string; status: 'good' | 'warning' | 'error'; message: string }[];
}

// Comprehensive keyword database for different industries
const industryKeywords = {
  tech: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Agile', 'Scrum', 'Git', 'REST API', 'SQL', 'NoSQL', 'Machine Learning', 'Data Analysis', 'TypeScript', 'Cloud Computing', 'DevOps', 'Microservices'],
  management: ['Leadership', 'Project Management', 'Strategic Planning', 'Team Building', 'Budgeting', 'Stakeholder Management', 'Risk Management', 'Change Management', 'KPIs', 'Cross-functional', 'P&L', 'ROI', 'Business Development', 'Executive Presence'],
  marketing: ['Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media', 'Analytics', 'Campaign Management', 'Brand Strategy', 'Market Research', 'Email Marketing', 'CRM', 'Lead Generation', 'Conversion Rate', 'A/B Testing'],
  general: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking', 'Adaptability', 'Innovation', 'Results-driven', 'Detail-oriented', 'Customer Focus']
};

// Action verbs that ATS systems look for
const actionVerbs = ['Achieved', 'Delivered', 'Implemented', 'Led', 'Managed', 'Developed', 'Created', 'Improved', 'Increased', 'Reduced', 'Optimized', 'Launched', 'Designed', 'Built', 'Analyzed', 'Streamlined', 'Spearheaded', 'Orchestrated', 'Pioneered', 'Transformed'];

const ATSAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx') || droppedFile.type === 'text/plain')) {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text || '');
      };
      reader.readAsText(file);
    });
  };

  // Analyze the resume content
  const analyzeResumeContent = (text: string): AnalysisResult => {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    let maxScore = 0;

    // 1. Keyword Analysis (30 points max)
    const allKeywords = [...industryKeywords.tech, ...industryKeywords.management, ...industryKeywords.general];
    const keywordResults: AnalysisResult['keywords'] = [];
    let keywordScore = 0;
    
    allKeywords.slice(0, 20).forEach((keyword, index) => {
      const found = lowerText.includes(keyword.toLowerCase());
      const importance = index < 7 ? 'critical' : index < 14 ? 'important' : 'nice-to-have';
      if (found) {
        keywordScore += importance === 'critical' ? 3 : importance === 'important' ? 2 : 1;
      }
      keywordResults.push({ word: keyword, found, importance });
    });
    totalScore += Math.min(keywordScore, 30);
    maxScore += 30;

    // 2. Action Verbs Analysis (15 points max)
    let actionVerbCount = 0;
    actionVerbs.forEach(verb => {
      if (lowerText.includes(verb.toLowerCase())) actionVerbCount++;
    });
    const actionVerbScore = Math.min(actionVerbCount * 2, 15);
    totalScore += actionVerbScore;
    maxScore += 15;

    // 3. Section Detection (20 points max)
    const sections = ['experience', 'education', 'skills', 'summary', 'objective', 'projects', 'certifications', 'achievements'];
    const sectionScores: AnalysisResult['sectionScores'] = [];
    let sectionScore = 0;
    
    sections.forEach(section => {
      const found = lowerText.includes(section);
      const score = found ? (section === 'experience' || section === 'education' || section === 'skills' ? 4 : 2) : 0;
      sectionScore += score;
      if (found || section === 'experience' || section === 'education' || section === 'skills') {
        sectionScores.push({
          section: section.charAt(0).toUpperCase() + section.slice(1),
          score: found ? 100 : 0,
          feedback: found ? 'Section detected and properly formatted' : `Missing ${section} section - consider adding it`
        });
      }
    });
    totalScore += Math.min(sectionScore, 20);
    maxScore += 20;

    // 4. Quantified Achievements (15 points max)
    const numberPattern = /\d+%|\$[\d,]+|\d+\+?(?:\s+(?:years?|months?|projects?|clients?|team members?|people))/gi;
    const quantifiedMatches = text.match(numberPattern) || [];
    const quantifiedScore = Math.min(quantifiedMatches.length * 3, 15);
    totalScore += quantifiedScore;
    maxScore += 15;

    // 5. Format Analysis (10 points max)
    const formatAnalysis: AnalysisResult['formatAnalysis'] = [];
    let formatScore = 0;

    // Check for email
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/;
    const hasEmail = emailPattern.test(text);
    formatAnalysis.push({
      aspect: 'Contact Email',
      status: hasEmail ? 'good' : 'error',
      message: hasEmail ? 'Email address detected' : 'No email address found - add contact information'
    });
    if (hasEmail) formatScore += 2;

    // Check for phone
    const phonePattern = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const hasPhone = phonePattern.test(text);
    formatAnalysis.push({
      aspect: 'Phone Number',
      status: hasPhone ? 'good' : 'warning',
      message: hasPhone ? 'Phone number detected' : 'Consider adding a phone number'
    });
    if (hasPhone) formatScore += 2;

    // Check length
    const wordCount = text.split(/\s+/).length;
    const lengthStatus = wordCount > 300 && wordCount < 1000 ? 'good' : wordCount < 200 ? 'warning' : 'warning';
    formatAnalysis.push({
      aspect: 'Resume Length',
      status: lengthStatus,
      message: wordCount < 200 ? 'Resume may be too short - add more details' : wordCount > 1000 ? 'Resume may be too long - consider condensing' : `Good length (${wordCount} words)`
    });
    if (lengthStatus === 'good') formatScore += 3;

    // Check for LinkedIn
    const hasLinkedIn = lowerText.includes('linkedin');
    formatAnalysis.push({
      aspect: 'LinkedIn Profile',
      status: hasLinkedIn ? 'good' : 'warning',
      message: hasLinkedIn ? 'LinkedIn profile included' : 'Consider adding your LinkedIn profile'
    });
    if (hasLinkedIn) formatScore += 1;

    // Check bullet points usage
    const bulletPatterns = /[•\-\*]/g;
    const bulletCount = (text.match(bulletPatterns) || []).length;
    formatAnalysis.push({
      aspect: 'Bullet Points',
      status: bulletCount > 5 ? 'good' : 'warning',
      message: bulletCount > 5 ? 'Good use of bullet points for readability' : 'Consider using bullet points for better ATS parsing'
    });
    if (bulletCount > 5) formatScore += 2;

    totalScore += formatScore;
    maxScore += 10;

    // 6. Content Quality (10 points max)
    const hasMetrics = quantifiedMatches.length >= 3;
    const hasActionVerbs = actionVerbCount >= 5;
    const contentScore = (hasMetrics ? 5 : 0) + (hasActionVerbs ? 5 : 0);
    totalScore += contentScore;
    maxScore += 10;

    // Calculate final percentage
    const finalScore = Math.round((totalScore / maxScore) * 100);

    // Generate strengths
    const strengths: AnalysisResult['strengths'] = [];
    if (actionVerbCount >= 5) {
      strengths.push({ title: 'Strong Action Verbs', description: `Used ${actionVerbCount} powerful action verbs that demonstrate leadership and initiative` });
    }
    if (quantifiedMatches.length >= 3) {
      strengths.push({ title: 'Quantified Achievements', description: 'Included measurable results and metrics that demonstrate impact' });
    }
    if (keywordScore >= 15) {
      strengths.push({ title: 'Industry Keywords', description: 'Resume contains relevant industry-specific keywords for ATS optimization' });
    }
    if (sectionScore >= 10) {
      strengths.push({ title: 'Well-Structured Format', description: 'Resume has clear sections that ATS systems can easily parse' });
    }
    if (hasEmail && hasPhone) {
      strengths.push({ title: 'Complete Contact Information', description: 'Professional contact details are clearly presented' });
    }

    // Generate improvements
    const improvements: AnalysisResult['improvements'] = [];
    if (actionVerbCount < 5) {
      improvements.push({ title: 'Add More Action Verbs', description: 'Start bullet points with powerful verbs like "Achieved", "Implemented", "Led"', priority: 'high' });
    }
    if (quantifiedMatches.length < 3) {
      improvements.push({ title: 'Quantify Your Achievements', description: 'Add numbers, percentages, and metrics to demonstrate your impact', priority: 'high' });
    }
    if (keywordScore < 10) {
      improvements.push({ title: 'Include More Keywords', description: 'Add relevant industry keywords from job descriptions you\'re targeting', priority: 'high' });
    }
    if (!hasLinkedIn) {
      improvements.push({ title: 'Add LinkedIn Profile', description: 'Include your LinkedIn URL to provide recruiters with more information', priority: 'medium' });
    }
    if (bulletCount < 5) {
      improvements.push({ title: 'Use Bullet Points', description: 'Format achievements as bullet points for better ATS parsing and readability', priority: 'medium' });
    }
    if (wordCount < 200) {
      improvements.push({ title: 'Expand Content', description: 'Your resume appears brief - add more detail about your experience and skills', priority: 'high' });
    }

    // Overall assessment
    let overallAssessment = '';
    if (finalScore >= 85) {
      overallAssessment = 'Excellent! Your resume is highly optimized for ATS systems and should perform well in automated screenings.';
    } else if (finalScore >= 70) {
      overallAssessment = 'Good job! Your resume is well-structured with some room for improvement to maximize ATS compatibility.';
    } else if (finalScore >= 50) {
      overallAssessment = 'Your resume needs optimization. Focus on the high-priority improvements below to increase your chances.';
    } else {
      overallAssessment = 'Your resume requires significant improvements for ATS compatibility. Follow our recommendations carefully.';
    }

    return {
      score: finalScore,
      overallAssessment,
      strengths,
      improvements,
      keywords: keywordResults.filter(k => k.importance === 'critical' || k.importance === 'important').slice(0, 12),
      sectionScores,
      formatAnalysis
    };
  };

  const analyzeResume = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    try {
      // Extract text from file
      const text = await extractTextFromFile(file);
      setResumeText(text);
      
      // Simulate processing time for UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze the content
      const analysisResult = analyzeResumeContent(text);
      
      setResult(analysisResult);
      
      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${analysisResult.score}%!`,
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the resume. Please try a different file format.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-destructive/10 text-destructive';
    if (priority === 'medium') return 'bg-warning/10 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'good') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'warning') return <AlertCircle className="w-4 h-4 text-warning" />;
    return <XCircle className="w-4 h-4 text-destructive" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Get a comprehensive analysis of your resume's ATS compatibility with detailed insights
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Drag and drop or click to select your resume file (PDF, DOCX, or TXT)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : file 
                    ? 'border-success bg-success/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-success/10 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setResult(null);
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your resume here</p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, DOCX, and TXT files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full mt-4"
                onClick={analyzeResume}
                disabled={!file || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* What We Analyze Card */}
          <Card className="border-0 shadow-card bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSearch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What We Analyze</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keywords & Industry terminology</li>
                    <li>• Action verbs & quantified achievements</li>
                    <li>• Section structure & formatting</li>
                    <li>• Contact information completeness</li>
                    <li>• Resume length & readability</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Score Card */}
              <Card className="border-0 shadow-card overflow-hidden">
                <div className="gradient-primary p-6 text-center">
                  <p className="text-primary-foreground/80 text-sm font-medium mb-2">
                    ATS Compatibility Score
                  </p>
                  <div className="text-6xl font-bold text-primary-foreground mb-2">
                    {result.score}%
                  </div>
                  <p className="text-primary-foreground/80 text-sm max-w-md mx-auto">
                    {result.overallAssessment}
                  </p>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Progress value={result.score} className="flex-1 h-3" />
                    <TrendingUp className={`w-5 h-5 ${getScoreColor(result.score)}`} />
                  </div>
                </CardContent>
              </Card>

              {/* Format Analysis */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Format Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.formatAnalysis.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <span className="text-sm font-medium">{item.aspect}</span>
                        <p className="text-xs text-muted-foreground">{item.message}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" />
                      Strengths ({result.strengths.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-success/5"
                      >
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <div>
                          <span className="text-sm font-medium">{strength.title}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{strength.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-warning" />
                      Suggested Improvements ({result.improvements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {result.improvements.map((improvement, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-warning/5"
                      >
                        <ArrowRight className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{improvement.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${getPriorityColor(improvement.priority)}`}>
                              {improvement.priority}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{improvement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Keywords */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Keyword Analysis
                  </CardTitle>
                  <CardDescription>
                    Keywords detected in your resume (green = found, red = missing)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                          kw.found
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {kw.found ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {kw.word}
                        {kw.importance === 'critical' && (
                          <span className="text-[9px] opacity-70">★</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    ★ indicates critical keywords that most ATS systems prioritize
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-0 shadow-card">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                <p className="text-muted-foreground">
                  Upload your resume to get a comprehensive ATS compatibility report with detailed insights
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ATSAnalyzer;