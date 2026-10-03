# Cross-check: `grok_numero.docx` vs worker code (2026-10-03)

The file is a Grok chat transcript about a personalised Panchang/Muhurta app (4,589 lines).
Despite the filename it contains **no numerology** content. It is secondary, unsourced material:
treat every table in it as a claim to verify, not as a source.

## Code fixed in `worker/src/lib/muhurta.ts`
| Item | Before | After | Evidence |
|---|---|---|---|
| Vishti (Bhadra) Karana | Treated Kimstughna as the LAST karana; Vishti flagged at karana positions 7,14,..56 (one half-tithi early, wrong tithis) | Kimstughna first; Vishti = 2nd half Shukla Chaturthi/Ekadashi, 1st half Shukla Ashtami/Purnima, 2nd half Krishna Tritiya/Dashami, 1st half Krishna Saptami/Chaturdashi | Standard Bhadra table; test enumerates all 60 half-tithis |
| Yamaganda | Sun 5, Mon 3, Tue 8, Wed 6, Thu 7, Fri 1, Sat 2 (1-indexed parts) | Sun 5, Mon 4, Tue 3, Wed 2, Thu 1, Fri 7, Sat 6 | Grok doc, the earlier artifact and the classical published table agree; only the old code differed |

## Added (previously missing)
- `getKarana()` (full 60-karana cycle incl. fixed karanas)
- `getYoga()` (27 yogas, 9 inauspicious, Vyatipata/Vaidhriti flagged as mahadosha; **sidereal** sum)
- `getChoghadiya()` day + night, derived from the Chaldean order

## Doc errors we did NOT copy
- KP `get_sub_lord` always starts the sub-division at Ketu; correct KP starts at the nakshatra's own lord (repo `kp.ts` is right).
- Python `calculate_hora` indexes the Chaldean list by weekday number (Monday would start with Venus, not Moon); the doc's own table is right, the code is wrong. Repo uses an explicit weekday table.
- Night Choghadiya table: sequences are valid but assigned to the wrong weekdays (only Sunday is right; Friday duplicates Sunday, Saturday duplicates Tuesday).
- "Avoid 4th/8th/12th from Janma Nakshatra" for travel: 4th from the birth star is Kshema Tara (favourable). 4/8/12 is a Chandrabala (rashi) rule.
- Tithi groups text lists Ashtami as Rikta; Ashtami is Jaya. Rikta = 4, 9, 14.
- Nakshatra groups: Pushya is Kshipra (swift), not "soft"; Mula is Tikshna (sharp), not "fierce".
- Event-Lagna "Shuddhi" code uses the middle of the sign as the Lagna longitude, so a planet in the rising sign before 15° lands in the 12th house.
- Vara code uses the UT instant, not local sunrise, despite stating sunrise-based Vara.
- Panchang JSON example labels 2026-10-03 as Friday; it is a Saturday.
- Three different scoring weight sets in one document (40/25/20/15, 20/15/15/25/25, 30/30/40).

## Open conflicts (need a decision / primary source; NOT changed)
1. **Chandrabala**: repo (`docs/ARCHITECTURE.md`) favourable = 1,2,3,5,7,9,10,11, absent = 4,6,8,12. Grok doc: only 4,8,12 bad. Common gochara teaching: 1,3,6,7,10,11 good, 2,5,9 conditional. Three answers; Naveen's ARCHITECTURE.md currently governs.
2. **Tara Janma (1)**: repo = neutral (Karma Vipak Samhita); Grok doc = unfavourable.
3. **Uphora**: repo = 7 sub-periods per hora in Chaldean order; Grok doc = 4 (or 5) equal parts.
4. **Sarvartha Siddhi table**: the artifact, the Grok doc and common published tables all differ. Needs a primary source. Not implemented in the worker (scoring still says "pending").
5. **Vijaya Muhurta (11th) vs classical 15-muhurta list**: the 11th daytime muhurta is named Vahini (inauspicious) in the classical list; "Vijaya" is a separate Panchang convention. Confirm before it feeds scoring.
6. **Scoring weights**: repo = 40% universal / 60% personal; Grok doc proposes 20/15/15/25/25. Product decision.
7. `HORA_LORDS_BY_WEEKDAY` is keyed by `date.getUTCDay()`: between local midnight/sunrise and 05:30 IST the UTC date and the sunrise-based Vara can disagree. Needs a caller-level audit.

## Verification status
New tests check the code against published tables written independently of the implementation, but
no table was checked against Drik Panchang for real dates in this environment. Do that for one
Thursday (Yamaganda 06:00-07:30 local-day start), one Bhadra date and one night Choghadiya before release.
