'use client'
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import OnboardingLayout from "@/components/merchant/OnboardingLayout"
import OrderMethodStep from "./order-method"
import StoreHoursStep from "./store-hours"
import MenuStep from "./menu"
import PricingStep from "./pricing"
import PayoutStep from "./payout"

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const step = searchParams.get('step') || 'order-protocol'

  // Get completed steps from localStorage or default
  const getCompletedSteps = (): string[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('merchant.onboarding.completedSteps')
    return stored ? JSON.parse(stored) : []
  }

  const completedSteps = getCompletedSteps()

  // Redirect to first incomplete step if accessing a locked step
  useEffect(() => {
    const steps = ['order-protocol', 'hours', 'menu', 'pricing', 'payout']
    const currentIndex = steps.indexOf(step)
    
    if (currentIndex > completedSteps.length) {
      const nextStep = steps[completedSteps.length] || 'order-protocol'
      router.replace(`/merchant/onboarding?step=${nextStep}`)
    }
  }, [step, completedSteps.length, router])

  const renderStep = () => {
    switch (step) {
      case 'order-protocol':
        return <OrderMethodStep />
      case 'hours':
        return <StoreHoursStep />
      case 'menu':
        return <MenuStep />
      case 'pricing':
        return <PricingStep />
      case 'payout':
        return <PayoutStep />
      default:
        return <OrderMethodStep />
    }
  }

  return (
    <OnboardingLayout currentStep={step} completedSteps={completedSteps}>
      {renderStep()}
    </OnboardingLayout>
  )
}

