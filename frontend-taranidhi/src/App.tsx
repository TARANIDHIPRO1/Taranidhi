import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import PanchagInfo from './components/PanchagInfo';
import PanchagViewer from './components/PanchagViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedElement, setSelectedElement] = useState<{type: string; data: any} | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'today' && (
        <>
          <PanchagInfo />
          <PanchagViewer selectedElement={selectedElement} setSelectedElement={setSelectedElement} />
        </>
      )}

      {selectedElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <DetailPopup element={selectedElement} onClose={() => setSelectedElement(null)} />
        </div>
      )}
    </div>
  );
}

function DetailPopup({ element, onClose }: any) {
  return (
    <div className="bg-emerald-500 rounded-lg p-6 max-w-md w-full text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{element.data.name}</h2>
        <button onClick={onClose} className="text-2xl font-bold">×</button>
      </div>
      <div className="space-y-2 text-sm">
        {element.data.details && element.data.details.map((detail: any, i: number) => (
          <div key={i}>
            <span className="text-gold">{detail.label}:</span> {detail.value}
          </div>
        ))}
      </div>
      {element.data.description && (
        <p className="mt-4 text-sm italic border-t border-white pt-4">
          {element.data.description}
        </p>
      )}
    </div>
  );
}
