'use client'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Rating } from "@/components/Rating"
import { orderData, Order } from "@/constants/order-data"
import { useState } from "react"

export default function Orders() {
  const [activeTab, setActiveTab] = useState<'Personal' | 'Business'>('Personal')
  const [orders, setOrders] = useState(orderData)

  const handleRatingChange = (orderId: string, rating: number) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, rating } : order
    ))
  };

  const filteredOrders = orders.filter(order => order.orderType === activeTab)

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      
      <div className="mb-6">
        <h2 className="text-xl mb-4">Completed</h2>
        
        <div className="flex mb-6 text-sm">
          <button 
            className={`px-4 py-2 ${activeTab === 'Personal' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-l-full`}
            onClick={() => setActiveTab('Personal')}
          >
            Personal
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'Business' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'} rounded-r-full`}
            onClick={() => setActiveTab('Business')}
          >
            Business
          </button>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white hover:bg-gray-50">
              <div className="flex justify-between items-start p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{order.restaurantName}</h3>
                    {order.isDashPass && (
                      <Image src="/dashpass-icon.svg" alt="DashPass" width={16} height={16} />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {order.orderDate} • ${order.totalAmount.toFixed(2)} • {order.items.reduce((acc, item) => acc + item.quantity, 0)} items • {order.orderType}
                  </p>
                  <p className="mt-2">
                    {order.items.map(item => `${item.name} × ${item.quantity}`).join(' • ')}
                  </p>
                  {order.tags && order.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {order.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3">
                    <Rating 
                      initialRating={order.rating}
                      onChange={(rating) => handleRatingChange(order.id, rating)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.restaurantName !== 'Best Buy' && (
                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-gray-600">Reorder</span>
                    </button>
                  )}
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-600">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-sm text-gray-600">View Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
