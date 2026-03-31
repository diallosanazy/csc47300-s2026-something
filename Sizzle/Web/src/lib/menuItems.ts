export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  availability: 'available' | 'sold-out';
  description: string;
  ingredients: string;
  prepTime: string;
  dietaryTags: string[];
  popular: boolean;
  featured: boolean;
  image: string | null;
  soldToday?: number;
  thisWeek?: number;
  revenue?: number;
  rating?: number;
  createdAt?: string;
};

export const STORAGE_KEY = 'sizzle_menu_items';
export const DELETED_KEY = 'sizzle_deleted_items';

export const HARDCODED_ITEMS: Record<string, MenuItem> = {
  tacos: {
    id: 'tacos',
    name: 'Tacos Al Pastor',
    price: 9,
    category: 'mains',
    availability: 'available',
    description: 'Marinated pork, pineapple, onion, cilantro on corn tortillas',
    ingredients: 'Pork shoulder, pineapple, white onion, cilantro, corn tortillas, achiote paste, lime',
    prepTime: '10 min',
    dietaryTags: ['spicy'],
    popular: true,
    featured: false,
    image: null,
    soldToday: 38,
    thisWeek: 245,
    revenue: 342,
    rating: 4.8,
  },
  burrito: {
    id: 'burrito',
    name: 'Burrito Bowl',
    price: 11,
    category: 'mains',
    availability: 'available',
    description: 'Rice, beans, choice of protein, salsa, guac, sour cream',
    ingredients: 'Cilantro rice, black beans, chicken or steak, pico de gallo, guacamole, sour cream, lettuce',
    prepTime: '12 min',
    dietaryTags: ['gluten-free'],
    popular: true,
    featured: true,
    image: null,
    soldToday: 26,
    thisWeek: 189,
    revenue: 286,
    rating: 4.7,
  },
  churros: {
    id: 'churros',
    name: 'Churros',
    price: 7,
    category: 'desserts',
    availability: 'available',
    description: 'Crispy cinnamon sugar sticks with chocolate dipping sauce',
    ingredients: 'Flour, butter, sugar, cinnamon, eggs, dark chocolate, heavy cream',
    prepTime: '8 min',
    dietaryTags: ['vegetarian'],
    popular: false,
    featured: true,
    image: null,
    soldToday: 22,
    thisWeek: 156,
    revenue: 154,
    rating: 4.9,
  },
  elote: {
    id: 'elote',
    name: 'Elote',
    price: 6,
    category: 'sides',
    availability: 'available',
    description: 'Grilled corn with mayo, cotija cheese, chili, lime',
    ingredients: 'Sweet corn, mayonnaise, cotija cheese, chili powder, lime, cilantro',
    prepTime: '6 min',
    dietaryTags: ['vegetarian', 'gluten-free'],
    popular: false,
    featured: false,
    image: null,
    soldToday: 19,
    thisWeek: 134,
    revenue: 114,
    rating: 4.6,
  },
  quesadilla: {
    id: 'quesadilla',
    name: 'Quesadilla',
    price: 10,
    category: 'mains',
    availability: 'available',
    description: 'Flour tortilla, melted cheese, peppers, onions, salsa',
    ingredients: 'Flour tortilla, Oaxaca cheese, bell peppers, white onion, salsa verde',
    prepTime: '8 min',
    dietaryTags: ['vegetarian'],
    popular: false,
    featured: false,
    image: null,
    soldToday: 15,
    thisWeek: 102,
    revenue: 150,
    rating: 4.5,
  },
  horchata: {
    id: 'horchata',
    name: 'Horchata',
    price: 4.5,
    category: 'drinks',
    availability: 'sold-out',
    description: 'Traditional rice milk with cinnamon and vanilla',
    ingredients: 'Long-grain rice, cinnamon sticks, vanilla extract, sugar, whole milk',
    prepTime: '5 min',
    dietaryTags: ['vegetarian', 'nut-free'],
    popular: false,
    featured: false,
    image: null,
    soldToday: 12,
    thisWeek: 88,
    revenue: 54,
    rating: 4.4,
  },
};

export const HARD_CODED_ORDER = ['tacos', 'burrito', 'churros', 'elote', 'quesadilla', 'horchata'];

export const readSessionItems = (): MenuItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const writeSessionItems = (items: MenuItem[]) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const readDeletedItems = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.sessionStorage.getItem(DELETED_KEY) || '[]');
  } catch {
    return [];
  }
};

export const writeDeletedItems = (items: string[]) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(DELETED_KEY, JSON.stringify(items));
};

export const getMenuItemsForList = (): MenuItem[] => {
  const deleted = new Set(readDeletedItems());
  const sessionItems = readSessionItems();
  const overrides = new Map(sessionItems.map((item) => [item.id, item]));
  const baseItems = HARD_CODED_ORDER
    .filter((id) => !deleted.has(id))
    .map((id) => overrides.get(id) || HARDCODED_ITEMS[id]);
  const extraItems = sessionItems.filter((item) => !HARDCODED_ITEMS[item.id]);
  return [...baseItems, ...extraItems];
};

export const getMenuItemById = (id: string | null): MenuItem | null => {
  if (!id) return null;
  const sessionItems = readSessionItems();
  const override = sessionItems.find((item) => item.id === id);
  if (override) return override;
  return HARDCODED_ITEMS[id] || null;
};

export const saveMenuItem = (item: MenuItem) => {
  const items = readSessionItems();
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  writeSessionItems(items);
};

export const deleteMenuItem = (id: string) => {
  if (HARDCODED_ITEMS[id]) {
    const deleted = readDeletedItems();
    if (!deleted.includes(id)) {
      deleted.push(id);
      writeDeletedItems(deleted);
    }
    return;
  }

  const items = readSessionItems().filter((item) => item.id !== id);
  writeSessionItems(items);
};

export const CATEGORY_LABELS: Record<string, string> = {
  mains: 'Mains',
  sides: 'Sides',
  desserts: 'Desserts',
  drinks: 'Drinks',
  snacks: 'Snacks',
  specials: 'Specials',
};

export const ALL_DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'nut-free', 'dairy-free'];
