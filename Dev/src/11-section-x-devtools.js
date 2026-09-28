
/**
 *  [SECTION X] DEV TOOLS
 *  ========================================================================
 *  Everything in this file is dev-only. release-build.ps1 (via build-root.js's
 *  DEVTOOLS_FILES set) drops this entire file when producing BigBlackGymLog.js —
 *  it only ever ships in the dev build. The single point of contact with
 *  production code is the guarded `initDevTools()` call in init() (10-section-ix-init.js).
 */
(function() {
    const btnStyle = 'background:#444;color:#fff;border:1px solid #666;padding:6px 12px;border-radius:4px;cursor:pointer;font-family:sans-serif;font-size:12px;';
    const smallBtn = 'flex:1;padding:5px 4px;font-size:11px;';
    const inputStyle = 'width:56px;background:#333;color:#fff;border:1px solid #666;border-radius:4px;padding:5px 6px;font-family:sans-serif;font-size:12px;';
    const selectStyle = 'flex:1;min-width:0;background:#333;color:#fff;border:1px solid #666;border-radius:4px;padding:5px 6px;font-family:sans-serif;font-size:12px;';
    const ACTIVE_BG = '#6a1b9a';
    const POS_KEY = 'bbgl_dev_widget_pos';

    // Set at load rather than in initDevTools(), so it's in place before any doc can be fetched.
    runtime._devDocsBase = 'https://raw.githubusercontent.com/BigBlackHawk42069/BigBlackGymLog/DevBranch/UserDocs/';

    let widgetEl = null;
    let toggleBtn = null;
    let refreshTimer = null;
    // Section refreshers run on a short tick while the widget is open, so every readout tracks what
    // the level bar is actually showing (including mid-animation and real syncs).
    const refreshers = [];

    function setDevMode(on) {
        runtime.devMode = !!on;
        sessionStorage.setItem(KEYS.DEV_MODE, String(runtime.devMode));
        renderDevToggleUI();
        Log.info(`Developer mode ${runtime.devMode ? 'ENABLED' : 'DISABLED'}`);
    }

    function renderDevToggleUI() {
        if (widgetEl) widgetEl.style.display = runtime.devMode ? 'flex' : 'none';
        if (toggleBtn) toggleBtn.style.background = runtime.devMode ? ACTIVE_BG : '#444';
        clearInterval(refreshTimer);
        refreshTimer = null;
        if (runtime.devMode && widgetEl) {
            runRefreshers();
            refreshTimer = setInterval(runRefreshers, 300);
        }
    }

    function runRefreshers() {
        refreshers.forEach(fn => {
            try { fn(); } catch (e) { /* UI not built yet */ }
        });
    }

    // One column of the widget's horizontal strip; the divider sits on its left edge.
    function buildDevSection(title, children, width) {
        const section = document.createElement('div');
        section.style.cssText = `display:flex;flex-direction:column;gap:6px;flex:0 0 ${width || 200}px;min-width:0;padding:0 10px;border-left:1px solid #444;`;
        const label = document.createElement('div');
        label.textContent = title;
        label.style.cssText = 'color:#999;font-family:sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;';
        section.appendChild(label);
        children.forEach(c => section.appendChild(c));
        return section;
    }

    function buildDevButton(text, onClick, extraStyle) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = btnStyle + (extraStyle || '');
        btn.onclick = onClick;
        return btn;
    }

    function buildRow(children, extraStyle) {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:4px;align-items:center;' + (extraStyle || '');
        children.forEach(c => row.appendChild(c));
        return row;
    }

    function buildSelect(options) {
        const sel = document.createElement('select');
        sel.style.cssText = selectStyle;
        options.forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            sel.appendChild(opt);
        });
        return sel;
    }

    // The refreshers call these every 300ms; writing only on change keeps an idle widget from
    // restyling itself and waking the page's DOM observer (it lives outside #bbgl-panel) each tick.
    function setActive(btn, on) {
        if (btn._bbglActive === on) return;
        btn._bbglActive = on;
        btn.style.background = on ? ACTIVE_BG : '#444';
    }

    function setTextIfChanged(el, text) {
        if (el.textContent !== text) el.textContent = text;
    }

    // ─── Level helpers ──────────────────────────────────────────────────────
    // Level ▲ clicks that land while a level sequence is playing add their EXP without joining the
    // animation queue (runLevelAnimationQueue() only ever extends to _targetLevelExp, which these
    // never touch); the bar's number follows the clicks and snaps to the total once it finishes.
    let levelUpSnapPending = false;

    // The EXP total the bar is displaying right now (lags the real total while it animates).
    function shownLevelExp() {
        if (levelUpSnapPending) return getLiveLevelExp();
        return runtime._lastLevelExp !== undefined ? runtime._lastLevelExp : getLiveLevelExp();
    }

    function addNextLevelExp() {
        const p = calculateLevelProgress(getLiveLevelExp());
        runtime.careerLevelExp = (runtime.careerLevelExp || 0) + Math.max(1, p.expToNext - p.expInLevel);
    }

    // Drives the level bar directly instead of dispatching bbgl:dataUpdated, whose listener also
    // rebuilds the calendar (restarting today's jewel shine) for EXP that changes nothing there.
    function devLevelUp() {
        if (!runtime._isAnimatingLevel) {
            addNextLevelExp();
            updateLevelBar();
            return;
        }
        addNextLevelExp();
        if (levelUpSnapPending) return;
        levelUpSnapPending = true;
        const tick = () => {
            if (runtime._isAnimatingLevel) {
                // The sequence writes its own level number as each step lands; keep ours on top,
                // unless it's mid-atrophy, where the digits belong to that sequence.
                const target = calculateLevelProgress(getLiveLevelExp());
                if (target.atrophy === calculateLevelProgress(runtime._lastLevelExp).atrophy) {
                    getLevelBars().forEach(b => {
                        if (b.container.dataset.level !== String(target.level)) setLevelBarNumber(b, target.level);
                    });
                }
                requestAnimationFrame(tick);
                return;
            }
            levelUpSnapPending = false;
            // Silent: snaps to the new total instead of queueing another climb. A snap plays no
            // sequence, so the titles page's rank readout is repainted here instead.
            updateLevelBar(true);
            refreshRankDisplays();
            runRefreshers();
        };
        requestAnimationFrame(tick);
    }

    function shownProgress() {
        return calculateLevelProgress(shownLevelExp());
    }

    // Writes the real EXP for (atrophy, level) into runtime.careerLevelExp rather than a cosmetic
    // override, so Train/Level Up keep advancing from the previewed spot. Today's real synced EXP
    // sits on top of careerLevelExp in getLiveLevelExp(), so it's netted out to land exactly.
    // Snaps instead of animating: the level-up animation queue crawls through big jumps.
    function jumpToLevel(atrophy, level) {
        const floor = LEVEL_ATRO_START[atrophy];
        const lvl = Math.min(LEVEL_CAP, Math.max(floor, level));
        const todayReal = getLiveLevelExp() - (runtime.careerLevelExp || 0);
        let target = 0;
        for (let a = 0; a < atrophy; a++) target += LEVEL_ATRO_BUDGETS[a];
        for (let lv = floor; lv < lvl; lv++) target += computeLevelExpCost(lv, atrophy);
        runtime.careerLevelExp = Math.max(0, target - todayReal);
        const newTotal = getLiveLevelExp();
        runtime._lastLevelExp = newTotal;
        getLevelBars().forEach(b => renderLevelBar(b, newTotal));
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        runRefreshers();
    }

    // Reward popups only ever fire once per id (viewState.rewardsSeen), so a tier you've already
    // atrophied past in testing stays silent. Wiping the matching ids makes it play again.
    function clearRewardMemory(prefixes) {
        const seen = viewState.rewardsSeen;
        if (!seen) return;
        Object.keys(seen).forEach(id => {
            if (!prefixes || prefixes.some(pre => id.startsWith(pre))) delete seen[id];
        });
        saveViewState();
    }

    // ─── API Counter (widget header, no section) ────────────────────────────
    function buildApiCounter() {
        const hud = document.createElement('div');
        hud.id = 'bbgl-api-hud';
        hud.style.cssText = 'color:#fff;font-family:sans-serif;font-size:12px;text-align:center;';
        hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
        return hud;
    }

    // ─── Triggers section (XP/level testing) ───────────────────────────────
    function buildTriggersSection() {
        const addExp = gain => {
            runtime.careerLevelExp = (runtime.careerLevelExp || 0) + gain;
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        };
        const tierBtn = 'flex:1;padding:6px 2px;font-size:10px;';
        const dayTierRow = buildRow([
            ['Green Day', 1000],
            ['Gold Day', 1500],
            ['Diamond Day', 2000]
        ].map(([label, e]) => buildDevButton(label, () => addExp(computeDailyLevelExp(e, true, false)), tierBtn)));

        // Follows today's real Happy Jump state, like a real train would.
        const trainRow = buildRow([100, 150, 400].map(e => buildDevButton(`Train ${e}E`, () => {
            const { hjDaySet } = DataController.getHappyJumpData();
            addExp(computeDailyLevelExp(e, true, hjDaySet.has(Formatter.dateLogical())));
        }, tierBtn)));

        // Level stepper: the input always mirrors the level on the bar; typing a level jumps to it
        // within the current atrophy tier.
        const levelInput = document.createElement('input');
        levelInput.type = 'number';
        levelInput.step = '1';
        levelInput.style.cssText = inputStyle + 'flex:1;text-align:center;';
        levelInput.title = 'Current level (edit to jump within this atrophy)';
        levelInput.addEventListener('change', () => {
            const lvl = parseInt(levelInput.value, 10);
            if (!Number.isFinite(lvl)) return;
            jumpToLevel(shownProgress().atrophy, lvl);
            levelInput.blur();
        });
        levelInput.addEventListener('keydown', e => { if (e.key === 'Enter') levelInput.dispatchEvent(new Event('change')); });

        const downBtn = buildDevButton('▼ Level', () => {
            const p = shownProgress();
            if (p.level > LEVEL_ATRO_START[p.atrophy]) jumpToLevel(p.atrophy, p.level - 1);
            else if (p.atrophy > 0) jumpToLevel(p.atrophy - 1, LEVEL_CAP - 1);
        }, smallBtn);
        // Level Up adds the EXP normally so the real level-up animation still plays (once — see devLevelUp()).
        const upBtn = buildDevButton('Level ▲', devLevelUp, smallBtn);
        const levelRow = buildRow([downBtn, levelInput, upBtn]);

        refreshers.push(() => {
            if (document.activeElement === levelInput) return;
            const p = shownProgress();
            if (levelInput.min !== String(LEVEL_ATRO_START[p.atrophy])) levelInput.min = String(LEVEL_ATRO_START[p.atrophy]);
            if (levelInput.max !== String(LEVEL_CAP)) levelInput.max = String(LEVEL_CAP);
            if (levelInput.value !== String(p.level)) levelInput.value = p.level;
        });

        // Puts a new-sticker post-it on last week's latest sticker day (or the most recent earlier one
        // if last week has none). Clearing it only drops the override; the sticker's real state is untouched.
        const placeNewNote = withStack => {
            const today = Formatter.dateLogical();
            const thisWeek = getWeekKey(today);
            const lastWeek = getWeekKey(Formatter.dateISO(...(d => [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()])(new Date(Formatter.parse(today).getTime() - 7 * 86400000))));
            const days = [...DataController.getStickerMap().keys()].filter(d => getWeekKey(d) < thisWeek).sort();
            const target = days.filter(d => getWeekKey(d) === lastWeek).pop() || days.pop();
            if (!target) { Log.info('[dev] No sticker days before this week to put a post-it on'); return; }
            runtime._devNewNoteDate = target;
            runtime._devPostItStackDate = withStack ? target : null;
            Log.info(`[dev] New sticker post-it${withStack ? ' over a 3-note stack' : ''} on ${target}${getWeekKey(target) === lastWeek ? '' : ' (last week has no sticker)'}`);
            if (dom.panel) renderPanelContent();
        };
        const newNoteRow = buildRow([
            buildDevButton('New Sticker Post-it', () => placeNewNote(false), tierBtn),
            buildDevButton('+ 3-Note Stack', () => placeNewNote(true), tierBtn)
        ]);

        return buildDevSection('Triggers', [dayTierRow, trainRow, levelRow, newNoteRow], 220);
    }

    // ─── Rank Preview section ───────────────────────────────────────────────
    function buildRankPreviewSection() {
        const atrophyBtns = [0, 1, 2].map(a => buildDevButton(`Atrophy ${a}`, () => {
            const p = shownProgress();
            // Level 100 on atrophy 0/1 rolls into the next tier, so cap the carried level at 99 there.
            const carry = a < 2 ? Math.min(p.level, LEVEL_CAP - 1) : p.level;
            jumpToLevel(a, carry);
        }, smallBtn));
        const atrophyRow = buildRow(atrophyBtns);

        let start = 0;
        const bands = LEVEL_TITLE_BANDS.map(band => {
            const b = { start, max: band.max };
            start = band.max + 1;
            return b;
        });
        // Jumping to a band also fires that band's rank popup (forced, so an already-seen one still
        // shows) — the real one comes off the level sequence, this is just for looking at it.
        const rankBtns = bands.map((b, i) => {
            const btn = buildDevButton('', () => {
                const { atrophy } = shownProgress();
                jumpToLevel(atrophy, b.start);
                emitReward({ kind: 'rank', id: `rank:${atrophy}:${i}`, atrophy, band: i, label: LEVEL_TITLE_BANDS[i].titles[atrophy] }, true);
            }, smallBtn);
            return btn;
        });
        // Snaps to Lv 99, then adds the last level's EXP normally (like Level ▲) so the real
        // sequence plays: atrophy on A0/A1, Fully Bricked on A2.
        const capBtn = buildDevButton('', () => {
            const { atrophy, level } = shownProgress();
            if (isFullyBricked(atrophy, level)) return;
            // So the modal at the end plays every time you test the sequence.
            clearRewardMemory(['atrophy:', 'bricked']);
            jumpToLevel(atrophy, LEVEL_CAP - 1);
            addNextLevelExp();
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        }, smallBtn);

        // Range-only labels keep this to 2 rows of 3; the rank name for the current atrophy is
        // each button's hover title.
        const setTitleIfChanged = (btn, t) => { if (btn.title !== t) btn.title = t; };
        refreshers.push(() => {
            const p = shownProgress();
            atrophyBtns.forEach((btn, a) => setActive(btn, a === p.atrophy));
            rankBtns.forEach((btn, i) => {
                const b = bands[i];
                setTextIfChanged(btn, `${b.start}–${b.max}`);
                setTitleIfChanged(btn, LEVEL_TITLE_BANDS[i].titles[p.atrophy]);
                setActive(btn, p.level >= (i === 0 ? -Infinity : b.start) && p.level <= b.max);
            });
            setTextIfChanged(capBtn, '100');
            setTitleIfChanged(capBtn, p.atrophy < 2 ? `Finish Atrophy ${p.atrophy}` : 'Fully Bricked');
            setActive(capBtn, isFullyBricked(p.atrophy, p.level));
        });

        const rankGrid = [...rankBtns, capBtn];
        return buildDevSection('Rank Preview', [atrophyRow, buildRow(rankGrid.slice(0, 3)), buildRow(rankGrid.slice(3))]);
    }

    // ─── Title Preview section (stat-title board testing) ───────────────────
    // A fully unlocked copy of the titles page's star board. Picks follow the real two-click rule
    // (handleTitleStarPick(), 07-section-vi-ui.js): the first click is the adjective and parks in
    // runtime._titlePick, so the real card shows its one-word preview; the second is the noun and
    // commits the pair to runtime._devTitleOverride (read by getLiveStatTitleSelection() behind
    // runtime.devMode) instead of the player's saved title.
    const ROLE_BG = {
        '': '#333',
        secondary: '#00838f',
        primary: ACTIVE_BG,
        both: `linear-gradient(135deg,#00838f 50%,${ACTIVE_BG} 50%)`
    };

    function buildTitlePreviewSection() {
        function refreshTitleUI() {
            if (typeof refreshStatTitleUI === 'function') refreshStatTitleUI();
        }

        const cells = [];
        const pick = (stat, phase) => {
            const pending = runtime._titlePick;
            if (!pending) {
                runtime._titlePick = { stat, phase };
            } else {
                runtime._devTitleOverride = { primary: { stat, phase }, secondary: pending };
                runtime._titlePick = null;
            }
            refreshTitleUI();
            renderBoard();
        };

        // str+def over spd+dex puts str/spd in the left column and def/dex in the right, like the page.
        const board = document.createElement('div');
        board.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;';
        STAT_KEYS.forEach(stat => {
            const block = document.createElement('div');
            block.style.cssText = 'display:flex;flex-direction:column;gap:2px;min-width:0;';
            const label = document.createElement('div');
            label.textContent = achStatFull(stat);
            label.style.cssText = 'color:#aaa;font-family:sans-serif;font-size:10px;font-weight:bold;text-align:center;';
            block.appendChild(label);
            [0, 5].forEach(offset => {
                block.appendChild(buildRow(STAT_TITLE_THRESHOLDS.slice(offset, offset + 5).map((_, i) => {
                    const phase = offset + i;
                    const words = STAT_TITLE_WORDS[stat][phase];
                    const cell = buildDevButton(String(phase + 1), () => pick(stat, phase), 'flex:1;min-width:0;padding:3px 0;font-size:10px;border-radius:3px;');
                    cell.title = `${words.adj} • ${words.noun} · Tier ${phase + 1}`;
                    cells.push({ cell, stat, phase });
                    return cell;
                }), 'gap:2px;'));
            });
            board.appendChild(block);
        });

        const status = document.createElement('div');
        status.style.cssText = 'font-family:sans-serif;font-size:11px;text-align:center;min-height:14px;';

        function renderBoard() {
            const sel = getLiveStatTitleSelection();
            const pending = runtime._titlePick;
            cells.forEach(c => {
                const role = achTitleStarRole(sel, pending, c.stat, c.phase);
                if (c.cell._bbglRole === role) return;
                c.cell._bbglRole = role;
                c.cell.style.background = ROLE_BG[role];
            });
            let text;
            if (pending) {
                const w = statTitleWord(pending.stat, pending.phase);
                text = w ? `${w.adj} …` : '…';
            } else {
                const parts = composeStatTitleParts(sel);
                text = parts ? parts.map(p => p.text).join(' ') : 'Unequipped';
            }
            const on = !!runtime._devTitleOverride;
            setTextIfChanged(status, on ? text : `${text} (real)`);
            status.style.color = on ? '#ce93d8' : '#777';
        }
        refreshers.push(renderBoard);

        const actionRow = buildRow([
            // The title a player sees before any stat has unlocked a word.
            buildDevButton('Untitled', () => {
                runtime._titlePick = null;
                runtime._devTitleOverride = { placeholder: true, primary: null, secondary: null };
                refreshTitleUI();
                renderBoard();
            }, smallBtn),
            buildDevButton('Real Title', () => {
                runtime._titlePick = null;
                runtime._devTitleOverride = null;
                refreshTitleUI();
                renderBoard();
            }, smallBtn + 'background:#5a1a1a;border-color:#833;')
        ]);

        return buildDevSection('Title Preview', [board, status, actionRow], 240);
    }

    // ─── Plaque Preview section ─────────────────────────────────────────────
    // Progressive plaque step (runtime._devPlaqueStage, read by getLivePlaqueStage(),
    // 07-section-vi-ui.js). "Live" follows the real unlock count.
    function buildPlaquePreviewSection() {
        const refresh = () => {
            if (typeof refreshStatTitleUI === 'function') refreshStatTitleUI();
        };
        const stageOptions = [0, ...TITLE_PLAQUE_STEPS].map((n, s) => [String(s), s ? `Step ${s} · ${n}+` : `Step 0 · <${TITLE_PLAQUE_STEPS[0]}`]);
        const stageSelect = buildSelect([['', 'Live'], ...stageOptions]);
        const setStage = s => {
            runtime._devPlaqueStage = s;
            stageSelect.value = s === null ? '' : String(s);
            refresh();
        };
        stageSelect.addEventListener('change', () => setStage(stageSelect.value === '' ? null : parseInt(stageSelect.value, 10)));
        const stageStep = dir => {
            const cur = Number.isFinite(runtime._devPlaqueStage) ? runtime._devPlaqueStage : getLivePlaqueStage();
            setStage(Math.max(0, Math.min(TITLE_PLAQUE_STEPS.length, cur + dir)));
        };
        const stepRow = buildRow([
            buildDevButton('◀', () => stageStep(-1), smallBtn + 'flex:0 0 28px;'),
            stageSelect,
            buildDevButton('▶', () => stageStep(1), smallBtn + 'flex:0 0 28px;')
        ]);
        const liveRow = buildRow([buildDevButton('Live', () => setStage(null), smallBtn)]);

        // Reward popups, fired straight at the queue with force so an already-seen one still
        // shows (emitReward(), 07-section-vi-ui.js). The real ones come off the level sequences;
        // these are just for looking at them.
        const popupLabel = document.createElement('div');
        popupLabel.textContent = 'Popups';
        popupLabel.style.cssText = 'color:#999;font-family:sans-serif;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;';
        const popupBtns = [
            ['Rank', { kind: 'rank', id: 'dev:rank', atrophy: 0, band: 2, label: 'Hand-Jerked Clay' }],
            ['Title', { kind: 'title', id: 'dev:title', label: 'The Dripping Wet Colossus' }],
            ['Atrophy', { kind: 'atrophy', id: 'dev:atrophy', from: 0, to: 1 }],
            ['Bricked', { kind: 'bricked', id: 'dev:bricked' }]
        ].map(([label, evt]) => buildDevButton(label, () => emitReward(evt, true), 'flex:1;padding:6px 2px;font-size:10px;'));

        // Forgets every popup already shown, so the real ones fire again on the next climb.
        const popupResetRow = buildRow([buildDevButton('Reset Popup Memory', () => clearRewardMemory(null), 'flex:1;padding:5px 4px;font-size:10px;')]);

        return buildDevSection('Plaque Preview', [stepRow, liveRow, popupLabel, buildRow(popupBtns.slice(0, 2)), buildRow(popupBtns.slice(2)), popupResetRow], 180);
    }

    // ─── Books section (Library layout testing) ────────────────────────────
    // Sets runtime._devBookOverride, returned by DataController.getBookData() behind runtime.devMode,
    // in the same shape computeBookData() produces.
    //   clip  — every book read with the longest realistic numbers, for overflow/clipping
    //   mixed — a spread of read/reading/unread with approx/partial flags, for state styling
    // memPage: which Library page Memories' repeated book lands on — 1 repeats Get Hard Or Go Home,
    // 2 the first Energy book (each gets a Memories row), 3 the first untracked book (no row; the two
    // checklist entries are tinted instead).
    function buildFakeBookData(mode, memPage = 1) {
        const HUGE = 987654321987.65;
        const DAY = 86400;
        const now = Math.floor(Date.now() / 1000);
        const val = i => mode === 'clip' ? HUGE : Math.round(5000 + ((i * 7919) % 97) * 51337);
        const books = {};
        Object.keys(BOOK_META).map(Number).forEach((id, i) => {
            const meta = BOOK_META[id];
            const state = mode === 'clip' ? 'read' : ['read', meta.readPeriod ? 'reading' : 'read', 'unread'][i % 3];
            if (state === 'unread') {
                books[id] = { state };
                return;
            }
            const entry = { state, start: now - 40 * DAY, end: state === 'read' ? now - 9 * DAY : null };
            const v = val(i);
            if (meta.training === 'stat') {
                if (state === 'read') entry.gain = v;
            } else if (meta.training === 'gym' && meta.stat) {
                entry.stats = { [meta.stat]: v, tot: v };
                entry.extra = { [meta.stat]: r2(v * .3 / 1.3), tot: r2(v * .3 / 1.3) };
            } else if (meta.training && meta.training !== 'repeat') {
                entry.stats = { str: v, def: v, spd: v, dex: v, tot: r2(v * 4) };
                if (meta.training === 'gym') {
                    const x = r2(v * .2 / 1.2);
                    entry.extra = { str: x, def: x, spd: x, dex: x, tot: r2(x * 4) };
                }
            }
            if (mode === 'mixed') {
                entry.uncertain = i % 4 === 1;
                entry.partial = i % 5 === 2;
            }
            books[id] = entry;
        });
        if (memPage === 3) {
            const other = Object.keys(BOOK_META).map(Number).find(id => !BOOK_META[id].training);
            books[MEMORIES_BOOK] = { state: 'read', start: now - 20 * DAY, end: now + 11 * DAY, repeats: other };
            if (!books[other] || books[other].state === 'unread') books[other] = { state: 'read', start: now - 60 * DAY, end: now - 29 * DAY };
            return { books, memories: null };
        }
        const repeats = TRAINING_BOOKS.find(id => memPage === 2 ? BOOK_META[id].training === 'energy' : (BOOK_META[id].training === 'gym' && !BOOK_META[id].stat));
        books[MEMORIES_BOOK] = { state: 'read', start: now - 20 * DAY, end: now + 11 * DAY, repeats };
        const mv = val(3);
        const memories = repeats == null ? null : {
            repeats,
            start: now - 20 * DAY,
            end: now + 11 * DAY,
            partial: false,
            stats: { str: mv, def: mv, spd: mv, dex: mv, tot: r2(mv * 4) }
        };
        if (memories && BOOK_META[repeats].training === 'gym') {
            const x = r2(mv * .2 / 1.2);
            memories.extra = { str: x, def: x, spd: x, dex: x, tot: r2(x * 4) };
        }
        return { books, memories };
    }

    function buildBooksSection() {
        let mode = null;
        let memPage = 1;
        const openPage = p => {
            if (!dom.topPanel || !dom.topPanel.classList.contains('viewing-library')) toggleLibraryView();
            gotoLibraryPage(p);
        };
        const modes = [['clip', 'Max Clip'], ['mixed', 'Mixed'], [null, 'Real']];
        let modeBtns = [], memBtns = [];
        const apply = () => {
            runtime._devBookOverride = mode ? buildFakeBookData(mode, memPage) : null;
            modeBtns.forEach((b, i) => setActive(b, modes[i][0] === mode));
            memBtns.forEach((b, i) => setActive(b, !!mode && i + 1 === memPage));
            if (dom.topPanel && dom.topPanel.classList.contains('viewing-library')) renderLibrary();
        };
        modeBtns = modes.map(([m, label]) => buildDevButton(label, () => {
            mode = m;
            apply();
        }, smallBtn));

        const pageBtns = [0, 1, 2, 3].map(p => buildDevButton(`Page ${p + 1}`, () => openPage(p), smallBtn));

        // Memories' row follows the book it repeats: these switch which page it lands on (starting
        // Max Clip if fake data is off) and jump there.
        memBtns = [1, 2, 3].map(p => buildDevButton(`Mem → P${p}`, () => {
            memPage = p;
            if (!mode) mode = 'clip';
            apply();
            openPage(p - 1);
        }, smallBtn));
        modeBtns.forEach((b, i) => setActive(b, modes[i][0] === mode));

        return buildDevSection('Books', [buildRow(modeBtns), buildRow(pageBtns), buildRow(memBtns)], 230);
    }

    // ─── Config section (sidebar notif, factory reset) ─────────────────────
    function buildConfigSection() {
        const notifBtn = buildDevButton('Toggle Sidebar Notif', () => {
            const ids = [SB_DESKTOP.id, SB_MOBILE.id, SB_FLYOUT.id];
            const anyActive = ids.some(id => {
                const el = document.getElementById(id);
                return el && el.classList.contains('bbgl-sb-notif');
            });
            syncChangelogNotif(!anyActive);
        }, smallBtn);
        const factoryResetBtn = buildDevButton('DEV: FACTORY RESET', () => {
            devFactoryReset();
        }, smallBtn + 'background:#5a1a1a;border-color:#833;');
        return buildDevSection('Config', [buildRow([notifBtn]), buildRow([factoryResetBtn])], 160);
    }

    async function devFactoryReset() {
        if (confirm("⚠️ DEV FACTORY RESET ⚠️\n\nThis will completely wipe ALL data, settings, API keys, and cache. The script will emulate a completely fresh install.\n\nProceed?")) {
            await DBManager.clearStorage();
            localStorage.clear();
            const devMode = sessionStorage.getItem(KEYS.DEV_MODE);
            sessionStorage.clear();
            if (devMode) sessionStorage.setItem(KEYS.DEV_MODE, devMode);
            window.location.reload();
        }
    }

    // ─── Console overlay ────────────────────────────────────────────────────
    const _bbglRedactConfig = () => {
        const c = { ...userConfig };
        if (c.apiKey) c.apiKey = c.apiKey.length >= 4 ? '***' + c.apiKey.slice(-4) : '***';
        return c;
    };

    function getBBGLState() {
        return {
            view: { ...viewState },
            calendar: { ...calendarState },
            runtime: {
                devMode: runtime.devMode,
                demoMode: runtime.demoMode,
                isSyncing: runtime.isSyncing,
                apiCallTotal: runtime.apiCallTotal,
                domObsArmed: runtime._domObsArmed === true
            }
        };
    }
    function getBBGLConfig() {
        return _bbglRedactConfig();
    }
    function getBBGLHistory() {
        const h = getActiveHistory();
        return h ? {
            meta: h.meta,
            today: h.today,
            historyCount: (h.history || []).length,
            firstDate: (h.history && h.history[0]) ? h.history[0].date : null,
            lastDate: (h.history && h.history.length) ? h.history[h.history.length - 1].date : null
        } : null;
    }
    function getBBGLCachePeek() {
        return {
            timeline: !!DataController._cache.timeline,
            slices: Object.keys(DataController._cache.slices || {}).length,
            dateMap: !!DataController._cache.dateMap,
            rateArr: !!DataController._cache.rateArr,
            stickerMap: !!DataController._cache.stickerMap,
            unlockedCount: DataController._cache.unlockedCount
        };
    }

    const BBGL_COMMANDS = [
        { label: 'State', command: 'BBGL.state()', description: 'View / calendar / runtime snapshot', run: getBBGLState },
        { label: 'Config', command: 'BBGL.config()', description: 'User config (API key redacted)', run: getBBGLConfig },
        { label: 'History', command: 'BBGL.history()', description: 'Active history meta + count + date range', run: getBBGLHistory },
        { label: 'Cache Peek', command: 'BBGL.cache.peek()', description: 'Which derived caches are populated', run: getBBGLCachePeek },
        { label: 'Help', command: 'BBGL.help()', description: 'This table', run: () => BBGL_COMMANDS.map(({ command, description }) => ({ command, description })) }
    ];

    window.BBGL = Object.freeze({
        version: SCRIPT_VERSION,
        state: getBBGLState,
        config: getBBGLConfig,
        history: getBBGLHistory,
        cache: Object.freeze({ peek: getBBGLCachePeek }),
        help: () => {
            console.table(BBGL_COMMANDS.map(({ command, description }) => ({ command, description }))
                .concat([{ command: 'devmode("on"|"off")', description: 'Toggle dev mode (enables Perf marks + dev UI)' }]));
        }
    });

    window.devmode = (val) => setDevMode(val === 'on' || val === true);

    let consoleOverlay = null;
    let consoleOutput = null;

    function buildConsoleOverlay() {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:100px;left:260px;background:#1a1a1a;border:1px solid #555;padding:10px;z-index:999999;border-radius:6px;display:none;flex-direction:column;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);width:280px;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'position:absolute;top:4px;right:4px;background:transparent;color:#aaa;border:none;cursor:pointer;font-size:12px;line-height:1;padding:2px 4px;';
        closeBtn.onclick = () => { overlay.style.display = 'none'; };
        overlay.appendChild(closeBtn);

        const title = document.createElement('div');
        title.textContent = 'BBGL Console';
        title.style.cssText = 'color:#fff;font-family:sans-serif;font-size:12px;font-weight:bold;text-align:center;margin-bottom:4px;cursor:move;user-select:none;';
        overlay.appendChild(title);
        makeDraggable(overlay, title);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
        BBGL_COMMANDS.forEach(cmd => {
            btnRow.appendChild(buildDevButton(cmd.label, () => {
                let result;
                try {
                    result = cmd.run();
                } catch (e) {
                    result = { error: String(e) };
                }
                consoleOutput.textContent = JSON.stringify(result, null, 2);
            }, 'flex:1 1 auto;font-size:11px;padding:6px 4px;'));
        });
        overlay.appendChild(btnRow);

        consoleOutput = document.createElement('pre');
        consoleOutput.style.cssText = 'color:#0f0;background:#000;border:1px solid #444;border-radius:4px;padding:6px;font-family:monospace;font-size:11px;max-height:240px;overflow:auto;margin:0;white-space:pre-wrap;word-break:break-all;';
        consoleOutput.textContent = '(click a command)';
        overlay.appendChild(consoleOutput);

        document.body.appendChild(overlay);
        return overlay;
    }

    // ─── Dragging ───────────────────────────────────────────────────────────
    // Drags `el` by `handle`, kept fully on screen. Pass storageKey to remember the spot this session.
    function makeDraggable(el, handle, storageKey) {
        const clamp = (left, top) => [
            Math.max(0, Math.min(window.innerWidth - el.offsetWidth, left)),
            Math.max(0, Math.min(window.innerHeight - Math.min(el.offsetHeight, 40), top))
        ];
        const place = (left, top) => {
            el.style.left = left + 'px';
            el.style.top = top + 'px';
        };
        if (storageKey) {
            try {
                const saved = JSON.parse(sessionStorage.getItem(storageKey));
                if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) place(saved.left, saved.top);
            } catch (e) { /* ignore bad saved position */ }
        }
        handle.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            const dx = e.clientX - rect.left;
            const dy = e.clientY - rect.top;
            const onMove = ev => place(...clamp(ev.clientX - dx, ev.clientY - dy));
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify({ left: parseInt(el.style.left, 10), top: parseInt(el.style.top, 10) }));
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // ─── Widget assembly ────────────────────────────────────────────────────
    function buildWidget() {
        const w = document.createElement('div');
        w.style.cssText = 'position:fixed;top:100px;left:20px;background:#222;border:1px solid #555;padding:10px 0;z-index:999999;border-radius:6px;display:none;flex-direction:column;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);max-width:calc(100vw - 20px);max-height:calc(100vh - 20px);overflow:auto;box-sizing:border-box;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = 'Turn off dev mode';
        closeBtn.style.cssText = 'position:absolute;top:4px;right:4px;background:transparent;color:#aaa;border:none;cursor:pointer;font-size:12px;line-height:1;padding:2px 4px;';
        closeBtn.onclick = () => setDevMode(false);
        w.appendChild(closeBtn);

        const title = document.createElement('div');
        title.textContent = '⠿ BBGL Dev';
        title.title = 'Drag to move';
        title.style.cssText = 'color:#fff;font-family:sans-serif;font-size:12px;font-weight:bold;text-align:center;margin-bottom:2px;cursor:move;user-select:none;';
        w.appendChild(title);
        w.appendChild(buildApiCounter());

        consoleOverlay = buildConsoleOverlay();
        const consoleBtn = buildDevButton('Console', () => {
            consoleOverlay.style.display = consoleOverlay.style.display === 'none' ? 'flex' : 'none';
        }, 'position:absolute;top:6px;left:8px;padding:3px 8px;font-size:11px;');
        w.appendChild(consoleBtn);

        const strip = buildRow([
            buildTriggersSection(),
            buildRankPreviewSection(),
            buildTitlePreviewSection(),
            buildPlaquePreviewSection(),
            buildBooksSection(),
            buildConfigSection()
        ], 'align-items:stretch;gap:0;');
        strip.firstChild.style.borderLeft = 'none';
        w.appendChild(strip);

        document.body.appendChild(w);
        makeDraggable(w, title, POS_KEY);
        return w;
    }

    function buildToggleButton() {
        const btn = document.createElement('button');
        btn.textContent = 'DEV';
        btn.title = 'Toggle BBGL dev mode';
        btn.style.cssText = 'position:fixed;top:8px;left:8px;background:#444;color:#fff;border:1px solid #666;padding:4px 8px;border-radius:4px;cursor:pointer;font-family:sans-serif;font-size:11px;font-weight:bold;z-index:999999;';
        btn.onclick = () => setDevMode(!runtime.devMode);
        document.body.appendChild(btn);
        return btn;
    }

    window.initDevTools = function initDevTools() {
        toggleBtn = buildToggleButton();
        widgetEl = buildWidget();
        renderDevToggleUI();
    };
})();
