import { create } from 'zustand';
import type { CartAction, CartItem, MenuItem } from '@bistro/shared';

let lineCounter = 0;
function nextLineId() {
  lineCounter += 1;
  return `line-${Date.now()}-${lineCounter}`;
}

function modifierKey(mods: CartItem['modifiers']): string {
  return [...mods].map((m) => `${m.groupId}:${m.optionId}`).sort().join('|');
}

function unitPriceFor(item: MenuItem, mods: CartItem['modifiers']): number {
  return item.price + mods.reduce((sum, m) => sum + (m.priceDelta ?? 0), 0);
}

function resolveModifiers(
  item: MenuItem,
  mods: { groupId: string; optionId: string }[] | undefined,
): CartItem['modifiers'] {
  if (!mods || !item.modifierGroups) return [];
  const resolved: CartItem['modifiers'] = [];
  for (const m of mods) {
    const group = item.modifierGroups.find((g) => g.id === m.groupId);
    const option = group?.options.find((o) => o.id === m.optionId);
    if (group && option) {
      resolved.push({
        groupId: group.id,
        optionId: option.id,
        label: option.label,
        priceDelta: option.priceDelta ?? 0,
      });
    }
  }
  return resolved;
}

interface CartState {
  items: CartItem[];
  menu: Record<string, MenuItem>;
  setMenu: (menu: MenuItem[]) => void;
  addByItem: (item: MenuItem, quantity?: number, mods?: CartItem['modifiers']) => void;
  applyActions: (actions: CartAction[]) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  menu: {},

  setMenu: (menu) =>
    set({
      menu: menu.reduce<Record<string, MenuItem>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    }),

  addByItem: (item, quantity = 1, mods = []) => {
    set((state) => {
      const key = modifierKey(mods);
      const existing = state.items.find(
        (l) => l.itemId === item.id && modifierKey(l.modifiers) === key,
      );
      if (existing) {
        return {
          items: state.items.map((l) =>
            l.lineId === existing.lineId ? { ...l, quantity: l.quantity + quantity } : l,
          ),
        };
      }
      const line: CartItem = {
        lineId: nextLineId(),
        itemId: item.id,
        name: item.name,
        unitPrice: unitPriceFor(item, mods),
        quantity,
        modifiers: mods,
      };
      return { items: [...state.items, line] };
    });
  },

  applyActions: (actions) => {
    const { menu } = get();
    for (const action of actions) {
      switch (action.type) {
        case 'add_item': {
          const item = menu[action.itemId];
          if (!item) continue;
          const mods = resolveModifiers(item, action.modifiers);
          get().addByItem(item, action.quantity, mods);
          break;
        }
        case 'remove_item':
          get().remove(action.lineId);
          break;
        case 'update_quantity':
          get().setQuantity(action.lineId, action.quantity);
          break;
        case 'clear_cart':
          get().clear();
          break;
      }
    }
  },

  setQuantity: (lineId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((l) => l.lineId !== lineId)
          : state.items.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    })),

  remove: (lineId) =>
    set((state) => ({ items: state.items.filter((l) => l.lineId !== lineId) })),

  clear: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),

  count: () => get().items.reduce((sum, l) => sum + l.quantity, 0),
}));
