'use client';
import type React from 'react';
import OnboardingSidebar from './OnboardingSidebar';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: string;
  completedSteps?: string[];
}

export default function OnboardingLayout({
  children,
  currentStep,
  completedSteps = [],
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left navigation */}
      <OnboardingSidebar currentStep={currentStep} completedSteps={completedSteps} />

      {/* Main area */}
      <div className="ml-[240px] px-8 py-8">
        <div className="max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
