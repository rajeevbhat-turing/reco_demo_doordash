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
        
        // Reset localStorage if needed
        if (shouldResetLocalStorage) {
          const lastRunId = localStorage.getItem('last_run_id');
          console.log(`🧹 Resetting localStorage (was: '${lastRunId}', now: '${finalRunId}')`);
          
          // Save session tracking before clearing
          const savedSessionMode = localStorage.getItem('session_mode');
          const savedCurrentRunId = localStorage.getItem('current_run_id');
          
          // Clear localStorage
          localStorage.clear();
          
          // Restore session tracking and set new run_id
          localStorage.setItem('session_mode', savedSessionMode || 'without-run-id');
          localStorage.setItem('current_run_id', savedCurrentRunId || finalRunId);
          localStorage.setItem('last_run_id', finalRunId);
        } else {
          console.log(`🔄 Preserving localStorage for run_id: '${finalRunId}'`);
        }
        
        setCurrentRunId(finalRunId);
        setIsRunIdReady(true);
        
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
  
  // Temporarily disable SQLite persistence to fix startup errors
  // TODO: Re-enable once run_id system is stable
  // const [sqliteItems, setSqliteItems] = usePersistedState<CartItem[]>(
  //   'cart.items', 
  //   [], 
  //   { runId: isRunIdReady ? currentRunId : 'temp-loading' }
  // )
  // const [sqliteCategory, setSqliteCategory] = usePersistedState<string>(
  //   'cart.category', 
  //   'grocery', 
  //   { runId: isRunIdReady ? currentRunId : 'temp-loading' }
  // )
  
  // Debug logging (commented out to reduce noise)
  // console.log('🔄 Cart context initialized with runId:', currentRunId);
  
  // Temporarily disable SQLite sync to fix startup errors
  // TODO: Re-enable once run_id system is stable
  // useEffect(() => {
  //   // When Zustand store changes, update SQLite
  //   if (JSON.stringify(items) !== JSON.stringify(sqliteItems)) {
  //     setSqliteItems(items)
  //   }
  // }, [items, sqliteItems])

  // useEffect(() => {
  //   if (JSON.stringify(sqliteItems) !== JSON.stringify(items)) {
  //     // Clear current cart and add SQLite items
  //     clearCart()
  //     sqliteItems.forEach(item => {
  //       addItem({
  //         id: item.id,
  //         itemName: item.itemName,
  //         price: item.price,
  //         image: item.image,
  //         storeId: item.storeId,
  //         restaurantId: item.restaurantId,
  //       }, item.category as any, item.storeName)
  //     })
  //   }
  // }, [sqliteItems])

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
