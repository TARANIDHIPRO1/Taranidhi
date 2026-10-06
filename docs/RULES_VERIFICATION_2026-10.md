# Muhurta Rules Verification — 2026-10-07

Source: deep-research pass against classical texts (Muhurta Chintamani via Sharma's English
translation + Sanskrit quotations, Brihat Samhita ch. 98-99 via Iyer, Narada Purana, Sanskrit
Wikipedia, scholarly blogs). **Verse numbers marked "secondary" have NOT been checked against
the Sanskrit edition. Sign-off needed from Naveen against his own books.**
Not reached in primary form: Muhurta Martanda/Deepika/Darpana, Narada Samhita, Vasishtha Samhita,
Jyotirnibandha, Kalaprakashika, Karma Vipak Samhita. "Not found" there means "not checked".

| Rule | Verified rule | Status | Code |
|---|---|---|---|
| Chandrabala | Always good 1,3,6,7,10,11; 2,5,9 good ONLY in Shukla Paksha; 4,8,12 bad (8 worst, traditional) | CONFIRMED (translation); verse no. not located | `horaScoring.getChandrabalaGate`, `professionalMuhurta` layer 5 |
| Tarabala | Count from birth star, ÷9; good = 2,4,6,8,9; 3rd cycle all good; remedies gold/jaggery/vegetables/salt | CONFIRMED | `muhurta.calculateNavtara` |
| Janma tara | MC lists it bad; exceptions: upanayana, second-born marriage. Authorities DISAGREE | DISPUTED — code keeps "neutral" (project decision); Karma Vipak attribution unverified | `muhurta.computeTara` |
| Nitya Yoga names/order | 27, standard order, (Sun+Moon)/13°20' | CONFIRMED; Surya Siddhanta verse not located | `muhurta.getNityaYoga` |
| Nitya Yoga rejection | Whole yoga: Vyatipata, Vaidhriti. Opening ghatis only: Vishkambha 3, Vajra 3, Parigha half, Shula 5, Ganda 6, Atiganda 6, Vyaghata 9 | CONFIRMED (secondary cite "MC 1.34-35"); proportional-by-arc reading is an implementation choice | `muhurta.getNityaYoga`, convergence + professional scoring |
| Dagdha/Visha/Hutashana tithi | Dagdha: Sun 12, Mon 11, Tue 5, Wed 3, Thu 6, Fri 8, Sat 9 | CONFIRMED | frontend `taranidhi-v4.html` only; not in worker |
| Amavasya | Rejected for auspicious work (MC 1.34, secondary) | CONFIRMED | `convergenceIndex.calculateTithiScore` (fixed) |
| Abhijit | 8th of 15 day-muhurtas, ~midday; only exception: travel to the south | CONFIRMED; Wednesday and Monday-eastward claims NOT FOUND (removed); "MC 2.1-3" wrong | `muhurta.getAbhijitMuhurta` |
| Surgery in Krishna Paksha | No classical verse found; "MC 5.2" is the Samskara prakarana | NOT FOUND — claim withdrawn. Closest: MC Bhaishajya verse (Laghu/Mridu/Chara or Mula nakshatra, dual-sign lagna, 12/7/8 clear, never the birth nakshatra) | not in code |
| Rahu Kala / Yamaganda / Gulika | Absent from MC/BS rejection lists; later, mainly South Indian tradition | LATER TRADITION — keep, label | `muhurta.getRahuKaal` (comment) |
| Purpose-specific hora, upa-hora | No primary verse found | NOT FOUND — later practice | `muhurta` hora tables, `upahora.ts` |
| Numerology | No Muhurta text uses day-number timing | MODERN, NON-CLASSICAL — labelled | `numerology.ts`, convergence note |
| "Reach/Publicity" yogas, "Sarvaristha" | Do not exist in classical Muhurta | NOT FOUND — withdrawn, not implemented | — |
| Lakshmi/Saraswati/Dhana/Guru/Chandrama yogas | Natal-chart yogas, not Muhurta criteria | NOT valid as Muhurta criteria | — |
| Amrita/Siddha yoga, Sarvartha-siddhi | Weekday+tithi / weekday+nakshatra yogas — valid | CONFIRMED in kind | `muhurta` AMRIT_SIDDHI table (verse cite unverified) |

## Still open (needs Naveen's books / decisions)
1. Verify Chandrabala, tara, Nitya Yoga rejection against the Sanskrit edition; then flip `verified` flags.
2. Janma tara default: keep neutral, or follow MC (bad)? Public blog copy (`frontend/src/screens/public-blog.ts`) claims Karma Vipak Samhita as the source — unverified.
3. Tithi scoring tiers in `convergenceIndex` are proprietary and not derived from Nanda/Bhadra/Jaya/Rikta/Purna + paksha grading; Masa-shunya tithis, kshaya/vriddhi rejection, Krakacha/Samvartaka are missing.
4. Dagdha tithi exists only in the v4 HTML; port to worker with a test.
5. Campaign (film/election/product) Muhurta: only classical analogues exist (Rajyabhisheka, Yatra, trade); any "campaign" scoring is contemporary practice and must be labelled so.
6. Pre-existing failing test: `upahora.test.ts` "each uphora duration = horaDuration / 7".
