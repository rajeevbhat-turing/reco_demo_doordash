// Mock data for convenience stores

export function getFilterOptions() {
  return [
    { id: "1", name: "Delivery", icon: "🚚" },
    { id: "3", name: "DashPass", icon: "🔵" },
    { id: "4", name: "Under 30 min", icon: "⏱️" },
    { id: "5", name: "Price: $", icon: "💰" },
  ]
}

export function getAllStores() {
  return [
    {
      id: "1",
      name: "7-Eleven",
      time: "Express 15 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 12:45 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7eleven_logo.png",
      inStorePrice: true,
      discount: "",
      rating: "4.6",
      numRatings: "2,543",
      isSnap: false,
      isDashPass: true,
    },
    {
      id: "2",
      name: "Walgreens",
      time: "Express 22 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 12:52 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/walgreens_logo.png",
      inStorePrice: true,
      discount: "20% off $35+",
      rating: "4.7",
      numRatings: "1,876",
      isSnap: false,
      isDashPass: true,
    },
  ]
}

export function getConvenienceScheduleData() {
  return {
    title: "Schedule your convenience delivery",
    description: "Get your essentials delivered on your schedule",
    buttonText: "Schedule now",
    stores: [
      { name: "7-Eleven", logo: "/placeholder.svg?height=40&width=40" },
      { name: "Walgreens", logo: "/placeholder.svg?height=40&width=40" },
    ],
  }
}

export function getConvenienceFavorites() {
  return [
    {
      id: "1",
      name: "7-Eleven",
      rating: "4.6",
      numRatings: "2.543k+",
      distance: "0.3 mi",
      time: "15 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7eleven_logo.png",
    },
    {
      id: "2",
      name: "Walgreens",
      rating: "4.7",
      numRatings: "1.876k+",
      distance: "0.8 mi",
      time: "22 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/walgreens_logo.png",
    },
  ];
}

export function getFastestNearYou() {
  return [
    {
      id: "1",
      name: "7-Eleven",
      rating: "4.6",
      numRatings: "2.543k+",
      distance: "0.3 mi",
      time: "15 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7eleven_logo.png",
    },
    {
      id: "2",
      name: "Walgreens",
      rating: "4.7",
      numRatings: "1.876k+",
      distance: "0.8 mi",
      time: "22 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/walgreens_logo.png",
    },
  ];
}

export function getProductCarouselData() {
  return [
    {
      title: "Snacks & Drinks from 7-Eleven",
      storeName: "7-Eleven",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7eleven_logo.png",
      time: "15 min",
      products: [
        {
          id: "1",
          name: "Coca-Cola Classic 20oz",
          price: "$2.49",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/coca_cola_20oz.jpg",
          description: "Classic Coca-Cola in 20oz bottle"
        },
        {
          id: "2",
          name: "Doritos Nacho Cheese",
          price: "$3.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/doritos_nacho.jpg",
          description: "Classic nacho cheese flavored tortilla chips"
        },
        {
          id: "3",
          name: "Red Bull Energy Drink",
          price: "$3.29",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/red_bull.jpg",
          description: "Original Red Bull energy drink 8.4oz"
        },
        {
          id: "4",
          name: "Kit Kat Bar",
          price: "$1.79",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/kit_kat.jpg",
          description: "Crispy wafer chocolate bar"
        },
        {
          id: "5",
          name: "Arizona Iced Tea",
          price: "$1.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/arizona_tea.jpg",
          description: "Sweet tea in 23oz can"
        },
        {
          id: "6",
          name: "Pringles Original",
          price: "$2.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/pringles.jpg",
          description: "Original flavored potato crisps"
        }
      ]
    },
    {
      title: "Health & Beauty from Walgreens",
      storeName: "Walgreens",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/walgreens_logo.png",
      time: "22 min",
      products: [
        {
          id: "7",
          name: "Advil Pain Reliever",
          price: "$8.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/advil.jpg",
          description: "Ibuprofen pain reliever, 200mg, 100 tablets"
        },
        {
          id: "8",
          name: "Neutrogena Face Wash",
          price: "$7.49",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/neutrogena.jpg",
          description: "Daily facial cleanser for all skin types"
        },
        {
          id: "9",
          name: "Crest Toothpaste",
          price: "$4.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/crest.jpg",
          description: "Whitening toothpaste with fluoride"
        },
        {
          id: "10",
          name: "Band-Aid Bandages",
          price: "$5.49",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bandaid.jpg",
          description: "Flexible fabric adhesive bandages"
        },
        {
          id: "11",
          name: "Tylenol Extra Strength",
          price: "$9.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/tylenol.jpg",
          description: "Acetaminophen pain reliever, 500mg"
        },
        {
          id: "12",
          name: "Chapstick Lip Balm",
          price: "$2.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/chapstick.jpg",
          description: "Classic moisturizing lip balm"
        }
      ]
    }
  ];
}

export function getConvenienceEssentialsData() {
  return {
    title: "Convenience Essentials",
    description: "Quick delivery of everyday items",
    categories: [
      { name: "Snacks", icon: "🍿" },
      { name: "Drinks", icon: "🥤" },
      { name: "Health", icon: "💊" },
      { name: "Beauty", icon: "��" },
    ],
  }
} 