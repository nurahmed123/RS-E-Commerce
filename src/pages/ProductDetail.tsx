import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  StarIcon, 
  HeartIcon, 
  ShareIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon
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
  description: string
  shortDescription: string
  sku: string
  stock: number
  brand: string
  specifications: Array<{ name: string; value: string }>
  variants: Array<{ name: string; options: string[] }>
  tags: string[]
  averageRating: number
  totalReviews: number
  reviews: Array<{
    _id: string
    user: { username: string; avatar: string }
    rating: number
    comment: string
    isVerified: boolean
    createdAt: string
  }>
  category: {
    _id: string
    name: string
    slug: string
  }
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description')
  const { addToCart } = useCart()

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${slug}`)
      setProduct(response.data)
      
      // Fetch related products
      if (response.data.category) {
        const relatedResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products?category=${response.data.category._id}&limit=4`
        )
        setRelatedProducts(relatedResponse.data.products.filter((p: Product) => p._id !== response.data._id))
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    const variantString = Object.entries(selectedVariants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')

    addToCart({
      id: `${product._id}-${Object.values(selectedVariants).join('-')}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[selectedImage],
      stock: product.stock,
      variant: variantString
    }, quantity)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.shortDescription,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link to="/products" className="text-accent-500 hover:text-accent-400">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-primary-300 mb-8">
          <Link to="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category.slug}`} className="hover:text-white">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-primary-800 rounded-lg overflow-hidden group">
              <img
                src={`${import.meta.env.VITE_API_URL}${product.images[selectedImage]}`}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
              
              {/* Zoom Button */}
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MagnifyingGlassPlusIcon className="h-6 w-6" />
              </button>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{product.discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-accent-500' : 'border-primary-600'
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-primary-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-primary-300">
                  {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
                </span>
              </div>
              <p className="text-primary-300 mb-4">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-accent-500">
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-primary-400 line-through">
                  ${product.comparePrice.toFixed(2)}
                </span>
              )}
              {product.discountPercentage > 0 && (
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                  Save ${((product.comparePrice || 0) - product.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-primary-200 text-lg leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants */}
            {product.variants.map((variant) => (
              <div key={variant.name} className="space-y-2">
                <label className="block text-white font-medium">{variant.name}:</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedVariants[variant.name] === option
                          ? 'border-accent-500 bg-accent-600 text-white'
                          : 'border-primary-600 bg-primary-800 text-primary-200 hover:border-primary-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">
                    {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-primary-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-white border-x border-primary-600">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-accent-600 hover:bg-accent-700 disabled:bg-primary-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-medium"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="flex items-center space-x-2 border border-primary-600 hover:border-primary-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>Wishlist</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 border border-primary-600 hover:border-primary-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <ShareIcon className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-primary-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-6 w-6 text-accent-500" />
                <div>
                  <p className="text-white font-medium">Free Shipping</p>
                  <p className="text-primary-300 text-sm">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-accent-500" />
                <div>
                  <p className="text-white font-medium">30-Day Returns</p>
                  <p className="text-primary-300 text-sm">Money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-primary-700 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: `Reviews (${product.totalReviews})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent-500 text-accent-500'
                      : 'border-transparent text-primary-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-primary-800 rounded-lg p-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <div className="text-primary-200 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-primary-700">
                    <span className="text-primary-300 font-medium">{spec.name}</span>
                    <span className="text-white">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {product.reviews.length === 0 ? (
                  <p className="text-primary-300 text-center py-8">No reviews yet</p>
                ) : (
                  product.reviews.map((review) => (
                    <div key={review._id} className="border-b border-primary-700 pb-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.user.avatar}
                          alt={review.user.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-white font-medium">{review.user.username}</h4>
                            {review.isVerified && (
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-primary-500'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-primary-400 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-primary-200">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  to={`/products/${relatedProduct.slug}`}
                  className="bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${relatedProduct.images[0]}`}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-accent-500 font-bold">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-primary-300 text-sm ml-1">
                          {relatedProduct.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white text-2xl z-10"
            >
              ×
            </button>
            <img
              src={`${import.meta.env.VITE_API_URL}${product.images[selectedImage]}`}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail