"use client";

import Link from 'next/link';
import { MapPinned } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MapPinned className="h-8 w-8" />
            <h1 className="text-2xl font-bold">WanderList</h1>
          </Link>
          {/* Navigation items can be added here if needed */}
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} WanderList. Plan your adventures.</p>
         <p className="text-xs mt-1">Note: All data is stored locally in your browser.</p>
      </footer>
    </div>
  );
}
