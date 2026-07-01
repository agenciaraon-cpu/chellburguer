import React, { useState } from 'react';
import { MenuItem, CartItem, Addon } from '../types';
import { Plus, MessageSquare, X } from 'lucide-react';
import { AVAILABLE_ADDONS } from '../data';

interface Props {
  item: MenuItem;
  onAdd: (item: CartItem) => void;
}

export function MenuItemCard({ item, onAdd }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [observation, setObservation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons(prev => {
      const isSelected = prev.find(a => a.id === addon.id);
      if (isSelected) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const finalPrice = (item.price + addonsTotal) * quantity;

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => {
      setIsAdding(false);
      setIsOpen(false);
      setQuantity(1); // Reset quantity after adding
      setSelectedAddons([]); // Reset addons
    }, 400);
    
    onAdd({
      id: Math.random().toString(36).substring(2, 9),
      menuItem: item,
      quantity: quantity,
      observation: observation.trim() ? observation : undefined,
      addons: selectedAddons.length > 0 ? selectedAddons : undefined
    });
    setObservation('');
  };

  return (
    <>
      {/* Compact Square Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg flex flex-col cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all active:scale-95 aspect-square relative group"
      >
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
          <h3 className="text-sm font-black text-white leading-tight line-clamp-2">{item.name}</h3>
          <p className="text-orange-400 font-bold text-sm mt-1">R$ {item.price.toFixed(2)}</p>
        </div>
      </div>

      {/* Detail Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/80 backdrop-blur-sm">
          <div 
            className="bg-neutral-900 w-full max-w-sm rounded-3xl border border-neutral-800 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
          >
            <div className="relative h-56 sm:h-64 w-full bg-neutral-800 shrink-0">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-contain p-2"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>
              {item.category === 'burger' && (
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-md font-medium border border-white/10">
                  Imagem real do produto
                </div>
              )}
            </div>
            
            <div className="p-5 flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-neutral-100">{item.name}</h3>
                <span className="text-orange-500 font-bold text-lg whitespace-nowrap ml-4">
                  R$ {item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                {item.description}
              </p>

              {item.category === 'burger' && (
                <div className="mb-4">
                  <label className="flex items-center text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    <Plus size={14} className="mr-1.5" />
                    Adicionais
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_ADDONS.map(addon => (
                      <label key={addon.id} className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/50 cursor-pointer hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-neutral-950 bg-neutral-900"
                            checked={selectedAddons.some(a => a.id === addon.id)}
                            onChange={() => handleAddonToggle(addon)}
                          />
                          <span className="text-sm font-medium text-neutral-200">{addon.name}</span>
                        </div>
                        <span className="text-sm font-bold text-orange-400">+ R$ {addon.price.toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {item.category === 'burger' && (
                <div className="mb-6 space-y-2">
                  <label className="flex items-center text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    <MessageSquare size={14} className="mr-1.5" />
                    Observação (Opcional)
                  </label>
                  <textarea
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Ex: Tirar cebola, sem salada..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
                    rows={2}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-neutral-400">Quantidade</span>
                <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-800 rounded-xl p-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                    className="w-10 h-10 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors active:scale-95 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-neutral-100 w-6 text-center">{quantity}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
                    className="w-10 h-10 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center transition-colors active:scale-95 text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                  isAdding 
                    ? 'bg-green-600 text-white scale-[0.98]' 
                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]'
                }`}
              >
                {isAdding ? (
                  <span>Adicionado ao Carrinho!</span>
                ) : (
                  <span className="flex items-center">
                    <Plus size={20} className="mr-2" />
                    <span>Adicionar • R$ </span><span>{finalPrice.toFixed(2)}</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
