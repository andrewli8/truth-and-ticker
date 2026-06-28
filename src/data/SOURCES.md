# Data sources & methodology

This piece's thesis depends on verifiable data, so provenance matters.

## Market data

- **S&P 500, Nasdaq Composite, Dow, VIX** — daily closes from the St. Louis Fed
  (FRED) series `SP500`, `NASDAQCOM`, `DJIA`, `VIXCLS`. (The Nasdaq **Composite**
  is keyed internally as `NDX` — note that symbol conventionally denotes the
  Nasdaq-100; the figures and display name are the Composite.)
- **LMT, RTX, XOM** — daily closes cross-checked between StockAnalysis.com and
  Yahoo Finance (matched to the cent).
- **WTI crude (`CL`)** — front-month settlements from Reuters-wire
  republications (CNBC, Business Times).
- **Gold (`GLD`)** — daily closes of the **SPDR Gold Shares ETF** (NYSEARCA: GLD),
  cross-checked between StockAnalysis.com and Yahoo Finance. (The series carries
  ETF prices — the ~$249–316 range over the period confirms the ETF, not spot
  XAU/USD, which trades near $3,000/oz.)

## Announcement text

Every Truth Social quote is **verbatim**, verified against the public Truth Social
archive at [trumpstruth.org](https://trumpstruth.org) — each `citationUrl` is the
individual post permalink (`/statuses/<id>`), with the timestamp as displayed by
the archive (U.S. Eastern, EDT = UTC−04:00). Original capitalization, smart quotes,
and apostrophes are preserved. Long posts are shown as faithful excerpts with `…`
marking elision.

Two entries are **spoken remarks, not posts**, and are labeled as such:
- Jun 18 "I may do it, I may not do it…" — spoken to reporters (C-SPAN video).
- Jun 24 "they don't know what the f*** they're doing" — spoken to reporters (NBC).

Notes from verification:
- The Jun 21 strike post exists as two near-duplicates (7:46 PM and 7:50 PM ET);
  we use the 7:50 PM post (`/statuses/31600`).
- "KEEP OIL PRICES DOWN" (9:35 AM) and "DRILL, BABY, DRILL" (9:37 AM) are two
  separate posts; the card quotes the first verbatim and notes the second.
- The "unconditional surrender" post (12:22 PM) followed a separate "control of
  the skies" post (11:55 AM) the same morning.

## Reaction metric

Each announcement's "reaction" is measured **close-to-close**: the instrument's
close just *before* the announcement vs. the first close *on or after* it. For
after-hours or weekend news (e.g., the Saturday-night strike announcement), the
reaction close is the next trading session. This is standard financial reporting
practice and avoids over-reading noisy intraday ticks.

## Known caveats

- **Announcement clock times are best estimates.** Wire services rarely publish
  minute-level timestamps for Truth Social posts. Dates are solid; times are
  bounded by article publication stamps. Most confident: the ceasefire post
  (~6:02 PM ET, Jun 23, per CBS) and the "don't know what they're doing" remark
  (~11:14 AM ET, Jun 24).
- The **"evacuate Tehran" post was Jun 16 ET** (Jun 17 datelines reflect Middle
  East time zones).
- **WTI Jun 19/20 settlements** are omitted (no settlement-grade source); the
  series interpolates across the gap for those days.
- Intraday oil peaks on Jun 23 (~$78 WTI / ~$81 Brent) were widely reported but
  are approximate and not used in the close-to-close metric.
- Some summaries cite **figures that are not in the charted dataset** — single-stock
  moves (e.g. GM −7.3% / Ford −3.7% on Mar 26, AAPL ~3% on May 23, TSLA −14.3% on Jun 5),
  market value wiped (~$5T on Apr 2, ~$151B on Jun 5), the 30-yr Treasury yield (~5% in
  mid-May), and individual single-day moves (Trump Media +22.67% on Apr 9). These are
  externally reported figures, sourced via each event's citation link, and are given for
  context only — the charted series cover CL, DJI, GLD, LMT, NDX, RTX, SPX, VIX, and XOM.
  Every percentage stated for a *charted* instrument matches its close-to-close reaction
  (enforced by a data-integrity test).

## Verification note

Live searches at build time were polluted by a separate 2026 Iran flare-up; all
figures here were verified against 2025-dated primary sources.
