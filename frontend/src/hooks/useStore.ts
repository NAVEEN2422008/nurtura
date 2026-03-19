import { create } from 'zustand'

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
}

export const useAppStore = create<AppStore>((set) => ({
  pregnancy: null,
  setPregnancy: (pregnancy) => set({ pregnancy }),
  logout: () => {
    set({ pregnancy: null })
  },
}))
