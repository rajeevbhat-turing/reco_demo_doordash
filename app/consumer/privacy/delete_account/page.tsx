'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TwoStepVerificationModal from '@/components/modals/two-step-verification-modal';
import { useUserStore } from '@/store/user-store';
import { User } from '@/lib/types/user-types';

export default function DeleteAccountPage() {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const deleteUser = useUserStore(state => state.deleteUser);
  const [showTwoStepModal, setShowTwoStepModal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [showDeletionPage, setShowDeletionPage] = useState(false);

  // Handles 2-step verification success
  const handleTwoStepSuccess = () => {
    setShowTwoStepModal(false);
    setIsVerified(true);
  };

  // Handles closing 2-step verification modal
  const handleCloseTwoStepModal = () => {
    setShowTwoStepModal(false);
  };

  // Handles continue button - shows confirmation page
  const handleContinue = () => {
    setShowConfirmPage(true);
  };

  // Handles final delete account
  const handleDeleteAccount = () => {
    setShowDeletionPage(true);

    // Delete user from local storage immediately if exists and add the user id to the deletedUserIds array
    const userStore = localStorage.getItem('user-store');
    if (userStore) {
      const parsedUserStore = JSON.parse(userStore);
      const newUserStore = {
        ...parsedUserStore,
        state: {
          ...parsedUserStore.state,
          users: parsedUserStore.state.users.filter((user: User) => user.id !== currentUser?.id),
          currentUser: null,
          deletedUserIds: [...parsedUserStore.state.deletedUserIds, currentUser?.id],
        },
      };

      // Set new user store to local storage
      localStorage.setItem('user-store', JSON.stringify(newUserStore));
    }

    // After 3 seconds, delete user and navigate to home
    setTimeout(() => {
      // Delete user from store
      if (currentUser) {
        deleteUser(currentUser.id);
      }
      // Navigate to landing page
      router.push('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Show confirmation page after clicking Continue */}
      {isVerified && showConfirmPage && !showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-[#191919ff] mb-4">Confirm account deletion</h1>

            {/* Information */}
            <div className="mb-6">
              <p className="text-[#191919ff] font-medium text-sm mb-4">
                Are you sure you want to delete your account and customer data from DoorDash?
              </p>
              <p className="text-[#191919ff] font-medium text-sm">
                This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/consumer/privacy/manage_account')}
                className="flex-1 py-2 px-4 bg-white text-black font-medium rounded-[28px] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-[28px] transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show deletion confirmation page after clicking Delete Account */}
      {isVerified && showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-[#191919ff] mb-4">
              Your account is being deleted
            </h1>

            {/* Information */}
            <div className="mb-6">
              <p className="text-[#191919ff] font-medium text-sm mb-4">
                You will be automatically logged out. Your account will be deleted in the next few
                minutes.
              </p>
              <p className="text-[#191919ff] font-medium text-sm mb-4">
                Your customer data will also be deleted within 30 days.
              </p>
              <p className="text-[#191919ff] font-medium text-[12px]">
                Note: We may retain some information when permitted by law.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show consequences page after 2-step verification */}
      {isVerified && !showConfirmPage && !showDeletionPage && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-[#191919ff] mb-4">
              What happens when you delete your account?
            </h1>

            {/* Information */}
            <div className="mb-6">
              <p className="text-[#191919ff] text-sm font-medium mb-4">
                Your account and customer data will be permanently removed from DoorDash. Any
                credits and gift card balances will also be forfeited.
              </p>
              <p className="text-[#191919ff] text-[12px] font-medium">
                For more information on how we collect and use customer data, visit our Privacy
                Policy
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/consumer/privacy/manage_account')}
                className="flex-1 py-2 px-4 bg-white text-black font-medium rounded-[28px] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-[28px] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Verification Modal */}
      <TwoStepVerificationModal
        isOpen={showTwoStepModal}
        onClose={handleCloseTwoStepModal}
        onSuccess={handleTwoStepSuccess}
        phoneNumber={`${currentUser?.country?.dialCode} ******${currentUser?.phoneNumber?.slice(
          -4
        )}`}
      />
    </div>
  );
}
