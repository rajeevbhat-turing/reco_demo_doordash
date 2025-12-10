'use client'
import { useRouter } from "next/navigation"
import { ChevronLeft, ArrowRight, MapPin, DollarSign, Sparkles, Shield, Camera, CreditCard } from "lucide-react"
import { useMerchantAuthStore } from "@/store/merchant-auth-store"

export default function PricingStep() {
  const router = useRouter()
  const saveOnboardingPricing = useMerchantAuthStore(state => state.saveOnboardingPricing)

  const handleBack = () => {
    router.push('/merchant/onboarding?step=menu')
  }

  const handleContinue = (plan: 'basic' | 'plus' | 'premier') => {
    // Save to merchant auth store
    saveOnboardingPricing({ selectedPlan: plan })

    router.push('/merchant/onboarding?step=payout')
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
        Pick a plan that works best for your business
      </h1>
      <p className="text-gray-600 mb-8">
        Enjoy all our Marketplace plans with zero payment processing fees and{' '}
        <a href="#additional-products" className="text-gray-900 underline">
          additional products
        </a>
        . Change or cancel your plan at any time.
      </p>

      {/* Plan Cards */}
      <div className="flex gap-3 mb-8">
        {/* Basic Plan */}
        <div className="flex-1 border-2 border-gray-200 rounded-lg p-5 flex flex-col">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">Basic</span>
          </div>
          <div className="mb-12 h-[60px]">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Save on cost</h3>
            <p className="text-base text-gray-600">Offer delivery and pickup to customers</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">CA$0 for 7 days, then</p>
            <p className="text-sm font-medium text-gray-900">20% commission per delivery order</p>
            <div className="h-px bg-gray-200 w-full mt-4"></div>
          </div>
          <div className="flex-1 space-y-2 mb-auto">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-900" />
              <span className="text-sm text-gray-900">Reach customers nearby</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-gray-900" />
              <span className="text-sm text-gray-900">Highest customer delivery fee</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-4">
              Without{' '}
              <span className="inline-flex items-center gap-1 text-gray-900 font-medium">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path d="M2.46687 7.00544C2.37427 7.00812 2.28439 7.04489 2.20807 7.10002C2.13174 7.15515 2.07223 7.2323 2.03671 7.32216C2.00118 7.41203 1.99117 7.51077 2.00787 7.60648C2.02456 7.70219 2.06726 7.79078 2.13081 7.86156L11.7467 17.9476C11.7713 17.9711 11.8013 17.9875 11.8337 17.9951C11.8661 18.0027 11.8999 18.0014 11.9317 17.9913C11.9634 17.9811 11.9922 17.9624 12.0151 17.9371C12.0379 17.9118 12.0541 17.8807 12.0621 17.8468L12.892 13.7259C12.8987 13.682 12.9206 13.6423 12.9535 13.6143C12.9865 13.5864 13.028 13.5723 13.0703 13.5746L16.4482 13.5631C16.731 13.573 17.0064 13.4663 17.2153 13.2657C17.4242 13.0651 17.5501 12.7865 17.566 12.4897C17.5554 12.233 17.4498 11.9908 17.2718 11.8145C17.0938 11.6383 16.8573 11.5419 16.6127 11.5459L12.9668 11.5574C12.9187 11.5588 12.8708 11.5499 12.826 11.5314C12.7812 11.5128 12.7405 11.4849 12.7062 11.4493L11.1288 9.79233C11.087 9.75146 11.058 9.6982 11.0458 9.63963C11.0335 9.58105 11.0385 9.51994 11.0601 9.46441C11.0817 9.40888 11.1188 9.36157 11.1666 9.32878C11.2144 9.29599 11.2706 9.28716 11.3277 9.28872H16.7642C17.1656 9.28872 17.5631 9.37179 17.934 9.53317C18.3049 9.69455 18.6419 9.93109 18.9258 10.2293C19.2097 10.5275 19.4349 10.8815 19.5885 11.2711C19.7421 11.6607 19.8212 12.0783 19.8212 12.5C19.8212 12.9217 19.7421 13.3393 19.5885 13.7289C19.4349 14.1185 19.2097 14.4725 18.9258 14.7707C18.6419 15.0689 18.3049 15.3054 17.934 15.4668C17.5631 15.6282 17.1656 15.7113 16.7642 15.7113V15.7207H14.6049C14.5161 15.7207 14.4394 15.7857 14.4205 15.8768L14.0309 17.7597C14.0053 17.8832 14.0949 18 14.2152 18H16.9057L16.9062 17.998C17.5453 17.9798 18.1763 17.8387 18.7678 17.5813C19.4031 17.3049 19.9803 16.8998 20.4665 16.3891C20.9526 15.8784 21.3383 15.272 21.6014 14.6048C21.8646 13.9375 22 13.2223 22 12.5C22 11.7777 21.8646 11.0625 21.6014 10.3952C21.3805 9.83496 21.0732 9.31767 20.6925 8.86385L20.6294 8.79C20.5764 8.72908 20.5221 8.66937 20.4665 8.61091C19.9803 8.10019 19.4031 7.69506 18.7678 7.41866C18.2044 7.1735 17.6051 7.03387 16.997 7.00544L16.8032 7.00015C16.7902 7.00005 16.7772 7 16.7642 7L2.46687 7.00544Z" fill="currentColor"/>
                </svg>
                <span>DashPass</span>
              </span>, your customers will pay higher fees when ordering from you.
            </p>
          </div>
          <button
            onClick={() => handleContinue('basic')}
            className="w-full py-3 border border-gray-300 rounded-full text-gray-900 font-bold hover:bg-gray-50 transition-colors"
          >
            Continue with Basic
          </button>
        </div>

        {/* Plus Plan */}
        <div className="flex-1 border-2 border-gray-200 rounded-lg p-5 flex flex-col ml-3">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">Plus</span>
          </div>
          <div className="mb-12 h-[60px]">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Reach more customers</h3>
            <p className="text-base text-gray-600">Get discovered by new customers in your area</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">CA$0 for 30 days, then</p>
            <p className="text-sm font-medium text-gray-900">25% commission per delivery order</p>
            <div className="h-px bg-gray-200 w-full mt-4"></div>
          </div>
          <div className="flex-1 space-y-2 mb-auto">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-900" />
              <span className="text-sm text-gray-900">Reach customers further away</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-gray-900" />
              <span className="text-sm text-gray-900">Lower customer delivery fee *</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-px bg-gray-200 w-full mb-4"></div>
            <div className="flex items-start gap-2">
              <svg className="h-6 w-6 text-gray-900 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                <path d="M2.46687 7.00544C2.37427 7.00812 2.28439 7.04489 2.20807 7.10002C2.13174 7.15515 2.07223 7.2323 2.03671 7.32216C2.00118 7.41203 1.99117 7.51077 2.00787 7.60648C2.02456 7.70219 2.06726 7.79078 2.13081 7.86156L11.7467 17.9476C11.7713 17.9711 11.8013 17.9875 11.8337 17.9951C11.8661 18.0027 11.8999 18.0014 11.9317 17.9913C11.9634 17.9811 11.9922 17.9624 12.0151 17.9371C12.0379 17.9118 12.0541 17.8807 12.0621 17.8468L12.892 13.7259C12.8987 13.682 12.9206 13.6423 12.9535 13.6143C12.9865 13.5864 13.028 13.5723 13.0703 13.5746L16.4482 13.5631C16.731 13.573 17.0064 13.4663 17.2153 13.2657C17.4242 13.0651 17.5501 12.7865 17.566 12.4897C17.5554 12.233 17.4498 11.9908 17.2718 11.8145C17.0938 11.6383 16.8573 11.5419 16.6127 11.5459L12.9668 11.5574C12.9187 11.5588 12.8708 11.5499 12.826 11.5314C12.7812 11.5128 12.7405 11.4849 12.7062 11.4493L11.1288 9.79233C11.087 9.75146 11.058 9.6982 11.0458 9.63963C11.0335 9.58105 11.0385 9.51994 11.0601 9.46441C11.0817 9.40888 11.1188 9.36157 11.1666 9.32878C11.2144 9.29599 11.2706 9.28716 11.3277 9.28872H16.7642C17.1656 9.28872 17.5631 9.37179 17.934 9.53317C18.3049 9.69455 18.6419 9.93109 18.9258 10.2293C19.2097 10.5275 19.4349 10.8815 19.5885 11.2711C19.7421 11.6607 19.8212 12.0783 19.8212 12.5C19.8212 12.9217 19.7421 13.3393 19.5885 13.7289C19.4349 14.1185 19.2097 14.4725 18.9258 14.7707C18.6419 15.0689 18.3049 15.3054 17.934 15.4668C17.5631 15.6282 17.1656 15.7113 16.7642 15.7113V15.7207H14.6049C14.5161 15.7207 14.4394 15.7857 14.4205 15.8768L14.0309 17.7597C14.0053 17.8832 14.0949 18 14.2152 18H16.9057L16.9062 17.998C17.5453 17.9798 18.1763 17.8387 18.7678 17.5813C19.4031 17.3049 19.9803 16.8998 20.4665 16.3891C20.9526 15.8784 21.3383 15.272 21.6014 14.6048C21.8646 13.9375 22 13.2223 22 12.5C22 11.7777 21.8646 11.0625 21.6014 10.3952C21.3805 9.83496 21.0732 9.31767 20.6925 8.86385L20.6294 8.79C20.5764 8.72908 20.5221 8.66937 20.4665 8.61091C19.9803 8.10019 19.4031 7.69506 18.7678 7.41866C18.2044 7.1735 17.6051 7.03387 16.997 7.00544L16.8032 7.00015C16.7902 7.00005 16.7772 7 16.7642 7L2.46687 7.00544Z" fill="currentColor"/>
              </svg>
              <div className="flex-1">
                <span className="text-gray-900 font-medium text-sm block mb-1">DashPass</span>
                <p className="text-sm text-gray-600 mb-2">
                  Increase your sales by accessing DashPass customers. On average, they spend more per order and order more often.
                </p>
                <button className="text-sm font-medium text-gray-900 border-b border-dashed border-gray-900">
                  Learn more
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleContinue('plus')}
            className="w-full py-3 border border-gray-300 rounded-full text-gray-900 font-bold hover:bg-gray-50 transition-colors mt-6"
          >
            Continue with Plus
          </button>
        </div>

        {/* Premier Plan */}
        <div className="flex-1 border-2 border-gray-900 rounded-lg p-5 flex flex-col ml-3 relative">
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded">
              <Sparkles className="h-3 w-3" />
              Popular
            </span>
          </div>
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600">Premier</span>
          </div>
          <div className="mb-12 h-[60px]">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Maximize sales</h3>
            <p className="text-base text-gray-600">Stand out to new customers</p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">CA$0 for 30 days, then</p>
            <p className="text-sm font-medium text-gray-900">29% commission per delivery order</p>
            <div className="h-px bg-gray-200 w-full mt-4"></div>
          </div>
          <div className="flex-1 space-y-2 mb-auto">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-gray-900" />
              <span className="text-sm text-gray-900">Reach customers further away</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-gray-900" />
              <span className="text-sm text-gray-900">Lower customer delivery fee *</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-px bg-gray-200 w-full mb-4"></div>
            <div className="flex items-start gap-2 mb-4">
              <span className="text-gray-900 font-medium text-sm">DashPass</span>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Increase your sales by accessing DashPass customers. On average, they spend more per order and order more often.
                </p>
                <button className="text-sm font-medium text-gray-900 border-b border-dashed border-gray-900">
                  Learn more
                </button>
              </div>
            </div>
            
            {/* Exclusive to Premier */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="inline-flex items-center gap-1 px-1 py-0.5 bg-blue-600 text-white text-xs font-bold rounded mb-2">
                Exclusive to Premier
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">6-month order guarantee*</p>
                  <p className="text-sm text-gray-900">
                    If you receive fewer than 20 orders in any of your first 6 months, we'll refund your entire commission for that month.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Automatic ads</p>
                  <p className="text-sm text-gray-900">
                    Sponsored listings run on your behalf, to help more customers discover your restaurant – no extra work or cost required.{' '}
                    <button className="text-sm font-bold underline">Terms apply</button>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Camera className="h-4 w-4 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">CA$200 credit towards additional photoshoot costs*</p>
                  <p className="text-sm text-gray-900 mb-2">
                    Get a free professional photoshoot plus a CA$200 credit to cover additional costs like food, styling, or setup.
                  </p>
                  <button className="text-sm font-medium text-gray-900 border-b border-dashed border-gray-900">
                    Learn more
                  </button>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-gray-900 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">25% off DashDoor Commerce Platform Pro</p>
                  <p className="text-sm text-gray-900 mb-2">
                    Grow beyond Marketplace and get commission-free orders with your own mobile app, loyalty, and CRM - all built by us.{' '}
                    <button className="text-sm font-bold underline">Terms apply</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleContinue('premier')}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors mt-6"
          >
            Continue with Premier
          </button>
        </div>
      </div>

      {/* Support Message */}
      <div className="mb-6">
        <p className="text-base text-gray-600">
          If you have any questions about your current DashDoor pricing plan,{' '}
          <a href="#" className="text-gray-900 underline font-medium">contact support</a>
        </p>
      </div>

      {/* What else is included */}
      <div id="additional-products" className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-12">What else is included in your plan</h2>
        
        <div className="grid grid-cols-4 gap-12">
          <div>
            <div className="mb-4">
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24">
                <path d="M5 12.9943C7.76116 12.9944 9.99975 15.2331 10 17.9943C10 20.7556 7.76131 22.9941 5 22.9943C2.23858 22.9943 0 20.7557 0 17.9943C0.000246359 15.2331 2.23873 12.9943 5 12.9943ZM5 14.9943C3.3433 14.9943 2.00025 16.3376 2 17.9943C2 19.6511 3.34315 20.9943 5 20.9943C6.65674 20.9941 8 19.651 8 17.9943C7.99975 16.3377 6.65659 14.9944 5 14.9943Z" fill="currentColor"/>
                <path d="M19 12.9943C21.7612 12.9944 23.9998 15.2331 24 17.9943C24 20.7556 21.7613 22.9941 19 22.9943C16.2386 22.9943 14 20.7557 14 17.9943C14.0002 15.2331 16.2387 12.9943 19 12.9943ZM19 14.9943C17.3433 14.9943 16.0002 16.3376 16 17.9943C16 19.6511 17.3431 20.9943 19 20.9943C20.6567 20.9941 22 19.651 22 17.9943C21.9998 16.3377 20.6566 14.9944 19 14.9943Z" fill="currentColor"/>
                <path d="M11.8984 6.70032C12.6394 6.12749 13.6557 6.40814 14.1152 7.10657L14.2051 7.26185L14.3105 7.46497C15.4258 9.50808 17.2642 9.99427 18 9.99427C18.5521 9.99431 18.9997 10.4422 19 10.9943C19 11.5465 18.5522 11.9942 18 11.9943C16.6981 11.9943 14.2434 11.2575 12.7109 8.69642L10.4141 10.9943L12.4141 12.9943C12.789 13.3692 12.9999 13.8781 13 14.4083V18.9943C13 19.5465 12.5522 19.9941 12 19.9943C11.4477 19.9943 11 19.5466 11 18.9943V14.4083L9 12.4083C8.21913 11.6273 8.21908 10.3612 9 9.58021L11.7441 6.83607L11.8984 6.70032Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Pickup ordering</h3>
            <p className="text-sm text-gray-600 mb-4">
              Offer a pickup option for your customers and only pay 8% commission per pickup order in the Plus and Premier plan, and 10% in the Basic plan.
            </p>
            <a href="#" className="text-base font-bold text-gray-900 inline-flex items-center gap-2">
              Learn more
              <ArrowRight className="h-6 w-6" />
            </a>
          </div>

          <div>
            <div className="mb-4">
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24">
                <path d="M15 20C15.5522 20.0001 16 20.4478 16 21C15.9999 21.5521 15.5521 21.9999 15 22H9C8.44778 22 8.0001 21.5522 8 21C8 20.4477 8.44772 20 9 20H15Z" fill="currentColor"/>
                <path d="M7 10.5C7.82831 10.5001 8.5 11.1717 8.5 12C8.4999 12.8283 7.82825 13.4999 7 13.5C6.17163 13.5 5.5001 12.8283 5.5 12C5.5 11.1716 6.17157 10.5 7 10.5Z" fill="currentColor"/>
                <path d="M17 11C17.5522 11.0001 18 11.4478 18 12C17.9999 12.5521 17.5521 12.9999 17 13H11C10.4478 13 10.0001 12.5522 10 12C10 11.4477 10.4477 11 11 11H17Z" fill="currentColor"/>
                <path d="M7 5.5C7.82831 5.50013 8.5 6.17165 8.5 7C8.4999 7.82826 7.82825 8.49987 7 8.5C6.17163 8.5 5.5001 7.82834 5.5 7C5.5 6.17157 6.17157 5.5 7 5.5Z" fill="currentColor"/>
                <path d="M17 6C17.5522 6.00013 18 6.4478 18 7C17.9999 7.55212 17.5521 7.99987 17 8H11C10.4478 8 10.0001 7.5522 10 7C10 6.44772 10.4477 6 11 6H17Z" fill="currentColor"/>
                <path d="M19 1C21.209 1.00013 23 2.79094 23 5V14C22.9999 16.209 21.209 17.9999 19 18H5C2.79092 18 1.0001 16.2091 1 14V5C1 2.79086 2.79086 1 5 1H19ZM5 3C3.89543 3 3 3.89543 3 5V14C3.0001 15.1045 3.89549 16 5 16H19C20.1044 15.9999 20.9999 15.1044 21 14V5C21 3.89551 20.1045 3.00013 19 3H5Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Commerce Platform Starter Package</h3>
            <p className="text-sm text-gray-600 mb-4">
              Grow beyond Marketplace with orders from your own website, commission-free. You only pay card processing fees.
            </p>
            <a href="#" className="text-base font-bold text-gray-900 inline-flex items-center gap-2">
              Learn more
              <ArrowRight className="h-6 w-6" />
            </a>
          </div>

          <div>
            <div className="mb-4">
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24">
                <path d="M20.3753 1.4941C21.6702 1.06258 23.0079 2.02668 23.0081 3.39156V17.665C23.0079 19.0017 21.7214 19.9617 20.4398 19.582L10.0081 16.4912V17.1757C10.0082 18.7214 10.6222 20.2039 11.7152 21.2968C12.1056 21.6873 12.1055 22.3204 11.7152 22.7109C11.3246 23.1014 10.6916 23.1014 10.3011 22.7109C8.8331 21.2429 8.00821 19.2518 8.00813 17.1757V15.8984L3.8636 14.6709C0.112275 13.5593 0.0232186 8.27855 3.73469 7.04098L20.3753 1.4941ZM10.0081 7.05758V14.4052L21.0081 17.665V3.39156L10.0081 7.05758ZM4.3675 8.93844C2.51169 9.55718 2.55629 12.1971 4.43196 12.7529L8.00813 13.8125V7.72457L4.3675 8.93844Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-4">Marketing tools</h3>
            <p className="text-sm text-gray-600 mb-4">
              Boost your sales by adding marketing tools to your business at any time
            </p>
            <a href="#" className="text-base font-bold text-gray-900 inline-flex items-center gap-2">
              Learn more
              <ArrowRight className="h-6 w-6" />
            </a>
          </div>

          <div>
            <div className="mb-4">
              <svg className="h-6 w-6 text-gray-900" fill="none" viewBox="0 0 24 24">
                <path d="M3.13072 6.11845C2.90975 4.34182 4.38184 3 5.99991 3H7.41632C8.80817 3 10.0172 3.95733 10.3364 5.3121L10.7696 7.15119C11.0886 8.50495 10.4352 9.90039 9.19122 10.5224L7.05827 11.5889C8.35601 13.7969 10.203 15.6439 12.4111 16.9416L13.4775 14.8087C14.0995 13.5647 15.495 12.9114 16.8487 13.2303L18.6878 13.6635C20.0426 13.9827 20.9999 15.1917 20.9999 16.5836V18C20.9999 19.6181 19.6581 21.0902 17.8815 20.8692C15.9312 20.6266 14.0829 20.0536 12.395 19.208C9.1121 17.5634 6.43652 14.8878 4.79187 11.6049C3.9463 9.91705 3.3733 8.06874 3.13072 6.11845ZM14.1992 17.8375C15.4335 18.3556 16.7518 18.7133 18.1283 18.8845C18.5439 18.9362 18.9999 18.5911 18.9999 18V16.5836C18.9999 16.1196 18.6808 15.7166 18.2292 15.6102L16.3901 15.177C15.9389 15.0707 15.4737 15.2885 15.2664 15.7031L14.1992 17.8375ZM6.16241 9.80072L8.29679 8.73353C8.71145 8.5262 8.92923 8.06105 8.82293 7.6098L8.38968 5.7707C8.28329 5.31911 7.88027 5 7.41632 5H5.99991C5.40885 5 5.06374 5.45597 5.11543 5.87159C5.28664 7.24809 5.64431 8.56637 6.16241 9.80072Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-4">24/7 support</h3>
            <p className="text-sm text-gray-600 mb-4">
              DashDoor offers 24/7 email and live chat support
            </p>
            <a href="#" className="text-base font-bold text-gray-900 inline-flex items-center gap-2">
              Learn more
              <ArrowRight className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer disclaimers */}
      <div className="space-y-2 text-xs text-gray-600">
        <p>* For Non-DashPass orders only</p>
        <p>
          ** Boost your sales with the CA$50 monthly rebate available for merchants in Canada on the Premier plan. Beginning on the first day of a new month after a Merchant signs up for the Premier plan, Merchants who spend CA$100 or more on ads or promotions through the DashDoor platform during a calendar month will earn a CA$50 rebate, which will be paid in the Merchant's first scheduled payout in the following month.
        </p>
      </div>
    </div>
  )
}

