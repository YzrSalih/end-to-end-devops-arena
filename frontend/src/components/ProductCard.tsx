import { motion } from 'framer-motion'
import { ShoppingCart, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'

const CATEGORY_COLORS: Record<string, string> = {
  Audio: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Input: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  Accessories: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  Video: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

const CATEGORY_ICONS: Record<string, string> = {
  Audio: '🎧',
  Input: '⌨️',
  Accessories: '🔌',
  Video: '📷',
}

interface Props {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: Props) {
  const navigate = useNavigate()
  const colorClass = CATEGORY_COLORS[product.category] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20'
  const icon = CATEGORY_ICONS[product.category] ?? '📦'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer glow"
      onClick={() => navigate(`/order/${product.id}`, { state: { product } })}
    >
      {/* Icon + category */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colorClass}`}>
          <span className="flex items-center gap-1">
            <Tag size={10} />
            {product.category}
          </span>
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-white text-base leading-snug mb-1 group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
      </div>

      {/* Price + action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
        <div>
          <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
          {product.stock !== undefined && (
            <span className="ml-2 text-xs text-slate-500">{product.stock} left</span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 hover:text-indigo-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/order/${product.id}`, { state: { product } })
          }}
        >
          <ShoppingCart size={13} />
          Order
        </motion.button>
      </div>
    </motion.div>
  )
}
