import React, { useState } from 'react';
import { User } from '../types';
import { Flame } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      onLogin({ name, phone });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-950 flex flex-col items-center justify-center p-6 text-neutral-100">
      <div className="w-full max-w-md bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-neutral-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
            <Flame size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-center">
            Chell Burger
          </h1>
          <p className="text-yellow-500 font-medium italic mt-1">"Sabor que não engana"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1">
              Seu Nome
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Como quer ser chamado?"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-400 mb-1">
              Seu WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl px-4 py-4 mt-4 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all"
          >
            Ver Cardápio
          </button>
        </form>
      </div>
    </div>
  );
}
