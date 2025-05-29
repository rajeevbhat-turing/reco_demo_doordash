import type { ProductSection } from "@/types/store"

// 7-Eleven product data - using real products from Target and other stores
export const sevenElevenData: ProductSection[] = [
  {
    id: 1,
    title: "Snacks & Candy",
    products: [
      {
        id: 14042403389,
        name: "Lay's Baked Original Potato Crisps (6.25 oz)",
        price: 5.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg",
        description: "65% less fat original potato crisps"
      },
      {
        id: 22086361095,
        name: "RXBAR Chocolate Sea Salt Protein Bar (1.8 oz)",
        price: 3.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/403c5536-c0fe-427c-968b-ada46974d90c-retina-large.jpg",
        description: "No B.S. gluten free protein bar"
      },
      {
        id: 10917857582,
        name: "Sargento String Cheese (12 ct)",
        price: 7.19,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d433c5a9-0660-44af-a665-157f59c68879-retina-large.png",
        description: "Natural mozzarella string cheese snacks"
      },
      {
        id: 4,
        name: "Kit Kat Bar",
        price: 1.79,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/kit_kat.jpg",
        description: "Crispy wafer chocolate bar"
      },
      {
        id: 5,
        name: "Doritos Nacho Cheese",
        price: 3.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/doritos_nacho.jpg",
        description: "Classic nacho cheese flavored tortilla chips"
      },
      {
        id: 6,
        name: "Pringles Original",
        price: 2.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/pringles.jpg",
        description: "Original flavored potato crisps"
      }
    ]
  },
  {
    id: 2,
    title: "Beverages",
    products: [
      {
        id: 14042250407,
        name: "Gatorade Cool Blue Sports Drink (20 fl oz)",
        price: 3.29,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9d9b7370-f8f6-4db8-8480-eb19d5535a86-retina-large.png",
        description: "Thirst quencher sports drink"
      },
      {
        id: 14042250410,
        name: "Gatorade Orange Sports Drink (20 fl oz)",
        price: 3.29,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5fd68f77-17ae-415a-9705-345cb641c822-retina-large.png",
        description: "Thirst quencher orange flavored"
      },
      {
        id: 22086355446,
        name: "Bodyarmor Fruit Punch (16 fl oz)",
        price: 2.39,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b4e20a9b-7c23-4bc5-bcd7-d4731a34616d-retina-large.png",
        description: "Sports drink with natural flavors"
      },
      {
        id: 20514282130,
        name: "Simply Orange Juice (52 fl oz)",
        price: 5.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7c68709e-8888-4081-a54c-0304401949b4-retina-large.png",
        description: "Pulp-free orange juice"
      },
      {
        id: 11,
        name: "Coca-Cola Classic 20oz",
        price: 2.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/coca_cola_20oz.jpg",
        description: "Classic Coca-Cola in 20oz bottle"
      },
      {
        id: 12,
        name: "Red Bull Energy Drink",
        price: 3.29,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/red_bull.jpg",
        description: "Original Red Bull energy drink 8.4oz"
      }
    ]
  },
  {
    id: 3,
    title: "Quick Meals & Essentials",
    products: [
      {
        id: 22719506630,
        name: "Vital Farms Organic Eggs (12 ct)",
        price: 13.19,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75ebcf5a-a1cb-422d-a7c1-10272c67fefa-retina-large.png",
        description: "Pasture raised grade A large eggs"
      },
      {
        id: 20784219054,
        name: "Alta Dena 2% Milk (0.5 gal)",
        price: 3.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2364a1a9-4c03-448f-b992-22b881f677e7-retina-large.jpg",
        description: "Reduced fat milk jug"
      },
      {
        id: 20516337183,
        name: "Avocado (each)",
        price: 1.59,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5d2a6d6e-f69a-4aab-8e59-7143707457ba-retina-large.png",
        description: "Fresh avocado"
      },
      {
        id: 10917857067,
        name: "Strawberries (16 oz)",
        price: 4.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fd8ffff1-e91d-4b8b-be63-2142206f80a1-retina-large.jpg",
        description: "Fresh strawberries container"
      }
    ]
  }
];

// Walgreens product data - keeping existing working products
export const walgreensData: ProductSection[] = [
  {
    id: 1,
    title: "Health & Wellness",
    products: [
      {
        id: 1,
        name: "Advil Pain Reliever",
        price: 8.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/advil.jpg",
        description: "Ibuprofen pain reliever, 200mg, 100 tablets"
      },
      {
        id: 2,
        name: "Tylenol Extra Strength",
        price: 9.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/tylenol.jpg",
        description: "Acetaminophen pain reliever, 500mg"
      },
      {
        id: 3,
        name: "Band-Aid Bandages",
        price: 5.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bandaid.jpg",
        description: "Flexible fabric adhesive bandages"
      },
      {
        id: 4,
        name: "Vitamin C Tablets",
        price: 12.99,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center",
        description: "1000mg vitamin C supplement"
      },
      {
        id: 5,
        name: "Thermometer Digital",
        price: 15.99,
        image: "https://images.unsplash.com/photo-1584467735871-8b85c8da9685?w=400&h=400&fit=crop&crop=center",
        description: "Digital oral thermometer"
      },
      {
        id: 6,
        name: "Hand Sanitizer",
        price: 3.99,
        image: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&h=400&fit=crop&crop=center",
        description: "70% alcohol hand sanitizer 8oz"
      }
    ]
  },
  {
    id: 2,
    title: "Beauty & Personal Care",
    products: [
      {
        id: 7,
        name: "Neutrogena Face Wash",
        price: 7.49,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/neutrogena.jpg",
        description: "Daily facial cleanser for all skin types"
      },
      {
        id: 8,
        name: "Crest Toothpaste",
        price: 4.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/crest.jpg",
        description: "Whitening toothpaste with fluoride"
      },
      {
        id: 9,
        name: "Chapstick Lip Balm",
        price: 2.99,
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=400,height=400,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/chapstick.jpg",
        description: "Classic moisturizing lip balm"
      },
      {
        id: 10,
        name: "Shampoo & Conditioner",
        price: 8.99,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
        description: "2-in-1 shampoo and conditioner"
      },
      {
        id: 11,
        name: "Deodorant Stick",
        price: 4.49,
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
        description: "24-hour protection deodorant"
      },
      {
        id: 12,
        name: "Makeup Remover Wipes",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center",
        description: "Gentle makeup removing wipes"
      }
    ]
  },
  {
    id: 3,
    title: "Household Essentials",
    products: [
      {
        id: 13,
        name: "Paper Towels",
        price: 7.99,
        image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center",
        description: "2-ply paper towels, 6 rolls"
      },
      {
        id: 14,
        name: "Toilet Paper",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center",
        description: "Ultra soft toilet paper, 12 rolls"
      },
      {
        id: 15,
        name: "Laundry Detergent",
        price: 11.99,
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center",
        description: "Concentrated liquid detergent"
      },
      {
        id: 16,
        name: "Dish Soap",
        price: 3.49,
        image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop&crop=center",
        description: "Grease-cutting dish soap"
      }
    ]
  }
];

// Combined convenience data by store ID
export const convenienceData: Record<string, ProductSection[]> = {
  "1": sevenElevenData,
  "2": walgreensData,
}; 