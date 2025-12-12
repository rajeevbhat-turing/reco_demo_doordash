'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import type { MenuItem } from '@/constants/menu-items';
import { getDefaultRating } from '@/lib/utils/rating-utils';
import {
  Modification,
  ModificationOption,
  AppliedModification,
  AppliedModificationOption,
} from '@/types';
import { cn } from '@/lib/utils';
import { haveSameModifications, generateCartItemId } from '@/lib/utils/cart-merge';
import { useRestaurantOpenStatus } from '@/lib/hooks/use-restaurant-open-status';

// Types for the menu item options
interface MenuItemOption {
  id: string;
  title: string;
  subtitle: string;
  details: string[];
  price: string;
  popular?: boolean;
  popularity?: string;
}

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    restaurantId: string;
    name: string;
    price: string;
    image: string;
    description?: string;
    rating?: number;
    ratingCount?: number;
    calories?: string;
  } | null;
  restaurant?: {
    isOpen?: boolean;
    name?: string;
    openingHour?: number | string | null;
    closingHour?: number | string | null;
  } | null;
}

export default function MenuItemDialog({ isOpen, onClose, item, restaurant }: MenuItemDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [appliedModifications, setAppliedModifications] = useState<
    Map<string, AppliedModificationOption[]>
  >(new Map());
  const [expandedModifications, setExpandedModifications] = useState<Set<string>>(new Set());
  const [visibleModifications, setVisibleModifications] = useState<Modification[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addItem, findCart, updateQuantity } = useCartStore();

  // Calculate open status based on user's local time (not server time)
  const isRestaurantOpen = useRestaurantOpenStatus(restaurant as any);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Add event listener for Escape key
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      // Add event listener for outside click
      const handleClickOutside = (event: MouseEvent) => {
        if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else {
      document.body.style.overflow = 'auto';
      // Reset quantity when dialog closes
      setQuantity(1);
    }
  }, [isOpen, onClose]);

  // Initialize with default selections
  useEffect(() => {
    if (isOpen && item) {
      const defaultSelections = new Map<string, AppliedModificationOption[]>();
      const initialExpanded = new Set<string>();

      // Check if item is a MenuItem with modifications
      const menuItem = item as MenuItem;
      if (menuItem.modifications) {
        menuItem.modifications.forEach(mod => {
          if (!mod.parent_option) {
            // Root level modifications start expanded
            initialExpanded.add(mod.id);

            // Set default selections ONLY for required modifications
            // Optional modifications should not have pre-selected defaults
            // This ensures users explicitly choose optional add-ons and aren't charged unexpectedly
            if (mod.is_required) {
              const defaults = mod.options
                .filter(opt => opt.is_default)
                .map(opt => ({
                  optionId: opt.id,
                  optionName: opt.name,
                  price: opt.price,
                  quantity: 1,
                }));

              if (defaults.length > 0) {
                defaultSelections.set(mod.id, defaults);
              }
            }
            // For optional modifications, do not set any defaults - user must explicitly select
          }
        });
      }

      setAppliedModifications(defaultSelections);
      setExpandedModifications(initialExpanded);

      // Always start with quantity 1
      setQuantity(1);
      // Reset scroll state when dialog opens
      setIsScrolled(false);
    }
  }, [isOpen, item]);

  // Handle scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setIsScrolled(scrollTop > 50); // Show header after scrolling 50px
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // Update visible modifications based on parent_option selections
  useEffect(() => {
    if (!item) return;
    const menuItem = item as MenuItem;
    if (!menuItem.modifications || !Array.isArray(menuItem.modifications)) {
      setVisibleModifications([]);
      return;
    }

    const visible = menuItem.modifications.filter(mod => {
      if (!mod.parent_option) return true;

      // Check if parent option is selected
      for (const [, options] of appliedModifications) {
        if (options.some(opt => opt.optionId === mod.parent_option)) {
          return true;
        }
      }
      return false;
    });

    setVisibleModifications(visible);

    // Auto-expand child modifications when they become visible
    setExpandedModifications(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      visible.forEach(mod => {
        // If this is a child modification (has parent_option), expand it automatically
        if (mod.parent_option) {
          newExpanded.add(mod.id);
        }
      });
      return newExpanded;
    });
  }, [appliedModifications, item]);

  // Parse base price (remove currency symbol and convert to number)
  const basePrice = useMemo(
    () => (item ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0 : 0),
    [item]
  );

  const recommendedOptions: MenuItemOption[] = useMemo(
    () => [
      {
        id: '1',
        title: '#1 · Popular Choice',
        subtitle: 'Regular portion with standard selections',
        details: ['Regular size', 'Standard selections'],
        price: `$${basePrice.toFixed(2)}`,
        popular: true,
        popularity: '10+',
      },
      {
        id: '2',
        title: '#2 · Value Combo',
        subtitle: 'Large size with beverage',
        details: ['Large size', 'Includes beverage'],
        price: `$${(basePrice + 2.5).toFixed(2)}`,
      },
    ],
    [basePrice]
  );

  // Calculate total price including customizations
  const totalPrice = useMemo(() => {
    if (!item) return '0.00';
    let total = basePrice;

    // Add selected recommended option price if applicable
    if (selectedOption) {
      const option = recommendedOptions.find(opt => opt.id === selectedOption);
      if (option) {
        const optionPrice = parseFloat(option.price.replace(/[^0-9.]/g, '')) || 0;
        total = optionPrice; // Use the option price as the new base
      }
    }

    // Add modification prices
    for (const [, options] of appliedModifications) {
      for (const opt of options) {
        total += opt.price * opt.quantity;
      }
    }

    // Multiply by quantity
    return (total * quantity).toFixed(2);
  }, [basePrice, selectedOption, appliedModifications, quantity, recommendedOptions, item]);

  const toggleModificationExpanded = (modId: string) => {
    const newExpanded = new Set(expandedModifications);
    if (newExpanded.has(modId)) {
      newExpanded.delete(modId);
    } else {
      newExpanded.add(modId);
    }
    setExpandedModifications(newExpanded);
  };

  const handleModificationOptionSelect = (
    modification: Modification,
    option: ModificationOption,
    selected: boolean
  ) => {
    const newApplied = new Map(appliedModifications);
    const currentOptions = newApplied.get(modification.id) || [];

    if (selected) {
      // For single selection (select_up_to === 1), replace existing
      if (modification.select_up_to === 1) {
        newApplied.set(modification.id, [
          {
            optionId: option.id,
            optionName: option.name,
            price: option.price,
            quantity: 1,
          },
        ]);
      } else {
        // For multiple selection, add if under limit
        if (currentOptions.length < modification.select_up_to) {
          newApplied.set(modification.id, [
            ...currentOptions,
            {
              optionId: option.id,
              optionName: option.name,
              price: option.price,
              quantity: 1,
            },
          ]);
        }
      }
    } else {
      // Deselection logic
      const filtered = currentOptions.filter(opt => opt.optionId !== option.id);

      // For required modifications, prevent deselection if it would leave no selections
      if (modification.is_required) {
        const minRequired = modification.select_at_least || 1;
        // Only allow deselection if we'll still have at least the minimum required
        if (filtered.length >= minRequired) {
          newApplied.set(modification.id, filtered);
        }
        // Otherwise, do nothing (don't allow deselection)
      } else {
        // For optional modifications, always allow deselection
        if (filtered.length > 0) {
          newApplied.set(modification.id, filtered);
        } else {
          newApplied.delete(modification.id);
        }
      }
    }

    setAppliedModifications(newApplied);
  };

  const handleCounterChange = (
    modification: Modification,
    option: ModificationOption,
    delta: number
  ) => {
    const newApplied = new Map(appliedModifications);
    const currentOptions = newApplied.get(modification.id) || [];
    const existingOption = currentOptions.find(opt => opt.optionId === option.id);

    if (existingOption) {
      const newQuantity = Math.max(0, existingOption.quantity + delta);
      const maxQty = option.max_quantity || Infinity;

      if (newQuantity === 0) {
        // Remove if quantity reaches 0
        const filtered = currentOptions.filter(opt => opt.optionId !== option.id);
        if (filtered.length > 0) {
          newApplied.set(modification.id, filtered);
        } else {
          newApplied.delete(modification.id);
        }
      } else if (newQuantity <= maxQty) {
        const updated = currentOptions.map(opt =>
          opt.optionId === option.id ? { ...opt, quantity: newQuantity } : opt
        );
        newApplied.set(modification.id, updated);
      }
    } else if (delta > 0) {
      // Add new counter option
      newApplied.set(modification.id, [
        ...currentOptions,
        {
          optionId: option.id,
          optionName: option.name,
          price: option.price,
          quantity: 1,
        },
      ]);
    }

    setAppliedModifications(newApplied);
  };

  const isModificationOptionSelected = (modId: string, optionId: string): boolean => {
    const options = appliedModifications.get(modId) || [];
    return options.some(opt => opt.optionId === optionId);
  };

  const getOptionQuantity = (modId: string, optionId: string): number => {
    const options = appliedModifications.get(modId) || [];
    const option = options.find(opt => opt.optionId === optionId);
    return option?.quantity || 0;
  };

  const canAddToCart = useMemo((): boolean => {
    if (!item) return false;
    
    // Check if restaurant is closed (using client-side calculated status)
    if (restaurant && !isRestaurantOpen) {
      return false;
    }
    
    const menuItem = item as MenuItem;
    if (!menuItem.modifications) return true;

    // Check all required modifications are satisfied
    for (const mod of visibleModifications) {
      if (mod.is_required) {
        const selected = appliedModifications.get(mod.id) || [];
        const minRequired = mod.select_at_least || 1;
        if (selected.length < minRequired) {
          return false;
        }
      }
    }

    return true;
  }, [visibleModifications, appliedModifications, item, restaurant, isRestaurantOpen]);

  if (!isOpen || !item) return null;

  // const handleOptionSelect = (optionId: string) => {
  //   setSelectedOption(optionId === selectedOption ? null : optionId);
  // };

  const handleAddToCart = () => {
    if (!item || !canAddToCart) return;

    const menuItem = item as MenuItem;
    const singleItemPrice = parseFloat(totalPrice) / quantity;

    // Format applied modifications for cart
    const formattedModifications: AppliedModification[] = [];
    for (const [modId, options] of appliedModifications) {
      const modification = menuItem.modifications?.find(m => m.id === modId);
      if (modification && options.length > 0) {
        formattedModifications.push({
          modificationId: modId,
          modificationDescription: modification.description,
          appliedOptions: options,
        });
      }
    }

    // Build customization text for display
    const customizationText: string[] = [];
    if (selectedOption) {
      const option = recommendedOptions.find(opt => opt.id === selectedOption);
      if (option) {
        customizationText.push(option.title);
      }
    }

    for (const mod of formattedModifications) {
      for (const opt of mod.appliedOptions) {
        const displayText =
          opt.quantity > 1 ? `${opt.optionName} (x${opt.quantity})` : opt.optionName;
        customizationText.push(displayText);
      }
    }

    // Check if item already exists in cart (compare by ID and modifications)
    const cart = findCart(item.restaurantId, 'restaurant');
    const customizationsString = customizationText.join(' · ');

    // Generate unique cart item ID based on base ID + modifications
    const uniqueCartItemId = generateCartItemId(
      item.id,
      formattedModifications.length > 0 ? formattedModifications : undefined
    );

    // Create the cart item to compare
    const itemWithCategory = item as MenuItem;
    const cartItem = {
      id: uniqueCartItemId, // Use unique ID that includes modifications
      itemName: item.name,
      price: singleItemPrice.toFixed(2),
      image: item.image,
      customizations: customizationsString,
      appliedModifications: formattedModifications.length > 0 ? formattedModifications : undefined,
      menuCategoryId: itemWithCategory.categoryId,
      menuCategoryName: itemWithCategory.categoryName || itemWithCategory.category,
    };

    // Use haveSameModifications to check if item with same modifications exists
    const existingItem = cart?.items.find(i => haveSameModifications(i, cartItem as any));

    if (existingItem) {
      // Item exists with same modifications - update quantity by adding the dialog quantity
      const newQuantity = existingItem.quantity + quantity;
      updateQuantity(existingItem.id, newQuantity);
    } else {
      // Item doesn't exist or has different modifications - add it quantity times
      // Add the item quantity times
      for (let i = 0; i < quantity; i++) {
        addItem(cartItem, 'restaurant', undefined, item.restaurantId);
      }
    }

    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col"
      >
        {/* Fixed header that appears on scroll */}
        {isScrolled && (
          <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center z-20 rounded-t-lg">
            <button onClick={onClose} className="p-1 flex-shrink-0" aria-label="Close dialog">
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-lg font-semibold truncate flex-1 ml-4">{item.name}</h3>
          </div>
        )}

        {/* Original close button (hidden when scrolled) */}
        {!isScrolled && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-1"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Scrollable content area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="px-4 pt-14 pb-8">
            <h2 className="text-2xl font-bold">{item.name}</h2>
            {item.rating && item.ratingCount && item.ratingCount != 0 && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                  {Math.round(getDefaultRating(item.rating) * 20)}% ({item.ratingCount})
                </span>
              </div>
            )}
            {item.calories && <div className="text-gray-500">{item.calories} Cal</div>}

            <div className="mt-4 relative">
              <div className="w-full h-64 relative rounded-lg overflow-hidden">
                <img
                  src={item.image || '/placeholder.svg?height=256&width=400&query=burger+meal'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Recommended Options */}
            {/* <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your recommended options</h3>
              <div className="flex space-x-2">
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-1 rounded-full border border-gray-200">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {recommendedOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer ${selectedOption === option.id ? "border-red-500" : "border-gray-200"
                    }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{option.subtitle}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{option.price}</span>
                      <div
                        className={`ml-3 w-5 h-5 rounded-full border ${selectedOption === option.id ? "border-red-500 bg-red-500" : "border-gray-300"
                          }`}
                      >
                        {selectedOption === option.id && (
                          <div className="flex items-center justify-center h-full">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
          </div>

          <div className="px-3 pb-4">
            {/* Modification Sections */}
            {visibleModifications
              .filter(mod => !mod.parent_option)
              .map(modification => {
                // Find child modifications that depend on this modification's options
                const childModifications = visibleModifications.filter(childMod => {
                  if (!childMod.parent_option) return false;
                  // Check if parent_option matches any option in this modification
                  return modification.options.some(opt => opt.id === childMod.parent_option);
                });

                const hasVisibleChildren = childModifications.length > 0;

                return (
                  <div key={modification.id} className="mt-4">
                    <div className="rounded-lg overflow-hidden bg-white">
                      {/* Root level modification header - full width */}
                      <button
                        onClick={() => toggleModificationExpanded(modification.id)}
                        className="w-full flex items-center justify-between py-4 px-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-base">{modification.description}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            {modification.is_required ? (
                              (() => {
                                const selected = appliedModifications.get(modification.id) || [];
                                const minRequired = modification.select_at_least || 1;
                                const isSatisfied = selected.length >= minRequired;

                                return isSatisfied ? (
                                  <span className="text-green-600 text-sm font-medium flex items-center gap-0.5">
                                    <span>✓</span> Required
                                  </span>
                                ) : (
                                  <span className="text-amber-600 text-sm font-medium flex items-center gap-0.5">
                                    <span className="text-base">⚠</span> Required
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-gray-500 text-sm">(Optional)</span>
                            )}
                            <span className="text-gray-500 text-sm">
                              • Select{' '}
                              {modification.select_up_to === 1
                                ? '1'
                                : restaurant?.name === "Fiona's Tavern"
                                ? `up to ${Math.min(modification.select_up_to, modification.options.length)}`
                                : `up to ${modification.select_up_to}`}
                            </span>
                          </div>
                        </div>
                        {expandedModifications.has(modification.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      {/* Options - displayed as rows inside the section */}
                      {expandedModifications.has(modification.id) && (
                        <div className="border-t border-gray-200">
                          {modification.options.map(option => (
                            <ModificationOptionCard
                              key={option.id}
                              modification={modification}
                              option={option}
                              isSelected={isModificationOptionSelected(modification.id, option.id)}
                              quantity={getOptionQuantity(modification.id, option.id)}
                              onSelect={selected =>
                                handleModificationOptionSelect(modification, option, selected)
                              }
                              onCounterChange={delta =>
                                handleCounterChange(modification, option, delta)
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Child modifications container with gray background */}
                    {hasVisibleChildren && expandedModifications.has(modification.id) && (
                      <div className="bg-gray-100 rounded-lg p-6 mt-2 mx-[-12px]">
                        {childModifications.map(childMod => (
                          <div
                            key={childMod.id}
                            className="mt-2 first:mt-0 rounded-lg overflow-hidden bg-white"
                          >
                            {/* Child modification header */}
                            <button
                              onClick={() => toggleModificationExpanded(childMod.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1 text-left">
                                <h3 className="font-semibold text-base">{childMod.description}</h3>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {childMod.is_required ? (
                                    (() => {
                                      const selected = appliedModifications.get(childMod.id) || [];
                                      const minRequired = childMod.select_at_least || 1;
                                      const isSatisfied = selected.length >= minRequired;

                                      return isSatisfied ? (
                                        <span className="text-green-600 text-sm font-medium flex items-center gap-0.5">
                                          <span>✓</span> Required
                                        </span>
                                      ) : (
                                        <span className="text-amber-600 text-sm font-medium flex items-center gap-0.5">
                                          <span className="text-base">⚠</span> Required
                                        </span>
                                      );
                                    })()
                                  ) : (
                                    <span className="text-gray-500 text-sm">(Optional)</span>
                                  )}
                                  <span className="text-gray-500 text-sm">
                                    • Select{' '}
                                    {childMod.select_up_to === 1
                                      ? '1'
                                      : restaurant?.name === "Fiona's Tavern"
                                      ? `up to ${Math.min(childMod.select_up_to, childMod.options.length)}`
                                      : `up to ${childMod.select_up_to}`}
                                  </span>
                                </div>
                              </div>
                              {expandedModifications.has(childMod.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </button>

                            {/* Child options */}
                            {expandedModifications.has(childMod.id) && (
                              <div className="border-t border-gray-200">
                                {childMod.options.map(option => (
                                  <ModificationOptionCard
                                    key={option.id}
                                    modification={childMod}
                                    option={option}
                                    isSelected={isModificationOptionSelected(
                                      childMod.id,
                                      option.id
                                    )}
                                    quantity={getOptionQuantity(childMod.id, option.id)}
                                    onSelect={selected =>
                                      handleModificationOptionSelect(childMod, option, selected)
                                    }
                                    onCounterChange={delta =>
                                      handleCounterChange(childMod, option, delta)
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        {/* End of scrollable content */}

        {/* Fixed bottom button */}
        <div className="flex-shrink-0 bg-white p-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <button
                className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  const value = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, value));
                }}
                className="w-12 text-center text-base font-medium bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100"
                onClick={incrementQuantity}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <div className="flex-1 flex flex-col gap-2">
              {restaurant && !isRestaurantOpen && (
                <p className="text-sm text-red-600 font-medium text-center">
                  This restaurant is currently closed.
                </p>
              )}
              <button
                className={`w-full py-3 ${
                  canAddToCart ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300'
                } text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed`}
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                Add to cart - ${totalPrice}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ModificationOptionCard Component
interface ModificationOptionCardProps {
  modification: Modification;
  option: ModificationOption;
  isSelected: boolean;
  quantity: number;
  onSelect: (selected: boolean) => void;
  onCounterChange: (delta: number) => void;
}

function ModificationOptionCard({
  modification,
  option,
  isSelected,
  quantity,
  onSelect,
  onCounterChange,
}: ModificationOptionCardProps) {
  const isSingleSelect = modification.select_up_to === 1;

  if (option.is_counter) {
    // Counter-based option
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <div className="flex-1">
          <p className="text-base">{option.name}</p>
          {option.description && (
            <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
          )}
          {option.price > 0 && (
            <p className="text-sm text-gray-600 mt-0.5">+${option.price.toFixed(2)} each</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            onClick={() => onCounterChange(-1)}
            disabled={quantity === 0}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-base font-medium w-6 text-center">{quantity}</span>
          <button
            className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            onClick={() => onCounterChange(1)}
            disabled={quantity >= (option.max_quantity || Infinity)}
          >
            <Plus className="h-4 w-4" />
          </button>
          {option.image && (
            <div className="ml-2 flex-shrink-0">
              <img
                src={option.image}
                alt={option.name}
                width={48}
                height={48}
                className="rounded-lg object-cover min-h-[48px]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular option (radio or checkbox)
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onSelect(!isSelected);
      }}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors text-left"
    >
      {/* Radio or Checkbox */}
      <div className="flex-shrink-0 mt-0.5 align-self-center">
        {isSingleSelect ? (
          <div
            className={cn(
              'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
              isSelected ? 'border-black bg-black' : 'border-gray-300'
            )}
          >
            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        ) : (
          <div
            className={cn(
              'h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
              isSelected ? 'border-black bg-black' : 'border-gray-300'
            )}
          >
            {isSelected && (
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Option Details */}
      <div className="flex-1 min-w-0">
        <p className="text-base">{option.name}</p>
        {option.description && <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>}
        {/* Price under description */}
        {option.price !== 0 && (
          <p className="text-sm text-gray-600 mt-0.5">
            {option.price > 0
              ? `+$${option.price.toFixed(2)}`
              : `-$${Math.abs(option.price).toFixed(2)}`}
          </p>
        )}
      </div>

      {/* Optional Image on the far right */}
      {option.image && (
        <div className="flex-shrink-0">
          <img
            src={option.image}
            alt={option.name}
            width={48}
            height={48}
            className="rounded-lg object-cover"
          />
        </div>
      )}
    </button>
  );
}
