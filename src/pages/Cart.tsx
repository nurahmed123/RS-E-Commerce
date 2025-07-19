import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { useCart } from '../contexts/CartContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.1 // 10% tax
  const shipping = subtotal > 100 ? 0 : 10 // Free shipping over $100
  const total = subtotal + tax + shipping - discount

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/validate-coupon`, {
        code: couponCode,
        subtotal
      })

      setAppliedCoupon(response.data.coupon)
      setDiscount(response.data.discount)
      toast.success('Coupon applied successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon code')
    } finally {
      setLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBagIcon className="h-24 w-24 text-primary-600 mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-primary-300 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-primary-800 rounded-lg p-6 flex items-center space-x-4"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.image}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-white truncate">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-primary-300 text-sm">{item.variant}</p>
                    )}
                    <p className="text-accent-500 font-bold text-lg">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-primary-700 hover:bg-primary-600 text-white transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-white font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-1 rounded-full bg-primary-700 hover:bg-primary-600 disabled:bg-primary-600 disabled:opacity-50 text-white transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity >= item.stock && (
                      <p className="text-orange-400 text-xs">Max stock reached</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="bg-primary-800 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">
                Coupon Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-600 bg-opacity-20 border border-green-600 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <TagIcon className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={loading}
                    className="px-4 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-primary-300">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-primary-300">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-primary-300">
                <div className="flex items-center space-x-1">
                  <TruckIcon className="h-4 w-4" />
                  <span>Shipping</span>
                </div>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              
              {subtotal < 100 && (
                <p className="text-accent-400 text-sm">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              
              <div className="border-t border-primary-600 pt-3">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className="w-full block text-center bg-accent-600 hover:bg-accent-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </Link>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="w-full block text-center border border-primary-600 hover:border-primary-500 text-white font-medium py-3 px-6 rounded-lg transition-colors mt-3"
            >
              Continue Shopping
            </Link>

            {/* Security Badge */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-primary-400 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart