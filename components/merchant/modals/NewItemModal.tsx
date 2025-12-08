'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MenuCategory, useMerchantMenuStore } from '@/store/merchant-menu-store';
import { useMerchantModifiersStore } from '@/store/merchant-modifiers-store';
import { isValidPrice, isValidTaxRate } from '@/lib/utils/helperFunctions';
import { useGlobalContext } from '@/app/global-context';
import type { Modifier } from '@/constants/merchant-store-data';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: MenuCategory[];
}

// New item creation side panel modal
export default function NewItemModal({ isOpen, onClose, categories }: NewItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [description, setDescription] = useState('');
  const [containsAlcohol, setContainsAlcohol] = useState(false);
  const [category, setCategory] = useState('');
  const [modifierSearch, setModifierSearch] = useState('');
  const [attachedModifiers, setAttachedModifiers] = useState<Modifier[]>([]);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [taxError, setTaxError] = useState('');

  const categoryNames = useMemo(
    () => categories.map(c => c.name),
    [categories]
  );

  const menuItems = useMemo(
    () =>
      categories.flatMap(cat =>
        cat.items.map(item => ({
          id: item.id,
          name: item.name,
          category: cat.name,
        }))
      ),
    [categories]
  );

  const addItem = useMerchantMenuStore(state => state.addItem);
  const updateModifier = useMerchantModifiersStore(state => state.updateModifier);
  const { modifiers } = useMerchantModifiersStore();
  const { setSnackbar } = useGlobalContext();

  useEffect(() => {
    if (categoryNames.length > 0) {
      setCategory(categoryNames[0]);
    }
  }, [categoryNames]);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setPrice('');
      setTaxRate('');
      setDescription('');
      setContainsAlcohol(false);
      setModifierSearch('');
      setAttachedModifiers([]);
      setNameError('');
      setPriceError('');
      setTaxError('');
      if (categoryNames.length > 0) {
        setCategory(categoryNames[0]);
      } else {
        setCategory('');
      }
    }
  }, [isOpen, categoryNames]);

  // Create and persist new menu item with attached modifiers
  const handleCreate = () => {
    let hasError = false;
    if (!name.trim()) {
      setNameError('Name is required.');
      hasError = true;
    }
    if (!price.trim()) {
      setPriceError('Price is required.');
      hasError = true;
    } else if (!isValidPrice(price)) {
      setPriceError('Enter a valid price (e.g. 10 or 10.50).');
      hasError = true;
    }
    if (!taxRate.trim()) {
      setTaxError('Tax rate is required.');
      hasError = true;
    } else if (!isValidTaxRate(taxRate)) {
      setTaxError('Enter a valid tax (e.g. 10 or 10.5).');
      hasError = true;
    }
    if (hasError) return;

    const selectedCategory = categories.find(cat => cat.name === category) ?? categories[0];
    const newId = `item-${Date.now()}`;
    const normalizedPrice = price.trim().startsWith('$') ? price.trim() : `$${price.trim()}`;
    const trimmedName = name.trim();

    addItem(selectedCategory?.id ?? '', {
      id: newId,
      name: trimmedName,
      image: '',
      pickupPrice: normalizedPrice,
      deliveryPrice: normalizedPrice,
      status: 'In stock',
    });

    attachedModifiers.forEach(mod => {
      const exists = mod.usedIn?.some(ref => ref.id === newId);
      if (!exists) {
        const nextUsedIn = [...(mod.usedIn || []), { id: newId, name: trimmedName }];
        updateModifier(mod.id, { usedIn: nextUsedIn });
      }
    });

    setSnackbar({ message: 'New menu item created', autoHideDuration: 3000 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 -ml-2" aria-label="Close">
            <X className="h-5 w-5 text-gray-600" />
          </button>
          <p className='text-base text-gray-500 font-medium'>Item</p>
          <div className="mt-2">
            <h2 className="text-lg font-semibold text-gray-900">New item</h2>
            <p className="text-sm text-gray-600">You can edit the availability of this item after saving.</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-4 space-y-6 flex-1">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Item details</h3>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Name</label>
              <Input
                value={name}
                onChange={e => {
                  const val = e.target.value;
                  setName(val);
                  if (!val.trim()) {
                    setNameError('Name is required.');
                  } else {
                    setNameError('');
                  }
                }}
                placeholder="Item name"
                className={`w-full bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  nameError ? 'border-red-500 border-2 focus:border-red-500 focus:border-2' : ''
                }`}
              />
              {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-900 block mb-2">Price</label>
                <Input
                  value={price}
                  onChange={e => {
                    const val = e.target.value;
                    setPrice(val);
                    if (!val.trim()) {
                      setPriceError('Price is required.');
                    } else if (!isValidPrice(val)) {
                      setPriceError('Enter a valid price (e.g. 10 or 10.50).');
                    } else {
                      setPriceError('');
                    }
                  }}
                  placeholder="$0.00"
                  className={`w-full bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    priceError ? 'border-red-500 border-2 focus:border-red-500 focus:border-2' : ''
                  }`}
                />
                {priceError && <p className="text-xs text-red-600 mt-1">{priceError}</p>}
              </div>
              <div className="flex-1">
                <label className="text-sm font-semibold text-gray-900 block mb-2">Tax rate</label>
                <Input
                  value={taxRate}
                  onChange={e => {
                    const val = e.target.value;
                    setTaxRate(val);
                    if (!val.trim()) {
                      setTaxError('Tax rate is required.');
                    } else if (!isValidTaxRate(val)) {
                      setTaxError('Enter a valid tax (e.g. 10 or 10.5).');
                    } else {
                      setTaxError('');
                    }
                  }}
                  placeholder="10.35%"
                  className={`w-full bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    taxError ? 'border-red-500 border-2 focus:border-red-500 focus:border-2' : ''
                  }`}
                />
                {taxError && <p className="text-xs text-red-600 mt-1">{taxError}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 border border-transparent focus:border-[#191919ff] focus:border-2 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="contains-alcohol"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={containsAlcohol}
                onChange={e => setContainsAlcohol(e.target.checked)}
              />
              <label htmlFor="contains-alcohol" className="text-sm text-gray-800">
                This item contains alcohol
              </label>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-transparent focus:border-[#191919ff] focus:border-2 rounded-md px-3 py-2 text-sm bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                {categoryNames.map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modifiers */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="text-lg font-semibold text-gray-900">Modifiers</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Add a modifier from</span>
              <select className="rounded-md px-2 py-1 bg-white text-[#191919ff] font-semibold text-xs border-0">
                <option>All Active Menus</option>
              </select>
            </div>
            <div className="relative">
              <Input
                value={modifierSearch}
                onChange={e => setModifierSearch(e.target.value)}
                placeholder="Search and add modifiers"
                className="w-full bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {modifierSearch && (
                <div className="absolute left-0 right-0 bottom-full mb-1 rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto z-30">
                  {menuItems
                    .filter(item => item.name.toLowerCase().includes(modifierSearch.toLowerCase()))
                    .map(item => (
                      <button
                        key={`${item.id}-${item.category}`}
                        onClick={() => {
                          setModifierSearch('');
                          const related = modifiers.filter(mod =>
                            mod.usedIn?.some(ref => ref.id === item.id)
                          );
                          setAttachedModifiers(prev => {
                            const byId = new Map<string, Modifier>();
                            [...prev, ...related].forEach(m => byId.set(m.id, m));
                            return Array.from(byId.values());
                          });
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {item.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {attachedModifiers.length > 0 ? (
              <div className="space-y-1 text-sm text-gray-800">
                {attachedModifiers.map(mod => (
                  <div key={mod.id} className="px-2 py-1 rounded-md bg-gray-100">
                    {mod.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No modifiers</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[28px] border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-[28px] bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            Create and add photo
          </button>
        </div>
      </div>
    </>
  );
}


