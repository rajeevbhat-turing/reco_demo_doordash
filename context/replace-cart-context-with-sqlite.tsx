"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useCartStore, CartItem } from "@/store/cart-store"
import { usePersistedState } from "@/lib/hooks/usePersistedState"
import ReplaceCartModal from "@/components/modals/replace-cart-modal"

interface ReplaceCartContextType {
  showReplaceModal: (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    conflictType?: "restaurant" | "store"
  ) => void
  addItemWithConflictCheck: (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string
  ) => void
}

const ReplaceCartContext = createContext<ReplaceCartContextType | undefined>(undefined)

interface ReplaceCartProviderProps {
  children: ReactNode
  runId?: string
}

export function ReplaceCartProviderWithSQLite({ children, runId }: ReplaceCartProviderProps) {
  // SMART RESET: Clear Zustand state when run_id changes (including browser reopen)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRunId = runId || urlParams.get('run_id');
    
    // Determine current run_id
    const currentRunId = urlRunId || localStorage.getItem('current_run_id') || '00000000-0000-0000-0000-000000000000';
    
    // Check if we need to reset (browser reopen OR run_id change)
    const lastUsedRunId = localStorage.getItem('last_used_run_id');
    const sessionStarted = sessionStorage.getItem('session_started');
    const resetInProgress = sessionStorage.getItem('reset_in_progress');
    
    // Reset if: 1) run_id changed, OR 2) new browser session (even same run_id)
    // BUT NOT if we're already in the middle of a reset
    if ((currentRunId !== lastUsedRunId || !sessionStarted) && !resetInProgress) {
      const resetReason = currentRunId !== lastUsedRunId ? 'RUN_ID CHANGED' : 'BROWSER REOPENED';
      console.log(`🔄 ${resetReason}: '${lastUsedRunId}' → '${currentRunId}'`);
      
      // Mark reset in progress to prevent infinite loop
      sessionStorage.setItem('reset_in_progress', 'true');
      
      // Clear Zustand's persistence to prevent old items from loading
      localStorage.removeItem('multicategory-cart');
      console.log(`🧹 Cleared Zustand persistence (multicategory-cart)`);
      
      // Clear any other cart-related localStorage keys
      Object.keys(localStorage).forEach(key => {
        if (key.includes('cart') && key !== 'current_run_id' && key !== 'last_used_run_id') {
          localStorage.removeItem(key);
          console.log(`🧹 Cleared cart key: ${key}`);
        }
      });
      
      // Update tracking
      localStorage.setItem('last_used_run_id', currentRunId);
      sessionStorage.setItem('session_started', 'true');
      console.log(`✅ Fresh start for run_id: ${currentRunId}`);
      
      // Force reload the page to ensure Zustand reinitializes with empty state
      console.log(`🔄 Forcing page reload to reinitialize Zustand...`);
      window.location.reload();
      return; // Stop execution since page will reload
    } else if (resetInProgress) {
      // Reset completed, clear the flag
      console.log(`✅ Reset completed, clearing reset flag`);
      sessionStorage.removeItem('reset_in_progress');
    } else {
      console.log(`🔄 Same session, same run_id: ${currentRunId} (preserving state)`);
    }
    
    // Always set current_run_id for SQLite sync
    localStorage.setItem('current_run_id', currentRunId);
  }

  // Use run_id manager to get current run_id
  const [currentRunId, setCurrentRunId] = useState<string>('');
  const [isRunIdReady, setIsRunIdReady] = useState<boolean>(false);
  
  // Session-based run_id logic with mode tracking
  useEffect(() => {
    const initializeRunId = () => {
      try {
        // Get URL run_id
        const urlParams = new URLSearchParams(window.location.search);
        const urlRunId = runId || urlParams.get('run_id');
        
        // Get current session state (use localStorage to share between tabs)
        const sessionMode = localStorage.getItem('session_mode');
        const currentSessionRunId = localStorage.getItem('current_run_id');
        
        console.log(`🔍 Cart Context Debug - URL: ${window.location.href}`);
        console.log(`🔍 Cart Context Debug - urlRunId: '${urlRunId}', sessionMode: '${sessionMode}', currentSessionRunId: '${currentSessionRunId}'`);
        
        let finalRunId: string;
        let shouldResetLocalStorage = false;
        
        if (!sessionMode) {
          // First visit - establish session mode
          if (urlRunId) {
            console.log(`🆕 Starting NEW session WITH run_id: ${urlRunId}`);
            localStorage.setItem('session_mode', 'with-run-id');
            localStorage.setItem('current_run_id', urlRunId);
            finalRunId = urlRunId;
            shouldResetLocalStorage = true;
          } else {
            console.log('🆕 Starting NEW session WITHOUT run_id (static UUID)');
            localStorage.setItem('session_mode', 'without-run-id');
            localStorage.setItem('current_run_id', '00000000-0000-0000-0000-000000000000');
            finalRunId = '00000000-0000-0000-0000-000000000000';
            shouldResetLocalStorage = true;
          }
        } else if (sessionMode === 'with-run-id') {
          // Session started with run_id
          if (urlRunId) {
            // New run_id provided in with-run-id session
            if (urlRunId !== currentSessionRunId) {
              console.log(`🔄 WITH-RUN-ID session: Switching from '${currentSessionRunId}' to '${urlRunId}'`);
              localStorage.setItem('current_run_id', urlRunId);
              finalRunId = urlRunId;
              shouldResetLocalStorage = true;
            } else {
              console.log(`✅ WITH-RUN-ID session: Same run_id '${urlRunId}' - preserving state`);
              finalRunId = urlRunId;
            }
          } else {
            // No run_id in URL, use current session run_id
            console.log(`✅ WITH-RUN-ID session: No URL run_id, using session run_id '${currentSessionRunId}'`);
            finalRunId = currentSessionRunId || '00000000-0000-0000-0000-000000000000';
          }
        } else if (sessionMode === 'without-run-id') {
          // Session started without run_id
          if (urlRunId) {
            // SWITCH SESSION MODE: without-run-id → with-run-id
            console.log(`🔀 MODE CHANGE: WITHOUT-RUN-ID → WITH-RUN-ID using '${urlRunId}'`);
            localStorage.setItem('session_mode', 'with-run-id');
            localStorage.setItem('current_run_id', urlRunId);
            finalRunId = urlRunId;
            shouldResetLocalStorage = true;
          } else {
            // Continue using static UUID
            console.log('✅ WITHOUT-RUN-ID session: Using static UUID');
            finalRunId = '00000000-0000-0000-0000-000000000000';
          }
        } else {
          // Fallback
          finalRunId = '00000000-0000-0000-0000-000000000000';
        }
        
        // Reset localStorage if needed (session mode changes)
        if (shouldResetLocalStorage) {
          console.log(`🧹 Resetting localStorage for session mode change to: '${finalRunId}'`);
          
          // Save session tracking before clearing
          const savedSessionMode = localStorage.getItem('session_mode');
          const savedCurrentRunId = localStorage.getItem('current_run_id');
          
          // Clear localStorage
          localStorage.clear();
          
          // Restore session tracking and set new run_id
          localStorage.setItem('session_mode', savedSessionMode || 'without-run-id');
          localStorage.setItem('current_run_id', savedCurrentRunId || finalRunId);
        } else {
          console.log(`🔄 Session mode unchanged for run_id: '${finalRunId}'`);
        }
        
        setCurrentRunId(finalRunId);
        setIsRunIdReady(true);
        
        // CRITICAL FIX: Force clear Zustand cart state if we detected a run_id change
        const lastUsedRunId = localStorage.getItem('last_used_run_id');
        if (finalRunId !== lastUsedRunId) {
          console.log(`🧹 Forcing Zustand cart clear for run_id change: ${finalRunId}`);
          clearCart(); // Clear Zustand's in-memory cart state
        }
        
        console.log(`🔄 Cart context initialized - Mode: ${localStorage.getItem('session_mode')}, Run ID: ${finalRunId}`);
      } catch (error) {
        console.error('Error initializing run_id in cart context:', error);
        // Fallback
        const fallbackRunId = runId || '00000000-0000-0000-0000-000000000000';
        setCurrentRunId(fallbackRunId);
        setIsRunIdReady(true);
      }
    };

    initializeRunId();
  }, []); // Run only once on mount
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingItem, setPendingItem] = useState<Omit<CartItem, "quantity" | "category"> | null>(null)
  const [pendingCategory, setPendingCategory] = useState<string | undefined>(undefined)
  const [conflictType, setConflictType] = useState<"restaurant" | "store">("store")
  
  const { addItem, checkConflict, replaceCartWithItem, items, clearCart } = useCartStore()
  
  // Get run_id from localStorage (set by the logic above)
  const getImmediateRunId = () => {
    if (typeof window === 'undefined') return 'temp-loading';
    
    const storedRunId = localStorage.getItem('current_run_id');
    return storedRunId || '00000000-0000-0000-0000-000000000000';
  };

  // SQLite persistence with run_id integration
  const [sqliteItems, setSqliteItems] = usePersistedState<CartItem[]>(
    'cart.items', 
    [], 
    { runId: getImmediateRunId() }
  )
  const [sqliteCategory, setSqliteCategory] = usePersistedState<string>(
    'cart.category', 
    'grocery', 
    { runId: getImmediateRunId() }
  )
  
  // Debug logging (commented out to reduce noise)
  // console.log('🔄 Cart context initialized with runId:', currentRunId);
  
  // SQLite sync logic - only sync when run_id is ready
  // Sync Zustand to SQLite (one-way)
  useEffect(() => {
    if (!isRunIdReady) return; // Wait for run_id to be ready
    
    // When Zustand store changes, update SQLite
    if (JSON.stringify(items) !== JSON.stringify(sqliteItems)) {
      console.log('🔄 Syncing Zustand to SQLite:', items.length, 'items for run_id:', currentRunId);
      setSqliteItems(items);
    }
  }, [items, isRunIdReady, currentRunId]); // Removed sqliteItems from deps to prevent loop

  // Sync category separately (one-way)
  useEffect(() => {
    if (!isRunIdReady) return;
    
    const currentCategory = useCartStore.getState().currentCategory;
    if (sqliteCategory !== currentCategory) {
      console.log('🔄 Syncing category to SQLite:', currentCategory, 'for run_id:', currentRunId);
      setSqliteCategory(currentCategory);
    }
  }, [useCartStore().currentCategory, isRunIdReady, currentRunId]); // Removed sqliteCategory from deps

  // NO SQLite → Zustand sync - localStorage is the single source of truth
  // Zustand's built-in persist middleware will handle localStorage → Zustand restoration
  // SQLite is purely for verification and cross-tab persistence, not for restoring UI state

  const showReplaceModal = (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string,
    conflictType: "restaurant" | "store" = "store"
  ) => {
    setPendingItem(item)
    setPendingCategory(category)
    setConflictType(conflictType)
    setIsModalOpen(true)
  }

  const addItemWithConflictCheck = (
    item: Omit<CartItem, "quantity" | "category">, 
    category?: string
  ) => {
    const conflict = checkConflict(item, category as any)
    
    if (conflict.hasConflict && conflict.conflictType) {
      showReplaceModal(item, category, conflict.conflictType)
    } else {
      addItem(item, category as any)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setPendingItem(null)
    setPendingCategory(undefined)
  }

  const handleReplace = () => {
    if (pendingItem) {
      replaceCartWithItem(pendingItem, pendingCategory as any)
    }
    setIsModalOpen(false)
    setPendingItem(null)
    setPendingCategory(undefined)
  }

  return (
    <ReplaceCartContext.Provider value={{ showReplaceModal, addItemWithConflictCheck }}>
      {children}
      <ReplaceCartModal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onReplace={handleReplace}
        sourceType={conflictType}
      />
    </ReplaceCartContext.Provider>
  )
}

export function useReplaceCart() {
  const context = useContext(ReplaceCartContext)
  if (context === undefined) {
    throw new Error("useReplaceCart must be used within a ReplaceCartProvider")
  }
  return context
}
