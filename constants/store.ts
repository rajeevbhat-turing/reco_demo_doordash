export interface Store {
    id: string
    name: string
    image: string
    openTime: string
    deliveryTime: string
    discount?: string
    isDashPass: boolean
    isNearYou: boolean
    tags?: string[]
  }

export const stores: Store[] = [
    {
      id: "sephora",
      name: "Sephora",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/bf7a879f-2c7b-4fc7-b796-0d71324881b1.png",
      openTime: "Opens Tue at 10:00 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Beauty", "Retail", "Under 30 min", "Over 4.5", "Convenience"]
    },
    {
      id: "ulta",
      name: "Ulta Beauty",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/545c07ad-245f-4398-9f04-271f97282063.jpg",
      openTime: "Opens Tue at 10:00 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Beauty", "Retail"]
    },
    {
      id: "dicks",
      name: "Dick's Sporting Goods",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/c6f05340-0e3b-4f33-aa22-b7edd1936216.png",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Retail"]
    },
    {
      id: "michaels",
      name: "Michaels",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/3e4206fc-0103-4a03-a711-9c966c7041c4.png",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "null min",
      discount: "30% off $20",
      isDashPass: true,
      isNearYou: true,
      tags: ["Retail"]
    },
    {
      id: "bestbuy",
      name: "Best Buy",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d81e1e3f-3852-4e58-861d-a72e1cc96d1b.png",
      openTime: "Opens Tue at 10:00 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Retail"]
    },
    {
      id: "sally",
      name: "Sally Beauty",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d3d258aa-9038-4e2d-96b7-ca02319318eb.jpg",
      openTime: "Opens Tue at 10:30 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Beauty", "Retail"]
    },
    {
      id: "lowes",
      name: "Lowe's",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
      openTime: "",
      deliveryTime: "33 min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Retail"]
    },
    {
      id: "edible",
      name: "Edible",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/cfb23e1c-9274-47e1-8f7b-4da29736f43b.png",
      openTime: "Opens Tue at 9:50 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: true,
      tags: ["Retail"]
    },
    {
      id: "bloomcart",
      name: "Bloom Cart ®",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/e9ebbf99-cf77-4159-aeb2-e080c2933abc.jpg",
      openTime: "Opens Wed at 10:20 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "bouqs",
      name: "The Bouqs Co. Flower Shop",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/012f51fe-d41a-4186-97e6-6c8c33b97f76.jpg",
      openTime: "Opens Tue at 8:00 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "designerblooms",
      name: "Designer Blooms",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/dacbbc16-db2a-45c9-80c8-9079e9dbf4c8.jpg",
      openTime: "Opens Tue at 8:30 AM",
      deliveryTime: "null min",
      discount: "15% off, up to $9",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "target",
      name: "Target",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
      openTime: "Opens Tue 8:00 AM",
      deliveryTime: "Closed",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Convenience"]
    },
    {
      id: "rosethorne",
      name: "Flowers by Rose and Thorn",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/fdf29fd1-c1b3-4d36-8ec3-fa39de982da6.png",
      openTime: "Opens Tue at 10:20 AM",
      deliveryTime: "null min",
      discount: "$5 off on $35+",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "coley",
      name: "Flowers By Coley",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/43493379-7ccc-4a65-9d59-5c8640ac6d61.jpg",
      openTime: "Opens Tue at 9:20 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "walgreens",
      name: "Walgreens",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/Screen_Shot_2020-12-08_at_9.16.57_AM.png",
      openTime: "Opens Thu at 7:00 AM",
      deliveryTime: "18 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["SNAP", "Retail", "Convenience", "Beauty"]
    },
    {
      id: "silvanas",
      name: "Silvanas Party Supply",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/dbfccc91-e6b6-4a82-b4a9-1ba8aae737b0.jpg",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "53 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Over 4.5"]
    },
    {
      id: "cvs",
      name: "CVS",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/cvs_logo.png",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "20 min",
      discount: "$5 off $25+",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Convenience", "SNAP", "Under 30 min"]
    },
    {
      id: "safeway-flower",
      name: "Safeway Flower Shop",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/c5fdd4df-f8e3-44ee-937d-90d5cfd92df4.jpeg",
      openTime: "Opens Wed at 10:20 AM",
      deliveryTime: "15 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "blooming-moment",
      name: "Blooming Moment Florist",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a9881f99-daed-4bb0-87a8-686d7347d468.jpg",
      openTime: "Opens Tue at 10:20 AM",
      deliveryTime: "35 min",
      discount: "15% off, up to $5",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "revel-plants",
      name: "Revel- Plants, Flowers & Goods",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/abbf2522-b978-43b9-84f1-5bb18280fbe1.jpg",
      openTime: "Opens Wed at 12:05 PM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min"]
    },
    {
      id: "footlocker",
      name: "Foot Locker",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/fa9957cd-2c67-4c5a-be78-0be432833c99.png",
      openTime: "Opens Tue at 10:10 AM",
      deliveryTime: "40 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Over 4.5"]
    },
    {
      id: "monicas-florist",
      name: "Monica's Florist",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/e47115ff-8eb4-4475-b393-0246c87b0dfd.png",
      openTime: "Opens Tue at 9:20 AM",
      deliveryTime: "28 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "sol-ambiance",
      name: "Sol Ambiance",
      image: "",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "45 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "bloom-gallery",
      name: "Bloom Gallery Flowers",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/43de91a5-9e4e-42ff-b391-9ce0677187d9.png",
      openTime: "Opens Tue at 11:20 AM",
      deliveryTime: "20 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "office-depot",
      name: "Office Depot OfficeMax",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/61d55b76-4e2a-492c-bcc1-c1dc37a0180d.jpg",
      openTime: "Opens Tue at 8:30 AM",
      deliveryTime: "35 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail"]
    },
    {
      id: "san-bruno-flower",
      name: "San Bruno Flower Fashions",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a542575a-b7c7-4046-9482-bba4fdf5bc7e.03",
      openTime: "Opens Tue at 9:05 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min"]
    },
    {
      id: "little-garden",
      name: "Little Garden SF LLC",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/bb4c92d8-14a1-4efa-bf67-320612045e6c.png",
      openTime: "Opens Tue at 8:00 AM",
      deliveryTime: "15 min",
      discount: "$5 off on $30+",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "love-and-stem",
      name: "Love and Stem",
      image: "",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "40 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "victorias-secret",
      name: "Victoria's Secret",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/269bada2-76b6-47b2-a220-4cd8651c0ead.png",
      openTime: "Opens Tue at 11:00 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Under 30 min"]
    },
    {
      id: "flower-gift-boutique",
      name: "The Flower & Gift Boutique",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/d84a759f-245a-4ad0-8ad8-0b8bf5ef7c57.jpg",
      openTime: "Opens Tue at 8:00 AM",
      deliveryTime: "35 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "ace-hardware",
      name: "Ace Hardware",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/7a2ccc67-5ac3-49fa-8d46-72e9d986a70e.png",
      openTime: "Opens Tue at 9:30 AM",
      deliveryTime: "20 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "you-see-flowers",
      name: "You See Flowers",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/278f6100-2b40-46d4-9f74-6a0cbb9d309d.jpg",
      openTime: "Opens Tue at 9:50 AM",
      deliveryTime: "45 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "colma-floral",
      name: "Colma Floral Shop",
      image: "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a85226c0-63ed-4d17-9658-d28bf8c0ea74.jpg",
      openTime: "Opens Tue at 8:20 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    }
  ]

export const retailCategories = [
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
    },
    {
        "id": "798824451433136156",
        "name": "Pet Parents",
        "slug": "pet parents-798824451433136156",
        "image": "https://img.cdn4dd.com/s/convenience/images/pet-parents.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "802234456357568539",
        "name": "Other Pets",
        "slug": "other pets-802234456357568539",
        "image": "https://img.cdn4dd.com/s/convenience/images/other-pets.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "754",
        "name": "Household",
        "slug": "household-754",
        "image": "https://img.cdn4dd.com/s/convenience/images/household.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "1026",
        "name": "Pet Care",
        "slug": "pet care-1026",
        "image": "https://img.cdn4dd.com/s/convenience/images/pet-care.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "21150",
        "name": "Makeup",
        "slug": "makeup-21150",
        "image": "https://img.cdn4dd.com/s/convenience/images/makeup.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "4732",
        "name": "Skin Care",
        "slug": "skin care-4732",
        "image": "https://img.cdn4dd.com/s/convenience/images/skin-care.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "4724",
        "name": "Hair",
        "slug": "hair-4724",
        "image": "https://img.cdn4dd.com/s/convenience/images/hair.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "4722",
        "name": "Fragrances",
        "slug": "fragrances-4722",
        "image": "https://img.cdn4dd.com/s/convenience/images/fragrances.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "4728",
        "name": "Tools & Brushes",
        "slug": "tools & brushes-4728",
        "image": "https://img.cdn4dd.com/s/convenience/images/tools-brushes.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "4720",
        "name": "Bath & Body",
        "slug": "bath & body-4720",
        "image": "https://img.cdn4dd.com/s/convenience/images/bath-body.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "757",
        "name": "Personal Care",
        "slug": "personal care-757",
        "image": "https://img.cdn4dd.com/s/convenience/images/personal-care.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "21149",
        "name": "Nails",
        "slug": "nails-21149",
        "image": "https://img.cdn4dd.com/s/convenience/images/nails.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "28246",
        "name": "Accessories",
        "slug": "accessories-28246",
        "image": "https://img.cdn4dd.com/s/convenience/images/accessories.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    },
    {
        "id": "1125",
        "name": "Vitamins",
        "slug": "vitamins-1125",
        "image": "https://img.cdn4dd.com/s/convenience/images/vitamins.png",
        "type": "RETAIL_L1_NAVIGATION_TYPE_CATEGORY",
        "isActive": true
    }
]
