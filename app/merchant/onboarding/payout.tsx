'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';
import { formatPhoneNumber, validatePhoneNumber } from '@/lib/utils/phone-validation';

export default function PayoutStep() {
  const router = useRouter();
  const saveOnboardingPayout = useMerchantAuthStore(state => state.saveOnboardingPayout);
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);

  // Bank account information
  const [accountNumber, setAccountNumber] = useState('');
  const [financialInstitutionNumber, setFinancialInstitutionNumber] = useState('');
  const [transitNumber, setTransitNumber] = useState('');

  // Company information
  const [legalBusinessName, setLegalBusinessName] = useState('');
  const [registeredBusinessAddress, setRegisteredBusinessAddress] = useState('');
  const [sameAsStoreAddress, setSameAsStoreAddress] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [businessType, setBusinessType] = useState('LOCAL');
  const [numberOfLocations, setNumberOfLocations] = useState('');
  const [hasFranchiseeLocations, setHasFranchiseeLocations] = useState('no');
  const [gstNumber, setGstNumber] = useState('');

  // Representative information
  const [representativeFirstName, setRepresentativeFirstName] = useState('');
  const [representativeLastName, setRepresentativeLastName] = useState('');
  const [personalAddress, setPersonalAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mark field as touched on blur
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Clear error for a field if value becomes valid
  const clearErrorIfValid = (field: string, value: string) => {
    if (!errors[field]) return;

    let isValid = false;
    switch (field) {
      case 'accountNumber':
        isValid = value.length >= 5 && /^\d+$/.test(value);
        break;
      case 'financialInstitutionNumber':
        isValid = value.length === 3 && /^\d+$/.test(value);
        break;
      case 'transitNumber':
        isValid = value.length === 5 && /^\d+$/.test(value);
        break;
      case 'legalBusinessName':
        isValid = value.trim().length > 0;
        break;
      case 'registeredBusinessAddress':
        isValid = sameAsStoreAddress || value.trim().length > 0;
        break;
      case 'entityType':
      case 'numberOfLocations':
        isValid = value.length > 0;
        break;
      case 'gstNumber':
        isValid = value.length === 9 && /^\d+$/.test(value);
        break;
      case 'representativeFirstName':
      case 'representativeLastName':
        isValid = value.trim().length > 0 && /^[a-zA-Z\s\-']+$/.test(value);
        break;
      case 'personalAddress':
        isValid = value.trim().length > 0;
        break;
      case 'dateOfBirth':
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
          const [day, month, year] = value.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          const now = new Date();
          if (
            date.getDate() === day &&
            date.getMonth() === month - 1 &&
            date.getFullYear() === year &&
            date <= now
          ) {
            const age = Math.floor(
              (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            );
            isValid = age >= 18 && age <= 120;
          }
        }
        break;
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'phone':
        isValid = validatePhoneNumber(value, 'US').isValid;
        break;
    }

    if (isValid) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate individual field
  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'accountNumber':
        if (!accountNumber.trim()) {
          newErrors.accountNumber = 'Account number is required';
        } else if (accountNumber.length < 5) {
          newErrors.accountNumber = 'Account number must be at least 5 digits';
        } else if (!/^\d+$/.test(accountNumber)) {
          newErrors.accountNumber = 'Account number must contain only digits';
        } else {
          delete newErrors.accountNumber;
        }
        break;
      case 'financialInstitutionNumber':
        if (!financialInstitutionNumber.trim()) {
          newErrors.financialInstitutionNumber = 'Financial institution number is required';
        } else if (financialInstitutionNumber.length !== 3) {
          newErrors.financialInstitutionNumber = 'Must be exactly 3 digits';
        } else if (!/^\d+$/.test(financialInstitutionNumber)) {
          newErrors.financialInstitutionNumber = 'Must contain only digits';
        } else {
          delete newErrors.financialInstitutionNumber;
        }
        break;
      case 'transitNumber':
        if (!transitNumber.trim()) {
          newErrors.transitNumber = 'Transit number is required';
        } else if (transitNumber.length !== 5) {
          newErrors.transitNumber = 'Must be exactly 5 digits';
        } else if (!/^\d+$/.test(transitNumber)) {
          newErrors.transitNumber = 'Must contain only digits';
        } else {
          delete newErrors.transitNumber;
        }
        break;
      case 'legalBusinessName':
        if (!legalBusinessName.trim()) {
          newErrors.legalBusinessName = 'Legal business name is required';
        } else {
          delete newErrors.legalBusinessName;
        }
        break;
      case 'registeredBusinessAddress':
        if (!sameAsStoreAddress && !registeredBusinessAddress.trim()) {
          newErrors.registeredBusinessAddress = 'Registered business address is required';
        } else {
          delete newErrors.registeredBusinessAddress;
        }
        break;
      case 'entityType':
        if (!entityType) {
          newErrors.entityType = 'Entity type is required';
        } else {
          delete newErrors.entityType;
        }
        break;
      case 'numberOfLocations':
        if (!numberOfLocations) {
          newErrors.numberOfLocations = 'Number of locations is required';
        } else {
          delete newErrors.numberOfLocations;
        }
        break;
      case 'gstNumber':
        if (!gstNumber.trim()) {
          newErrors.gstNumber = 'GST number is required';
        } else if (gstNumber.length !== 9) {
          newErrors.gstNumber = 'GST number must be exactly 9 digits';
        } else if (!/^\d+$/.test(gstNumber)) {
          newErrors.gstNumber = 'GST number must contain only digits';
        } else {
          delete newErrors.gstNumber;
        }
        break;
      case 'representativeFirstName':
        if (!representativeFirstName.trim()) {
          newErrors.representativeFirstName = 'First name is required';
        } else if (!/^[a-zA-Z\s\-']+$/.test(representativeFirstName)) {
          newErrors.representativeFirstName = 'First name contains invalid characters';
        } else {
          delete newErrors.representativeFirstName;
        }
        break;
      case 'representativeLastName':
        if (!representativeLastName.trim()) {
          newErrors.representativeLastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s\-']+$/.test(representativeLastName)) {
          newErrors.representativeLastName = 'Last name contains invalid characters';
        } else {
          delete newErrors.representativeLastName;
        }
        break;
      case 'personalAddress':
        if (!personalAddress.trim()) {
          newErrors.personalAddress = 'Personal address is required';
        } else {
          delete newErrors.personalAddress;
        }
        break;
      case 'dateOfBirth':
        if (!dateOfBirth.trim()) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
          newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
        } else {
          // Validate the actual date
          const [day, month, year] = dateOfBirth.split('/').map(Number);
          const date = new Date(year, month - 1, day);
          const now = new Date();
          const minAge = 18;
          const maxAge = 120;

          if (
            date.getDate() !== day ||
            date.getMonth() !== month - 1 ||
            date.getFullYear() !== year
          ) {
            newErrors.dateOfBirth = 'Please enter a valid date';
          } else if (date > now) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
          } else {
            const age = Math.floor(
              (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
            );
            if (age < minAge) {
              newErrors.dateOfBirth = 'You must be at least 18 years old';
            } else if (age > maxAge) {
              newErrors.dateOfBirth = 'Please enter a valid date of birth';
            } else {
              delete newErrors.dateOfBirth;
            }
          }
        }
        break;
      case 'email':
        if (!email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          const phoneValidation = validatePhoneNumber(phone, 'US');
          if (!phoneValidation.isValid) {
            newErrors.phone = phoneValidation.error || 'Please enter a valid phone number';
          } else {
            delete newErrors.phone;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Error for terms checkbox
  const [termsError, setTermsError] = useState('');

  // Validate all fields and return whether form is valid
  const validateAllFields = (): boolean => {
    const allFields = [
      'accountNumber',
      'financialInstitutionNumber',
      'transitNumber',
      'legalBusinessName',
      'registeredBusinessAddress',
      'entityType',
      'numberOfLocations',
      'gstNumber',
      'representativeFirstName',
      'representativeLastName',
      'personalAddress',
      'dateOfBirth',
      'email',
      'phone',
    ];

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    allFields.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Build new errors object
    const newErrors: Record<string, string> = {};

    // Validate each field manually to build errors object
    // Bank account
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (accountNumber.length < 5) {
      newErrors.accountNumber = 'Account number must be at least 5 digits';
    } else if (!/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = 'Account number must contain only digits';
    }

    if (!financialInstitutionNumber.trim()) {
      newErrors.financialInstitutionNumber = 'Financial institution number is required';
    } else if (financialInstitutionNumber.length !== 3) {
      newErrors.financialInstitutionNumber = 'Must be exactly 3 digits';
    } else if (!/^\d+$/.test(financialInstitutionNumber)) {
      newErrors.financialInstitutionNumber = 'Must contain only digits';
    }

    if (!transitNumber.trim()) {
      newErrors.transitNumber = 'Transit number is required';
    } else if (transitNumber.length !== 5) {
      newErrors.transitNumber = 'Must be exactly 5 digits';
    } else if (!/^\d+$/.test(transitNumber)) {
      newErrors.transitNumber = 'Must contain only digits';
    }

    // Company
    if (!legalBusinessName.trim()) {
      newErrors.legalBusinessName = 'Legal business name is required';
    }

    if (!sameAsStoreAddress && !registeredBusinessAddress.trim()) {
      newErrors.registeredBusinessAddress = 'Registered business address is required';
    }

    if (!entityType) {
      newErrors.entityType = 'Entity type is required';
    }

    if (!numberOfLocations) {
      newErrors.numberOfLocations = 'Number of locations is required';
    }

    if (!gstNumber.trim()) {
      newErrors.gstNumber = 'GST number is required';
    } else if (gstNumber.length !== 9) {
      newErrors.gstNumber = 'GST number must be exactly 9 digits';
    } else if (!/^\d+$/.test(gstNumber)) {
      newErrors.gstNumber = 'GST number must contain only digits';
    }

    // Representative
    if (!representativeFirstName.trim()) {
      newErrors.representativeFirstName = 'First name is required';
    } else if (!/^[a-zA-Z\s\-']+$/.test(representativeFirstName)) {
      newErrors.representativeFirstName = 'First name contains invalid characters';
    }

    if (!representativeLastName.trim()) {
      newErrors.representativeLastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s\-']+$/.test(representativeLastName)) {
      newErrors.representativeLastName = 'Last name contains invalid characters';
    }

    if (!personalAddress.trim()) {
      newErrors.personalAddress = 'Personal address is required';
    }

    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
    } else {
      const [day, month, year] = dateOfBirth.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const now = new Date();
      if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (date > now) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else {
        const age = Math.floor((now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) {
          newErrors.dateOfBirth = 'You must be at least 18 years old';
        } else if (age > 120) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        }
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneValidation = validatePhoneNumber(phone, 'US');
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error || 'Please enter a valid phone number';
      }
    }

    // Terms checkbox
    if (!agreedToTerms) {
      setTermsError('Please agree to the terms and conditions');
    } else {
      setTermsError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && agreedToTerms;
  };

  // Error display component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-2 mt-1 text-[#b71000]">
        <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
          <span className="text-white text-[10px] font-bold">!</span>
        </div>
        <span className="text-xs font-medium">{error}</span>
      </div>
    );
  };

  const handleBack = () => {
    router.push('/merchant/onboarding?step=pricing');
  };

  const handleFinishSetup = () => {
    // Validate all fields first
    const isValid = validateAllFields();
    if (!isValid) {
      return;
    }

    // Save payout info to merchant auth store (also marks onboarding as complete)
    saveOnboardingPayout({
      bankAccount: {
        accountNumber,
        financialInstitutionNumber,
        transitNumber,
      },
      company: {
        legalBusinessName,
        registeredBusinessAddress,
        sameAsStoreAddress,
        entityType,
        businessType,
        numberOfLocations,
        hasFranchiseeLocations,
        gstNumber,
      },
      representative: {
        firstName: representativeFirstName,
        lastName: representativeLastName,
        personalAddress,
        dateOfBirth,
        email,
        phone,
      },
    });

    // Redirect to merchant store page
    router.push(`/merchant/store/${currentMerchant?.primaryStoreId || '1'}`);
  };

  const formatDateOfBirth = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as DD/MM/YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
  };

  // Format phone number using the standard US format (XXX) XXX-XXXX
  const formatPhone = (value: string) => {
    return formatPhoneNumber(value, 'US');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
          <ChevronLeft className="h-4 w-4" />
        </div>
        <span>Back</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Last step — verify your payout info</h1>
      <p className="text-gray-600 mb-12">
        Add your business and bank account info to receive payouts.
      </p>

      {/* Bank account information */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank account information</h2>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="account-number"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Account number
            </Label>
            <Input
              id="account-number"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter at least 5 digits"
              value={accountNumber}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '');
                setAccountNumber(value);
                clearErrorIfValid('accountNumber', value);
              }}
              onBlur={() => handleBlur('accountNumber')}
              className={`bg-gray-50 ${touched.accountNumber && errors.accountNumber ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.accountNumber && <ErrorMessage error={errors.accountNumber} />}
          </div>

          <div>
            <Label
              htmlFor="financial-institution-number"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Financial institution number
            </Label>
            <Input
              id="financial-institution-number"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 3 digits"
              value={financialInstitutionNumber}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                setFinancialInstitutionNumber(value);
                clearErrorIfValid('financialInstitutionNumber', value);
              }}
              onBlur={() => handleBlur('financialInstitutionNumber')}
              maxLength={3}
              className={`bg-gray-50 ${touched.financialInstitutionNumber && errors.financialInstitutionNumber ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.financialInstitutionNumber && (
              <ErrorMessage error={errors.financialInstitutionNumber} />
            )}
          </div>

          <div>
            <Label
              htmlFor="transit-number"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Transit number
            </Label>
            <Input
              id="transit-number"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 5 digits"
              value={transitNumber}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                setTransitNumber(value);
                clearErrorIfValid('transitNumber', value);
              }}
              onBlur={() => handleBlur('transitNumber')}
              maxLength={5}
              className={`bg-gray-50 ${touched.transitNumber && errors.transitNumber ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.transitNumber && <ErrorMessage error={errors.transitNumber} />}
          </div>
        </div>
      </div>

      {/* Company section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Company</h2>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="legal-business-name"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Legal business name
            </Label>
            <Input
              id="legal-business-name"
              type="text"
              placeholder="10000 Ontario, Inc."
              value={legalBusinessName}
              onChange={e => {
                const value = e.target.value;
                setLegalBusinessName(value);
                clearErrorIfValid('legalBusinessName', value);
              }}
              onBlur={() => handleBlur('legalBusinessName')}
              className={`bg-gray-50 ${touched.legalBusinessName && errors.legalBusinessName ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.legalBusinessName && <ErrorMessage error={errors.legalBusinessName} />}
            <p className="text-xs text-gray-600 mt-2">
              This should be the exact legal business name that is registered with the Canadian
              government, as printed on government documentation & tax returns. Please refer to your
              Articles of Incorporation or Quebec&apos;s register des enterprises.
            </p>
          </div>

          <div>
            <Label
              htmlFor="registered-business-address"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Registered business address
            </Label>
            <Input
              id="registered-business-address"
              type="text"
              placeholder="Enter an address"
              value={registeredBusinessAddress}
              onChange={e => {
                const value = e.target.value;
                setRegisteredBusinessAddress(value);
                clearErrorIfValid('registeredBusinessAddress', value);
              }}
              onBlur={() => handleBlur('registeredBusinessAddress')}
              disabled={sameAsStoreAddress}
              className={`bg-gray-50 ${touched.registeredBusinessAddress && errors.registeredBusinessAddress ? 'border-[#b71000]' : 'border-gray-200'} ${sameAsStoreAddress ? 'opacity-50' : ''}`}
            />
            {touched.registeredBusinessAddress && (
              <ErrorMessage error={errors.registeredBusinessAddress} />
            )}
            <p className="text-xs text-gray-600 mt-2">
              This should be the exact business address that is registered with the Canadian
              government, as printed on government documentation & tax returns. Please refer to your
              Articles of Incorporation or Quebec&apos;s registre des entreprises.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="same-as-store-address"
              checked={sameAsStoreAddress}
              onChange={e => {
                setSameAsStoreAddress(e.target.checked);
                if (e.target.checked && errors.registeredBusinessAddress) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.registeredBusinessAddress;
                    return newErrors;
                  });
                }
              }}
              className="mt-1 h-4 w-4 border-2 border-gray-900 rounded"
            />
            <label htmlFor="same-as-store-address" className="text-sm text-gray-900 cursor-pointer">
              Registered business address is the same as the store address
            </label>
          </div>

          <div>
            <Label htmlFor="entity-type" className="text-sm font-medium text-gray-900 mb-2 block">
              Entity type
            </Label>
            <div className="relative">
              <select
                id="entity-type"
                value={entityType}
                onChange={e => {
                  const value = e.target.value;
                  setEntityType(value);
                  clearErrorIfValid('entityType', value);
                }}
                onBlur={() => handleBlur('entityType')}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8 ${touched.entityType && errors.entityType ? 'border-[#b71000]' : 'border-gray-200'}`}
              >
                <option value="">Choose your entity type</option>
                <option value="COMPANY">Company</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship / Individual</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {touched.entityType && <ErrorMessage error={errors.entityType} />}
          </div>

          <div>
            <Label htmlFor="business-type" className="text-sm font-medium text-gray-900 mb-2 block">
              Type of business
            </Label>
            <div className="relative">
              <select
                id="business-type"
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8"
              >
                <option value="LOCAL">Brick and mortar</option>
                <option value="FOODTRUCK">Food truck</option>
                <option value="VIRTUAL">Virtual brand</option>
                <option value="GHOSTKITCHEN">Ghost kitchen</option>
                <option value="CHANGE_OF_OWNERSHIP">
                  I want to change ownership of my business
                </option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <Label
              htmlFor="number-of-locations"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              How many locations do you have?
            </Label>
            <div className="relative">
              <select
                id="number-of-locations"
                value={numberOfLocations}
                onChange={e => {
                  const value = e.target.value;
                  setNumberOfLocations(value);
                  clearErrorIfValid('numberOfLocations', value);
                }}
                onBlur={() => handleBlur('numberOfLocations')}
                className={`w-full px-3 py-2 bg-gray-50 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8 ${touched.numberOfLocations && errors.numberOfLocations ? 'border-[#b71000]' : 'border-gray-200'}`}
              >
                <option value="">Select a number</option>
                <option value="ONE">1</option>
                <option value="TWO_FIVE">2-5</option>
                <option value="SIX_FIFTEEN">6-15</option>
                <option value="SIXTEEN_THIRTY">16-30</option>
                <option value="THIRTY_PLUS">30+</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            {touched.numberOfLocations && <ErrorMessage error={errors.numberOfLocations} />}
          </div>

          <div>
            <Label
              htmlFor="franchisee-locations"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Are there franchisee locations associated with your business?
            </Label>
            <div className="relative">
              <select
                id="franchisee-locations"
                value={hasFranchiseeLocations}
                onChange={e => setHasFranchiseeLocations(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="gst-number" className="text-sm font-medium text-gray-900 mb-2 block">
              GST number
            </Label>
            <Input
              id="gst-number"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 9 digits"
              value={gstNumber}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                setGstNumber(value);
                clearErrorIfValid('gstNumber', value);
              }}
              onBlur={() => handleBlur('gstNumber')}
              maxLength={9}
              className={`bg-gray-50 ${touched.gstNumber && errors.gstNumber ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.gstNumber && <ErrorMessage error={errors.gstNumber} />}
            <p className="text-xs text-gray-600 mt-2">
              The GST/HST ID provided by the Canadian Revenue Agency. This would be the first
              9-digits of your business number or BN-9 (i.e.{' '}
              <span className="font-bold">123456789</span>RT0001).
            </p>
          </div>
        </div>
      </div>

      {/* Representative section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Representative</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="representative-first-name"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Representative&apos;s first name
              </Label>
              <Input
                id="representative-first-name"
                type="text"
                placeholder="Enter first name"
                value={representativeFirstName}
                onChange={e => {
                  const value = e.target.value;
                  setRepresentativeFirstName(value);
                  clearErrorIfValid('representativeFirstName', value);
                }}
                onBlur={() => handleBlur('representativeFirstName')}
                className={`bg-gray-50 ${touched.representativeFirstName && errors.representativeFirstName ? 'border-[#b71000]' : 'border-gray-200'}`}
              />
              {touched.representativeFirstName && (
                <ErrorMessage error={errors.representativeFirstName} />
              )}
            </div>

            <div>
              <Label
                htmlFor="representative-last-name"
                className="text-sm font-medium text-gray-900 mb-2 block"
              >
                Representative&apos;s last name
              </Label>
              <Input
                id="representative-last-name"
                type="text"
                placeholder="Enter last name"
                value={representativeLastName}
                onChange={e => {
                  const value = e.target.value;
                  setRepresentativeLastName(value);
                  clearErrorIfValid('representativeLastName', value);
                }}
                onBlur={() => handleBlur('representativeLastName')}
                className={`bg-gray-50 ${touched.representativeLastName && errors.representativeLastName ? 'border-[#b71000]' : 'border-gray-200'}`}
              />
              {touched.representativeLastName && (
                <ErrorMessage error={errors.representativeLastName} />
              )}
            </div>
          </div>

          <p className="text-xs text-gray-600">
            An individual able to represent your business. The representative provided must pass a
            soft credit check or provide documentation to prove their identity.
          </p>

          <div>
            <Label
              htmlFor="personal-address"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Personal address
            </Label>
            <Input
              id="personal-address"
              type="text"
              placeholder="Enter an address"
              value={personalAddress}
              onChange={e => {
                const value = e.target.value;
                setPersonalAddress(value);
                clearErrorIfValid('personalAddress', value);
              }}
              onBlur={() => handleBlur('personalAddress')}
              className={`bg-gray-50 ${touched.personalAddress && errors.personalAddress ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.personalAddress && <ErrorMessage error={errors.personalAddress} />}
          </div>

          <div>
            <Label htmlFor="date-of-birth" className="text-sm font-medium text-gray-900 mb-2 block">
              Date of birth
            </Label>
            <Input
              id="date-of-birth"
              type="text"
              placeholder="DD/MM/YYYY"
              value={dateOfBirth}
              onChange={e => {
                const formatted = formatDateOfBirth(e.target.value);
                setDateOfBirth(formatted);
                clearErrorIfValid('dateOfBirth', formatted);
              }}
              onBlur={() => handleBlur('dateOfBirth')}
              maxLength={10}
              className={`bg-gray-50 ${touched.dateOfBirth && errors.dateOfBirth ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.dateOfBirth && <ErrorMessage error={errors.dateOfBirth} />}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@merchant.com"
              value={email}
              onChange={e => {
                const value = e.target.value;
                setEmail(value);
                clearErrorIfValid('email', value);
              }}
              onBlur={() => handleBlur('email')}
              className={`bg-gray-50 ${touched.email && errors.email ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.email && <ErrorMessage error={errors.email} />}
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-2 block">
              Phone
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder="(XXX) XXX-XXXX"
              value={phone}
              onChange={e => {
                const formatted = formatPhone(e.target.value);
                setPhone(formatted);
                clearErrorIfValid('phone', formatted);
              }}
              onBlur={() => handleBlur('phone')}
              maxLength={14}
              className={`bg-gray-50 ${touched.phone && errors.phone ? 'border-[#b71000]' : 'border-gray-200'}`}
            />
            {touched.phone && <ErrorMessage error={errors.phone} />}
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div className="mb-6 space-y-6">
        <p className="text-xs text-gray-900">
          By clicking &quot;Finish setup&quot;, I agree to{' '}
          {/* <a
            href="https://api.pactsafe.com/v1.1/download/contracts/288103/rendered/6924e6b09210ce18af192509"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          > */}
          Marketplace Sign-Up Sheet
          {/* </a> */} including the Terms of Service incorporated therein.
        </p>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreement-checkbox"
            checked={agreedToTerms}
            onChange={e => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) {
                setTermsError('');
              }
            }}
            className={`mt-1 h-4 w-4 border-2 rounded cursor-pointer ${termsError ? 'border-[#b71000]' : 'border-gray-900'}`}
          />
          <label htmlFor="agreement-checkbox" className="text-xs text-gray-900 cursor-pointer">
            I understand and agree to{' '}
            {/* <a
              href="https://api.pactsafe.com/v1.1/download/contracts/288103/rendered/6924e6b09210ce18af192509"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > */}
            Self Serve Merchant Sign-Up Sheet (US/CAD)
            {/* </a> */} including the Terms of Service incorporated therein.
          </label>
        </div>
        {termsError && (
          <div className="flex items-center gap-2 text-[#b71000]">
            <div className="h-4 w-4 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000]">
              <span className="text-white text-[10px] font-bold">!</span>
            </div>
            <span className="text-xs font-medium">{termsError}</span>
          </div>
        )}
      </div>

      {/* Finish setup button */}
      <button
        onClick={handleFinishSetup}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors"
      >
        Finish setup
      </button>
    </div>
  );
}
