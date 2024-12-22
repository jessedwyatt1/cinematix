// src/utils/formatters.ts

/**
 * Format bytes to human readable string with appropriate unit
 */
export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }
  
  /**
   * Format seconds into human readable duration
   */
  export function formatDuration(seconds: number): string {
    if (seconds < 0) return '∞'
    if (seconds === 0) return '0s'
    
    const units = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 },
      { label: 's', seconds: 1 }
    ]
    
    // Find the two largest units that apply
    const parts: string[] = []
    let remainingSeconds = seconds
    
    for (const unit of units) {
      const value = Math.floor(remainingSeconds / unit.seconds)
      if (value > 0) {
        parts.push(`${value}${unit.label}`)
        remainingSeconds %= unit.seconds
        if (parts.length === 2) break
      }
    }
    
    return parts.join(' ')
  }
  
  /**
   * Format a timestamp to relative time string
   */
  export function formatRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp * 1000 // Convert to milliseconds
    
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day
    
    if (diff < minute) {
      return 'just now'
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute)
      return `${minutes}m ago`
    } else if (diff < day) {
      const hours = Math.floor(diff / hour)
      return `${hours}h ago`
    } else if (diff < week) {
      const days = Math.floor(diff / day)
      return `${days}d ago`
    } else if (diff < month) {
      const weeks = Math.floor(diff / week)
      return `${weeks}w ago`
    } else if (diff < year) {
      const months = Math.floor(diff / month)
      return `${months}mo ago`
    } else {
      const years = Math.floor(diff / year)
      return `${years}y ago`
    }
  }