export interface CartConfig {
  freeDeliveryThreshold: number
  defaultDeliveryFee: number
  serviceFeePercentage: number
  minServiceFee: number
}

export const cartConfig: CartConfig = {
  freeDeliveryThreshold: 35,
  defaultDeliveryFee: 6.64,
  serviceFeePercentage: 0.15,
  minServiceFee: 5.49,
}
