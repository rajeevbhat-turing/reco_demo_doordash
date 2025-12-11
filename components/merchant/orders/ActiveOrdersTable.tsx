'use client'

import React from 'react'
import { OrdersTable, ProcessedOrder } from './OrdersTableShared'

interface ActiveOrdersTableProps {
  orders: ProcessedOrder[];
  isLoading: boolean;
  onRowClick?: (order: ProcessedOrder) => void;
}

export const ActiveOrdersTable: React.FC<ActiveOrdersTableProps> = ({ orders, isLoading, onRowClick }) => {
  return <OrdersTable orders={orders} isLoading={isLoading} emptyMessage="No active orders found" onRowClick={onRowClick} />
}

