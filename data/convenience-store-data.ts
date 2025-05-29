export interface ConvenienceStoreInfo {
  id: string
  name: string
  logo: string
  rating: number
  reviewCount: number
  distance: string
  priceLevel: string
  isDashPass: boolean
  deliveryTime: string
  expressTime: string
  maxOrderLimit: number
}

// Collection of convenience stores
export const convenienceStores: Record<string, ConvenienceStoreInfo> = {
  "1": {
    id: "1",
    name: "7-Eleven",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7eleven_logo.png",
    rating: 4.6,
    reviewCount: 2543,
    distance: "0.3 mi",
    priceLevel: "$",
    isDashPass: true,
    deliveryTime: "12:45 PM",
    expressTime: "Express 15 min",
    maxOrderLimit: 500.0,
  },
  "2": {
    id: "2",
    name: "Walgreens",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/walgreens_logo.png",
    rating: 4.7,
    reviewCount: 1876,
    distance: "0.8 mi",
    priceLevel: "$",
    isDashPass: true,
    deliveryTime: "12:52 PM",
    expressTime: "Express 22 min",
    maxOrderLimit: 750.0,
  },
}

// For backward compatibility
export const convenienceStoreData = convenienceStores["1"] 