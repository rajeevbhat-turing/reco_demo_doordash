export interface Category {
  id: number
  name: string
  slug: string
  image: string
  type: string
  isActive: boolean
}
export interface Product {
  id: number | string
  name: string
  price: number | string
  quantity?: string
  image: string
  category?: string | string[]
}

export interface Category {
  id: number
  name: string
  icon: string
}

export interface ProductSection {
  id: number
  title: string
  products: Product[]
}
