// Mock data for demonstration purposes

import {StoreInfo} from "@/data/store-data";

export function getFilterOptions() {
  return [
    { id: "1", name: "Delivery", icon: "🚚" },
    { id: "2", name: "Pickup", icon: "🛒" },
    { id: "3", name: "DashPass", icon: "🔵" },
    { id: "4", name: "Under 30 min", icon: "⏱️" },
    { id: "5", name: "Price: $", icon: "💰" },
  ]
}

export function getAllStores() {
  return [
    {
      id: "1",
      name: "Sprouts Farmers Market",
      time: "Express 56 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:26 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/71af112e-089d-4f65-ad70-d8675ae55265.jpg",
      inStorePrice: true,
      discount: "",
      rating: "4.8",
      numRatings: "9081",
      isSnap: true,
    },
    {
      id: "2",
      name: "Safeway",
      time: "Express 34 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:04 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png",
      inStorePrice: true,
      discount: "",
      rating: "4.7",
      numRatings: "4420",
      isSnap: true,
    },
    {
      id: "3",
      name: "DashMart",
      time: "Express 19 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 11:54 AM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
      inStorePrice: true,
      discount: "",
      rating: "4.8",
      numRatings: "29664",
      isSnap: true,
    },
    {
      id: "4",
      name: "DoorDash Market",
      time: "Express 24 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 11:59 AM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
      inStorePrice: true,
      discount: "",
      rating: "4.8",
      numRatings: "1886",
      isSnap: true,
    },
    {
      id: "5",
      name: "Bi-Rite Market",
      time: "Express 31 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:01 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ada746a6-4410-4b60-858c-6ca4e24e47fd.png",
      inStorePrice: true,
      discount: "",
      rating: "4.7",
      numRatings: "70",
      isSnap: false,
    },
    {
      id: "6",
      name: "Mollie Stone's Markets",
      time: "Express 37 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:07 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png",
      inStorePrice: true,
      discount: "",
      rating: "4.6",
      numRatings: "400",
      isSnap: false,
    },
    {
      id: "7",
      name: "Target",
      time: "Fast 33 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:03 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
      inStorePrice: true,
      discount: "",
      rating: "4.8",
      numRatings: "3732",
      isSnap: false,
    },
    {
      id: "8",
      name: "Gus's Community Market",
      time: "Express 39 min",
      delivery: "$0 delivery fee",
      open: true,
      openTime: "Delivered by 1:09 PM",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1ad70c1a-791f-46dd-87c7-14a84d427230.jpg",
      inStorePrice: true,
      discount: "",
      rating: "4.6",
      numRatings: "220",
      isSnap: false,
    },
  ]
}

export function getGroceryScheduleData() {
  return {
    title: "Schedule your grocery delivery",
    description: "Get your groceries delivered on your schedule",
    buttonText: "Schedule now",
    stores: [
      { name: "Safeway", logo: "/placeholder.svg?height=40&width=40" },
      { name: "Sprouts", logo: "/placeholder.svg?height=40&width=40" },
      { name: "Target", logo: "/placeholder.svg?height=40&width=40" },
    ],
  }
}

export function getGroceryFavorites() {
  return [
    {
      id: "1",
      name: "Sprouts Farmers Market",
      rating: "4.8",
      numRatings: "9.081k+",
      distance: "9.1 mi",
      time: "56 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/71af112e-089d-4f65-ad70-d8675ae55265.jpg",
    },
    {
      id: "2",
      name: "Safeway",
      rating: "4.7",
      numRatings: "4.420k+",
      distance: "0.5 mi",
      time: "34 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png",
    },
    {
      id: "3",
      name: "DashMart",
      rating: "4.8",
      numRatings: "29.664k+",
      distance: "3.2 mi",
      time: "19 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
    },
    {
      id: "4",
      name: "DoorDash Market",
      rating: "4.8",
      numRatings: "1.886k+",
      distance: "3.2 mi",
      time: "24 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
    },
    {
      id: "5",
      name: "Target",
      rating: "4.8",
      numRatings: "3.732k+",
      distance: "0.4 mi",
      time: "33 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
    }
  ];
}

export function getFastestNearYou() {
  return [
    {
      id: "1",
      name: "Bi-Rite Market",
      rating: "4.7",
      numRatings: "(70+)",
      distance: "1.2 mi",
      time: "31 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ada746a6-4410-4b60-858c-6ca4e24e47fd.png",
      isDashPass: false,
    },
    {
      id: "2",
      name: "Mollie Stone's Markets",
      rating: "4.6",
      numRatings: "(400+)",
      distance: "1.9 mi",
      time: "37 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png",
      isDashPass: false,
    },
    {
      id: "3",
      name: "Geary Wine & Spirits",
      rating: "4.5",
      numRatings: "(37+)",
      distance: "0.7 mi",
      time: "26 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://doordash-static.s3.amazonaws.com/media/store/header/6cfa729f-7914-4b44-b141-4ef82b229828.9",
      isDashPass: false,
    },
    {
      id: "4",
      name: "Marina Supermarket",
      rating: "4.5",
      numRatings: "(248+)",
      distance: "2.3 mi",
      time: "43 min",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,format=auto/https://cdn.doordash.com/media/photos/042a63c9-5dc7-4504-9772-7c4183fd2a02-retina-large.jpg",
      isDashPass: false,
    }
  ]
}

export function getProductCarouselData() {
  return [
    {
      "title": "Snacks & Drinks from Target",
      "storeName": "Target",
      "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
      "time": "",
      "isSnapEligible": false,
      "products": [
        {
          "id": "14042250407",
          "name": "Gatorade Thirst Quencher Cool Blue Sports Drink Bottle (20 fl oz)",
          "price": "$3.29",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9d9b7370-f8f6-4db8-8480-eb19d5535a86-retina-large.png"
        },
        {
          "id": "23847623089",
          "name": "Gatorade Zero Thirst Quencher Berry Sports Drink Bottle (28 fl oz)",
          "price": "$2.89",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c87a8472-6146-44a8-86ae-8e471457740a-retina-large.jpg"
        },
        {
          "id": "14042403389",
          "name": "Lay's Baked 65% Less Fat Original Potato Crisps (6.25 oz)",
          "price": "$5.99",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg"
        },
        {
          "id": "14042250410",
          "name": "Gatorade Thirst Quencher Orange Sports Drink Bottle (20 fl oz)",
          "price": "$3.29",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5fd68f77-17ae-415a-9705-345cb641c822-retina-large.png"
        },
        {
          "id": "22086355446",
          "name": "Bodyarmor Fruit Punch Sports Drink Bottle (16 fl oz)",
          "price": "$2.39",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b4e20a9b-7c23-4bc5-bcd7-d4731a34616d-retina-large.png"
        },
        {
          "id": "22086355448",
          "name": "Bodyarmor Lyte SuperDrink Peach Mango Sports Drink Bottle (16 fl oz)",
          "price": "$2.39",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/217e69bd-5801-4adf-82d5-9765e0cb9d59-retina-large.png"
        },
        {
          "id": "14042250402",
          "name": "Gatorade Thirst Quencher Lemon Lime Bottles (20 fl oz x 8 ct)",
          "price": "$10.79",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8c0159a3-873e-4977-b57d-9331342dcf63-retina-large.jpg"
        },
        {
          "id": "22086361095",
          "name": "RXBAR No B.S. Gluten Free Chocolate Sea Salt Protein Bar (1.8 oz)",
          "price": "$3.49",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/403c5536-c0fe-427c-968b-ada46974d90c-retina-large.jpg"
        },
        {
          "id": "14042250258",
          "name": "Powerade Zero Mixed Berry Sports Drink Bottles (20 fl oz x 8 ct)",
          "price": "$9.79",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5b40011b-8ffd-41b5-adc8-25583bc601c3-retina-large.png"
        }
      ]
    },
    {
      "title": "Market Favorites",
      "storeName": "DoorDash Market",
      "storeImage": "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
      "time": "",
      "isSnapEligible": false,
      "products": [
        {
          "id": "22719506630",
          "name": "Vital Farms Organic Pasture Raised Grade A Large Eggs Carton (12 ct)",
          "price": "$13.19",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75ebcf5a-a1cb-422d-a7c1-10272c67fefa-retina-large.png"
        },
        {
          "id": "20516337183",
          "name": "Avocado (each)",
          "price": "$1.59",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5d2a6d6e-f69a-4aab-8e59-7143707457ba-retina-large.png"
        },
        {
          "id": "10917857067",
          "name": "Strawberries (16 oz)",
          "price": "$4.49",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fd8ffff1-e91d-4b8b-be63-2142206f80a1-retina-large.jpg"
        },
        {
          "id": "10917857068",
          "name": "Kiwi (each)",
          "price": "$0.89",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4926359e-535a-46f4-a1b0-f4b18ccf7fe7-retina-large.png"
        },
        {
          "id": "10923619098",
          "name": "Horizon Organic High Vitamin D Ultra Pasteurized Milk Carton (0.5 gal)",
          "price": "$7.39",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e3b04b4e-af16-49c8-aa7b-b101ec3f61ef-retina-large.jpg"
        },
        {
          "id": "20172553621",
          "name": "Cucumber (each)",
          "price": "$0.99",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ae0d6538-24d1-48d3-b392-189169377f8c-retina-large.png"
        },
        {
          "id": "23131750937",
          "name": "Broccoli Crown (each)",
          "price": "$1.99",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2a9361f3-2f45-4508-8a8c-387d75eceed9-retina-large.png"
        },
        {
          "id": "20784219054",
          "name": "Alta Dena 2% Reduced Fat Milk Jug (0.5 gal)",
          "price": "$3.99",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2364a1a9-4c03-448f-b992-22b881f677e7-retina-large.jpg"
        },
        {
          "id": "20514282130",
          "name": "Simply Pulp Free Orange Juice Bottle (52 fl oz)",
          "price": "$5.49",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7c68709e-8888-4081-a54c-0304401949b4-retina-large.png"
        },
        {
          "id": "20619903127",
          "name": "Organic Avocado (each)",
          "price": "$2.99",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5d2a6d6e-f69a-4aab-8e59-7143707457ba-retina-large.png"
        },
        {
          "id": "10983174448",
          "name": "Ginger (each)",
          "price": "$1.49",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c2742847-d742-4546-9069-459cea60742d-retina-large.png"
        },
        {
          "id": "17241257454",
          "name": "Baby Carrots (1 lb)",
          "price": "$3.39",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a35895fe-13b8-4185-ac84-5b3541cd2c22-retina-large.png"
        },
        {
          "id": "24449029055",
          "name": "Carrot (each)",
          "price": "$0.49",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e218af8d-3401-4f20-8583-8bb80ba207d9-retina-large.png"
        },
        {
          "id": "10917857582",
          "name": "Sargento String Cheese Natural Mozzarella Snacks 12 ct (12 oz)",
          "price": "$7.19",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d433c5a9-0660-44af-a665-157f59c68879-retina-large.png"
        },
        {
          "id": "10957910462",
          "name": "Red Bell Pepper  (each)",
          "price": "$1.69",
          "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a12197de-693d-4852-9ada-88a453f92a85-retina-large.png"
        }
      ]
    }
  ]
}

export function getGroceryEssentialsData() {
  return {
    title: "Grocery Essentials",
    storeName: "DoorDash Market",
    deliveryTime: "24 min",
    showInStorePrice: true,
    products: [
      { 
        id: 10923619098, 
        price: "$7.39", 
        name: "Horizon Organic Milk", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e3b04b4e-af16-49c8-aa7b-b101ec3f61ef-retina-large.jpg" 
      },
      { 
        id: 22719506630, 
        price: "$13.19", 
        name: "Vital Farms Eggs", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75ebcf5a-a1cb-422d-a7c1-10272c67fefa-retina-large.png" 
      },
      { 
        id: 10917857067, 
        price: "$4.49", 
        name: "Strawberries", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fd8ffff1-e91d-4b8b-be63-2142206f80a1-retina-large.jpg" 
      },
      { 
        id: 20516337183, 
        price: "$1.59", 
        name: "Avocado", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5d2a6d6e-f69a-4aab-8e59-7143707457ba-retina-large.png" 
      },
      { 
        id: 14042403389, 
        price: "$5.99", 
        name: "Lay's Baked Chips", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f957de72-9f40-4a07-9d3c-c28c12deb5a6-retina-large.jpg" 
      },
      { 
        id: 20514282130, 
        price: "$5.49", 
        name: "Simply Orange Juice", 
        image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7c68709e-8888-4081-a54c-0304401949b4-retina-large.png" 
      },
    ],
  }
}
