'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, CheckCircle, AlertCircle, Loader2, ChevronLeft, Plus } from 'lucide-react';
import { resizeImage, getMediaType } from '@/lib/utils';

type ItemStatus = 'pending' | 'analyzing' | 'saving' | 'done' | 'error';

interface QueueItem {
  id: string;
  file: File;
  preview: string | null;
  status: ItemStatus;
  name: string;
  error: string | null;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  pending: 'Wartend...',
  analyzing: 'KI analysiert...',
  saving: 'Wird gespeichert...',
  done: 'Gespeichert',
  error: 'Fehler',
};

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [running, setRunning] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const updateItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    setQueue((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const processBatch = useCallback(
    async (items: QueueItem[]) => {
      setRunning(true);
      for (const item of items) {
        updateItem(item.id, { status: 'analyzing' });
        try {
          const [display, analysisImg, thumb] = await Promise.all([
            resizeImage(item.file, 900),
            resizeImage(item.file, 512),
            resizeImage(item.file, 200),
          ]);

          updateItem(item.id, { preview: display });

          const analyzeRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: analysisImg, mediaType: getMediaType(analysisImg) }),
          });

          if (!analyzeRes.ok) throw new Error('Analyse fehlgeschlagen');
          const result = await analyzeRes.json();

          updateItem(item.id, { status: 'saving', name: result.name || item.name });

          const saveRes = await fetch('/api/clothing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...result, imageData: display, thumbnail: thumb }),
          });

          if (!saveRes.ok) throw new Error('Speichern fehlgeschlagen');
          updateItem(item.id, { status: 'done' });
        } catch (e) {
          updateItem(item.id, {
            status: 'error',
            error: e instanceof Error ? e.message : 'Unbekannter Fehler',
          });
        }
      }
      setRunning(false);
    },
    [updateItem]
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith('image/'));
      if (images.length === 0) return;

      const newItems: QueueItem[] = images.map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        preview: null,
        status: 'pending',
        name: f.name,
        error: null,
      }));

      setQueue((prev) => {
        const updated = [...prev, ...newItems];
        return updated;
      });

      processBatch(newItems);
    },
    [processBatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const doneCount = queue.filter((i) => i.status === 'done').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;
  const allDone = queue.length > 0 && !running;

  // — Idle: no queue yet —
  if (queue.length === 0) {
    return (
      <div className="min-h-screen px-5 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Kleidungsstücke hinzufügen</h1>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImagePlus size={28} className="text-indigo-600" />
          </div>
          <p className="font-semibold text-gray-800 mb-1">Fotos hochladen</p>
          <p className="text-sm text-gray-400 mb-1">Tippe hier oder ziehe Bilder hinein</p>
          <p className="text-xs text-indigo-500 font-medium">Mehrere Bilder gleichzeitig möglich</p>
          <p className="text-xs text-gray-300 mt-2">JPG, PNG, WEBP</p>
        </div>
      </div>
    );
  }

  // — Queue active / done —
  return (
    <div className="min-h-screen px-5 pt-12 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Kleidungsstücke hinzufügen</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {running
              ? `${doneCount} von ${queue.length} verarbeitet...`
              : `${doneCount} gespeichert${errorCount > 0 ? ` · ${errorCount} Fehler` : ''}`}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {queue.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-center gap-3 p-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {item.preview ? (
                <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImagePlus size={20} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.status === 'done' ? item.name : item.file.name}
              </p>
              <p className={`text-xs mt-0.5 ${
                item.status === 'done' ? 'text-green-500' :
                item.status === 'error' ? 'text-red-400' :
                item.status === 'pending' ? 'text-gray-300' :
                'text-indigo-500'
              }`}>
                {item.status === 'error' ? (item.error ?? 'Fehler') : STATUS_LABEL[item.status]}
              </p>
            </div>

            {/* Status icon */}
            <div className="flex-shrink-0">
              {item.status === 'done' && <CheckCircle size={20} className="text-green-500" />}
              {item.status === 'error' && <AlertCircle size={20} className="text-red-400" />}
              {(item.status === 'analyzing' || item.status === 'saving') && (
                <Loader2 size={20} className="text-indigo-500 animate-spin" />
              )}
              {item.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions after all done */}
      {allDone && (
        <div className="space-y-3">
          {/* Add more */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
            />
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Plus size={16} />
              <span className="text-sm font-medium">Weitere Fotos hinzufügen</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            Zum Kleiderschrank ({doneCount} neue Stücke)
          </button>
        </div>
      )}
    </div>
  );
}
