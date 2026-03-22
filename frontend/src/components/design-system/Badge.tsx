import React from 'react'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-700',
      primary: 'badge-primary',
      secondary: 'bg-slate-200 text-slate-800',
      success: 'badge-success',
      warning: 'badge-warning',
      danger: 'badge-danger',
      accent: 'bg-accent text-white',
    }

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    }

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className || ''}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void
  variant?: 'default' | 'outlined'
  children: React.ReactNode
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, onRemove, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'chip',
      outlined: 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border-2 border-primary text-primary hover:bg-slate-50 transition-all',
    }

    return (
      <div ref={ref} className={`${variantStyles[variant]} ${className || ''}`} {...props}>
        <span>{children}</span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="ml-1 text-sm hover:opacity-70 transition-opacity"
            aria-label="Remove"
          >
            ×
          </button>
        )}
      </div>
    )
  }
)
Chip.displayName = 'Chip'

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={`inline-block bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs font-medium ${className || ''}`}
      {...props}
    >
      {children}
    </span>
  )
)
Tag.displayName = 'Tag'
