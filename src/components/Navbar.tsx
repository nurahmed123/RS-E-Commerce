import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface SearchSuggestion {
  products: Array<{ _id: string; name: string; slug: string }>
  categories: Array<{ _id: string; name: string; slug: string }>
}

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion>({ products: [], categories: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/search/suggestions?q=${searchQuery}`)
          setSearchSuggestions(response.data)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
        }
      } else {
        setSearchSuggestions({ products: [], categories: [] })
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (type: 'product' | 'category', slug: string) => {
    if (type === 'product') {
      navigate(`/products/${slug}`)
    } else {
      navigate(`/products?category=${slug}`)
    }
    setShowSuggestions(false)
    setSearchQuery('')
  }

  return (
    <nav className="bg-primary-900 border-b border-primary-700 sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-white">RoboTech</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search robotics equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-primary-800 border border-primary-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
              </div>
            </form>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && (searchSuggestions.products.length > 0 || searchSuggestions.categories.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-primary-800 border border-primary-600 rounded-lg shadow-lg z-50"
                >
                  {searchSuggestions.products.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs text-primary-400 uppercase tracking-wide mb-2">Products</div>
                      {searchSuggestions.products.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleSuggestionClick('product', product.slug)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-700 rounded"
                        >
                          {product.name}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {searchSuggestions.categories.length > 0 && (
                    <div className="p-2 border-t border-primary-600">
                      <div className="text-xs text-primary-400 uppercase tracking-wide mb-2">Categories</div>
                      {searchSuggestions.categories.map((category) => (
                        <button
                          key={category._id}
                          onClick={() => handleSuggestionClick('category', category.slug)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-primary-700 rounded"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-primary-200 hover:text-white transition-colors">
              Products
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-primary-200 hover:text-white transition-colors">
              <ShoppingCartIcon className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-primary-200 hover:text-white transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="hidden lg:block">{user.username}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-primary-800 border border-primary-600 rounded-lg shadow-lg z-50"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-white hover:bg-primary-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-white hover:bg-primary-700"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout()
                            setIsUserMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-primary-700"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <UserIcon className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary-200 hover:text-white"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search robotics equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-primary-800 border border-primary-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-primary-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-800 border-t border-primary-700"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/products"
                className="block text-primary-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              <Link
                to="/cart"
                className="flex items-center space-x-2 text-primary-200 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Cart ({getTotalItems()})</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block text-primary-200 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-primary-200 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="block text-primary-200 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block text-primary-200 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar