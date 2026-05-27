# Big Black Gym Log - Testing Phase Changelog

Version 0.9.60 - Pending

### New Features:
- **BB Best Gym**: Added an optional feature (on by default) that automatically switches to the best gym for the specific stat you're training, preventing accidental training at suboptimal gyms. Pressing a train button while a better gym is available opens Torn's gym change for that gym so you can confirm or cancel it — it never trains or switches without you. Once it has offered a swap for a stat, it stays out of the way for that stat until the page reloads, so you can keep training your current gym freely. Toggle it from the floating switch at the top of the gym page (beside the City and Tutorial buttons) or from the settings menu, with an optional sub-setting to exclude specialist gyms.
- **Diamond Days**: Added a brand new achievement tier for reaching 2000E+ training days, complete with new jewel visuals, weekly bar progress segments, hover animations for stickers and jewels, and enhanced bonuses for reaching this training goal. Diamond days award more points toward weekly progress, allowing standard and premium rewards to be achieved more easily. Points from all tiers contribute to an arbitrary leveling system in development to enhance long-term motivation and progression.
- **Achievements Page Overhaul** (in progress): Removed the expended energy category from the achievements page to include other more interesting statistics — including happy jump gains records and Diamond Day tracking, providing better insight into training patterns and special achievements.
- **Feature Guide** (in progress): Added a new feature guide offering transparency and support for the many features this script provides, making the extensive functionality more accessible to new and existing users.

### Bug Fixes:
- **Gold Week Sticker Award**: Fixed an issue where some gold weeks were not properly awarding 2 stickers instead of 1.
- **Sidebar Notification State**: Fixed an issue where the sidebar icon for the Gym Log would sometimes light up green when other pages received notifications, causing false positives.
- **TornPDA Update Flag**: Fixed an issue that prevented the update notification flag from appearing immediately after updating and refreshing on TornPDA.

### Improvements:
- **Weekly Progress Bar Overhaul**: Completely overhauled the weekly progress bar system visually and functionally. The system now translates training into "points" (200 green / 300 gold / 500 diamond per day) for the future leveling system, making room for new diamond-tier bar segments. Gold and green fills are now anchored left and right for clearer visual hierarchy.
- **Happy Jump Requirements**: Increased the required happy jumps needed to complete weekly rewards to better balance effort against consistent training. 3 happy jumps per week now fill the bar (up from 2), with a 4th jump elevating it to diamond status. This re-aligns short-burst training with standard daily training effort.
- **Achievements Copy/Paste Output**: Reworked the copy/paste output on the achievements page for both individual stats and full category copies. Category headers are now spaced and framed with em-dashes, multi-line stats are separated by blank lines while single-line stats stay grouped, and row labels are aligned with the on-screen UI for cleaner sharing on Discord and forums.
- **Expanded Date Tracking on Achievements**: Added date tracking to more achievements — the Best Training Streak, Best Green Streak, and Best Gold Streak rows now display their date ranges under the stat in expanded panel and page mode, matching the date styling used elsewhere on the achievements page.
- **Tap-and-Hold Parity with Desktop Hover**: Extended the mobile tap-and-hold interaction to fully imitate desktop "hover" behavior across the script, so tooltips, scrubbing, and other hover-driven affordances behave identically on touch devices — no functionality is lost between the two platforms.
- **Settings Configuration Reorganization**: Regrouped the settings menu into clearer, purpose-named sections — Big Black Features, Log Format, API Access, Data Management, and Information — for quicker navigation. Made the DEMO MODE button dynamic to function as an EXIT DEMO button while demo mode is active, enhancing navigation clarity and reducing user confusion.
- **Sidebar Branding Update**: Changed the SVG icon for the Gym Log from a flexing arm to a Crown, improving visual branding consistency across the application.
- **General UI Refinements**: Various minor improvements across the interface for enhanced usability and visual polish.

--------------------------------------------------

Version 0.9.50 - 2026-05-13
### New Features:
- **Achievements Dashboard**: Introduced a dedicated achievements page that tracks and visualizes long-term training milestones and statistics for higher training satisfaction. It monitors record-breaking gains (per-click, daily, weekly, and monthly), total energy expenditure, and consistency streaks (active days, green goals, and gold goals). The dashboard also provides a summary of 'Rewards Reaped,' including total happy jumps and stickers unlocked, all displayed in a premium, tabular-aligned numeric interface.

### Bug Fixes:
- **Sidebar button and Notes/People/Settings panel interaction**: Repaired the sidebar Gym Log button and future-proofed both its injection and the panel/chat shove logic by anchoring everything to stable native identifiers (`#nav-gym`, `#chatRoot`, `#notes_panel_button`, `#people_panel_button`, `#notes_settings_button`, and the `channel_panel_button:CHANNEL-ID` pattern) instead of Torn's brittle, frequently rotating CSS class name hashes. The sidebar button now reads live container/row/link/icon classes from existing sibling nav elements at injection time, so styling stays in sync with whatever Torn currently uses. The shove math was reworked so the BBGL panel coexists cleanly with native Notes, People, and Settings panels: each chat panel is individually shifted via its `right` position (composes with Torn's own per-panel transform) while native panels stay in their Torn-managed slots, eliminating the overlap, off-slot stacking, and disappearance bugs that the previous parent-transform approach caused. Active-state class handling was also generalized so navigating away from the gym log correctly clears the active highlight on every nav item, not just the container.
- **Graph layout and scaling**: Fixed unstable graph rendering when opening the graph view—including the plot shifting right with a false left gutter, extreme text scaling, blank charts, and x-axis labels falling off-screen. Sizing now uses layout dimensions (`clientWidth` / `clientHeight`) so the SVG `viewBox` stays correct while the CRT-style open animation runs (bounding-rect reads were picking up transform scale and corrupting measurements). Y-axis margin is guarded against occasional inflated `getBBox()` results from font or layout timing by capping against a deterministic label-width estimate, so the inner plot stays aligned reliably across opens.

### Improvements:
- **Happy Jump Weekly Progress**: Users who train in short high-energy bursts ("happy jumpers") can now complete and gold their weekly bar without needing 5 standard training days. The happy jump detection window has been extended to 10 minutes (from 5). A happy jump day now fills 50% of the weekly bar instead of 20%—meaning 2 happy jumps in a week completes the bar and unlocks a sticker. If a happy jump day also reaches the 1500E gold threshold, its bar segment turns gold. A week with 3 or more happy jumps (green or gold) is automatically treated as a gold week, unlocking 2 stickers—while individual day cells remain their earned color. Detection is real-time and updates the bar live as training is logged.
- **Fluid responsive layout**: Reworked styling across the entire injected UI away from a hard split between "mobile" and "desktop" rules toward a fluid scaling system (container queries, shared custom properties, and clamp-based spacing and typography). Page mode, docked/expanded panel, ledger, graph, achievements, stickers, and shared chrome now scale on a continuum so layout stays consistent across viewport sizes and devices, with fewer brittle `@media` overrides and a leaner, easier-to-maintain stylesheet.
- **Early injection for navigation controls**: Changed how the Gym Log sidebar button and footer tab are mounted so they are inserted as soon as the userscript runs, before the host page finishes painting. That removes the visible "pop-in" where controls appeared a beat late and looked glitchy or unfinished.
- **Footer tab icon alignment**: Centered the Gym Log SVG in the notes footer tab by clearing the header logo’s right margin when that markup is reused in the tab (flex centering had been offset by the extra margin).
- **Overall script efficiency**: Reduced redundant work in hot paths (rendering, panel updates, and graph redraws) and tightened DOM/CSS patterns so the script's footprint on the page stays negligible in normal use—no perceptible slowdown while browsing Torn.
- **Developer Console Polish**: Added a branded `BBGL` console badge, a read-only `window.BBGL` debug surface (`BBGL.help()`, `BBGL.state()`, `BBGL.config()` with API-key redaction, etc.) for cleaner bug reports, User Timing performance marks visible in DevTools when dev mode is on.
- **Graph UI / y-axis range**: Further improved the graph UI by allowing tighter y-axis value ranges so the plotted lines use more vertical resolution and read as steeper slopes, addressing feedback from Wulfie.

--------------------------------------------------

Version 0.9.21 - 2026-05-05

### New Features:
- **Graph Projection Overhaul**: Re-engineered the graphing engine from a point-based coordinate model to a sectional, day-bucketed rendering system to more clearly display the start and end of buckets in each view. This includes a dynamic "All-Time" view that automatically cycles through tiers to show the entire history—from the log's origin to the current point—remaining visible and legible for up to 16 years of data.


### Bug Fixes:
- **High-Frequency Train Logging**: Fixed an error where clicking the train button multiple times within a single second caused only one entry to be recognized. The unique key now includes the "after" stat value to ensure rapid clicks are recorded distinctly (discovered by Svegarn).

### Improvements:
- **Prettier Session Sharing**: Redesigned the "Copy Session Data" output for a cleaner, vertical layout optimized for sharing on Discord and forums. Includes a new Crown header, categorized stat lines with emojis, and a dedicated status message for no-energy days.
- **Storage Optimization (Thin Cache)**: Redesigned the `sessionStorage` architecture to use a lightweight "thin cache" that strips out heavy `series` arrays. This significantly reduces the storage footprint and mitigates `QuotaExceededError` risks.
- **Redundant Data Removal**: Removed static `rate` fields from stored log entries in favor of dynamic on-the-fly calculations, further shrinking the overall database footprint.
- **Data Persistence Reliability**: Hardened the IndexedDB read guards to ensure log history is always reconciled against the database, preventing "blank calendar" rendering issues on page refresh.
- **Enhanced Rate Continuity**: Applied the mathematical bridging logic from the daily ledger to all period views (Week, Month, Year). Starting rates now anchor to the previous period's final value, ensuring seamless continuity across all time scales.
- **Optimized Log Export**: Refined the export log structure to significantly reduce file size while improving human legibility. Features include a semi-minified entry layout, day-bucketing, and clear timezone-aware sub-headers.
- **Toolbar Visibility Enhancement**: Improved view-toggle button visibility across all backgrounds, specifically addressing feedback from Svegarn regarding the bright Stickerbook page. Icons now use a persistent white color with smart opacity for inactive states and a dynamic scale-and-glow effect to clearly indicate the active view.


--------

Version 0.9.10 - 2026-04-25

### New Features:
- **Changelog System**: Implemented a one-time pop-up modal and sidebar notification system to alert users of script updates and new features.
- **Sponsorship Sticker Page**: Added a new "Sponsorship" page to the left of the existing sticker book. Accessible via a custom Gold and Shiny navigation arrow, the page features large jagged-edge slots for future faction sponsorships.

### Bug Fixes:
- **Ledger Rate Discrepancy**: Fixed issue where starting rates for a new day did not match the ending rates of the previous day. Switched to last-entry point rates for display to ensure mathematical continuity.
- **Image Asset Migration**: Hosted all image assets on a new platform to resolve rendering and access issues for users in specific regions (UK/International), including DonCorleone and ApexJP.
- **Expanded Panel UI**: Repaired the SVG for the expanded panel view toggle; the arrow inversion and compaction icons are now correctly visible and functional.
- **Critical Data Merge**: Fixed a critical bug that caused errors or data corruption when merging an old log export with a new one if a gap existed in the log history.

### Improvements:
- **UI/UX Layout Refinement**: Tweaked various UI elements to provide a cleaner, more professional layout across both mobile and desktop viewports.
- **Demo Mode Clarity**: Enhanced the "Exit Demo Mode" interface with clearer instructions and visual cues to ensure users can easily return to their real data (as per Svegarn's recommendation).
- **Page Mode Intelligence**: Added a context-aware tooltip to the log footer icon that indicates the panel version is disabled while viewing the log in full-page mode (as per Svegarn's recommendation).
- **Mobile Tooltip Scrubbing**: Re-engineered calendar tooltips for mobile devices. Users can now tap-and-hold a specific day to view battlestat snapshots and "scrub" (slide finger) to view other days. This mimics desktop hover functionality without obstructing the view (as per LatinoBull's recommendation).
- **Data Integrity Guardrails**: Hardened the import and export functions with robust IndexedDB connection handling. Added automatic database re-initialization, proactive integrity checks to prevent silent data loss, and clearer, actionable error messages to guide users through storage issues.
- **Enhanced Error Messaging**: Updated error codes to provide more clarity to users during malfunction. (Recognized the necessity due to Wulfie being a Boomer)
