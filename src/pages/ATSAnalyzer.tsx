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
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: { word: string; found: boolean }[];
}

const ATSAnalyzer: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
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

  const analyzeResume = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockResult: AnalysisResult = {
      score: 87,
      strengths: [
        "Strong action verbs used throughout",
        "Quantified achievements with metrics",
        "Clear section formatting",
        "Relevant keywords present",
        "Professional summary is impactful"
      ],
      improvements: [
        "Add more industry-specific keywords",
        "Include certifications section",
        "Expand technical skills list",
        "Add volunteer experience"
      ],
      keywords: [
        { word: "Leadership", found: true },
        { word: "Project Management", found: true },
        { word: "Agile", found: true },
        { word: "Data Analysis", found: false },
        { word: "Team Collaboration", found: true },
        { word: "Problem Solving", found: false },
        { word: "Communication", found: true },
        { word: "Strategic Planning", found: false },
      ]
    };
    
    setResult(mockResult);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Your resume scored ${mockResult.score}%!`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Your resume is highly optimized.';
    if (score >= 80) return 'Great job! Minor improvements possible.';
    if (score >= 60) return 'Good start. Consider the suggestions below.';
    return 'Needs work. Follow our recommendations.';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ATS Resume Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Check how well your resume performs against Applicant Tracking Systems
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
                Drag and drop or click to select your resume file
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
                  accept=".pdf,.docx"
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
                        Supports PDF and DOCX files
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
                    Analyzing...
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

          {/* Tips Card */}
          <Card className="border-0 shadow-card bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">ATS Optimization Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Use standard section headers</li>
                    <li>• Include relevant keywords from job descriptions</li>
                    <li>• Avoid complex formatting and tables</li>
                    <li>• Use standard fonts (Arial, Calibri)</li>
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
                  <p className="text-primary-foreground/80">
                    {getScoreMessage(result.score)}
                  </p>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Progress value={result.score} className="flex-1 h-3" />
                    <TrendingUp className={`w-5 h-5 ${getScoreColor(result.score)}`} />
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-success/5"
                    >
                      <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    Suggested Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.improvements.map((improvement, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-warning/5"
                    >
                      <ArrowRight className="w-4 h-4 text-warning mt-0.5" />
                      <span className="text-sm">{improvement}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Keyword Analysis
                  </CardTitle>
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
                      </span>
                    ))}
                  </div>
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
                  Upload your resume to get a detailed ATS compatibility report
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
