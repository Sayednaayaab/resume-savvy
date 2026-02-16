import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  RefreshCw,
  BarChart3,
  FileSearch,
  Lightbulb,
  Target,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AIChatBot from '@/components/AIChatBot';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface AnalysisResult {
  score: number;
  overallAssessment: string;
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string; priority: 'high' | 'medium' | 'low' }[];
  keywords: { word: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }[];
  jobDescriptionKeywords?: { word: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }[];
  sectionScores: { section: string; score: number; feedback: string }[];
  formatAnalysis: { aspect: string; status: 'good' | 'warning' | 'error'; message: string }[];
  summary?: string;
  contentPresent?: string[];
  contentAbsent?: string[];
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

const getStatusIcon = (status: 'good' | 'warning' | 'error'): React.ReactElement => {
  if (status === 'good') return <CheckCircle className="w-4 h-4 text-success" />;
  if (status === 'warning') return <AlertCircle className="w-4 h-4 text-warning" />;
  return <XCircle className="w-4 h-4 text-destructive" />;
};

const ATSAnalyzer = () => {
  const { toast } = useToast();
  const { incrementResumeAnalyzed, user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [isJobDescriptionDragging, setIsJobDescriptionDragging] = useState(false);
  const [jobDescriptionTextInput, setJobDescriptionTextInput] = useState<string>('');



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

  const handleJobDescriptionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsJobDescriptionDragging(true);
  }, []);

  const handleJobDescriptionDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsJobDescriptionDragging(false);
  }, []);

  const handleJobDescriptionDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsJobDescriptionDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx') || droppedFile.type === 'text/plain')) {
      setJobDescriptionFile(droppedFile);
      setJobDescriptionText('');
      setResult(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleJobDescriptionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setJobDescriptionFile(selectedFile);
      setJobDescriptionText('');
      setResult(null);
    }
  };

  const handleJobDescriptionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescriptionTextInput(e.target.value);
    setJobDescriptionFile(null);
    setResult(null);
  };



  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        // Handle PDF files
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: {str?: string}) => item.str || '').join(' ');
          text += pageText + ' ';
        }

        const extractedText = text.trim();
        if (!extractedText) {
          throw new Error('No text content found in PDF. The PDF might be image-based or corrupted.');
        }

        return extractedText;
      } catch (error) {
        console.error('Error extracting text from PDF:', error);
        if (error instanceof Error) {
          throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
        throw new Error('Failed to extract text from PDF. Please ensure the PDF contains selectable text.');
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
      try {
        // Handle DOCX files
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        throw new Error('Failed to extract text from DOCX file.');
      }
    } else {
      // Handle TXT files
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve(text || '');
        };
        reader.onerror = () => {
          reject(new Error('Failed to read text file.'));
        };
        reader.readAsText(file);
      });
    }
  };



  // API endpoint for resume analysis
  const apiAnalyzeResume = async (text: string, jobDescriptionText?: string): Promise<AnalysisResult> => {
    try {
      const response = await fetch('/api/analyze-ats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: text,
          jobDescriptionText: jobDescriptionText || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze resume');
      }

      const result = await response.json();
      return result as AnalysisResult;
    } catch (error) {
      console.error('Error calling analyze-ats API:', error);
      throw error;
    }
  };

  // Analyze the resume content
  const analyzeResumeContent = (text: string, jobDescriptionText?: string): AnalysisResult => {
    const lowerText = text.toLowerCase();
    let totalScore = 0;
    let maxScore = 0;

    // Job Description Keyword Analysis - Focus on Skills Only
    const jobDescriptionKeywords: AnalysisResult['jobDescriptionKeywords'] = [];
    if (jobDescriptionText) {
      const lowerJobText = jobDescriptionText.toLowerCase();

      // Extract skills by focusing on skills-related sections and using better patterns
      const extractSkillsFromJobDescription = (text: string): string[] => {
        const lowerText = text.toLowerCase();

        // Find skills sections (common section headers)
        const skillsSectionPatterns = [
          /skills?[:\s]*(required|needed|preferred)?[:\s]*/gi,
          /requirements?[:\s]*/gi,
          /qualifications?[:\s]*/gi,
          /technical skills?[:\s]*/gi,
          /key skills?[:\s]*/gi,
          /competencies?[:\s]*/gi,
          /what you'll need[:\s]*/gi,
          /what we look for[:\s]*/gi,
          /experience with[:\s]*/gi
        ];

        let skillsText = '';
        let foundSection = false;

        // Extract content from skills sections
        for (const pattern of skillsSectionPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            foundSection = true;
            // Extract content after the section header
            const sections = text.split(pattern);
            if (sections.length > 1) {
              // Take the next few paragraphs after the header
              const sectionContent = sections.slice(1).join(' ').substring(0, 2000);
              skillsText += sectionContent + ' ';
            }
          }
        }

        // If no specific sections found, look for common skill indicators throughout the text
        if (!foundSection) {
          // Look for bullet points and numbered lists that often contain skills
          const bulletPatterns = [
            /(?:^|\n)[•\-\*\d+\.\)]\s*([^\n]+)/gm,
            /(?:proficiency|experience|knowledge|skills?) (?:in|with|of) ([^,\.\n]+)/gi,
            /familiarity with ([^,\.\n]+)/gi,
            /working knowledge of ([^,\.\n]+)/gi
          ];

          for (const pattern of bulletPatterns) {
            const matches = text.match(pattern);
            if (matches) {
              skillsText += matches.join(' ') + ' ';
            }
          }
        }

        // If still no skills found, use the entire text but prioritize technical content
        if (!skillsText.trim()) {
          skillsText = text;
        }

        // Extract potential skills using various patterns
        const skillPatterns = [
          // Programming languages and frameworks
          /\b(javascript|python|java|c\+\+|c#|php|ruby|go|golang|rust|swift|kotlin|typescript|scala|perl|r|matlab|dart|lua)\b/gi,
          // Web technologies
          /\b(html|css|sass|scss|less|react|angular|vue|jquery|bootstrap|tailwind|webpack|babel|npm|yarn)\b/gi,
          // Databases
          /\b(sql|mysql|postgresql|mongodb|redis|cassandra|elasticsearch|oracle|sqlite|dynamodb)\b/gi,
          // Cloud platforms
          /\b(aws|azure|gcp|google cloud|heroku|digitalocean|linode|vercel|netlify)\b/gi,
          // DevOps tools
          /\b(docker|kubernetes|jenkins|gitlab|github actions|circleci|travis|terraform|ansible|puppet|chef)\b/gi,
          // Version control
          /\b(git|svn|mercurial|bitbucket|github|gitlab)\b/gi,
          // Operating systems
          /\b(linux|windows|macos|ubuntu|centos|debian|redhat|fedora)\b/gi,
          // Soft skills and methodologies
          /\b(agile|scrum|kanban|tdd|bdd|ci\/cd|devops|microservices|rest api|graphql|oauth|jwt)\b/gi,
          // Business tools
          /\b(excel|word|powerpoint|outlook|sharepoint|salesforce|sap|oracle erp|jira|confluence|slack|teams)\b/gi,
          // Data and analytics
          /\b(tableau|power bi|looker|qlik|pandas|numpy|tensorflow|pytorch|scikit-learn|matplotlib|seaborn)\b/gi,
          // Design tools
          /\b(figma|sketch|adobe|photoshop|illustrator|indesign|xd|zeplin|invision|maze)\b/gi,
          // Project management
          /\b(jira|trello|asana|monday|basecamp|clickup|notion|microsoft project)\b/gi
        ];

        const extractedSkills: string[] = [];

        // Apply patterns to extract skills
        for (const pattern of skillPatterns) {
          const matches = skillsText.match(pattern);
          if (matches) {
            extractedSkills.push(...matches);
          }
        }

        // Also extract skills from common delimiters in skills sections
        const delimiters = /[,;•\-\*\n\r]+/;
        const rawTerms = skillsText.split(delimiters).map(term => term.trim()).filter(term => term.length > 0);

        // Filter for potential skills (longer terms, technical-looking)
        const potentialSkills = rawTerms.filter(term => {
          const lowerTerm = term.toLowerCase();
          return (
            lowerTerm.length > 2 &&
            lowerTerm.length < 30 &&
            !/\b(and|or|the|a|an|in|on|at|to|for|of|with|by|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|we|you|they|he|she|it|this|that|these|those|i|me|my|your|his|her|its|our|their|us|them|who|what|where|when|why|how|which|all|any|both|each|few|many|most|some|such|no|nor|not|only|own|same|so|than|too|very|just|but|also|even|though|although|while|if|unless|until|before|after|since|because|experience|required|preferred|strong|excellent|good|knowledge|skills|ability|proven|demonstrated|years|months|degree|bachelor|master|phd|certification|license)\b/.test(lowerTerm) &&
            /[a-zA-Z]/.test(lowerTerm) // Must contain letters
          );
        });

        // Combine and deduplicate
        const allSkills = [...extractedSkills, ...potentialSkills]
          .map(skill => skill.toLowerCase().trim())
          .filter(skill => skill.length > 2)
          .filter((skill, index, arr) => arr.indexOf(skill) === index)
          .slice(0, 25); // Limit to 25 skills

        return allSkills;
      };

      const extractedSkills = extractSkillsFromJobDescription(jobDescriptionText);

      // Match skills with resume content
      extractedSkills.forEach(skill => {
        const found = lowerText.includes(skill.toLowerCase());
        jobDescriptionKeywords.push({ word: skill, found, importance: 'important' });
      });
    }

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

    // Ensure total score doesn't exceed max score to keep final percentage at 100 max
    totalScore = Math.min(totalScore, maxScore);

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
      jobDescriptionKeywords,
      sectionScores,
      formatAnalysis
    };
  };

  const analyzeResume = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    try {
      // Extract text from resume file
      const text = await extractTextFromFile(file);
      setResumeText(text);

      // Extract text from job description if provided
      let jobDescText = '';
      if (jobDescriptionFile) {
        jobDescText = await extractTextFromFile(jobDescriptionFile);
        setJobDescriptionText(jobDescText);
      } else if (jobDescriptionTextInput.trim()) {
        jobDescText = jobDescriptionTextInput.trim();
        setJobDescriptionText(jobDescText);
      }

      // Call API to analyze the resume
      const analysisResult = await apiAnalyzeResume(text, jobDescText);

      setResult(analysisResult);

      incrementResumeAnalyzed(user?.id || '', user?.email || '');
      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${analysisResult.score}%!`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the resume. Please try again.",
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

            </CardContent>
          </Card>

          {/* Job Description Upload Card */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Job Description (Optional)
              </CardTitle>
              <CardDescription>
                Upload a job description to get tailored keyword analysis for that specific role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* File Upload */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isJobDescriptionDragging
                      ? 'border-primary bg-primary/5'
                      : jobDescriptionFile
                      ? 'border-success bg-success/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onDragOver={handleJobDescriptionDragOver}
                  onDragLeave={handleJobDescriptionDragLeave}
                  onDrop={handleJobDescriptionDrop}
                  onClick={() => document.getElementById('job-description-upload')?.click()}
                >
                  <input
                    id="job-description-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleJobDescriptionFileSelect}
                  />

                  {jobDescriptionFile ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-success/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{jobDescriptionFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(jobDescriptionFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setJobDescriptionFile(null);
                          setJobDescriptionText('');
                          setResult(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-muted flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Drop job description here</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOCX, or TXT files
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Or Text Input */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                  </div>
                </div>

                <Textarea
                  placeholder="Paste the job description text here..."
                  value={jobDescriptionTextInput}
                  onChange={handleJobDescriptionTextChange}
                  className="min-h-[120px] resize-none"
                />

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
              </div>
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

              {/* Resume Summary */}
              {result.summary && (
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Resume Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                      {result.summary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Content Present & Absent */}
              {(result.contentPresent || result.contentAbsent) && (
                <div className="grid grid-cols-1 gap-4">
                  {result.contentPresent && result.contentPresent.length > 0 && (
                    <Card className="border-0 shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          Content Present
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.contentPresent.map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-full text-sm font-medium bg-success/10 text-success flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {result.contentAbsent && result.contentAbsent.length > 0 && (
                    <Card className="border-0 shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-destructive" />
                          Content Missing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.contentAbsent.map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 rounded-full text-sm font-medium bg-destructive/10 text-destructive flex items-center gap-1.5"
                            >
                              <XCircle className="w-3 h-3" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
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
                  <CardContent className="space-y-3">
                    {result.improvements.map((improvement, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-warning/5 border border-warning/20"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${improvement.priority === 'high' ? 'text-destructive' : improvement.priority === 'medium' ? 'text-warning' : 'text-muted-foreground'}`}>
                              {improvement.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityColor(improvement.priority)}`}>
                              {improvement.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {improvement.description}
                          </p>
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

              {/* Job Description Keywords */}
              {result.jobDescriptionKeywords && result.jobDescriptionKeywords.length > 0 && (
                <Card className="border-0 shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Job-Specific Keywords
                    </CardTitle>
                    <CardDescription>
                      Keywords extracted from the job description (green = found in resume, red = missing)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.jobDescriptionKeywords.map((kw, index) => (
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
                    <p className="text-xs text-muted-foreground mt-3">
                      These keywords are specific to the job you're targeting. Consider incorporating missing ones into your resume.
                    </p>
                  </CardContent>
                </Card>
              )}

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

      {/* AI Chat Bot */}
      <AIChatBot analysisResult={result} resumeText={resumeText} />
    </div>
  );
};

export default ATSAnalyzer;