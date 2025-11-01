// Types for review data
export interface OrderItem {
  id: string;
  name: string;
  restaurantId: string;
  image: string | null;
}

export interface UserReview {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string; // Vendor logo
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  rating: number; // 1-5 stars
  content: string;
  timestamp: string; // ISO string
  photos: string[]; // Array of photo URLs
  helpfulCount: number; // Count of users who found this helpful
  orderId?: string; // Optional - may not be tied to a specific order
  orderDetails?: {
    orderId: string;
    orderDate: string;
    items: OrderItem[]; 
    totalAmount: number;
    liked?: boolean; // Whether user liked the order
  };
  approvalStatus: 'approved' | 'rejected' | 'pending';
}
