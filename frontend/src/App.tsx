import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import PanchagInfo from './components/PanchagInfo';
import PanchagViewer from './components/PanchagViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState('panchang');
  const [selectedElement, setSelectedElement] = useState<{type: string; data: any} | null>(null);

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* PANCHANG TAB */}
      {activeTab === 'panchang' && (
        <>
          <PanchagInfo />
          <PanchagViewer selectedElement={selectedElement} setSelectedElement={setSelectedElement} />
        </>
      )}

      {/* HORA & LAGNA TAB */}
      {activeTab === 'hora' && (
        <div className="content-section">
          <div className="card">
            <h2>Hora & Lagna</h2>
            <p>Lagna (Ascendant): Libra (Tula)</p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="label">Lagna Lord:</span>
                <span className="value">Venus</span>
              </div>
              <div className="feature-item">
                <span className="label">Hora Strength:</span>
                <span className="value">Strong</span>
              </div>
              <div className="feature-item">
                <span className="label">Current Hora:</span>
                <span className="value">Sun's Hora (Power & Authority)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KUNDALI TAB */}
      {activeTab === 'kundali' && (
        <div className="content-section">
          <div className="card">
            <h2>Kundali (Birth Chart)</h2>
            <div className="chart-section">
              <p className="feature-info">Enter your birth details to generate your complete Kundli:</p>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input type="date" placeholder="DD/MM/YYYY" />
              </div>
              <div className="form-group">
                <label>Time of Birth:</label>
                <input type="time" />
              </div>
              <div className="form-group">
                <label>Place of Birth:</label>
                <input type="text" placeholder="City/Location" />
              </div>
              <button className="btn-primary">Generate Kundli</button>
            </div>
          </div>
        </div>
      )}

      {/* QUERY TAB */}
      {activeTab === 'query' && (
        <div className="content-section">
          <div className="card">
            <h2>Astrological Query</h2>
            <div className="query-section">
              <div className="form-group">
                <label>Your Question:</label>
                <textarea placeholder="Ask any astrological question..."></textarea>
              </div>
              <div className="form-group">
                <label>Question Type:</label>
                <select>
                  <option>Relationship</option>
                  <option>Career</option>
                  <option>Finance</option>
                  <option>Health</option>
                  <option>Education</option>
                  <option>Business</option>
                </select>
              </div>
              <button className="btn-primary">Get Analysis</button>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSIONAL MUHURTA TAB */}
      {activeTab === 'muhurta' && (
        <div className="content-section">
          <div className="card">
            <h2>Professional Muhurta (व्यावसायिक)</h2>
            <p className="section-subtitle">Select a category to find auspicious timing:</p>
            <div className="muhurta-categories">
              <div className="category-item" data-category="business">
                <div className="category-icon">💼</div>
                <div className="category-name">Business Launch</div>
              </div>
              <div className="category-item" data-category="property">
                <div className="category-icon">🏠</div>
                <div className="category-name">Property Purchase</div>
              </div>
              <div className="category-item" data-category="marriage">
                <div className="category-icon">💍</div>
                <div className="category-name">Wedding Date</div>
              </div>
              <div className="category-item" data-category="vehicle">
                <div className="category-icon">🚗</div>
                <div className="category-name">Vehicle Purchase</div>
              </div>
              <div className="category-item" data-category="medical">
                <div className="category-icon">⚕️</div>
                <div className="category-name">Medical Procedure</div>
              </div>
              <div className="category-item" data-category="education">
                <div className="category-icon">📚</div>
                <div className="category-name">Education Start</div>
              </div>
            </div>
            <div className="muhurta-results">
              <p className="results-info">Select a category to see auspicious dates and times</p>
            </div>
          </div>
        </div>
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
