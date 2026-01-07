import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'suggestion' | 'question' | 'analysis';
}

interface AnalysisResult {
  score: number;
  overallAssessment: string;
  strengths: { title: string; description: string }[];
  improvements: { title: string; description: string; priority: 'high' | 'medium' | 'low' }[];
  keywords: { word: string; found: boolean; importance: 'critical' | 'important' | 'nice-to-have' }[];
  sectionScores: { section: string; score: number; feedback: string }[];
  formatAnalysis: { aspect: string; status: 'good' | 'warning' | 'error'; message: string }[];
}

interface AIChatBotProps {
  analysisResult: AnalysisResult | null;
  resumeText: string;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ analysisResult, resumeText }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate AI response based on user input and analysis results
  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings and conversational starters
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || lowerMessage.includes('greetings')) {
      const score = analysisResult?.score || 0;
      return {
        id: Date.now().toString(),
        content: `Hello! ${analysisResult ? `I see your resume scored ${score}% for ATS compatibility. ` : ''}I'm here to help you optimize your resume. What would you like to know about resume building, ATS optimization, or your analysis results?`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        id: Date.now().toString(),
        content: `You're welcome! I'm glad I could help with your resume optimization. Feel free to ask me anything else about improving your ATS compatibility or resume writing tips.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    // Check for specific questions about resume building
    if (lowerMessage.includes('keyword') || lowerMessage.includes('keywords')) {
      const missingKeywords = analysisResult?.keywords.filter(k => !k.found) || [];
      const foundKeywords = analysisResult?.keywords.filter(k => k.found) || [];

      return {
        id: Date.now().toString(),
        content: `Based on your resume analysis, you have ${foundKeywords.length} relevant keywords present. ${missingKeywords.length > 0 ? `Consider adding these missing keywords: ${missingKeywords.slice(0, 5).map(k => k.word).join(', ')}.` : 'Great job on keyword optimization!'} Keywords are crucial for ATS systems - they help your resume get past automated filters.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (lowerMessage.includes('score') || lowerMessage.includes('improve')) {
      const score = analysisResult?.score || 0;
      const improvements = analysisResult?.improvements || [];

      return {
        id: Date.now().toString(),
        content: `Your resume scored ${score}%. ${score >= 80 ? 'Excellent work!' : score >= 60 ? 'Good foundation with room for improvement.' : 'Significant improvements needed.'} Focus on these high-priority items: ${improvements.filter(i => i.priority === 'high').map(i => i.title).join(', ')}. Start with quantifying achievements and using action verbs.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    if (lowerMessage.includes('format') || lowerMessage.includes('structure')) {
      const formatIssues = analysisResult?.formatAnalysis.filter(f => f.status !== 'good') || [];

      return {
        id: Date.now().toString(),
        content: `For optimal ATS compatibility: Use standard fonts (Arial, Calibri), include clear section headers, and format contact info properly. ${formatIssues.length > 0 ? `Address these format issues: ${formatIssues.map(f => f.aspect).join(', ')}.` : 'Your formatting looks good!'} Remember, ATS systems prefer simple, clean layouts.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
      return {
        id: Date.now().toString(),
        content: `When describing work experience, start each bullet with strong action verbs (Led, Developed, Implemented), quantify your achievements with numbers, and focus on impact rather than just duties. For example: "Increased sales by 35% through targeted marketing campaigns" instead of "Responsible for sales."`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    if (lowerMessage.includes('summary') || lowerMessage.includes('objective')) {
      return {
        id: Date.now().toString(),
        content: `A strong professional summary should be 3-5 sentences highlighting your key strengths, years of experience, and career goals. Include 2-3 relevant keywords and quantify your achievements. Example: "Results-driven software engineer with 5+ years of experience developing scalable web applications. Expertise in React, Node.js, and cloud technologies, delivering projects that increased user engagement by 40%."`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Skills-related questions
    if (lowerMessage.includes('skill') || lowerMessage.includes('skills')) {
      const strengths = analysisResult?.strengths || [];
      const skillStrengths = strengths.filter(s => s.title.toLowerCase().includes('skill') || s.title.toLowerCase().includes('keyword'));

      return {
        id: Date.now().toString(),
        content: `${skillStrengths.length > 0 ? `Your resume shows strong skills in: ${skillStrengths.map(s => s.title).join(', ')}. ` : ''}For ATS optimization, include both technical skills and soft skills relevant to your target job. List them in a dedicated skills section and incorporate keywords from job descriptions. Consider adding proficiency levels for technical skills.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    // Education-related questions
    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('university') || lowerMessage.includes('college')) {
      const sectionScores = analysisResult?.sectionScores || [];
      const educationScore = sectionScores.find(s => s.section.toLowerCase().includes('education'));

      return {
        id: Date.now().toString(),
        content: `Education is important for ATS systems. ${educationScore ? `Your education section ${educationScore.score === 100 ? 'looks complete' : 'needs attention'}. ` : ''}Include your degree, institution, graduation date, and relevant coursework or honors. Place it prominently, especially if you're early in your career. For recent graduates, highlight academic achievements and relevant projects.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Projects-related questions
    if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
      const sectionScores = analysisResult?.sectionScores || [];
      const projectsScore = sectionScores.find(s => s.section.toLowerCase().includes('project'));

      return {
        id: Date.now().toString(),
        content: `Projects demonstrate practical application of skills. ${projectsScore ? `Your projects section ${projectsScore.score === 100 ? 'is well-structured' : 'could be enhanced'}. ` : ''}Include project name, technologies used, your role, and quantifiable results. Focus on recent, relevant projects that showcase your abilities. Use action verbs and metrics to highlight impact.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Strengths and weaknesses
    if (lowerMessage.includes('strength') || lowerMessage.includes('good')) {
      const strengths = analysisResult?.strengths || [];

      return {
        id: Date.now().toString(),
        content: `Your resume has several strengths: ${strengths.map(s => s.title).join(', ')}. ${strengths.length > 0 ? `Keep building on these areas! ` : ''}Strong resumes typically excel in keyword optimization, quantified achievements, and clear formatting.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (lowerMessage.includes('weak') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
      const improvements = analysisResult?.improvements || [];

      return {
        id: Date.now().toString(),
        content: `Areas for improvement include: ${improvements.slice(0, 3).map(i => i.title).join(', ')}. ${improvements.length > 0 ? `Focus on high-priority items first for the biggest impact on your ATS score. ` : ''}Common issues include missing keywords, lack of quantification, and formatting problems.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // General questions
    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      return {
        id: Date.now().toString(),
        content: `I can help you with resume optimization! Ask me about keywords, formatting, experience descriptions, professional summaries, skills, education, projects, or how to improve your ATS score. I can also provide specific suggestions based on your resume analysis.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    // General conversational responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
      return {
        id: Date.now().toString(),
        content: `I'm doing great, thanks for asking! I'm here and ready to help you optimize your resume. ${analysisResult ? `I see you've got a ${analysisResult.score}% ATS compatibility score - that's a good start! ` : ''}What can I help you with today?`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    if (lowerMessage.includes('what can you do') || lowerMessage.includes('what do you do')) {
      return {
        id: Date.now().toString(),
        content: `I'm your AI Resume Assistant! I can help you with:
• Resume optimization for ATS systems
• Keyword analysis and suggestions
• Formatting and structure advice
• Writing better experience descriptions
• Skills and education section guidance
• General career advice

${analysisResult ? `Based on your analysis, I can also give you personalized recommendations to improve your ${analysisResult.score}% ATS score. ` : ''}Just ask me anything!`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (lowerMessage.includes('tell me about') || lowerMessage.includes('explain')) {
      const score = analysisResult?.score || 0;
      return {
        id: Date.now().toString(),
        content: `I'd be happy to explain! ${analysisResult ? `Your resume currently has a ${score}% ATS compatibility score, which means ${score >= 80 ? 'it\'s performing well but could still be optimized' : score >= 60 ? 'there\'s room for improvement in several areas' : 'we should focus on the fundamentals first'}. ` : ''}Could you be more specific about what you'd like me to explain? I can cover topics like ATS systems, resume formatting, keyword optimization, or any other aspect of resume building.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
      return {
        id: Date.now().toString(),
        content: `Great question! ATS (Applicant Tracking Systems) are used by most companies to automatically screen resumes before they reach human recruiters. They look for specific keywords, formatting, and structure. ${analysisResult ? `Your resume scored ${analysisResult.score}% because ${analysisResult.score >= 80 ? 'it has strong keyword matching and good formatting' : 'there are some areas that need attention like keywords or formatting'}. ` : ''}The goal is to make sure your resume gets past these automated filters to reach human eyes.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (lowerMessage.includes('how') && (lowerMessage.includes('start') || lowerMessage.includes('begin'))) {
      const improvements = analysisResult?.improvements || [];
      const highPriority = improvements.filter(i => i.priority === 'high');

      return {
        id: Date.now().toString(),
        content: `Let's get started! ${highPriority.length > 0 ? `I'd recommend beginning with these high-priority improvements: ${highPriority.slice(0, 2).map(i => i.title).join(' and ')}. ` : 'Start by analyzing your resume with our ATS analyzer above. '}Then focus on adding relevant keywords from job descriptions you're interested in. Would you like me to walk you through any specific step?`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      return {
        id: Date.now().toString(),
        content: `I'm glad you're finding this helpful! ${analysisResult ? `With your ${analysisResult.score}% ATS score, you're already on the right track. ` : ''}Remember, small improvements can make a big difference in getting your resume noticed. Is there anything specific you'd like to work on next?`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return {
        id: Date.now().toString(),
        content: `Goodbye! Remember to keep optimizing your resume - small changes can make a big difference. ${analysisResult ? `Come back anytime to improve that ${analysisResult.score}% ATS score! ` : ''}Best of luck with your job search!`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'question'
      };
    }

    // Career-related questions
    if (lowerMessage.includes('job') || lowerMessage.includes('career') || lowerMessage.includes('interview')) {
      return {
        id: Date.now().toString(),
        content: `Career development is so important! ${analysisResult ? `Your ${analysisResult.score}% ATS score shows ${analysisResult.score >= 70 ? 'you\'re well-prepared' : 'there\'s room for improvement'}. ` : ''}Beyond resume optimization, focus on networking, skill development, and tailoring your application to each job. For interviews, practice common questions and prepare stories that demonstrate your achievements with specific metrics.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Time-related questions
    if (lowerMessage.includes('time') || lowerMessage.includes('long') || lowerMessage.includes('quick')) {
      return {
        id: Date.now().toString(),
        content: `Resume optimization doesn't have to take long! ${analysisResult ? `With your current ${analysisResult.score}% score, you could see significant improvements in just 30-60 minutes by focusing on the high-priority items. ` : 'Most people can optimize their resume in 1-2 hours. '}Start with keywords and action verbs, then work on quantifying achievements. Small, consistent improvements add up quickly!`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Encouragement and motivation
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('frustrated')) {
      const score = analysisResult?.score || 0;
      return {
        id: Date.now().toString(),
        content: `I understand - resume optimization can feel overwhelming, but you're making great progress! ${analysisResult ? `Your ${score}% score shows you're already doing many things right. ` : ''}Take it one step at a time. Focus on just one or two improvements today, and you'll see your ATS compatibility grow. Remember, every expert was once a beginner - you've got this!`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Default response with more personalization and engagement
    const score = analysisResult?.score || 0;
    const improvements = analysisResult?.improvements || [];
    const highPriorityImprovements = improvements.filter(i => i.priority === 'high');

    // More engaging default responses
    const defaultResponses = [
      `That's a thoughtful question! ${analysisResult ? `Looking at your ${score}% ATS score, I'd suggest focusing on ${highPriorityImprovements.length > 0 ? highPriorityImprovements[0].title.toLowerCase() : 'keyword optimization'}. ` : ''}What specific aspect of resume building interests you most?`,
      `Interesting! ${analysisResult ? `Your resume analysis shows ${score >= 70 ? 'solid fundamentals' : 'some areas to strengthen'}. ` : ''}I'd love to help you with that. Could you tell me more about what you're trying to achieve?`,
      `Great question! ${analysisResult ? `Based on your ${score}% score, ${highPriorityImprovements.length > 0 ? `prioritizing ${highPriorityImprovements[0].title.toLowerCase()} could really boost your results. ` : ''}` : ''}I'm here to help with any resume-related topic.`,
      `I appreciate you asking! ${analysisResult ? `With your current analysis, I can provide specific advice tailored to your ${score}% ATS compatibility. ` : ''}Feel free to ask about keywords, formatting, experience, skills, or any other resume topic.`
    ];

    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

    return {
      id: Date.now().toString(),
      content: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'question'
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Initial welcome message based on context
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeMessage: Message;

      if (analysisResult) {
        welcomeMessage = {
          id: 'welcome',
          content: `Hi! I've analyzed your resume and gave it a ${analysisResult.score}% ATS compatibility score. I can help you improve it further. Ask me anything about resume optimization, keywords, formatting, or specific suggestions based on your analysis!`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'analysis'
        };
      } else {
        welcomeMessage = {
          id: 'welcome',
          content: `Hi! I'm your AI Resume Assistant. I can help you with resume building tips, ATS optimization strategies, keyword suggestions, and general advice for creating compelling resumes. What would you like to know?`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'question'
        };
      }

      setMessages([welcomeMessage]);
    }
  }, [analysisResult, messages.length]);

  return (
    <div className="w-full">
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Resume Assistant
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'ai' && message.type && (
                        <>
                          {message.type === 'suggestion' && <Lightbulb className="w-3 h-3 text-warning" />}
                          {message.type === 'analysis' && <CheckCircle className="w-3 h-3 text-success" />}
                          {message.type === 'question' && <AlertTriangle className="w-3 h-3 text-info" />}
                        </>
                      )}
                      <span className="text-xs opacity-70">
                        {message.sender === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about resume optimization, keywords, formatting..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ask me anything about improving your resume for ATS systems
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatBot;
