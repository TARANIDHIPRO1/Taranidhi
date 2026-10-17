import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('kundali');
  const [jatakName, setJatakName] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLon, setGpsLon] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedPanchang, setSelectedPanchang] = useState<string | null>(null);

  const panchaElements = [
    { name: 'Tithi', symbol: '🌙', effect: 'Moon phase energy' },
    { name: 'Nakshatra', symbol: '⭐', effect: 'Star constellation influence' },
    { name: 'Yoga', symbol: '☀️', effect: 'Sun-Moon combination energy' },
    { name: 'Karana', symbol: '🔄', effect: 'Half-day planetary effect' },
    { name: 'Vara', symbol: '📅', effect: 'Weekday planetary ruler' },
  ];

  const muhurtaCategories = [
    { icon: '💼', name: 'Business', color: '#FF8C00' },
    { icon: '🏠', name: 'Property', color: '#10B981' },
    { icon: '💍', name: 'Marriage', color: '#EC4899' },
    { icon: '🚗', name: 'Vehicle', color: '#8B5CF6' },
    { icon: '⚕️', name: 'Medical', color: '#EF4444' },
    { icon: '📚', name: 'Education', color: '#3B82F6' },
  ];

  const handleSubmitKundali = () => {
    const formData = {
      name: jatakName,
      dob,
      tob,
      city,
      state,
      country,
      gpsLat,
      gpsLon,
      mobile,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving Kundali:', formData);
    alert(`Kundali registered for ${jatakName} - ${dob} ${tob}`);
  };

  return (
    <div className="app-container">
      {/* Cosmic Background */}
      <div className="cosmic-bg">
        <div className="stars"></div>
        <div className="planets"></div>
        <div className="glow-center"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>✨ TaraNidhi ✨</h1>
          <p>Advanced Vedic Astrology & Numerology</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tabs-nav">
        {['kundali', 'panchang', 'hora', 'query', 'muhurta'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'kundali' && '📊 Kundali'}
            {tab === 'panchang' && '📋 Panchang'}
            {tab === 'hora' && '🕐 Hora & Lagna'}
            {tab === 'query' && '❓ Query'}
            {tab === 'muhurta' && '✨ Muhurta'}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* KUNDALI TAB - Registration Form */}
        {activeTab === 'kundali' && (
          <section className="tab-section kundali-section">
            <h2>📊 Jatak Kundali (Birth Chart Registration)</h2>
            <div className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label>Jatak Ka Nam (Name) *</label>
                  <input
                    type="text"
                    value={jatakName}
                    onChange={(e) => setJatakName(e.target.value)}
                    placeholder="Enter person's name"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth (DD/MM/YYYY) *</label>
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Time of Birth (HH:MM:SS) *</label>
                  <input
                    type="text"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    placeholder="HH:MM:SS"
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Birth city"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State/Province"
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GPS Latitude *</label>
                  <input
                    type="text"
                    value={gpsLat}
                    onChange={(e) => setGpsLat(e.target.value)}
                    placeholder="Latitude"
                  />
                </div>
                <div className="form-group">
                  <label>GPS Longitude *</label>
                  <input
                    type="text"
                    value={gpsLon}
                    onChange={(e) => setGpsLon(e.target.value)}
                    placeholder="Longitude"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Mobile Number (Registration) *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <button className="submit-btn" onClick={handleSubmitKundali}>
                🔮 Generate Kundali Chart
              </button>
            </div>
          </section>
        )}

        {/* PANCHANG TAB */}
        {activeTab === 'panchang' && (
          <section className="tab-section panchang-section">
            <h2>📋 Panchang (5-Fold Timing System)</h2>
            <p className="subtitle">Click any element to see its meaning and effect</p>
            <div className="panchang-grid">
              {panchaElements.map((elem) => (
                <div
                  key={elem.name}
                  className={`panchang-card ${selectedPanchang === elem.name ? 'active' : ''}`}
                  onClick={() => setSelectedPanchang(selectedPanchang === elem.name ? null : elem.name)}
                >
                  <div className="card-symbol">{elem.symbol}</div>
                  <div className="card-name">{elem.name}</div>
                  {selectedPanchang === elem.name && (
                    <div className="card-effect">{elem.effect}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HORA & LAGNA TAB */}
        {activeTab === 'hora' && (
          <section className="tab-section hora-section">
            <h2>🕐 Hora & Lagna (Hour & Ascendant)</h2>
            <div className="info-cards">
              <div className="info-card">
                <h3>🌅 Lagna (Ascendant)</h3>
                <p>Your rising sign at birth - determines personality and life path</p>
                <div className="stat">Libra ♎</div>
              </div>
              <div className="info-card">
                <h3>⏰ Current Hora</h3>
                <p>Current planetary hour and its ruling planet</p>
                <div className="stat">Sun's Hora (Power)</div>
              </div>
              <div className="info-card">
                <h3>💪 Hora Strength</h3>
                <p>Overall strength of current planetary influence</p>
                <div className="stat">Strong ✓</div>
              </div>
            </div>
          </section>
        )}

        {/* QUERY TAB */}
        {activeTab === 'query' && (
          <section className="tab-section query-section">
            <h2>❓ Ask an Astrological Question</h2>
            <div className="query-form">
              <textarea placeholder="Ask any astrological question..."></textarea>
              <select>
                <option>Career</option>
                <option>Relationship</option>
                <option>Health</option>
                <option>Finance</option>
                <option>Education</option>
              </select>
              <button className="submit-btn">🔮 Get Analysis</button>
            </div>
          </section>
        )}

        {/* MUHURTA TAB */}
        {activeTab === 'muhurta' && (
          <section className="tab-section muhurta-section">
            <h2>✨ Professional Muhurta (Auspicious Timing)</h2>
            <p className="subtitle">Select category to find auspicious dates and times</p>
            <div className="muhurta-grid">
              {muhurtaCategories.map((cat) => (
                <div key={cat.name} className="muhurta-card" style={{ borderColor: cat.color }}>
                  <div className="muhurta-icon">{cat.icon}</div>
                  <div className="muhurta-name">{cat.name}</div>
                  <div className="muhurta-hint">Click to find dates</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 OCCULTVIISION™ | Advanced Vedic Astrology</p>
      </footer>
    </div>
  );
}
