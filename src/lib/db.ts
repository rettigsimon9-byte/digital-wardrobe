import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ClothingItem, Outfit } from '@/types';

interface WardrobeDB extends DBSchema {
  clothing: {
    key: string;
    value: ClothingItem;
    indexes: { 'by-category': string; 'by-created': number };
  };
  outfits: {
    key: string;
    value: Outfit;
    indexes: { 'by-created': number };
  };
}

let dbPromise: Promise<IDBPDatabase<WardrobeDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<WardrobeDB>('wardrobe-db', 1, {
      upgrade(db) {
        const clothingStore = db.createObjectStore('clothing', { keyPath: 'id' });
        clothingStore.createIndex('by-category', 'category');
        clothingStore.createIndex('by-created', 'createdAt');

        const outfitsStore = db.createObjectStore('outfits', { keyPath: 'id' });
        outfitsStore.createIndex('by-created', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export const clothingDB = {
  async getAll(): Promise<ClothingItem[]> {
    const db = await getDB();
    const items = await db.getAllFromIndex('clothing', 'by-created');
    return items.reverse();
  },

  async get(id: string): Promise<ClothingItem | undefined> {
    const db = await getDB();
    return db.get('clothing', id);
  },

  async add(item: ClothingItem): Promise<void> {
    const db = await getDB();
    await db.add('clothing', item);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('clothing', id);
  },
};

export const outfitsDB = {
  async getAll(): Promise<Outfit[]> {
    const db = await getDB();
    const outfits = await db.getAllFromIndex('outfits', 'by-created');
    return outfits.reverse();
  },

  async add(outfit: Outfit): Promise<void> {
    const db = await getDB();
    await db.add('outfits', outfit);
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('outfits', id);
  },
};
