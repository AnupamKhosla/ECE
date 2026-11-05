# Reading themes

Light is the default on every page, including when the OS requests dark. The
Light / Dark controls remember an explicit choice in `ece-theme`. Existing `auto`,
missing, unrecognised or malformed values resolve to light. Storage failures leave
the switch usable in the current page. Changes sync between tabs. The bootstrap
runs before the stylesheet so a saved choice is applied before content paints.
Without JavaScript the CSS defaults to light.

The dark palette uses charcoal surfaces, off-white reading text, visible secondary
text and restrained accent colours. Separate foreground tokens keep text legible
on accent-filled controls. Form borders and keyboard focus use stronger contrast
than decorative dividers. Native controls use the selected colour scheme. Printed
pages use the light palette, and reduced-motion settings suppress decorative motion.

The two original standalone diode lessons share theme state and controls. Their
original drawings contain fixed pigment colours, so those drawings retain a light
canvas and dark labels inside the dark page rather than invert scientific colours.

## Evidence and acceptance criteria

Sources checked 5 November 2026:

- [W3C SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normal text needs at least 4.5:1; large text at least 3:1. The course palette targets at least 7:1 for main reading text on its neutral surfaces and at least 4.5:1 for secondary text and accent/control labels.
- [W3C SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): meaningful control/state cues need 3:1 against adjacent colours. Input boundaries and focus indicators have separate tokens so decorative borders need not become visually dominant.
- [Google: Design a dark theme with Material and Figma](https://codelabs.developers.google.com/codelabs/design-material-darktheme): lighter, less saturated accents; layered surface tones; softer high-emphasis text; and appropriate foreground colours on filled components. These are design guidelines; the exact hex values are project choices verified against the contrast targets.

Contrast calculations use WCAG sRGB relative luminance, not a claim that a
particular contrast ratio guarantees comfort for every reader. The checks cover
the shared palette and representative rendered content, not a full WCAG audit of
every historical drawing or chapter.

Run the theme regression checks with `node --test tests/theme.test.mjs`.
