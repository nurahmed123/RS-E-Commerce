import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  PencilIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  user?: { username: string; email: string }
  guestEmail?: string
  items: Array<{
    product: {
      name: string
      images: string[]
    }
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  trackingNumber?: string
  createdAt: string
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders`)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      setUpdatingStatus(true)
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/status`, {
        status,
        trackingNumber
      })
      toast.success('Order status updated successfully!')
      fetchOrders()
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status, trackingNumber })
      }
    } catch (error: any) {
      console.error('Error updating order status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400 bg-opacity-20'
      case 'confirmed': return 'text-blue-400 bg-blue-400 bg-opacity-20'
      case 'processing': return 'text-purple-400 bg-purple-400 bg-opacity-20'
      case 'shipped': return 'text-indigo-400 bg-indigo-400 bg-opacity-20'
      case 'delivered': return 'text-green-400 bg-green-400 bg-opacity-20'
      case 'cancelled': return 'text-red-400 bg-red-400 bg-opacity-20'
      default: return 'text-primary-400 bg-primary-400 bg-opacity-20'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400 bg-opacity-20'
      case 'pending': return 'text-yellow-400 bg-yellow-400 bg-opacity-20'
      case 'failed': return 'text-red-400 bg-red-400 bg-opacity-20'
      case 'refunded': return 'text-blue-400 bg-blue-400 bg-opacity-20'
      default: return 'text-primary-400 bg-primary-400 bg-opacity-20'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.user?.username || order.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setSelectedOrder(null)
    setShowOrderModal(false)
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-primary-300 mt-2">Manage customer orders and fulfillment</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-primary-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-primary-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <div className="text-primary-300 flex items-center">
              {filteredOrders.length} orders found
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-primary-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">#{order.orderNumber}</div>
                        <div className="text-primary-300 text-sm">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white">
                        {order.user?.username || 'Guest'}
                      </div>
                      <div className="text-primary-300 text-sm">
                        {order.user?.email || order.guestEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">${order.total.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-primary-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-accent-500 hover:text-accent-400"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-blue-500 hover:text-blue-400"
                          title="Download Invoice"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={closeOrderModal}
                  className="text-primary-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Order Information</h3>
                    <div className="bg-primary-700 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-primary-300">Order Date:</span>
                        <span className="text-white">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-300">Payment Method:</span>
                        <span className="text-white capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-300">Payment Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Customer Information</h3>
                    <div className="bg-primary-700 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-primary-300">Name:</span>
                        <span className="text-white">{selectedOrder.user?.username || 'Guest'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-300">Email:</span>
                        <span className="text-white">{selectedOrder.user?.email || selectedOrder.guestEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Shipping Address</h3>
                    <div className="bg-primary-700 p-4 rounded-lg">
                      <div className="text-white space-y-1">
                        <p>{selectedOrder.shippingAddress.name}</p>
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                        </p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items & Status */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-primary-700 p-4 rounded-lg">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${item.product.images[0]}`}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.product.name}</p>
                            <p className="text-primary-300 text-sm">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-primary-300 text-sm">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Order Summary</h3>
                    <div className="bg-primary-700 p-4 rounded-lg space-y-3">
                      <div className="flex justify-between">
                        <span className="text-primary-300">Subtotal:</span>
                        <span className="text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-300">Tax:</span>
                        <span className="text-white">${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-300">Shipping:</span>
                        <span className="text-white">${selectedOrder.shipping.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-primary-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Total:</span>
                          <span className="text-white font-bold text-lg">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Update Status</h3>
                    <div className="bg-primary-700 p-4 rounded-lg space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Order Status</label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                          disabled={updatingStatus}
                          className="w-full bg-primary-600 border border-primary-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      
                      {selectedOrder.status === 'shipped' && (
                        <div>
                          <label className="block text-white font-medium mb-2">Tracking Number</label>
                          <input
                            type="text"
                            value={selectedOrder.trackingNumber || ''}
                            onChange={(e) => {
                              setSelectedOrder({ ...selectedOrder, trackingNumber: e.target.value })
                            }}
                            onBlur={(e) => {
                              if (e.target.value !== selectedOrder.trackingNumber) {
                                updateOrderStatus(selectedOrder._id, selectedOrder.status, e.target.value)
                              }
                            }}
                            placeholder="Enter tracking number"
                            className="w-full bg-primary-600 border border-primary-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={closeOrderModal}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrders