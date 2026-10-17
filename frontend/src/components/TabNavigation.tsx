import React from 'react';

const tabs = [
  { id: 'amanta', label: '🌙 Amanta' },
  { id: 'date', label: '📅 Date' },
  { id: 'today', label: '📋 Today' },
  { id: 'calendar', label: '📆 Calendar' },
  { id: 'chart', label: '📊 Chart' },
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
