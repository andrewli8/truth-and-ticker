# Data sources & methodology

This piece's thesis depends on verifiable data, so provenance matters.

## Market data

- **S&P 500, Dow, VIX** — daily closes from the St. Louis Fed (FRED) series
  `SP500`, `DJIA`, `VIXCLS`.
- **LMT, RTX, XOM** — daily closes cross-checked between StockAnalysis.com and
  Yahoo Finance (matched to the cent).
- **WTI & Brent crude** — front-month settlements from Reuters-wire
  republications (CNBC, Business Times).
- **Gold** — spot XAU/USD per troy ounce (NOT the GLD ETF; verified GLD closes
  could not be obtained from a settlement-grade source).

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

## Verification note

Live searches at build time were polluted by a separate 2026 Iran flare-up; all
figures here were verified against 2025-dated primary sources.
