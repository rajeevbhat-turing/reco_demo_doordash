'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '@/store/user-store';
import { generateAvatarColor, isValidName } from '@/lib/utils/helperFunctions';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditProfileProps {
  onCancel?: () => void;
}

export default function EditProfile({ onCancel }: EditProfileProps) {
  const { currentUser, updateUser } = useUserStore();

  // Split name into first and last name
  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    return { firstName, lastName };
  };

  // Preprocess name: trim and remove special characters
  const preprocessName = (name: string): string => {
    // Trim and remove all special characters (keep only letters, numbers, and spaces)
    return name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  };

  const initialName = currentUser?.name || '';
  const { firstName: initialFirstName, lastName: initialLastName } = splitName(initialName);

  const [originalFirstName, setOriginalFirstName] = useState<string>(
    currentUser && Object.keys(currentUser)?.includes('firstName')
      ? currentUser?.firstName || ''
      : initialFirstName
  );
  const [originalLastName, setOriginalLastName] = useState<string>(
    currentUser && Object.keys(currentUser)?.includes('lastName')
      ? currentUser?.lastName || ''
      : initialLastName
  );

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [isRestricted, setIsRestricted] = useState(currentUser?.is_restricted || false);
  const [isSaving, setIsSaving] = useState(false);

  // Update form when currentUser changes
  useEffect(() => {
    if (currentUser?.name) {
      const { firstName: first, lastName: last } = splitName(currentUser.name);
      const fName = Object.keys(currentUser)?.includes('firstName')
        ? currentUser?.firstName || ''
        : first;
      const lName = Object.keys(currentUser)?.includes('lastName')
        ? currentUser?.lastName || ''
        : last;
      setFirstName(fName);
      setLastName(lName);
      setOriginalFirstName(fName);
      setOriginalLastName(lName);
    }
    setIsRestricted(currentUser?.is_restricted || false);
  }, [currentUser]);

  // Get user initials for avatar
  const userInitials = useMemo(() => {
    if (!currentUser) return '';
    return currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [currentUser]);

  const handleCancel = () => {
    // Reset form to original values
    if (currentUser?.name) {
      const { firstName: first, lastName: last } = splitName(currentUser.name);
      setFirstName(first);
      setLastName(last);
    }
    setIsRestricted(currentUser?.is_restricted || false);
    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      // Preprocess first name: trim and remove special characters
      let processedFirstName = preprocessName(firstName);

      // Validate first name - if not empty and invalid, use original value
      if (processedFirstName && !isValidName(processedFirstName)) {
        processedFirstName = originalFirstName;
      }

      // Preprocess last name: trim and remove special characters
      let processedLastName = preprocessName(lastName);

      // Validate last name - if not empty and invalid, use original value
      if (processedLastName && !isValidName(processedLastName)) {
        processedLastName = originalLastName;
      }

      // Combine first and last name
      let finalFullName = `${processedFirstName} ${processedLastName}`.trim();

      // If final full name is empty, use original name
      if (finalFullName?.length === 0) {
        finalFullName = currentUser?.name;
        processedFirstName = originalFirstName;
        processedLastName = originalLastName;
      }

      // Update name and restricted status if changed
      if (finalFullName !== currentUser.name || isRestricted !== currentUser.is_restricted) {
        await updateUser(currentUser.id, {
          name: finalFullName,
          is_restricted: isRestricted,
          firstName: processedFirstName,
          lastName: processedLastName,
        });
      }

      // Call onCancel to go back to profile page
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-[90px] pb-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header Actions */}
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={handleCancel}
            className="text-[#191919ff] font-bold text-sm rounded-[28px] px-3 py-1.5 hover:bg-gray-100 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-red-600 font-bold text-sm rounded-[28px] px-3 py-1.5 hover:bg-gray-100 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: generateAvatarColor(currentUser.name) }}
          >
            {userInitials}
          </div>
        </div>

        {/* Name Input Fields */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <Label htmlFor="firstName" className="text-base font-bold text-[#191919ff] mb-2 block">
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-gray-50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-transparent 
              focus-visible:border-[#191919ff]"
              placeholder={originalFirstName}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="lastName" className="text-base font-bold text-[#191919ff] mb-2 block">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-gray-50 rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 border-2 border-transparent 
              focus-visible:border-[#191919ff]"
              placeholder={originalLastName}
            />
          </div>
        </div>

        {/* Restricted Profile Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#191919ff]">Restricted profile</h3>
            <Switch
              checked={isRestricted}
              onCheckedChange={setIsRestricted}
              className="data-[state=checked]:bg-[#191919ff]"
            />
          </div>

          <div className="space-y-3 font-medium text-sm text-[#191919ff]">
            <p>
              When your profile is public, anyone can see it. Your public contributions, such as
              reviews, photos, and ratings are displayed on your profile.
            </p>
            <p>
              When your profile is restricted, it will display your first name, last initial, and
              number of contributions, but not the content of those contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
