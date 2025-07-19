import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Category
  isActive: boolean
  createdAt: string
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    isActive: true
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`)
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent: '',
      isActive: true
    })
    setSelectedImage(null)
    setEditingCategory(null)
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        parent: category.parent?._id || '',
        isActive: category.isActive
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('parent', formData.parent)
      submitData.append('isActive', formData.isActive.toString())
      
      if (selectedImage) {
        submitData.append('image', selectedImage)
      }

      if (editingCategory) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/categories/${editingCategory._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category updated successfully!')
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/categories`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Category created successfully!')
      }
      
      closeModal()
      fetchCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(error.response?.data?.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/categories/${id}`)
      toast.success('Category deleted successfully!')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const parentCategories = categories.filter(cat => !cat.parent)

  return (
    <div className="min-h-screen bg-primary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Categories</h1>
            <p className="text-primary-300 mt-2">Organize your products into categories</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Category Image */}
              <div className="h-48 bg-primary-700 flex items-center justify-center">
                {category.image ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PhotoIcon className="h-16 w-16 text-primary-500" />
                )}
              </div>

              {/* Category Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    {category.parent && (
                      <p className="text-primary-400 text-sm">
                        Parent: {category.parent.name}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal(category)}
                      className="text-accent-500 hover:text-accent-400"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-primary-300 text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-primary-400 text-xs">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && !loading && (
          <div className="text-center py-12">
            <PhotoIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No categories yet</h3>
            <p className="text-primary-300 mb-6">Create your first category to organize your products</p>
            <button
              onClick={() => openModal()}
              className="bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Add Category
            </button>
          </div>
        )}

        {/* Category Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-primary-800 rounded-lg p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-primary-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Category Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Parent Category</label>
                    <select
                      value={formData.parent}
                      onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="">No Parent (Top Level)</option>
                      {parentCategories
                        .filter(cat => !editingCategory || cat._id !== editingCategory._id)
                        .map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Category Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full bg-primary-700 border border-primary-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                    {editingCategory?.image && !selectedImage && (
                      <div className="mt-2">
                        <img
                          src={`${import.meta.env.VITE_API_URL}${editingCategory.image}`}
                          alt="Current"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <p className="text-primary-300 text-sm mt-1">Current image</p>
                      </div>
                    )}
                  </div>

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
                      {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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

export default AdminCategories