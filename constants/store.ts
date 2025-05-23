export interface Store {
  id: string;
  name: string;
  image: string;
  openTime: string;
  deliveryTime: string;
  discount?: string;
  isDashPass: boolean;
  isNearYou: boolean;
  tags?: string[];
  items?: any;
}

export const stores: Store[] = [
  {
    id: "sephora",
    name: "Sephora",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/bf7a879f-2c7b-4fc7-b796-0d71324881b1.png",
    openTime: "Opens Tue at 10:00 AM",
    deliveryTime: "25 min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Beauty", "Retail", "Under 30 min", "Over 4.5", "Convenience"],
    items: [
      {
        id: 1,
        title: "Popular Deals",
        products: [
          {
            id: "24501494028",
            name: "Charlotte Tilbury Pillow Talk Iconic Lip and Cheek Secrets Set",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/2ae1887d-8284-4b2d-96d2-6c58018b0ca8-retina-large.jpg",
            price: "$37.80",
            originalPrice: "54.00",
            discount: "30% off",
            rating: null,
            ratingCount: null,
            description: "What it is: A four-piece set of Pillow Talk icons featuring a full-size Hyaluronic Happikiss and travel-size Lip Cheat, Collagen Lip Bath, and Beauty Highlighter Wand. Ingredient Callouts: Free of parabens, formaldehydes, formaldehyde-releasing agents, phthalates, oxybenzone, coal tar, hydroquinone, sulfates SLS & SLES, triclocarban, triclosan, and contains less than one percent synthetic fragrance. These products are cruelty-free. What Else You Need to Know: Meet Charlotte Tilbury’s award-winning, universally flattering phenomenon. Use the Lip Cheat Lip Liner to reshape and resize the look of your lips, Hyaluronic Happikiss Lipstick Balm for a high-shine finish with nourishing care, Collagen Lip Bath Gloss to smooth and plump for fuller-looking lips, and Pillow Talk Beauty Highlighter Wand for cheekbones that glow in every light. This Set Contains: - 0.08 oz/ 0.24g Hyaluronic Happikiss Lipstick Balm (Crystal Happikiss) - 0.02 oz/ 0.8g Lip Cheat Lip Liner (Pillow Talk) - 0.08 oz/ 0.26 mL Collagen Lip Bath Gloss (Pillow Talk) - 0.16 oz/ 5 mL Beauty Highlighter Wand (Pillow Talk) About the brand: Founded by British makeup artist Charlotte Tilbury, MBE, in 2013, Charlotte Tilbury Beauty revolutionized the face of the global beauty industry by decoding makeup application for everyone, at every age, with an easy-to-use, easy-to-choose, easy-to-gift range. The company mission is to share the power of makeup, using Charlotte’s award-winning, iconic makeup and research-powered skincare products, to show everyone how easy it is to look and feel like the most beautiful versions of themselves every single day."
          },
          {
            id: "19487141327",
            name: "Yves Saint Laurent Black Opium Eau de Parfum Extreme (1.7 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/7cc546a5-063a-4883-985b-6c33231a123c-retina-large.jpg",
            price: "$78.00",
            originalPrice: "130.00",
            discount: "40% off",
            rating: null,
            ratingCount: null,
            description: "Yves Saint Laurent reigns as one of the most influential and inspired designers in the world. From his early days in the studio of Christian Dior to his acclaimed haute couture collections of today, YSL's touch remains unmistakable. The YSL style is reflected in the realm of fashion, including accessories, jewelry, ready-to-wear, fragrance, and cosmetics. About the brand:"
          },
          {
            id: "25122197008",
            name: "Dyson Limited Edition Supersonic Nural\u2122 Hair Dryer in Jasper Plum",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/9e4193b5-3775-4439-b524-c40d42680baa-retina-large.jpg",
            price: "$399.00",
            originalPrice: "499.00",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "14276486147",
            name: "Sunday Riley Pink Drink Firming Resurfacing Peptide Face Mist (1.7 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/2898876e-31e8-43f9-aaeb-aa3e1de34979-retina-large.jpg",
            price: "$36.00",
            originalPrice: "48.00",
            discount: "25% off",
            rating: "3.8",
            ratingCount: null,
            description: "What it is: A peptide-infused essence that visibly firms and resurfaces the skin while supporting its natural microbiome with fermented honey and botanical extracts. Skin Type: Normal, Dry, Combination, and Oily Skincare Concerns: Fine Lines and Wrinkles, Redness, and Loss of Firmness and Elasticity Formulation: Lightweight Liquid Highlighted Ingredients: - Peptide Complex: Visibly firms and resurfaces the skin for a smooth, youthful look. - Prebiotic Complex: Supports the skin‘s natural microbiome, decreasing visible surface redness and promoting a healthier appearance. - Green-Tea-Derived EGCG: Fights premature skin aging. Ingredient Callouts: Free of sulfates SLS and SLES, parabens, formaldehydes, formaldehyde-releasing agents, phthalates, mineral oil, retinyl palmitate, oxybenzone, coal tar, hydroquinone, triclosan, and triclocarban, and contains less than one percent of synthetic fragrances. This product is also cruelty-free and gluten-free. What Else You Need to Know: Give your skin a pink power drink. This essence is formulated with acetyl tetrapeptides-9 and -11, which work synergistically to create firmer-looking skin. Fermented honey and pink yeast filtrate act as prebiotics to support a visibly healthy skin microbiome, while EGCG (a powerful antioxidant from green tea) fights future signs of aging. Clean at Sephora is our commitment to offering effective products without certain ingredients, such as parabens, sulfates, phthalates, and mineral oils. Learn more here. About the brand: Brand founder Sunday Riley’s revolutionary formulas offer fast and visible results. Each product is a powerful, targeted treatment designed to improve skin with carefully crafted, high-tech formulas that start working immediately and continue to be effective over time"
          },
          {
            id: "19569823919",
            name: "Bobbi Brown Dual-Ended Long-Wear Waterproof Cream Eyeshadow Stick Rusted Pink/Cinnamon (0.0564 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/19b6d05f-32ea-4ab3-98fd-872a4cb5fd03-retina-large.jpg",
            price: "$29.40",
            originalPrice: "42.00",
            discount: "30% off",
            rating: "4.6",
            ratingCount: null,
            description: "What it is: A long-lasting, do-it-all eyeshadow, made more effortless with a dual-ended component and a budge-proof formula that stays put for up to twenty-four hours. Features Artist-curated, complementary matte and shimmer shades to swipe-and-go. What Else You Need to Know: This formula glides onto lids for tug-free coverage. It can be used to shade, define, smoke up, or highlight eyes. Create instant looks that last with 24 hours of non-creasing, color-true wear that’s also waterproof and an ultra-creamy buildable formula. About the brand: Founded in 1991 by legendary makeup artist Bobbi Brown, this global premium beauty brand celebrates the individual beauty of all women around the world. From face products that are expressly designed to look like skin to colors that enhance eyes, cheeks, and lips, Bobbi Brown encapsulates the essence of modern beauty."
          },
          {
            id: "25122197009",
            name: "Dyson Limited Edition Airstrait\u2122 Wet-to-Dry Straightener in Jasper Plum",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/0759ba36-a270-4dfd-a8f1-89296adb9a4a-retina-large.jpg",
            price: "$399.00",
            originalPrice: "499.00",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 2,
        title: "Memorial Day Sale",
        products: [
          {
            id: 17962675587,
            name: "Sephora Collection Weightless False Eyelashes",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/79a91ea0-7042-414b-9322-e2407bce3d3c-retina-large.jpg",
            price: "$8.00",
            originalPrice: "$16.00",
            discount: "50% off",
            rating: null,
          },
          {
            id: 25206314194,
            name: "Sephora Collection Super Glow Serum with Vitamin C + E (1.01 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/ab7d10d6-5740-4a43-83c0-133dc385962a-retina-large.jpg",
            price: "$10.50",
            originalPrice: "$21.00",
            discount: "50% off",
            rating: null,
          },
          {
            id: 24916225679,
            name: "Living Proof Perfect hair Day (PhD) Dry Shampoo (5.5 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/34925e7f-c532-41c2-87cb-a6f47126ffd7-retina-large.jpg",
            price: "$21.00",
            originalPrice: "$30.00",
            discount: "30% off",
            rating: 3.8,
          },
          {
            id: 24951418153,
            name: "NEST New York Madagascar Vanilla Perfume Oil Rollerball (0.20 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/7aa74a99-d529-4d70-b550-ff4069a1c426-retina-large.jpg",
            price: "$26.25",
            originalPrice: "$35.00",
            discount: "25% off",
            rating: 4.1,
          },
          {
            id: 17759961772,
            name: "Color Wow Money Mask Deep Hydrating & Strengthening Hair Treatment (7.5 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/2d580dea-36bc-4a1c-be87-0e038dd0ad44-retina-large.jpg",
            price: "$33.75",
            originalPrice: "$45.00",
            discount: "25% off",
            rating: null,
          },
          {
            id: 19487191322,
            name: "OLEHENRIKSEN Cold Plunge\u2122 Pore Remedy Moisturizer with BHA/LHA (1.7 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/38234a8d-7761-4cde-af73-8a69d2468192-retina-large.jpg",
            price: "$22.95",
            originalPrice: "$51.00",
            discount: "55% off",
            rating: 3.5,
          },
          {
            id: 24355620986,
            name: "Dr. Jart+ Mini Cicapair\u2122 Tiger Grass Color Correcting Treatment (0.5 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/5ce517a0-ffe3-4af4-9c4c-f337e6b4e001-retina-large.jpg",
            price: "$19.00",
            originalPrice: "$25.00",
            discount: "24% off",
            rating: null,
          },
        ],
      },
      {
        id: 3,
        title: "Bath & Body",
        products: [
          {
            id: 18368888270,
            name: "Sol de Janeiro Beija Flor\u2122 Jet Set",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/52c0c2ea-9978-41c6-92e8-c7b294494ab7-retina-large.jpg",
            price: "$32.00",
            originalPrice: null,
            discount: null,
            rating: 4.3,
          },
          {
            id: 23679052921,
            name: "Touchland Power Mist Hydrating Hand Sanitizer Mango Passion (1 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/84813062-9e31-498f-bfd1-e28b5e1640d6-retina-large.jpg",
            price: "$10.00",
            originalPrice: null,
            discount: null,
            rating: 4.4,
          },
          {
            id: 22847876193,
            name: "Sol de Janeiro Brazilian Bum Bum Jet Set",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/c552e2c9-4f78-4c20-9c4d-4f2ce5415cb7-retina-large.jpg",
            price: "$32.00",
            originalPrice: null,
            discount: null,
            rating: 4.6,
          },
          {
            id: 22925315238,
            name: "Topicals Faded Brightening & Cleansing Body Bar for Uneven Skin Tone (2 Pack) (2 Bars)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/5f5d0a03-934f-4f64-bea7-7ebaaf671c44-retina-large.jpg",
            price: "$28.00",
            originalPrice: null,
            discount: null,
            rating: 4.8,
          },
          {
            id: 23679052922,
            name: "Touchland Gentle Mist Ultra-Soothing Hand Sanitizer Lily of the Valley (1 fl)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/c4c33d60-a082-4a3f-8a65-8ebe0f5cc685-retina-large.jpg",
            price: "$16.00",
            originalPrice: null,
            discount: null,
            rating: 4.5,
          },
          {
            id: 11328507772,
            name: "Rare Beauty by Selena Gomez Find Comfort Niacinamide Hydrating Body Lotion (8.45 fl)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/da18b21d-d982-48af-8685-8ca460a15414-retina-large.jpg",
            price: "$14.00",
            originalPrice: null,
            discount: null,
            rating: 4.7,
          },
          {
            id: 19646806136,
            name: "Salt & Stone Santal & Vetiver Refillable Body Wash with Niacinamide + Probiotic Santal & Vetiver (15.2 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/1e16c257-435a-45a8-a110-2ddbec563338-retina-large.jpg",
            price: "$36.00",
            originalPrice: null,
            discount: null,
            rating: 4.3,
          },
        ],
      },
      {
        id: 4,
        title: "Skip the Salon",
        products: [
          {
            id: 23953455301,
            name: "Olaplex No. 7 Bonding Frizz Reduction & Heat Protectant Hair Oil (1 oz)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/3c19a21d-9796-41ab-85cf-d9a6dcc3e741-retina-large.jpg",
            price: "$30.00",
            originalPrice: null,
            discount: null,
            rating: 4.5,
            ratingCount: "1k+",
          },
          {
            id: "22784486758",
            name: "Glamnetic Press-On Nail Kit",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/e480365e-e79c-46cc-aed8-ec9b9279c241-retina-large.jpg",
            price: "$15.00",
            originalPrice: null,
            discount: null,
            rating: "3.9",
            ratingCount: "200+",
          },
          {
            id: "19569812798",
            name: "Slip Slipsilk™ Skinny Scrunchies - 3 pack Dame (3 scrunchies)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/1251f6ee-e9fd-4327-aa67-eb9047ea2d6c-retina-large.jpg",
            price: "$24.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "19994014590",
            name: "Mane Mini Ready or Knot Detangling Paddle Hair Brush",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/227be2d7-4eda-42d8-ac63-ea38787bbe7c-retina-large.jpg",
            price: "$15.00",
            originalPrice: null,
            discount: null,
            rating: "4.3",
            ratingCount: null,
          },
        ],
      },
    ],
  },
  {
    id: "ulta",
    name: "Ulta Beauty",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/545c07ad-245f-4398-9f04-271f97282063.jpg",
    openTime: "Opens Tue at 10:00 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Beauty", "Retail"],
    items: [
      {
        id: 1,
        title: "Popular Deals",
        products: [
          {
            id: "25502239320",
            name: "Eos Cashmere Shave Oil 6.0oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/a2aa6f4e-fa23-4a89-b142-9c54192f2013-retina-large.png",
            price: "$7.99",
            originalPrice: "$9.99",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "14395632298",
            name: "Urban Decay Cosmetics Face Bond Self-Setting Waterproof Foundation 8 1.0oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/40371954-bfdf-49fa-b164-9dae4d11922e-retina-large.png",
            price: "$32.00",
            originalPrice: "$40.00",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "22870732007",
            name: "COSRX The Alpha-Arbutin 2 Discoloration Care Serum 1.69oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/d84d215b-1cb9-42dd-9e3b-058686d9138c-retina-large.png",
            price: "$18.75",
            originalPrice: "$25.00",
            discount: "25% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "13663273359",
            name: "Urban Decay Cosmetics All Nighter Waterproof Makeup Setting Spray 4.0oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/bb7979aa-c5f0-48b5-897f-d61af92cba5e-retina-large.png",
            price: "$28.80",
            originalPrice: "$36.00",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 2,
        title: "Memorial Day Deals",
        products: [
          {
            id: "13663075146",
            name: "ULTA Beauty Collection Pink Exfoliating Loofah 1ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/8765de5b-06bc-4759-aea6-fcd5dfe2daf4-retina-large.png",
            price: "$$350",
            originalPrice: "$5.00",
            discount: "30% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "25659971856",
            name: "ULTA Beauty Collection Axolotl Bath Bomb Fizzer",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/5b6a5762-836e-43b3-8eb1-91a96f678b36-retina-large.png",
            price: "$$560",
            originalPrice: "$8.00",
            discount: "30% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "15122726859",
            name: "OGX Renewing Argan Oil Of Morocco Weightless Healing Dry Oil 4.0oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/0e59d099-8a49-464a-ae79-53439b0251ae-retina-large.png",
            price: "$$748",
            originalPrice: "$10.69",
            discount: "30% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "14961543692",
            name: "Essence Hello, Good Stuff! Pore Minimizing Serum 1.01oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/87861443-8629-4f61-bf32-194cabfeb3f4-retina-large.png",
            price: "$$419",
            originalPrice: "$5.99",
            discount: "30% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "17777520462",
            name: "OGX Thick & Full Biotin & Collagen Weightless Oil Mist 4.0oz",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/23856e4b-909d-4840-8daa-2719e9550c30-retina-large.png",
            price: "$$748",
            originalPrice: "$10.69",
            discount: "30% off",
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 3,
        title: "Tools & Accessories",
        products: [
          {
            id: "13531636589",
            name: "Scünci Mixed Size Rubber Bands Black 300ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/43ddce51-a261-4962-8792-c98d1903a196-retina-large.png",
            price: "$3.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "14675725746",
            name: "Conair Professional The Basik Edition Scalp Massage Brush with Triple-Action Bristles",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/ad42912a-b285-4195-8458-e8c0bfb6402e-retina-large.png",
            price: "$5.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "25291302416",
            name: 'Diane Dahlia 5"" Hair Cutting and Trimming Shear',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/6c6f1a0f-49e2-48cf-92b2-b7956fc78a4a-retina-large.png",
            price: "$10.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "24154290256",
            name: "Kitsch Satin Pillowcase Ivory 1ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/30c5bba9-c847-4762-a0d5-bc44f1666f42-retina-large.png",
            price: "$19.00",
            originalPrice: null,
            discount: null,
            rating: "4.4",
            ratingCount: null,
          },
        ],
      },
    ],
  },
  {
    id: "dicks",
    name: "Dick's Sporting Goods",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/c6f05340-0e3b-4f33-aa22-b7edd1936216.png",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Retail"],
    items: [
      {
        id: 1,
        title: "Popular Deal",
        products: [
          {
            id: "10792210510",
            name: "Nike Adult 2023-24 City Edition Golden State Warriors Steph Curry #30 Jersey (XXL)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/7185b0dd-e7fa-4d5c-88a0-53d146257410-retina-large.png",
            price: "$99.99",
            originalPrice: "$120.00",
            discount: "16% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "23554130758",
            name: "New Era Adult Golden State Warriors Brown Golfer Hat (One Size)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/f2085d15-f4b8-4693-9544-ce2fdbbdeb66-retina-large.png",
            price: "$34.39",
            originalPrice: "$42.99",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "17530134339",
            name: "Quest Queen Airbed",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/d0cb3ecb-b53a-4292-a82c-3d91a5b87d60-retina-large.png",
            price: "$14.99",
            originalPrice: "$19.99",
            discount: "25% off",
            rating: "4.0",
            ratingCount: "20+",
          },
        ],
      },
      {
        id: 2,
        title: "Father’s Day Gifts",
        products: [
          {
            id: "25694848829",
            name: "Wiffle Ball Bat and Ball",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/a8d77c54-4085-4591-a901-aaafa4db6b0e-retina-large.png",
            price: "$8.99",
            originalPrice: null,
            discount: null,
            rating: "4.8",
            ratingCount: "100+",
          },
          {
            id: "24098892942",
            name: "Dick's Sporting Goods Logo Armchair Black",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/4c9eaefd-ea0f-460b-a4d6-13b7b356fdcf-retina-large.png",
            price: "$7.98",
            originalPrice: "$9.99",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
          {
            id: "13915238043",
            name: 'Goaliath 18" Mini Basketball Hoop',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/4bb7f022-2235-47d2-84c9-37ebfb3d7c48-retina-large.png",
            price: "$24.99",
            originalPrice: "$29.99",
            discount: "16% off",
            rating: "4.6",
            ratingCount: null,
          },
        ],
      },
      {
        id: 3,
        title: "Hydration 💦",
        products: [
          {
            id: 24827381471,
            name: "Gatorade 32 oz. Contour Squeeze Bottle Green",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/6f15fce1-ecf8-4d96-8cdc-c71219647263-retina-large.png",
            price: "$5.99",
            originalPrice: null,
            discount: null,
            rating: 4.8,
            ratingCount: "100+",
          },
          {
            id: 21981827176,
            name: "Owala 32 oz Surf's Edge Freesip Stainless Steel Water Bottle",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/c676ce24-fde1-4179-8385-a754985dda8f-retina-large.png",
            price: "$34.99",
            originalPrice: null,
            discount: null,
            rating: 4.9,
            ratingCount: "100+",
          },
        ],
      },
    ],
  },
  {
    id: "michaels",
    name: "Michaels",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/3e4206fc-0103-4a03-a711-9c966c7041c4.png",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "null min",
    discount: "30% off $20",
    isDashPass: true,
    isNearYou: true,
    tags: ["Retail"],
    items: [
      {
        id: 1,
        title: "Our Picks for You",
        products: [
          {
            id: "21855230673",
            name: 'Fab Finds Cowgirl Hat Straw Topper Assorted Multicolor 1.8" x 1.6"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=600,height=600,format=auto,quality=50/media/photosV2/36ef3a1b-1d16-4b47-b68b-60cd15a1862c-retina-large.jpg",
            price: "$4.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "21855230636",
            name: "Decorative Mini Duck Pond Figurine by Ashland®",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=600,height=600,format=auto,quality=50/media/photosV2/0438dc0e-6ed6-4566-8d2e-f3138a4a76bb-retina-large.jpg",
            price: "$3.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "15246156105",
            name: 'Recollections™ Pastel Colors Cardstock Paper, 8.5" x 11", 50 Sheets',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=600,height=600,format=auto,quality=50/media/photosV2/e2c1a172-dc85-417f-b256-62a1e422918e-retina-large.jpg",
            price: "$5.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "24408278017",
            name: "Acrylic Paint by Craft Smart®, 2oz.",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=600,height=600,format=auto,quality=50/media/photosV2/b1cba097-e0bb-40d4-aee1-e60f1e214e2d-retina-large.jpg",
            price: "$0.79",
            originalPrice: "$0.99",
            discount: "20% off",
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 2,
        title: "Father’s Day Gifts",
        products: [
          {
            id: "15246177928",
            name: 'Make Market Coasters Slate 4" x 4"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/d918a4df-7846-44a8-9e77-d715bea8fc8a-retina-large.jpg",
            price: "$6.49",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "18002655693",
            name: "Gildan Cotton Short Sleeve Adult T-Shirt White (Medium)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/7ff4499b-819c-4d85-b7ab-1e6d8519ba3b-retina-large.jpg",
            price: "$2.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "21855230154",
            name: "Cricut® Joy Xtra™ Smart Vinyl™ – Permanent Sampler, Rainbow – 5 ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photos/2bbecb25-84a9-4d9a-bd96-74a98f2a3a37-retina-large.jpg",
            price: "$8.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "21855230636",
            name: "Cricut Joy™ Xtra Smart Vinyl™ – Permanent Sampler, Beachside – 5 ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photos/d7810987-347b-4f0a-89a2-c0ae74b7d8d5-retina-large.jpg",
            price: "$8.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "15246156105",
            name: "Cricut® Smart Iron-On™ Vinyl for Joy Xtra™ – 3 ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photos/3a1e1d59-008f-4a64-b22a-d60fa93f0abf-retina-large.jpg",
            price: "$11.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "22963528343",
            name: "Cricut® Smart Vinyl™ – Removable Sampler, Brights – 5 ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photos/ccf1f733-2f2e-4530-b91c-4f9fc8306b2c-retina-large.jpg",
            price: "$8.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "21855230673",
            name: "Cricut Joy™ Xtra Smart Vinyl™ – Permanent Sampler, Bright Bow – 5 ct",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photos/75e8c835-f1f0-49a3-bce1-26e33c83c1bb-retina-large.jpg",
            price: "$8.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 3,
        title: "Red, White & Blue",
        products: [
          {
            id: "25276372005",
            name: 'Valley Forge Flag Stick Flag United States Multi-Color 4" x 6"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/daa28e4c-3602-4bc0-a29d-02aab392c0b6-retina-large.jpg",
            price: "$0.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "25323605384",
            name: 'Celebrate It Hydrangea Mix Bush Red, White & Blue 16"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/9cfea4ac-784d-445a-903d-918a3b97ab0c-retina-large.jpg",
            price: "$9.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "25276372022",
            name: 'Celebrate It Mold Cakesicle Swirl Pop Silicone Treat Red 4" x 9"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/f5c3a392-ee05-4016-905c-cdcbec702f36-retina-large.jpg",
            price: "$4.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "25276372025",
            name: 'Celebrate It Cookie Cutters Set Star Red, White & Blue 3" to 5"',
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/b6d28a1d-7b23-41e8-96b8-a5ae5012a801-retina-large.jpg",
            price: "$3.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "25276372015",
            name: "Celebrate It Toppers USA Flag Red, White & Blue (12 ct)",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=50/media/photosV2/deb8f900-83c3-40eb-9519-36ea79e30213-retina-large.jpg",
            price: "$2.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
        ],
      },
    ],
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d81e1e3f-3852-4e58-861d-a72e1cc96d1b.png",
    openTime: "Opens Tue at 10:00 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Retail"],
  },
  {
    id: "sally",
    name: "Sally Beauty",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/d3d258aa-9038-4e2d-96b7-ca02319318eb.jpg",
    openTime: "Opens Tue at 10:30 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Beauty", "Retail"],
  },
  {
    id: "lowes",
    name: "Lowe's",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/600d6586-8659-48a9-aa31-68ba6c1860d5.png",
    openTime: "",
    deliveryTime: "33 min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Retail"],
  },
  {
    id: "edible",
    name: "Edible",
    image:
      "https://img.cdn4dd.com/cdn-cgi/image/fit=cover,width=112,height=112,format=auto,quality=50/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/cfb23e1c-9274-47e1-8f7b-4da29736f43b.png",
    openTime: "Opens Tue at 9:50 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: true,
    tags: ["Retail"],
  },
  {
    id: "bloomcart",
    name: "Bloom Cart ®",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/e9ebbf99-cf77-4159-aeb2-e080c2933abc.jpg",
    openTime: "Opens Wed at 10:20 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
    items: [
      {
        id: 1,
        title: "Featured Items",
        products: [
          {
            id: "featured-001",
            name: "Whispery White Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/1fd13b02-e1a8-430c-aba7-31f8c8272b3f-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "featured-002",
            name: "Colorful Blooms Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/97450a1f-f7c0-41d1-9afa-93ec4ef64ecb-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "featured-003",
            name: "Colorful Blooms Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/cb4af0c4-5aed-4597-8147-94612903671e-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "featured-004",
            name: "Precious Peach Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/5172a05c-8914-4690-bea5-dd4a650594dd-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "featured-005",
            name: "Debi Lilly Illusion Vase Medium",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/d7f66d9b-8159-4775-809e-6117de0aec57-retina-large-jpeg",
            price: "$23.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "featured-006",
            name: "Debi Lilly Aroma Wood Wick Candle",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/e3639c99-8446-4e81-98ee-f682a4dd35a2-retina-large.jpg",
            price: "$14.99",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 2,
        title: "Most Ordered",
        products: [
          {
            id: "429868420",
            name: "Whispery White Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=70/media/photos/1fd13b02-e1a8-430c-aba7-31f8c8272b3f-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "429868409",
            name: "Colorful Blooms Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=70/media/photos/97450a1f-f7c0-41d1-9afa-93ec4ef64ecb-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "429868408",
            name: "Colorful Blooms Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=70/media/photos/cb4af0c4-5aed-4597-8147-94612903671e-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "429868413",
            name: "Precious Peach Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=80/media/photos/5172a05c-8914-4690-bea5-dd4a650594dd-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
        ],
      },
      {
        id: 3,
        title: "Flowers",
        products: [
          {
            id: 429868420,
            name: "Whispery White Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/1fd13b02-e1a8-430c-aba7-31f8c8272b3f-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: 429868408,
            name: "Colorful Blooms Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/cb4af0c4-5aed-4597-8147-94612903671e-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: 429868409,
            name: "Colorful Blooms Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/97450a1f-f7c0-41d1-9afa-93ec4ef64ecb-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: 429868410,
            name: "Pleasantly Pink Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/858577f9-265b-4c66-ab9f-80423a358881-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: 429868411,
            name: "Pleasantly Pink Medium Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/0ea7e43e-cd29-4c86-a6c5-5fe884ac0f7d-retina-large-jpeg",
            price: "$55.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: 429868418,
            name: "Pretty In Purple Large Bouquet",
            image:
              "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photos/ba6b6a1a-bfd1-4dd5-b852-85b79e56beb2-retina-large-jpeg",
            price: "$70.00",
            originalPrice: null,
            discount: null,
            rating: null,
            ratingCount: null,
          },
          {
            id: "flower-1",
            name: "Classic Red Roses",
            image: "https://cdn.example.com/images/red-roses.jpg",
            price: "$49.99",
            originalPrice: "$59.99",
            discount: "17% off",
            rating: "4.8",
            ratingCount: "120",
          },
          {
            id: "flower-2",
            name: "Sunflower Sunshine Bouquet",
            image: "https://cdn.example.com/images/sunflower-bouquet.jpg",
            price: "$34.99",
            originalPrice: "$44.99",
            discount: "22% off",
            rating: "4.7",
            ratingCount: "89",
          },
          {
            id: "flower-3",
            name: "Lily & Rose Combo",
            image: "https://cdn.example.com/images/lily-rose-combo.jpg",
            price: "$39.99",
            originalPrice: "$49.99",
            discount: "20% off",
            rating: "4.6",
            ratingCount: "95",
          },
        ],
      },
    ],
  },
  {
    id: "bouqs",
    name: "The Bouqs Co. Flower Shop",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/012f51fe-d41a-4186-97e6-6c8c33b97f76.jpg",
    openTime: "Opens Tue at 8:00 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "designerblooms",
    name: "Designer Blooms",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/dacbbc16-db2a-45c9-80c8-9079e9dbf4c8.jpg",
    openTime: "Opens Tue at 8:30 AM",
    deliveryTime: "null min",
    discount: "15% off, up to $9",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "target",
    name: "Target",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
    openTime: "Opens Tue 8:00 AM",
    deliveryTime: "Closed",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Convenience"],
  },
  {
    id: "rosethorne",
    name: "Flowers by Rose and Thorn",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/fdf29fd1-c1b3-4d36-8ec3-fa39de982da6.png",
    openTime: "Opens Tue at 10:20 AM",
    deliveryTime: "null min",
    discount: "$5 off on $35+",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "coley",
    name: "Flowers By Coley",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/43493379-7ccc-4a65-9d59-5c8640ac6d61.jpg",
    openTime: "Opens Tue at 9:20 AM",
    deliveryTime: "null min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "walgreens",
    name: "Walgreens",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/Screen_Shot_2020-12-08_at_9.16.57_AM.png",
    openTime: "Opens Thu at 7:00 AM",
    deliveryTime: "18 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["SNAP", "Retail", "Convenience", "Beauty"],
  },
  {
    id: "silvanas",
    name: "Silvanas Party Supply",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/dbfccc91-e6b6-4a82-b4a9-1ba8aae737b0.jpg",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "53 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Over 4.5"],
  },
  {
    id: "cvs",
    name: "CVS",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/cvs_logo.png",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "20 min",
    discount: "$5 off $25+",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Convenience", "SNAP", "Under 30 min"],
  },
  {
    id: "safeway-flower",
    name: "Safeway Flower Shop",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/c5fdd4df-f8e3-44ee-937d-90d5cfd92df4.jpeg",
    openTime: "Opens Wed at 10:20 AM",
    deliveryTime: "15 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"],
  },
  {
    id: "blooming-moment",
    name: "Blooming Moment Florist",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a9881f99-daed-4bb0-87a8-686d7347d468.jpg",
    openTime: "Opens Tue at 10:20 AM",
    deliveryTime: "35 min",
    discount: "15% off, up to $5",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Over 4.5"],
  },
  {
    id: "revel-plants",
    name: "Revel- Plants, Flowers & Goods",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/abbf2522-b978-43b9-84f1-5bb18280fbe1.jpg",
    openTime: "Opens Wed at 12:05 PM",
    deliveryTime: "25 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min"],
  },
  {
    id: "footlocker",
    name: "Foot Locker",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/fa9957cd-2c67-4c5a-be78-0be432833c99.png",
    openTime: "Opens Tue at 10:10 AM",
    deliveryTime: "40 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Over 4.5"],
  },
  {
    id: "monicas-florist",
    name: "Monica's Florist",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/e47115ff-8eb4-4475-b393-0246c87b0dfd.png",
    openTime: "Opens Tue at 9:20 AM",
    deliveryTime: "28 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"],
  },
  {
    id: "sol-ambiance",
    name: "Sol Ambiance",
    image: "",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "45 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "bloom-gallery",
    name: "Bloom Gallery Flowers",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/43de91a5-9e4e-42ff-b391-9ce0677187d9.png",
    openTime: "Opens Tue at 11:20 AM",
    deliveryTime: "20 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"],
  },
  {
    id: "office-depot",
    name: "Office Depot OfficeMax",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/61d55b76-4e2a-492c-bcc1-c1dc37a0180d.jpg",
    openTime: "Opens Tue at 8:30 AM",
    deliveryTime: "35 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail"],
  },
  {
    id: "san-bruno-flower",
    name: "San Bruno Flower Fashions",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a542575a-b7c7-4046-9482-bba4fdf5bc7e.03",
    openTime: "Opens Tue at 9:05 AM",
    deliveryTime: "25 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min"],
  },
  {
    id: "little-garden",
    name: "Little Garden SF LLC",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/bb4c92d8-14a1-4efa-bf67-320612045e6c.png",
    openTime: "Opens Tue at 8:00 AM",
    deliveryTime: "15 min",
    discount: "$5 off on $30+",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"],
  },
  {
    id: "love-and-stem",
    name: "Love and Stem",
    image: "",
    openTime: "Opens Tue at 9:00 AM",
    deliveryTime: "40 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Over 4.5"],
  },
  {
    id: "victorias-secret",
    name: "Victoria's Secret",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/269bada2-76b6-47b2-a220-4cd8651c0ead.png",
    openTime: "Opens Tue at 11:00 AM",
    deliveryTime: "25 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Under 30 min"],
  },
  {
    id: "flower-gift-boutique",
    name: "The Flower & Gift Boutique",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/d84a759f-245a-4ad0-8ad8-0b8bf5ef7c57.jpg",
    openTime: "Opens Tue at 8:00 AM",
    deliveryTime: "35 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Over 4.5"],
  },
  {
    id: "ace-hardware",
    name: "Ace Hardware",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/7a2ccc67-5ac3-49fa-8d46-72e9d986a70e.png",
    openTime: "Opens Tue at 9:30 AM",
    deliveryTime: "20 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Retail", "Under 30 min", "Over 4.5"],
  },
  {
    id: "you-see-flowers",
    name: "You See Flowers",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/278f6100-2b40-46d4-9f74-6a0cbb9d309d.jpg",
    openTime: "Opens Tue at 9:50 AM",
    deliveryTime: "45 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail"],
  },
  {
    id: "colma-floral",
    name: "Colma Floral Shop",
    image:
      "https://img.cdn4dd.com/p/fit=contain,width=200,height=200,format=auto,quality=95/media/restaurant/cover_square/a85226c0-63ed-4d17-9658-d28bf8c0ea74.jpg",
    openTime: "Opens Tue at 8:20 AM",
    deliveryTime: "25 min",
    isDashPass: true,
    isNearYou: false,
    tags: ["Flowers", "Retail", "Under 30 min", "Over 4.5"],
  },
];

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

export const getStoreById = (id: string): Store | undefined => {
  return stores.find((store) => store.id === id);
};
