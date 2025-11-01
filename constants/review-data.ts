import { UserReview } from '@/types/review-types';
import { getRestaurantById } from './restaurants';

// Helper function to get vendor logo
const getVendorLogo = (vendorId: string): string | undefined => {
  const restaurant = getRestaurantById(vendorId);
  return restaurant?.logo;
};

// Initial review data
export const initialReviewData: UserReview[] = [
  {
    id: 'review-philz-2',
    vendorId: 'philz-coffee',
    vendorName: 'Philz Coffee',
    vendorLogo: getVendorLogo('philz-coffee'),
    userId: 'user-2',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Perfect coffee! The barista was very friendly and the drink was made exactly as ordered. Love the vibe here.',
    timestamp: '2024-01-14T15:45:00Z',
    photos: ['/food.png'],
    ratedHelpfulBy: ['user-1'],
    orderId: 'order-philz-2',
    likedItems: [
      {
        id: 'mint-mojito-iced-coffee',
        name: 'Mint Mojito Iced Coffee',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/9c048348-5c38-49ec-828e-b1aa4b6217ae-retina-large.jpeg'
      },
      {
        id: 'honey-haze',
        name: 'Honey Haze',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/67d3e3c1-386e-4c66-b380-e8e5d18394db-retina-large.jpeg'
      },
      {
        id: 'iced-nutty-caramel-nirvana',
        name: 'Iced Nutty Caramel Nirvana',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/26d96f96-554d-4703-b453-eadb749d6ffe-retina-large.jpeg'
      },
      {
        id: 'philtered-soul-cold-brew',
        name: 'Philtered Soul Cold Brew',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/b9d03bd5-adb4-4edb-9169-92522070267d-retina-large.jpeg'
      }
    ],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sarah-2',
    vendorId: 'il-canto-cafe',
    vendorName: 'IL Canto Cafe',
    vendorLogo: getVendorLogo('il-canto-cafe'),
    userId: 'user-2',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Amazing coffee and pastries! The staff is incredibly friendly and the atmosphere is perfect for a morning start.',
    timestamp: '2024-01-13T10:20:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sarah-3',
    vendorId: 'peet\'s-coffee',
    vendorName: 'Peet\'s Coffee',
    vendorLogo: getVendorLogo('peet\'s-coffee'),
    userId: 'user-2',
    userName: 'Sarah Wilson',
    userEmail: 'sarah.wilson@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Great selection of coffee blends! Quick service and consistent quality. The baristas really know their craft.',
    timestamp: '2024-01-12T08:15:00Z',
    photos: ['/food.png'],
    ratedHelpfulBy: ['user-3'],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-philz-3',
    vendorId: 'philz-coffee',
    vendorName: 'Philz Coffee',
    vendorLogo: getVendorLogo('philz-coffee'),
    userId: 'user-3',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Good coffee but a bit expensive. Service was quick though and the atmosphere is nice.',
    timestamp: '2024-01-13T12:20:00Z',
    photos: ['https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/f890ea82-463c-4387-9415-149baa6813da-retina-large.jpeg'],
    ratedHelpfulBy: [],
    orderId: 'order-philz-3',
    likedItems: [
      {
        id: 'tesora',
        name: 'Tesora',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/f890ea82-463c-4387-9415-149baa6813da-retina-large.jpeg'
      },
      {
        id: 'philtered-soul',
        name: 'Philtered Soul',
        restaurantId: 'philz-coffee',
        image: 'https://img.cdn4dd.com/p/fit=cover,width=1200,height=1200,format=auto,quality=60/media/photosV2/f890ea82-463c-4387-9415-149baa6813da-retina-large.jpeg'
      }
    ],
    approvalStatus: 'approved'
  },
  {
    id: 'review-philz-4',
    vendorId: 'philz-coffee',
    vendorName: 'Philz Coffee',
    vendorLogo: getVendorLogo('philz-coffee'),
    userId: 'user-4',
    userName: 'Lisa Anderson',
    userEmail: 'lisa.anderson@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Amazing atmosphere and great staff! I visit this location regularly and always have a wonderful experience.',
    timestamp: '2024-01-12T14:20:00Z',
    photos: ['/food.png', '/food.png', '/food.png', '/food.png', '/food.png', '/food.png'],
    ratedHelpfulBy: ['user-1', 'user-5'],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-mcd-1',
    vendorId: 'mcdonalds',
    vendorName: 'McDonald\'s',
    vendorLogo: getVendorLogo('mcdonalds'),
    userId: 'user-5',
    userName: 'David Brown',
    userEmail: 'david.brown@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Great food and fast delivery! The burger was fresh and tasty. Always consistent quality.',
    timestamp: '2024-01-11T10:30:00Z',
    photos: ['/food.png'],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-mcd-2',
    vendorId: 'mcdonalds',
    vendorName: 'McDonald\'s',
    vendorLogo: getVendorLogo('mcdonalds'),
    userId: 'user-6',
    userName: 'Emma Davis',
    userEmail: 'emma.davis@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Excellent service! Food arrived hot and on time. Highly recommended.',
    timestamp: '2024-01-10T15:45:00Z',
    photos: ['/food.png'],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-mcd-3',
    vendorId: 'mcdonalds',
    vendorName: 'McDonald\'s',
    vendorLogo: getVendorLogo('mcdonalds'),
    userId: 'user-7',
    userName: 'Tom Wilson',
    userEmail: 'tom.wilson@example.com',
    userAvatar: null,
    rating: 3,
    content: 'Food was okay but delivery was a bit slow. Could be better.',
    timestamp: '2024-01-09T12:20:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sb-1',
    vendorId: 'starbucks',
    vendorName: 'Starbucks',
    vendorLogo: getVendorLogo('starbucks'),
    userId: 'user-8',
    userName: 'Rachel Green',
    userEmail: 'rachel.green@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Perfect coffee! The barista was very friendly and the drink was made exactly as ordered. Love the seasonal drinks.',
    timestamp: '2024-01-08T08:15:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sb-2',
    vendorId: 'starbucks',
    vendorName: 'Starbucks',
    vendorLogo: getVendorLogo('starbucks'),
    userId: 'user-9',
    userName: 'Alex Chen',
    userEmail: 'alex.chen@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Good coffee but a bit expensive. Service was quick though and the atmosphere is nice for working.',
    timestamp: '2024-01-07T16:30:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sephora-1',
    vendorId: 'sephora',
    vendorName: 'Sephora',
    vendorLogo: getVendorLogo('sephora'),
    userId: 'user-10',
    userName: 'Jessica Martinez',
    userEmail: 'jessica.martinez@example.com',
    userAvatar: null,
    rating: 5,
    content: 'Amazing selection and great customer service! The staff helped me find the perfect foundation shade.',
    timestamp: '2024-01-06T14:20:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
  {
    id: 'review-sephora-2',
    vendorId: 'sephora',
    vendorName: 'Sephora',
    vendorLogo: getVendorLogo('sephora'),
    userId: 'user-11',
    userName: 'Maria Rodriguez',
    userEmail: 'maria.rodriguez@example.com',
    userAvatar: null,
    rating: 4,
    content: 'Great products and fast delivery! The packaging was excellent and everything arrived in perfect condition.',
    timestamp: '2024-01-05T11:30:00Z',
    photos: [],
    ratedHelpfulBy: [],
    likedItems: [],
    approvalStatus: 'approved'
  },
];
