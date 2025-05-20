export interface MenuItem {
    id: string
    restaurantId: string
    name: string
    description: string
    price: string
    image: string
    category: string
    calories?: string
    rating?: number
    ratingCount?: number
    popular?: boolean
    featured?: boolean
  }
  
  export const menuItems: MenuItem[] = [
    // McDonald's Menu Items - Featured Items
    {
      id: "double-quarter-pounder",
      restaurantId: "mcdonalds",
      name: "Double Quarter Pounder",
      description:
        "Two quarter pound beef patties with cheese, onions, pickles, mustard and ketchup on a sesame seed bun.",
      price: "A$17.80",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=60/media/photosV2/5800154f-3f4f-4b5d-99dc-f6583d668337-retina-large.png",
      category: "Featured Items",
      popular: true,
      featured: true,
      calories: "5328 kJ",
    },
    {
      id: "triple-cheeseburger",
      restaurantId: "mcdonalds",
      name: "Triple Cheeseburger",
      description: "Three beef patties with cheese, onions, pickles, mustard and ketchup on a regular bun.",
      price: "A$16.50",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=60/media/photosV2/eb5f2ff7-958b-4734-ad0d-0e9564dc86d9-retina-large.png",
      category: "Featured Items",
      featured: true,
      calories: "4358 kJ",
    },
    {
      id: "double-cheeseburger",
      restaurantId: "mcdonalds",
      name: "Double Cheeseburger",
      description: "Two beef patties with cheese, onions, pickles, mustard and ketchup on a regular bun.",
      price: "A$14.85",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=60/media/photosV2/0b7f0fa5-9aa7-4654-9252-e386cde664db-retina-large.png",
      category: "Featured Items",
      popular: true,
      featured: true,
      calories: "3748 kJ",
    },
    {
      id: "big-mac",
      restaurantId: "mcdonalds",
      name: "Big Mac",
      description: "Two beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun.",
      price: "A$16.00",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=60/media/photosV2/9b1c426e-e622-483d-a297-ff071401fee4-retina-large.png",
      category: "Featured Items",
      popular: true,
      featured: true,
      calories: "4200 kJ",
    },
    {
      id: "quarter-pounder",
      restaurantId: "mcdonalds",
      name: "Quarter Pounder",
      description: "Quarter pound beef patty with cheese, onions, pickles, mustard and ketchup on a sesame seed bun.",
      price: "A$16.10",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=70/media/photosV2/9fc7a523-e157-4477-a286-de1af7b8fb84-retina-large.png",
      category: "Featured Items",
      featured: true,
      calories: "3920 kJ",
    },
    {
      id: "double-tennessee-bbq",
      restaurantId: "mcdonalds",
      name: "Double Tennessee BBQ",
      description: "Two beef patties with BBQ sauce, cheese, bacon, and pickles on a sesame seed bun.",
      price: "A$19.30",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=70/media/photosV2/9c47e76c-0994-4d4c-904d-adf84b3b7c45-retina-large.png",
      category: "Beef",
      featured: false,
      calories: "5218 kJ",
    },
  
    // McDonald's Menu Items - Most Ordered
    {
      id: "hot-fudge-sundae",
      restaurantId: "mcdonalds",
      name: "Hot Fudge Sundae",
      description: "Creamy vanilla soft serve with hot fudge sauce.",
      price: "A$5.90",
      image: "https://img.cdn4dd.com/p/fit=cover,width=600,height=300,format=auto,quality=90/media/photosV2/af1c261f-24d9-4f67-8570-298e3f065c0c-retina-large.png",
      category: "Most Ordered",
      calories: "1430 kJ",
      rating: 0.75,
      ratingCount: 8,
      popular: true,
    },
    {
      id: "cheeseburger",
      restaurantId: "mcdonalds",
      name: "Cheeseburger",
      description: "Beef patty with cheese, onions, pickles, mustard and ketchup on a regular bun.",
      price: "A$12.55",
      image: "https://img.cdn4dd.com/p/fit=cover,width=600,height=300,format=auto,quality=90/media/photosV2/c6365d34-b7b9-4a34-949e-0f08c2d3fb49-retina-large.png",
      category: "Most Ordered",
      calories: "3128 kJ",
      popular: true,
    },
    {
      id: "mcchicken",
      restaurantId: "mcdonalds",
      name: "McChicken",
      description: "Crispy chicken patty with lettuce and mayo on a regular bun.",
      price: "A$15.95",
      image: "https://img.cdn4dd.com/p/fit=cover,width=600,height=300,format=auto,quality=90/media/photosV2/ea619010-3496-49d6-9157-addd929f05a9-retina-large.png",
      category: "Most Ordered",
      calories: "3798 kJ",
      popular: true,
    },
  
    // McDonald's Menu Items - Family & Sharing
    {
      id: "chicken-mcnuggets-10pc-1",
      restaurantId: "mcdonalds",
      name: "Chicken McNuggets - 10pc",
      description: "10 pieces of crispy chicken nuggets with your choice of sauce.",
      price: "A$17.55",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=90/media/photosV2/c64fbc0f-a684-45f6-a38c-35e07ba9015f-retina-large.png",
      category: "Family & Sharing",
      calories: "3398 kJ",
    },
    {
      id: "chicken-mcnuggets-10pc-2",
      restaurantId: "mcdonalds",
      name: "Chicken McNuggets - 10pc",
      description: "10 pieces of crispy chicken nuggets with your choice of sauce.",
      price: "A$11.40",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=90/media/photosV2/c64fbc0f-a684-45f6-a38c-35e07ba9015f-retina-large.png",
      category: "Family & Sharing",
      calories: "1510 kJ",
    },
    {
      id: "chicken-mcnuggets-20pc",
      restaurantId: "mcdonalds",
      name: "Chicken McNuggets - 20pc",
      description: "20 pieces of crispy chicken nuggets with your choice of sauce.",
      price: "A$25.25",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=90/media/photosV2/4b4ac0fa-eda9-4a9e-87b6-287c8f22f499-retina-large.png",
      category: "Family & Sharing",
      calories: "4908 kJ",
    },
  
    // McDonald's Menu Items - Chicken & Fish
    {
      id: "filet-o-fish",
      restaurantId: "mcdonalds",
      name: "Filet-O-Fish",
      description: "Fish filet with tartar sauce and cheese on a steamed bun.",
      price: "A$13.75",
      image: "https://img.cdn4dd.com/p/fit=cover,width=300,height=300,format=auto,quality=70/media/photosV2/63d361a2-0f09-4c7f-94d6-55eeb87def6e-retina-large.png",
      category: "Chicken & Fish",
      calories: "1780 kJ",
    },

  
    // McDonald's Menu Items - Snacks & Fries
    {
      id: "large-fries",
      restaurantId: "mcdonalds",
      name: "Large Fries",
      description: "Golden, crispy french fries, perfectly salted.",
      price: "A$6.95",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/34e81cd3-e3bf-49c5-b1a8-73e842faacba-retina-large.png",
      category: "Snacks & Fries",
      calories: "1530 kJ",
      popular: true,
    },
  
    // McDonald's Menu Items - Desserts
    {
      id: "mcflurry-oreo",
      restaurantId: "mcdonalds",
      name: "McFlurry with OREO® Cookies",
      description: "Creamy vanilla soft serve with OREO® cookie pieces.",
      price: "A$7.50",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/6f3f8098-809f-4482-b24f-b0ad14493109-retina-large.png",
      category: "Desserts",
      calories: "2140 kJ",
    },
  
    // McDonald's Menu Items - Soft Drinks
    {
      id: "coca-cola-large",
      restaurantId: "mcdonalds",
      name: "Coca-Cola® Large",
      description: "Refreshing Coca-Cola® served with ice.",
      price: "A$5.25",
      image: "/placeholder.svg?height=200&width=200&query=mcdonalds large coca cola",
      category: "Soft Drinks",
      calories: "1170 kJ",
    },
  
    // McDonald's Menu Items - Shakes & Frappes
    {
      id: "chocolate-shake",
      restaurantId: "mcdonalds",
      name: "Chocolate Shake",
      description: "Creamy chocolate shake topped with whipped cream.",
      price: "A$8.50",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/fc552d08-0389-4cb7-bd52-b8d8140be3ab-retina-large.png",
      category: "Shakes & Frappes",
      calories: "2340 kJ",
    },
  
    // McDonald's Menu Items - Happy Meals
    {
      id: "happy-meal-cheeseburger",
      restaurantId: "mcdonalds",
      name: "Cheeseburger Happy Meal",
      description: "Cheeseburger, small fries, apple slices, and a drink.",
      price: "A$10.95",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/dcbd87af-b04e-42a3-ab2f-ff1481000096-retina-large.png",
      category: "Happy Meals",
      calories: "2560 kJ",
    },
  
    // KFC Menu Items
    {
      id: "kfc-original-recipe",
      restaurantId: "kfc",
      name: "Original Recipe Chicken - 3pc",
      description: "3 pieces of Colonel's Original Recipe chicken.",
      price: "A$15.95",
      image: "/placeholder.svg?height=200&width=200&query=kfc original recipe chicken",
      category: "Featured Items",
      calories: "3450 kJ",
      featured: true,
    },
    {
      id: "kfc-zinger-burger",
      restaurantId: "kfc",
      name: "Zinger Burger",
      description: "Spicy chicken fillet with lettuce and mayo on a sesame seed bun.",
      price: "A$14.50",
      image: "/placeholder.svg?height=200&width=200&query=kfc zinger burger with fries",
      category: "Featured Items",
      calories: "2910 kJ",
      featured: true,
    },
  
    // Hungry Jacks Menu Items
    {
      id: "hungry-jacks-whopper",
      restaurantId: "hungry-jacks",
      name: "Whopper",
      description:
        "Flame-grilled beef patty with lettuce, tomato, onion, pickles, mayo and ketchup on a sesame seed bun.",
      price: "A$15.95",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/cccf1b1f-cd80-41a4-a381-92d2ab59c902-retina-large.png",
      category: "Featured Items",
      calories: "3260 kJ",
      featured: true,
    },
    {
      id: "hungry-jacks-bacon-deluxe",
      restaurantId: "hungry-jacks",
      name: "Bacon Deluxe",
      description: "Flame-grilled beef patty with bacon, cheese, lettuce, tomato, onion and mayo on a brioche bun.",
      price: "A$17.50",
      image: "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/3b4959b0-52cb-4c6a-9556-e62ea21262e1-retina-large.png",
      category: "Featured Items",
      calories: "3580 kJ",
      featured: true,
    },
  ]
  
  export const getMenuItemsByRestaurantId = (restaurantId: string): MenuItem[] => {
    return menuItems.filter((item) => item.restaurantId === restaurantId)
  }
  
  export const getFeaturedMenuItemsByRestaurantId = (restaurantId: string): MenuItem[] => {
    return menuItems.filter((item) => item.restaurantId === restaurantId && item.featured)
  }
  
  export const getMenuItemsByCategory = (restaurantId: string, category: string): MenuItem[] => {
    return menuItems.filter((item) => item.restaurantId === restaurantId && item.category === category)
  }
  
  export const getMenuCategories = (restaurantId: string): string[] => {
    const categories = new Set<string>()
    menuItems.filter((item) => item.restaurantId === restaurantId).forEach((item) => categories.add(item.category))
    return Array.from(categories)
  }
  