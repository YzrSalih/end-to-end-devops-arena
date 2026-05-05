import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, Loader2, ArrowLeft, Package, Mail, ClipboardCheck } from 'lucide-react'
import { fetchProducts, placeOrder } from '../api/client'
import type { Product, OrderResponse } from '../types'

interface LocationState {
  product?: Product
}

const STEPS = [
  { id: 1, label: 'Product', icon: Package },
  { id: 2, label: 'Details', icon: Mail },
  { id: 3, label: 'Confirm', icon: ClipboardCheck },
]

const stepVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

export default function OrderPage() {
  const { productId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(state?.product ?? null)
  const [quantity, setQuantity] = useState(1)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [step, setStep] = useState(state?.product ? 2 : 1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<OrderResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedProduct) {
      fetchProducts().then((data) => {
        setProducts(data)
        if (productId) {
          const found = data.find((p) => p.id === productId)
          if (found) { setSelectedProduct(found); setStep(2) }
        }
      })
    }
  }, [productId, selectedProduct])

  function validateEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  async function handleSubmit() {
    if (!selectedProduct) return
    setSubmitting(true)
    setError('')
    try {
      const res = await placeOrder({
        product_id: selectedProduct.id,
        quantity,
        customer_email: email,
      })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-24 pb-16 min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={40} className="text-green-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Order Queued!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 mb-2"
          >
            Order ID:
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="font-mono text-sm text-indigo-300 glass px-4 py-2 rounded-lg inline-block mb-8"
          >
            {result.order_id}
          </motion.p>

          {/* Event flow animation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Processing Pipeline</p>
            <div className="flex items-center justify-between gap-2">
              {[
                { label: 'Order Service', color: 'bg-indigo-500', delay: 0.5 },
                { label: 'RabbitMQ', color: 'bg-yellow-500', delay: 0.9 },
                { label: 'Notification', color: 'bg-violet-500', delay: 1.3 },
              ].map(({ label, color, delay }, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay, type: 'spring', stiffness: 200 }}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className={`w-3 h-3 rounded-full ${color} shadow-lg mb-1`} />
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{label}</span>
                  </motion.div>
                  {i < 2 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: delay + 0.2, duration: 0.3 }}
                      className="flex-shrink-0 mb-4"
                    >
                      <ChevronRight size={14} className="text-slate-600" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-xs text-green-400 mt-4"
            >
              ✓ Notification worker will process your order shortly
            </motion.p>
          </motion.div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/products')} className="btn-ghost text-sm">
              Continue Shopping
            </button>
            <button
              onClick={() => { setResult(null); setStep(1); setSelectedProduct(null); setEmail(''); setQuantity(1) }}
              className="btn-primary text-sm"
            >
              New Order
            </button>
          </div>
        </div>
      </motion.main>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-16 min-h-screen"
    >
      <div className="max-w-xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg glass glass-hover text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Place Order</h1>
            <p className="text-sm text-slate-500">Fill in the details below</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map(({ id, label, icon: Icon }, i) => (
            <div key={id} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                step === id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : step > id
                  ? 'text-green-400'
                  : 'text-slate-600'
              }`}>
                {step > id ? <CheckCircle2 size={13} /> : <Icon size={13} />}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-colors ${step > id ? 'bg-indigo-500/40' : 'bg-white/[0.05]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="glass rounded-2xl p-6 min-h-64">
          <AnimatePresence mode="wait">
            {/* Step 1: Product selection */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-lg font-semibold text-white mb-4">Select a Product</h2>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProduct(p); setStep(2) }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        selectedProduct?.id === p.id
                          ? 'bg-indigo-600/20 border border-indigo-500/40'
                          : 'glass glass-hover'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-lg shrink-0">
                        📦
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-indigo-300">${p.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Email + quantity */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-lg font-semibold text-white mb-1">Order Details</h2>
                {selectedProduct && (
                  <p className="text-sm text-slate-400 mb-5">
                    Ordering: <span className="text-indigo-300">{selectedProduct.name}</span> — ${selectedProduct.price.toFixed(2)}
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 glass glass-hover rounded-lg flex items-center justify-center text-white font-bold"
                      >−</button>
                      <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 glass glass-hover rounded-lg flex items-center justify-center text-white font-bold"
                      >+</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Customer Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                      placeholder="you@example.com"
                      className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
                    />
                    {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="btn-ghost text-sm flex-1">Back</button>
                  <button
                    onClick={() => {
                      if (!validateEmail(email)) { setEmailError('Enter a valid email'); return }
                      setStep(3)
                    }}
                    className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                  >
                    Review <ChevronRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }}>
                <h2 className="text-lg font-semibold text-white mb-5">Confirm Order</h2>

                <div className="space-y-3 mb-6">
                  {[
                    { label: 'Product', value: selectedProduct?.name },
                    { label: 'Price', value: `$${selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00'}` },
                    { label: 'Quantity', value: String(quantity) },
                    { label: 'Email', value: email },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.05]">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="btn-ghost text-sm flex-1" disabled={submitting}>Back</button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary text-sm flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? <><Loader2 size={15} className="animate-spin" /> Placing…</> : 'Confirm Order'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  )
}
