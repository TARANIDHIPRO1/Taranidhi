# House-Activity Mapping Table — Draft v1

**Status: DRAFT. This must be reviewed and corrected by the domain owner (Naveen K.
Rai) before it drives any production scoring. It is a starting point built from
widely-taught Parashari house-significations, not a primary-source citation for
every row — treat entries the same way `ARCHITECTURE.md` treats other
"widely-taught but not verse-cited" material.**

Purpose: this table is the taxonomy layer referenced in `ARCHITECTURE.md` Section 2-3.
The user picks a category from a menu; this table resolves that category to the
house(s) the Universal KP Engine should evaluate. It is data, not code — extending
the app's coverage to a new life-scenario means adding a row here, not writing new
calculation logic.

Format: `Category > Sub-activity | Primary house(s) | Karaka planet | Notes`

---

## 1. Career / Profession

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Job interview | 6th, 10th | Saturn (6th), Sun (10th) | 6th = competition/service; 10th = the profession itself |
| Sending a resume / job application | 6th, 10th | Saturn, Sun | |
| Salary negotiation | 2nd, 6th, 10th | Jupiter (2nd) | 2nd = accumulated wealth being negotiated |
| Job change / resignation | 10th | Sun | |
| Promotion | 10th, 6th (if competitive) | Sun | |
| Starting a new business | 7th, 10th | Mercury (7th, trade) | 7th = trade/partnership; 10th = the venture as profession |
| Business partner meeting | 7th | Mercury | |
| Signing a business contract | 7th, 3rd (for the document/communication) | Mercury | |

## 2. Finance

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Receiving payment from a customer | 2nd, 11th | Jupiter (2nd), Jupiter (11th, gains) | |
| Making a payment to someone | 2nd, 12th (expenditure) | Jupiter, Saturn (12th) | |
| Applying for a loan | 6th (debt), 11th (if goal is gain) | Saturn (6th) | |
| Repaying a loan | 6th, 8th (if it involves another's money/joint funds) | Saturn | |
| Large purchase (not property/vehicle) | 2nd | Jupiter | |

## 3. Health

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Doctor visit (routine/general) | 6th | Mars/Saturn (disease significators) | |
| Diagnostic test / blood test / lab work | 8th | Saturn/Mars | 8th = research/hidden-cause house — this is the Karyesh-Bala reversal case: 8th strength here is wanted, not feared |
| Surgery | 6th (the disease/procedure) + 8th (the risk/transformation) | Mars, Saturn | Classically both checked together |
| Starting a medical treatment course | 6th | | |
| Hospitalization | 8th, 12th (confinement) | | |

## 4. Relationships

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Proposing marriage / expressing romantic intent | 5th (romance), 7th (partnership) | Venus | Multi-house — evaluate both |
| Marriage muhurta (single-person timing view; full election needs both charts — out of scope for the Query Window, see ARCHITECTURE.md Section 2 note on why matchmaking is a separate future project) | 7th | Venus/Jupiter | |
| First meeting with a prospective partner | 7th, 5th | Venus | |
| Resolving a relationship conflict | 7th | Venus | |

## 5. Travel

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Short/local travel (leaving home for an appointment) | 3rd | Mars | |
| Long-distance / foreign travel | 9th (or 12th if relocating/residing abroad) | Jupiter (9th) | |
| Catching a flight / departure timing | 3rd | Mars | |
| Immigration / visa application | 9th, 12th | | |

## 6. Education

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Basic schooling matters | 4th | Mercury/Jupiter | |
| Exam / test | 5th (intelligence), 6th (competition) | Mercury | |
| Higher education / research admission | 9th | Jupiter | |
| Research / occult study | 8th | Saturn | Karyesh-Bala reversal case, same as diagnostic tests |

## 7. Property

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Buying/renting property | 4th | Mars/Venus | |
| Home inauguration (griha-pravesh) | 4th | | Full-election, super-premium tier feature |
| Vehicle purchase | 4th | Venus | |

## 8. Legal

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Filing a court case | 6th | Saturn | Karyesh-Bala reversal case |
| Court hearing date | 6th | | |
| Signing a legal document (non-business) | 6th, 3rd | | |

## 9. Spiritual / Religious

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Starting a spiritual practice | 9th, 12th | Jupiter, Ketu | 9th = belief/dharma; 12th = liberation |
| Pilgrimage | 9th, 12th | Jupiter | |
| Puja / ritual timing | 9th | Jupiter | |

## 10. Communication

| Sub-activity | House(s) | Karaka | Notes |
|---|---|---|---|
| Important phone call | 3rd | Mercury | |
| Sending an important email/message | 3rd | Mercury | |
| Public announcement | 3rd, 10th (if career-related) | Mercury | |

---

## Multi-house resolution rule (for the engine, not just this table)

When an activity maps to more than one house, the Universal KP Engine evaluates each
house independently and returns a combined verdict. The exact combination logic
(e.g. "both must be favorable" vs "weighted average") is **not yet decided** — flag
back before implementing. Do not silently assume "AND" or "average" without
confirming, since the two produce meaningfully different verdicts for a borderline
case.

## Known gaps in this draft (to be filled by domain review)

- Categories not yet covered: sports/competition events, creative/artistic launches,
  technology/gadget purchases, social-media specific actions, negotiations outside
  business (e.g. family disputes).
- Every "Notes" column with no note is a placeholder — needs domain-owner review to
  confirm the house assignment is correct, not just plausible.
- This table currently has no entries requiring the 1st (self/body), and does not yet
  address activities whose primary significance is personality/self-initiated action
  rather than a specific life-domain — needs a decision on whether 1st house gets its
  own category or is treated as a universal modifier across all rows.
