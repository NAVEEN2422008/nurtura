import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'muted' | 'glass'
  clickable?: boolean
  children: React.ReactNode
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', clickable = false, children, ...props }, ref) => {
    const variantStyles = {
      default: 'card-surface',
      elevated: 'card-strong',
      muted: 'card-muted',
      glass: 'surface-glass',
    }

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${clickable ? 'cursor-pointer hover:shadow-lg transition-all duration-300' : ''} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, children, ...props }, ref) => (
    <div ref={ref} className={`flex items-start justify-between gap-4 ${className || ''}`} {...props}>
      <div className="flex-1">
        {title && <h3 className="text-lg font-display font-bold text-slate-900">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
)
CardHeader.displayName = 'CardHeader'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`${className || ''}`} {...props}>
      {children}
    </div>
  )
)
CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`border-t border-slate-200 pt-4 ${className || ''}`} {...props}>
      {children}
    </div>
  )
)
CardFooter.displayName = 'CardFooter'
