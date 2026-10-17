import React from 'react';

const panchagData = [
  {
    label: 'Tithi',
    value: 'Saptami',
    symbol: '🌙',
    details: [
      { label: 'Name', value: 'Saptami (7th Tithi)' },
      { label: 'Paksha', value: 'Shukla (Waxing)' },
      { label: 'Duration', value: 'Until Full Night' },
      { label: 'Lord', value: 'Moon' },
      { label: 'Guna', value: 'Sattvic' },
    ],
    description: 'Saptami is auspicious for travel, business ventures, and spiritual practices. Good for initiating new projects.',
  },
  {
    label: 'Nakshatra',
    value: 'Mula',
    symbol: '⭐',
    details: [
      { label: 'Name', value: 'Mula (19th Nakshatra)' },
      { label: 'Duration', value: 'Until 09:47 AM' },
      { label: 'Ruler', value: 'Ketu' },
      { label: 'Symbol', value: 'Root' },
      { label: 'Deity', value: 'Nirriti' },
    ],
    description: 'Mula is considered normal for most auspicious activities. Good for spiritual pursuits and introspection.',
  },
  {
    label: 'Yoga',
    value: 'Ravi Yoga',
    symbol: '☀️',
    details: [
      { label: 'Name', value: 'Ravi Yoga (Sun Yoga)' },
      { label: 'Duration', value: 'Based on Lunar Position' },
      { label: 'Result', value: 'Auspicious' },
      { label: 'Best For', value: 'Leadership, New Ventures' },
    ],
    description: 'Ravi Yoga brings success in endeavors requiring strength and leadership.',
  },
  {
    label: 'Karana',
    value: 'Sakuni',
    symbol: '🪶',
    details: [
      { label: 'Name', value: 'Sakuni Karana' },
      { label: 'Type', value: 'Variable Karana' },
      { label: 'Nature', value: 'Difficult' },
      { label: 'Avoid', value: 'Auspicious Activities' },
    ],
    description: 'Sakuni Karana is generally inauspicious. Avoid starting important work during this time.',
  },
];

export default function PanchagViewer({ selectedElement, setSelectedElement }: any) {
  return (
    <div className="panchang-section">
      <h2 className="text-xl font-bold p-4 bg-cream border-b-2 border-royal-indigo text-dark-brown">Panchang</h2>

      {panchagData.map((item, idx) => (
        <div
          key={idx}
          className="panchang-row"
          onClick={() => setSelectedElement({ type: item.label, data: item })}
        >
          <div className="panchang-label">{item.label}</div>
          <div className="panchang-value">
            <span className="symbol">{item.symbol}</span>
            <span className="font-semibold">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
