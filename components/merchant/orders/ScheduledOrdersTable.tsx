'use client'

import React from 'react'
import { OrdersTable, ProcessedOrder } from './OrdersTableShared'

interface ScheduledOrdersTableProps {
  orders: ProcessedOrder[];
  isLoading: boolean;
  onRowClick?: (order: ProcessedOrder) => void;
}

export const ScheduledOrdersTable: React.FC<ScheduledOrdersTableProps> = ({ orders, isLoading, onRowClick }) => {
  return <OrdersTable orders={orders} isLoading={isLoading} emptyMessage="No scheduled orders found" onRowClick={onRowClick} />
}

