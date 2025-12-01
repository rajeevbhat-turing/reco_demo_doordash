// Payment Method interface
export interface PaymentMethod {
  id: string;
  type: string;
  cardNumber: string;
  lastFour: string;
  cvc: string;
  expiry: string;
  zipCode: string;
  default?: boolean;
}

// Address interface
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  addressType: 'house' | 'apartment' | 'hotel' | 'office' | 'other';
  default?: boolean;

  // House fields
  gateCode?: string;

  // Apartment fields
  apartmentSuite?: string;
  entryCode?: string;

  // Hotel fields
  roomSuite?: string;
  hotelName?: string;

  // Office fields
  suiteFloor?: string;
  businessName?: string;

  // Shared fields
  buildingName?: string;

  // Delivery preferences
  deliveryPreference?: 'leave' | 'meet';
  deliveryLocation?: string;
  deliveryInstructions?: string;
  personalLabel?: string;
}

// User interface
export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  password: string;
  country: {
    dialCode: string;
    code: string;
    name: string;
  };
  userCountry: string;
  avatar: string | null;
  paymentMethods: PaymentMethod[];
  addresses: Address[];
  is_restricted: boolean;
  reviews: string[];
  paymentFrequency?: 'once-a-day' | 'after-each-order';
}
