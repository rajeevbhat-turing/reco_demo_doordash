import { StateCreator } from 'zustand'

interface AutoSyncConfig {
  sessionId: string
  syncDebounceMs?: number
  enableLogging?: boolean
}

export const autoSyncMiddleware = <T>(
  config: AutoSyncConfig
) => (
  stateCreator: StateCreator<T>
): StateCreator<T> => (set, get, api) => {
  
  let syncTimeout: NodeJS.Timeout | null = null
  let lastSyncedState: string | null = null

  const syncToDatabase = async (state: T) => {
    try {
      // Only sync if state actually changed
      const currentStateStr = JSON.stringify(state)
      if (currentStateStr === lastSyncedState) {
        if (config.enableLogging) {
          console.log('🔄 State unchanged, skipping sync')
        }
        return
      }

      const response = await fetch('/api/state-auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: config.sessionId,
          state: state,
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        lastSyncedState = currentStateStr
        if (config.enableLogging) {
          console.log(`🔄 State synced for session: ${config.sessionId.slice(-8)}`)
        }
      } else {
        console.warn('State sync failed:', response.status)
      }
    } catch (error) {
      console.warn('Failed to sync state:', error)
      // Don't throw - we don't want to break the UI if sync fails
    }
  }

  // Initial sync when store is created
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const initialState = get()
      syncToDatabase(initialState)
    }, 100)
  }

  return stateCreator(
    (...args) => {
      // Update state first
      set(...args)
      
      // Debounced sync to database
      if (syncTimeout) clearTimeout(syncTimeout)
      syncTimeout = setTimeout(() => {
        const currentState = get()
        syncToDatabase(currentState)
      }, config.syncDebounceMs || 2000)
    },
    get,
    api
  )
}

// Helper function to get or create session ID
export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return 'server-side'
  
  const storageKey = 'doordash-session-id'
  let sessionId = sessionStorage.getItem(storageKey)
  
  if (!sessionId) {
    // Create new session ID using crypto.randomUUID()
    sessionId = `${Date.now()}-${globalThis.crypto.randomUUID().split('-')[0]}`
    sessionStorage.setItem(storageKey, sessionId)
    console.log(`🆔 New session created: ${sessionId}`)
  } else {
    console.log(`🆔 Session restored: ${sessionId}`)
  }
  
  return sessionId
} 