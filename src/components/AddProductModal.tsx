import React, { useState, useRef } from 'react';
import { MenuItem } from '../types';
import { X, Upload, Image as ImageIcon, Loader2, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  initialCategory: 'burger' | 'drink' | 'other';
  onClose: () => void;
  onSave: (product: Omit<MenuItem, 'id'>) => Promise<void>;
}

export function AddProductModal({ isOpen, initialCategory, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'burger' | 'drink' | 'other'>(initialCategory);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync category when initialCategory changes and modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setName('');
      setPrice('');
      setDescription('');
      setImagePreview('');
      setError(null);
    }
  }, [isOpen, initialCategory]);

  if (!isOpen) return null;

  // Compress & resize image to lightweight base64
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressedDataUrl);
          setError(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    const numPrice = parseFloat(price.replace(',', '.').trim());
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Informe um valor válido maior que zero (ex: 25.00).');
      return;
    }

    // Default image if none provided
    const finalImage = imagePreview || (
      category === 'burger' ? '/fidocanso.png' :
      category === 'drink' ? '/coca300.png' :
      '/batata-frita-m.png'
    );

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        price: numPrice,
        category,
        description: description.trim(),
        image: finalImage,
        isCustom: true
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to add product:', err);
      setError('Erro ao salvar o produto no banco de dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-md p-6 my-8 text-neutral-200 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Plus size={20} className="text-orange-500" />
              Novo Produto
            </h3>
            <p className="text-xs text-neutral-400">Adicione um novo item ao cardápio</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Categoria */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('burger')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  category === 'burger'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                Hambúrguer
              </button>
              <button
                type="button"
                onClick={() => setCategory('other')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  category === 'other'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                Outras Opções
              </button>
              <button
                type="button"
                onClick={() => setCategory('drink')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  category === 'drink'
                    ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                Bebidas
              </button>
            </div>
          </div>

          {/* Nome do Produto */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Nome do Produto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Chell Bacon Especial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Valor do Produto */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-sm font-bold text-neutral-500">R$</span>
              <input
                type="text"
                required
                inputMode="decimal"
                placeholder="0,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white font-bold placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Upload de Foto */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Foto do Produto
            </label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-36 flex items-center justify-center group">
                <img 
                  src={imagePreview} 
                  alt="Pré-visualização" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Upload size={14} /> Trocar Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-neutral-800 hover:border-orange-500/50 bg-neutral-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-2 transition-colors">
                  <ImageIcon size={20} className="text-neutral-400 group-hover:text-orange-400" />
                </div>
                <span className="text-xs font-bold text-neutral-300">Clique para enviar uma foto</span>
                <span className="text-[11px] text-neutral-500 mt-0.5">ou arraste e solte o arquivo aqui</span>
              </div>
            )}
          </div>

          {/* Detalhes / Descrição */}
          <div>
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Detalhes / Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pão brioche, blend 150g, queijo cheddar, bacon crocante e maionese verde."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Produto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
