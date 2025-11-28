'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Minus } from 'lucide-react';
import ProductCard from '@/components/product-card';
import type { Product } from '@/types';
import Link from 'next/link';
import { CartCategory, useCartStore } from '@/store/cart-store';

interface ProductDisplayProps {
  title: string;
  products: Product[];
  variant?: 'section' | 'carousel';
  onProductClick?: (product: Product) => void;
  storeName?: string;
  storeImage?: string;
  time?: string;
  isSnapEligible?: boolean;
  storeId?: string;
  category?: CartCategory;
}

export default function ProductDisplay({
  title,
  products,
  variant = 'section',
  onProductClick,
  storeName,
  storeImage,
  time,
  isSnapEligible,
  storeId = '1',
  category = 'restaurant',
}: ProductDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use the cart store
  const { carts, findCart, updateQuantity, removeItem, setCategory, addItem } = useCartStore();

  // Set the category when component mounts
  useEffect(() => {
    setCategory(category);
  }, [category, setCategory]);

  // Get current cart for this store
  const currentCart = storeId ? findCart(storeId, category) : null;

  // Scroll left
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Scroll right
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    // Get store name - use provided storeName or fallback to formatted storeId
    const resolvedStoreName = storeName || (storeId ? `Store ${storeId}` : 'Store');

    const cartItem = {
      id: product.id,
      itemName: product.name, // Use itemName instead of name
      price: product.price,
      image: product.image,
    };

    // Add to cart - will automatically find or create cart for this store
    addItem(cartItem, category, resolvedStoreName, storeId);
  };

  // Handle removing product from cart
  const handleRemoveFromCart = (productId: number | string) => {
    removeItem(productId);
  };

  // Handle decreasing quantity
  const handleDecreaseQuantity = (product: Product, quantity: number) => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  // Create a URL-friendly version of the category title
  const categorySlug = title.toLowerCase().replace(/\s+/g, '-');

  // Find items in cart
  const getItemQuantity = (productId: number | string): number => {
    if (!currentCart) return 0;
    const item = currentCart.items.find(item => item.id === productId);
    return item?.quantity || 0;
  };

  // Helper function to format price
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      // If it's already a string like "$37.80", return as is
      if (price.startsWith('$')) {
        return price;
      }
      // If it's a string number like "37.80", format it
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? price : `$${numPrice.toFixed(2)}`;
    }
    // If it's a number, format it normally
    return `$${price.toFixed(2)}`;
  };

  return (
    <section className="py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {storeImage && (
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              <img
                src={storeImage || '/placeholder.svg'}
                alt={storeName || 'Store'}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {storeName && (
              <div className="text-sm text-gray-600 mt-1">
                From {storeName}
                {time && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{time}</span>
                  </>
                )}
              </div>
            )}
            {isSnapEligible && (
              <div className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-600 mt-1">
                SNAP
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex space-x-2">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto no-scrollbar scroll-smooth w-full snap-x"
        >
          {variant === 'section' ? (
            <div className="flex px-4 space-x-4 pb-2">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onProductClick={onProductClick || (() => {})}
                  storeId={storeId}
                  category={category}
                />
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 pb-2">
              {products.map(product => {
                const quantity = getItemQuantity(product.id);

                return (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden min-w-[200px] md:min-w-[220px] snap-start"
                  >
                    <div className="relative h-32 w-full flex items-center justify-center">
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        width={128}
                        height={128}
                        className="object-contain"
                      />
                      {quantity > 0 ? (
                        <div className="absolute bottom-2 right-2">
                          <div className="flex items-center bg-white rounded-full shadow-md px-2 py-1">
                            <button
                              className="p-1 text-gray-700"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveFromCart(product.id);
                              }}
                              aria-label="Remove from cart"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-700"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDecreaseQuantity(product, quantity);
                              }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="mx-2 text-sm font-medium">{quantity} ×</span>
                            <button
                              className="p-1 text-gray-700"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              aria-label="Add one more"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          aria-label="Add to cart"
                        >
                          <Plus className="w-5 h-5 text-green-600" />
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-sm">{formatPrice(product.price)}</div>
                      <div className="text-sm text-gray-700 line-clamp-2">{product.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
