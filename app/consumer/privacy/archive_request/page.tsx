'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleUserRound } from 'lucide-react';
import TwoStepVerificationModal from '@/components/modals/two-step-verification-modal';
import { useUserStore } from '@/store/user-store';
import { ShoppingBagIcon, SupportHistoryIcon } from '@/lib/utils/icons';

export default function ArchiveRequestPage() {
  const router = useRouter();
  const currentUser = useUserStore(state => state.currentUser);
  const [showTwoStepModal, setShowTwoStepModal] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isArchiveRequested, setIsArchiveRequested] = useState(false);

  // Handles 2-step verification success
  const handleTwoStepSuccess = () => {
    setShowTwoStepModal(false);
    setIsVerified(true);
  };

  // Handles closing 2-step verification modal
  const handleCloseTwoStepModal = () => {
    setShowTwoStepModal(false);
  };

  // Handles archive request submission
  const handleRequestArchive = () => {
    setIsArchiveRequested(true);
  };

  // Handles return to home navigation
  const handleReturnToHome = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Only show content after 2-step verification is complete */}
      {isVerified && !isArchiveRequested && (
        <div className="max-w-md w-full">
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#191919ff] mb-2">Request Archive</h1>
              <h2 className="text-[16px] font-medium text-[#191919ff]">Request Archive</h2>
            </div>

            {/* Information Sections */}
            <div>
              {/* Personal Information Section */}
              <div className="flex items-start space-x-2 pb-2 border-b border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <CircleUserRound className="h-6 w-6 text-[#191919ff]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-medium text-[#191919ff] mb-[2px]">
                    Personal information
                  </h3>
                  <p className="text-sm font-medium text-[#191919ff]">
                    Such as name, addresses and phone number
                  </p>
                </div>
              </div>

              {/* Order Information Section */}
              <div className="flex items-start space-x-2 pb-2 pt-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <div className="text-[#191919ff]">
                    <ShoppingBagIcon />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-medium text-[#191919ff] mb-[2px]">
                    Order information
                  </h3>
                  <p className="text-sm font-medium text-[#191919ff]">
                    Related to your deliveries, pickup orders and group orders
                  </p>
                </div>
              </div>

              {/* Support History Section */}
              <div className="flex items-start space-x-2 pb-2 pt-4 border-b border-gray-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  <div className="text-[#191919ff]">
                    <SupportHistoryIcon />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-medium text-[#191919ff] mb-[2px]">
                    Support history
                  </h3>
                  <p className="text-sm font-medium text-[#191919ff]">
                    Related to any customer support issues you may have submitted
                  </p>
                </div>
              </div>
            </div>

            {/* Request Archive Button */}
            <div className="mt-4">
              <button
                onClick={handleRequestArchive}
                className="w-full py-2 px-6 font-medium text-[16px] transition-colors bg-red-500 hover:bg-red-600 
                text-white rounded-[28px]"
              >
                Request Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Request Confirmation UI */}
      {isVerified && isArchiveRequested && (
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-[#191919ff] mb-4">
              Your archive is being prepared
            </h1>

            {/* Body Text */}
            <div className="mb-4">
              <p className="text-[#191919ff] text-sm font-medium mb-2">
                It will be ready within several days.
              </p>
              <p className="text-[#191919ff] text-sm font-medium">
                We&apos;ll update this page and notify you via email when it&apos;s available to
                download.
              </p>
            </div>

            {/* Return to DoorDash Button */}
            <button
              onClick={handleReturnToHome}
              className="w-full py-2 px-6 font-medium text-[16px] transition-colors bg-red-600 hover:bg-red-700 
                text-white rounded-[28px]"
            >
              Return to DoorDash
            </button>
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
