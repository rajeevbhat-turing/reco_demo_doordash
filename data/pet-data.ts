import { PetProductSection, PetUiConfig, PetStore, PetDeal } from "@/types/pet-types";

// Featured pet stores for "Stores Near You" section
export const featuredPetStores = [
  "petsmart",
  "petco",
  "pawsh",
  "chewy",
  "healthy-spot",
  "pet-food-express"
];

export const allPetStores = [
  {
    "id": "24207684",
    "name": "Pet Food Express",
    "rating": "4.9",
    "ratingCount": "1033",
    "distance": "1.54 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "isDashPass": true
  },
  {
    "id": "25109364",
    "name": "Petco",
    "rating": "4.9",
    "ratingCount": "848",
    "distance": "1.29 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/903222da-3939-4dbc-8c4a-03ee2118090d.png",
    "isDashPass": true
  },
  {
    "id": "1761548",
    "name": "PetSmart",
    "rating": "4.9",
    "ratingCount": "2600",
    "distance": "2.13 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/5a4ed405-725e-46ec-a9ce-75212a7f5b24.png",
    "isDashPass": true
  },
  {
    "id": "23720510",
    "name": "Mishka Luxury Dog Treats",
    "rating": "4.9",
    "ratingCount": "180",
    "distance": "1.00 mi",
    "time": "Closed",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/23fbadda-f09e-43c4-8678-0d57421d5c6b.jpeg",
    "isDashPass": true
  },
  {
    "id": "30934554",
    "name": "Ace Hardware",
    "rating": "0.0",
    "ratingCount": "0",
    "distance": "2.53 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/7a2ccc67-5ac3-49fa-8d46-72e9d986a70e.png",
    "isDashPass": true
  },
  {
    "id": "57413",
    "name": "Jeffrey's Natural Pet Foods",
    "rating": "5.0",
    "ratingCount": "53",
    "distance": "1.20 mi",
    "time": "Closed",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/affaa802-0102-4fb3-93e5-984de4ad8055.png",
    "isDashPass": true
  },
  {
    "id": "24421281",
    "name": "Safeway Pets",
    "rating": "4.9",
    "ratingCount": "18",
    "distance": "0.86 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/4a0e7f7a-92d2-432d-a9b0-1601a383a317.jpg",
    "isDashPass": true
  },
  {
    "id": "1944703",
    "name": "Ocean Paws",
    "rating": "4.7",
    "ratingCount": "26",
    "distance": "5.10 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/5c7c4d0c-c063-4138-80ce-666f78cf29f3.png",
    "isDashPass": true
  },
  {
    "id": "1795368",
    "name": "Village Pets & Supplies",
    "rating": "4.8",
    "ratingCount": "81",
    "distance": "0.73 mi",
    "time": "Open",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ba813b7b-e0b9-4105-9462-c6756da5d592.png",
    "isDashPass": true
  },
  {
    "id": "24752543",
    "name": "Andronico's Pets",
    "rating": "4.8",
    "ratingCount": "21",
    "distance": "3.81 mi",
    "time": "Closed",
    "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/3092c6cf-5c2f-424e-98ab-690dc537b132.jpg",
    "isDashPass": true
  }
]

// Pet store categories for filtering
export const petCategories = [
    {
      "id": "deals",
      "name": "Deals",
      "slug": "deals",
      "image": "https://img.cdn4dd.com/s/convenience/images/deals.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_COLLECTIONS_REQUEST",
      "isActive": true
    },
    {
      "id": "2685",
      "name": "Dog",
      "slug": "dog-2685",
      "image": "https://img.cdn4dd.com/s/convenience/images/dog.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    },
    {
      "id": "2681",
      "name": "Cat",
      "slug": "cat-2681",
      "image": "https://img.cdn4dd.com/s/convenience/images/cat.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    },
    {
      "id": "2683",
      "name": "Reptile",
      "slug": "reptile-2683",
      "image": "https://img.cdn4dd.com/s/convenience/images/reptile.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    },
    {
      "id": "2684",
      "name": "Fish",
      "slug": "fish-2684",
      "image": "https://img.cdn4dd.com/s/convenience/images/fish.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    },
    {
      "id": "2682",
      "name": "Small pet",
      "slug": "small pet-2682",
      "image": "https://img.cdn4dd.com/s/convenience/images/small-pet.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    },
    {
      "id": "2680",
      "name": "Bird",
      "slug": "bird-2680",
      "image": "https://img.cdn4dd.com/s/convenience/images/bird.png",
      "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
      "isActive": true
    }
  ];

// Pet product data organized by section
export const petProductData: PetProductSection[] = [
  {
    "id": 1,
    "title": "Flea & Tick",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "13329407528",
        "name": "Safari Flea Dog Comb One Size",
        "price": 1.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d4979cd7-5eb0-438e-9891-c20adc8001df-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "5227876278",
        "name": "Advantage Treatment Shampoo for Cats & Kittens (8 oz)",
        "price": 16.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c7f93735-92f8-4040-9fd4-16b8226a7839-retina-large.jpg",
        "category": ["Cat"]
      },
      {
        "id": "11826884267",
        "name": "Skout's Honor Super Sour! Anti Chew Spray Sour Apple (8 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/84748ade-df8e-4095-a61e-10deffdefcce-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "12049516093",
        "name": "Wondercide Skin Tonic Spray Itch and Allergy Relief (8 oz)",
        "price": 16.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ba84cabb-c145-4517-ac49-ceb833f06be5-retina-large.jpg",
        "category": ["Dog", "Cat"]
      },
      {
        "id": "12169842698",
        "name": "Skout's Honor Flea and Tick Shampoo (16 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e26fc63b-2325-4a8e-a5b3-030d2ffd7400-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686947989",
        "name": "Advantage II Flea Treatment for Large Cats (2 ct)",
        "price": 34.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a41285ea-3d8c-42ac-ba44-0595999fca89-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9732315022",
        "name": "Ark Naturals Flea Flicker Tick Kicker Treatment Spray for Dogs & Cats (8 oz)",
        "price": 14.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4c7e079e-3717-40c8-8cc8-f0c27e3f12f6-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12049516100",
        "name": "TickCheck Tick Remover Hooks Value Pack (3 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f8f63526-55d3-44e8-a712-11a91c623a22-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981629",
        "name": "Earth Animal Nature's Protection Herbal Cat Flea & Tick Collar One Size",
        "price": 15,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/525d87e7-be48-48c5-ac1d-2465255bc693-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12049516099",
        "name": "TickCheck Wallet Sized Tick Removal Card",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/beec8479-7bd5-4ff1-9181-69ccfb79bcd5-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12049516101",
        "name": "TickCheck Premium Tick Remover Kit",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/27d993d4-7212-4a14-9c9f-b06a9446b076-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873541",
        "name": "TropiClean Natural Flea & Tick Dog Shampoo Maximum Strength (20 oz)",
        "price": 16.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/03cf8195-bb72-4900-89e4-3265c184bc7e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874155",
        "name": "Adams Flea & Tick Carpet Powder (16 oz)",
        "price": 15.97,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/998dac8a-48df-4701-befb-d2b4f90b6841-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643634405",
        "name": "Advantage Flea & Tick Household Fogger (3 ct)",
        "price": 24.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f0adc183-2ff1-44f3-b8e0-c828658c19df-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874515",
        "name": "TropiClean Natural Flea & Tick Bite Relief Dog Spray (8 oz)",
        "price": 13.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5fd496b8-0a8f-4ccb-9dec-7589fe5db312-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9706940165",
        "name": "TropiClean Natural Flea & Tick Repellent Dog Collar Large 25\"",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f75ec215-b1b6-4285-934a-096ee23c2580-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9706940131",
        "name": "TropiClean Natural Flea & Tick Pet & Bedding Dog Spray (16 oz)",
        "price": 15.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b55dc295-e993-497d-b50e-ef9d4ea3db25-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873306",
        "name": "TropiClean Natural Flea & Tick Soothing Dog Shampoo (20 oz)",
        "price": 16.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/402d63af-d8a2-47c1-b8fe-9218ee275198-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873551",
        "name": "TropiClean Natural Flea & Tick Home Spray (32 oz)",
        "price": 23.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e1113a0-7586-4093-9c13-bc5c3cb5e8b1-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874239",
        "name": "K9 Advantix II Small Dog Flea and Tick Treatment (2 ct)",
        "price": 36.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/67a8ab53-fc22-436c-a0c4-85111e357ea6-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874240",
        "name": "K9 Advantix II Large Dog Flea and Tick Treatment (2 ct)",
        "price": 36.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a5d1d8db-6144-4d05-9e9b-8a4e12cccb2b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12234178472",
        "name": "Wondercide Peppermint Flea & Tick Spot On with Natural Essential Oils for Medium Dogs (3 ct)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6f49cc14-e17a-4ddb-8d3e-689e84a187b0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872794",
        "name": "Capstar Oral Flea Treatment for Dogs 25 lbs and Up (6 ct)",
        "price": 44.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c88d2555-06d4-407c-bf4c-a582c1d7a342-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686947973",
        "name": "Seresto Flea & Tick Cat Collar One Size",
        "price": 67.98,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f1d1917d-2dea-4cf4-b70a-074ef050674e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872866",
        "name": "K9 Advantix II Medium Dog Flea and Tick Treatment (2 ct)",
        "price": 36.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/cf293e41-7787-4e89-a5a0-df39985e858e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643649260",
        "name": "Advantage II Flea Treatment for Small Cats (2 ct)",
        "price": 34.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/91a91a1b-8556-4809-a513-ea9cb7db70f3-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12049516098",
        "name": "Wondercide Flea & Tick Collar with Natural Essential Oilsfor Dogs",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d453a475-375c-4d0a-a2c7-00a448d3b46e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9732315036",
        "name": "Advantage Household Spot & Crevice Treatment Spray (24 oz)",
        "price": 22.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e87fd16b-8045-4cda-9ecd-edd237c65f57-retina-large.jpg",
        "category": ""
      },
      {
        "id": "23293054047",
        "name": "Bobbi Panter Itchy Dog Soothing Relief Spray (8 oz)",
        "price": 15.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/29f31645-d7d6-4c18-8d54-d0e14c105e52-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981839",
        "name": "Advantage Carpet & Upholstery Spot Spray (16 oz)",
        "price": 22.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2e388aa5-88c7-4cb9-8cf3-b29d4fd98831-retina-large.jpg",
        "category": ""
      }
    ]
  },
  {
    "id": 3,
    "title": "Best Sellers",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "small-pet-bedding-01",
        "name": "Kaytee Clean & Cozy Small Animal Bedding",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/94dfcab7-3e9c-44b8-9e93-9872c2cb8926-retina-large.jpg",
        "category": ["Small pet"]
      },
      {
        "id": "13329407616",
        "name": "PetAg Nursing Kit (2 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/914f12b1-0970-4c0e-9214-acdd17133cfe-retina-large.jpg",
        "category": ["Dog", "Cat", "Small pet"]
      },
      {
        "id": "5227876237",
        "name": "Rosy's 100% Organic Kitty Grass Cat Treat for Pets One Size",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a1cc3ace-85e7-49fc-8b1f-b1700ad4ff0e-retina-large.jpg",
        "category": ["Cat"]
      },
      {
        "id": "9686981792",
        "name": "Earth Rated Dog Poop Bags Refill Roll Unscented (120 ct)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8dcedb8b-bca4-4fe5-aff4-457b632f4a59-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "5227874019",
        "name": "Pawsitively Gourmet Birthday Cake Dog Cookie Assorted",
        "price": 2.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1baaffc6-390c-4df3-9935-efb6abe055e0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873909",
        "name": "InClover Optagest Digestive Aid Convenience Stick for Dogs and Cats (2 g)",
        "price": 2.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ec00c45a-52ba-4e7c-a760-c70137fe0dd2-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643667301",
        "name": "Kiwi Kitchens Raw Freeze Dried Training Dog Treats Lamb Recipe (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/17f94871-7545-4fa1-83bf-454859ed0a95-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407587",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Beef and Russet Potato (18 oz)",
        "price": 11.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/879ebbfd-5899-42fe-913d-d607c1b3111d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872957",
        "name": "Fruitables SuperBlend Digestive Dogs & Cats Supplement (15 oz)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f42869d7-857c-479d-ba0e-2fddf1faec7d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329430335",
        "name": "PetAg KMR Kitten Milk Replacer Liquid (11 oz)",
        "price": 11.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75948eaf-834b-40e3-bcac-a4ca2bf4f843-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874603",
        "name": "Pawsitively Gourmet Mini Cupcake Dog Cookie Assorted Colors",
        "price": 1.69,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/931eacec-b71b-450d-8f1b-7c3092e174da-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981864",
        "name": "Etta Says! Yumm Stick Dog Treats Turkey",
        "price": 2.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/acb7c66d-2727-431d-9f1d-9b2a03122727-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686982208",
        "name": "Etta Says! Yumm Stick Dog Treats Beef",
        "price": 2.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ff75a3c4-e37f-43e2-ab96-73c6a12c4216-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227765608",
        "name": "Pawsitively Gourmet Mini Ice Cream Cone Dog Cookie Assorted Colors",
        "price": 1.69,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5373babf-4fef-47f3-8559-53bd94b3896a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407586",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Turkey and Whole Wheat Macaroni (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a478e376-e1cd-4399-ab59-51595826d67e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407588",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Chicken and White Rice (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2ce9081c-2520-448b-a520-683c3dc4bb16-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227875779",
        "name": "Pawsitively Gourmet It's My Birthday Bone Dog Treats Gift Box",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c4a4c20a-0ffb-44dc-83fd-66b5268d7253-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826884080",
        "name": "Vital Essentials Raw Freeze-Dried Minnows Dog Treats (1 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/aa0b907d-d789-4f50-b062-36ce4299390d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873224",
        "name": "Weruva Pumpkin Patch Up Dog &Supplement (2.8 oz)",
        "price": 1.79,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/977874cf-2567-4e43-862a-c07c48e46dc8-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876784",
        "name": "Vital Essentials Minnows Freeze Dried Raw Cat Treats (0.5 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b6fefbd8-c2a2-492b-b502-fdd15747931d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981999",
        "name": "Bixbi Pocket Trainers Dog Treats Bacon (6 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/70d6db62-c1a8-47d3-b2a5-edca748e6a66-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872752",
        "name": "Icelandic+ Treats Dog Fish Treat Long Strips Cod Skin (20 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a1ec0652-73e3-49af-bb45-c9e0e790a42e-retina-large.jpg",
        "category": ["Dog", "Fish"]
      },
      {
        "id": "9686981957",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Lamb and Brown Rice (18 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f3e094d4-e69c-4d93-acfa-d86e9d434dba-retina-large.png",
        "category": ""
      },
      {
        "id": "13329407589",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Fish and Sweet Potato (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/43723197-f3b6-4688-98df-904be263512a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876545",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7d669f15-8363-430a-a288-353f69309155-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826884097",
        "name": "Vital Essentials Chicken Hearts Freeze-Dried Raw Dog Treats (1 lb)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c099811b-9e06-4da8-a1fd-135f33c133a9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874647",
        "name": "Pawsitively Gourmet Birthday Boy Cupcake Dog Treat Gift Box",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/94969db5-0b52-4a32-8755-90447f8dc4aa-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876212",
        "name": "Elanco Tapeworm Dewormer Tablets for Cats (3 ct)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ddda46c3-5748-49ba-b6db-343bd2e5bdc2-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874163",
        "name": "PetAg Esbilac Liquid Puppy Milk Replacer (11 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9dfb077e-4ed2-4c57-b249-4736dfc1c129-retina-large.jpg",
        "category": ""
      },
      {
        "id": "10788346656",
        "name": "Redbarn Collagen Stick Small Dog Chew Treat",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/733b3b8d-81ce-49d4-989b-08f06fecf5ba-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407528_2",
        "name": "Safari Flea Dog Comb One Size",
        "price": 1.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d4979cd7-5eb0-438e-9891-c20adc8001df-retina-large.jpg",
        "category": ""
      }
    ]
  },
  {
    "id": 4,
    "title": "Toys Under $10",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "23461317142",
        "name": "Turbo by Coastal Wood Wand Blue Interactive Cat Toy",
        "price": 2.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1b5f9d93-2026-4575-9218-d5597695c772-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13257234948",
        "name": "Petsport Kaleidoscope 2 Knot Rope Dog Toy",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/59e7bdbc-e7e0-49ba-89da-500bf216a2c5-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826884296",
        "name": "Multipet Duckworth 4'' Small Yellow Plush Dog Toy",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9def07f1-525c-4b93-aa7a-ce4624ccd3af-retina-large.jpg",
        "category": ""
      },
      {
        "id": "23461317147",
        "name": "Turbo by Coastal Led Mouse Pointer Light Interactive Cat Toy",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e49ca303-86f0-4575-88d0-84c500c1c82a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981669",
        "name": "Kong SqueakAir Tennis Dog Ball Large",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8b8115d9-598b-44de-a19c-eab51b8cf322-retina-large.jpg",
        "category": ""
      },
      {
        "id": "20857416673",
        "name": "Fog City Pet Tommy Trout Plush Catnip Cat Toy (1 lb)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/07f93957-4ef0-4f45-b665-1fa52fb896c0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13257234951",
        "name": "Multipet Canine Clean Peppermint Bone Puppy Chew Toy",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/301b8e8f-d27b-4734-ab7d-b91f8c91a40e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686947910",
        "name": "Cat Dancer Original Cat Toy One Size",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/87ef676c-69da-4040-ba82-2432f7c780f8-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686982221",
        "name": "Amazing Pet Products 2 Knot 10\" Small Rope Dog Toy",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ac9c47dc-d41e-4ce5-9437-25fe18537db9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872976",
        "name": "Mammoth Flossy Chews Twister Tug Tennis Ball Dog Toy Medium 15''",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/df2d178c-0206-4065-aab9-7829e85b8a5f-retina-large.jpg",
        "category": ""
      },
      {
        "id": "20326055927",
        "name": "goDog Flatz Opossum Squeaky Plush Flattie Dog Toy (1 lb)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9e8c8c48-3d75-49e0-baed-f69c3d0722de-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686982413",
        "name": "Multipet Loofa Blankie Plush Dog Toy Assorted 12\"",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/554ed7d2-9ac2-43e3-86e3-88487cd6a1fa-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981691",
        "name": "Kong Airdog Squeaker Dog Balls Small",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f2cd8c95-21eb-446a-8ac7-f79a92e08f41-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643634363",
        "name": "Multipet Lamb Chop Plush Dog Toy Small 6\"",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/22379c55-ab67-4cac-a472-5f4350d0d4ed-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643634331",
        "name": "Spot Latex Soccer Dog Ball Assorted 2\"",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d299a57c-98fa-4a7e-ad21-f93a5acdf6e7-retina-large.jpg",
        "category": ""
      },
      {
        "id": "14351495516",
        "name": "Kong Crunch Air Ball Medium Dog Toys (3 ct)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/57f9bb33-e5cd-4382-98a0-8c55a8fdd1ca-retina-large.png",
        "category": ""
      },
      {
        "id": "12894712175",
        "name": "Pet Food Express Tennis Ball Dog Toy Rainbow",
        "price": 1.79,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ab27d9d9-ce1a-4293-a107-e395a3754789-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227864461",
        "name": "Pet Candy Catnip Squirrel with Tail Cat Toy Assorted",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/02240dcf-7145-4ac3-97ea-e5f9bdd3f9fb-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874744",
        "name": "Gnawsome Crinkle Stick Dog Toy Assorted Medium & Large",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/067c4e15-c936-4924-ad6d-e0ab964a686e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686947872",
        "name": "Cats Claws Jumbo Starburst Teaser Cat Toy One Size",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75874e7c-1834-481a-980b-d7c7998be544-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13257234953",
        "name": "Multipet Canine Clean Peppermint Tri-Bone Puppy Chew Toy",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/0ea8570f-3273-40db-8900-5423b04f54f7-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876837",
        "name": "Mad Cat Sloth Cat Toy with Silvervine Stick",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4149143c-579f-4f33-b270-25bf8421d801-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227765590",
        "name": "HuggleHounds Ruff-Tex Hamlet Pig Ball Dog Toy 3.75\"",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/cbada6e0-911b-41e5-a255-d3e3d2489175-retina-large.jpg",
        "category": ""
      },
      {
        "id": "14351495510",
        "name": "Guru Tennis Mall Ball Fetch Dog Toy (1 lb)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/cefd4b9c-3d71-447c-a47e-e913e6f83bac-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227864342",
        "name": "Coastal Turbo Vibrating Creature Cat Toy 6.25\"",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/37661f67-9d46-4afa-ad10-4d93760b1ef0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9706945776",
        "name": "Huxley & Kent Kittybelles Funfetti Cake Catnip Cat Toy",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/60813952-555f-4d3a-aeaa-fc22e036259c-retina-large.jpg",
        "category": ["Cat"]
      },
      {
        "id": "9686982065",
        "name": "Mammoth Tirebiter II with Rope Chew Dog Toy Small",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a8086c7b-5881-414f-bb71-da638ec0635c-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "20326055926",
        "name": "goDog Flatz Skunk Squeaky Plush Flattie Dog Toy (1 lb)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/156827e3-ec75-4ba0-b5bd-5fe920ce991d-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "21961132804",
        "name": "Snugarooz Lil Baby Yellow Bone Small Dog Toy (2 oz)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/94dfcab7-3e9c-44b8-9e93-9872c2cb8926-retina-large.jpg",
        "category": ["Dog"]
      },
      {
        "id": "11826883910",
        "name": "Snugarooz Chloe The Cactus 8\" Plush Dog Toy",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/580ed326-718d-4bd0-87ed-ba892b96650b-retina-large.jpg",
        "category": ""
      }
    ]
  },
  {
    "id": 5,
    "title": "Cat Treats",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "11826876784_2",
        "name": "Vital Essentials Minnows Freeze Dried Raw Cat Treats (0.5 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b6fefbd8-c2a2-492b-b502-fdd15747931d-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876580",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/563ddca5-21fb-43e9-8ecf-075697d4a7ea-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876545_2",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7d669f15-8363-430a-a288-353f69309155-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "11826876785",
        "name": "Vital Essentials Chicken Breast Freeze-Dried Raw Cat Treats (1 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/307551f7-c30d-48cf-a7bc-782afc93909b-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876643",
        "name": "Greenies Dental Cat Treats Catnip (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e578a336-a660-4ccd-a3df-18228ada93f7-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686981522",
        "name": "Catit Creamy Lickable Cat Treats Chicken & Liver Recipe (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/30a42537-66ad-47b3-9596-e361334d9b8a-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227793010",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f90d8347-9884-4b5e-95ed-23ed222fb056-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "11826876775",
        "name": "Vital Essentials Chicken Hearts Freeze-Dried Raw Cat Treats (0.8 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e9b00614-a845-4193-8bd9-7ed35cc06fa6-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876703",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/62845935-dafc-4ad7-a09b-c3724629ddaf-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227864336",
        "name": "Greenies Cat Treats Adult Natural Dental Cat Treats Tempting Tuna (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d2bf7dad-7075-40d0-9816-63a5029e40ab-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9607111557",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken & Salmon Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f38d6e46-5be0-4e32-bf70-bd439258ddf5-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876511",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f1240486-01a1-4003-8b12-a75d125cb49b-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "11826876780",
        "name": "Vital Essentials Duck Liver Freeze Dried Raw Cat Treats (0.9 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/93276a87-9ee6-47e8-845c-904f78a6400c-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227793014",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bf389f8b-a11d-4490-8604-8069ef6ed880-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686981523",
        "name": "Catit Creamy Salmon Lickable Cat Treats (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6cecc670-c7af-4449-b670-f2814807cc58-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876533",
        "name": "Tiki Cat Stix Wet Cat Treats Chicken Mousse (6 ct)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/05e5b780-ba8e-489b-bd3f-e8c6cdcc84d0-retina-large.png",
        "category": "Cat"
      },
      {
        "id": "5227792994",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/84288c67-3f76-450c-a275-7f53900afea9-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686948019",
        "name": "Fruitables Wildly Natural Cat Treats Salmon (2.5 oz)",
        "price": 5.48,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/78fbc481-8a70-48b5-8ce4-53449e653eb2-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686948068",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Tuna & Crab Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e514b67-5b2a-498d-a743-27c861a0729b-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "20325977319",
        "name": "WHIMZEES Chicken Flavor Natural Cat Dental Treats (4.5 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7395e41f-328b-4192-93f7-fabc02c355a4-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9643666679",
        "name": "Applaws Natural Cat Treats Whole Mackerel Loin (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/03751958-a72b-41ac-940d-b93fcfaa46a4-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9706945765",
        "name": "Applaws Natural Loin Cat Treats Tuna Loin (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1fb7437d-2c1a-46a9-9a70-48a2a8c9f820-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686981556",
        "name": "Catit Creamy Lickable Cat Treats Tuna Recipe (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4a19ef16-c3d4-4fed-92f2-7564b7f7d605-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686981559",
        "name": "Kiwi Kitchens Raw Freeze Dried Cat Treats Beef Liver (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b8a62c4c-3657-4ce0-808b-3d9162c95ae0-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "5227876699",
        "name": "Greenies Cat Treats Adult Natural Dental Cat Treats Tempting Tuna (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7d9cecd8-e7b9-48ba-bc73-84c3bec166a8-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "11826876777",
        "name": "Vital Essentials Chicken Giblets Freeze-Dried Raw Cat Treats (1 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1d9c1fb6-cb75-43b6-b81c-82b526df6c4e-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9732317094",
        "name": "Applaws Natural Loin Cat Treats Chicken Filet with Rosemary (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1a24f6d5-dd9d-416d-9781-662347c54c1b-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686948066",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Beef & Sardine Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c2d9891b-ec62-41f3-aa3c-dcadec92ab09-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686948067",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Tuna & Scallop Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/86dc373c-e1c6-4908-a382-446e7ffaaf6c-retina-large.jpg",
        "category": "Cat"
      },
      {
        "id": "9686981519",
        "name": "Catit Nibbly Cat Treats Chicken (3.2 oz)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/3ab8f790-0248-4cb8-8859-a2795ba29096-retina-large.jpg",
        "category": "Cat"
      }
    ]
  },
  {
    "id": 6,
    "title": "Greenies",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "20857416641",
        "name": "Greenies Original Dental Care Daily Dog Treats (6 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/9bf19284-6280-48c1-8df0-cc340cd44d0e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873187",
        "name": "Greenies Pill Pockets Dog Treats Peanut Butter Flavor Capsule Size (7.9 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/60403bfc-9345-4ca5-9336-5ee333cd4f46-retina-large.jpg",
        "category": ""
      },
      {
        "id": "20857416640",
        "name": "Greenies Original Dental Care Daily Dog Treats (6 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4744465f-b275-4e67-a0ad-663efb1e01e0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872958",
        "name": "Greenies Pill Pockets Dog Treats Hickory Smoke Flavor Tablet Size (3.2 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/975ddb20-2a27-446f-b7b1-57c9ab03ae40-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873027",
        "name": "Greenies Dog Dental Treats Original Regular (12 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/38648f1d-912f-4a6d-90d4-0a16d5e592df-retina-large.jpg",
        "category": ""
      },
      {
        "id": "20857416642",
        "name": "Greenies Canine Dental Dog Treats Original (6 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/434d6c29-72cc-467d-990c-5ea8f12dba1e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873103",
        "name": "Greenies Pill Pockets Dog Treats Peanut Butter Flavor Tablet Size (3.2 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/475aa3b9-e0e6-4096-a394-8d92b541f9bc-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873411",
        "name": "Greenies Pill Pockets Dog Treats Chicken Flavor Capsule Size (7.9 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d33c4ead-277a-4546-94e7-fd3359da035d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "20857416643",
        "name": "Greenies Regular Original Dog Dental Treats (6 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e2d50ed0-432b-453b-8c50-d02d8005468c-retina-large.png",
        "category": ""
      },
      {
        "id": "5227864336_2",
        "name": "Greenies Cat Treats Adult Natural Dental Cat Treats Tempting Tuna (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d2bf7dad-7075-40d0-9816-63a5029e40ab-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227793014_2",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bf389f8b-a11d-4490-8604-8069ef6ed880-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227792994_2",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/84288c67-3f76-450c-a275-7f53900afea9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873978",
        "name": "Greenies Dog Dental Treats Original Teenie (12 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/16cbeb29-a088-4a93-a40d-4cbd2c903442-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876699_2",
        "name": "Greenies Cat Treats Adult Natural Dental Cat Treats Tempting Tuna (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7d9cecd8-e7b9-48ba-bc73-84c3bec166a8-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227792999",
        "name": "Greenies Dental Cat Treats Catnip (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e70ef4ee-7749-44b1-95bc-1af4671406fd-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872780",
        "name": "Greenies Dog Dental Treats Original Large (12 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1af885c3-1970-4aec-ae7b-0c56af1138a6-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227873030",
        "name": "Greenies Dog Dental Treats Original Petite (12 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4579c716-e62d-47fd-b98c-02186924f976-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227792979",
        "name": "Greenies Cat Treats Adult Natural Dental Cat Treats Tempting Tuna (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2c0cbc64-2a87-48b3-aca5-86892ce33073-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227864471",
        "name": "Greenies Pill Pockets Soft Cat Treats Chicken (1.6 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7be71c7d-cd0a-4482-bd5e-b7fb8cd2212d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876683",
        "name": "Greenies Pill Pockets Soft Cat Treats Chicken (3 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ff1db1eb-a489-4699-bb14-12201f610028-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227872932",
        "name": "Greenies Pill Pockets Dog Treats Chicken Flavor Tablet Size (3.2 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bd443484-5d5b-484b-8af3-3c76aa710245-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876106",
        "name": "Greenies Pill Pockets Soft Cat Treats Salmon (1.6 oz)",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a0ddf921-da3f-41db-ab09-99a9dc6338e7-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876760",
        "name": "Greenies Pill Pockets Soft Cat Treats Salmon (3 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7af5a9d9-7b00-4afd-a72b-150b0c482da6-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227792974",
        "name": "Greenies Dental Cat Treats Catnip (4.6 oz)",
        "price": 6.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d4680354-8217-4c98-8800-4a6b34376ab2-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874027",
        "name": "Greenies Pill Pockets Dog Treats Hickory Smoke Flavor Capsule Size (15.8 oz)",
        "price": 19.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/67e0b770-acb6-47c9-a2b4-ce950246edaf-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876580_2",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/563ddca5-21fb-43e9-8ecf-075697d4a7ea-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876545_3",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/7d669f15-8363-430a-a288-353f69309155-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876643_2",
        "name": "Greenies Dental Cat Treats Catnip (2.1 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e578a336-a660-4ccd-a3df-18228ada93f7-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227793010_2",
        "name": "Greenies Dental Cat Treats Oven-Roasted Chicken (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f90d8347-9884-4b5e-95ed-23ed222fb056-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876703_2",
        "name": "Greenies Cat Treats Dental Cat Treats Savory Salmon (9.75 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/62845935-dafc-4ad7-a09b-c3724629ddaf-retina-large.jpg",
        "category": ""
      }
    ]
  },
  {
    "id": 8,
    "title": "Our Picks for You",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "9643666776",
        "name": "Petfive Sustainably Yours Natural Sustainable Multi Cat Litter Large Grains (13 lb)",
        "price": 23.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/27a7e8e5-bec4-4a1e-b858-eceefc714f6e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874603_2",
        "name": "Pawsitively Gourmet Mini Cupcake Dog Cookie Assorted Colors",
        "price": 1.69,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/931eacec-b71b-450d-8f1b-7c3092e174da-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407588_2",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Chicken and White Rice (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2ce9081c-2520-448b-a520-683c3dc4bb16-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643666731",
        "name": "Petfive Sustainably Yours Natural Sustainable Multi Cat Litter (13 lb)",
        "price": 23.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f82966aa-f896-45d5-8be0-67016bfd0b8d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826883987",
        "name": "Blue Buffalo Wilderness Nature's Evolutionary Diet Chicken High Protein Adult Dry Dog Food (4.5 lb)",
        "price": 21.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fbda3e55-634e-4fa4-b33b-7dd38728a748-retina-large.png",
        "category": ""
      },
      {
        "id": "23907990940",
        "name": "Litter Pearls UltraLitter Scoop with Sifter Blue",
        "price": 2.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/940d6043-ab34-4d41-81e7-d5d81ad81c15-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686966924",
        "name": "Tetra ReptoMin Baby Floating Food Sticks Reptile Food (0.92 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1bb00422-ca27-4ec6-839b-a6c50e4a3532-retina-large.jpg",
        "category": ["Reptile"]
      },
      {
        "id": "9686981864_2",
        "name": "Etta Says! Yumm Stick Dog Treats Turkey",
        "price": 2.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/acb7c66d-2727-431d-9f1d-9b2a03122727-retina-large.jpg",
        "category": ""
      },
      {
        "id": "14276064490",
        "name": "Open Farm Salmon Silky Mousse Canned Dog Food Topper (1 lb)",
        "price": 2.79,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6d060f07-7f58-4b54-88e0-48879efbd4de-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826883990",
        "name": "Blue Buffalo Wilderness High Protein Salmon & Wholesome Grains Adult Dog Dry Food (4.5 lb)",
        "price": 24.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a7d01969-e8ec-4f9d-b893-4f4f6202be76-retina-large.png",
        "category": ""
      },
      {
        "id": "11826883989",
        "name": "Blue Buffalo Wilderness Nature's Evolutionary Diet with Chicken Adult Dog Food (28 lb)",
        "price": 79.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e4fbc362-f431-4d91-b4b7-2606fb461761-retina-large.png",
        "category": ""
      },
      {
        "id": "14085319044",
        "name": "Pawsitively Gourmet Taco Cookie Dog Treat",
        "price": 2.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fd02a4c4-9e8d-428d-80bd-d9c29a59fa4c-retina-large.jpg",
        "category": ""
      },
      {
        "id": "6493557661",
        "name": "Booda No Tear Cat Litter Scoop One Size",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/fb25ecee-7a70-4e91-a60e-c290fe4f3dff-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643665794",
        "name": "Tetra ReptoMin Floating Reptile Food (10.59 oz)",
        "price": 16.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/88f6bd6d-e6d9-435a-8506-feecddf454d1-retina-large.jpg",
        "category": ""
      },
      {
        "id": "14276030071",
        "name": "Fruitables Pumpkin & Banana Flavor Crunchy Dog Treats (7 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5af767ba-b476-4d27-9305-7b876a980076-retina-large.jpeg",
        "category": ""
      },
      {
        "id": "9607068562",
        "name": "Blue Life Protection Formula Adult Dry Dog Food Chicken and Brown Rice Recipe (30 lb)",
        "price": 64.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b173c03d-06cf-441e-8525-e0de22376919-retina-large.jpg",
        "category": ""
      },
      {
        "id": "14085319043",
        "name": "Pawsitively Gourmet Summer Pawpsicle Cookie Dog Treat",
        "price": 2.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c6579aa9-84e1-4f5f-a9d8-fdb950dda1a1-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227874034",
        "name": "Earth Animal No Hide Beef 4\" Dog Chews (1.2 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/176cface-46bc-4552-bddb-342ea4870d68-retina-large.jpg",
        "category": ""
      },
      {
        "id": "10788346656_2",
        "name": "Redbarn Collagen Stick Small Dog Chew Treat",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/733b3b8d-81ce-49d4-989b-08f06fecf5ba-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407586_2",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Turkey and Whole Wheat Macaroni (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/a478e376-e1cd-4399-ab59-51595826d67e-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407589_2",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Fish and Sweet Potato (18 oz)",
        "price": 10.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/43723197-f3b6-4688-98df-904be263512a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981957_2",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Lamb and Brown Rice (18 oz)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f3e094d4-e69c-4d93-acfa-d86e9d434dba-retina-large.png",
        "category": ""
      },
      {
        "id": "11826884097_2",
        "name": "Vital Essentials Chicken Hearts Freeze-Dried Raw Dog Treats (1 lb)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c099811b-9e06-4da8-a1fd-135f33c133a9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "24011482035",
        "name": "Smalls Bird Broth Chicken Broth For Cats (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/42b51f90-f7a9-42ca-aa59-fe72c5d9f17d-retina-large.jpg",
        "category": ["Cat", "Bird"]
      },
      {
        "id": "5227876436",
        "name": "Litter Genie Disposal System Standard Refill Cat Litter Box",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/ae79bd46-aa12-41bb-aac5-bb3f1c66548b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876553",
        "name": "Nulo Freestyle Wet Cat Food Topper Sardine & Beef in Broth (2.8 oz)",
        "price": 2.39,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8d70cd11-1d35-471c-ace1-59e577ab7128-retina-large.jpg",
        "category": ""
      },
      {
        "id": "12233595227",
        "name": "Smart Litter Clumping Unscented Cat Litter (15 lb)",
        "price": 12.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1901ad4f-c202-4bb6-a677-70737650d6c4-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9732317108",
        "name": "Moderna Deep Litter Pan Large Warm Grey",
        "price": 9.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bfa1183f-6033-450a-9cd6-73692ecc0007-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876813",
        "name": "Skouts Honor Professional Strength Cat Litter Box Deodorizer Spray (1 lb)",
        "price": 14.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d654a25f-92fd-4d26-8013-ad58f597f640-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9732317116",
        "name": "Dr. Elsey's Ultra Clumping Cat Litter Multi-Cat Strength Unscented (20 lb)",
        "price": 14.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/d7475cea-0586-4c75-b3f7-eda31c48c1db-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329430335_2",
        "name": "PetAg KMR Kitten Milk Replacer Liquid (11 oz)",
        "price": 11.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/75948eaf-834b-40e3-bcac-a4ca2bf4f843-retina-large.jpg",
        "category": ""
      },
      {
        "id": "13329407587_2",
        "name": "JustFoodForDogs Frozen Cooked Dog Food Beef and Russet Potato (18 oz)",
        "price": 11.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/879ebbfd-5899-42fe-913d-d607c1b3111d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876775_2",
        "name": "Vital Essentials Chicken Hearts Freeze-Dried Raw Cat Treats (0.8 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e9b00614-a845-4193-8bd9-7ed35cc06fa6-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876785_2",
        "name": "Vital Essentials Chicken Breast Freeze-Dried Raw Cat Treats (1 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/307551f7-c30d-48cf-a7bc-782afc93909b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876511_2",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f1240486-01a1-4003-8b12-a75d125cb49b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9607111557_2",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken & Salmon Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f38d6e46-5be0-4e32-bf70-bd439258ddf5-retina-large.jpg",
        "category": ""
      }
    ]
  },
  {
    "id": 9,
    "title": "Treats Under $10",
    "storeName": "Pet Food Express",
    "storeImage": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/a444d5eb-10c4-45e1-86a1-65a001a1a81f.png",
    "time": "",
    "isSnapEligible": false,
    "products": [
      {
        "id": "9686981521",
        "name": "Catit Nibbly Salmon Dog Treats (3.2 oz)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/8318f996-19cd-439d-92f8-7cd505743d20-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9607111557_3",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken & Salmon Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f38d6e46-5be0-4e32-bf70-bd439258ddf5-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876511_3",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Chicken Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/f1240486-01a1-4003-8b12-a75d125cb49b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876780_2",
        "name": "Vital Essentials Duck Liver Freeze Dried Raw Cat Treats (0.9 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/93276a87-9ee6-47e8-845c-904f78a6400c-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981523_2",
        "name": "Catit Creamy Salmon Lickable Cat Treats (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/6cecc670-c7af-4449-b670-f2814807cc58-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227876533_2",
        "name": "Tiki Cat Stix Wet Cat Treats Chicken Mousse (6 ct)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/05e5b780-ba8e-489b-bd3f-e8c6cdcc84d0-retina-large.png",
        "category": ""
      },
      {
        "id": "9686948019_2",
        "name": "Fruitables Wildly Natural Cat Treats Salmon (2.5 oz)",
        "price": 5.48,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/78fbc481-8a70-48b5-8ce4-53449e653eb2-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686948068_2",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Tuna & Crab Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4e514b67-5b2a-498d-a743-27c861a0729b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9643666679_2",
        "name": "Applaws Natural Cat Treats Whole Mackerel Loin (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/03751958-a72b-41ac-940d-b93fcfaa46a4-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9706945765_2",
        "name": "Applaws Natural Loin Cat Treats Tuna Loin (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1fb7437d-2c1a-46a9-9a70-48a2a8c9f820-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981556_2",
        "name": "Catit Creamy Lickable Cat Treats Tuna Recipe (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/4a19ef16-c3d4-4fed-92f2-7564b7f7d605-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981559_2",
        "name": "Kiwi Kitchens Raw Freeze Dried Cat Treats Beef Liver (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b8a62c4c-3657-4ce0-808b-3d9162c95ae0-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9732317094_2",
        "name": "Applaws Natural Loin Cat Treats Chicken Filet with Rosemary (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1a24f6d5-dd9d-416d-9781-662347c54c1b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686948066_2",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Beef & Sardine Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/c2d9891b-ec62-41f3-aa3c-dcadec92ab09-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686948067_2",
        "name": "Nulo Freestyle Perfect Purees Cat Treats Tuna & Scallop Recipe (0.5 oz)",
        "price": 1.29,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/86dc373c-e1c6-4908-a382-446e7ffaaf6c-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981519_2",
        "name": "Catit Nibbly Cat Treats Chicken (3.2 oz)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/3ab8f790-0248-4cb8-8859-a2795ba29096-retina-large.jpg",
        "category": ""
      },
      {
        "id": "23056175816",
        "name": "Fog City Pet Soft Salmon Trial Size Cat Treats (1 oz)",
        "price": 1.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1c146b21-24f6-4a23-b4c8-990f61150a13-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686948040",
        "name": "Cat Sushi Bonito Flakes Cat Treats (0.7 oz)",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/2ccae59e-95fe-456e-9850-f2ea6f505c82-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227864333",
        "name": "Icelandic+ Herring Whole Fish Cat Treats (1.5 oz)",
        "price": 8.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/3a4a11fd-9886-4ba3-81fe-bc0c172f2cf9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227864317",
        "name": "Tiki Cat Stix Wet Cat Treats Tuna Mousse (6 ct)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/93279486-a467-45b4-bf01-8f4f0aff6258-retina-large.jpg",
        "category": ""
      },
      {
        "id": "21202008429",
        "name": "Fog City Pet Snackables Crunchy W/ Soft Filling Salmon Cat Treats (3 oz)",
        "price": 3.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1f274364-d5f3-40ec-94c8-9a4371941cd9-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981583",
        "name": "Kiwi Kitchens Raw Freeze Dried Cat Treats Chicken Liver (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/1ed61a78-ba28-485c-b962-1a726cd9ee9f-retina-large.jpg",
        "category": ""
      },
      {
        "id": "5227792962",
        "name": "Kiwi Kitchens Raw Freeze Dried Cat Treats Lamb Liver (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/74d3a336-46b0-4431-b532-5788e8651387-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981560",
        "name": "Kiwi Kitchens Raw Freeze Dried Cat Treats Venison Recipe (1.05 oz)",
        "price": 5.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/5d419878-8478-4d1a-99f5-3462bbf8a72a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981517",
        "name": "Applaws Natural Loin Cat Treats Salmon Filet (1.06 oz)",
        "price": 3.59,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/3638a2bb-11d3-41a4-8dea-c8af8bd6a33c-retina-large.jpg",
        "category": ""
      },
      {
        "id": "23056175817",
        "name": "Fog City Pet Snackables Crunchy W/ Soft Filling Chicken Trial Size Cat Treats (1 oz)",
        "price": 1.49,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/bd7511b9-549a-4dde-8bd5-f24fdb7c1c49-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876784_3",
        "name": "Vital Essentials Minnows Freeze Dried Raw Cat Treats (0.5 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/b6fefbd8-c2a2-492b-b502-fdd15747931d-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876785_3",
        "name": "Vital Essentials Chicken Breast Freeze-Dried Raw Cat Treats (1 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/307551f7-c30d-48cf-a7bc-782afc93909b-retina-large.jpg",
        "category": ""
      },
      {
        "id": "9686981522_2",
        "name": "Catit Creamy Lickable Cat Treats Chicken & Liver Recipe (5 ct)",
        "price": 4.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/30a42537-66ad-47b3-9596-e361334d9b8a-retina-large.jpg",
        "category": ""
      },
      {
        "id": "11826876775_3",
        "name": "Vital Essentials Chicken Hearts Freeze-Dried Raw Cat Treats (0.8 oz)",
        "price": 7.99,
        "image": "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/photosV2/e9b00614-a845-4193-8bd9-7ed35cc06fa6-retina-large.jpg",
        "category": ""
      }
    ]
  }
];

// Pet product categories
export const petProductCategories = [
  "Dog", "Cat", "Small Pets", "Bird", "Fish", "Reptile"
];

// Pet UI configuration
export const petUiConfig: PetUiConfig = {
  pageTitle: "Pet Supplies",
  nearbyTitle: "Pet Stores Near You",
  allStoresTitle: "All Pet Stores",
  dealsTitle: "Featured Deals",
  seeAllText: "See All Pet Stores",
  seeAllDescription: "View all available pet supply stores in your area"
};

// Featured deal store
export const featuredDealStore: PetStore = {
  id: "petsmart",
  name: "PetSmart",
  image: "/store-logos/default-store.svg",
  deliveryTime: "15-30 min"
};

// Featured deals
export const featuredDeals: PetDeal[] = [
  {
    id: 1,
    name: "Dog Food",
    price: 24.99,
    originalPrice: 29.99,
    image: "/placeholder.jpg"
  },
  {
    id: 2,
    name: "Cat Treats",
    price: 12.99,
    originalPrice: 16.99,
    image: "/placeholder.jpg"
  },
  {
    id: 3,
    name: "Fish Tank",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.jpg"
  },
  {
    id: 4,
    name: "Bird Cage",
    price: 34.99,
    originalPrice: 44.99,
    image: "/placeholder.jpg"
  }
];
