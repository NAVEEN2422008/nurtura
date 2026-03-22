import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 ${sizeStyles[size]} w-full mx-4`}
          >
            <div className="card-strong p-6 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                {title && <h2 className="text-2xl font-display font-bold text-slate-900">{title}</h2>}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  isLoading?: boolean
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-2">{description}</p>}
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="btn btn-ghost"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm || onClose}
            className={isDangerous ? 'btn btn-danger' : 'btn btn-primary'}
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  position?: 'bottom' | 'right'
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
}) => {
  const positionStyles = {
    bottom:
      'fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl animate-slide-up',
    right: 'fixed right-0 top-0 bottom-0 max-w-md w-full animate-slide-left',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-30"
          />
          <motion.div
            className={`${positionStyles[position]} bg-white z-40 card-strong`}
            initial={position === 'bottom' ? { y: 500 } : { x: 500 }}
            animate={position === 'bottom' ? { y: 0 } : { x: 0 }}
            exit={position === 'bottom' ? { y: 500 } : { x: 500 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              {title && <h2 className="text-xl font-display font-bold text-slate-900">{title}</h2>}
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
