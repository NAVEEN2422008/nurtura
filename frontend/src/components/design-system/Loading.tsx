import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger'

export interface ToastProps {
  id: string
  message: string
  variant?: ToastVariant
  duration?: number
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export const Toast: React.FC<ToastProps> = ({
  id: _id,
  message,
  variant = 'default',
  duration = 5000,
  onDismiss,
  action,
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onDismiss?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  const variantIcons = {
    default: '💡',
    success: '✅',
    warning: '⚠️',
    danger: '🚨',
  }

  const variantStyles = {
    default: 'bg-slate-900 text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${variantStyles[variant]} rounded-lg shadow-lg p-4 flex items-start gap-4 max-w-md`}
    >
      <span className="text-xl flex-shrink-0">{variantIcons[variant]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {action && (
        <button onClick={action.onClick} className="font-semibold text-sm hover:opacity-80 transition-opacity flex-shrink-0">
          {action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="text-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="Dismiss"
      >
        ×
      </button>
    </motion.div>
  )
}

export interface ToastContainerProps {
  toasts: ToastProps[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-60 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onDismiss={() => onDismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const showToast = (message: string, options?: Partial<ToastProps>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      id,
      message,
      variant: 'default',
      duration: 5000,
      ...options,
    }
    setToasts((prev) => [...prev, newToast])
    return id
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const showSuccess = (message: string) => showToast(message, { variant: 'success' })
  const showWarning = (message: string) => showToast(message, { variant: 'warning' })
  const showError = (message: string) => showToast(message, { variant: 'danger', duration: 7000 })

  return { toasts, showToast, dismissToast, showSuccess, showWarning, showError }
}

// Loading States
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  count?: number
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-6',
  count = 1,
  circle = false,
  className,
  ...props
}) => {
  return (
    <div {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${width} ${circle ? 'rounded-full' : 'rounded-lg'} ${height} ${i > 0 ? 'mt-3' : ''} ${className || ''}`}
        />
      ))}
    </div>
  )
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'primary' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorStyles = {
    primary: 'text-primary',
    white: 'text-white',
  }

  return (
    <svg
      className={`animate-spin-soft ${sizeStyles[size]} ${colorStyles[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage,
  className,
  ...props
}) => {
  const percentage = (value / max) * 100

  return (
    <div {...props} className={`flex flex-col gap-2 ${className || ''}`}>
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && <p className="text-xs text-slate-500">{Math.round(percentage)}%</p>}
    </div>
  )
}
