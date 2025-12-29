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

    // Financial & Social Fields
    is_installment_available?: boolean
    monthly_installment_value?: number
    view_count?: number
}

export type PartCategory =
    | "ENGINE"
    | "BRAKES"
    | "ELECTRICAL"
    | "SUSPENSION"
    | "BODY"
    | "FILTERS"
    | "FLUIDS"
    | "TRANSMISSION"
    | "ACCESSORIES"
    | "OTHER"

export type StockLevel = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PRE_ORDER"

export type SparePart = {
    id: string
    created_at?: string

    // Basic Info
    name: string
    part_number: string
    category: PartCategory
    brand: string

    // Pricing & Availability
    price: number
    currency: string
    in_stock: boolean
    stock_level: StockLevel

    // Product Details
    description?: string
    specifications?: Record<string, string>
    images: string[]

    // Vehicle Compatibility
    compatible_makes: string[]
    compatible_models: string[]
    compatible_years: string[]
    is_universal: boolean

    // SEO & Metadata
    view_count: number
    featured: boolean
}

export type PartInquiryStatus = "PENDING" | "QUOTED" | "COMPLETED" | "CANCELLED"

export type PartInquiry = {
    id: string
    created_at?: string

    // Part Reference
    part_id: string
    part_name: string
    part_number: string

    // Customer Info
    customer_name: string
    customer_phone: string
    customer_email?: string

    // Inquiry Details
    quantity: number
    vehicle_info?: string
    message?: string

    // Status
    status: PartInquiryStatus
    admin_notes?: string
}
