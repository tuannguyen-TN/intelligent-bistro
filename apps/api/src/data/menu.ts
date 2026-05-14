import type { MenuItem } from '@bistro/shared';

const SIZE_GROUP_DRINK = {
  id: 'size',
  label: 'Size',
  options: [
    { id: 'small', label: 'Small', priceDelta: 0 },
    { id: 'medium', label: 'Medium', priceDelta: 0.75 },
    { id: 'large', label: 'Large', priceDelta: 1.5 },
  ],
};

const SPICE_GROUP = {
  id: 'spice',
  label: 'Spice level',
  options: [
    { id: 'mild', label: 'Mild', priceDelta: 0 },
    { id: 'medium', label: 'Medium', priceDelta: 0 },
    { id: 'spicy', label: 'Spicy', priceDelta: 0 },
    { id: 'extra-spicy', label: 'Extra spicy', priceDelta: 0 },
  ],
};

const SANDWICH_ADDONS = {
  id: 'addons',
  label: 'Add-ons',
  multi: true,
  options: [
    { id: 'avocado', label: 'Avocado', priceDelta: 1.5 },
    { id: 'bacon', label: 'Bacon', priceDelta: 2.0 },
    { id: 'extra-cheese', label: 'Extra cheese', priceDelta: 1.0 },
    { id: 'no-onions', label: 'No onions', priceDelta: 0 },
    { id: 'no-pickles', label: 'No pickles', priceDelta: 0 },
  ],
};

export const MENU: MenuItem[] = [
  {
    id: 'spicy-chicken-sando',
    name: 'Spicy Chicken Sandwich',
    description: 'Buttermilk-fried chicken thigh, slaw, pickles, chili honey on a brioche bun.',
    price: 13.5,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
    tags: ['spicy', 'chicken', 'popular'],
    modifierGroups: [SPICE_GROUP, SANDWICH_ADDONS],
  },
  {
    id: 'truffle-mushroom-burger',
    name: 'Truffle Mushroom Burger',
    description: 'Smashed beef patty, truffle aioli, gruyère, caramelized onions, wild mushrooms.',
    price: 16.0,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tags: ['beef', 'umami'],
    modifierGroups: [SANDWICH_ADDONS],
  },
  {
    id: 'crispy-tofu-banh-mi',
    name: 'Crispy Tofu Bánh Mì',
    description: 'Lemongrass-marinated tofu, pickled daikon and carrot, cilantro, sriracha mayo.',
    price: 12.0,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'vegan-option', 'spicy'],
    modifierGroups: [SPICE_GROUP, SANDWICH_ADDONS],
  },
  {
    id: 'philly-cheesesteak',
    name: 'Philly Cheesesteak',
    description: 'Thinly shaved ribeye, sweet peppers, caramelized onions, provolone, hoagie roll.',
    price: 15.0,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1539252554935-80c8cb1ad6f6?auto=format&fit=crop&w=800&q=80',
    tags: ['beef', 'classic'],
    modifierGroups: [SANDWICH_ADDONS],
  },
  {
    id: 'blt-avocado',
    name: 'BLT Avocado',
    description: 'Thick-cut bacon, heirloom tomato, butter lettuce, smashed avocado, sourdough.',
    price: 13.0,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    tags: ['brunch', 'classic'],
    modifierGroups: [SANDWICH_ADDONS],
  },
  {
    id: 'pulled-pork-sandwich',
    name: 'Pulled Pork Sandwich',
    description: '12-hour braised pork shoulder, cider slaw, mustard BBQ, brioche bun.',
    price: 14.5,
    category: 'sandwich',
    image:
      'https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?auto=format&fit=crop&w=800&q=80',
    tags: ['pork', 'smoky', 'popular'],
    modifierGroups: [SPICE_GROUP, SANDWICH_ADDONS],
  },
  {
    id: 'roasted-beet-salad',
    name: 'Roasted Beet & Goat Cheese Salad',
    description: 'Mixed greens, roasted beets, candied walnuts, goat cheese, citrus vinaigrette.',
    price: 11.0,
    category: 'salad',
    image:
      'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'gluten-free', 'light'],
  },
  {
    id: 'caesar-salad',
    name: 'Classic Caesar',
    description: 'Romaine hearts, parmigiano, sourdough croutons, anchovy dressing.',
    price: 10.0,
    category: 'salad',
    image:
      'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=800&q=80',
    tags: ['classic'],
    modifierGroups: [
      {
        id: 'protein',
        label: 'Add protein',
        options: [
          { id: 'none', label: 'No protein', priceDelta: 0 },
          { id: 'grilled-chicken', label: 'Grilled chicken', priceDelta: 4.0 },
          { id: 'shrimp', label: 'Shrimp', priceDelta: 5.5 },
        ],
      },
    ],
  },
  {
    id: 'kale-quinoa-bowl',
    name: 'Kale & Quinoa Bowl',
    description: 'Massaged kale, tri-color quinoa, roasted squash, pomegranate, tahini dressing.',
    price: 12.5,
    category: 'salad',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tags: ['vegan', 'gluten-free', 'hearty'],
  },
  {
    id: 'watermelon-feta-salad',
    name: 'Watermelon Feta Salad',
    description: 'Chilled watermelon, creamy feta, cucumber, fresh mint, lime vinaigrette.',
    price: 11.5,
    category: 'salad',
    image:
      'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80',
    tags: ['summer', 'light', 'vegetarian'],
  },
  {
    id: 'thai-crunch-salad',
    name: 'Thai Crunch Salad',
    description: 'Napa cabbage, carrots, edamame, peanuts, sesame-ginger, crispy wontons.',
    price: 12.0,
    category: 'salad',
    image:
      'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80',
    tags: ['vegan-option', 'crunchy'],
    modifierGroups: [
      {
        id: 'protein',
        label: 'Add protein',
        options: [
          { id: 'none', label: 'No protein', priceDelta: 0 },
          { id: 'grilled-chicken', label: 'Grilled chicken', priceDelta: 4.0 },
          { id: 'shrimp', label: 'Shrimp', priceDelta: 5.5 },
          { id: 'tofu', label: 'Crispy tofu', priceDelta: 3.0 },
        ],
      },
    ],
  },
  {
    id: 'rosemary-fries',
    name: 'Rosemary Fries',
    description: 'Hand-cut russet potatoes, sea salt, fresh rosemary, garlic aioli.',
    price: 6.5,
    category: 'side',
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'shareable'],
  },
  {
    id: 'mac-and-cheese',
    name: 'Aged Cheddar Mac',
    description: 'Cavatappi, three-cheese sauce, toasted breadcrumb crust.',
    price: 8.0,
    category: 'side',
    image:
      'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'comfort'],
  },
  {
    id: 'charred-brussels',
    name: 'Charred Brussels Sprouts',
    description: 'Cast-iron seared, miso glaze, toasted sesame, chili crisp.',
    price: 7.5,
    category: 'side',
    image:
      'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80',
    tags: ['vegan', 'umami'],
  },
  {
    id: 'tomato-bisque',
    name: 'Tomato Bisque',
    description: 'San Marzano tomato, basil oil, cream swirl, sourdough crouton.',
    price: 6.0,
    category: 'side',
    image:
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'comfort'],
  },
  {
    id: 'pretzel-bites',
    name: 'Soft Pretzel Bites',
    description: 'House-baked, pretzel salt, warm beer cheese dip.',
    price: 7.0,
    category: 'side',
    image:
      'https://images.unsplash.com/photo-1607920591413-7ec7c4ad79e8?auto=format&fit=crop&w=800&q=80',
    tags: ['shareable'],
  },
  {
    id: 'sparkling-water',
    name: 'Sparkling Water',
    description: 'Filtered, lightly carbonated.',
    price: 3.0,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=800&q=80',
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'still-water',
    name: 'Still Water',
    description: 'Filtered table water.',
    price: 2.5,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'iced-hibiscus-tea',
    name: 'Iced Hibiscus Tea',
    description: 'House-brewed hibiscus, lime, light cane sugar.',
    price: 4.5,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    tags: ['caffeine-free', 'refreshing'],
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Coffee',
    description: 'Slow-steeped 18 hours, single-origin Ethiopian beans.',
    price: 5.0,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    tags: ['caffeine'],
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'house-lemonade',
    name: 'House Lemonade',
    description: 'Meyer lemon, raw cane sugar, fresh mint, crushed ice.',
    price: 4.0,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    tags: ['caffeine-free', 'refreshing'],
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'oat-chai-latte',
    name: 'Oat Milk Chai Latte',
    description: 'Black tea, cardamom, ginger, oat milk, raw honey.',
    price: 5.5,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1571658734888-9eb14fe614c8?auto=format&fit=crop&w=800&q=80',
    tags: ['caffeine'],
    modifierGroups: [SIZE_GROUP_DRINK],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    description: 'Double shot, single-origin Ethiopian beans, pulled to order.',
    price: 3.5,
    category: 'drink',
    image:
      'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=800&q=80',
    tags: ['caffeine'],
  },
  {
    id: 'olive-oil-cake',
    name: 'Olive Oil Cake',
    description: 'Almond flour, citrus zest, whipped mascarpone, candied lemon.',
    price: 7.5,
    category: 'dessert',
    image:
      'https://images.unsplash.com/photo-1542124948-dc391252a940?auto=format&fit=crop&w=800&q=80',
    tags: ['gluten-free'],
  },
  {
    id: 'dark-chocolate-brownie',
    name: 'Dark Chocolate Brownie',
    description: 'Belgian dark chocolate, flaky sea salt, malted whipped cream.',
    price: 7.0,
    category: 'dessert',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    tags: ['rich', 'popular'],
  },
  {
    id: 'vanilla-panna-cotta',
    name: 'Vanilla Bean Panna Cotta',
    description: 'Madagascar vanilla, berry compote, toasted almond crumble.',
    price: 8.0,
    category: 'dessert',
    image:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    tags: ['gluten-free', 'light'],
  },
  {
    id: 'banana-pudding',
    name: 'Banana Pudding',
    description: 'Layered vanilla wafers, fresh bananas, whipped cream, salted caramel.',
    price: 7.5,
    category: 'dessert',
    image:
      'https://images.unsplash.com/photo-1551404973-761c83cd8339?auto=format&fit=crop&w=800&q=80',
    tags: ['classic'],
  },
];

export function findItem(id: string): MenuItem | undefined {
  return MENU.find((m) => m.id === id);
}
