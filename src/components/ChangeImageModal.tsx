import React, { useState, useRef, useEffect } from 'react';
import { MenuItem } from '../types';
import { X, Upload, Image as ImageIcon, Camera, RotateCcw, Loader2, Link } from 'lucide-react';

interface Props {
  isOpen: boolean;
  item: MenuItem | null;
  hasCustomOverride: boolean;
  onClose: () => void;
  onSaveImage: (itemId: string, newImageUrl: string) => Promise<void>;
  onResetImage: (itemId: string) => Promise<void>;
}

export function ChangeImageModal({
  isOpen,
  item,
  hasCustomOverride,
  onClose,
  onSaveImage,
  onResetImage
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [useUrlMode, setUseUrlMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && item) {
      setSelectedImage('');
      setUrlInput('');
      setUseUrlMode(false);
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // Compress & resize image to lightweight base64 JPEG
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
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
          setSelectedImage(compressedDataUrl);
          setError(null);
        }
      };
      img.onerror = () => {
        setError('Não foi possível carregar a imagem selecionada.');
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

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setError('Insira uma URL de imagem válida.');
      return;
    }
    setSelectedImage(urlInput.trim());
    setError(null);
  };

  const handleSave = async () => {
    const finalImage = selectedImage || (useUrlMode ? urlInput.trim() : '');
    if (!finalImage) {
      setError('Escolha ou envie uma nova imagem antes de salvar.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSaveImage(item.id, finalImage);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar imagem:', err);
      setError('Erro ao salvar a imagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onResetImage(item.id);
      onClose();
    } catch (err: any) {
      console.error('Erro ao restaurar imagem:', err);
      setError('Erro ao restaurar a imagem original.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPreview = selectedImage || (useUrlMode && urlInput.trim() ? urlInput.trim() : item.image);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-sm p-6 my-6 text-neutral-200 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 mb-4 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Camera size={18} className="text-orange-500" />
              Trocar Imagem
            </h3>
            <p className="text-xs text-neutral-400 font-medium truncate max-w-[230px]">
              {item.name}
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

        {error && (
          <div className="mb-4 p-3 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Current / Preview Image Display */}
        <div className="mb-4">
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 h-44 flex items-center justify-center group shadow-inner">
            <img 
              src={currentPreview} 
              alt={item.name} 
              className="w-full h-full object-contain p-2" 
            />
            {selectedImage && (
              <div className="absolute top-2 right-2 bg-green-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                Nova foto selecionada
              </div>
            )}
          </div>
        </div>

        {/* Toggle between Upload and URL */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 mb-4">
          <button
            type="button"
            onClick={() => setUseUrlMode(false)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !useUrlMode 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload size={13} />
            Enviar do Aparelho
          </button>
          <button
            type="button"
            onClick={() => setUseUrlMode(true)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              useUrlMode 
                ? 'bg-neutral-800 text-white shadow-sm' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Link size={13} />
            Colar Link
          </button>
        </div>

        {/* Mode 1: File Upload */}
        {!useUrlMode ? (
          <div className="space-y-3 mb-5">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-neutral-800 hover:border-orange-500/50 bg-neutral-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-800 group-hover:bg-orange-500/20 flex items-center justify-center mb-1.5 transition-colors">
                <ImageIcon size={20} className="text-neutral-400 group-hover:text-orange-400" />
              </div>
              <span className="text-xs font-bold text-neutral-200">Toque para escolher uma foto</span>
              <span className="text-[10px] text-neutral-500 mt-0.5">Galeria, Câmera ou Arquivos</span>
            </div>
          </div>
        ) : (
          /* Mode 2: Image URL */
          <div className="space-y-3 mb-5">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/imagem.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shrink-0"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || (!selectedImage && (!useUrlMode || !urlInput.trim()))}
            className="w-full py-3 rounded-xl font-bold bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Nova Imagem'
            )}
          </button>

          {hasCustomOverride && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} />
              Restaurar Imagem Original
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
