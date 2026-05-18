'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ShirtIcon, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ClothingItem, ClothingCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ICONS, SUBCATEGORIES } from '@/types';
import ClothingCard from '@/components/ClothingCard';
import ClothingDetailModal from '@/components/ClothingDetailModal';

const STORAGE_KEY = 'digitalWardrobe_order';

const ALL_CATEGORIES: (ClothingCategory | 'all')[] = [
  'all', 'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories',
];

function SortableCard({
  item,
  onDelete,
  onOpen,
}: {
  item: ClothingItem;
  onDelete: (id: string) => void;
  onOpen: (item: ClothingItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(item)}
      className="cursor-pointer"
    >
      <ClothingCard item={item} onDelete={onDelete} />
    </div>
  );
}

function DroppableCategoryChip({
  cat,
  isActive,
  onClick,
  children,
}: {
  cat: ClothingCategory;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${cat}` });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-sm'
          : isOver
          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-400 scale-105'
          : 'bg-white text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function WardrobePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filter, setFilter] = useState<ClothingCategory | 'all'>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  useEffect(() => {
    fetch('/api/clothing')
      .then((r) => r.json())
      .then((data: ClothingItem[]) => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const orderIds: string[] = JSON.parse(saved);
          const orderMap = new Map(orderIds.map((id, i) => [id, i]));
          data.sort((a, b) => (orderMap.get(a.id) ?? Infinity) - (orderMap.get(b.id) ?? Infinity));
        }
        setItems(data);
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (cat: ClothingCategory | 'all') => {
    setFilter(cat);
    setSubcategoryFilter(null);
  };

  const filtered = items.filter((i) => {
    if (filter !== 'all' && i.category !== filter) return false;
    if (subcategoryFilter && i.subcategory !== subcategoryFilter) return false;
    return true;
  });

  const activeItem = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const overId = over.id.toString();

    // Drop onto a category chip → recategorize
    if (overId.startsWith('drop-')) {
      const newCategory = overId.replace('drop-', '') as ClothingCategory;
      const dragged = items.find((i) => i.id === active.id);
      if (!dragged || dragged.category === newCategory) return;

      await fetch(`/api/clothing/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory, subcategory: '' }),
      });

      setItems((prev) =>
        prev.map((i) => (i.id === active.id ? { ...i, category: newCategory, subcategory: '' } : i))
      );
      return;
    }

    // Reorder within current view
    const oldIdx = filtered.findIndex((i) => i.id === active.id);
    const newIdx = filtered.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const newFiltered = arrayMove(filtered, oldIdx, newIdx);
    const newItems = [...items];
    const filteredIndices = filtered.map((fi) => items.findIndex((i) => i.id === fi.id));
    filteredIndices.forEach((fullIdx, i) => { newItems[fullIdx] = newFiltered[i]; });

    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map((i) => i.id)));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/clothing/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleUpdate = (id: string, updates: Partial<ClothingItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    setSelectedItem((prev) => (prev?.id === id ? { ...prev, ...updates } : prev));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen">
        <div className="sticky top-0 z-10 bg-[#f8f7f5]/95 backdrop-blur-sm pt-12 pb-4 px-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mein Kleiderschrank</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {session?.user?.name} · {items.length} Kleidungsstücke
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors text-gray-400"
                title="Abmelden"
              >
                <LogOut size={16} />
              </button>
              <Link
                href="/upload"
                className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} className="text-white" />
              </Link>
            </div>
          </div>

          {/* Category filter — droppable when dragging */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
            >
              Alle
            </button>
            {(ALL_CATEGORIES.filter((c) => c !== 'all') as ClothingCategory[]).map((cat) => (
              <DroppableCategoryChip
                key={cat}
                cat={cat}
                isActive={filter === cat}
                onClick={() => handleCategoryChange(cat)}
              >
                {`${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
              </DroppableCategoryChip>
            ))}
          </div>

          {filter !== 'all' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-2 pb-1">
              <button
                onClick={() => setSubcategoryFilter(null)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  subcategoryFilter === null ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                Alle
              </button>
              {SUBCATEGORIES[filter].map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubcategoryFilter(sub === subcategoryFilter ? null : sub)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    subcategoryFilter === sub ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 pt-2">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                <ShirtIcon size={36} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-1">
                {filter === 'all' ? 'Dein Kleiderschrank ist leer' : 'Keine Kleidungsstücke hier'}
              </p>
              <p className="text-gray-400 text-sm mb-6">Füge dein erstes Kleidungsstück hinzu</p>
              <Link
                href="/upload"
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-medium text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Kleidungsstück hinzufügen
              </Link>
            </div>
          ) : (
            <SortableContext items={filtered.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filtered.map((item) => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    onOpen={setSelectedItem}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </div>

      {/* Drag overlay: mini thumbnail follows cursor */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl rotate-3 opacity-90">
            <img src={activeItem.thumbnail} alt={activeItem.name} className="w-full h-full object-cover" />
          </div>
        ) : null}
      </DragOverlay>

      {/* Detail modal */}
      {selectedItem && (
        <ClothingDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdate}
        />
      )}
    </DndContext>
  );
}
