import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, TrendingUp, Clock, ArrowRight, Sparkles, Target, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Resumes Created', value: '3', icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'ATS Score Avg', value: '87%', icon: TrendingUp, color: 'bg-success/10 text-success' },
    { label: 'Last Activity', value: '2h ago', icon: Clock, color: 'bg-accent/10 text-accent' },
  ];

  const quickActions = [
    {
      title: 'Build New Resume',
      description: 'Create a professional resume with our AI-powered builder',
      icon: FileText,
      href: '/build',
      variant: 'gradient' as const,
    },
    {
      title: 'Analyze Resume',
      description: 'Check your resume against ATS requirements',
      icon: Search,
      href: '/analyze',
      variant: 'outline' as const,
    },
  ];

  const templates = [
    { name: 'Professional', score: '95% ATS', popular: true },
    { name: 'Modern', score: '92% ATS', popular: false },
    { name: 'Creative', score: '88% ATS', popular: false },
    { name: 'Executive', score: '96% ATS', popular: true },
    { name: 'Minimal', score: '94% ATS', popular: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to create your next winning resume?
          </p>
        </div>
        <Button variant="hero" size="lg" asChild>
          <Link to="/build">
            <Sparkles className="w-5 h-5" />
            Create New Resume
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-card hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card 
              key={index} 
              className="border-0 shadow-card hover:shadow-card-hover transition-all duration-300 group overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl gradient-primary">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-xl mt-4">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant={action.variant} asChild className="w-full">
                  <Link to={action.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates Section */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Featured Templates
              </CardTitle>
              <CardDescription>ATS-optimized templates to get you started</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/build">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {templates.map((template, index) => (
              <div
                key={index}
                className="group relative p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="aspect-[3/4] rounded-lg bg-card border border-border mb-3 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{template.name}</p>
                    {template.popular && (
                      <Zap className="w-3 h-3 text-warning" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{template.score}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="border-0 shadow-card gradient-surface">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pro Tip</h3>
              <p className="text-muted-foreground text-sm">
                Use action verbs like "Led," "Developed," and "Achieved" to make your experience stand out. 
                Our ATS analyzer can help you identify weak phrases in your resume.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
