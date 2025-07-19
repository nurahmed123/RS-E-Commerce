import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
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
  category: {
    _id: string
    name: string
  }
  isActive: boolean
  isFeatured: boolean
}

interface Category {
  _id: string
  name: string
  slug: string
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    comparePrice: '',
    description: '',
    shortDescription: '',
    sku: '',
    stock: '',
    brand: '',
    category: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    specifications: [{ name: '', value: '' }],
    variants: [{ name: '', options: [''] }]
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?limit=100`)
      setProducts(response.data.products)
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

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      comparePrice: '',
      description: '',
      shortDescription: '',
      sku: '',
      stock: '',
      brand: '',
      category: '',
      tags: '',
      isActive: true,
      isFeatured: false,
      specifications: [{ name: '', value: '' }],
      variants: [{ name: '', options: [''] }]
    })
    setSelectedImages([])
    setExistingImages([])
    setEditingProduct(null)
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        comparePrice: product.comparePrice?.toString() || '',
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        stock: product.stock.toString(),
        brand: product.brand,
        category: product.category._id,
        tags: product.tags.join(', '),
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        specifications: product.specifications.length > 0 ? product.specifications : [{ name: '', value: '' }],
        variants: product.variants.length > 0 ? product.variants : [{ name: '', options: [''] }]
      })
      setExistingImages(product.images)
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files))
    }
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }))
  }

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const updateSpecification = (index: number, field: 'name' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', options: [''] }]
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const updateVariant = (index: number, field: 'name', value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const updateVariantOption = (variantIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { 
              ...variant, 
              options: variant.options.map((option, j) => j === optionIndex ? value : option)
            } 
          : variant
      )
    }))
  }

  const addVariantOption = (variantIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, options: [...variant.options, ''] }
          : variant
      )
    }))
  }

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === variantIndex 
          ? { ...variant, options: variant.options.filter((_, j) => j !== optionIndex) }
          : variant
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const submitData = new FormData()
      
      // Calculate discount percentage
      const price = parseFloat(formData.price)
      const comparePrice = formData.comparePrice ? parseFloat(formData.comparePrice) : 0
      const discountPercentage = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
      
      const productData = {
        ...formData,
        price,
        comparePrice: comparePrice || undefined,
        discountPercentage,
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        specifications: formData.specifications.filter(spec => spec.name && spec.value),
        variants: formData.variants.filter(variant => variant.name && variant.options.some(opt => opt.trim())),
        existingImages
      }
      
      submitData.append('productData', JSON.stringify(productData))
      
      selectedImages.forEach((image) => {
        submitData.append('images', image)
      })

      if (editingProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${editingProduct._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product updated successfully!')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/products`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Product created successfully!')
      }
      
      closeModal()
      fetchProducts()
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/products/${id}`)
      toast.success('Product deleted successfully!')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category._id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products</h1>
            <p className="text-primary-300 mt-2">Manage your product catalog</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-primary-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-primary-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-primary-700 border border-primary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <div className="text-primary-300 flex items-center">
              {filteredProducts.length} products found
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-primary-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-primary-300 uppercase tracking-wider">
                    Stock
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
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-primary-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`${import.meta.env.VITE_API_URL}${product.images[0]}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <div className="text-white font-medium">{product.name}</div>
                          <div className="text-primary-300 text-sm">{product.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-primary-300">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">${product.price.toFixed(2)}</div>
                      {product.comparePrice && (
                        <div className="text-primary-400 text-sm line-through">
                          ${product.comparePrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {product.isActive && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(product)}
                          className="text-accent-500 hover:text-accent-400"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
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

        {/* Product Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-primary-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-primary-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">SKU *</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Compare Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Stock *</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Brand</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Tags</label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Comma separated tags"
                        className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label className="block text-white font-medium mb-2">Short Description</label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                      rows={2}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-white font-medium mb-2">Product Images</label>
                    
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-primary-300 text-sm mb-2">Current Images:</p>
                        <div className="flex flex-wrap gap-2">
                          {existingImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={`${import.meta.env.VITE_API_URL}${image}`}
                                alt={`Product ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                    
                    {selectedImages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-primary-300 text-sm">Selected: {selectedImages.length} new image(s)</p>
                      </div>
                    )}
                  </div>

                  {/* Specifications */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-white font-medium">Specifications</label>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="text-accent-500 hover:text-accent-400 text-sm"
                      >
                        + Add Specification
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.specifications.map((spec, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={spec.name}
                            onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                            className="flex-1 bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={spec.value}
                            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                            className="flex-1 bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecification(index)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-white font-medium">Variants</label>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="text-accent-500 hover:text-accent-400 text-sm"
                      >
                        + Add Variant
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.variants.map((variant, variantIndex) => (
                        <div key={variantIndex} className="bg-primary-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <input
                              type="text"
                              placeholder="Variant name (e.g., Color, Size)"
                              value={variant.name}
                              onChange={(e) => updateVariant(variantIndex, 'name', e.target.value)}
                              className="flex-1 bg-primary-600 border border-primary-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariant(variantIndex)}
                              className="ml-2 text-red-500 hover:text-red-400"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {variant.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex space-x-2">
                                <input
                                  type="text"
                                  placeholder="Option value"
                                  value={option}
                                  onChange={(e) => updateVariantOption(variantIndex, optionIndex, e.target.value)}
                                  className="flex-1 bg-primary-600 border border-primary-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeVariantOption(variantIndex, optionIndex)}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addVariantOption(variantIndex)}
                              className="text-accent-500 hover:text-accent-400 text-sm"
                            >
                              + Add Option
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Toggles */}
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <span className="ml-2 text-white">Active</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <span className="ml-2 text-white">Featured</span>
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
                      {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
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

export default AdminProducts