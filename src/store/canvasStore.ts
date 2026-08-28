import { create } from 'zustand'

export type CanvasSection =
  | 'hero'
  | 'movement'
  | 'craftsmanship'
  | 'specs'
  | 'about'
  | 'contact'
  | 'reserve'

interface CanvasStore {
  activeSection: CanvasSection
  isTransitioning: boolean
  setActiveSection: (section: CanvasSection) => void
  setTransitioning: (value: boolean) => void
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  activeSection: 'hero',
  isTransitioning: false,
  setActiveSection: (section) => set({ activeSection: section }),
  setTransitioning: (value) => set({ isTransitioning: value }),
}))
