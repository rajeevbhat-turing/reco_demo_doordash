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
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/31ebd41c-7e40-498f-9d46-32e36421e2d5.jpg",
      openTime: "Opens Wed at 10:20 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "bouqs",
      name: "The Bouqs Co. Flower Shop",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/6e2d4f5e-9c91-47b8-9b2f-6c438a76b791.jpg",
      openTime: "Opens Tue at 8:00 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "designerblooms",
      name: "Designer Blooms",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/6e2d4f5e-9c91-47b8-9b2f-6c438a76b791.jpg",
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
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/6c459bbc-4cd4-456e-b7f3-8902e0417e1c.jpg",
      openTime: "Opens Tue 8:00 AM",
      deliveryTime: "Closed",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Convenience"]
    },
    {
      id: "rosethorne",
      name: "Flowers by Rose and Thorn",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/6e2d4f5e-9c91-47b8-9b2f-6c438a76b791.jpg",
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
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/6e2d4f5e-9c91-47b8-9b2f-6c438a76b791.jpg",
      openTime: "Opens Tue at 9:20 AM",
      deliveryTime: "null min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "walgreens",
      name: "Walgreens",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/10e39cac-6336-4a32-a72e-f1924532c882.jpg",
      openTime: "",
      deliveryTime: "18 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["SNAP", "Retail", "Convenience", "Beauty"]
    },
    {
      id: "silvanas",
      name: "Silvanas Party Supply",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/silvanas-party-supply.jpg",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "53 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Over 4.5"]
    },
    {
      id: "cvs",
      name: "CVS",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/cvs.jpg",
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
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/safeway-flower.jpg",
      openTime: "Opens Wed at 10:20 AM",
      deliveryTime: "15 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "blooming-moment",
      name: "Blooming Moment Florist",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/blooming-moment.jpg",
      openTime: "Opens Tue at 10:20 AM",
      deliveryTime: "35 min",
      discount: "15% off, up to $5",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "revel-plants",
      name: "Revel- Plants, Flowers & G...",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/revel-plants.jpg",
      openTime: "Opens Wed at 12:05 PM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min"]
    },
    {
      id: "footlocker",
      name: "Foot Locker",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/footlocker.jpg",
      openTime: "Opens Tue at 10:10 AM",
      deliveryTime: "40 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Over 4.5"]
    },
    {
      id: "monicas-florist",
      name: "Monica's Florist",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/monicas-florist.jpg",
      openTime: "Opens Tue at 9:20 AM",
      deliveryTime: "28 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "sol-ambiance",
      name: "Sol Ambiance",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/sol-ambiance.jpg",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "45 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "bloom-gallery",
      name: "Bloom Gallery Flowers",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/bloom-gallery.jpg",
      openTime: "Opens Tue at 11:20 AM",
      deliveryTime: "20 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "office-depot",
      name: "Office Depot OfficeMax",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/office-depot.jpg",
      openTime: "Opens Tue at 8:30 AM",
      deliveryTime: "35 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail"]
    },
    {
      id: "san-bruno-flower",
      name: "San Bruno Flower Fashions",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/san-bruno-flower.jpg",
      openTime: "Opens Tue at 9:05 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min"]
    },
    {
      id: "little-garden",
      name: "Little Garden SF LLC",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/little-garden.jpg",
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
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/love-and-stem.jpg",
      openTime: "Opens Tue at 9:00 AM",
      deliveryTime: "40 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "victorias-secret",
      name: "Victoria's Secret",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/victorias-secret.jpg",
      openTime: "Opens Tue at 11:00 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Under 30 min"]
    },
    {
      id: "flower-gift-boutique",
      name: "The Flower & Gift Boutique",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/flower-gift-boutique.jpg",
      openTime: "Opens Tue at 8:00 AM",
      deliveryTime: "35 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Over 4.5"]
    },
    {
      id: "ace-hardware",
      name: "Ace Hardware",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/ace-hardware.jpg",
      openTime: "Opens Tue at 9:30 AM",
      deliveryTime: "20 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Retail", "Under 30 min", "Over 4.5"]
    },
    {
      id: "you-see-flowers",
      name: "You See Flowers",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/you-see-flowers.jpg",
      openTime: "Opens Tue at 9:50 AM",
      deliveryTime: "45 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail"]
    },
    {
      id: "colma-floral",
      name: "Colma Floral Shop",
      image: "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/store/cover/colma-floral.jpg",
      openTime: "Opens Tue at 8:20 AM",
      deliveryTime: "25 min",
      isDashPass: true,
      isNearYou: false,
      tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"]
    }
  ]