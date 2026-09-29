import React from 'react';
import { MenuItemCard } from './MenuItemCard';
import { CartItem, User, MenuItem } from '../types';
import { ShoppingBag, Flame, Plus, RotateCcw } from 'lucide-react';

interface Props {
  user: User;
  cart: CartItem[];
  items: MenuItem[];
  onAddToCart: (item: CartItem) => void;
  onViewCart: () => void;
  availability: Record<string, boolean>;
  onToggleAvailability: (id: string) => void;
  isStoreOpen: boolean;
  onToggleStoreStatus: () => void;
  onOpenAddProduct?: (category: 'burger' | 'drink' | 'other') => void;
  onDeleteCustomProduct?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onChangeImage?: (item: MenuItem) => void;
  deletedCount?: number;
  onOpenRestoreModal?: () => void;
}

export function MenuScreen({ 
  user, 
  cart, 
  items,
  onAddToCart, 
  onViewCart, 
  availability, 
  onToggleAvailability, 
  isStoreOpen, 
  onToggleStoreStatus,
  onOpenAddProduct,
  onDeleteCustomProduct,
  onDeleteItem,
  onChangeImage,
  deletedCount = 0,
  onOpenRestoreModal
}: Props) {
  const [imageError, setImageError] = React.useState(false);

  const burgers = items.filter(item => item.category === 'burger');
  const drinks = items.filter(item => item.category === 'drink');
  const others = items.filter(item => item.category === 'other');
  
  const totalItems = cart.reduce((sum, item) => sum + (item?.quantity || 0), 0);

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 pb-24 relative">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {!imageError ? (
                <img 
                  src="/image.png" 
                  alt="Chell Burger" 
                  className="h-8 w-auto object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Flame className="text-orange-500" size={24} />
                  <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
                    Chell Burger
                  </h1>
                </div>
              )}
            </div>
            
            {user.isAdmin && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={onToggleStoreStatus}
                  className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${isStoreOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                    {isStoreOpen ? 'Fechar Loja' : 'Abrir Loja'}
                  </span>
                </button>

                {deletedCount > 0 && onOpenRestoreModal && (
                  <button 
                    type="button"
                    onClick={onOpenRestoreModal}
                    title="Ver e restaurar itens removidos"
                    className="flex items-center space-x-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1.5 rounded-full hover:bg-neutral-800 transition-colors text-[10px] font-bold text-neutral-400 hover:text-white"
                  >
                    <RotateCcw size={12} className="text-orange-400" />
                    <span>Lixeira ({deletedCount})</span>
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-neutral-300 bg-neutral-800/50 px-3 py-1.5 rounded-full border border-neutral-700/50">
            Seja bem vindo, <span className="text-orange-400 font-bold">{user.name}</span>!
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Burgers Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-neutral-100 flex items-center">
              <span className="bg-orange-500 w-1.5 h-6 mr-3 rounded-full"></span>
              Hambúrgueres
            </h2>
            {user.isAdmin && (
              <button
                type="button"
                onClick={() => onOpenAddProduct?.('burger')}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={15} />
                <span>Adicionar Hambúrguer</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {burgers.map(item => {
              const isAvailable = availability[item.id] !== false;
              return (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onAdd={onAddToCart} 
                  isAdmin={user.isAdmin} 
                  isAvailable={isAvailable} 
                  onToggleAvailability={() => onToggleAvailability(item.id)} 
                  availability={availability}
                  onToggleAddonAvailability={onToggleAvailability}
                  onDeleteItem={onDeleteItem}
                  onDeleteCustomProduct={onDeleteCustomProduct}
                  onChangeImage={onChangeImage}
                />
              );
            })}

            {user.isAdmin && (
              <button
                type="button"
                onClick={() => onOpenAddProduct?.('burger')}
                className="bg-neutral-900/30 hover:bg-neutral-900/70 border-2 border-dashed border-neutral-800 hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group aspect-square active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-2 transition-colors">
                  <Plus size={20} className="text-neutral-400 group-hover:text-orange-400" />
                </div>
                <span className="text-xs font-bold text-neutral-300 group-hover:text-white">Adicionar Produto</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">em Hambúrgueres</span>
              </button>
            )}
          </div>
        </section>

        {/* Others Section */}
        {(others.length > 0 || user.isAdmin) && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-neutral-100 flex items-center">
                <span className="bg-red-500 w-1.5 h-6 mr-3 rounded-full"></span>
                Outras Opções
              </h2>
              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenAddProduct?.('other')}
                  className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  <Plus size={15} />
                  <span>Adicionar Opção</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {others.map(item => {
                const isAvailable = availability[item.id] !== false;
                return (
                  <MenuItemCard 
                    key={item.id} 
                    item={item} 
                    onAdd={onAddToCart} 
                    isAdmin={user.isAdmin} 
                    isAvailable={isAvailable} 
                    onToggleAvailability={() => onToggleAvailability(item.id)}
                    availability={availability}
                    onToggleAddonAvailability={onToggleAvailability}
                    onDeleteItem={onDeleteItem}
                    onDeleteCustomProduct={onDeleteCustomProduct}
                    onChangeImage={onChangeImage}
                  />
                );
              })}

              {user.isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenAddProduct?.('other')}
                  className="bg-neutral-900/30 hover:bg-neutral-900/70 border-2 border-dashed border-neutral-800 hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group aspect-square active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-2 transition-colors">
                    <Plus size={20} className="text-neutral-400 group-hover:text-orange-400" />
                  </div>
                  <span className="text-xs font-bold text-neutral-300 group-hover:text-white">Adicionar Produto</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5">em Outras Opções</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* Drinks Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-neutral-100 flex items-center">
              <span className="bg-yellow-500 w-1.5 h-6 mr-3 rounded-full"></span>
              Bebidas
            </h2>
            {user.isAdmin && (
              <button
                type="button"
                onClick={() => onOpenAddProduct?.('drink')}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-orange-400 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Plus size={15} />
                <span>Adicionar Bebida</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {drinks.map(item => {
              const isAvailable = availability[item.id] !== false;
              return (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  onAdd={onAddToCart} 
                  isAdmin={user.isAdmin} 
                  isAvailable={isAvailable} 
                  onToggleAvailability={() => onToggleAvailability(item.id)}
                  availability={availability}
                  onToggleAddonAvailability={onToggleAvailability}
                  onDeleteItem={onDeleteItem}
                  onDeleteCustomProduct={onDeleteCustomProduct}
                  onChangeImage={onChangeImage}
                />
              );
            })}

            {user.isAdmin && (
              <button
                type="button"
                onClick={() => onOpenAddProduct?.('drink')}
                className="bg-neutral-900/30 hover:bg-neutral-900/70 border-2 border-dashed border-neutral-800 hover:border-orange-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group aspect-square active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-2 transition-colors">
                  <Plus size={20} className="text-neutral-400 group-hover:text-orange-400" />
                </div>
                <span className="text-xs font-bold text-neutral-300 group-hover:text-white">Adicionar Produto</span>
                <span className="text-[10px] text-neutral-500 mt-0.5">em Bebidas</span>
              </button>
            )}
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
              <span>{totalItems}</span> <span>{totalItems === 1 ? 'item' : 'itens'}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
