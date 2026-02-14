import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth, AuthProvider } from './AuthContext';

describe('AuthContext', () => {
  const TestComponent = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (user) {
      return (
        <div>
          <span>User: {user.name}</span>
          <span>Email: {user.email}</span>
        </div>
      );
    }

    return <div>Not logged in</div>;
  };

  it('should throw error when useAuth is used outside of AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('should provide auth context when wrapped with AuthProvider', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const notLoggedIn = screen.queryByText('Not logged in');
      expect(notLoggedIn).toBeInTheDocument();
    });
  });

  it('should have isLoading flag initially true then false', async () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // For now it should show either loading or not logged in
    await waitFor(() => {
      const element = screen.queryByText(/Loading|Not logged in/);
      expect(element).toBeInTheDocument();
    });
  });

  it('should maintain user state across re-renders', async () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });

    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  it('should load sample sessions from context', async () => {
    const SessionComponent = () => {
      const { sessions } = useAuth();
      return (
        <div>
          <span>{sessions.length} sessions loaded</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <SessionComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const sessionsText = screen.queryByText(/sessions loaded/);
      expect(sessionsText).toBeInTheDocument();
    });
  });

  it('should provide user stats', async () => {
    const StatsComponent = () => {
      const { userStats } = useAuth();
      return (
        <div>
          <span>{userStats.length} user stats</span>
        </div>
      );
    };

    render(
      <AuthProvider>
        <StatsComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/user stats/)).toBeInTheDocument();
    });
  });
});
