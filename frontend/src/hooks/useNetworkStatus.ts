import { useEffect, useState } from 'react'

type NetworkStatus = {
  isOnline: boolean
  connectionType: string | null
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnline = () => setIsOnline(navigator.onLine)
    updateOnline()

    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)

    const connection = (navigator as any).connection
    const updateConnection = () => {
      setConnectionType(connection?.effectiveType ?? null)
    }
    if (connection?.addEventListener) {
      updateConnection()
      connection.addEventListener('change', updateConnection)
    }

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [])

  return { isOnline, connectionType }
}

