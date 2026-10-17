import React from 'react';

export default function PanchagInfo() {
  return (
    <div className="info-card">
      <div className="moon-image"></div>
      <div className="info-text">
        <h2 className="text-gold">07, Ashwina Shukla, Saptami</h2>
        <p>2083 Vikrama Samvata</p>
        <p>Bhopal, India</p>
        <p className="text-xs mt-2">Ravi Yoga, Aadal Yoga, Vidaal Yoga, 3rd Chaturmasa</p>
        <div className="mt-4 text-right">
          <div className="date-large">17</div>
          <p>October 2026</p>
          <p className="text-sm">Saturday</p>
        </div>
      </div>
    </div>
  );
}
