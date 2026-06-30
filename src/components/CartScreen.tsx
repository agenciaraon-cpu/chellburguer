import React, { useState } from 'react';
import { CartItem, User, Address } from '../types';
import { PIX_KEY, WHATSAPP_NUMBER } from '../data';
import { ArrowLeft, Trash2, MapPin, CreditCard, Copy, CheckCircle2, Send, ShoppingBag } from 'lucide-react';

interface Props {
  cart: CartItem[];
  user: User;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onClearCart: () => void;
}

export function CartScreen({ cart, user, onUpdateQuantity, onRemoveItem, onBack, onClearCart }: Props) {
  const [address, setAddress] = useState<Address>({
    street: '',
    neighborhood: '',
    city: '',
    number: '',
    reference: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'whatsapp'>('whatsapp');
  const [copiedPix, setCopiedPix] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCheckout = () => {
    if (!address.street || !address.neighborhood || !address.city || !address.number) {
      alert('Por favor, preencha o endereço de entrega corretamente.');
      return;
    }

    let orderText = `*NOVO PEDIDO - CHELL BURGER* 🔥\n\n`;
    orderText += `*Cliente:* ${user.name}\n`;
    orderText += `*Telefone:* ${user.phone}\n\n`;
    
    orderText += `*ITENS DO PEDIDO:*\n`;
    cart.forEach(item => {
      orderText += `${item.quantity}x ${item.menuItem.name} - R$ ${(item.menuItem.price * item.quantity).toFixed(2)}\n`;
      if (item.observation) {
        orderText += `   ↳ _Obs: ${item.observation}_\n`;
      }
    });
    
    orderText += `\n*TOTAL:* R$ ${total.toFixed(2)}\n\n`;
    
    orderText += `*ENDEREÇO DE ENTREGA:*\n`;
    orderText += `${address.street}, Nº ${address.number}\n`;
    orderText += `Bairro: ${address.neighborhood}\n`;
    orderText += `Cidade: ${address.city}\n`;
    if (address.reference) {
      orderText += `Ref: ${address.reference}\n`;
    }

    orderText += `\n*PAGAMENTO:* ${paymentMethod === 'pix' ? 'Pix pelo App (Comprovante a seguir)' : 'A combinar no WhatsApp'}`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
    
    // Optional: clear cart after sending
    // onClearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-4 border border-neutral-800">
          <ShoppingBag size={32} className="text-neutral-500" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-100 mb-2">Seu carrinho está vazio</h2>
        <p className="text-neutral-400 mb-8">Que tal adicionar um hambúrguer delicioso?</p>
        <button 
          onClick={onBack}
          className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-neutral-100 pb-24 relative">
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-10 px-4 py-4 flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 text-neutral-400 hover:text-white mr-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Seu Carrinho</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Items List */}
        <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-1">
          {cart.map((item, index) => (
            <div key={item.id} className={`p-4 ${index !== cart.length - 1 ? 'border-b border-neutral-800' : ''}`}>
              <div className="flex justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.menuItem.name}</h3>
                  <p className="text-orange-400 font-medium">R$ {item.menuItem.price.toFixed(2)}</p>
                  {item.observation && (
                    <p className="text-sm text-neutral-400 mt-1 italic">
                      Obs: {item.observation}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between ml-4">
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center bg-neutral-950 rounded-lg mt-3 border border-neutral-800">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-orange-500 hover:bg-neutral-800 rounded-l-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-orange-500 hover:bg-neutral-800 rounded-r-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 bg-neutral-950/50 border-t border-neutral-800 rounded-b-2xl flex justify-between items-center">
            <span className="text-neutral-400">Total do Pedido</span>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </section>

        {/* Address Form */}
        <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center text-neutral-100">
            <MapPin size={20} className="text-orange-500 mr-2" />
            Endereço de Entrega
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input type="text" placeholder="Rua" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <input type="text" placeholder="Número" value={address.number} onChange={e => setAddress({...address, number: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <input type="text" placeholder="Bairro" value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <input type="text" placeholder="Cidade" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <input type="text" placeholder="Ponto de Referência (Opcional)" value={address.reference} onChange={e => setAddress({...address, reference: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
          </div>
        </section>

        {/* Payment */}
        <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center text-neutral-100">
            <CreditCard size={20} className="text-orange-500 mr-2" />
            Pagamento
          </h2>
          
          <div className="space-y-3">
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'whatsapp' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950'}`}>
              <input type="radio" name="payment" checked={paymentMethod === 'whatsapp'} onChange={() => setPaymentMethod('whatsapp')} className="hidden" />
              <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'whatsapp' ? 'border-orange-500' : 'border-neutral-600'}`}>
                {paymentMethod === 'whatsapp' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
              </div>
              <span className="font-medium">Combinar no WhatsApp</span>
            </label>

            <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'pix' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950'}`}>
              <div className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-orange-500' : 'border-neutral-600'}`}>
                  {paymentMethod === 'pix' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
                <span className="font-medium">Pagar agora via Pix</span>
              </div>
              
              {paymentMethod === 'pix' && (
                <div className="mt-4 ml-8 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-neutral-400">1. Copie a chave Pix abaixo.<br/>2. Faça o pagamento no seu banco.<br/>3. Envie o comprovante no WhatsApp.</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-neutral-950 px-3 py-2 rounded-lg text-xs flex-1 border border-neutral-800 text-neutral-300 overflow-hidden text-ellipsis">
                      {PIX_KEY}
                    </code>
                    <button 
                      onClick={handleCopyPix}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedPix ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </label>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-neutral-950 border-t border-neutral-900">
        <button
          onClick={handleCheckout}
          className="max-w-2xl mx-auto w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center active:scale-[0.98] transition-transform"
        >
          <Send size={20} className="mr-2" />
          {paymentMethod === 'pix' ? 'Enviar Pedido e Comprovante' : 'Finalizar Pedido no WhatsApp'}
        </button>
      </div>
    </div>
  );
}
