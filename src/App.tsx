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
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('chell_item_availability');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleAvailability = (id: string) => {
    setAvailability(prev => {
      const next = { ...prev, [id]: prev[id] === false ? true : false };
      localStorage.setItem('chell_item_availability', JSON.stringify(next));
      return next;
    });
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('menu');
  };

  const handleAddToCart = (item: CartItem) => {
    if (!item || !item.menuItem) return;
    setCart(prev => {
      // If same item, observation, and addons, increase quantity
      const existing = prev.find(
        i => {
          if (i?.menuItem?.id !== item.menuItem.id || i?.observation !== item.observation) return false;
          const iAddons = (i.addons || []).map(a => a.id).sort().join(',');
          const newAddons = (item.addons || []).map(a => a.id).sort().join(',');
          return iAddons === newAddons;
        }
      );
      if (existing) {
        return prev.map(i => 
          i.id === existing.id ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) } : i
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
    <div className="min-h-screen bg-black sm:py-8 flex justify-center items-center">
      <div className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[400px] bg-neutral-950 sm:rounded-[3rem] sm:border-[8px] border-neutral-800 overflow-hidden relative shadow-2xl flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} />}
          
          {currentScreen === 'menu' && user && (
            <MenuScreen 
              user={user}
              cart={cart} 
              onAddToCart={handleAddToCart} 
              onViewCart={() => setCurrentScreen('cart')}
              availability={availability}
              onToggleAvailability={toggleAvailability}
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
        </div>
        
        <div className="bg-neutral-900 border-t border-neutral-800 py-3 text-center shrink-0">
          <p className="text-xs text-neutral-500 font-medium">
            Desenvolvido pela <a href="https://www.instagram.com/somosraon" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors">@somosraon</a>
          </p>
        </div>
      </div>
    </div>
  );
}
