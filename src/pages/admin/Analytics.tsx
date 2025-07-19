import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

interface AnalyticsData {
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
  salesByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
  ordersByStatus: Array<{
    status: string
    count: number
  }>
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
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
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'processing': return 'bg-purple-500'
      case 'shipped': return 'bg-indigo-500'
      case 'delivered': return 'bg-green-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
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
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-primary-300 mt-2">Detailed insights into your store performance</p>
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Average Order Value</p>
                <p className="text-3xl font-bold text-white">
                  ${analytics ? (analytics.totalRevenue / analytics.totalOrders || 0).toFixed(2) : '0'}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUpIcon className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-green-400 text-sm">+3.8%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-600 bg-opacity-20 rounded-full">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-300 text-sm font-medium">Total Customers</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <h2 className="text-xl font-bold text-white mb-6">Orders by Status</h2>
            <div className="space-y-4">
              {analytics?.ordersByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)}`}></div>
                    <span className="text-white capitalize">{item.status}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-primary-300">{item.count} orders</span>
                    <div className="w-24 bg-primary-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                        style={{ 
                          width: `${(item.count / (analytics?.totalOrders || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary-800 rounded-lg p-6 border border-primary-700"
          >
            <h2 className="text-xl font-bold text-white mb-6">Top Selling Products</h2>
            <div className="space-y-4">
              {analytics?.topProducts?.map((item, index) => (
                <div key={item._id} className="flex items-center space-x-4">
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
                    <p className="text-white font-medium">{item.totalSold}</p>
                    <p className="text-primary-300 text-sm">sold</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sales Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-primary-800 rounded-lg p-6 border border-primary-700"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Sales Overview</h2>
            <div className="flex items-center space-x-2 text-primary-300">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm">{timeRange}</span>
            </div>
          </div>
          
          {/* Simple Bar Chart Representation */}
          <div className="space-y-4">
            {analytics?.salesByMonth?.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{month.month}</span>
                  <div className="text-right">
                    <p className="text-white font-medium">${month.revenue.toLocaleString()}</p>
                    <p className="text-primary-300 text-sm">{month.orders} orders</p>
                  </div>
                </div>
                <div className="w-full bg-primary-600 rounded-full h-3">
                  <div 
                    className="bg-accent-600 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(month.revenue / Math.max(...(analytics?.salesByMonth?.map(m => m.revenue) || [1]))) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-primary-800 rounded-lg p-6 border border-primary-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {analytics?.recentOrders?.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-primary-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-600 rounded-lg">
                    <ShoppingBagIcon className="h-5 w-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">#{order.orderNumber}</p>
                    <p className="text-primary-300 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${order.total.toFixed(2)}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminAnalytics