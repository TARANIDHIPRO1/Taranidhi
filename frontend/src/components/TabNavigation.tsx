import React from 'react';

const tabs = [
  { id: 'panchang', label: '📋 Panchang' },
  { id: 'hora', label: '🕐 Hora & Lagna' },
  { id: 'kundali', label: '📊 Kundali' },
  { id: 'query', label: '❓ Query' },
  { id: 'muhurta', label: '✨ Pro Muhurta' },
];

export default function TabNavigation({ activeTab, setActiveTab }: any) {
  return (
    <div className="tab-nav bg-cream">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
