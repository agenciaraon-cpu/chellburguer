/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, CartItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MenuScreen } from './components/MenuScreen';
import { CartScreen } from './components/CartScreen';

type Screen = 'login' | 'menu' | 'cart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('menu');
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      // If same item and observation, increase quantity
      const existing = prev.find(
        i => i.menuItem.id === item.menuItem.id && i.observation === item.observation
      );
      if (existing) {
        return prev.map(i => 
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setCurrentScreen('menu');
  };

  return (
    <>
      {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
      
      {currentScreen === 'menu' && (
        <MenuScreen 
          cart={cart} 
          onAddToCart={handleAddToCart} 
          onViewCart={() => setCurrentScreen('cart')} 
        />
      )}
      
      {currentScreen === 'cart' && user && (
        <CartScreen 
          cart={cart} 
          user={user}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onBack={() => setCurrentScreen('menu')}
          onClearCart={handleClearCart}
        />
      )}
    </>
  );
}
