'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Product } from '@/lib/products'
import type { AvocadoVariety } from '@/lib/varieties'

interface CartItem {
  product: Product
  quantity: number
  variety?: AvocadoVariety // For avocado boxes, specifies Hass or Lamb Hass
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, variety?: AvocadoVariety) => void
  removeFromCart: (productId: string, variety?: AvocadoVariety) => void
  updateQuantity: (productId: string, quantity: number, variety?: AvocadoVariety) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('amandi-cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setItems(parsedCart)
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('amandi-cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity: number = 1, variety?: AvocadoVariety) => {
    setItems((prevItems) => {
      // For avocado boxes, treat different varieties as separate items
      const existingItem = prevItems.find((item) => 
        item.product.id === product.id && 
        (product.category === 'avocados' && product.type === 'box' 
          ? item.variety === variety 
          : true)
      )
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id && 
          (product.category === 'avocados' && product.type === 'box' 
            ? item.variety === variety 
            : true)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      return [...prevItems, { product, quantity, variety }]
    })
  }

  const removeFromCart = (productId: string, variety?: AvocadoVariety) => {
    setItems((prevItems) => 
      prevItems.filter((item) => 
        item.product.id !== productId || 
        (variety !== undefined && item.variety !== variety)
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, variety?: AvocadoVariety) => {
    if (quantity <= 0) {
      removeFromCart(productId, variety)
      return
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && 
        (variety !== undefined 
          ? item.variety === variety 
          : item.variety === undefined)
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product.price > 0 ? item.product.price : 0
      return total + price * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

