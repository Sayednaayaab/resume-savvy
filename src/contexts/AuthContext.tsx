// Auth Context - provides authentication state and methods
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Declare global gapi for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin: boolean;
  loginTime: Date;
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

// Mock sessions data for admin dashboard
const mockSessions: Session[] = [
  {
    user: { id: '1', email: 'john.doe@example.com', name: 'John Doe', isAdmin: false, loginTime: new Date('2025-12-20T23:11:00') },
    loginTime: new Date('2025-12-20T23:11:00'),
    logoutTime: new Date('2025-12-20T23:45:00'),
  },
  {
    user: { id: '2', email: 'jane.smith@example.com', name: 'Jane Smith', isAdmin: false, loginTime: new Date('2025-12-20T14:30:00') },
    loginTime: new Date('2025-12-20T14:30:00'),
    logoutTime: new Date('2025-12-20T16:15:00'),
  },
  {
    user: { id: '3', email: 'mike.wilson@example.com', name: 'Mike Wilson', isAdmin: false, loginTime: new Date('2025-12-19T09:00:00') },
    loginTime: new Date('2025-12-19T09:00:00'),
    logoutTime: new Date('2025-12-19T12:30:00'),
  },
  {
    user: { id: '4', email: 'sarah.johnson@example.com', name: 'Sarah Johnson', isAdmin: false, loginTime: new Date('2025-12-18T16:45:00') },
    loginTime: new Date('2025-12-18T16:45:00'),
    logoutTime: new Date('2025-12-18T18:20:00'),
  },
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions] = useState<Session[]>(mockSessions);

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
        callback: (response: any) => {
          // Handle Google sign-in response
          const googleUser: User = {
            id: 'google_' + Date.now(),
            email: response.email,
            name: response.name,
            avatar: response.picture,
            isAdmin: false,
            loginTime: new Date(),
          };

          setUser(googleUser);
          localStorage.setItem('resumeBuilder_user', JSON.stringify(googleUser));
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
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('resumeBuilder_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsAdmin, logout, sessions }}>
      {children}
    </AuthContext.Provider>
  );
};
