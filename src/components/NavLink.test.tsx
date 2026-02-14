import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavLink } from './NavLink';

describe('NavLink', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render a navigation link', () => {
    renderWithRouter(<NavLink to="/test">Test Link</NavLink>);
    const link = screen.getByRole('link', { name: /test link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should apply className prop', () => {
    renderWithRouter(
      <NavLink to="/test" className="custom-class">
        Test Link
      </NavLink>
    );
    const link = screen.getByRole('link', { name: /test link/i });
    expect(link).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    renderWithRouter(
      <NavLink ref={ref} to="/test">
        Test Link
      </NavLink>
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('A');
  });

  it('should display the correct displayName', () => {
    expect(NavLink.displayName).toBe('NavLink');
  });

  it('should accept data-testid attribute', () => {
    renderWithRouter(
      <NavLink to="/test" data-testid="nav-link">
        Test Link
      </NavLink>
    );
    const link = screen.getByTestId('nav-link');
    expect(link).toBeInTheDocument();
  });

  it('should support activeClassName when link is active', () => {
    renderWithRouter(
      <NavLink
        to="/"
        activeClassName="active-link"
        className="base-class"
        data-testid="nav-link"
      >
        Home
      </NavLink>
    );
    const link = screen.getByTestId('nav-link');
    expect(link).toHaveClass('base-class');
  });

  it('should support pendingClassName when link is pending', () => {
    renderWithRouter(
      <NavLink
        to="/pending"
        pendingClassName="pending-link"
        className="base-class"
      >
        Pending Link
      </NavLink>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('base-class');
  });

  it('should handle children correctly', () => {
    renderWithRouter(
      <NavLink to="/test">
        <span>Child Element</span>
      </NavLink>
    );
    const child = screen.getByText('Child Element');
    expect(child).toBeInTheDocument();
  });
});
