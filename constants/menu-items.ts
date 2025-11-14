import { Modification } from '@/types';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  price: string;
  image: string | null;
  category: string;
  calories?: string;
  rating?: number | string | null;
  ratingCount?: number | null;
  popular?: boolean;
  featured?: boolean;
  modifications?: Modification[];
}
