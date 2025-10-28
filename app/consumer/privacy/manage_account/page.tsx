'use client';

import { useRouter } from 'next/navigation';

export default function ManageAccountPage() {
  const router = useRouter();

  // Handles request archive functionality
  const handleRequestArchive = () => {
    router.push('/consumer/privacy/archive_request');
  };

  // Handles delete account functionality
  const handleDeleteAccount = () => {
    // Navigate to delete account page
    router.push('/consumer/privacy/delete_account');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 pt-8 pb-6 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#191919ff]">Manage Account</h1>
          </div>

          {/* Account Data Section */}
          <div className="mb-3">
            <h2 className="text-[16px] font-medium text-[#191919ff] mb-2">Account Data</h2>
            <p className="text-[#606060ff] mb-2 font-medium text-sm">
              You can request an archive of your personal information. We'll notify you when it's
              ready to download.
            </p>
            <button
              onClick={handleRequestArchive}
              className="text-red-600 font-bold transition-colors text-[16px] hover:bg-gray-100 rounded-[28px] px-3 py-2 ml-[-12px]"
            >
              Request Archive
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 mb-4"></div>

          {/* Delete Account Section */}
          <div>
            <h2 className="text-[16px] font-medium text-[#191919ff] mb-2">Delete Account</h2>
            <p className="text-[#606060ff] mb-2 font-medium text-sm">
              You can request to have your account deleted and personal information removed. If you
              have both a DashDoor and Caviar account, then the information associated with both
              will be affected to the extent we can identify that the accounts are owned by the same
              user.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="text-red-600 font-bold transition-colors text-[16px] hover:bg-gray-100 rounded-[28px] px-3 py-2 ml-[-12px]"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
