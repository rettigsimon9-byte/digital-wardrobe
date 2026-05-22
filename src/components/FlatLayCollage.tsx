'use client';

import type { ClothingItem, ClothingCategory } from '@/types';

const SIZES: Record<ClothingCategory, { width: number; height: number }> = {
  outerwear:   { width: 120, height: 120 },
  tops:        { width: 104, height: 104 },
  dresses:     { width: 104, height: 136 },
  bottoms:     { width: 104, height: 104 },
  shoes:       { width: 80,  height: 80  },
  accessories: { width: 64,  height: 64  },
};

export default function FlatLayCollage({ items }: { items: ClothingItem[] }) {
  const by: Partial<Record<ClothingCategory, ClothingItem[]>> = {};
  for (const item of items) {
    (by[item.category] ??= []).push(item);
  }

  const hasDress = !!by.dresses?.length;
  const mainCats: ClothingCategory[] = hasDress
    ? ['outerwear', 'dresses']
    : ['outerwear', 'tops', 'bottoms'];

  const rows: ClothingItem[][] = [];
  for (const cat of mainCats) {
    const first = by[cat]?.[0];
    if (first) rows.push([first]);
  }

  const bottom = [by.shoes?.[0], by.accessories?.[0], by.accessories?.[1]].filter(Boolean) as ClothingItem[];
  if (bottom.length) rows.push(bottom);

  if (rows.length === 0) {
    return (
      <div className="bg-[#f5f3ef] flex items-center justify-center" style={{ minHeight: 200 }}>
        <span style={{ fontSize: 48 }}>👗</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f3ef] flex flex-col items-center justify-center gap-2 py-4 px-3" style={{ minHeight: 200 }}>
      {rows.map((rowItems, ri) => (
        <div key={ri} className="flex items-end justify-center gap-2">
          {rowItems.map((item) => {
            const s = SIZES[item.category];
            return (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden flex-shrink-0"
                style={{
                  width: s.width,
                  height: s.height,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  background: '#fff',
                }}
              >
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
