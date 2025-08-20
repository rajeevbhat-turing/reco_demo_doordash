"use client"

import Image from "next/image"
import { Heart, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDefaultRating } from "@/utils/rating-utils"

// Default stores data (fallback)
const defaultStores = [
  {
    name: "Sprouts Farmers Market",
    time: "Express 56 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/71af112e-089d-4f65-ad70-d8675ae55265.jpg",
    inStorePrice: true,
    discount: "",
    rating: "4.8",
    numRatings: "9081",
    isSnap: true
  },
  {
    name: "Safeway",
    time: "Express 34 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/Screen_Shot_2021-01-22_at_1.31.06_PM_230x230.png",
    inStorePrice: true,
    discount: "",
    rating: "4.7",
    numRatings: "8790",
    isSnap: true
  },
  {
    name: "DashMart",
    time: "Express 19 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/9ebc5499-da9e-43bb-ae50-df979da10a50.png",
    inStorePrice: true,
    discount: "",
    rating: "4.6",
    numRatings: "7654",
    isSnap: true
  },
  {
    name: "DoorDash Market",
    time: "Express 24 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/f220ce39-26dd-4673-994d-462711a37a0d.png",
    inStorePrice: true,
    discount: "",
    rating: "4.9",
    numRatings: "5622",
    isSnap: true
  },
  {
    name: "Bi-Rite Market",
    time: "Express 31 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/ada746a6-4410-4b60-858c-6ca4e24e47fd.png",
    inStorePrice: true,
    discount: "",
    rating: "4.8",
    numRatings: "3421"
  },
  {
    name: "Mollie Stone's Markets",
    time: "Express 37 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/35cd6437-4142-46af-be81-4a10e6b3f312.png",
    inStorePrice: true,
    discount: "25% off, up to $15",
    rating: "4.7",
    numRatings: "2891"
  },
  {
    name: "Target",
    time: "Fast 31 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1d0b3b97-92f9-4b92-a3ad-a4f65506d4a4.png",
    inStorePrice: true,
    discount: "",
    rating: "4.8",
    numRatings: "3k+"
  },
  {
    name: "Grocery Outlet",
    time: "Express 51 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/df09eac7-b06f-4d31-9e18-f7f333d6ebda.png",
    inStorePrice: true,
    discount: "",
    rating: "4.9",
    numRatings: "200+",
    isSnap: true
  },
  {
    name: "Gus's Community Market",
    time: "Express 39 min",
    delivery: "$0 delivery fee",
    open: true,
    openTime: "",
    image: "https://img.cdn4dd.com/cdn-cgi/image/fit=contain,width=1200,height=672,format=auto/https://doordash-static.s3.amazonaws.com/media/restaurant/cover_square/1ad70c1a-791f-46dd-87c7-14a84d427230.jpg",
    inStorePrice: true,
    discount: "25% off, up to $30",
    rating: "4.6",
    numRatings: "200+"
  }
]

interface Store {
  name: string;
  time: string;
  delivery: string;
  open: boolean;
  openTime: string;
  image: string;
  inStorePrice: boolean;
  discount: string;
  rating?: string;
  numRatings?: string;
  isSnap?: boolean;
}

interface AllStoresProps {
  stores?: Store[];
}

export default function GroceryAllStores({ stores = defaultStores }: AllStoresProps) {
  return (
      <div className="py-6">
        <h2 className="text-2xl font-bold mb-4">All Stores</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store, index) => (
              <div key={`${store.name}-${index}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image
                        src={store.image || "/placeholder-logo.svg"}
                        alt={store.name}
                        width={64}
                        height={64}
                        className="object-cover"
                        style={{ width: 'auto', height: 'auto' }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{store.name}</h3>
                      <Button variant="ghost" size="icon" className="rounded-full -mr-2 -mt-2">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-x-1 gap-y-1 mt-1">
                      {store.isSnap && (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded inline-flex items-center">
                      SNAP
                    </span>
                      )}
                    </div>

                    {store.rating && (
                        <div className="text-sm text-gray-500">
                          ★ {getDefaultRating(store.rating)} ({store.numRatings || "0"})
                        </div>
                    )}

                    {store.open ? (
                        <div className="text-sm text-gray-500">{store.time}</div>
                    ) : (
                        <div className="text-sm text-gray-500">Closed</div>
                    )}

                    <div className="text-sm text-gray-500">{store.delivery}</div>

                    {store.inStorePrice && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Info className="h-3 w-3" />
                          In-store prices
                        </div>
                    )}

                    {store.discount && <div className="text-sm text-blue-600 mt-1">{store.discount}</div>}
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/*<div className="mt-6 border border-gray-200 rounded-lg p-4">*/}
        {/*  <div className="flex gap-4">*/}
        {/*    <div className="flex-1">*/}
        {/*      <div className="mb-1 font-bold">See 12 more Stores</div>*/}
        {/*      <div className="text-sm text-gray-500">*/}
        {/*        25th Irving Market, Mainland Market, Marina Supermarket, and more*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*    <div className="flex items-center">*/}
        {/*      <Button variant="ghost" className="h-9 w-9 rounded-full">*/}
        {/*        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">*/}
        {/*          <path d="m9 18 6-6-6-6"/>*/}
        {/*        </svg>*/}
        {/*      </Button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
  )
}
