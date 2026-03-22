import React from 'react'
import { motion } from 'framer-motion'

export type Severity = 'mild' | 'moderate' | 'severe'

export interface SeverityScaleProps {
  value: Severity | ''
  onChange: (severity: Severity) => void
  label?: string
  hint?: string
  error?: string
}

export const SeverityScale: React.FC<SeverityScaleProps> = ({
  value,
  onChange,
  label,
  hint,
  error,
}) => {
  const options = [
    { value: 'mild' as const, label: 'Mild', emoji: '😊', description: "I can manage it" },
    { value: 'moderate' as const, label: 'Moderate', emoji: '😟', description: "It's affecting me" },
    { value: 'severe' as const, label: 'Severe', emoji: '😣', description: "It's really hard" },
  ]

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <label className="form-label">
          {label}
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <span className="text-danger ml-1">*</span>
        </label>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              value === option.value
                ? 'border-primary bg-primary/10'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
            type="button"
          >
            <span className="text-3xl">{option.emoji}</span>
            <span className="text-sm font-bold text-slate-900">{option.label}</span>
            <span className="text-xs text-slate-600">{option.description}</span>
          </motion.button>
        ))}
      </div>

      {error && <p className="form-error">{error}</p>}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  )
}

// Visual scale (1-10)
export interface VisualScaleProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
}

export const VisualScale: React.FC<VisualScaleProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label,
}) => {
  const getEmoji = (v: number) => {
    if (v <= 2) return '😊'
    if (v <= 4) return '🙂'
    if (v <= 6) return '😐'
    if (v <= 8) return '😟'
    return '😣'
  }

  return (
    <div className="flex flex-col gap-4">
      {label && <label className="form-label">{label}</label>}

      <div className="flex items-center gap-4">
        <span className="text-4xl">{getEmoji(value)}</span>
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-success via-warning to-danger rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>
        <div className="text-center min-w-12">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-xs text-slate-600"> / {max}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 px-1">
        <span>Not at all</span>
        <span>Unbearable</span>
      </div>
    </div>
  )
}
