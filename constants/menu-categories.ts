export interface MenuCategory {
    id: string
    name: string
    restaurantId: string
  }
  
  export const menuCategories: MenuCategory[] = [
    {
      id: "featured-items-mcdonalds",
      name: "Featured Items",
      restaurantId: "mcdonalds",
    },
    {
      id: "most-ordered-mcdonalds",
      name: "Most Ordered",
      restaurantId: "mcdonalds",
    },
    {
      id: "family-sharing-mcdonalds",
      name: "Family & Sharing",
      restaurantId: "mcdonalds",
    },
    {
      id: "beef-mcdonalds",
      name: "Beef",
      restaurantId: "mcdonalds",
    },
    {
      id: "chicken-fish-mcdonalds",
      name: "Chicken & Fish",
      restaurantId: "mcdonalds",
    },
    {
      id: "chicken-mcnuggets-mcdonalds",
      name: "Chicken Mcnuggets",
      restaurantId: "mcdonalds",
    },
    {
      id: "snacks-fries-mcdonalds",
      name: "Snacks & Fries",
      restaurantId: "mcdonalds",
    },
    {
      id: "mccafe-drinks-mcdonalds",
      name: "Mccafe Drinks",
      restaurantId: "mcdonalds",
    },
    {
      id: "happy-meals-mcdonalds",
      name: "Happy Meals",
      restaurantId: "mcdonalds",
    },
    {
      id: "desserts-mcdonalds",
      name: "Desserts",
      restaurantId: "mcdonalds",
    },
    {
      id: "soft-drinks-mcdonalds",
      name: "Soft Drinks",
      restaurantId: "mcdonalds",
    },
    {
      id: "shakes-frappes-mcdonalds",
      name: "Shakes & Frappes",
      restaurantId: "mcdonalds",
    },
    {
      id: "juice-bottled-drinks-mcdonalds",
      name: "Juice & Bottled Drinks",
      restaurantId: "mcdonalds",
    },
    {
      id: "condiments-mcdonalds",
      name: "Condiments",
      restaurantId: "mcdonalds",
    },
    {
      id: "rmhc-support-mcdonalds",
      name: "Rmhc Support",
      restaurantId: "mcdonalds",
    },
    {
      id: "individual-items-mcdonalds",
      name: "Individual Items",
      restaurantId: "mcdonalds",
    },
    // KFC Categories
    {
      id: "featured-items-kfc",
      name: "Featured Items",
      restaurantId: "kfc",
    },
    {
      id: "buckets-kfc",
      name: "Buckets",
      restaurantId: "kfc",
    },
    {
      id: "burgers-kfc",
      name: "Burgers",
      restaurantId: "kfc",
    },
    // Hungry Jacks Categories
    {
      id: "featured-items-hungry-jacks",
      name: "Featured Items",
      restaurantId: "hungry-jacks",
    },
    {
      id: "burgers-hungry-jacks",
      name: "Burgers",
      restaurantId: "hungry-jacks",
    },
    {
      id: "meals-hungry-jacks",
      name: "Meals",
      restaurantId: "hungry-jacks",
    },
  ]
  
  export const getMenuCategoriesByRestaurantId = (restaurantId: string): MenuCategory[] => {
    return menuCategories.filter((category) => category.restaurantId === restaurantId)
  }
  