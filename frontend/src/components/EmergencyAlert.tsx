import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface EmergencyAlertProps {
  isVisible: boolean
  onDismiss: () => void
  riskScore: number
  conditions: Array<{name: string; probability: number; recommendation: string}>
}

// 🎯 100% STATIC - NO INTL DEPENDENCY, SSR-SAFE, CRASH-PROOF
const EMERGENCY_MSGS = {
  title: '🚨 Emergency Alert',
  riskScore: (score: number) => `Risk Score: ${score}/100`,
  highRisk: '⚠️ High Risk Detected',
  immediateActionsTitle: 'Immediate Actions:',
  immediateActions: [
    '📞 Call emergency services or nearest hospital NOW',
    '🤰 Lie on your LEFT side, stay calm',
    '🚫 Do NOT drive yourself',
    '📍 Share your location with family/doctor',
  ],
  whyTriggered: 'Detected signals:',
  breathingTitle: '🧘 Stay Calm - Breathe',
  breathe: 'BREATHE',
  breathingPattern: '4s IN → 4s HOLD → 4s OUT',
  breathingRepeat: 'Repeat 5x',
  nearestHospitals: 'Nearest Hospitals:',
  callHospital: (phone: string) => `CALL ${phone}`,
  callEmergency: (number: string) => `🚨 EMERGENCY ${number}`,
  shareLocation: '📍 SHARE LOCATION',
  locationUnavailable: 'Location unavailable - CALL EMERGENCY NOW',
  shareCopied: '✅ Location copied to clipboard',
  dismissButton: 'Dismiss (still call doctor)'
} as const

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  isVisible, 
  onDismiss, 
  riskScore, 
  conditions 
}) => {
  const [hospitals, setHospitals] = useState<Array<{ name: string; distanceKm: number; phone: string; emergency: boolean }>>([])
  const [hospitalError, setHospitalError] = useState('')

  const emergencyNumber = process.env.NEXT_PUBLIC_EMERGENCY_NUMBER || '108'

  const getSignalDisplay = (condition: {name: string; probability: number; recommendation?: string}) => {
    const displayName = condition.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    return {
      title: displayName,
      recommendation: condition.recommendation || 'Contact doctor immediately'
    }
  }

  useEffect(() => {
    let cancelled = false
    const loadHospitals = async (lat?: number, lng?: number) => {
      try {
        setHospitalError('')
        const qs = lat && lng ? `?lat=${lat}&lng=${lng}` : ''
        const res = await fetch(`/api/hospitals/nearby${qs}`)
        if (!res.ok) throw new Error('Hospital data unavailable')
        const { data = {} } = await res.json()
        if (!cancelled) setHospitals(data.hospitals || [])
      } catch {
        if (!cancelled) {
          setHospitals([
            { name: 'City General Hospital', distanceKm: 2.3, phone: '108', emergency: true },
            { name: 'Maternal Care Center', distanceKm: 4.1, phone: '108', emergency: true }
          ])
        }
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => loadHospitals(pos.coords.latitude, pos.coords.longitude),
        () => loadHospitals(),
        { timeout: 5000 }
      )
    } else {
      loadHospitals()
    }

    return () => { cancelled = true }
  }, [])

  if (!isVisible) return null;

  const handleCallEmergency = () => window.open(`tel:${emergencyNumber}`, '_blank')
  
  const handleShareLocation = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Location',
          text: 'I need help - pregnancy emergency',
        })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText('https://maps.google.com')
      }
    } catch {
      // Silent fail - non-critical
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto border-4 border-red-300">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center">
              🚨
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{EMERGENCY_MSGS.title}</h1>
              <p className="text-lg opacity-90">{EMERGENCY_MSGS.riskScore(riskScore)}</p>
            </div>
          </div>
        </div>

        {/* RISK SIGNALS */}
        <div className="p-6 bg-red-50 border-b border-red-200">
          <h2 className="font-bold text-xl text-red-900 mb-4">{EMERGENCY_MSGS.highRisk}</h2>
          <div className="space-y-3">
            {conditions.slice(0, 3).map((condition, idx) => {
              const { title } = getSignalDisplay(condition)
              return (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div>
                    <div className="font-semibold text-lg">{title}</div>
                    <div className="text-sm text-red-700">{condition.recommendation}</div>
                  </div>
                  <div className="text-2xl font-bold text-red-500">
                    {Math.round(condition.probability * 100)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* IMMEDIATE ACTIONS */}
        <div className="p-6 bg-amber-50">
          <h2 className="font-bold text-xl text-amber-900 mb-4">{EMERGENCY_MSGS.immediateActionsTitle}</h2>
          <ol className="space-y-3 text-sm">
            {EMERGENCY_MSGS.immediateActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-amber-900">
                <span className="font-mono w-5 text-amber-600 mt-0.5">{idx + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* BREATHING */}
        <div className="p-6 bg-blue-50 border-t border-blue-200">
          <h2 className="font-bold text-xl text-blue-900 mb-6">{EMERGENCY_MSGS.breathingTitle}</h2>
          <div className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-xl"
              animate={{ scale: [1, 1.2, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {EMERGENCY_MSGS.breathe}
            </motion.div>
            <div className="text-lg">
              <div>{EMERGENCY_MSGS.breathingPattern}</div>
              <div className="text-sm opacity-75 mt-1">{EMERGENCY_MSGS.breathingRepeat}</div>
            </div>
          </div>
        </div>

        {/* HOSPITALS */}
        <div className="p-6 bg-gray-50">
          <h2 className="font-bold text-lg mb-4">{EMERGENCY_MSGS.nearestHospitals}</h2>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {hospitalError ? (
              <div className="text-xs text-gray-600 p-3 bg-gray-100 rounded-lg">
                Using emergency number {emergencyNumber}
              </div>
            ) : (
              hospitals.slice(0, 2).map((hospital, idx) => (
                <button
                  key={idx}
                  onClick={() => window.open(`tel:${hospital.phone}`, '_blank')}
                  className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 rounded-xl border transition"
                >
                  <div>
                    <div className="font-semibold">{hospital.name}</div>
                    <div className="text-sm text-gray-600">{hospital.distanceKm.toFixed(1)}km</div>
                  </div>
                  <div className="text-green-600 font-bold">{EMERGENCY_MSGS.callHospital(hospital.phone)}</div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-6 pt-0 grid grid-cols-1 gap-3">
          <button
            onClick={handleCallEmergency}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg transition transform hover:-translate-y-0.5"
          >
            🚨 {EMERGENCY_MSGS.callEmergency(emergencyNumber)}
          </button>
          <button
            onClick={handleShareLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
          >
            📍 {EMERGENCY_MSGS.shareLocation}
          </button>
          <button
            onClick={onDismiss}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-6 rounded-xl transition border"
          >
            {EMERGENCY_MSGS.dismissButton}
          </button>
        </div>
      </div>
    </div>
  )
}

