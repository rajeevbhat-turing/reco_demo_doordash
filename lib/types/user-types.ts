// Payment Method interface
export interface PaymentMethod {
  id: string;
  type: string;
  cardNumber: string;
  lastFour: string;
  cvc: string;
  expiry: string;
  zipCode: string;
}

// Address interface
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  addressType: "none" | "house" | "apartment" | "hotel" | "office" | "other";
  apartmentSuite?: string;
  gateCode?: string;
  buildingName?: string;
  deliveryPreference?: "door" | "location";
  meetLocation?: "door" | "outside";
  deliveryInstructions?: string;
  personalLabel?: string;
}

// User interface
export interface User {
  id: string;
  name: string;
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
}
