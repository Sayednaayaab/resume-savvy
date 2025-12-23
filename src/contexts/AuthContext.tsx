// Auth Context - provides authentication state and methods
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Declare global gapi for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

// Helper function to decode base64url
function base64UrlDecode(str: string): string {
  // Replace URL-safe characters with standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if necessary
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return atob(base64);
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  loginTime: Date;
}

interface UserStats {
  email: string;
  resumesCreated: number;
  resumesAnalyzed: number;
}

interface Session {
  user: User;
  loginTime: Date;
  logoutTime?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<boolean>;
  loginAsAdmin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sessions: Session[];
  userStats: UserStats[];
  incrementResumeCreated: (email: string) => void;
  incrementResumeAnalyzed: (email: string) => void;
  getUserStats: (email: string) => UserStats;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>(() => {
    // Load sessions from localStorage on initialization
    const savedSessions = localStorage.getItem('resumeBuilder_sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        // Convert date strings back to Date objects
        return parsedSessions.map((session: any) => ({
          ...session,
          loginTime: new Date(session.loginTime),
          logoutTime: session.logoutTime ? new Date(session.logoutTime) : undefined,
          user: {
            ...session.user,
            loginTime: new Date(session.user.loginTime),
          },
        }));
      } catch (error) {
        // If parsing fails, clear the data and use sample data
        localStorage.removeItem('resumeBuilder_sessions');
      }
    }

    // Initialize with sample data for demo purposes
    const sampleSessions: Session[] = [
      {
        user: {
          id: 'sample_1',
          email: 'john.doe@example.com',
          name: 'John Doe',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1E3A8A&color=fff',
          isAdmin: false,
          loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        logoutTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        user: {
          id: 'sample_2',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=1E3A8A&color=fff',
          isAdmin: false,
          loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        logoutTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        user: {
          id: 'sample_3',
          email: 'mike.johnson@example.com',
          name: 'Mike Johnson',
          avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=1E3A8A&color=fff',
          isAdmin: false,
          loginTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
        loginTime: new Date(Date.now() - 30 * 60 * 1000),
        // No logout time - active session
      },
      {
        user: {
          id: 'sample_4',
          email: 'sarah.wilson@example.com',
          name: 'Sarah Wilson',
          avatar: 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=1E3A8A&color=fff',
          isAdmin: false,
          loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        logoutTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        user: {
          id: 'admin_sample',
          email: 'admin@resume.com',
          name: 'Admin User',
          avatar: 'https://ui-avatars.com/api/?name=Admin&background=1E3A8A&color=fff',
          isAdmin: true,
          loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
        loginTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
        logoutTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
    ];
    // Save sample data to localStorage
    localStorage.setItem('resumeBuilder_sessions', JSON.stringify(sampleSessions));
    return sampleSessions;
  });

  const [userStats, setUserStats] = useState<UserStats[]>(() => {
    // Load user stats from localStorage on initialization
    const savedStats = localStorage.getItem('resumeBuilder_userStats');
    if (savedStats) {
      return JSON.parse(savedStats);
    } else {
      // Initialize with sample data for demo purposes
      const sampleStats: UserStats[] = [
        { email: 'john.doe@example.com', resumesCreated: 3, resumesAnalyzed: 2 },
        { email: 'jane.smith@example.com', resumesCreated: 5, resumesAnalyzed: 4 },
        { email: 'mike.johnson@example.com', resumesCreated: 2, resumesAnalyzed: 1 },
        { email: 'sarah.wilson@example.com', resumesCreated: 7, resumesAnalyzed: 6 },
        { email: 'admin@resume.com', resumesCreated: 0, resumesAnalyzed: 0 },
      ];
      // Save sample data to localStorage
      localStorage.setItem('resumeBuilder_userStats', JSON.stringify(sampleStats));
      return sampleStats;
    }
  });

  // Helper function to add a new session
  const addSession = (loggedInUser: User) => {
    const newSession: Session = {
      user: loggedInUser,
      loginTime: new Date(),
    };
    setSessions(prev => {
      const updatedSessions = [...prev, newSession];
      // Save to localStorage
      localStorage.setItem('resumeBuilder_sessions', JSON.stringify(updatedSessions));
      return updatedSessions;
    });
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('resumeBuilder_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Initialize Google Identity Services
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: '398831575246-k56l7aa7kvs4s0lill4m4na7l1bh1l1a.apps.googleusercontent.com',
        ux_mode: 'popup',
        callback: (response: any) => {
          // Decode the JWT credential
          const jwtParts = response.credential.split('.');
          if (jwtParts.length !== 3) {
            console.error('Invalid JWT format');
            setIsLoading(false);
            return;
          }

          const payload = JSON.parse(base64UrlDecode(jwtParts[1]));

          // Handle Google sign-in response
          const googleUser: User = {
            id: 'google_' + payload.sub,
            email: payload.email,
            name: payload.name,
            avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=1E3A8A&color=fff`,
            isAdmin: false,
            loginTime: new Date(),
          };

          setUser(googleUser);
          localStorage.setItem('resumeBuilder_user', JSON.stringify(googleUser));
          addSession(googleUser);
          setIsLoading(false);
        },
      });
    }

    setIsLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback if Google script not loaded
      console.error('Google Identity Services not loaded');
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get stored sign-up users
    const storedUsers = JSON.parse(localStorage.getItem('resumeBuilder_signup_users') || '[]');
    const matchingUser = storedUsers.find((user: any) => user.email === email && user.password === password);

    if (matchingUser) {
      const emailUser: User = {
        id: 'email_' + Date.now(),
        email: matchingUser.email,
        name: matchingUser.name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(matchingUser.name)}&background=1E3A8A&color=fff`,
        isAdmin: false,
        loginTime: new Date(),
      };

      setUser(emailUser);
      localStorage.setItem('resumeBuilder_user', JSON.stringify(emailUser));
      addSession(emailUser);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    const storedUsers = JSON.parse(localStorage.getItem('resumeBuilder_signup_users') || '[]');
    const existingUser = storedUsers.find((user: any) => user.email === email);

    if (existingUser) {
      setIsLoading(false);
      return false; // Email already exists
    }

    // Mock sign up - in production, create user in backend
    if (email && password.length >= 6 && name) {
      const newUser = {
        email: email,
        password: password,
        name: name,
      };

      // Store sign-up credentials
      storedUsers.push(newUser);
      localStorage.setItem('resumeBuilder_signup_users', JSON.stringify(storedUsers));

      const loggedInUser: User = {
        id: 'email_' + Date.now(),
        email: email,
        name: name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E3A8A&color=fff`,
        isAdmin: false,
        loginTime: new Date(),
      };

      setUser(loggedInUser);
      localStorage.setItem('resumeBuilder_user', JSON.stringify(loggedInUser));
      addSession(loggedInUser);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Demo admin credentials
    if (email === 'admin@resume.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin_' + Date.now(),
        email: email,
        name: 'Admin User',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=1E3A8A&color=fff',
        isAdmin: true,
        loginTime: new Date(),
      };

      setUser(adminUser);
      localStorage.setItem('resumeBuilder_user', JSON.stringify(adminUser));
      // Note: Admin sessions are not recorded to exclude them from user analytics
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    // Update the current session with logout time
    if (user) {
      setSessions(prev => {
        const updatedSessions = prev.map(session =>
          session.user.id === user.id && !session.logoutTime
            ? { ...session, logoutTime: new Date() }
            : session
        );
        // Save to localStorage
        localStorage.setItem('resumeBuilder_sessions', JSON.stringify(updatedSessions));
        return updatedSessions;
      });
    }
    setUser(null);
    localStorage.removeItem('resumeBuilder_user');
  };

  const incrementResumeCreated = (email: string) => {
    setUserStats(prev => {
      const updatedStats = prev.map(stat =>
        stat.email === email
          ? { ...stat, resumesCreated: stat.resumesCreated + 1 }
          : stat
      );
      if (!prev.find(stat => stat.email === email)) {
        updatedStats.push({ email, resumesCreated: 1, resumesAnalyzed: 0 });
      }
      // Save to localStorage
      localStorage.setItem('resumeBuilder_userStats', JSON.stringify(updatedStats));
      return updatedStats;
    });
  };

  const incrementResumeAnalyzed = (email: string) => {
    setUserStats(prev => {
      const updatedStats = prev.map(stat =>
        stat.email === email
          ? { ...stat, resumesAnalyzed: stat.resumesAnalyzed + 1 }
          : stat
      );
      if (!prev.find(stat => stat.email === email)) {
        updatedStats.push({ email, resumesCreated: 0, resumesAnalyzed: 1 });
      }
      // Save to localStorage
      localStorage.setItem('resumeBuilder_userStats', JSON.stringify(updatedStats));
      return updatedStats;
    });
  };

  const getUserStats = (email: string): UserStats => {
    const existing = userStats.find(stat => stat.email === email);
    return existing || { email, resumesCreated: 0, resumesAnalyzed: 0 };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsAdmin, logout, sessions, userStats, incrementResumeCreated, incrementResumeAnalyzed, getUserStats }}>
      {children}
    </AuthContext.Provider>
  );
};
