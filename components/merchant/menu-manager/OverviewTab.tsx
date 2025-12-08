'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, Settings, Eye, Plus, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMerchantMenuStore } from '@/store/merchant-menu-store';
import ItemStatusDropdown from '@/components/merchant/ItemStatusDropdown';
import MenuSettingsDropdown from '@/components/merchant/MenuSettingsDropdown';
import RestaurantSelector from '@/components/merchant/RestaurantSelector';
import ItemEditorPanel from '@/components/merchant/ItemEditorPanel';
import { MenuItem } from '@/store/merchant-menu-store';
import { useMerchantPersistedState } from '@/lib/hooks/useMerchantPersistedState';
import ConfirmModal from '@/components/merchant/modals/ConfirmModal';
import NewItemModal from '@/components/merchant/modals/NewItemModal';
import NewCategoryModal from '@/components/merchant/modals/NewCategoryModal';

interface OverviewTabProps {
  isLoadingMenu: boolean;
  isMounted: boolean;
}

export default function OverviewTab({ isLoadingMenu, isMounted }: OverviewTabProps) {
  const [isMenuSettingsOpen, setIsMenuSettingsOpen] = useMerchantPersistedState(
    'menu',
    'ui',
    'isMenuSettingsOpen',
    false
  );
  const [selectedRestaurantId, setSelectedRestaurantId] = useMerchantPersistedState(
    'menu',
    'selector',
    'selectedRestaurantId',
    'philz-coffee'
  );
  const [selectedItem, setSelectedItem] = useMerchantPersistedState<MenuItem | null>(
    'menu',
    'editor',
    'selectedItem',
    null
  );
  const [isItemEditorOpen, setIsItemEditorOpen] = useMerchantPersistedState(
    'menu',
    'editor',
    'isOpen',
    false
  );
  const [pendingDeleteItem, setPendingDeleteItem] = useState<MenuItem | null>(null);
  const [searchValue, setSearchValue] = useMerchantPersistedState(
    'menu',
    'filters',
    'searchQuery',
    ''
  );
  const [selectedFilter, setSelectedFilter] = useMerchantPersistedState(
    'menu',
    'filters',
    'selectedFilter',
    'All items'
  );
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const {
    categories: storeCategories,
    expandedCategories,
    toggleCategory,
    updateItemStatus,
    updateItem,
    deleteItem,
    setCategories,
  } = useMerchantMenuStore();

  const handleCreateCategory = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const idBase = trimmed.toLowerCase().replace(/\s+/g, '-');
      const exists = storeCategories.some(cat => cat.id === idBase);
      const finalId = exists ? `${idBase}-${Date.now()}` : idBase;
      setCategories([...storeCategories, { id: finalId, name: trimmed, items: [] }]);
      setShowNewCategoryModal(false);
    },
    [setCategories, storeCategories]
  );

  // Filter items within categories, but keep all categories visible
  const filteredCategories = storeCategories
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchValue.toLowerCase());
        const matchesFilter =
          selectedFilter === 'All items' ||
          (selectedFilter === 'In stock' && item.status === 'In stock') ||
          (selectedFilter === 'Out of stock' && item.status !== 'In stock');
        return matchesSearch && matchesFilter;
      }),
    }))
    .filter(category => {
      // Show category if:
      // 1. It has items after filtering, OR
      // 2. There's no search/filter active (show all categories including empty ones)
      return category.items.length > 0 || (searchValue === '' && selectedFilter === 'All items');
    });

  return (
    <>
      <div className="mb-6">
        {/* Top Row - Restaurant Selector and Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <RestaurantSelector
            selectedRestaurantId={selectedRestaurantId}
            onSelectRestaurant={setSelectedRestaurantId}
          />
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsMenuSettingsOpen(!isMenuSettingsOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Menu Settings
              </button>
              <MenuSettingsDropdown
                isOpen={isMenuSettingsOpen}
                onClose={() => setIsMenuSettingsOpen(false)}
              />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Eye className="h-4 w-4" />
              Preview Menu
            </button>
            <div className="relative" ref={addMenuRef}>
              <button
                onClick={() => setShowAddMenu(prev => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add
                <ChevronDown className="h-4 w-4" />
              </button>
              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg z-20">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setShowAddMenu(false);
                      setShowNewCategoryModal(true);
                    }}
                  >
                    New category
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => {
                      setShowAddMenu(false);
                      setShowNewItemModal(true);
                    }}
                  >
                    New item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row - Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for an item"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white text-gray-700"
          >
            <option>All items</option>
            <option>In stock</option>
            <option>Out of stock</option>
          </select>
        </div>
      </div>

      {/* Menu Categories */}
      {isLoadingMenu && isMounted ? (
        <div className="text-center py-8 text-gray-500">Loading menu...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchValue ? 'No menu items found matching your search.' : 'No menu items available.'}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const itemCount = category.items.length;

            return (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg bg-white overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">
                      Available Category - {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      isExpanded ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left font-medium px-4 py-3 text-gray-700 w-16"></th>
                          <th className="text-left font-medium px-4 py-3 text-gray-700">
                            Item Name
                          </th>
                          <th className="text-left font-medium px-4 py-3 text-gray-700">
                            Pickup price
                          </th>
                          <th className="text-left font-medium px-4 py-3 text-gray-700">
                            Delivery price
                          </th>
                          <th className="text-left font-medium px-4 py-3 text-gray-700">
                            Item status
                          </th>
                          <th className="w-12"></th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                              No items in this category
                            </td>
                          </tr>
                        ) : (
                          category.items.map(item => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="w-12 h-12 rounded-md bg-gray-200 overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={e => {
                                      e.currentTarget.src = '/placeholder.jpg';
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                              <td className="px-4 py-3 text-gray-600">{item.pickupPrice}</td>
                              <td className="px-4 py-3 text-gray-600">{item.deliveryPrice}</td>
                              <td className="px-4 py-3">
                                <ItemStatusDropdown
                                  currentStatus={item.status}
                                  onStatusChange={status => updateItemStatus(item.id, status)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setIsItemEditorOpen(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => setPendingDeleteItem(item)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Add Item Button */}
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <button className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        <Plus className="h-4 w-4" />
                        Add Item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Item Editor Panel */}
      <ItemEditorPanel
        item={selectedItem}
        isOpen={isItemEditorOpen}
        onClose={() => {
          setIsItemEditorOpen(false);
          setSelectedItem(null);
        }}
        onUpdate={(itemId, updates) => {
          updateItem(itemId, updates);
        }}
      />

      <ConfirmModal
        isOpen={!!pendingDeleteItem}
        title="Delete menu item?"
        description={`This will remove "${pendingDeleteItem?.name ?? ''}" from the menu.`}
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (pendingDeleteItem) {
            deleteItem(pendingDeleteItem.id);
            setPendingDeleteItem(null);
          }
        }}
      />

      <NewItemModal
        isOpen={showNewItemModal}
        onClose={() => setShowNewItemModal(false)}
        categories={storeCategories}
      />
      <NewCategoryModal
        isOpen={showNewCategoryModal}
        onClose={() => setShowNewCategoryModal(false)}
        onCreate={handleCreateCategory}
      />
    </>
  );
}
