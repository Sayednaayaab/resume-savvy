import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';
import * as AuthContext from '@/contexts/AuthContext';

// Mock the Login component
jest.mock('./Login', () => {
  return function MockLogin() {
    return <div>Login Page</div>;
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Index Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state when isLoading is true', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      loginWithGoogle: jest.fn(),
      loginWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      loginAsAdmin: jest.fn(),
      logout: jest.fn(),
      sessions: [],
      userStats: [],
      incrementResumeCreated: jest.fn(),
      incrementResumeAnalyzed: jest.fn(),
      getUserStats: jest.fn(),
      clearAllData: jest.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should navigate to dashboard when user is logged in', async () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
        loginTime: new Date(),
      },
      isLoading: false,
      loginWithGoogle: jest.fn(),
      loginWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      loginAsAdmin: jest.fn(),
      logout: jest.fn(),
      sessions: [],
      userStats: [],
      incrementResumeCreated: jest.fn(),
      incrementResumeAnalyzed: jest.fn(),
      getUserStats: jest.fn(),
      clearAllData: jest.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show login page when user is not logged in', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      loginWithGoogle: jest.fn(),
      loginWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      loginAsAdmin: jest.fn(),
      logout: jest.fn(),
      sessions: [],
      userStats: [],
      incrementResumeCreated: jest.fn(),
      incrementResumeAnalyzed: jest.fn(),
      getUserStats: jest.fn(),
      clearAllData: jest.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should not navigate when loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      loginWithGoogle: jest.fn(),
      loginWithEmail: jest.fn(),
      signUpWithEmail: jest.fn(),
      loginAsAdmin: jest.fn(),
      logout: jest.fn(),
      sessions: [],
      userStats: [],
      incrementResumeCreated: jest.fn(),
      incrementResumeAnalyzed: jest.fn(),
      getUserStats: jest.fn(),
      clearAllData: jest.fn(),
    } as any);

    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
