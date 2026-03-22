import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export interface VoiceInputProps {
  onTranscription: (text: string) => void
  placeholder?: string
  language?: 'en' | 'hi' | 'ta'
  onStart?: () => void
  onStop?: () => void
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscription,
  placeholder: _placeholder = 'Click mic to speak...',
  language = 'en',
  onStart,
  onStop,
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'ta-IN'

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setTranscription('')
      onStart?.()
    }

    recognition.onresult = (event: any) => {
      let finalTranscription = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscription += event.results[i][0].transcript
        }
      }
      setTranscription(finalTranscription)
      if (finalTranscription) {
        onTranscription(finalTranscription)
      }
    }

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
      onStop?.()
    }

    recognition.start()
  }

  const stopListening = () => {
    // Browser API will auto-stop after speech, but provide manual stop
    setIsListening(false)
    onStop?.()
  }

  if (!isSupported) {
    return (
      <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
        <p className="text-sm text-slate-600">Voice input not supported in your browser.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'} flex-1`}
        >
          {isListening ? (
            <>
              <span className="mr-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                >
                  🎤
                </motion.span>
              </span>
              Stop Listening
            </>
          ) : (
            <>
              <span className="mr-2">🎤</span>
              Speak Now
            </>
          )}
        </motion.button>
      </div>

      {isListening && (
        <motion.div className="flex gap-1 justify-center py-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="voice-bar"
              animate={{
                scaleY: [0.4, 1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}

      {transcription && (
        <div className="p-4 bg-soft-mint rounded-lg border border-primary/30">
          <p className="text-xs font-semibold text-slate-600 mb-1">You said:</p>
          <p className="text-base text-slate-900">{transcription}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-danger/10 rounded-lg border border-danger/20">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}
    </div>
  )
}

// Voice waveform indicator
export interface VoiceWaveProps {
  isActive: boolean
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({ isActive }) => {
  if (!isActive) return null

  return (
    <div className="voice-wave">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="voice-bar" />
      ))}
    </div>
  )
}
