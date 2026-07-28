import { MenuItem, Addon } from './types';

export const AVAILABLE_ADDONS: Addon[] = [
  { id: 'a1', name: 'Cebola caramelizada', price: 3.50 },
  { id: 'a2', name: 'Bacon', price: 4.00 },
  { id: 'a3', name: 'Calabresa', price: 3.50 },
  { id: 'a4', name: 'Geleia de Pimenta', price: 2.50 },
  { id: 'a5', name: 'Queijo Coalho', price: 6.00 },
];

export const menuItems: MenuItem[] = [
  {
    id: 'b1',
    name: 'FI DO CANSO',
    description: 'Pão Brioche, Alface, Tomate, Blend 150g, Queijo cheddar, Calabresa, Cebola caramelizada, Maionese verde',
    price: 29.00,
    category: 'burger',
    image: '/fidocanso.png'
  },
  {
    id: 'b2',
    name: 'NO 12',
    description: 'Pão brioche, Alface, Tomate, Blend 150g, Queijo cheddar, Bacon, Queijo coalho, Banana da terra, Geleia de pimenta, Maionese verde',
    price: 37.00,
    category: 'burger',
    image: '/no12.png'
  },
  {
    id: 'b3',
    name: 'FOGO NA LIGA',
    description: 'Pão brioche, Blend 150g, queijo cheddar, bacon, alface, tomate e maionese verde.',
    price: 27.00,
    category: 'burger',
    image: '/fogonaliga.png'
  },
  {
    id: 'b4',
    name: 'DOCE TENTAÇÃO',
    description: 'Pão brioche, Blend 150g, queijo cheddar, cebola caramelizada, alface, tomate e maionese verde.',
    price: 27.00,
    category: 'burger',
    image: '/docetentacao.png'
  },
  {
    id: 'd1',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante em lata',
    price: 6.00,
    category: 'drink',
    image: '/coca300.png'
  },
  {
    id: 'd2',
    name: 'Guaraná Antártica Lata 350ml',
    description: 'Refrigerante em lata',
    price: 6.00,
    category: 'drink',
    image: '/anta300.png'
  },
  {
    id: 'd3',
    name: 'Coca-Cola 1l',
    description: 'Refrigerante 1 litro',
    price: 10.00,
    category: 'drink',
    image: '/cocalitro.png'
  },
  {
    id: 'd4',
    name: 'Guaraná Antártica 1l',
    description: 'Refrigerante 1 litro',
    price: 10.00,
    category: 'drink',
    image: '/antalitro.png'
  },
  {
    id: 'd5',
    name: 'Pepsi 1l',
    description: 'Refrigerante 1 litro',
    price: 10.00,
    category: 'drink',
    image: '/peplitro.png'
  }
];

export const WHATSAPP_NUMBER = "5575998015610";
export const PIX_KEY = "73f6bfc2-b01f-4667-991a-bd5f92edc37b";
