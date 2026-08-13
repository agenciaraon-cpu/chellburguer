/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, CartItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { MenuScreen } from './components/MenuScreen';
import { CartScreen } from './components/CartScreen';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

type Screen = 'login' | 'menu' | 'cart';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [confirmAction, setConfirmAction] = useState<{message: string, onConfirm: () => void} | null>(null);

  useEffect(() => {
    // Reference to the store settings document in Firestore
    const settingsRef = doc(db, 'store', 'settings');
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isStoreOpen !== undefined) {
          setIsStoreOpen(data.isStoreOpen);
        }
        if (data.availability) {
          setAvailability(data.availability);
        }
      } else {
        // Create the document if it doesn't exist
        setDoc(settingsRef, {
          isStoreOpen: true,
          availability: {}
        });
      }
    }, (err) => {
      console.error('Failed to listen to Firestore updates:', err);
    });

    return () => unsubscribe();
  }, []);

  const toggleStoreStatus = async () => {
    const nextVal = !isStoreOpen;
    // Optimistic update
    setIsStoreOpen(nextVal);
    
    try {
      const settingsRef = doc(db, 'store', 'settings');
      await setDoc(settingsRef, { isStoreOpen: nextVal }, { merge: true });
    } catch (err) {
      console.error('Failed to update store status', err);
      // Revert on error
      setIsStoreOpen(!nextVal);
    }
  };

  const requestToggleStoreStatus = () => {
    setConfirmAction({
      message: isStoreOpen ? 'Tem certeza que deseja FECHAR a loja?' : 'Tem certeza que deseja ABRIR a loja?',
      onConfirm: () => {
        toggleStoreStatus();
        setConfirmAction(null);
      }
    });
  };

  const toggleAvailability = async (id: string) => {
    const nextVal = availability[id] === false ? true : false;
    const nextAvailability = { ...availability, [id]: nextVal };
    
    // Optimistic update
    setAvailability(nextAvailability);
    
    try {
      const settingsRef = doc(db, 'store', 'settings');
      await setDoc(settingsRef, { availability: nextAvailability }, { merge: true });
    } catch (err) {
      console.error('Failed to update availability', err);
      // Revert on error
      setAvailability(availability);
    }
  };

  const requestToggleAvailability = (id: string) => {
    const isAvailable = availability[id] !== false;
    setConfirmAction({
      message: isAvailable ? 'Tem certeza que deseja marcar este item como ESGOTADO?' : 'Tem certeza que deseja marcar este item como DISPONÍVEL?',
      onConfirm: () => {
        toggleAvailability(id);
        setConfirmAction(null);
      }
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
          {currentScreen === 'login' && <LoginScreen onLogin={handleLogin} isStoreOpen={isStoreOpen} />}
          
          {currentScreen === 'menu' && user && (
            <MenuScreen 
              user={user}
              cart={cart} 
              onAddToCart={handleAddToCart} 
              onViewCart={() => setCurrentScreen('cart')}
              availability={availability}
              onToggleAvailability={requestToggleAvailability}
              isStoreOpen={isStoreOpen}
              onToggleStoreStatus={requestToggleStoreStatus}
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

        {confirmAction && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-xs text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-white mb-2">Confirmar Ação</h3>
              <p className="text-sm text-neutral-400 mb-6">{confirmAction.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-3 rounded-xl font-bold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-[0.98] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAction.onConfirm}
                  className="flex-1 py-3 rounded-xl font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
