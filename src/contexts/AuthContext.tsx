import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=1E3A8A&color=fff',
      isAdmin: false,
      loginTime: new Date(),
    };
    
    setUser(mockUser);
    localStorage.setItem('resumeBuilder_user', JSON.stringify(mockUser));
    setIsLoading(false);
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
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginAsAdmin, logout, sessions }}>
      {children}
    </AuthContext.Provider>
  );
};
