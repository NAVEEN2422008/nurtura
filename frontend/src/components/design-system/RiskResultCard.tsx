import React from 'react'
import { motion } from 'framer-motion'

export type RiskLevel = 'green' | 'yellow' | 'red'

export interface RiskCondition {
  name: string
  probability: number
  recommendation: string
}

export interface RiskResultCardProps {
  riskLevel: RiskLevel
  riskScore: number
  title: string
  description: string
  conditions: RiskCondition[]
  primaryAction?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

const riskConfig = {
  green: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    badge: 'bg-success text-white',
    icon: '✅',
    tone: 'calm',
    emoticon: '😊',
  },
  yellow: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    badge: 'bg-warning text-white',
    icon: '⚠️',
    tone: 'caution',
    emoticon: '🤔',
  },
  red: {
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    badge: 'bg-danger text-white',
    icon: '🚨',
    tone: 'urgent',
    emoticon: '😰',
  },
}

export const RiskResultCard: React.FC<RiskResultCardProps> = ({
  riskLevel,
  riskScore,
  title,
  description,
  conditions,
  primaryAction,
  secondaryAction,
}) => {
  const config = riskConfig[riskLevel]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`border-2 rounded-2xl p-8 ${config.bg} ${config.border}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{config.emoticon}</div>
        <div className={`inline-block ${config.badge} px-4 py-2 rounded-full text-sm font-bold mb-4`}>
          {riskLevel === 'green' && 'Low Risk'}
          {riskLevel === 'yellow' && 'Monitor Carefully'}
          {riskLevel === 'red' && 'Urgent'}
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-lg text-slate-700 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Risk Score */}
      <div className="bg-white/50 rounded-xl p-4 mb-6 text-center">
        <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mb-1">Risk Score</p>
        <div className="text-4xl font-display font-bold text-slate-900">{riskScore}%</div>
        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              riskLevel === 'green'
                ? 'bg-success'
                : riskLevel === 'yellow'
                  ? 'bg-warning'
                  : 'bg-danger'
            }`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
            What This Means
          </h3>
          <div className="space-y-3">
            {conditions.map((condition, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/60 rounded-lg p-4 border border-white/80"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-1">
                    {riskLevel === 'green'
                      ? '✓'
                      : riskLevel === 'yellow'
                        ? '→'
                        : '⚡'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{condition.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{condition.recommendation}</p>
                    {condition.probability && (
                      <p className="text-xs text-slate-500 mt-2">
                        Likelihood: {Math.round(condition.probability * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-100 rounded-lg p-4 mb-6 border-l-4 border-slate-400">
        <p className="text-xs text-slate-700">
          <strong>⚠️ Important:</strong> This is decision support only, not a medical diagnosis. Always consult your
          healthcare provider for personalized advice.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-col sm:flex-row">
        {riskLevel === 'red' && (
          <button className="btn btn-danger btn-lg w-full sm:w-auto">
            🚨 Call Emergency Services
          </button>
        )}
        {primaryAction && (
          <button onClick={primaryAction.onClick} className="btn btn-primary btn-lg flex-1 sm:flex-none">
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="btn btn-secondary btn-lg flex-1 sm:flex-none">
            {secondaryAction.label}
          </button>
        )}
      </div>

      {/* Support Message */}
      <div className="mt-6 text-center text-sm text-slate-600">
        {riskLevel === 'green' && "✨ Keep up with your regular prenatal care!"}
        {riskLevel === 'yellow' && "📋 Your provider will give you next steps."}
        {riskLevel === 'red' && "🏥 Your safety is our priority. Seek help now."}
      </div>
    </motion.div>
  )
}
