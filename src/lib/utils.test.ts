import { cn } from './utils';

describe('cn utility function', () => {
  it('should combine class names correctly', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle empty strings', () => {
    const result = cn('', 'px-2', '', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should merge conflicting tailwind classes', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('should handle false conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class');
  });

  it('should handle objects with class values', () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      'hidden': false,
    });
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).not.toContain('hidden');
  });

  it('should handle array inputs', () => {
    const result = cn(['px-2', 'py-1'], 'text-base');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-base');
  });

  it('should handle null and undefined', () => {
    const result = cn('px-2', null, undefined, 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should resolve to empty string when no valid classes provided', () => {
    const result = cn('', null, undefined);
    expect(result).toBe('');
  });
});
