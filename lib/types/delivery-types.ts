// Delivery Partner Types for the Delivery Portal

export interface DeliveryCountry {
  id: number;
  code: string;
  name: string;
  dial_code: string;
}

export interface DeliveryPartner {
  id: string;
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  country: {
    dialCode: string;
    code: string;
    name: string;
  };
  avatar: string | null;
  
  // Stats
  lifetimeDeliveries: number;
  averageRating: number;
  acceptanceRate: number;
  completionRate: number;
  onTimeRate: number;
  
  createdAt: string;
}

export interface DeliveryOrder {
  id: number;
  partnerId: number;
  storeName: string;
  storeLogo: string | null;
  storeAddress: string;
  customerName: string;
  customerAddress: string;
  itemsCount: number;
  distanceMiles: number;
  basePay: number;
  tipAmount: number;
  totalEarnings: number;
  status: 'completed' | 'cancelled';
  orderDate: string;
  completedAt: string | null;
}

export interface DeliveryRating {
  id: number;
  partnerId: number;
  orderId: number;
  rating: number;
  feedback: string | null;
  customerName: string;
  createdAt: string;
}

export interface DeliveryEarnings {
  id: number;
  partnerId: number;
  weekStart: string;
  weekEnd: string;
  totalDeliveries: number;
  basePay: number;
  tips: number;
  bonuses: number;
  totalEarnings: number;
  hoursWorked: number;
}

export interface DeliveryPayoutMethod {
  id: string;
  partnerId: number;
  methodType: 'bank_account' | 'debit_card';
  bankName: string | null;
  lastFour: string;
  isDefault: boolean;
  createdAt: string;
}

// API Response types
export interface DeliveryPartnerLoginResponse {
  success: boolean;
  data?: DeliveryPartner;
  error?: string;
}

export interface DeliveryPartnerSignupRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  countryId: number;
}

