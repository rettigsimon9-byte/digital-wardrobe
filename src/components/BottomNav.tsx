'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShirtIcon, PlusCircle, Sparkles, Heart } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Schrank', icon: ShirtIcon },
  { href: '/upload', label: 'Hinzufügen', icon: PlusCircle },
  { href: '/generate', label: 'Outfit', icon: Sparkles },
  { href: '/outfits', label: 'Gespeichert', icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-lg mx-auto md:max-w-4xl flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-indigo-600' : 'text-gray-400'}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-indigo-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-indigo-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
