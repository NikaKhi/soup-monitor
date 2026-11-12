# Soup Training Run Monitor

**Deployed Link:** https://soup-monitor.vercel.app

## Verdict: DON'T SHIP (In current state)

**Reason:** There is no explicit visual break (dashed line) in the chart where NaN or Infinity values occur. There is a text warning, but at a quick glance, the line seems continuous and "healthy". Additionally, when viewing 1M points with a single spike, the Y-axis auto-scales to fit the spike, which visually squishes the main trend.
**What to change first:** Add visual breaks to the line on NaN values and add a log-scale toggle for the Y-axis so users can see both the normal trend and the spikes simultaneously.

## Performance (CPU 4x Throttling, 1M points)
- **First render:** ~1278 ms (Scripting time from Performance trace)
- **Zoom/Hover response:** < 50 ms
- **Memory (Heap):** ~150 MB
- *Optimizations:* Implemented MinMax downsampling to 1000 points (instead of rendering 1M). Moved data cleaning outside the render loop. Used uPlot because it renders to Canvas (avoiding DOM bloat).

## Silent Failures
1. **Race Condition:** When rapidly switching runs, the previous request is cancelled via `AbortController` in the `useEffect` cleanup.
   *Note:* This is verified **manually** via DevTools Network throttling (fetch abortion). It is not covered by an automated test.
2. **Locale/Timezone:** Data contains ISO 8601 timestamps (UTC). On the axes, we display time in UTC to avoid confusing users across different timezones.
3. **Smoothing:** We do **not** apply smoothing to loss by default. Smoothing can hide divergence. Tests prove the spike is visible on raw data.
4. **Log scale with zeros:** In `dataCleaner.ts`, points `<= 0` are filtered out to prevent `-Infinity` errors if a log scale is applied.
5. **NaN/Infinity:** `cleanLoss` does not convert them to 0; it drops them and sets a `hadNaN` flag. The line does not draw a false zero.

## What tests do NOT catch
- **Subjective visibility:** If the Y-axis auto-scales, a spike might be present in the data but visually squished if there are other outliers.
- **Network delays:** Tests use mock data; real-world race conditions may have different timings.
- **Cross-browser Canvas rendering:** Tests verify data functions, but not how different browsers render pixels on the canvas.

## AI Tools
Used AI for: generating uPlot boilerplate, debugging `verbatimModuleSyntax` errors.
Accepted: The idea of MinMax for downsampling.
Rejected: AI suggested LTTB downsampling, but I rejected it because it can skip a single spike.
Verified myself: Wrote a test to prove the spike survives at 100, 500, 1000, and 2000 buckets.