export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories';

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  tops: 'Oberteile',
  bottoms: 'Hosen & Röcke',
  dresses: 'Kleider',
  outerwear: 'Jacken & Mäntel',
  shoes: 'Schuhe',
  accessories: 'Accessoires',
};

export const CATEGORY_ICONS: Record<ClothingCategory, string> = {
  tops: '👕',
  bottoms: '👖',
  dresses: '👗',
  outerwear: '🧥',
  shoes: '👟',
  accessories: '👜',
};

export const SUBCATEGORIES: Record<ClothingCategory, string[]> = {
  tops: [
    'Trägerloses Top', 'Spaghetti-Top', 'Tank Top', 'T-Shirt', 'Langarmshirt',
    'Bluse', 'Hemd', 'Crop Top', 'Rollkragenpullover', 'Pullover', 'Strickpullover',
  ],
  bottoms: [
    'Jeans', 'Chinos', 'Shorts', 'Rock', 'Minirock', 'Maxirock',
    'Jogginghose', 'Leggings', 'Anzughose',
  ],
  dresses: [
    'Minikleid', 'Midikleid', 'Maxikleid', 'Sommerkleid', 'Abendkleid', 'Wickelkleid',
  ],
  outerwear: [
    'Jeansjacke', 'Lederjacke', 'Blazer', 'Hoodie', 'Trenchcoat',
    'Wintermantel', 'Cardigan', 'Bomberjacke', 'Pufferjacke',
  ],
  shoes: [
    'Sneaker', 'Pumps', 'Sandalen', 'Stiefel', 'Stiefeletten',
    'Ballerinas', 'Loafer', 'Sportschuhe',
  ],
  accessories: [
    'Tasche', 'Handtasche', 'Rucksack', 'Gürtel', 'Schal',
    'Mütze', 'Schmuck', 'Sonnenbrille', 'Hut',
  ],
};

export interface ClothingItem {
  id: string;
  imageData: string;
  thumbnail: string;
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  colors: string[];
  colorHex: string[];
  style: string[];
  season: string[];
  description: string;
  tags: string[];
  createdAt: number;
}

export interface Outfit {
  id: string;
  itemIds: string[];
  name: string;
  description: string;
  occasion: string;
  colorScheme: string;
  stylingTip: string;
  createdAt: number;
}

export type Occasion = 'casual' | 'work' | 'evening' | 'sport' | 'date' | 'travel';

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Casual',
  work: 'Arbeit',
  evening: 'Abend',
  sport: 'Sport',
  date: 'Date Night',
  travel: 'Reise',
};

export const OCCASION_ICONS: Record<Occasion, string> = {
  casual: '☀️',
  work: '💼',
  evening: '🌙',
  sport: '🏃',
  date: '💫',
  travel: '✈️',
};

export interface SubOccasion {
  value: string;
  label: string;
  icon: string;
}

export const SUB_OCCASIONS: Record<Occasion, SubOccasion[]> = {
  work: [
    { value: 'seriös', label: 'Seriös', icon: '👔' },
    { value: 'smart_casual', label: 'Smart Casual', icon: '🧥' },
    { value: 'kreativ', label: 'Kreativ', icon: '🎨' },
  ],
  casual: [
    { value: 'lässig', label: 'Lässig', icon: '😎' },
    { value: 'wochenende', label: 'Wochenende', icon: '🌤️' },
    { value: 'outdoor', label: 'Outdoor', icon: '🌿' },
  ],
  evening: [
    { value: 'elegant', label: 'Elegant', icon: '✨' },
    { value: 'party', label: 'Party', icon: '🎉' },
    { value: 'dinner', label: 'Dinner', icon: '🍷' },
  ],
  sport: [
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'outdoor_sport', label: 'Outdoor Sport', icon: '🏔️' },
    { value: 'yoga', label: 'Yoga', icon: '🧘' },
  ],
  date: [
    { value: 'romantisch', label: 'Romantisch', icon: '💕' },
    { value: 'leger', label: 'Leger', icon: '☕' },
    { value: 'schick', label: 'Schick', icon: '💎' },
  ],
  travel: [
    { value: 'komfort', label: 'Komfort', icon: '🛫' },
    { value: 'city', label: 'City Trip', icon: '🏙️' },
    { value: 'strand', label: 'Strandurlaub', icon: '🏖️' },
  ],
};
