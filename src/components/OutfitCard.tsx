'use client';

import { Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import type { Outfit, ClothingItem } from '@/types';
import FlatLayCollage from './FlatLayCollage';

interface Props {
  outfit: Outfit;
  items: ClothingItem[];
  onDelete?: (id: string) => void;
}

export default function OutfitCard({ outfit, items, onDelete }: Props) {
  const outfitItems = outfit.itemIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean) as ClothingItem[];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <FlatLayCollage items={outfitItems} />

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{outfit.name}</p>
            <p className="text-xs text-indigo-600 mt-0.5">{outfit.occasion}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link
              href={`/outfits/builder?edit=${outfit.id}`}
              className="p-1.5 text-gray-300 hover:text-indigo-500 transition-colors"
            >
              <Pencil size={14} />
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(outfit.id)}
                className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{outfit.colorScheme}</p>
        <p className="text-xs text-gray-400 mt-1">{outfitItems.length} Kleidungsstücke</p>
      </div>
    </div>
  );
}
