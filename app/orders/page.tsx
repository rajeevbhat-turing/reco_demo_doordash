'use client'
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Order } from "@/constants/order-data"
import { useOrdersStore } from "@/store/orders-store"

export default function Orders() {
  const { orders } = useOrdersStore()

  return (
    <div className="max-w-[1200px] mx-auto px-8 pt-24">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      
      <div className="mb-6">
        <h2 className="text-xl mb-4">Completed</h2>

        <div className="space-y-4">
          {orders.map((order) => (
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
                    {order.orderDate} • ${order?.totalAmount?.toFixed(2)} • {order?.items?.reduce((acc, item) => acc + item.quantity, 0)} items • Personal
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
