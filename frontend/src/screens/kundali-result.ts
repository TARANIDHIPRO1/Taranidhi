/**
 * Kundali Result Screen
 * Displays birth chart analysis, planetary positions, houses, yogas
 * i18n: en-kundali + en-common
 * Theme: Akash (Purple #8B5CF6) for birth charts
 * Tier: Basic (free) with premium details gated
 */

import { createPage } from '../framework/page';
import { translate, getLanguage } from '../i18n/i18next';
import { getThemeColor, applyResponsive } from '../theme/design-system';

interface KundaliResult {
  userId: string;
  chartId: string;
  birthDate: string; // ISO 8601
  birthTime: string; // HH:MM IST
  birthPlace: string;
  lagna: {
    sign: string;
    degree: number;
    nakshatra: string;
    pada: number;
    lord: string; // planet name
  };
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    nakshatra: string;
    house: number;
    retro: boolean;
    speed: string; // slow/normal/fast
  }>;
  yogas: {
    beneficial: string[];
    doshas: string[]; // Ganda Moola, Panchaka, etc.
  };
  dasha: {
    current: string; // e.g., "Venus Mahadasha"
    antardasha: string;
    years_remaining: number;
  };
  summary: string; // 2-3 line interpretation
}

export function renderKundaliResult(data: KundaliResult, tier: 'basic' | 'premium' | 'ultra') {
  const lang = getLanguage();
  const akashColor = getThemeColor('akash'); // Purple
  
  return createPage({
    title: translate('kundali:title'),
    sections: [
      // Header with birth details
      {
        type: 'header',
        title: translate('kundali:birth_chart'),
        subtitle: `${data.birthDate} ${data.birthTime} ${data.birthPlace}`,
        style: {
          borderBottom: `4px solid ${akashColor}`,
          padding: '16px',
          marginBottom: '16px'
        }
      },

      // Lagna card
      {
        type: 'card',
        title: translate('kundali:lagna'),
        content: `
          <div class="lagna-box" style="${applyResponsive({
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            padding: '12px'
          })}">
            <div>
              <strong>${translate('kundali:sign')}:</strong> ${data.lagna.sign}<br/>
              <strong>${translate('kundali:degree')}:</strong> ${data.lagna.degree.toFixed(2)}°<br/>
              <strong>${translate('kundali:nakshatra')}:</strong> ${data.lagna.nakshatra} (Pada ${data.lagna.pada})<br/>
              <strong>${translate('kundali:lord')}:</strong> ${data.lagna.lord}
            </div>
          </div>
        `,
        style: { borderLeft: `4px solid ${akashColor}` }
      },

      // Planets table
      {
        type: 'section',
        title: translate('kundali:planets'),
        content: renderPlanetsTable(data.planets, lang)
      },

      // Yogas (doshas only in basic)
      {
        type: 'section',
        title: translate('kundali:doshas'),
        content: data.yogas.doshas.length > 0
          ? `<ul>${data.yogas.doshas.map(d => `<li>${d}</li>`).join('')}</ul>`
          : `<p style="color: #10B981;">${translate('kundali:no_doshas')}</p>`
      },

      // Yogas (beneficial - premium only)
      ...(tier !== 'basic' ? [{
        type: 'section',
        title: translate('kundali:beneficial_yogas'),
        content: data.yogas.beneficial.length > 0
          ? `<ul>${data.yogas.beneficial.map(y => `<li>${y}</li>`).join('')}</ul>`
          : `<p>${translate('kundali:no_yogas')}</p>`
      }] : []),

      // Dasha (ultra only - deep predictive)
      ...(tier === 'ultra' ? [{
        type: 'section',
        title: translate('kundali:dasha'),
        content: `
          <strong>${data.dasha.current}</strong><br/>
          ${translate('kundali:antardasha')}: ${data.dasha.antardasha}<br/>
          ${translate('kundali:remaining')}: ${data.dasha.years_remaining} years
        `
      }] : []),

      // Summary interpretation
      {
        type: 'card',
        title: translate('kundali:summary'),
        content: data.summary,
        style: { background: '#F0F9FF', padding: '12px' }
      },

      // Action buttons
      {
        type: 'actions',
        buttons: [
          {
            label: translate('common:share'),
            action: 'share_chart',
            style: { background: akashColor }
          },
          {
            label: translate('common:download_pdf'),
            action: 'export_pdf',
            tier: 'premium'
          },
          {
            label: translate('kundali:schedule_muhurta'),
            action: 'goto_muhurta',
            href: '/muhurta?for_event=marriage'
          }
        ]
      }
    ],
    theme: { accentColor: akashColor }
  });
}

function renderPlanetsTable(planets: any[], lang: string): string {
  const headers = [
    translate('kundali:planet'),
    translate('kundali:sign'),
    translate('kundali:nakshatra'),
    translate('kundali:house'),
    translate('kundali:speed')
  ];

  const rows = planets.map(p => [
    p.name + (p.retro ? ' ℞' : ''),
    p.sign,
    p.nakshatra,
    p.house,
    p.speed
  ]);

  return `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #F3E8FF; border-bottom: 2px solid #8B5CF6;">
          ${headers.map(h => `<th style="padding: 8px; text-align: left;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr style="border-bottom: 1px solid #E0E7FF;">
            ${r.map(c => `<td style="padding: 8px;">${c}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
