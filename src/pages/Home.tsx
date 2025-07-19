import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowRightIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'

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
  isFeatured: boolean
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?featured=true&limit=8`)
        setFeaturedProducts(response.data.products)
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Quality Guarantee',
      description: '30-day money-back guarantee'
    },
    {
      icon: CpuChipIcon,
      title: 'Latest Technology',
      description: 'Cutting-edge robotics components'
    },
    {
      icon: WrenchScrewdriverIcon,
      title: 'Expert Support',
      description: '24/7 technical assistance'
    }
  ]

  const categories = [
    {
      name: 'Sensors',
      description: 'Advanced sensing solutions',
      image: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'sensors'
    },
    {
      name: 'Actuators',
      description: 'Precision movement control',
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'actuators'
    },
    {
      name: 'Controllers',
      description: 'Brain of your robots',
      image: 'https://images.pexels.com/photos/2582932/pexels-photo-2582932.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'controllers'
    },
    {
      name: 'Power Systems',
      description: 'Reliable power solutions',
      image: 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'power-systems'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Robotics Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Build the
                <span className="text-accent-500 block">Future</span>
                with Robotics
              </h1>
              <p className="text-xl md:text-2xl text-primary-200 max-w-3xl mx-auto mb-8">
                Discover cutting-edge robotics components, sensors, and controllers 
                to bring your innovative projects to life.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/products"
                className="inline-flex items-center px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Shop Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/products?featured=true"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary-900 font-semibold rounded-lg transition-all duration-300"
              >
                Featured Products
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20">
          <BoltIcon className="h-16 w-16 text-accent-500 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <CpuChipIcon className="h-20 w-20 text-accent-500 animate-pulse" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-primary-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-primary-300 max-w-2xl mx-auto">
              Explore our comprehensive range of robotics components
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group block bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-accent-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-primary-300">{category.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-primary-300 max-w-2xl mx-auto">
              Discover our most popular and innovative robotics components
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-primary-700 rounded-lg p-4 animate-pulse">
                  <div className="bg-primary-600 h-48 rounded mb-4"></div>
                  <div className="bg-primary-600 h-4 rounded mb-2"></div>
                  <div className="bg-primary-600 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={`/products/${product.slug}`}
                    className="group block bg-primary-700 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-w-1 aspect-h-1 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-primary-300 text-sm mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                      
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

                      <div className="flex items-center justify-between">
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
                        {product.discountPercentage > 0 && (
                          <span className="bg-accent-600 text-white text-xs px-2 py-1 rounded">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-lg transition-colors duration-300"
            >
              View All Products
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-accent-600 to-accent-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-accent-100 mb-8">
            Get the latest news about new products and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent-600"
            />
            <button className="px-8 py-3 bg-white text-accent-600 font-semibold rounded-lg hover:bg-accent-50 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home