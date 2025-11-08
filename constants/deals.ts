export interface FreeItem {
  id: string
  name: string
}

export interface Deal {
  id: string
  restaurantId: string
  title: string
  description: string
  icon?: string
  buttonText?: string
  buttonLink?: string
  minimumPurchase?: number
  freeItemId?: string
  freeItemName?: string
  freeItems?: FreeItem[]
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  maximumDiscount?: number
  promocode?: string
}

export const dashpassDeal: Deal = {
  id: "dashpass-delivery-fee",
  restaurantId: "all", // Special value to indicate it applies to all restaurants
  title: "Get $0 delivery fees with DashPass",
  description: "Plus, low service fees. Sign up now.",
  icon: "/dashpass-icon-green.svg",
  buttonText: "Sign Up",
  buttonLink: "/dashpass",
  promocode: "DASHPASS",
}

export const deals: Deal[] = [
  {
    id: "hungry-jacks-discount",
    restaurantId: "hungry-jacks",
    title: "20% off, up to $20",
    description: "Limited time offer on your first order. Maximum discount $20.",
    discountType: "percentage",
    icon: "/offer-icon.svg",
    discountValue: 20,
    maximumDiscount: 20,
    buttonText: "",
    buttonLink: "#",
    promocode: "HJ20OFF",
  },
  {
    id: "lava-wings-free-cheese-fries",
    restaurantId: "lava-wings",
    title: "Free Cheese Fries on orders $40+",
    description: "Purchase over $40 and get Cheese Fries free",
    minimumPurchase: 40,
    freeItemId: "cheese-fries",
    freeItemName: "Cheese Fries",
    freeItems: [
      { id: "cheese-fries", name: "Cheese Fries" }
    ],
    icon: "/offer-icon.svg",
    buttonText: "See items",
    buttonLink: "#",
    promocode: "LWFRY40",
  },
  {
    id: "il-canto-cafe-discount",
    restaurantId: "il-canto-cafe",
    title: "15% off on orders $25+",
    description: "Get 15% off when you spend $25 or more. Maximum discount $10.",
    icon: "/offer-icon.svg",
    minimumPurchase: 25,
    discountType: "percentage",
    discountValue: 15,
    maximumDiscount: 10,
    buttonText: "",
    buttonLink: "#",
    promocode: "ICC15",
  },
  {
    id: "gateway-croissant-discount",
    restaurantId: "gateway-croissant",
    title: "$5 off on orders $20+",
    description: "Save $5 when you spend $20 or more at Gateway Croissant",
    icon: "/offer-icon.svg",
    minimumPurchase: 20,
    discountType: "fixed",
    discountValue: 5,
    buttonText: "",
    buttonLink: "#",
    promocode: "GC5OFF",
  },
  {
    id: "philz-coffee-discount",
    restaurantId: "philz-coffee",
    title: "20% off on orders $30+",
    description: "Enjoy 20% off when you spend $30 or more. Maximum discount $12.",
    icon: "/offer-icon.svg",
    minimumPurchase: 30,
    discountType: "percentage",
    discountValue: 20,
    maximumDiscount: 12,
    buttonText: "",
    buttonLink: "#",
    promocode: "PHILZ20",
  },
  {
    id: "lava-wings-free-caesar-salad",
    restaurantId: "lava-wings",
    title: "Free Caesar Salad on orders $50+",
    description: "Purchase over $50 and get Caesar Salad free",
    minimumPurchase: 50,
    freeItemId: "lava-wings-caesar-salad",
    freeItemName: "Caesar Salad",
    freeItems: [
      { id: "lava-wings-caesar-salad", name: "Caesar Salad" }
    ],
    icon: "/offer-icon.svg",
    buttonText: "See items",
    buttonLink: "#",
    promocode: "LWCS50",
  },
  {
    id: "il-canto-cafe-free-chipotle-burrito",
    restaurantId: "il-canto-cafe",
    title: "Free item on orders $15+",
    description: "Purchase over $15 and get a free item",
    minimumPurchase: 15,
    freeItemId: "chipotle-burrito",
    freeItemName: "Chipotle Burrito",
    freeItems: [
      { id: "chipotle-burrito", name: "Chipotle Burrito" },
      { id: "chipotle-meatlover-burrito", name: "Chipotle Meatlover Burrito" }
    ],
    icon: "/offer-icon.svg",
    buttonText: "See items",
    buttonLink: "#",
    promocode: "ICCFREE15",
  },
  {
    id: "gateway-croissant-discount-2",
    restaurantId: "gateway-croissant",
    title: "10% off on orders $15+",
    description: "Get 10% off when you spend $15 or more. Maximum discount $5.",
    minimumPurchase: 15,
    discountType: "percentage",
    icon: "/offer-icon.svg",
    discountValue: 10,
    maximumDiscount: 5,
    buttonText: "",
    buttonLink: "#",
    promocode: "GC10",
  },
  // Common deals for all restaurants
  {
    id: "common-save10",
    restaurantId: "",
    title: "10% off on orders $15+",
    description: "Get 10% off on orders over $15. Valid on all restaurants. Maximum discount $20.",
    discountType: "percentage",
    discountValue: 10,
    minimumPurchase: 15,
    maximumDiscount: 20,
    icon: "/offer-icon.svg",
    buttonText: "",
    buttonLink: "#",
    promocode: "SAVE10",
  },
  {
    id: "common-save15",
    restaurantId: "",
    title: "$15 off orders $50+",
    description: "Save $15 on orders over $50. Valid on all restaurants.",
    discountType: "fixed",
    discountValue: 15,
    minimumPurchase: 50,
    icon: "/offer-icon.svg",
    buttonText: "",
    buttonLink: "#",
    promocode: "SAVE15",
  },
]

export const getDealsByRestaurantId = (restaurantId: string): Deal[] => {
  const restaurantDeals = deals.filter((deal) => deal.restaurantId === restaurantId)
  // Always include DashPass deal for all restaurants
  return [...restaurantDeals, dashpassDeal]
}

export const getCommonDeals = (): Deal[] => {
  return deals.filter((deal) => deal.restaurantId === "")
}
