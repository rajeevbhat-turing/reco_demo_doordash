'use client';

import { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMerchantModifiersStore } from '@/store/merchant-modifiers-store';
import { useMerchantPersistedState } from '@/lib/hooks/useMerchantPersistedState';
import { useMerchantMenuStore } from '@/store/merchant-menu-store';
import { useGlobalContext } from '@/app/global-context';
import CreateModifierModal from '@/components/merchant/modals/CreateModifierModal';
import ConfirmModal from '@/components/merchant/modals/ConfirmModal';
import type { ModifierStatus } from '@/constants/merchant-store-data';

export default function ModifiersTab() {
  const { modifiers, deleteModifier, addModifier, updateModifier } = useMerchantModifiersStore();
  const { categories: menuCategories } = useMerchantMenuStore();
  const { setSnackbar } = useGlobalContext();

  const [searchValue, setSearchValue] = useMerchantPersistedState(
    'menu',
    'modifiers',
    'searchQuery',
    ''
  );
  const [selectedTiming, setSelectedTiming] = useMerchantPersistedState(
    'menu',
    'modifiers',
    'selectedTiming',
    'All Day'
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModifierId, setEditingModifierId] = useState<string | null>(null);
  const [pendingDeleteModifier, setPendingDeleteModifier] = useState<string | null>(null);

  const filteredModifiers = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const timingFiltered = modifiers.filter(modifier =>
      selectedTiming === 'All Day' ? true : modifier.timing === selectedTiming
    );

    if (!query) return timingFiltered;

    return timingFiltered.filter(modifier => {
      const usedInNames = modifier.usedIn.map(ref => ref.name);
      const values = [modifier.name, ...modifier.options, ...usedInNames].join(' ').toLowerCase();
      return values.includes(query);
    });
  }, [modifiers, searchValue, selectedTiming]);

  const menuItems = useMemo(
    () =>
      menuCategories.flatMap(category =>
        category.items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          category: category.name,
        }))
      ),
    [menuCategories]
  );

  // Handle create modifier
  const handleCreate = (payload: {
    name: string;
    options: string[];
    usedIn: Array<{ id: string; name: string }>;
    timing: string;
    required: boolean;
    allowMultipleOptions: boolean;
    allowMultipleSameOption: boolean;
    allowFreeOptions: boolean;
  }) => {
    addModifier({
      id: `modifier-${Date.now()}`,
      name: payload.name,
      options: payload.options,
      usedIn: payload.usedIn,
      timing: payload.timing,
      required: payload.required,
      allowMultipleOptions: payload.allowMultipleOptions,
      allowMultipleSameOption: payload.allowMultipleSameOption,
      allowFreeOptions: payload.allowFreeOptions,
      status: 'In stock',
    });
    setSnackbar({ message: 'Modifier has been created', autoHideDuration: 3000 });
    setIsCreateOpen(false);
  };

  // Handle update modifier
  const handleSave = (
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
  ) => {
    updateModifier(modifierId, {
      name: payload.name,
      options: payload.options,
      usedIn: payload.usedIn,
      timing: payload.timing,
      required: payload.required,
      allowMultipleOptions: payload.allowMultipleOptions,
      allowMultipleSameOption: payload.allowMultipleSameOption,
      allowFreeOptions: payload.allowFreeOptions,
      status: payload.status,
    });
    setSnackbar({ message: 'Modifier updated', autoHideDuration: 3000 });
    setEditingModifierId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Search for a modifier"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTiming}
            onChange={e => setSelectedTiming(e.target.value)}
            className="rounded-[28px] border border-gray-300 bg-white px-3 py-2 text-sm text-[#191919ff] font-medium"
          >
            <option>All Day</option>
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-[28px] bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <Plus className="h-4 w-4" />
            New Modifier
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <CreateModifierModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          menuItems={menuItems}
          onCreate={handleCreate}
        />
      )}
      {editingModifierId && (
        <CreateModifierModal
          isOpen={!!editingModifierId}
          onClose={() => setEditingModifierId(null)}
          menuItems={menuItems}
          mode="edit"
          modifier={modifiers.find(m => m.id === editingModifierId)}
          onSave={handleSave}
          onDelete={id => {
            deleteModifier(id);
            setSnackbar({ message: 'Modifier deleted', autoHideDuration: 3000 });
            setEditingModifierId(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDeleteModifier}
        title="Delete modifier?"
        description="This will remove the modifier and its options."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteModifier(null)}
        onConfirm={() => {
          if (pendingDeleteModifier) {
            deleteModifier(pendingDeleteModifier);
            setPendingDeleteModifier(null);
          }
        }}
      />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Options
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Used In
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredModifiers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No modifiers found.
                </td>
              </tr>
            ) : (
              filteredModifiers.map(modifier => (
                <tr key={modifier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{modifier.name}</td>
                  <td className="px-4 py-3 text-gray-600">{modifier.options.join(', ')}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {modifier.usedIn.length > 0
                      ? modifier.usedIn.map(ref => ref.name).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          modifier.status === 'In stock' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {modifier.status}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="rounded p-1.5 text-gray-400 transition hover:text-gray-700"
                        aria-label="Edit modifier"
                        onClick={() => setEditingModifierId(modifier.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPendingDeleteModifier(modifier.id)}
                        className="rounded p-1.5 text-gray-400 transition hover:text-red-600"
                        aria-label="Delete modifier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredModifiers.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            Showing {filteredModifiers.length} of {modifiers.length} modifiers
          </div>
        )}
      </div>
    </div>
  );
}
