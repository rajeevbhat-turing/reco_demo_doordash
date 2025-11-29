import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDefaultRating } from '@/utils/rating-utils';

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  rating?: string;
  numRatings?: string;
  inStock?: boolean;
}

interface ProductCarouselProps {
  title: string;
  storeName: string;
  storeImage?: string;
  time?: string;
  products: Product[];
  isSnapEligible?: boolean;
}

export default function ProductCarousel({
  title,
  storeName,
  storeImage = '/placeholder.svg?height=50&width=50',
  time = '26 min',
  products,
  isSnapEligible = false,
}: ProductCarouselProps) {
  return (
    <div className="py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="flex items-start mb-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 mr-4">
          <img src={storeImage} alt={storeName} width={48} height={48} className="object-cover" />
        </div>

        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center text-sm text-gray-600">
                <span>From {storeName}</span>
                {time && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{time}</span>
                  </>
                )}
              </div>
              {isSnapEligible && (
                <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                  SNAP
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="rounded-full bg-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full bg-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Product image container with hover effect */}
            <div className="group relative h-40 w-full bg-gray-50 flex items-center justify-center">
              {/* Product image */}
              <div className="relative h-28 w-28">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Add button that appears on hover */}
              <div className="absolute bottom-2 right-2 transition-all duration-200 opacity-0 group-hover:opacity-100 z-10">
                <button className="h-8 w-8 rounded-full bg-white hover:bg-gray-100 shadow-md flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-900" />
                </button>
              </div>
            </div>

            <div className="p-3">
              <div className="font-bold text-sm">{product.price}</div>
              <div className="text-sm text-gray-700 line-clamp-2">{product.name}</div>

              {product.rating && product.rating !== '0' && (
                <div className="flex items-center text-sm text-gray-500">
                  <span>★ {getDefaultRating(product.rating)}</span>
                  <span className="ml-1">({product.numRatings})</span>
                </div>
              )}

              {product.inStock && <div className="text-xs text-green-700 mt-1">Many in stock</div>}

              {/*<Button className="w-full mt-2 h-8 text-xs rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900">*/}
              {/*  Add*/}
              {/*</Button>*/}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
