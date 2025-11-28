"use client"
import type React from "react"
import MerchantSidebar from "./MerchantSidebar"
import { CurrentStoreProvider } from "@/lib/hooks/useCurrentStore"

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrentStoreProvider>
      {/* suppressHydrationWarning: Content may differ between server/client due to localStorage hydration */}
      <div 
        className="min-h-screen bg-white overflow-hidden flex flex-col" 
        suppressHydrationWarning
        style={{
          fontFamily: 'DD-TTNorms, ProximaNova, "Avenir Next", Avenir, sans-serif',
        }}
      >
        {/* Left navigation */}
        <MerchantSidebar />

        {/* Main content wrapper */}
        <div 
          className="flex-1 overflow-auto"
          style={{
            marginLeft: '256px',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {/* Grid container */}
          <div
            className="flex-1"
            style={{
              margin: '0 auto',
              padding: '0 32px',
              display: 'grid',
              columnGap: '24px',
              rowGap: '24px',
              gridTemplateColumns: 'repeat(12, 1fr)',
              width: '100%',
              maxWidth: '1352px',
            }}
          >
            {/* Content wrapper */}
            <div
              style={{
                gridColumn: 'span 12',
                padding: '48px 0',
              }}
            >
              {children}
            </div>
          </div>
        </div>

        {/* Need help widget - fixed bottom right */}
        <div className="fixed bottom-0 right-0 z-30 p-4">
          <div className="flex justify-end">
            <div className="bg-white rounded-xl p-3 w-[104px] shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <div className="flex flex-col items-center">
                <div className="relative flex justify-center">
                  <div className="h-12 w-12 rounded-full border-4 border-white bg-[#0066cc] flex items-center justify-center">
                    <svg
                      height="28"
                      width="28"
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.67 11.45 12.92 12.17 12.21L13.41 10.97C13.78 10.6 14 10.13 14 9.5C14 8.4 13.1 7.5 12 7.5C10.9 7.5 10 8.4 10 9.5H8C8 7.29 9.79 5.5 12 5.5C14.21 5.5 16 7.29 16 9.5C16 10.6 15.61 11.59 15.07 12.13L15.07 11.25Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <svg
                    className="absolute bottom-0 right-2 bg-white rounded-xl p-1 shadow-lg"
                    height="24"
                    width="24"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      boxShadow: "0px 4px 16px rgba(0,0,0,0.2)",
                    }}
                  >
                    <path
                      clipRule="evenodd"
                      d="M22 9.13622C22.0001 8.63145 22.0001 8.13987 21.9661 7.72355C21.9288 7.26636 21.8406 6.7269 21.564 6.18405C21.1805 5.4314 20.5686 4.81948 19.816 4.43598C19.2731 4.15939 18.7337 4.07125 18.2765 4.0339C17.8602 3.99989 17.3686 3.99995 16.8638 4.00001L7.13621 4C6.63146 3.99994 6.13986 3.99989 5.72355 4.0339C5.26636 4.07125 4.72689 4.15939 4.18405 4.43598C3.4314 4.81948 2.81948 5.4314 2.43598 6.18405C2.15939 6.7269 2.07125 7.26636 2.0339 7.72355C1.99989 8.13988 1.99994 8.63147 2.00001 9.13625L2.00001 14.8638C1.99994 15.3685 1.99988 15.8601 2.0339 16.2765C2.07125 16.7337 2.15939 17.2731 2.43598 17.816C2.81948 18.5686 3.4314 19.1805 4.18405 19.564C4.72689 19.8406 5.26636 19.9288 5.72355 19.9661C6.13986 20.0001 6.63145 20.0001 7.13621 20H16.8638C17.3686 20.0001 17.8601 20.0001 18.2765 19.9661C18.7337 19.9288 19.2731 19.8406 19.816 19.564C20.5686 19.1805 21.1805 18.5686 21.564 17.816C21.8406 17.2731 21.9288 16.7337 21.9661 16.2765C22.0001 15.8602 22.0001 15.3686 22 14.8639V9.13622ZM16.8 6.00001C17.9201 6.00001 18.4802 6.00001 18.908 6.218C19.2843 6.40974 19.5903 6.71571 19.782 7.09203C19.8042 7.13549 19.8241 7.18032 19.8419 7.22697L12.0001 11.8398L4.15809 7.22692C4.17597 7.1803 4.19586 7.13548 4.218 7.09203C4.40974 6.7157 4.7157 6.40974 5.09203 6.218C5.51985 6.00001 6.0799 6.00001 7.20001 6.00001L16.8 6.00001ZM4.00001 9.45429L11.493 13.862C11.806 14.046 12.1941 14.046 12.5071 13.862L20 9.45435L20 14.8C20 15.9201 20 16.4802 19.782 16.908C19.5903 17.2843 19.2843 17.5903 18.908 17.782C18.4802 18 17.9201 18 16.8 18L7.20001 18C6.0799 18 5.51985 18 5.09203 17.782C4.7157 17.5903 4.40974 17.2843 4.218 16.908C4.00001 16.4802 4.00001 15.9201 4.00001 14.8L4.00001 9.45429Z"
                      fill="#0066cc"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 text-center mt-1 block">
                  Need help?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CurrentStoreProvider>
  )
}


