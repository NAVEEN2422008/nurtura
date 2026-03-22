import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Pregnancy {
  pregnancyId: string
  currentWeek: number
  trimester: number
  babySize?: string
  expectedDeliveryDate: string
  riskFactors: string[]
  chronicConditions: string[]
  status: string
}

interface AppStore {
  pregnancy: Pregnancy | null
  setPregnancy: (pregnancy: Pregnancy | null) => void
  logout: () => void
  language: string
  setLanguage: (lang: string) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      pregnancy: null,
      setPregnancy: (pregnancy) => set({ pregnancy }),
      logout: () => {
        set({ pregnancy: null })
      },
      language: 'en',
      setLanguage: (lang: string) => set({ language: lang }),
    }),
    {
      name: 'nurtura-app',
      partialize: (state) => ({ language: state.language }),
    }
  )
)
