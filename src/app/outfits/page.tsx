'use client';

import { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Outfit, ClothingItem } from '@/types';
import OutfitCard from '@/components/OutfitCard';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/outfits').then((r) => r.json()),
      fetch('/api/clothing').then((r) => r.json()),
    ]).then(([o, i]) => {
      setOutfits(o);
      setItems(i);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/outfits/${id}`, { method: 'DELETE' });
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#f8f7f5]/95 backdrop-blur-sm pt-12 pb-4 px-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meine Outfits</h1>
            <p className="text-sm text-gray-400 mt-0.5">{outfits.length} gespeicherte Outfits</p>
          </div>
          <Link href="/generate" className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
            <Sparkles size={18} className="text-white" />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-2">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3"><div className="h-3 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
              <Heart size={36} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Noch keine Outfits gespeichert</p>
            <p className="text-gray-400 text-sm mb-6">Lass die KI ein Outfit für dich zusammenstellen</p>
            <Link href="/generate" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-medium text-sm shadow-lg shadow-indigo-200 flex items-center gap-2">
              <Sparkles size={16} />Outfit erstellen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} items={items} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
