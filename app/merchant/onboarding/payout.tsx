'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PayoutStep() {
  const router = useRouter()
  
  // Bank account information
  const [accountNumber, setAccountNumber] = useState('')
  const [financialInstitutionNumber, setFinancialInstitutionNumber] = useState('')
  const [transitNumber, setTransitNumber] = useState('')
  
  // Company information
  const [legalBusinessName, setLegalBusinessName] = useState('10000 Ontario, Inc.')
  const [registeredBusinessAddress, setRegisteredBusinessAddress] = useState('')
  const [sameAsStoreAddress, setSameAsStoreAddress] = useState(false)
  const [entityType, setEntityType] = useState('')
  const [businessType, setBusinessType] = useState('LOCAL')
  const [numberOfLocations, setNumberOfLocations] = useState('')
  const [hasFranchiseeLocations, setHasFranchiseeLocations] = useState('no')
  const [gstNumber, setGstNumber] = useState('')
  
  // Representative information
  const [representativeFirstName, setRepresentativeFirstName] = useState('')
  const [representativeLastName, setRepresentativeLastName] = useState('')
  const [personalAddress, setPersonalAddress] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleBack = () => {
    router.push('/merchant/onboarding?step=pricing')
  }

  const handleFinishSetup = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    // Save to localStorage
    const completedSteps = JSON.parse(localStorage.getItem('merchant.onboarding.completedSteps') || '[]')
    if (!completedSteps.includes('payout')) {
      completedSteps.push('payout')
      localStorage.setItem('merchant.onboarding.completedSteps', JSON.stringify(completedSteps))
    }
    
    // Save payout info
    localStorage.setItem('merchant.onboarding.payoutInfo', JSON.stringify({
      bankAccount: {
        accountNumber,
        financialInstitutionNumber,
        transitNumber
      },
      company: {
        legalBusinessName,
        registeredBusinessAddress,
        sameAsStoreAddress,
        entityType,
        businessType,
        numberOfLocations,
        hasFranchiseeLocations,
        gstNumber
      },
      representative: {
        firstName: representativeFirstName,
        lastName: representativeLastName,
        personalAddress,
        dateOfBirth,
        email,
        phone
      }
    }))

    // Redirect to merchant home page
    router.push('/merchant')
  }

  const formatDateOfBirth = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as DD/MM/YYYY
    if (digits.length <= 2) {
      return digits
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
    }
  }

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as 1 (XXX) XXX-XXXX
    if (digits.length === 0) return ''
    if (digits.length <= 1) return `1 (${digits.slice(1)}`
    if (digits.length <= 4) return `1 (${digits.slice(1, 4)}`
    if (digits.length <= 7) return `1 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    return `1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
  }

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

      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Last step — verify your payout info
      </h1>
      <p className="text-gray-600 mb-12">
        Add your business and bank account info to receive payouts.
      </p>

      {/* Bank account information */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank account information</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="account-number" className="text-sm font-medium text-gray-900 mb-2 block">
              Account number
            </Label>
            <Input
              id="account-number"
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter at least 5 digits"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="financial-institution-number" className="text-sm font-medium text-gray-900 mb-2 block">
              Financial institution number
            </Label>
            <Input
              id="financial-institution-number"
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 3 digits"
              value={financialInstitutionNumber}
              onChange={(e) => setFinancialInstitutionNumber(e.target.value)}
              maxLength={3}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="transit-number" className="text-sm font-medium text-gray-900 mb-2 block">
              Transit number
            </Label>
            <Input
              id="transit-number"
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 5 digits"
              value={transitNumber}
              onChange={(e) => setTransitNumber(e.target.value)}
              maxLength={5}
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Company section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Company</h2>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="legal-business-name" className="text-sm font-medium text-gray-900 mb-2 block">
              Legal business name
            </Label>
            <Input
              id="legal-business-name"
              type="text"
              placeholder="10000 Ontario, Inc."
              value={legalBusinessName}
              onChange={(e) => setLegalBusinessName(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              This should be the exact legal business name that is registered with the Canadian government, as printed on government documentation & tax returns. Please refer to your Articles of Incorporation or Quebec's register des enterprises.
            </p>
          </div>

          <div>
            <Label htmlFor="registered-business-address" className="text-sm font-medium text-gray-900 mb-2 block">
              Registered business address
            </Label>
            <Input
              id="registered-business-address"
              type="text"
              placeholder="Enter an address"
              value={registeredBusinessAddress}
              onChange={(e) => setRegisteredBusinessAddress(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              This should be the exact business address that is registered with the Canadian government, as printed on government documentation & tax returns. Please refer to your Articles of Incorporation or Quebec's registre des entreprises.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="same-as-store-address"
              checked={sameAsStoreAddress}
              onChange={(e) => setSameAsStoreAddress(e.target.checked)}
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
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8"
              >
                <option value="">Choose your entity type</option>
                <option value="COMPANY">Company</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship / Individual</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="business-type" className="text-sm font-medium text-gray-900 mb-2 block">
              Type of business
            </Label>
            <div className="relative">
              <select
                id="business-type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8"
              >
                <option value="LOCAL">Brick and mortar</option>
                <option value="FOODTRUCK">Food truck</option>
                <option value="VIRTUAL">Virtual brand</option>
                <option value="GHOSTKITCHEN">Ghost kitchen</option>
                <option value="CHANGE_OF_OWNERSHIP">I want to change ownership of my business</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="number-of-locations" className="text-sm font-medium text-gray-900 mb-2 block">
              How many locations do you have?
            </Label>
            <div className="relative">
              <select
                id="number-of-locations"
                value={numberOfLocations}
                onChange={(e) => setNumberOfLocations(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none pr-8"
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
          </div>

          <div>
            <Label htmlFor="franchisee-locations" className="text-sm font-medium text-gray-900 mb-2 block">
              Are there franchisee locations associated with your business?
            </Label>
            <div className="relative">
              <select
                id="franchisee-locations"
                value={hasFranchiseeLocations}
                onChange={(e) => setHasFranchiseeLocations(e.target.value)}
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
              type="number"
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="Enter 9 digits"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              maxLength={9}
              className="bg-gray-50 border-gray-200"
            />
            <p className="text-xs text-gray-600 mt-2">
              The GST/HST ID provided by the Canadian Revenue Agency. This would be the first 9-digits of your business number or BN-9 (i.e. <span className="font-bold">123456789</span>RT0001).
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
              <Label htmlFor="representative-first-name" className="text-sm font-medium text-gray-900 mb-2 block">
                Representative's first name
              </Label>
              <Input
                id="representative-first-name"
                type="text"
                placeholder="Enter first name"
                value={representativeFirstName}
                onChange={(e) => setRepresentativeFirstName(e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="representative-last-name" className="text-sm font-medium text-gray-900 mb-2 block">
                Representative's last name
              </Label>
              <Input
                id="representative-last-name"
                type="text"
                placeholder="Enter last name"
                value={representativeLastName}
                onChange={(e) => setRepresentativeLastName(e.target.value)}
                className="bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <p className="text-xs text-gray-600">
            An individual able to represent your business. The representative provided must pass a soft credit check or provide documentation to prove their identity.
          </p>

          <div>
            <Label htmlFor="personal-address" className="text-sm font-medium text-gray-900 mb-2 block">
              Personal address
            </Label>
            <Input
              id="personal-address"
              type="text"
              placeholder="Enter an address"
              value={personalAddress}
              onChange={(e) => setPersonalAddress(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
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
              onChange={(e) => {
                const formatted = formatDateOfBirth(e.target.value)
                setDateOfBirth(formatted)
              }}
              maxLength={10}
              className="bg-gray-50 border-gray-200"
            />
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
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-50 border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-900 mb-2 block">
              Phone
            </Label>
            <Input
              id="phone"
              type="text"
              placeholder="1 (XXX) XXX-XXXX"
              value={phone}
              onChange={(e) => {
                const formatted = formatPhone(e.target.value)
                setPhone(formatted)
              }}
              maxLength={16}
              className="bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Agreement */}
      <div className="mb-6 space-y-6">
        <p className="text-xs text-gray-900">
          By clicking "Finish setup", I agree to{' '}
          <a
            href="https://api.pactsafe.com/v1.1/download/contracts/288103/rendered/6924e6b09210ce18af192509"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Marketplace Sign-Up Sheet
          </a>
          {' '}including the Terms of Service incorporated therein.
        </p>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agreement-checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 border-2 border-gray-900 rounded cursor-pointer"
          />
          <label htmlFor="agreement-checkbox" className="text-xs text-gray-900 cursor-pointer">
            I understand and agree to{' '}
            <a
              href="https://api.pactsafe.com/v1.1/download/contracts/288103/rendered/6924e6b09210ce18af192509"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Self Serve Merchant Sign-Up Sheet (US/CAD)
            </a>
            {' '}including the Terms of Service incorporated therein.
          </label>
        </div>
      </div>

      {/* Finish setup button */}
      <button
        onClick={handleFinishSetup}
        disabled={!agreedToTerms}
        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Finish setup
      </button>
    </div>
  )
}

