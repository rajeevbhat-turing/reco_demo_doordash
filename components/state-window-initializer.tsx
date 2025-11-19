'use client';

import { useEffect } from 'react';
import { getStates } from '@/lib/verifier/utils/state-accessor';

export function StateWindowInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).get_states = getStates;
    }
  }, []);

  return null;
}

