'use client'

import React from 'react'
import { OrdersTable, ProcessedOrder } from './OrdersTableShared'

interface HistoryOrdersTableProps {
  orders: ProcessedOrder[];
  isLoading: boolean;
  onRowClick?: (order: ProcessedOrder) => void;
}

export const HistoryOrdersTable: React.FC<HistoryOrdersTableProps> = ({ orders, isLoading, onRowClick }) => {
  return <OrdersTable orders={orders} isLoading={isLoading} emptyMessage="No history orders found" onRowClick={onRowClick} />
}

