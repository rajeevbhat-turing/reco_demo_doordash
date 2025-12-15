'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import OnboardingLayout from '@/components/merchant/OnboardingLayout';
import OrderMethodStep from './order-method';
import StoreHoursStep from './store-hours';
import PricingStep from './pricing';
import PayoutStep from './payout';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = searchParams.get('step') || 'order-protocol';
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);

  // Get completed steps from merchant auth store's onboardingStep
  // onboardingStep: 0=not started, 1=order-protocol done, 2=hours done, 3=pricing done, 4=payout done
  // Note: Menu step is skipped (out of scope)
  const completedSteps = useMemo(() => {
    const onboardingStep = currentMerchant?.onboardingStep || 0;
    const allSteps = ['order-protocol', 'hours', 'pricing', 'payout'];
    return allSteps.slice(0, onboardingStep);
  }, [currentMerchant?.onboardingStep]);

  // Redirect to first incomplete step if accessing a locked step
  useEffect(() => {
    const steps = ['order-protocol', 'hours', 'pricing', 'payout'];
    const currentIndex = steps.indexOf(step);

    // Redirect old 'menu' step to 'pricing'
    if (step === 'menu') {
      router.replace('/merchant/onboarding?step=pricing');
      return;
    }

    if (currentIndex > completedSteps.length) {
      const nextStep = steps[completedSteps.length] || 'order-protocol';
      router.replace(`/merchant/onboarding?step=${nextStep}`);
    }
  }, [step, completedSteps.length, router]);

  const renderStep = () => {
    switch (step) {
      case 'order-protocol':
        return <OrderMethodStep />;
      case 'hours':
        return <StoreHoursStep />;
      case 'pricing':
        return <PricingStep />;
      case 'payout':
        return <PayoutStep />;
      default:
        return <OrderMethodStep />;
    }
  };

  return (
    <OnboardingLayout currentStep={step} completedSteps={completedSteps}>
      {renderStep()}
    </OnboardingLayout>
  );
}
