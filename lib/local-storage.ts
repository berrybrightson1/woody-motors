export type Vehicle = {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    transmission: string
    fuel_type: string
    condition: "foreign_used" | "brand_new" | "pre_owned"
    is_duty_paid: boolean
    vin_verified: boolean
    images: string[]
    created_at?: string
    description?: string
    status: string
    engine_size?: string
    vin?: string
}

const STORAGE_KEY = "woodymotors_vehicles_demo"

export const getStoredVehicles = (): Vehicle[] => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    try {
        return JSON.parse(stored)
    } catch (e) {
        console.error("Failed to parse stored vehicles", e)
        return []
    }
}

export const storeVehicle = (vehicle: Vehicle) => {
    if (typeof window === "undefined") return
    const current = getStoredVehicles()
    const updated = [vehicle, ...current]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const deleteStoredVehicle = (id: string) => {
    if (typeof window === "undefined") return
    const current = getStoredVehicles()
    const updated = current.filter(v => v.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
