/**
 * Hook to handle user's reduced motion preference
 */
import { useState, useEffect } from 'react';
import { prefersReducedMotion, onReducedMotionChange } from '../utils/accessibility';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const cleanup = onReducedMotionChange(setReducedMotion);
    return cleanup;
  }, []);

  return reducedMotion;
}