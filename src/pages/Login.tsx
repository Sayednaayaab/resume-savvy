import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Mail, Lock, Shield, Sparkles, CheckCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User email/password state
  const [isSignUp, setIsSignUp] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  
  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    // Render Google Sign-In button
    if (window.google && window.google.accounts) {
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
  }, []);

  const handleGoogleLogin = async () => {
    // This will be handled by the rendered button
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    
    if (isSignUp) {
      const success = await signUpWithEmail(userEmail, userPassword, userName);
      if (success) {
        toast({
          title: "Account Created!",
          description: "Welcome to Resume Builder.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Sign Up Failed",
          description: "Please check your details and try again.",
          variant: "destructive",
        });
      }
    } else {
      const success = await loginWithEmail(userEmail, userPassword);
      if (success) {
        toast({
          title: "Welcome Back!",
          description: "You've successfully logged in.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials.",
          variant: "destructive",
        });
      }
    }
    setUserLoading(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    
    const success = await loginAsAdmin(adminEmail, adminPassword);
    
    if (success) {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid admin credentials. Try admin@resume.com / admin123",
        variant: "destructive",
      });
    }
    setAdminLoading(false);
  };

  const features = [
    "Professional resume templates",
    "ATS optimization scoring",
    "Real-time preview",
    "Export to PDF",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Column - User Login (70%) */}
      <div className="flex-1 lg:w-[70%] gradient-hero flex flex-col justify-center items-center p-8 lg:p-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-4">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground">
              Resume Builder
            </h1>
            <p className="text-primary-foreground/70 text-lg">
              Create ATS-optimized resumes in minutes
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-primary-foreground/80"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Auth Options */}
          <div className="space-y-4">
            {/* Google Login Button */}
            <div id="google-signin-button" className="w-full"></div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-primary-foreground/20" />
              <span className="text-primary-foreground/50 text-sm">or</span>
              <div className="flex-1 h-px bg-primary-foreground/20" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                    required={isSignUp}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50" />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={userLoading}
              >
                {userLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <p className="text-center text-primary-foreground/70 text-sm">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>

            <p className="text-center text-primary-foreground/50 text-sm">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>

        {/* Footer branding */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-primary-foreground/40 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Powered by AI Resume Optimization
          </p>
        </div>
      </div>

      {/* Right Column - Admin Login (30%) */}
      <div className="hidden lg:flex lg:w-[30%] bg-card flex-col justify-center p-8 border-l border-border">
        <div className="w-full max-w-sm mx-auto space-y-6 animate-slide-up">
          {/* Admin Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-muted mb-2">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Admin Portal</h2>
            <p className="text-muted-foreground text-sm">
              Access the admin dashboard
            </p>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@resume.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={adminLoading}
            >
              {adminLoading ? 'Signing in...' : 'Admin Login'}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> admin@resume.com / admin123
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Admin Toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 glass border-t border-border">
        <details className="group">
          <summary className="flex items-center justify-center gap-2 text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
            <Shield className="w-4 h-4" />
            Admin Login
          </summary>
          <form onSubmit={handleAdminLogin} className="mt-4 space-y-3">
            <Input
              type="email"
              placeholder="Admin email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="gradient" size="sm" className="w-full">
              Login as Admin
            </Button>
          </form>
        </details>
      </div>
    </div>
  );
};

export default Login;
