'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ImagePlus, CheckCircle, AlertCircle, Loader2, ChevronLeft, Tag,
} from 'lucide-react';
import { resizeImage, getMediaType } from '@/lib/utils';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types';
import type { ClothingItem } from '@/types';

type UploadState = 'idle' | 'uploading' | 'analyzing' | 'saving' | 'done' | 'error';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Partial<ClothingItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Bitte lade nur Bilder hoch (JPG, PNG, WEBP).');
      return;
    }

    setError(null);
    setState('uploading');

    const [displayImage, analysisImage, thumbnail] = await Promise.all([
      resizeImage(file, 900),
      resizeImage(file, 512),
      resizeImage(file, 200),
    ]);

    setPreview(displayImage);
    setState('analyzing');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: analysisImage, mediaType: getMediaType(analysisImage) }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();
      setAnalysis({ ...result, imageData: displayImage, thumbnail });
      setState('done');
    } catch {
      setError('Die KI-Analyse ist fehlgeschlagen. Bitte versuche es erneut.');
      setState('error');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleSave = async () => {
    if (!analysis?.imageData) return;
    setState('saving');

    const res = await fetch('/api/clothing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysis),
    });

    if (res.ok) router.push('/');
    else setState('error');
  };

  const reset = () => {
    setState('idle');
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen px-5 pt-12">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Kleidungsstück hinzufügen</h1>
      </div>

      {(state === 'idle' || state === 'error') && (
        <div
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImagePlus size={28} className="text-indigo-600" />
          </div>
          <p className="font-semibold text-gray-800 mb-1">Foto hochladen</p>
          <p className="text-sm text-gray-400">Tippe hier oder ziehe ein Bild hinein</p>
          <p className="text-xs text-gray-300 mt-3">JPG, PNG, WEBP</p>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm justify-center">
              <AlertCircle size={16} /><span>{error}</span>
            </div>
          )}
        </div>
      )}

      {(state === 'uploading' || state === 'analyzing') && (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
          {preview && (
            <div className="w-48 h-48 mx-auto rounded-2xl overflow-hidden mb-6 shadow-md">
              <img src={preview} alt="Vorschau" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center justify-center gap-3 text-indigo-600">
            <Loader2 size={22} className="animate-spin" />
            <p className="font-medium">
              {state === 'uploading' ? 'Bild wird vorbereitet...' : 'KI analysiert dein Kleidungsstück...'}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Das dauert nur einen Moment</p>
        </div>
      )}

      {(state === 'done' || state === 'saving') && analysis && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              <img src={preview!} alt={analysis.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{analysis.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {analysis.category && `${CATEGORY_ICONS[analysis.category]} ${CATEGORY_LABELS[analysis.category]}`}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {analysis.description && <p className="text-gray-600">{analysis.description}</p>}
              {analysis.colors && (
                <div className="flex items-center gap-2 flex-wrap">
                  {analysis.colorHex?.map((hex, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-gray-100 shadow-sm" style={{ backgroundColor: hex }} />
                      <span className="text-gray-500 text-xs">{analysis.colors![i]}</span>
                    </span>
                  ))}
                </div>
              )}
              {analysis.style && (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.style.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                  {analysis.season?.map((s) => (
                    <span key={s} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{s}</span>
                  ))}
                </div>
              )}
              {analysis.tags && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag size={12} className="text-gray-400" />
                  {analysis.tags.map((tag) => <span key={tag} className="text-xs text-gray-400">#{tag}</span>)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={reset} disabled={state === 'saving'} className="flex-1 py-3.5 bg-white text-gray-700 rounded-2xl font-medium text-sm shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
              Neu aufnehmen
            </button>
            <button onClick={handleSave} disabled={state === 'saving'} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {state === 'saving' && <Loader2 size={16} className="animate-spin" />}
              {state === 'saving' ? 'Wird gespeichert...' : 'Zum Kleiderschrank hinzufügen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
