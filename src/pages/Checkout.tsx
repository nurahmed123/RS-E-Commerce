import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon, 
  TruckIcon, 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ShippingAddress {
  name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

const Checkout: React.FC = () => {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })
  
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })
  
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('credit_card')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.1
  const shippingCost = shippingMethod === 'express' ? 15 : (subtotal > 100 ? 0 : 10)
  const total = subtotal + tax + shippingCost

  const handleAddressChange = (
    type: 'shipping' | 'billing',
    field: keyof ShippingAddress,
    value: string
  ) => {
    if (type === 'shipping') {
      setShippingAddress(prev => ({ ...prev, [field]: value }))
      if (sameAsShipping) {
        setBillingAddress(prev => ({ ...prev, [field]: value }))
      }
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        const requiredShippingFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode']
        return requiredShippingFields.every(field => shippingAddress[field as keyof ShippingAddress])
      case 2:
        return shippingMethod !== ''
      case 3:
        return paymentMethod !== '' && agreeToTerms
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmitOrder = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields and agree to terms')
      return
    }

    try {
      setLoading(true)
      
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant
        })),
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        guestEmail: !user ? shippingAddress.email : undefined
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/orders`, orderData)
      
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${response.data.orderNumber}`)
    } catch (error: any) {
      console.error('Order submission error:', error)
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { number: 1, title: 'Shipping' },
              { number: 2, title: 'Delivery' },
              { number: 3, title: 'Payment' },
              { number: 4, title: 'Review' }
            ].map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= stepItem.number
                    ? 'bg-accent-600 border-accent-600 text-white'
                    : 'border-primary-600 text-primary-400'
                }`}>
                  {step > stepItem.number ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepItem.number ? 'text-white' : 'text-primary-400'
                }`}>
                  {stepItem.title}
                </span>
                {index < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > stepItem.number ? 'bg-accent-600' : 'bg-primary-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-primary-800 rounded-lg p-6"
            >
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <MapPinIcon className="h-6 w-6 mr-2" />
                    Shipping Address
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => handleAddressChange('shipping', 'name', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange('shipping', 'email', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Country *</label>
                      <select
                        value={shippingAddress.country}
                        onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-white font-medium mb-2">Street Address *</label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => handleAddressChange('shipping', 'street', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">State *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">ZIP Code *</label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <TruckIcon className="h-6 w-6 mr-2" />
                    Delivery Options
                  </h2>
                  
                  <div className="space-y-4">
                    <label className="flex items-center p-4 border border-primary-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">Standard Shipping</p>
                            <p className="text-primary-300 text-sm">5-7 business days</p>
                          </div>
                          <span className="text-white font-medium">
                            {subtotal > 100 ? 'Free' : '$10.00'}
                          </span>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-primary-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">Express Shipping</p>
                            <p className="text-primary-300 text-sm">2-3 business days</p>
                          </div>
                          <span className="text-white font-medium">$15.00</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <CreditCardIcon className="h-6 w-6 mr-2" />
                    Payment Method
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center p-4 border border-primary-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <div className="ml-3">
                        <p className="text-white font-medium">Credit/Debit Card</p>
                        <p className="text-primary-300 text-sm">Visa, Mastercard, American Express</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-primary-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <div className="ml-3">
                        <p className="text-white font-medium">PayPal</p>
                        <p className="text-primary-300 text-sm">Pay with your PayPal account</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-primary-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <div className="ml-3">
                        <p className="text-white font-medium">Cash on Delivery</p>
                        <p className="text-primary-300 text-sm">Pay when you receive your order</p>
                      </div>
                    </label>
                  </div>

                  {/* Billing Address */}
                  <div className="mb-6">
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <span className="ml-2 text-white">Billing address same as shipping</span>
                    </label>
                    
                    {!sameAsShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Billing address fields (similar to shipping) */}
                        <div>
                          <label className="block text-white font-medium mb-2">Full Name *</label>
                          <input
                            type="text"
                            value={billingAddress.name}
                            onChange={(e) => handleAddressChange('billing', 'name', e.target.value)}
                            className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </div>
                        {/* Add other billing fields as needed */}
                      </div>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="text-accent-600 focus:ring-accent-500 mt-1"
                    />
                    <span className="ml-2 text-primary-300 text-sm">
                      I agree to the{' '}
                      <a href="#" className="text-accent-500 hover:text-accent-400">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-accent-500 hover:text-accent-400">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Review Your Order</h2>
                  
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-3 bg-primary-700 rounded-lg">
                            <img
                              src={`${import.meta.env.VITE_API_URL}${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium">{item.name}</p>
                              {item.variant && (
                                <p className="text-primary-300 text-sm">{item.variant}</p>
                              )}
                              <p className="text-primary-300 text-sm">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-white font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-3">Shipping Address</h3>
                        <div className="bg-primary-700 p-4 rounded-lg text-primary-200 text-sm">
                          <p>{shippingAddress.name}</p>
                          <p>{shippingAddress.street}</p>
                          <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                          <p>{shippingAddress.country}</p>
                          <p>{shippingAddress.phone}</p>
                          <p>{shippingAddress.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-3">Payment Method</h3>
                        <div className="bg-primary-700 p-4 rounded-lg text-primary-200 text-sm">
                          <p className="capitalize">{paymentMethod.replace('_', ' ')}</p>
                          <p className="capitalize">Shipping: {shippingMethod}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="px-6 py-2 border border-primary-600 hover:border-primary-500 text-white rounded-lg transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {step < 4 ? (
                  <button
                    onClick={nextStep}
                    className="ml-auto px-6 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="ml-auto px-8 py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="bg-primary-800 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-primary-300">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary-300">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary-300">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-primary-600 pt-3">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="text-center">
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

export default Checkout