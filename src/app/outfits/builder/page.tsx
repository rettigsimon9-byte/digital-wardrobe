'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Check, Save } from 'lucide-react';
import type { ClothingItem, ClothingCategory, Occasion } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, OCCASION_LABELS, OCCASION_ICONS } from '@/types';
import FlatLayCollage from '@/components/FlatLayCollage';

const ALL_CATEGORIES: ClothingCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
const OCCASIONS = Object.keys(OCCASION_LABELS) as Occasion[];

function OutfitBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState(OCCASION_LABELS['casual']);
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | 'alle'>('alle');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [items, outfits] = await Promise.all([
        fetch('/api/clothing').then((r) => r.json()),
        editId ? fetch('/api/outfits').then((r) => r.json()) : Promise.resolve(null),
      ]);
      setAllItems(items);
      if (editId && outfits) {
        const outfit = outfits.find((o: { id: string }) => o.id === editId);
        if (outfit) {
          setSelectedIds(new Set(outfit.itemIds));
          setName(outfit.name);
          setOccasion(outfit.occasion);
        }
      }
      setLoading(false);
    };
    load();
  }, [editId]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = allItems.filter((i) => selectedIds.has(i.id));
  const filteredItems = categoryFilter === 'alle' ? allItems : allItems.filter((i) => i.category === categoryFilter);

  const save = async () => {
    if (!name.trim() || selectedIds.size === 0) return;
    setSaving(true);
    const body = {
      itemIds: [...selectedIds],
      name: name.trim(),
      occasion,
      description: '',
      colorScheme: '',
      stylingTip: '',
      createdAt: Date.now(),
    };
    if (editId) {
      await fetch(`/api/outfits/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch('/api/outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    router.push('/outfits');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f8f7f5]/95 backdrop-blur-sm pt-12 pb-4 px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {editId ? 'Outfit bearbeiten' : 'Outfit erstellen'}
          </h1>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Live-Vorschau */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <FlatLayCollage items={selectedItems} />
          {selectedItems.length === 0 && (
            <p className="text-center text-sm text-gray-400 pb-4 -mt-3">
              Wähle Kleidungsstücke aus um eine Vorschau zu sehen
            </p>
          )}
        </div>

        {/* Name */}
        <div className="bg-white rounded-3xl px-4 py-3.5 shadow-sm">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Outfit-Name eingeben..."
            className="w-full text-base font-medium text-gray-900 placeholder-gray-300 outline-none bg-transparent"
          />
        </div>

        {/* Anlass */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Anlass</p>
          <div className="grid grid-cols-3 gap-2">
            {OCCASIONS.map((occ) => {
              const label = OCCASION_LABELS[occ];
              const active = occasion === label;
              return (
                <button
                  key={occ}
                  onClick={() => setOccasion(label)}
                  className={`py-2.5 rounded-2xl text-center transition-all ${
                    active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="text-lg">{OCCASION_ICONS[occ]}</div>
                  <div className="text-xs font-medium mt-0.5">{label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kleiderpicker */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Kleidungsstücke</p>
            {selectedIds.size > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {selectedIds.size} ausgewählt
              </span>
            )}
          </div>

          {/* Kategoriefilter */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            <button
              onClick={() => setCategoryFilter('alle')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                categoryFilter === 'alle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              Alle
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map((item) => {
              const selected = selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative rounded-xl overflow-hidden text-left transition-all ${
                    selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="p-1.5 bg-white">
                    <p className="text-xs font-medium text-gray-700 truncate leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-400">{CATEGORY_ICONS[item.category]}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">Keine Kleidungsstücke in dieser Kategorie</p>
          )}
        </div>
      </div>

      {/* Speichern-Button */}
      <div className="fixed bottom-20 left-0 right-0 px-5">
        <button
          onClick={save}
          disabled={saving || !name.trim() || selectedIds.size === 0}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold shadow-lg shadow-indigo-200 disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
        >
          <Save size={18} />
          {saving ? 'Wird gespeichert…' : editId ? 'Änderungen speichern' : 'Outfit speichern'}
        </button>
      </div>
    </div>
  );
}

export default function OutfitBuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OutfitBuilder />
    </Suspense>
  );
}
