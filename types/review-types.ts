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
  ratedHelpfulBy: string[]; // Array of user IDs who rated this review as helpful
  orderId?: string; // Optional - may not be tied to a specific order
  likedItems: OrderItem[]; // Array of items that were liked by the reviewer
  approvalStatus: 'approved' | 'rejected' | 'pending';
}
