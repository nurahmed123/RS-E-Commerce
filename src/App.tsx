import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminCoupons from './pages/admin/Coupons'
import AdminAnalytics from './pages/admin/Analytics'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-900 text-white">
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute adminOnly>
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/coupons" element={
            <ProtectedRoute adminOnly>
              <AdminCoupons />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App