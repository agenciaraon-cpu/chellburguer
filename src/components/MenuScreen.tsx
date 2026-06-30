import React from 'react';
import { menuItems } from '../data';
import { MenuItemCard } from './MenuItemCard';
import { CartItem } from '../types';
import { ShoppingBag, Flame } from 'lucide-react';

interface Props {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onViewCart: () => void;
}

export function MenuScreen({ cart, onAddToCart, onViewCart }: Props) {
  const burgers = menuItems.filter(item => item.category === 'burger');
  const drinks = menuItems.filter(item => item.category === 'drink');
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 pb-24 relative">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Flame className="text-orange-500" size={24} />
            <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
              Chell Burger
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Burgers Section */}
        <section>
          <h2 className="text-2xl font-black text-neutral-100 mb-6 flex items-center">
            <span className="bg-orange-500 w-1.5 h-6 mr-3 rounded-full"></span>
            Hambúrgueres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {burgers.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={onAddToCart} />
            ))}
          </div>
        </section>

        {/* Drinks Section */}
        <section>
          <h2 className="text-2xl font-black text-neutral-100 mb-6 flex items-center">
            <span className="bg-yellow-500 w-1.5 h-6 mr-3 rounded-full"></span>
            Bebidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {drinks.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={onAddToCart} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent pointer-events-none">
          <button
            onClick={onViewCart}
            className="max-w-md mx-auto w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-between px-6 pointer-events-auto active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center">
              <ShoppingBag size={20} className="mr-3" />
              <span>Ver Carrinho</span>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
