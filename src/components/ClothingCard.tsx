'use client';

import { Trash2 } from 'lucide-react';
import type { ClothingItem } from '@/types';

interface Props {
  item: ClothingItem;
  onDelete?: (id: string) => void;
}

export default function ClothingCard({ item, onDelete }: Props) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.imageData}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50 hover:text-red-500 text-gray-400"
          aria-label="Löschen"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
        {item.subcategory && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium truncate max-w-full">
            {item.subcategory}
          </span>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {item.colorHex.slice(0, 3).map((hex, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: hex }}
              title={item.colors[i]}
            />
          ))}
          <span className="text-xs text-gray-400 truncate">{item.style[0]}</span>
        </div>
      </div>
    </div>
  );
}
