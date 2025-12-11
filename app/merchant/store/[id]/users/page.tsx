'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Search, ChevronRight, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMerchantUsersStore } from '@/store/merchant-users-store';
import { useMerchantPersistedState } from '@/lib/hooks/useMerchantPersistedState';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

interface MerchantStoreInfo {
  id: string;
  name: string;
}

export default function MerchantUsersPage() {
  const params = useParams();
  const currentStoreId = params.id as string;
  const { currentMerchant } = useMerchantAuthStore();

  const [searchValue, setSearchValue] = useMerchantPersistedState('users', 'search', 'query', '');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useMerchantPersistedState(
    'users',
    'modal',
    'isOpen',
    false
  );
  const [firstName, setFirstName] = useMerchantPersistedState('users', 'form', 'firstName', '');
  const [lastName, setLastName] = useMerchantPersistedState('users', 'form', 'lastName', '');
  const [email, setEmail] = useMerchantPersistedState('users', 'form', 'email', '');
  const [selectedRole, setSelectedRole] = useMerchantPersistedState('users', 'form', 'role', '');

  // Track which stores the new user has access to
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([currentStoreId]);

  // Merchant's stores fetched from API
  const [merchantStores, setMerchantStores] = useState<MerchantStoreInfo[]>([]);

  const { users, addUser } = useMerchantUsersStore();

  // Fetch merchant's stores on mount
  useEffect(() => {
    async function fetchMerchantStores() {
      if (!currentMerchant?.id) return;

      try {
        const response = await fetch(`/api/merchant/restaurants?merchantId=${currentMerchant.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setMerchantStores(
            result.data.map((store: any) => ({
              id: store.id,
              name: store.name,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch merchant stores:', error);
      }
    }

    fetchMerchantStores();
  }, [currentMerchant?.id]);

  // Reset selected stores when modal opens (default to current store)
  useEffect(() => {
    if (isAddUserModalOpen) {
      setSelectedStoreIds([currentStoreId]);
    }
  }, [isAddUserModalOpen, currentStoreId]);

  const toggleStoreAccess = (storeId: string) => {
    setSelectedStoreIds(prev =>
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  const handleAddUser = () => {
    if (firstName && lastName && email && selectedRole && selectedStoreIds.length > 0) {
      addUser({
        firstName,
        lastName,
        email,
        role: selectedRole,
        storeIds: selectedStoreIds,
      });
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedRole('');
      setSelectedStoreIds([currentStoreId]);
      setIsAddUserModalOpen(false);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <MerchantLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="pl-9 pr-3 py-2 w-64 border border-gray-300 rounded-md text-sm"
            />
          </div>
          {/* Add User Button */}
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Role</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Email</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">First Name</th>
              <th className="text-left font-medium px-4 py-3 text-gray-700">Last Name</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900">{user.role}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">{user.firstName}</td>
                  <td className="px-4 py-3 text-gray-600">{user.lastName}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add user</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* First Name */}
            <div>
              <Label htmlFor="first-name" className="text-sm font-medium text-gray-900 mb-2 block">
                First name
              </Label>
              <Input
                id="first-name"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="last-name" className="text-sm font-medium text-gray-900 mb-2 block">
                Last name
              </Label>
              <Input
                id="last-name"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Email Address */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Emails are tied to the user&apos;s account and cannot be edited after the user has
                been added.
              </p>
            </div>

            {/* User Role */}
            <div>
              <Label htmlFor="user-role" className="text-sm font-medium text-gray-900 mb-2 block">
                User role
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Select a role">
                    {selectedRole === 'store-operator' && 'Store operator'}
                    {selectedRole === 'store-manager' && 'Store manager'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="store-operator" className="py-3">
                    <div>
                      <div className="font-semibold text-gray-900">Store operator</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Order management access for a selection of stores
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="store-manager" className="py-3">
                    <div>
                      <div className="font-semibold text-gray-900">Store manager</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Full access to a selection of stores
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* <a href="#" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                Learn more about user roles
              </a> */}
            </div>

            {/* Store Access */}
            <div>
              <Label className="text-sm font-medium text-gray-900 mb-2 block">Store access</Label>
              <p className="text-sm text-gray-600 mb-3">
                Select which stores this user will have access to.
              </p>
              <div className="space-y-2">
                {merchantStores.length > 0 ? (
                  merchantStores.map(store => (
                    <div key={store.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id={`store-${store.id}`}
                        checked={selectedStoreIds.includes(store.id)}
                        onChange={() => toggleStoreAccess(store.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`store-${store.id}`} className="text-sm text-gray-900">
                        <div>{store.name}</div>
                        {store.id === currentStoreId && (
                          <div className="text-xs text-gray-500">Current store</div>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Loading stores...</p>
                )}
              </div>
              {selectedStoreIds.length === 0 && (
                <p className="text-xs text-red-500 mt-2">
                  Please select at least one store for the user to access.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Add user
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
