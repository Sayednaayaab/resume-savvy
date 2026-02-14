import React from 'react';
import { render } from '@testing-library/react';
import { Outlet } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock all heavy dependencies that cause ES module issues
jest.mock('@/pages/BuildResume', () => ({
  default: () => <div>BuildResume</div>,
}));

jest.mock('@/pages/ATSAnalyzer', () => ({
  default: () => <div>ATSAnalyzer</div>,
}));

jest.mock('@/pages/Dashboard', () => ({
  default: () => <div>Dashboard</div>,
}));

jest.mock('@/pages/UserInfo', () => ({
  default: () => <div>UserInfo</div>,
}));

jest.mock('@/pages/Index', () => ({
  default: () => <div>Index</div>,
}));

jest.mock('@/pages/NotFound', () => ({
  default: () => <div>NotFound</div>,
}));

jest.mock('@/components/layout/AppLayout', () => ({
  default: () => <div><Outlet /></div>,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => <div />,
  Outlet: () => <div />,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  QueryClient: jest.fn(() => ({
    prefetchQuery: jest.fn(),
  })),
  useQuery: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: jest.fn(() => ({
    user: null,
    isLoading: false,
  })),
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div />,
}));

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div />,
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App from './App';

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('should render with all providers', () => {
    const { container } = render(<App />);
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('should render BrowserRouter', () => {
    const { container } = render(<App />);
    const element = container.querySelector('div');
    expect(element).toBeInTheDocument();
  });
});
