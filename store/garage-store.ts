import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Vehicle } from '@/lib/local-storage'

interface GarageStore {
    likedVehicles: Vehicle[]
    toggleLike: (vehicle: Vehicle) => void
    isLiked: (vehicleId: string) => boolean
    clearGarage: () => void
}

export const useGarageStore = create<GarageStore>()(
    persist(
        (set, get) => ({
            likedVehicles: [],
            toggleLike: (vehicle) => set((state) => {
                const exists = state.likedVehicles.find(v => v.id === vehicle.id)
                if (exists) {
                    return { likedVehicles: state.likedVehicles.filter(v => v.id !== vehicle.id) }
                } else {
                    return { likedVehicles: [...state.likedVehicles, vehicle] }
                }
            }),
            isLiked: (vehicleId) => {
                return get().likedVehicles.some(v => v.id === vehicleId)
            },
            clearGarage: () => set({ likedVehicles: [] })
        }),
        {
            name: 'woody-motors-dream-garage',
        }
    )
)
