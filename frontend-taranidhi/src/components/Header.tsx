import React from 'react';

export default function Header() {
  return (
    <header className="bg-royal-indigo text-white p-4 flex items-center justify-between sticky top-0 z-40">
      <button className="text-2xl">☰</button>
      <h1 className="text-xl font-bold">TaraNidhi</h1>
      <div className="flex gap-4">
        <button>🔍</button>
        <button>⌃</button>
        <button>⋮</button>
      </div>
    </header>
  );
}
