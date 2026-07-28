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
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    number: '',
    reference: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'pix' | 'card'>('money');
  const [cardType, setCardType] = useState<'débito' | 'crédito' | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [hasCalculatedFee, setHasCalculatedFee] = useState(false);

  // Haversine formula to calculate distance between two coordinates in km
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);  
    const dLon = (lon2 - lon1) * (Math.PI / 180); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; 
    return d;
  };

  const calculateDeliveryFee = async (street: string, neighborhood: string, city: string) => {
    if (!city) return;
    setIsCalculatingFee(true);
    try {
      let geoData: any[] = [];
      const headers = {
        'Accept-Language': 'pt-BR,pt;q=0.9',
      };
      
      // 1. Tenta com Rua + Cidade
      if (street) {
        const query1 = `${street}, ${city}, BA`;
        const res1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query1)}&email=agenciaraon@gmail.com`, { headers });
        if (res1.ok) geoData = await res1.json();
      }

      // 2. Se não encontrar, tenta com Bairro + Cidade
      if ((!geoData || geoData.length === 0) && neighborhood) {
        const query2 = `${neighborhood}, ${city}, BA`;
        const res2 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query2)}&email=agenciaraon@gmail.com`, { headers });
        if (res2.ok) geoData = await res2.json();
      }

      // 3. Se não encontrar, tenta apenas Cidade
      if (!geoData || geoData.length === 0) {
        const query3 = `${city}, BA`;
        const res3 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query3)}&email=agenciaraon@gmail.com`, { headers });
        if (res3.ok) geoData = await res3.json();
      }
      
      if (geoData && geoData.length > 0) {
        const customerLat = parseFloat(geoData[0].lat);
        const customerLon = parseFloat(geoData[0].lon);
        
        // Restaurant coordinates (Alagoinhas Velha, Alagoinhas)
        const restaurantLat = -12.1332908;
        const restaurantLon = -38.4062660;

        const distance = getDistanceFromLatLonInKm(restaurantLat, restaurantLon, customerLat, customerLon);
        
        if (distance <= 2) {
          setDeliveryFee(8.00);
        } else if (distance <= 4) {
          setDeliveryFee(10.00);
        } else {
          setDeliveryFee(12.00);
        }
      } else {
        setDeliveryFee(10.00); // Default if coordinate not found
      }
    } catch (geoErr) {
      console.error('Erro ao buscar coordenadas:', geoErr);
      setDeliveryFee(10.00);
    } finally {
      setHasCalculatedFee(true);
      setIsCalculatingFee(false);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    if (cep.length > 8) cep = cep.slice(0, 8);
    
    let formattedCep = cep;
    if (cep.length > 5) {
      formattedCep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
    
    setAddress(prev => ({ ...prev, cep: formattedCep }));

    if (cep.length === 8) {
      try {
        let newAddress = null;
        
        // Tentativa 1: BrasilAPI
        try {
          const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
          if (res.ok) {
            const data = await res.json();
            newAddress = {
              street: data.street || '',
              neighborhood: data.neighborhood || '',
              city: data.city || '',
            };
          }
        } catch (e) {
          console.error('BrasilAPI erro:', e);
        }

        // Tentativa 2: ViaCEP (Fallback)
        if (!newAddress) {
          const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          if (res.ok) {
            const data = await res.json();
            if (!data.erro) {
              newAddress = {
                street: data.logradouro || '',
                neighborhood: data.bairro || '',
                city: data.localidade || '',
              };
            }
          }
        }

        if (newAddress) {
          setAddress(prev => ({
            ...prev,
            ...newAddress,
          }));

          await calculateDeliveryFee(newAddress.street, newAddress.neighborhood, newAddress.city);
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item?.menuItem?.price || 0;
    const quantity = item?.quantity || 1;
    const addonsTotal = (item?.addons || []).reduce((addonSum, addon) => addonSum + addon.price, 0);
    return sum + ((itemPrice + addonsTotal) * quantity);
  }, 0);
  const total = subtotal + deliveryFee;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCheckout = () => {
    if (!address.cep || !address.street || !address.neighborhood || !address.city || !address.number) {
      alert('Por favor, preencha o CEP e o endereço de entrega corretamente para calcular a entrega.');
      return;
    }

    if (paymentMethod === 'card' && !cardType) {
      alert('Por favor, selecione se o cartão é débito ou crédito.');
      return;
    }

    let orderText = `NOVO PEDIDO - CHELL BURGER 🔥\n\n`;
    orderText += `Cliente: ${user.name}\n`;
    orderText += `Telefone: ${user.phone}\n\n`;
    
    orderText += `ITENS DO PEDIDO:\n`;
    cart.forEach(item => {
      const price = item?.menuItem?.price || 0;
      const quantity = item?.quantity || 1;
      const name = item?.menuItem?.name || 'Item';
      const addonsTotal = (item?.addons || []).reduce((sum, addon) => sum + addon.price, 0);
      const totalItemPrice = (price + addonsTotal) * quantity;
      
      orderText += `${quantity}x ${name} - R$ ${totalItemPrice.toFixed(2)}\n`;
      if (item?.addons && item.addons.length > 0) {
        orderText += `   ↳ Adicionais: ${item.addons.map(a => a.name).join(', ')}\n`;
      }
      if (item?.observation) {
        orderText += `   ↳ Obs: ${item.observation}\n`;
      }
    });
    
    orderText += `\nSubtotal: R$ ${subtotal.toFixed(2)}\n`;
    orderText += `Taxa de Entrega: R$ ${deliveryFee.toFixed(2)}\n`;
    orderText += `TOTAL: R$ ${total.toFixed(2)}\n\n`;
    
    orderText += `ENDEREÇO DE ENTREGA:\n`;
    orderText += `${address.street}, Nº ${address.number}\n`;
    orderText += `Bairro: ${address.neighborhood}\n`;
    orderText += `Cidade: ${address.city}\n`;
    if (address.reference) {
      orderText += `Ref: ${address.reference}\n`;
    }

    let paymentInfo = '';
    if (paymentMethod === 'pix') {
      paymentInfo = 'Pix pelo App (Comprovante a seguir)';
    } else if (paymentMethod === 'card') {
      paymentInfo = `Pagar na entrega com cartão (${cardType})`;
    } else {
      paymentInfo = `Pagar em dinheiro${changeFor ? ` (Troco para R$ ${changeFor})` : ''}`;
    }
    orderText += `\nPAGAMENTO: ${paymentInfo}`;

    const encodedText = encodeURIComponent(orderText);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
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
          {cart.map((item, index) => {
            const price = item?.menuItem?.price || 0;
            const quantity = item?.quantity || 1;
            const name = item?.menuItem?.name || 'Item';
            return (
            <div key={item.id} className={`p-4 ${index !== cart.length - 1 ? 'border-b border-neutral-800' : ''}`}>
              <div className="flex justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{name}</h3>
                  <p className="text-orange-400 font-medium"><span>R$ </span><span>{((price + (item?.addons || []).reduce((s, a) => s + a.price, 0)) * quantity).toFixed(2)}</span></p>
                  {item?.addons && item.addons.length > 0 && (
                    <p className="text-sm text-neutral-300 mt-1">
                      <span className="font-medium text-neutral-500">Adicionais: </span>
                      {item.addons.map(a => a.name).join(', ')}
                    </p>
                  )}
                  {item?.observation && (
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
                    <span className="w-8 text-center font-medium text-sm">{quantity}</span>
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
          )})}
          <div className="p-4 bg-neutral-950/50 border-t border-neutral-800 rounded-b-2xl space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Subtotal</span>
              <span><span>R$ </span><span>{subtotal.toFixed(2)}</span></span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Taxa de Entrega</span>
              <span>{isCalculatingFee ? <span className="text-xs text-orange-500 animate-pulse">Calculando...</span> : hasCalculatedFee ? <span>R$ {deliveryFee.toFixed(2)}</span> : <span>A calcular</span>}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-neutral-800/50">
              <span className="text-neutral-300 font-bold">Total do Pedido</span>
              <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                <span>R$ </span><span>{hasCalculatedFee ? total.toFixed(2) : subtotal.toFixed(2)}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Address Form */}
        <section className="bg-neutral-900 rounded-2xl border border-neutral-800 p-5 space-y-4">
          <h2 className="text-lg font-bold flex items-center text-neutral-100">
            <MapPin size={20} className="text-neutral-500 mr-2" />
            Endereço de Entrega
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input type="text" placeholder="CEP" value={address.cep} onChange={handleCepChange} maxLength={9} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <input type="text" placeholder="Rua" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} onBlur={() => calculateDeliveryFee(address.street, address.neighborhood, address.city)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <input type="text" placeholder="Número" value={address.number} onChange={e => setAddress({...address, number: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <input type="text" placeholder="Bairro" value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})} onBlur={() => calculateDeliveryFee(address.street, address.neighborhood, address.city)} className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none" />
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
            <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'money' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950'}`}>
              <div className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === 'money'} onChange={() => setPaymentMethod('money')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'money' ? 'border-orange-500' : 'border-neutral-600'}`}>
                  {paymentMethod === 'money' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
                <span className="font-medium">Pagar em dinheiro</span>
              </div>
              
              {paymentMethod === 'money' && (
                <div className="mt-4 ml-8 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-neutral-400">Troco para quanto? (Deixe em branco se não precisar)</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                      <input 
                        type="number" 
                        placeholder="Ex: 50" 
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </label>

            <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950'}`}>
              <div className="flex items-center">
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === 'card' ? 'border-orange-500' : 'border-neutral-600'}`}>
                  {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
                <span className="font-medium">Pagar na entrega com cartão</span>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="mt-4 ml-8 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="cardType" checked={cardType === 'débito'} onChange={() => setCardType('débito')} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${cardType === 'débito' ? 'border-orange-500' : 'border-neutral-600'}`}>
                        {cardType === 'débito' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                      </div>
                      <span className="text-sm text-neutral-300">Débito</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input type="radio" name="cardType" checked={cardType === 'crédito'} onChange={() => setCardType('crédito')} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 mr-2 flex items-center justify-center ${cardType === 'crédito' ? 'border-orange-500' : 'border-neutral-600'}`}>
                        {cardType === 'crédito' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                      </div>
                      <span className="text-sm text-neutral-300">Crédito</span>
                    </label>
                  </div>
                </div>
              )}
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
                  <p className="text-sm text-neutral-400">1. Copie a chave Pix abaixo.<br/>2. Faça o pagamento no seu banco.<br/>3. Assim que realizar o pagamento enviar o comprovante clicando em "Fazer pedido".</p>
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
          Fazer pedido
        </button>
      </div>
    </div>
  );
}
