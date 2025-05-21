
'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if the component has mounted on the client.
 * Useful for deferring client-side-only rendering logic to prevent hydration mismatches.
 * @returns {boolean} True if the component has mounted, false otherwise.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
