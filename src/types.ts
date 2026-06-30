export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'burger' | 'drink';
  image: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id
  menuItem: MenuItem;
  quantity: number;
  observation?: string;
  addons?: Addon[];
}

export interface User {
  name: string;
  phone: string;
}

export interface Address {
  street: string;
  neighborhood: string;
  city: string;
  number: string;
  reference: string;
}
