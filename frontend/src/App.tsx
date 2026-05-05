import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import OrderPage from './pages/OrderPage'

export default function App() {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order/:productId" element={<OrderPage />} />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
