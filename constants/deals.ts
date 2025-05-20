export interface Deal {
    id: string
    restaurantId: string
    title: string
    description: string
    icon?: string
    buttonText?: string
    buttonLink?: string
  }
  
  export const deals: Deal[] = [
    {
      id: "dashpass-delivery-fee",
      restaurantId: "mcdonalds",
      title: "Get $0 delivery fees with DashPass",
      description: "Plus, low service fees. Sign up now.",
      icon: "/placeholder.svg?height=40&width=40&query=dashpass logo",
      buttonText: "Sign Up",
      buttonLink: "/dashpass",
    },
    {
      id: "mcdonalds-bundle",
      restaurantId: "mcdonalds",
      title: "Bundle Deal: $19.95",
      description: "Get a burger, fries and drink for only $19.95",
      buttonText: "Add to Cart",
      buttonLink: "#",
    },
    {
      id: "hungry-jacks-discount",
      restaurantId: "hungry-jacks",
      title: "20% off, up to A$20",
      description: "Limited time offer on your first order",
      buttonText: "Apply",
      buttonLink: "#",
    },
  ]
  
  export const getDealsByRestaurantId = (restaurantId: string): Deal[] => {
    return deals.filter((deal) => deal.restaurantId === restaurantId)
  }
  