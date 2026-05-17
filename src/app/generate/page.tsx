'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, BookmarkPlus, RefreshCw, Lightbulb, Palette, ChevronLeft, ShirtIcon } from 'lucide-react';
import Link from 'next/link';
import { generateId } from '@/lib/utils';
import { OCCASION_LABELS, OCCASION_ICONS, CATEGORY_LABELS } from '@/types';
import type { ClothingItem, Outfit, Occasion } from '@/types';

const OCCASIONS = Object.keys(OCCASION_LABELS) as Occasion[];

type GenState = 'idle' | 'loading' | 'done' | 'error';

interface GeneratedOutfit {
  itemIds: string[]; name: string; description: string; colorScheme: string; stylingTip: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [genState, setGenState] = useState<GenState>('idle');
  const [generated, setGenerated] = useState<GeneratedOutfit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/clothing').then((r) => r.json()).then(setAllItems);
  }, []);

  const generate = async () => {
    setGenState('loading');
    setGenerated(null);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: allItems, occasion: OCCASION_LABELS[occasion] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler');
      setGenerated(data);
      setGenState('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten');
      setGenState('error');
    }
  };

  const saveOutfit = async () => {
    if (!generated) return;
    const outfit: Omit<Outfit, 'id'> = {
      itemIds: generated.itemIds,
      name: generated.name,
      description: generated.description,
      occasion: OCCASION_LABELS[occasion],
      colorScheme: generated.colorScheme,
      stylingTip: generated.stylingTip,
      createdAt: Date.now(),
    };
    await fetch('/api/outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(outfit),
    });
    setSaved(true);
  };

  const generatedItems = generated
    ? generated.itemIds.map((id) => allItems.find((i) => i.id === id)).filter(Boolean) as ClothingItem[]
    : [];

  if (allItems.length < 2) {
    return (
      <div className="min-h-screen px-5 pt-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
          <ShirtIcon size={36} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Zu wenige Kleidungsstücke</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">Füge mindestens 2 Kleidungsstücke hinzu, damit die KI ein Outfit erstellen kann.</p>
        <Link href="/upload" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-medium text-sm shadow-lg shadow-indigo-200">
          Kleidungsstück hinzufügen
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Outfit erstellen</h1>
          <p className="text-xs text-gray-400">{allItems.length} Kleidungsstücke verfügbar</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Für welchen Anlass?</p>
        <div className="grid grid-cols-3 gap-2">
          {OCCASIONS.map((occ) => (
            <button key={occ} onClick={() => setOccasion(occ)}
              className={`py-3 px-2 rounded-2xl text-center transition-all ${occasion === occ ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="text-xl mb-1">{OCCASION_ICONS[occ]}</div>
              <div className="text-xs font-medium">{OCCASION_LABELS[occ]}</div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={generate} disabled={genState === 'loading'}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
      >
        {genState === 'loading' ? <><Loader2 size={20} className="animate-spin" />KI erstellt dein Outfit...</> : <><Sparkles size={20} />Outfit erstellen lassen</>}
      </button>

      {genState === 'error' && (
        <div className="mt-4 bg-red-50 text-red-600 rounded-2xl p-4 text-sm text-center">{error}</div>
      )}

      {genState === 'done' && generated && generatedItems.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{generated.name}</h2>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-medium">{OCCASION_LABELS[occasion]}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {generatedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={item.imageData} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{CATEGORY_LABELS[item.category]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <p className="text-sm text-gray-700">{generated.description}</p>
            <div className="flex items-start gap-2.5">
              <Palette size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Farbschema</p>
                <p className="text-xs text-gray-500">{generated.colorScheme}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Styling-Tipp</p>
                <p className="text-xs text-gray-500">{generated.stylingTip}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={generate} className="flex-1 py-3.5 bg-white text-gray-700 rounded-2xl font-medium text-sm shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2">
              <RefreshCw size={16} />Neu generieren
            </button>
            <button onClick={saveOutfit} disabled={saved}
              className={`flex-1 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${saved ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'}`}
            >
              <BookmarkPlus size={16} />{saved ? 'Gespeichert!' : 'Outfit speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
