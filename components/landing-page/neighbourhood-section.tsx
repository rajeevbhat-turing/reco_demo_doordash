'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTopChains, useTopCuisines, useTopCities } from '@/lib/hooks/use-top-chains';

export default function NeighbourhoodSection() {
  const [activeTab, setActiveTab] = useState<'cities' | 'cuisines' | 'chains'>('cities');
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const [showAllChains, setShowAllChains] = useState(false);

  // Fetch top chains from API (restaurants with rating > 4.5)
  const { data: topChains = [] } = useTopChains();

  // Derive top cuisines from top chains (cuisines of restaurants with rating > 4.5)
  const topCuisines = useTopCuisines();

  // Derive top cities from top chains (cities of restaurants with rating > 4.5)
  const topCities = useTopCities();

  return (
    <div className="w-full bg-white py-12">
      <div className="w-full max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-[#191919ff] mb-6">
          Get more from your neighborhood
        </h2>

        {/* Tabs */}
        <div className="grid grid-cols-3 mb-6 border-b border-gray-200 w-full">
          <button
            onClick={() => setActiveTab('cities')}
            className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
              activeTab === 'cities'
                ? 'text-[#191919ff] border-[#191919ff] font-bold'
                : 'text-[#606060ff] font-medium border-transparent'
            }`}
          >
            Top Cities
          </button>
          <button
            onClick={() => setActiveTab('cuisines')}
            className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
              activeTab === 'cuisines'
                ? 'text-[#191919ff] border-[#191919ff] font-bold'
                : 'text-[#606060ff] font-medium border-transparent'
            }`}
          >
            Top Cuisines
          </button>
          <button
            onClick={() => setActiveTab('chains')}
            className={`py-2 text-base transition-colors border-b-[3px] hover:bg-gray-50 ${
              activeTab === 'chains'
                ? 'text-[#191919ff] border-[#191919ff] font-bold'
                : 'text-[#606060ff] font-medium border-transparent'
            }`}
          >
            Top Chains
          </button>
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === 'cities' && (
            <div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                  !showAllCities ? 'mb-6' : ''
                }`}
              >
                {(showAllCities ? topCities : topCities.slice(0, 15)).map((city, index) => (
                  <div
                    key={`city-${city.name}-${index}`}
                    className="text-base font-medium text-[#191919ff] hover:underline"
                  >
                    {city.name}
                  </div>
                ))}
              </div>
              {topCities.length > 15 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-[#191919ff]">
                    {showAllCities ? (
                      <>
                        <span className="font-bold text-xl">See less</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllCities(false)}
                        >
                          <ChevronUp className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-xl">See more</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllCities(true)}
                        >
                          <ChevronDown className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cuisines' && (
            <div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                  !showAllCuisines ? 'mb-6' : ''
                }`}
              >
                {(showAllCuisines ? topCuisines : topCuisines.slice(0, 15)).map(
                  (cuisine, index) => (
                    <div
                      key={`cuisine-${cuisine.name}-${index}`}
                      className="text-base font-medium text-[#191919ff] hover:underline"
                    >
                      {cuisine.name}
                    </div>
                  )
                )}
              </div>
              {topCuisines.length > 15 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-[#191919ff]">
                    {showAllCuisines ? (
                      <>
                        <span className="font-bold text-xl">See less</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllCuisines(false)}
                        >
                          <ChevronUp className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-xl">See more</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllCuisines(true)}
                        >
                          <ChevronDown className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chains' && (
            <div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                  !showAllChains ? 'mb-6' : ''
                }`}
              >
                {(showAllChains ? topChains : topChains.slice(0, 15)).map((chain, index) => (
                  <div
                    key={`chain-${chain.id}-${index}`}
                    className="text-base font-medium text-[#191919ff] hover:underline"
                  >
                    {chain.name}
                  </div>
                ))}
              </div>
              {topChains.length > 15 && (
                <div className="flex justify-center mt-6">
                  <div className="flex items-center gap-2 text-[#191919ff]">
                    {showAllChains ? (
                      <>
                        <span className="font-bold text-xl">See less</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllChains(false)}
                        >
                          <ChevronUp className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-xl">See more</span>
                        <button
                          className="flex items-center justify-center p-2.5 rounded-full bg-[#f1f1f1] hover:bg-gray-200"
                          onClick={() => setShowAllChains(true)}
                        >
                          <ChevronDown className="h-5 w-5" strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
