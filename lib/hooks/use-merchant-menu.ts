'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { MenuCategory, MenuItem, ItemStatus } from '@/store/merchant-menu-store'

interface MenuApiResponse {
  success: boolean
  data: {
    menuItems: Array<{
      id: string
      restaurantId: string
      name: string
      description: string | null
      price: string // e.g., "$15.00" or "$15.00+"
      image: string
      category: string
      calories?: string
      rating: number | null
      ratingCount: number | null
      popular: boolean
      featured: boolean
      isAvailable: boolean
      modifications: any[]
    }>
    categories: Array<{
      id: string
      name: string
      description: string | null
      displayOrder: number
    }>
  }
}

/**
 * Hook to fetch menu items from database for merchant menu manager
 * Transforms database format to merchant menu store format
 */
export function useMerchantMenu(restaurantId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MenuApiResponse>({
    queryKey: ['merchant-menu', restaurantId],
    queryFn: async () => {
      if (!restaurantId) {
        throw new Error('Restaurant ID is required')
      }
      // Include unavailable items for merchant view
      const response = await fetch(`/api/restaurants/${restaurantId}/menu?includeUnavailable=true`)
      if (!response.ok) {
        throw new Error('Failed to fetch menu')
      }
      return response.json()
    },
    enabled: !!restaurantId,
    staleTime: 30 * 1000, // 30 seconds
  })

  // Transform API data to merchant menu format
  const categories = useMemo<MenuCategory[]>(() => {
    if (!data?.success || !data.data) {
      return []
    }

    const { menuItems, categories: apiCategories } = data.data

    // Group menu items by category
    const itemsByCategory = new Map<string, MenuItem[]>()

    menuItems.forEach((item) => {
      const categoryName = item.category
      if (!itemsByCategory.has(categoryName)) {
        itemsByCategory.set(categoryName, [])
      }

      // Convert price string to pickup/delivery prices
      // For now, both are the same (we can add separate pricing later)
      const priceStr = item.price.replace('+', '') // Remove "+" if present
      
      // Determine status based on isAvailable
      const status: ItemStatus = item.isAvailable ? "In stock" : "Out of stock - Indefinitely"

      const menuItem: MenuItem = {
        id: item.id,
        name: item.name,
        image: item.image || '/placeholder.jpg',
        pickupPrice: priceStr,
        deliveryPrice: priceStr,
        status,
      }

      itemsByCategory.get(categoryName)!.push(menuItem)
    })

    // Create categories array matching API categories order
    const sortedCategories = [...apiCategories].sort((a, b) => a.displayOrder - b.displayOrder)

    return sortedCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: itemsByCategory.get(cat.name) || [],
    }))
  }, [data])

  return {
    categories,
    isLoading,
    error,
    refetch,
  }
}

