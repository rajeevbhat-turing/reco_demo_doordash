export interface StoreInfo {
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

// Collection of stores instead of a single store
export const stores: Record<string, StoreInfo> = {
  "1": {
    id: "1",
    name: "Sprouts Farmers Market",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/71af112e-089d-4f65-ad70-d8675ae55265.jpg",
    rating: 4.8,
    reviewCount: 3500,
    distance: "0.7 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:26 PM",
    expressTime: "Express 56 min",
    maxOrderLimit: 3500.0,
  },
  "2": {
    id: "2",
    name: "Safeway",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png",
    rating: 4.9,
    reviewCount: 4000,
    distance: "1.0 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:04 PM",
    expressTime: "Express 34 min",
    maxOrderLimit: 4000.0,
  },
  "3": {
    id: "3",
    name: "DashMart",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
    rating: 4.7,
    reviewCount: 4500,
    distance: "1.3 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "11:54 AM",
    expressTime: "Express 19 min",
    maxOrderLimit: 4500.0,
  },
  "4": {
    id: "4",
    name: "DoorDash Market",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
    rating: 4.8,
    reviewCount: 5000,
    distance: "1.6 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "11:59 AM",
    expressTime: "Express 24 min",
    maxOrderLimit: 5000.0,
  },
  "5": {
    id: "5",
    name: "Bi-Rite Market",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ada746a6-4410-4b60-858c-6ca4e24e47fd.png",
    rating: 4.9,
    reviewCount: 5500,
    distance: "1.9 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:01 PM",
    expressTime: "Express 31 min",
    maxOrderLimit: 5500.0,
  },
  "6": {
    id: "6",
    name: "Mollie Stone's Markets",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png",
    rating: 4.7,
    reviewCount: 6000,
    distance: "2.2 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:07 PM",
    expressTime: "Express 37 min",
    maxOrderLimit: 6000.0,
  },
  "7": {
    id: "7",
    name: "Target",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
    rating: 4.8,
    reviewCount: 6500,
    distance: "2.5 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:03 PM",
    expressTime: "Fast 33 min",
    maxOrderLimit: 6500.0,
  },
  "8": {
    id: "8",
    name: "Gus's Community Market",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1ad70c1a-791f-46dd-87c7-14a84d427230.jpg",
    rating: 4.9,
    reviewCount: 7000,
    distance: "2.8 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:09 PM",
    expressTime: "Express 39 min",
    maxOrderLimit: 7000.0,
  },
  "9": {
    id: "9",
    name: "Grocery Outlet",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/df09eac7-b06f-4d31-9e18-f7f333d6ebda.png",
    rating: 4.7,
    reviewCount: 7500,
    distance: "3.1 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:21 PM",
    expressTime: "Express 51 min",
    maxOrderLimit: 7500.0,
  },
  "10": {
    id: "10",
    name: "Andronico's Community Markets",
    logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f8d191a0-6f7a-4b6b-b8a6-e1193969e08e.png",
    rating: 4.8,
    reviewCount: 8000,
    distance: "3.4 mi",
    priceLevel: "$$",
    isDashPass: true,
    deliveryTime: "1:17 PM",
    expressTime: "Express 47 min",
    maxOrderLimit: 8000.0,
  },
}

// For backward compatibility
export const storeData = stores["1"]
