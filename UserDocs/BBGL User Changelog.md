# Big Black Gym Log - User Changelog

Version 0.9.60 - Pending

### New Features:
- **BB Backfill**: A powerful historical reconstruction engine that allows you to walk back and synchronize your training history, reaching all the way to the creation of your account. By intelligently scanning and parsing your training logs in reverse, it bridges missing data gaps to construct a complete, seamless lifetime record of your progression at your own pace.
- **BB Best Gym**: Intelligently prompts you to switch to the best gym for the stat you're training, preventing accidental waste. Attempting to train opens Torn's native gym swap for confirmation—never switching or training without your consent. Settings allow you to easily exclude specialist gyms or unpurchased locations from swaps.
- **Diamond Days**: Introducing a brand new achievement tier for reaching 2000E+ training days. Complete with premium new jewel visuals, weekly progress bar segments, smooth hover animations, and enhanced progress bonuses. Diamond days award more points toward weekly progress, allowing rewards to be reaped more easily.
- **Achievements Overhaul**: The achievements page has been revamped to replace the expended energy category with more engaging stats, including happy jump gains records and Diamond Day tracking, providing deeper insights into training milestones.
- **Feature Guide**: Added access to a new feature guide (still under development) to explain and help you get the most out of the many features this script has to offer (Suggested by Daddy Don).
- **Full Training Item Tracking**: Stat enhancers, energy items, and happy items used during training are now fully tracked in your logs, providing deeper insights and more training metrics (Conceptualized with no help from Wulfie whatsoever).
- **Dynamic Item Counter**: View your daily, weekly, monthly, and yearly item usage in real-time with a context-aware counter that dynamically displays relevant items when appropriate.

### Improvements:
- Comprehensively refactored the script to optimize performance across multiple open tabs and further reduce resource usage when the gym log panel is not actively open.
- Changed page mode navigation to use a more idle calendar URL rather than appending a hash, which helps prevent other scripts from throwing console errors.
- Overhauled the weekly progress bar and points system to lay the foundation for a future RPG leveling system tied to training, featuring a balanced progression scale and a cleaner layout.
- Upgraded copy-to-clipboard sharing across the script, introducing seamless single-stat copying from the ledger and Greatest Gains pages alongside beautifully formatted, Discord-ready outputs for your achievements.
- Extended mobile tap-and-hold interactions to fully match desktop hover behavior, ensuring tooltips, scrubbing, and hover triggers behave identically on touch devices.
- Regrouped the settings menu into more intuitive sections (Big Black Features, Log Format, API Access, Data Management, and Information) and made the Demo Mode button dynamic to easily toggle exiting.
- Updated the sidebar branding icon for the Gym Log from a flexing arm to a Crown for visual branding consistency.
- Implemented minor UI refinements and visual polish across the entire interface for enhanced usability.

### Bug Fixes:
- Fixed an issue where some gold weeks were improperly awarding one sticker instead of two.
- Repaired a bug causing the sidebar icon for the Gym Log to light up green on false notification states.
- Fixed a bug that prevented the update notification flag from appearing immediately after updating and refreshing on TornPDA.

--------------------------------------------------

Version 0.9.50 - 2026-05-13

### New Features:
- **Achievements Dashboard**: Added a brand new, dedicated Achievements page to enhance training satisfaction. Track long-term milestones, record-breaking gains, total energy expenditure, and consistency streaks. A summary of 'Rewards Reaped' is also available, including total happy jumps and stickers unlocked, all showcased in a beautiful, premium interface.
- **Happy Jump Rewards**: High-energy "happy jumpers" can now complete and gold the weekly bar without needing 5 standard training days. A happy jump day now fills 50% of the weekly bar, meaning just 2 happy jumps will complete the bar and unlock a sticker. Three or more happy jumps will automatically earn a gold week and 2 stickers.

### Improvements:
- Improved the graph UI to allow tighter value ranges, making stat growth slopes appear steeper and more visually rewarding (So Wulfie can feel like he actually does something).
- Refined the entire interface to ensure a seamless, fluid experience across all devices. Whether on desktop or mobile, the log will automatically scale to look fantastic on any screen size.
- The Gym Log sidebar button and footer tab now load instantly alongside the page, removing any visual pop-in to improve the premium feel of the tool.
- Centered the Gym Log icon perfectly in the notes footer tab for a cleaner, more aligned look.
- Optimized the engine under the hood to ensure the script runs incredibly smoothly, leaving absolutely no perceptible impact on browsing speed.
- Added a branded debug console to help troubleshoot issues more effectively whenever support is needed.

### Bug Fixes:
- Repaired the sidebar and footer tab button and future-proofed it by not relying on Torn's changing hash names.
- Fixed unstable graph rendering when opening the graph view. Issues like the plot shifting right, extreme text scaling, blank charts, and x-axis labels falling off-screen have been completely resolved.

--------------------------------------------------

Version 0.9.21 - 2026-05-05

### New Features:
- **Graph Projection Overhaul**: Completely re-engineered the graphing system to use a precise, sectional layout that clearly defines the start and end of each data bucket. Includes a new dynamic All-Time view that intelligently scales with your log, keeping your entire training history visible and detailed for years to come.

### Improvements:
- Redesigned the "Copy Session Data" output with a clean, emoji-rich vertical format optimized for readability when sharing to Torn chat, Discord, etc.
- Refined the log export structure to produce significantly smaller files that are much more readable when reviewed manually.
- Upgraded the view-toggle icons to use high-contrast white styling with an active-state glow and scale effect to ensure clear visibility across all backgrounds (Addressing Svegarn's feedback).
- Precision-tuned the rate bridging across all time periods so the starting rate for any Week, Month, or Year view now picks up exactly where the previous period ended, rather than from an average.
- Implemented a new "Thin-Cache" storage architecture and hardened the database engine to reduce the script's memory footprint and ensure perfectly reconciled history, which should also eliminate occasional "blank calendar" issues on refresh (Addressing Finniebal's feedback).

### Bug Fixes:
- Fixed an issue where rapid multi-clicking the Train button could result in skipped log entries; every session is now captured with full accuracy (Discovered by Svegarn).

--------------------------------------------------

Version 0.9.10 - 2026-04-25

### New Features:
- Added a Changelog Modal.
- Added a Sponsorship Sticker Page for future supporters of the script.

### Improvements:
- Improved mobile battlestat navigation by replacing static snapshot tooltips with a tap-and-hold scrubbing interaction, preserving full functionality without obstructing the calendar view. (Addressing LatinoBull’s feedback)
- Improved clarity for exiting Demo Mode with better visual cues. (Addressing Svegarn’s feedback)
- Added a tooltip to the footer icon while in page mode informing users of limited panel functionality. (Addressing Svegarn’s feedback)
- Improved data integrity with proactive integrity checks and more informative error messages.
- Improved error messaging to provide clearer, more descriptive codes during malfunctions. (Because Wulfie is a Boomer)
- Added additional error messaging across sync and storage operations to improve troubleshooting.

### Bug Fixes:
- Fixed ledger rate continuity so starting rates for a new day correctly match the ending rates of the previous day.
- Fixed image asset loading failures for users in the UK and internationally. (Addressing DonCorleone and ApexJP’s reports)
- Fixed the expanded panel compress/expand toggle icon not rendering correctly.
- Fixed a critical data merge bug that caused errors or data corruption when importing a log with gaps in history.
