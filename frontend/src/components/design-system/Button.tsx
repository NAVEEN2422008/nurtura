import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'accent' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon'
type ButtonWidth = 'auto' | 'full'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  width?: ButtonWidth
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-lg hover:shadow-elevated hover:-translate-y-0.5 hover:bg-primary-light',
  secondary: 'bg-white text-primary border-2 border-primary shadow-sm hover:bg-slate-50 hover:shadow-card',
  success: 'bg-success text-white hover:shadow-lg hover:-translate-y-0.5 hover:bg-success-dark',
  warning: 'bg-warning text-white hover:shadow-lg hover:-translate-y-0.5 hover:bg-warning-dark',
  danger: 'bg-danger text-white hover:shadow-lg hover:-translate-y-0.5 hover:bg-danger-dark',
  ghost: 'text-slate-700 hover:bg-white/70 rounded-2xl',
  accent: 'bg-accent text-white shadow-lg hover:shadow-elevated hover:-translate-y-0.5 hover:bg-accent-light',
  outline: 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-primary',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px] min-w-[36px]',
  md: 'px-6 py-3 text-base min-h-[44px] min-w-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px] min-w-[52px]',
  xl: 'px-10 py-5 text-xl min-h-[60px] min-w-[60px]',
  icon: 'p-2 min-h-[40px] min-w-[40px]',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      width = 'auto',
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled = false,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading
    const widthClass = fullWidth ? 'w-full' : width === 'full' ? 'w-full' : 'w-auto'
    
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim()

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5 mr-2"
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
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
