import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  MapPinIcon, 
  CreditCardIcon,
  ClockIcon,
  HeartIcon,
  BellIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Order {
  _id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: Array<{
    product: {
      name: string
      images: string[]
    }
    quantity: number
    price: number
  }>
}

const Profile: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: ''
  })

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'shipping',
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      isDefault: true
    }
  ])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/orders`)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      await axios.put(`${import.meta.env.VITE_API_URL}/api/user/profile`, profileData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
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

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: UserIcon },
    { id: 'orders', label: 'Order History', icon: ClockIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    { id: 'payment', label: 'Payment Methods', icon: CreditCardIcon },
    { id: 'wishlist', label: 'Wishlist', icon: HeartIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon }
  ]

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-primary-800 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                  <p className="text-primary-300">{user?.email}</p>
                </div>
              </div>
            </div>

            <nav className="bg-primary-800 rounded-lg p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-accent-600 text-white'
                          : 'text-primary-300 hover:bg-primary-700 hover:text-white'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-primary-800 rounded-lg p-6"
            >
              {/* Profile Info */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="mt-6 px-6 py-2 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              )}

              {/* Order History */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-primary-300">No orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-primary-700 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-white">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-primary-300 text-sm">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-accent-500">
                                ${order.total.toFixed(2)}
                              </p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {order.items.slice(0, 3).map((item, index) => (
                              <img
                                key={index}
                                src={`${import.meta.env.VITE_API_URL}${item.product.images[0]}`}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-primary-300 text-sm">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-primary-300 text-sm">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex space-x-2">
                              <button className="flex items-center space-x-1 text-accent-500 hover:text-accent-400 text-sm">
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                <span>Invoice</span>
                              </button>
                              <button className="text-accent-500 hover:text-accent-400 text-sm">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Saved Addresses</h2>
                    <button className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors">
                      Add New Address
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-primary-700 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-white capitalize">
                              {address.type} Address
                            </h3>
                            {address.isDefault && (
                              <span className="inline-block px-2 py-1 bg-accent-600 text-white text-xs rounded mt-1">
                                Default
                              </span>
                            )}
                          </div>
                          <button className="text-accent-500 hover:text-accent-400 text-sm">
                            Edit
                          </button>
                        </div>
                        
                        <div className="text-primary-200 text-sm space-y-1">
                          <p>{address.name}</p>
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {activeTab === 'payment' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
                    <button className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors">
                      Add New Card
                    </button>
                  </div>
                  
                  <div className="text-center py-8">
                    <CreditCardIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-primary-300">No payment methods saved</p>
                    <p className="text-primary-400 text-sm">Add a payment method to make checkout faster</p>
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Wishlist</h2>
                  
                  <div className="text-center py-8">
                    <HeartIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-primary-300">Your wishlist is empty</p>
                    <p className="text-primary-400 text-sm">Save items you love for later</p>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Order Updates</h3>
                        <p className="text-primary-300 text-sm">Get notified about order status changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Promotional Emails</h3>
                        <p className="text-primary-300 text-sm">Receive emails about sales and new products</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">SMS Notifications</h3>
                        <p className="text-primary-300 text-sm">Get text messages for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-primary-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-primary-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Two-Factor Authentication</p>
                            <p className="text-primary-300 text-sm">Add an extra layer of security</p>
                          </div>
                          <button className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors">
                            Enable
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white">Login Activity</p>
                            <p className="text-primary-300 text-sm">View recent login attempts</p>
                          </div>
                          <button className="text-accent-500 hover:text-accent-400">
                            View Activity
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-700 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        <button className="w-full text-left p-3 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors">
                          <p className="text-white">Download Your Data</p>
                          <p className="text-primary-300 text-sm">Get a copy of your account data</p>
                        </button>
                        
                        <button className="w-full text-left p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                          <p className="text-white">Delete Account</p>
                          <p className="text-red-200 text-sm">Permanently delete your account and data</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile