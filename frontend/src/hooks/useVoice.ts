import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from './useStore'

type VoiceState = {
  isSupported: boolean
  isListening: boolean
  transcription: string
  error: string
  ttsSupported: boolean
}

const LANG_TO_LOCALE: Record<string, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
}

const getLocale = (lang?: string) => LANG_TO_LOCALE[lang ?? ''] ?? 'en-US'

export const useVoice = (options?: { lang?: string }) => {
  const { language } = useAppStore()
  const activeLang = options?.lang || language || 'en'
  const speechLocale = useMemo(() => getLocale(activeLang), [activeLang])

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState('')
  const [ttsSupported, setTtsSupported] = useState(false)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const hasTts = 'speechSynthesis' in window

    setIsSupported(!!SpeechRecognition)
    setTtsSupported(hasTts)

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.lang = speechLocale

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setTranscription('')
    }
    recognition.onresult = (event: any) => {
      const results = Array.from(event?.results || []) as SpeechRecognitionResult[]
      const text = results
        .map((result) => result?.[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (!text) return
      setTranscription(text)
      const lastResult = results[results.length - 1]
      if (lastResult && 'isFinal' in lastResult && lastResult.isFinal) {
        // No-confirmation: directly accept final transcript
        // Previous isConfirming removed per spec
      }
    }
    recognition.onerror = (event: any) => {
      setError(event?.error || 'Speech recognition error')
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognitionRef.current?.abort()
      } catch {
        // ignore
      }
      recognitionRef.current = null
    }
  }, [speechLocale])

  const startListening = useCallback(() => {
    setError('')
    if (!recognitionRef.current) {
      setError('Speech recognition not supported on this device.')
      return
    }
    try {
      recognitionRef.current.start()
    } catch (e: any) {
      setError(e?.message || 'Unable to start listening')
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const acceptTranscription = useCallback(() => {
    const value = transcription
    return value
  }, [transcription])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setError('Text-to-speech not supported on this device.')
        return false
      }
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = speechLocale
      utterance.rate = 0.95
      utterance.pitch = 1.05
      synth.cancel()
      synth.speak(utterance)
      return true
    },
    [speechLocale]
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
  }, [])

  const clearError = useCallback(() => setError(''), [])

  const state: VoiceState = {
    isSupported,
    isListening,
    transcription,
    error,
    ttsSupported,
  }

  return {
    ...state,
    startListening,
    stopListening,
    acceptTranscription,
    speak,
    stopSpeaking,
    clearError,
  }
}

