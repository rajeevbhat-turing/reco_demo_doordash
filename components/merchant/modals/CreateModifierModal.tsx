'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  X,
  CircleCheck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ConfirmModal from '@/components/merchant/modals/ConfirmModal';
import type { Modifier, ModifierStatus } from '@/constants/merchant-store-data';

type MenuItemRef = {
  id: string;
  name: string;
  image: string;
  category: string;
};

type OptionRow = {
  id: string;
  name: string;
  pickup: string;
  delivery: string;
  status: ModifierStatus;
};

interface CreateModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItemRef[];
  mode?: 'create' | 'edit';
  modifier?: Modifier;
  onCreate?: (payload: {
    name: string;
    options: string[];
    usedIn: Array<{ id: string; name: string }>;
    timing: string;
    required: boolean;
    allowMultipleOptions: boolean;
    allowMultipleSameOption: boolean;
    allowFreeOptions: boolean;
  }) => void;
  onSave?: (
    modifierId: string,
    payload: {
      name: string;
      options: string[];
      usedIn: Array<{ id: string; name: string }>;
      timing: string;
      required: boolean;
      allowMultipleOptions: boolean;
      allowMultipleSameOption: boolean;
      allowFreeOptions: boolean;
      status: ModifierStatus;
    }
  ) => void;
  onDelete?: (modifierId: string) => void;
}

export default function CreateModifierModal({
  isOpen,
  onClose,
  menuItems,
  mode = 'create',
  modifier,
  onCreate,
  onSave,
  onDelete,
}: CreateModifierModalProps) {
  const isEdit = mode === 'edit' && modifier;
  const [name, setName] = useState('');
  const [status, setStatus] = useState<ModifierStatus>('In stock');
  const [options, setOptions] = useState<OptionRow[]>([
    { id: 'opt-0', name: '', pickup: '$0.00', delivery: '$0.00', status: 'In stock' },
  ]);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<MenuItemRef[]>([]);
  const [openMoreIdx, setOpenMoreIdx] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [required, setRequired] = useState(false);
  const [allowMultipleOptions, setAllowMultipleOptions] = useState(false);
  const [allowMultipleSame, setAllowMultipleSame] = useState(false);
  const [allowFreeOptions, setAllowFreeOptions] = useState(false);
  const [timing, setTiming] = useState('All Day');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriceInputs, setShowPriceInputs] = useState(mode === 'edit' ? false : true);
  const [openOptionStatusId, setOpenOptionStatusId] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ nameErr: string | null; optionsErr: string | null }>({
    nameErr: null,
    optionsErr: null,
  });

  const statusOptions: ModifierStatus[] = [
    'In stock',
    'Out of stock - 4 hours',
    'Out of stock - Today',
    'Out of stock - 1 week',
    'Out of stock - Custom',
    'Out of stock - Indefinitely',
  ];

  // Reset form when modal closes or when editing a modifier
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setStatus('In stock');
      setOptions([
        { id: 'opt-0', name: '', pickup: '$0.00', delivery: '$0.00', status: 'In stock' },
      ]);
      setItemSearch('');
      setSelectedItems([]);
      setOpenMoreIdx(null);
      setDraggingId(null);
      setRequired(false);
      setAllowMultipleOptions(false);
      setAllowMultipleSame(false);
      setAllowFreeOptions(false);
      setTiming('All Day');
      setShowPriceInputs(mode === 'edit' ? false : true);
      setOpenOptionStatusId(null);
      setErrors({ nameErr: null, optionsErr: null });
      return;
    }

    if (isEdit && modifier) {
      setName(modifier.name);
      setStatus(modifier.status ?? 'In stock');
      setOptions(
        (modifier.options || []).map((opt, idx) => ({
          id: `opt-${idx}`,
          name: opt,
          pickup: '$0.00',
          delivery: '$0.00',
          status: 'In stock',
        }))
      );
      const initialItems = modifier.usedIn
        .map(ref => {
          const match = menuItems.find(m => m.id === ref.id);
          return match || { id: ref.id, name: ref.name, image: '/placeholder.jpg', category: '' };
        })
        .filter(Boolean) as MenuItemRef[];
      setSelectedItems(initialItems);
      setRequired(!!modifier.required);
      setAllowMultipleOptions(!!modifier.allowMultipleOptions);
      setAllowMultipleSame(!!modifier.allowMultipleSameOption);
      setAllowFreeOptions(!!modifier.allowFreeOptions);
      setTiming(modifier.timing || 'All Day');
    }
  }, [isOpen, isEdit, modifier, menuItems]);

  // Filter menu items based on item search
  const filteredMenuItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    if (!query) return menuItems;
    return menuItems.filter(item => item.name.toLowerCase().includes(query));
  }, [itemSearch, menuItems]);

  // Add a menu item to selected list
  const addItem = (item: MenuItemRef) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, item];
    });
    setItemSearch('');
  };

  // Remove a selected item
  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  // Update option name
  const updateOptionName = (id: string, value: string) => {
    setOptions(opts => opts.map(opt => (opt.id === id ? { ...opt, name: value } : opt)));
  };

  // Update option stock status
  const updateOptionStatus = (id: string, value: ModifierStatus) => {
    setOptions(opts => opts.map(opt => (opt.id === id ? { ...opt, status: value } : opt)));
  };

  // Update pickup price
  const updatePickup = (id: string, value: string) => {
    setOptions(opts => opts.map(opt => (opt.id === id ? { ...opt, pickup: value } : opt)));
  };

  // Update delivery price
  const updateDelivery = (id: string, value: string) => {
    setOptions(opts => opts.map(opt => (opt.id === id ? { ...opt, delivery: value } : opt)));
  };

  // Add a new empty option row
  const addOptionField = () =>
    setOptions(opts => [
      ...opts,
      { id: `opt-${Date.now()}`, name: '', pickup: '$0.00', delivery: '$0.00', status: 'In stock' },
    ]);

  // Remove an option by id
  const removeOptionAt = (id: string) => setOptions(opts => opts.filter(opt => opt.id !== id));

  // Move an option during drag-and-drop
  const moveOption = (fromId: string, toId: string) => {
    setOptions(prev => {
      const fromIndex = prev.findIndex(opt => opt.id === fromId);
      const toIndex = prev.findIndex(opt => opt.id === toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Validate and submit create/edit payload
  const handleSubmit = () => {
    let hasError = false;
    const cleanName = name.trim();
    const cleanOptions = options.map(opt => opt.name.trim()).filter(Boolean);

    if (!cleanName) {
      setErrors(prev => ({ ...prev, nameErr: 'Name is required.' }));
      hasError = true;
    } else {
      setErrors(prev => ({ ...prev, nameErr: null }));
    }

    if (cleanOptions.length === 0) {
      setErrors(prev => ({ ...prev, optionsErr: 'Add at least one option.' }));
      hasError = true;
    } else {
      setErrors(prev => ({ ...prev, optionsErr: null }));
    }

    if (hasError) return;

    const usedIn = selectedItems.map(item => ({ id: item.id, name: item.name }));

    if (isEdit && modifier && onSave) {
      onSave(modifier.id, {
        name: cleanName,
        options: cleanOptions,
        usedIn,
        timing,
        required,
        allowMultipleOptions,
        allowMultipleSameOption: allowMultipleSame,
        allowFreeOptions,
        status,
      });
      return;
    }

    onCreate?.({
      name: cleanName,
      options: cleanOptions,
      usedIn,
      timing,
      required,
      allowMultipleOptions,
      allowMultipleSameOption: allowMultipleSame,
      allowFreeOptions,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 -top-6">
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-white overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 z-30 bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-[#191919ff]" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">
                {isEdit ? 'Edit modifier' : 'Create new modifier'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isEdit && modifier && onDelete && (
                <div className="relative">
                  <button
                    onClick={() => setShowDeleteMenu(v => !v)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </button>
                  {showDeleteMenu && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-30">
                      <button
                        onClick={() => {
                          setShowDeleteMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[#191919ff] hover:bg-gray-50"
                      >
                        Remove modifier
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleSubmit}
                className="rounded-[28px] bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                {isEdit ? 'Save changes' : 'Create modifier'}
              </button>
            </div>
          </div>

          <div
            className={`px-6 ${
              isEdit ? 'mb-3' : 'mb-6'
            } mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4`}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? name || modifier?.name || 'Modifier' : 'Create new modifier'}
              </h1>
              {!isEdit && (
                <p className="text-sm text-gray-600">
                  You can edit the availability of this modifier after saving.
                </p>
              )}
            </div>
          </div>

          {isEdit && (
            <div className="px-6 mb-6">
              <div className="rounded-lg px-0 bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {status === 'In stock' && (
                        <CircleCheck className="h-7 w-7 fill-emerald-600 text-white" />
                      )}
                      <div className="flex flex-col gap-1">
                        <span
                          className={`${
                            status === 'In stock' ? 'text-emerald-600' : 'text-amber-600'
                          } font-semibold text-base`}
                        >
                          {status}
                        </span>
                        <span className="text-sm text-gray-600 font-normal">
                          Customers can view and order this modifier during store hours.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setShowStatusMenu(v => !v)}
                      className="w-full min-w-[400px] inline-flex items-center justify-between rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-2">Manage Status</span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </button>
                    {showStatusMenu && (
                      <div className="absolute left-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-30">
                        {[
                          'In stock',
                          'Out of stock - 4 hours',
                          'Out of stock - Today',
                          'Out of stock - 1 week',
                          'Out of stock - Custom',
                          'Out of stock - Indefinitely',
                        ].map(option => (
                          <button
                            key={option}
                            onClick={() => {
                              setStatus(option as ModifierStatus);
                              setShowStatusMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Modifier details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      value={name}
                      onChange={e => {
                        const val = e.target.value;
                        setName(val);
                        if (!val.trim()) {
                          setErrors(prev => ({ ...prev, nameErr: 'Name is required.' }));
                        } else {
                          setErrors(prev => ({ ...prev, nameErr: null }));
                        }
                      }}
                      placeholder="e.g. Salt & Pepper"
                      className={`mt-1 bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                        errors.nameErr ? 'border-red-500 border-2 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.nameErr && (
                      <p className="text-xs text-red-600 mt-1">{errors.nameErr}</p>
                    )}
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
                    <div className="rounded-lg">
                      <div className="flex items-center gap-2 px-3 py-2 relative bg-gray-50 border border-transparent rounded-md focus-within:border-[#191919ff] focus-within:border-2 h-10">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          className="w-full text-sm outline-none bg-transparent"
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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                  {isEdit && !showPriceInputs && (
                    <button
                      onClick={() => setShowPriceInputs(true)}
                      className="text-sm font-semibold text-gray-700 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50"
                    >
                      Price settings: No change
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="rounded-lg px-0 py-2 space-y-3 relative"
                      draggable
                      onDragStart={() => setDraggingId(opt.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={e => {
                        e.preventDefault();
                        if (draggingId) moveOption(draggingId, opt.id);
                      }}
                    >
                      <div className="flex items-center gap-3 px-1 pt-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Input
                          value={opt.name}
                          onChange={e => {
                            updateOptionName(opt.id, e.target.value);
                            const val = e.target.value;
                            const nextNames = options.map(o => (o.id === opt.id ? val : o.name));
                            const hasAny = nextNames.some(v => v.trim());
                            setErrors(prev => ({
                              ...prev,
                              optionsErr: hasAny ? null : 'Add at least one option.',
                            }));
                          }}
                          placeholder="Option name"
                          className={`flex-1 bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            errors.optionsErr ? 'border-red-500 border-2 focus:border-red-500' : ''
                          }`}
                        />
                        {isEdit ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenOptionStatusId(prev => (prev === opt.id ? null : opt.id))
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 py-1 text-sm text-gray-700"
                            >
                              <span
                                className={`inline-block h-2.5 w-2.5 rounded-full ${
                                  opt.status === 'In stock' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                            {openOptionStatusId === opt.id && (
                              <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-30">
                                {statusOptions.map(option => (
                                  <button
                                    key={option}
                                    onClick={() => {
                                      updateOptionStatus(opt.id, option);
                                      setOpenOptionStatusId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <span
                                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                                        option === 'In stock' ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`}
                                    />
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : null}
                        {idx > 0 && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenMoreIdx(openMoreIdx === opt.id ? null : opt.id)}
                              className="p-2 rounded-full hover:bg-gray-100"
                              aria-label="More options"
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                            </button>
                            {openMoreIdx === opt.id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-30">
                                {options.length > 1 && (
                                  <button
                                    onClick={() => {
                                      removeOptionAt(opt.id);
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
                        )}
                      </div>
                      {showPriceInputs && (
                        <div className="space-y-3 px-1 pb-3">
                          <div>
                            <label className="text-xs text-gray-500">Pickup</label>
                            <Input
                              value={opt.pickup}
                              onChange={e => updatePickup(opt.id, e.target.value)}
                              className="bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Delivery</label>
                            <Input
                              value={opt.delivery}
                              onChange={e => updateDelivery(opt.id, e.target.value)}
                              className="bg-gray-50 border border-transparent focus:border-[#191919ff] focus:border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errors.optionsErr && <p className="text-xs text-red-600">{errors.optionsErr}</p>}

                <button
                  onClick={addOptionField}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4" />
                  Add another option
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-semibold text-gray-900">Rules</h3>
                <div className="space-y-3 text-sm">
                  <RuleToggle
                    label="Make modifier required"
                    value={required}
                    onToggle={() => setRequired(v => !v)}
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

            <div className={`space-y-3 ${isEdit ? '-mt-24' : ''}`}>
              <h3 className="text-sm font-semibold text-gray-900">Preview</h3>
              <div className="text-xs text-gray-500">
                An example of how your modifier will appear to customers. For illustrative purposes
                only.
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
                    <div className="text-base font-semibold text-gray-900">
                      {selectedItems[0].name}
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    {name ? (
                      <div className="text-sm font-semibold text-gray-900">{name}</div>
                    ) : null}
                    {options.find(opt => opt.name.trim()) ? (
                      <div className={`text-xs ${required ? 'text-amber-600' : 'text-gray-600'}`}>
                        {required
                          ? 'Required • Select 1'
                          : allowMultipleOptions
                          ? 'Optional'
                          : 'Optional • Select up to 1'}
                      </div>
                    ) : null}
                    {options.filter(opt => opt.name.trim()).length > 0 ? (
                      <div className="space-y-2">
                        {options
                          .filter(opt => opt.name.trim())
                          .map(opt => (
                            <div key={opt.id} className="flex items-center gap-2 text-sm text-gray-800">
                              <span
                                className={`inline-flex items-center justify-center h-4 w-4 border ${
                                  allowMultipleOptions || !required ? 'rounded-sm' : 'rounded-full'
                                } ${required ? 'border-amber-600' : 'border-gray-400'}`}
                              />
                              <span>{opt.name}</span>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEdit && modifier && onDelete && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete modifier?"
          description="This will remove the modifier and its options."
          confirmLabel="Delete"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            onDelete(modifier.id);
            setShowDeleteConfirm(false);
            onClose();
          }}
        />
      )}
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
