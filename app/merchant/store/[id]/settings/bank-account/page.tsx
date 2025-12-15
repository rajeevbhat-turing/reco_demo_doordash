'use client';
import { useState, useEffect } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Check, Edit, Info, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

// Helper to mask account number (show last 4 digits)
const maskAccountNumber = (num: string) => {
  if (!num || num.length < 4) return '****';
  return '*'.repeat(num.length - 4) + num.slice(-4);
};

// Helper to mask routing/transit number (show last 4 digits)
const maskRoutingNumber = (num: string) => {
  if (!num || num.length < 4) return '****';
  return '*'.repeat(num.length - 4) + num.slice(-4);
};

export default function BankAccountPage() {
  const { currentMerchant, updateBankAccount } = useMerchantAuthStore();
  const payoutData = currentMerchant?.onboardingData?.payout;
  const bankAccount = payoutData?.bankAccount;
  const company = payoutData?.company;

  // Check if onboarding is completed (either from DB or from going through onboarding flow)
  const onboardingCompleted = currentMerchant?.onboardingCompleted ?? false;

  // Check if we have detailed payout data (only available for merchants who went through signup flow)
  const hasDetailedBankInfo = !!(bankAccount?.accountNumber && bankAccount?.transitNumber);
  const hasDetailedCompanyInfo = !!company?.legalBusinessName;

  // Show verified status if onboarding is completed (even without detailed data)
  const isVerified = onboardingCompleted || hasDetailedBankInfo;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAccountNumber, setCurrentAccountNumber] = useState(
    bankAccount?.accountNumber || ''
  );
  const [currentRoutingNumber, setCurrentRoutingNumber] = useState(
    bankAccount?.transitNumber || ''
  );
  const [newAccountNumber, setNewAccountNumber] = useState(currentAccountNumber);
  const [newRoutingNumber, setNewRoutingNumber] = useState(currentRoutingNumber);
  const [currentInstitutionNumber, setCurrentInstitutionNumber] = useState(
    bankAccount?.financialInstitutionNumber || ''
  );
  const [newInstitutionNumber, setNewInstitutionNumber] = useState(currentInstitutionNumber);

  // Update state when merchant data loads
  useEffect(() => {
    if (bankAccount?.accountNumber) {
      setCurrentAccountNumber(bankAccount.accountNumber);
      setNewAccountNumber(bankAccount.accountNumber);
    }
    if (bankAccount?.transitNumber) {
      setCurrentRoutingNumber(bankAccount.transitNumber);
      setNewRoutingNumber(bankAccount.transitNumber);
    }
    if (bankAccount?.financialInstitutionNumber) {
      setCurrentInstitutionNumber(bankAccount.financialInstitutionNumber);
      setNewInstitutionNumber(bankAccount.financialInstitutionNumber);
    }
  }, [bankAccount]);

  const handleSaveChanges = () => {
    // Save bank account changes to the merchant auth store
    updateBankAccount({
      accountNumber: newAccountNumber,
      transitNumber: newRoutingNumber,
      financialInstitutionNumber: newInstitutionNumber,
    });

    // Update local state
    setCurrentAccountNumber(newAccountNumber);
    setCurrentRoutingNumber(newRoutingNumber);
    setCurrentInstitutionNumber(newInstitutionNumber);
    setIsEditModalOpen(false);
  };

  return (
    <MerchantLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank account</h1>
          <p className="text-sm text-gray-600">
            Here is where you will find a summary of your banking information.
          </p>
        </div>

        {/* Bank Account Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Bank account information</h2>
            <p className="text-sm text-gray-600">
              DashDoor only uses your bank account information to deposit payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Status */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {isVerified ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Verified</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {isVerified
                  ? 'Your bank account information has been reviewed and verified.'
                  : 'Complete onboarding to add your bank account information.'}
              </p>
            </div>

            {/* Bank Account Details */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white relative">
              {hasDetailedBankInfo && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute top-4 right-4 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
                >
                  Edit
                  <Edit className="h-4 w-4" />
                </button>
              )}
              <h3 className="text-sm font-medium text-gray-900 mb-3">Bank account</h3>
              {hasDetailedBankInfo ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Account number: </span>
                    <span className="text-gray-900 font-mono">
                      {maskAccountNumber(currentAccountNumber)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Transit number: </span>
                    <span className="text-gray-900 font-mono">
                      {maskRoutingNumber(currentRoutingNumber)}
                    </span>
                  </div>
                  {bankAccount?.financialInstitutionNumber && (
                    <div>
                      <span className="text-gray-500">Institution number: </span>
                      <span className="text-gray-900 font-mono">
                        {bankAccount.financialInstitutionNumber}
                      </span>
                    </div>
                  )}
                </div>
              ) : isVerified ? (
                <p className="text-sm text-gray-500">
                  Bank account details are on file and verified.
                </p>
              ) : (
                <p className="text-sm text-gray-500">No bank account information added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Business information</h2>
            <p className="text-sm text-gray-600">
              To process payouts, DashDoor and our payments processing partner, Stripe, are required
              to collect your business information for compliance and tax purposes.
            </p>
          </div>

          {hasDetailedCompanyInfo ? (
            <div className="space-y-4">
              {/* Verification Badge */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Verified</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your business information has been reviewed and verified.
                </p>
              </div>

              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Legal business name</span>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.legalBusinessName || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Business type</span>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.businessType || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Entity type</span>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.entityType || '-'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Business address</span>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.registeredBusinessAddress || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Number of locations</span>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.numberOfLocations || '-'}
                    </p>
                  </div>
                  {company?.gstNumber && (
                    <div>
                      <span className="text-sm text-gray-500">GST/HST number</span>
                      <p className="text-sm font-medium text-gray-900">{company.gstNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-w-md">
              <div className="flex items-center gap-2 mb-2">
                {isVerified ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Verified</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                      <AlertCircle className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Pending</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {isVerified
                  ? 'Your business information has been reviewed and verified.'
                  : 'Complete onboarding to add your business information.'}
              </p>
            </div>
          )}
        </div>

        {/* Representative Information (if available) */}
        {payoutData?.representative && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Authorized representative
              </h2>
              <p className="text-sm text-gray-600">
                The person authorized to manage this account on behalf of the business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Name</span>
                  <p className="text-sm font-medium text-gray-900">
                    {payoutData.representative.firstName} {payoutData.representative.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email</span>
                  <p className="text-sm font-medium text-gray-900">
                    {payoutData.representative.email || '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Phone</span>
                  <p className="text-sm font-medium text-gray-900">
                    {payoutData.representative.phone || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Address</span>
                  <p className="text-sm font-medium text-gray-900">
                    {payoutData.representative.personalAddress || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning if onboarding not completed */}
        {!isVerified && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Payout setup required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete the onboarding process to add your bank account and business information
                  for receiving payouts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Bank Account Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Bank account</DialogTitle>
          </DialogHeader>

          {/* Information Banner */}
          <div className="flex items-start gap-2 bg-gray-100 rounded-md p-3 mb-6">
            <Info className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              For your security, payouts to your new account will be delayed by 1 business day.
            </p>
          </div>

          <div className="space-y-6">
            {/* Current Bank Account Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Current bank account info
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-account" className="text-sm text-gray-700 mb-2 block">
                    Account number
                  </Label>
                  <Input
                    id="current-account"
                    type="text"
                    value={maskAccountNumber(currentAccountNumber)}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="current-routing" className="text-sm text-gray-700 mb-2 block">
                    Transit number
                  </Label>
                  <Input
                    id="current-routing"
                    type="text"
                    value={maskRoutingNumber(currentRoutingNumber)}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                {currentInstitutionNumber && (
                  <div>
                    <Label
                      htmlFor="current-institution"
                      className="text-sm text-gray-700 mb-2 block"
                    >
                      Institution number
                    </Label>
                    <Input
                      id="current-institution"
                      type="text"
                      value={currentInstitutionNumber}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* New Bank Account Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">New bank account info</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-account" className="text-sm text-gray-700 mb-2 block">
                    Account number
                  </Label>
                  <Input
                    id="new-account"
                    type="text"
                    value={newAccountNumber}
                    onChange={e => setNewAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                    placeholder="Enter 5-17 digits"
                    maxLength={17}
                  />
                </div>
                <div>
                  <Label htmlFor="new-institution" className="text-sm text-gray-700 mb-2 block">
                    Institution number
                  </Label>
                  <Input
                    id="new-institution"
                    type="text"
                    value={newInstitutionNumber}
                    onChange={e =>
                      setNewInstitutionNumber(e.target.value.replace(/\D/g, '').slice(0, 3))
                    }
                    placeholder="3 digits"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-routing" className="text-sm text-gray-700 mb-2 block">
                    Transit number
                  </Label>
                  <Input
                    id="new-routing"
                    type="text"
                    value={newRoutingNumber}
                    onChange={e =>
                      setNewRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 5))
                    }
                    placeholder="5 digits"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Save changes
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
