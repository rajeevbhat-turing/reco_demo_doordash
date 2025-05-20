export interface Restaurant {
    id: string
    name: string
    logo: string
    banner: string
    bannerUrl: string
    rating: number
    reviews: string
    distance: string
    time: string
    deliveryFee: string
    priceRange: string
    cuisine: string
    dashPass: boolean
    isOpen: boolean
    openingHours: string
    address: string
    phone: string
  }
  
  export const restaurants: Restaurant[] = [
    {
      id: "mcdonalds",
      name: "McDonald's",
      logo: "/placeholder.svg?height=80&width=80&query=kfc logo",
      banner: "/placeholder.svg?height=300&width=1200&query=kfc banner with fried chicken",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 3.8,
      reviews: "200+",
      distance: "0.4 mi",
      time: "31 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "American",
      dashPass: true,
      isOpen: true,
      openingHours: "24 hours",
      address: "123 Main St, Sydney NSW 2000",
      phone: "+61 2 1234 5678",
    },
    {
      id: "hungry-jacks",
      name: "Hungry Jacks",
      logo: "/placeholder.svg?height=80&width=80&query=kfc logo",
      banner: "/placeholder.svg?height=300&width=1200&query=kfc banner with fried chicken",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/123c30bf-3ae2-4b63-ae05-d904350e85ac.png",
      rating: 4.0,
      reviews: "200+",
      distance: "3.8 mi",
      time: "54 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "American",
      dashPass: true,
      isOpen: true,
      openingHours: "6:00 AM - 11:00 PM",
      address: "456 George St, Sydney NSW 2000",
      phone: "+61 2 9876 5432",
    },
    {
      id: "kfc",
      name: "KFC",
      logo: "/placeholder.svg?height=80&width=80&query=kfc logo",
      banner: "/placeholder.svg?height=300&width=1200&query=kfc banner with fried chicken",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 4.2,
      reviews: "300+",
      distance: "2.1 mi",
      time: "38 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "American",
      dashPass: true,
      isOpen: true,
      openingHours: "10:00 AM - 10:00 PM",
      address: "789 Crown St, Sydney NSW 2000",
      phone: "+61 2 3456 7890",
    },
    {
      id: "subway",
      name: "Subway",
      logo: "/placeholder.svg?height=80&width=80&query=subway logo",
      banner: "/placeholder.svg?height=300&width=1200&query=subway banner with sandwiches",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 4.1,
      reviews: "150+",
      distance: "1.2 mi",
      time: "25 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "Sandwiches",
      dashPass: true,
      isOpen: true,
      openingHours: "7:00 AM - 10:00 PM",
      address: "101 Elizabeth St, Sydney NSW 2000",
      phone: "+61 2 2345 6789",
    },
    {
      id: "dominos",
      name: "Domino's Pizza",
      logo: "/placeholder.svg?height=80&width=80&query=dominos pizza logo",
      banner: "/placeholder.svg?height=300&width=1200&query=dominos pizza banner",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 3.9,
      reviews: "250+",
      distance: "1.8 mi",
      time: "45 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "Pizza",
      dashPass: true,
      isOpen: true,
      openingHours: "11:00 AM - 11:00 PM",
      address: "202 Pitt St, Sydney NSW 2000",
      phone: "+61 2 8765 4321",
    },
    {
      id: "guzman-y-gomez",
      name: "Guzman y Gomez",
      logo: "/placeholder.svg?height=80&width=80&query=guzman y gomez logo",
      banner: "/placeholder.svg?height=300&width=1200&query=mexican food banner",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 4.5,
      reviews: "400+",
      distance: "2.5 mi",
      time: "42 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "Mexican",
      dashPass: true,
      isOpen: true,
      openingHours: "11:00 AM - 10:00 PM",
      address: "303 George St, Sydney NSW 2000",
      phone: "+61 2 9876 1234",
    },
    {
      id: "oporto",
      name: "Oporto",
      logo: "/placeholder.svg?height=80&width=80&query=oporto logo",
      banner: "/placeholder.svg?height=300&width=1200&query=portuguese chicken banner",
      bannerUrl: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=1000,height=300,format=auto,quality=80/https://doordash-static.s3.amazonaws.com/media/store/header/3463c133-ad91-4e2d-8cc9-bf8ed0cca603.jpg",
      rating: 4.3,
      reviews: "180+",
      distance: "1.5 mi",
      time: "35 min",
      deliveryFee: "A$0 delivery fee",
      priceRange: "$$",
      cuisine: "Portuguese",
      dashPass: true,
      isOpen: true,
      openingHours: "10:00 AM - 9:00 PM",
      address: "404 Market St, Sydney NSW 2000",
      phone: "+61 2 1234 9876",
    },
  ]
  
  export const getRestaurantById = (id: string): Restaurant | undefined => {
    return restaurants.find((restaurant) => restaurant.id === id)
  }
  