'use client'
import { Check, Lock } from "lucide-react"
import { DashDoorLogoMark } from "@/components/common/Icons"
import { useCurrentStore } from "@/lib/hooks/useCurrentStore"
import { useAllRestaurants } from "@/lib/hooks/use-restaurants"

interface OnboardingStep {
  number: number
  label: string
  step: string
  completed: boolean
  locked: boolean
}

interface OnboardingSidebarProps {
  currentStep: string
  completedSteps: string[]
}

export default function OnboardingSidebar({ currentStep, completedSteps }: OnboardingSidebarProps) {
  const { currentStoreId } = useCurrentStore()
  const { data: restaurants, isLoading } = useAllRestaurants()
  
  const currentStore = restaurants?.find(r => r.id === currentStoreId) || restaurants?.[0]

  const steps: OnboardingStep[] = [
    { number: 1, label: "Order method", step: "order-protocol", completed: completedSteps.includes("order-protocol"), locked: false },
    { number: 2, label: "Store hours", step: "hours", completed: completedSteps.includes("hours"), locked: completedSteps.length < 1 },
    { number: 3, label: "Menu", step: "menu", completed: completedSteps.includes("menu"), locked: completedSteps.length < 2 },
    { number: 4, label: "Pricing plan", step: "pricing", completed: completedSteps.includes("pricing"), locked: completedSteps.length < 3 },
    { number: 5, label: "Payout info", step: "payout", completed: completedSteps.includes("payout"), locked: completedSteps.length < 4 },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] border-r border-gray-200 bg-white">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center mb-2">
          <svg 
            aria-hidden="true" 
            width="32" 
            height="18" 
            viewBox="0 0 99.5 56.5" 
            fill="#2563EB"
            className="mr-2"
          >
            <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
          </svg>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Create new store</div>
        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-sm font-medium">
            {isLoading ? 'Loading...' : currentStore?.name || 'The Draft House'}
          </div>
          <div className="text-xs text-gray-500">Store</div>
        </div>
      </div>

      <nav className="px-2 space-y-1 mt-4">
        {steps.map((step) => {
          const isActive = currentStep === step.step
          const isCompleted = step.completed
          const isLocked = step.locked

          return (
            <div
              key={step.step}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-red-50 text-red-700"
                  : isCompleted
                  ? "text-gray-700"
                  : isLocked
                  ? "text-gray-400"
                  : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-semibold">
                    {step.number}
                  </div>
                ) : (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isLocked ? "bg-gray-200 text-gray-400" : "bg-gray-200 text-gray-600"
                  }`}>
                    {step.number}
                  </div>
                )}
                <span>{step.label}</span>
              </div>
              {isLocked && <Lock className="h-3 w-3 ml-2" />}
            </div>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium">P</span>
          </div>
          <span>Pete Njagi</span>
          <span className="ml-auto">▾</span>
        </div>
      </div>
    </aside>
  )
}

