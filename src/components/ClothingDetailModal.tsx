'use client';

import { useState } from 'react';
import { X, Pencil, Check, Loader2, Tag } from 'lucide-react';
import type { ClothingItem, ClothingCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, SUBCATEGORIES } from '@/types';

interface Props {
  item: ClothingItem;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ClothingItem>) => void;
}

export default function ClothingDetailModal({ item, onClose, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<ClothingCategory>(item.category);
  const [subcategory, setSubcategory] = useState(item.subcategory ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/clothing/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, subcategory }),
    });
    if (res.ok) {
      onUpdate(item.id, { name, category, subcategory });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCategoryChange = (newCat: ClothingCategory) => {
    setCategory(newCat);
    setSubcategory('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-lg max-h-[88vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 gap-3">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg font-bold text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent w-full"
                autoFocus
              />
            ) : (
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{name}</h2>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-sm font-medium disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Speichern
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="Bearbeiten"
              >
                <Pencil size={14} className="text-gray-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="px-5 pb-4">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <img src={item.imageData} alt={item.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info blocks */}
        <div className="px-5 pb-10 space-y-4">

          {/* Kategorie + Unterkategorie */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kategorie</p>
            {editing ? (
              <div className="space-y-2">
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value as ClothingCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                >
                  {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((key) => (
                    <option key={key} value={key}>
                      {CATEGORY_ICONS[key]} {CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                >
                  <option value="">— Keine Unterkategorie —</option>
                  {SUBCATEGORIES[category].map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-700 font-medium">
                  {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
                </span>
                {item.subcategory && (
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                    {item.subcategory}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Farben */}
          {item.colors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Farben</p>
              <div className="flex items-center gap-3 flex-wrap">
                {item.colorHex.map((hex, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0" style={{ backgroundColor: hex }} />
                    <span className="text-sm text-gray-600">{item.colors[i]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stil */}
          {item.style.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tragestil</p>
              <div className="flex flex-wrap gap-2">
                {item.style.map((s) => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Saison */}
          {item.season.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Saison</p>
              <div className="flex flex-wrap gap-2">
                {item.season.map((s) => (
                  <span key={s} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Beschreibung */}
          {item.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Beschreibung</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={13} className="text-gray-300" />
                {item.tags.map((tag) => (
                  <span key={tag} className="text-sm text-gray-400">#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
