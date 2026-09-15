
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

    function buildDevSection(title, children) {
        const section = document.createElement('div');
        section.style.cssText = 'display:flex;flex-direction:column;gap:6px;border-top:1px solid #444;padding-top:8px;';
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

    function setActive(btn, on) {
        btn.style.background = on ? ACTIVE_BG : '#444';
    }

    // ─── Level helpers ──────────────────────────────────────────────────────
    // The EXP total the bar is displaying right now (lags the real total while it animates).
    function shownLevelExp() {
        return runtime._lastLevelExp !== undefined ? runtime._lastLevelExp : getLiveLevelExp();
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

    // ─── API Counter section ───────────────────────────────────────────────
    function buildApiCounterSection() {
        const hud = document.createElement('div');
        hud.id = 'bbgl-api-hud';
        hud.style.cssText = 'color:#fff;font-family:sans-serif;font-size:12px;text-align:center;';
        hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
        return buildDevSection('API', [hud]);
    }

    // ─── Triggers section (XP/level testing) ───────────────────────────────
    function buildTriggersSection() {
        const trainInput = document.createElement('input');
        trainInput.type = 'number';
        trainInput.min = '10';
        trainInput.max = '1500';
        trainInput.step = '10';
        trainInput.value = '150';
        trainInput.style.cssText = inputStyle;
        const trainBtn = buildDevButton('Train (E)', () => {
            let e = parseInt(trainInput.value, 10);
            if (!Number.isFinite(e)) e = 150;
            e = Math.min(1500, Math.max(10, Math.round(e / 10) * 10));
            trainInput.value = e;
            const { hjDaySet } = DataController.getHappyJumpData();
            const isHJ = hjDaySet.has(Formatter.dateLogical());
            runtime.careerLevelExp = (runtime.careerLevelExp || 0) + computeDailyLevelExp(e, true, isHJ);
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        }, 'flex:1;');
        const trainRow = buildRow([trainInput, trainBtn], 'gap:6px;');

        const dayTierRow = buildRow([
            ['Happy Jump', () => computeDailyLevelExp(1000, true, true)],
            ['Green Day', () => computeDailyLevelExp(1000, true, false)],
            ['Gold Day', () => computeDailyLevelExp(1500, true, false)],
            ['Diamond Day', () => computeDailyLevelExp(2000, true, false)]
        ].map(([label, computeGain]) => buildDevButton(label, () => {
            runtime.careerLevelExp = (runtime.careerLevelExp || 0) + computeGain();
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        }, 'flex:1;padding:6px 2px;font-size:10px;')));

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
        // Level Up adds the EXP normally so the real level-up animation still plays.
        const upBtn = buildDevButton('Level ▲', () => {
            const p = calculateLevelProgress(getLiveLevelExp());
            runtime.careerLevelExp = (runtime.careerLevelExp || 0) + Math.max(1, p.expToNext - p.expInLevel);
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        }, smallBtn);
        const levelRow = buildRow([downBtn, levelInput, upBtn]);

        refreshers.push(() => {
            if (document.activeElement === levelInput) return;
            const p = shownProgress();
            levelInput.min = String(LEVEL_ATRO_START[p.atrophy]);
            levelInput.max = String(LEVEL_CAP);
            if (levelInput.value !== String(p.level)) levelInput.value = p.level;
        });

        return buildDevSection('Triggers', [trainRow, dayTierRow, levelRow]);
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
        const rankBtns = bands.map(b => {
            const btn = buildDevButton('', () => jumpToLevel(shownProgress().atrophy, b.start), 'text-align:left;padding:5px 8px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;');
            return btn;
        });
        const capBtn = buildDevButton('', () => jumpToLevel(shownProgress().atrophy, LEVEL_CAP), 'text-align:left;padding:5px 8px;font-size:11px;');

        refreshers.push(() => {
            const p = shownProgress();
            atrophyBtns.forEach((btn, a) => setActive(btn, a === p.atrophy));
            rankBtns.forEach((btn, i) => {
                const b = bands[i];
                btn.textContent = `${b.start}–${b.max} · ${LEVEL_TITLE_BANDS[i].titles[p.atrophy]}`;
                setActive(btn, p.level >= (i === 0 ? -Infinity : b.start) && p.level <= b.max);
            });
            capBtn.textContent = p.atrophy < 2 ? `100 · Finish Atrophy ${p.atrophy}` : '100 · Fully Bricked';
            setActive(capBtn, isFullyBricked(p.atrophy, p.level));
        });

        return buildDevSection('Rank Preview', [atrophyRow, ...rankBtns, capBtn]);
    }

    // ─── Title Preview section (stat-title slot testing) ───────────────────
    // Sets runtime._devTitleOverride, read by getLiveStatTitleSelection() (07-section-vi-ui.js) behind
    // runtime.devMode. Each slot picks its own tier, the only way to preview a mismatched pair like
    // a Tier 1 word on a Tier 10 word.
    function buildTitlePreviewSection() {
        const tierCount = STAT_TITLE_THRESHOLDS.length;
        const statOptions = STAT_KEYS.map(k => [k, achStatFull(k)]);
        const tierOptions = STAT_TITLE_THRESHOLDS.map((_, i) => [String(i), `T${i + 1}`]);
        const tierSelectStyle = 'flex:0 0 52px;';

        function buildSlot(label, statIndex) {
            const tag = document.createElement('span');
            tag.textContent = label;
            tag.style.cssText = 'flex:0 0 26px;color:#aaa;font-family:sans-serif;font-size:10px;font-weight:bold;';
            const stat = buildSelect(statOptions);
            stat.selectedIndex = statIndex;
            const tier = buildSelect(tierOptions);
            tier.style.cssText += tierSelectStyle;
            return { stat, tier, row: buildRow([tag, stat, tier]) };
        }
        const slot1 = buildSlot('1st', 0);
        const slot2 = buildSlot('2nd', 1);

        const status = document.createElement('div');
        status.style.cssText = 'font-family:sans-serif;font-size:10px;text-align:center;';

        function refreshTitleUI() {
            if (typeof refreshStatTitleUI === 'function') refreshStatTitleUI();
        }
        function apply() {
            runtime._devTitleOverride = {
                primary: { stat: slot1.stat.value, phase: parseInt(slot1.tier.value, 10) },
                secondary: { stat: slot2.stat.value, phase: parseInt(slot2.tier.value, 10) }
            };
            refreshTitleUI();
            renderStatus();
        }
        function renderStatus() {
            const on = !!runtime._devTitleOverride;
            status.textContent = on ? 'Override ON' : 'Override OFF (real titles)';
            status.style.color = on ? '#ce93d8' : '#777';
        }
        [slot1.stat, slot1.tier, slot2.stat, slot2.tier].forEach(sel => sel.addEventListener('change', apply));

        const setTiers = t => {
            slot1.tier.value = slot2.tier.value = String(t);
            apply();
        };
        const presetRow = buildRow([
            buildDevButton('All T1', () => setTiers(0), smallBtn),
            buildDevButton(`All T${Math.ceil(tierCount / 2)}`, () => setTiers(Math.ceil(tierCount / 2) - 1), smallBtn),
            buildDevButton(`All T${tierCount}`, () => setTiers(tierCount - 1), smallBtn)
        ]);
        const actionRow = buildRow([
            buildDevButton('Swap', () => {
                [slot1.stat.value, slot2.stat.value] = [slot2.stat.value, slot1.stat.value];
                [slot1.tier.value, slot2.tier.value] = [slot2.tier.value, slot1.tier.value];
                apply();
            }, smallBtn),
            buildDevButton('Random', () => {
                const i = Math.floor(Math.random() * STAT_KEYS.length);
                const j = (i + 1 + Math.floor(Math.random() * (STAT_KEYS.length - 1))) % STAT_KEYS.length;
                slot1.stat.selectedIndex = i;
                slot2.stat.selectedIndex = j;
                slot1.tier.selectedIndex = Math.floor(Math.random() * tierCount);
                slot2.tier.selectedIndex = Math.floor(Math.random() * tierCount);
                apply();
            }, smallBtn),
            buildDevButton('Clear', () => {
                runtime._devTitleOverride = null;
                refreshTitleUI();
                renderStatus();
            }, smallBtn + 'background:#5a1a1a;border-color:#833;')
        ]);
        renderStatus();

        return buildDevSection('Title Preview', [slot1.row, slot2.row, presetRow, actionRow, status]);
    }

    // ─── Books section (Library layout testing) ────────────────────────────
    // Sets runtime._devBookOverride, returned by DataController.getBookData() behind runtime.devMode,
    // in the same shape computeBookData() produces.
    //   clip  — every book read with the longest realistic numbers, for overflow/clipping
    //   mixed — a spread of read/reading/unread with approx/partial flags, for state styling
    function buildFakeBookData(mode) {
        const HUGE = 987654321987.65;
        const DAY = 86400;
        const now = Math.floor(Date.now() / 1000);
        const val = i => mode === 'clip' ? HUGE : Math.round(5000 + ((i * 7919) % 97) * 51337);
        const books = {};
        Object.keys(BOOK_META).map(Number).forEach((id, i) => {
            const meta = BOOK_META[id];
            const state = mode === 'clip' ? 'read' : ['read', 'reading', 'unread'][i % 3];
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
            } else if (meta.training && meta.training !== 'repeat') {
                entry.stats = { str: v, def: v, spd: v, dex: v, tot: r2(v * 4) };
            }
            if (mode === 'mixed') {
                entry.uncertain = i % 4 === 1;
                entry.partial = i % 5 === 2;
            }
            books[id] = entry;
        });
        books[MEMORIES_BOOK] = { state: 'read', start: now - 20 * DAY, end: now + 11 * DAY };
        const repeats = TRAINING_BOOKS.find(id => ['energy', 'happy'].includes(BOOK_META[id].training) || (BOOK_META[id].training === 'gym' && !BOOK_META[id].stat));
        const mv = val(3);
        const memories = repeats == null ? null : {
            repeats,
            start: now - 20 * DAY,
            end: now + 11 * DAY,
            partial: false,
            stats: { str: mv, def: mv, spd: mv, dex: mv, tot: r2(mv * 4) }
        };
        return { books, memories };
    }

    function buildBooksSection() {
        let mode = null;
        const rerender = () => {
            if (dom.topPanel && dom.topPanel.classList.contains('viewing-library')) renderLibrary();
        };
        const modes = [['clip', 'Max Clip'], ['mixed', 'Mixed'], [null, 'Real']];
        const modeBtns = modes.map(([m, label]) => buildDevButton(label, () => {
            mode = m;
            runtime._devBookOverride = m ? buildFakeBookData(m) : null;
            modeBtns.forEach((b, i) => setActive(b, modes[i][0] === mode));
            rerender();
        }, smallBtn));
        setActive(modeBtns[2], true);

        const pageBtns = [0, 1].map(p => buildDevButton(`Page ${p + 1}`, () => {
            if (!dom.topPanel || !dom.topPanel.classList.contains('viewing-library')) toggleLibraryView();
            gotoLibraryPage(p);
        }, smallBtn));

        return buildDevSection('Books', [buildRow(modeBtns), buildRow(pageBtns)]);
    }

    // ─── Sidebar section ────────────────────────────────────────────────────
    function buildSidebarSection() {
        const notifBtn = buildDevButton('Toggle Sidebar Notif', () => {
            const ids = [SB_DESKTOP.id, SB_MOBILE.id, SB_FLYOUT.id];
            const anyActive = ids.some(id => {
                const el = document.getElementById(id);
                return el && el.classList.contains('bbgl-sb-notif');
            });
            syncChangelogNotif(!anyActive);
        });
        return buildDevSection('Sidebar', [notifBtn]);
    }

    // ─── Reset section ──────────────────────────────────────────────────────
    function buildResetSection() {
        const factoryResetBtn = buildDevButton('DEV: FACTORY RESET', () => {
            devFactoryReset();
        }, 'background:#5a1a1a;border-color:#833;');
        return buildDevSection('Reset', [factoryResetBtn]);
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
        w.style.cssText = 'position:fixed;top:100px;left:20px;background:#222;border:1px solid #555;padding:10px;z-index:999999;border-radius:6px;display:none;flex-direction:column;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,0.5);width:230px;max-height:calc(100vh - 20px);overflow-y:auto;box-sizing:border-box;';

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

        w.appendChild(buildApiCounterSection());
        w.appendChild(buildTriggersSection());
        w.appendChild(buildRankPreviewSection());
        w.appendChild(buildTitlePreviewSection());
        w.appendChild(buildBooksSection());
        w.appendChild(buildSidebarSection());
        w.appendChild(buildResetSection());

        consoleOverlay = buildConsoleOverlay();
        const consoleBtn = buildDevButton('Console', () => {
            consoleOverlay.style.display = consoleOverlay.style.display === 'none' ? 'flex' : 'none';
        }, 'margin-top:4px;');
        w.appendChild(consoleBtn);

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
