export interface ProductDetail {
  id: number
  pricePerWeight: number
  approximateWeight: number
  isSnap: boolean
  nutritionInfo: {
    servingSize: string
    calories: number
    totalFat: string
    sodium: string
    totalCarbs: string
    sugars: string
    protein: string
  }
}

export const productDetails: Record<number, ProductDetail> = {
  // Green Seedless Grapes
  102: {
    id: 102,
    pricePerWeight: 3.99,
    approximateWeight: 1.92,
    isSnap: true,
    nutritionInfo: {
      servingSize: "1 cup (92g)",
      calories: 62,
      totalFat: "0.3g",
      sodium: "2mg",
      totalCarbs: "16g",
      sugars: "15g",
      protein: "0.6g",
    },
  },
  // Organic Bananas
  101: {
    id: 101,
    pricePerWeight: 0.89,
    approximateWeight: 0.4,
    isSnap: true,
    nutritionInfo: {
      servingSize: "1 medium (118g)",
      calories: 105,
      totalFat: "0.4g",
      sodium: "1mg",
      totalCarbs: "27g",
      sugars: "14g",
      protein: "1.3g",
    },
  },
  // Default for other products
  default: {
    id: 0,
    pricePerWeight: 0,
    approximateWeight: 0,
    isSnap: false,
    nutritionInfo: {
      servingSize: "Not available",
      calories: 0,
      totalFat: "0g",
      sodium: "0mg",
      totalCarbs: "0g",
      sugars: "0g",
      protein: "0g",
    },
  },
}

export const getProductDetail = (productId: number): ProductDetail => {
  return productDetails[productId] || productDetails.default
}
