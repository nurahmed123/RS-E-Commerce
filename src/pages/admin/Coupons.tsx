import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit: number
  usedCount: number
  isActive: boolean
  validFrom: string
  validUntil: string
  createdAt: string
}

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    isActive: true,
    validFrom: '',
    validUntil: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/coupons`)
      setCoupons(response.data)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minimumAmount: '',
      maximumDiscount: '',
      usageLimit: '',
      isActive: true,
      validFrom: '',
      validUntil: ''
    })
    setEditingCoupon(null)
  }

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minimumAmount: coupon.minimumAmount?.toString() || '',
        maximumDiscount: coupon.maximumDiscount?.toString() || '',
        usageLimit: coupon.usageLimit.toString(),
        isActive: coupon.isActive,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0]
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const submitData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : undefined,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        usageLimit: parseInt(formData.usageLimit),
        isActive: formData.isActive,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil)
      }

      if (editingCoupon) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${editingCoupon._id}`, submitData)
        toast.success('Coupon updated successfully!')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, submitData)
        toast.success('Coupon created successfully!')
      }
      
      closeModal()
      fetchCoupons()
    } catch (error: any) {
      console.error('Error saving coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to save coupon')
    } finally {
      setLoading(false)
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${id}`)
      toast.success('Coupon deleted successfully!')
      fetchCoupons()
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return 'bg-gray-100 text-gray-800'
    if (isExpired(coupon.validUntil)) return 'bg-red-100 text-red-800'
    if (coupon.usedCount >= coupon.usageLimit) return 'bg-orange-100 text-orange-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inactive'
    if (isExpired(coupon.validUntil)) return 'Expired'
    if (coupon.usedCount >= coupon.usageLimit) return 'Used Up'
    return 'Active'
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Coupons</h1>
            <p className="text-primary-300 mt-2">Manage discount coupons and promotional codes</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Coupon</span>
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-primary-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-accent-500 mr-3" />
                        <div>
                          <div className="text-white font-medium font-mono">{coupon.code}</div>
                          <div className="text-primary-300 text-sm">
                            {coupon.minimumAmount && `Min: $${coupon.minimumAmount}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                      </div>
                      {coupon.maximumDiscount && coupon.type === 'percentage' && (
                        <div className="text-primary-300 text-sm">
                          Max: ${coupon.maximumDiscount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </div>
                      <div className="w-full bg-primary-600 rounded-full h-2 mt-1">
                        <div 
                          className="bg-accent-600 h-2 rounded-full" 
                          style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-primary-300 text-sm">
                      <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                      <div>to {new Date(coupon.validUntil).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon)}`}>
                        {getStatusText(coupon)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(coupon)}
                          className="text-accent-500 hover:text-accent-400"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {coupons.length === 0 && !loading && (
          <div className="text-center py-12">
            <TagIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No coupons yet</h3>
            <p className="text-primary-300 mb-6">Create your first coupon to offer discounts to customers</p>
            <button
              onClick={() => openModal()}
              className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add Coupon
            </button>
          </div>
        )}

        {/* Coupon Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-primary-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-primary-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Coupon Code */}
                  <div>
                    <label className="block text-white font-medium mb-2">Coupon Code *</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        className="flex-1 bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
                        placeholder="DISCOUNT10"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateCouponCode}
                        className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  {/* Discount Type and Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Discount Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'percentage' | 'fixed' }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                      </label>
                      <input
                        type="number"
                        step={formData.type === 'percentage' ? '1' : '0.01'}
                        min="0"
                        max={formData.type === 'percentage' ? '100' : undefined}
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Minimum Order Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimumAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    {formData.type === 'percentage' && (
                      <div>
                        <label className="block text-white font-medium mb-2">Maximum Discount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.maximumDiscount}
                          onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: e.target.value }))}
                          className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          placeholder="No limit"
                        />
                      </div>
                    )}
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-white font-medium mb-2">Usage Limit *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>

                  {/* Valid Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Valid From *</label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Valid Until *</label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <span className="ml-2 text-white">Active</span>
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 border border-primary-600 hover:border-primary-500 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 text-white rounded-lg transition-colors"
                    >
                      {loading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AdminCoupons