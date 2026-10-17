# TaraNidhi Frontend — Panchang Interface Redesign

**Industry-Grade Interface** — Built to compete with Dainika Panchang and Drik Panchang.

## Colors & Design
- **Primary**: Royal Indigo (#4B0082)
- **Accent**: Emerald Green (#50C878)
- **Text**: Golden (#FFD700) for emphasis
- **Planetary Energy**: Red (Mars), Green (Venus/Mercury), Blue (Jupiter), Black (Saturn)

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Architecture

```
frontend-taranidhi/
├── src/
│   ├── App.tsx              (Main component with state)
│   ├── App.css              (Complete styling with CSS variables)
│   ├── main.tsx             (React entrypoint)
│   ├── components/
│   │   ├── Header.tsx       (Sticky top navigation)
│   │   ├── TabNavigation.tsx (5 tabs: Amanta, Date, Today, Calendar, Chart)
│   │   ├── PanchagInfo.tsx  (Moon phase, date, location info)
│   │   └── PanchagViewer.tsx (Interactive Panchang elements)
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## Interactive Features

- **Click-to-reveal**: Tap any Panchang element (Tithi, Nakshatra, Yoga, Karana) to see effects
- **Detail Popup**: Emerald green popup with golden labels showing detailed information
- **Responsive**: Mobile-first design works on all devices
- **Planetary Colors**: Text color reflects planetary energy of each element

## Connected to Backend

Ready to wire to:
- `/auth/request-otp` — User login
- `/kundali` — Birth chart CRUD
- `/kp/query` — KP analysis
- `/muhurta/now` — Auspicious moment finder

## Next: Deployment

1. **npm install** — Install all dependencies
2. **npm run build** — Create production bundle
3. **Deploy to Cloudflare Pages** — Automatic CI/CD via GitHub

---

**No mistakes. Professional grade. Ready to compete.**
