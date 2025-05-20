import retailResponse from './retail_response.json';

// Extract filter options from the response
export function getFilterOptions() {
  const filters = retailResponse.data.retailVerticalPageFeed.body[0].header
    .filter(item => item.component?.category === 'filter')
    .map(filter => {
      const filterData = {
        id: filter.id,
        title: filter.text?.title || '',
        type: filter.component.id,
        customData: filter.custom ? JSON.parse(filter.custom) : {}
      };

      return filterData;
    });
  
  return filters;
}

// Extract store data for AllStores component
export function getAllStores() {
  const storeItems = retailResponse.data.retailVerticalPageFeed.body[0].body
    .filter(item => item.component?.id === 'row.store-compact')
    .map(store => {
      const loggingData = store.logging ? JSON.parse(store.logging) : {};
      const badges = loggingData.badges || "";

      return {
        name: loggingData.store_name || '',
        time: loggingData.store_display_asap_time || '',
        delivery: loggingData.delivery_fee_str || '',
        open: !loggingData.next_open_time,
        openTime: loggingData.next_open_time || '',
        image: loggingData.display_image_url || '/placeholder.svg?height=80&width=80',
        inStorePrice: loggingData.store_tags?.includes('in-store-prices') || false,
        discount: loggingData.promo_tooltip || '',
        rating: loggingData.star_rating || '',
        numRatings: loggingData.num_star_rating || '',
        isSnap: badges.includes('SNAP') || badges.includes('snap')
      };
    });

  return storeItems;
}

// Extract data for GrocerySchedule component
export function getGroceryScheduleData() {
  // Find all promotional banners
  const promos = retailResponse.data.retailVerticalPageFeed.body[0].body
    .filter(item => item.component?.id === 'row.banner')
    .map((banner, index) => {
      const backgroundImg = banner.images?.background?.uri || '';
      const logoImg = banner.images?.custom?.find(img => img.key === 'logo')?.value?.uri || '';
      const buttonText = banner.text?.custom?.find(txt => txt.key === 'button')?.value || 'Shop now';
      const customData = banner.custom ? JSON.parse(banner.custom) : {};
      const extraStyles = customData.extra_styles || {};

      return {
        id: `promo-${index}`,
        title: banner.text?.description || '',
        description: banner.text?.title || '',
        buttonText: buttonText,
        backgroundColor: customData.styling?.background_color ? `#${customData.styling.background_color}` : '#f7f3e8',
        buttonColor: extraStyles.button?.background_color ?
          `bg-[#${extraStyles.button.background_color}] hover:bg-[#${extraStyles.button.background_color}]` :
          'bg-[#eb1800] hover:bg-[#cf1600]',
        textColor: extraStyles.title?.color ? `text-[#${extraStyles.title.color}]` : 'text-black',
        image: backgroundImg,
        logoImage: logoImg
      };
    });

  // Extract popular grocery stores for the circular logos
  const storeItems = getAllStores().slice(0, 6);

  return {
    promos: promos.length > 0 ? promos : undefined,
    stores: storeItems.map(store => ({
      name: store.name,
      logo: store.image
    }))
  };
}

// Extract data for GroceryEssentials component
export function getGroceryEssentialsData() {
  // Find the essentials banner (usually showcases grocery products)
  const essentialsBanner = retailResponse.data.retailVerticalPageFeed.body[0].body
    .find(item => item.id?.includes('safeway-brands-nm-hpb'));

  // Get the primary store information
  const primaryStore = getAllStores()[0] || {};

  // Find product carousel (this would be more specific in a real implementation)
  const productCarousel = retailResponse.data.retailVerticalPageFeed.body[0].body
    .find(item => item.component?.id?.includes('carousel') && item.component?.category === 'carousel');

  // Sample products (in a real implementation, you'd extract these from the response)
  const sampleProducts = Array(6).fill(null).map((_, index) => ({
    id: index,
    price: '$3.99',
    name: `Grocery Item ${index + 1}`,
    image: '/placeholder.svg?height=128&width=128'
  }));

  return {
    title: essentialsBanner?.text?.title || 'Grocery Essentials',
    storeName: primaryStore.name || 'Spudshed Fresh Food Market',
    deliveryTime: primaryStore.time || '43 min',
    showInStorePrice: primaryStore.inStorePrice || true,
    products: sampleProducts
  };
}

// Get data for the Grocery Favorites section
export function getGroceryFavorites() {
  // Extract top-rated or featured stores
  const favoriteStores = getAllStores()
    .filter(store => parseFloat(store.rating) >= 4.7)
    .slice(0, 3)
    .map((store, index) => ({
      id: `favorite-${index}`,
      name: store.name,
      rating: store.rating,
      numRatings: store.numRatings?.includes('k') ? store.numRatings :
                 (parseInt(store.numRatings) > 1000 ?
                  (Math.floor(parseInt(store.numRatings) / 100) / 10 + 'k+') :
                  store.numRatings + '+'),
      distance: (Math.random() * 2 + 0.1).toFixed(1) + ' mi', // Mock distance data
      time: store.time.replace('Express ', ''),
      image: store.image
    }));

  return favoriteStores;
}

// Get data for the Fastest Near You section
export function getFastestNearYou() {
  // Extract stores with quick delivery times
  const fastestStores = getAllStores()
    .sort((a, b) => {
      const timeA = parseInt(a.time.replace(/\D/g, '')) || 9999;
      const timeB = parseInt(b.time.replace(/\D/g, '')) || 9999;
      return timeA - timeB;
    })
    .slice(0, 3)
    .map((store, index) => ({
      id: `fast-${index}`,
      name: store.name,
      rating: store.rating,
      numRatings: parseInt(store.numRatings) > 500 ?
                 (Math.floor(parseInt(store.numRatings) / 100) / 10 + 'k+') :
                 store.numRatings + '+',
      distance: (Math.random() * 3 + 0.1).toFixed(1) + ' mi', // Mock distance data
      time: store.time.replace('Express ', ''),
      image: store.image,
      discount: store.discount
    }));

  return fastestStores;
}

// Get data for product carousels
export function getProductCarouselData(storeIndex = 0) {
  // We'll create two carousels with data from the retail response
  const store = getAllStores()[storeIndex] || getAllStores()[0];

  if (!store) {
    return null;
  }

  // For the first carousel (snacks & drinks)
  const snackProducts = [
    {
      id: "1",
      name: "Gatorade Thirst Quencher Cool Blue Sports Drink Bottle (20 fl oz)",
      price: "$3.29",
      image: "https://img.cdn4dd.com/p/2020/06/09/bf8eed5027c28a7f84a977e1af4e4b2a-retina-large.jpg",
      rating: "4.9",
      numRatings: "200+",
      inStock: true
    },
    {
      id: "2",
      name: "Gatorade Zero Thirst Quencher Berry Sports Drink Bottle (28 fl oz)",
      price: "$2.89",
      image: "https://img.cdn4dd.com/p/2020/12/10/d539a7ec1b23c0c9c4109058631d2fa7-retina-large.jpg",
      rating: "4.8",
      numRatings: "180+"
    },
    {
      id: "3",
      name: "Lay's Baked 65% Less Fat Original Potato Crisps (6.25 oz)",
      price: "$5.99",
      image: "https://img.cdn4dd.com/p/2016/04/28/bd23d3ab32c678d6f261a4df62d246f8-retina-large.jpg",
      rating: "4.7",
      numRatings: "150+"
    },
    {
      id: "4",
      name: "Gatorade Thirst Quencher Orange Sports Drink Bottle (20 fl oz)",
      price: "$3.29",
      image: "https://img.cdn4dd.com/p/2020/06/09/9f2abf79ce58cd93c53af98e35a3d3c0-retina-large.jpg",
      rating: "4.9",
      numRatings: "200+"
    },
    {
      id: "5",
      name: "Bodyarmor Fruit Punch Sports Drink Bottle (16 fl oz)",
      price: "$2.39",
      image: "https://img.cdn4dd.com/p/2018/06/28/ef9b63e7482bfedb4a45cc64b29a6aec-retina-large.jpeg",
      rating: "4.7",
      numRatings: "50+"
    },
    {
      id: "6",
      name: "Bodyarmor Lyte SuperDrink Peach Mango Sports Drink Bottle (16 fl oz)",
      price: "$2.39",
      image: "https://img.cdn4dd.com/p/2019/11/11/8f90551f72a24237ae0c5eba90c13a28-retina-large.jpg",
      rating: "4.6",
      numRatings: "50+"
    }
  ];

  // For the second carousel (market favorites)
  const marketProducts = [
    {
      id: "7",
      name: "Organic Brown Eggs (12 ct)",
      price: "$6.49",
      image: "https://img.cdn4dd.com/p/2020/02/10/9fccb5ce30859ca4411f83530509139e-retina-large.jpg",
      rating: "4.8",
      numRatings: "300+"
    },
    {
      id: "8",
      name: "Hass Avocado",
      price: "$2.29",
      image: "https://img.cdn4dd.com/p/2016/03/23/ae9344faa3ec4c489b458bdf96a68141-retina-large.jpg",
      rating: "4.7",
      numRatings: "500+"
    },
    {
      id: "9",
      name: "Strawberries (16 oz)",
      price: "$5.99",
      image: "https://img.cdn4dd.com/p/2016/04/28/3b81fad2a077b2159461a32dcb8f83ad-retina-large.jpg",
      rating: "4.6",
      numRatings: "400+"
    },
    {
      id: "10",
      name: "Organic Whole Milk (1/2 gallon)",
      price: "$4.99",
      image: "https://img.cdn4dd.com/p/2020/03/05/e511b858febbe1acd7140a048d6ad42e-retina-large.jpg",
      rating: "4.9",
      numRatings: "250+"
    },
    {
      id: "11",
      name: "Organic Cucumber",
      price: "$1.79",
      image: "https://img.cdn4dd.com/p/2016/04/25/eb6b061ace1cd94f56b4e286522d3bf3-retina-large.jpg",
      rating: "4.5",
      numRatings: "150+"
    },
    {
      id: "12",
      name: "Organic Broccoli",
      price: "$3.49",
      image: "https://img.cdn4dd.com/p/2016/04/25/aa9fff365b0de414d6b96df45374186f-retina-large.jpg",
      rating: "4.7",
      numRatings: "200+"
    }
  ];

  return {
    snacks: {
      title: "Snacks & Drinks from Target",
      storeName: "Target",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
      time: "26 min",
      products: snackProducts
    },
    market: {
      title: "Market Favorites",
      storeName: "DoorDash Market",
      storeImage: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
      time: "21 min",
      products: marketProducts,
      isSnapEligible: true
    }
  };
}
