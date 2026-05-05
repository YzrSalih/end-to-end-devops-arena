import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { fetchProducts } from '../api/client'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types'

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-white/[0.05] animate-pulse" />
        <div className="w-20 h-6 rounded-full bg-white/[0.05] animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-3 w-full rounded bg-white/[0.05] animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-white/[0.05] animate-pulse" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
        <div className="h-6 w-20 rounded bg-white/[0.05] animate-pulse" />
        <div className="h-8 w-16 rounded-lg bg-white/[0.05] animate-pulse" />
      </div>
    </div>
  )
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = category === 'All' || p.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <motion.main
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.4 }}
      className="pt-24 pb-16 min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Product <span className="gradient-text">Catalog</span>
          </h1>
          <p className="text-slate-400">Browse our inventory — click any product to place an order.</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-500 shrink-0" />
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'glass text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Count */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-500 mb-6"
          >
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </motion.p>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400">No products match your search.</p>
            <button
              onClick={() => { setQuery(''); setCategory('All') }}
              className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>
    </motion.main>
  )
}
