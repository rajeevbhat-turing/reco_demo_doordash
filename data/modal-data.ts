// Mock data for modals

// Product Detail Modal
export interface RecommendedProduct {
  id: number
  name: string
  price: number
  image: string
}

export interface NutritionInfo {
  servingSize: string
  calories: number
  totalFat: string
  sodium: string
  totalCarbs: string
  sugars: string
  protein: string
}

export const recommendedProducts: RecommendedProduct[] = [
  {
    id: 301,
    name: "Organic Apples",
    price: 1.49,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: 302,
    name: "Whole Wheat Bread",
    price: 3.99,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: 303,
    name: "Orange Juice",
    price: 4.49,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: 304,
    name: "Yogurt",
    price: 1.99,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: 305,
    name: "Cheddar Cheese",
    price: 3.79,
    image: "/placeholder.svg?height=150&width=150",
  },
  {
    id: 306,
    name: "Almond Milk",
    price: 3.29,
    image: "/placeholder.svg?height=150&width=150",
  },
]

// Default nutrition information for products
export const defaultNutritionInfo: Record<number | string, NutritionInfo> = {
  // Bananas
  101: {
    servingSize: "1 medium (118g)",
    calories: 105,
    totalFat: "0.4g",
    sodium: "1mg",
    totalCarbs: "27g",
    sugars: "14g",
    protein: "1.3g",
  },
  // Strawberries
  102: {
    servingSize: "1 cup (152g)",
    calories: 49,
    totalFat: "0.5g",
    sodium: "1mg",
    totalCarbs: "11.7g",
    sugars: "7.4g",
    protein: "1g",
  },
  // Default for other products
  default: {
    servingSize: "1 serving",
    calories: 100,
    totalFat: "0g",
    sodium: "0mg",
    totalCarbs: "0g",
    sugars: "0g",
    protein: "0g",
  },
}

export const getProductNutrition = (productId: number): NutritionInfo => {
  return defaultNutritionInfo[productId] || defaultNutritionInfo.default
}
