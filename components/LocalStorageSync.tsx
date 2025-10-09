"use client"

import { useEffect, useRef } from 'react'

const queue = new Map() // key -> {key, value}
let flushTimer: NodeJS.Timeout | null = null
let inflight = false

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(flush, 200) // tune 50–400ms
}

function getRunId() {
  return localStorage.getItem("current_run_id") || null
}

async function flush() {
  if (inflight) return
  const run_id = getRunId()
  if (!run_id) {
    // try again shortly
    setTimeout(flush, 100)
    return
  }

  inflight = true
  const items = Array.from(queue.values())
  queue.clear()
  try {
    if (items.length > 0) {
      // Debug Logs
      console.debug("[LocalStorageSync] sending", { run_id, count: items.length })

      await fetch('/api/kv/bulk-upsert', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id, items }),
      })
    }
  } catch (e) {
    console.warn("[LocalStorageSync] failed, requeueing", e)
    // Requeue on failure
    for (const it of items) queue.set(it.key, it)
  } finally {
    inflight = false
  }
}

/**
 * Component that automatically syncs localStorage changes to the database
 * This component is loaded at the root level and monitors all localStorage operations
 */
export default function LocalStorageSync() {
  const originalSetItem = useRef<typeof Storage.prototype.setItem | null>(null)
  const originalRemoveItem = useRef<typeof Storage.prototype.removeItem | null>(null)
  const originalClear = useRef<typeof Storage.prototype.clear | null>(null)

  useEffect(() => {
    // Store original localStorage methods
    originalSetItem.current = Storage.prototype.setItem
    originalRemoveItem.current = Storage.prototype.removeItem
    originalClear.current = Storage.prototype.clear

    // Override setItem to automatically sync to database
    Storage.prototype.setItem = function (key, value) {
      // Call original method
      originalSetItem.current!.call(this, key, value)

      // Only sync if this is localStorage (not sessionStorage)
      if (this === localStorage) {
        try {
          // Parse the value to ensure it's valid JSON
          const parsedValue = JSON.parse(value)
          queue.set(key, { key, value: parsedValue })
          scheduleFlush()
        } catch (e) {
          // If it's not valid JSON, store as string
          queue.set(key, { key, value })
          scheduleFlush()
        }
      }
    }

    // Override removeItem to sync removal to database
    Storage.prototype.removeItem = function (key) {
      // Call original method
      originalRemoveItem.current!.call(this, key)

      // Only sync if this is localStorage
      if (this === localStorage) {
        // Queue removal (set value to null to indicate deletion)
        queue.set(key, { key, value: null })
        scheduleFlush()
      }
    }

    // Override clear to sync all removals
    Storage.prototype.clear = function () {
      // Call original method
      originalClear.current!.call(this)

      // Only sync if this is localStorage
      if (this === localStorage) {
        // Get all keys that were in localStorage before clearing
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          queue.set(key, { key, value: null })
        })
        scheduleFlush()
      }
    }

    // Cleanup function to restore original methods
    return () => {
      if (originalSetItem.current) {
        Storage.prototype.setItem = originalSetItem.current
      }
      if (originalRemoveItem.current) {
        Storage.prototype.removeItem = originalRemoveItem.current
      }
      if (originalClear.current) {
        Storage.prototype.clear = originalClear.current
      }
    }
  }, [])

  // Flush queued writes before tab closes
  useEffect(() => {
    const onUnload = () => {
      if (queue.size === 0) return
      const run_id = getRunId()
      if (!run_id) return
      const items = Array.from(queue.values()).map(({ key, value }) => ({ key, value }))
      navigator.sendBeacon(
        '/api/kv/bulk-upsert',
        new Blob([JSON.stringify({ run_id, items })], { type: "application/json" })
      )
    }
    window.addEventListener("beforeunload", onUnload)
    return () => window.removeEventListener("beforeunload", onUnload)
  }, [])

  // This component doesn't render anything visible
  return null
}
