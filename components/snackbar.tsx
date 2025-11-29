'use client';

import { useEffect } from 'react';
import { useGlobalContext } from '@/app/global-context';

export default function Snackbar() {
  const { snackbar, setSnackbar } = useGlobalContext();

  // Hide snackbar after autoHideDuration
  useEffect(() => {
    if (snackbar) {
      setTimeout(() => {
        setSnackbar(null);
      }, snackbar.autoHideDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar]);

  if (!snackbar) return null;

  return (
    <div className="absolute bottom-4 left-0 right-0 mx-auto px-4 py-2 z-[999] bg-black/80 rounded-md shadow-lg w-fit max-w-lg">
      <div className="text-white text-base font-medium">{snackbar.message}</div>
    </div>
  );
}
