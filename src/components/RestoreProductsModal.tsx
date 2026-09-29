import React, { useState } from 'react';
import { MenuItem } from '../types';
import { X, RotateCcw, Loader2, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  deletedItems: MenuItem[];
  onClose: () => void;
  onRestore: (id: string) => Promise<void>;
}

export function RestoreProductsModal({
  isOpen,
  deletedItems,
  onClose,
  onRestore
}: Props) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = async (id: string) => {
    try {
      setRestoringId(id);
      await onRestore(id);
    } catch (err) {
      console.error('Erro ao restaurar item:', err);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm p-6 my-6 text-neutral-200 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Trash2 size={18} className="text-red-400" />
              Itens Removidos
            </h3>
            <p className="text-xs text-neutral-400 font-medium">
              Itens que foram retirados do cardápio
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {deletedItems.length === 0 ? (
          <div className="py-8 text-center text-neutral-400">
            <p className="text-sm font-medium">Nenhum item removido no momento.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {deletedItems.map((item) => (
              <div 
                key={item.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-12 h-12 rounded-xl object-cover bg-neutral-900 shrink-0 border border-neutral-800"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-orange-400 font-medium">R$ {item.price.toFixed(2)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={restoringId === item.id}
                  onClick={() => handleRestore(item.id)}
                  className="bg-green-600/90 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 active:scale-95 disabled:opacity-50"
                >
                  {restoringId === item.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                  <span>Restaurar</span>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
