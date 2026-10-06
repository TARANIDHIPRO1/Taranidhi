/**
 * Numerology Report
 * Displays 360° numerology analysis (birth + name numbers, compatibility, timing)
 * i18n: en-numerology + en-common
 * Theme: Jal (Cyan #0EA5E9) for numerology
 * Tier: Basic (core numbers) → Premium (detailed + wallpapers) → Ultra (remedies)
 */

import { translate } from '../i18n/i18next';
import { getThemeColor, applyResponsive } from '../theme/design-system';

interface NumerologyReport {
  userId: string;
  reportId: string;
  birthDate: string; // YYYY-MM-DD
  fullName: string;
  numbers: {
    birthNumber: number; // 1-9 (day of birth)
    destinyNumber: number; // sum of birth date
    nameNumber: number; // sum of name (Chaldean/Pythagorean)
    lifePathNumber: number; // full birth date sum
    personalYear: number; // for current year
  };
  compatibility: {
    romantic: number; // 0-100
    business: number;
    friendship: number;
  };
  strengths: string[];
  challenges: string[];
  remedies?: string[]; // Ultra tier
  wallpapers?: {
    lockScreen: string; // data URL
    homeScreen: string;
    wallpaper: string;
  };
}

export function renderNumerologyReport(data: NumerologyReport, tier: 'basic' | 'premium' | 'ultra') {
  const jalColor = getThemeColor('jal'); // Cyan

  return {
    title: translate('numerology:your_report'),
    subtitle: `${data.fullName} • ${data.birthDate}`,
    sections: [
      // Core numbers card
      {
        type: 'grid',
        title: translate('numerology:core_numbers'),
        items: [
          {
            label: translate('numerology:birth_number'),
            value: data.numbers.birthNumber,
            style: { borderTop: `4px solid ${jalColor}` }
          },
          {
            label: translate('numerology:destiny_number'),
            value: data.numbers.destinyNumber,
            style: { borderTop: `4px solid ${jalColor}` }
          },
          {
            label: translate('numerology:name_number'),
            value: data.numbers.nameNumber,
            style: { borderTop: `4px solid ${jalColor}` }
          },
          {
            label: translate('numerology:life_path'),
            value: data.numbers.lifePathNumber,
            style: { borderTop: `4px solid ${jalColor}` }
          }
        ]
      },

      // Personality & strengths
      {
        type: 'section',
        title: translate('numerology:your_strengths'),
        content: `
          <ul style="list-style: none; padding: 0;">
            ${data.strengths.map(s => `
              <li style="padding: 8px; margin: 4px 0; background: #F0F9FF; border-left: 3px solid ${jalColor};">
                ✓ ${s}
              </li>
            `).join('')}
          </ul>
        `
      },

      // Challenges
      {
        type: 'section',
        title: translate('numerology:challenges'),
        content: `
          <ul style="list-style: none; padding: 0;">
            ${data.challenges.map(c => `
              <li style="padding: 8px; margin: 4px 0; background: #FEF3C7; border-left: 3px solid #F59E0B;">
                ⚠ ${c}
              </li>
            `).join('')}
          </ul>
        `
      },

      // Compatibility (if applicable)
      {
        type: 'section',
        title: translate('numerology:compatibility'),
        content: `
          <div style="${applyResponsive({ display: 'flex', gap: '12px', justifyContent: 'space-around' })}">
            ${[
              { label: translate('numerology:romantic'), score: data.compatibility.romantic },
              { label: translate('numerology:business'), score: data.compatibility.business },
              { label: translate('numerology:friendship'), score: data.compatibility.friendship }
            ].map(c => `
              <div style="text-align: center;">
                <strong>${c.score}%</strong><br/>
                <small>${c.label}</small><br/>
                <div style="width: 60px; height: 6px; background: #e0e0e0; border-radius: 3px; margin-top: 4px;">
                  <div style="width: ${c.score}%; height: 100%; background: ${jalColor}; border-radius: 3px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        `
      },

      // Remedies (Ultra only)
      ...(tier === 'ultra' && data.remedies ? [{
        type: 'section',
        title: translate('numerology:remedies'),
        content: `
          <div style="background: #ECFDF5; padding: 12px; border-radius: 4px;">
            ${data.remedies.map(r => `<p>🕉️ ${r}</p>`).join('')}
          </div>
        `
      }] : []),

      // Wallpapers (Premium+)
      ...(tier === 'premium' && data.wallpapers ? [{
        type: 'section',
        title: translate('numerology:wallpapers'),
        content: `
          <div style="${applyResponsive({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' })}">
            <div>
              <img src="${data.wallpapers.lockScreen}" style="width: 100%; border-radius: 4px;" />
              <p style="text-align: center; font-size: 12px;">${translate('numerology:lock_screen')}</p>
            </div>
            <div>
              <img src="${data.wallpapers.homeScreen}" style="width: 100%; border-radius: 4px;" />
              <p style="text-align: center; font-size: 12px;">${translate('numerology:home_screen')}</p>
            </div>
          </div>
        `
      }] : []),

      // Action buttons
      {
        type: 'actions',
        buttons: [
          {
            label: tier === 'premium' ? translate('common:download_wallpapers') : translate('common:upgrade'),
            action: tier === 'premium' ? 'download' : 'upgrade',
            style: { background: jalColor }
          },
          {
            label: translate('common:share'),
            action: 'share_report'
          }
        ]
      }
    ],
    theme: { accentColor: jalColor }
  };
}
