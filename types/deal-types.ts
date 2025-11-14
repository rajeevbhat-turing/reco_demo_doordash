export interface FreeItem {
  id: string
  name: string
}

export interface Deal {
  id: string
  restaurantId: string | null  // null for common deals, string for restaurant-specific deals
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
  minimumPurchase?: number
  freeItems?: FreeItem[]
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  maximumDiscount?: number
  promocode?: string
}

