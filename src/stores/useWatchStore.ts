import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SavedEvents = {
  watchList: string[]
  airWatchList: number[]
  
  toggleWatch: (key: string) => void
  toggleAirWatch: (id: number) => void
  clearWatch: () => void
  clearAirWatch: () => void
}

export const useWatchStore = create<SavedEvents>()(
  persist(
    (set) => ({
      watchList: [],
      airWatchList: [],

      toggleWatch: (key) => {
        set((saved) => {
          const isSaved = saved.watchList.includes(key)
          let updatedList: string[]

          if (isSaved) {
            updatedList = saved.watchList.filter((item) => item !== key)
          } else {
            updatedList = [...saved.watchList, key]
          }

          return { watchList: updatedList }
        })
      },

      toggleAirWatch: (id) => {
        set((saved) => {
          const isSaved = saved.airWatchList.includes(id)
          let updatedList: number[]

          if (isSaved) {
            updatedList = saved.airWatchList.filter((item) => item !== id)
          } else {
            updatedList = [...saved.airWatchList, id]
          }

          return { airWatchList: updatedList }
        })
      },

      clearWatch: () => {
        set({ watchList: [] })
      },

      clearAirWatch: () => {
        set({ airWatchList: [] })
      },
    }),
    {
      name: 'hazardsense-storage',
    },
  ),
)

export function makeKey(type: string, id: number | string): string {
  return type + '-' + id
}
