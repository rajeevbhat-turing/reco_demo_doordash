// Types for user data
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  reviews: string[]; // Array of review IDs
  is_deleted: boolean;
  is_restricted: boolean;
}

