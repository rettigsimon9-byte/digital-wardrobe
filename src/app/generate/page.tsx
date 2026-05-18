'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, Loader2, BookmarkPlus, RefreshCw, Lightbulb, Palette, ChevronLeft, ShirtIcon, Check,
} from 'lucide-react';
import Link from 'next/link';
import { OCCASION_LABELS, OCCASION_ICONS, CATEGORY_LABELS, SUB_OCCASIONS } from '@/types';
import type { ClothingItem, Outfit, Occasion } from '@/types';

const OCCASIONS = Object.keys(OCCASION_LABELS) as Occasion[];

type GenState = 'idle' | 'loading' | 'done' | 'error';

interface GeneratedOutfit {
  itemIds: string[];
  name: string;
  description: string;
  colorScheme: string;
  stylingTip: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [subOccasion, setSubOccasion] = useState<string>(SUB_OCCASIONS['casual'][0].value);
  const [genState, setGenState] = useState<GenState>('idle');
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());
  const [previousCombinations, setPreviousCombinations] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/clothing').then((r) => r.json()).then(setAllItems);
  }, []);

  const handleOccasionChange = (occ: Occasion) => {
    setOccasion(occ);
    setSubOccasion(SUB_OCCASIONS[occ][0].value);
    setOutfits([]);
    setSavedIndices(new Set());
    setPreviousCombinations([]);
  };

  const generate = async () => {
    setGenState('loading');
    setOutfits([]);
    setSavedIndices(new Set());
    setError(null);

    const subLabel = SUB_OCCASIONS[occasion].find((s) => s.value === subOccasion)?.label ?? subOccasion;

    try {
      const res = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: allItems,
          occasion: OCCASION_LABELS[occasion],
          subOccasion: subLabel,
          previousCombinations,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');

      const newOutfits: GeneratedOutfit[] = Array.isArray(data) ? data : [data];
      setOutfits(newOutfits);
      setPreviousCombinations((prev) => [...prev, ...newOutfits.map((o) => o.itemIds)]);
      setGenState('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten');
      setGenState('error');
    }
  };

  const saveOutfit = async (outfit: GeneratedOutfit, index: number) => {
    const subLabel = SUB_OCCASIONS[occasion].find((s) => s.value === subOccasion)?.label ?? subOccasion;
    const outfitData: Omit<Outfit, 'id'> = {
      itemIds: outfit.itemIds,
      name: outfit.name,
      description: outfit.description,
      occasion: `${OCCASION_LABELS[occasion]} – ${subLabel}`,
      colorScheme: outfit.colorScheme,
      stylingTip: outfit.stylingTip,
      createdAt: Date.now(),
    };
    await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outfitData),
    });
    setSavedIndices((prev) => new Set([...prev, index]));
  };

  if (allItems.length < 2) {
    return (
      <div className="min-h-screen px-5 pt-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
          <ShirtIcon size={36} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Zu wenige Kleidungsstücke</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Füge mindestens 2 Kleidungsstücke hinzu.</p>
        <Link href="/upload" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-medium text-sm shadow-lg shadow-indigo-200">
          Kleidungsstück hinzufügen
        </Link>
      </div>
    );
  }

  const currentSubOccasions = SUB_OCCASIONS[occasion];
  const activeSubOccasion = currentSubOccasions.find((s) => s.value === subOccasion);

  return (
    <div className="min-h-screen px-5 pt-12 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Outfit erstellen</h1>
          <p className="text-xs text-gray-400">{allItems.length} Kleidungsstücke verfügbar</p>
        </div>
      </div>

      {/* Anlass */}
      <div className="bg-white rounded-3xl p-5 shadow-sm mb-3">
        <p className="text-sm font-semibold text-gray-700 mb-3">Für welchen Anlass?</p>
        <div className="grid grid-cols-3 gap-2">
          {OCCASIONS.map((occ) => (
            <button key={occ} onClick={() => handleOccasionChange(occ)}
              className={`py-3 px-2 rounded-2xl text-center transition-all ${occasion === occ ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="text-xl mb-1">{OCCASION_ICONS[occ]}</div>
              <div className="text-xs font-medium">{OCCASION_LABELS[occ]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stil */}
      <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Welcher Stil?</p>
        <div className="flex gap-2 flex-wrap">
          {currentSubOccasions.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setSubOccasion(sub.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                subOccasion === sub.value
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{sub.icon}</span>
              <span>{sub.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={genState === 'loading'}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2 mb-4"
      >
        {genState === 'loading'
          ? <><Loader2 size={20} className="animate-spin" />KI erstellt deine Outfits...</>
          : outfits.length > 0
          ? <><RefreshCw size={20} />Andere Outfits generieren</>
          : <><Sparkles size={20} />3 Outfits erstellen lassen</>}
      </button>

      {genState === 'error' && (
        <div className="mb-4 bg-red-50 text-red-600 rounded-2xl p-4 text-sm text-center">{error}</div>
      )}

      {/* Outfit cards */}
      {genState === 'done' && outfits.length > 0 && (
        <div className="space-y-5">
          {outfits.map((outfit, idx) => {
            const outfitItems = outfit.itemIds
              .map((id) => allItems.find((i) => i.id === id))
              .filter(Boolean) as ClothingItem[];
            const isSaved = savedIndices.has(idx);

            return (
              <div key={idx} className="bg-white rounded-3xl shadow-sm overflow-hidden">
                {/* Outfit header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Outfit {idx + 1}</span>
                    <h3 className="text-base font-bold text-gray-900">{outfit.name}</h3>
                  </div>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                    {activeSubOccasion?.icon} {activeSubOccasion?.label}
                  </span>
                </div>

                {/* Items grid */}
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-3 gap-2">
                    {outfitItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                        <div className="aspect-square overflow-hidden">
                          <img src={item.thumbnail || item.imageData} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-1.5">
                          <p className="text-xs font-medium text-gray-700 truncate leading-tight">{item.name}</p>
                          <p className="text-xs text-gray-400 truncate">{CATEGORY_LABELS[item.category]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="px-4 pb-3 space-y-2">
                  <p className="text-sm text-gray-600">{outfit.description}</p>
                  <div className="flex items-start gap-2">
                    <Palette size={14} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">{outfit.colorScheme}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lightbulb size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">{outfit.stylingTip}</p>
                  </div>
                </div>

                {/* Save button */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => saveOutfit(outfit, idx)}
                    disabled={isSaved}
                    className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                      isSaved
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
                    }`}
                  >
                    {isSaved ? <><Check size={16} />Gespeichert!</> : <><BookmarkPlus size={16} />Outfit speichern</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
