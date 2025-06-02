// Mock data for convenience stores

export function getFilterOptions() {
  return [
    { id: "1", name: "Delivery", icon: "" },
    { id: "3", name: "DashPass", icon: "" },
    { id: "4", name: "Under 30 min", icon: "" },
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
    title: "Essential items from your favorite convenience stores",
    description: "Quick delivery of snacks, drinks, and daily necessities",
    buttonText: "Shop now",
    stores: [
      { name: "CVS", logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/cvs_logo.png" },
      { name: "DashMart", logo: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png" },
    ],
    promos: [
      {
        id: "1",
        title: "Snacks, drinks, and daily essentials from CVS",
        description: "Browse pharmacy items, health products, snacks, beverages, and personal care essentials.",
        buttonText: "Shop CVS",
        backgroundColor: "#e8f3ff",
        buttonColor: "bg-[#cc0000] hover:bg-[#aa0000]",
        textColor: "text-black",
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg",
        logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/cvs_logo.png",
        link: "/convenience/store/cvs"
      },
      {
        id: "2",
        title: "Household items and groceries from DashMart",
        description: "Get cleaning supplies, pantry staples, fresh food, and convenience items delivered fast.",
        buttonText: "Shop DashMart",
        backgroundColor: "#fff5e6",
        buttonColor: "bg-[#eb1700] hover:bg-[#cf1500]",
        textColor: "text-black",
        image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/4b5bba6d-9105-40df-857f-9a0ca362df79-retina-large.png",
        logoImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
        link: "/convenience/store/dashmart"
      }
    ]
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
      title: "Snacks & Drinks from CVS",
      storeName: "CVS",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/cvs_logo.png",
      time: "28 min",
      products: [
        {
          id: "14042403389",
          name: "Lay's Baked Original Potato Crisps",
          price: "$5.99",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg",
          description: "Baked potato chips, 6.25 oz"
        },
        {
          id: "22086361095",
          name: "RXBAR Chocolate Sea Salt Protein Bar",
          price: "$3.49",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/403c5536-c0fe-427c-968b-ada46974d90c-retina-large.jpg",
          description: "Protein bar, 1.8 oz"
        },
        {
          id: "14042250402",
          name: "Gatorade Lemon Lime Bottles",
          price: "$10.79",
          image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8c0159a3-873e-4977-b57d-9331342dcf63-retina-large.jpg",
          description: "Sports drink, 20 fl oz x 8 ct"
        },
        {
          id: "11561471042",
          name: "Coke Soda Bottle",
          price: "$4.19",
          image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/0de78b00-cbfe-43fe-831b-03ae3ce6397a-retina-large.png",
          description: "Classic Coca-Cola bottle"
        }
      ]
    },
    {
      title: "Household Essentials from DashMart",
      storeName: "DashMart",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
      time: "25 min",
      products: [
        {
          id: "11561386364",
          name: "Lucerne Vitamin D Whole Milk Carton",
          price: "$3.89",
          image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/4b5bba6d-9105-40df-857f-9a0ca362df79-retina-large.png",
          description: "Whole milk carton, 1 gallon"
        },
        {
          id: "11561479330",
          name: "Best Foods Real Mayonnaise",
          price: "$4.99",
          image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/c339adb7-4402-4449-98b2-0b10f4f4299e-retina-large.jpg",
          description: "Real mayonnaise, 15 oz jar"
        },
        {
          id: "21136547730",
          name: "Simply All Natural Strawberry Juice Drink",
          price: "$5.39",
          image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/9ec01544-ebc9-4cc2-959e-a2e0c241fad2-retina-large.png",
          description: "Natural strawberry juice drink"
        },
        {
          id: "11561469464",
          name: "Kraft Grated Parmesan Cheese",
          price: "$6.99",
          image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/ca67167c-5f89-4352-9144-adc26189b61a-retina-large.png",
          description: "Grated parmesan cheese"
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