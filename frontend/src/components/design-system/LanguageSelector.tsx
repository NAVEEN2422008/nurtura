import React from 'react'
import { motion } from 'framer-motion'

export type Language = 'en' | 'hi' | 'ta'

export interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  compact?: boolean
}

const languages: Array<{ value: Language; label: string; emoji: string; nativeName: string }> = [
  { value: 'en', label: 'English', emoji: '🇬🇧', nativeName: 'English' },
  { value: 'hi', label: 'हिंदी', emoji: '🇮🇳', nativeName: 'हिंदी' },
  { value: 'ta', label: 'தமிழ்', emoji: '🇮🇳', nativeName: 'தமிழ்' },
]

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex gap-1">
        {languages.map((lang) => (
          <motion.button
            key={lang.value}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLanguageChange(lang.value)}
            className={`px-2 py-1 rounded-lg text-sm font-semibold transition-all ${
              currentLanguage === lang.value
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
            title={lang.nativeName}
          >
            {lang.emoji} {lang.label.substring(0, 2).toUpperCase()}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-700">Language / भाषा / மொழி</label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
          <motion.button
            key={lang.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLanguageChange(lang.value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              currentLanguage === lang.value
                ? 'border-primary bg-primary/10'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl">{lang.emoji}</span>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-900">{lang.label}</div>
              <div className="text-xs text-slate-600">{lang.nativeName}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
