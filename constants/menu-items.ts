export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  calories?: string;
  rating?: number;
  ratingCount?: number;
  popular?: boolean;
  featured?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    id: "mint-mojito-iced-coffee",
    restaurantId: "philz-coffee",
    name: "Mint Mojito Iced Coffee",
    description: "",
    price: "$7.40",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/9c048348-5c38-49ec-828e-b1aa4b6217ae-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "philtered-soul-cold-brew",
    restaurantId: "philz-coffee",
    name: "Philtered Soul Cold Brew",
    description: "",
    price: "$7.40",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/b9d03bd5-adb4-4edb-9169-92522070267d-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "honey-haze",
    restaurantId: "philz-coffee",
    name: "Honey Haze",
    description: "",
    price: "$7.40",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/67d3e3c1-386e-4c66-b380-e8e5d18394db-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "philtered-soul",
    restaurantId: "philz-coffee",
    name: "Philtered Soul",
    description: "",
    price: "$6.15",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/f890ea82-463c-4387-9415-149baa6813da-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "turkey-sausage-sandwich",
    restaurantId: "philz-coffee",
    name: "Turkey Sausage Sandwich",
    description: "",
    price: "$8.70",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/cf409fbe-7a98-4422-aeac-9b3f5a7fc94c-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "green-chile-burrito",
    restaurantId: "philz-coffee",
    name: "Green Chile Burrito",
    description: "",
    price: "$8.70",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80,width=1200,height=1200,format=auto,quality=70/media/photosV2/6ed8be15-598a-48a0-b717-f5141bcaa052-retina-large.jpeg",
    category: "Featured Items",
  },
  {
    id: "mint-mojito-iced-coffee",
    restaurantId: "philz-coffee",
    name: "Mint Mojito Iced Coffee",
    description: "Our Ecstatic iced coffee, sweet and creamy with fresh mint.",
    price: "$7.40+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80/media/photosV2/9c048348-5c38-49ec-828e-b1aa4b6217ae-retina-large.jpeg",
    category: "Most Ordered",
  },
  {
    id: "philtered-soul-cold-brew",
    restaurantId: "philz-coffee",
    name: "Philtered Soul Cold Brew",
    description:
      "Rich and smooth cold brew with flavor notes of hazelnut and chocolate.",
    price: "$7.40+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80/media/photosV2/b9d03bd5-adb4-4edb-9169-92522070267d-retina-large.jpeg",
    category: "Most Ordered",
  },
  {
    id: "honey-haze",
    restaurantId: "philz-coffee",
    name: "Honey Haze",
    description:
      "A sweet hazelnut treat made with Philtered Soul Cold Brew, honey and oat milk.",
    price: "$7.40+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80/media/photosV2/67d3e3c1-386e-4c66-b380-e8e5d18394db-retina-large.jpeg",
    category: "Most Ordered",
  },
  {
    id: "turkey-sausage-sandwich",
    restaurantId: "philz-coffee",
    name: "Turkey Sausage Sandwich",
    description:
      "A toasted English muffin, scrambled egg patty, turkey sausage, and jalapeño pepper jack cheese. Contains: Milk, Egg, Soy, Wheat",
    price: "$8.70",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80/media/photosV2/cf409fbe-7a98-4422-aeac-9b3f5a7fc94c-retina-large.jpeg",
    category: "Most Ordered",
  },
  {
    id: "luca's-unplugged-decaf",
    restaurantId: "philz-coffee",
    name: "Luca's Unplugged Decaf",
    description: "Semi-sweet Chocolate and Dried Plum.",
    price: "$6.15+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=80/media/photosV2/f890ea82-463c-4387-9415-149baa6813da-retina-large.jpeg",
    category: "Most Ordered",
  },
  {
    id: "pork-sausage-&-egg-burrito",
    restaurantId: "philz-coffee",
    name: "Pork Sausage & Egg Burrito",
    description: "",
    price: "$8.70",
    image: "",
    category: "Most Ordered",
  },
  {
    id: "featured-medium-roast-to-go",
    restaurantId: "peet-s-coffee",
    name: "Featured Medium Roast To-Go",
    description:
      "A convenient carrier filled with 96 fl oz of our Peet’s freshly brewed medium roast drip coffee (equal to eight 12 oz cups)- ideal for family meals, meetings, or any occasion that calls for coffee.",
    price: "$35.60",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "featured-dark-roast-to-go",
    restaurantId: "peet-s-coffee",
    name: "Featured Dark Roast To-Go",
    description:
      "A convenient carrier filled with 96 fl oz of Peet’s freshly brewed dark roast drip coffee (equal to eight 12 oz cups)- ideal for family meals, meetings, or any occasion that calls for coffee.",
    price: "$35.60",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "caffe-latte",
    restaurantId: "peet-s-coffee",
    name: "Caffe Latte",
    description: "",
    price: "$6.10",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/9a6e4ac9-3f3a-4a0a-8ed8-487c3db76947-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "decaf-coffee-to-go",
    restaurantId: "peet-s-coffee",
    name: "Decaf Coffee To-Go",
    description:
      "A convenient carrier filled with 96 fl oz of our Peet’s fresh brewed drip coffee (equal to eight 12 oz cups)- ideal for family meals, meetings, or any occasion that calls for coffee.",
    price: "$35.60",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "cappuccino",
    restaurantId: "peet-s-coffee",
    name: "Cappuccino",
    description:
      "The essence of handcrafting. Our rich espresso is artfully marbled with freshly micro-foamed milk.",
    price: "$6.20",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/26ec912c-156c-4994-b3fc-3fc547cf3431-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "light-roast-to-go",
    restaurantId: "peet-s-coffee",
    name: "Light Roast To-Go",
    description:
      "A convenient carrier filled with 96 fl oz of our Peet’s fresh brewed drip coffee (equal to eight 12 oz cups)- ideal for family meals, meetings, or any occasion that calls for coffee.",
    price: "$35.60",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "caffe-latte",
    restaurantId: "peet-s-coffee",
    name: "Caffe Latte",
    description:
      "This coffee house favorite adds silky steamed milk to shots of rich espresso, finished with a layer of foam.",
    price: "$6.10+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/9a6e4ac9-3f3a-4a0a-8ed8-487c3db76947-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "cappuccino",
    restaurantId: "peet-s-coffee",
    name: "Cappuccino",
    description:
      "The essence of handcrafting. Our rich espresso is artfully marbled with freshly micro-foamed milk.",
    price: "$6.20+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/26ec912c-156c-4994-b3fc-3fc547cf3431-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "bacon-cheddar-brioche",
    restaurantId: "peet-s-coffee",
    name: "Bacon Cheddar Brioche",
    description:
      "Smoky bacon, aged cheddar and homestyle egg on a buttery brioche bun.",
    price: "$6.85",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/8db68b87-50c0-412f-a189-aa73fbe62d91-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "baridi-cold-brew",
    restaurantId: "peet-s-coffee",
    name: "Baridi Cold Brew",
    description:
      "Freshly ground Baridi Blend steeped with cold water for 12 hours to produce a sweet, smooth, and refreshing iced coffee without acidity or bitterness.",
    price: "$5.70+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/46c58441-49ab-4994-b21b-c4ba147bee07-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "oatmeal",
    restaurantId: "peet-s-coffee",
    name: "Oatmeal",
    description:
      "Healthy whole-grain, steel-cut oats with flax make for a nutritious morning",
    price: "$4.70",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c88afa88-6f47-469d-9363-0a53fd26ddf1-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "featured-medium-roast-to-go",
    restaurantId: "peet-s-coffee",
    name: "Featured Medium Roast To-Go",
    description:
      "A convenient carrier filled with 96 fl oz of our Peet\u2019s freshly brewed medium roast drip coffee (equal to eight 12 oz cups)- ideal for family meals, meetings, or any occasion that calls for coffee.",
    price: "$35.60",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "featured-dark-roast",
    restaurantId: "peet-s-coffee",
    name: "Featured Dark Roast",
    description:
      "A rotation of Peet's signature dark roast coffees, brewed every 30 minutes so you can get the most flavorful, freshest cup.",
    price: "$4.30+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/c4809cd9-a820-43cf-b101-1b861f1bd163-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "egg-and-cheese",
    restaurantId: "peet-s-coffee",
    name: "Egg & Cheese",
    description:
      "Homestyle fried egg, Cheddar and Colby-Jack cheese on Vienna toast",
    price: "$5.45",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/92fcbbc1-53a6-4e9c-b5b9-45a3fdc6b72a-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "iced-vanilla-latte",
    restaurantId: "peet-s-coffee",
    name: "Iced Vanilla Latte",
    description:
      "Madagascar Vanilla takes a refreshing turn with cold milk and freshly pulled espresso, poured fresh foam.",
    price: "$6.80+",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1000,height=600,format=auto,quality=50/media/photosV2/0bbb6042-0475-4fa4-9640-8c1e6f30934a-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "latte-macchiato",
    restaurantId: "peet-s-coffee",
    name: "Latte Macchiato",
    description:
      "Sweet, concentrated ristretto shots of Espresso Forte are poured through creamy foam into freshly steamed milk.",
    price: "$5.85",
    image: "",
    category: "Most Ordered",
  },
  {
    id: "white-chocolate-mocha",
    restaurantId: "peet-s-coffee",
    name: "White Chocolate Mocha",
    description:
      "The traditional mocha\u2019s blonde cousin. The sweet indulgence of white chocolate blends smoothly with espresso.",
    price: "$7.25",
    image: "",
    category: "Most Ordered",
  },
  {
    id: "caffe-mocha",
    restaurantId: "peet-s-coffee",
    name: "Caffe Mocha",
    description:
      "Our Mocha now features a deeply rich and creamy house-made chocolate sauce. The result is an elevated cocoa experience that pairs perfectly with Peet\u2019s Espresso Forte and steamed milk.",
    price: "$6.70",
    image:
      "./peet-s-coffee_files/1df5ac86-cdc7-4289-a92f-616378d2eaa4-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "the-black-tie",
    restaurantId: "peet-s-coffee",
    name: "The Black Tie",
    description:
      "Layered sweetened condensed milk, Cold Brew iced coffee, chicory infused simple syrup, and a float of half and half.",
    price: "$6.65",
    image:
      "./peet-s-coffee_files/86f04456-07dc-45d9-8a4a-40f9f81c9b3c-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "coconut-black-tie",
    restaurantId: "peet-s-coffee",
    name: "Coconut Black Tie",
    description:
      "A tropical take on The Black Tie. Layered sweetened condensed milk, Cold Brew iced coffee, coconut syrup, and a float of half and half.",
    price: "$6.65",
    image:
      "./peet-s-coffee_files/86f04456-07dc-45d9-8a4a-40f9f81c9b3c-retina-large.jpg",
    category: "Most Ordered",
  },
  {
    id: "bacon-egg-cheese-croissant",
    restaurantId: "gateway-croissant",
    name: "Bacon, Egg and Cheese Croissant",
    description: "",
    price: "$7.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/e5b254b3-bfdb-4a78-b03b-c7fb6ec2da25-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "ham-egg-cheese-croissant",
    restaurantId: "gateway-croissant",
    name: "Ham, Egg and Cheese Croissant",
    description: "",
    price: "$7.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/e41bac25-b80a-42e1-b5c5-75efd2ca4b1d-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "dozen-donut-hole",
    restaurantId: "gateway-croissant",
    name: "A Dozen Donut Hole",
    description: "",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/41553f23-b4e5-4fd0-b6e5-c5d89cd0a25f-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "filled-croissant",
    restaurantId: "gateway-croissant",
    name: "Filled Croissant",
    description: "",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/yelp/02c04c7d-f1ff-48e1-8b4a-ae663744a8a8.jpg",
    category: "Featured Items",
  },
  {
    id: "fruit-salad",
    restaurantId: "gateway-croissant",
    name: "Fruit Salad",
    description: "",
    price: "$6.00",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/a18c124a-5cfa-46a7-a296-4ad10ef2fc0b-retina-large.jpg",
    category: "Featured Items",
  },
  {
    id: "plain-croissant",
    restaurantId: "gateway-croissant",
    name: "Plain Croissant",
    description: "",
    price: "$3.50",
    image: "",
    category: "Featured Items",
  },
  {
    id: "glazed-donut",
    restaurantId: "gateway-croissant",
    name: "Glazed Donut",
    description:
      "Glazed donut available in glaze, chocolate, maple, sugar, or crumb flavors. Description generated by DoorDash using AI",
    price: "$1.85",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/e8cdef16-949c-429b-ac6a-79962a458777-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "cake-donut",
    restaurantId: "gateway-croissant",
    name: "Cake Donut",
    description:
      "Cake donut available in a variety of flavors: chocolate, maple, crumb, cinnamon, plain, blueberry. Description generated by DoorDash using AI",
    price: "$1.85",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/88f7c36d-c5c7-4fbb-bcd9-7b4da66712ad-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "bacon-egg-and-cheese-croissant",
    restaurantId: "gateway-croissant",
    name: "Bacon, Egg and Cheese Croissant",
    description:
      "Flaky croissant filled with crispy bacon, scrambled eggs, and melted cheese. Description generated by DoorDash using AI",
    price: "$7.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/e5b254b3-bfdb-4a78-b03b-c7fb6ec2da25-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "ham-egg-and-cheese-croissant",
    restaurantId: "gateway-croissant",
    name: "Ham, Egg and Cheese Croissant",
    description:
      "Flaky croissant filled with savory ham, a fluffy egg, and melted cheese. Description generated by DoorDash using AI",
    price: "$7.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/e41bac25-b80a-42e1-b5c5-75efd2ca4b1d-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "ham-and-cheese-croissant",
    restaurantId: "gateway-croissant",
    name: "Ham and Cheese Croissant",
    description:
      "Flaky croissant filled with savory ham and melted cheese. Description generated by DoorDash using AI",
    price: "$4.75",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/921d3f99-c974-4bd3-aeba-05987b625814-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "scone",
    restaurantId: "gateway-croissant",
    name: "Scone",
    description: "Blueberry only. Description generated by DoorDash using AI",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/5ea389e6-6ae2-43b8-8c91-19956bc037b3-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "muffin",
    restaurantId: "gateway-croissant",
    name: "Muffin",
    description:
      "Choose from blueberry or cranberry flavors. Description generated by DoorDash using AI",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/c47006ee-9a22-4262-8613-2d4b18302f0c-retina-large.jpg ",
    category: "Most Ordered",
  },
  {
    id: "filled-croissant",
    restaurantId: "gateway-croissant",
    name: "Filled Croissant",
    description:
      "Croissant filled with choice of almond, bear claw, apple, strawberry cream cheese, plain cream cheese, cinnamon twist, raisin, apple turnover, or butterfly chocolate. Description generated by DoorDash using AI",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/yelp/02c04c7d-f1ff-48e1-8b4a-ae663744a8a8.jpg ",
    category: "Most Ordered",
  },
  {
    id: "fruit-salad",
    restaurantId: "gateway-croissant",
    name: "Fruit Salad",
    description:
      "Choice of mix fruit or watermelon only. Description generated by DoorDash using AI",
    price: "$6.00",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/a18c124a-5cfa-46a7-a296-4ad10ef2fc0b-retina-large.jpg ",
    category: "Yogurt and Salads",
  },
  {
    id: "a-dozen-donut-hole",
    restaurantId: "gateway-croissant",
    name: "A Dozen Donut Hole",
    description: "Glazed donuts. Description generated by DoorDash using AI",
    price: "$3.50",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/41553f23-b4e5-4fd0-b6e5-c5d89cd0a25f-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "apple-fritter",
    restaurantId: "gateway-croissant",
    name: "Apple Fritter",
    description:
      "Crispy, golden-brown fried dough with chunks of apple and a sweet glaze. Description generated by DoorDash using AI",
    price: "$3.25",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/0f03e749-2d3f-4c21-a741-7b2d2a817130-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "twist-donut",
    restaurantId: "gateway-croissant",
    name: "Twist Donut",
    description: "No filling. Description generated by DoorDash using AI",
    price: "$3.00",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/5606794e-28d9-4562-93cf-1ddff0b85897-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "old-fashioned-donut",
    restaurantId: "gateway-croissant",
    name: "Old Fashioned Donut",
    description:
      "Old fashioned donut with choice of glaze, chocolate, maple, or plain topping. Description generated by DoorDash using AI",
    price: "$1.85",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/527efbff-ba8b-40b5-8d3f-5e715b57c644-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "cinnamon-roll",
    restaurantId: "gateway-croissant",
    name: "Cinnamon Roll",
    description:
      "Soft, spiraled dough generously coated with sweet cinnamon and a light glaze. Description generated by DoorDash using AI",
    price: "$3.25",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/0f03e749-2d3f-4c21-a741-7b2d2a817130-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "buttermilk-donut",
    restaurantId: "gateway-croissant",
    name: "Buttermilk Donut",
    description:
      "Buttermilk donut, choices of glaze, chocolate, maple, or plain. Description generated by DoorDash using AI",
    price: "$2.25",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/4ca047e1-a75b-4267-ae57-ead2801c9e84-retina-large.jpg ",
    category: "Donut",
  },
  {
    id: "original-acai-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Original Acai Bowl",
    description: "",
    price: "$13.65",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/f8162159-ed03-462c-87c7-e1fb4474e5e7-retina-large.png",
    category: "Featured Items",
  },
  {
    id: "tropical-protein-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Tropical Protein Bowl",
    description: "",
    price: "$15.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/af498ae3-dbd4-4d5f-8b09-aec37b337ec1-retina-large.png",
    category: "Featured Items",
  },
  {
    id: "acai-power-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Acai Power Bowl",
    description: "",
    price: "$13.65",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/4aba7ece-bde1-4590-be9c-2c31361f1b10-retina-large.png",
    category: "Featured Items",
  },
  {
    id: "1-day-reset-cleanse-cooler-bag",
    restaurantId: "pressed-acai-bowls",
    name: "1-Day Reset Cleanse + Free Cooler Bag",
    description: "",
    price: "$82.26",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/4abc6dc3-c80a-4937-88e9-bda644750898-retina-large.png",
    category: "Featured Items",
  },
  {
    id: "tropical-beauty-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Tropical Beauty Bowl",
    description: "",
    price: "$15.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=70/media/photosV2/06522372-7a67-4f05-b39f-5f4269d53df3-retina-large.png",
    category: "Featured Items",
  },
  {
    id: "cymbiotika-immunity-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Cymbiotika Immunity Bowl",
    description: "",
    price: "$19.37",
    image: "",
    category: "Featured Items",
  },
  {
    id: "original-acai-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Original Acai Bowl",
    description:
      "Power your day with the Original Acai Bowl\u2014a creamy blend of acai, oat milk, coconut milk, and banana, topped with fresh fruit and crunchy granola. With 10g of protein from pea protein isolate, it\u2019s the perfect mix of flavor and nourishment to fuel your day.",
    price: "$13.65",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/f8162159-ed03-462c-87c7-e1fb4474e5e7-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "acai-power-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Acai Power Bowl",
    description:
      "Power up with our Acai Power Bowl, a delicious smoothie bowl with 12g of protein + plant-powered goodness. Made with a creamy base of oat milk, acai, + coconut cream, topped with almond butter, banana, blueberries, and granola\u2014it's a balanced way to fuel your day.",
    price: "$13.65",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/4aba7ece-bde1-4590-be9c-2c31361f1b10-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "tropical-protein-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Tropical Protein Bowl",
    description:
      "Elevate your protein intake with the power of our Protein Bowl! With 25g of protein + whey protein puffs for extra crunch, this creamy blend of pineapple, coconut milk, + banana is ideal for a pre- or post-workout boost. Finished with fresh fruit and nuts, it\u2019s a deliciously balanced boost for pre- or post-workout fuel.",
    price: "$15.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/af498ae3-dbd4-4d5f-8b09-aec37b337ec1-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "immunity-shot",
    restaurantId: "pressed-acai-bowls",
    name: "Immunity Shot",
    description:
      "Elevate your daily immunity with our potent Immunity Shot! Packed with live probiotics, zinc, + nourishing ingredients, this powerful blend delivers 240% of your daily vitamin C for enhanced immune and overall wellness support.",
    price: "$4.28",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/6e263d1f-aca7-417d-850e-ffc1ac5ce291-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "chocolate-banana-protein-smoothie",
    restaurantId: "pressed-acai-bowls",
    name: "Chocolate Banana Protein Smoothie",
    description:
      "Fuel your body, treat your taste buds. Our Chocolate Banana Protein Smoothie blends 21g of plant-based protein with rich cocoa, banana, and a hint of cinnamon\u2014perfect for powering your workouts or satisfying your cravings, no matter the time of day.",
    price: "$7.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/f6a4cad0-ec31-46e9-a680-daa284b8ea31-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "tropical-beauty-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Tropical Beauty Bowl",
    description: "Elevate your self-care + nourish your skin from the inside out with our Beauty Bowl! With vitamin C, bee pollen, + an added boost of collagen, this blend deliciously enhances your overall wellness + supports radiant skin for a more vibrant, glowing you.",
    price: "$15.94",
    image:"https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/06522372-7a67-4f05-b39f-5f4269d53df3-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "acai-superfood-bowl",
    restaurantId: "pressed-acai-bowls",
    name: "Acai Superfood Bowl",
    description: "Boost your day with our Acai Superfood Bowl, packed with wholesome banana, coconut, blueberries, + goji berries. With a creamy base of oat milk, acai, + coconut cream, this plant-based wellness bowl is the perfect superfood pick-me-up.",
    price: "$13.65",
    image: "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/a941f1d8-29fc-4d23-adca-21d0d56ba691-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "daily-greens-3-ginger-juice",
    restaurantId: "pressed-acai-bowls",
    name: "Daily Greens 3: Ginger Juice",
    description: "Refresh with Daily Greens 3\u2014a vibrant blend of apple, cucumber, celery, lemon, spinach, ginger, kale, and parsley. This invigorating mix delivers a balanced blend of leafy greens and a zesty ginger kick to help support your daily wellness goals.",
    price: "$7.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/c248b94f-6cea-4cc4-a46f-9ac2edc02eda-retina-large.png",
    category: "Most Ordered",
  },
  {
    id: "simple-cleanse-juice",
    restaurantId: "pressed-acai-bowls",
    name: "Simple Cleanse Juice",
    description: "Elevate your day with our Simple Cleanse\u2014a zesty blend of lemon, ginger, and cayenne. This refreshing juice is crafted to support your system and promote a gentle gut cleanse for everyday balance.",
    price: "$7.94",
    image:
      "https://img.cdn4dd.com/p/fit=cover,width=1200,height=600,format=auto,quality=90/media/photosV2/d53a7f8d-89f6-49a1-a666-2d9895aa7a2c-retina-large.png",
    category: "Most Ordered",
  },
];

export const getMenuItemsByRestaurantId = (
  restaurantId: string
): MenuItem[] => {
  return menuItems.filter((item) => item.restaurantId === restaurantId);
};

export const getFeaturedMenuItemsByRestaurantId = (
  restaurantId: string
): MenuItem[] => {
  return menuItems.filter(
    (item) => item.restaurantId === restaurantId && item.featured
  );
};

export const getMenuItemsByCategory = (
  restaurantId: string,
  category: string
): MenuItem[] => {
  return menuItems.filter(
    (item) => item.restaurantId === restaurantId && item.category === category
  );
};

export const getMenuCategories = (restaurantId: string): string[] => {
  const categories = new Set<string>();
  menuItems
    .filter((item) => item.restaurantId === restaurantId)
    .forEach((item) => categories.add(item.category));
  return Array.from(categories);
};
