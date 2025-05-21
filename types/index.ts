export interface Product {
  id: number
  name: string
  price: number
  quantity?: string
  image: string
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
