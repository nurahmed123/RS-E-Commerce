import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import { Link } from 'react-router-dom'

interface Analytics {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  recentOrders: Array<{
    _id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    user?: { username: string }
    guestEmail?: string
  }>
  topProducts: Array<{
    _id: string
    totalSold: number
    product: {
      name: string
      images: string[]
      price: number
    }
  }>
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/analytics?range=${timeRange}`)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-primary-300 mt-2">Welcome back! Here's what's happening with your store.</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-primary-800 border border-primary-600 text-white rounded-lg px-4 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white">
                  ${analytics?.totalRevenue.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-accent-600 bg-opacity-20 rounded-full">
                <CurrencyDollarIcon className="h-8 w-8 text-accent-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.totalOrders.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+8.2%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-600 bg-opacity-20 rounded-full">
                <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.totalProducts.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+3.1%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-600 bg-opacity-20 rounded-full">
                <CubeIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-white">
                  {analytics?.totalUsers.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDownIcon className="h-4 w-4 text-red-400 mr-1" />
                  <span className="text-red-400 text-sm">-2.4%</span>
                </div>
              </div>
              <div className="p-3 bg-green-600 bg-opacity-20 rounded-full">
                <UsersIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-accent-500 hover:text-accent-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {analytics?.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 bg-primary-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-600 rounded-lg">
                      <ShoppingBagIcon className="h-5 w-5 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">#{order.orderNumber}</p>
                      <p className="text-primary-300 text-sm">
                        {order.user?.username || order.guestEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Top Products</h2>
              <Link
                to="/admin/products"
                className="text-accent-500 hover:text-accent-400 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {analytics?.topProducts.map((item, index) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 bg-primary-700 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-accent-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={`${import.meta.env.VITE_API_URL}${item.product.images[0]}`}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-primary-300 text-sm">${item.product.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{item.totalSold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-primary-800 rounded-lg p-6 border border-primary-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="flex items-center space-x-3 p-4 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors group"
            >
              <CubeIcon className="h-8 w-8 text-accent-500 group-hover:text-accent-400" />
              <div>
                <p className="text-white font-medium">Manage Products</p>
                <p className="text-primary-300 text-sm">Add, edit, or remove products</p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center space-x-3 p-4 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors group"
            >
              <ShoppingBagIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-400" />
              <div>
                <p className="text-white font-medium">Process Orders</p>
                <p className="text-primary-300 text-sm">View and update order status</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center space-x-3 p-4 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors group"
            >
              <EyeIcon className="h-8 w-8 text-purple-500 group-hover:text-purple-400" />
              <div>
                <p className="text-white font-medium">Categories</p>
                <p className="text-primary-300 text-sm">Organize product categories</p>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="flex items-center space-x-3 p-4 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors group"
            >
              <TrendingUpIcon className="h-8 w-8 text-green-500 group-hover:text-green-400" />
              <div>
                <p className="text-white font-medium">Analytics</p>
                <p className="text-primary-300 text-sm">View detailed reports</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard