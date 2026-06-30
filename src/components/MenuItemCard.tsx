import React, { useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { Plus, MessageSquare } from 'lucide-react';

interface Props {
  item: MenuItem;
  onAdd: (item: CartItem) => void;
}

export function MenuItemCard({ item, onAdd }: Props) {
  const [observation, setObservation] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showObs, setShowObs] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 300);
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      menuItem: item,
      quantity: 1,
      observation: observation.trim() ? observation : undefined
    });
    setObservation('');
    setShowObs(false);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
      <div className="h-48 w-full relative overflow-hidden bg-neutral-800">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-orange-400 font-bold border border-neutral-700/50">
          R$ {item.price.toFixed(2)}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-neutral-100 mb-2">{item.name}</h3>
        <p className="text-sm text-neutral-400 mb-4 flex-1 line-clamp-3 leading-relaxed">
          {item.description}
        </p>

        {item.category === 'burger' && (
          <div className="mb-4">
            {!showObs ? (
              <button 
                onClick={() => setShowObs(true)}
                className="flex items-center text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                <MessageSquare size={16} className="mr-2" />
                Adicionar observação?
              </button>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Observação
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex: Tirar cebola, carne bem passada..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  rows={2}
                />
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleAdd}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
            isAdding 
              ? 'bg-green-600 text-white scale-[0.98]' 
              : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {isAdding ? 'Adicionado!' : (
            <>
              <Plus size={18} className="mr-2" />
              Adicionar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
