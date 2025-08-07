import { getOrCreateSessionId } from './auto-sync-middleware'

class CartAutoSync {
  private sessionId: string
  private lastSyncedState: string | null = null
  private syncTimeout: NodeJS.Timeout | null = null
  private isInitialized = false

  constructor() {
    this.sessionId = getOrCreateSessionId()
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    // Wait for the store to be available
    setTimeout(() => {
      this.setupStoreMonitoring()
      this.isInitialized = true
      console.log(`🔄 Auto-sync initialized for session: ${this.sessionId.slice(-8)}`)
    }, 1000)
  }

  private setupStoreMonitoring() {
    // Import the store dynamically to avoid circular dependencies
    import('@/store/cart-store').then(({ useCartStore }) => {
      // Subscribe to store changes
      useCartStore.subscribe((state) => {
        this.scheduleSync(state)
      })

      // Initial sync
      const initialState = useCartStore.getState()
      this.scheduleSync(initialState)
    }).catch(console.error)
  }

  private scheduleSync(state: any) {
    // Clear existing timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }

    // Schedule sync after debounce period
    this.syncTimeout = setTimeout(() => {
      this.syncToDatabase(state)
    }, 2000)
  }

  private async syncToDatabase(state: any) {
    try {
      // Only sync if state actually changed
      const currentStateStr = JSON.stringify(state)
      if (currentStateStr === this.lastSyncedState) {
        return
      }

      const response = await fetch('/api/state-auto-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.sessionId,
          state: state,
          timestamp: Date.now()
        })
      })

      if (response.ok) {
        this.lastSyncedState = currentStateStr
        console.log(`🔄 State synced for session: ${this.sessionId.slice(-8)}`)
      } else {
        console.warn('State sync failed:', response.status)
      }
    } catch (error) {
      console.warn('Failed to sync state:', error)
    }
  }

  getSessionId(): string {
    return this.sessionId
  }
}

// Create singleton instance
export const cartAutoSync = new CartAutoSync()

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  cartAutoSync.init()
} 