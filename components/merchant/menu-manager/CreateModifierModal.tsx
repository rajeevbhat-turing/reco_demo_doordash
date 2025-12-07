'use client';

import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

type MenuItemRef = {
  id: string;
  name: string;
  image: string;
  category: string;
};

interface CreateModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItemRef[];
  onCreate: (payload: {
    name: string;
    options: string[];
    usedIn: Array<{ id: string; name: string }>;
    timing: string;
  }) => void;
}

export default function CreateModifierModal({
  isOpen,
  onClose,
  menuItems,
  onCreate,
}: CreateModifierModalProps) {
  const [name, setName] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<MenuItemRef[]>([]);
  const [openMoreIdx, setOpenMoreIdx] = useState<number | null>(null);
  const [pickupFees, setPickupFees] = useState<Record<number, string>>({ 0: '$0.00' });
  const [deliveryFees, setDeliveryFees] = useState<Record<number, string>>({ 0: '$0.00' });
  const [makeRequired, setMakeRequired] = useState(false);
  const [allowMultipleOptions, setAllowMultipleOptions] = useState(false);
  const [allowMultipleSame, setAllowMultipleSame] = useState(false);
  const [allowFreeOptions, setAllowFreeOptions] = useState(false);
  const [timing, setTiming] = useState('All Day');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setOptions(['']);
      setItemSearch('');
      setSelectedItems([]);
      setOpenMoreIdx(null);
      setPickupFees({ 0: '$0.00' });
      setDeliveryFees({ 0: '$0.00' });
    }
  }, [isOpen]);

  const filteredMenuItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return menuItems;
    return menuItems.filter(item => item.name.toLowerCase().includes(query));
  }, [itemSearch, menuItems]);

  const addItem = (item: MenuItemRef) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setItemSearch('');
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const updateOptionAt = (idx: number, value: string) => {
    setOptions(opts => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  const addOptionField = () => setOptions(opts => [...opts, '']);

  const removeOptionAt = (idx: number) => setOptions(opts => opts.filter((_, i) => i !== idx));

  const handleCreate = () => {
    const cleanName = name.trim();
    const cleanOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (!cleanName || cleanOptions.length === 0) return;

    const usedIn = selectedItems.map(item => ({ id: item.id, name: item.name }));

    onCreate({
      name: cleanName,
      options: cleanOptions,
      usedIn,
      timing,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 -top-6">
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 top-6 bg-white overflow-hidden rounded-t-3xl">
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 z-30 bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-[#191919ff]"/>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Create new modifier</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="rounded-[28px] bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Create modifier
              </button>
            </div>
          </div>

          <div className="px-6 mb-6 mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create new modifier</h1>
              <p className="text-sm text-gray-600">
                You can edit the availability of this modifier after saving.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Modifier details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Modifier details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Salt & Pepper"
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Items</label>
                  <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                    <select
                      value={timing}
                      onChange={e => setTiming(e.target.value)}
                      className="rounded-md px-2 py-1 bg-white text-[#191919ff] text-sm font-semibold"
                    >
                      <option>All Day</option>
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                    </select>
                  </div>
                    <div className="rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 relative">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          className="w-full text-sm outline-none"
                          placeholder="Add to items"
                          value={itemSearch}
                          onChange={e => setItemSearch(e.target.value)}
                        />
                        {itemSearch && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto z-20">
                            {filteredMenuItems.length === 0 ? (
                              <div className="px-3 py-3 text-sm text-gray-500">No items found.</div>
                            ) : (
                              filteredMenuItems.map((item, idx) => (
                                <button
                                  key={`${item.id}-${idx}`}
                                  onClick={() => addItem(item)}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left"
                                >
                                  <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      onError={e => {
                                        e.currentTarget.src = '/placeholder.jpg';
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{item.category}</div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <div className="divide-y divide-gray-100">
                        {selectedItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-3 py-2 bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.currentTarget.src = '/placeholder.jpg';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm"
                              style={{ color: '#191919' }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                  <span className="text-sm text-gray-500">Price setting: Individual</span>
                </div>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={idx} className="rounded-lg px-0 py-2 space-y-3 relative">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{idx + 1}.</span>
                        <Input
                          value={opt}
                          onChange={e => updateOptionAt(idx, e.target.value)}
                          placeholder="Option name"
                          className="flex-1"
                        />
                        <div className="relative">
                          <button
                            onClick={() => setOpenMoreIdx(openMoreIdx === idx ? null : idx)}
                            className="p-2 rounded-full hover:bg-gray-100"
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </button>
                          {openMoreIdx === idx && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                              {options.length > 1 && (
                                <button
                                  onClick={() => {
                                    removeOptionAt(idx);
                                    setOpenMoreIdx(null);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                  style={{ color: '#191919' }}
                                >
                                  Remove option
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500">Pickup</label>
                          <Input
                            value={pickupFees[idx] ?? '$0.00'}
                            onChange={e =>
                              setPickupFees(fees => ({ ...fees, [idx]: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Delivery</label>
                          <Input
                            value={deliveryFees[idx] ?? '$0.00'}
                            onChange={e =>
                              setDeliveryFees(fees => ({ ...fees, [idx]: e.target.value }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addOptionField}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4" />
                  Add another option
                </button>
              </div>

              {/* Rules */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-gray-900">Rules</h3>
                <div className="space-y-3 text-sm">
                  <RuleToggle
                    label="Make modifier required"
                    value={makeRequired}
                    onToggle={() => setMakeRequired(v => !v)}
                  />
                  <RuleToggle
                    label="Customers can select multiple options"
                    value={allowMultipleOptions}
                    onToggle={() => setAllowMultipleOptions(v => !v)}
                  />
                  <RuleToggle
                    label="Customers can select multiple of the same option"
                    value={allowMultipleSame}
                    onToggle={() => setAllowMultipleSame(v => !v)}
                  />
                  <RuleToggle
                    label="Allow free options"
                    value={allowFreeOptions}
                    onToggle={() => setAllowFreeOptions(v => !v)}
                  />
                </div>
              </div>
            </div>

            {/* Preview (right column) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
              <div className="text-xs text-gray-500">
                An example of how your modifier will appear to customers. For illustrative purposes only.
              </div>
              <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden pointer-events-none select-none">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {selectedItems[0]?.image ? (
                    <img
                      src={selectedItems[0].image}
                      alt={selectedItems[0].name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  ) : null}
                </div>
                <div className="p-4 space-y-3">
                  {selectedItems[0]?.name ? (
                    <div className="text-base font-semibold text-gray-900">{selectedItems[0].name}</div>
                  ) : null}
                  <div className="space-y-2">
                    {name ? (
                      <div className="text-sm font-semibold text-gray-900">{name}</div>
                    ) : null}
                    {options.find(opt => opt.trim()) ? (
                      <div className={`text-xs ${makeRequired ? 'text-amber-600' : 'text-gray-600'}`}>
                        {makeRequired
                          ? 'Required • Select 1'
                          : allowMultipleOptions
                            ? 'Optional'
                            : 'Optional • Select up to 1'}
                      </div>
                    ) : null}
                    {options.find(opt => opt.trim()) ? (
                      <div className="flex items-center gap-2 text-sm text-gray-800">
                        <span
                          className={`inline-flex items-center justify-center h-4 w-4 border ${
                            allowMultipleOptions || !makeRequired ? 'rounded-sm' : 'rounded-full'
                          } ${makeRequired ? 'border-amber-600' : 'border-gray-400'}`}
                        />
                        <span>{options.find(opt => opt.trim())}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RuleToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          value ? 'bg-green-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            value ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
        <span className="sr-only">{value ? 'Yes' : 'No'}</span>
      </button>
    </div>
  );
}


