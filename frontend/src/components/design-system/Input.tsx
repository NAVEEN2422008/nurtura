import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
          )}
          <input
            ref={ref}
            className={`input ${icon && iconPosition === 'left' ? 'pl-12' : ''} ${icon && iconPosition === 'right' ? 'pr-12' : ''} ${error ? 'border-danger focus:ring-danger/15' : ''} ${className || ''}`}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        {hint && <p className="form-hint">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  rows?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, rows = 4, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`textarea ${error ? 'border-danger focus:ring-danger/15' : ''} ${className || ''}`}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
        {hint && <p className="form-hint">{hint}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`select ${error ? 'border-danger focus:ring-danger/15' : ''} ${className || ''}`}
          {...props}
        >
          <option value="">Select {label?.toLowerCase() || 'option'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
        {hint && <p className="form-hint">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, hint, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          className={`checkbox mt-1 ${className || ''}`}
          {...props}
        />
        {label && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 cursor-pointer">{label}</label>
            {hint && <p className="form-hint">{hint}</p>}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, hint, ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="radio"
          className={`radio mt-1 ${className || ''}`}
          {...props}
        />
        {label && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 cursor-pointer">{label}</label>
            {hint && <p className="form-hint">{hint}</p>}
          </div>
        )}
      </div>
    )
  }
)
Radio.displayName = 'Radio'
