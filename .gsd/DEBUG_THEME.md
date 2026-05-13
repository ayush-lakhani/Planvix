# Debug Session: Theme Consistency - Light/Dark Mode Issues

## Symptom
Users report that some pages still appear in dark mode even when light theme is selected. The light theme is not consistently applied across the application.

**When:** Whenever light theme is toggled.
**Expected:** All components should switch to light color palettes (bg-white, text-slate-900, etc.).
**Actual:** Navbar, dropdowns, and several page backgrounds are hardcoded to dark colors (bg-slate-950, text-white, etc.).

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Navbar component has hardcoded dark-mode classes (bg-slate-950). | 100% | CONFIRMED |
| 2 | Dropdown menus have hardcoded dark backgrounds. | 100% | CONFIRMED |
| 3 | Brand text ("planvIx") uses `from-white` which is invisible in light mode. | 100% | CONFIRMED |
| 4 | Analytics and ProPanel backgrounds use hardcoded dark colors instead of theme-responsive classes. | 90% | UNTESTED |
| 5 | Glass-card utility might need better light-mode support in some edge cases. | 50% | UNTESTED |

## Attempts

### Attempt 1
**Testing:** H1, H2, H3 - Navbar and Brand Theme Responsiveness
**Action:** Updating `Navbar.jsx` to use theme-responsive classes for background, border, text, and brand gradients.
**Result:** TBD
**Conclusion:** TBD
