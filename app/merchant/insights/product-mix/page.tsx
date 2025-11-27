'use client'
import { useState } from "react"
import MerchantLayout from "@/components/merchant/MerchantLayout"
import { ChevronDown } from "lucide-react"

export default function ProductMixPage() {
  const [dateRange, setDateRange] = useState<"last7days" | "7daysPrior">("last7days")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - empty for now
  const items: any[] = []
  const hasError = true // Set to false when data loads successfully

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <MerchantLayout>
      <div className="max-w-7xl" style={{ padding: '48px 0px' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product mix</h1>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setDateRange("last7days")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
              dateRange === "last7days"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Last 7 days
            <ChevronDown className="h-3 w-3" />
          </button>
          <button
            onClick={() => setDateRange("7daysPrior")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
              dateRange === "7daysPrior"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            7 days prior
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* Table Container */}
        <div className="flex flex-col">
          {/* Search Bar */}
          <div
            className="border border-gray-200 rounded-t-lg p-4 bg-white flex items-center"
            style={{
              borderBottom: 'none',
            }}
          >
            <div className="w-full max-w-[343px]">
              <div className="relative">
                <div
                  className="flex items-center min-h-[40px] rounded-full px-4 border border-gray-200 bg-white"
                  style={{
                    borderRadius: 'calc(40px / 2)',
                    padding: '0px calc(12px + 4px)',
                  }}
                >
                  <div className="mr-3 flex items-center justify-center h-6 w-6 pointer-events-none">
                    <svg
                      height="24"
                      width="24"
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0 overflow-hidden"
                    >
                      <path
                        clipRule="evenodd"
                        d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L20.7071 19.2929C21.0976 19.6834 21.0976 20.3166 20.7071 20.7071C20.3166 21.0976 19.6834 21.0976 19.2929 20.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        style={{ color: '#191919' }}
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    placeholder="Search for an item"
                    aria-label="Search for an item"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 w-full"
                    style={{
                      fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                      fontSize: '14px',
                      lineHeight: '20px',
                      letterSpacing: '-0.01px',
                      fontWeight: 400,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative" style={{ height: '424px' }}>
            <div className="flex flex-col items-center">
              <div
                className="border-t-0 rounded-b-lg overflow-auto w-full"
                style={{
                  borderRadius: '0 0 8px 8px',
                  height: '424px',
                  maxHeight: 'calc(-100px + 90vh)',
                  minHeight: '424px',
                  outline: 'none',
                }}
              >
                <div>
                  <table
                    role="table"
                    className="w-full border-collapse"
                    style={{
                      borderSpacing: '0px',
                      marginBottom: 'calc(40px * 2)',
                    }}
                  >
                    <thead>
                      <tr role="row" style={{ height: '48px' }}>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            minWidth: '320px',
                            width: '320px',
                            maxWidth: '320px',
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                            left: '0px',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <span
                              className="block text-gray-900"
                              style={{
                                fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                lineHeight: '18px',
                                letterSpacing: '0px',
                              }}
                            >
                              Items
                            </span>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <span
                              className="block text-gray-900"
                              style={{
                                fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                lineHeight: '18px',
                                letterSpacing: '0px',
                              }}
                            >
                              Total sold
                            </span>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <span
                              className="block text-gray-900"
                              style={{
                                fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                lineHeight: '18px',
                                letterSpacing: '0px',
                              }}
                            >
                              Change
                            </span>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <span
                              className="block text-gray-900"
                              style={{
                                fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                lineHeight: '18px',
                                letterSpacing: '0px',
                              }}
                            >
                              Gross sales
                            </span>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <span
                              className="block text-gray-900"
                              style={{
                                fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                fontSize: '12px',
                                fontWeight: 500,
                                lineHeight: '18px',
                                letterSpacing: '0px',
                              }}
                            >
                              Change
                            </span>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <div className="flex-1">
                              <div className="inline">
                                <span
                                  className="block text-gray-900 underline cursor-pointer"
                                  style={{
                                    fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    lineHeight: '18px',
                                    letterSpacing: '0px',
                                    textDecorationLine: 'underline',
                                    textDecorationStyle: 'dashed',
                                    textDecorationColor: '#d6d6d6ff',
                                    textUnderlineOffset: '4px',
                                  }}
                                >
                                  Item errors
                                </span>
                              </div>
                            </div>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <div className="flex-1">
                              <div className="inline">
                                <span
                                  className="block text-gray-900 underline cursor-pointer"
                                  style={{
                                    fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    lineHeight: '18px',
                                    letterSpacing: '0px',
                                    textDecorationLine: 'underline',
                                    textDecorationStyle: 'dashed',
                                    textDecorationColor: '#d6d6d6ff',
                                    textUnderlineOffset: '4px',
                                  }}
                                >
                                  Error charges
                                </span>
                              </div>
                            </div>
                          </div>
                        </th>
                        <th
                          className="text-left sticky top-0 z-[2] bg-white align-middle px-4 whitespace-nowrap"
                          role="columnheader"
                          style={{
                            boxShadow: '0 calc(-1 * 2px) 0 0 #e7e7e7ff inset',
                          }}
                        >
                          <div className="flex items-center justify-start flex-row">
                            <div className="flex-1">
                              <div className="inline">
                                <span
                                  className="block text-gray-900 underline cursor-pointer"
                                  style={{
                                    fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    lineHeight: '18px',
                                    letterSpacing: '0px',
                                    textDecorationLine: 'underline',
                                    textDecorationStyle: 'dashed',
                                    textDecorationColor: '#d6d6d6ff',
                                    textUnderlineOffset: '4px',
                                  }}
                                >
                                  Customer discounts
                                </span>
                              </div>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody role="rowgroup" />
                  </table>
                </div>
              </div>
            </div>

            {/* Error State Overlay */}
            {hasError && (
              <div
                className="absolute rounded-b-lg border-b border-gray-200 flex items-center justify-center bg-white z-10"
                style={{
                  top: '48px',
                  left: '1px',
                  right: '1px',
                  height: '376px',
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-12" style={{ height: '60vh' }}>
                  <img
                    height={200}
                    alt="error occurred"
                    src="/error-empty-state.svg"
                  />
                  <div className="block">
                    <span
                      className="block text-gray-900 text-center"
                      style={{
                        fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: '24px',
                        letterSpacing: '-0.01px',
                      }}
                    >
                      Error loading items
                    </span>
                    <span
                      className="block text-gray-900 text-center mt-1"
                      style={{
                        fontFamily: 'TT Norms, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        letterSpacing: '0px',
                        marginTop: '4px',
                      }}
                    >
                      An error occurred. Please try again later.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MerchantLayout>
  )
}
