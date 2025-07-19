import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useCart } from '../contexts/CartContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  discountPercentage: number
  images: string[]
  shortDescription: string
  averageRating: number
  totalReviews: number
  stock: number
  brand: string
  category: {
    _id: string
    name: string
    slug: string
  }
  isFeatured: boolean
  tags: string[]
}

interface Category {
  _id: string
  name: string
  slug: string
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const { addToCart } = useCart()

  // Filter states
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    featured: searchParams.get('featured') || ''
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [searchParams])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?${params}`)
      setProducts(response.data.products)
      setPagination({
        currentPage: parseInt(response.data.currentPage),
        totalPages: response.data.totalPages,
        total: response.data.total
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'createdAt',
      order: 'desc',
      featured: ''
    })
    setSearchParams({})
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: `${product._id}-default`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock
    })
  }

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {filters.search ? `Search results for "${filters.search}"` : 'Products'}
            </h1>
            <p className="text-primary-300">
              {pagination.total} products found
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-primary-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-accent-600 text-white' : 'text-primary-400'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-accent-600 text-white' : 'text-primary-400'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Sort */}
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                updateFilters({ sort, order })
              }}
              className="bg-primary-800 border border-primary-600 text-white rounded-lg px-3 py-2"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="averageRating-desc">Highest Rated</option>
              <option value="name-asc">Name: A to Z</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-primary-800 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-64 bg-primary-800 rounded-lg p-6 h-fit"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-accent-500 hover:text-accent-400 text-sm"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category._id} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.slug}
                          checked={filters.category === category.slug}
                          onChange={(e) => updateFilters({ category: e.target.value })}
                          className="text-accent-600 focus:ring-accent-500"
                        />
                        <span className="ml-2 text-primary-300">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">Brands</h4>
                    <div className="space-y-2">
                      {brands.map(brand => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={filters.brand === brand}
                            onChange={(e) => updateFilters({ brand: e.target.value })}
                            className="text-accent-600 focus:ring-accent-500"
                          />
                          <span className="ml-2 text-primary-300">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={filters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded px-3 py-2"
                    />
                  </div>
                </div>

                {/* Featured */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured === 'true'}
                      onChange={(e) => updateFilters({ featured: e.target.checked ? 'true' : '' })}
                      className="text-accent-600 focus:ring-accent-500"
                    />
                    <span className="ml-2 text-primary-300">Featured Products</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-primary-300 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                  : 'space-y-6'
                }>
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={viewMode === 'grid' 
                        ? 'bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group'
                        : 'bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group flex'
                      }
                    >
                      {/* Product Image */}
                      <div className={viewMode === 'grid' ? 'relative overflow-hidden' : 'relative overflow-hidden w-64 flex-shrink-0'}>
                        <Link to={`/products/${product.slug}`}>
                          <img
                            src={`${import.meta.env.VITE_API_URL}${product.images[0]}`}
                            alt={product.name}
                            className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                              viewMode === 'grid' ? 'h-64' : 'h-full'
                            }`}
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 space-y-2">
                          {product.isFeatured && (
                            <span className="bg-accent-600 text-white text-xs px-2 py-1 rounded">
                              Featured
                            </span>
                          )}
                          {product.discountPercentage > 0 && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                              -{product.discountPercentage}%
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product._id)}
                          className="absolute top-3 right-3 p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
                        >
                          {wishlist.includes(product._id) ? (
                            <HeartSolidIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-6 flex-1">
                        <Link to={`/products/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-500 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-primary-300 text-sm mb-3 line-clamp-2">
                          {product.shortDescription}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.averageRating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-primary-500'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-primary-400 text-sm ml-2">
                            ({product.totalReviews})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-accent-500">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.comparePrice && (
                              <span className="text-sm text-primary-400 line-through">
                                ${product.comparePrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.stock <= 5 && product.stock > 0 && (
                            <span className="text-orange-400 text-xs">
                              Only {product.stock} left
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className="w-full flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <ShoppingCartIcon className="h-5 w-5" />
                          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex space-x-2">
                      {[...Array(pagination.totalPages)].map((_, index) => {
                        const page = index + 1
                        return (
                          <button
                            key={page}
                            onClick={() => {
                              const params = new URLSearchParams(searchParams)
                              params.set('page', page.toString())
                              setSearchParams(params)
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              page === pagination.currentPage
                                ? 'bg-accent-600 text-white'
                                : 'bg-primary-800 text-primary-300 hover:bg-primary-700'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products