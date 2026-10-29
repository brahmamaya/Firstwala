# Simpler simulation page: summary

`simplify.js` (loaded after every other module) re-arranges the existing elements, so engines, ids, listeners, saved values, share links and exports are unchanged.
Tests: `node tools/e2e/simplify.js` (50 checks; needs Chromium and `/tmp/lab.js`-style helper or `LAB=`), plus the full `tools/e2e/e2e.js` (passes).
Screenshots: `before-*.png` / `after-*.png` here.

**Removed from the page:** live-model labels, WhatsApp icon (kept on landing/info pages), duplicate feedback buttons, panel hide/minimise buttons, rail toggle, tab rows, permanent sidebar, decorative chime and "Gentle control sounds" caption.
**Moved:** navigation into the "Browse simulations" drawer; View (forces, vectors, graphs, Ultra-Realistic, info text) and More (Favourite, Share, Snapshot, Help, Report a problem, AI Tutor, Appearance); speed/step, restore defaults, random values and scientific sound (beats, driven resonance, pendulum only) into Advanced controls; explanation, formula, assumptions, what to observe and the experiment into the collapsed "Understand this".
**Always visible:** Play/Pause, Reset, Record + quality (720p/1080p/2K/4K), Fullscreen (Focus + browser fullscreen), View, More.
**Recorder:** button turns into "Stop m:ss", failures and the saved size are shown in a status line, and a device that cannot sustain 2K/4K (under 10 fps in the first 4 s) stops with a clear message instead of saving a stuttering file.
