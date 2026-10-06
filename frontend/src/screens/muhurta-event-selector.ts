/**
 * Muhurta Event Selector
 * User selects event type (Marriage, Property, Surgery, etc.)
 * Then gets date range scanner + top 5 auspicious dates
 * i18n: en-muhurta + en-common
 * Theme: Agni (Orange #F97316) for timing/muhurta
 * Tier: Basic (free event scanner) → Premium (detailed analysis)
 */

import { translate, getLanguage } from '../i18n/i18next';
import { getThemeColor, applyResponsive } from '../theme/design-system';

interface EventType {
  id: 'marriage' | 'property' | 'surgery' | 'business' | 'education' | 'travel';
  label: string;
  description: string;
  priority: number; // P0, P1, P2, P3
}

const EVENT_TYPES: EventType[] = [
  { id: 'marriage', label: translate('muhurta:event_marriage'), description: 'Wedding ceremony', priority: 1 },
  { id: 'property', label: translate('muhurta:event_property'), description: 'Property purchase/entry', priority: 0 },
  { id: 'business', label: translate('muhurta:event_business'), description: 'Business launch', priority: 2 },
  { id: 'surgery', label: translate('muhurta:event_surgery'), description: 'Medical procedure', priority: 3 },
  { id: 'education', label: translate('muhurta:event_education'), description: 'Starting education', priority: 2 },
  { id: 'travel', label: translate('muhurta:event_travel'), description: 'Journey/relocation', priority: 2 }
];

export function renderMuhurtaEventSelector() {
  const agniColor = getThemeColor('agni'); // Orange
  const lang = getLanguage();

  return {
    title: translate('muhurta:select_event'),
    subtitle: translate('muhurta:event_description'),
    sections: [
      // Hero section
      {
        type: 'card',
        style: {
          background: `linear-gradient(135deg, ${agniColor}20, ${agniColor}10)`,
          borderLeft: `4px solid ${agniColor}`,
          padding: '20px',
          marginBottom: '20px'
        },
        content: `
          <h2 style="color: ${agniColor}; margin: 0 0 8px 0;">
            ${translate('muhurta:find_auspicious')}
          </h2>
          <p style="margin: 0; color: #555;">
            ${translate('muhurta:select_best')}
          </p>
        `
      },

      // Event type grid
      {
        type: 'section',
        title: translate('muhurta:which_event'),
        content: `
          <div style="${applyResponsive({
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px'
          })}">
            ${EVENT_TYPES.map(event => `
              <button class="event-btn" data-event="${event.id}" style="${getEventButtonStyle(event, agniColor)}">
                <strong>${event.label}</strong><br/>
                <small style="color: #666;">${event.description}</small>
              </button>
            `).join('')}
          </div>
        `,
        scripts: [
          `
          document.querySelectorAll('.event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              document.querySelectorAll('.event-btn').forEach(b => b.style.borderColor = '#ddd');
              e.target.closest('.event-btn').style.borderColor = '${agniColor}';
              
              // Navigate to scanner with event type
              const eventId = e.target.closest('.event-btn').dataset.event;
              window.location.href = \`/muhurta/scanner?event=\${eventId}\`;
            });
          });
          `
        ]
      },

      // Birth chart requirement
      {
        type: 'info',
        icon: 'info',
        title: translate('muhurta:need_birth_chart'),
        content: `
          ${translate('muhurta:chart_helps')}
          <a href="/kundali">${translate('muhurta:provide_birth_details')}</a>
        `,
        style: { background: '#FFFBEB', borderLeft: `4px solid #F59E0B` }
      },

      // Premium features teaser
      {
        type: 'section',
        title: translate('muhurta:premium_features'),
        content: `
          <ul style="color: #555;">
            <li>${translate('muhurta:premium_detailed')}</li>
            <li>${translate('muhurta:premium_remedies')}</li>
            <li>${translate('muhurta:premium_comparisons')}</li>
          </ul>
          <button style="background: ${agniColor}; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            ${translate('common:upgrade_premium')}
          </button>
        `
      }
    ]
  };
}

function getEventButtonStyle(event: EventType, agniColor: string): string {
  return `
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    &:hover {
      border-color: ${agniColor};
      box-shadow: 0 2px 8px ${agniColor}30;
    }
  `;
}
