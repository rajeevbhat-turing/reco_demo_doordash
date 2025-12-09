'use client';

import { useState, useEffect, useMemo } from 'react';
import { checkIfOpen } from '@/lib/utils/restaurant-utils';
import { Restaurant } from '@/constants/restaurants';

/**
 * Hook to calculate restaurant open/closed status based on user's local time.
 *
 * This solves the problem of server-side time calculation which uses the server's
 * timezone instead of the user's local timezone.
 *
 * @param restaurant - Restaurant object with openingHour and closingHour
 * @param updateInterval - Interval in ms to re-check status (default: 60000 = 1 minute)
 * @returns boolean indicating if restaurant is currently open
 */
export function useRestaurantOpenStatus(
  restaurant: Restaurant | null | undefined,
  updateInterval: number = 60000
): boolean {
  // Calculate initial status
  const calculateIsOpen = useMemo(() => {
    if (!restaurant) return false;

    // If no hours data available, fall back to server-provided value
    if (restaurant.openingHour === undefined && restaurant.closingHour === undefined) {
      return restaurant.isOpen;
    }

    const currentHour = new Date().getHours();
    return checkIfOpen(restaurant.openingHour, restaurant.closingHour, currentHour);
  }, [restaurant]);

  const [isOpen, setIsOpen] = useState<boolean>(calculateIsOpen);

  useEffect(() => {
    if (!restaurant) return;

    // Update immediately with user's local time
    const checkStatus = () => {
      // If no hours data available, fall back to server-provided value
      if (restaurant.openingHour === undefined && restaurant.closingHour === undefined) {
        setIsOpen(restaurant.isOpen);
        return;
      }

      const currentHour = new Date().getHours();
      const open = checkIfOpen(restaurant.openingHour, restaurant.closingHour, currentHour);
      setIsOpen(open);
    };

    // Check immediately
    checkStatus();

    // Set up interval to re-check status periodically
    // This handles the case when user is viewing the page during opening/closing time
    const interval = setInterval(checkStatus, updateInterval);

    return () => clearInterval(interval);
  }, [restaurant, updateInterval]);

  return isOpen;
}

/**
 * Hook to get open status for multiple restaurants.
 * More efficient than calling useRestaurantOpenStatus for each restaurant.
 *
 * @param restaurants - Array of Restaurant objects
 * @param updateInterval - Interval in ms to re-check status (default: 60000 = 1 minute)
 * @returns Map of restaurant ID to open status
 */
export function useRestaurantsOpenStatus(
  restaurants: Restaurant[] | null | undefined,
  updateInterval: number = 60000
): Map<string, boolean> {
  const [openStatusMap, setOpenStatusMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!restaurants || restaurants.length === 0) {
      setOpenStatusMap(new Map());
      return;
    }

    const calculateAllStatuses = () => {
      const currentHour = new Date().getHours();
      const newMap = new Map<string, boolean>();

      restaurants.forEach(restaurant => {
        // If no hours data available, fall back to server-provided value
        if (restaurant.openingHour === undefined && restaurant.closingHour === undefined) {
          newMap.set(restaurant.id, restaurant.isOpen);
        } else {
          const open = checkIfOpen(restaurant.openingHour, restaurant.closingHour, currentHour);
          newMap.set(restaurant.id, open);
        }
      });

      setOpenStatusMap(newMap);
    };

    // Calculate immediately
    calculateAllStatuses();

    // Set up interval to re-check status periodically
    const interval = setInterval(calculateAllStatuses, updateInterval);

    return () => clearInterval(interval);
  }, [restaurants, updateInterval]);

  return openStatusMap;
}

/**
 * Utility function to get open status for a single restaurant (non-hook version).
 * Use this when you need to calculate status outside of React components.
 *
 * @param restaurant - Restaurant object with openingHour and closingHour
 * @returns boolean indicating if restaurant is currently open
 */
export function getRestaurantOpenStatus(restaurant: Restaurant | null | undefined): boolean {
  if (!restaurant) return false;

  // If no hours data available, fall back to server-provided value
  if (restaurant.openingHour === undefined && restaurant.closingHour === undefined) {
    return restaurant.isOpen;
  }

  const currentHour = new Date().getHours();
  return checkIfOpen(restaurant.openingHour, restaurant.closingHour, currentHour);
}
