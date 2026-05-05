export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock?: number
}

export interface OrderRequest {
  product_id: string
  quantity: number
  customer_email: string
}

export interface OrderResponse {
  order_id: string
  status: string
}
