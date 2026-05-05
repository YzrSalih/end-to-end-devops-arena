import type { OrderRequest, OrderResponse, Product } from '../types'

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Wireless Headphones', description: 'Premium audio with active noise cancellation', price: 79.99, category: 'Audio', stock: 42 },
  { id: '2', name: 'Mechanical Keyboard', description: 'RGB backlit, tactile switches, TKL layout', price: 129.99, category: 'Input', stock: 18 },
  { id: '3', name: 'USB-C Hub 7-in-1', description: 'HDMI 4K, 3× USB-A, SD card, 100W PD', price: 49.99, category: 'Accessories', stock: 55 },
  { id: '4', name: 'Ergonomic Laptop Stand', description: 'Adjustable height, aluminium, foldable', price: 39.99, category: 'Accessories', stock: 30 },
  { id: '5', name: '4K Webcam', description: '3840×2160, autofocus, built-in ring light', price: 119.99, category: 'Video', stock: 12 },
  { id: '6', name: 'XL Desk Pad', description: '90×40 cm, anti-slip, waterproof surface', price: 24.99, category: 'Accessories', stock: 80 },
]

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('API error')
    return res.json()
  } catch {
    return MOCK_PRODUCTS
  }
}

export async function placeOrder(order: OrderRequest): Promise<OrderResponse> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to place order')
  }
  return res.json()
}
