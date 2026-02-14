import { renderHook, act } from '@testing-library/react';
import { useToast } from './use-toast';

describe('useToast hook', () => {
  it('should return toast and dismiss functions', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty('toast');
    expect(result.current).toHaveProperty('dismiss');
  });

  it('should be callable and return an object with id', () => {
    const { result } = renderHook(() => useToast());

    let toastResult: any;
    act(() => {
      toastResult = result.current.toast({
        title: 'Test Toast',
        description: 'Test Description',
      });
    });

    expect(toastResult).toHaveProperty('id');
  });

  it('should support variant prop', () => {
    const { result } = renderHook(() => useToast());

    let toastResult: any;
    act(() => {
      toastResult = result.current.toast({
        title: 'Success',
        description: 'Operation successful',
        variant: 'default',
      });
    });

    expect(toastResult).toHaveProperty('id');
  });

  it('should support dismiss action', () => {
    const { result } = renderHook(() => useToast());

    let toastResult: any;
    act(() => {
      toastResult = result.current.toast({
        title: 'Test',
        description: 'Test',
      });
    });

    expect(toastResult).toHaveProperty('id');

    act(() => {
      result.current.dismiss(toastResult.id);
    });

    // No error should be thrown
    expect(true).toBe(true);
  });

  it('should handle multiple toasts', () => {
    const { result } = renderHook(() => useToast());

    let toast1: any, toast2: any;
    act(() => {
      toast1 = result.current.toast({ title: 'Toast 1' });
      toast2 = result.current.toast({ title: 'Toast 2' });
    });

    expect(toast1.id).not.toBe(toast2.id);
  });
});
