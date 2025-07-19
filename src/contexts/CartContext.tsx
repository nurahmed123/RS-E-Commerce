import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import toast from 'react-hot-toast'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  variant?: string
  stock: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => 
        i.productId === item.productId && i.variant === item.variant
      )

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`)
          return prevItems
        }
        
        toast.success('Cart updated!')
        return prevItems.map(i =>
          i.productId === item.productId && i.variant === item.variant
            ? { ...i, quantity: newQuantity }
            : i
        )
      } else {
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`)
          return prevItems
        }
        
        toast.success('Added to cart!')
        return [...prevItems, { ...item, quantity }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
    toast.success('Removed from cart')
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} items available in stock`)
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success('Cart cleared')
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const isInCart = (productId: string) => {
    return items.some(item => item.productId === productId)
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}