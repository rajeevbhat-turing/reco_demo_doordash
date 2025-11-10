'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';

interface SnackbarState {
  message: string;
  autoHideDuration: number;
}

interface GlobalContextType {
  snackbar: SnackbarState | null;
  setSnackbar: (snackbar: SnackbarState | null) => void;
}

export const GlobalContext = createContext<GlobalContextType>({
  snackbar: null,
  setSnackbar: () => {},
});

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  return (
    <GlobalContext.Provider value={{ snackbar, setSnackbar }}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
