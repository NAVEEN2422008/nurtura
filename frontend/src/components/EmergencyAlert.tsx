import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface EmergencyAlertProps {
  isVisible: boolean
  onDismiss: () => void
  riskScore: number
  conditions: Array<{name: string; probability: number; recommendation: string}>
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ 
  isVisible, 
  onDismiss, 
  riskScore, 
  conditions 
}) => {
  const [hospitals, setHospitals] = useState<Array<{ name: string; distanceKm: number; rating?: number; phone: string; emergency: boolean }>>([])
  const [hospitalError, setHospitalError] = useState('')

  const topRecommendations = useMemo(() => {
    const recs = conditions
      .map((c) => c.recommendation)
      .filter(Boolean)
      .slice(0, 3)
    return Array.from(new Set(recs))
  }, [conditions])

  useEffect(() => {
    let cancelled = false

    const loadHospitals = async (lat?: number, lng?: number) => {
      try {
        setHospitalError('')
        const qs =
          typeof lat === 'number' && typeof lng === 'number' ? `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}` : ''
        const res = await fetch(`/api/hospitals/nearby${qs}`)
        const data = await res.json()
        // #region agent log
        fetch('http://127.0.0.1:7914/ingest/d6a77df9-41ef-4127-b13c-7e9a9f24285b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'e65389'},body:JSON.stringify({sessionId:'e65389',runId:'run1',hypothesisId:'H6',location:'src/components/EmergencyAlert.tsx:loadHospitals',message:'Hospital finder response',data:{ok:res.ok,status:res.status,hasGeo:typeof lat==='number'&&typeof lng==='number',count:(data?.data?.hospitals??[]).length},timestamp:Date.now()})}).catch(()=>{});
        // #endregion agent log
        if (!res.ok) throw new Error(data?.error || 'Failed to load hospitals')
        if (!cancelled) setHospitals(data?.data?.hospitals ?? [])
      } catch (e: any) {
        if (!cancelled) setHospitalError(e.message || 'Failed to load hospitals')
      }
    }

    if (!navigator.geolocation) {
      loadHospitals()
      return () => {
        cancelled = true
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loadHospitals(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        loadHospitals()
      },
      { enableHighAccuracy: false, timeout: 5000 }
    )

    return () => {
      cancelled = true
    }
  }, [])

  if (!isVisible) return null

  const handleCallEmergency = () => {
    window.open('tel:911', '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 rounded-t-2xl text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              🚨
            </div>
            <div>
              <h2 className="text-2xl font-bold">Emergency Alert</h2>
              <p className="text-sm opacity-90">Risk Score: {riskScore}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-semibold text-red-900 mb-2">⚠️ High Risk Detected</p>
            <ul className="text-sm space-y-1">
              {conditions.slice(0, 3).map((condition, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  • <span>{condition.name}</span> 
                  <span className="text-xs bg-red-100 px-2 py-1 rounded-full">
                    {Math.round(condition.probability * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="font-semibold text-yellow-900 mb-3">Immediate Actions:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside pl-2">
              <li>Stop all activity and rest</li>
              <li>Call your doctor or midwife immediately</li>
              <li>Prepare to go to hospital if instructed</li>
              <li>Have someone with you</li>
            </ol>
            {topRecommendations.length > 0 && (
              <div className="mt-3 text-xs text-yellow-900">
                <p className="font-semibold mb-1">Why this alert triggered:</p>
                <ul className="space-y-1">
                  {topRecommendations.map((r) => (
                    <li key={r}>- {r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Breathing Exercise */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-900 mb-3">🧘 Stay Calm - Breathing Exercise</p>
            <div className="flex items-center gap-3 text-sm">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold"
                animate={{ scale: [1, 1.15, 1.15, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', times: [0, 0.33, 0.66, 1] }}
                aria-label="Guided breathing animation"
              >
                Breathe
              </motion.div>
              <div>
                <p>4 seconds in → 4 seconds hold → 4 seconds out</p>
                <p className="text-xs opacity-75">Repeat 5 times</p>
              </div>
            </div>
          </div>

          {/* Hospitals */}
          <div>
            <p className="font-semibold text-gray-900 mb-3">Nearest Maternity Hospitals:</p>
            <div className="space-y-2">
              {hospitalError && (
                <div className="text-xs text-gray-600">
                  {hospitalError}
                </div>
              )}
              {(hospitals.length ? hospitals : [
                { name: 'City General Hospital', distanceKm: 2.3, phone: '911', emergency: true },
                { name: 'Maternal Care Center', distanceKm: 4.1, phone: '+1-555-0456', emergency: true },
              ]).slice(0, 3).map((hospital, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm">{hospital.name}</p>
                    <p className="text-xs text-gray-600">{hospital.distanceKm.toFixed(1)} km away</p>
                  </div>
                  <div className="text-right">
                    <button 
                      onClick={() => window.open(`tel:${hospital.phone}`, '_blank')}
                      className="text-green-600 hover:text-green-700 font-semibold text-sm"
                    >
                      Call {hospital.phone}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleCallEmergency}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            🚨 Call Emergency (911)
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}

