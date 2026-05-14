export type Category = 'sandwich' | 'salad' | 'side' | 'drink' | 'dessert';

export interface ModifierOption {
  id: string;
  label: string;
  priceDelta?: number;
}

export interface ModifierGroup {
  id: string;
  label: string;
  multi?: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
  tags?: string[];
  modifierGroups?: ModifierGroup[];
}

export interface CartItem {
  lineId: string;
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: { groupId: string; optionId: string; label: string; priceDelta: number }[];
  notes?: string;
}

export type CartAction =
  | {
      type: 'add_item';
      itemId: string;
      quantity: number;
      modifiers?: { groupId: string; optionId: string }[];
      notes?: string;
    }
  | { type: 'remove_item'; lineId: string }
  | { type: 'update_quantity'; lineId: string; quantity: number }
  | { type: 'clear_cart' };

export interface ChatRequest {
  message: string;
  cart: CartItem[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  reply: string;
  actions: CartAction[];
  unmatched?: string[];
}
