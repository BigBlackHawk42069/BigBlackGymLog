// ==UserScript==
// @name         Big Black Gym Log Teste
// @namespace    http://tampermonkey.net/
// @version      0.9.58
// @description  A high-fidelity, gamified stat tracker built to integrate seamlessly with Torn's native UI.
// @author       BigBlackHawk [3550896]
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/BigBlackHawk42069/BigBlackGymLog/refs/heads/DevBranch/Dev/BBGLDev.js
// @downloadURL  https://raw.githubusercontent.com/BigBlackHawk42069/BigBlackGymLog/refs/heads/DevBranch/Dev/BBGLDev.js
// ==/UserScript==

(function() {
    'use strict';
    if (window.__BBGL_LOADED__) return;
    window.__BBGL_LOADED__ = true;

    function isDevMode() {
        return typeof runtime !== 'undefined' && runtime && runtime.devMode;
    }

    /**
     *  [SECTION I] THE DIET PLAN (Constants & State)
     *  ========================================================================
     *  No substitutions. No cheat days. This follows the plan
     *  so that you don't have to.
     */

    const SCRIPT_VERSION = '0.9.58';
    const Log = {
        _bootShown: false,
        _badge: ['%c BBGL %c', 'background:#6a1b9a;color:#fff;font-weight:700;border-radius:3px 0 0 3px;padding:2px 6px;', 'color:#999;'],
        _isDev: isDevMode,
        boot() {
            if (this._bootShown) return;
            this._bootShown = true;
            console.log(...this._badge, `v${SCRIPT_VERSION} booted`);
        },
        info(...a) {
            console.log(...this._badge, ...a);
        },
        warn(...a) {
            console.warn(...this._badge, ...a);
        },
        error(...a) {
            console.error(...this._badge, ...a);
        },
        debug(...a) {
            if (!this._isDev()) return;
            console.log(...this._badge, '[debug]', ...a);
        },
        group(label, fn) {
            if (!this._isDev()) {
                fn();
                return;
            }
            console.groupCollapsed(...this._badge, label);
            try {
                fn();
            } finally {
                console.groupEnd();
            }
        }
    };
    const Perf = {
        _enabled: isDevMode,
        mark(n) {
            if (!this._enabled()) return;
            try {
                performance.mark('bbgl:' + n);
            } catch (e) {}
        },
        start(n) {
            this.mark(n + ':start');
        },
        end(n) {
            if (!this._enabled()) return;
            try {
                performance.mark('bbgl:' + n + ':end');
                performance.measure('bbgl:' + n, 'bbgl:' + n + ':start', 'bbgl:' + n + ':end');
            } catch (e) {}
        },
        async wrapAsync(n, fn) {
            this.start(n);
            try {
                return await fn();
            } finally {
                this.end(n);
            }
        },
        wrap(n, fn) {
            this.start(n);
            try {
                return fn();
            } finally {
                this.end(n);
            }
        }
    };
    const KEYS = {
        STATE: 'bbgl_view_state_v1',
        CONFIG: 'bbgl_config_v1',
        SESSION: 'bbgl_trained_flag',
        LAST_SYNC: 'bbgl_last_data_sync_v1',
        BS_SYNC: 'bbgl_bs_last_sync_v1',
        SESSION_CACHE: 'bbgl_session_cache_v1',
        DEMO: 'bbgl_demo_mode',
        SB_NOTIF: 'bbgl_sb_notif_seen',
        DEV_MODE: 'bbgl_dev_mode',
        CHANGELOG_VER: 'bbgl_changelog_seen_ver',
        CHANGELOG_NOTIF: 'bbgl_changelog_notif'
    };
    // [TEMP — delete before full release]
    const REQUIRED_CONFIG_VERSION = 1;
    const BASE_DOCS_URL = 'https://raw.githubusercontent.com/BigBlackHawk42069/BBGLTeste/DeepScan/UserDocs/';
    const CONSTANTS = {
        MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        MONTHS_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        COLORS: {
            STR: '#3264c6',
            DEF: '#dc3912',
            SPD: '#ff9900',
            DEX: '#109618',
            TOT: '#9d039d',
            GAINS: '#69f0ae'
        }
    };
    const GAME = {
        WEEKLY_GOAL: 1000,
        POINTS_GREEN: 200,
        POINTS_GOLD: 300,
        POINTS_DIAMOND: 500,
        POINTS_HJ_GREEN: 500,
        POINTS_HJ_GOLD: 500,
        POINTS_HJ_DIAMOND: 500,
        GOLD_WEEK_JUMPS: 3,
        DIAMOND_WEEK_JUMPS: 4,
        HJ_WINDOW_SECONDS: 300,
        STAT_MAP: {
            5300: 'strength',
            5301: 'defense',
            5302: 'speed',
            5303: 'dexterity'
        }
    };
    // Item-use activity-log codes we track alongside gym training. Single source of truth for the
    // log id -> display label/group/metric mapping. `group` (energy|stat|happy) buckets each code for
    // the grouped export totals and the happy-jump page. The per-item metric flag says what extra
    // datum to capture beyond a plain count:
    //   energy:true -> data.energy_increased (energy cans)
    //   happy:true  -> data.happy_increased  (happy items)
    //   stat:true   -> data.<stat>_increased (stat enhancers; stat auto-detected)
    // Quantity-only codes carry no flag. ITEM_LOGS is derived so the API normalizer, the request
    // groups, the export totals, and the ledger counters all agree.
    const ITEM_LOG_META = {
        8981: { label: 'Green Egg Used', group: 'energy', short: 'Egg' },
        2290: { label: 'Xanax Taken', group: 'energy', short: 'Xans' },
        2230: { label: 'LSD Taken', group: 'energy', short: 'LSD' },
        2040: { label: 'Energy Can Used', group: 'energy', energy: true, short: 'Cans' },
        2190: { label: 'Hotel Coupon Used', group: 'energy', short: 'FHC' },
        4900: { label: 'Points Refill Used', group: 'energy', short: 'Refill' },
        2120: { label: 'Parachute Used', group: 'stat', stat: true },
        2130: { label: 'Skateboard Used', group: 'stat', stat: true },
        2140: { label: 'Boxing Gloves Used', group: 'stat', stat: true },
        2150: { label: 'Dumbbells Used', group: 'stat', stat: true },
        2020: { label: 'Candy Used', group: 'happy', happy: true },
        2180: { label: 'Erotic DVD Used', group: 'happy', happy: true },
        2210: { label: 'Ecstasy Taken', group: 'happy', happy: true },
        8983: { label: 'Yellow Egg Used', group: 'happy', happy: true }
    };
    const ITEM_GROUP_LABELS = { energy: 'Energy Items', stat: 'Stat Items', happy: 'Happy Items' };
    const ITEM_LOGS = Object.keys(ITEM_LOG_META).map(Number);
    const itemLogsByGroup = g => ITEM_LOGS.filter(id => ITEM_LOG_META[id].group === g);
    // Gym training log ids, one per stat.
    const TRAIN_LOGS = [5300, 5301, 5302, 5303];
    // Per-group code lists for the live request architecture. battlestats is always fetched on its
    // own call (it can't share a request with `log`), and any one `log=` call may carry at most 10
    // log types — so items are split across the train-click call (energy) and the heartbeat /
    // reconciliation calls (stat + happy). Backfill ignores these and paginates one type at a time.
    const ENERGY_LOGS = itemLogsByGroup('energy'); // 6
    const STAT_LOGS = itemLogsByGroup('stat');     // 4
    const HAPPY_LOGS = itemLogsByGroup('happy');   // 4
    const TRAIN_ENERGY_PARAM = [...TRAIN_LOGS, ...ENERGY_LOGS].join(','); // reconcile call (10)
    const STAT_HAPPY_PARAM = [...STAT_LOGS, ...HAPPY_LOGS].join(',');     // reconcile call (8)
    const ENERGY_PARAM = ENERGY_LOGS.join(',');                          // train-click rider (6)
    const XANAX_LOG = 2290,
        ECAN_LOG = 2040;
    // Overlap buffer (seconds) subtracted from a group's last-success time to form its `from=` bound.
    // Comfortably exceeds the 2h heartbeat so a single missed beat still re-covers the gap; dedup
    // makes the overlap harmless.
    const SYNC_FROM_BUFFER = 3 * 3600;
    // Backfill Logs: a resumable backward scan that walks the activity log to the beginning of
    // time, moving the origin floor back as it verifies complete days. Torn caps cloud-data
    // reads at 50,000 rows/day per category (the activity log is one category, shared across
    // every log type and every script the user runs). SOFT_CAP leaves comfortable headroom for
    // that; once crossed, the scan keeps paging only to finish the current day across every
    // frontier (so the budget spent yields a fully complete, visible day rather than a hidden
    // partial one), bounded by HARD_CAP as an absolute failsafe against a pathologically dense
    // single day. The cooldown is set slightly over 24h so the rolling-24h window is guaranteed
    // clear on resume.
    const BACKFILL = {
        SOFT_CAP: 30000,   // stop *starting* new days once crossed
        HARD_CAP: 32000,   // absolute failsafe, normally never reached, keeps us < 50k
        COOLDOWN_MS: Math.round(24.2 * 3600 * 1000),
        THROTTLE_MS: 700
    };
    // Gyms ranked by effectiveness per stat (ascending). A nested array marks a group of gyms
    // with identical gym points for that stat — switching between them gives no benefit, so
    // BestGym treats a whole group as one rank and only moves to a strictly higher group.
    const GYM_TIERS = {
        str: [1, 2, 3, 4, [5, 6], 7, 8, 10, 9, [11, 12, 13], 14, [16, 17], [19, 20], 18, [22, 23], 21, 24, 26, 27, 31, 32],
        spd: [1, 2, [3, 4], [5, 6], 8, 9, [10, 11], 12, 13, 15, 14, 16, 17, [18, 20, 21], [19, 22], 23, 24, 26, 29, 31, 32],
        def: [1, 2, 3, 4, 5, 6, 7, [8, 9], [10, 13], 12, 11, [14, 15], 16, 18, [17, 19, 21], 20, [22, 23], 24, 25, 28, 31, 32],
        dex: [1, 2, 3, 5, 7, 6, 8, 9, 10, 11, 12, [13, 14], 15, 16, [17, 18], [21, 22], [19, 23], 20, 24, 25, 30, 31, 32]
    };
    const BS_STAT_ROWS = [{
        api: 'strength',
        abbr: 'str'
    }, {
        api: 'defense',
        abbr: 'def'
    }, {
        api: 'speed',
        abbr: 'spd'
    }, {
        api: 'dexterity',
        abbr: 'dex'
    }];
    const LAYOUT = {
        LIFT_HEIGHT: 43,
        BASE_RIGHT: 5
    };
    const PAGE_TITLES = ["Sweat Equity", "Casino Collection", "Frequent Felon Passport", "Memories of Misdemeanors", "Postcards from the Frontline"];
    const _d = s => atob(s);
    const CUSTOM_STICKERS = [
        //Sweat Equity
        {
            id: 1,
            name: "Just Checking the Mirror",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vanN0LWNoay1taXJyci5wbmc=')
        }, {
            id: 2,
            name: "Up, Down, Repeat",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdXAtZG4tcnB0LnBuZw==')
        }, {
            id: 3,
            name: "Flat Bench Therapy",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vZmx0LWJuY2gtdGhycHkucG5n')
        }, {
            id: 4,
            name: "Bring Home the Feed",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vYnJuZy1obS1mZWVkLnBuZw==')
        }, {
            id: 5,
            name: "Never Skip Leg Day",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vbnZyLXNrcC1sZWcucG5n')
        }, {
            id: 6,
            name: "Tire Rotation",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdGlyZS1yb3RuLnBuZw==')
        }, {
            id: 7,
            name: "Back End Engagement",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vYmNrLWVuZC1lbmdtdC5wbmc=')
        }, {
            id: 8,
            name: "The Upside of Exercise",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdXBzZC1leHJjc2UucG5n')
        }, {
            id: 9,
            name: "Shellshock Stretches",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vc2hsc2hrLXN0cmNoLnBuZw==')
        }, {
            id: 10,
            name: "Certified Cardio",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vY3J0ZmQtY3JkaW8ucG5n')
        },
        //Casino Collection
        {
            id: 11,
            name: "Just One More Spin",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vanN0LW9uZS1zcG4ucG5n')
        }, {
            id: 12,
            name: "Bingo! I Think...",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vYmluZ28taS10aG5rLnBuZw==')
        }, {
            id: 13,
            name: "Lucky Shot",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vbGNreS1zaHQucG5n')
        }, {
            id: 14,
            name: "Holy Craps",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vaG9seS1jcnBzLnBuZw==')
        }, {
            id: 15,
            name: "Tilted in My Favor",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vdGx0ZC1teS1mdnIucG5n')
        }, {
            id: 16,
            name: "Choose Wisely",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vY2hzZS13c2x5LnBuZw==')
        }, {
            id: 17,
            name: "Hit Me",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vaGl0LW1lLnBuZw==')
        }, {
            id: 18,
            name: "Dead Men's Hand",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vZGVhZC1tZW5zLnBuZw==')
        }, {
            id: 19,
            name: "Trigger Warning",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vdHJnci13cm5nLnBuZw==')
        }, {
            id: 20,
            name: "Leslie's Sick Day",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vbHNscy1zY2stZHkucG5n')
        }
    ];
    let runtime = {
        isClosing: false,
        isViewAnimating: false,
        isSyncing: false,
        backfilling: false,
        apiCallTotal: 0,
        resizeObserver: null,
        stickerSlots: [],
        stickerData: [],
        currentStickerPage: 0,
        viewerLoopId: null,
        viewerRotation: 0,
        viewerSpeed: 0.3,
        currentOpenedItemId: null,
        lastFrameTime: 0,
        returnView: null,
        layoutRafId: null,
        currentStats: null,
        demoMode: false,
        demoHistory: null,
        demoEnteredFrom: null,
        devMode: false,
        _achCache: null,
        _achPage: 0,
        wasVersionWiped: false
    };
    const _TAB_ID = Math.random().toString(36).slice(2);
    let _historyCache = null;
    const _refreshClickLog = [];
    const dom = {};
    let _lastButtonLocation = null;
    let _topCeilingCache = null,
        _topCeilingTs = 0;
    let _layoutObservers = [];
    let graphState = {
        activeStats: ['str', 'spd'],
        mode: 'values',
        isDragging: false,
        lockedStat: null,
        handlers: {
            scrub: null,
            start: null,
            end: null
        }
    };
    let viewState = {
        expanded: false,
        isOpen: false,
        isTall: false,
        subView: 'ledger',
        graphMode: 'values',
        calYear: null,
        calMonth: null,
        activeViewLabel: null,
        currentStickerPage: 0,
        achPage: 0
    };
    let calendarState = {
        year: new Date().getUTCFullYear(),
        month: new Date().getUTCMonth(),
        visibleCells: [],
        selectedLabel: null,
        selectedData: null
    };
    let userConfig = {
        apiKey: '',
        dayStartMode: 'utc',
        weekStartMode: 'mon',
        animations: true,
        buttonLocation: 'both',
        ratesEnabled: true,
        bestGym: true,
        bestGymSpecialist: true,
        bestGymUnpurchased: true,
        drugTracker: 'xanax', // ledger primary-drug counter: 'xanax' (2290) or 'lsd' (2230)
        privacyAgreed: '',
        configVersion: 0
    };
    const ALLOWED_CONFIG_KEYS = Object.keys(userConfig);
    const r2 = (v) => Math.round(v * 100) / 100;
    const ZERO_BREAKDOWN = Object.freeze({
        str: 0,
        def: 0,
        spd: 0,
        dex: 0
    });
    const TimeManager = {
        useLocal() {
            return userConfig.dayStartMode === 'local';
        },
        year(d) {
            return this.useLocal() ? d.getFullYear() : d.getUTCFullYear();
        },
        month(d) {
            return this.useLocal() ? d.getMonth() : d.getUTCMonth();
        },
        date(d) {
            return this.useLocal() ? d.getDate() : d.getUTCDate();
        },
        hours(d) {
            return this.useLocal() ? d.getHours() : d.getUTCHours();
        },
        minutes(d) {
            return this.useLocal() ? d.getMinutes() : d.getUTCMinutes();
        },
        now() {
            const d = new Date();
            return {
                year: this.year(d),
                month: this.month(d),
                date: this.date(d)
            };
        },
        dayStartTs(dateStr) {
            const [y, m, d] = dateStr.split('-');
            return this.useLocal() ? new Date(+y, +m - 1, +d).getTime() : Formatter.parse(dateStr).getTime();
        }
    };
    const rawState = localStorage.getItem(KEYS.STATE);
    if (rawState) {
        try {
            const saved = JSON.parse(rawState);
            viewState = {
                ...viewState,
                ...saved
            };
            graphState.mode = (viewState.graphMode === 'gains' ? 'values' : viewState.graphMode) || 'values';
            graphState.activeStats = viewState.graphStats || ['str', 'spd'];
            if (viewState.calYear) calendarState.year = viewState.calYear;
            if (viewState.calMonth !== null && viewState.calMonth !== undefined) calendarState.month = viewState.calMonth;
        } catch (e) {
            Log.warn('State load error', e);
        }
    }
    const rawConfig = localStorage.getItem(KEYS.CONFIG);
    if (rawConfig) {
        try {
            const parsed = JSON.parse(rawConfig);
            ALLOWED_CONFIG_KEYS.forEach(k => {
                if (parsed[k] !== undefined) userConfig[k] = parsed[k];
            });
        } catch (e) {}
    }
    if (localStorage.getItem(KEYS.DEMO) === '1') runtime.demoMode = true;
    if (sessionStorage.getItem(KEYS.DEV_MODE) === 'true') runtime.devMode = true;
    if (!viewState.calYear) {
        const _n = TimeManager.now();
        calendarState.year = _n.year;
        calendarState.month = _n.month;
    }

    /**
     *  [SECTION II] THE SUPPLEMENTS (Utility Belt)
     *  ========================================================================
     *  Your pre-workout, Xanax, and Creatine all in one section.
     */

    const Formatter = {
        number(n, d = 0) {
            return (n === undefined || n === null) ? '0' : n.toLocaleString('en-US', {
                minimumFractionDigits: d,
                maximumFractionDigits: d
            });
        },
        abbr(n, d = 1, upper = false, strip = false) {
            if (!n && n !== 0) return '0';
            const abs = Math.abs(n);
            if (abs < 1000) return Math.trunc(n).toString();
            const tiers = [
                [1e15, 'q'],
                [1e12, 't'],
                [1e9, 'b'],
                [1e6, 'm'],
                [1e3, 'k']
            ];
            for (const [mag, suffix] of tiers) {
                if (abs >= mag) {
                    let dec = typeof d === 'function' ? d(mag, abs) : d;
                    let s = (n / mag).toFixed(dec);
                    if (strip) s = parseFloat(s).toString();
                    return s + (upper ? suffix.toUpperCase() : suffix);
                }
            }
            return Math.floor(n).toString();
        },
        rate(n, exp = false) {
            if (!n && n !== 0) return '0';
            if (n < 1000) return this.number(n, exp ? 2 : 1);
            if (exp) return this.number(Math.floor(n), 0);
            return this.abbr(n, 1);
        },
        achGain(v) {
            const a = Math.abs(v);
            if (a < 100) return this.number(v, 1);
            if (a < 1000) return this.number(v, 0);
            return this.abbr(v, (m, abs) => m === 1e9 ? 4 : m === 1e6 ? 3 : (abs >= 1e4 ? 2 : 1), true, false);
        },
        ratePct(v) {
            if (Math.abs(v) < 1000) return this.number(v, 0);
            return this.abbr(v, 2, true, true);
        },
        dual(val, r = false) {
            let std, exp;
            if (r) {
                std = this.rate(val, false);
                exp = this.rate(val, true);
            } else {
                std = Math.abs(val) > 9999 ? this.abbr(val) : this.number(val);
                exp = (Math.abs(val) >= 1e9) ? this.abbr(val, 4) : this.number(val);
            }
            return `<span class="view-std">${std}</span><span class="view-exp">${exp}</span>`;
        },
        axis(n) {
            if (n === 0) return '0';
            if (Math.abs(n) < 1000) return (Math.round(n * 10) / 10).toString();
            return this.abbr(n, 1, false, true);
        },
        parse(s) {
            if (!s) return new Date();
            return new Date(s.includes('T') ? s : s + 'T00:00:00Z');
        },
        dateISO(y, m, d) {
            return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        },
        dateLogical(ts = null) {
            const d = ts ? new Date(ts) : new Date();
            return this.dateISO(TimeManager.year(d), TimeManager.month(d), TimeManager.date(d));
        },
        datePretty(s) {
            if (!s || s.includes('Summary')) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
        },
        dateMonthDay(s) {
            if (!s) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
        },
        dateFull(s) {
            if (!s || s.includes('Summary')) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
        }
    };
    const TooltipController = {
        el: null,
        arrow: null,
        currentTarget: null,
        init() {
            if (this.el) return;
            this.el = document.createElement('div');
            this.el.id = 'bbgl-tooltip';
            this.arrow = document.createElement('div');
            this.arrow.id = 'bbgl-tooltip-arrow';
            this.el.appendChild(this.arrow);
            document.body.appendChild(this.el);
        },
        hide() {
            if (this.el) {
                this.el.style.display = 'none';
                this.currentTarget = null;
            }
        },
        show(html, rect) {
            if (!this.el) this.init();
            this.el.innerHTML = html;
            this.el.appendChild(this.arrow);
            this.el.style.display = 'block';
            this.el.className = '';
            const ttRect = this.el.getBoundingClientRect(),
                pad = 12,
                view = {
                    w: window.innerWidth,
                    h: window.innerHeight
                };
            let side = 'top';
            const fitsTop = (rect.top - ttRect.height - pad >= 0),
                fitsBot = (rect.bottom + ttRect.height + pad <= view.h);
            if (fitsTop) side = 'top';
            else if (fitsBot) side = 'bottom';
            else side = 'left';
            let x = 0,
                y = 0;
            if (side === 'top') {
                x = rect.left + (rect.width / 2) - (ttRect.width / 2);
                y = rect.top - ttRect.height - pad;
            } else if (side === 'bottom') {
                x = rect.left + (rect.width / 2) - (ttRect.width / 2);
                y = rect.bottom + pad;
            } else {
                x = rect.left - ttRect.width - pad;
                y = rect.top + (rect.height / 2) - (ttRect.height / 2);
            }
            if (x < 5) x = 5;
            if (x + ttRect.width > view.w - 5) x = view.w - ttRect.width - 5;
            if (y < 5) y = 5;
            if (y + ttRect.height > view.h - 5) y = view.h - ttRect.height - 5;
            this.el.style.left = x + 'px';
            this.el.style.top = y + 'px';
            this.el.classList.add('pos-' + side);
            this.arrow.style.marginLeft = '';
            this.arrow.style.marginTop = '';
        },
        resolve(target) {
            return target.closest('[data-tooltip], [data-tooltip-html]');
        },
        handleHover(e) {
            const t = this.resolve(e.target);
            if (!t) {
                if (this.currentTarget) this.hide();
                return;
            }
            if (this.currentTarget === t) return;
            this.currentTarget = t;
            const h = t.getAttribute('data-tooltip-html'),
                txt = t.getAttribute('data-tooltip');
            if (h) this.show(h, t.getBoundingClientRect());
            else if (txt) this.show('<div style="text-align:center; color:#ddd;">' + txt + '</div>', t.getBoundingClientRect());
            else this.hide();
        }
    };

    function resetRefreshBtn(btn) {
        if (!btn) return;
        if (btn.dataset.timerId) {
            clearTimeout(btn.dataset.timerId);
            delete btn.dataset.timerId;
        }
        btn.style.color = "";
        btn.style.opacity = "1";
        if (btn.dataset.originalText) {
            btn.innerText = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
    }

    function checkRefreshCooldown(btn) {
        const now = Date.now();
        while (_refreshClickLog.length > 0 && now - _refreshClickLog[0] > 60000) _refreshClickLog.shift();
        _refreshClickLog.push(now);
        if (_refreshClickLog.length <= 4) return false;
        btn.disabled = true;
        btn.style.opacity = '0.45';
        btn.style.color = '#666';
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
        let remaining = Math.ceil((60000 - (now - _refreshClickLog[0])) / 1000);
        const updateTooltip = () => {
            btn.setAttribute('data-tooltip', TOOLTIPS.REFRESH_COOLDOWN(remaining));
        };
        updateTooltip();
        const interval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(interval);
                btn.disabled = false;
                btn.style.opacity = '';
                btn.style.color = '';
                btn.removeAttribute('data-tooltip');
                if (btn.dataset.originalText) {
                    btn.innerText = btn.dataset.originalText;
                    delete btn.dataset.originalText;
                }
                _refreshClickLog.length = 0;
            } else {
                updateTooltip();
            }
        }, 1000);
        return true;
    }

    function incrementApiCount(n) {
        runtime.apiCallTotal += n;
        const hud = dom.apiHud;
        if (hud) hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
    }

    function saveViewState() {
        if (runtime.isSyncing) return;
        localStorage.setItem(KEYS.STATE, JSON.stringify(viewState));
    }

    function saveConfig() {
        const c = {};
        ALLOWED_CONFIG_KEYS.forEach(k => {
            if (userConfig[k] !== undefined) c[k] = userConfig[k];
        });
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(c));
    }

    function getStickerState(id) {
        const states = (_historyCache && _historyCache.meta && _historyCache.meta.stickers) ? _historyCache.meta.stickers : {};
        return states[String(id)] || '--';
    }
    async function persistStickerCleared(id) {
        try {
            const stored = await DBManager.getStorage();
            if (!stored) return;
            if (!stored.meta) stored.meta = {};
            if (!stored.meta.stickers) stored.meta.stickers = {};
            const key = String(id);
            const cachedState = (_historyCache && _historyCache.meta && _historyCache.meta.stickers && _historyCache.meta.stickers[key]) || '--';
            const newState = cachedState[0] + '+';
            stored.meta.stickers[key] = newState;
            await DBManager.setStorage(stored);
            if (_historyCache) {
                if (!_historyCache.meta) _historyCache.meta = {};
                if (!_historyCache.meta.stickers) _historyCache.meta.stickers = {};
                _historyCache.meta.stickers[key] = newState;
            }
        } catch (e) {
            Log.warn('Failed to persist sticker cleared state', e);
        }
    }

    function getISOWeek(s) {
        const d = Formatter.parse(s),
            date = new Date(d.valueOf());
        date.setUTCDate(date.getUTCDate() + 3 - (date.getUTCDay() + 6) % 7);
        const w1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
        return 1 + Math.round(((date.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getUTCDay() + 6) % 7) / 7);
    }

    function computeWeekCompletion(days, hjDaySet = null, hjCount = 0) {
        let totGreen = 0,
            totGold = 0,
            totDiamond = 0;
            
        const jumpGold = hjCount === GAME.GOLD_WEEK_JUMPS;
        const jumpDiamond = hjCount >= GAME.DIAMOND_WEEK_JUMPS;

        days.forEach(d => {
            const e = d.eSpent ? d.eSpent.total : 0;
            const isHJ = hjDaySet ? hjDaySet.has(d.date) : false;

            if (isHJ) {
                let tier = 'GREEN';
                if (e >= 2000) tier = 'DIAMOND';
                else if (e >= 1500) tier = 'GOLD';

                if (jumpDiamond) tier = 'DIAMOND';
                else if (jumpGold && tier === 'GREEN') tier = 'GOLD';

                if (tier === 'DIAMOND') totDiamond += GAME.POINTS_HJ_DIAMOND;
                else if (tier === 'GOLD') totGold += GAME.POINTS_HJ_GOLD;
                else totGreen += GAME.POINTS_HJ_GREEN;
                return;
            }

            let base = 0;
            if (e >= 2000) base = GAME.POINTS_DIAMOND;
            else if (e >= 1500) base = GAME.POINTS_GOLD;
            else if (e >= 1000) base = GAME.POINTS_GREEN;
            
            if (base === 0) return;
            
            if (base === GAME.POINTS_DIAMOND) totDiamond += base;
            else if (base === GAME.POINTS_GOLD) totGold += base;
            else totGreen += base;
        });
        
        const total = totGreen + totGold + totDiamond;
        const goldOrBetter = totGold + totDiamond;
        return {
            isCompleted: total >= GAME.WEEKLY_GOAL,
            isGold: goldOrBetter >= GAME.WEEKLY_GOAL,
            totGreen,
            totGold,
            totDiamond,
            total
        };
    }

    function getWeekKey(dateStr) {
        const d = Formatter.parse(dateStr);
        const dayIdx = d.getUTCDay();
        const offset = userConfig.weekStartMode === 'mon' ? (dayIdx === 0 ? 6 : dayIdx - 1) : dayIdx;
        const weekStart = new Date(d.getTime() - offset * 86400000);
        return Formatter.dateISO(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate());
    }

    // Week-key of the install date (privacyAgreed). Rewards (stickers now, XP later) are only
    // eligible for weeks with key >= this. Respects the user's day-start and week-start modes.
    // Returns null if unknown (no gating) — but init() self-heals privacyAgreed so this is rare.
    function getInstallWeekKey() {
        const ms = userConfig.privacyAgreed ? Date.parse(userConfig.privacyAgreed) : NaN;
        if (isNaN(ms)) return null;
        return getWeekKey(Formatter.dateLogical(ms));
    }

    /**
     *  [SECTION III] THE PHYSIQUE (Assets & Styles)
     *  ========================================================================
     *  The Big & Black Part of the script.
     */
    const ASSETS = {
        HEADER_IMG: "https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-hdr.jpg",
        GRADIENT: `<defs><linearGradient id="bbgl_silver_grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#d9d9d9;stop-opacity:1" /><stop offset="100%" style="stop-color:#999999;stop-opacity:1" /></linearGradient></defs>`
    };
    const ICONS = {
        LOGO_PATH: `M193.636 22.044 C 182.529 27.985,180.338 45.621,189.593 54.592 C 193.384 58.266,193.325 58.939,188.176 70.810 C 163.707 127.227,143.908 132.713,103.872 94.170 C 97.232 87.778,97.187 87.704,98.234 84.744 C 102.964 71.365,85.668 57.225,74.917 65.683 C 65.274 73.267,71.102 91.707,83.674 93.393 C 86.535 93.777,87.611 94.407,88.243 96.069 C 89.543 99.488,100.349 139.625,104.966 158.182 C 107.267 167.432,109.322 175.494,109.532 176.099 C 109.800 176.869,111.627 176.423,115.639 174.608 C 154.845 156.875,247.090 156.878,286.205 174.613 C 293.432 177.890,291.721 180.896,299.107 151.950 C 311.947 101.626,314.454 93.636,317.401 93.636 C 326.599 93.636,334.579 79.275,330.342 70.347 C 322.578 53.985,297.084 68.675,303.582 85.767 C 305.874 91.794,271.086 117.463,258.740 118.855 C 242.368 120.700,226.759 103.733,212.306 68.380 L 208.113 58.124 211.323 55.097 C 226.571 40.716,211.474 12.503,193.636 22.044 M138.379 65.055 C 132.851 68.927,132.526 85.309,137.973 85.475 C 138.338 85.486,139.582 86.223,140.738 87.112 L 142.839 88.729 139.512 98.673 C 137.682 104.142,135.612 109.726,134.911 111.082 C 133.185 114.418,133.200 114.456,136.789 115.955 C 146.318 119.937,155.721 116.589,165.869 105.601 L 168.556 102.692 162.196 96.119 C 152.170 85.755,152.287 85.936,154.000 83.490 C 160.757 73.843,147.749 58.492,138.379 65.055 M254.135 66.447 C 249.029 70.930,247.780 79.527,251.606 83.864 C 253.281 85.763,253.294 85.744,242.310 97.108 L 235.000 104.671 239.263 108.569 C 247.293 115.913,255.483 117.954,264.959 114.973 C 271.221 113.003,271.405 112.722,269.230 108.440 C 267.406 104.849,262.723 90.706,262.733 88.817 C 262.736 88.218,263.983 87.019,265.504 86.154 C 267.186 85.196,268.997 82.935,270.127 80.379 C 275.243 68.813,263.295 58.404,254.135 66.447 M190.909 167.921 C 145.964 169.201,105.455 180.299,105.455 191.333 C 105.455 199.464,110.615 201.124,121.309 196.434 C 161.535 178.793,239.237 178.622,279.896 196.086 C 290.951 200.834,296.364 199.296,296.364 191.407 C 296.364 181.127,258.823 169.956,219.545 168.547 C 212.545 168.296,204.773 168.009,202.273 167.909 C 199.773 167.809,194.659 167.815,190.909 167.921`,
        get LOGO() {
            return `<svg id="bbgl-header-icon" xmlns="http://www.w3.org/2000/svg" viewBox="60 20 280 215" width="28" height="28" style="margin-right: 4px;">${ASSETS.GRADIENT}<g transform="scale(1, 1.15)"><path fill="url(#bbgl_silver_grad)" d="${this.LOGO_PATH}"></path></g></svg>`;
        },
        CLIPBOARD: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="100%" height="100%">${ASSETS.GRADIENT}<path fill="url(#bbgl_silver_grad)" d="M17,2.25V18H2V2.25H5.5l-2,2.106V16.5h12V4.356L13.543,2.25H17Zm-2.734,3L11.781,2.573V2.266A2.266,2.266,0,0,0,7.25,2.25v.323L4.777,5.25ZM9.5,1.5a.75.75,0,1,1-.75.75A.75.75,0,0,1,9.5,1.5ZM5.75,12.75h7.5v.75H5.75Zm0-.75h7.5v-.75H5.75Zm0-1.5h7.5V9.75H5.75Zm0-1.5h7.5V8.25H5.75Z"></path></svg>`,
        MINIMIZE: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="bbgl-native-icon" aria-label="Minimize">${ASSETS.GRADIENT}<rect fill="url(#bbgl_silver_grad)" x="0" y="21" width="24" height="3"></rect></svg>`,
        POPOUT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24" height="24" class="bbgl-native-icon">${ASSETS.GRADIENT}<path fill="url(#bbgl_silver_grad)" d="M12,12H6V6h6ZM4.5,6.621V4.5H6.621L4.061,1.939,6,0H0V6L1.939,4.061ZM6.621,13.5H4.5V11.379L1.939,13.94,0,12v6H6L4.061,16.06ZM13.5,11.379V13.5H11.379l2.561,2.56L12,18h6V12l-1.94,1.94L13.5,11.379ZM12,0l1.94,1.939L11.379,4.5H13.5V6.621l2.56-2.561L18,6V0Z"></path></svg>`,
        COMPRESS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="24" height="24" class="bbgl-native-icon">${ASSETS.GRADIENT}<g transform="translate(1290 304)"><path fill="url(#bbgl_silver_grad)" d="M-1277-291h6l-1.939,1.939,1.561,1.561-2.121,2.12-1.561-1.561L-1277-285Zm-9.94,4.06-1.561,1.561-2.12-2.12,1.561-1.561L-1291-291h6v6ZM-1284-292v-6h6v6Zm7-7v-6l1.939,1.94,1.561-1.561,2.121,2.121-1.561,1.561L-1271-299Zm-14,0,1.939-1.939-1.561-1.561,2.12-2.121,1.561,1.561L-1285-305v6Z"></path></g></svg>`,
        CHART: `<svg viewBox="0 0 24 24"><path d="M7 19h2v-8H7v8zm4 0h2V5h-2v14zm4 0h2v-6h-2v6z"/></svg>`,
        LEDGER: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" fill="none"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
        GRAPH: `<svg viewBox="0 0 24 24"><path d="M3,12 L7,16 L13,6 L18,14 L22,8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        STICKERBOOK: `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.5" fill="none"/><circle cx="12" cy="5.5" r="3.5" fill="none"/><circle cx="18" cy="10" r="3.5" fill="none"/><circle cx="16" cy="17" r="3.5" fill="none"/><circle cx="8" cy="17" r="3.5" fill="none"/><circle cx="6" cy="10" r="3.5" fill="none"/></svg>`,
        ACHIEVEMENTS: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" fill="none"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" fill="none"></path><path d="M4 22h16" fill="none"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" fill="none"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" fill="none"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="none"></path></svg>`,
        PASTE: `<svg viewBox="0 0 24 24"><path d="M19,20H5V4H7V7H17V4H19M12,2A1,1 0 0,1 13,3A1,1 0 0,1 12,4A1,1 0 0,1 11,3A1,1 0 0,1 12,2M19,2H14.82C14.4,0.84 13.3,0 12,0C10.7,0 9.6,0.84 9.18,2H5A2,2 0 0,0 3,4V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V4A2,2 0 0,0 19,2Z"/></svg>`,
        CHECK: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17 4 12" fill="none"/></svg>`,
        CLOSE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    };
    const CSS_STYLES = `


                                                /*============================    ============================*/
                                          /*==================================    ==================================*/
                                      /*======================================    ======================================*/
                                  /*==========================================    ==========================================*/
                                /*============================================================================================*/
                            /*====================================================================================================*/
                         /*==========================================================================================================*/
                      /*================================================================================================================*/
                    /*====================================================================================================================*/
                  /*========================================================================================================================*/
                /*============================================================================================================================*/
               /*==============================================================================================================================*/
              /*================================================================================================================================*/
             /*==================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
            /*====================================================================================================================================*/
                    .bbgl-prefs-tab-title {
                        background-image: linear-gradient(rgb(85, 85, 85) 0%, rgb(51, 51, 51) 100%);
                        color: #fff;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        line-height: 30px;
                        padding-left: 10px;
                        border: 1px solid #111;
                        border-bottom: 1px solid #000;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 #444;
                        border-radius: 5px 5px 0 0;
                        width: 100%;
                        box-sizing: border-box;
                        margin: 0;
                        z-index: 2;
                        position: relative;
                    }

                    .bbgl-prefs-tab-title:first-child {
                        margin-top: 0;
                    }

                    .torn-btn {
                        background-image: linear-gradient(rgb(17, 17, 17) 0%, rgb(85, 85, 85) 25%, rgb(51, 51, 51) 60%, rgb(51, 51, 51) 78%, rgb(17, 17, 17) 100%);
                        color: #eee;
                        font-family: "Fjalla One", Arial, serif;
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 34px;
                        padding: 0;
                        border: 1px solid #111;
                        border-radius: 5px;
                        width: 100%;
                        height: 34px;
                        cursor: pointer;
                        text-align: center;
                        text-transform: uppercase;
                        box-sizing: border-box;
                        display: block;
                        transition: none;
                    }

                    .torn-btn:hover {
                        background-image: linear-gradient(rgb(51, 51, 51) 0%, rgb(119, 119, 119) 25%, rgb(51, 51, 51) 59%, rgb(102, 102, 102) 78%, rgb(51, 51, 51) 100%);
                        color: #fff;
                    }

                    .torn-btn:active {
                        background-image: linear-gradient(#000 0%, #333 100%);
                        color: #ddd;
                        box-shadow: rgba(255, 255, 255, .07) 0 -1px 0 0 inset;
                        border-color: #ddd;
                    }

                    .torn-btn-green {
                        background-image: linear-gradient(#0e1806 0%, #3e5e22 25%, #2b4216 60%, #2b4216 78%, #0e1806 100%) !important;
                        border-color: #0e1806 !important;
                    }

                    .torn-btn-green:hover {
                        background-image: linear-gradient(#1a2e0b 0%, #4f782b 25%, #3a591e 60%, #3a591e 78%, #1a2e0b 100%) !important;
                    }

                    .torn-btn-green:active {
                        background-image: linear-gradient(#080f03 0%, #2b4216 100%) !important;
                        border-color: #555 !important;
                    }

                    .torn-btn-red {
                        background-image: linear-gradient(#200505 0%, #701a1a 25%, #4f0e0e 60%, #4f0e0e 78%, #200505 100%) !important;
                        border-color: #200505 !important;
                    }

                    .torn-btn-red:hover {
                        background-image: linear-gradient(#360808 0%, #942222 25%, #6e1313 60%, #6e1313 78%, #360808 100%) !important;
                    }

                    .torn-btn-red:active {
                        background-image: linear-gradient(#140303 0%, #4f0e0e 100%) !important;
                        border-color: #555 !important;
                    }

                    .torn-btn-purple {
                        background-image: linear-gradient(#1a0529 0%, #6a1b9a 25%, #4a1070 60%, #4a1070 78%, #1a0529 100%) !important;
                        border-color: #1a0529 !important;
                    }

                    .torn-btn-purple:hover {
                        background-image: linear-gradient(#2a0840 0%, #8e24aa 25%, #6a1b9a 60%, #6a1b9a 78%, #2a0840 100%) !important;
                    }

                    .torn-btn-purple:active {
                        background-image: linear-gradient(#0f0318 0%, #4a1070 100%) !important;
                        border-color: #555 !important;
                    }

                    .bbgl-settings-body {
                        background-color: #333;
                        border: 1px solid #111;
                        border-top: none;
                        border-radius: 0 0 5px 5px;
                        padding: 4px 0;
                        margin-bottom: 5px;
                        display: flex;
                        flex-direction: column;
                        box-shadow: inset 0 3px 5px rgba(0, 0, 0, .2);
                    }

                    .bbgl-setting-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 10px;
                        background: 0 0;
                        border-bottom: 1px solid #1a1a1a;
                        box-shadow: 0 1px 0 #484848;
                        font-family: Arial, sans-serif;
                        font-size: 13px;
                        color: #ddd;
                    }

                    .bbgl-setting-row:last-child {
                        border-bottom: none;
                        box-shadow: none;
                    }

                    .bbgl-api-container {
                        position: relative;
                        width: 100%;
                        margin-bottom: 8px;
                    }

                    .bbgl-native-input {
                        width: 100%;
                        background: #333;
                        border: 1px solid #555;
                        color: #fff;
                        padding: 8px 30px;
                        font-family: 'Roboto Mono', monospace;
                        font-size: 12px;
                        border-radius: 4px;
                        box-sizing: border-box;
                    }

                    .bbgl-paste-icon {
                        position: absolute;
                        left: 4px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        user-select: none;
                        z-index: 15;
                    }

                    .bbgl-paste-icon svg {
                        fill: #888;
                        transition: fill .2s;
                        width: 14px;
                        height: 14px;
                    }

                    .bbgl-paste-icon:hover svg {
                        fill: #fff;
                    }

                    .bbgl-expanded .bbgl-paste-icon {
                        width: 26px;
                        height: 26px;
                    }

                    .bbgl-expanded .bbgl-paste-icon svg {
                        width: 17px;
                        height: 17px;
                    }

                    .bbgl-native-select {
                        background: #333;
                        color: #fff;
                        border: 1px solid #555;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                    }

                    .bbgl-switch {
                        position: relative;
                        display: inline-block;
                        width: 34px;
                        height: 18px;
                    }

                    .bbgl-switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }

                    .slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #444;
                        transition: .4s;
                        border-radius: 34px;
                    }

                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 12px;
                        width: 12px;
                        left: 3px;
                        bottom: 3px;
                        background-color: #fff;
                        transition: .4s;
                        border-radius: 50%;
                    }

                    input:checked + .slider {
                        background-color: ${CONSTANTS.COLORS.GAINS};
                    }

                    input:checked + .slider:before {
                        transform: translateX(16px);
                    }

                    .bbgl-switch-purple {
                        transform: scale(.85);
                    }

                    .bbgl-switch-purple input:checked + .slider {
                        background-color: #6a1b9a;
                        /**/
                        box-shadow: 0 0 5px rgba(106, 27, 154, .6);
                    }

                    #bbgl-settings-view .bbgl-switch input:checked + .slider {
                        background-color: #6a1b9a;
                        /**/
                        box-shadow: 0 0 5px rgba(106, 27, 154, .6);
                    }

                    .bbgl-bestgym {
                        float: right;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        height: 24px;
                        line-height: 24px;
                        color: #999;
                        margin-right: 8px;
                    }

                    .bbgl-bestgym-logo {
                        width: 20px;
                        height: 20px;
                        flex-shrink: 0;
                    }

                    .bbgl-bestgym-label {
                        white-space: nowrap;
                        position: relative;
                        top: 1px;
                    }

                    .bbgl-subsetting {
                        padding-left: 26px;
                    }

                    .bbgl-row-disabled {
                        opacity: .45;
                        pointer-events: none;
                    }

                    .bbgl-bestgym-lead {
                        border-bottom: 1px solid rgba(255, 255, 255, .06);
                        box-shadow: none;
                    }

                    .bbgl-subgroup-row {
                        position: relative;
                        padding-left: 24px;
                    }

                    .bbgl-subgroup-row::before {
                        content: '';
                        position: absolute;
                        left: 10px;
                        top: 0;
                        bottom: 0;
                        width: 2px;
                        background: #555;
                    }

                    .bbgl-subgroup-row:not(.bbgl-subgroup-row-last) {
                        border-bottom: none;
                        box-shadow: none;
                    }

                    .bbgl-subgroup-row:not(.bbgl-subgroup-row-last)::after {
                        content: '';
                        position: absolute;
                        left: 10px;
                        right: 0;
                        bottom: 0;
                        height: 1px;
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-btn-grid {
                        display: flex;
                        gap: 0;
                        margin-bottom: 0;
                    }

                    .bbgl-btn-grid .torn-btn {
                        flex: 1;
                    }

                    .bbgl-btn-grid .torn-btn:first-of-type {
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                        border-bottom-left-radius: 0;
                        border-right: none;
                    }

                    .bbgl-btn-grid .torn-btn:last-of-type {
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                        border-bottom-right-radius: 0;
                    }

                    .bbgl-settings-body .bbgl-api-grid {
                        display: flex !important;
                        flex-direction: row !important;
                        gap: 0 !important;
                        margin: 0 10px 10px !important;
                        width: auto !important;
                    }

                    .bbgl-api-grid .torn-btn {
                        flex: 1 1 0 !important;
                        margin: 0 !important;
                        width: 50% !important;
                    }

                    .bbgl-api-grid .torn-btn:first-child {
                        border-top-right-radius: 0 !important;
                        border-bottom-right-radius: 0 !important;
                        border-top-left-radius: 5px !important;
                        border-bottom-left-radius: 5px !important;
                        border-right: none !important;
                    }

                    .bbgl-api-grid .torn-btn:last-child {
                        border-top-left-radius: 0 !important;
                        border-bottom-left-radius: 0 !important;
                        border-top-right-radius: 5px !important;
                        border-bottom-right-radius: 5px !important;
                    }

                    .close-settings-btn {
                        position: absolute;
                        background: transparent;
                        border: none;
                        color: rgba(80, 200, 120, .7);
                        cursor: pointer;
                        z-index: 200;
                        transition: all .2s;
                        user-select: none;
                        top: 12px;
                        right: 12px;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                    }

                    .close-settings-btn svg {
                        width: 100%;
                        height: 100%;
                        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5));
                        transition: all .2s;
                    }

                    .close-settings-btn:hover {
                        color: #69f0ae;
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 6px rgba(105, 240, 174, .4));
                    }

                    .bbgl-close-x {
                        color: rgba(220, 80, 80, .7) !important;
                    }

                    .bbgl-close-x:hover {
                        color: #ff6b6b !important;
                        filter: drop-shadow(0 0 6px rgba(255, 100, 100, .4)) !important;
                    }

                    .bbgl-close-purple {
                        color: rgba(171, 71, 188, .7) !important;
                    }

                    .bbgl-close-purple:hover {
                        color: #ce93d8 !important;
                        filter: drop-shadow(0 0 6px rgba(171, 71, 188, .4)) !important;
                    }

                    .bbgl-expanded .close-settings-btn {
                        top: 12px;
                        right: 16px;
                        width: 25px;
                        height: 25px;
                    }

                    .bbgl-settings-body .bbgl-api-container {
                        margin: 8px 10px;
                        width: auto;
                    }

                    .bbgl-settings-body #updt-settings-btn {
                        margin: 0 10px 10px;
                        width: calc(100% - 20px);
                        display: block;
                    }

                    .bbgl-settings-body .bbgl-btn-grid {
                        margin: 8px 10px 0;
                    }

                    [class*="area-desktop___"][class*="active___"] [class*="defaultIcon___"] svg,
                    [class*="area-mobile___"][class*="active___"] [class*="defaultIcon___"] svg {
                        fill: #fff;
                        stroke: #fff;
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, .55));
                    }

                    .bbgl-sb-notif [class*="desktopLink___"] {
                        background: linear-gradient(to right, rgba(171, 71, 188, .28), rgba(171, 71, 188, .12)) !important;
                    }

                    .bbgl-sb-notif [class*="defaultIcon___"] svg {
                        fill: #d896e0 !important;
                        stroke: #d896e0 !important;
                        /**/
                        filter: drop-shadow(0 0 3px rgba(216, 150, 224, .6)) brightness(1.15) !important;
                    }

                    .bbgl-sb-notif [class*="mobileLink___"] > span:not([class]) {
                        color: #d896e0 !important;
                    }

                    .bbgl-swiper-wr {
                        overflow: visible !important;
                        width: max-content !important;
                    }

                    .bbgl-swiper-cont {
                        overflow: visible !important;
                    }

                    #bbgl-page-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        min-height: calc(100vh - 60px);
                        height: auto;
                        /**/
                        padding: 8px 0;
                        box-sizing: border-box;
                        container-type: inline-size;
                        container-name: bbgl-page;
                    }

                    .bbgl-native-header {
                        /**/
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 0 8px;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #444;
                        flex: 0 0 auto;
                        position: relative;
                    }

                    .bbgl-native-header::after {
                        content: "";
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 1px;
                        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, .3) 50%, transparent 100%);
                    }

                    .bbgl-native-title {
                        /**/
                        font-family: Arial;
                        font-weight: 700;
                        font-size: 22px;
                        color: #999;
                        text-transform: capitalize;
                        letter-spacing: .1px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-left: -7px;
                        padding-left: 0;
                    }

                    .bbgl-native-links {
                        display: flex;
                        gap: 15px;
                        font-size: 18px;
                        color: #999;
                        font-weight: 700;
                    }

                    .bbgl-native-link {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        cursor: pointer;
                        transition: color .2s;
                    }

                    .bbgl-native-link:hover {
                        color: #ccc;
                    }

                    .bbgl-native-link svg {
                        width: 20px;
                        /**/
                        height: 20px;
                        fill: currentColor;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container .bbgl-native-title {
                        font-size: clamp(21px, calc(21px + 1px * (100cqw - 280px) / 440px), 22px) !important;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container #bbgl-page-demo-exit .bbgl-demo-x-label {
                        font-size: clamp(16px, calc(16px + 2px * (100cqw - 280px) / 440px), 18px) !important;
                    }

                    body.bbgl-page-mode-active #bbgl-page-container #bbgl-page-demo-exit svg {
                        width: clamp(20px, calc(24px - 4px * (100cqw - 280px) / 440px), 24px) !important;
                        height: clamp(20px, calc(24px - 4px * (100cqw - 280px) / 440px), 24px) !important;
                    }

                    #bbgl-panel {
                        --bbgl-f-label: 10px;
                        /**/
                        --bbgl-f-top: 10px;
                        --bbgl-f-bot: 9px;
                        --bbgl-f-top-mb: 1px;
                        --bbgl-bot-minh: 12px;
                        --bbgl-col-gap: 8px;
                        --bbgl-gx: clamp(7px, 1.78cqi, 12px);
                        --bbgl-label-case: uppercase;
                        --bbgl-viewer-title-top-shift: 3px;
                        container-type: inline-size;
                        container-name: bbgl-panel;
                        position: fixed;
                        bottom: ${LAYOUT.LIFT_HEIGHT}px;
                        right: 10px;
                        z-index: 999989;
                        font-family: Arial, sans-serif;
                        display: none;
                        flex-direction: column;
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 5px;
                        box-shadow: 0 -2px 4px rgba(0, 0, 0, .35);
                        width: 300px;
                        height: 438.5px;
                        max-height: calc(100vh - 50px) !important;
                        overflow-y: auto;
                        overflow-x: hidden;
                        transition: width .3s cubic-bezier(.25, 1, .5, 1), height .3s cubic-bezier(.25, 1, .5, 1);
                    }

                    #bbgl-panel.bbgl-expanded {
                        --bbgl-f-label: clamp(12.5px, 2.34cqi, 13.5px);
                        --bbgl-f-top: clamp(12.5px, 2.34cqi, 13.5px);
                        --bbgl-f-bot: clamp(10.5px, 1.997cqi, 11.5px);
                        --bbgl-f-top-mb: 3px;
                        --bbgl-bot-minh: 14px;
                        --bbgl-col-gap: clamp(8px, 2.78cqi, 16px);
                        --bbgl-label-case: none;
                        width: min(576px, calc(100vw - 20px));
                        height: 633px;
                        /**/
                        max-height: calc(100vh - 50px) !important;
                        overflow-y: auto;
                        overflow-x: hidden;
                    }

                    #bbgl-panel.bbgl-tall {
                        --bbgl-f-label: 12px;
                        --bbgl-f-top: 12px;
                        --bbgl-f-bot: 11px;
                        --bbgl-col-gap: 13px;
                    }

                    #bbgl-panel.bbgl-tall.bbgl-expanded {
                        --bbgl-f-label: clamp(13.75px, calc(2px + 2.34cqi), 15.5px);
                        --bbgl-f-top: clamp(13.75px, calc(2px + 2.34cqi), 15.5px);
                        --bbgl-f-bot: clamp(11.75px, calc(1.5px + 1.997cqi), 13px);
                        --bbgl-col-gap: clamp(22px, calc(35.5px - 2.34cqi), 24.5px);
                    }

                    #bbgl-panel.bbgl-mode-page {
                        position: relative !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: auto !important;
                        bottom: auto !important;
                        width: 100% !important;
                        flex: none !important;
                        max-width: none !important;
                        height: auto !important;
                        max-height: none !important;
                        border: 1px solid #444 !important;
                        border-radius: 5px !important;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, .5) !important;
                        box-sizing: border-box !important;
                        background: #2a2a2a !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 0 !important;
                        z-index: 1 !important;
                        overflow-x: hidden !important;
                        overflow-y: visible !important;
                    }

                    #bbgl-panel.bbgl-mode-page {
                        --bbgl-label-case: none !important;
                        --bbgl-page-t: clamp(0, calc((100cqi - 350px) / 370px), 1);
                        --bbgl-f-label: clamp(10.75px, calc(10.75px + 5.25px * var(--bbgl-page-t)), 16px);
                        --bbgl-f-top: clamp(10.75px, calc(10.75px + 6.25px * var(--bbgl-page-t)), 17px);
                        --bbgl-f-bot: clamp(9px, calc(9px + 5px * var(--bbgl-page-t)), 14px);
                        --bbgl-f-top-mb: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                        --bbgl-bot-minh: clamp(12px, calc(12px + 4px * var(--bbgl-page-t)), 16px);
                        --bbgl-col-gap: clamp(6px, calc(6px + 20px * var(--bbgl-page-t)), 26px);
                    }

                    .bbgl-mode-page .bbgl-header {
                        display: none !important;
                    }

                    .bbgl-mode-page #bbgl-content-wrapper {
                        display: contents !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-top-panel {
                        flex: 0 0 clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) !important;
                        height: clamp(180px, calc(180px + 90px * var(--bbgl-page-t)), 270px) !important;
                        width: 100%;
                        margin-bottom: 0 !important;
                        /**/
                        border: none !important;
                        border-bottom: 1px solid #444 !important;
                        border-radius: 0 !important;
                        display: flex;
                        flex-direction: column;
                        padding-top: clamp(2px, calc(2px + 18px * var(--bbgl-page-t)), 20px) !important;
                        overflow: hidden !important;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper {
                        flex: 0 0 clamp(108px, calc(108px + 89px * var(--bbgl-page-t)), 197px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper::before {
                        left: 4px;
                        right: 4px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-month-header {
                        padding-left: clamp(4px, calc(4px + 3px * var(--bbgl-page-t)), 7px);
                        padding-right: clamp(16px, calc(16px + 16px * var(--bbgl-page-t)), 32px);
                        gap: clamp(8px, calc(8px + 8px * var(--bbgl-page-t)), 16px);
                        padding-bottom: 6px;
                    }

                    @container bbgl-panel (max-width:499px) {
                        #bbgl-panel.bbgl-mode-page {
                            --bbgl-label-case: none !important;
                        }
                    }

                    .bbgl-mode-page #bbgl-bottom-panel {
                        flex: none !important;
                        width: 100%;
                        border: none !important;
                        border-radius: 0 !important;
                        background: 0 0 !important;
                        min-height: 0;
                        display: flex;
                        flex-direction: column;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    .bbgl-mode-page #bbgl-settings-view {
                        flex: none;
                        height: auto !important;
                    }

                    .bbgl-mode-page .bbgl-settings-scroll-area {
                        overflow-y: visible !important;
                        height: auto !important;
                        flex: none;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) {
                        flex: none !important;
                    }

                    .bbgl-mode-page:has(#bbgl-settings-view.active-view) #bbgl-bottom-panel {
                        flex: none !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-grid-container {
                        height: auto !important;
                        flex: none !important;
                        padding: 0 clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px) clamp(1px, calc(1px + 3px * var(--bbgl-page-t)), 4px) clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px) !important;
                        overflow: visible !important;
                    }

                    .bbgl-mode-page .calendar-wrapper {
                        height: auto !important;
                        flex: none !important;
                        overflow: hidden !important;
                    }

                    .bbgl-mode-page .bbgl-cal-container {
                        height: auto !important;
                        display: flex;
                        flex-direction: column;
                    }

                    .bbgl-mode-page .bbgl-row-slice {
                        flex: none !important;
                        width: 100%;
                    }

                    .bbgl-mode-page .bbgl-day-cell {
                        aspect-ratio: 1/1 !important;
                        height: auto !important;
                        width: 100% !important;
                    }

                    #bbgl-panel.bbgl-mode-page .ledger-content:not(#bbgl-achievements-container) {
                        height: auto !important;
                        overflow: visible !important;
                        align-content: flex-start !important;
                        grid-template-rows: 1fr !important;
                        padding-top: clamp(26px, calc(32px - 6px * var(--bbgl-page-t)), 32px) !important;
                        padding-bottom: clamp(0px, calc(0px + 15px * var(--bbgl-page-t)), 15px) !important;
                        padding-left: 4px !important;
                        padding-right: 4px !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 24px);
                        --bbgl-ach-container-pt: 0;
                        --bbgl-ach-scroll-pt: clamp(2px, calc(4px - 1px * var(--bbgl-page-t)), 5px);
                        --bbgl-ach-footer-pt: clamp(0px, calc(1px + 1px * var(--bbgl-page-t)), 2px);
                        --bbgl-ach-footer-pb: 0;
                        --bbgl-ach-footer-gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-dot-gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-dot-w: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                        --bbgl-ach-nav-fs: clamp(7px, calc(1.45 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: 0;
                        --bbgl-ach-nav-px: clamp(2px, calc(2px + 3px * var(--bbgl-page-t)), 8px);
                        --bbgl-ach-scroll-pb: clamp(0px, calc(2px - .5px * var(--bbgl-page-t)), 2px);
                        padding-top: var(--bbgl-ach-container-pt) !important;
                        padding-left: var(--bbgl-ach-inset-x) !important;
                        padding-right: var(--bbgl-ach-inset-x) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-scroll {
                        padding-top: clamp(18px, calc(18px + 6px * var(--bbgl-page-t)), 24px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ach-pageindicator .pg-dot {
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-title {
                        font-size: clamp(9.5px, calc(9.5px + 4.5px * var(--bbgl-page-t)), 14px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-row {
                        font-size: clamp(9px, calc(9px + 4px * var(--bbgl-page-t)), 13px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-group .bbgl-ach-row,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        font-size: clamp(9px, calc(9px + 4px * var(--bbgl-page-t)), 13px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .ach-sub {
                        font-size: clamp(7px, calc(7px + 3px * var(--bbgl-page-t)), 10px) !important;
                    }

                    /**/
                    #bbgl-panel.bbgl-mode-page .ach-date {
                        font-size: clamp(7.5px, calc(7.5px + 3.5px * var(--bbgl-page-t)), 11px) !important;
                    }

                    #bbgl-panel.bbgl-mode-page .col-header,
                    #bbgl-panel.bbgl-mode-page .col-data-block {
                        margin-bottom: calc(8px * (1 - var(--bbgl-page-t)));
                    }

                    #bbgl-panel.bbgl-mode-page .day-num {
                        top: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        left: clamp(2px, calc(2px + 4px * var(--bbgl-page-t)), 6px);
                        font-size: clamp(10px, calc(10px + 8px * var(--bbgl-page-t)), 18px);
                        width: clamp(22px, calc(22px + 14px * var(--bbgl-page-t)), 36px);
                        height: clamp(22px, calc(22px + 14px * var(--bbgl-page-t)), 36px);
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-day-cell.is-viewing .day-num {
                        font-size: clamp(14px, calc(14px + 10px * var(--bbgl-page-t)), 24px) !important;
                        width: clamp(26px, calc(26px + 14px * var(--bbgl-page-t)), 40px);
                        height: clamp(26px, calc(26px + 14px * var(--bbgl-page-t)), 40px);
                    }

                    #bbgl-panel.bbgl-mode-page .ui-floating-label,
                    #bbgl-panel.bbgl-mode-page .ui-floating-summary {
                        font-size: clamp(11px, calc(11px + 4px * var(--bbgl-page-t)), 15px);
                        bottom: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container {
                        padding-top: clamp(12px, calc(19px - 7px * var(--bbgl-page-t)), 19px);
                        padding-bottom: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 5px);
                        padding-left: clamp(4px, calc(4px + 5px * var(--bbgl-page-t)), 10px);
                        padding-right: clamp(4px, calc(4px + 5px * var(--bbgl-page-t)), 10px);
                    }

                    @container bbgl-panel (max-width:499px) {

                        #bbgl-panel.bbgl-mode-page .bbgl-header-wrapper,
                        #bbgl-panel.bbgl-mode-page #bbgl-graph-container,
                        #bbgl-panel.bbgl-mode-page #bbgl-cal-container {
                            will-change: transform;
                        }
                    }

                    .bbgl-mode-page #bbgl-close-btn,
                    .bbgl-mode-page #bbgl-pop-btn,
                    .bbgl-mode-page #bbgl-tall-toggle {
                        display: none !important;
                    }

                    .bbgl-mode-page #bbgl-ledger-toggle,
                    .bbgl-mode-page #bbgl-graph-toggle,
                    .bbgl-mode-page #bbgl-achievements-toggle,
                    .bbgl-mode-page #bbgl-sticker-toggle,
                    .bbgl-mode-page #bbgl-copy-btn {
                        opacity: 1 !important;
                        pointer-events: auto !important;
                    }

                    .bbgl-mode-page #bbgl-ledger-toggle {
                        left: 10px !important;
                    }

                    .bbgl-mode-page #bbgl-graph-toggle {
                        left: clamp(34px, calc(34px + 6px * var(--bbgl-page-t)), 40px) !important;
                    }

                    .bbgl-mode-page #bbgl-achievements-toggle {
                        left: clamp(58px, calc(58px + 12px * var(--bbgl-page-t)), 70px) !important;
                    }

                    .bbgl-mode-page #bbgl-sticker-toggle {
                        left: clamp(82px, calc(82px + 18px * var(--bbgl-page-t)), 100px) !important;
                    }

                    body.bbgl-page-mode-active {
                        overflow-x: hidden !important;
                    }

                    body.bbgl-page-mode-active #graph,
                    body.bbgl-page-mode-active .tt-container.tt-theme-background.collapsible {
                        display: none !important;
                    }

                    #bbgl-gym-tab {
                        background-image: linear-gradient(180deg, #00698c, #003040) !important;
                        color: #fff !important;
                        border: .1px solid #002431 !important;
                        border-bottom: none !important;
                        border-radius: 5px 5px 0 0 !important;
                        box-shadow: rgba(255, 255, 255, .25) 0 0 4px 0 inset, rgba(0, 0, 0, .5) 0 -2px 4px 0 !important;
                        width: 38px !important;
                        height: 38px !important;
                        min-width: 38px !important;
                        max-width: 38px !important;
                        flex: 0 0 38px !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        margin: 0 -1px 0 -.4px !important;
                        padding: 0 !important;
                        cursor: pointer !important;
                        position: relative !important;
                        z-index: -10 !important;
                        transform: none !important;
                        pointer-events: auto !important;
                    }

                    #bbgl-gym-tab svg {
                        margin: 0 !important;
                        display: block;
                        transition: filter .2s ease;
                        filter: drop-shadow(rgba(0, 0, 0, .8) 0 0 2px);
                    }

                    #bbgl-gym-tab:hover {
                        background-image: linear-gradient(#0099cc, #004d66) !important;
                    }

                    #bbgl-gym-tab:hover svg,
                    #bbgl-gym-tab.bbgl-tab-active svg {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .8) 0 0 2px);
                    }

                    #bbgl-gym-tab.bbgl-tab-active {
                        background-image: linear-gradient(to bottom, #001F2B 0%, #003E53 100%) !important;
                        box-shadow: inset 0 1px 0 0 #1a353f, rgba(0, 0, 0, .5) 0 -2px 4px 0 !important;
                        border: none !important;
                        padding: 1px 1px 0 !important;
                    }

                    #bbgl-gym-tab.bbgl-tab-active:hover {
                        background-image: linear-gradient(180deg, #003040, #00698c) !important;
                    }

                    .bbgl-animate-pop {
                        animation: bbgl-genie-pop .3s cubic-bezier(.2, 1, .3, 1) forwards;
                    }

                    .bbgl-animate-vanish {
                        animation: bbgl-genie-vanish .2s ease-in forwards;
                        pointer-events: none;
                    }

                    /**/
                    @keyframes bbgl-genie-pop {
                        0% {
                            transform: scale(0);
                            opacity: 0
                        }

                        100% {
                            transform: scale(1);
                            opacity: 1
                        }
                    }

                    @keyframes bbgl-genie-vanish {
                        0% {
                            transform: scale(1);
                            opacity: 1
                        }

                        100% {
                            transform: scale(0);
                            opacity: 0
                        }
                    }

                    .bbgl-header {
                        background-image: linear-gradient(#00698c, #003040);
                        color: #fff;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        text-transform: Title Case;
                        padding: 0 8px;
                        border-bottom: 1px solid #000;
                        border-radius: 5px 5px 0 0;
                        /**/
                        box-shadow: rgba(255, 255, 255, .25) 0 0 4px 0 inset, rgba(0, 0, 0, .5) 0 -2px 4px 0;
                        width: 100%;
                        height: 38px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        box-sizing: border-box;
                        cursor: pointer;
                        position: relative;
                        z-index: 50;
                        user-select: none;
                    }

                    .bbgl-header:hover {
                        background-image: linear-gradient(#0099cc, #004d66);
                    }

                    #bbgl-header-icon {
                        transition: filter .2s;
                        filter: drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-header:hover #bbgl-header-icon {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-header-left {
                        display: flex;
                        align-items: center;
                        pointer-events: none;
                    }

                    .bbgl-header-text {
                        margin-left: 2px;
                        font-weight: 700;
                    }

                    .bbgl-short-title {
                        display: inline;
                    }

                    .bbgl-long-title {
                        display: none;
                    }

                    .bbgl-expanded .bbgl-short-title {
                        display: none;
                    }

                    .bbgl-expanded .bbgl-long-title {
                        display: inline;
                    }

                    .bbgl-header-right {
                        display: flex;
                        align-items: center;
                    }

                    .bbgl-custom-icon {
                        font-size: 22px;
                        color: #c0c0c0;
                        cursor: pointer;
                        margin: 0 6px;
                        font-weight: 700;
                        transition: color .2s;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 26px;
                        height: 26px;
                    }

                    .bbgl-custom-icon:hover {
                        color: #fff;
                    }

                    #bbgl-close-btn {
                        margin-left: 12px;
                        margin-right: 16px;
                        position: relative;
                        top: -.5px;
                        left: -.5px;
                    }

                    #bbgl-pop-btn {
                        margin-left: 0;
                        position: relative;
                        top: .5px;
                        left: .5px;
                    }

                    #bbgl-pop-btn svg {
                        pointer-events: bounding-box;
                    }

                    .bbgl-native-icon {
                        cursor: pointer;
                        opacity: 1;
                        transition: filter .2s;
                        filter: drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    .bbgl-native-icon:hover {
                        filter: brightness(1.1) drop-shadow(rgba(0, 0, 0, .25) 0 0 2px);
                    }

                    #bbgl-tooltip {
                        position: fixed;
                        background-color: #464646;
                        color: #ddd;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.5;
                        padding: 6px 8px;
                        border-radius: 5px;
                        box-shadow: none;
                        filter: drop-shadow(0 0 1px rgba(0, 0, 0, .5));
                        z-index: 1000000;
                        pointer-events: none;
                        display: none;
                        white-space: normal;
                        height: auto;
                        width: -moz-fit-content;
                        width: fit-content;
                        max-width: 280px;
                    }

                    #bbgl-tooltip strong {
                        color: #fff;
                        font-weight: 700;
                    }

                    #bbgl-tooltip i {
                        display: block;
                        margin-top: 4px;
                        color: #bbb;
                        font-style: italic;
                        font-size: 11px;
                        font-weight: 400;
                    }

                    .tt-header {
                        color: #999;
                        font-weight: 700;
                        border-bottom: 1px solid #555;
                        padding-bottom: 4px;
                        margin-bottom: 6px;
                        text-align: center;
                        font-size: 11px;
                        letter-spacing: .5px;
                    }

                    .tt-energy {
                        text-align: center;
                        margin-bottom: 6px;
                        color: #ddd;
                        font-size: 11px;
                        font-weight: 700;
                    }

                    .tt-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 15px;
                        font-size: 11px;
                        margin-bottom: 2px;
                    }

                    .tt-label {
                        color: #ccc;
                    }

                    .tt-val {
                        color: ${CONSTANTS.COLORS.GAINS};
                        font-weight: 700;
                    }

                    .tt-total {
                        color: #fff;
                        font-weight: 700;
                    }

                    .tt-sub {
                        font-size: 10px;
                        color: #999;
                    }

                    #bbgl-tooltip-arrow {
                        position: absolute;
                        width: 0;
                        height: 0;
                        border: 10px solid transparent;
                        pointer-events: none;
                        z-index: 1000001;
                    }

                    #bbgl-tooltip.pos-top #bbgl-tooltip-arrow {
                        border-top-color: #444;
                        bottom: -20px;
                        left: 50%;
                        margin-left: -10px;
                    }

                    #bbgl-tooltip.pos-bottom #bbgl-tooltip-arrow {
                        border-bottom-color: #444;
                        top: -20px;
                        left: 50%;
                        margin-left: -10px;
                    }

                    #bbgl-tooltip.pos-left #bbgl-tooltip-arrow {
                        border-left-color: #444;
                        right: -20px;
                        top: 50%;
                        margin-top: -10px;
                    }

                    #bbgl-tooltip.pos-right #bbgl-tooltip-arrow {
                        border-right-color: #444;
                        left: -20px;
                        top: 50%;
                        margin-top: -10px;
                    }

                    #bbgl-api-hud {
                        position: fixed;
                        top: 10px;
                        left: 10px;
                        z-index: 999999;
                        background: rgba(0, 0, 0, .8);
                        color: #76ff03;
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-family: 'Consolas', monospace;
                        font-size: 12px;
                        border: 1px solid #333;
                        pointer-events: none;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, .5);
                    }

                    #bbgl-demo-exit {
                        background-color: #4a1070;
                        background-image: linear-gradient(180deg, #1a0529 0%, #6a1b9a 25%, #4a1070 60%, #4a1070 78%, #1a0529 100%);
                        color: #fff;
                        font-family: "Fjalla One", Arial, sans-serif;
                        font-size: 10px;
                        font-weight: 400;
                        letter-spacing: 1.5px;
                        text-align: center;
                        padding: 4px 0;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .12), inset 0 -1px 0 rgba(0, 0, 0, .6);
                        user-select: none;
                        flex-shrink: 0;
                        transition: background-image .2s;
                        border-top: 1px solid #1a0529;
                        border-bottom: 1px solid #111;
                        width: 100%;
                        border-radius: 0;
                    }

                    #bbgl-demo-exit:hover {
                        background-image: linear-gradient(180deg, #2a0840 0%, #8e24aa 25%, #6a1b9a 60%, #6a1b9a 78%, #2a0840 100%);
                    }

                    #bbgl-demo-exit:active {
                        background-image: linear-gradient(0deg, #8e24aa 0%, #6a1b9a 100%);
                    }

                    .bbgl-demo-x-label {
                        display: none;
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 1px;
                        margin-right: 4px;
                    }

                    .bbgl-expanded .bbgl-demo-x-label {
                        display: inline;
                    }

                    #bbgl-page-demo-exit {
                        color: #ab47bc !important;
                    }

                    #bbgl-page-demo-exit:hover {
                        color: #ce93d8 !important;
                        filter: drop-shadow(0 0 4px rgba(171, 71, 188, .3)) !important;
                    }

                    #bbgl-page-demo-exit .bbgl-demo-x-label {
                        display: inline !important;
                        font-size: 18px;
                    }

                    #bbgl-demo-exit-btn {
                        position: relative !important;
                        top: auto !important;
                        right: auto !important;
                    }

                    .bbgl-expanded #bbgl-demo-exit-btn {
                        width: auto !important;
                        padding: 0 4px;
                        gap: 4px;
                    }

                    #bbgl-content-wrapper {
                        flex: 1;
                        flex-shrink: 0 !important;
                        background-color: #333;
                        border: .1px solid #444;
                        border-top: none;
                        border-radius: 0 0 5px 5px;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        position: relative;
                    }

                    #bbgl-top-panel {
                        flex: 0 0 30%;
                        box-sizing: border-box;
                        /**/
                        background-color: #2b2b2b;
                        box-shadow: inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #111;
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        padding-top: 2px;
                        padding-bottom: 8px;
                        transition: flex-basis .3s, margin-bottom .3s, padding-top .3s;
                        z-index: 25;
                    }

                    .bbgl-tall #bbgl-top-panel {
                        flex: 0 0 40%;
                        margin-bottom: -13.41%;
                        z-index: 25;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, .5), inset 0 0 40px rgba(0, 0, 0, .95);
                        border-bottom: 1px solid #333;
                        padding-top: 18px;
                    }

                    #bbgl-panel.bbgl-tall:not(.bbgl-expanded):not(.bbgl-mode-page) .ledger-content {
                        padding-top: 8px !important;
                    }

                    .bbgl-expanded #bbgl-top-panel {
                        flex: 0 0 28%;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-top-panel {
                        flex: 0 0 38%;
                        margin-bottom: -10.35%;
                        padding-top: 20px;
                    }

                    #bbgl-tall-toggle,
                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        position: absolute;
                        color: rgba(255, 255, 255, .55);
                        cursor: pointer;
                        z-index: 60;
                        user-select: none;
                        transition: all .2s;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    #bbgl-tall-toggle:hover,
                    #bbgl-ledger-toggle:hover,
                    #bbgl-graph-toggle:hover,
                    #bbgl-achievements-toggle:hover,
                    #bbgl-sticker-toggle:hover,
                    #bbgl-copy-btn:hover {
                        color: rgba(255, 255, 255, 1);
                    }

                    #bbgl-tall-toggle {
                        top: 3px;
                        left: 3px;
                        font-size: 15px;
                        font-weight: 700;
                        width: 19px;
                        height: 19px;
                    }

                    #bbgl-ledger-toggle,
                    #bbgl-graph-toggle,
                    #bbgl-achievements-toggle,
                    #bbgl-sticker-toggle,
                    #bbgl-copy-btn {
                        top: 5.5px;
                        width: 14px;
                        height: 14px;
                        z-index: 59;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity .3s cubic-bezier(.25, .8, .25, 1), color .15s, filter .15s, transform .15s;
                    }

                    #bbgl-ledger-toggle svg,
                    #bbgl-graph-toggle svg,
                    #bbgl-achievements-toggle svg,
                    #bbgl-sticker-toggle svg,
                    #bbgl-copy-btn svg {
                        width: 14px;
                        height: 14px;
                        fill: currentColor;
                    }

                    #bbgl-ledger-toggle,
                    #bbgl-ledger-toggle svg,
                    #bbgl-achievements-toggle,
                    #bbgl-achievements-toggle svg,
                    #bbgl-copy-btn,
                    #bbgl-copy-btn svg {
                        width: 13.5px;
                        height: 13.5px;
                    }

                    .viewing-graph #bbgl-graph-toggle,
                    .viewing-achievements #bbgl-achievements-toggle,
                    .viewing-stickers #bbgl-sticker-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    #bbgl-top-panel:not(.viewing-graph):not(.viewing-stickers):not(.viewing-achievements) #bbgl-ledger-toggle {
                        color: #fff !important;
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .7));
                        transform: scale(1.15);
                    }

                    .bbgl-tall #bbgl-ledger-toggle {
                        left: 32px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-graph-toggle {
                        left: 57px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-achievements-toggle {
                        left: 82px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-sticker-toggle {
                        left: 107px;
                        opacity: 1;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-copy-btn {
                        right: 8px;
                        opacity: 1;
                        pointer-events: auto;
                        transform: scale(1.15);
                    }

                    .bbgl-expanded #bbgl-tall-toggle {
                        top: 3px;
                        left: 3px;
                        font-size: 15px;
                        width: 19px;
                        height: 19px;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-ledger-toggle {
                        width: 15.5px;
                        height: 15.5px;
                        left: 32px;
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-graph-toggle {
                        width: 16px;
                        height: 16px;
                        left: clamp(56px, calc(51.6px + 1.45cqi), 60px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-achievements-toggle {
                        width: 15.5px;
                        height: 15.5px;
                        left: clamp(80px, calc(71.2px + 2.9cqi), 88px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-sticker-toggle {
                        width: 16px;
                        height: 16px;
                        left: clamp(104px, calc(90.8px + 4.35cqi), 116px);
                    }

                    .bbgl-expanded.bbgl-tall #bbgl-copy-btn {
                        width: 15.5px;
                        height: 15.5px;
                        right: 10px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        width: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                        height: clamp(14.5px, calc(14.5px + 3.5px * var(--bbgl-page-t)), 18px);
                        top: clamp(4.5px, calc(4.5px + 5.5px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-ledger-toggle {
                        left: 32px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-toggle {
                        left: 62px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-achievements-toggle {
                        left: 92px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-toggle {
                        left: 122px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-copy-btn {
                        right: 12px;
                    }

                    .bbgl-expanded #bbgl-ledger-toggle svg,
                    .bbgl-expanded #bbgl-graph-toggle svg,
                    .bbgl-expanded #bbgl-achievements-toggle svg,
                    .bbgl-expanded #bbgl-sticker-toggle svg,
                    .bbgl-expanded #bbgl-copy-btn svg,
                    .bbgl-mode-page #bbgl-ledger-toggle svg,
                    .bbgl-mode-page #bbgl-graph-toggle svg,
                    .bbgl-mode-page #bbgl-achievements-toggle svg,
                    .bbgl-mode-page #bbgl-sticker-toggle svg,
                    .bbgl-mode-page #bbgl-copy-btn svg {
                        width: 100% !important;
                        height: 100% !important;
                    }

                    #bbgl-top-panel::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 10;
                        box-shadow: inset 1px 1px 1px rgba(255, 255, 255, .2), inset -1px -1px 2px rgba(0, 0, 0, .6);
                        background: radial-gradient(circle at center, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, .5) 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, .1) 2px, rgba(0, 0, 0, .1) 4px);
                    }

                    .glass-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/glass-ovly.jpg');
                        background-size: 100% 100%;
                        background-position: center;
                        opacity: .5;
                        pointer-events: none;
                        mix-blend-mode: screen;
                        z-index: 11;
                        border-radius: inherit;
                    }

                    .ui-floating-label,
                    .ui-floating-summary {
                        position: absolute;
                        bottom: 3px;
                        font-size: 10px;
                        font-weight: 400;
                        pointer-events: none;
                        z-index: 50;
                        transition: font-size .3s;
                    }

                    .ui-floating-label {
                        left: 8px;
                        color: rgba(255, 255, 255, .4);
                        letter-spacing: .5px;
                    }

                    .ui-floating-summary {
                        right: 8px;
                        color: rgba(255, 255, 255, .4);
                        letter-spacing: .3px;
                        text-align: right;
                    }

                    .bbgl-expanded .ui-floating-label,
                    .bbgl-expanded .ui-floating-summary {
                        bottom: 4px;
                        font-size: 12px !important;
                    }

                    .viewing-graph .ui-floating-label,
                    .viewing-graph .ui-floating-summary,
                    .viewing-achievements .ui-floating-label,
                    .viewing-achievements .ui-floating-summary {
                        opacity: 0;
                    }

                    .viewing-stickers .ui-floating-label,
                    .viewing-stickers .ui-floating-summary {
                        display: none;
                    }

                    #bbgl-top-panel.viewing-stickers {
                        box-shadow: none !important;
                        border-bottom: none !important;
                        background-color: transparent !important;
                        padding-bottom: 2px !important;
                    }

                    #bbgl-top-panel.viewing-stickers::after,
                    #bbgl-top-panel.viewing-stickers .glass-overlay {
                        display: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements {
                        border-bottom: none !important;
                    }

                    #bbgl-top-panel.viewing-achievements::after {
                        box-shadow: inset 1px 1px 1px rgba(255, 255, 255, .2) !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements {
                        padding-top: max(0px, calc(clamp(2px, calc(2px + 18px * var(--bbgl-dock-t, 0)), 20px) - calc(2px * var(--bbgl-dock-t, 0)))) !important;
                    }

                    .ledger-content {
                        position: relative;
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 4px 2px;
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 0;
                        transition: opacity .3s;
                        transform-origin: center;
                        scrollbar-width: none;
                    }

                    .viewing-graph #bbgl-ledger-view,
                    .viewing-stickers #bbgl-ledger-view,
                    .viewing-achievements #bbgl-ledger-view {
                        display: none !important;
                    }

                    .bbgl-expanded .ledger-content {
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: minmax(0, 1fr);
                        padding-top: 6px;
                        padding-bottom: 14px;
                    }

                    #bbgl-panel.bbgl-tall.bbgl-expanded .ledger-content {
                        padding-top: 12px;
                    }

                    .stat-column {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                        height: 100%;
                        border-right: 1px solid rgba(255, 255, 255, .05);
                        padding: 0 2px;
                        min-height: 0;
                        --bbgl-f-top-mb: 0;
                        --bbgl-bot-minh: 0;
                    }

                    /**/
                    .stat-column:last-child {
                        border-right: none;
                    }

                    .stat-column .cell-stack {
                        gap: clamp(0px, 1px + .12cqb, 3px);
                    }

                    .stat-column .l-bot {
                        align-items: flex-start;
                    }

                    .col-header,
                    .col-data-block {
                        margin-bottom: 0;
                        flex-shrink: 0;
                        text-align: center;
                        width: 100%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .bbgl-spacer {
                        flex: 1 1 var(--bbgl-col-gap);
                        max-height: var(--bbgl-col-gap);
                        min-height: 0;
                        width: 100%;
                        transition: max-height .3s, flex-basis .3s;
                    }

                    .cell-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: flex-start;
                        line-height: 1.2;
                    }

                    .view-std {
                        display: inline;
                    }

                    .view-exp {
                        display: none;
                    }

                    .bbgl-expanded .view-std,
                    .bbgl-mode-page .view-std {
                        display: none;
                    }

                    .bbgl-expanded .view-exp,
                    .bbgl-mode-page .view-exp {
                        display: inline;
                    }

                    .bbgl-expanded .rates-group,
                    .bbgl-mode-page .rates-group {
                        margin-top: 2px;
                        margin-bottom: -2px;
                    }

                    .rate-pct {
                        display: none !important;
                    }

                    .bbgl-mode-page .rate-pct,
                    .bbgl-expanded.bbgl-tall .rate-pct {
                        display: inline !important;
                    }

                    .l-top {
                        font-size: var(--bbgl-f-top);
                        font-weight: 550;
                        color: #ddd;
                        margin-bottom: var(--bbgl-f-top-mb);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                        letter-spacing: -.5px;
                        transition: font-size .3s;
                    }

                    .l-bot {
                        font-size: var(--bbgl-f-bot);
                        color: #ddd;
                        min-height: var(--bbgl-bot-minh);
                        height: auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        white-space: nowrap;
                        transition: font-size .3s;
                    }

                    .c-label {
                        font-weight: 700;
                        font-family: 'Arial', sans-serif;
                        font-size: var(--bbgl-f-label);
                        text-transform: var(--bbgl-label-case);
                        letter-spacing: 0;
                        transition: font-size .3s;
                    }

                    .c-gain .l-top {
                        color: ${CONSTANTS.COLORS.GAINS};
                        font-weight: 550;
                    }

                    .c-gain .l-bot {
                        color: #bbb;
                        font-style: normal;
                    }

                    .c-total .l-top {
                        color: #fff;
                    }

                    .c-total .l-bot {
                        color: #bbb;
                    }

                    .t-str {
                        color: ${CONSTANTS.COLORS.STR};
                    }

                    .t-def {
                        color: ${CONSTANTS.COLORS.DEF};
                    }

                    .t-spd {
                        color: ${CONSTANTS.COLORS.SPD};
                    }

                    .t-dex {
                        color: ${CONSTANTS.COLORS.DEX};
                    }

                    .t-tot {
                        color: ${CONSTANTS.COLORS.TOT};
                    }

                    #bbgl-graph-container,
                    #bbgl-achievements-container {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        position: relative;
                        z-index: 20;
                    }

                    .viewing-graph #bbgl-graph-container,
                    .viewing-achievements #bbgl-achievements-container {
                        display: flex;
                    }

                    .viewing-graph #bbgl-graph-container {
                        padding: 3px calc(var(--bbgl-gx, 10px) - 2px) 1px calc(var(--bbgl-gx, 10px) - 2px);
                        z-index: 40;
                        /**/
                        transform-origin: center;
                        touch-action: none;
                        cursor: crosshair;
                        min-height: 0;
                        overflow: visible;
                    }

                    .viewing-achievements #bbgl-achievements-container.ledger-content {
                        grid-template-columns: unset !important;
                        grid-template-rows: unset !important;
                        gap: 0 !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        flex: 1 !important;
                        padding: 0 !important;
                    }

                    .g-hud {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2px;
                        z-index: 60;
                        position: relative;
                        min-width: 0;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .g-toggles {
                        display: flex;
                        flex-direction: row;
                        flex-wrap: nowrap;
                        gap: 2px;
                        align-items: center;
                        min-width: 0;
                        flex: 0 1 auto;
                    }

                    .g-pill {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8.5px;
                        padding: .5px 5px;
                        border: 1px solid #444;
                        border-radius: 3px;
                        color: #666;
                        cursor: pointer;
                        text-transform: uppercase;
                        font-weight: 700;
                        align-self: center;
                        background: #1a1a1a;
                        transition: color .2s, background .2s, border-color .2s;
                        user-select: none;
                        white-space: nowrap;
                        line-height: 1;
                        vertical-align: middle;
                    }

                    .g-pill:hover {
                        color: #ccc;
                        border-color: #666;
                    }

                    .g-pill.active {
                        color: var(--pill-c, #fff);
                        background: var(--pill-bg, #333);
                        border-color: var(--pill-c, #888);
                    }

                    .g-pill.p-str {
                        --pill-c: ${CONSTANTS.COLORS.STR};
                        --pill-bg: rgba(50, 100, 198, .1);
                    }

                    .g-pill.p-def {
                        --pill-c: ${CONSTANTS.COLORS.DEF};
                        --pill-bg: rgba(220, 57, 18, .1);
                    }

                    .g-pill.p-spd {
                        --pill-c: ${CONSTANTS.COLORS.SPD};
                        --pill-bg: rgba(255, 153, 0, .1);
                    }

                    .g-pill.p-dex {
                        --pill-c: ${CONSTANTS.COLORS.DEX};
                        --pill-bg: rgba(16, 150, 24, .1);
                    }

                    .g-pill.p-tot {
                        --pill-c: ${CONSTANTS.COLORS.TOT};
                        --pill-bg: rgba(255, 255, 255, .1);
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .g-hud {
                        margin-top: 1px;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                        font-size: 8px;
                        padding: 2px 5px;
                        line-height: 1;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        box-sizing: border-box;
                    }

                    #bbgl-graph-svg {
                        width: 100%;
                        flex: 1;
                        min-height: 0;
                        overflow: visible;
                        pointer-events: none;
                        display: block;
                    }

                    .g-axis {
                        stroke: rgba(255, 255, 255, .1);
                        stroke-width: 1;
                    }

                    .g-path {
                        fill: none;
                        stroke-width: 2;
                        vector-effect: non-scaling-stroke;
                        stroke-linecap: round;
                        transition: d .3s ease;
                    }

                    .g-text {
                        fill: rgba(255, 255, 255, .4);
                        font-size: 9px;
                        font-family: 'Roboto Mono', monospace;
                        user-select: none;
                    }

                    .g-text.x-label {
                        text-anchor: middle;
                        font-family: 'Fjalla One', sans-serif;
                        font-size: 11px;
                        letter-spacing: .5px;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .g-text.x-label {
                        font-size: 10px;
                    }

                    .g-text.y-label {
                        text-anchor: end;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-weight: 500;
                        letter-spacing: .005em;
                    }

                    .g-point-group .g-point-visual {
                        opacity: 0;
                        transition: opacity .1s;
                        stroke-width: 1.5;
                        pointer-events: none;
                    }

                    .g-point-group.active .g-point-visual {
                        opacity: 1;
                    }

                    #bbgl-sticker-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-image: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Stickerbook/stkr-bckgr.png');
                        background-size: cover;
                        background-position: center;
                        z-index: 5;
                        opacity: 0;
                        transition: opacity .3s;
                        pointer-events: none;
                    }

                    .viewing-stickers #bbgl-sticker-bg {
                        opacity: .9;
                    }

                    #bbgl-sticker-container {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        position: relative;
                        padding: 4px;
                        z-index: 40;
                        transform-origin: center;
                        overflow: hidden;
                        justify-content: flex-start;
                    }

                    .sticker-nav-btn {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-60%);
                        width: 20px;
                        height: 25px;
                        background: 0 0;
                        color: #fff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        z-index: 90;
                        font-size: 24px;
                        font-weight: 700;
                        transition: transform .2s, text-shadow .2s;
                        user-select: none;
                        line-height: 1;
                        text-shadow: 0 1px 3px #000;
                    }

                    @media (hover: hover) {
                        .sticker-nav-btn:hover {
                            color: #fff;
                            transform: translateY(-50%) scale(1.3);
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                            filter: none;
                        }
                    }

                    .sticker-nav-btn:active {
                        color: #fff;
                        transform: translateY(-50%) scale(1.3);
                        text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                        filter: none;
                    }

                    .sticker-nav-btn.disabled {
                        opacity: 0;
                        pointer-events: none;
                    }

                    #sticker-prev-btn {
                        left: 0;
                        border-radius: 0 5px 5px 0;
                    }

                    #sticker-next-btn {
                        right: 0;
                        border-radius: 5px 0 0 5px;
                    }

                    .viewing-stickers #bbgl-sticker-container {
                        display: flex;
                    }

                    #bbgl-sticker-grid {
                        position: relative;
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        grid-template-rows: auto auto;
                        width: 100%;
                        flex: 1;
                        align-content: start;
                        padding-top: 0;
                        row-gap: 0;
                    }

                    .sticker-slot {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        overflow: visible;
                        padding: 0;
                        height: 64px;
                        visibility: hidden;
                    }

                    .sticker-slot.active-slot {
                        visibility: visible;
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-slot {
                        height: clamp(65px, calc(65px + 40px * var(--bbgl-page-t)), 105px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-grid {
                        row-gap: clamp(10px, calc(10px + 6px * var(--bbgl-page-t)), 16px);
                        padding-top: clamp(5px, calc(5px + 9px * (1 - var(--bbgl-page-t))), 14px);
                        column-gap: clamp(1px, calc(35px - 5.3cqi - 7px * (1 - var(--bbgl-page-t))), 22px);
                    }

                    .sticker-slot.has-item:hover {
                        cursor: pointer;
                        z-index: 45;
                    }

                    .sticker-img {
                        height: 80%;
                        width: auto;
                        max-width: 140%;
                        object-fit: contain;
                        pointer-events: none;
                        user-select: none;
                        -webkit-user-drag: none;
                        transition: transform .2s, filter 0s;
                        filter: drop-shadow(0 -.5px 0 rgba(0, 0, 0, .3)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .4));
                    }

                    .sticker-slot.locked .sticker-img {
                        filter: brightness(0) invert(1) drop-shadow(0 -.5px 0 rgba(0, 0, 0, .2)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .2));
                        opacity: .9;
                    }

                    .bbgl-expanded .sticker-img,
                    .bbgl-mode-page .sticker-img {
                        height: 100%;
                        max-width: 100%;
                    }

                    .bbgl-expanded .sticker-slot.locked .sticker-img,
                    .bbgl-mode-page .sticker-slot.locked .sticker-img {
                        height: 90%;
                        width: 100%;
                    }

                    #bbgl-sticker-pagination {
                        position: absolute;
                        bottom: 4px;
                        width: 100%;
                        left: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        height: 12px;
                        z-index: 100;
                    }

                    .pg-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, .25);
                        cursor: pointer;
                        transition: all .2s;
                    }

                    .pg-dot.active {
                        background: #fff;
                        transform: scale(1.2);
                        box-shadow: 0 0 5px rgba(255, 255, 255, .5);
                    }

                    #bbgl-sticker-title {
                        display: none;
                        position: absolute;
                        top: 7px;
                        right: 10px;
                        font-size: 12px;
                        color: #333;
                        font-family: 'Fjalla One', sans-serif;
                        letter-spacing: .2px;
                        z-index: 99;
                        pointer-events: none;
                        mix-blend-mode: multiply;
                        text-align: right;
                    }

                    .viewing-stickers #bbgl-sticker-title {
                        display: block;
                    }

                    .bbgl-expanded #bbgl-sticker-title {
                        font-size: 15px;
                        top: 8px;
                        right: 20px;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-title {
                        font-size: clamp(12px, calc(12px + 8px * var(--bbgl-page-t)), 20px);
                        top: clamp(9px, calc(9px + 1px * var(--bbgl-page-t)), 10px);
                        right: clamp(8px, calc(8px + 14px * var(--bbgl-page-t)), 22px);
                    }

                    .copy-hist-btn {
                        position: absolute;
                        top: 4px;
                        right: 5px;
                        width: 14.5px;
                        height: 14.5px;
                        cursor: pointer;
                        z-index: 90;
                        transition: all .2s;
                        user-select: none;
                        opacity: .6;
                        display: none;
                        align-items: center;
                        justify-content: center;
                    }

                    .bbgl-tall .copy-hist-btn,
                    .bbgl-mode-page .copy-hist-btn {
                        display: flex;
                    }

                    .copy-hist-btn svg {
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        transition: all .2s;
                    }

                    .copy-hist-btn:hover {
                        opacity: 1;
                        transform: scale(1.27);
                        filter: drop-shadow(0 0 5px rgba(255, 255, 255, .4));
                    }

                    .viewing-stickers .copy-hist-btn {
                        display: none !important;
                    }

                    /* Copy session + item counters are ledger-only: hide on every non-ledger view. */
                    .viewing-graph .copy-hist-btn,
                    .viewing-achievements .copy-hist-btn {
                        display: none !important;
                    }

                    #bbgl-item-counters {
                        position: absolute;
                        top: 5.5px;
                        right: 10%;
                        display: none;
                        gap: 10px;
                        align-items: center;
                        z-index: 60;
                        pointer-events: none;
                        white-space: nowrap;
                        font-size: 10px;
                        font-weight: 500;
                        color: #bbb;
                        font-family: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        font-variant-numeric: tabular-nums;
                        height: 14px;
                        pointer-events: auto;
                    }

                    .bbgl-tall #bbgl-item-counters,
                    .bbgl-mode-page #bbgl-item-counters {
                        display: flex;
                    }

                    .viewing-graph #bbgl-item-counters,
                    .viewing-achievements #bbgl-item-counters,
                    .viewing-stickers #bbgl-item-counters {
                        display: none !important;
                    }

                    .bbgl-expanded #bbgl-item-counters {
                        font-size: clamp(11px, 2.1cqi, 12px);
                        top: 6px;
                        right: 38px;
                        gap: clamp(4px, calc(-7px + 3.6cqi), 14px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-item-counters {
                        font-size: clamp(8.5px, calc(8.5px + 5.5px * var(--bbgl-page-t)), 14px);
                        gap: clamp(4px, calc(4px + 10px * var(--bbgl-page-t)), 14px);
                        right: clamp(38px, calc(38px + 4px * var(--bbgl-page-t)), 42px);
                        top: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                        height: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                    }

                    #bbgl-item-counters .bbgl-ic {
                        display: inline-flex;
                        align-items: baseline;
                        gap: 3px;
                    }

                    #bbgl-item-counters .bbgl-ic-dyn {
                        display: none;
                    }

                    .bbgl-expanded #bbgl-item-counters .bbgl-ic-dyn,
                    #bbgl-panel.bbgl-mode-page #bbgl-item-counters .bbgl-ic-dyn {
                        display: inline-flex;
                    }

                    #bbgl-item-counters .bbgl-ic-yes {
                        color: #43a047;
                        font-weight: 700;
                    }

                    #bbgl-item-counters .bbgl-ic-no {
                        color: #e53935;
                        font-weight: 700;
                    }

                    #bbgl-item-counters .bbgl-ic-sub {
                        font-size: .82em;
                        opacity: .6;
                        font-weight: 500;
                    }

                    #bbgl-panel.bbgl-mode-page .copy-hist-btn {
                        width: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                        height: clamp(16px, calc(16px + 2px * var(--bbgl-page-t)), 18px);
                        top: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-hud {
                        margin-top: clamp(2px, calc(3px - 1px * var(--bbgl-page-t)), 3px);
                        margin-bottom: clamp(2px, calc(2px + 1px * var(--bbgl-page-t)), 3px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-pill {
                        font-size: clamp(8.8px, calc(8.8px + 1.2px * var(--bbgl-page-t)), 10px);
                        padding: clamp(.5px, calc(.5px + 1px * var(--bbgl-page-t)), 1.5px) clamp(3px, calc(3px + 5px * var(--bbgl-page-t)), 8px);
                        line-height: calc(1.18 + .26 * (1 - var(--bbgl-page-t)));
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-toggles {
                        gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                        align-items: center;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-graph-container .g-text {
                        font-size: clamp(10px, calc(10px + 1px * var(--bbgl-page-t)), 11px);
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sticker-pagination {
                        bottom: -2px;
                        gap: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .pg-dot {
                        width: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                        height: clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-nav-btn {
                        font-size: clamp(24px, calc(24px + 8px * var(--bbgl-page-t)), 32px);
                        width: clamp(22px, calc(22px + 18px * var(--bbgl-page-t)), 40px);
                        height: clamp(26px, calc(26px + 6px * var(--bbgl-page-t)), 32px);
                        margin-top: clamp(0px, calc(4px * (1 - var(--bbgl-page-t))), 4px);
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-prev-btn {
                        left: clamp(0px, calc(6px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-next-btn {
                        right: clamp(0px, calc(6px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-item-viewer {
                        display: none;
                        flex: 1;
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle at center, #2e2e2e 0%, #1a1a1a 100%);
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        border-top: 1px solid #444;
                        overflow: hidden;
                    }

                    #bbgl-item-viewer.active {
                        display: flex;
                    }

                    .viewer-window {
                        width: 95%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }

                    .viewer-stage {
                        width: 100%;
                        height: 100%;
                        position: center;
                        perspective: 400px;
                        perspective-origin: center 50px;
                        cursor: grab;
                    }

                    .viewer-stage:active {
                        cursor: grabbing;
                    }

                    .viewer-pedestal {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform-style: preserve-3d;
                    }

                    .viewer-obj {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transform-style: preserve-3d;
                        transform-origin: center 75%;
                        transform: rotateX(8deg) scale(.85) translateY(8px);
                    }

                    .bbgl-expanded:not(.bbgl-mode-page) .viewer-obj {
                        transform: rotateX(5deg) scale(clamp(.75, calc(.75 + .08 * (576px - 100cqi) / 256px), .83)) translateY(-15px);
                    }

                    .viewer-obj img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }

                    .layer-front {
                        position: absolute;
                        z-index: 2;
                        width: 100%;
                        height: 100%;
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .layer-back {
                        position: absolute;
                        z-index: 1;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                        background: #eee;
                        background-image: linear-gradient(to bottom, rgba(255, 255, 255, .8) 0%, rgba(200, 200, 200, 1) 100%);
                        transform: rotateY(180deg) scaleX(-1) translateZ(-1px);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                        pointer-events: none;
                        filter: brightness(var(--back-brightness, 1));
                    }

                    .viewer-obj.is-image .layer-front::after {
                        content: "";
                        position: absolute;
                        inset: 0;
                        -webkit-mask-image: var(--bg-mask);
                        mask-image: var(--bg-mask);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                        background: linear-gradient(115deg, transparent 25%, rgba(0, 255, 255, .4) 40%, rgba(255, 255, 255, .5) 50%, rgba(255, 0, 255, .4) 60%, transparent 75%);
                        background-size: 250% 100%;
                        background-position: var(--sheen-pos, 0% 0%);
                        mix-blend-mode: overlay;
                        opacity: var(--sheen-opacity, 1);
                        pointer-events: none;
                        transition: opacity .1s;
                    }

                    .viewer-info-overlay {
                        position: absolute;
                        top: calc(50px - var(--bbgl-viewer-title-top-shift));
                        left: 10px;
                        text-align: left;
                        pointer-events: none;
                        z-index: 50;
                    }

                    .vi-name {
                        font-size: 11px;
                        color: #fff;
                        font-weight: 700;
                        text-transform: none;
                    }

                    .bbgl-expanded .viewer-info-overlay {
                        top: calc(75px - var(--bbgl-viewer-title-top-shift));
                        left: 15px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .viewer-info-overlay {
                        top: calc(10.35cqi + clamp(10px, 4cqi, 15px) - var(--bbgl-viewer-title-top-shift)) !important;
                        left: clamp(10px, 4cqi, 15px) !important;
                    }

                    .bbgl-expanded .vi-name {
                        font-size: 15px;
                    }

                    .vi-count {
                        font-size: 9px;
                        color: #aaa;
                        margin-bottom: 2px;
                    }

                    #btn-close-viewer {
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: 0 0;
                        border: 1px solid #555;
                        color: #888;
                        font-size: 10px;
                        padding: 2px 6px;
                        cursor: pointer;
                        border-radius: 3px;
                        pointer-events: auto;
                        transition: all .2s;
                    }

                    #btn-close-viewer:hover {
                        border-color: #fff;
                        color: #fff;
                        background: #333;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-item-viewer {
                        aspect-ratio: auto;
                    }

                    .bbgl-mode-page #bbgl-item-viewer.active {
                        display: flex !important;
                        width: 100% !important;
                        height: calc(100vh - 420px + 60px * var(--bbgl-page-t)) !important;
                        min-height: clamp(300px, calc(300px + 200px * var(--bbgl-page-t)), 500px) !important;
                        border: none !important;
                        border-radius: 0 0 5px 5px !important;
                        box-sizing: border-box !important;
                        flex: none !important;
                    }

                    #bbgl-page-container .bbgl-mode-page:has(#bbgl-item-viewer.active) {
                        flex: none !important;
                    }

                    .bbgl-mode-page .viewer-info-overlay {
                        top: clamp(calc(10px - var(--bbgl-viewer-title-top-shift)), calc(10px + 6px * var(--bbgl-page-t) - var(--bbgl-viewer-title-top-shift)), calc(16px - var(--bbgl-viewer-title-top-shift))) !important;
                        left: clamp(10px, calc(10px + 5px * var(--bbgl-page-t)), 15px) !important;
                    }

                    .bbgl-mode-page .vi-name {
                        font-size: clamp(14px, calc(14px + 2px * var(--bbgl-page-t)), 16px) !important;
                    }

                    .bbgl-mode-page .vi-count {
                        font-size: clamp(8px, calc(8px + 1px * var(--bbgl-page-t)), 9px) !important;
                    }

                    .bbgl-mode-page #btn-close-viewer {
                        font-size: clamp(9px, calc(9px + 1px * var(--bbgl-page-t)), 10px) !important;
                        padding: clamp(2px, calc(2px + 0 * var(--bbgl-page-t)), 2px) clamp(5px, calc(5px + 1px * var(--bbgl-page-t)), 6px) !important;
                        top: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                        right: clamp(4px, calc(4px + 1px * var(--bbgl-page-t)), 5px) !important;
                    }

                    .bbgl-mode-page .viewer-window,
                    .bbgl-mode-page .viewer-stage,
                    .bbgl-mode-page .viewer-pedestal {
                        width: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%) !important;
                        height: clamp(85%, calc(85% + 7% * var(--bbgl-page-t)), 92%) !important;
                    }

                    .bbgl-mode-page .viewer-obj {
                        transform: rotateX(5deg) scale(calc(1.22 + .33 * (1 - var(--bbgl-page-t)))) translateY(clamp(20px, calc(20px + 5px * (1 - var(--bbgl-page-t))), 25px)) translateX(clamp(10px, calc(10px + 10px * var(--bbgl-page-t)), 20px)) !important;
                    }

                    .bbgl-mode-page #bbgl-sticker-pagination {
                        bottom: -2px !important;
                        padding-bottom: 0;
                    }

                    #bbgl-bottom-panel {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 0;
                        box-sizing: border-box;
                        overflow: hidden;
                        will-change: transform;
                    }

                    .bbgl-header-wrapper {
                        position: relative;
                        padding: 4px 0 2px 10px;
                        margin-bottom: 0;
                        border-bottom: none;
                        flex: 0 0 85px;
                        overflow: visible;
                        z-index: 20;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-end;
                        transition: flex .3s cubic-bezier(.25, 1, .5, 1);
                    }

                    .bbgl-header-wrapper::before {
                        content: "";
                        position: absolute;
                        top: 4px;
                        left: 4px;
                        right: 4px;
                        bottom: 0;
                        width: auto;
                        height: auto;
                        background-image: url('${ASSETS.HEADER_IMG}');
                        background-size: 100% 100%;
                        background-position: center;
                        opacity: 1;
                        z-index: -1;
                        pointer-events: none;
                        border-radius: 3px 3px 0 0;
                        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-header-wrapper {
                        flex: 0 0 130px;
                    }

                    .bbgl-month-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 0 8px 0 2px;
                        gap: 8px;
                        position: relative;
                        margin-bottom: 1px;
                        transition: margin-bottom .3s ease;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-month-header {
                        margin-bottom: 6px;
                        gap: clamp(6px, 2.08cqi, 12px);
                    }

                    .arrow-btn {
                        background: 0 0;
                        border: none;
                        color: #fff;
                        font-size: 18px;
                        cursor: pointer;
                        padding: 0 5px;
                        font-weight: 700;
                        user-select: none;
                        line-height: 1;
                        text-shadow: 0 1px 3px #000;
                        align-self: flex-end;
                        margin-bottom: 4px;
                        transition: transform .2s, text-shadow .2s;
                    }

                    @media (hover: hover) {
                        .arrow-btn:hover {
                            color: #fff;
                            transform: scale(1.3);
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                        }
                    }

                    .arrow-btn:active {
                        color: #fff;
                        transform: scale(1.3);
                        text-shadow: 0 0 8px rgba(255, 255, 255, .8);
                    }

                    .title-group {
                        flex-grow: 1;
                        text-align: left;
                        padding-left: 2px;
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-start;
                        align-items: center;
                        gap: 8px;
                    }

                    .title-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 3px;
                    }

                    #bbgl-panel.bbgl-expanded .title-stack {
                        gap: 6px;
                    }

                    #bbgl-panel.bbgl-mode-page .title-stack {
                        gap: clamp(6px, calc(6px + 4px * var(--bbgl-page-t)), 10px);
                    }

                    .all-time-btn {
                        width: 20px;
                        height: 20px;
                        color: #ffd700;
                        /**/
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all .2s;
                        margin-top: 4px;
                        margin-bottom: -4px;
                    }

                    .all-time-btn:hover {
                        transform: scale(1.1);
                        filter: drop-shadow(0 0 5px rgba(255, 215, 0, .6));
                    }

                    .all-time-btn svg {
                        width: 100%;
                        height: 100%;
                        fill: currentColor;
                        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .8));
                    }

                    .bbgl-expanded .all-time-btn {
                        width: 30px;
                        height: 30px;
                    }

                    #bbgl-panel.bbgl-mode-page .all-time-btn {
                        width: clamp(28px, calc(28px + 12px * var(--bbgl-page-t)), 40px);
                        height: clamp(28px, calc(28px + 12px * var(--bbgl-page-t)), 40px);
                    }

                    .header-row {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        position: relative;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .title-stack > .header-row:nth-child(2) {
                        margin-bottom: -2px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .title-stack > .header-row:nth-child(2) {
                        margin-bottom: -4px;
                    }

                    .stats-btn {
                        width: 18px;
                        height: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        opacity: .9;
                        transition: all .2s;
                        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, .8));
                    }

                    .stats-btn:hover {
                        /**/
                        opacity: 1;
                        transform: scale(1.15);
                        filter: drop-shadow(0 0 4px rgba(255, 255, 255, .6));
                    }

                    .stats-btn svg {
                        fill: #fff;
                        width: 100%;
                        height: 100%;
                    }

                    .header-trigger {
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 400;
                        color: #fff;
                        cursor: pointer;
                        text-transform: capitalize;
                        user-select: none;
                        text-shadow: 0 2px 4px #000;
                        transition: font-size .3s;
                        line-height: 1;
                    }

                    .header-trigger:hover {
                        opacity: .8;
                    }

                    .header-trigger::after {
                        content: '▼';
                        font-size: 8px;
                        opacity: .5;
                        margin-left: 3px;
                        vertical-align: middle;
                        position: relative;
                        top: -1px;
                    }

                    .header-trigger.disabled {
                        cursor: default;
                        pointer-events: none;
                    }

                    .header-trigger.disabled::after {
                        display: none;
                    }

                    /**/
                    #year-trigger {
                        font-size: 10px;
                    }

                    #month-trigger {
                        font-size: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #year-trigger {
                        font-size: 14px;
                    }

                    #bbgl-panel.bbgl-expanded #month-trigger {
                        font-size: 20px;
                    }

                    #bbgl-panel.bbgl-expanded .stats-btn {
                        width: 18px;
                        height: 18px;
                    }

                    #bbgl-panel.bbgl-mode-page #year-trigger {
                        font-size: clamp(14px, calc(14px + 6px * var(--bbgl-page-t)), 20px);
                    }

                    #bbgl-panel.bbgl-mode-page #month-trigger {
                        font-size: clamp(24px, calc(24px + 6px * var(--bbgl-page-t)), 30px);
                    }

                    #bbgl-panel.bbgl-mode-page .stats-btn {
                        width: clamp(24px, calc(24px + 2px * var(--bbgl-page-t)), 26px);
                        height: clamp(24px, calc(24px + 2px * var(--bbgl-page-t)), 26px);
                    }

                    #bbgl-panel.bbgl-mode-page .arrow-btn {
                        font-size: clamp(20px, calc(20px + 8px * var(--bbgl-page-t)), 28px);
                        margin-bottom: clamp(4px, calc(4px + 2px * var(--bbgl-page-t)), 6px);
                    }

                    #bbgl-panel.bbgl-mode-page .header-trigger::after {
                        font-size: clamp(10px, calc(10px + 2px * var(--bbgl-page-t)), 12px);
                    }

                    .bbgl-dropdown-menu {
                        position: absolute;
                        top: 100%;
                        left: 0;
                        background: #222;
                        border: 1px solid #444;
                        border-radius: 4px;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, .95);
                        z-index: 100;
                        display: none;
                        padding: 4px;
                        gap: 2px;
                    }

                    .bbgl-dropdown-menu.show {
                        display: grid;
                    }

                    #bbgl-month-dropdown {
                        grid-template-columns: repeat(3, 1fr);
                        min-width: 140px;
                    }

                    #bbgl-year-dropdown {
                        display: none;
                        flex: 1;
                        flex-direction: column;
                        width: max-content;
                        min-width: 60px;
                    }

                    #bbgl-year-dropdown.show {
                        display: flex;
                    }

                    .drop-item {
                        padding: 8px 12px;
                        font-size: 11px;
                        color: #999;
                        cursor: pointer;
                        text-align: center;
                        border-radius: 3px;
                    }

                    #bbgl-panel.bbgl-expanded .drop-item {
                        font-size: 13px;
                    }

                    .drop-item:hover {
                        background: #333;
                        color: #fff;
                    }

                    .drop-item.active {
                        background: #ff5722;
                        color: #fff;
                    }

                    .bbgl-grid-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        padding: 0 2px;
                        overflow: hidden;
                        min-height: 0;
                        position: relative;
                        z-index: 1;
                        transition: padding .3s ease;
                    }

                    .bbgl-week-row {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        text-align: center;
                        color: #888;
                        font-size: 10px;
                        margin-bottom: 0;
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        padding-top: 1px;
                        border-top: none;
                        flex: 0 0 auto;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-week-row {
                        font-size: 13px;
                        padding-top: 5px;
                        margin-bottom: 2px;
                    }

                    #bbgl-panel.bbgl-mode-page .bbgl-week-row {
                        font-size: clamp(11px, calc(11px + 4px * var(--bbgl-page-t)), 15px);
                        padding-top: clamp(3px, calc(3px + 5px * var(--bbgl-page-t)), 8px);
                        margin-bottom: clamp(2px, calc(2px + 2px * var(--bbgl-page-t)), 4px);
                    }

                    .bbgl-week-row span {
                        border-right: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-week-row span:last-child {
                        border-right: none;
                    }

                    .calendar-wrapper {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        overflow-y: auto;
                        overflow-x: hidden;
                        position: relative;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                        background: #333;
                    }

                    .bbgl-cal-container {
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        touch-action: pan-y;
                        border-top: 1px solid rgba(255, 255, 255, .05);
                        border-left: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-row-slice {
                        display: flex;
                        width: 100%;
                        background-image: var(--bg-url);
                        background-size: 100% calc(100% * var(--total-rows));
                        background-position: center calc(var(--row-idx) * 100% / (var(--total-rows) - 1));
                        background-repeat: no-repeat;
                    }

                    .bbgl-day-cell {
                        flex: 1;
                        aspect-ratio: 1/1;
                        display: block;
                        position: relative;
                        cursor: pointer;
                        background: 0 0;
                        box-shadow: none;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        border-right: 1px solid rgba(255, 255, 255, .05);
                        transition: transform .1s;
                        overflow: hidden;
                        user-select: none;
                        -webkit-user-select: none;
                    }

                    .bbgl-day-cell.empty {
                        background: 0 0;
                        box-shadow: none;
                        cursor: default;
                        pointer-events: none;
                    }

                    .bbgl-day-cell.is-plate {
                        z-index: 2;
                        border-bottom: 1px solid rgba(0, 0, 0, .4);
                        border-right: 1px solid rgba(0, 0, 0, .4);
                    }

                    .bbgl-day-cell.ghost-cell .jewel-wrapper {
                        opacity: .6;
                    }

                    .jewel-wrapper {
                        position: absolute;
                        top: 50%;
                        left: 53%;
                        width: 80%;
                        height: 78%;
                        transform: translate(-50%, -50%);
                        pointer-events: none;
                        z-index: 10;
                        filter: drop-shadow(0 3px 2px rgba(0, 0, 0, .5));
                    }

                    .jewel-asset {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        position: absolute;
                        top: 0;
                        left: 0;
                    }

                    .jewel-shine {
                        position: absolute;
                        inset: 0;
                        pointer-events: none;
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    @keyframes gold-roll {
                        0% {
                            background-position: 200% 0%;
                            opacity: 0
                        }

                        15% {
                            opacity: 1
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: 1
                        }
                    }

                    .jewel-type-gold .jewel-asset {
                        transform: rotate(90deg) scale(1.25) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-gold .jewel-shine {
                        transform: scale(1.2);
                        filter: brightness(1.2);
                        background: linear-gradient(135deg, transparent 25%, rgba(255, 240, 180, 1) 45%, rgba(255, 255, 255, 1.0) 50%, rgba(255, 240, 180, 1) 55%, transparent 75%);
                        background-size: 200% auto;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        transition: opacity .2s;
                    }

                    .jewel-type-green .jewel-asset {
                        transform: scale(1.23) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-green .jewel-shine {
                        transform: scale(1.18);
                        background: linear-gradient(120deg, transparent 10%, rgba(0, 220, 110, .4) 28%, rgba(180, 255, 210, .95) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(180, 255, 210, .95) 60%, rgba(0, 220, 110, .4) 72%, transparent 90%);
                        background-size: 300% auto;
                        mix-blend-mode: screen;
                        opacity: 0;
                    }

                    .jewel-type-green .jewel-shine-over {
                        position: absolute;
                        z-index: 3;
                        width: 100%;
                        height: 100%;
                        transform: scale(1.23);
                        background: linear-gradient(120deg, transparent 0%, rgba(120, 255, 180, .5) 41%, rgba(255, 255, 255, .7) 50%, rgba(120, 255, 180, .5) 59%, transparent 100%);
                        background-size: 300% auto;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        -webkit-mask-image: var(--jewel-mask);
                        mask-image: var(--jewel-mask);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    .jewel-type-diamond .jewel-asset {
                        transform-origin: bottom left;
                        transform: translate(-6%, 6%) scale(1.08, 1.06) translateZ(0);
                        backface-visibility: hidden;
                        -webkit-backface-visibility: hidden;
                    }

                    .jewel-type-diamond .jewel-shine {
                        transform-origin: bottom left;
                        transform: translate(-3%, 3%) scale(1.02, 1.00);
                        background: linear-gradient(120deg, transparent 10%, rgba(0, 220, 110, .4) 28%, rgba(180, 255, 210, .95) 40%, rgba(255, 255, 255, 1.0) 50%, rgba(180, 255, 210, .95) 60%, rgba(0, 220, 110, .4) 72%, transparent 90%);
                        background-size: 300% auto;
                        mix-blend-mode: screen;
                        opacity: 0;
                    }

                    .jewel-type-diamond .jewel-shine-over {
                        position: absolute;
                        z-index: 3;
                        width: 100%;
                        height: 100%;
                        transform-origin: bottom left;
                        transform: translate(-3%, 3%) scale(1.02, 1.00);
                        background: linear-gradient(120deg, transparent 0%, rgba(120, 255, 180, .5) 41%, rgba(255, 255, 255, .7) 50%, rgba(120, 255, 180, .5) 59%, transparent 100%);
                        background-size: 300% auto;
                        mix-blend-mode: soft-light;
                        opacity: 0;
                        -webkit-mask-image: var(--jewel-mask);
                        mask-image: var(--jewel-mask);
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    @keyframes green-flash {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .9
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .75
                        }
                    }

                    @keyframes green-flash-over {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .72
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .95
                        }
                    }

                    @keyframes diamond-flash {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .9
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .75
                        }
                    }

                    @keyframes diamond-flash-over {
                        0% {
                            background-position: 250% 0%;
                            opacity: 0
                        }

                        20% {
                            opacity: .72
                        }

                        100% {
                            background-position: 50% 0%;
                            opacity: .95
                        }
                    }

                    .sticker-wrapper {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 80%;
                        height: 80%;
                        transform: translate(-50%, -50%) rotate(var(--rot, 0deg));
                        pointer-events: none;
                        z-index: 15;
                        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5));
                    }

                    .cell-sticker-deco {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        filter: brightness(.9) sepia(.2) contrast(1.1);
                        transition: transform .2s;
                    }

                    .new-sticker-post-it {
                        position: absolute;
                        top: 4%;
                        left: 4%;
                        width: 92%;
                        height: 92%;
                        background: url('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/new-stkr.png') no-repeat center / contain;
                        z-index: 20;
                        filter: drop-shadow(-2px 4px 5px rgba(0, 0, 0, .4));
                        transform-origin: top right;
                        transition: transform .6s cubic-bezier(.5, 0, 1, 1);
                        cursor: pointer;
                        transform: rotate(-5deg);
                    }

                    .post-it-rip {
                        transform: translateX(250%) translateY(-80%) rotate(75deg) scale(1.3) !important;
                        pointer-events: none;
                    }

                    .sticker-shine {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(200, 250, 255, .001) 30%, rgba(255, 255, 255, .01) 50%, rgba(255, 200, 220, .001) 70%, rgba(255, 255, 255, 0) 100%);
                        background-size: 400% 400%;
                        background-position: var(--bg-x, 50%) var(--bg-y, 50%);
                        mix-blend-mode: overlay;
                        opacity: 0;
                        border-radius: 4px;
                        -webkit-mask-mode: alpha;
                        mask-mode: alpha;
                        -webkit-mask-size: contain;
                        mask-size: contain;
                        -webkit-mask-repeat: no-repeat;
                        mask-repeat: no-repeat;
                        -webkit-mask-position: center;
                        mask-position: center;
                    }

                    @keyframes bbgl-auto-shimmer {
                        0% {
                            opacity: .85;
                            background-position: 0% 0%
                        }

                        100% {
                            opacity: .85;
                            background-position: 100% 100%
                        }
                    }

                    @keyframes bbgl-slide-in-l {
                        from {
                            transform: translateX(-100%)
                        }

                        to {
                            transform: translateX(0)
                        }
                    }

                    @keyframes bbgl-slide-in-r {
                        from {
                            transform: translateX(100%)
                        }

                        to {
                            transform: translateX(0)
                        }
                    }

                    @keyframes bbgl-slide-out-l {
                        from {
                            transform: translateX(0)
                        }

                        to {
                            transform: translateX(-100%)
                        }
                    }

                    @keyframes bbgl-slide-out-r {
                        from {
                            transform: translateX(0)
                        }

                        to {
                            transform: translateX(100%)
                        }
                    }

                    .bbgl-cal-ghost {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        pointer-events: none;
                        z-index: 10;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-gold .jewel-shine {
                        opacity: 1;
                        animation: gold-roll 1.2s cubic-bezier(.3, 0, .55, 1) 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-green .jewel-shine {
                        opacity: 1;
                        animation: green-flash 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-diamond .jewel-shine {
                        opacity: 1;
                        animation: diamond-flash 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-green .jewel-shine-over {
                        opacity: 1;
                        animation: green-flash-over 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .jewel-type-diamond .jewel-shine-over {
                        opacity: 1;
                        animation: diamond-flash-over 1.7s ease-out 1 forwards;
                    }

                    .bbgl-day-cell:is(.shimmer-active, .is-viewing) .sticker-shine {
                        animation: bbgl-auto-shimmer 2.4s cubic-bezier(.3, 0, .55, 1) 2 alternate forwards;
                        opacity: 1;
                    }

                    .day-num {
                        position: absolute;
                        top: 3px;
                        left: 2px;
                        font-size: 10px;
                        width: 18px;
                        height: 18px;
                        color: #fff;
                        font-weight: 400;
                        font-family: 'Fjalla One', 'Arial', sans-serif;
                        pointer-events: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        transition: all .2s;
                        z-index: 20;
                    }

                    .bbgl-day-cell.ghost-cell .day-num {
                        color: #999;
                    }

                    body:not(.is-touch-device) .bbgl-day-cell:not(.empty):not(.is-viewing):hover .day-num,
                    .bbgl-day-cell:not(.empty):not(.is-viewing).is-scrub-hovered .day-num {
                        color: #fff;
                        background: #555;
                        transform: scale(1);
                    }

                    .bbgl-day-cell.is-viewing .day-num {
                        color: #fff;
                        background: #888;
                        transform: none;
                        z-index: 50;
                        font-size: 12px !important;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-day-cell.is-viewing .day-num {
                        font-size: 19px !important;
                    }

                    .bbgl-weekly-anchor {
                        width: 100%;
                        height: 6px;
                        position: relative;
                        z-index: 20;
                    }

                    .bbgl-weekly-track {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        height: 8px;
                        display: flex;
                        cursor: pointer;
                        transition: height .2s cubic-bezier(.18, .89, .32, 1.28);
                        border-radius: 0 4px 4px 0;
                        overflow: hidden;
                        pointer-events: auto;
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255, 255, 255, .03) 1px, rgba(255, 255, 255, .03) 2px), linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%);
                        box-shadow: inset 0 2px 5px rgba(0, 0, 0, .8), inset 0 -1px 0 rgba(255, 255, 255, .05), 0 0 1px #000;
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track:hover,
                    .bbgl-weekly-track.is-scrub-hovered {
                        height: 14px;
                        z-index: 100;
                    }

                    .bbgl-weekly-track.is-viewing {
                        height: 14px;
                        z-index: 80;
                        box-shadow: 0 0 5px rgba(255, 255, 255, .3), inset 0 2px 5px rgba(0, 0, 0, .8);
                    }

                    .bbgl-weekly-track.is-viewing .bbgl-track-label {
                        opacity: 1;
                    }

                    .bbgl-weekly-track.track-solidified {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #333 0%, #555 30%, #999 60%, #555 70%, #222 100%);
                        box-shadow: inset 0 0 2px rgba(255, 255, 255, .2), 0 1px 2px rgba(0, 0, 0, .8);
                        border-top: 1px solid rgba(255, 255, 255, .1);
                        z-index: 1;
                    }

                    .bbgl-weekly-track.track-solidified .bbgl-seg {
                        box-shadow: none;
                    }

                    .bbgl-weekly-track.track-polished {
                        box-shadow: 0 1px 3px rgba(0, 0, 0, .5);
                    }

                    .bbgl-weekly-track.track-polished::after {
                        content: "";
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .5), transparent);
                        opacity: .7;
                        pointer-events: none;
                        z-index: 50;
                        animation: bbgl-sheen-loop 7s linear infinite;
                    }

                    @keyframes bbgl-sheen-loop {
                        0% {
                            transform: skewX(-20deg) translateX(-150%)
                        }

                        21% {
                            transform: skewX(-20deg) translateX(250%)
                        }

                        21.01%,
                        100% {
                            transform: skewX(-20deg) translateX(-150%)
                        }
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-day-cell.is-viewing :is(.jewel-type-gold .jewel-shine, .jewel-type-green .jewel-shine, .jewel-type-green .jewel-shine-over, .jewel-type-diamond .jewel-shine, .jewel-type-diamond .jewel-shine-over, .sticker-shine) {
                        animation: none !important;
                        opacity: 0 !important;
                    }

                    #bbgl-panel.bbgl-no-animations .bbgl-weekly-track.track-polished::after {
                        display: none;
                    }

                    #bbgl-panel.bbgl-no-rates .g-pill[data-val="rates"] {
                        display: none;
                    }

                    #bbgl-panel.bbgl-no-rates .c-gain.cell-stack,
                    #bbgl-panel.bbgl-no-rates .c-gain {
                        justify-content: center;
                    }

                    #bbgl-panel.bbgl-no-rates .c-gain .l-bot {
                        min-height: 0;
                    }

                    .bbgl-seg {
                        height: 100%;
                        box-sizing: border-box;
                        position: relative;
                        border: none;
                    }

                    .bbgl-seg.seg-rounded-end {
                        border-top-right-radius: 10px;
                        border-bottom-right-radius: 10px;
                        box-shadow: 2px 0 3px rgba(0, 0, 0, .5);
                        z-index: 5;
                    }

                    .seg-brushed-green,
                    .seg-brushed-gold,
                    .seg-brushed-diamond {
                        box-shadow: inset 0 0 2px rgba(0, 0, 0, .5);
                        border-top: 1px solid rgba(255, 255, 255, .1);
                    }

                    .seg-brushed-green {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #203a10 0%, #355e1a 30%, #609438 60%, #355e1a 70%, #15290a 100%);
                    }

                    .seg-brushed-gold {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .15) 1px, rgba(0, 0, 0, .15) 2px), linear-gradient(180deg, #3e2b05 0%, #6b4c0a 30%, #aa8530 60%, #6b4c0a 70%, #2e1f02 100%);
                    }

                    .seg-brushed-diamond {
                        background: repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(0, 0, 0, .2) 1px, rgba(0, 0, 0, .2) 2px), linear-gradient(110deg, rgba(255, 100, 180, .6) 0%, rgba(100, 255, 180, .6) 33%, rgba(100, 180, 255, .6) 66%, rgba(200, 100, 255, .6) 100%), linear-gradient(180deg, #111 0%, #555 35%, #bbb 45%, #bbb 55%, #555 65%, #111 100%);
                        background-blend-mode: normal, overlay, normal;
                    }

                    .seg-polished-green {
                        background: linear-gradient(180deg, #0d2b05 0%, #3a7a13 35%, #aaff66 45%, #3a7a13 65%, #0d2b05 100%);
                    }

                    .seg-polished-gold {
                        background: linear-gradient(180deg, #3d2200 0%, #8f6205 35%, #fff7cc 45%, #fff7cc 55%, #8f6205 65%, #3d2200 100%);
                    }

                    .seg-polished-diamond {
                        background: linear-gradient(110deg, rgba(255, 80, 180, .9) 0%, rgba(80, 255, 180, .9) 33%, rgba(80, 180, 255, .9) 66%, rgba(200, 80, 255, .9) 100%), linear-gradient(180deg, #111 0%, #777 35%, #fff 45%, #fff 55%, #777 65%, #111 100%);
                        background-blend-mode: overlay, normal;
                    }

                    .bbgl-track-label {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        justify-content: center;
                        display: flex;
                        align-items: center;
                        font-size: 10.5px;
                        font-family: 'Fjalla One', 'Arial Narrow', sans-serif;
                        font-weight: 700;
                        color: #fff;
                        text-shadow: 0 0 3px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 1);
                        letter-spacing: 0.5px;
                        opacity: 0;
                        pointer-events: none;
                        transition: opacity .2s;
                        white-space: nowrap;
                        z-index: 60;
                    }

                    body:not(.is-touch-device) .bbgl-weekly-track:hover .bbgl-track-label,
                    .bbgl-weekly-track.is-scrub-hovered .bbgl-track-label {
                        opacity: 1;
                    }

                    .bbgl-ach-row.is-scrub-hovered {
                        background: rgba(255, 255, 255, .04);
                    }

                    .sticker-slot.has-item.is-scrub-hovered {
                        z-index: 45;
                    }

                    #bbgl-settings-view,
                    #bbgl-welcome-view {
                        background: #222;
                        color: #ddd;
                        display: none;
                        flex-direction: column;
                        height: 100%;
                        position: relative;
                        overflow: hidden !important;
                        padding: 0 !important;
                    }

                    #bbgl-settings-view.active-view,
                    #bbgl-welcome-view.active-view {
                        display: flex;
                    }

                    .bbgl-author-block {
                        margin: 8px 10px 10px;
                        padding: 8px 10px;
                        background: #2a2a2a;
                        border: 1px solid #3a3a3a;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        color: #aaa;
                        line-height: 1.6;
                    }

                    .bbgl-author-block strong {
                        color: #ddd;
                        display: block;
                        margin-bottom: 4px;
                        font-size: 13px;
                    }

                    /* CSP-safe author link (replaces inline onmouseover/onmouseout handlers). */
                    .bbgl-author-link {
                        color: #69f0ae;
                        text-decoration: none;
                        border-bottom: 1px dotted rgba(105, 240, 174, 0.4);
                        transition: border-color .2s;
                    }

                    .bbgl-author-link:hover {
                        border-bottom-color: #69f0ae;
                    }

                    .bbgl-settings-scroll-area {
                        flex: 1;
                        overflow-y: auto;
                        overflow-x: hidden;
                        padding: 8px;
                        width: 100%;
                        box-sizing: border-box;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    /**/
                    .ledger-content::-webkit-scrollbar,
                    .calendar-wrapper::-webkit-scrollbar,
                    .bbgl-settings-scroll-area::-webkit-scrollbar {
                        display: none;
                    }

                    .bbgl-mask-host {
                        position: relative;
                    }

                    .bbgl-mask-active::after {
                        content: attr(data-mask-text);
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, .65);
                        color: #ddd;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        font-weight: 700;
                        text-align: center;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 20px;
                        box-sizing: border-box;
                        z-index: 50;
                        pointer-events: all;
                        border-radius: 0 0 5px 5px;
                    }

                    .bbgl-init-locked #bbgl-settings-btn,
                    .bbgl-init-locked #bbgl-page-settings {
                        display: none !important;
                    }

                    .bbgl-ack-check {
                        display: inline-flex;
                        width: 14px;
                        height: 14px;
                        color: #69f0ae;
                        flex: 0 0 auto;
                        margin-top: 2px;
                    }

                    .bbgl-ack-check svg {
                        width: 100%;
                        height: 100%;
                    }

                    .bbgl-modal-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 9999999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(0, 0, 0, .7);
                        backdrop-filter: blur(2px);
                        -webkit-backdrop-filter: blur(2px);
                        padding: 20px;
                        box-sizing: border-box;
                        overflow-y: auto;
                    }

                    .bbgl-modal-window {
                        background: #2a2a2a;
                        border: 1px solid #444;
                        border-radius: 5px;
                        width: min(560px, 92vw);
                        max-height: 90vh;
                        overflow-y: auto;
                        overflow-x: hidden;
                        position: relative;
                        padding: 8px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, .6);
                        box-sizing: border-box;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    .bbgl-modal-window::-webkit-scrollbar {
                        display: none;
                    }

                    .bbgl-modal-scrollbox {
                        max-height: 240px;
                        overflow-y: auto;
                        overflow-x: hidden;
                        border: 1px solid #1a1a1a;
                        background: #2a2a2a;
                        border-radius: 4px;
                        padding: 8px 10px;
                        margin: 8px 10px;
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        color: #ccc;
                        line-height: 1.5;
                        scrollbar-width: thin;
                        scrollbar-color: #555 #2a2a2a;
                    }

                    .bbgl-modal-scrollbox::-webkit-scrollbar {
                        display: block;
                        width: 4px;
                    }

                    .bbgl-modal-scrollbox::-webkit-scrollbar-thumb {
                        background: #555;
                        border-radius: 4px;
                    }

                    .bbgl-modal-scrollbox strong {
                        color: #ddd;
                        font-size: 12px;
                        font-weight: 700;
                    }

                    /**/
                    .bbgl-modal-scrollbox > strong {
                        display: block;
                        margin-top: 6px;
                        margin-bottom: 2px;
                    }

                    .bbgl-modal-scrollbox > strong:first-child {
                        margin-top: 0;
                    }

                    .bbgl-modal-scrollbox p {
                        margin: 0 0 8px 0;
                    }

                    .bbgl-modal-scrollbox p:last-child {
                        margin-bottom: 0;
                    }

                    .bbgl-ack-row {
                        display: flex;
                        gap: 8px;
                        align-items: flex-start;
                        padding: 4px 0;
                        color: #ccc;
                    }

                    .bbgl-ack-row input[type="checkbox"] {
                        margin-top: 2px;
                        flex: 0 0 auto;
                        cursor: pointer;
                    }

                    .bbgl-ack-row label {
                        cursor: pointer;
                        flex: 1;
                    }

                    .torn-btn.bbgl-btn-disabled {
                        filter: grayscale(1);
                        opacity: .5;
                        pointer-events: none;
                    }

                    .bbgl-agree-wrap {
                        flex: 1;
                        display: block;
                    }

                    .bbgl-agree-wrap .torn-btn {
                        width: 100%;
                    }

                    @keyframes bbgl-crt-out {
                        0% {
                            transform: scale(1);
                            opacity: 1;
                            filter: brightness(1)
                        }

                        40% {
                            transform: scale(1, .005);
                            opacity: 1;
                            filter: brightness(3)
                        }

                        100% {
                            transform: scale(0, 0);
                            opacity: 0;
                            filter: brightness(0)
                        }
                    }

                    @keyframes bbgl-crt-in {
                        0% {
                            transform: scale(0, 0);
                            opacity: 0;
                            filter: brightness(0)
                        }

                        60% {
                            transform: scale(1, .005);
                            opacity: 1;
                            filter: brightness(3)
                        }

                        100% {
                            transform: scale(1);
                            opacity: 1;
                            filter: brightness(1)
                        }
                    }

                    .bbgl-crt-out {
                        animation: bbgl-crt-out .3s ease-in forwards;
                        transform-origin: center;
                        pointer-events: none;
                    }

                    .bbgl-crt-in {
                        animation: bbgl-crt-in .3s ease-out forwards;
                        transform-origin: center;
                    }

                    [data-tooltip] {
                        cursor: default;
                    }

                    .bbgl-day-cell.ghost-cell::after {
                        content: "";
                        display: block;
                    }

                    .bbgl-day-cell.is-archived .day-num {
                        text-shadow: 0 1px 4px rgba(0, 0, 0, 1), 0 0 2px rgba(0, 0, 0, 1);
                        z-index: 20;
                    }

                    @media (max-width: 800px) {
                        .bbgl-paste-icon {
                            display: none !important;
                        }

                        .bbgl-native-input {
                            padding-left: 10px !important;
                        }
                    }

                    @media (max-width: 620px) {
                        .sticker-nav-btn:hover {
                            transform: translateY(-60%) !important;
                            text-shadow: 0 1px 3px #000 !important;
                        }

                        .arrow-btn:hover {
                            transform: none !important;
                            text-shadow: 0 1px 3px #000 !important;
                        }

                        .sticker-nav-btn:active {
                            transform: translateY(-50%) scale(1.3) !important;
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8) !important;
                        }

                        .arrow-btn:active {
                            transform: scale(1.3) !important;
                            text-shadow: 0 0 8px rgba(255, 255, 255, .8) !important;
                        }

                        #bbgl-panel:not(.bbgl-expanded) {
                            max-height: none !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                            font-size: 9.5px !important;
                            padding: .5px 5px !important;
                            line-height: 1.18 !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-toggles {
                            gap: 4px !important;
                            align-items: center !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-hud {
                            margin-bottom: 2px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text {
                            font-size: 9px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text.x-label {
                            font-size: 9px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .stats-btn {
                            width: 28px !important;
                            height: 28px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn {
                            width: 15.5px !important;
                            height: 15.5px !important;
                        }

                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                        #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle {
                            width: 16px !important;
                            height: 16px !important;
                        }
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper {
                        flex: 0 0 clamp(122px, calc(122px + 23px * var(--bbgl-dock-t, 0)), 145px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-header-wrapper::before {
                        left: 0 !important;
                        right: 0 !important;
                        top: 0 !important;
                        border-radius: 5px 5px 0 0 !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) {
                        --bbgl-dock-t: clamp(0, calc((100cqi - 350px) / 370px), 1);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page):not(.bbgl-tall) {
                        --bbgl-col-gap: clamp(10px, calc(10px + 12px * (1 - var(--bbgl-dock-t, 0))), 22px);
                        --bbgl-f-top-mb: clamp(3px, calc(3px + 3px * (1 - var(--bbgl-dock-t, 0))), 6px);
                    }

                    #bbgl-panel.bbgl-expanded.bbgl-tall:not(.bbgl-mode-page) {
                        /* ledger spacing inverse-scale (tall) */
                        --bbgl-col-gap: clamp(12px, calc(12px + 14px * (1 - var(--bbgl-dock-t, 0))), 26px);
                        --bbgl-f-top-mb: clamp(3px, calc(3px + 3px * (1 - var(--bbgl-dock-t, 0))), 6px);
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-bottom-panel {
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .bbgl-grid-container {
                        padding: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                        flex: none !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) .calendar-wrapper {
                        overflow: visible !important;
                        height: auto !important;
                        flex: none !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-month-header {
                        padding-left: 8px !important;
                        padding-right: clamp(10px, 2.78cqi, 16px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .day-num {
                        font-size: clamp(11px, 2.78cqi, 16px) !important;
                        top: clamp(3px, 1.04cqi, 6px) !important;
                        left: clamp(3px, 1.04cqi, 6px) !important;
                        width: clamp(20px, 5.2cqi, 30px) !important;
                        height: clamp(20px, 5.2cqi, 30px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .bbgl-day-cell.is-viewing .day-num {
                        font-size: clamp(15px, 3.82cqi, 22px) !important;
                        width: clamp(24px, 6.25cqi, 36px) !important;
                        height: clamp(24px, 6.25cqi, 36px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-copy-btn svg {
                        width: 15.5px !important;
                        height: 15.5px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle svg,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle svg {
                        width: 16px !important;
                        height: 16px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-ledger-toggle {
                        /**/
                        left: 32px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-toggle {
                        left: clamp(56px, calc(51.6px + 1.45cqi), 60px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-achievements-toggle {
                        left: clamp(80px, calc(71.2px + 2.9cqi), 88px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-toggle {
                        left: clamp(104px, calc(90.8px + 4.35cqi), 116px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .arrow-btn {
                        font-size: clamp(18px, 3.65cqi, 21px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .all-time-btn {
                        width: 33px !important;
                        height: 33px !important;
                        margin-top: 8px !important;
                        margin-bottom: -8px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #year-trigger {
                        font-size: clamp(14px, 2.78cqi, 16px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #month-trigger {
                        font-size: clamp(20px, 3.99cqi, 23px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-label,
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .ui-floating-summary {
                        font-size: clamp(11px, 2.08cqi, 12px) !important;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .ui-floating-label,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .ui-floating-summary {
                        font-size: 10.5px !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .stats-btn {
                        width: 28px !important;
                        height: 28px !important;
                    }

                    /* Expanded panel graph view: fluid scaling to replace hard 620px breakpoint ---------------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-pill {
                        font-size: clamp(8.45px, 1.62cqi, 10px) !important;
                        /* narrow panels dip below old 9.8px floor --------*/
                        padding: clamp(.5px, calc(.35px + .16cqi), 1.5px) clamp(5px, 1.39cqi, 8px) !important;
                        line-height: 1 !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-toggles {
                        gap: clamp(4px, 1.04cqi, 6px) !important;
                        align-items: center !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-hud {
                        margin-bottom: clamp(4px, 1.12cqi, 6px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container .g-text {
                        font-size: clamp(10px, 1.91cqi, 11px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-graph-container {
                        padding: clamp(5px, .72cqi, 9px) calc(var(--bbgl-gx, 10px) - 2px) clamp(4px, .65cqi, 7px) calc(var(--bbgl-gx, 10px) - 2px) !important;
                    }

                    /* Expanded panel sticker grid: fluid sticker slot sizing to keep proportions --------------------*/
                    /* Switch to size containment on expanded panel only so cqi/cqb can read both axes. --------------*/
                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) {
                        container-type: size;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(0px, .55vw, 6px);
                        --bbgl-ach-container-pt: max(0px, calc(clamp(10px, calc(21px - 10.5px * var(--bbgl-dock-t, 0)), 21px) - calc(2px * var(--bbgl-dock-t, 0))));
                        --bbgl-ach-scroll-pt: clamp(1px, .48cqi, 8px);
                        --bbgl-ach-scroll-pb: clamp(0px, .06cqi, 2px);
                        --bbgl-ach-footer-pt: clamp(0px, .06cqi, 1px);
                        --bbgl-ach-footer-pb: 2px;
                        padding-top: var(--bbgl-ach-container-pt) !important;
                        padding-left: var(--bbgl-ach-inset-x) !important;
                        padding-right: var(--bbgl-ach-inset-x) !important;
                        min-height: 0 !important;
                        flex: 1 !important;
                        overflow: hidden !important;
                    }

                    #bbgl-panel:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container .bbgl-ach-scroll {
                        flex: 1 1 auto !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        overflow-x: hidden !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-top-panel.viewing-achievements #bbgl-achievements-container {
                        --bbgl-ach-inset-x: clamp(4px, 1vw, 12px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot {
                        height: min(clamp(88px, calc(75px + 2.6cqi), 88px), clamp(88px, calc(75px + 2.4cqb), 88px)) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot-sponsor {
                        height: min(clamp(110px, calc(90px + 8.1cqi), 137px), clamp(110px, calc(90px + 7.4cqb), 137px)) !important;
                        max-width: clamp(120px, calc(100px + 9cqi), 152px) !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sticker-grid {
                        column-gap: clamp(1px, calc(.8cqi), 5px) !important;
                        row-gap: clamp(0px, calc(.4cqi), 3px) !important;
                        align-content: center !important;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-nav-btn {
                        font-size: clamp(20px, calc(14px + 3.1cqi), 32px) !important;
                        width: clamp(24px, calc(17px + 4cqi), 40px) !important;
                    }

                    .bbgl-coming-soon {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: rgba(255, 255, 255, .7);
                        font-size: 24px;
                        font-weight: bold;
                        letter-spacing: 2px;
                        z-index: 10;
                        pointer-events: none;
                        text-shadow: 0 0 10px rgba(255, 255, 255, .2);
                        text-align: center;
                        line-height: 1.2;
                    }

                    @keyframes bbgl-gold-glow-once {
                        0% {
                            text-shadow: 0 0 0 rgba(255, 215, 0, 0), 0 1px 3px rgba(0, 0, 0, .85);
                        }

                        100% {
                            text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 32px rgba(255, 215, 0, .9), 0 0 50px rgba(255, 200, 0, .55), 0 1px 3px rgba(0, 0, 0, .85);
                        }
                    }

                    #sticker-sponsor-btn {
                        left: 0;
                        border-radius: 0 5px 5px 0;
                        background: linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #fffacd 50%, #ffd700 60%, #b8860b 100%);
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        color: transparent;
                        text-shadow: 0 0 12px rgba(255, 215, 0, .6), 0 0 0 rgba(255, 255, 255, 0), 0 1px 3px rgba(0, 0, 0, .85);
                    }

                    @media (hover: hover) {
                        #sticker-sponsor-btn:hover {
                            text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 24px rgba(255, 255, 255, .8), 0 1px 3px rgba(0, 0, 0, .85);
                        }
                    }

                    #sticker-sponsor-btn:active {
                        text-shadow: 0 0 18px rgba(255, 235, 120, 1), 0 0 24px rgba(255, 255, 255, .8), 0 1px 3px rgba(0, 0, 0, .85);
                    }

                    #sticker-sponsor-btn.shimmer-once {
                        animation: bbgl-gold-glow-once 2s ease-in-out forwards;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #sticker-sponsor-btn {
                        left: 0 !important;
                    }

                    #bbgl-panel.bbgl-mode-page #sticker-sponsor-btn {
                        left: clamp(0px, calc(6px * (1 - var(--bbgl-page-t))), 6px);
                    }

                    #bbgl-sponsor-grid {
                        position: relative;
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        grid-template-rows: 1fr;
                        width: 100%;
                        flex: 1;
                        align-content: center;
                        align-items: center;
                        justify-items: center;
                        padding: 0;
                        gap: 0;
                        margin: 0 -6px;
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) #bbgl-sponsor-grid {
                        gap: 0 !important;
                        padding: 0 !important;
                        margin: 0 -10px !important;
                    }

                    #bbgl-panel.bbgl-mode-page #bbgl-sponsor-grid {
                        gap: 0;
                        padding: 0;
                        margin: 0 clamp(-10px, calc(-10px + 7px * var(--bbgl-page-t)), -3px) 0;
                    }

                    .sticker-slot-sponsor {
                        height: 106px;
                        width: 100%;
                        max-width: 116px;
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: visible;
                    }

                    #bbgl-panel.bbgl-mode-page .sticker-slot-sponsor {
                        height: clamp(104px, calc(104px + 68px * var(--bbgl-page-t)), 172px);
                        max-width: clamp(114px, calc(114px + 78px * var(--bbgl-page-t)), 192px);
                    }

                    #bbgl-panel.bbgl-expanded:not(.bbgl-mode-page) .sticker-slot-sponsor {
                        height: 137px !important;
                        max-width: 152px !important;
                    }

                    .sponsor-sticker-svg {
                        width: 90%;
                        height: 90%;
                        filter: drop-shadow(0 -.5px 0 rgba(0, 0, 0, .2)) drop-shadow(0 .5px 0 rgba(255, 255, 255, .2));
                        opacity: .9;
                    }

                    .sponsor-sticker-label {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-family: 'Fjalla One', sans-serif;
                        font-size: 11px;
                        color: #666;
                        text-align: center;
                        line-height: 1.3;
                        pointer-events: none;
                        z-index: 5;
                        letter-spacing: .3px;
                        text-shadow: 0 1px 1px rgba(255, 255, 255, .4);
                    }

                    .bbgl-expanded .sponsor-sticker-label {
                        font-size: 11px;
                    }

                    #bbgl-panel.bbgl-mode-page .sponsor-sticker-label {
                        font-size: clamp(8px, calc(8px + 5px * var(--bbgl-page-t)), 13px);
                    }

                    .pg-dot.pg-dot-sponsor.active {
                        background: linear-gradient(135deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b) !important;
                        box-shadow: 0 0 6px rgba(255, 215, 0, .85) !important;
                        transform: scale(1.3);
                    }

                    .bbgl-ach-scroll {
                        display: flex;
                        flex-direction: column;
                        flex: 1 1 auto;
                        min-height: 0;
                        overflow: hidden;
                        overflow-x: hidden;
                        padding: var(--bbgl-ach-scroll-pt) var(--bbgl-ach-inset-x) var(--bbgl-ach-scroll-pb);
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-scroll::-webkit-scrollbar {
                        display: none;
                    }

                    #bbgl-achievements-container {
                        position: relative;
                        min-height: 0;
                        overflow: hidden;
                        container-type: inline-size;
                        container-name: bbgl-ach-root;
                        --bbgl-ach-font: 'Barlow Condensed', 'Arial Narrow', 'Nimbus Sans Narrow', Tahoma, sans-serif;
                        --bbgl-ach-val-font: 'Inconsolata', monospace;
                        --bbgl-ach-inset-x: clamp(2px, 1.1cqi, 12px);
                        --bbgl-ach-scroll-pt: clamp(2px, .5cqi, 9px);
                        --bbgl-ach-scroll-pb: clamp(0px, .08cqi, 2px);
                        --bbgl-ach-footer-pt: clamp(0px, .08cqi, 2px);
                        --bbgl-ach-footer-pb: 2px;
                        --bbgl-ach-footer-gap: 6px;
                        --bbgl-ach-dot-gap: 6px;
                        /* stickerbook #bbgl-sticker-pagination --------*/
                        --bbgl-ach-dot-w: 6px;
                        --bbgl-ach-nav-fs: clamp(7px, calc(1.45 * var(--bbgl-ach-dot-w)), 11px);
                        --bbgl-ach-nav-py: 0;
                        --bbgl-ach-nav-px: clamp(2px, .55cqi, 10px);
                    }

                    #bbgl-ach-pages {
                        container-type: inline-size;
                        container-name: bbgl-ach;
                        /**/
                        width: 100%;
                        box-sizing: border-box;
                        flex: 1;
                        min-height: 0;
                        overflow: hidden;
                    }

                    #bbgl-ach-footer,
                    .bbgl-ach-footer {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        z-index: 10;
                        flex-shrink: 0;
                        display: grid;
                        grid-template-columns: 1fr auto 1fr;
                        align-items: center;
                        column-gap: var(--bbgl-ach-footer-gap);
                        min-height: 0;
                        padding: var(--bbgl-ach-footer-pt) var(--bbgl-ach-inset-x) var(--bbgl-ach-footer-pb);
                        box-sizing: border-box;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) #bbgl-ach-footer {
                        padding-bottom: 0px;
                    }

                    .bbgl-ach-footer-side {
                        display: flex;
                        align-items: center;
                        min-width: 0;
                    }

                    .bbgl-ach-footer-left {
                        justify-content: flex-end;
                    }

                    .bbgl-ach-footer-right {
                        justify-content: flex-start;
                    }

                    .bbgl-ach-nav {
                        position: relative;
                        top: auto;
                        transform: none;
                        font-size: var(--bbgl-ach-nav-fs);
                        color: #888;
                        cursor: pointer;
                        z-index: 20;
                        user-select: none;
                        padding: var(--bbgl-ach-nav-py) var(--bbgl-ach-nav-px);
                        margin: 0;
                        transition: color .2s;
                        font-family: 'Arial', sans-serif;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        border: none;
                        line-height: 1;
                        -webkit-appearance: none;
                        appearance: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-nav:hover {
                        color: #fff;
                        text-shadow: 0 0 3px #fff;
                    }

                    .bbgl-ach-section {
                        margin-bottom: 0;
                        width: 100%;
                        box-sizing: border-box;
                        overflow: visible;
                    }

                    .bbgl-ach-cols,
                    .bbgl-ach-col,
                    .bbgl-ach-row,
                    .ach-v-wrap,
                    .bbgl-ach-row .ach-value {
                        overflow: visible;
                    }

                    .bbgl-ach-section-title {
                        cursor: pointer;
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        box-sizing: border-box;
                        background: 0 0;
                        border: none;
                        box-shadow: none;
                        border-radius: 0;
                        margin: 0;
                        padding: 2px;
                        color: #9a9a9a;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(11px, 2.2cqi, 13px);
                        font-weight: 700;
                        letter-spacing: .10em;
                        text-transform: uppercase;
                        line-height: 1.25;
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        transition: color .15s;
                    }

                    /**/
                    .bbgl-ach-subsection-title {
                        cursor: pointer;
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        box-sizing: border-box;
                        background: 0 0;
                        border: none;
                        box-shadow: none;
                        border-radius: 0;
                        margin: 0;
                        padding: 0px 2px 0px 2px;
                        color: #888;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(10px, 1.8cqi, 11px);
                        font-weight: 600;
                        letter-spacing: .08em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        transition: color .15s;
                    }

                    /**/
                    body:not(.is-touch-device) .bbgl-ach-section-title:hover,
                    body:not(.is-touch-device) .bbgl-ach-subsection-title:hover {
                        color: #c8c8c8;
                    }

                    .bbgl-ach-cols {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        column-gap: clamp(8px, 2.2cqi, 18px);
                        row-gap: 0;
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0px 0 2px;
                    }

                    @container bbgl-ach (max-width:360px) {
                        .bbgl-ach-cols {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                        }
                    }

                    .bbgl-ach-col {
                        display: flex;
                        flex-direction: column;
                        gap: clamp(2px, .45cqi, 5px);
                        min-width: 0;
                        text-align: left;
                    }

                    .bbgl-ach-dual {
                        width: 100%;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                    }

                    .bbgl-ach-dual-headers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        column-gap: clamp(8px, 2.2cqi, 18px);
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-dual .bbgl-ach-section-title {
                        border-bottom: none;
                        padding-bottom: 4px;
                    }

                    .bbgl-ach-dual-body {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        column-gap: clamp(8px, 2.2cqi, 18px);
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0px 0 2px;
                    }

                    .bbgl-ach-col-half {
                        display: flex;
                        flex-direction: column;
                        gap: 0;
                        min-width: 0;
                    }

                    .bbgl-ach-row {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        padding: clamp(2px, .4cqi, 4px) 1px;
                        margin: 0;
                        border: none;
                        box-shadow: none;
                        background: 0 0;
                        cursor: pointer;
                        position: relative;
                        font-size: clamp(10px, 2.05cqi, 12px);
                        line-height: 1.4;
                    }

                    .bbgl-expanded .bbgl-ach-row {
                        font-size: clamp(12px, 2.05cqi, 12px);
                        color: #ccc;
                        transition: background-color .12s;
                        border-bottom: 1px solid rgba(255, 255, 255, .04);
                    }

                    body:not(.is-touch-device) .bbgl-ach-row:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .ach-row-main {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 6px;
                        width: 100%;
                    }

                    .ach-k-stack {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        flex: 1;
                        min-width: 0;
                    }

                    .bbgl-ach-row .ach-k {
                        font-weight: 500;
                        color: #bbb;
                        font-family: var(--bbgl-ach-font);
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                    }

                    .ach-v-wrap {
                        display: flex;
                        align-items: flex-end;
                        gap: 3px;
                        flex-shrink: 0;
                        justify-content: flex-end;
                    }

                    .ach-sub {
                        font-size: clamp(7.5px, 1.55cqi, 9px);
                        font-weight: 600;
                        color: #222;
                        letter-spacing: .3px;
                        text-shadow: 0 1px 0 rgba(255, 255, 255, .05);
                        line-height: 1.1;
                        margin-bottom: 1px;
                    }

                    .bbgl-ach-row .ach-value {
                        font-weight: 500;
                        color: #eaeaea;
                        text-align: right;
                        white-space: nowrap;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        display: inline-flex;
                        align-items: center;
                        justify-content: flex-end;
                        flex-wrap: nowrap;
                        gap: 4px;
                        padding-right: 12px;
                    }

                    .bbgl-ach-row .ach-value .view-std,
                    .bbgl-ach-row .ach-value .view-exp {
                        font-weight: 550;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-str {
                        color: #3264c6;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-def {
                        color: #dc3912;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-spd {
                        color: #ff9900;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-dex {
                        color: #109618;
                    }

                    .bbgl-ach-row .ach-value.ach-stat-tot {
                        color: #9d039d;
                    }

                    .ach-null {
                        color: #444;
                    }

                    .ach-unit {
                        display: none;
                    }

                    .bbgl-ach-row .ach-value.ach-happy-col {
                        display: none;
                        color: #eaeaea;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-row .ach-value.ach-happy-col,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-row .ach-value.ach-happy-col {
                        display: inline-flex;
                    }

                    #bbgl-panel.bbgl-expanded .ach-unit,
                    #bbgl-panel.bbgl-mode-page .ach-unit {
                        display: inline;
                    }

                    .ach-date {
                        display: none;
                        font-size: clamp(10px, 2.1cqi, 12px);
                        font-weight: 500;
                        color: #999;
                        font-family: var(--bbgl-ach-font);
                        text-align: left;
                        margin-left: 6px;
                        line-height: 1;
                        letter-spacing: .01em;
                    }

                    #bbgl-panel.bbgl-expanded .ach-date,
                    #bbgl-panel.bbgl-mode-page .ach-date {
                        display: block;
                    }

                    .ach-fx-green {
                        background: linear-gradient(135deg, #2e7d32, #66bb6a, #81c784, #66bb6a, #2e7d32);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-green 4s ease-out 1 forwards;
                    }

                    .ach-fx-gold {
                        background: linear-gradient(135deg, #b8860b, #ffd700, #fffacd, #ffd700, #b8860b);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-gold 4s ease-out 1 forwards;
                    }

                    .ach-fx-holo {
                        background: linear-gradient(90deg, #00e5ff, #d500f9, #2979ff, #00e5ff);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1;
                    }

                    .ach-fx-diamond {
                        background: linear-gradient(110deg, #ffffff 0%, #ffb8d9 15%, #fff0c2 30%, #b8ffd9 45%, #b8e0ff 60%, #d9b8ff 75%, #ffb8e6 90%, #ffffff 100%);
                        background-size: 200% 100%;
                        -webkit-background-clip: text;
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        animation: bbgl-ach-shimmer 4s linear 1, bbgl-ach-glow-diamond 4s ease-out 1 forwards;
                    }

                    @keyframes bbgl-ach-glow-diamond {
                        0% {
                            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .8));
                        }

                        100% {
                            filter: drop-shadow(0 0 4px rgba(255, 255, 255, .9)) drop-shadow(0 0 8px rgba(255, 180, 220, .7)) drop-shadow(0 0 12px rgba(180, 220, 255, .6)) drop-shadow(0 1px 1px rgba(0, 0, 0, .8));
                        }
                    }

                    @keyframes bbgl-ach-shimmer {
                        0% {
                            background-position: 200% 0;
                        }

                        100% {
                            background-position: 0 0;
                        }
                    }

                    @keyframes bbgl-ach-glow-gold {
                        0% {
                            text-shadow: 0 0 0 rgba(255, 215, 0, 0), 0 1px 2px rgba(0, 0, 0, .8);
                        }

                        100% {
                            text-shadow: 0 0 12px rgba(255, 215, 0, .6), 0 0 20px rgba(255, 215, 0, .3), 0 1px 2px rgba(0, 0, 0, .8);
                        }
                    }

                    @keyframes bbgl-ach-glow-green {
                        0% {
                            text-shadow: 0 0 0 rgba(46, 125, 50, 0), 0 1px 2px rgba(0, 0, 0, .8);
                        }

                        100% {
                            text-shadow: 0 0 12px rgba(102, 187, 106, .6), 0 0 20px rgba(46, 125, 50, .3), 0 1px 2px rgba(0, 0, 0, .8);
                        }
                    }

                    #bbgl-panel.bbgl-no-animations :is(.ach-fx-green, .ach-fx-gold, .ach-fx-holo, .ach-fx-diamond) {
                        animation: none;
                    }

                    #bbgl-ach-pageindicator {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        justify-self: center;
                        gap: var(--bbgl-ach-dot-gap);
                        padding: 0;
                        flex-shrink: 0;
                    }

                    #bbgl-ach-pageindicator .pg-dot {
                        width: var(--bbgl-ach-dot-w);
                        height: var(--bbgl-ach-dot-w);
                    }

                    #bbgl-ach-pageindicator .pg-dot.active {
                        transform: scale(1.2);
                        box-shadow: 0 0 clamp(3px, calc(2px + .55cqi), 8px) rgba(255, 255, 255, .5);
                    }

                    .bbgl-ach-section-page0 {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        display: grid;
                        grid-template-columns: minmax(0, 20%) repeat(4, minmax(0, 1fr));
                        column-gap: clamp(4px, 1cqi, 10px);
                        align-items: start;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header {
                        border-bottom: 1px solid rgba(255, 255, 255, .12);
                        padding: 2px 2px 4px;
                        align-items: end;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        padding: clamp(2px, .4cqi, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .04);
                        cursor: pointer;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-row-multi:last-child {
                        border-bottom: none;
                    }

                    .ach-grid-label-area {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        min-width: 0;
                        text-align: left;
                    }

                    /**/
                    .bbgl-ach-section-page0 .ach-grid-label-area .ach-k {
                        font-weight: 500;
                        color: #bbb;
                        font-family: var(--bbgl-ach-font);
                        /**/
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                        line-height: 1.25;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header .ach-grid-label-area {
                        display: grid;
                        grid-template-columns: auto minmax(0, 1fr);
                        column-gap: 6px;
                        align-items: center;
                    }

                    .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title {
                        border-bottom: none;
                        padding: 0;
                        background: transparent;
                        display: inline-block;
                        cursor: pointer;
                        line-height: 1.15;
                        white-space: normal;
                        word-break: normal;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-title {
                        white-space: nowrap;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-hint,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .bbgl-ach-grid-header .bbgl-ach-section-hint {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                        margin-top: 0;
                        min-width: 0;
                        white-space: normal;
                        word-break: normal;
                        overflow-wrap: normal;
                        align-self: center;
                        font-size: clamp(6.5px, 1.25cqi, 8.5px);
                        line-height: 1.1;
                        max-height: calc(1.1em * 2 + 1px);
                    }

                    .bbgl-ach-section-hint {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(7px, 1.4cqi, 9px);
                        color: #666;
                        letter-spacing: .02em;
                        line-height: 1.15;
                        margin-top: 1px;
                        font-weight: 400;
                        text-transform: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-hint,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-hint {
                        display: block;
                    }

                    .ach-paren {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(7.5px, 1.5cqi, 9.5px);
                        color: #777;
                        font-weight: 400;
                        line-height: 1.15;
                        margin-top: 1px;
                        letter-spacing: .01em;
                    }

                    #bbgl-panel.bbgl-expanded .ach-paren,
                    #bbgl-panel.bbgl-mode-page .ach-paren {
                        display: block;
                    }

                    .ach-stat-header {
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(9px, 1.85cqi, 11px);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-align: center;
                        line-height: 1.2;
                    }

                    .ach-stat-header.ach-stat-str {
                        color: #3264c6;
                    }

                    .ach-stat-header.ach-stat-def {
                        color: #dc3912;
                    }

                    .ach-stat-header.ach-stat-spd {
                        color: #ff9900;
                    }

                    .ach-stat-header.ach-stat-dex {
                        color: #109618;
                    }

                    .bbgl-ach-stat-cell {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        min-width: 0;
                        cursor: pointer;
                        padding: 1px 2px;
                        border-radius: 2px;
                        transition: background-color .12s;
                    }

                    body:not(.is-touch-device) .bbgl-ach-stat-cell:hover {
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-ach-stat-cell .ach-value {
                        font-weight: 500;
                        color: #eaeaea;
                        text-align: center;
                        white-space: nowrap;
                        width: 100%;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        line-height: 1.2;
                        display: inline-flex;
                        justify-content: center;
                        align-items: baseline;
                        gap: 2px;
                        padding: 0;
                    }

                    .bbgl-ach-stat-cell .ach-date {
                        display: none;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(11px, 2.15cqi, 13px);
                        color: #999;
                        text-align: center;
                        margin: 1px 0 0;
                        line-height: 1.15;
                        font-weight: 500;
                        letter-spacing: .01em;
                    }

                    .bbgl-ach-stat-cell .ach-time {
                        display: none;
                        font-family: var(--bbgl-ach-val-font);
                        font-size: clamp(9.5px, 1.9cqi, 11.5px);
                        color: #888;
                        text-align: center;
                        margin: 0;
                        line-height: 1.15;
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-stat-cell .ach-date,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-stat-cell .ach-date,
                    #bbgl-panel.bbgl-expanded .bbgl-ach-stat-cell .ach-time,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-stat-cell .ach-time {
                        display: block;
                    }

                    .ach-streak-days {
                        color: #bbb;
                        font-weight: 500;
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                    }

                    .ach-streak-sep {
                        color: #666;
                        margin: 0 2px;
                        font-weight: 500;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-grid-header,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(4, minmax(0, 1fr));
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-title {
                        font-size: clamp(10px, 2cqi, 12px);
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-subsection-title {
                        font-size: clamp(9px, 1.6cqi, 10px);
                    }

                    .bbgl-ach-section-page1 .ach-streak-date {
                        grid-column: 1;
                        text-align: left;
                        margin: 0;
                        padding-left: 15%;
                        padding-right: 4px;
                        line-height: 1.15;
                        white-space: nowrap;
                        overflow: visible;
                    }

                    .ach-streak-days-inline {
                        display: inline;
                    }

                    #bbgl-panel.bbgl-expanded .ach-streak-days-inline,
                    #bbgl-panel.bbgl-mode-page .ach-streak-days-inline {
                        /**/
                        display: none;
                    }

                    .ach-stat-header.ach-stat-tot {
                        color: #9d039d;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 28%) repeat(5, minmax(0, 1fr));
                    }

                    .bbgl-ach-stat-cell .ach-value.ach-stat-tot {
                        color: #9d039d;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-stat-cell-total .ach-value {
                        color: #ffffff !important;
                    }

                    .bbgl-ach-section-page1 .bbgl-ach-stat-cell:not(.bbgl-ach-stat-cell-total) .ach-value {
                        color: #cccccc;
                    }

                    .bbgl-ach-streak-date-inline {
                        display: inline;
                        color: #888;
                        font-family: var(--bbgl-ach-val-font);
                        font-weight: 500;
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-streak-date-inline,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-streak-date-inline {
                        display: none;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-grid-header,
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-row-multi {
                        grid-template-columns: minmax(0, 1fr) repeat(4, 0fr) auto;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-stat-cell:not(.bbgl-ach-stat-cell-total),
                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .ach-stat-header:not(.ach-stat-tot) {
                        display: none;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page1 .bbgl-ach-stat-cell-total .ach-value {
                        text-align: right;
                        justify-content: flex-end;
                    }

                    .bbgl-ach-consistency-row {
                        cursor: pointer;
                    }

                    body:not(.is-touch-device) .bbgl-ach-consistency-row:hover {
                        background: transparent !important;
                    }

                    .bbgl-ach-consistency-row .bbgl-ach-consistency-text {
                        grid-column: 1 / -1;
                        justify-self: end;
                        text-align: right;
                        /**/
                        padding: 2px 6px;
                        border-radius: 4px;
                        transition: background-color .12s;
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(10px, 2cqi, 13px);
                        color: #bbb;
                        /**/
                        font-weight: 500;
                        letter-spacing: .02em;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    body:not(.is-touch-device) .bbgl-ach-consistency-row .bbgl-ach-consistency-text:hover {
                        background: rgba(255, 255, 255, .06);
                    }

                    .bbgl-ach-consistency-row .ach-cons-val {
                        color: #eaeaea;
                        font-family: var(--bbgl-ach-val-font);
                        /**/
                        font-variant-numeric: tabular-nums;
                        font-weight: 600;
                    }

                    .bbgl-ach-consistency-row .ach-cons-days {
                        color: #888;
                        font-family: var(--bbgl-ach-val-font);
                        /**/
                        font-variant-numeric: tabular-nums;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-section-page0 .ach-k,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-section-page0 .ach-k {
                        white-space: normal;
                        overflow: visible;
                        text-overflow: clip;
                        line-height: 1.2;
                    }

                    .ach-streak-daterange {
                        color: inherit;
                    }

                    .ach-title-long {
                        display: none;
                    }

                    .ach-title-short {
                        display: inline;
                    }

                    #bbgl-panel.bbgl-expanded .ach-title-short,
                    #bbgl-panel.bbgl-mode-page .ach-title-short {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .ach-title-long,
                    #bbgl-panel.bbgl-mode-page .ach-title-long {
                        display: inline;
                    }

                    #bbgl-panel:not(.bbgl-expanded):not(.bbgl-mode-page) .bbgl-ach-section-page0 .bbgl-ach-row-multi {
                        padding-top: 1px;
                        padding-bottom: 1px;
                    }

                    .ach-cons-long {
                        display: none;
                    }

                    .ach-cons-short {
                        display: inline;
                    }

                    #bbgl-panel.bbgl-expanded .ach-cons-short,
                    #bbgl-panel.bbgl-mode-page .ach-cons-short {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .ach-cons-long,
                    #bbgl-panel.bbgl-mode-page .ach-cons-long {
                        display: inline;
                    }

                    .bbgl-ach-section-hh {
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .bbgl-ach-section-hh .bbgl-ach-row {
                        padding: clamp(2px, .4cqi, 4px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-size: clamp(11px, 2.05cqi, 13px) !important;
                    }

                    .bbgl-ach-hh-best-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 8px;
                        width: 100%;
                        box-sizing: border-box;
                        padding: clamp(3px, .5cqi, 5px) 2px;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(11px, 2.05cqi, 13px);
                        color: #ccc;
                        line-height: 1.4;
                    }

                    .bbgl-ach-section-hh .bbgl-ach-row:last-of-type,
                    .bbgl-ach-hh-best-row:last-of-type {
                        border-bottom: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-hh-best-row:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .bbgl-ach-hh-group {
                        cursor: pointer;
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        border-bottom: 1px solid rgba(255, 255, 255, .05);
                    }

                    .bbgl-ach-hh-group:last-of-type {
                        border-bottom: none;
                    }

                    body:not(.is-touch-device) .bbgl-ach-hh-group:hover {
                        background: rgba(255, 255, 255, .04);
                    }

                    .bbgl-ach-hh-group .bbgl-ach-row,
                    .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        background: transparent !important;
                        cursor: inherit;
                    }

                    .bbgl-ach-hh-group .bbgl-ach-hh-best-row {
                        border-bottom: none;
                    }

                    .bbgl-ach-hh-label {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        gap: clamp(6px, 1.2cqi, 10px);
                        min-width: 0;
                        flex: 1;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-label,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-label {
                        flex-direction: column;
                        align-items: flex-start;
                        /**/
                        gap: 0;
                    }

                    .bbgl-ach-hh-label .ach-k {
                        font-weight: 500;
                        color: #bbb;
                    }

                    .bbgl-ach-hh-label .ach-date {
                        font-family: var(--bbgl-ach-val-font);
                        color: #888;
                        line-height: 1.2;
                        margin-top: 1px;
                        font-variant-numeric: tabular-nums;
                    }

                    /* kept for compat */
                    .bbgl-ach-hh-cells {
                        display: flex;
                        gap: clamp(8px, 1.6cqi, 14px);
                        align-items: center;
                        flex-shrink: 0;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cells,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cells {
                        align-items: flex-end;
                    }

                    .bbgl-ach-hh-cell {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        min-width: 32px;
                    }

                    /**/
                    .bbgl-ach-hh-val {
                        font-family: var(--bbgl-ach-val-font);
                        font-variant-numeric: tabular-nums;
                        color: #eaeaea;
                        font-weight: 500;
                        font-size: clamp(11px, 2.05cqi, 13px);
                        white-space: nowrap;
                        line-height: 1.15;
                    }

                    .bbgl-ach-hh-tag {
                        font-family: var(--bbgl-ach-font);
                        font-size: clamp(8px, 1.4cqi, 10px);
                        font-weight: 700;
                        letter-spacing: .04em;
                        text-transform: uppercase;
                        line-height: 1.2;
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-tag.ach-stat-str {
                        color: #3264c6;
                    }

                    .bbgl-ach-hh-tag.ach-stat-def {
                        color: #dc3912;
                    }

                    /**/
                    .bbgl-ach-hh-tag.ach-stat-spd {
                        color: #ff9900;
                    }

                    .bbgl-ach-hh-tag.ach-stat-dex {
                        color: #109618;
                    }

                    /**/
                    .bbgl-ach-hh-tag.ach-stat-tot {
                        color: #999;
                    }

                    .bbgl-ach-hh-date-line {
                        font-family: var(--bbgl-ach-val-font);
                        color: #888;
                        line-height: 1.2;
                        font-variant-numeric: tabular-nums;
                        font-size: clamp(10px, 1.8cqi, 11.5px);
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-date-line,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-date-line {
                        margin-top: 1px;
                    }

                    .bbgl-ach-hh-cell-total {
                        flex-direction: row;
                        align-items: baseline;
                        gap: 4px;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-total,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-total {
                        flex-direction: column;
                        align-items: center;
                        /**/
                        gap: 0;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-total .bbgl-ach-hh-tag,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-total .bbgl-ach-hh-tag {
                        order: 1;
                    }

                    .bbgl-ach-hh-time {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-time,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-time {
                        display: inline;
                    }

                    .bbgl-ach-hh-cell-stat {
                        display: none;
                    }

                    #bbgl-panel.bbgl-expanded .bbgl-ach-hh-cell-stat,
                    #bbgl-panel.bbgl-mode-page .bbgl-ach-hh-cell-stat {
                        display: flex;
                    }

                    .bbgl-ach-copied-flash {
                        position: absolute;
                        inset: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #69f0ae;
                        font-weight: 600;
                        font-family: var(--bbgl-ach-val-font);
                        letter-spacing: .04em;
                        pointer-events: none;
                        z-index: 5;
                    }
                         /*==========================*/                                                    /*==========================*/
                  /*========================================*/                                      /*========================================*/
              /*================================================*/                             /*================================================*/
           /*======================================================*/                       /*======================================================*/
        /*============================================================*/                 /*============================================================*/
      /*================================================================*/             /*================================================================*/
    /*====================================================================*/         /*====================================================================*/
   /*======================================================================*/       /*======================================================================*/
  /*========================================================================*/     /*========================================================================*/
 /*==========================================================================*/   /*==========================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
/*============================================================================*/ /*============================================================================*/
 /*==========================================================================*/   /*==========================================================================*/
  /*========================================================================*/     /*========================================================================*/
   /*======================================================================*/       /*======================================================================*/
    /*====================================================================*/         /*====================================================================*/
      /*================================================================*/             /*================================================================*/
        /*============================================================*/                 /*============================================================*/
           /*======================================================*/                       /*======================================================*/
              /*================================================*/                             /*================================================*/
                  /*========================================*/                                     /*========================================*/
                         /*==========================*/                                                   /*==========================*/                         
`;

    function injectStyles() {
        if (document.getElementById('bbgl-styles')) return;
        const root = document.head || document.documentElement;
        if (!document.getElementById('bbgl-fonts')) {
            const pre = document.createElement('link');
            pre.id = 'bbgl-fonts-pre';
            pre.rel = 'preconnect';
            pre.href = 'https://fonts.gstatic.com';
            pre.crossOrigin = 'anonymous';
            root.appendChild(pre);
            const link = document.createElement('link');
            link.id = 'bbgl-fonts';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700&family=Fjalla+One&family=Inconsolata:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&family=VT323&display=swap';
            root.appendChild(link);
        }
        const style = document.createElement('style');
        style.id = 'bbgl-styles';
        style.textContent = CSS_STYLES;
        root.appendChild(style);
    }

    function injectApiCounter() {
        if (document.getElementById('bbgl-api-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'bbgl-api-hud';
        hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
        hud.style.display = 'none';
        document.body.appendChild(hud);
        dom.apiHud = hud;
    }

    function syncDevModeUI() {
        const mode = runtime.devMode;
        if (mode) {
            injectApiCounter();
            if (dom.apiHud) dom.apiHud.style.display = 'block';
        } else {
            if (dom.apiHud) dom.apiHud.style.display = 'none';
        }
        const btn = document.getElementById('dev-reset-btn');
        if (btn) btn.style.display = mode ? 'block' : 'none';
    }

    function cacheDOM(root) {
        if (!root) return;
        dom.panel = root.id === 'bbgl-panel' ? root : root.querySelector('#bbgl-panel') || root;
        if (!userConfig.animations) dom.panel.classList.add('bbgl-no-animations');
        if (!userConfig.ratesEnabled) dom.panel.classList.add('bbgl-no-rates');
        dom.topPanel = root.querySelector('#bbgl-top-panel');
        dom.bottomPanel = root.querySelector('#bbgl-bottom-panel');
        dom.settingsView = root.querySelector('#bbgl-settings-view');
        dom.welcomeView = root.querySelector('#bbgl-welcome-view');
        dom.itemViewer = root.querySelector('#bbgl-item-viewer');
        dom.dateLabel = root.querySelector('#bbgl-date-label');
        dom.summaryLabel = root.querySelector('#bbgl-summary-label');
        dom.ledgerView = root.querySelector('#bbgl-ledger-view');
        dom.graphContainer = root.querySelector('#bbgl-graph-container');
        dom.graphSvg = root.querySelector('#bbgl-graph-svg');
        dom.calContainer = root.querySelector('#bbgl-cal-container');
        dom.tallToggle = root.querySelector('#bbgl-tall-toggle');
        dom.copyBtn = root.querySelector('#bbgl-copy-btn');
        dom.itemCounters = root.querySelector('#bbgl-item-counters');
        dom.popBtn = root.querySelector('#bbgl-pop-btn');
        dom.monthTrigger = root.querySelector('#month-trigger');
        dom.yearTrigger = root.querySelector('#year-trigger');
        dom.monthDropdown = root.querySelector('#bbgl-month-dropdown');
        dom.yearDropdown = root.querySelector('#bbgl-year-dropdown');
        dom.achievementsContainer = root.querySelector('#bbgl-achievements-container');
        dom.achievementsToggle = root.querySelector('#bbgl-achievements-toggle');
        dom.stickerGrid = root.querySelector('#bbgl-sticker-grid');
        dom.stickerPagination = root.querySelector('#bbgl-sticker-pagination');
        dom.stickerTitle = root.querySelector('#bbgl-sticker-title');
        dom.stickerPrev = root.querySelector('#sticker-prev-btn');
        dom.stickerNext = root.querySelector('#sticker-next-btn');
        dom.stickerSponsor = root.querySelector('#sticker-sponsor-btn');
        dom.stickerContainer = root.querySelector('#bbgl-sticker-container');
        dom.stickerBg = root.querySelector('#bbgl-sticker-bg');
        dom.viPedestal = root.querySelector('#vi-pedestal-wrapper');
        dom.viObj = root.querySelector('#vi-obj-target');
        dom.viName = root.querySelector('#vi-name-target');
        dom.refreshBtn = root.querySelector('#refresh-log-btn');
        dom.contentWrapper = root.querySelector('#bbgl-content-wrapper');
        if (!dom.apiHud) dom.apiHud = document.getElementById('bbgl-api-hud');
        if (!dom.gymTab) dom.gymTab = document.getElementById('bbgl-gym-tab');
    }

    /**
     *  [SECTION IV] THE CHECK-IN COUNTER (Data Storage & Network)
     *  ========================================================================
     *  Though the last section was a lot to take in, this section
     *  is intentionally kept unminified so you can see exactly how
     *  your data is handled.
     *
     *  This script ONLY stores data locally on your browser and ONLY
     *  communicates with the official Torn API.
     *
     *  Layman explanations of every function are provided below for your peace of mind.
     */

    const DBManager = {
        _db: null,
        _DB_NAME: 'bbgl_db',
        _META_STORE: 'meta',
        _DAYS_STORE: 'days',
        _META_KEY: 'meta',

        // This function sets up a private database on your browser to save your history.
        initDB() {
            return new Promise((resolve, reject) => {
                if (this._db) {
                    resolve(this._db);
                    return;
                }
                Perf.start('initDB');
                const req = indexedDB.open(this._DB_NAME, 2);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (db.objectStoreNames.contains('history')) db.deleteObjectStore('history');
                    if (!db.objectStoreNames.contains(this._META_STORE)) db.createObjectStore(this._META_STORE);
                    if (!db.objectStoreNames.contains(this._DAYS_STORE)) db.createObjectStore(this._DAYS_STORE);
                };
                req.onsuccess = (e) => {
                    this._db = e.target.result;
                    Perf.end('initDB');
                    resolve(this._db);
                };
                req.onerror = (e) => {
                    Perf.end('initDB');
                    Log.error('IndexedDB open failed', e);
                    reject(e);
                };
            });
        },

        async _ensureDb() {
            if (!this._db) {
                try {
                    await this.initDB();
                } catch (e) {}
            }
            return this._db;
        },

        _readMeta() {
            return new Promise((resolve, reject) => {
                const tx = this._db.transaction(this._META_STORE, 'readonly');
                const req = tx.objectStore(this._META_STORE).get(this._META_KEY);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = (e) => {
                    Log.error('IndexedDB read failed', e);
                    reject(e);
                };
            });
        },

        _readAllDays() {
            return new Promise((resolve, reject) => {
                const out = [];
                const tx = this._db.transaction(this._DAYS_STORE, 'readonly');
                const req = tx.objectStore(this._DAYS_STORE).openCursor();
                req.onsuccess = (e) => {
                    const cur = e.target.result;
                    if (cur) {
                        out.push(cur.value);
                        cur.continue();
                    } else resolve(out);
                };
                req.onerror = (e) => {
                    Log.error('IndexedDB read failed', e);
                    reject(e);
                };
            });
        },

        // Saves your gym data to your browser's private storage.
        _persist(meta, dayObjs, replaceAll) {
            return new Promise((resolve, reject) => {
                if (!this._db) {
                    reject(new Error("Database not initialized"));
                    return;
                }
                try {
                    const tx = this._db.transaction([this._META_STORE, this._DAYS_STORE], 'readwrite');
                    const dayStore = tx.objectStore(this._DAYS_STORE);
                    if (replaceAll) dayStore.clear();
                    tx.objectStore(this._META_STORE).put(meta || {}, this._META_KEY);
                    (dayObjs || []).forEach(d => {
                        if (d && d.date) dayStore.put(d, d.date);
                    });
                    tx.oncomplete = () => {
                        // This tells other open tabs that your data has been updated.
                        _syncChannel.postMessage({
                            type: 'update',
                            from: _TAB_ID
                        });
                        resolve();
                    };
                    tx.onerror = (e) => {
                        const err = e.target.error;
                        Log.error('IndexedDB write failed', err);
                        if (err && err.name === 'QuotaExceededError') {
                            alert("⚠️ STORAGE ERROR: Browser quota exceeded.\n\nYour data could not be saved. Please export your history and then 'Clear Data' to free up space.");
                        }
                        reject(err);
                    };
                } catch (e) {
                    reject(e);
                }
            });
        },

        // Loads your complete gym history from your browser's private storage.
        async loadHistory() {
            await this._ensureDb();
            if (!this._db) return null;
            const [metaRaw, days] = await Promise.all([this._readMeta(), this._readAllDays()]);
            if (metaRaw === null && days.length === 0) return null;
            const meta = sanitizeMeta(metaRaw);
            days.forEach(sanitizeDayRecord);
            const logicalToday = Formatter.dateLogical();
            let today = null;
            const history = [];
            days.forEach(d => {
                if (d.date === logicalToday) today = d;
                else if ((d.series && d.series.length > 0) || (d.gains && d.gains.total > 0)) history.push(d);
            });
            history.sort((a, b) => a.date.localeCompare(b.date));
            if (!today) {
                const carry = history.length > 0 ? history[history.length - 1].endBreakdown : meta.baselineBreakdown;
                today = initializeDayObject(logicalToday, { ...(carry || ZERO_BREAKDOWN) });
            }
            return { meta, history, today };
        },

        // Saves your latest gym session to your browser.
        async saveDays(meta, dayObjs) {
            await this._ensureDb();
            return this._persist(meta, dayObjs, false);
        },

        // Packages your gym history for export.
        async getStorage() {
            await this._ensureDb();
            if (!this._db) return null;
            const [metaRaw, days] = await Promise.all([this._readMeta(), this._readAllDays()]);
            if (metaRaw === null && days.length === 0) return sanitizeStorageRecord(null);
            const series = [];
            days.forEach(d => {
                if (d && Array.isArray(d.series) && d.series.length > 0) {
                    for (const e of d.series) series.push(e);
                } else if (d && d.gains && d.gains.total > 0) {
                    const base = Formatter.parse(d.date);
                    const ts = Math.floor(base.getTime() / 1000) + 43200;
                    STAT_KEYS.forEach(stat => {
                        const gain = (d.gains && d.gains[stat]) || 0;
                        const cost = (d.eSpent && d.eSpent[stat]) || 0;
                        const after = (d.endBreakdown && d.endBreakdown[stat]) || 0;
                        if (gain > 0 || cost > 0) series.push({
                            ts,
                            stat,
                            gain,
                            cost,
                            after,
                            rate: cost > 0 ? r2((gain / cost) * 150) : 0,
                            synthetic: true
                        });
                    });
                }
            });
            series.sort((a, b) => a.ts - b.ts);
            return sanitizeStorageRecord({ meta: metaRaw || {}, series });
        },

        // Restores your gym history from an imported backup file.
        async setStorage(data) {
            await this._ensureDb();
            if (!this._db) throw new Error("Database not initialized");
            const meta = (data && data.meta) || {};
            const series = (data && Array.isArray(data.series)) ? data.series : [];
            const rebuilt = DataController._rebuildFromSeries(series, meta.baselineBreakdown || ZERO_BREAKDOWN);
            return this._persist(meta, [...rebuilt.history, rebuilt.today], true);
        },

        // This function permanently deletes your gym history from your browser when you click 'Clear Data'.
        async clearStorage() {
            await this._ensureDb();
            return new Promise((resolve, reject) => {
                if (!this._db) {
                    resolve();
                    return;
                }
                const tx = this._db.transaction([this._META_STORE, this._DAYS_STORE], 'readwrite');
                tx.objectStore(this._META_STORE).clear();
                tx.objectStore(this._DAYS_STORE).clear();
                tx.oncomplete = () => {
                    _syncChannel.postMessage({
                        type: 'update',
                        from: _TAB_ID
                    });
                    resolve();
                };
                tx.onerror = (e) => {
                    Log.error('IndexedDB clear failed', e);
                    reject(e);
                };
            });
        }
    };

    const _syncChannel = new BroadcastChannel('bbgl_sync');
    let _xtabSyncTimer = null;
    _syncChannel.onmessage = (event) => {
        if (event.data && event.data.from === _TAB_ID) return;
        if (runtime.demoMode) return;
        if (_xtabSyncTimer) clearTimeout(_xtabSyncTimer);
        _xtabSyncTimer = setTimeout(async () => {
            _xtabSyncTimer = null;
            try {
                const loaded = await DBManager.loadHistory();
                DataController.hydrate(loaded);
                if (dom.panel && dom.panel.style.display !== 'none') renderPanelContent();
            } catch (e) {
                Log.warn('Cross-tab sync failed', e);
            }
        }, 200);
    };

    function defaultBackfill() {
        return {
            targets: {},
            cooldownUntil: 0,
            lastResult: null,
            acknowledged: true
        };
    }

    function normalizeBackfill(ds) {
        const d = defaultBackfill();
        if (ds && typeof ds === 'object') {
            if (ds.targets && typeof ds.targets === 'object') d.targets = ds.targets;
            if (typeof ds.cooldownUntil === 'number') d.cooldownUntil = ds.cooldownUntil;
            if (ds.lastResult === 'complete' || ds.lastResult === 'partial') d.lastResult = ds.lastResult;
            if (typeof ds.acknowledged === 'boolean') d.acknowledged = ds.acknowledged;
        }
        return d;
    }

    function sanitizeMeta(metaRaw) {
        const m = (metaRaw && typeof metaRaw === 'object') ? metaRaw : {};
        if (!m.baselineBreakdown) m.baselineBreakdown = {
            ...ZERO_BREAKDOWN
        };
        m.backfill = normalizeBackfill(m.backfill);
        const k = ['str', 'def', 'spd', 'dex'];
        k.forEach(key => {
            if (m.baselineBreakdown[key] !== undefined) m.baselineBreakdown[key] = parseFloat(m.baselineBreakdown[key]) || 0;
        });
        return m;
    }

    function sanitizeEntry(e) {
        if (e.type === 'item') {
            if (e.ts !== undefined) e.ts = parseInt(e.ts);
            if (e.energy !== undefined) e.energy = parseInt(e.energy);
            return;
        }
        if (e.ts !== undefined) e.ts = parseInt(e.ts);
        if (e.gain !== undefined) e.gain = parseFloat(e.gain);
        if (e.after !== undefined) e.after = parseFloat(e.after);
        if (e.cost !== undefined) e.cost = parseInt(e.cost);
        e.rate = (e.cost > 0) ? r2((e.gain / e.cost) * 150) : 0;
    }

    function sanitizeDayRecord(d) {
        if (d && Array.isArray(d.series)) d.series.forEach(sanitizeEntry);
        return d;
    }

    function sanitizeStorageRecord(s) {
        if (!s || typeof s !== 'object') return {
            meta: {
                baselineBreakdown: {
                    ...ZERO_BREAKDOWN
                }
            },
            series: []
        };
        s.meta = sanitizeMeta(s.meta);
        if (!s.series || !Array.isArray(s.series)) s.series = [];
        s.series.forEach(sanitizeEntry);
        return s;
    }

    function validateImportSchema(j) {
        if (!j || typeof j !== 'object') return {
            ok: false,
            msg: "Invalid file format."
        };
        if (!j.storage || typeof j.storage !== 'object') return {
            ok: false,
            msg: "No training data found in file."
        };
        const s = j.storage;
        if (s.series && !Array.isArray(s.series)) return {
            ok: false,
            msg: "Training series is malformed (not an array)."
        };
        if (s.meta && s.meta.baselineBreakdown) {
            const keys = Object.keys(s.meta.baselineBreakdown);
            if (!keys.includes('str') && !keys.includes('def')) return {
                ok: false,
                msg: "Baseline stats are missing or invalid."
            };
        }
        return {
            ok: true
        };
    }

    // This is the ONLY function that connects to the internet with your API key.
    // It strictly contacts api.torn.com to fetch your Gym training logs (Log IDs 5300-5303), a
    // fixed short list of item-use logs (Xanax, energy cans, etc. — see ITEM_LOG_META), and current stats.
    async function universalFetch(mission, options = {}) {
        if (runtime.demoMode) return {
            success: false,
            demo: true
        };
        if (runtime.backfilling) return {
            ok: false,
            suppressed: true
        };
        const {
            specId = null
        } = options;

        if (!userConfig.apiKey || userConfig.apiKey.length < 16) {
            return {
                ok: false,
                error: 'API Key is missing or too short.'
            };
        }

        const ts = Date.now();
        const meta = getActiveHistory().meta;
        const fromFor = key => {
            const fl = meta.syncFloor && meta.syncFloor[key];
            return fl ? `&from=${Math.max(0, fl - SYNC_FROM_BUFFER)}` : '';
        };
        let reqs = [];

        if (mission === 'TRAIN_SINGLE' && specId) {
            reqs.push({
                type: 'log',
                floorKey: 'trainEnergy',
                url: `https://api.torn.com/user/?selections=log&log=${specId},${ENERGY_PARAM}&key=${userConfig.apiKey}${fromFor('trainEnergy')}&timestamp=${ts}`
            });
        } else {
            reqs = [{
                    type: 'battlestats',
                    url: `https://api.torn.com/user/?selections=battlestats&key=${userConfig.apiKey}&timestamp=${ts}`
                },
                {
                    type: 'log',
                    floorKey: 'trainEnergy',
                    url: `https://api.torn.com/user/?selections=log&log=${TRAIN_ENERGY_PARAM}&key=${userConfig.apiKey}${fromFor('trainEnergy')}&timestamp=${ts}`
                },
                {
                    type: 'log',
                    floorKey: 'statHappy',
                    url: `https://api.torn.com/user/?selections=log&log=${STAT_HAPPY_PARAM}&key=${userConfig.apiKey}${fromFor('statHappy')}&timestamp=${ts}`
                }
            ];
        }

        incrementApiCount(reqs.length);

        try {
            // This safely performs the official Torn API request using your provided key.
            const res = await Promise.all(reqs.map(c => fetch(c.url).then(r => {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            }).then(d => ({
                cfg: c,
                data: d
            }))));
            const errObj = res.find(r => r.data.error);
            if (errObj) {
                throw new Error(errObj.data.error.error);
            }

            let logs = {},
                bs = null;
            res.forEach(r => {
                if (r.data.log) logs = { ...logs, ...r.data.log };
                if (r.cfg.type === 'battlestats') bs = r.data;
            });

            const tsSec = Math.floor(ts / 1000);
            if (!meta.syncFloor) meta.syncFloor = {};
            reqs.forEach(c => {
                if (c.floorKey) meta.syncFloor[c.floorKey] = tsSec;
            });

            if (mission !== 'TRAIN_SINGLE') {
                localStorage.setItem(KEYS.LAST_SYNC, ts.toString());
                localStorage.setItem(KEYS.BS_SYNC, ts.toString());
            }
            await DataController.processDataPayload(logs, bs);

            return {
                ok: true
            };

        } catch (e) {
            Log.error('Sync failed', e);
            const isQuota = e.name === 'QuotaExceededError' || (e.message && e.message.toLowerCase().includes('quota'));
            const errorMsg = isQuota ?
                'Sync failed because your browser ran out of local storage space. Close all open Torn tabs, clear your browser cache, and reload the page.\n\nError Code: 69' :
                (e.message || 'Network Error');
            return {
                ok: false,
                error: errorMsg
            };
        }
    }

    // This function updates the 'Refresh' button in the app while it's fetching your latest logs.
    async function syncWithFeedback(mission, options = {}) {
        Perf.start('syncWithFeedback');
        const btn = dom.refreshBtn;
        if (btn) {
            btn.style.opacity = "0.4";
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.innerText = "Syncing...";
        }

        const result = await universalFetch(mission, options);

        if (result.ok) {
            scheduleHeartbeat();
            if (btn) {
                btn.innerText = "Refreshed!";
                btn.style.color = "#43a047";
                btn.style.opacity = "1";
                if (btn.dataset.timerId) clearTimeout(btn.dataset.timerId);
                btn.dataset.timerId = setTimeout(() => {
                    resetRefreshBtn(btn);
                }, 2000);
            }
        } else if (result.suppressed) {
            // A backfill is running and owns the daily row pool; quietly stand down, no error.
            resetRefreshBtn(btn);
        } else {
            alert("Sync Error: " + result.error);
            resetRefreshBtn(btn);
        }
        Perf.end('syncWithFeedback');
    }

    // Automatically checks for new training data every 2 hours in the background.
    function scheduleHeartbeat() {
        if (runtime.bgSyncId) clearTimeout(runtime.bgSyncId);
        const lastFull = localStorage.getItem(KEYS.LAST_SYNC);
        const elapsed = lastFull ? (Date.now() - parseInt(lastFull)) : Infinity;
        const delay = elapsed >= 7200000 ? 0 : (7200000 - elapsed);
        runtime.bgSyncId = setTimeout(async function bgSyncTick() {
            runtime.bgSyncId = null;
            await universalFetch('FULL_SYNC');
            scheduleHeartbeat();
        }, delay);
    }

    function startBackgroundSync() {
        scheduleHeartbeat();
    }

    // This makes sure your final gym training logs are saved even if you navigate away from the gym page.
    async function checkExitSync() {
        const f = sessionStorage.getItem(KEYS.SESSION);
        if (f === 'true' && !window.location.href.includes('gym.php')) {
            sessionStorage.removeItem(KEYS.SESSION);
            await universalFetch('FULL_SYNC');
            scheduleHeartbeat();
        }
    }

    const GYM_STAT_LOGS = {
        str: '5300',
        def: '5301',
        spd: '5302',
        dex: '5303'
    };

    function backfillDayStart(ts) {
        return Math.floor(Formatter.parse(Formatter.dateLogical(ts * 1000)).getTime() / 1000);
    }

    const BACKFILL_CODES = [...TRAIN_LOGS, ...ITEM_LOGS].map(String);

    function ensureBackfillTargets(ds) {
        if (!ds.targets.frontiers) ds.targets.frontiers = {};
        const seed = Math.floor(Date.now() / 1000);
        BACKFILL_CODES.forEach(code => {
            if (!ds.targets.frontiers[code]) ds.targets.frontiers[code] = {
                cursor: seed,
                complete: false
            };
        });
        return ds.targets.frontiers;
    }

    function seriesEntryCode(e) {
        return e.type === 'item' ? String(e.logId) : GYM_STAT_LOGS[e.stat];
    }

    function computeBackfillFloor(stored, frontiers) {
        const existing = (typeof stored.meta.logStartDate === 'number') ? stored.meta.logStartDate : null;
        if (!stored.series.length) return existing;

        const perCodeOldest = {};
        stored.series.forEach(e => {
            const code = seriesEntryCode(e);
            if (code && (perCodeOldest[code] === undefined || e.ts < perCodeOldest[code])) perCodeOldest[code] = e.ts;
        });

        let shallowPartialDayStart = null;
        Object.keys(frontiers || {}).forEach(code => {
            const fr = frontiers[code];
            if (fr && !fr.complete && perCodeOldest[code] !== undefined) {
                const dayStart = backfillDayStart(perCodeOldest[code]);
                if (shallowPartialDayStart === null || dayStart > shallowPartialDayStart) shallowPartialDayStart = dayStart;
            }
        });

        let newFloor;
        if (shallowPartialDayStart !== null) {
            newFloor = shallowPartialDayStart + 86400;
        } else {
            newFloor = backfillDayStart(stored.series[0].ts);
        }
        if (existing !== null) newFloor = Math.min(newFloor, existing);
        return newFloor;
    }

    // Saves the results of a Deep Log Scan to your browser's private storage.
    async function finalizeBackfill(ds, collected) {
        let stored = await DBManager.getStorage();
        if (!stored) stored = {
            meta: {
                baselineBreakdown: {
                    ...ZERO_BREAKDOWN
                }
            },
            series: []
        };
        if (!Array.isArray(stored.series)) stored.series = [];

        if (collected.length > 0) {
            const seenGym = new Set(stored.series.filter(e => e.type !== 'item').map(e => `${e.ts}_${e.stat}_${e.after}`));
            const itemKey = e => `${e.ts}_${e.logId}`;
            const seenItem = new Set(stored.series.filter(e => e.type === 'item').map(itemKey));
            collected.forEach(l => {
                if (l.type === 'item') {
                    const key = itemKey(l);
                    if (!seenItem.has(key)) {
                        seenItem.add(key);
                        const entry = {
                            ts: l.ts,
                            type: 'item',
                            id: l.id,
                            logId: l.logId
                        };
                        if (l.energy) entry.energy = l.energy;
                        stored.series.push(entry);
                    }
                    return;
                }
                const after = r2(l.after);
                const key = `${l.ts}_${l.stat}_${after}`;
                if (!seenGym.has(key)) {
                    seenGym.add(key);
                    stored.series.push({
                        ts: l.ts,
                        stat: l.stat,
                        gain: r2(l.gain),
                        cost: l.cost,
                        after,
                        rate: l.cost > 0 ? r2((l.gain / l.cost) * 150) : 0
                    });
                }
            });
            stored.series.sort((a, b) => a.ts - b.ts);

            const baseline = {
                ...((stored.meta && stored.meta.baselineBreakdown) || ZERO_BREAKDOWN)
            };
            STAT_KEYS.forEach(k => {
                const first = stored.series.find(e => e.stat === k);
                if (first) baseline[k] = r2(first.after - first.gain);
            });
            stored.meta.baselineBreakdown = baseline;

            stored.meta.logStartDate = computeBackfillFloor(stored, ds.targets.frontiers);
        }

        stored.meta.backfill = ds;
        await DBManager.setStorage(stored);

        const rebuilt = DataController._rebuildFromSeries(stored.series || [], stored.meta.baselineBreakdown || ZERO_BREAKDOWN);
        _historyCache = {
            meta: stored.meta,
            history: rebuilt.history,
            today: rebuilt.today
        };
        DataController.invalidate();
    }

    // Called when you dismiss the 'Scan Complete' confirmation after a Deep Log Scan.
    async function acknowledgeBackfill() {
        if (runtime.demoMode || runtime.backfilling) return;
        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;
        if (!ds || ds.lastResult !== 'complete' || ds.acknowledged !== false) return;
        ds.acknowledged = true;
        await finalizeBackfill(ds, []);
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        renderBackfillButton();
    }

    // Deep Log Scan: uses your API key to page back through your full training history on Torn's
    // servers. Only reads gym training logs and a short list of item logs (energy cans, Xanax, etc.)
    // — never reads your messages, money, or any other personal information.
    async function backfillLogs(btn) {
        if (runtime.demoMode) return;
        if (!userConfig.apiKey || userConfig.apiKey.length < 16) {
            alert('API Key is missing or too short.');
            return;
        }

        if (runtime.backfilling) return;

        const s = getActiveHistory();
        if (!s.meta.backfill) s.meta.backfill = defaultBackfill();
        const ds = s.meta.backfill;
        const now = Date.now();

        if (ds.cooldownUntil && now < ds.cooldownUntil) {
            renderBackfillButton();
            return;
        }

        const frontiers = ensureBackfillTargets(ds);

        ds.lastResult = 'partial';
        ds.cooldownUntil = Date.now() + BACKFILL.COOLDOWN_MS;
        await finalizeBackfill(ds, []);

        runtime.backfilling = true;
        if (btn) {
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.85';
            btn.innerText = 'Scanning... 0';
        }

        let rowsFetched = 0;
        let stoppedEarly = false;
        let drainDay = null;
        const collected = [];

        try {
            while (rowsFetched < BACKFILL.HARD_CAP) {
                let pick = null;
                const consider = (fr, code) => {
                    if (fr.complete) return;
                    if (drainDay !== null && fr.cursor < drainDay) return;
                    if (pick === null || fr.cursor > pick.fr.cursor) pick = { fr, code };
                };
                BACKFILL_CODES.forEach(code => consider(frontiers[code], code));
                if (pick === null) break;

                const st = pick.fr;
                const url = `https://api.torn.com/user/?selections=log&log=${pick.code}&key=${userConfig.apiKey}&to=${Math.floor(st.cursor)}`;
                incrementApiCount(1);
                let data;
                try {
                    const resp = await fetch(url);
                    if (!resp.ok) throw new Error(resp.status);
                    data = await resp.json();
                } catch (netErr) {
                    Log.warn('Deep scan network error', netErr);
                    stoppedEarly = true;
                    break;
                }
                if (data.error) {
                    if (data.error.code === 14 || data.error.code === 5) {
                        stoppedEarly = true;
                        break;
                    }
                    throw new Error(data.error.error);
                }

                const rowKeys = data.log ? Object.keys(data.log) : [];
                if (rowKeys.length === 0) {
                    st.complete = true;
                    continue;
                }

                collected.push(...normalizeApiLogs(data.log));
                rowsFetched += rowKeys.length;

                let oldestTs = st.cursor;
                for (const k of rowKeys) {
                    const t = data.log[k].timestamp;
                    if (t < oldestTs) oldestTs = t;
                }
                st.cursor = oldestTs - 1;

                if (btn) btn.innerText = `Scanning... ${rowsFetched}`;

                if (drainDay === null && rowsFetched >= BACKFILL.SOFT_CAP) {
                    let maxCursor = -Infinity;
                    BACKFILL_CODES.forEach(code => {
                        const fr = frontiers[code];
                        if (!fr.complete && fr.cursor > maxCursor) maxCursor = fr.cursor;
                    });
                    if (maxCursor > -Infinity) drainDay = backfillDayStart(maxCursor);
                }

                if (rowsFetched >= BACKFILL.HARD_CAP) {
                    stoppedEarly = true;
                    break;
                }
                await new Promise(r => setTimeout(r, BACKFILL.THROTTLE_MS));
            }
        } catch (e) {
            Log.error('Deep sync failed', e);
            stoppedEarly = true;
        }

        const allComplete = BACKFILL_CODES.every(code => frontiers[code].complete);
        if (allComplete && !stoppedEarly) {
            ds.lastResult = 'complete';
            ds.acknowledged = false;
            ds.cooldownUntil = 0;
        } else {
            ds.lastResult = 'partial';
            ds.cooldownUntil = Date.now() + BACKFILL.COOLDOWN_MS;
        }

        try {
            await finalizeBackfill(ds, collected);
        } catch (e) {
            Log.error('Deep scan save failed', e);
        } finally {
            runtime.backfilling = false;
        }
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        renderBackfillButton();
    }

    /**
     *  [SECTION V] THE EXERCISE (Data Logic)
     *  ========================================================================
     *  Reps. Sets. Rest. Repeat. Shower.
     *  Raw inputs go in and warm, gooey data comes out.
     */

    const STAT_KEYS = ['str', 'def', 'spd', 'dex'];

    function sumStats(o) {
        return (o.str || 0) + (o.def || 0) + (o.spd || 0) + (o.dex || 0);
    }
    const DataController = {
        _cache: {
            timeline: null,
            slices: {},
            dateMap: null,
            rateArr: null,
            stickerMap: null,
            unlockedCount: null,
            featuredDays: null,
            hjData: null
        },
        invalidate() {
            this._cache.timeline = null;
            this._cache.slices = {};
            this._cache.dateMap = null;
            this._cache.rateArr = null;
            this._cache.stickerMap = null;
            this._cache.unlockedCount = null;
            this._cache.featuredDays = null;
            this._cache.hjData = null;
            runtime.stickerData = [];
            runtime._achCache = null;
        },
        // Lighter invalidation for changes that only touch the current day's stats (e.g. a
        // battlestats snap from the idle poll). Only the caches that embed today's values go
        // stale; the sticker map, rate cache, happy-jump data, and achievements are derived
        // purely from PAST days (getStickerMap skips `date >= today`, _buildRateCache uses
        // history only, computeAchievements/hjData are unaffected by an absolute-stat snap that
        // leaves the day's series/gains/eSpent untouched), so they stay valid. A day rollover or
        // any change to historical days must still call the full invalidate().
        invalidateToday() {
            this._cache.timeline = null;
            this._cache.dateMap = null;
            this._cache.slices = {};
        },
        // Fast hydration from a pre-built { meta, history, today } (DBManager.loadHistory()).
        // Replaces the old syncCache-on-boot path: no series flatten, no _rebuildFromSeries,
        // no session serialization.
        hydrate(loaded) {
            _historyCache = loaded || null;
            this.invalidate();
        },
        syncCache(stored) {
            Perf.start('syncCache');
            if (stored) {
                const clean = sanitizeStorageRecord(stored);
                const rebuilt = this._rebuildFromSeries(clean.series || [], (clean.meta && clean.meta.baselineBreakdown) || ZERO_BREAKDOWN);
                _historyCache = {
                    meta: clean.meta || {},
                    history: rebuilt.history,
                    today: rebuilt.today
                };
            } else {
                _historyCache = null;
            }
            this.invalidate();
            Perf.end('syncCache');
        },
        isStickerCleared(id) {
            if (runtime.demoMode) return id === 1;
            return getStickerState(id)[1] === '+';
        },
        markStickerCleared(id) {
            if (runtime.demoMode) return;
            persistStickerCleared(id);
        },
        getHappyJumpData() {
            if (this._cache.hjData) return this._cache.hjData;
            const hjWeek = {},
                hjDaySet = new Set();
            const allSeries = [];
            this.getTimeline().forEach(day => {
                (day.series || []).forEach(e => {
                    if (e.ts && e.cost) allSeries.push(e);
                });
            });
            allSeries.sort((a, b) => a.ts - b.ts);
            if (allSeries.length > 0) {
                let cStart = allSeries[0].ts,
                    cCost = allSeries[0].cost;
                const register = () => {
                    if (cCost >= 1000) {
                        const d = Formatter.dateLogical(cStart * 1000);
                        const wk = getWeekKey(d);
                        hjWeek[wk] = (hjWeek[wk] || 0) + 1;
                        hjDaySet.add(d);
                    }
                };
                for (let i = 1; i < allSeries.length; i++) {
                    const entry = allSeries[i];
                    if (entry.ts - cStart <= GAME.HJ_WINDOW_SECONDS) {
                        cCost += entry.cost;
                    } else {
                        register();
                        cStart = entry.ts;
                        cCost = entry.cost;
                    }
                }
                register();
            }
            this._cache.hjData = {
                hjWeek,
                hjDaySet
            };
            return this._cache.hjData;
        },
        getStickerMap() {
            if (this._cache.stickerMap) return this._cache.stickerMap;
            const today = Formatter.dateLogical();
            const todayWeekKey = getWeekKey(today);
            const weekMap = {};
            this.getTimeline().forEach(day => {
                if (day.date >= today) return;
                const wk = getWeekKey(day.date);
                if (!weekMap[wk]) weekMap[wk] = [];
                weekMap[wk].push(day);
            });
            const {
                hjWeek,
                hjDaySet,
                dHjDaySet
            } = this.getHappyJumpData();
            const stickerMap = new Map();
            const featuredSet = new Set();
            let unlockedCount = 1;
            let rouletteCounter = 0;
            // Reward gating: stickers (and their unlock progression) only count from the install
            // week onward. Pre-install weeks still render their bar/day counts elsewhere, but earn
            // no stickers here. Demo mode is exempt (keeps its 1-sticker showcase behavior).
            const installWeekKey = runtime.demoMode ? null : getInstallWeekKey();
            Object.keys(weekMap).sort().forEach(wk => {
                if (wk > todayWeekKey) return;
                if (installWeekKey && wk < installWeekKey) return;
                const days = weekMap[wk].sort((a, b) => a.date.localeCompare(b.date));
                const stickerworthyDays = days.filter(d => d.eSpent && d.eSpent.total >= 1000);
                if (!stickerworthyDays.length) return;
                let completionDays = days;
                if (wk === todayWeekKey) {
                    const todayEntry = this.getTimeline().find(d => d.date === today);
                    if (todayEntry) completionDays = [...days, todayEntry];
                }
                const {
                    isCompleted,
                    isGold
                } = computeWeekCompletion(completionDays, hjDaySet, hjWeek[wk] || 0, dHjDaySet);
                const numFeatured = isGold ? 2 : (isCompleted ? 1 : 0);
                const splitIdx = Math.max(0, stickerworthyDays.length - numFeatured);
                const rouletteDays = stickerworthyDays.slice(0, splitIdx);
                const featuredDays = stickerworthyDays.slice(splitIdx);
                const rouletteStep = (unlockedCount <= 20 && unlockedCount !== 11) ? 11 : 9;
                rouletteDays.forEach(day => {
                    const rawIdx = (rouletteCounter * rouletteStep) % unlockedCount;
                    const idx = runtime.demoMode ? 0 : rawIdx;
                    stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
                    rouletteCounter++;
                });
                featuredDays.forEach((day, i) => {
                    const newIdx = unlockedCount + i;
                    if (newIdx < CUSTOM_STICKERS.length) {
                        const idx = runtime.demoMode ? 0 : newIdx;
                        stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
                        featuredSet.add(day.date);
                    } else {
                        const rawIdx = (rouletteCounter * rouletteStep) % unlockedCount;
                        const idx = runtime.demoMode ? 0 : rawIdx;
                        stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
                        rouletteCounter++;
                    }
                });
                unlockedCount = Math.min(unlockedCount + numFeatured, CUSTOM_STICKERS.length);
            });
            if (runtime.demoMode) unlockedCount = 1;
            this._cache.stickerMap = stickerMap;
            this._cache.featuredDays = featuredSet;
            this._cache.unlockedCount = unlockedCount;
            if (!runtime.demoMode) {
                const existingStates = (_historyCache && _historyCache.meta && _historyCache.meta.stickers) ? _historyCache.meta.stickers : {};
                const freshStates = {};
                for (let i = 1; i <= CUSTOM_STICKERS.length; i++) {
                    const key = String(i);
                    const wasClear = (existingStates[key] || '--')[1] === '+';
                    freshStates[key] = (i <= unlockedCount ? '+' : '-') + (wasClear ? '+' : '-');
                }
                if (_historyCache) {
                    if (!_historyCache.meta) _historyCache.meta = {};
                    _historyCache.meta.stickers = freshStates;
                }
            }
            return stickerMap;
        },
        getTimeline() {
            if (this._cache.timeline) return this._cache.timeline;
            const s = getActiveHistory();
            let t = [...(s.history || [])];
            if (s.today && (s.today.date || s.today.startTotal > 0)) {
                t = t.filter(d => d.date !== s.today.date);
                t.push(s.today);
            }
            t.sort((a, b) => a.date.localeCompare(b.date));
            if (s.meta && s.meta.logStartDate) {
                const floor = Formatter.dateLogical(s.meta.logStartDate * 1000);
                t = t.filter(d => d.date >= floor);
            }
            this._cache.timeline = t;
            return t;
        },
        getDateMap() {
            if (this._cache.dateMap) return this._cache.dateMap;
            const t = this.getTimeline(),
                m = {};
            t.forEach(d => {
                m[d.date] = d;
            });
            this._cache.dateMap = m;
            return m;
        },
        // Calendar-day span of a slice's period, clamped to today (drives the ledger drug avg/day and
        // the refill ratio denominator). DAY=1; WEEK from its 7-day bounds; MONTH/YEAR derived from
        // the data's own dates; ALL from the timeline origin. Always >= 1.
        periodCalendarDays(sl) {
            if (!sl || sl.resolution === 'DAY') return 1;
            const DAY = 86400000,
                today = Formatter.dateLogical();
            const span = (startStr, endStr) => {
                const end = endStr > today ? today : endStr;
                if (!startStr || !end) return 1;
                return Math.max(1, Math.round((Formatter.parse(end).getTime() - Formatter.parse(startStr).getTime()) / DAY) + 1);
            };
            const dl = sl._dailyList || [];
            if (sl.resolution === 'WEEK') {
                const s = sl._weekStart || (dl[0] && dl[0].date),
                    e = sl._weekEnd || (dl.length ? dl[dl.length - 1].date : null);
                return s && e ? span(s, e) : (dl.length || 1);
            }
            if (!dl.length) return 1;
            if (sl.resolution === 'MONTH') {
                const p = dl[0].date.slice(0, 7),
                    y = +p.slice(0, 4),
                    mo = +p.slice(5, 7);
                const dim = new Date(y, mo, 0).getDate();
                return span(`${p}-01`, `${p}-${String(dim).padStart(2, '0')}`);
            }
            if (sl.resolution === 'YEAR') {
                const y = dl[0].date.slice(0, 4);
                return span(`${y}-01-01`, `${y}-12-31`);
            }
            // ALL / other: full span from the earliest timeline day to today.
            const tl = this.getTimeline();
            return tl.length ? span(tl[0].date, today) : (dl.length || 1);
        },
        _buildRateCache() {
            const h = getActiveHistory();
            const allDays = [...(h.history || [])].sort((a, b) => a.date.localeCompare(b.date));
            const running = {
                str: null,
                def: null,
                spd: null,
                dex: null
            };
            const arr = [];
            // Origin rates: derived from the first per-entry rate on or after the
            // timeline floor (first fully-visible day). Replaces the old persisted
            // meta.originRates which locked in at genesis time and went stale when
            // backfill extended history backward.
            const derived = {};
            let floorDate = null;
            if (h.meta && h.meta.logStartDate) {
                floorDate = Formatter.dateLogical(h.meta.logStartDate * 1000);
            }
            allDays.forEach(day => {
                if (day.series && day.series.length > 0) {
                    day.series.forEach(e => {
                        if (e.cost > 0) {
                            running[e.stat] = e.rate;
                            if (!derived[e.stat] && (!floorDate || day.date >= floorDate)) {
                                derived[e.stat] = e.rate;
                            }
                        }
                    });
                } else {
                    STAT_KEYS.forEach(k => {
                        const cost = (day.eSpent && day.eSpent[k]) || 0;
                        const gain = day.gains ? (day.gains[k] || 0) : 0;
                        if (cost > 0) {
                            running[k] = (gain / cost) * 150;
                            if (!derived[k] && (!floorDate || day.date >= floorDate)) {
                                derived[k] = (gain / cost) * 150;
                            }
                        }
                    });
                }
                arr.push({
                    date: day.date,
                    rates: {
                        ...running
                    }
                });
            });
            this._cache.rateArr = arr;
            this._cache.originRates = derived;
        },
        getHistoricalRate(dateStr, stat) {
            if (!this._cache.rateArr) this._buildRateCache();
            const arr = this._cache.rateArr,
                or = this._cache.originRates;
            let lo = 0,
                hi = arr.length - 1,
                best = -1;
            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                if (arr[mid].date <= dateStr) {
                    best = mid;
                    lo = mid + 1;
                } else hi = mid - 1;
            }
            if (best === -1) return (or[stat] || 0);
            const rate = arr[best].rates[stat];
            return rate !== null ? rate : (or[stat] || 0);
        },
        getOriginRate(stat) {
            if (!this._cache.rateArr) this._buildRateCache();
            return (this._cache.originRates && this._cache.originRates[stat]) || 0;
        },
        getSlice(mode, target, year = null) {
            let k = `${mode}_${target}`;
            if (mode === 'CUSTOM') k = `CUSTOM_${target.map(d => d.date).join('_')}`;
            if (mode === 'MONTH') k = `MONTH_${year}_${target}`;
            if (this._cache.slices[k]) return this._cache.slices[k];
            let raw = null,
                res = mode,
                list = [];
            if (mode === 'DAY') raw = this.getDateMap()[target];
            else if (mode === 'MONTH') {
                const idx = CONSTANTS.MONTHS.indexOf(target);
                if (idx > -1) {
                    const p = `${year}-${String(idx + 1).padStart(2, '0')}`;
                    list = this.getTimeline().filter(d => d.date.startsWith(p));
                }
            } else if (mode === 'YEAR') list = this.getTimeline().filter(d => d.date.startsWith(target));
            else if (mode === 'ALL') {
                list = this.getTimeline();
                res = 'ALL';
            } else if (mode === 'CUSTOM') {
                list = target;
                res = 'WEEK';
            }
            const sl = this._hydrate(raw, list, target, res);
            this._cache.slices[k] = sl;
            return sl;
        },
        _getLastEntryRate(day, stat, totalGain, totalCost) {
            if (day.series && day.series.length > 0) {
                for (let i = day.series.length - 1; i >= 0; i--) {
                    const entry = day.series[i];
                    if (entry.stat === stat && entry.cost > 0) {
                        return entry.rate != null ? entry.rate : r2((entry.gain / entry.cost) * 150);
                    }
                }
            }
            return r2((totalGain / totalCost) * 150);
        },
        _hydrate(sDay, dList, lbl, res) {
            const r = {
                label: lbl,
                resolution: res,
                date: (sDay ? sDay.date : (dList[0] ? dList[0].date : lbl)),
                stats: {},
                meta: {
                    tier: 0,
                    isGap: false,
                    totalEnergy: 0
                },
                _dailyList: dList || []
            };
            const ge = (d, k) => (!d || !d.eSpent) ? 0 : (d.eSpent[k] || 0);
            const gg = (d, k) => d && d.gains ? (d.gains[k] || 0) : 0;
            const gend = (d, k) => d && (d.endBreakdown || d.end) ? (d.endBreakdown || d.end)[k] || 0 : 0;
            const gst = (d, k) => d && (d.startBreakdown || d.start) ? (d.startBreakdown || d.start)[k] || 0 : 0;
            const keys = [...STAT_KEYS, 'total'];
            if (sDay) {
                keys.forEach(k => {
                    const e = ge(sDay, k),
                        g = gg(sDay, k);
                    let s = gst(sDay, k),
                        end = gend(sDay, k);
                    if (k === 'total') {
                        if (!s) s = STAT_KEYS.reduce((a, x) => a + gst(sDay, x), 0);
                        if (!end) end = STAT_KEYS.reduce((a, x) => a + gend(sDay, x), 0);
                    }
                    r.stats[k] = {
                        start: s,
                        gain: g,
                        end: end,
                        cost: e,
                        rate: e > 0 ? this._getLastEntryRate(sDay, k, g, e) : (k !== 'total' ? this.getHistoricalRate(sDay.date, k) : 0)
                    };
                });
                r.meta.totalEnergy = r.stats.total.cost;
            } else if (dList.length > 0) {
                const srt = [...dList].sort((a, b) => a.date.localeCompare(b.date)),
                    f = srt[0],
                    l = srt[srt.length - 1];
                keys.forEach(k => {
                    let tc = 0,
                        tg = 0;
                    srt.forEach(d => {
                        tc += ge(d, k);
                        tg += gg(d, k);
                    });
                    let s = gst(f, k),
                        end = gend(l, k);
                    if (k === 'total') {
                        if (!s) s = STAT_KEYS.reduce((a, x) => a + gst(f, x), 0);
                        if (!end) end = STAT_KEYS.reduce((a, x) => a + gend(l, x), 0);
                    }
                    r.stats[k] = {
                        start: s,
                        gain: tg,
                        end: end,
                        cost: tc,
                        rate: tc > 0 ? r2((tg / tc) * 150) : 0
                    };
                });
                r.meta.totalEnergy = r.stats.total.cost;
            } else {
                r.meta.isGap = true;
                const pastEnd = {
                    ...([...this.getTimeline()].reverse().find(d => d.date < r.date)?.endBreakdown || getActiveHistory().meta.baselineBreakdown || {})
                };
                pastEnd.total = STAT_KEYS.reduce((a, x) => a + (pastEnd[x] || 0), 0);
                keys.forEach(k => {
                    r.stats[k] = {
                        start: pastEnd[k] || 0,
                        gain: 0,
                        end: pastEnd[k] || 0,
                        cost: 0,
                        rate: k !== 'total' ? this.getHistoricalRate(r.date, k) : 0
                    };
                });
            }
            // Gain is the authoritative delta between the absolute start/end snapshots, NOT the
            // sum of per-entry log gains. Summing logs under-reports whenever a training row is
            // missing from the API data (e.g. dense bursts the deep scan couldn't fully capture),
            // which breaks the "gain = total - starting" identity in the summaries. The `after`
            // snapshots are ground truth and telescope exactly, so derive gain from them here.
            // (Rates above intentionally still use the summed gains; the graph plots from raw
            // series, so neither is affected by this override.)
            keys.forEach(k => {
                if (r.stats[k]) r.stats[k].gain = Math.max(0, r2(r.stats[k].end - r.stats[k].start));
            });
            const e = r.meta.totalEnergy;
            let hjDaySet;
            if (this.getHappyJumpData) {
                const hjData = this.getHappyJumpData();
                hjDaySet = hjData.hjDaySet;
            } else {
                hjDaySet = new Set();
            }
            const isHJ = r.date && hjDaySet.has(r.date);
            if (e >= 2000) r.meta.tier = 3;
            else if (e >= 1500) r.meta.tier = 2;
            else if (e >= 1000 || isHJ) r.meta.tier = 1;
            else r.meta.tier = 0;
            // Item-use totals for the period (powers the ledger counters). Merge per-day `items`
            // counts and sum the cans' extra energy; dayCount drives the Xanax avg/day readout.
            const itemDays = sDay ? [sDay] : (dList || []);
            const items = {};
            let itemEnergy = 0;
            itemDays.forEach(d => {
                if (d && d.items) Object.keys(d.items).forEach(id => {
                    items[id] = (items[id] || 0) + d.items[id];
                });
                if (d) itemEnergy += (d.itemEnergy || 0);
            });
            r.items = items;
            r.xanax = items[XANAX_LOG] || 0;
            r.ecans = items[ECAN_LOG] || 0;
            r.ecanEnergy = itemEnergy;
            r.dayCount = sDay ? 1 : (dList ? dList.length : 0);
            return r;
        },
        async processDataPayload(apiLogs, apiBattlestats) {
            Perf.start('processDataPayload');
            let s = getActiveHistory();
            const fullApiLogs = normalizeApiLogs(apiLogs);
            let cleanLogs = fullApiLogs;
            if (!s.meta.logStartDate) {
                if (s.history.length > 0 || (s.today && s.today.lastLogTimestamp > 0)) {
                    const oldestTs = s.history.length > 0 ? Formatter.parse(s.history[0].date).getTime() / 1000 : s.today.lastLogTimestamp;
                    s.meta.logStartDate = oldestTs;
                }
            }
            if (s.meta.logStartDate) {
                cleanLogs = cleanLogs.filter(l => l.ts >= s.meta.logStartDate);

                // Idle / battlestats-only fast path: there are no new gym logs to reconcile, so
                // there is nothing to merge into history. Update today's stats in place and
                // persist ONLY the affected day(s) instead of reading, rebuilding, and rewriting
                // the entire history. Requires an already-hydrated cache (always true after boot,
                // since hydration runs before any sync) — otherwise fall through to the full path.
                if (cleanLogs.length === 0 && _historyCache) {
                    const changedToday = apiBattlestats ? this._snapToBattlestats(apiBattlestats, s) : false;
                    const logicalToday = Formatter.dateLogical();
                    if (s.today.date !== logicalToday) {
                        // Day rollover touches historical days -> full invalidate.
                        const changedDays = [];
                        // A day with logged entries OR real aggregate gains becomes a history day.
                        // An empty/battlestats-only day remains a gap and is not promoted.
                        if ((s.today.series && s.today.series.length > 0) || (s.today.gains && s.today.gains.total > 0)) {
                            s.history.push(s.today);
                            changedDays.push(s.today);
                        }
                        s.today = initializeDayObject(logicalToday, s.today.endBreakdown);
                        changedDays.push(s.today);
                        _historyCache = s;
                        this.invalidate();
                        await DBManager.saveDays(s.meta, changedDays);
                    } else if (changedToday) {
                        _historyCache = s;
                        this.invalidateToday();
                        await DBManager.saveDays(s.meta, [s.today]);
                    }
                    window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
                    Perf.end('processDataPayload');
                    return 'SUCCESS';
                }

                // New gym logs to reconcile. Only entries inside the API window [minApiTs, maxApiTs]
                // can change history, which touches only days at/after that window's first logical
                // day. Recompute and persist just those days (incremental) rather than the whole,
                // possibly multi-decade, history. Falls back to the proven full rebuild if the
                // incremental path throws.
                let inc = null;
                try {
                    inc = this._reconcileIncremental(s, cleanLogs);
                } catch (e) {
                    Log.warn('Incremental reconcile failed; falling back to full rebuild', e);
                    inc = null;
                }

                if (inc) {
                    _historyCache = inc.result;
                    s = getActiveHistory();
                    // Logs are already merged; this only snaps current battlestats into today.
                    this._runDailyGrind([], apiBattlestats, s);
                    const changedDays = inc.changedDays.slice();
                    const logicalToday = Formatter.dateLogical();
                    let rolled = false;
                    if (s.today.date !== logicalToday) {
                        if ((s.today.series && s.today.series.length > 0) || (s.today.gains && s.today.gains.total > 0)) s.history.push(s.today);
                        s.today = initializeDayObject(logicalToday, s.today.endBreakdown);
                        rolled = true;
                    }
                    _historyCache = s;
                    this.invalidate();
                    if (rolled) {
                        // A rollover changes the day set; persist everything to stay consistent.
                        const all = [...(s.history || [])];
                        if (s.today) all.push(s.today);
                        await DBManager.saveDays(s.meta, all);
                    } else {
                        if (!changedDays.includes(s.today)) changedDays.push(s.today);
                        await DBManager.saveDays(s.meta, changedDays);
                    }
                    window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
                    Perf.end('processDataPayload');
                    return 'SUCCESS';
                }

                // Fallback: the original full rebuild from the entire stored series. Persisted by
                // saveSmartHistory() in the shared tail below.
                try {
                    _historyCache = await this._reconcileFull(s, cleanLogs);
                } catch (e) {
                    Log.warn('Reconciliation error', e);
                }
                s = getActiveHistory();
            }
            if (!s.meta.logStartDate) {
                // Forward-only init: baseline = current battlestats, origin = install time.
                // No historical reconstruction — history only comes from explicit Backfill.
                if (apiBattlestats) {
                    s.meta.baselineBreakdown = {
                        str: apiBattlestats.strength || 0,
                        def: apiBattlestats.defense || 0,
                        spd: apiBattlestats.speed || 0,
                        dex: apiBattlestats.dexterity || 0
                    };
                }
                s.meta.logStartDate = Math.floor(Date.parse(userConfig.privacyAgreed) / 1000);
                s.today = initializeDayObject(Formatter.dateLogical(), { ...s.meta.baselineBreakdown });
            }
            this._runDailyGrind(cleanLogs, apiBattlestats, s);
            const logicalToday = Formatter.dateLogical();
            if (s.today.date !== logicalToday) {
                if ((s.today.series && s.today.series.length > 0) || (s.today.gains && s.today.gains.total > 0)) s.history.push(s.today);
                s.today = initializeDayObject(logicalToday, s.today.endBreakdown);
            }
            this.saveSmartHistory(s);
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
            Perf.end('processDataPayload');
            return 'SUCCESS';
        },
        saveSmartHistory(d) {
            const allDays = [...(d.history || [])];
            if (d.today) allDays.push(d.today);
            // Persist the in-memory day objects directly — no flatten-to-series + rebuild
            // round-trip, and a single write (saveDays) rather than the previous whole-history
            // blob rewrite. saveDays puts each day record without clearing the store; normal
            // syncs never remove days (only import/clear do, via setStorage/clearStorage), so
            // untouched days remain intact.
            DBManager.saveDays(d.meta, allDays);
            _historyCache = d;
            this.invalidate();
        },
        flattenAllSeries() {
            const s = getActiveHistory();
            const all = [];
            const days = [...(s.history || [])];
            if (s.today) days.push(s.today);
            days.forEach(day => {
                if (day.series && day.series.length > 0) {
                    day.series.forEach(e => all.push(e));
                } else {
                    const base = Formatter.parse(day.date);
                    const ts = Math.floor(base.getTime() / 1000) + 43200;
                    STAT_KEYS.forEach(stat => {
                        const gain = (day.gains && day.gains[stat]) || 0;
                        const cost = (day.eSpent && day.eSpent[stat]) || 0;
                        const after = (day.endBreakdown && day.endBreakdown[stat]) || 0;
                        if (gain > 0 || cost > 0) all.push({
                            ts,
                            stat,
                            gain,
                            cost,
                            after,
                            rate: cost > 0 ? r2((gain / cost) * 150) : 0,
                            synthetic: true
                        });
                    });
                }
            });
            return all.sort((a, b) => a.ts - b.ts);
        },

        _runDailyGrind(logs, bs, s) {
            const allDays = [...(s.history || []), s.today];
            const globalLastTs = allDays.reduce((max, day) => Math.max(max, day.lastLogTimestamp || 0), 0);
            const lastTs = Math.max(globalLastTs, s.meta.logStartDate || 0);
            const validLogs = logs.filter(l => l.ts > lastTs);
            validLogs.forEach(l => this._applyLogToState(l, s));
            if (bs) this._snapToBattlestats(bs, s);
        },
        _applyLogToState(l, s) {
            const logDate = Formatter.dateLogical(l.ts * 1000);
            if (s.today.date !== logDate) {
                if (s.today.series && s.today.series.length > 0) s.history.push(s.today);
                s.today = initializeDayObject(logDate, s.today.endBreakdown);
            }
            if (l.type === 'item') {
                if (!s.today.items) s.today.items = {};
                if (!s.today.itemLogIds) s.today.itemLogIds = [];
                // Dedup on the natural (ts, logId) key rather than Torn's log id: the id is dropped
                // on export, so this is the only key that survives an export/import round-trip (and
                // two uses of the same item in the same second is not possible in-game).
                const itemKey = `${l.ts}_${l.logId}`;
                if (!s.today.itemLogIds.includes(itemKey)) {
                    s.today.itemLogIds.push(itemKey);
                    s.today.items[l.logId] = (s.today.items[l.logId] || 0) + 1;
                    if (l.energy) s.today.itemEnergy = (s.today.itemEnergy || 0) + l.energy;
                    if (l.happy) s.today.itemHappy = (s.today.itemHappy || 0) + l.happy;
                }
                const entry = {
                    type: 'item',
                    id: l.id,
                    ts: l.ts,
                    logId: l.logId
                };
                if (l.energy) entry.energy = l.energy;
                if (l.happy) entry.happy = l.happy;
                if (l.statKey) {
                    entry.statKey = l.statKey;
                    entry.statGain = l.statGain;
                }
                s.today.series.push(entry);
            } else {
                s.today.gains[l.stat] += l.gain;
                s.today.gains.total += l.gain;
                s.today.eSpent[l.stat] += l.cost;
                s.today.eSpent.total += l.cost;
                s.today.endBreakdown[l.stat] = l.after;
                if (l.ts > s.today.lastLogTimestamp) s.today.lastLogTimestamp = l.ts;
                s.today.series.push({
                    type: 'gym',
                    id: l.id,
                    ts: l.ts,
                    stat: l.stat,
                    gain: l.gain,
                    cost: l.cost,
                    after: l.after,
                    rate: l.cost > 0 ? r2((l.gain / l.cost) * 150) : 0
                });
                s.today.endTotal = sumStats(s.today.endBreakdown);
            }
        },
        _snapToBattlestats(bs, s) {
            let upd = false;
            BS_STAT_ROWS.forEach(i => {
                const apiVal = bs[i.api];
                if (apiVal === undefined) return;
                const localVal = s.today.endBreakdown[i.abbr] || 0;
                const lg = s.today.gains[i.abbr] || 0;
                if (localVal !== apiVal) {
                    s.today.endBreakdown[i.abbr] = apiVal;
                    s.today.startBreakdown[i.abbr] = apiVal - lg;
                    upd = true;
                }
            });
            if (upd) {
                s.today.endTotal = sumStats(s.today.endBreakdown);
                s.today.startTotal = sumStats(s.today.startBreakdown);
            }
            return upd;
        },
        _rebuildFromSeries(seriesArr, baselineBreakdown) {
            Perf.start('_rebuildFromSeries');
            const days = {};
            let running = {
                ...baselineBreakdown
            };
            seriesArr.forEach(e => {
                const dateKey = Formatter.dateLogical(e.ts * 1000);
                if (!days[dateKey]) days[dateKey] = initializeDayObject(dateKey, {
                    ...running
                });
                if (e.type === 'item') {
                    if (!days[dateKey].items) days[dateKey].items = {};
                    if (!days[dateKey].itemLogIds) days[dateKey].itemLogIds = [];
                    const itemKey = `${e.ts}_${e.logId}`;
                    if (!days[dateKey].itemLogIds.includes(itemKey)) {
                        days[dateKey].itemLogIds.push(itemKey);
                        days[dateKey].items[e.logId] = (days[dateKey].items[e.logId] || 0) + 1;
                        if (e.energy) days[dateKey].itemEnergy = (days[dateKey].itemEnergy || 0) + e.energy;
                        if (e.happy) days[dateKey].itemHappy = (days[dateKey].itemHappy || 0) + e.happy;
                    }
                    if (!e.synthetic) days[dateKey].series.push(e);
                } else {
                    days[dateKey].gains[e.stat] += e.gain;
                    days[dateKey].gains.total += e.gain;
                    days[dateKey].eSpent[e.stat] += e.cost;
                    days[dateKey].eSpent.total += e.cost;
                    days[dateKey].endBreakdown[e.stat] = e.after;
                    if (e.ts > days[dateKey].lastLogTimestamp) days[dateKey].lastLogTimestamp = e.ts;
                    if (!e.synthetic) days[dateKey].series.push(e);
                    running[e.stat] = e.after;
                }
            });
            Object.values(days).forEach(day => {
                day.endTotal = sumStats(day.endBreakdown);
                day.startTotal = sumStats(day.startBreakdown);
            });
            const logicalToday = Formatter.dateLogical(),
                sortedKeys = Object.keys(days).sort(),
                todayObj = days[logicalToday] || initializeDayObject(logicalToday, {
                    ...running
                }),
                history = sortedKeys.filter(k => k !== logicalToday).map(k => days[k]);
            Perf.end('_rebuildFromSeries');
            return {
                history,
                today: todayObj
            };
        },

        // Full reconciliation: reads the entire stored series, merges the API logs (dedup window),
        // and rebuilds EVERY day. This is the original, proven path — used now only as the
        // production fallback (if the incremental path throws) and as the dev-mode parity oracle.
        // Returns { meta, history, today } WITHOUT mutating _historyCache or persisting.
        async _reconcileFull(s, cleanLogs) {
            const stored = await DBManager.getStorage();
            if (!stored) return { meta: s.meta, history: s.history, today: s.today };
            if (stored.series && cleanLogs.length > 0) {
                const minApiTs = cleanLogs[0].ts;
                const maxApiTs = cleanLogs[cleanLogs.length - 1].ts;
                const apiEntries = cleanLogs.map(l => {
                    if (l.type === 'item') return { ...l };
                    return {
                        type: 'gym',
                        id: l.id,
                        ts: l.ts,
                        stat: l.stat,
                        gain: r2(l.gain),
                        cost: l.cost,
                        after: r2(l.after)
                    };
                });
                const getSetKey = e => e.type === 'item' ? `item_${e.id}` : `${e.ts}_${e.stat}_${e.after}`;
                const apiTsStatSet = new Set(apiEntries.map(getSetKey));
                const kept = stored.series.filter(e => e.ts < minApiTs || e.ts > maxApiTs || !apiTsStatSet.has(getSetKey(e)));
                stored.series = [...kept, ...apiEntries].sort((a, b) => a.ts - b.ts);
            }
            stored.meta = {
                ...stored.meta,
                logStartDate: s.meta.logStartDate,
                syncFloor: s.meta.syncFloor || stored.meta.syncFloor,
                stickers: stored.meta.stickers || s.meta.stickers || {}
            };
            const rebuilt = this._rebuildFromSeries(stored.series || [], stored.meta.baselineBreakdown || ZERO_BREAKDOWN);
            return {
                meta: stored.meta,
                history: rebuilt.history,
                today: rebuilt.today
            };
        },

        // Incremental reconciliation: only entries within the API window [minApiTs, maxApiTs] can
        // change, which touches only days at/after the window's first logical day. Days before that
        // ("prefix") are provably untouched and kept as-is; only the affected tail is rebuilt,
        // seeded by the prefix's last end breakdown so it chains on EXACTLY as a global rebuild
        // would. Operates purely on the in-memory cache (no DB read). Returns the reconciled
        // { result, changedDays } so the caller can persist only the changed days.
        _reconcileIncremental(s, cleanLogs) {
            const minApiTs = cleanLogs[0].ts;
            const maxApiTs = cleanLogs[cleanLogs.length - 1].ts;
            // Built without `rate` to match the full path exactly; rate is re-derived on load.
            const apiEntries = cleanLogs.map(l => {
                if (l.type === 'item') return { ...l };
                return {
                    type: 'gym',
                    id: l.id,
                    ts: l.ts,
                    stat: l.stat,
                    gain: r2(l.gain),
                    cost: l.cost,
                    after: r2(l.after)
                };
            });
            const getSetKey = e => e.type === 'item' ? `item_${e.id}` : `${e.ts}_${e.stat}_${e.after}`;
            const apiTsStatSet = new Set(apiEntries.map(getSetKey));
            const earliestDay = Formatter.dateLogical(minApiTs * 1000);

            const allDays = [...(s.history || [])];
            if (s.today) allDays.push(s.today);
            const prefix = [],
                affected = [];
            allDays.forEach(d => {
                (d.date < earliestDay ? prefix : affected).push(d);
            });

            const keptAffected = [];
            affected.forEach(d => {
                if (Array.isArray(d.series)) {
                    d.series.forEach(e => {
                        if (e.ts < minApiTs || e.ts > maxApiTs || !apiTsStatSet.has(getSetKey(e))) keptAffected.push(e);
                    });
                }
            });
            const mergedAffected = [...keptAffected, ...apiEntries].sort((a, b) => a.ts - b.ts);

            const seed = prefix.length ? prefix[prefix.length - 1].endBreakdown : ((s.meta && s.meta.baselineBreakdown) || ZERO_BREAKDOWN);
            const rebuilt = this._rebuildFromSeries(mergedAffected, seed);

            return {
                result: {
                    meta: { ...s.meta },
                    history: [...prefix, ...rebuilt.history],
                    today: rebuilt.today
                },
                changedDays: [...rebuilt.history, rebuilt.today]
            };
        }
    };


    function generateDemoData() {
        let _seed = 0x9e3779b9;

        function rand() {
            _seed += 0x6d2b79f5;
            let t = _seed;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }

        function randInt(lo, hi) {
            return lo + Math.floor(rand() * (hi - lo + 1));
        }
        const today = Formatter.dateLogical();
        const todayMs = Formatter.parse(today).getTime();
        const DAY_MS = 86400000;
        const NUM_DAYS = 365;
        const Simulation = {
            A: 3.480061091e-7,
            B: 250,
            C: 3.091619094e-6,
            D: 6.82775184551527e-5,
            E: -0.0301431777,
        };
        const DEMO_GYM_DOTS = 9.0;
        const DEMO_HAPPY = 4950;
        const DEMO_MODIFIERS = 2.5;
        const DEMO_E_PER_TRAIN = 5;
        const DEMO_FORMULA_E_BASE = 10;

        function simulationGain(statTotal) {
            const happyFactor = DEMO_HAPPY + Simulation.B;
            const base = (Simulation.A * Math.log(happyFactor) + Simulation.C) * statTotal + Simulation.D * happyFactor + Simulation.E;
            const perStandardTrain = base * DEMO_GYM_DOTS * DEMO_MODIFIERS;
            const perTrain = perStandardTrain * (DEMO_E_PER_TRAIN / DEMO_FORMULA_E_BASE);
            return Math.max(0, perTrain);
        }
        const statKeys = ['str', 'def', 'spd', 'dex'];
        const dates = [];
        for (let i = NUM_DAYS - 1; i >= 0; i--) {
            const ms = todayMs - i * DAY_MS;
            const d = new Date(ms);
            dates.push(Formatter.dateISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        }
        const baseline = {};
        statKeys.forEach(k => {
            baseline[k] = 15000 + randInt(0, 10000);
        });
        const weekStartOffset = userConfig.weekStartMode === 'mon' ? 1 : 0;
        const todayDate = new Date(todayMs);
        const todayDow = todayDate.getUTCDay();
        const daysFromWeekStart = (todayDow - weekStartOffset + 7) % 7;
        const weekDay0Str = dates[NUM_DAYS - 1 - daysFromWeekStart] || null;
        const weekDay1Str = daysFromWeekStart >= 1 ? dates[NUM_DAYS - daysFromWeekStart] : null;
        const running = {
            ...baseline
        };
        const history = [];
        let mixedWeek = 0;
        dates.forEach((dateStr, idx) => {
            const roll = rand();
            if (roll < 0.10) return;
            if (mixedWeek === 0 && rand() < 0.08) mixedWeek = 7;
            let eTotalRaw;
            if (mixedWeek > 0) {
                mixedWeek--;
                const subRoll = rand();
                if (subRoll < 0.25) {
                    eTotalRaw = randInt(200, 260) * 10;
                } else if (subRoll < 0.55) {
                    eTotalRaw = randInt(150, 190) * 10;
                } else if (subRoll < 0.85) {
                    eTotalRaw = randInt(100, 149) * 10;
                } else {
                    eTotalRaw = randInt(50, 99) * 10;
                }
            } else if (roll < 0.15) {
                eTotalRaw = randInt(70, 99) * 10;
            } else {
                eTotalRaw = randInt(100, 160) * 10;
            }
            if (dateStr === weekDay0Str) eTotalRaw = Math.max(eTotalRaw, 2500);
            else if (dateStr === weekDay1Str && eTotalRaw < 2000) eTotalRaw = Math.min(Math.max(eTotalRaw, 1000), 1499);
            else if (rand() < 0.05) eTotalRaw = Math.max(eTotalRaw, 2500);
            const hjRoll = rand();
            const isDiamondHJDay = hjRoll < 0.05;
            const isHJDay = isDiamondHJDay || hjRoll < 0.18;
            if (isDiamondHJDay && eTotalRaw < 1800) eTotalRaw = randInt(180, 220) * 10;
            else if (isHJDay && eTotalRaw < 1000) eTotalRaw = randInt(100, 170) * 10;
            const hjWindowStart = isHJDay ? randInt(36000, 36000 + 28800 - GAME.HJ_WINDOW_SECONDS) : null;
            const eTotal = eTotalRaw;
            const numStats = randInt(1, 4);
            const chosenStats = [...statKeys].sort(() => rand() - 0.5).slice(0, numStats);
            const ePerStat = {};
            let eRemain = eTotal;
            chosenStats.forEach((k, i) => {
                const share = i === chosenStats.length - 1 ? eRemain : Math.round((rand() * 0.4 + 0.1) * eTotal / numStats) * 10 || 10;
                ePerStat[k] = Math.max(10, Math.min(share, eRemain));
                eRemain -= ePerStat[k];
            });
            if (eRemain > 0 && chosenStats.length) ePerStat[chosenStats[0]] += eRemain;
            const startBreakdown = {
                ...running
            };
            const eSpent = {
                total: eTotal,
                ...ZERO_BREAKDOWN
            };
            const gains = {
                total: 0,
                ...ZERO_BREAKDOWN
            };
            const series = [];
            const dayStartSec = Math.floor(Formatter.parse(dateStr).getTime() / 1000);
            chosenStats.forEach(k => {
                const cost = ePerStat[k] || 0;
                if (!cost) return;
                const trainsForStat = Math.floor(cost / DEMO_E_PER_TRAIN);
                let statGainAccum = 0;
                for (let t = 0; t < trainsForStat; t++) {
                    const raw = simulationGain(running[k]);
                    const jittered = raw * (0.97 + rand() * 0.06);
                    running[k] += jittered;
                    statGainAccum += jittered;
                    const ts = hjWindowStart !== null ? dayStartSec + hjWindowStart + Math.floor(rand() * GAME.HJ_WINDOW_SECONDS) : dayStartSec + 36000 + Math.floor((t + rand()) * (28800 / Math.max(1, trainsForStat)));
                    series.push({
                        ts,
                        stat: k,
                        gain: Math.round(jittered),
                        cost: DEMO_E_PER_TRAIN,
                        after: Math.round(running[k]),
                        rate: r2((Math.round(jittered) / DEMO_E_PER_TRAIN) * 150),
                        synthetic: true,
                    });
                }
                eSpent[k] = cost;
                const roundedStatGain = Math.round(statGainAccum);
                gains[k] = roundedStatGain;
                gains.total += roundedStatGain;
            });
            eSpent.total = (eSpent.str + eSpent.def + eSpent.spd + eSpent.dex);
            const endBreakdown = {
                ...running
            };
            const day = initializeDayObject(dateStr, startBreakdown);
            day.gains = gains;
            day.eSpent = eSpent;
            day.endBreakdown = endBreakdown;
            day.endTotal = endBreakdown.str + endBreakdown.def + endBreakdown.spd + endBreakdown.dex;
            day.series = series;
            day.lastLogTimestamp = series.length ? series[series.length - 1].ts : 0;
            history.push(day);
        });
        const lastHistDay = history.length ? history[history.length - 1] : null;
        const todayStart = lastHistDay ? {
            ...lastHistDay.endBreakdown
        } : {
            ...running
        };
        const todayObj = initializeDayObject(today, todayStart);
        const oldestDate = history.length ? history[0].date : today;
        const logStartDate = Math.floor(Formatter.parse(oldestDate).getTime() / 1000);
        const lastRates = {};
        statKeys.forEach(k => {
            const perFiveE = simulationGain(running[k]);
            lastRates[k] = perFiveE * (DEMO_FORMULA_E_BASE / DEMO_E_PER_TRAIN);
        });
        const meta = {
            baselineBreakdown: {
                ...baseline
            },
            logStartDate
        };
        return {
            meta,
            history,
            today: todayObj
        };
    }

    function getActiveHistory() {
        if (runtime.demoMode) {
            if (!runtime.demoHistory) runtime.demoHistory = generateDemoData();
            return runtime.demoHistory;
        }
        if (_historyCache) return _historyCache;
        return {
            meta: {
                baselineBreakdown: {
                    ...ZERO_BREAKDOWN
                },
                backfill: defaultBackfill()
            },
            history: [],
            today: initializeDayObject(Formatter.dateLogical(), {
                ...ZERO_BREAKDOWN
            })
        };
    }

    function normalizeApiLogs(rawLogs) {
        if (!rawLogs || Object.keys(rawLogs).length === 0) return [];
        return Object.keys(rawLogs).map(k => {
            const l = rawLogs[k];
            const meta = ITEM_LOG_META[l.log];
            if (meta) {
                const e = { type: 'item', id: k, ts: l.timestamp, logId: l.log };
                const d = l.data || {};
                if (meta.energy) e.energy = parseInt(d.energy_increased || 0);
                if (meta.happy) e.happy = parseInt(d.happy_increased || 0);
                if (meta.stat) {
                    // Stat enhancers carry their gain under <stat>_increased; detect which stat.
                    const sn = ['strength', 'defense', 'speed', 'dexterity'].find(s => d[`${s}_increased`] != null);
                    if (sn) {
                        e.statKey = (sn === 'strength') ? 'str' : (sn === 'defense') ? 'def' : (sn === 'speed') ? 'spd' : 'dex';
                        e.statGain = r2(parseFloat(d[`${sn}_increased`] || 0));
                    }
                }
                return e;
            }
            const sn = GAME.STAT_MAP[l.log];
            if (!sn) return null;
            const ab = (sn === 'strength') ? 'str' : (sn === 'defense') ? 'def' : (sn === 'speed') ? 'spd' : 'dex';
            const gain = r2(parseFloat(l.data[`${sn}_increased`] || 0));
            const cost = parseInt(l.data.energy_used || 0);
            return {
                type: 'gym',
                id: k,
                ts: l.timestamp,
                stat: ab,
                key: sn,
                gain,
                after: r2(parseFloat(l.data[`${sn}_after`] || 0)),
                cost,
                rate: cost > 0 ? r2((gain / cost) * 150) : 0
            };
        }).filter(x => x !== null).sort((a, b) => a.ts - b.ts);
    }

    function initializeDayObject(dateStr, baseBreakdown) {
        const b = {
            ...baseBreakdown
        };
        return {
            date: dateStr,
            startTotal: b.str + b.def + b.spd + b.dex,
            endTotal: b.str + b.def + b.spd + b.dex,
            startBreakdown: {
                ...b
            },
            endBreakdown: {
                ...b
            },
            gains: {
                total: 0,
                ...ZERO_BREAKDOWN
            },
            eSpent: {
                total: 0,
                ...ZERO_BREAKDOWN
            },
            items: {},
            itemLogIds: [],
            itemEnergy: 0,
            itemHappy: 0,
            lastLogTimestamp: 0,
            series: []
        };
    }

    function computeAchievements(s) {
        const allDays = [...(s.history || [])];
        if (s.today && s.today.date) {
            const filtered = allDays.filter(d => d.date !== s.today.date);
            filtered.push(s.today);
            allDays.splice(0, allDays.length, ...filtered);
        }
        allDays.sort((a, b) => a.date.localeCompare(b.date));
        if (!allDays.length) return null;
        const GREEN = 1000,
            GOLD = 1500,
            DIAMOND = 2000;
        let greenDays = 0,
            goldDays = 0,
            diamondDays = 0,
            trainingDays = 0;
        let maxEDay = {
                value: 0,
                date: null
            },
            maxGainsDay = {
                value: 0,
                date: null
            },
            maxClick = {
                value: 0,
                date: null,
                stat: null
            },
            maxStatGainDay = {
                value: 0,
                date: null,
                stat: null
            };
        const bestTrainByStat = {
                str: null,
                def: null,
                spd: null,
                dex: null
            },
            bestDayByStat = {
                str: null,
                def: null,
                spd: null,
                dex: null
            },
            bestWeekByStat = {
                str: null,
                def: null,
                spd: null,
                dex: null
            },
            bestMonthByStat = {
                str: null,
                def: null,
                spd: null,
                dex: null
            };
        const bestHJByStat = {
            str: null,
            def: null,
            spd: null,
            dex: null,
            total: null
        };
        const happyItemTotals = {};
        HAPPY_LOGS.forEach(id => { happyItemTotals[id] = { count: 0, happy: 0 }; });
        const weekE = {},
            weekG = {},
            monthE = {},
            monthG = {},
            weekDayMap = {},
            weekStatG = {},
            monthStatG = {};
        allDays.forEach(day => {
            const e = (day.eSpent && day.eSpent.total) || 0,
                g = (day.gains && day.gains.total) || 0;
            if (e >= GOLD) {
                goldDays++;
                trainingDays++;
            } else if (e >= GREEN) {
                greenDays++;
                trainingDays++;
            } else if (e > 0) {
                trainingDays++;
            }
            if (e >= DIAMOND) diamondDays++;
            if (e > maxEDay.value) maxEDay = {
                value: e,
                date: day.date
            };
            if (g > maxGainsDay.value) maxGainsDay = {
                value: g,
                date: day.date
            };
            (day.series || []).forEach(entry => {
                if ((entry.gain || 0) > maxClick.value) maxClick = {
                    value: entry.gain,
                    date: day.date,
                    stat: entry.stat,
                    ts: entry.ts,
                    cost: entry.cost
                };
                const _esk = entry.stat;
                if ((entry.gain || 0) > 0 && bestTrainByStat[_esk] !== undefined) {
                    const _cur = bestTrainByStat[_esk];
                    if (!_cur || entry.gain > _cur.value) bestTrainByStat[_esk] = {
                        value: entry.gain,
                        date: day.date,
                        ts: entry.ts,
                        cost: entry.cost
                    };
                }
            });
            const wk = getWeekKey(day.date),
                mk = day.date.slice(0, 7);
            weekE[wk] = (weekE[wk] || 0) + e;
            weekG[wk] = (weekG[wk] || 0) + g;
            monthE[mk] = (monthE[mk] || 0) + e;
            monthG[mk] = (monthG[mk] || 0) + g;
            if (!weekDayMap[wk]) weekDayMap[wk] = [];
            weekDayMap[wk].push(day);
            ['str', 'def', 'spd', 'dex'].forEach(sk => {
                const sg = (day.gains && day.gains[sk]) || 0;
                if (!sg) return;
                if (sg > maxStatGainDay.value) maxStatGainDay = {
                    value: sg,
                    date: day.date,
                    stat: sk
                };
                {
                    const _cur = bestDayByStat[sk];
                    if (!_cur || sg > _cur.value) bestDayByStat[sk] = {
                        value: sg,
                        date: day.date
                    };
                }
                const wsk = sk + '\x00' + wk,
                    msk = sk + '\x00' + mk;
                weekStatG[wsk] = (weekStatG[wsk] || 0) + sg;
                monthStatG[msk] = (monthStatG[msk] || 0) + sg;
            });
            if (day.items) {
                HAPPY_LOGS.forEach(id => {
                    const qty = day.items[id] || 0;
                    if (qty > 0) happyItemTotals[id].count += qty;
                });
            }
            (day.series || []).forEach(e => {
                if (e.type === 'item' && e.happy && happyItemTotals[e.logId]) {
                    happyItemTotals[e.logId].happy += e.happy;
                }
            });
        });
        const maxOf = (obj, key) => Object.entries(obj).reduce((best, [k, v]) => v > best.value ? {
            [key]: k,
            value: v
        } : best, {
            value: 0,
            [key]: null
        });
        const maxStatOf = (obj, key) => Object.entries(obj).reduce((best, [k, v]) => {
            const sep = k.indexOf('\x00');
            return v > best.value ? {
                value: v,
                stat: k.slice(0, sep),
                [key]: k.slice(sep + 1)
            } : best;
        }, {
            value: 0,
            stat: null,
            [key]: null
        });
        const bestStatWk = maxStatOf(weekStatG, 'weekOf'),
            bestStatMn = maxStatOf(monthStatG, 'rawMonth');
        Object.entries(weekStatG).forEach(([k, v]) => {
            const _sep = k.indexOf('\x00');
            const _sk = k.slice(0, _sep),
                _wk = k.slice(_sep + 1);
            const _cur = bestWeekByStat[_sk];
            if (!_cur || v > _cur.value) bestWeekByStat[_sk] = {
                value: v,
                weekOf: _wk
            };
        });
        Object.entries(monthStatG).forEach(([k, v]) => {
            const _sep = k.indexOf('\x00');
            const _sk = k.slice(0, _sep),
                _mk = k.slice(_sep + 1);
            const _cur = bestMonthByStat[_sk];
            if (!_cur || v > _cur.value) bestMonthByStat[_sk] = {
                value: v,
                rawMonth: _mk
            };
        });
        const fmtMonth = mk => mk ? `${CONSTANTS.MONTHS[parseInt(mk.slice(5)) - 1]} ${mk.slice(0, 4)}` : null;
        let greenWeeks = 0,
            goldWeeks = 0,
            diamondWeeks = 0;
        const todayStr = Formatter.dateLogical(),
            currentWk = getWeekKey(todayStr);
        Object.keys(weekDayMap).sort().forEach(wk => {
            if (wk < currentWk) {
                const wc = computeWeekCompletion(weekDayMap[wk]);
                if (wc.isGold) goldWeeks++;
                else if (wc.isCompleted) greenWeeks++;
                if (wc.totDiamond >= GAME.WEEKLY_GOAL) diamondWeeks++;
            }
        });
        const _zg = () => ({
            str: 0,
            def: 0,
            spd: 0,
            dex: 0
        });
        let longestStreak = 0,
            longestStreakStart = null,
            longestStreakEnd = null,
            longestStreakGains = _zg();
        let longestGoalStreak = 0,
            longestGoalStreakStart = null,
            longestGoalStreakEnd = null,
            longestGoalStreakGains = _zg();
        let longestGoldStreak = 0,
            longestGoldStreakStart = null,
            longestGoldStreakEnd = null,
            longestGoldStreakGains = _zg();
        let longestDiamondStreak = 0,
            longestDiamondStreakStart = null,
            longestDiamondStreakEnd = null,
            longestDiamondStreakGains = _zg();
        let sT = 0,
            sTStart = null,
            sTGains = _zg(),
            sG = 0,
            sGStart = null,
            sGGains = _zg(),
            sGo = 0,
            sGoStart = null,
            sGoGains = _zg(),
            sDi = 0,
            sDiStart = null,
            sDiGains = _zg(),
            prevDate = null;
        allDays.forEach(day => {
            const e = (day.eSpent && day.eSpent.total) || 0;
            const g = day.gains || {};
            const consecutive = prevDate && (new Date(day.date + 'T00:00:00Z') - new Date(prevDate + 'T00:00:00Z')) / 86400000 === 1;
            if (e > 0) {
                if (consecutive && sT > 0) {
                    sT++;
                    ['str', 'def', 'spd', 'dex'].forEach(k => {
                        sTGains[k] += g[k] || 0;
                    });
                } else {
                    sT = 1;
                    sTStart = day.date;
                    sTGains = {
                        str: g.str || 0,
                        def: g.def || 0,
                        spd: g.spd || 0,
                        dex: g.dex || 0
                    };
                }
                if (sT > longestStreak) {
                    longestStreak = sT;
                    longestStreakStart = sTStart;
                    longestStreakEnd = day.date;
                    longestStreakGains = {
                        ...sTGains
                    };
                }
            } else {
                sT = 0;
                sTStart = null;
                sTGains = _zg();
            }
            if (e >= GREEN) {
                if (consecutive && sG > 0) {
                    sG++;
                    ['str', 'def', 'spd', 'dex'].forEach(k => {
                        sGGains[k] += g[k] || 0;
                    });
                } else {
                    sG = 1;
                    sGStart = day.date;
                    sGGains = {
                        str: g.str || 0,
                        def: g.def || 0,
                        spd: g.spd || 0,
                        dex: g.dex || 0
                    };
                }
                if (sG > longestGoalStreak) {
                    longestGoalStreak = sG;
                    longestGoalStreakStart = sGStart;
                    longestGoalStreakEnd = day.date;
                    longestGoalStreakGains = {
                        ...sGGains
                    };
                }
            } else {
                sG = 0;
                sGStart = null;
                sGGains = _zg();
            }
            if (e >= GOLD) {
                if (consecutive && sGo > 0) {
                    sGo++;
                    ['str', 'def', 'spd', 'dex'].forEach(k => {
                        sGoGains[k] += g[k] || 0;
                    });
                } else {
                    sGo = 1;
                    sGoStart = day.date;
                    sGoGains = {
                        str: g.str || 0,
                        def: g.def || 0,
                        spd: g.spd || 0,
                        dex: g.dex || 0
                    };
                }
                if (sGo > longestGoldStreak) {
                    longestGoldStreak = sGo;
                    longestGoldStreakStart = sGoStart;
                    longestGoldStreakEnd = day.date;
                    longestGoldStreakGains = {
                        ...sGoGains
                    };
                }
            } else {
                sGo = 0;
                sGoStart = null;
                sGoGains = _zg();
            }
            if (e >= 2000) {
                if (consecutive && sDi > 0) {
                    sDi++;
                    ['str', 'def', 'spd', 'dex'].forEach(k => {
                        sDiGains[k] += g[k] || 0;
                    });
                } else {
                    sDi = 1;
                    sDiStart = day.date;
                    sDiGains = {
                        str: g.str || 0,
                        def: g.def || 0,
                        spd: g.spd || 0,
                        dex: g.dex || 0
                    };
                }
                if (sDi > longestDiamondStreak) {
                    longestDiamondStreak = sDi;
                    longestDiamondStreakStart = sDiStart;
                    longestDiamondStreakEnd = day.date;
                    longestDiamondStreakGains = {
                        ...sDiGains
                    };
                }
            } else {
                sDi = 0;
                sDiStart = null;
                sDiGains = _zg();
            }
            prevDate = day.date;
        });
        const allSeries = [];
        allDays.forEach(day => {
            (day.series || []).forEach(e => {
                if (e.ts && e.cost) allSeries.push(e);
            });
        });
        allSeries.sort((a, b) => a.ts - b.ts);
        let happyJumps = 0;
        const hjWeek = {},
            hjMonth = {};
        const _registerJumpWindow = (cStart, cEnd, cCost, cStatG) => {
            if (cCost < GREEN) return;
            const d = Formatter.dateLogical(cStart * 1000);
            const wk = getWeekKey(d),
                mk = d.slice(0, 7);
            happyJumps++;
            hjWeek[wk] = (hjWeek[wk] || 0) + 1;
            hjMonth[mk] = (hjMonth[mk] || 0) + 1;
            const tot = (cStatG.str || 0) + (cStatG.def || 0) + (cStatG.spd || 0) + (cStatG.dex || 0);
            ['str', 'def', 'spd', 'dex'].forEach(sk => {
                const sv = cStatG[sk] || 0;
                if (sv > 0 && (!bestHJByStat[sk] || sv > bestHJByStat[sk].value)) bestHJByStat[sk] = {
                    value: sv,
                    date: d,
                    ts: cStart,
                    cost: cCost
                };
            });
            if (tot > 0 && (!bestHJByStat.total || tot > bestHJByStat.total.value)) bestHJByStat.total = {
                value: tot,
                date: d,
                ts: cStart,
                tsEnd: cEnd,
                cost: cCost,
                stats: {
                    ...cStatG
                }
            };
        };
        if (allSeries.length > 0) {
            let cStart = allSeries[0].ts,
                cEnd = allSeries[0].ts,
                cCost = allSeries[0].cost,
                cStatG = {
                    str: 0,
                    def: 0,
                    spd: 0,
                    dex: 0
                };
            cStatG[allSeries[0].stat] = (allSeries[0].gain || 0);
            for (let i = 1; i < allSeries.length; i++) {
                const entry = allSeries[i];
                if (entry.ts - cStart <= GAME.HJ_WINDOW_SECONDS) {
                    cCost += entry.cost;
                    cEnd = entry.ts;
                    cStatG[entry.stat] = (cStatG[entry.stat] || 0) + (entry.gain || 0);
                } else {
                    _registerJumpWindow(cStart, cEnd, cCost, cStatG);
                    cStart = entry.ts;
                    cEnd = entry.ts;
                    cCost = entry.cost;
                    cStatG = {
                        str: 0,
                        def: 0,
                        spd: 0,
                        dex: 0
                    };
                    cStatG[entry.stat] = (entry.gain || 0);
                }
            }
            _registerJumpWindow(cStart, cEnd, cCost, cStatG);
        }
        const hjWeekBest = maxOf(hjWeek, 'weekOf'),
            hjMonthBest = maxOf(hjMonth, 'month');
        const calDays = Math.round((new Date(allDays[allDays.length - 1].date + 'T00:00:00Z') - new Date(allDays[0].date + 'T00:00:00Z')) / 86400000) + 1;
        const mxWkE = maxOf(weekE, 'weekOf'),
            mxWkG = maxOf(weekG, 'weekOf'),
            mxMnE = maxOf(monthE, 'month'),
            mxMnG = maxOf(monthG, 'month');
        DataController.getStickerMap();
        const stickersUnlocked = DataController._cache.unlockedCount || 0;
        return {
            baseline: (s.meta && s.meta.baselineBreakdown) ? {
                ...s.meta.baselineBreakdown
            } : null,
            greenDays,
            goldDays,
            diamondDays,
            trainingDays,
            calDays,
            greenWeeks,
            goldWeeks,
            diamondWeeks,
            stickersUnlocked,
            trainingRestRatio: calDays > 0 ? ((trainingDays / calDays) * 100).toFixed(1) + '%' : 'N/A',
            longestStreak,
            longestStreakStart,
            longestStreakEnd,
            longestStreakGains,
            longestGoalStreak,
            longestGoalStreakStart,
            longestGoalStreakEnd,
            longestGoalStreakGains,
            longestGoldStreak,
            longestGoldStreakStart,
            longestGoldStreakEnd,
            longestGoldStreakGains,
            happyJumps,
            happyJumpsWeekBest: hjWeekBest.weekOf ? hjWeekBest : null,
            happyJumpsMonthBest: hjMonthBest.month ? {
                value: hjMonthBest.value,
                month: fmtMonth(hjMonthBest.month)
            } : null,
            mostEInOneDay: maxEDay.date ? maxEDay : null,
            mostEInOneWeek: mxWkE.weekOf ? mxWkE : null,
            mostEInOneMonth: mxMnE.month ? {
                value: mxMnE.value,
                month: fmtMonth(mxMnE.month),
                rawMonth: mxMnE.month
            } : null,
            highestGainPerClick: maxClick.date ? maxClick : null,
            highestGainsInOneDay: maxGainsDay.date ? maxGainsDay : null,
            highestStatGainDay: maxStatGainDay.date ? maxStatGainDay : null,
            highestGainsInOneWeek: mxWkG.weekOf ? mxWkG : null,
            highestGainsInOneMonth: mxMnG.month ? {
                value: mxMnG.value,
                month: fmtMonth(mxMnG.month)
            } : null,
            highestStatGainWeek: bestStatWk.weekOf ? bestStatWk : null,
            highestStatGainMonth: bestStatMn.rawMonth ? {
                value: bestStatMn.value,
                month: fmtMonth(bestStatMn.rawMonth),
                rawMonth: bestStatMn.rawMonth,
                stat: bestStatMn.stat
            } : null,
            perStatBest: {
                bestTrain: bestTrainByStat,
                bestDay: bestDayByStat,
                bestWeek: bestWeekByStat,
                bestMonth: bestMonthByStat
            },
            bestHappyJump: bestHJByStat,
            longestDiamondStreak,
            longestDiamondStreakStart,
            longestDiamondStreakEnd,
            longestDiamondStreakGains,
            happyItemTotals
        };
    }

    function achRefreshPageDom() {
        const container = document.getElementById('bbgl-ach-pages');
        if (!container || !runtime._achCache) return;
        container.innerHTML = buildAchievementsPage(runtime._achPage, runtime._achCache);
        updateAchPageIndicator();
    }

    function renderAchievements() {
        const s = getActiveHistory();
        if (!runtime._achCache) {
            runtime._achCache = Perf.wrap('computeAchievements', () => computeAchievements(s));
            runtime._achPage = viewState.achPage || 0;
        }
        if (!runtime._achCache) return;
        achRefreshPageDom();
    }

    function updateAchPageIndicator() {
        const ind = document.getElementById('bbgl-ach-pageindicator');
        if (!ind) return;
        ind.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const d = document.createElement('div');
            d.className = 'pg-dot' + (i === runtime._achPage ? ' active' : '');
            d.onclick = () => {
                if (i !== runtime._achPage) gotoAchievementsPage(i - runtime._achPage);
            };
            ind.appendChild(d);
        }
        const p = document.querySelector('.bbgl-ach-prev'),
            n = document.querySelector('.bbgl-ach-next');
        if (p) {
            p.style.display = '';
            p.removeAttribute('aria-hidden');
        }
        if (n) {
            n.style.display = '';
            n.removeAttribute('aria-hidden');
        }
    }

    function gotoAchievementsPage(dir) {
        if (runtime._achAnimating) return;
        const container = document.getElementById('bbgl-ach-pages');
        if (!container || !runtime._achCache) return;
        const newPage = runtime._achPage + dir;
        if (newPage < 0 || newPage > 3) return;
        const apply = () => {
            runtime._achPage = newPage;
            viewState.achPage = newPage;
            saveViewState();
            achRefreshPageDom();
        };
        if (userConfig.animations) {
            runtime._achAnimating = true;
            container.classList.add('bbgl-crt-out');
            setTimeout(() => {
                container.classList.remove('bbgl-crt-out');
                apply();
                container.classList.add('bbgl-crt-in');
                setTimeout(() => {
                    container.classList.remove('bbgl-crt-in');
                    runtime._achAnimating = false;
                }, 300);
            }, 280);
        } else {
            apply();
        }
    }

    function achLedgerClip(n) {
        if (n === null || n === undefined || (typeof n === 'number' && Number.isNaN(n))) return '\u2014';
        return (Math.abs(n) >= 1e9) ? Formatter.abbr(n, 4) : Formatter.number(n);
    }

    function achFmtVal(n) {
        if (n === null || n === undefined) return '\u2014';
        if (typeof n === 'number') return achLedgerClip(n);
        return String(n);
    }

    function achFmtDate(dateStr) {
        if (!dateStr) return '';
        return Formatter.datePretty(dateStr) || dateStr;
    }

    function achFmtWeekRange(weekOf) {
        if (!weekOf) return '';
        const d = Formatter.parse(weekOf);
        const end = new Date(d.getTime() + 6 * 86400000);
        return `${Formatter.dateMonthDay(weekOf)} \u2013 ${Formatter.dateMonthDay(Formatter.dateISO(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))}, ${end.getUTCFullYear()}`;
    }

    function achFmtStreakRange(start, end) {
        if (!start || !end) return '';
        const s = achFmtDate(start),
            e = achFmtDate(end);
        const sy = start.slice(0, 4),
            ey = end.slice(0, 4);
        return (sy === ey ? s.replace(/,?\s*\d{4}$/, '') : s) + ' \u2013 ' + e;
    }

    function achEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    }

    function achRowHTML(r) {
        const valCls = r.statClass ? ' ' + achEsc(r.statClass) : '';
        const valNum = r.dualHtml ? r.dualHtml : ((r.display === '—' || r.display === '\u2014') ? `<span class="ach-null">—</span>` : achEsc(r.display));
        const tip = r.tip ? ` data-tooltip="${achEsc(r.tip)}"` : '';
        const dateEl = r.clipDate ? `<div class="ach-date">${achEsc(r.clipDate)}</div>` : '';
        const subEl = r.sub ? `<span class="ach-sub">${achEsc(r.sub)}</span>` : '';
        return `<div class="bbgl-ach-row"${tip} data-ach-key="${achEsc(r.key || '')}" data-clip="${achEsc(r.label + ': ' + r.rawVal)}" data-clip-date="${achEsc(r.clipDate || '')}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k">${achEsc(r.label)}:</span>${dateEl}</div><div class="ach-v-wrap">${subEl}<span class="ach-value${valCls}">${valNum}</span></div></div></div>`;
    }

    function achRowsClip(rows) {
        return rows.map(r => r.clipDate ? `${r.label}: ${r.rawVal} (${r.clipDate})` : `${r.label}: ${r.rawVal}`).join('\n');
    }

    function achBuildSection(title, rows, sectionKey = '', colCount = 4) {
        const COLS = colCount,
            rpc = rows.length ? Math.ceil(rows.length / COLS) : 0,
            cols = Array.from({
                length: COLS
            }, (_, ci) => {
                const chunk = [];
                for (let r = 0; r < rpc; r++) {
                    const i = ci * rpc + r;
                    if (i < rows.length) chunk.push(rows[i]);
                }
                return chunk;
            }),
            colsHTML = cols.map(chunk => `<div class="bbgl-ach-col">${chunk.map(achRowHTML).join('')}</div>`).join(''),
            clipAll = achRowsClip(rows);
        return `<div class="bbgl-ach-section"><div class="bbgl-ach-section-title" data-ach-section="${achEsc(sectionKey)}" data-clip-section="${achEsc(clipAll)}" data-clip-title="${achEsc(title)}" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">${achEsc(title)}</div><div class="bbgl-ach-cols"${COLS !== 4 ? ` style="grid-template-columns:repeat(${COLS},minmax(0,1fr));"` : ''}>${colsHTML}</div></div>`;
    }

    function achBuildDualSection(titleA, rowsA, titleB, rowsB, sectionKeyA = '', sectionKeyB = '') {
        const clipA = achRowsClip(rowsA),
            clipB = achRowsClip(rowsB);
        return `<div class="bbgl-ach-dual"><div class="bbgl-ach-dual-headers"><div class="bbgl-ach-section-title" data-ach-section="${achEsc(sectionKeyA)}" data-clip-section="${achEsc(clipA)}" data-clip-title="${achEsc(titleA)}">${achEsc(titleA)}</div><div class="bbgl-ach-section-title" data-ach-section="${achEsc(sectionKeyB)}" data-clip-section="${achEsc(clipB)}" data-clip-title="${achEsc(titleB)}">${achEsc(titleB)}</div></div><div class="bbgl-ach-dual-body"><div class="bbgl-ach-col-half">${rowsA.map(achRowHTML).join('')}</div><div class="bbgl-ach-col-half">${rowsB.map(achRowHTML).join('')}</div></div></div>`;
    }

    function achFmtWeekShort(weekOf) {
        if (!weekOf) return '';
        return Formatter.datePretty(weekOf);
    }

    function achFmtMonthLong(rawMonth) {
        if (!rawMonth) return '';
        return `${CONSTANTS.MONTHS[parseInt(rawMonth.slice(5)) - 1]}, ${rawMonth.slice(0, 4)}`;
    }

    function achFmtTimeTCT(ts) {
        const d = new Date(ts * 1000);
        return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ':' + String(d.getUTCSeconds()).padStart(2, '0') + ' TCT';
    }
    let _achTzLocalCache = null;

    function achTimeZoneSuffix() {
        if (!TimeManager.useLocal()) return 'TCT';
        if (_achTzLocalCache) return _achTzLocalCache;
        try {
            const parts = new Intl.DateTimeFormat(undefined, {
                timeZoneName: 'short'
            }).formatToParts(new Date());
            const tz = parts.find(p => p.type === 'timeZoneName');
            _achTzLocalCache = tz && tz.value ? tz.value : 'Local';
        } catch (e) {
            _achTzLocalCache = 'Local';
        }
        return _achTzLocalCache;
    }

    function achFmtTimeHMClip(ts) {
        const d = new Date(ts * 1000);
        return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0');
    }

    function achFmtTimeHMS(ts) {
        const d = new Date(ts * 1000);
        const h = TimeManager.useLocal() ? d.getHours() : d.getUTCHours();
        const m = TimeManager.useLocal() ? d.getMinutes() : d.getUTCMinutes();
        const s = TimeManager.useLocal() ? d.getSeconds() : d.getUTCSeconds();
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' ' + achTimeZoneSuffix();
    }

    function achBuildPage0(d) {
        const ps = d.perStatBest || {
            bestTrain: {},
            bestDay: {},
            bestWeek: {},
            bestMonth: {}
        };
        const STATS = ['str', 'def', 'spd', 'dex'];
        const STAT_LABEL = {
            str: 'Strength',
            def: 'Defense',
            spd: 'Speed',
            dex: 'Dexterity'
        };
        const rows = [{
            key: 'best-train',
            short: 'Single Train',
            long: 'Highest Single Train',
            tip: 'Highest gains achieved from a single click, per individual stat.',
            recs: ps.bestTrain,
            getDate: r => achFmtDate(r.date),
            getTime: r => r.ts ? achFmtTimeHMS(r.ts) : ''
        }, {
            key: 'best-day',
            short: 'Best Day',
            long: 'Best Training Day',
            tip: 'Highest gains achieved in a single calendar day, per individual stat.',
            recs: ps.bestDay,
            getDate: r => achFmtDate(r.date)
        }, {
            key: 'best-week',
            short: 'Best Week',
            long: 'Best Training Week',
            tip: 'Highest gains achieved in a single calendar week, per individual stat.',
            recs: ps.bestWeek,
            getDate: r => achFmtWeekShort(r.weekOf)
        }, {
            key: 'best-month',
            short: 'Best Month',
            long: 'Best Month',
            tip: 'Highest gains achieved in a single calendar month, per individual stat.',
            recs: ps.bestMonth,
            getDate: r => achFmtMonthLong(r.rawMonth)
        }];
        const headerStats = STATS.map(sk => `<div class="ach-stat-header ach-stat-${sk} bbgl-ach-col-copy" data-stat="${sk}" data-tooltip="Click to copy ${STAT_LABEL[sk]} column" style="cursor:pointer">${STAT_LABEL[sk]}</div>`).join('');
        const header = `<div class="bbgl-ach-grid-header"><div class="ach-grid-label-area"><span class="bbgl-ach-section-title" data-ach-section="greatest-gains" data-clip-title="Greatest Gains" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">Greatest Gains</span></div>${headerStats}</div>`;
        const rowsHTML = rows.map(r => {
            const labelArea = `<div class="ach-grid-label-area"><div class="ach-k"><span class="ach-title-short">${achEsc(r.short)}</span><span class="ach-title-long">${achEsc(r.long)}</span></div></div>`;
            const cells = STATS.map(sk => {
                const rec = r.recs ? r.recs[sk] : null;
                const valHTML = rec ? '+' + Formatter.dual(rec.value) : '<span class="ach-null">—</span>';
                const dateHTML = rec ? `<div class="ach-date">${achEsc(r.getDate(rec))}</div>` : '';
                const timeHTML = (rec && r.getTime) ? `<div class="ach-time">${achEsc(r.getTime(rec))}</div>` : '';
                return `<div class="bbgl-ach-stat-cell" data-ach-key="${achEsc(r.key)}" data-stat="${sk}"><span class="ach-value">${valHTML}</span>${dateHTML}${timeHTML}</div>`;
            }).join('');
            const tipAttr = r.tip ? ` data-tooltip="${achEsc(r.tip)}"` : '';
            return `<div class="bbgl-ach-row bbgl-ach-row-multi" data-ach-key="${achEsc(r.key)}"${tipAttr}>${labelArea}${cells}</div>`;
        }).join('');
        return `<div class="bbgl-ach-section bbgl-ach-section-page0">${header}${rowsHTML}</div>`;
    }

    function achBuildPage1(d) {
        const STATS = ['str', 'def', 'spd', 'dex'];
        const STAT_LABEL = {
            str: 'Strength',
            def: 'Defense',
            spd: 'Speed',
            dex: 'Dexterity'
        };
        const rows = [{
            key: 'training-streak',
            short: 'Best Streak',
            long: 'Best Training Streak',
            tip: 'Total stats gained during your longest consecutive training streak.',
            len: d.longestStreak,
            start: d.longestStreakStart,
            end: d.longestStreakEnd,
            gains: d.longestStreakGains
        }, {
            key: 'green-streak',
            short: 'Best Green',
            long: 'Best Green Streak',
            tip: 'Total stats gained during your longest streak of achieving at least Green (1,000E+).',
            len: d.longestGoalStreak,
            start: d.longestGoalStreakStart,
            end: d.longestGoalStreakEnd,
            gains: d.longestGoalStreakGains
        }, {
            key: 'gold-streak',
            short: 'Best Gold',
            long: 'Best Gold Streak',
            tip: 'Total stats gained during your longest streak of achieving at least Gold (1,500E+).',
            len: d.longestGoldStreak,
            start: d.longestGoldStreakStart,
            end: d.longestGoldStreakEnd,
            gains: d.longestGoldStreakGains
        }, {
            key: 'diamond-streak',
            short: 'Best Diamond',
            long: 'Best Diamond Streak',
            tip: 'Total stats gained during your longest streak of achieving Diamond (2,000E+).',
            len: d.longestDiamondStreak,
            start: d.longestDiamondStreakStart,
            end: d.longestDiamondStreakEnd,
            gains: d.longestDiamondStreakGains
        }];
        const headerStats = STATS.map(sk => `<div class="ach-stat-header ach-stat-${sk}">${STAT_LABEL[sk]}</div>`).join('') + `<div class="ach-stat-header ach-stat-tot">Total</div>`;
        const header = `<div class="bbgl-ach-grid-header"><div class="ach-grid-label-area"><span class="bbgl-ach-section-title" data-ach-section="sexiest-streaks" data-clip-title="Sexiest Streaks" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">SEXIEST STREAKS</span></div>${headerStats}</div>`;
        const rowsHTML = rows.map(r => {
            const dayBit = `<span class="ach-streak-days">${r.len ? r.len + 'd' : '—'}</span>`;
            const presentStats = (r.gains ? STATS.filter(sk => (r.gains[sk] || 0) > 0) : []);
            const total = presentStats.reduce((a, sk) => a + (r.gains[sk] || 0), 0);
            const dateText = (r.start && r.end) ? achEsc(achFmtStreakRange(r.start, r.end)) : '—';
            const dateHTML = `<div class="ach-date ach-streak-date">${dayBit}<span class="ach-streak-sep">•</span><span class="ach-streak-daterange">${dateText}</span></div>`;
            const totalText = total > 0 ? '+' + achFmtGain(total) : '<span class="ach-null">—</span>';
            const inlineDays = r.len ? `<span class="ach-streak-days ach-streak-days-inline"> · ${r.len}d</span>` : '';
            const inlineDate = (r.start && r.end) ? `<span class="bbgl-ach-streak-date-inline">&nbsp;&nbsp;${dateText}</span>` : '';
            const labelArea = `<div class="ach-grid-label-area"><div class="ach-k"><span class="ach-title-short">${achEsc(r.short)}</span><span class="ach-title-long">${achEsc(r.long)}</span>${inlineDays}${inlineDate}</div></div>`;
            const cells = STATS.map(sk => {
                const v = (r.gains && r.gains[sk]) || 0;
                const valHTML = v > 0 ? '+' + achEsc(achFmtGain(v)) : '<span class="ach-null">—</span>';
                return `<div class="bbgl-ach-stat-cell" data-ach-key="${r.key}" data-stat="${sk}"><span class="ach-value">${valHTML}</span></div>`;
            }).join('');
            const totalCell = `<div class="bbgl-ach-stat-cell bbgl-ach-stat-cell-total" data-ach-key="${r.key}" data-stat="total"><span class="ach-value ach-stat-tot">${totalText}</span></div>`;
            const tipAttr = r.tip ? ` data-tooltip="${achEsc(r.tip)}"` : '';
            return `<div class="bbgl-ach-row bbgl-ach-row-multi" data-ach-key="${r.key}"${tipAttr}>${labelArea}${cells}${totalCell}${dateHTML}</div>`;
        }).join('');
        const consVal = d.trainingRestRatio || '—';
        const consDaysShort = '';
        const consDaysLong = '(' + (d.trainingDays || 0) + '/' + (d.calDays || 0) + ' Days)';
        const consRow = `<div class="bbgl-ach-row bbgl-ach-row-multi bbgl-ach-consistency-row" data-ach-key="consistency" data-tooltip="Your lifetime ratio of active training days versus total calendar days."><div class="bbgl-ach-consistency-text"><span class="ach-cons-short">Consistency: <span class="ach-cons-val">${achEsc(consVal)}</span></span><span class="ach-cons-long">Training Consistency: <span class="ach-cons-val">${achEsc(consVal)}</span> <span class="ach-cons-days">${achEsc(consDaysLong)}</span></span></div></div>`;
        return `<div class="bbgl-ach-section bbgl-ach-section-page0 bbgl-ach-section-page1">${header}${rowsHTML}${consRow}</div>`;
    }

    function achFmtTimeHM(ts) {
        const d = new Date(ts * 1000);
        const h = TimeManager.useLocal() ? d.getHours() : d.getUTCHours();
        const m = TimeManager.useLocal() ? d.getMinutes() : d.getUTCMinutes();
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    function achBuildPage2(d) {
        const STAT_ABBR = {
            str: 'STR',
            def: 'DEF',
            spd: 'SPD',
            dex: 'DEX'
        };
        const STAT_FULL = {
            str: 'Strength',
            def: 'Defense',
            spd: 'Speed',
            dex: 'Dexterity'
        };
        const STATS = ['str', 'def', 'spd', 'dex'];
        const countRow = (label, shortLabel, count, key, tip) => {
            const clipVal = String(count);
            return `<div class="bbgl-ach-row" data-tooltip="${achEsc(tip)}" data-ach-key="${key}" data-clip="${achEsc(label + ': ' + clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">${achEsc(label)}</span><span class="ach-title-short">${achEsc(shortLabel)}</span>:</span></div><div class="ach-v-wrap"><span class="ach-value">${achEsc(clipVal)}</span></div></div></div>`;
        };
        const bestRow = (longLabel, shortLabel, rec, key, tip) => {
            if (!rec || !rec.stats) {
                return `<div class="bbgl-ach-hh-best-row" data-tooltip="${achEsc(tip)}" data-ach-key="${key}"><div class="bbgl-ach-hh-label"><span class="ach-k"><span class="ach-title-long">${achEsc(longLabel)}</span><span class="ach-title-short">${achEsc(shortLabel)}</span></span><div class="bbgl-ach-hh-date-line"><span class="ach-null">No jumps recorded yet</span></div></div><div class="bbgl-ach-hh-cells"><div class="bbgl-ach-hh-cell bbgl-ach-hh-cell-total"><span class="bbgl-ach-hh-tag ach-stat-tot">Total</span><span class="bbgl-ach-hh-val"><span class="ach-null">—</span></span></div></div></div>`;
            }
            const dateStr = achFmtDate(rec.date);
            const timeStr = achFmtTimeHM(rec.ts) + ' – ' + achFmtTimeHM(rec.tsEnd || rec.ts) + ' ' + achTimeZoneSuffix();
            const timeStrClip = achFmtTimeHMClip(rec.ts) + ' – ' + achFmtTimeHMClip(rec.tsEnd || rec.ts) + ' TCT';
            const trained = STATS.filter(sk => (rec.stats[sk] || 0) > 0);
            const statCells = trained.map(sk => `<div class="bbgl-ach-hh-cell bbgl-ach-hh-cell-stat bbgl-ach-stat-cell" data-ach-key="${key}" data-stat="${sk}" data-tooltip="Total ${achEsc(STAT_FULL[sk])} gained during this jump."><span class="bbgl-ach-hh-val">+${achEsc(achFmtGain(rec.stats[sk]))}</span><span class="bbgl-ach-hh-tag ach-stat-${sk}">${STAT_ABBR[sk]}</span></div>`).join('');
            const totalCell = `<div class="bbgl-ach-hh-cell bbgl-ach-hh-cell-total bbgl-ach-stat-cell" data-ach-key="${key}" data-stat="total" data-tooltip="Total overall stats gained during this jump."><span class="bbgl-ach-hh-tag ach-stat-tot">Total</span><span class="bbgl-ach-hh-val">+${achEsc(achFmtGain(rec.value))}</span></div>`;
            const clipParts = trained.map(sk => STAT_ABBR[sk] + ': +' + achFmtGain(rec.stats[sk]));
            clipParts.push('Total: +' + achFmtGain(rec.value));
            return `<div class="bbgl-ach-hh-best-row" data-tooltip="${achEsc(tip)}" data-ach-key="${key}" data-clip="${achEsc(longLabel + ' (' + dateStr + ', ' + timeStrClip + '): ' + clipParts.join(' | '))}" data-clip-date="${achEsc(dateStr + '  ' + timeStrClip)}"><div class="bbgl-ach-hh-label"><span class="ach-k"><span class="ach-title-long">${achEsc(longLabel)}</span><span class="ach-title-short">${achEsc(shortLabel)}</span></span><div class="bbgl-ach-hh-date-line">${achEsc(dateStr)}<span class="bbgl-ach-hh-time"> &nbsp; ${achEsc(timeStr)}</span></div></div><div class="bbgl-ach-hh-cells">${statCells}${totalCell}</div></div>`;
        };
        const hjCount = countRow('Happy Jumps Performed', 'Happy Jumps', d.happyJumps || 0, 'hj-count', 'Total number of Happy Jumps executed (1,000E+ energy used training within a 5-minute window).');
        const hjBest = bestRow('Best Happy Jump', 'Best Jump', d.bestHappyJump && d.bestHappyJump.total, 'best-hj', 'The single Happy Jump that yielded the highest combined stat gain.');
        const rowsHTML = `<div class="bbgl-ach-hh-group" data-ach-key="happy-jumps-group">${hjCount}${hjBest}</div>`;
        let clipAll = `Happy Jumps Performed: ${d.happyJumps || 0}\nBest Happy Jump: ${d.bestHappyJump && d.bestHappyJump.total ? (() => { const rec = d.bestHappyJump.total; const trained = STATS.filter(sk => (rec.stats[sk] || 0) > 0); const parts = trained.map(sk => STAT_ABBR[sk] + ': +' + achFmtGain(rec.stats[sk])); parts.push('Total: +' + achFmtGain(rec.value)); return parts.join(' | '); })() : '—'}`;
        
        let helpersHTML = '';
        if (d.happyItemTotals) {
            const helpers = HAPPY_LOGS.map(id => {
                const rec = d.happyItemTotals[id] || { count: 0, happy: 0 };
                return {
                    id,
                    label: ITEM_LOG_META[id].label,
                    short: ITEM_LOG_META[id].short || ITEM_LOG_META[id].label,
                    count: rec.count,
                    happy: rec.happy
                };
            }).filter(h => h.count > 0).sort((a, b) => b.count - a.count || b.happy - a.happy);
            
            if (helpers.length > 0) {
                const helperRow = (h) => {
                    const tip = `${achEsc(h.label)} | Happy Gained`;
                    const clipVal = `${h.label}: ${h.count} (${Formatter.number(h.happy)} Happy)`;
                    return `<div class="bbgl-ach-row" data-tooltip="${achEsc(tip)}" data-ach-key="happy-helper-${h.id}" data-clip="${achEsc(clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">${achEsc(h.label)}</span><span class="ach-title-short">${achEsc(h.short)}</span>:</span></div><div class="ach-v-wrap"><span class="ach-value">${Formatter.number(h.count)}</span><span class="ach-value ach-happy-col">+${achEsc(achFmtGain(h.happy))} Happy</span></div></div></div>`;
                };
                
                const colCount = 2;
                const rpc = Math.ceil(helpers.length / colCount);
                const cols = [];
                for (let i = 0; i < colCount; i++) {
                    const start = i * rpc;
                    const chunk = helpers.slice(start, start + rpc);
                    if (chunk.length) {
                        cols.push(`<div class="bbgl-ach-col">${chunk.map(helperRow).join('')}</div>`);
                    }
                }
                const clipHelpers = helpers.map(h => `${h.label}: ${h.count} (${Formatter.number(h.happy)} Happy)`).join('\n');
                clipAll += '\n\n— Happy Helpers —\n' + clipHelpers;
                helpersHTML = `<div class="bbgl-ach-subsection-title" style="margin-top:2px" data-ach-section="happy-helpers" data-clip-section="${achEsc(clipHelpers)}" data-clip-title="Happy Helpers" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">HAPPY HELPERS</div><div class="bbgl-ach-cols" style="grid-template-columns:repeat(${colCount},minmax(0,1fr)); padding-top:1px; padding-bottom:0;">${cols.join('')}</div>`;
            }
        }
        
        return `<div class="bbgl-ach-section bbgl-ach-section-hh"><div class="bbgl-ach-section-title" data-ach-section="happy-hopping" data-clip-section="${achEsc(clipAll)}" data-clip-title="Happy Hopping" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">HAPPY HOPPING</div>${rowsHTML}${helpersHTML}</div>`;
    }

    function buildAchievementsPage(pageIdx, d) {
        const mk = (label, value, opts = {}) => {
            const base = {
                label,
                key: opts.key || '',
                sub: opts.sub || '',
                statClass: opts.statClass || '',
                tip: opts.tip || '',
                clipDate: opts.clipDate || ''
            };
            if ('dualHtml' in opts) return {
                ...base,
                dualHtml: opts.dualHtml,
                display: opts.display !== undefined ? opts.display : '',
                rawVal: opts.rawVal !== undefined ? opts.rawVal : (opts.dualHtml && typeof value === 'number' ? achLedgerClip(value) : '\u2014')
            };
            if (opts.display !== undefined || opts.rawVal !== undefined || value === null || value === undefined || typeof value !== 'number') {
                const display = opts.display !== undefined ? opts.display : achFmtVal(value);
                const rawVal = opts.rawVal !== undefined ? opts.rawVal : (opts.display !== undefined ? String(opts.display).replace(/<[^>]+>/g, '') : (value !== null && value !== undefined ? achFmtVal(value) : '\u2014'));
                return {
                    ...base,
                    dualHtml: '',
                    display,
                    rawVal
                };
            }
            return {
                ...base,
                dualHtml: Formatter.dual(value),
                display: '',
                rawVal: opts.rawVal !== undefined ? opts.rawVal : achLedgerClip(value)
            };
        };
        const mkRec = (label, rec, getDate, tip, suffix, key = '') => {
            const dt = rec ? getDate(rec) : '';
            const v = rec ? rec.value : null;
            const o = {
                key,
                statClass: (rec && rec.stat) ? 'ach-stat-' + rec.stat : '',
                sub: (rec && rec.stat) ? rec.stat.toUpperCase() : '',
                tip: tip,
                clipDate: dt
            };
            if (suffix) return rec ? mk(label, v, {
                ...o,
                dualHtml: Formatter.dual(v) + ' E',
                rawVal: achLedgerClip(v) + ' E'
            }) : mk(label, null, {
                ...o,
                display: '\u2014',
                rawVal: '\u2014'
            });
            return mk(label, v, o);
        };
        const achUnit = (n, sing, plur) => n ? n + '<span class="ach-unit"> ' + (n === 1 ? sing : plur) + '</span>' : '\u2014';
        if (pageIdx === 0) {
            return achBuildPage0(d);
        } else if (pageIdx === 1) {
            return achBuildPage1(d);
        } else if (pageIdx === 2) {
            return achBuildPage2(d);
        } else {
            const consistRows = [mk('Best Training Streak', d.longestStreak, {
                key: 'training-streak',
                dualHtml: achUnit(d.longestStreak, 'Day', 'Days'),
                rawVal: d.longestStreak ? d.longestStreak + (d.longestStreak === 1 ? ' Day' : ' Days') : '\u2014',
                clipDate: achFmtStreakRange(d.longestStreakStart, d.longestStreakEnd),
                tip: 'Longest streak of active training days'
            }), mk('Best Green Streak', d.longestGoalStreak, {
                key: 'green-streak',
                dualHtml: achUnit(d.longestGoalStreak, 'Day', 'Days'),
                rawVal: d.longestGoalStreak ? d.longestGoalStreak + (d.longestGoalStreak === 1 ? ' Day' : ' Days') : '\u2014',
                clipDate: achFmtStreakRange(d.longestGoalStreakStart, d.longestGoalStreakEnd),
                tip: 'Longest streak of achieving at least Green (1000E+)'
            }), mk('Best Gold Streak', d.longestGoldStreak, {
                key: 'gold-streak',
                dualHtml: achUnit(d.longestGoldStreak, 'Day', 'Days'),
                rawVal: d.longestGoldStreak ? d.longestGoldStreak + (d.longestGoldStreak === 1 ? ' Day' : ' Days') : '\u2014',
                clipDate: achFmtStreakRange(d.longestGoldStreakStart, d.longestGoldStreakEnd),
                tip: 'Longest streak of achieving Gold (1500E+)'
            }), mk('Consistency Rate', null, {
                key: 'consistency',
                display: d.trainingRestRatio || '\u2014',
                rawVal: d.trainingRestRatio || '\u2014',
                tip: 'Lifetime ratio of rest days to training days'
            }), mk('Happy Jumps', d.happyJumps, {
                key: 'happy-jumps',
                display: String(d.happyJumps || 0),
                rawVal: String(d.happyJumps || 0),
                tip: 'Total Happy Jumps performed'
            })];
            const rewardRows = [mk('Green Days', d.greenDays, {
                key: 'green-days',
                display: String(d.greenDays || 0),
                rawVal: String(d.greenDays || 0),
                statClass: 'ach-fx-green',
                tip: 'Total days where the minimum daily goal (Green: 1,000E+) was achieved.'
            }), mk('Gold Days', d.goldDays, {
                key: 'gold-days',
                display: String(d.goldDays || 0),
                rawVal: String(d.goldDays || 0),
                statClass: 'ach-fx-gold',
                tip: 'Total days where the elite daily goal (Gold: 1,500E+) was achieved.'
            }), mk('Diamond Days', d.diamondDays, {
                key: 'diamond-days',
                display: String(d.diamondDays || 0),
                rawVal: String(d.diamondDays || 0),
                statClass: 'ach-fx-diamond',
                tip: 'Total days where the ultimate daily goal (Diamond: 2,000E+) was achieved.'
            }), mk('Stickers Unlocked', d.stickersUnlocked, {
                key: 'stickers',
                display: (d.stickersUnlocked || 0) + '/' + CUSTOM_STICKERS.length,
                rawVal: (d.stickersUnlocked || 0) + '/' + CUSTOM_STICKERS.length,
                statClass: 'ach-fx-holo',
                tip: 'Total unique milestone stickers earned through consistent training.'
            }), mk('Green Weeks', d.greenWeeks, {
                key: 'green-weeks',
                display: String(d.greenWeeks || 0),
                rawVal: String(d.greenWeeks || 0),
                statClass: 'ach-fx-green',
                tip: 'Total weeks where the minimum weekly training goal was met.'
            }), mk('Gold Weeks', d.goldWeeks, {
                key: 'gold-weeks',
                display: String(d.goldWeeks || 0),
                rawVal: String(d.goldWeeks || 0),
                statClass: 'ach-fx-gold',
                tip: 'Total weeks where the elite weekly training goal was met.'
            }), mk('Diamond Weeks', d.diamondWeeks, {
                key: 'diamond-weeks',
                display: String(d.diamondWeeks || 0),
                rawVal: String(d.diamondWeeks || 0),
                statClass: 'ach-fx-diamond',
                tip: 'Total weeks where the ultimate weekly training goal was met.'
            })];
            void consistRows;
            return achBuildSection('Rewards Reaped', rewardRows, 'rewards-reaped', 2);
        }
    }

    function achFmtGain(v) {
        if (v >= 1e9) return (v / 1e9).toFixed(4) + 'B';
        if (v >= 1e6) return (v / 1e6).toFixed(3) + 'M';
        if (v >= 1e4) return (v / 1000).toFixed(2) + 'K';
        if (v >= 1e3) return (v / 1000).toFixed(1) + 'K';
        return Formatter.number(v);
    }

    function achStatAbbr(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }

    function achStatFull(s) {
        return {
            str: 'Strength',
            def: 'Defense',
            spd: 'Speed',
            dex: 'Dexterity'
        } [s] || s;
    }

    function achFmtGainsLine(g) {
        const ORDER = ['str', 'def', 'spd', 'dex'];
        return ORDER.filter(k => g && g[k] > 0).map(k => '+' + achFmtGain(g[k]) + ' ' + achStatAbbr(k)).join(' | ');
    }

    function achFmtTs(ts) {
        const d = new Date(ts * 1000);
        const datePart = Formatter.datePretty(Formatter.dateISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        return datePart + '  ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ':' + String(d.getUTCSeconds()).padStart(2, '0');
    }

    function achGetDay(date) {
        const s = getActiveHistory();
        const all = [...(s.history || [])];
        if (s.today && s.today.date) {
            const i = all.findIndex(d => d.date === s.today.date);
            if (i >= 0) all[i] = s.today;
            else all.push(s.today);
        }
        return all.find(d => d.date === date) || null;
    }

    function achGetTrainBA(rec) {
        const day = achGetDay(rec.date);
        if (!day) return null;
        const series = [...(day.series || [])].sort((a, b) => a.ts - b.ts);
        let before = (day.startBreakdown && day.startBreakdown[rec.stat]) || 0;
        for (const e of series) {
            if (e.ts === rec.ts && e.stat === rec.stat) return {
                before,
                after: before + rec.value
            };
            if (e.stat === rec.stat) before += (e.gain || 0);
        }
        return null;
    }

    function achGetDayBA(rec) {
        const day = achGetDay(rec.date);
        if (!day) return null;
        return {
            before: (day.startBreakdown && day.startBreakdown[rec.stat]) || 0,
            after: (day.endBreakdown && day.endBreakdown[rec.stat]) || 0
        };
    }

    function achGetMonthBA(rawMonth, stat) {
        const s = getActiveHistory();
        const all = [...(s.history || [])];
        if (s.today && s.today.date) {
            const i = all.findIndex(d => d.date === s.today.date);
            if (i >= 0) all[i] = s.today;
            else all.push(s.today);
        }
        const days = all.filter(d => d.date.slice(0, 7) === rawMonth && ((d.gains && d.gains[stat]) || 0) > 0).sort((a, b) => a.date.localeCompare(b.date));
        if (!days.length) return null;
        return {
            before: (days[0].startBreakdown && days[0].startBreakdown[stat]) || 0,
            after: (days[days.length - 1].endBreakdown && days[days.length - 1].endBreakdown[stat]) || 0
        };
    }

    function achGetWeekBA(weekOf, stat) {
        const s = getActiveHistory();
        const all = [...(s.history || [])];
        if (s.today && s.today.date) {
            const i = all.findIndex(d => d.date === s.today.date);
            if (i >= 0) all[i] = s.today;
            else all.push(s.today);
        }
        const startD = new Date(weekOf + 'T00:00:00Z');
        const endD = new Date(startD);
        endD.setUTCDate(endD.getUTCDate() + 6);
        const endStr = Formatter.dateISO(endD.getUTCFullYear(), endD.getUTCMonth(), endD.getUTCDate());
        const days = all
            .filter(d => d.date >= weekOf && d.date <= endStr && ((d.gains && d.gains[stat]) || 0) > 0)
            .sort((a, b) => a.date.localeCompare(b.date));
        if (!days.length) return null;
        return {
            before: (days[0].startBreakdown && days[0].startBreakdown[stat]) || 0,
            after: (days[days.length - 1].endBreakdown && days[days.length - 1].endBreakdown[stat]) || 0
        };
    }

    function achFmtBA(ba) {
        return ba ? Formatter.number(ba.before) + ' \u2192 ' + Formatter.number(ba.after) : null;
    }

    function achFmtWeekCopy(weekOf) {
        const we = new Date(weekOf + 'T00:00:00Z');
        we.setUTCDate(we.getUTCDate() + 6);
        const endStr = Formatter.dateISO(we.getUTCFullYear(), we.getUTCMonth(), we.getUTCDate());
        return Formatter.datePretty(weekOf) + ' \u2013 ' + Formatter.datePretty(endStr);
    }

    function achClipSection(H, title, blocks) {
        const NL = '\n';
        let s = H + NL + NL + '\u2014 ' + title + ' \u2014' + NL;
        blocks.forEach((b, i) => {
            if (i) s += (blocks[i - 1].includes(NL) || b.includes(NL)) ? NL + NL : NL;
            s += b;
        });
        return s;
    }

    function achFmtStatBlock(key, rec, stat, indent) {
        if (!rec) return null;
        const STAT_FULL = {
            str: 'Strength',
            def: 'Defense',
            spd: 'Speed',
            dex: 'Dexterity'
        };
        let ba = null;
        if (key === 'best-train') ba = achGetTrainBA({
            value: rec.value,
            date: rec.date,
            ts: rec.ts,
            stat
        });
        else if (key === 'best-day') ba = achGetDayBA({
            date: rec.date,
            stat
        });
        else if (key === 'best-week') ba = achGetWeekBA(rec.weekOf, stat);
        else if (key === 'best-month') ba = achGetMonthBA(rec.rawMonth, stat);
        const baStr = ba ? achFmtBA(ba) : null;
        let dateStr = '';
        if (key === 'best-train') dateStr = achFmtTs(rec.ts);
        else if (key === 'best-day') dateStr = Formatter.datePretty(rec.date);
        else if (key === 'best-week') dateStr = Formatter.datePretty(rec.weekOf);
        else if (key === 'best-month') dateStr = achFmtMonthLong(rec.rawMonth);
        const line1 = indent + '+' + Formatter.number(rec.value) + ' ' + STAT_FULL[stat] + (baStr ? ' | ' + baStr : '');
        const line2 = indent + '  ' + dateStr;
        return line1 + '\n' + line2;
    }

    function handleAchCopy(el) {
        const H = '\uD83D\uDC51BBGL Achievements',
            cache = runtime._achCache;
        let txt = '',
            flashEl = null;
        const NL = '\n',
            I = '  ';
        const PS_MAP = {
            'best-train': 'bestTrain',
            'best-day': 'bestDay',
            'best-week': 'bestWeek',
            'best-month': 'bestMonth'
        };
        const TITLE_MAP = {
            'best-train': 'Highest Gains in a Single Train',
            'best-day': 'Highest Gains in a Single Day',
            'best-week': 'Highest Gains in a Single Week',
            'best-month': 'Highest Gains in a Single Month'
        };
        if (el.classList.contains('bbgl-ach-col-copy')) {
            // Clickable Greatest Gains column title: copy that stat across all four best-X rows.
            const sk = el.getAttribute('data-stat');
            const r = cache;
            const PS_MAP_L = { 'best-train': 'bestTrain', 'best-day': 'bestDay', 'best-week': 'bestWeek', 'best-month': 'bestMonth' };
            const TITLE_MAP_L = { 'best-train': 'Best Train', 'best-day': 'Best Day', 'best-week': 'Best Week', 'best-month': 'Best Month' };
            if (sk && r && r.perStatBest) {
                const lines = ['best-train', 'best-day', 'best-week', 'best-month'].map(mkey => {
                    const rec = (r.perStatBest[PS_MAP_L[mkey]] || {})[sk];
                    return achFmtStatBlock(mkey, rec, sk, '  ');
                }).filter(Boolean);
                if (lines.length) {
                    txt = '👑BBGL Achievements\nGreatest Gains — ' + achStatFull(sk) + ':\n' + lines.join(NL);
                    const _sec = el.closest('.bbgl-ach-section');
                    const _cells = _sec ? Array.from(_sec.querySelectorAll(`.bbgl-ach-stat-cell[data-stat="${sk}"]`)).filter(c => !c.querySelector('.ach-null')) : [];
                    flashEl = _cells.length ? _cells : el;
                }
            }
        } else if (el.classList.contains('bbgl-ach-stat-cell')) {
            const key = el.getAttribute('data-ach-key');
            const stat = el.getAttribute('data-stat');
            const recs = (cache && cache.perStatBest && PS_MAP[key]) ? cache.perStatBest[PS_MAP[key]] : null;
            const rec = (recs && stat) ? recs[stat] : null;
            const block = achFmtStatBlock(key, rec, stat, '');
            if (block && TITLE_MAP[key]) {
                txt = H + NL + TITLE_MAP[key] + ':' + NL + block;
                flashEl = el;
            } else if (cache && /^(training|green|gold|diamond)-streak$/.test(key)) {
                const SK = {
                    'training-streak': ['Best Training Streak', cache.longestStreak, cache.longestStreakGains, cache.longestStreakStart, cache.longestStreakEnd],
                    'green-streak': ['Best Green Streak', cache.longestGoalStreak, cache.longestGoalStreakGains, cache.longestGoalStreakStart, cache.longestGoalStreakEnd],
                    'gold-streak': ['Best Gold Streak', cache.longestGoldStreak, cache.longestGoldStreakGains, cache.longestGoldStreakStart, cache.longestGoldStreakEnd],
                    'diamond-streak': ['Best Diamond Streak', cache.longestDiamondStreak, cache.longestDiamondStreakGains, cache.longestDiamondStreakStart, cache.longestDiamondStreakEnd]
                };
                const SF = {
                    str: 'Strength',
                    def: 'Defense',
                    spd: 'Speed',
                    dex: 'Dexterity',
                    total: 'Total'
                };
                const ent = SK[key];
                if (ent && ent[2]) {
                    const label = ent[0],
                        g = ent[2],
                        st = ent[3],
                        en = ent[4];
                    const v = stat === 'total' ? ['str', 'def', 'spd', 'dex'].reduce((a, k) => a + (g[k] || 0), 0) : (g[stat] || 0);
                    txt = H + NL + label + ' — ' + SF[stat] + ':' + NL + '+' + Formatter.number(v) + ' ' + SF[stat] + (st && en ? NL + I + Formatter.datePretty(st) + ' – ' + Formatter.datePretty(en) : '');
                    flashEl = el;
                }
            } else if (key === 'best-hj') {
                const rec = cache && cache.bestHappyJump && cache.bestHappyJump.total;
                const label = 'Best Happy Jump';
                const HHSF = {
                    str: 'Strength',
                    def: 'Defense',
                    spd: 'Speed',
                    dex: 'Dexterity',
                    total: 'Total'
                };
                if (rec && rec.stats) {
                    const v = stat === 'total' ? rec.value : (rec.stats[stat] || 0);
                    txt = H + NL + label + ' — ' + HHSF[stat] + ': +' + achFmtGain(v);
                    flashEl = el;
                }
            }
        } else if (el.classList.contains('bbgl-ach-hh-group')) {
            const gKey = el.getAttribute('data-ach-key'),
                r = cache;
            const GABR = {
                str: 'STR',
                def: 'DEF',
                spd: 'SPD',
                dex: 'DEX'
            };
            const GSTS = ['str', 'def', 'spd', 'dex'];
            const fmtJ = (rec) => {
                if (!rec || !rec.stats) return '\u2014';
                const tr = GSTS.filter(sk => (rec.stats[sk] || 0) > 0);
                const pts = tr.map(sk => GABR[sk] + ': +' + achFmtGain(rec.stats[sk]));
                pts.push('Total: +' + achFmtGain(rec.value));
                return pts.join(' | ');
            };
            if (gKey === 'happy-jumps-group') {
                txt = H + NL + 'Happy Jumps Performed: ' + (r.happyJumps || 0) + NL + 'Best Happy Jump: ' + fmtJ(r.bestHappyJump && r.bestHappyJump.total);
                flashEl = Array.from(el.children);
            }
        } else if (el.classList.contains('bbgl-ach-section-title') || el.classList.contains('bbgl-ach-subsection-title')) {
            const sec = el.getAttribute('data-ach-section'),
                r = cache,
                title = el.getAttribute('data-clip-title') || '';
            const gain = (label, rec, getBA, getDate) => {
                if (!rec) return label + ': \u2014';
                const ba = getBA(rec),
                    baStr = achFmtBA(ba);
                const line1 = label + ': +' + Formatter.number(rec.value) + ' ' + achStatFull(rec.stat) + (baStr ? ' | ' + baStr : '');
                return line1 + NL + I + getDate(rec);
            };
            const eRow = (label, rec, getDate) => !rec ? label + ': \u2014' : label + ': ' + Formatter.number(rec.value) + ' E' + NL + I + getDate(rec);
            const streak = (label, len, gains, start, end) => {
                if (!len) return label + ': \u2014';
                const gLine = gains ? achFmtGainsLine(gains) : '';
                const tot = gains ? ((gains.str || 0) + (gains.def || 0) + (gains.spd || 0) + (gains.dex || 0)) : 0;
                let s = label + ': ' + len + (len === 1 ? ' Day' : ' Days') + NL;
                if (gLine) s += I + 'Gains: ' + gLine + NL;
                if (tot) s += I + 'Total Gains: +' + Formatter.number(tot) + NL;
                if (start && end) s += I + Formatter.datePretty(start) + ' \u2013 ' + Formatter.datePretty(end);
                return s;
            };
            let blocks;
            if (sec === 'greatest-gains') {
                const buildMulti = (label, mkey) => {
                    const mRecs = (r && r.perStatBest) ? r.perStatBest[PS_MAP[mkey]] : null;
                    if (!mRecs) return label + ': —';
                    const mLines = ['str', 'def', 'spd', 'dex'].map(sk => achFmtStatBlock(mkey, mRecs[sk], sk, I)).filter(Boolean);
                    if (!mLines.length) return label + ': —';
                    return label + ':' + NL + mLines.join(NL);
                };
                blocks = [buildMulti('Best Train', 'best-train'), buildMulti('Best Day', 'best-day'), buildMulti('Best Week', 'best-week'), buildMulti('Best Month', 'best-month')];
            } else if (sec === 'expended-energy') blocks = [eRow('Best Day', r.mostEInOneDay, rec => Formatter.datePretty(rec.date)), eRow('Best Week', r.mostEInOneWeek, rec => achFmtWeekCopy(rec.weekOf)), eRow('Best Month', r.mostEInOneMonth, rec => rec.month)];
            else if (sec === 'consistency-kept') blocks = [streak('Best Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd), streak('Best Green Streak', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd), streak('Best Gold Streak', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd), 'Consistency: ' + (r.trainingRestRatio || '\u2014') + ' | ' + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Days Trained', 'Happy Jumps: ' + (r.happyJumps || 0)];
            else if (sec === 'sexiest-streaks') blocks = [streak('Best Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd), streak('Best Green Streak', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd), streak('Best Gold Streak', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd), streak('Best Diamond Streak', r.longestDiamondStreak, r.longestDiamondStreakGains, r.longestDiamondStreakStart, r.longestDiamondStreakEnd), 'Consistency: ' + (r.trainingRestRatio || '\u2014') + ' | ' + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Calendar Days Trained'];
            else if (sec === 'rewards-reaped') blocks = ['Green Days: ' + (r.greenDays || 0), 'Green Weeks: ' + (r.greenWeeks || 0), 'Gold Days: ' + (r.goldDays || 0), 'Gold Weeks: ' + (r.goldWeeks || 0), 'Diamond Days: ' + (r.diamondDays || 0), 'Diamond Weeks: ' + (r.diamondWeeks || 0), 'Stickers Unlocked: ' + (r.stickersUnlocked || 0) + '/' + CUSTOM_STICKERS.length];
            if (blocks) {
                txt = achClipSection(H, title, blocks);
                const _sec = el.closest('.bbgl-ach-section');
                if (sec === 'greatest-gains') {
                    const _rows = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row-multi')) : [];
                    flashEl = _rows.length ? _rows : el;
                } else if (sec === 'sexiest-streaks') {
                    const arr = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row-multi')) : [];
                    flashEl = arr.length ? arr : el;
                } else if (sec === 'rewards-reaped') {
                    const _rows = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row')) : [];
                    flashEl = _rows.length ? _rows : el;
                } else {
                    flashEl = el;
                }
            } else if (el.hasAttribute('data-clip-section')) {
                txt = H + NL + NL + '\u2014 ' + title + ' \u2014' + NL + el.getAttribute('data-clip-section');
                if (sec === 'happy-helpers') {
                    const _sec = el.closest('.bbgl-ach-section');
                    const _rows = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-cols .bbgl-ach-row')) : [];
                    flashEl = _rows.length ? _rows : el;
                } else if (sec === 'happy-hopping') {
                    const _sec = el.closest('.bbgl-ach-section');
                    const _groups = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-hh-group')) : [];
                    const _helpers = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-cols .bbgl-ach-row')) : [];
                    const _rows = [..._groups, ..._helpers];
                    flashEl = _rows.length ? _rows : el;
                } else {
                    const _sec = el.closest('.bbgl-ach-section');
                    flashEl = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row, .bbgl-ach-hh-group')) : el;
                }
            }
        } else {
            const key = el.getAttribute('data-ach-key'),
                r = cache;
            const PS_MAP = {
                'best-train': 'bestTrain',
                'best-day': 'bestDay',
                'best-week': 'bestWeek',
                'best-month': 'bestMonth'
            };
            const TITLE_MAP = {
                'best-train': 'Highest Gains in a Single Train',
                'best-day': 'Highest Gains in a Single Day',
                'best-week': 'Highest Gains in a Single Week',
                'best-month': 'Highest Gains in a Single Month'
            };
            if (key === 'best-train' || key === 'best-day' || key === 'best-week' || key === 'best-month') {
                const mRecs = (r && r.perStatBest) ? r.perStatBest[PS_MAP[key]] : null;
                const mTitle = TITLE_MAP[key];
                if (mRecs && mTitle) {
                    const mLines = ['str', 'def', 'spd', 'dex'].map(sk => achFmtStatBlock(key, mRecs[sk], sk, I)).filter(Boolean);
                    txt = H + NL + mTitle + ':' + (mLines.length ? NL + mLines.join(NL) : NL + '—');
                }
            } else if (key === 'most-e-day' && r.mostEInOneDay) {
                const rec = r.mostEInOneDay;
                txt = H + NL + 'Most Energy Used Training in a Single Day:' + NL + Formatter.number(rec.value) + ' E' + NL + I + Formatter.datePretty(rec.date);
            } else if (key === 'most-e-week' && r.mostEInOneWeek) {
                const rec = r.mostEInOneWeek;
                txt = H + NL + 'Most Energy Used Training in a Single Week:' + NL + Formatter.number(rec.value) + ' E' + NL + I + achFmtWeekCopy(rec.weekOf);
            } else if (key === 'most-e-month' && r.mostEInOneMonth) {
                const rec = r.mostEInOneMonth;
                txt = H + NL + 'Most Energy Used Training in a Single Month:' + NL + Formatter.number(rec.value) + ' E' + NL + I + rec.month;
            } else if (key === 'training-streak' || key === 'green-streak' || key === 'gold-streak' || key === 'diamond-streak') {
                const SK = {
                    'training-streak': ['Longest Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd],
                    'green-streak': ['Longest Green Streak (1,000 E+)', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd],
                    'gold-streak': ['Longest Gold Streak (1,500 E+)', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd],
                    'diamond-streak': ['Longest Diamond Streak (2,000 E+)', r.longestDiamondStreak, r.longestDiamondStreakGains, r.longestDiamondStreakStart, r.longestDiamondStreakEnd]
                } [key];
                const label = SK[0],
                    len = SK[1] || 0,
                    gains = SK[2],
                    st = SK[3],
                    en = SK[4];
                const gLine = gains ? achFmtGainsLine(gains) : '';
                const tot = gains ? ((gains.str || 0) + (gains.def || 0) + (gains.spd || 0) + (gains.dex || 0)) : 0;
                txt = H + NL + label + ': ' + len + (len === 1 ? ' Day' : ' Days');
                if (gLine) txt += NL + 'Gains: ' + gLine;
                if (tot) txt += NL + 'Total Gains: +' + Formatter.number(tot);
                if (st && en) txt += NL + I + Formatter.datePretty(st) + ' \u2013 ' + Formatter.datePretty(en);
            } else if (key === 'consistency') {
                txt = H + NL + 'Training Consistency: ' + (r.trainingRestRatio || '\u2014') + NL + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Days Trained';
            } else if (key === 'happy-jumps') {
                txt = H + NL + 'Happy Jumps: ' + (r.happyJumps || 0);
            } else if (key === 'green-days') {
                txt = H + NL + 'Green Days: ' + (r.greenDays || 0);
            } else if (key === 'green-weeks') {
                txt = H + NL + 'Green Weeks: ' + (r.greenWeeks || 0);
            } else if (key === 'gold-days') {
                txt = H + NL + 'Gold Days: ' + (r.goldDays || 0);
            } else if (key === 'gold-weeks') {
                txt = H + NL + 'Gold Weeks: ' + (r.goldWeeks || 0);
            } else if (key === 'diamond-days') {
                txt = H + NL + 'Diamond Days: ' + (r.diamondDays || 0);
            } else if (key === 'diamond-weeks') {
                txt = H + NL + 'Diamond Weeks: ' + (r.diamondWeeks || 0);
            } else if (key === 'stickers') {
                txt = H + NL + 'Stickers Unlocked: ' + (r.stickersUnlocked || 0) + '/' + CUSTOM_STICKERS.length;
            } else {
                const clip = el.getAttribute('data-clip') || '',
                    clipDate = el.getAttribute('data-clip-date') || '';
                txt = H + NL + NL + (clipDate ? clipDate + ':' + NL : '') + clip;
            }
            flashEl = el;
        }
        if (!txt || !flashEl || (Array.isArray(flashEl) && !flashEl.length)) return;
        navigator.clipboard.writeText(txt).then(() => flashCopied(flashEl));
    }

    // Builds the "Copy Session Data" clipboard text. Pass all four STAT_KEYS for the full button,
    // or a single-element array [k] for a per-column copy. Energy line uses s[keys[0]].cost for
    // single-stat, s.total.cost for full. Format is identical to the existing copy-session output.
    function buildSessionText(sl, s, keys) {
        const fM = v => (Math.abs(v) >= 1e9) ? Formatter.abbr(v, 4) : Formatter.number(v);
        const statEmoji = { str: '💪', def: '🛡️', spd: '🎯', dex: '🤺' };
        const statNames = { str: 'Strength', def: 'Defense', spd: 'Speed', dex: 'Dexterity' };
        let ds = '';
        if (sl._dailyList && sl._dailyList.length > 1)
            ds = `${Formatter.dateFull(sl._dailyList[0].date)} - ${Formatter.dateFull(sl._dailyList[sl._dailyList.length - 1].date)}`;
        else
            ds = Formatter.dateFull(sl.date);
        const isSingle = keys.length === 1;
        const eCost = isSingle ? s[keys[0]].cost : s.total.cost;
        const eTxt = eCost > 0 ? `⚡${Formatter.number(eCost)} E` : '🛌 I was a lazy POS.';
        const statLines = keys
            .filter(k => s[k].gain > 0 || s[k].cost > 0)
            .map(k => `${statEmoji[k]}${statNames[k]}: +${fM(s[k].gain)} (${fM(s[k].start)} → ${fM(s[k].end)})`);
        return ['👑BBGymLog', `${ds} |${eTxt}`, ...statLines].join('\n');
    }

    // Reusable "Copied!" overlay: hide the element's children, show a centred overlay for 1s.
    // Accepts a single element or an array of elements.
    function flashCopied(flashEl) {
        const _flashEls = Array.isArray(flashEl) ? flashEl : [flashEl];
        const _states = _flashEls.map(e => {
            const kids = Array.from(e.children);
            const visStates = kids.map(c => c.style.visibility);
            kids.forEach(c => {
                c.style.visibility = 'hidden';
            });
            const prevPos = e.style.position;
            const cs = window.getComputedStyle(e);
            if (cs.position === 'static') e.style.position = 'relative';
            const overlay = document.createElement('span');
            overlay.className = 'bbgl-ach-copied-flash';
            overlay.textContent = 'Copied!';
            e.appendChild(overlay);
            return {
                e,
                kids,
                visStates,
                prevPos,
                overlay
            };
        });
        setTimeout(() => _states.forEach(s => {
            if (s.overlay && s.overlay.parentNode) s.overlay.parentNode.removeChild(s.overlay);
            s.kids.forEach((c, i) => {
                c.style.visibility = s.visStates[i];
            });
            s.e.style.position = s.prevPos;
        }), 1000);
    }
    async function exportData() {
        let s;
        try {
            s = await DBManager.getStorage();
            if (!s) {
                alert("Export Error: Local database is inaccessible or empty. Cannot export data.\n\nRecommendation: Please refresh the page and try again. If you are using Private Browsing or have strict storage limits enabled, you may need to disable them for Torn.com to allow the Gym Log to save and export data.");
                return;
            }
        } catch (e) {
            alert("Export Error: " + (e.message || "Failed to read local database.") + "\n\nRecommendation: Please refresh the page. Ensure your browser is not blocking local storage for Torn.com.");
            return;
        }
        const active = getActiveHistory();
        let activeCount = 0;
        [...(active.history || []), active.today].filter(Boolean).forEach(d => {
            if (d.series) activeCount += d.series.length;
        });
        if (s.series && s.series.length < activeCount) {
            if (!confirm(`⚠️ EXPORT WARNING ⚠️\n\nThe exported file will be missing some recent logs visible on your screen due to a database error.\n\nRecommendation: Cancel this export and refresh the browser to reset the connection, then try again.\n\nDownload incomplete file anyway?`)) {
                return;
            }
        }
        const now = new Date();
        const month = CONSTANTS.MONTHS[TimeManager.month(now)];
        const day = TimeManager.date(now);
        const year = TimeManager.year(now);
        const filename = `BBGymLogData - ${month} ${day}_${year}.json`;
        DataController.getStickerMap();
        if (_historyCache && _historyCache.meta && _historyCache.meta.stickers) {
            if (!s.meta) s.meta = {};
            s.meta.stickers = _historyCache.meta.stickers;
        }
        const use24h = !new Intl.DateTimeFormat(navigator.language, {
            hour: 'numeric'
        }).format(new Date(0)).match(/AM|PM/i);
        const ordinal = n => {
            const sfx = ['th', 'st', 'nd', 'rd'],
                v = n % 100;
            return n + (sfx[(v - 20) % 10] || sfx[v] || sfx[0]);
        };
        const fmtReadable = d => `${CONSTANTS.MONTHS[d.getUTCMonth()]} ${ordinal(d.getUTCDate())}, ${d.getUTCFullYear()} - ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
        const tzName = (() => {
            try {
                return new Intl.DateTimeFormat('en', {
                    timeZoneName: 'short'
                }).formatToParts(now).find(p => p.type === 'timeZoneName').value;
            } catch (e) {
                return '';
            }
        })();
        const fmtTs = ts => {
            const d = new Date(ts * 1000);
            const utcStr = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`;
            const lH = d.getHours(),
                lM = String(d.getMinutes()).padStart(2, '0'),
                lS = String(d.getSeconds()).padStart(2, '0');
            const localStr = use24h ? `${String(lH).padStart(2, '0')}:${lM}:${lS}` : `${lH % 12 || 12}:${lM}:${lS}${lH >= 12 ? 'pm' : 'am'}`;
            return `${utcStr} / ${localStr}${tzName ? ` ${tzName}` : ''}`;
        };
        const exportStorage = JSON.parse(JSON.stringify(s));
        // Per-item-code all-history usage totals for the export meta, nested by category group
        // ("Energy Items" / "Happy Items"). Every tracked code is listed even when unused (0).
        const itemTotals = {};
        Object.keys(ITEM_LOG_META).forEach(id => {
            const m = ITEM_LOG_META[id];
            const g = ITEM_GROUP_LABELS[m.group] || 'Other Items';
            if (!itemTotals[g]) itemTotals[g] = {};
            itemTotals[g][m.label] = 0;
        });
        (exportStorage.series || []).forEach(e => {
            if (typeof e.gain === 'number') e.gain = r2(e.gain);
            if (typeof e.after === 'number') e.after = r2(e.after);
            if (e.type === 'item' && ITEM_LOG_META[e.logId]) {
                const m = ITEM_LOG_META[e.logId];
                itemTotals[ITEM_GROUP_LABELS[m.group] || 'Other Items'][m.label]++;
            }
        });
        const getUtcDay = ts => {
            const d = new Date(ts * 1000);
            return {
                label: `${CONSTANTS.MONTHS[d.getUTCMonth()]} ${ordinal(d.getUTCDate())}, ${d.getUTCFullYear()}`,
                key: `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
            };
        };
        const getLocalDay = ts => {
            const d = new Date(ts * 1000);
            return {
                label: `${CONSTANTS.MONTHS[d.getMonth()]} ${ordinal(d.getDate())}, ${d.getFullYear()}`,
                key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
            };
        };
        const log = [];
        let curDayObj = null,
            prevLocalKey = null;
        [...(exportStorage.series || [])].reverse().forEach(e => {
            const utc = getUtcDay(e.ts),
                local = getLocalDay(e.ts);
            if (!curDayObj || utc.key !== curDayObj._k) {
                curDayObj = {
                    day: `${utc.label} - UTC`,
                    _k: utc.key,
                    _lk: new Set(),
                    entries: []
                };
                log.push(curDayObj);
                prevLocalKey = null;
            }
            if (prevLocalKey !== null && local.key !== prevLocalKey) curDayObj.entries.push(`── ${local.label} (${tzName}) ──`);
            else if (prevLocalKey === null && utc.key !== local.key) curDayObj.entries.push(`── ${local.label} (${tzName}) ──`);
            if (e.type === 'item') {
                // Simple labeled line with the raw timestamp (intentionally not human-readable),
                // plus the captured metric for the item's group.
                const label = (ITEM_LOG_META[e.logId] && ITEM_LOG_META[e.logId].label) || `Item ${e.logId}`;
                const entry = { [label]: e.ts };
                if (e.energy) entry.e = e.energy;
                if (e.happy) entry.happy = e.happy;
                if (e.statKey) {
                    entry.stat = e.statKey;
                    entry.gain = e.statGain;
                }
                curDayObj.entries.push(entry);
            } else {
                curDayObj.entries.push({
                    at: fmtTs(e.ts),
                    ts: e.ts,
                    stat: e.stat,
                    gain: r2(e.gain),
                    cost: e.cost,
                    after: r2(e.after),
                    ...(e.rate !== undefined ? {
                        rate: e.rate
                    } : {})
                });
            }
            curDayObj._lk.add(local.key);
            prevLocalKey = local.key;
        });
        log.forEach(d => {
            if (d._lk && d._lk.size === 1 && [...d._lk][0] === d._k) d.day = d.day.replace(' - UTC', ` - UTC/${tzName}`);
            delete d._k;
            delete d._lk;
        });
        exportStorage.series = log;
        const achievements = computeAchievements(getActiveHistory());
        const cleanCfg = {};
        ALLOWED_CONFIG_KEYS.forEach(k => {
            if (userConfig[k] !== undefined) {
                // Export privacyAgreed as its raw ISO value (NOT reformatted) so the install date
                // survives an export/import round-trip; reformatting it produced an unparseable
                // string that corrupted the stored value.
                cleanCfg[k] = userConfig[k];
            }
        });
        const stickers = exportStorage?.meta?.stickers;
        if (exportStorage.meta) delete exportStorage.meta.stickers;
        // syncFloor is device-local live-sync state; dropping it means a fresh import does one
        // unbounded (self-healing) reconcile, then re-anchors from the imported data.
        if (exportStorage.meta) delete exportStorage.meta.syncFloor;
        let content = JSON.stringify({
            meta: {
                version: SCRIPT_VERSION,
                exportedAt: fmtReadable(now),
                itemTotals
            },
            config: cleanCfg,
            achievements,
            storage: exportStorage,
            _s: stickers ? JSON.stringify(stickers) : undefined
        }, null, 2);
        content = content.replace(/\{\n(\s+)"at": ("[^"]*"),\n\s+"ts": (\d+),\n\s+"stat": ("[^"]*"),\n\s+"gain": ([\d.]+),\n\s+"cost": (\d+),\n\s+"after": ([\d.]+)(?:,\n\s+"rate": ([\d.]+))?\n\s+\}/g, (m, sp, la, ts, st, g, co, a, r) => {
            let o = '{"at": ' + la + ', "ts": ' + ts + ',\n' + sp + '"stat": ' + st + ',\n' + sp + '"gain": ' + g + ', "cost": ' + co + ',\n' + sp + '"after": ' + a;
            if (r) o += ', "rate": ' + r;
            return o + '}';
        });
        // Collapse the simple item lines to one line each, mirroring the gym-line collapse above.
        // Each is a flat object keyed by the item label plus optional metric fields (e/happy/stat+
        // gain), so just squash the internal whitespace.
        const itemLineLabels = Object.values(ITEM_LOG_META).map(m => m.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        content = content.replace(new RegExp('\\{\\n\\s+"(' + itemLineLabels + ')":[^}]*\\}', 'g'), m => m.replace(/\s*\n\s*/g, ' '));
        content = content.replace(/\},(\ *\n\ +)\{"at":/g, '},\n$1{"at":');
        content = content.replace(/\},(\ *\n([ ]+))"\u2500/g, '},\n\n$2"\u2500');
        content = content.replace(/\u2500",(\ *\n([ ]+))\{"at":/g, '\u2500",\n\n$2{"at":');
        content = content.replace(/"meta": \{\n\s+"version": "([^"]+)",\n\s+"exportedAt": "([^"]+)"\n\s+\}/, '"meta": {"version": "$1", "exportedAt": "$2"}');
        content = content.replace(/"config": \{([\s\S]*?)\n\s+\}(?=,\n\s+"achievements")/, (m, inner) => '"config": {' + inner.replace(/\n\s+/g, ' ').trimStart() + '}');
        try {
            const f = new File([content], filename, {
                type: 'text/plain'
            });
            if (navigator.canShare && navigator.canShare({
                    files: [f]
                }) && window.innerWidth <= 800) {
                await navigator.share({
                    title: filename,
                    files: [f]
                });
                return;
            }
        } catch (e) {}
        const blob = new Blob([content], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 3000);
    }

    function importData(f, onDone, opts = {}) {
        if (!f) {
            if (onDone) onDone(false);
            return;
        }
        const silent = !!opts.silent;
        const r = new FileReader();
        r.onload = async (e) => {
            let ok = false;
            try {
                const j = JSON.parse(e.target.result);
                const val = validateImportSchema(j);
                if (!val.ok) {
                    if (!silent) alert(`Import Failed: ${val.msg}`);
                    if (onDone) onDone(false);
                    return;
                }
                if (j.storage) {
                    j.storage = sanitizeStorageRecord(j.storage);
                    if (j.storage.series && j.storage.series.length && j.storage.series[0] && j.storage.series[0].day) {
                        // Reverse map: exported item lines are labeled ({"Xanax Taken": <ts>} with an
                        // optional "e" for energy). Convert them back to canonical item entries.
                        const labelToItem = {};
                        Object.keys(ITEM_LOG_META).forEach(id => {
                            labelToItem[ITEM_LOG_META[id].label] = { logId: Number(id), energy: !!ITEM_LOG_META[id].energy };
                        });
                        j.storage.series = j.storage.series.flatMap(d => (d.entries || []).filter(e => typeof e === 'object' && e !== null)).reverse();
                        j.storage.series = j.storage.series.map(e => {
                            // New-style labeled item line: no ts/stat, single label key (+ optional e).
                            if (e && e.ts === undefined && e.stat === undefined) {
                                const k = Object.keys(e).find(key => key !== 'e' && labelToItem[key]);
                                if (k) {
                                    const m = labelToItem[k];
                                    const out = { type: 'item', logId: m.logId, ts: e[k] };
                                    if (e.e !== undefined) out.energy = e.e;
                                    return out;
                                }
                            }
                            delete e.at;
                            delete e.loggedAt;
                            return e;
                        });
                    }
                    const importedMeta = j.storage.meta || {};
                    let stickers = importedMeta.stickers || j._s;
                    if (typeof stickers === 'string') {
                        try {
                            stickers = JSON.parse(stickers);
                        } catch (e) {}
                    }
                    if (!stickers) stickers = {};
                    j.storage.meta.stickers = stickers;
                    await DBManager.setStorage(j.storage);
                    const rebuilt = DataController._rebuildFromSeries(j.storage.series || [], (j.storage.meta && j.storage.meta.baselineBreakdown) || ZERO_BREAKDOWN);
                    _historyCache = {
                        meta: {
                            ...importedMeta,
                            stickers
                        },
                        history: rebuilt.history,
                        today: rebuilt.today
                    };
                    if (j.config && typeof j.config === 'object') {
                        ALLOWED_CONFIG_KEYS.forEach(k => {
                            if (j.config[k] !== undefined) userConfig[k] = j.config[k];
                        });
                        if (!userConfig.privacyAgreed || isNaN(Date.parse(userConfig.privacyAgreed))) {
                            userConfig.privacyAgreed = new Date().toISOString();
                        }
                        saveConfig();
                    }
                    try {
                        const importedVer = (j && j.meta && j.meta.version) ? String(j.meta.version) : '';
                        const curSeen = localStorage.getItem(KEYS.CHANGELOG_VER);
                        if (!curSeen) {
                            if (importedVer) localStorage.setItem(KEYS.CHANGELOG_VER, importedVer);
                            else if (SCRIPT_VERSION) localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
                        }
                        const seenNow = localStorage.getItem(KEYS.CHANGELOG_VER);
                        if (SCRIPT_VERSION && seenNow && seenNow !== SCRIPT_VERSION) {
                            localStorage.setItem(KEYS.CHANGELOG_NOTIF, '1');
                            syncChangelogNotif(true);
                        }
                    } catch (e) {}
                    DataController.invalidate();
                    calendarState.selectedData = null;
                    calendarState.selectedLabel = null;
                    viewState.activeViewLabel = null;
                    ok = true;
                    if (!silent) renderPanelContent();
                    if (!silent) alert("Training Data Imported Successfully.");
                } else if (!silent) alert("Error: No valid training data found.");
            } catch (err) {
                if (!silent) alert("Error importing file: " + (err.message === "Database not initialized" ? "Database not initialized.\n\nRecommendation: Refresh the page and ensure your browser is not blocking local storage for Torn.com." : "Invalid JSON format."));
            }
            const inp = document.getElementById('import-file');
            if (inp) inp.value = '';
            const inp2 = document.getElementById('init-import-file');
            if (inp2) inp2.value = '';
            if (onDone) onDone(ok);
        };
        r.readAsText(f);
    }

    function importDataFromWelcome(f) {
        importData(f, async (success) => {
            if (!success) return;
            refreshInitLock();
            if (!userConfig.apiKey) {
                renderPanelContent();
                const wv = dom.welcomeView;
                if (wv && wv.classList.contains('active-view')) refreshInitMask(wv);
                return;
            }
            try {
                const res = await fetch(`https://api.torn.com/user/?selections=battlestats,log&log=5300&key=${userConfig.apiKey}`);
                const data = await res.json();
                if (data.error) {
                    alert(`Saved API key is no longer valid: ${data.error.error}\n\nPlease enter a new key to continue.`);
                    userConfig.apiKey = '';
                    saveConfig();
                    refreshInitLock();
                    renderPanelContent();
                    const wv = dom.welcomeView;
                    if (wv && wv.classList.contains('active-view')) {
                        refreshInitMask(wv);
                        const iak = wv.querySelector('#init-api-key');
                        if (iak) iak.value = '';
                    }
                    return;
                }
                localStorage.setItem('bbgl_initialized', '1');
                refreshInitLock();
                calendarState.selectedData = null;
                calendarState.selectedLabel = Formatter.dateLogical();
                viewState.activeViewLabel = null;
                switchView('ledger');
                syncWithFeedback('FULL_SYNC');
            } catch (e) {
                alert("Network error during API key verification. Please try again.");
                renderPanelContent();
                const wv = dom.welcomeView;
                if (wv && wv.classList.contains('active-view')) refreshInitMask(wv);
            }
        }, {
            silent: true
        });
    }
    async function clearData() {
        if (confirm("⚠️ CLEAR LOG HISTORY? ⚠️\n\nThis will permanently delete your training data.\n\nUse 'Export Log' before proceeding to preserve it.")) {
            await DBManager.clearStorage();
            const keep = [KEYS.CONFIG, KEYS.STATE];
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (k && k.startsWith('bbgl_') && k !== KEYS.STORAGE && !keep.includes(k)) localStorage.removeItem(k);
            }
            sessionStorage.removeItem(KEYS.SESSION);
            sessionStorage.removeItem(KEYS.SESSION_CACHE);
            DataController.invalidate();
            _historyCache = null;
            calendarState.selectedData = null;
            calendarState.selectedLabel = null;
            viewState.activeViewLabel = null;
            runtime.apiCallTotal = 0;
            runtime.stickerSlots = [];
            renderPanelContent();
            alert("History cleared.");
        }
    }
    // [TEMP — delete before full release]
    async function factoryReset() {
        await DBManager.clearStorage();
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith('bbgl_')) localStorage.removeItem(k);
        }
        sessionStorage.removeItem(KEYS.SESSION);
        sessionStorage.removeItem(KEYS.SESSION_CACHE);
        DataController.invalidate();
        _historyCache = null;
        calendarState.selectedData = null;
        calendarState.selectedLabel = null;
        viewState.activeViewLabel = null;
        runtime.apiCallTotal = 0;
        runtime.stickerSlots = [];
        runtime.currentStats = null;
        runtime._achPage = 0;
        const _fresh = { apiKey: '', dayStartMode: 'utc', weekStartMode: 'mon', animations: true, buttonLocation: 'both', ratesEnabled: true, bestGym: true, bestGymSpecialist: true, bestGymUnpurchased: true, drugTracker: 'xanax', privacyAgreed: '', configVersion: REQUIRED_CONFIG_VERSION };
        ALLOWED_CONFIG_KEYS.forEach(k => { userConfig[k] = _fresh[k] !== undefined ? _fresh[k] : userConfig[k]; });
        saveConfig();
        localStorage.setItem(KEYS.CHANGELOG_NOTIF, '1');
        runtime.wasVersionWiped = true;
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
    const BestGymController = {
        _suppressed: {},
        // Reads Torn's React fiber props off a gym button to find its { id, status, ... } item.
        // Purchase state lives only in these props (status 'newSeen' = unlocked but not bought),
        // so this lets us know ownership with zero clicks / no flicker.
        _reactItem(btn) {
            try {
                const key = Object.keys(btn).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'));
                let f = btn[key],
                    depth = 0;
                while (f && depth < 16) {
                    const pp = f.memoizedProps;
                    if (pp && pp.item && pp.item.id != null && pp.item.status) return pp.item;
                    f = f.return;
                    depth++;
                }
            } catch (e) {}
            return null;
        },
        scanGyms() {
            const root = document.getElementById('gymroot') || document;
            const result = {
                gyms: {},
                active: null
            };
            root.querySelectorAll("button[class*='gymButton']").forEach((btn) => {
                const icon = btn.querySelector("[class*='gym-']");
                if (!icon) return;
                const match = /gym-(\d+)/.exec(icon.getAttribute('class') || '');
                if (!match) return;
                const id = parseInt(match[1], 10);
                if (!id || result.gyms[id]) return;
                const cls = ' ' + (btn.getAttribute('class') || '') + ' ';
                const locked = /\s(?:locked|inProgress)/i.test(cls);
                const active = /\sactive/i.test(cls);
                const item = this._reactItem(btn);
                const status = item ? item.status : null;
                // owned = purchased: 'active' (training there) or 'available' (can ACTIVATE).
                // 'newSeen' = unlocked but unpurchased (BUY). If status is unreadable, owned stays
                // false so the unpurchased filter errs on the safe side (won't auto-switch there).
                const owned = status === 'active' || status === 'available';
                result.gyms[id] = {
                    id: id,
                    btn: btn,
                    locked: locked,
                    active: active,
                    status: status,
                    owned: owned
                };
                if (active) result.active = id;
            });
            return result;
        },
        bestGymFor(stat, scan) {
            const tiers = GYM_TIERS[stat];
            if (!tiers) return null;
            // Rank = index of the tie-group containing the gym (gyms in the same group share
            // identical gym points). -1 if the gym gives nothing for this stat.
            const rankOf = (id) => {
                for (let i = 0; i < tiers.length; i++) {
                    const g = tiers[i];
                    if (Array.isArray(g) ? g.indexOf(id) !== -1 : g === id) return i;
                }
                return -1;
            };
            const allowSpec = userConfig.bestGymSpecialist;
            const allowUnpurchased = userConfig.bestGymUnpurchased;
            // Seed with the active gym's rank so we only ever pick a STRICTLY higher group —
            // never switch sideways to a gym with the same gym points.
            let bestId = null,
                bestRank = scan.active != null ? rankOf(scan.active) : -1;
            Object.keys(scan.gyms).forEach((key) => {
                const gym = scan.gyms[key];
                if (gym.locked) return;
                if (!allowSpec && gym.id >= 25) return;
                if (!allowUnpurchased && !gym.owned) return;
                const rank = rankOf(gym.id);
                if (rank > bestRank) {
                    bestRank = rank;
                    bestId = gym.id;
                }
            });
            return bestId;
        },
        swapToGym(gym) {
            try {
                gym.btn.click();
                return true;
            } catch (e) {
                Log.warn('BestGym: gym switch failed', e);
                return false;
            }
        },
        _statFromLabel(label) {
            if (label === 'Train strength') return 'str';
            if (label === 'Train defense') return 'def';
            if (label === 'Train speed') return 'spd';
            if (label === 'Train dexterity') return 'dex';
            return null;
        },
        handleTrainClick(e) {
            if (!userConfig.bestGym) return false;
            const btn = e.target && e.target.closest ? e.target.closest('button') : null;
            if (!btn) return false;
            const stat = this._statFromLabel(btn.getAttribute('aria-label') || '');
            if (!stat || this._suppressed[stat]) return false;
            const scan = this.scanGyms();
            const best = this.bestGymFor(stat, scan);
            if (!best || best === scan.active) return false;
            const gym = scan.gyms[best];
            if (!gym || !this.swapToGym(gym)) return false;
            e.preventDefault();
            e.stopImmediatePropagation();
            this._suppressed[stat] = true;
            return true;
        }
    };

    /**
     *  [SECTION VI] THE GYM EQUIPMENT (UI Layer)
     *  ========================================================================
     *  Whether you use it for a day or you use it for ten years:
     *  You should still get a Tetanus Booster!
     */

    function renderPanelContent() {
        const s = getActiveHistory(),
            dm = DataController.getDateMap(),
            tk = Formatter.dateLogical();
        if ((s.today.startTotal > 0 || s.today.date) && !dm[tk]) dm[tk] = s.today;
        const c = dom.calContainer;
        if (!c) return;
        Perf.start('renderPanel');
        c.innerHTML = '';
        const y = calendarState.year,
            m = calendarState.month,
            yt = dom.yearTrigger;
        dom.monthTrigger.textContent = CONSTANTS.MONTHS[m];
        yt.textContent = y;
        yt.classList.remove('disabled');
        let f = new Date(y, m, 1),
            start = f.getDay();
        if (start === -1) start = 6;
        if (userConfig.weekStartMode === 'mon') start = (start === 0) ? 6 : start - 1;
        const dim = new Date(y, m + 1, 0).getDate(),
            dipm = new Date(y, m, 0).getDate();
        let pm = m - 1,
            py = y;
        if (pm < 0) {
            pm = 11;
            py--;
        }
        let cells = [];
        for (let i = 0; i < start; i++) cells.push({
            y: py,
            m: pm,
            d: dipm - start + i + 1,
            g: true
        });
        for (let d = 1; d <= dim; d++) cells.push({
            y: y,
            m: m,
            d: d,
            g: false
        });
        let rem = 7 - (cells.length % 7);
        if (rem < 7 && rem > 0) {
            let nm = m + 1,
                ny = y;
            if (nm > 11) {
                nm = 0;
                ny++;
            }
            for (let i = 1; i <= rem; i++) cells.push({
                y: ny,
                m: nm,
                d: i,
                g: true
            });
        }
        calendarState.visibleCells = cells.map(z => Formatter.dateISO(z.y, z.m, z.d));
        c.style.setProperty('--total-rows', 6);
        c.style.setProperty('--bg-url', 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-grid-futr.jpg)');
        const todayStr = Formatter.dateLogical();
        const frag = document.createDocumentFragment();
        let batch = [],
            ridx = 0;
        cells.forEach(function tickCalendarCell(z) {
            const ds = Formatter.dateISO(z.y, z.m, z.d),
                d = dm[ds] || null;
            batch.push({
                ...z,
                p: d
            });
            if (batch.length === 7) {
                const rd = document.createElement('div'),
                    last = batch[6],
                    weekEndStr = Formatter.dateISO(last.y, last.m, last.d),
                    isArch = weekEndStr < todayStr;
                rd.className = 'bbgl-row-slice' + (isArch ? ' bbgl-row-archived' : '');
                rd.style.setProperty('--row-idx', ridx);
                if (isArch) rd.style.setProperty('--bg-url', 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-grid-past.jpg)');
                let wdb = [];
                batch.forEach(function tickWeekCell(i, cIdx) {
                    renderCell(rd, i.y, i.m, i.d, i.g, ridx, cIdx);
                    wdb.push({
                        date: Formatter.dateISO(i.y, i.m, i.d),
                        data: i.p
                    });
                });
                frag.appendChild(rd);
                injectWeeklyBar(frag, wdb);
                batch = [];
                ridx++;
            }
        });
        c.appendChild(frag);
        const tp = dom.topPanel;
        if (tp) {
            if (tp.classList.contains('viewing-graph')) GraphController.draw();
            else if (tp.classList.contains('viewing-stickers')) renderStickers();
            else if (tp.classList.contains('viewing-achievements')) renderAchievements();
        }
        if (!calendarState.selectedData) renderStats(DataController.getSlice('DAY', Formatter.dateLogical()), Formatter.dateLogical());
        else renderStats(calendarState.selectedData, calendarState.selectedLabel);
        dom.monthTrigger.setAttribute('data-tooltip-html', generateRichTooltip(DataController.getSlice('MONTH', CONSTANTS.MONTHS[m], y)));
        yt.setAttribute('data-tooltip-html', generateRichTooltip(DataController.getSlice('YEAR', String(y))));
        Perf.end('renderPanel');
    }

    function renderCell(cont, y, m, d, g, rIdx, cIdx) {
        const ds = Formatter.dateISO(y, m, d),
            sl = DataController.getSlice('DAY', ds),
            isFlipped = cont.classList.contains('bbgl-row-archived'),
            cell = document.createElement('div');
        cell.className = 'bbgl-day-cell' + (isFlipped ? ' is-archived' : '') + (g ? ' ghost-cell' : '');
        cell.dataset.date = ds;
        cell.addEventListener('mouseenter', () => {
            if (userConfig.animations) cell.classList.add('shimmer-active');
        });
        cell.addEventListener('mouseleave', () => {
            if (!cell.classList.contains('is-viewing')) cell.classList.remove('shimmer-active');
        });
        const isToday = (ds === Formatter.dateLogical());
        if (isFlipped && sl.meta.tier > 0) {
            let url = 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-grid-grn.jpg)';
            if (sl.meta.tier === 2) url = 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-grid-gold.jpg)';
            else if (sl.meta.tier === 3) url = 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/cal-grid-dmnd.jpg)';
            cell.style.backgroundImage = url;
            cell.style.backgroundSize = "700% 600%";
            cell.style.backgroundPosition = `${(cIdx * (100 / 6)).toFixed(4)}% ${(rIdx * (100 / 5)).toFixed(4)}%`;
        }
        if (!isFlipped && sl.meta.tier > 0) {
            const wrap = document.createElement('div'),
                img = document.createElement('img'),
                sh = document.createElement('div');
            let tType = 'green',
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/rwrd-grn.png';
            if (sl.meta.tier === 2) {
                tType = 'gold';
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/rwrd-gold.png';
            } else if (sl.meta.tier === 3) {
                tType = 'diamond';
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/rwrd-dmnd.png';
            }
            wrap.className = `jewel-wrapper jewel-type-${tType}`;
            img.className = 'jewel-asset';
            img.src = url;
            if (sl.meta.tier === 2) {
                sh.className = 'jewel-shine';
                sh.style.maskImage = `url("${url}")`;
                sh.style.webkitMaskImage = `url("${url}")`;
                wrap.appendChild(img);
                wrap.appendChild(sh);
            } else {
                sh.className = 'jewel-shine';
                sh.style.maskImage = `url("${url}")`;
                sh.style.webkitMaskImage = `url("${url}")`;
                const so = document.createElement('div');
                so.className = 'jewel-shine-over';
                so.style.setProperty('--jewel-mask', `url("${url}")`);
                wrap.appendChild(sh);
                wrap.appendChild(img);
                wrap.appendChild(so);
            }
            cell.appendChild(wrap);
            cell.classList.add('is-plate');
        }
        const ns = document.createElement('span');
        ns.className = 'day-num';
        ns.innerText = d;
        cell.appendChild(ns);
        if (isFlipped && sl.meta.tier > 0) {
            const item = DataController.getStickerMap().get(ds);
            if (item) {
                const uid = Math.floor(new Date(Date.UTC(y, m, d)).getTime() / 86400000);
                const sw = document.createElement('div'),
                    si = document.createElement('img'),
                    ss = document.createElement('div');
                sw.className = 'sticker-wrapper' + (sl.meta.tier === 3 ? ' sticker-tier-diamond' : '');
                sw.style.setProperty('--rot', `${(uid * 17) % 21 - 10}deg`);
                si.src = item.url;
                si.className = 'cell-sticker-deco';
                sw.appendChild(si);
                ss.className = 'sticker-shine';
                ss.style.webkitMaskImage = `url("${item.url}")`;
                ss.style.maskImage = `url("${item.url}")`;
                let grad = `linear-gradient(115deg,rgba(0,200,150,0.55) 0%,rgba(0,255,180,0.65) 20%,rgba(0,255,255,0.7) 35%,rgba(255,255,255,0.75) 50%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(0,200,150,0.85) 100%)`;
                if (sl.meta.tier === 2) grad = `linear-gradient(115deg,rgba(184,134,11,0.7) 0%,rgba(212,175,55,0.85) 11%,rgba(255,255,240,1.0) 13%,rgba(212,175,55,0.8) 15%,rgba(0,255,255,0.7) 35%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(184,134,11,0.85) 100%)`;
                else if (sl.meta.tier === 3) grad = `linear-gradient(115deg,rgba(0,255,255,0.85) 0%,rgba(200,100,255,0.85) 5%,rgba(255,0,255,0.85) 10%,rgba(0,150,255,0.85) 15%,rgba(0,255,255,0.75) 35%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(0,255,255,0.85) 85%,rgba(200,100,255,0.85) 90%,rgba(255,0,255,0.85) 95%,rgba(0,150,255,0.85) 100%)`;
                ss.style.backgroundImage = grad;
                ss.style.mixBlendMode = "overlay";
                if (sl.meta.tier >= 2) ss.style.filter = "brightness(1.5)";
                sw.appendChild(ss);
                cell.appendChild(sw);
                if (DataController._cache.featuredDays && DataController._cache.featuredDays.has(ds) && !DataController.isStickerCleared(item.id)) {
                    const pi = document.createElement('div');
                    pi.className = 'new-sticker-post-it';
                    pi.onclick = (e) => {
                        e.stopPropagation();
                        cell.style.setProperty('overflow', 'visible', 'important');
                        cell.style.setProperty('z-index', '100', 'important');
                        pi.classList.add('post-it-rip');
                        DataController.markStickerCleared(item.id);
                        setTimeout(() => {
                            if (pi.parentNode) pi.remove();
                            cell.style.removeProperty('overflow');
                            cell.style.removeProperty('z-index');
                            cell.click();
                        }, 600);
                    };
                    cell.appendChild(pi);
                }
            }
        }
        if (isToday) cell.id = `active-date-today`;
        if ((calendarState.selectedLabel === ds) || (!calendarState.selectedLabel && isToday)) cell.classList.add('is-viewing');
        const h = getActiveHistory();
        const tl = DataController.getTimeline();
        const firstDate = tl.length > 0 ? tl[0].date : (h ? h.today.date : null);
        const isInteractive = !sl.meta.isGap || (firstDate && ds >= firstDate && ds <= Formatter.dateLogical());
        if (isInteractive) cell.setAttribute('data-tooltip-html', generateRichTooltip(sl));
        else cell.setAttribute('data-tooltip', TOOLTIPS.CELL_DATE(ds));
        cell.onclick = () => {
            if (isToday) closeHistory();
            else if (isInteractive) openHistory(sl, ds);
        };
        cont.appendChild(cell);
        if (isInteractive && viewState.activeViewLabel === ds && calendarState.selectedLabel !== ds) openHistory(sl, ds);
    }

    function injectWeeklyBar(cont, batch) {
        const sl = DataController.getSlice('CUSTOM', batch.map(w => w.data).filter(d => d));
        sl.label = `Week ${getISOWeek(batch[0].date)}`;
        sl._weekStart = batch[0].date;
        sl._weekEnd = batch[batch.length - 1].date;
        if (sl._dailyList.length === 0) return;
        const {
            hjDaySet,
            hjWeek
        } = DataController.getHappyJumpData();
        const _wk = getWeekKey(sl._dailyList[0].date);
        const {
            totGreen,
            totGold,
            totDiamond
        } = computeWeekCompletion(sl._dailyList, hjDaySet, hjWeek[_wk] || 0);
        const anchor = document.createElement('div');
        anchor.className = 'bbgl-weekly-anchor';
        const tr = document.createElement('div');
        tr.className = 'bbgl-weekly-track';
        tr.dataset.label = sl.label;
        const tot = totGreen + totGold + totDiamond;
        const goal = tot >= GAME.WEEKLY_GOAL;
        if (goal && userConfig.animations) tr.classList.add('track-polished');
        const todayStr = Formatter.dateLogical();
        const closed = sl._dailyList[sl._dailyList.length - 1].date < todayStr;
        const solid = closed && !goal;
        if (solid) tr.classList.add('track-solidified');
        if (calendarState.selectedLabel === sl.label) tr.classList.add('is-viewing');
        tr.onclick = (e) => {
            e.stopPropagation();
            openHistory(sl, sl.label);
        };
        tr.setAttribute('data-tooltip-html', generateRichTooltip(sl));
        let pctDiamond = Math.min(100, totDiamond / 10);
        let pctGold = Math.min(100 - pctDiamond, totGold / 10);
        let pctGreen = Math.min(100 - pctDiamond - pctGold, totGreen / 10);
        
        let sum = pctGreen + pctGold + pctDiamond;
        if (goal && sum < 100) {
            const deficit = 100 - sum;
            if (pctDiamond > 0) pctDiamond += deficit;
            else if (pctGold > 0) pctGold += deficit;
            else pctGreen += deficit;
        }

        let dLeft = 50 - pctDiamond / 2;
        let dRight = 50 + pctDiamond / 2;
        let goLeft = 100 - pctGold;

        if (dRight > goLeft) {
            dRight = goLeft;
            dLeft = dRight - pctDiamond;
        }

        if (dLeft < 0) {
            dLeft = 0;
            dRight = pctDiamond;
            goLeft = dRight;
            pctGold = 100 - goLeft;
        }

        // Green pushes diamond right, but only into empty space (not into gold)
        if (pctDiamond > 0 && pctGreen > dLeft) {
            const pushNeeded = pctGreen - dLeft;
            const emptyRight = goLeft - dRight;
            const pushAllowed = Math.min(pushNeeded, Math.max(0, emptyRight));
            dLeft += pushAllowed;
            dRight += pushAllowed;
            if (pushAllowed < pushNeeded) pctGreen = dLeft;
        } else if (pctDiamond === 0 && pctGreen > goLeft) {
            pctGreen = goLeft;
        }

        let actualDLeft = dLeft;
        let gRight = pctGreen;
        
        let greenTouchesNext = false;
        let goldTouchesPrev = false;
        if (pctDiamond > 0) {
            if (Math.abs(gRight - dLeft) < 0.01) greenTouchesNext = true;
            if (Math.abs(dRight - goLeft) < 0.01) goldTouchesPrev = true;
        } else {
            if (Math.abs(gRight - goLeft) < 0.01) {
                greenTouchesNext = true;
                goldTouchesPrev = true;
            }
        }
        if (pctGreen > 0) {
            const d = document.createElement('div');
            d.className = `bbgl-seg ${goal ? 'seg-polished' : 'seg-brushed'}-green`;
            d.style.position = 'absolute';
            d.style.left = '0';
            d.style.width = `${pctGreen}%`;
            if (!greenTouchesNext) {
                d.style.borderTopRightRadius = '10px';
                d.style.borderBottomRightRadius = '10px';
            }
            tr.appendChild(d);
        }
        if (pctGold > 0) {
            const d = document.createElement('div');
            d.className = `bbgl-seg ${goal ? 'seg-polished' : 'seg-brushed'}-gold`;
            d.style.position = 'absolute';
            d.style.right = '0';
            d.style.width = `${pctGold}%`;
            if (!goldTouchesPrev) {
                d.style.borderTopLeftRadius = '10px';
                d.style.borderBottomLeftRadius = '10px';
            }
            tr.appendChild(d);
        }
        if (pctDiamond > 0) {
            const d = document.createElement('div');
            d.className = `bbgl-seg ${goal ? 'seg-polished' : 'seg-brushed'}-diamond`;
            d.style.position = 'absolute';
            d.style.left = `${actualDLeft}%`;
            d.style.width = `${pctDiamond}%`;
            if (!greenTouchesNext) {
                d.style.borderTopLeftRadius = '10px';
                d.style.borderBottomLeftRadius = '10px';
            }
            if (!goldTouchesPrev) {
                d.style.borderTopRightRadius = '10px';
                d.style.borderBottomRightRadius = '10px';
            }
            tr.appendChild(d);
        }
        // The numeric X/1000 points readout is suppressed for pre-install weeks, but displays
        // for the install week onward.
        const installWk = runtime.demoMode ? null : getInstallWeekKey();
        if (!installWk || _wk >= installWk) {
            const tl = document.createElement('div');
            tl.className = 'bbgl-track-label';
            tl.textContent = `${tot}/${GAME.WEEKLY_GOAL}`;
            tr.appendChild(tl);
        }
        anchor.appendChild(tr);
        cont.appendChild(anchor);
        if (viewState.activeViewLabel === sl.label && calendarState.selectedLabel !== sl.label) openHistory(sl, sl.label);
    }

    function renderStats(sl, rawLbl) {
        const c = dom.ledgerView;
        if (!c) return;
        if (!sl.stats) sl = DataController._hydrate(sl, [], rawLbl, 'DAY');
        const s = sl.stats,
            isP = sl.resolution !== 'DAY';
        const dEl = dom.dateLabel;
        if (dEl) {
            const isExp = dom.panel.classList.contains('bbgl-expanded') || dom.panel.classList.contains('bbgl-mode-page');
            let l;
            if (sl.resolution === 'WEEK') {
                const start = sl._weekStart || (sl._dailyList && sl._dailyList.length > 0 ? sl._dailyList[0].date : null) || sl.date;
                const end = sl._weekEnd || (sl._dailyList && sl._dailyList.length > 0 ? sl._dailyList[sl._dailyList.length - 1].date : null) || sl.date;
                l = isExp ? `Week of ${Formatter.dateMonthDay(start)} - ${Formatter.dateMonthDay(end)}` : `Week of ${Formatter.dateMonthDay(start)}`;
            } else {
                l = isExp ? Formatter.dateFull(sl.label) : Formatter.datePretty(sl.label);
                if (!l) l = sl.label;
                if (sl.resolution === 'MONTH') {
                    l = sl.label + ' ' + calendarState.year;
                } else if (isExp && isP && sl._dailyList.length > 0 && sl.resolution !== 'ALL') {
                    const endLabel = Formatter.dateMonthDay(sl._dailyList[sl._dailyList.length - 1].date);
                    l += ` (${Formatter.dateMonthDay(sl._dailyList[0].date)} - ${endLabel})`;
                }
            }
            dEl.innerText = l;
        }
        const sumEl = dom.summaryLabel;
        if (sumEl) sumEl.innerHTML = `Total E: ${Formatter.dual(s.total.cost)} <span style="opacity:0.3; margin:0 6px">|</span> Total Gains: ${Formatter.dual(s.total.gain)}`;
        const lm = {
            'STR': 'Strength',
            'DEF': 'Defense',
            'SPD': 'Speed',
            'DEX': 'Dexterity',
            'TOT': 'Total'
        };
        runtime.currentStats = {
            sl,
            s
        };
        // Ledger energy-item counters. Two fixed counters (primary drug per config + Refill) always
        // show when the bar is visible; the avg parens and the dynamic per-item counters are
        // .view-exp / .bbgl-ic-dyn (expanded/page only). Each reads sl.items, which _hydrate
        // aggregates over the slice's period — so an item only appears in the buckets it was used in.
        if (dom.itemCounters) {
            const items = sl.items || {};
            const isDay = sl.resolution === 'DAY';
            const cnt = code => items[code] || 0;
            const shortOf = code => (ITEM_LOG_META[code] && ITEM_LOG_META[code].short) || `#${code}`;
            const drugCode = userConfig.drugTracker === 'lsd' ? 2230 : XANAX_LOG;
            const secondaryCode = userConfig.drugTracker === 'lsd' ? XANAX_LOG : 2230;
            const parts = [];

            // 1. Primary drug (always). Avg/day parens are week+ only, and expanded/page only; daily
            // view shows just the count (a single-day avg changes daily and is confusing).
            let drugSub = '';
            if (!isDay) {
                const days = DataController.periodCalendarDays(sl);
                const drugAvg = days > 0 ? cnt(drugCode) / days : 0;
                drugSub = sl.resolution === 'ALL' ? '' : `<span class="bbgl-ic-sub view-exp">(${drugAvg.toFixed(2)})</span>`;
            }
            const nameOf = (c) => {
                if (c === 2290) return 'Xanax';
                if (c === 2230) return 'LSD';
                if (c === 2040) return 'Cans';
                if (c === 2190) return 'FHC';
                if (c === 8981) return 'Eggs';
                return shortOf(c);
            };
            const isAll = sl.resolution === 'ALL';
            const drugTip = `<div style="text-align:center">${nameOf(drugCode)} Taken` + ((!isDay && !isAll) ? `<br><span class="tt-sub">(Avg/Day)</span>` : ``) + `</div>`;
            parts.push(`<span class="bbgl-ic" data-tooltip-html='${drugTip}'>${shortOf(drugCode)}: ${cnt(drugCode)}${drugSub}</span>`);

            // 2. Dynamic energy counters (expanded/page only via .bbgl-ic-dyn), only when used.
            // Order: Cans → FHC → secondary drug → Egg (most common to least common).
            [ECAN_LOG, 2190, secondaryCode, 8981].forEach(code => {
                const c = cnt(code);
                if (c <= 0) return;
                const sub = (code === ECAN_LOG && sl.resolution !== 'ALL') ? `<span class="bbgl-ic-sub">(+${Math.round(sl.ecanEnergy || 0)})</span>` : '';
                let dynTip = '';
                if (code === ECAN_LOG) {
                    dynTip = `<div style="text-align:center">Cans Used` + (!isAll ? `<br><span class="tt-sub">(Energy Gained)</span>` : ``) + `</div>`;
                } else {
                    dynTip = `<div style="text-align:center">${nameOf(code)} Used</div>`;
                }
                parts.push(`<span class="bbgl-ic bbgl-ic-dyn" data-tooltip-html='${dynTip}'>${shortOf(code)}: ${c}${sub}</span>`);
            });

            // 3. Refill (always, last): daily = used-today check; week+ = used/calendar-days ratio.
            const refills = cnt(4900);
            const refillVal = isDay ?
                (refills > 0 ? `<span class="bbgl-ic-yes">✓</span>` : `<span class="bbgl-ic-no">✗</span>`) :
                `${refills}`;
            const refillTip = `<div style="text-align:center">Refills Used</div>`;
            parts.push(`<span class="bbgl-ic" data-tooltip-html='${refillTip}'>Refill: ${refillVal}</span>`);

            dom.itemCounters.innerHTML = parts.join('');
        }
        const todayStr = Formatter.dateLogical();
        const slLastDate = sl._dailyList && sl._dailyList.length > 0 ? sl._dailyList[sl._dailyList.length - 1].date : sl.date;
        const isCurrentPeriod = sl.resolution === 'ALL' || slLastDate >= todayStr;
        const col = (lc, k, cl) => {
            const d = s[k],
                ft = lm[lc] || lc;
            let rh = '',
                rt = '';
            const fmtR = (n) => {
                if (!n && n !== 0) return '0';
                const a = Math.abs(n);
                if (a >= 1e15) return (n / 1e15).toFixed(4) + 'q';
                if (a >= 1e12) return (n / 1e12).toFixed(4) + 't';
                if (a >= 1e9) return (n / 1e9).toFixed(4) + 'b';
                if (a >= 100) return Math.round(n).toLocaleString('en-US');
                return n.toFixed(1);
            };
            const mkTip = (r1, r2, pct, sg) => `<div style='text-align:center;line-height:1.6'><div style='margin-bottom:0px'>Growth Rate</div><div style='font-size:0.85em;opacity:0.35;margin-bottom:3px'>(Gains/150E)</div><div>${fmtR(r1)} \u2192 ${fmtR(r2)}</div><div style='font-size:0.85em;color:#aaa'>${sg}${Math.round(pct)}%</div></div>`;
            if (isP && k !== 'total') {
                let th = `<span style="opacity:0.3">--</span>`;
                if (userConfig.ratesEnabled && sl._dailyList.length > 0) {
                    const _fpd = new Date(sl._dailyList[0].date + 'T00:00:00Z');
                    _fpd.setUTCDate(_fpd.getUTCDate() - 1);
                    const r1 = DataController.getHistoricalRate(_fpd.toISOString().slice(0, 10), k),
                        r2 = DataController._hydrate(sl._dailyList[sl._dailyList.length - 1], [], '', 'DAY').stats[k].rate,
                        del = r2 - r1,
                        sg = del >= 0 ? '+' : '',
                        pct = r1 > 0 ? ((r2 - r1) / r1) * 100 : 0;
                    th = `<div class="rates-group" style="display:flex;flex-direction:column;align-items:center;line-height:1.1"><span>${sg}${Formatter.achGain(del)}</span><span class="view-exp rate-pct" style="font-size:0.8em;opacity:0.7;margin-top:2px;margin-bottom:-2px;">(${sg}${Formatter.ratePct(pct)}%)</span></div>`;
                    rt = mkTip(r1, r2, pct, sg);
                }
                rh = userConfig.ratesEnabled ? th : '';
            } else {
                if (userConfig.ratesEnabled && k !== 'total') {
                    const _pd = new Date(sl.date + 'T00:00:00Z');
                    _pd.setUTCDate(_pd.getUTCDate() - 1);
                    const r1 = DataController.getHistoricalRate(_pd.toISOString().slice(0, 10), k),
                        r2 = d.rate,
                        del = r2 - r1,
                        sg = del >= 0 ? '+' : '',
                        pct = r1 > 0 ? (del / r1) * 100 : 0;
                    rh = userConfig.ratesEnabled ? Formatter.dual(d.rate, true) : '';
                    rt = mkTip(r1, r2, pct, sg);
                } else {
                    rh = userConfig.ratesEnabled ? Formatter.dual(d.rate, true) : '';
                    rt = `Growth Rate (Gains / 150E)`;
                }
            }
            return `<div class="stat-column" data-copy-stat="${k}"><div class="col-header cell-stack"><div class="l-top c-label ${cl} bbgl-copy-label" data-tooltip="Click to copy ${ft} data" style="cursor:pointer"><span class="view-std">${lc}</span><span class="view-exp">${ft}</span></div><div class="l-bot" data-tooltip="${isP ? `Energy Used on ${ft}` : `Energy Used`}">${Formatter.dual(d.cost)} E</div></div><div class="bbgl-spacer"></div><div class="col-data-block cell-stack c-gain"><div class="l-top" data-tooltip="${ft} Gained">+${Formatter.dual(d.gain)}</div><div class="l-bot" data-tooltip="${rt}">${rh}</div></div><div class="bbgl-spacer"></div><div class="col-data-block cell-stack c-total"><div class="l-top" data-tooltip="${isCurrentPeriod ? 'Current' : 'Ending'} ${ft}">${Formatter.dual(d.end)}</div><div class="l-bot" data-tooltip="Starting ${ft}">${Formatter.dual(d.start)}</div></div></div>`;
        };
        c.innerHTML = ` ${col('STR', 'str', 't-str')} ${col('DEF', 'def', 't-def')} ${col('SPD', 'spd', 't-spd')} ${col('DEX', 'dex', 't-dex')} `;
    }

    function generateRichTooltip(sl) {
        const f = Formatter.abbr,
            fg = (n) => (n > 0 ? '+' : '') + f(n),
            s = sl.stats;
        const MOS = CONSTANTS.MONTHS_SHORT;
        let lbl;
        if (sl.resolution === 'DAY') {
            const d = Formatter.parse(sl.date);
            lbl = `${MOS[d.getUTCMonth()]} ${d.getUTCDate()} • ${d.getUTCFullYear()}`;
        } else if (sl.resolution === 'WEEK') {
            if (sl._weekStart && sl._weekEnd) {
                const dS = Formatter.parse(sl._weekStart);
                lbl = `Week of ${MOS[dS.getUTCMonth()]} ${dS.getUTCDate()} • ${dS.getUTCFullYear()}`;
            } else {
                lbl = sl.label || Formatter.datePretty(sl.date);
            }
        } else if (sl.resolution === 'MONTH') {
            const mIdx = CONSTANTS.MONTHS.indexOf(sl.label);
            const year = sl._dailyList && sl._dailyList.length > 0 ? sl._dailyList[0].date.slice(0, 4) : (sl.date ? sl.date.slice(0, 4) : String(calendarState.year));
            lbl = `${mIdx >= 0 ? MOS[mIdx] : sl.label} • ${year}`;
        } else if (sl.resolution === 'YEAR') {
            const days = sl._dailyList ? sl._dailyList.filter(d => d.eSpent && d.eSpent.total > 0).length : 0;
            lbl = `${days} Day${days !== 1 ? 's' : ''} • ${sl.label}`;
        } else {
            lbl = Formatter.datePretty(sl.label || sl.date);
        }
        let h = `<div class="tt-header">${lbl}</div><div class="tt-energy" style="margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #555;">Energy: ${Formatter.number(s.total.cost)}</div><div style="display:grid; grid-template-columns: 28px 1fr 1fr 1fr; column-gap:10px; row-gap:2px; font-family:'Arial', sans-serif; font-size:11px;">`;
        const hs = "color:#666; font-size:9px; text-align:right; margin-bottom:2px;";
        h += `<div style="grid-column:2; ${hs}">Start</div><div style="grid-column:3; ${hs}">Gain</div><div style="grid-column:4; ${hs}">End</div>`;
        const r = (n, c, o, t = false) => {
            const st = t ? "border-top:1px solid #444; padding-top:4px; margin-top:2px;" : "";
            return `<div style="color:${c}; font-weight:700; ${st}">${n}</div><div style="text-align:right; color:#888; ${st}">${f(o.start)}</div><div style="text-align:right; color:${CONSTANTS.COLORS.GAINS}; font-weight:700; ${st}">${fg(o.gain)}</div><div style="text-align:right; color:#fff; font-weight:700; ${st}">${f(o.end)}</div>`;
        };
        h += r('STR', CONSTANTS.COLORS.STR, s.str) + r('DEF', CONSTANTS.COLORS.DEF, s.def) + r('SPD', CONSTANTS.COLORS.SPD, s.spd) + r('DEX', CONSTANTS.COLORS.DEX, s.dex) + r('TOT', CONSTANTS.COLORS.TOT, s.total, true);
        return h + `</div>`;
    }

    function updateFooterTooltip() {
        const b = document.getElementById('bbgl-gym-tab');
        if (!b) return;
        const isP = document.body.classList.contains('bbgl-page-mode-active');
        const txt = isP ? 'Disabled while viewing the log in Page View' : 'Big Black Gym Log';
        if (b.getAttribute('data-tooltip') !== txt) b.setAttribute('data-tooltip', txt);
    }

    function handleDomMutation() {
        if (!dom.bestGym || !dom.bestGym.isConnected) injectBestGymToggle();
        const loc = userConfig.buttonLocation,
            showFooter = loc === 'notes' || loc === 'both',
            showSidebar = loc === 'sidebar' || loc === 'both';
        if (loc !== _lastButtonLocation && !runtime._domObsArmed) rearmDomObs();
        if (loc === _lastButtonLocation) {
            const gtCached = dom.gymTab && dom.gymTab.isConnected ? dom.gymTab : null;
            const sbDCached = dom.sbDesktop && dom.sbDesktop.isConnected ? dom.sbDesktop : null;
            const sbMCached = dom.sbMobile && dom.sbMobile.isConnected ? dom.sbMobile : null;
            const footerOk = !showFooter || !!gtCached;
            const sidebarOk = !showSidebar || (!!sbDCached && !!sbMCached);
            if (footerOk && sidebarOk) {
                if (!gtCached) dom.gymTab = null;
                if (!sbDCached) dom.sbDesktop = null;
                if (!sbMCached) dom.sbMobile = null;
                if (showFooter && gtCached && dom.notesBtn && dom.notesBtn.isConnected && gtCached.nextSibling !== dom.notesBtn) {
                    dom.notesBtn.parentNode.insertBefore(gtCached, dom.notesBtn);
                }
                settleDomObs();
                return;
            }
        }
        Perf.start('handleDomMutation');
        const _prevNotesBtn = dom.notesBtn,
            _prevPeopBtn = dom.peopleBtn,
            _prevSettBtn = dom.settingsBtn,
            _prevChatRoot = dom.chatRoot;
        if (!dom.notesBtn || !dom.notesBtn.isConnected) dom.notesBtn = document.getElementById('notes_panel_button');
        if (!dom.peopleBtn || !dom.peopleBtn.isConnected) dom.peopleBtn = document.getElementById('people_panel_button');
        if (!dom.settingsBtn || !dom.settingsBtn.isConnected) dom.settingsBtn = document.getElementById('notes_settings_button');
        if (!dom.chatRoot || !dom.chatRoot.isConnected) dom.chatRoot = _bbglGetChatRoot();
        if (dom.notesBtn !== _prevNotesBtn || dom.peopleBtn !== _prevPeopBtn || dom.settingsBtn !== _prevSettBtn || dom.chatRoot !== _prevChatRoot) attachLayoutObservers();
        if (!dom.gymTab || !dom.gymTab.isConnected) dom.gymTab = document.getElementById('bbgl-gym-tab');
        const mb = dom.gymTab;
        if (!dom.sbDesktop || !dom.sbDesktop.isConnected) dom.sbDesktop = document.getElementById(SB_DESKTOP.id);
        if (!dom.sbMobile || !dom.sbMobile.isConnected) dom.sbMobile = document.getElementById(SB_MOBILE.id);
        if (showSidebar && (!dom.sbDesktop || !dom.sbMobile)) {
            if (!dom.sbDesktopTarget || !dom.sbDesktopTarget.isConnected) dom.sbDesktopTarget = document.querySelector(SB_DESKTOP.target);
            if (!dom.sbMobileTarget || !dom.sbMobileTarget.isConnected) dom.sbMobileTarget = document.querySelector(SB_MOBILE.target);
        }
        const nb = dom.notesBtn;
        if (showFooter && nb && !mb) {
            injectFooterButton(nb);
            dom.gymTab = document.getElementById('bbgl-gym-tab');
        } else if (showFooter && nb && mb && mb.nextSibling !== nb) {
            nb.parentNode.insertBefore(mb, nb);
        } else if (!showFooter && mb) {
            mb.remove();
            dom.gymTab = null;
        }
        const dt = dom.sbDesktopTarget,
            mt = dom.sbMobileTarget;
        if (showSidebar) {
            if (dt && !dom.sbDesktop) {
                injectSidebarButton(SB_DESKTOP, false);
                dom.sbDesktop = document.getElementById(SB_DESKTOP.id);
            }
            if (mt && !dom.sbMobile) {
                injectSidebarButton(SB_MOBILE, true);
                dom.sbMobile = document.getElementById(SB_MOBILE.id);
            }
        } else {
            const dEl = dom.sbDesktop,
                mEl = dom.sbMobile;
            if (dEl) {
                const sl = dEl.closest('.swiper-slide');
                sl ? sl.remove() : dEl.remove();
                dom.sbDesktop = null;
            }
            if (mEl) {
                const sl = mEl.closest('.swiper-slide');
                sl ? sl.remove() : mEl.remove();
                dom.sbMobile = null;
            }
        }
        _lastButtonLocation = loc;
        settleDomObs();
        Perf.end('handleDomMutation');
    }

    function settleDomObs() {
        const loc = userConfig.buttonLocation,
            showFooter = loc === 'notes' || loc === 'both',
            showSb = loc === 'sidebar' || loc === 'both';
        const footerOk = !showFooter || (dom.gymTab && dom.gymTab.isConnected);
        const sidebarOk = !showSb || (dom.sbDesktop && dom.sbDesktop.isConnected && dom.sbMobile && dom.sbMobile.isConnected);
        if (!footerOk || !sidebarOk) return;
        if (!runtime.domObs || !runtime._domObsArmed) return;
        runtime.domObs.disconnect();
        runtime._domObsArmed = false;
        const guard = (parent) => {
            if (!parent) return;
            const o = new MutationObserver(() => {
                if (!runtime._domObsArmed) rearmDomObs();
            });
            o.observe(parent, {
                childList: true
            });
            runtime._domGuards.push(o);
        };
        const seen = new Set();
        [dom.gymTab && dom.gymTab.parentNode, dom.sbDesktop && dom.sbDesktop.parentNode, dom.sbMobile && dom.sbMobile.parentNode].forEach(p => {
            if (p && !seen.has(p)) {
                seen.add(p);
                guard(p);
            }
        });
    }

    function rearmDomObs() {
        if (!runtime.domObs || runtime._domObsArmed) return;
        runtime._domGuards.forEach(o => o.disconnect());
        runtime._domGuards = [];
        runtime.domObs.observe(document.body, {
            childList: true,
            subtree: true
        });
        runtime._domObsArmed = true;
        if (runtime._domRearmRaf) return;
        runtime._domRearmRaf = requestAnimationFrame(() => {
            runtime._domRearmRaf = null;
            handleDomMutation();
        });
    }
    const SB_DESKTOP = {
            target: '#nav-gym[class*="area-desktop"]',
            container: 'area-desktop___vZLI8',
            link: 'desktopLink___SG2RU',
            row: 'area-row___iBD8N',
            id: 'nav-gym-log-desktop'
        },
        SB_MOBILE = {
            target: '#nav-gym[class*="area-mobile"]',
            container: 'area-mobile___sx8BQ',
            link: 'mobileLink___xTgRa sidebarMobileLink',
            row: 'area-row___iBD8N',
            slide: 'swiper-slide slide___se7hj',
            id: 'nav-gym-log-mobile'
        },
        GYM_LOG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" stroke="transparent" stroke-width="0" width="18" height="18" viewBox="60 20 280 215"><g transform="scale(1, 1.15)"><path d="${ICONS.LOGO_PATH}"></path></g></svg>`;

    function syncSidebarState() {
        const a = window.location.hash.includes('gymlog'),
            ids = [SB_DESKTOP.id, SB_MOBILE.id];
        const probe = document.querySelector('[id^="nav-"][class*="active___"]') || document.querySelector('[class*="active___"]');
        const activeCls = probe ? Array.from(probe.classList).find(c => c.startsWith('active___')) : null;
        if (!activeCls) return;
        if (a) {
            ids.forEach(id => {
                const c = document.getElementById(id);
                if (c) c.classList.add(activeCls);
            });
            document.querySelectorAll('[id^="nav-"]').forEach(navEl => {
                if (ids.includes(navEl.id)) return;
                [navEl, ...navEl.querySelectorAll('[class*="active___"]')].forEach(el => {
                    Array.from(el.classList).filter(cls => cls.startsWith('active___')).forEach(cls => el.classList.remove(cls));
                });
            });
        } else {
            ids.forEach(id => {
                const c = document.getElementById(id);
                if (c) Array.from(c.classList).filter(cls => cls.startsWith('active___')).forEach(cls => c.classList.remove(cls));
            });
        }
    }

    function getTopCeiling() {
        if (_topCeilingCache !== null && Date.now() - _topCeilingTs < 250) return _topCeilingCache;
        let ceiling = 50;
        if (window.innerWidth >= 1000 || window.scrollY > 10) {
            _topCeilingCache = ceiling;
            _topCeilingTs = Date.now();
            return ceiling;
        }
        for (const el of document.body.children) {
            if (el.id && el.id.startsWith('bbgl-')) continue;
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed') {
                const rect = el.getBoundingClientRect();
                if (rect.top < 10 && rect.bottom > ceiling) ceiling = Math.ceil(rect.bottom);
            }
        }
        _topCeilingCache = ceiling;
        _topCeilingTs = Date.now();
        return ceiling;
    }

    function _getLayoutWindows() {
        const out = new Set();
        document.querySelectorAll('[class*="visible___"], [class*="opened___"]').forEach(w => {
            if (!w || w.id === 'bbgl-panel') return;
            if (w.id === 'notes_panel_button' || w.id === 'people_panel_button' || w.id === 'notes_settings_button') return;
            if ((w.offsetWidth || 0) < 120 || (w.offsetHeight || 0) < 120) return;
            out.add(w);
        });
        return Array.from(out);
    }

    function _syncLayoutResizeTargets() {
        if (!runtime.layoutResizeObserver) return;
        const prev = runtime._layoutResizeTargets || (runtime._layoutResizeTargets = new Set());
        const next = new Set();
        _getLayoutWindows().forEach(w => {
            next.add(w);
            if (!prev.has(w)) runtime.layoutResizeObserver.observe(w);
        });
        prev.forEach(w => {
            if (!next.has(w)) {
                try {
                    runtime.layoutResizeObserver.unobserve(w);
                } catch (_) {}
                prev.delete(w);
            }
        });
        next.forEach(w => prev.add(w));
    }

    function handleLayout() {
        const p = dom.panel,
            tb = dom.gymTab,
            isPanelOpen = p && p.style.display !== 'none';
        if (!p || p.classList.contains('bbgl-mode-page')) {
            if (tb) tb.classList.toggle('bbgl-tab-active', !!isPanelOpen);
            return;
        }
        const peopBtn = (dom.peopleBtn && dom.peopleBtn.isConnected) ? dom.peopleBtn : (dom.peopleBtn = document.getElementById('people_panel_button'));
        const settBtn = (dom.settingsBtn && dom.settingsBtn.isConnected) ? dom.settingsBtn : (dom.settingsBtn = document.getElementById('notes_settings_button'));
        const noteBtn = (dom.notesBtn && dom.notesBtn.isConnected) ? dom.notesBtn : (dom.notesBtn = document.getElementById('notes_panel_button'));
        const chatRoot = (dom.chatRoot && dom.chatRoot.isConnected) ? dom.chatRoot : (dom.chatRoot = _bbglGetChatRoot());
        const isOpen = (b) => b && b.className.includes('opened___');
        const peopOpen = isOpen(peopBtn),
            settOpen = isOpen(settBtn),
            notesOpen = isOpen(noteBtn);
        const innerW = window.innerWidth;
        const topCeiling = getTopCeiling();
        _syncLayoutResizeTargets();
        const visWins = _getLayoutWindows();
        let isNotesExpanded = false;
        let maxNonChatWidth = 0;
        const winInfo = [];
        const shoveTargets = _bbglGetChatShoveTargets();
        visWins.forEach(w => {
            const inChat = _bbglIsChatWindow(w, shoveTargets);
            const rect = w.getBoundingClientRect();
            const dist = innerW - rect.right;
            if (notesOpen && !inChat) maxNonChatWidth = Math.max(maxNonChatWidth, w.offsetWidth || 0);
            winInfo.push({
                w,
                rect,
                dist,
                inChat
            });
        });
        if (notesOpen) isNotesExpanded = maxNonChatWidth > 500 || (innerW <= 620 && maxNonChatWidth > innerW * 0.75);
        let off = LAYOUT.BASE_RIGHT;
        if (peopOpen) off += 303;
        if (settOpen) off += 303;
        if (notesOpen) off += isNotesExpanded ? 582 : 303;
        let pRight, pOpacity, pPointer;
        if (innerW - off < 40) {
            pRight = `${innerW + 50}px`;
            pOpacity = '0';
            pPointer = 'none';
        } else {
            const panelWidth = viewState.expanded ? 576 : 300;
            if (off <= LAYOUT.BASE_RIGHT) {
                const maxOff = innerW - panelWidth - 0;
                if (off > maxOff) off = Math.max(0, maxOff);
            }
            pRight = `${off}px`;
            pOpacity = '1';
            pPointer = 'auto';
        }
        const totalShift = viewState.expanded ? 581 : 305;
        if (tb) tb.classList.toggle('bbgl-tab-active', !!isPanelOpen);
        p.style.setProperty('max-height', `calc(100vh - ${topCeiling}px)`, 'important');
        p.style.right = pRight;
        p.style.opacity = pOpacity;
        p.style.pointerEvents = pPointer; /* Cleanup: clear any stale parent-container transform from earlier approaches. */
        const _staleParent = (shoveTargets[0] && shoveTargets[0].parentElement) || null;
        if (_staleParent && _staleParent.style.transform) _staleParent.style.transform = '';
        shoveTargets.forEach(t => {
            t.style.right = isPanelOpen ? `${totalShift}px` : '';
            const _tr = t.style.transition || '';
            if (!_tr.includes('right')) t.style.transition = _tr ? _tr + ', right 0.2s ease-out' : 'right 0.2s ease-out';
        });
        winInfo.forEach(({
            w,
            inChat
        }) => {
            if (!inChat) {
                w.style.transform = '';
                return;
            }
        });
    }

    function _bbglGetChatRoot() {
        return document.getElementById('chatRoot');
    }

    function _bbglGetChatShoveTargets() {
        const targets = [];
        document.querySelectorAll('[id^="channel_panel_button:"]').forEach(b => {
            const id = b.id.slice('channel_panel_button:'.length);
            if (!id) return;
            const box = document.getElementById(id);
            if (!box) return;
            const wrap = box.closest('[class*="item___"]');
            if (wrap && !targets.includes(wrap)) targets.push(wrap);
        });
        return targets;
    }

    function _bbglIsChatWindow(w, shoveTargets) {
        if (!w) return false;
        if (shoveTargets && shoveTargets.some(t => t === w || t.contains(w) || w.contains(t))) return true;
        const cls = w.className || '';
        return typeof cls === 'string' && cls.toLowerCase().includes('chat');
    }

    function attachLayoutObservers() {
        _layoutObservers.forEach(o => {
            if (o.disconnect) o.disconnect();
        });
        _layoutObservers = [];
        const onLayoutChange = function onLayoutChange() {
            if (runtime.layoutRafId) return;
            runtime.layoutRafId = requestAnimationFrame(function onLayoutFrame() {
                runtime.layoutRafId = null;
                _syncLayoutResizeTargets();
                handleLayout();
                clearTimeout(runtime._layoutResyncTimer);
                runtime._layoutResyncTimer = setTimeout(function() {
                    runtime._layoutResyncTimer = null;
                    _syncLayoutResizeTargets();
                }, 350);
            });
        };
        if (!runtime.layoutResizeObserver) {
            runtime.layoutResizeObserver = new ResizeObserver(onLayoutChange);
        }
        if (!runtime._layoutWinResizeArmed) {
            runtime._layoutWinResizeArmed = true;
            window.addEventListener('resize', onLayoutChange, {
                passive: true
            });
        }
        const watchClass = (el) => {
            if (!el) return;
            const o = new MutationObserver(onLayoutChange);
            o.observe(el, {
                attributes: true,
                attributeFilter: ['class']
            });
            _layoutObservers.push(o);
        };
        const watchChatRoot = (el) => {
            if (!el) return;
            const o = new MutationObserver(onLayoutChange);
            o.observe(el, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
            _layoutObservers.push(o);
        };
        const watchLayoutLifecycle = () => {
            const o = new MutationObserver((muts) => {
                for (const m of muts) {
                    if (m.type !== 'childList') continue;
                    const nodes = [];
                    if (m.addedNodes && m.addedNodes.length) nodes.push(...m.addedNodes);
                    if (m.removedNodes && m.removedNodes.length) nodes.push(...m.removedNodes);
                    for (const n of nodes) {
                        const el = n && n.nodeType === 1 ? n : null;
                        if (!el) continue;
                        const cn = el.className || '';
                        if ((typeof cn === 'string' && (cn.includes('visible___') || cn.includes('opened___'))) || (el.querySelector && el.querySelector('[class*="visible___"], [class*="opened___"]'))) {
                            onLayoutChange();
                            return;
                        }
                    }
                }
            });
            o.observe(document.body, {
                childList: true,
                subtree: true
            });
            _layoutObservers.push(o);
        };
        dom.notesBtn = document.getElementById('notes_panel_button');
        dom.peopleBtn = document.getElementById('people_panel_button');
        dom.settingsBtn = document.getElementById('notes_settings_button');
        dom.chatRoot = _bbglGetChatRoot();
        watchClass(dom.notesBtn);
        watchClass(dom.peopleBtn);
        watchClass(dom.settingsBtn);
        watchChatRoot(dom.chatRoot);
        watchLayoutLifecycle();
        onLayoutChange();
    }

    function syncChangelogNotif(active) {
        const ids = [SB_DESKTOP.id, SB_MOBILE.id];
        ids.forEach(id => {
            const c = document.getElementById(id);
            if (!c) return;
            if (active) c.classList.add('bbgl-sb-notif');
            else c.classList.remove('bbgl-sb-notif');
        });
    }

    function injectFooterButton(notesBtnEl) {
        if (!notesBtnEl || !notesBtnEl.parentNode) return;
        if (document.getElementById('bbgl-gym-tab')) return;
        const b = document.createElement('button');
        b.id = 'bbgl-gym-tab';
        b.innerHTML = ICONS.LOGO;
        b.type = 'button';
        b.setAttribute('data-tooltip', 'Big Black Gym Log');
        notesBtnEl.parentNode.insertBefore(b, notesBtnEl);
        dom.gymTab = b;
        updateFooterTooltip();
    }

    function injectBestGymToggle() {
        const existing = document.getElementById('bbgl-bestgym');
        if (existing) {
            dom.bestGym = existing;
            return;
        }
        if (!document.getElementById('gymroot')) return;
        const host = document.getElementById('top-page-links-list');
        if (!host) return;
        const pill = document.createElement('div');
        pill.id = 'bbgl-bestgym';
        pill.className = 'bbgl-bestgym';
        pill.innerHTML = `<label class="bbgl-switch bbgl-switch-purple"><input type="checkbox" id="bbgl-bestgym-input"><span class="slider"></span></label><svg class="bbgl-bestgym-logo" xmlns="http://www.w3.org/2000/svg" viewBox="60 20 280 215"><g transform="scale(1, 1.15)"><path fill="currentColor" d="${ICONS.LOGO_PATH}"></path></g></svg><span class="bbgl-bestgym-label" data-tooltip-html="${TOOLTIPS.BEST_GYM}">BB Best Gym</span>`;
        const cb = pill.querySelector('#bbgl-bestgym-input');
        cb.checked = !!userConfig.bestGym;
        cb.onchange = () => setBestGym(cb.checked);
        host.appendChild(pill);
        dom.bestGym = pill;
    }

    function injectSidebarButton(cfg, mob) {
        if (document.getElementById(cfg.id)) return;
        const c = document.createElement('div');
        c.className = cfg.container;
        c.id = cfg.id;
        const r = document.createElement('div');
        r.className = cfg.row;
        const l = document.createElement('a');
        l.href = '/calendar.php#gymlog';
        l.className = cfg.link;
        l.innerHTML = `<span class="svgIconWrap___AMIqR"><span class="defaultIcon___iiNis mobile___paLva">${GYM_LOG_ICON}</span></span>${mob ? '<span>Gym Log</span>' : '<span class="linkName___FoKha">Gym Log</span>'}`;
        const _isNewInstall = !localStorage.getItem('bbgl_initialized') && !localStorage.getItem(KEYS.SB_NOTIF);
        const _hasChangelogNotif = localStorage.getItem(KEYS.CHANGELOG_NOTIF) === '1';
        if (_isNewInstall || _hasChangelogNotif) c.classList.add('bbgl-sb-notif');
        l.addEventListener('click', (e) => {
            e.preventDefault();
            const hadNotif = c.classList.contains('bbgl-sb-notif');
            const _liveIsNewInstall = !localStorage.getItem('bbgl_initialized') && !localStorage.getItem(KEYS.SB_NOTIF);
            const _liveHasChangelogNotif = localStorage.getItem(KEYS.CHANGELOG_NOTIF) === '1';
            if (hadNotif) {
                if (_liveIsNewInstall) localStorage.setItem(KEYS.SB_NOTIF, '1');
                if (_liveHasChangelogNotif) syncChangelogNotif(false);
            }
            if (window.location.pathname !== '/calendar.php' || window.location.hash !== '#gymlog') {
                window.location.href = '/calendar.php#gymlog';
            } else {
                if (hadNotif && _liveHasChangelogNotif) {
                    localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
                    localStorage.removeItem(KEYS.CHANGELOG_NOTIF);
                    setTimeout(() => openChangelogModal(), 400);
                }
            }
        });
        r.appendChild(l);
        c.appendChild(r);
        document.querySelectorAll(cfg.target).forEach(n => {
            const _liveContainer = Array.from(n.classList).find(cl => cl.startsWith(mob ? 'area-mobile___' : 'area-desktop___'));
            if (_liveContainer) {
                const hasNotif = c.classList.contains('bbgl-sb-notif');
                c.className = _liveContainer;
                if (hasNotif) c.classList.add('bbgl-sb-notif');
            }
            const _liveRow = n.querySelector('[class*="area-row"]');
            if (_liveRow) r.className = _liveRow.className;
            const _siblingSelector = mob ? '[id^="nav-"][class*="area-mobile"]' : '[id^="nav-"][class*="area-desktop"]';
            const _allSiblings = Array.from(document.querySelectorAll(_siblingSelector)).filter(el => el !== n && el.id !== cfg.id && el.querySelector('a'));
            const _inactiveSibling = _allSiblings.find(el => !Array.from(el.classList).some(cls => cls.startsWith('active___')));
            const _siblingSection = _inactiveSibling || _allSiblings[0];
            const _extractClass = (cn, prefixes) => (cn || '').split(/\s+/).filter(x => x && prefixes.some(p => x.startsWith(p))).join(' ');
            const _neutralLink = _siblingSection ? _siblingSection.querySelector('a') : null;
            if (_neutralLink) {
                l.className = _extractClass(_neutralLink.className, ['desktopLink', 'mobileLink', 'sidebarMobileLink']);
                const _sw = _neutralLink.querySelector('[class*="svgIconWrap"]');
                const _di = _neutralLink.querySelector('[class*="defaultIcon"]');
                const _ln = _neutralLink.querySelector('[class*="linkName"]');
                const _liveSvgWrap = _sw ? _extractClass(_sw.className, ['svgIconWrap']) : 'svgIconWrap___AMIqR';
                const _liveDefIcon = _di ? _extractClass(_di.className, ['defaultIcon', 'mobile']) : 'defaultIcon___iiNis mobile___paLva';
                const _liveLinkName = _ln ? _extractClass(_ln.className, ['linkName']) : 'linkName___FoKha';
                l.innerHTML = `<span class="${_liveSvgWrap}"><span class="${_liveDefIcon}">${GYM_LOG_ICON}</span></span>${mob ? '<span>Gym Log</span>' : `<span class="${_liveLinkName}">Gym Log</span>`}`;
            }
            const p = n.closest('.swiper-slide');
            if (mob && p) {
                const s = document.createElement('div');
                s.className = cfg.slide;
                s.style.width = n.parentNode.style.width || '43.375px';
                s.appendChild(c);
                const _wr = n.parentNode.parentNode;
                if (_wr) {
                    _wr.insertBefore(s, n.parentNode.nextSibling);
                    _wr.classList.add('bbgl-swiper-wr');
                    if (_wr.parentNode) _wr.parentNode.classList.add('bbgl-swiper-cont');
                    if (!n.parentNode.style.width) {
                        let _woTimer = null;
                        const _wo = new MutationObserver(() => {
                            if (n.parentNode.style.width) {
                                s.style.width = n.parentNode.style.width;
                                _wo.disconnect();
                                if (_woTimer) {
                                    clearTimeout(_woTimer);
                                    _woTimer = null;
                                }
                            }
                        });
                        _wo.observe(n.parentNode, {
                            attributes: true,
                            attributeFilter: ['style']
                        });
                        _woTimer = setTimeout(() => {
                            _wo.disconnect();
                            _woTimer = null;
                        }, 5000);
                    }
                }
            } else if (!mob && !p) {
                n.parentNode.insertBefore(c, n.nextSibling);
            }
        });
        syncSidebarState();
    }

    function generateDayStartSelect(id, selectedVal = 'utc') {
        return `<select id="${id}" class="bbgl-native-select"><option value="utc"${selectedVal === 'utc' ? ' selected' : ''}>Torn Time (UTC)</option><option value="local"${selectedVal === 'local' ? ' selected' : ''}>Local Time</option></select>`;
    }

    function buildSection(title, bodyHTML, bodyStyle = '') {
        const style = bodyStyle ? ` style="${bodyStyle}"` : '';
        return `<div class="bbgl-prefs-tab-title">${title}</div><div class="bbgl-settings-body"${style}>${bodyHTML}</div>`;
    }

    function buildRow(labelHTML, controlHTML, extraClass = '') {
        return `<div class="bbgl-setting-row${extraClass ? ' ' + extraClass : ''}">${labelHTML}${controlHTML}</div>`;
    }

    function buildToggle(id, labelHTML, extraClass = '') {
        return buildRow(labelHTML, `<label class="bbgl-switch"><input type="checkbox" id="${id}"><span class="slider"></span></label>`, extraClass);
    }

    function buildButton(id, label, modifier = '', extraStyle = '') {
        const cls = ['torn-btn', modifier ? `torn-btn-${modifier}` : ''].filter(Boolean).join(' ');
        const style = extraStyle ? ` style="${extraStyle}"` : '';
        return `<button id="${id}" class="${cls}"${style}>${label}</button>`;
    }

    function buildApiEntryField(prefix, extraStyle = '') {
        const style = extraStyle ? ` style="${extraStyle}"` : '';
        return `<div class="bbgl-api-container"${style}><div id="${prefix}-api-paste" class="bbgl-paste-icon" data-tooltip="${TOOLTIPS.PASTE_CLIPBOARD}">${ICONS.PASTE}</div><input id="${prefix}-api-key" type="text" name="bbgl_api_key" autocomplete="off" class="bbgl-native-input" placeholder="Enter Full or Custom API Key..."></div>`;
    }
    const TOOLTIPS = {
        ANIM: "<b>Toggle UI transitions and cosmetic effects</b><br><i>Disable to prioritize performance on slower devices.</i>",
        RATES: "<b>Display growth rate and efficiency metrics</b><br><i>Turn off for a minimalist view focused strictly on totals.</i>",
        DRUG_TRACKER: "<b>Choose the primary training drug that appears on the ledger.</b><br><i>People on SSL path may want to track LSD instead of Xanax usage.</i>",
        LOC: "<b>Choose where the Gym Log icon appears in your Torn UI</b><br><i>Select Sidebar if the Footer Tab is hidden or if you are using Chat 2.0.</i>",
        DAY_START: "<b>Anchor logs to UTC or your system clock</b><br><i>Syncs your ongoing training sessions with your real-world schedule.</i>",
        WEEK_START: "<b>Change your preferred starting day for the week</b><br><i>Adjusts the calendar layout and weekly performance metrics.</i>",
        BEST_GYM: "<b>Always train at your best unlocked gym</b><br><i>Pressing train switches you to the highest-tier gym for that stat.</i>",
        BEST_GYM_SPEC: "<b>Allow switching to specialist gyms</b><br><i>When off, auto-switch only considers standard gyms.</i>",
        BEST_GYM_UNPURCHASED: "<b>Allow switching to unpurchased gyms</b><br><i>When off, auto-switch only considers gyms you have already bought.</i>",
        API: "Custom API key required.<br><br><i>This script strictly requests 'battlestats' and 'log' data. Click the Create API Key button below to securely generate a key for this script. For maximum safety, you can edit this newly created key in your Torn API Settings to restrict its log access specifically to the 'Gym' category.<br><br>Your key is stored locally on your device only and is sent exclusively to api.torn.com.</i>",
        PASTE_CLIPBOARD: "Paste from Clipboard",
        AGREE_GATE: "Check every box in the user acknowledgement",
        LOCKED: "Locked",
        LEDGER_VIEW: "Ledger",
        GRAPH_VIEW: "Graph",
        STICKERBOOK: "Stickerbook",
        ACHIEVEMENTS: "Achievements",
        COPY_SESSION: "Copy Session Data",
        ALL_TIME_SUMMARY: "All-Time Summary",
        YEARLY_SUMMARY: "Yearly Summary",
        MONTHLY_SUMMARY: "Monthly Summary",
        DEMO_EXIT: "Exit Demo Mode",
        DEMO_EXIT_HTML: "Exit Demo Mode<i>Stats shown here are for previewing the functions of the script only — they do not reflect realistic Torn growth.</i>",
        REFRESH_COOLDOWN: (remaining) => `Please wait ${remaining}s before refreshing the log again`,
        BACKFILL_AGREE_GATE: "Read and agree to start the backfill",
        BACKFILL_RESUME_COOLDOWN: (t) => `Daily limit reached. Wait ${t} before resuming the Backfill.`,
        CELL_DATE: (ds) => `Date: ${ds}`
    };

    function syncSiblingSelect(primaryId, siblingId, val) {
        if (!dom.panel) return;
        const sib = dom.panel.querySelector('#' + siblingId);
        if (sib && sib.value !== val) sib.value = val;
    }

    function onChangeLoc(val) {
        userConfig.buttonLocation = val;
        saveConfig();
        handleDomMutation();
        syncSiblingSelect('set-loc-select', 'init-loc-select', val);
        syncSiblingSelect('init-loc-select', 'set-loc-select', val);
    }

    function resetSelectionState() {
        calendarState.selectedData = null;
        calendarState.selectedLabel = null;
        viewState.activeViewLabel = null;
        runtime.stickerData = [];
    }

    function onChangeDayStart(val) {
        userConfig.dayStartMode = val;
        saveConfig();
        const s = getActiveHistory(),
            baseline = s.meta.baselineBreakdown || ZERO_BREAKDOWN,
            series = DataController.flattenAllSeries();
        if (series.length > 0) {
            const rebuilt = DataController._rebuildFromSeries(series, baseline);
            s.history = rebuilt.history;
            s.today = rebuilt.today;
            DataController.saveSmartHistory(s);
        } else DataController.invalidate();
        resetSelectionState();
        renderPanelContent();
        const tp = dom.topPanel;
        if (tp && tp.classList.contains('viewing-graph')) GraphController.draw();
        syncSiblingSelect('set-day-start', 'init-day-start', val);
        syncSiblingSelect('init-day-start', 'set-day-start', val);
    }

    function onChangeWeekStart(val) {
        userConfig.weekStartMode = val;
        saveConfig();
        DataController.invalidate();
        resetSelectionState();
        const wr = dom.panel && dom.panel.querySelector('.bbgl-week-row');
        if (wr) {
            const wd = userConfig.weekStartMode === 'mon' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            wr.innerHTML = wd.map(d => `<span>${d}</span>`).join('');
        }
        renderPanelContent();
        const tp = dom.topPanel;
        if (tp && tp.classList.contains('viewing-graph')) GraphController.draw();
        syncSiblingSelect('set-week-start', 'init-week-start', val);
        syncSiblingSelect('init-week-start', 'set-week-start', val);
    }
    const docCache = {};
    function fetchDoc(name) {
        if (docCache[name]) return Promise.resolve(docCache[name]);
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: BASE_DOCS_URL + name + '.html',
                onload(res) {
                    if (res.status >= 200 && res.status < 300) {
                        docCache[name] = res.responseText;
                        resolve(res.responseText);
                    } else {
                        reject(new Error(`Doc fetch failed: ${res.status}`));
                    }
                },
                onerror() { reject(new Error('Doc fetch network error')); }
            });
        });
    }
    const DOC_LOADING_HTML = `<div style="padding:20px; text-align:center; color:#888;">Loading...</div>`;
    const DOC_ERROR_HTML   = `<div style="padding:20px; text-align:center; color:#888;">Could not load document. Check your connection.</div>`;

    const PRIVACY_TEXT = {
        ACK_INTRO: `<div style="padding:0 0 8px 0; color:#bbb; font-size:12px;">By using this script, you acknowledge and agree to the following:</div>`,
        ACK_ITEMS: ["I understand that this script requires full log access solely due to limitations in Torn's API.", "I understand this script's API usage and that it is designed to stay well within Torn's rate limits.", "I understand that all data is processed and stored locally within my own browser, and is never transmitted, stored externally, or accessible to the developer.", "I understand that I can verify these claims by reviewing the script's source code, specifically the \"THE CHECK-IN COUNTER\" section.", "I understand I can use Demo mode to test the script before registering any API Key or agreeing to this disclosure."]
    };

    function buildPrivacyModalHTML(reviewMode) {
        const ackRows = PRIVACY_TEXT.ACK_ITEMS.map((txt, i) => {
                const ctrl = reviewMode ? `<span class="bbgl-ack-check">${ICONS.CHECK}</span>` : `<input type="checkbox" id="bbgl-ack-${i + 1}">`,
                    label = reviewMode ? `<span>${txt}</span>` : `<label for="bbgl-ack-${i + 1}">${txt}</label>`;
                return `<div class="bbgl-ack-row">${ctrl}${label}</div>`;
            }).join(''),
            discSection = buildSection('Privacy Disclosure', `<div class="bbgl-modal-scrollbox"><div id="bbgl-privacy-disc">${DOC_LOADING_HTML}</div></div>`, 'margin-bottom:5px;'),
            ackSection = buildSection('User Acknowledgement', `<div class="bbgl-modal-scrollbox">${PRIVACY_TEXT.ACK_INTRO}${ackRows}</div>`, 'margin-bottom:8px;'),
            footer = reviewMode ? '' : `<div style="display:flex; margin:0 10px 4px 10px;">${buildButton('bbgl-privacy-demo-btn', 'DEMO', 'purple', 'flex:2; border-radius:4px 0 0 4px; margin:0;')}<span class="bbgl-agree-wrap" style="flex:1; display:flex;" data-tooltip="${TOOLTIPS.AGREE_GATE}">${buildButton('bbgl-privacy-agree-btn', 'AGREE', 'green', 'flex:1; border-radius:0 4px 4px 0; margin:0;')}</span></div>`;
        return `<div class="bbgl-modal-overlay" id="bbgl-privacy-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-privacy-close" title="Close">${ICONS.CLOSE}</div>${discSection}${ackSection}${footer}</div></div>`;
    }

    function closePrivacyModal() {
        const m = document.getElementById('bbgl-privacy-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function buildChangelogModalHTML() {
        const changelogSection = buildSection('BBGL Test Phase Changelog', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:250px;"><div id="bbgl-changelog-content" style="font-family:Arial,sans-serif; font-size:12px; color:#ccc; line-height:1.7;">${DOC_LOADING_HTML}</div></div>`, 'margin-bottom:8px;');
        return `<div class="bbgl-modal-overlay" id="bbgl-changelog-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-changelog-close" title="Close">${ICONS.CLOSE}</div>${changelogSection}</div></div>`;
    }

    function closeChangelogModal() {
        const m = document.getElementById('bbgl-changelog-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    async function openChangelogModal() {
        closeChangelogModal();
        document.body.insertAdjacentHTML('beforeend', buildChangelogModalHTML());
        const modal = document.getElementById('bbgl-changelog-modal');
        if (!modal) return;
        localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
        localStorage.removeItem(KEYS.CHANGELOG_NOTIF);
        syncChangelogNotif(false);
        modal.querySelector('#bbgl-changelog-close').onclick = () => closeChangelogModal();
        modal.onclick = (e) => {
            if (e.target === modal) closeChangelogModal();
        };
        try {
            const changelogHTML = await fetchDoc('changelog');
            const inner = modal.querySelector('#bbgl-changelog-content');
            if (inner) inner.innerHTML = changelogHTML;
        } catch (e) {
            const inner = modal.querySelector('#bbgl-changelog-content');
            if (inner) inner.innerHTML = DOC_ERROR_HTML;
        }
    }

    function buildFeatureGuideModalHTML() {
        const guideSection = buildSection('Feature Guide', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:250px;"><div style="padding:20px; text-align:center; color:#888;">Cumming Soon...</div></div>`, 'margin-bottom:8px;');
        return `<div class="bbgl-modal-overlay" id="bbgl-feature-guide-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-feature-guide-close" title="Close">${ICONS.CLOSE}</div>${guideSection}</div></div>`;
    }

    function closeFeatureGuideModal() {
        const m = document.getElementById('bbgl-feature-guide-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function openFeatureGuideModal() {
        closeFeatureGuideModal();
        document.body.insertAdjacentHTML('beforeend', buildFeatureGuideModalHTML());
        const modal = document.getElementById('bbgl-feature-guide-modal');
        if (!modal) return;
        modal.querySelector('#bbgl-feature-guide-close').onclick = () => closeFeatureGuideModal();
        modal.onclick = (e) => {
            if (e.target === modal) closeFeatureGuideModal();
        };
    }

    function buildBackfillModalHTML() {
        const agreeRow = `<div class="bbgl-ack-row" style="margin-top:10px;"><input type="checkbox" id="bbgl-backfill-agree"><label for="bbgl-backfill-agree">I understand what the Backfill does, how it uses my API key, and what happens if the scan is interrupted.</label></div>`,
            infoSection = buildSection('Big Black Dicslosure', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:300px;"><div id="bbgl-backfill-disc">${DOC_LOADING_HTML}</div>${agreeRow}</div>`, 'margin-bottom:8px;'),
            footer = `<div style="display:flex; justify-content:flex-end; margin:0 10px 4px 10px;"><span class="bbgl-agree-wrap" style="flex:0 0 auto; display:inline-flex;" data-tooltip="${TOOLTIPS.BACKFILL_AGREE_GATE}">${buildButton('bbgl-backfill-start-btn', 'Start', 'green', 'margin:0; min-width:96px;')}</span></div>`;
        return `<div class="bbgl-modal-overlay" id="bbgl-backfill-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-backfill-close" title="Close">${ICONS.CLOSE}</div>${infoSection}${footer}</div></div>`;
    }

    function closeBackfillModal() {
        const m = document.getElementById('bbgl-backfill-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    async function openBackfillModal() {
        if (runtime.demoMode) return;
        closeBackfillModal();
        document.body.insertAdjacentHTML('beforeend', buildBackfillModalHTML());
        const modal = document.getElementById('bbgl-backfill-modal');
        if (!modal) return;
        modal.querySelector('#bbgl-backfill-close').onclick = () => closeBackfillModal();
        modal.onclick = (e) => {
            if (e.target === modal) closeBackfillModal();
        };
        const startBtn = modal.querySelector('#bbgl-backfill-start-btn'),
            startWrap = modal.querySelector('.bbgl-agree-wrap'),
            agree = modal.querySelector('#bbgl-backfill-agree');
        startBtn.classList.add('bbgl-btn-disabled');
        const refreshStartState = () => {
            if (agree.checked) {
                startBtn.classList.remove('bbgl-btn-disabled');
                if (startWrap) startWrap.removeAttribute('data-tooltip');
            } else {
                startBtn.classList.add('bbgl-btn-disabled');
                if (startWrap) startWrap.setAttribute('data-tooltip', TOOLTIPS.BACKFILL_AGREE_GATE);
            }
        };
        agree.onchange = refreshStartState;
        refreshStartState();
        // Agreement is intentionally not persisted: starting the scan creates its own timers, which
        // are the record. The disclaimer is shown fresh on every manual start.
        startBtn.onclick = function() {
            if (startBtn.classList.contains('bbgl-btn-disabled')) return;
            this.blur();
            closeBackfillModal();
            backfillLogs(document.getElementById('backfill-btn'));
        };
        try {
            const disclosureHTML = await fetchDoc('backfill');
            const disc = modal.querySelector('#bbgl-backfill-disc');
            if (disc) disc.innerHTML = disclosureHTML;
        } catch (e) {
            const disc = modal.querySelector('#bbgl-backfill-disc');
            if (disc) disc.innerHTML = DOC_ERROR_HTML;
        }
    }

    async function openPrivacyModal() {
        closePrivacyModal();
        const reviewMode = !!userConfig.privacyAgreed,
            host = document.body;
        host.insertAdjacentHTML('beforeend', buildPrivacyModalHTML(reviewMode));
        const modal = document.getElementById('bbgl-privacy-modal');
        if (!modal) return;
        modal.querySelector('#bbgl-privacy-close').onclick = () => closePrivacyModal();
        modal.onclick = (e) => {
            if (e.target === modal) closePrivacyModal();
        };
        if (!reviewMode) {
            const agreeBtn = modal.querySelector('#bbgl-privacy-agree-btn'),
                agreeWrap = modal.querySelector('.bbgl-agree-wrap'),
                boxes = Array.from(modal.querySelectorAll('.bbgl-ack-row input[type="checkbox"]'));
            agreeBtn.classList.add('bbgl-btn-disabled');
            const refreshAgreeState = () => {
                const all = boxes.every(b => b.checked);
                if (all) {
                    agreeBtn.classList.remove('bbgl-btn-disabled');
                    if (agreeWrap) agreeWrap.removeAttribute('data-tooltip');
                } else {
                    agreeBtn.classList.add('bbgl-btn-disabled');
                    if (agreeWrap) agreeWrap.setAttribute('data-tooltip', TOOLTIPS.AGREE_GATE);
                }
            };
            boxes.forEach(b => b.onchange = refreshAgreeState);
            refreshAgreeState();
            modal.querySelector('#bbgl-privacy-demo-btn').onclick = function() {
                this.blur();
                enterDemo('privacy');
                closePrivacyModal();
            };
            agreeBtn.onclick = function() {
                if (agreeBtn.classList.contains('bbgl-btn-disabled')) return;
                this.blur();
                userConfig.privacyAgreed = new Date().toISOString();
                saveConfig();
                if (!runtime.wasVersionWiped) {
                    localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
                }
                closePrivacyModal();
                refreshInitLock();
                const wv = dom.welcomeView;
                if (wv && wv.classList.contains('active-view')) refreshInitMask(wv);
            };
        }
        try {
            const disclosureHTML = await fetchDoc('privacy');
            const disc = modal.querySelector('#bbgl-privacy-disc');
            if (disc) disc.innerHTML = disclosureHTML;
        } catch (e) {
            const disc = modal.querySelector('#bbgl-privacy-disc');
            if (disc) disc.innerHTML = DOC_ERROR_HTML;
        }
    }

    function refreshInitMask(wv) {
        const root = wv || dom.welcomeView;
        if (!root) return;
        const body = root.querySelector('#init-section-masked-body');
        if (!body) return;
        if (userConfig.privacyAgreed) body.classList.remove('bbgl-mask-active');
        else body.classList.add('bbgl-mask-active');
        refreshInitLock();
    }

    function refreshInitLock() {
        if (!dom.panel) return;
        const isInit = !!localStorage.getItem('bbgl_initialized');
        const lock = !isInit && !runtime.demoMode;
        dom.panel.classList.toggle('bbgl-init-locked', lock);
        const pc = document.getElementById('bbgl-page-container');
        if (pc) pc.classList.toggle('bbgl-init-locked', lock);
    }

    function refreshDemoMasks() {
        if (!dom.settingsView) return;
        dom.settingsView.querySelectorAll('.bbgl-demo-maskable').forEach(el => {
            el.classList.toggle('bbgl-mask-active', !!runtime.demoMode);
        });
        const sdemo = dom.settingsView.querySelector('#settings-demo-btn');
        if (sdemo) sdemo.innerText = runtime.demoMode ? 'EXIT DEMO' : 'DEMO MODE';
    }

    function enterDemo(source) {
        if (source === 'settings' || source === 'privacy') {
            runtime.realReturnView = runtime.returnView;
        }
        localStorage.setItem(KEYS.DEMO, '1');
        runtime.demoMode = true;
        runtime.demoHistory = null;
        runtime.stickerData = [];
        _historyCache = null;
        DataController.invalidate();
        calendarState.selectedData = null;
        calendarState.selectedLabel = Formatter.dateLogical();
        viewState.activeViewLabel = null;
        const deb = dom.panel ? dom.panel.querySelector('#bbgl-demo-exit') : null;
        if (deb) deb.style.display = 'flex';
        const debBtn = dom.panel ? dom.panel.querySelector('#bbgl-demo-exit-btn') : null;
        if (debBtn) debBtn.style.display = 'flex';
        const pdeb = document.getElementById('bbgl-page-demo-exit');
        if (pdeb) pdeb.style.display = 'flex';
        refreshInitLock();
        refreshDemoMasks();
        switchView('ledger');
    }

    function enterDemoFromSettings() {
        enterDemo('settings');
    }

    function buildWelcomeIntroSection() {
        const body = `<div id="bbgl-welcome-intro-text">${DOC_LOADING_HTML}</div>${buildButton('init-privacy-btn', 'PRIVACY DISCLOSURE', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;')}`;
        return `<div class="bbgl-prefs-tab-title" style="border-radius:5px 5px 0 0; margin-top:0;">Welcome to Big Black Gym Log</div><div class="bbgl-settings-body" style="margin-bottom:5px;">${body}</div>`;
    }

    function buildWelcomeInitSection() {
        const inputHTML = buildApiEntryField('init', 'margin:8px 10px;');
        const createBtn = buildButton('init-create-api-btn', 'CREATE API KEY', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;');
        const rows = buildRow(`<span data-tooltip-html="${TOOLTIPS.DAY_START}">Log Timezone</span>`, generateDayStartSelect('init-day-start', userConfig.dayStartMode)) + buildRow(`<span data-tooltip-html="${TOOLTIPS.WEEK_START}">Week Start</span>`, `<select id="init-week-start" class="bbgl-native-select"><option value="sun">Sun &ndash; Sat</option><option value="mon">Mon &ndash; Sun</option></select>`);
        const startBtn = buildButton('init-start-btn', 'START TRACKING', 'green', 'margin:8px 10px; width: calc(100% - 20px); display:block;');
        const body = `<div id="init-section-masked-body" class="bbgl-mask-host" data-mask-text="Please agree to the privacy disclosure first.">${inputHTML}${createBtn}${rows}${startBtn}</div>`;
        return buildSection('Initialization Settings', body, 'margin-bottom:5px;');
    }

    function buildWelcomeReturningSection() {
        const note = `<div id="bbgl-welcome-returning-text">${DOC_LOADING_HTML}</div>`;
        const importBtn = buildButton('init-returning-import-btn', 'IMPORT LOG', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;');
        const hiddenFile = `<input type="file" id="init-import-file" accept=".json,application/json" style="display:none">`;
        return buildSection('Returning User', note + importBtn + hiddenFile, 'margin-bottom:5px;');
    }

    async function populateWelcomeContent(wv) {
        let introHTML = DOC_ERROR_HTML, returningHTML = DOC_ERROR_HTML;
        try {
            const raw = await fetchDoc('welcome');
            const parts = raw.split('<!--RETURNING-->');
            introHTML     = parts[0] || DOC_ERROR_HTML;
            returningHTML = parts[1] || DOC_ERROR_HTML;
        } catch (e) {}
        const introEl     = wv.querySelector('#bbgl-welcome-intro-text');
        const returningEl = wv.querySelector('#bbgl-welcome-returning-text');
        if (introEl)     introEl.innerHTML = introHTML;
        if (returningEl) returningEl.innerHTML = returningHTML;
    }

    function getWelcomeHTML() {
        const isInit = !!localStorage.getItem('bbgl_initialized') || runtime.demoMode;
        const closeBtn = isInit ? `<div class="close-settings-btn bbgl-close-x" title="Close">${ICONS.CLOSE}</div>` : '';
        return `${closeBtn}<div class="bbgl-settings-scroll-area">${buildWelcomeIntroSection()}${buildWelcomeInitSection()}${buildWelcomeReturningSection()}</div>`;
    }

    function buildSettingsFeaturesSection() {
        const bestGymGroup = buildToggle('set-bestgym-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM}">BB Best Gym</span>`, 'bbgl-bestgym-lead') + buildToggle('set-bestgym-spec-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_SPEC}">Specialty Gyms</span>`, 'bbgl-subgroup-row') + buildToggle('set-bestgym-unpurch-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_UNPURCHASED}">Unpurchased Gyms</span>`, 'bbgl-subgroup-row bbgl-subgroup-row-last');
        const backfillBtn = buildButton('backfill-btn', '<span class="view-std">BB Backfill</span><span class="view-exp">Big Black Backfill</span>', 'purple', 'margin: 8px 10px 8px 10px; width: calc(100% - 20px); display: block;');
        return buildSection('Big Black Features', bestGymGroup + buildToggle('set-rate-toggle', `<span data-tooltip-html="${TOOLTIPS.RATES}">Rate Displays</span>`) + buildToggle('set-anim-toggle', `<span data-tooltip-html="${TOOLTIPS.ANIM}">Animations</span>`) + buildRow(`<span data-tooltip-html="${TOOLTIPS.DRUG_TRACKER}">Drug Use Tracker</span>`, `<select id="set-drug-tracker" class="bbgl-native-select"><option value="xanax">Xanax</option><option value="lsd">LSD</option></select>`) + `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${backfillBtn}</div>`);
    }

    function buildSettingsLogFormatSection() {
        return buildSection('Log Format', buildRow(`<span data-tooltip-html="${TOOLTIPS.LOC}">Log Access</span>`, `<select id="set-loc-select" class="bbgl-native-select"><option value="notes">Footer Tab</option><option value="sidebar">Sidebar</option><option value="both">Both</option></select>`) + buildRow(`<span data-tooltip-html="${TOOLTIPS.DAY_START}">Log Timezone</span>`, generateDayStartSelect('set-day-start', userConfig.dayStartMode)) + buildRow(`<span data-tooltip-html="${TOOLTIPS.WEEK_START}">Week Start</span>`, `<select id="set-week-start" class="bbgl-native-select"><option value="sun">Sun – Sat</option><option value="mon">Mon – Sun</option></select>`));
    }

    function buildSettingsApiSection() {
        const inputHTML = buildApiEntryField('set');
        const topBtn = buildButton('create-api-btn', 'CREATE API KEY', '', 'margin: 0 10px 0 10px; width: calc(100% - 20px); display: block; border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none;');
        const buttons = `<div class="bbgl-btn-grid bbgl-api-grid" style="margin: 0 10px 10px 10px!important;">${buildButton('clear-api-btn', 'CLEAR API KEY', 'red', 'border-top-left-radius: 0!important;')}${buildButton('updt-settings-btn', 'REGISTER API KEY', 'green', 'border-top-right-radius: 0!important;')}</div>`;
        return buildSection('API Access', `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${inputHTML}${topBtn}${buttons}</div>`, 'margin-bottom: 5px;');
    }

    function buildSettingsDataSection() {
        const inner = buildButton('refresh-log-btn', 'REFRESH LOG', '', 'margin: 8px 10px 0 10px; width: calc(100% - 20px); display: block; border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none;') + `<div class="bbgl-btn-grid" style="margin: 0 10px 0 10px;">${buildButton('export-btn', 'EXPORT LOG', '', 'border-radius: 0; border-bottom: none;')}${buildButton('import-btn', 'IMPORT LOG', '', 'border-radius: 0; border-bottom: none;')}<input type="file" id="import-file" accept=".json,application/json" style="display:none"></div>` + buildButton('clear-btn', 'CLEAR LOG', 'red', 'margin: 0 10px 8px 10px; width: calc(100% - 20px); display: block; border-top-left-radius: 0; border-top-right-radius: 0;');
        return buildSection('Data Management', `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${inner}</div>`);
    }

    function buildSettingsInfoSection() {
        const guideBtn = buildButton('feature-guide-btn', 'FEATURE GUIDE', '', 'margin: 8px 10px 0 10px; width: calc(100% - 20px); display: block; border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none;');
        const stack = `<div style="margin: 0 10px 0 10px; display: flex; flex-direction: column;">` + buildButton('settings-changelog-btn', 'CHANGELOG', '', 'border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: none; width: 100%;') + buildButton('show-welcome-btn', 'WELCOME PAGE', '', 'border-radius: 0; border-bottom: none; width: 100%;') + buildButton('settings-privacy-btn', 'PRIVACY DISCLOSURE', '', 'border-radius: 0; border-bottom: none; width: 100%;') + buildButton('dev-reset-btn', 'DEV: FACTORY RESET', 'red', `border-radius: 0; border-bottom: none; width: 100%; opacity: 0.6; display: ${runtime.devMode ? 'block' : 'none'};`) + `</div>`;
        const demoBtn = buildButton('settings-demo-btn', runtime.demoMode ? 'EXIT DEMO' : 'DEMO MODE', 'purple', 'margin: 0 10px 8px 10px; width: calc(100% - 20px); display: block; border-top-left-radius: 0; border-top-right-radius: 0;');
        return buildSection('Information', guideBtn + `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${stack}</div>${demoBtn}`);
    }

    function getSettingsHTML() {
        return `<div class="close-settings-btn" title="Close Settings">${ICONS.CHECK}</div><div class="bbgl-settings-scroll-area">${buildSettingsFeaturesSection()}${buildSettingsLogFormatSection()}${buildSettingsApiSection()}${buildSettingsDataSection()}${buildSettingsInfoSection()}</div>`;
    }

    function getDashboardHTML() {
        const CROWN = `<svg viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>`;
        const weekDays = userConfig.weekStartMode === 'mon' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekRowHTML = weekDays.map(d => `<span>${d}</span>`).join('');
        return `<div class="bbgl-header" id="bbgl-header-bar"><div class="bbgl-header-left">${ICONS.LOGO}<span class="bbgl-header-text"><span class="bbgl-short-title">Big Black Log</span><span class="bbgl-long-title">Big Black Gym Log</span></span></div><div class="bbgl-header-right"><span id="bbgl-demo-exit-btn" class="close-settings-btn bbgl-close-purple" style="display:${runtime.demoMode ? 'flex' : 'none'};" data-tooltip-html="${TOOLTIPS.DEMO_EXIT_HTML}"><span class="bbgl-demo-x-label">Demo</span>${ICONS.CLOSE}</span><span id="bbgl-settings-btn" class="bbgl-custom-icon">⚙</span><span id="bbgl-close-btn" class="bbgl-native-icon">${ICONS.MINIMIZE}</span><span id="bbgl-pop-btn" class="bbgl-native-icon">${viewState.expanded ? ICONS.COMPRESS : ICONS.POPOUT}</span></div></div><div id="bbgl-content-wrapper"><div id="bbgl-top-panel"><div id="bbgl-tall-toggle">${viewState.isTall ? '–' : '+'}</div><div id="bbgl-ledger-toggle" data-tooltip="${TOOLTIPS.LEDGER_VIEW}">${ICONS.LEDGER}</div><div id="bbgl-graph-toggle" data-tooltip="${TOOLTIPS.GRAPH_VIEW}">${ICONS.GRAPH}</div><div id="bbgl-achievements-toggle" data-tooltip="${TOOLTIPS.ACHIEVEMENTS}">${ICONS.ACHIEVEMENTS}</div><div id="bbgl-sticker-toggle" data-tooltip="${TOOLTIPS.STICKERBOOK}">${ICONS.STICKERBOOK}</div><div id="bbgl-item-counters"></div><div id="bbgl-copy-btn" class="copy-hist-btn" data-tooltip="${TOOLTIPS.COPY_SESSION}">${ICONS.CLIPBOARD}</div><div id="bbgl-sticker-title"></div><div class="ui-floating-label" id="bbgl-date-label">LOADING...</div><div class="ui-floating-summary" id="bbgl-summary-label"></div><div id="bbgl-ledger-view" class="ledger-content"></div><div id="bbgl-graph-container"><div class="g-hud"><div class="g-toggles"><div class="g-pill active" data-type="mode" data-val="values">Gains</div><div class="g-pill" data-type="mode" data-val="rates">Rates</div></div><div class="g-toggles"><div class="g-pill p-str active" data-type="stat" data-val="str">STR</div><div class="g-pill p-def" data-type="stat" data-val="def">DEF</div><div class="g-pill p-spd active" data-type="stat" data-val="spd">SPD</div><div class="g-pill p-dex" data-type="stat" data-val="dex">DEX</div><div class="g-pill p-tot" data-type="stat" data-val="total">TOT</div></div></div><svg id="bbgl-graph-svg"></svg></div><div id="bbgl-achievements-container" class="ledger-content"><div class="bbgl-ach-scroll"><div id="bbgl-ach-pages"></div></div><div id="bbgl-ach-footer" class="bbgl-ach-footer"><div class="bbgl-ach-footer-side bbgl-ach-footer-left"><button type="button" class="bbgl-ach-nav bbgl-ach-prev" aria-label="Previous achievements page">\u276e</button></div><div id="bbgl-ach-pageindicator"></div><div class="bbgl-ach-footer-side bbgl-ach-footer-right"><button type="button" class="bbgl-ach-nav bbgl-ach-next" aria-label="Next achievements page">\u276f</button></div></div></div><div id="bbgl-sticker-bg"></div><div id="bbgl-sticker-container"><div id="sticker-sponsor-btn" class="sticker-nav-btn disabled">❮</div><div id="sticker-prev-btn" class="sticker-nav-btn">❮</div><div id="sticker-next-btn" class="sticker-nav-btn">❯</div><div id="bbgl-sticker-grid"></div><div id="bbgl-sticker-pagination"></div></div><div class="glass-overlay"></div></div><div id="bbgl-bottom-panel"><div class="bbgl-header-wrapper"><div class="bbgl-month-header"><div class="title-group"><div class="title-stack"><div id="all-time-btn" class="all-time-btn" data-tooltip="${TOOLTIPS.ALL_TIME_SUMMARY}">${CROWN}</div><div class="header-row"><div class="header-trigger" id="year-trigger"></div><div class="stats-btn" id="year-stats-btn" data-tooltip="${TOOLTIPS.YEARLY_SUMMARY}">${ICONS.CHART}</div><div id="bbgl-year-dropdown" class="bbgl-dropdown-menu"></div></div><div class="header-row"><div class="header-trigger" id="month-trigger"></div><div class="stats-btn" id="month-stats-btn" data-tooltip="${TOOLTIPS.MONTHLY_SUMMARY}">${ICONS.CHART}</div><div id="bbgl-month-dropdown" class="bbgl-dropdown-menu"></div></div></div></div><button class="arrow-btn" id="prev-month-btn">❮</button><button class="arrow-btn" id="next-month-btn">❯</button></div></div><div id="bbgl-demo-exit" style="display: ${runtime.demoMode ? 'flex' : 'none'};" data-tooltip="${TOOLTIPS.DEMO_EXIT}" data-tooltip-html="${TOOLTIPS.DEMO_EXIT_HTML}">DEMO MODE</div><div class="bbgl-grid-container"><div class="bbgl-week-row">${weekRowHTML}</div><div class="calendar-wrapper" id="swipe-area"><div id="bbgl-cal-container" class="bbgl-cal-container"></div></div></div></div><div id="bbgl-item-viewer"><div class="viewer-window"><div class="viewer-stage"><div class="viewer-pedestal" id="vi-pedestal-wrapper"><div class="viewer-obj" id="vi-obj-target"><div class="layer-front"></div><div class="layer-back"></div></div></div></div></div><div class="viewer-info-overlay"><div class="vi-name" id="vi-name-target">Item Name</div></div></div><div id="bbgl-settings-view">${getSettingsHTML()}</div><div id="bbgl-welcome-view"></div>`;
    }

    /**
     *  [SECTION VII] THE MIRRORS (Graph & Ledger Engine)
     *  ========================================================================
     *  When you're done showing everyone your new tank top,
     *  take the time to reflect.
     */
    const GraphController = {
        _transformData({
            selectedData,
            selectedLabel,
            year,
            graphMode
        }) {
            const isToday = !selectedData,
                lbl = selectedLabel || "";
            let vt = 'DAY',
                sl = null;
            if (isToday) {
                sl = DataController.getSlice('DAY', Formatter.dateLogical());
                vt = 'DAY';
            } else if (lbl === 'All-Time') {
                sl = DataController.getSlice('ALL', 'All-Time');
                vt = 'ALL';
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(lbl)) {
                sl = DataController.getSlice('DAY', lbl);
                vt = 'DAY';
            } else if (/^\d{4}$/.test(lbl)) {
                sl = DataController.getSlice('YEAR', lbl);
                vt = 'YEAR';
            } else if (CONSTANTS.MONTHS.includes(lbl)) {
                sl = DataController.getSlice('MONTH', lbl, year);
                vt = 'MONTH';
            } else {
                sl = selectedData;
                vt = 'WEEK';
            }
            if (!sl) return {
                labels: [],
                trends: {
                    str: [],
                    def: [],
                    spd: [],
                    dex: [],
                    total: []
                },
                viewType: vt,
                xParams: {
                    min: 0,
                    max: 0
                }
            };
            const isR = graphMode === 'rates',
                labs = [],
                tr = {
                    str: [],
                    def: [],
                    spd: [],
                    dex: [],
                    total: []
                },
                xp = {
                    min: 0,
                    max: 0
                },
                st = STAT_KEYS,
                tl = DataController.getTimeline(),
                h = getActiveHistory();
            let sr = {
                    ...ZERO_BREAKDOWN,
                    total: 0
                },
                startTs = 0;
            if (vt === 'DAY') {
                const _p = sl.date.split('-');
                startTs = TimeManager.dayStartTs(sl.date);
            } else if (vt === 'MONTH') {
                startTs = new Date(Date.UTC(year, CONSTANTS.MONTHS.indexOf(lbl), 1)).getTime();
            } else if (vt === 'YEAR') {
                startTs = new Date(Date.UTC(parseInt(lbl), 0, 1)).getTime();
            } else if (vt === 'ALL' && sl._dailyList.length > 0) {
                startTs = Formatter.parse(sl._dailyList[0].date).getTime();
            } else if (sl._dailyList.length > 0) {
                startTs = Formatter.parse(sl._dailyList[0].date).getTime();
            }
            const _histCut = sl.date || (sl._dailyList?.[0]?.date) || '';
            const hist = tl.filter(d => _histCut ? d.date < _histCut : new Date(d.date + 'T00:00:00Z').getTime() < startTs).reverse();
            if (_histCut) {
                const _prevDate = new Date(_histCut + 'T00:00:00Z');
                _prevDate.setUTCDate(_prevDate.getUTCDate() - 1);
                const _prevDateStr = _prevDate.toISOString().slice(0, 10);
                st.forEach(s => {
                    sr[s] = DataController.getHistoricalRate(_prevDateStr, s);
                });
            } else {
                st.forEach(s => {
                    sr[s] = DataController.getOriginRate(s);
                });
            }
            sr.total = st.reduce((a, b) => a + (sr[b] || 0), 0);
            const globalBaseline = (h.meta && h.meta.baselineBreakdown) || {
                ...ZERO_BREAKDOWN
            };
            const _hv = (o) => o && (o.str || o.def || o.spd || o.dex);
            const _updRates = (d, base) => {
                let ur = {
                    ...base
                };
                const ser = (d && d.series) || [];
                st.forEach(s => {
                    for (let j = ser.length - 1; j >= 0; j--) {
                        const e = ser[j];
                        if (e.stat === s && e.cost > 0) {
                            ur[s] = e.rate;
                            break;
                        }
                    }
                });
                ur.total = st.reduce((a, s) => a + (ur[s] || 0), 0);
                return ur;
            };
            const _snapAt = (cutoffMs, d, baseVals, baseRates) => {
                let vals = {
                        ...baseVals
                    },
                    rates = {
                        ...baseRates
                    };
                if (d) {
                    const ser = d.series || [];
                    const dStart = d.startBreakdown || d.start;
                    if (_hv(dStart)) vals = {
                        ...dStart
                    };
                    ser.filter(e => (e.ts * 1000) <= cutoffMs).forEach(e => {
                        vals[e.stat] = e.after;
                    });
                    st.forEach(s => {
                        for (let i = ser.length - 1; i >= 0; i--) {
                            const e = ser[i];
                            if (e.stat === s && e.cost > 0 && (e.ts * 1000) <= cutoffMs) {
                                rates[s] = e.rate;
                                break;
                            }
                        }
                    });
                    rates.total = st.reduce((a, s) => a + (rates[s] || 0), 0);
                }
                return {
                    vals,
                    rates
                };
            };
            if (vt === 'DAY') {
                const raw = DataController.getDateMap()[sl.date],
                    start = startTs;
                xp.min = start;
                xp.max = start + 864e5;
                for (let i = 0; i <= 24; i += 2) labs.push(`${i}:00`);
                if (raw && raw.series) st.forEach(s => {
                    if (sr[s] === 0) {
                        const fLog = raw.series.find(l => l.stat === s);
                        if (fLog && fLog.cost > 0) sr[s] = fLog.rate;
                    }
                });
                const ser = (raw && raw.series) ? raw.series : [];
                const sSt = (raw && (raw.startBreakdown || raw.start)) ? (raw.startBreakdown || raw.start) : (hist[0] && (hist[0].endBreakdown || hist[0].end)) ? (hist[0].endBreakdown || hist[0].end) : globalBaseline;
                const getSt = (ts) => {
                    let r = {
                        ...sSt
                    };
                    ser.filter(s => (s.ts * 1000) <= ts).forEach(s => {
                        r[s.stat] = s.after;
                    });
                    return r;
                };
                const getRt = (tsS, tsE) => {
                    const rel = ser.filter(s => (s.ts * 1000) > tsS && (s.ts * 1000) <= tsE);
                    if (rel.length === 0) return null;
                    let et = 0,
                        g = {
                            ...ZERO_BREAKDOWN,
                            total: 0
                        },
                        cs = {
                            ...ZERO_BREAKDOWN
                        };
                    rel.forEach(s => {
                        et += s.cost;
                        g[s.stat] += s.gain;
                        g.total += s.gain;
                        cs[s.stat] += s.cost;
                    });
                    return {
                        str: cs.str > 0 ? (g.str / cs.str) * 150 : 0,
                        def: cs.def > 0 ? (g.def / cs.def) * 150 : 0,
                        spd: cs.spd > 0 ? (g.spd / cs.spd) * 150 : 0,
                        dex: cs.dex > 0 ? (g.dex / cs.dex) * 150 : 0,
                        total: et > 0 ? (g.total / et) * 150 : 0
                    };
                };
                let lr = {
                        ...sr
                    },
                    now = Date.now();
                const BKT = 15 * 60 * 1000;
                const sBkts = [];
                if (ser.length > 0) {
                    const sorted = ser.filter(s => {
                        const t = s.ts * 1000;
                        return t >= start && t <= start + 864e5;
                    }).sort((a, b) => a.ts - b.ts);
                    let gS = -1,
                        gL = -1;
                    sorted.forEach(s => {
                        const t = s.ts * 1000;
                        if (gS < 0 || t - gS > BKT) {
                            if (gL >= 0) sBkts.push(gL);
                            gS = t;
                            gL = t;
                        } else {
                            gL = t;
                        }
                    });
                    if (gL >= 0) sBkts.push(gL);
                }
                const used = new Set(),
                    pts = [];
                for (let i = 0; i <= 24; i += 2) {
                    const tick = start + (i * 3600 * 1000);
                    if (isToday && tick > now) break;
                    const nb = sBkts.find(b => !used.has(b) && Math.abs(b - tick) <= BKT);
                    if (nb !== undefined) {
                        used.add(nb);
                        pts.push(nb);
                    } else {
                        pts.push(tick);
                    }
                }
                sBkts.forEach(b => {
                    if (!used.has(b)) pts.push(b);
                });
                if (isToday) pts.push(now);
                pts.sort((a, b) => a - b);
                pts.forEach(pt => {
                    if (isR) {
                        const rt = getRt(pt - BKT, pt);
                        if (rt) {
                            st.forEach(s => {
                                if (rt[s] > 0) lr[s] = rt[s];
                            });
                            lr.total = st.reduce((a, s) => a + (lr[s] || 0), 0);
                        }
                        st.forEach(s => tr[s].push({
                            x: pt,
                            y: lr[s]
                        }));
                        tr.total.push({
                            x: pt,
                            y: lr.total
                        });
                    } else {
                        const sn = getSt(pt);
                        st.forEach(s => tr[s].push({
                            x: pt,
                            y: (sn[s] || 0)
                        }));
                        tr.total.push({
                            x: pt,
                            y: (sn.str || 0) + (sn.def || 0) + (sn.spd || 0) + (sn.dex || 0)
                        });
                    }
                });
            } else if (vt === 'MONTH' || vt === 'WEEK') {
                const dl = sl._dailyList.sort((a, b) => a.date.localeCompare(b.date));
                const byDate = {};
                dl.forEach(d => byDate[d.date] = d);
                let runningRates = {
                    ...sr
                };
                let curVals = {
                    ...globalBaseline
                };
                const _prePeriodDay = hist.find(d => {
                    const e = d.endBreakdown || d.end;
                    return _hv(e);
                });
                if (_prePeriodDay) curVals = {
                    ...(_prePeriodDay.endBreakdown || _prePeriodDay.end)
                };
                else if (dl.length > 0) {
                    const f = dl[0].startBreakdown || dl[0].start;
                    if (_hv(f)) curVals = {
                        ...f
                    };
                }
                const todayStr = Formatter.dateLogical();
                const nowMs = Date.now();
                const _push = (x, vals, rates) => {
                    st.forEach(s => tr[s].push({
                        x,
                        y: isR ? rates[s] : (vals[s] || 0)
                    }));
                    tr.total.push({
                        x,
                        y: isR ? rates.total : ((vals.str || 0) + (vals.def || 0) + (vals.spd || 0) + (vals.dex || 0))
                    });
                };
                if (vt === 'WEEK') {
                    xp.min = 0;
                    xp.max = 7;
                    const fdStr = dl[0] ? dl[0].date : todayStr;
                    const fd = Formatter.parse(fdStr);
                    const dayIdx = fd.getUTCDay();
                    const weekOffset = userConfig.weekStartMode === 'mon' ? (dayIdx === 0 ? 6 : dayIdx - 1) : dayIdx;
                    const weekStart = new Date(fd);
                    weekStart.setUTCDate(fd.getUTCDate() - weekOffset);
                    for (let i = 0; i < 7; i++) {
                        const d = new Date(weekStart);
                        d.setUTCDate(weekStart.getUTCDate() + i);
                        labs.push(Formatter.dateISO(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
                    }
                    let _wkHasData = hist.length > 0;
                    for (let i = 0; i < 7; i++) {
                        const dateStr = labs[i];
                        const d = byDate[dateStr];
                        const dayStart = TimeManager.dayStartTs(dateStr);
                        if (dayStart > nowMs) break;
                        if (!d && !_wkHasData && dateStr !== todayStr) continue;
                        if (d) _wkHasData = true;
                        const middayTs = dayStart + 12 * 3600 * 1000;
                        _push(i, curVals, runningRates);
                        if (middayTs <= nowMs) {
                            const m = _snapAt(middayTs, d, curVals, runningRates);
                            _push(i + 0.5, m.vals, m.rates);
                        }
                        if (d) {
                            if (dateStr === todayStr) {
                                const live = _snapAt(nowMs, d, curVals, runningRates);
                                curVals = live.vals;
                                runningRates = live.rates;
                                const liveX = i + Math.min((nowMs - dayStart) / 864e5, 1);
                                _push(liveX, live.vals, live.rates);
                            } else {
                                const end = d.endBreakdown || d.end;
                                if (_hv(end)) curVals = {
                                    ...end
                                };
                                runningRates = _updRates(d, runningRates);
                            }
                        }
                    }
                    if (labs[6] < todayStr) _push(7, curVals, runningRates);
                } else {
                    const yForMonth = year || new Date().getUTCFullYear();
                    const mIdx = CONSTANTS.MONTHS.indexOf(lbl);
                    const dim = new Date(yForMonth, mIdx + 1, 0).getDate();
                    xp.min = 1;
                    xp.max = dim + 1;
                    for (let i = 1; i <= dim; i++) labs.push(String(i));
                    let _mHasData = hist.length > 0;
                    for (let dayNum = 1; dayNum <= dim; dayNum++) {
                        const dateStr = Formatter.dateISO(yForMonth, mIdx, dayNum);
                        if (dateStr > todayStr) break;
                        const d = byDate[dateStr];
                        if (!d && !_mHasData && dateStr !== todayStr) continue;
                        if (d) _mHasData = true;
                        _push(dayNum, curVals, runningRates);
                        if (dateStr === todayStr) {
                            if (!isR) {
                                const startV = d && (d.startBreakdown || d.start);
                                if (_hv(startV)) curVals = {
                                    ...startV
                                };
                            }
                            const _dayStart = TimeManager.dayStartTs(dateStr);
                            const _frac = Math.min((nowMs - _dayStart) / 864e5, 1);
                            const live = _snapAt(nowMs, d, curVals, runningRates);
                            if (_frac > 0.005) _push(dayNum + _frac, live.vals, live.rates);
                            curVals = live.vals;
                            runningRates = live.rates;
                        } else if (d) {
                            if (isR) runningRates = _updRates(d, runningRates);
                            else {
                                const end = d.endBreakdown || d.end;
                                if (_hv(end)) curVals = {
                                    ...end
                                };
                            }
                        }
                    }
                    if (Formatter.dateISO(yForMonth, mIdx, dim) < todayStr) _push(dim + 1, curVals, runningRates);
                }
            } else if (vt === 'YEAR') {
                labs.push(...CONSTANTS.MONTHS_SHORT);
                const yInt = parseInt(lbl),
                    now = new Date(),
                    isCur = yInt === TimeManager.year(now),
                    curM = TimeManager.month(now);
                xp.min = 0;
                xp.max = 12;
                const dl = sl._dailyList.sort((a, b) => a.date.localeCompare(b.date));
                let baseline = {
                    ...globalBaseline
                };
                const _preYearDay = hist.find(d => {
                    const e = d.endBreakdown || d.end;
                    return _hv(e);
                });
                if (_preYearDay) baseline = {
                    ...(_preYearDay.endBreakdown || _preYearDay.end)
                };
                else if (dl.length > 0) {
                    const f = dl[0].startBreakdown || dl[0].start;
                    if (_hv(f)) baseline = {
                        ...f
                    };
                }
                const getStatsAsOf = (dateStr) => {
                    const prev = dl.filter(d => d.date < dateStr);
                    if (prev.length > 0) {
                        const l = prev[prev.length - 1];
                        return l.endBreakdown || l.end || baseline;
                    }
                    return baseline;
                };
                const getRateAsOf = (dateStr) => {
                    const allSer = dl.filter(d => d.date < dateStr).flatMap(d => d.series || []);
                    let r = {
                        ...sr
                    };
                    st.forEach(s => {
                        for (let j = allSer.length - 1; j >= 0; j--) {
                            const e = allSer[j];
                            if (e.stat === s && e.cost > 0) {
                                r[s] = e.rate;
                                break;
                            }
                        }
                    });
                    r.total = st.reduce((a, s) => a + (r[s] || 0), 0);
                    return r;
                };
                const _pushAsOf = (x, dateStr) => {
                    if (isR) {
                        const r = getRateAsOf(dateStr);
                        st.forEach(s => tr[s].push({
                            x,
                            y: r[s]
                        }));
                        tr.total.push({
                            x,
                            y: r.total
                        });
                    } else {
                        const v = getStatsAsOf(dateStr);
                        st.forEach(s => tr[s].push({
                            x,
                            y: v[s] || 0
                        }));
                        tr.total.push({
                            x,
                            y: (v.str || 0) + (v.def || 0) + (v.spd || 0) + (v.dex || 0)
                        });
                    }
                };
                const firstLogDate = dl.length > 0 ? Formatter.parse(dl[0].date) : null;
                const firstLogMonth = firstLogDate ? firstLogDate.getUTCMonth() : 12;
                const firstLogDay = firstLogDate ? firstLogDate.getUTCDate() : 1;
                const skipFirstStart = firstLogDay > 15;
                const limit = isCur ? curM : 11;
                for (let i = firstLogMonth; i <= limit; i++) {
                    if (!(i === firstLogMonth && skipFirstStart)) _pushAsOf(i, Formatter.dateISO(yInt, i, 1));
                    const mid15 = new Date(Date.UTC(yInt, i, 15));
                    if (!isCur || mid15.getTime() <= now.getTime()) _pushAsOf(i + 0.5, Formatter.dateISO(yInt, i, 15));
                }
                if (isCur) {
                    const curDay = TimeManager.date(now);
                    const dim = new Date(yInt, curM + 1, 0).getDate();
                    const nowX = curM + (curDay - 1) / dim;
                    const isDup = Math.abs(nowX - curM) < 0.005 || Math.abs(nowX - (curM + 0.5)) < 0.005;
                    if (!isDup) {
                        if (isR) {
                            let liveRates = {
                                ...sr
                            };
                            const allSer = dl.flatMap(d => d.series || []);
                            st.forEach(s => {
                                for (let j = allSer.length - 1; j >= 0; j--) {
                                    const e = allSer[j];
                                    if (e.stat === s && e.cost > 0) {
                                        liveRates[s] = e.rate;
                                        break;
                                    }
                                }
                            });
                            liveRates.total = st.reduce((a, s) => a + (liveRates[s] || 0), 0);
                            st.forEach(s => tr[s].push({
                                x: nowX,
                                y: liveRates[s]
                            }));
                            tr.total.push({
                                x: nowX,
                                y: liveRates.total
                            });
                        } else {
                            const todayRaw = DataController.getDateMap()[Formatter.dateLogical()];
                            let liveVals;
                            if (todayRaw) {
                                const ser = todayRaw.series || [];
                                const base = todayRaw.startBreakdown || todayRaw.start || getStatsAsOf(Formatter.dateLogical());
                                liveVals = {
                                    ...base
                                };
                                ser.filter(e => (e.ts * 1000) <= now.getTime()).forEach(e => {
                                    liveVals[e.stat] = e.after;
                                });
                            } else {
                                liveVals = getStatsAsOf(Formatter.dateLogical());
                                if (dl.length > 0) {
                                    const last = dl[dl.length - 1];
                                    const e = last.endBreakdown || last.end;
                                    if (_hv(e)) liveVals = {
                                        ...e
                                    };
                                }
                            }
                            st.forEach(s => tr[s].push({
                                x: nowX,
                                y: liveVals[s] || 0
                            }));
                            tr.total.push({
                                x: nowX,
                                y: (liveVals.str || 0) + (liveVals.def || 0) + (liveVals.spd || 0) + (liveVals.dex || 0)
                            });
                        }
                    }
                } else {
                    const _yearEndStr = Formatter.dateISO(yInt + 1, 0, 1);
                    if (isR) {
                        const r = getRateAsOf(_yearEndStr);
                        st.forEach(s => tr[s].push({
                            x: 12,
                            y: r[s]
                        }));
                        tr.total.push({
                            x: 12,
                            y: r.total
                        });
                    } else {
                        const v = getStatsAsOf(_yearEndStr);
                        st.forEach(s => tr[s].push({
                            x: 12,
                            y: v[s] || 0
                        }));
                        tr.total.push({
                            x: 12,
                            y: (v.str || 0) + (v.def || 0) + (v.spd || 0) + (v.dex || 0)
                        });
                    }
                }
            } else if (vt === 'ALL') {
                const dl = sl._dailyList.sort((a, b) => a.date.localeCompare(b.date));
                if (dl.length === 0) return {
                    labels: [],
                    trends: tr,
                    viewType: 'ALL_TIME',
                    xParams: {
                        min: 0,
                        max: 0
                    }
                };
                const now = new Date();
                const firstDate = Formatter.parse(dl[0].date);
                const daysElapsed = Math.floor((now.getTime() - firstDate.getTime()) / 864e5);
                if (daysElapsed <= 29) {
                    vt = 'ALL_TIME';
                    xp.min = 0;
                    const byDate = {};
                    dl.forEach(d => byDate[d.date] = d);
                    const todayStr = Formatter.dateLogical();
                    const nowMs = Date.now();
                    const ci = 1;
                    const tier = 'Day-1';
                    let runningRates = {
                        ...sr
                    };
                    let curVals = {
                        ...globalBaseline
                    };
                    if (dl.length > 0) {
                        const f = dl[0].startBreakdown || dl[0].start;
                        if (_hv(f)) curVals = {
                            ...f
                        };
                    }
                    const _push = (x, vals, rates) => {
                        st.forEach(s => tr[s].push({
                            x,
                            y: isR ? rates[s] : (vals[s] || 0)
                        }));
                        tr.total.push({
                            x,
                            y: isR ? rates.total : ((vals.str || 0) + (vals.def || 0) + (vals.spd || 0) + (vals.dex || 0))
                        });
                    };
                    const actualDates = [];
                    let lastX = 0;
                    for (let i = 0; i <= daysElapsed; i++) {
                        const dateObj = new Date(firstDate);
                        dateObj.setUTCDate(firstDate.getUTCDate() + i);
                        const dateStr = Formatter.dateISO(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate());
                        const d = byDate[dateStr];
                        const isToday = (dateStr === todayStr);
                        if (i % ci === 0) {
                            const x = i / ci;
                            lastX = x;
                            actualDates.push(dateStr);
                            _push(x, curVals, runningRates);
                            if (isToday) {
                                if (!isR && d) {
                                    const startV = d.startBreakdown || d.start;
                                    if (_hv(startV)) curVals = {
                                        ...startV
                                    };
                                }
                                const _dayStart = TimeManager.dayStartTs(dateStr);
                                const _frac = Math.min((nowMs - _dayStart) / 864e5, 1);
                                const live = _snapAt(nowMs, d, curVals, runningRates);
                                const liveX = (i + _frac) / ci;
                                if (_frac > 0.005) _push(liveX, live.vals, live.rates);
                                lastX = liveX;
                            } else if (d) {
                                if (isR) runningRates = _updRates(d, runningRates);
                                else {
                                    const end = d.endBreakdown || d.end;
                                    if (_hv(end)) curVals = {
                                        ...end
                                    };
                                }
                            }
                        } else {
                            if (isToday) {
                                const _dayStart = TimeManager.dayStartTs(dateStr);
                                const _frac = Math.min((nowMs - _dayStart) / 864e5, 1);
                                const live = _snapAt(nowMs, d, curVals, runningRates);
                                const liveX = (i + _frac) / ci;
                                _push(liveX, live.vals, live.rates);
                                lastX = liveX;
                            } else if (d) {
                                if (isR) runningRates = _updRates(d, runningRates);
                                else {
                                    const end = d.endBreakdown || d.end;
                                    if (_hv(end)) curVals = {
                                        ...end
                                    };
                                }
                            }
                        }
                    }
                    xp.max = lastX;
                    const labelMeta = [];
                    const secWidth = 1;
                    const totalSections = Math.ceil(xp.max / secWidth);
                    for (let k = 0; k < totalSections; k++) {
                        const left = Math.max(k * secWidth, xp.min);
                        const right = Math.min((k + 1) * secWidth, xp.max);
                        if (right <= left) continue;
                        const sectionRatio = (right - left) / secWidth;
                        const cx = (left + right) / 2;
                        if (k === 0 && sectionRatio < 0.5) continue;
                        const dObj = new Date(firstDate);
                        dObj.setUTCDate(firstDate.getUTCDate() + (k * ci));
                        labelMeta.push({
                            text: String(dObj.getUTCDate()),
                            x: cx
                        });
                    }
                    return {
                        labels: [],
                        trends: tr,
                        viewType: vt,
                        xParams: xp,
                        anchorDate: firstDate,
                        actualDates,
                        tier,
                        labelMeta
                    };
                } else {
                    vt = 'ALL_TIME';
                    const byDate = {};
                    dl.forEach(d => byDate[d.date] = d);
                    const todayStr = Formatter.dateLogical();
                    const nowMs = Date.now();
                    const originY = firstDate.getUTCFullYear();
                    const originM = firstDate.getUTCMonth();
                    const originD = firstDate.getUTCDate();
                    const nowY = now.getUTCFullYear();
                    const nowM = now.getUTCMonth();
                    const monthsElapsed = (nowY - originY) * 12 + (nowM - originM);
                    let tier, secWidth;
                    if (daysElapsed < 60) {
                        tier = 'Mo-1-2d';
                        secWidth = 1;
                    } else if (monthsElapsed < 6) {
                        tier = 'Mo-1-Wk';
                        secWidth = 1;
                    } else if (monthsElapsed < 12) {
                        tier = 'Mo-1-Bi';
                        secWidth = 1;
                    } else if (monthsElapsed < 30) {
                        tier = 'Yr-Mo';
                        secWidth = 12;
                    } else if (monthsElapsed < 60) {
                        tier = 'Yr-Bi';
                        secWidth = 12;
                    } else {
                        tier = 'Yr-Semi';
                        secWidth = 12;
                    }
                    let runningRates = {
                        ...sr
                    };
                    let curVals = {
                        ...globalBaseline
                    };
                    if (dl.length > 0) {
                        const f = dl[0].startBreakdown || dl[0].start;
                        if (_hv(f)) curVals = {
                            ...f
                        };
                    }
                    const dateToX = (dObj) => {
                        const y = dObj.getUTCFullYear();
                        const m = dObj.getUTCMonth();
                        const d = dObj.getUTCDate();
                        const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
                        return (y - originY) * 12 + (m - originM) + (d - 1) / dim;
                    };
                    const dimOrigin = new Date(Date.UTC(originY, originM + 1, 0)).getUTCDate();
                    const originX = (originD - 1) / dimOrigin;
                    xp.min = originX;
                    const advanceState = (fromIso, toIso) => {
                        const logs = dl.filter(d => d.date > fromIso && d.date <= toIso);
                        logs.forEach(d => {
                            if (isR) runningRates = _updRates(d, runningRates);
                            else {
                                const end = d.endBreakdown || d.end;
                                if (_hv(end)) curVals = {
                                    ...end
                                };
                            }
                        });
                    };
                    const _push = (x, vals, rates) => {
                        st.forEach(s => tr[s].push({
                            x,
                            y: isR ? rates[s] : (vals[s] || 0)
                        }));
                        tr.total.push({
                            x,
                            y: isR ? rates.total : ((vals.str || 0) + (vals.def || 0) + (vals.spd || 0) + (vals.dex || 0))
                        });
                    };
                    const actualDates = [];
                    const originIso = Formatter.dateISO(originY, originM, originD);
                    actualDates.push(originIso);
                    _push(originX, curVals, runningRates);
                    const originLog = byDate[originIso];
                    if (originLog && originIso !== todayStr) {
                        if (isR) runningRates = _updRates(originLog, runningRates);
                        else {
                            const end = originLog.endBreakdown || originLog.end;
                            if (_hv(end)) curVals = {
                                ...end
                            };
                        }
                    }
                    const scheduled = [];
                    let tParts = tier.split('-');
                    if (tParts[0] === 'Mo') {
                        let m = originM,
                            y = originY;
                        while (true) {
                            let pushDays = [];
                            if (tier === 'Mo-1-2d') {
                                const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
                                for (let i = 1; i <= dim; i += 2) pushDays.push(i);
                            } else if (tier === 'Mo-1-Wk') pushDays = [1, 8, 15, 22];
                            else if (tier === 'Mo-1-Bi') pushDays = [1, 15];
                            else pushDays = [1];
                            let stop = false;
                            pushDays.forEach(day => {
                                const d = new Date(Date.UTC(y, m, day));
                                if (d > now) {
                                    stop = true;
                                } else {
                                    if (d.getTime() > firstDate.getTime()) scheduled.push({
                                        date: d,
                                        iso: Formatter.dateISO(y, m, day)
                                    });
                                }
                            });
                            if (stop) break;
                            m++;
                            if (m > 11) {
                                m = 0;
                                y++;
                            }
                        }
                    } else {
                        let targetMonths = tier === 'Yr-Mo' ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : tier === 'Yr-Bi' ? [0, 2, 4, 6, 8, 10] : [0, 6];
                        for (let y = originY; y <= nowY; y++) {
                            targetMonths.forEach(monthIdx => {
                                const d = new Date(Date.UTC(y, monthIdx, 1));
                                if (d > now) return;
                                if (d.getTime() > firstDate.getTime()) scheduled.push({
                                    date: d,
                                    iso: Formatter.dateISO(y, monthIdx, 1)
                                });
                            });
                        }
                    }
                    let prevIso = originIso;
                    scheduled.forEach(sd => {
                        advanceState(prevIso, sd.iso);
                        actualDates.push(sd.iso);
                        _push(dateToX(sd.date), curVals, runningRates);
                        const sdLog = byDate[sd.iso];
                        if (sdLog && sd.iso !== todayStr) {
                            if (isR) runningRates = _updRates(sdLog, runningRates);
                            else {
                                const end = sdLog.endBreakdown || sdLog.end;
                                if (_hv(end)) curVals = {
                                    ...end
                                };
                            }
                        }
                        prevIso = sd.iso;
                    });
                    if (todayStr > prevIso) advanceState(prevIso, todayStr);
                    const todayD = byDate[todayStr];
                    if (!isR && todayD) {
                        const startV = todayD.startBreakdown || todayD.start;
                        if (_hv(startV)) curVals = {
                            ...startV
                        };
                    }
                    const liveSnap = _snapAt(nowMs, todayD, curVals, runningRates);
                    const todayDate = Formatter.parse(todayStr);
                    const todayDay = todayDate.getUTCDate();
                    const todayDim = new Date(Date.UTC(nowY, nowM + 1, 0)).getUTCDate();
                    const todayDayStart = TimeManager.dayStartTs(todayStr);
                    const intradayFrac = Math.min((nowMs - todayDayStart) / 864e5, 1);
                    const liveX = (nowY - originY) * 12 + (nowM - originM) + (todayDay - 1 + intradayFrac) / todayDim;
                    const lastDotX = tr.str.length > 0 ? tr.str[tr.str.length - 1].x : -1;
                    if (liveX > lastDotX + 0.001) {
                        actualDates.push(todayStr);
                        _push(liveX, liveSnap.vals, liveSnap.rates);
                    }
                    xp.max = Math.max(liveX, originX + 0.001);
                    const labelMeta = [];
                    if (tier.startsWith('Yr')) {
                        const totalSections = Math.ceil((xp.max + originM) / 12);
                        for (let k = 0; k < totalSections; k++) {
                            const left = Math.max(k * 12 - originM, xp.min);
                            const right = Math.min((k + 1) * 12 - originM, xp.max);
                            if (right <= left) continue;
                            const sectionRatio = (right - left) / 12;
                            const cx = (left + right) / 2;
                            if (k === 0 && sectionRatio < 0.5) continue;
                            labelMeta.push({
                                text: String(originY + k),
                                x: cx
                            });
                        }
                    } else {
                        const totalSections = Math.ceil(xp.max / secWidth);
                        let isFirstLabel = true;
                        for (let k = 0; k < totalSections; k++) {
                            const left = Math.max(k * secWidth, xp.min);
                            const right = Math.min((k + 1) * secWidth, xp.max);
                            if (right <= left) continue;
                            const sectionRatio = (right - left) / secWidth;
                            const cx = (left + right) / 2;
                            const monthsFromOrigin = Math.floor(left);
                            const totalM = originM + monthsFromOrigin;
                            const m = ((totalM % 12) + 12) % 12;
                            const currentY = originY + Math.floor(totalM / 12);
                            if (k === 0 && sectionRatio < 0.5) continue;
                            let text = CONSTANTS.MONTHS_SHORT[m];
                            if (isFirstLabel || m === 0) {
                                text += ` '${String(currentY).slice(-2)}`;
                            }
                            isFirstLabel = false;
                            labelMeta.push({
                                text,
                                x: cx
                            });
                        }
                    }
                    return {
                        labels: labs,
                        trends: tr,
                        viewType: vt,
                        xParams: xp,
                        anchorDate: firstDate,
                        actualDates,
                        tier,
                        labelMeta
                    };
                }
            }
            return {
                labels: labs,
                trends: tr,
                viewType: vt,
                xParams: xp,
                selectedMonth: vt === 'MONTH' ? CONSTANTS.MONTHS.indexOf(lbl) : null,
                selectedYear: vt === 'MONTH' ? (year || new Date().getUTCFullYear()) : null
            };
        },
        _graphTooltipHeader(vt, p, i, arr, dat) {
            const hhmm = (d) => `${String(TimeManager.hours(d)).padStart(2, '0')}:${String(TimeManager.minutes(d)).padStart(2, '0')}`;
            const viewingToday = (vt === 'DAY') && (!calendarState.selectedLabel || calendarState.selectedLabel === Formatter.dateLogical());
            const isLive = (i === arr.length - 1) && (viewingToday || (vt !== 'DAY' && p.x % 1 !== 0));
            const isArchivedEnd = (i === arr.length - 1) && !isLive;
            if (isLive) return `Today \u2022 ${hhmm(new Date())}`;
            if (isArchivedEnd) return "End of Period";
            if (vt === 'DAY') {
                const z = new Date(p.x);
                if (viewingToday) return `Today \u2022 ${hhmm(z)}`;
                return `${CONSTANTS.MONTHS_SHORT[TimeManager.month(z)]} ${String(TimeManager.date(z)).padStart(2, '0')} \u2022 ${hhmm(z)}`;
            }
            if (vt === 'WEEK') {
                const ds = dat.labels[Math.floor(p.x)];
                if (!ds) return "End of Period";
                const d = Formatter.parse(ds);
                const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
                return `${CONSTANTS.MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()} \u2022 ${dow}`;
            }
            if (vt === 'MONTH') {
                const z = Math.floor(p.x);
                const mIdx = (dat.selectedMonth != null) ? dat.selectedMonth : calendarState.month,
                    year = (dat.selectedYear != null) ? dat.selectedYear : (calendarState.year || new Date().getUTCFullYear());
                return `${CONSTANTS.MONTHS_SHORT[mIdx]} ${z} \u2022 ${year}`;
            }
            if (vt === 'ALL_TIME') {
                if (dat.actualDates && dat.actualDates[i]) {
                    const dd = Formatter.parse(dat.actualDates[i]);
                    return `${CONSTANTS.MONTHS_SHORT[dd.getUTCMonth()]} ${dd.getUTCDate()} \u2022 ${dd.getUTCFullYear()}`;
                }
                return "Tooltip";
            }
            if (vt === 'YEAR') {
                const mIdx = Math.floor(p.x);
                const mName = CONSTANTS.MONTHS[mIdx] || "December";
                const year = calendarState.year || new Date().getUTCFullYear();
                return `${mName} \u2022 ${year}`;
            }
            return "Tooltip";
        },
        draw() {
            Perf.start('graphDraw');
            if (document.hidden) {
                runtime.graphDirty = true;
                Perf.end('graphDraw');
                return;
            }
            const svg = dom.graphSvg,
                cont = dom.graphContainer;
            if (!svg || !cont) {
                Perf.end('graphDraw');
                return;
            }
            const dat = GraphController._transformData({
                    selectedData: calendarState.selectedData,
                    selectedLabel: calendarState.selectedLabel,
                    year: calendarState.year,
                    graphMode: graphState.mode
                }),
                tr = dat.trends,
                lbls = dat.labels,
                vt = dat.viewType,
                xp = dat.xParams;
            svg.textContent = '';
            svg.setAttribute('preserveAspectRatio', 'none');
            void cont.offsetHeight;
            const _cStyle = window.getComputedStyle(cont);
            const _padH = (parseFloat(_cStyle.paddingLeft) || 0) + (parseFloat(_cStyle.paddingRight) || 0);
            const _padV = (parseFloat(_cStyle.paddingTop) || 0) + (parseFloat(_cStyle.paddingBottom) || 0);
            let w = Math.round(cont.clientWidth - _padH);
            if (!(w > 0)) w = svg.clientWidth || cont.clientWidth;
            const _hudEl = cont.querySelector('.g-hud');
            const _hudH = _hudEl ? Math.ceil(_hudEl.getBoundingClientRect().height) : 28;
            let h = (cont.clientHeight > _hudH + _padV ? cont.clientHeight - _hudH - _padV : 0) || svg.clientHeight;
            if (w <= 0 || h <= 0) {
                Perf.end('graphDraw');
                requestAnimationFrame(() => GraphController.draw());
                return;
            }
            const cmp = w < 300;
            const expandedPanel = !!cont.closest('#bbgl-panel.bbgl-expanded:not(.bbgl-mode-page)');
            const isPageMode = !!cont.closest('#bbgl-panel.bbgl-mode-page');
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            let _yMin = Infinity,
                _yMax = -Infinity,
                _yHas = false;
            graphState.activeStats.forEach(s => {
                if (tr[s] && tr[s].length > 0) {
                    _yHas = true;
                    tr[s].forEach(p => {
                        if (!isFinite(p.y)) return;
                        if (p.y < _yMin) _yMin = p.y;
                        if (p.y > _yMax) _yMax = p.y;
                    });
                }
            });
            if (!_yHas || _yMin === Infinity) {
                _yMin = 0;
                STAT_KEYS.forEach(s => {
                    if (tr[s] && tr[s].length > 0) tr[s].forEach(p => {
                        if (isFinite(p.y) && p.y > _yMax) _yMax = p.y;
                    });
                });
            }
            if (_yMax === -Infinity) {
                _yMin = 0;
                _yMax = 10;
            }
            let sc = GraphController._calculateNiceScale(_yMin, _yMax),
                fMin = sc.min,
                fMax = sc.max,
                step = sc.step,
                steps = Math.round((fMax - fMin) / step);
            const pL = [];
            for (let i = 0; i <= steps; i++) pL.push(Formatter.axis(fMin + (i * step)));
            const _yMaxStr = pL.reduce((a, b) => b.length > a.length ? b : a, pL[0] || '10');
            const _yMT = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            _yMT.setAttribute('class', 'g-text y-label');
            _yMT.style.cssText = 'visibility:hidden;pointer-events:none;';
            svg.appendChild(_yMT);
            _yMT.textContent = _yMaxStr;
            const _yFontPx = parseFloat(window.getComputedStyle(_yMT).fontSize) || ((expandedPanel || cont.closest('.bbgl-mode-page')) ? 11 : (cmp ? 9 : 11));
            let _yLW = Math.ceil(_yMaxStr.length * _yFontPx * 0.40);
            const _yCap = Math.max(20, Math.floor(w * 0.28) - 5);
            if (_yLW > _yCap) _yLW = _yCap;
            svg.removeChild(_yMT);
            const xLabDrop = (cmp ? 8 : (expandedPanel ? 9 : 11)) + 1;
            const _topMar = isPageMode ? 6 : (expandedPanel ? 8 : 6);
            let mar = {
                top: _topMar,
                bottom: Math.max(2, xLabDrop - 3),
                left: _yLW + 7,
                right: 5
            };
            const cw = w - mar.left - mar.right,
                ch = h - mar.top - mar.bottom;
            if (cw <= 0 || ch <= 0) {
                Perf.end('graphDraw');
                return;
            }
            const bottomAxisGap = expandedPanel ? 2 : (isPageMode ? 1 : 0);
            const chPlot = Math.max(16, ch - bottomAxisGap);
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("transform", `translate(${mar.left}, ${mar.top})`);
            let fr = fMax - fMin;
            if (fr <= 0) {
                fMax = fMin + 10;
                fr = 10;
            }
            for (let i = 0; i <= steps; i++) {
                const v = fMin + (i * step),
                    y = chPlot - ((v - fMin) / fr) * chPlot;
                if (isNaN(y)) continue;
                const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
                l.setAttribute("x1", 0);
                l.setAttribute("x2", cw);
                l.setAttribute("y1", y);
                l.setAttribute("y2", y);
                l.setAttribute("class", "g-axis");
                g.appendChild(l);
                const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
                t.setAttribute("x", -6);
                t.setAttribute("y", expandedPanel ? y - 1 : y + 3);
                t.setAttribute("class", "g-text y-label");
                t.textContent = Formatter.axis(v);
                g.appendChild(t);
            }
            const gx = (v) => {
                    const r = xp.max - xp.min;
                    return r === 0 ? 0 : ((v - xp.min) / r) * cw;
                },
                gy = (v) => chPlot - ((v - fMin) / fr) * chPlot;
            (function _drawTicks() {
                const _addTick = (tx) => {
                    const tk = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    tk.setAttribute("x1", tx);
                    tk.setAttribute("x2", tx);
                    tk.setAttribute("y1", chPlot);
                    tk.setAttribute("y2", chPlot - 5);
                    tk.setAttribute("class", "g-axis");
                    g.appendChild(tk);
                };
                if (vt === 'DAY') {
                    for (let i = 0; i <= 12; i++) _addTick(gx(xp.min + (i * 7200000)));
                } else if (vt === 'ALL_TIME') {
                    if (dat.tier && dat.tier.startsWith('Mo')) {
                        const sw = 1;
                        for (let n = Math.ceil(xp.min / sw); n * sw <= xp.max + 0.001; n++) _addTick(gx(n * sw));
                    } else if (dat.tier && dat.tier.startsWith('Yr')) {
                        const oM = dat.anchorDate ? dat.anchorDate.getUTCMonth() : 0;
                        for (let k = 1;
                            (k * 12 - oM) <= xp.max + 0.001; k++) _addTick(gx(k * 12 - oM));
                    } else {
                        const r = xp.max - xp.min;
                        for (let i = 0; i <= r; i++) _addTick(gx(xp.min + i));
                    }
                } else {
                    const r = xp.max - xp.min;
                    for (let i = 0; i <= r; i++) _addTick(gx(xp.min + i));
                }
            })();
            const shouldSkipLbls = cmp && lbls.length >= 6 && !isPageMode;
            const _xr = xp.max - xp.min;
            let _monthPageXFs = null;
            if (vt === 'MONTH' && isPageMode && _xr > 0) {
                const _slotPx = cw / _xr;
                _monthPageXFs = Math.round(Math.max(7.25, Math.min(11, _slotPx / 1.35)) * 10) / 10;
            }
            lbls.forEach((l, i) => {
                let v = 0;
                if (vt === 'DAY') v = xp.min + (i * 7200000) + 3600000;
                else if (vt === 'YEAR') v = i + 0.5;
                else if (vt === 'MONTH') v = i + 1.5;
                else if (vt === 'WEEK') v = i + 0.5;
                else if (vt === 'ALL_TIME') v = i;
                if (v > xp.max) return;
                const x = gx(v);
                if ((vt === 'MONTH' || vt === 'ALL_TIME') && shouldSkipLbls && i % 2 !== 0) return;
                if (vt === 'YEAR' && shouldSkipLbls && i % 2 === 0) return;
                const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const yp = chPlot + xLabDrop + 3;
                t.setAttribute("x", x);
                t.setAttribute("y", yp);
                t.setAttribute("class", "g-text x-label");
                let txt = l;
                if (vt === 'DAY' && cmp) txt = l.replace(':00', '');
                if (vt === 'WEEK') {
                    const d = Formatter.parse(l);
                    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    txt = cmp ? shortDays[d.getUTCDay()] : fullDays[d.getUTCDay()];
                }
                if (vt === 'ALL_TIME' && cmp && typeof l === 'string' && l.indexOf(' ') !== -1) {
                    txt = l.split(' ')[1];
                }
                t.textContent = txt;
                t.setAttribute("text-anchor", "middle");
                if (_monthPageXFs != null && vt === 'MONTH') {
                    t.style.fontSize = _monthPageXFs + 'px';
                    if (_monthPageXFs < 9.5) t.style.letterSpacing = '0px';
                }
                g.appendChild(t);
            });
            if (vt === 'ALL_TIME' && dat.labelMeta) {
                const shouldSkipMeta = cmp && dat.labelMeta.length >= 6 && !isPageMode;
                dat.labelMeta.forEach((meta, i) => {
                    if (shouldSkipMeta && i % 2 !== 0) return;
                    if (meta.x < xp.min || meta.x > xp.max) return;
                    const lx = gx(meta.x);
                    const lyp = chPlot + xLabDrop + 3;
                    const lt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    lt.setAttribute("x", lx);
                    lt.setAttribute("y", lyp);
                    lt.setAttribute("class", "g-text x-label");
                    lt.setAttribute("text-anchor", "middle");
                    let txt = meta.text;
                    if (cmp && typeof txt === 'string' && txt.indexOf(' ') !== -1) {
                        txt = txt.split(' ')[0];
                    }
                    lt.textContent = txt;
                    g.appendChild(lt);
                });
            }
            graphState.activeStats.forEach(s => {
                if (!tr[s] || tr[s].length === 0) return;
                const arr = tr[s],
                    sty = arr[0].y,
                    col = (s === 'total' ? CONSTANTS.COLORS.TOT : (CONSTANTS.COLORS[s.toUpperCase()] || '#ffffff'));
                let str = sty;
                const vs = arr.find(p => p.y > 0);
                if (vs) str = vs.y;
                let d = "",
                    _ps = false;
                arr.forEach((p) => {
                    const x = gx(p.x),
                        y = gy(p.y);
                    if (!isFinite(x) || !isFinite(y)) {
                        _ps = false;
                        return;
                    }
                    if (!_ps) {
                        d += `M ${x} ${y}`;
                        _ps = true;
                    } else d += ` L ${x} ${y}`;
                });
                const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
                p.setAttribute("d", d);
                p.setAttribute("stroke", col);
                p.setAttribute("class", "g-path");
                p.setAttribute("vector-effect", "non-scaling-stroke");
                g.appendChild(p);
                const dns = (vt !== 'YEAR' && arr.length > 50);
                arr.forEach((p, i) => {
                    const x = gx(p.x),
                        y = gy(p.y),
                        grp = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    grp.setAttribute("class", "g-point-group");
                    grp.setAttribute("data-stat", s);
                    grp.setAttribute("data-cx", x);
                    grp.setAttribute("data-cy", y);
                    const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    hit.setAttribute("cx", x);
                    hit.setAttribute("cy", y);
                    hit.setAttribute("r", 8);
                    hit.setAttribute("fill", "transparent");
                    grp.appendChild(hit);
                    if (!dns || i === arr.length - 1) {
                        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        dot.setAttribute("cx", x);
                        dot.setAttribute("cy", y);
                        dot.setAttribute("r", 4);
                        dot.setAttribute("fill", col);
                        dot.setAttribute("class", "g-point-visual");
                        grp.appendChild(dot);
                    }
                    let stt = s === 'str' ? "STRENGTH" : s === 'def' ? "DEFENSE" : s === 'spd' ? "SPEED" : s === 'dex' ? "DEXTERITY" : "TOTAL STATS",
                        body = "";
                    const tl = GraphController._graphTooltipHeader(vt, p, i, arr, dat);
                    let prevVal = sty;
                    if (vt === 'YEAR') {
                        if (i === 0) prevVal = p.y;
                        else prevVal = arr[i - 1].y;
                    } else prevVal = sty;
                    if (graphState.mode === 'rates') {
                        const cr = p.y,
                            dl = cr - str,
                            sg = dl >= 0 ? '+' : '',
                            pc = str > 0 ? (dl / str) * 100 : 0;
                        body = `<div class="tt-row"><span class="tt-label">Rate</span> <span class="tt-total">${cr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div><div class="tt-row"><span class="tt-label">Growth</span> <span style="color:${dl >= 0 ? CONSTANTS.COLORS.GAINS : '#ff5252'}; font-weight:bold;">${sg}${dl.toFixed(2)} <span style="font-size:10px; opacity:0.8;">(${sg}${pc.toFixed(1)}%)</span></span></div>`;
                    } else if (graphState.mode === 'gains') body = `<div class="tt-row"><span class="tt-label">Gained</span> <span class="tt-val">+${Formatter.dual(p.y)}</span></div>`;
                    else {
                        const cv = p.y,
                            gv = (vt === 'YEAR' && i === 0) ? 0 : cv - prevVal,
                            gs = gv >= 0 ? '+' : '';
                        body = `<div class="tt-row"><span class="tt-label">Total</span> <span class="tt-total">${Formatter.number(cv)}</span></div><div class="tt-row"><span class="tt-label">Gains</span> <span class="tt-val">${gs}${Formatter.number(gv)}</span></div>`;
                    }
                    grp.setAttribute("data-tooltip-html", `<div class="tt-header" style="border:none; margin-bottom:0; padding-bottom:0;">${tl}</div><div style="text-align:center; font-weight:bold; font-size:10px; color:${col}; margin-bottom:4px; letter-spacing:1px;">${stt}</div><div style="border-bottom:1px solid rgba(255,255,240,0.15); margin-bottom:5px;"></div>${body}`);
                    g.appendChild(grp);
                });
            });
            svg.appendChild(g);
            GraphController._setupScrubbing(cont, svg, mar);
            Perf.end('graphDraw');
        },
        _calculateNiceScale(min, max) {
            if (min === max) return min === 0 ? {
                min: 0,
                max: 10,
                step: 5
            } : {
                min: Math.floor(min * 0.9),
                max: Math.ceil(max * 1.1),
                step: (Math.ceil(max * 1.1) - Math.floor(min * 0.9)) / 2
            };
            let r = max - min,
                rs = r / 4,
                exp = Math.floor(Math.log10(rs)),
                base = Math.pow(10, exp),
                frac = rs / base;
            let nf = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10,
                step = nf * base;
            const _aM = Math.max(Math.abs(min), Math.abs(max)),
                _mD = _aM >= 1e12 ? 1e12 : _aM >= 1e9 ? 1e9 : _aM >= 1e6 ? 1e6 : _aM >= 1e3 ? 1e3 : 1;
            if (step < 0.1 * _mD) step = 0.1 * _mD;
            let gMin = Math.floor(min / step) * step,
                gMax = Math.ceil(max / step) * step;
            if (Math.round((gMax - gMin) / step) + 1 > 5) {
                nf = nf === 1 ? 2 : nf === 2 ? 5 : nf === 5 ? 10 : 2;
                if (nf === 2 && step / base === 10) base *= 10;
                step = nf * base;
                gMin = Math.floor(min / step) * step;
                gMax = Math.ceil(max / step) * step;
            }
            if (gMax - max < (gMax - gMin) * 0.05) gMax += step;
            return {
                min: Math.max(0, gMin),
                max: gMax,
                step
            };
        },
        _setupScrubbing(c, s, m) {
            if (graphState.handlers.scrub) {
                c.removeEventListener('mousemove', graphState.handlers.scrub);
                c.removeEventListener('touchmove', graphState.handlers.scrub);
                c.removeEventListener('mousedown', graphState.handlers.start);
                c.removeEventListener('touchstart', graphState.handlers.start);
                window.removeEventListener('mouseup', graphState.handlers.end);
                window.removeEventListener('touchend', graphState.handlers.end);
                c.removeEventListener('mouseleave', graphState.handlers.end);
            }
            const gp = (e) => {
                const r = s.getBoundingClientRect(),
                    vb = s.viewBox.baseVal,
                    sx = vb.width / r.width,
                    sy = vb.height / r.height;
                let cx = e.clientX,
                    cy = e.clientY;
                if (e.type.includes('touch') && e.touches.length > 0) {
                    cx = e.touches[0].clientX;
                    cy = e.touches[0].clientY;
                }
                return {
                    x: (cx - r.left) * sx - m.left,
                    y: (cy - r.top) * sy - m.top
                };
            };
            const f = (x, y, st = null) => {
                const sl = st ? `.g-point-group[data-stat="${st}"]` : '.g-point-group',
                    grs = c.querySelectorAll(sl);
                let min = Infinity,
                    cl = null;
                grs.forEach(g => {
                    const gx = parseFloat(g.getAttribute('data-cx')),
                        gy = parseFloat(g.getAttribute('data-cy')),
                        d = Math.sqrt(Math.pow(gx - x, 2) + (st ? 0 : Math.pow(gy - y, 2)));
                    if (d < min) {
                        min = d;
                        cl = g;
                    }
                });
                return {
                    g: cl,
                    d: min
                };
            };
            const uh = (g) => {
                c.querySelectorAll('.g-point-group.active').forEach(z => z.classList.remove('active'));
                g.classList.add('active');
                TooltipController.show(g.getAttribute('data-tooltip-html'), g.getBoundingClientRect());
            };
            const ch = () => {
                c.querySelectorAll('.g-point-group.active').forEach(z => z.classList.remove('active'));
                TooltipController.hide();
            };
            const os = (e) => {
                if (e.type === 'touchstart' && e.target.closest('.g-hud')) return;
                if (e.type === 'touchstart') e.preventDefault();
                const p = gp(e),
                    cl = f(p.x, p.y);
                if (cl.g && cl.d < 15) {
                    graphState.isDragging = true;
                    graphState.lockedStat = cl.g.getAttribute('data-stat');
                    uh(cl.g);
                }
            };
            const om = (e) => {
                if (e.type === 'touchmove') e.preventDefault();
                const p = gp(e);
                if (graphState.isDragging && graphState.lockedStat) {
                    const m = f(p.x, p.y, graphState.lockedStat);
                    if (m.g) uh(m.g);
                } else {
                    const cl = f(p.x, p.y);
                    if (cl.g && cl.d < 30) uh(cl.g);
                    else ch();
                }
            };
            const oe = () => {
                graphState.isDragging = false;
                graphState.lockedStat = null;
            };
            graphState.handlers = {
                start: os,
                scrub: om,
                end: oe
            };
            c.addEventListener('mousedown', os);
            c.addEventListener('mousemove', om);
            window.addEventListener('mouseup', oe);
            c.addEventListener('touchstart', os, {
                passive: false
            });
            c.addEventListener('touchmove', om, {
                passive: false
            });
            window.addEventListener('touchend', oe);
            c.addEventListener('mouseleave', ch);
        },
        setupControls() {
            document.querySelectorAll('.g-pill').forEach(b => {
                b.onclick = (e) => {
                    e.stopPropagation();
                    const t = b.getAttribute('data-type'),
                        v = b.getAttribute('data-val');
                    if (t === 'mode') {
                        document.querySelectorAll('.g-pill[data-type="mode"]').forEach(x => x.classList.remove('active'));
                        b.classList.add('active');
                        graphState.mode = v;
                        viewState.graphMode = v;
                    } else if (t === 'stat') {
                        if (graphState.activeStats.includes(v)) {
                            graphState.activeStats = graphState.activeStats.filter(s => s !== v);
                            b.classList.remove('active');
                        } else {
                            graphState.activeStats.push(v);
                            b.classList.add('active');
                        }
                        viewState.graphStats = graphState.activeStats;
                    }
                    saveViewState();
                    GraphController.draw();
                }
            });
            runtime.resizeObserver = new ResizeObserver(() => {
                if (dom.topPanel && dom.topPanel.classList.contains('viewing-graph')) window.requestAnimationFrame(GraphController.draw);
            });
            runtime.resizeObserver.observe(dom.graphContainer);
        },
        restoreUi() {
            document.querySelectorAll('.g-pill[data-type="mode"]').forEach(b => {
                if (b.getAttribute('data-val') === graphState.mode) b.classList.add('active');
                else b.classList.remove('active');
            });
            document.querySelectorAll('.g-pill[data-type="stat"]').forEach(b => {
                if (graphState.activeStats.includes(b.getAttribute('data-val'))) b.classList.add('active');
                else b.classList.remove('active');
            });
        },
        applyDefaultsIfNeeded() {
            if (viewState.graphStats) return;
            if (_historyCache) {
                let lastTrainedWeekStart = null;
                const statsTrainedInThatWeek = new Set();
                const daysToCheck = [...((_historyCache.history || []))];
                if (_historyCache.today) daysToCheck.push(_historyCache.today);
                for (let i = daysToCheck.length - 1; i >= 0; i--) {
                    const day = daysToCheck[i];
                    const eSpent = day.eSpent || {};
                    if (!(eSpent.total > 0)) continue;
                    const dayWeekStart = getWeekKey(day.date);
                    if (!lastTrainedWeekStart) lastTrainedWeekStart = dayWeekStart;
                    if (dayWeekStart === lastTrainedWeekStart) {
                        if (eSpent.str > 0) statsTrainedInThatWeek.add('str');
                        if (eSpent.def > 0) statsTrainedInThatWeek.add('def');
                        if (eSpent.spd > 0) statsTrainedInThatWeek.add('spd');
                        if (eSpent.dex > 0) statsTrainedInThatWeek.add('dex');
                    } else break;
                }
                if (statsTrainedInThatWeek.size > 0) graphState.activeStats = Array.from(statsTrainedInThatWeek);
            }
            viewState.graphStats = graphState.activeStats;
            graphState.mode = 'values';
            viewState.graphMode = 'gains';
            saveViewState();
        }
    };
    /**
     *  [SECTION VIII] THE GAINS (Sticker Engine)
     *  ========================================================================
     *  You may not get laid, but you'll have
     *  the sticker to prove it.
     */

    function loadStickerData() {
        DataController.getStickerMap();
        const unlocked = runtime.demoMode ? 1 : (DataController._cache.unlockedCount || 1);
        const it = [];
        for (let i = 1; i <= 50; i++) {
            const c = CUSTOM_STICKERS.find(s => s.id === i);
            if (c) it.push({
                type: 'image',
                ...c,
                unlocked: i <= unlocked
            });
            else it.push(null);
        }
        runtime.stickerData = it;
    }

    function renderStickers() {
        Perf.start('renderStickers');
        if (!runtime.stickerData.length) loadStickerData();
        if (runtime.currentStickerPage === -1) {
            renderSponsorshipPage();
            Perf.end('renderStickers');
            return;
        }
        const sg = document.getElementById('bbgl-sponsor-grid');
        if (sg) sg.style.display = 'none';
        if (dom.stickerGrid) dom.stickerGrid.style.display = '';
        const dc = dom.stickerPagination,
            te = dom.stickerTitle;
        if (te) te.innerText = PAGE_TITLES[runtime.currentStickerPage] || "";
        const tp = Math.ceil(runtime.stickerData.length / 10),
            pb = dom.stickerPrev,
            nb = dom.stickerNext,
            sb = dom.stickerSponsor;
        if (pb) {
            if (runtime.currentStickerPage <= 0) pb.classList.add('disabled');
            else pb.classList.remove('disabled');
        }
        if (sb) {
            if (runtime.currentStickerPage === 0) sb.classList.remove('disabled');
            else sb.classList.add('disabled');
        }
        if (nb) {
            if (runtime.currentStickerPage >= tp - 1) nb.classList.add('disabled');
            else nb.classList.remove('disabled');
        }
        if (dc) {
            dc.innerHTML = '';
            const sd = document.createElement('div');
            sd.className = 'pg-dot';
            sd.onclick = () => {
                runtime.currentStickerPage = -1;
                viewState.currentStickerPage = -1;
                saveViewState();
                renderStickers();
            };
            dc.appendChild(sd);
            for (let i = 0; i < tp; i++) {
                const d = document.createElement('div');
                d.className = `pg-dot ${i === runtime.currentStickerPage ? 'active' : ''}`;
                d.onclick = () => {
                    runtime.currentStickerPage = i;
                    renderStickers();
                };
                dc.appendChild(d);
            }
        }
        const start = runtime.currentStickerPage * 10,
            pi = runtime.stickerData.slice(start, start + 10);
        if (runtime.stickerSlots.length === 0) {
            Perf.end('renderStickers');
            return;
        }
        let comingSoonDiv = document.getElementById('bbgl-coming-soon');
        if (runtime.currentStickerPage >= 2) {
            for (let i = 0; i < 10; i++) runtime.stickerSlots[i].style.display = 'none';
            if (!comingSoonDiv) {
                const g = document.getElementById('bbgl-sticker-container') || dom.stickerContainer;
                if (g) {
                    const cs = document.createElement('div');
                    cs.id = 'bbgl-coming-soon';
                    cs.className = 'bbgl-coming-soon';
                    cs.innerHTML = 'Cumming<br>Soon...';
                    g.appendChild(cs);
                }
            } else comingSoonDiv.style.display = 'block';
        } else {
            if (comingSoonDiv) comingSoonDiv.style.display = 'none';
            for (let i = 0; i < 10; i++) {
                const sl = runtime.stickerSlots[i],
                    img = sl.querySelector('.sticker-img'),
                    it = pi[i];
                sl.style.display = '';
                if (it) {
                    sl.className = 'sticker-slot active-slot';
                    if (it.unlocked) {
                        sl.classList.add('has-item');
                        sl.classList.remove('locked');
                        sl.setAttribute('data-tooltip', `${it.name}`);
                        sl.onclick = () => openItemViewer(it);
                    } else {
                        sl.classList.add('has-item', 'locked');
                        sl.setAttribute('data-tooltip', TOOLTIPS.LOCKED);
                        sl.onclick = null;
                    }
                    if (img.src !== it.url) img.src = it.url;
                } else {
                    sl.className = 'sticker-slot';
                    sl.onclick = null;
                }
            }
        }
        Perf.end('renderStickers');
    }

    function animateViewer(ts) {
        if (document.hidden || runtime.currentOpenedItemId === null || viewState.subView !== 'stickers' && viewState.subView !== 'viewer' && runtime.currentOpenedItemId === null) {
            if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
            runtime.viewerLoopId = null;
            return;
        }
        if (!runtime.lastFrameTime) runtime.lastFrameTime = ts;
        const el = ts - runtime.lastFrameTime;
        if (el > 17) {
            runtime.lastFrameTime = ts - (el % 17);
            const ped = dom.viPedestal,
                obj = dom.viObj;
            if (ped && obj) {
                runtime.viewerRotation += runtime.viewerSpeed;
                ped.style.transform = `rotateY(${runtime.viewerRotation}deg) translateZ(0)`;
                if (obj.classList.contains('is-image')) {
                    const rad = (runtime.viewerRotation * Math.PI) / 180,
                        br = (0.7 + (Math.sin(rad) * 0.3)).toFixed(2),
                        isF = Math.cos(rad) > -0.2 ? 1 : 0;
                    obj.style.setProperty('--sheen-pos', (runtime.viewerRotation * 2.5) + '% 0%');
                    obj.style.setProperty('--back-brightness', br);
                    obj.style.setProperty('--sheen-opacity', isF);
                }
            }
        }
        runtime.viewerLoopId = requestAnimationFrame(animateViewer);
    }
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && runtime.currentOpenedItemId !== null) {
            if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
            animateViewer();
        }
    });

    function openItemViewer(it, sv = true) {
        if (runtime.currentOpenedItemId === it.id) return;
        if (sv) {
            viewState.activeItemId = it.id;
            saveViewState();
        }
        TooltipController.hide();
        const v = dom.itemViewer,
            bp = dom.bottomPanel,
            nm = dom.viName,
            ob = dom.viObj,
            lf = ob.querySelector('.layer-front'),
            lb = ob.querySelector('.layer-back'),
            st = document.querySelector('.viewer-stage');
        runtime.currentOpenedItemId = it.id;
        bp.style.setProperty('display', 'none', 'important');
        v.classList.add('active');
        v.style.setProperty('display', 'flex', 'important');
        let ped = dom.viPedestal;
        if (!ped) {
            ped = document.createElement('div');
            ped.id = 'vi-pedestal-wrapper';
            ped.className = 'viewer-pedestal';
            st.appendChild(ped);
            ped.appendChild(ob);
            dom.viPedestal = ped;
        }
        nm.innerText = it.name;
        if (it.type === 'image') {
            ob.classList.add('is-image');
            ob.style.setProperty('--bg-mask', `url('${it.url}')`);
            if (lf) lf.style.backgroundImage = `url('${it.url}')`;
            if (lb) {
                lb.style.webkitMaskImage = `url('${it.url}')`;
                lb.style.maskImage = `url('${it.url}')`;
            }
        }
        runtime.viewerRotation = 0;
        runtime.viewerSpeed = 0.3;
        if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
        requestAnimationFrame(animateViewer);
        const spdUp = () => {
                runtime.viewerSpeed = 3;
            },
            spdDn = () => {
                runtime.viewerSpeed = 0.3;
            };
        st.onmousedown = spdUp;
        st.ontouchstart = spdUp;
        st.onmouseup = spdDn;
        st.onmouseleave = spdDn;
        st.ontouchend = spdDn;
        st.ontouchcancel = spdDn;
    }

    function closeItemViewer(sv = true) {
        if (sv) {
            viewState.activeItemId = null;
            saveViewState();
        }
        runtime.currentOpenedItemId = null;
        if (runtime.viewerLoopId) {
            cancelAnimationFrame(runtime.viewerLoopId);
            runtime.viewerLoopId = null;
        }
        const v = dom.itemViewer,
            bp = dom.bottomPanel;
        if (v) {
            v.classList.remove('active');
            v.style.setProperty('display', 'none', 'important');
        }
        if (bp) {
            bp.style.removeProperty('display');
            if (getComputedStyle(bp).display === 'none') bp.style.display = 'flex';
        }
    }

    function setupStickerGrid() {
        const g = dom.stickerGrid;
        if (!g) return;
        runtime.stickerSlots = [];
        g.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const s = document.createElement('div'),
                m = document.createElement('img');
            s.className = 'sticker-slot';
            m.className = 'sticker-img';
            s.appendChild(m);
            g.appendChild(s);
            runtime.stickerSlots.push(s);
        }
        const container = dom.stickerContainer;
        if (container && !document.getElementById('bbgl-sponsor-grid')) {
            const sg = document.createElement('div');
            sg.id = 'bbgl-sponsor-grid';
            sg.style.display = 'none';
            const pts = getSponsorBurstPoints();
            for (let i = 0; i < 3; i++) {
                const slot = document.createElement('div');
                slot.className = 'sticker-slot sticker-slot-sponsor active-slot locked';
                const labelText = i === 0 ? 'Corleone Faction<br>Sticker Here ;)' : 'Your Faction<br>Sticker Here';
                slot.innerHTML = `<svg class="sponsor-sticker-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts}" fill="#ffffff"/></svg><span class="sponsor-sticker-label">${labelText}</span>`;
                sg.appendChild(slot);
            }
            const pag = dom.stickerPagination;
            if (pag && pag.parentElement === container) container.insertBefore(sg, pag);
            else container.appendChild(sg);
        }
        renderStickers();
    }
    let _sponsorBurstPoints = null;

    function getSponsorBurstPoints() {
        if (_sponsorBurstPoints) return _sponsorBurstPoints;
        const pts = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i * 18 - 90) * Math.PI / 180;
            const r = (i % 2 === 0) ? 48 : 36;
            const x = (50 + r * Math.cos(angle)).toFixed(2);
            const y = (50 + r * Math.sin(angle)).toFixed(2);
            pts.push(`${x},${y}`);
        }
        _sponsorBurstPoints = pts.join(' ');
        return _sponsorBurstPoints;
    }

    function renderSponsorshipPage() {
        if (dom.stickerTitle) dom.stickerTitle.innerText = "Sponsorship";
        if (dom.stickerGrid) dom.stickerGrid.style.display = 'none';
        const comingSoon = document.getElementById('bbgl-coming-soon');
        if (comingSoon) comingSoon.style.display = 'none';
        const sg = document.getElementById('bbgl-sponsor-grid');
        if (sg) sg.style.display = 'grid';
        if (dom.stickerPrev) dom.stickerPrev.classList.add('disabled');
        if (dom.stickerSponsor) dom.stickerSponsor.classList.add('disabled');
        if (dom.stickerNext) dom.stickerNext.classList.remove('disabled');
        const dc = dom.stickerPagination;
        if (dc) {
            dc.innerHTML = '';
            const tp = Math.ceil(runtime.stickerData.length / 10);
            const sd = document.createElement('div');
            sd.className = 'pg-dot pg-dot-sponsor active';
            sd.onclick = () => {
                runtime.currentStickerPage = -1;
                viewState.currentStickerPage = -1;
                saveViewState();
                renderStickers();
            };
            dc.appendChild(sd);
            for (let i = 0; i < tp; i++) {
                const d = document.createElement('div');
                d.className = 'pg-dot';
                d.onclick = () => {
                    runtime.currentStickerPage = i;
                    viewState.currentStickerPage = i;
                    saveViewState();
                    renderStickers();
                };
                dc.appendChild(d);
            }
        }
    }

    /**
     *  [SECTION IX] THE MOTIVATION (Init & Event Handling)
     *  ========================================================================
     *  A clean, pure, and sober reason to keep it all going.
     *  Like church, but without the Priest.
     */

    function handleGymClick(e) {
        const b = e.target.closest('button');
        if (!b) return;
        const l = b.getAttribute('aria-label');
        if (!l) return;
        let id = null;
        if (l === 'Train strength') id = 5300;
        else if (l === 'Train defense') id = 5301;
        else if (l === 'Train speed') id = 5302;
        else if (l === 'Train dexterity') id = 5303;
        if (id) {
            sessionStorage.setItem(KEYS.SESSION, 'true');
            if (!runtime.trainDebouncers) runtime.trainDebouncers = {};
            if (runtime.trainDebouncers[id]) clearTimeout(runtime.trainDebouncers[id]);
            runtime.trainDebouncers[id] = setTimeout(() => {
                universalFetch('TRAIN_SINGLE', {
                    specId: id
                });
                runtime.trainDebouncers[id] = null;
            }, 2500);
        }
    }

    function setBestGym(v) {
        userConfig.bestGym = v;
        saveConfig();
        const a = document.getElementById('set-bestgym-toggle');
        if (a) a.checked = v;
        const b = document.getElementById('bbgl-bestgym-input');
        if (b) b.checked = v;
        const sp = document.getElementById('set-bestgym-spec-toggle');
        if (sp) {
            const row = sp.closest('.bbgl-setting-row');
            if (row) row.classList.toggle('bbgl-row-disabled', !v);
        }
        const up = document.getElementById('set-bestgym-unpurch-toggle');
        if (up) {
            const row = up.closest('.bbgl-setting-row');
            if (row) row.classList.toggle('bbgl-row-disabled', !v);
        }
    }

    function updateCellSelection(newLabel) {
        const c = dom.calContainer;
        if (!c) return;
        c.querySelectorAll('.bbgl-day-cell.is-viewing').forEach(el => {
            el.classList.remove('is-viewing');
            if (!el.matches(':hover')) el.classList.remove('shimmer-active');
        });
        c.querySelectorAll('.bbgl-weekly-track.is-viewing').forEach(el => el.classList.remove('is-viewing'));
        if (!newLabel) {
            const today = document.getElementById('active-date-today');
            if (today) today.classList.add('is-viewing');
            return;
        }
        const dC = c.querySelector(`.bbgl-day-cell[data-date="${newLabel}"]`);
        if (dC) {
            dC.classList.add('is-viewing');
            if (userConfig.animations && !dC.classList.contains('shimmer-active')) dC.classList.add('shimmer-active');
            return;
        }
        const track = c.querySelector(`.bbgl-weekly-track[data-label="${newLabel}"]`);
        if (track) track.classList.add('is-viewing');
    }

    function openHistory(d, l) {
        if (runtime.isViewAnimating) {
            dom.ledgerView.classList.remove('bbgl-crt-out', 'bbgl-crt-in');
            runtime.isViewAnimating = false;
        }
        viewState.activeViewLabel = l;
        saveViewState();
        if (calendarState.selectedLabel === l && !dom.topPanel.classList.contains('viewing-graph')) return;
        runtime.isViewAnimating = true;
        calendarState.selectedData = d;
        calendarState.selectedLabel = l;
        closeItemViewer();
        updateCellSelection(l);
        const tp = dom.topPanel;
        if (tp.classList.contains('viewing-stickers')) {
            switchView('ledger');
            setTimeout(() => {
                renderStats(d, l);
            }, 300);
            return;
        }
        if (tp.classList.contains('viewing-graph')) {
            GraphController.draw();
            const de = dom.dateLabel;
            if (de) de.innerText = Formatter.datePretty(l) || l;
            runtime.isViewAnimating = false;
        } else {
            const el = dom.ledgerView;
            if (userConfig.animations) {
                el.classList.add('bbgl-crt-out');
                setTimeout(() => {
                    el.classList.remove('bbgl-crt-out');
                    renderStats(d, l);
                    el.classList.add('bbgl-crt-in');
                    setTimeout(() => {
                        el.classList.remove('bbgl-crt-in');
                        runtime.isViewAnimating = false;
                    }, 300);
                }, 280);
            } else {
                renderStats(d, l);
                runtime.isViewAnimating = false;
            }
        }
    }

    function closeHistory(e) {
        if (e) e.stopPropagation();
        if (!calendarState.selectedData) return;
        if (runtime.isViewAnimating) {
            dom.ledgerView.classList.remove('bbgl-crt-out', 'bbgl-crt-in');
            runtime.isViewAnimating = false;
        }
        viewState.activeViewLabel = null;
        saveViewState();
        runtime.isViewAnimating = true;
        calendarState.selectedData = null;
        calendarState.selectedLabel = null;
        updateCellSelection(null);
        const tp = dom.topPanel,
            ts = Formatter.dateLogical();
        if (tp.classList.contains('viewing-graph')) {
            GraphController.draw();
            const de = dom.dateLabel;
            if (de) de.innerText = Formatter.datePretty(ts) || ts;
            runtime.isViewAnimating = false;
        } else if (tp.classList.contains('viewing-stickers')) runtime.isViewAnimating = false;
        else {
            const el = dom.ledgerView;
            if (userConfig.animations) {
                el.classList.add('bbgl-crt-out');
                setTimeout(() => {
                    el.classList.remove('bbgl-crt-out');
                    renderStats(getActiveHistory().today, ts);
                    el.classList.add('bbgl-crt-in');
                    setTimeout(() => {
                        el.classList.remove('bbgl-crt-in');
                        runtime.isViewAnimating = false;
                    }, 300);
                }, 280);
            } else {
                renderStats(getActiveHistory().today, ts);
                runtime.isViewAnimating = false;
            }
        }
    }

    function changeMonth(d) {
        const c = dom.calContainer;
        if (!c) return;
        let m = calendarState.month + d,
            y = calendarState.year;
        if (m > 11) {
            m = 0;
            y++;
        }
        if (m < 0) {
            m = 11;
            y--;
        }
        if (!userConfig.animations) {
            calendarState.month = m;
            calendarState.year = y;
            viewState.calYear = y;
            viewState.calMonth = m;
            saveViewState();
            renderPanelContent();
            return;
        }
        c.parentElement.querySelectorAll('.bbgl-cal-ghost').forEach(g => g.remove());
        const ghost = c.cloneNode(true);
        ghost.className += ' bbgl-cal-ghost';
        ghost.style.animation = d > 0 ? 'bbgl-slide-out-l 0.3s ease forwards' : 'bbgl-slide-out-r 0.3s ease forwards';
        c.parentElement.appendChild(ghost);
        const removeGhost = () => {
            if (ghost.parentElement) ghost.remove();
        };
        ghost.addEventListener('animationend', removeGhost, {
            once: true
        });
        const ghostTimer = setTimeout(removeGhost, 400);
        ghost.addEventListener('animationend', () => clearTimeout(ghostTimer), {
            once: true
        });
        calendarState.month = m;
        calendarState.year = y;
        viewState.calYear = y;
        viewState.calMonth = m;
        saveViewState();
        c.style.willChange = 'transform';
        renderPanelContent();
        c.style.animation = d > 0 ? 'bbgl-slide-in-r 0.3s ease forwards' : 'bbgl-slide-in-l 0.3s ease forwards';
        c.addEventListener('animationend', () => {
            c.style.animation = '';
            c.style.willChange = 'auto';
        }, {
            once: true
        });
    }

    function changeStickerPage(d) {
        if (!userConfig.animations) {
            viewState.currentStickerPage += d;
            runtime.currentStickerPage = viewState.currentStickerPage;
            saveViewState();
            renderStickers();
            return;
        }
        const oldActive = (runtime.currentStickerPage === -1) ? document.getElementById('bbgl-sponsor-grid') : dom.stickerGrid,
            bg = dom.stickerGridBg;
        if (oldActive) {
            const ghost = oldActive.cloneNode(true);
            ghost.style.pointerEvents = 'none';
            ghost.style.position = 'absolute';
            ghost.style.top = '0';
            ghost.style.left = '0';
            ghost.style.width = '100%';
            ghost.style.animation = d > 0 ? 'bbgl-slide-out-l 0.3s ease forwards' : 'bbgl-slide-out-r 0.3s ease forwards';
            oldActive.parentElement.appendChild(ghost);
            const removeGhost = () => {
                if (ghost.parentElement) ghost.remove();
            };
            ghost.addEventListener('animationend', removeGhost, {
                once: true
            });
            const ghostTimer = setTimeout(removeGhost, 400);
            ghost.addEventListener('animationend', () => clearTimeout(ghostTimer), {
                once: true
            });
        }
        if (bg) {
            const bgGhost = bg.cloneNode(true);
            bgGhost.style.pointerEvents = 'none';
            bgGhost.style.position = 'absolute';
            bgGhost.style.top = '0';
            bgGhost.style.left = '0';
            bgGhost.style.width = '100%';
            bgGhost.style.animation = d > 0 ? 'bbgl-slide-out-l 0.3s ease forwards' : 'bbgl-slide-out-r 0.3s ease forwards';
            bg.parentElement.appendChild(bgGhost);
            const removeBgGhost = () => {
                if (bgGhost.parentElement) bgGhost.remove();
            };
            bgGhost.addEventListener('animationend', removeBgGhost, {
                once: true
            });
            const bgGhostTimer = setTimeout(removeBgGhost, 400);
            bgGhost.addEventListener('animationend', () => clearTimeout(bgGhostTimer), {
                once: true
            });
        }
        viewState.currentStickerPage += d;
        runtime.currentStickerPage = viewState.currentStickerPage;
        saveViewState();
        renderStickers();
        const newActive = (runtime.currentStickerPage === -1) ? document.getElementById('bbgl-sponsor-grid') : dom.stickerGrid;
        if (newActive) {
            newActive.style.animation = d > 0 ? 'bbgl-slide-in-r 0.3s ease forwards' : 'bbgl-slide-in-l 0.3s ease forwards';
            newActive.addEventListener('animationend', () => newActive.style.animation = '', {
                once: true
            });
        }
        if (bg) {
            bg.style.animation = d > 0 ? 'bbgl-slide-in-r 0.3s ease forwards' : 'bbgl-slide-in-l 0.3s ease forwards';
            bg.addEventListener('animationend', () => bg.style.animation = '', {
                once: true
            });
        }
    }

    function toggleMonthDropdown() {
        const d = dom.monthDropdown;
        dom.yearDropdown.classList.remove('show');
        d.innerHTML = '';
        CONSTANTS.MONTHS_SHORT.forEach((m, i) => {
            const x = document.createElement('div');
            x.className = `drop-item ${i === calendarState.month ? 'active' : ''}`;
            x.textContent = m;
            x.onclick = () => {
                calendarState.month = i;
                renderPanelContent();
            };
            d.appendChild(x);
        });
        d.classList.toggle('show');
    }

    function toggleYearDropdown() {
        const d = dom.yearDropdown;
        dom.monthDropdown.classList.remove('show');
        d.innerHTML = '';
        const s = getActiveHistory(),
            ys = new Set();
        s.history.forEach(z => ys.add(parseInt(z.date.split('-')[0])));
        if (s.today.date) ys.add(parseInt(s.today.date.split('-')[0]));
        Array.from(ys).sort().reverse().forEach(y => {
            const x = document.createElement('div');
            x.className = `drop-item ${y === calendarState.year ? 'active' : ''}`;
            x.textContent = y;
            x.onclick = () => {
                calendarState.year = y;
                renderPanelContent();
            };
            d.appendChild(x);
        });
        d.classList.toggle('show');
    }

    function calcAllTimeStats() {
        const sl = DataController.getSlice('ALL', 'All-Time');
        openHistory(sl, 'All-Time');
    }

    function calcPeriodStats(t) {
        const lbl = (t === 'month') ? CONSTANTS.MONTHS[calendarState.month] : String(calendarState.year),
            m = (t === 'month') ? 'MONTH' : 'YEAR',
            sl = DataController.getSlice(m, lbl, calendarState.year);
        openHistory(sl, lbl);
    }

    function checkViewRouting() {
        const pm = window.location.hash.includes('gymlog');
        syncSidebarState();
        if (pm) {
            document.title = "Gym Log | TORN";
            document.body.classList.add('bbgl-page-mode-active');
            renderPageMode();
            if (localStorage.getItem(KEYS.CHANGELOG_NOTIF) === '1') {
                localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
                localStorage.removeItem(KEYS.CHANGELOG_NOTIF);
                syncChangelogNotif(false);
                setTimeout(() => openChangelogModal(), 400);
            }
        } else {
            document.body.classList.remove('bbgl-page-mode-active');
            const cw = document.querySelector('.content-wrapper'),
                pc = document.getElementById('bbgl-page-container');
            if (cw && pc) pc.remove();
            if (viewState.isOpen) {
                const lp = dom.panel;
                if (lp && lp.classList.contains('bbgl-mode-page')) {
                    lp.remove();
                    dom.panel = null;
                }
                togglePanel(false);
            } else {
                viewState.subView = 'ledger';
                viewState.activeItemId = null;
                viewState.activeViewLabel = null;
                viewState.isTall = false;
                calendarState.selectedData = null;
                calendarState.selectedLabel = null;
            }
        }
        updateFooterTooltip();
    }

    function renderPageMode() {
        const H = `<div class="bbgl-native-header"><div class="bbgl-native-title"><span style="margin-left:8px;">Big Black Gym Log</span></div><div class="bbgl-native-links"><div id="bbgl-page-demo-exit" class="bbgl-native-link" style="display:${runtime.demoMode ? 'flex' : 'none'};"><span class="bbgl-demo-x-label">Demo</span>${ICONS.CLOSE}</div><div id="bbgl-page-settings" class="bbgl-native-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.58 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.08-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>Settings</div></div></div>`,
            cw = document.querySelector('.content-wrapper');
        if (!cw) return;
        window.scrollTo(0, 0);
        const pp = dom.panel;
        if (pp && !pp.classList.contains('bbgl-mode-page')) {
            pp.remove();
            dom.panel = null;
        }
        if (document.getElementById('bbgl-page-container')) return;
        cw.innerHTML = '';
        const pc = document.createElement('div');
        pc.id = 'bbgl-page-container';
        pc.innerHTML = H;
        const sb = pc.querySelector('#bbgl-page-settings');
        if (sb) sb.onclick = toggleSettingsView;
        const p = document.createElement('div');
        p.id = 'bbgl-panel';
        p.className = 'bbgl-mode-page';
        p.innerHTML = getDashboardHTML();
        pc.appendChild(p);
        cw.appendChild(pc);
        setupEventListeners(p);
        const pdeb = pc.querySelector('#bbgl-page-demo-exit');
        const demoBar = p.querySelector('#bbgl-demo-exit');
        if (pdeb && demoBar) pdeb.onclick = (e) => {
            e.stopPropagation();
            demoBar.onclick(e);
        };
        restoreInternalState();
        renderPanelContent();
        if (dom.topPanel.classList.contains('viewing-graph')) setTimeout(GraphController.draw, 100);
    }

    function togglePanel(click = false) {
        if (window.location.hash.includes('gymlog')) return;
        let p = document.getElementById('bbgl-panel');
        const b = dom.gymTab;
        if (click && p && p.style.display !== 'none') {
            closePanel();
            return;
        }
        if (!p) {
            p = document.createElement('div');
            p.id = 'bbgl-panel';
            if (viewState.expanded) p.classList.add('bbgl-expanded');
            if (viewState.isTall) p.classList.add('bbgl-tall');
            p.innerHTML = getDashboardHTML();
            document.body.appendChild(p);
            setupEventListeners(p);
        }
        if (p.style.display === 'none' || !p.style.display) {
            restoreInternalState();
            p.style.opacity = '0';
            p.style.display = 'flex';
            handleLayout();
            void p.offsetWidth;
            updateTransformOrigin();
            if (b) b.classList.add('bbgl-tab-active');
            p.classList.remove('bbgl-animate-vanish', 'bbgl-animate-pop');
            if (userConfig.animations) {
                void p.offsetWidth;
                p.classList.add('bbgl-animate-pop');
            }
            p.style.opacity = '';
            if (click) {
                viewState.isOpen = true;
                saveViewState();
            }
        } else if (click) closePanel();
    }

    function restoreInternalState() {
        const mp = dom.panel;
        if (viewState.calYear && viewState.calMonth !== undefined && viewState.calMonth !== null) {
            calendarState.year = viewState.calYear;
            calendarState.month = viewState.calMonth;
        }
        if (viewState.currentStickerPage !== undefined) runtime.currentStickerPage = viewState.currentStickerPage;
        GraphController.applyDefaultsIfNeeded();
        if (viewState.graphMode) graphState.mode = (viewState.graphMode === 'gains' ? 'values' : viewState.graphMode) || 'values';
        if (viewState.graphStats) graphState.activeStats = viewState.graphStats;
        GraphController.restoreUi();
        if (viewState.activeViewLabel) {
            const s = getActiveHistory();
            let td = null;
            if (/^\d{4}-\d{2}-\d{2}$/.test(viewState.activeViewLabel)) {
                td = s.history.find(d => d.date === viewState.activeViewLabel);
                if (!td && s.today.date === viewState.activeViewLabel) td = s.today;
                if (td) {
                    calendarState.selectedData = td;
                    calendarState.selectedLabel = viewState.activeViewLabel;
                    renderStats(td, viewState.activeViewLabel);
                }
            } else {
                const mn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                if (mn.includes(viewState.activeViewLabel)) calcPeriodStats('month');
                else if (/^\d{4}$/.test(viewState.activeViewLabel)) calcPeriodStats('year');
                else if (viewState.activeViewLabel === 'All-Time') calcAllTimeStats();
            }
        }
        renderPanelContent();
        const et = () => {
            if (mp && !mp.classList.contains('bbgl-mode-page') && !mp.classList.contains('bbgl-tall')) {
                mp.classList.add('bbgl-tall');
                const t = dom.tallToggle;
                if (t) t.innerText = "–";
                viewState.isTall = true;
                saveViewState();
            }
        };
        const _hasData = _historyCache && (_historyCache.history.length > 0 || (_historyCache.meta && _historyCache.meta.logStartDate));
        if (viewState.subView === 'settings') switchView('settings', true);
        else if (viewState.subView === 'welcome' || (!runtime.demoMode && !_hasData && !localStorage.getItem('bbgl_initialized'))) switchView('welcome', true);
        else if (viewState.subView === 'graph') {
            et();
            switchView('graph', true);
            setTimeout(() => window.requestAnimationFrame(() => GraphController.draw()), 350);
        } else if (viewState.subView === 'stickers') {
            et();
            if (!runtime.stickerData || runtime.stickerData.length === 0) loadStickerData();
            let ti = Number(viewState.activeItemId);
            if (!ti || ti < 1) {
                ti = 1;
                viewState.activeItemId = 1;
                saveViewState();
            }
            switchView('stickers', true);
            const i = runtime.stickerData.find(x => x.id === ti);
            if (i) {
                const bp = dom.bottomPanel;
                if (bp) bp.style.setProperty('display', 'none', 'important');
                setTimeout(() => openItemViewer(i, false), 50);
            }
        } else if (viewState.subView === 'achievements') {
            et();
            switchView('achievements', true);
        } else switchView('ledger', true);
    }

    function switchView(tgt, inst = false) {
        const tp = dom.topPanel,
            bp = dom.bottomPanel,
            sp = dom.settingsView,
            vp = dom.itemViewer,
            wv = dom.welcomeView;
        let cm = 'ledger';
        if (wv && wv.classList.contains('active-view')) cm = 'welcome';
        else if (sp.classList.contains('active-view')) cm = 'settings';
        else if (tp.classList.contains('viewing-graph')) cm = 'graph';
        else if (tp.classList.contains('viewing-stickers')) cm = 'stickers';
        else if (tp.classList.contains('viewing-achievements')) cm = 'achievements';
        if (cm === tgt && !inst) return;
        if (cm === 'stickers' && tgt !== 'stickers' && !inst) {
            runtime.currentStickerPage = 0;
            viewState.currentStickerPage = 0;
        }
        viewState.subView = tgt;
        saveViewState();
        runtime.currentOpenedItemId = null;
        if (runtime.viewerLoopId) {
            cancelAnimationFrame(runtime.viewerLoopId);
            runtime.viewerLoopId = null;
        }
        const gel = (m) => {
                if (m === 'settings') return sp;
                if (m === 'welcome') return wv;
                if (m === 'graph') return dom.graphContainer;
                if (m === 'stickers') return dom.stickerContainer;
                if (m === 'achievements') return dom.achievementsContainer;
                return dom.ledgerView;
            },
            cel = gel(cm),
            nel = gel(tgt);
        const app = () => {
            tp.classList.remove('viewing-graph', 'viewing-stickers', 'viewing-achievements');
            sp.classList.remove('active-view');
            if (wv) wv.classList.remove('active-view');
            tp.style.display = 'flex';
            if (!(tgt === 'stickers' && viewState.activeItemId)) {
                bp.style.removeProperty('display');
                if (getComputedStyle(bp).display === 'none') bp.style.display = 'flex';
                vp.classList.remove('active');
                vp.style.setProperty('display', 'none', 'important');
            }
            if (tgt === 'welcome') {
                if (wv) {
                    wv.innerHTML = getWelcomeHTML();
                    populateWelcomeContent(wv);
                    wv.classList.add('active-view');
                    const cwb = wv.querySelector('.close-settings-btn');
                    if (cwb) cwb.onclick = (e) => {
                        if (e) e.stopPropagation();
                        if (runtime.welcomeReturn === 'settings') {
                            runtime.welcomeReturn = null;
                            switchView('settings');
                        } else switchView('ledger');
                    };
                    const iak = wv.querySelector('#init-api-key');
                    if (iak) iak.value = userConfig.apiKey || '';
                    const iwp = wv.querySelector('#init-api-paste');
                    if (iwp && iak) iwp.onclick = async () => {
                        try {
                            const t = await navigator.clipboard.readText();
                            if (t) iak.value = t.trim();
                        } catch (e) {
                            alert("Clipboard access denied. Please paste manually.");
                        }
                    };
                    const ilocSel = wv.querySelector('#init-loc-select');
                    if (ilocSel) {
                        ilocSel.value = userConfig.buttonLocation;
                        ilocSel.onchange = () => onChangeLoc(ilocSel.value);
                    }
                    const idaySel = wv.querySelector('#init-day-start');
                    if (idaySel) {
                        idaySel.value = userConfig.dayStartMode;
                        idaySel.onchange = () => onChangeDayStart(idaySel.value);
                    }
                    const iweekSel = wv.querySelector('#init-week-start');
                    if (iweekSel) {
                        iweekSel.value = userConfig.weekStartMode;
                        iweekSel.onchange = () => onChangeWeekStart(iweekSel.value);
                    }
                    const ipb = wv.querySelector('#init-privacy-btn');
                    if (ipb) ipb.onclick = function() {
                        this.blur();
                        openPrivacyModal();
                    };
                    const isb = wv.querySelector('#init-start-btn');
                    if (isb && iak) isb.onclick = async function() {
                        this.blur();
                        const v = iak.value.trim();
                        if (!/^[a-zA-Z0-9]{16}$/.test(v)) {
                            alert("Invalid Format.\nA Torn API Key must be exactly 16 alphanumeric characters.");
                            return;
                        }
                        isb.style.color = '#69f0ae';
                        isb.innerText = 'VERIFYING...';
                        isb.disabled = true;
                        try {
                            const res = await fetch(`https://api.torn.com/user/?selections=battlestats,log&log=5300&key=${v}`),
                                data = await res.json();
                            if (data.error) {
                                alert(`Key Verification Failed: ${data.error.error}\n\nPlease generate a key properly configured with 'battlestats' and 'log' access.`);
                                isb.style.color = '';
                                isb.innerText = 'START TRACKING';
                                isb.disabled = false;
                                return;
                            }
                            userConfig.apiKey = v;
                            saveConfig();
                            localStorage.setItem('bbgl_initialized', '1');
                            refreshInitLock();
                            calendarState.selectedData = null;
                            calendarState.selectedLabel = Formatter.dateLogical();
                            viewState.activeViewLabel = null;
                            switchView('ledger');
                            syncWithFeedback('FULL_SYNC');
                        } catch (e) {
                            alert("Network error during verification.");
                            isb.style.color = '';
                            isb.innerText = 'START TRACKING';
                            isb.disabled = false;
                        }
                    };
                    const cb = wv.querySelector('#init-create-api-btn');
                    if (cb) cb.onclick = function() {
                        this.blur();
                        window.open('https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=battlestats,log&=,,,,&logIds=56,52,54,50,23,6&title=Big%20Black%20Gym%20Log', '_blank');
                    };
                    const rib = wv.querySelector('#init-returning-import-btn'),
                        rif = wv.querySelector('#init-import-file');
                    if (rib && rif) rib.onclick = function() {
                        this.blur();
                        rif.click();
                    };
                    if (rif) rif.onchange = (e) => {
                        const f = e.target.files[0];
                        if (f) importDataFromWelcome(f);
                    };
                    refreshInitMask(wv);
                }
                tp.style.display = 'none';
                bp.style.display = 'none';
            } else if (tgt === 'settings') {
                sp.classList.add('active-view');
                tp.style.display = 'none';
                bp.style.display = 'none';
                const ki = document.getElementById('set-api-key');
                if (ki) ki.value = userConfig.apiKey || '';
                const at = document.getElementById('set-anim-toggle');
                if (at) at.checked = userConfig.animations;
                const rt = document.getElementById('set-rate-toggle');
                if (rt) rt.checked = userConfig.ratesEnabled;
                const ls = document.getElementById('set-loc-select');
                if (ls) ls.value = userConfig.buttonLocation;
                refreshDemoMasks();
            } else if (tgt === 'graph') {
                tp.classList.add('viewing-graph');
                GraphController.restoreUi();
                GraphController.draw();
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    if (dom.topPanel && dom.topPanel.classList.contains('viewing-graph')) GraphController.draw();
                }));
            } else if (tgt === 'stickers') {
                tp.classList.add('viewing-stickers');
                renderStickers();
                if (cm !== 'stickers' && dom.stickerSponsor && userConfig.animations) {
                    dom.stickerSponsor.classList.remove('shimmer-once');
                    void dom.stickerSponsor.offsetWidth;
                    dom.stickerSponsor.classList.add('shimmer-once');
                }
            } else if (tgt === 'achievements') {
                tp.classList.add('viewing-achievements');
                renderAchievements();
            } else renderPanelContent();
        };
        if (inst) {
            app();
            return;
        }
        if (runtime.isViewAnimating) {
            cel.classList.remove('bbgl-crt-out', 'bbgl-crt-in');
            nel.classList.remove('bbgl-crt-out', 'bbgl-crt-in');
            runtime.isViewAnimating = false;
        }
        runtime.isViewAnimating = true;
        if (!userConfig.animations) {
            app();
            runtime.isViewAnimating = false;
        } else if (cm === 'settings') {
            app();
            nel.classList.add('bbgl-crt-in');
            setTimeout(() => {
                nel.classList.remove('bbgl-crt-in');
                runtime.isViewAnimating = false;
            }, 300);
        } else if (tgt === 'settings') {
            cel.classList.add('bbgl-crt-out');
            setTimeout(() => {
                cel.classList.remove('bbgl-crt-out');
                app();
                runtime.isViewAnimating = false;
            }, 280);
        } else if (tgt === 'stickers') {
            cel.classList.add('bbgl-crt-out');
            setTimeout(() => {
                cel.classList.remove('bbgl-crt-out');
                app();
                runtime.isViewAnimating = false;
            }, 280);
        } else if (cm === 'stickers') {
            nel.classList.add('bbgl-crt-in');
            app();
            setTimeout(() => {
                nel.classList.remove('bbgl-crt-in');
                runtime.isViewAnimating = false;
            }, 300);
        } else {
            cel.classList.add('bbgl-crt-out');
            setTimeout(() => {
                cel.classList.remove('bbgl-crt-out');
                nel.classList.add('bbgl-crt-in');
                app();
                setTimeout(() => {
                    nel.classList.remove('bbgl-crt-in');
                    runtime.isViewAnimating = false;
                }, 300);
            }, 280);
        }
    }

    function closePanel(e) {
        if (e) e.stopPropagation();
        if (runtime.isClosing) return;
        const p = dom.panel,
            b = dom.gymTab;
        if (!p) return;
        runtime.isClosing = true;
        viewState.isOpen = false;
        viewState.isTall = false;
        viewState.subView = 'ledger';
        viewState.activeViewLabel = null;
        viewState.graphStats = undefined;
        viewState.graphMode = undefined;
        runtime.currentStickerPage = 0;
        viewState.currentStickerPage = 0;
        const _n = TimeManager.now();
        viewState.calYear = _n.year;
        viewState.calMonth = _n.month;
        saveViewState();
        const sp = dom.settingsView,
            tp = dom.topPanel,
            bp = dom.bottomPanel,
            wv = dom.welcomeView;
        if (sp) sp.classList.remove('active-view');
        if (wv) wv.classList.remove('active-view');
        if (tp) {
            tp.style.display = 'flex';
            tp.classList.remove('viewing-graph', 'viewing-stickers', 'viewing-achievements');
        }
        if (bp) bp.style.display = 'flex';
        closeItemViewer(false);
        calendarState.year = viewState.calYear;
        calendarState.month = viewState.calMonth;
        calendarState.selectedData = null;
        calendarState.selectedLabel = null;
        renderPanelContent();
        if (b) b.classList.remove('bbgl-tab-active');
        updateTransformOrigin();
        p.classList.remove('bbgl-animate-pop');
        p.classList.remove('bbgl-tall');
        const tt = dom.tallToggle;
        if (tt) tt.innerText = "+";
        if (userConfig.animations) {
            p.classList.add('bbgl-animate-vanish');
            setTimeout(() => {
                p.style.display = 'none';
                p.classList.remove('bbgl-animate-vanish');
                runtime.isClosing = false;
                handleLayout();
            }, 300);
        } else {
            p.style.display = 'none';
            runtime.isClosing = false;
            handleLayout();
        }
    }

    function toggleTall() {
        const p = dom.panel,
            b = dom.tallToggle;
        if (p.classList.contains('bbgl-mode-page')) return;
        p.classList.toggle('bbgl-tall');
        const t = p.classList.contains('bbgl-tall');
        b.innerText = t ? "–" : "+";
        viewState.isTall = t;
        saveViewState();
        const tp = dom.topPanel;
        if (!t) {
            if (tp.classList.contains('viewing-graph') || tp.classList.contains('viewing-stickers') || tp.classList.contains('viewing-achievements')) switchView('ledger');
        } else {
            if (tp.classList.contains('viewing-graph')) {
                GraphController.draw();
                setTimeout(GraphController.draw, 320);
            }
        }
    }

    function toggleLedgerView() {
        switchView('ledger');
        saveViewState();
    }

    function toggleGraphView() {
        switchView('graph');
        saveViewState();
    }

    function toggleStickerView() {
        const mp = dom.panel,
            tb = dom.tallToggle;
        if (!viewState.isTall && !mp.classList.contains('bbgl-mode-page')) {
            viewState.isTall = true;
            if (mp) mp.classList.add('bbgl-tall');
            if (tb) tb.innerText = "–";
        }
        viewState.activeItemId = 1;
        switchView('stickers');
        setTimeout(() => {
            if (!runtime.stickerData.length) loadStickerData();
            const i = runtime.stickerData.find(x => x.id === (viewState.activeItemId || 1));
            if (i) openItemViewer(i, true);
        }, 400);
        saveViewState();
    }

    function toggleAchievementsView() {
        const mp = dom.panel,
            tb = dom.tallToggle;
        if (!viewState.isTall && !mp.classList.contains('bbgl-mode-page')) {
            viewState.isTall = true;
            if (mp) mp.classList.add('bbgl-tall');
            if (tb) tb.innerText = "–";
        }
        switchView('achievements');
        saveViewState();
    }

    function toggleSettingsView(e) {
        if (e) e.stopPropagation();
        const sp = dom.settingsView,
            tp = dom.topPanel,
            vp = dom.itemViewer;
        if (sp.classList.contains('active-view')) {
            let t = runtime.returnView || 'ledger';
            if (t === 'viewer') {
                switchView('stickers');
                viewState.subView = 'stickers';
                if (viewState.activeItemId) setTimeout(() => {
                    if (!runtime.stickerData.length) loadStickerData();
                    const i = runtime.stickerData.find(x => x.id === viewState.activeItemId);
                    if (i) openItemViewer(i, false);
                }, 50);
            } else {
                switchView(t);
                viewState.subView = t;
            }
        } else {
            if (vp && vp.classList.contains('active')) runtime.returnView = 'viewer';
            else if (tp.classList.contains('viewing-graph')) runtime.returnView = 'graph';
            else if (tp.classList.contains('viewing-stickers')) runtime.returnView = 'stickers';
            else runtime.returnView = 'ledger';
            switchView('settings');
            viewState.subView = 'settings';
        }
        saveViewState();
    }

    function updateTransformOrigin() {
        const p = dom.panel,
            b = dom.gymTab;
        if (!p || !b) {
            runtime.transformOriginRetries = 0;
            return;
        }
        const pr = p.getBoundingClientRect(),
            br = b.getBoundingClientRect();
        if (pr.width === 0 || pr.height === 0) {
            runtime.transformOriginRetries = (runtime.transformOriginRetries || 0) + 1;
            if (runtime.transformOriginRetries > 30) {
                runtime.transformOriginRetries = 0;
                return;
            }
            window.requestAnimationFrame(updateTransformOrigin);
            return;
        }
        runtime.transformOriginRetries = 0;
        const cx = br.left + (br.width / 2),
            cy = br.top + (br.height / 2);
        p.style.transformOrigin = `${cx - pr.left}px ${cy - pr.top}px`;
    }

    let _backfillCountdownId = null;

    function formatCountdown(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const h = Math.floor(total / 3600),
            m = Math.floor((total % 3600) / 60),
            s = total % 60;
        const pad = n => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    // Reflects backfill state onto the button and wires its per-state click behavior:
    //  - idle: responsive label; clicking opens the disclaimer/config modal.
    //  - complete (unacknowledged): "Scan Complete!" in green with a clickable checkmark the user
    //    taps to retire the confirmation (the data is already live). The button body itself is inert.
    //  - partial + cooling down: "Partial Scan Complete! Resume?", dimmed and inert, with a live
    //    countdown tooltip on the whole button (hover/tap to see how long until resume).
    //  - partial + cooldown elapsed: same label, full opacity, clicking resumes immediately (no modal).
    function renderBackfillButton() {
        const btn = document.getElementById('backfill-btn');
        if (!btn) return;
        if (_backfillCountdownId) {
            clearInterval(_backfillCountdownId);
            _backfillCountdownId = null;
        }
        if (runtime.demoMode || runtime.backfilling) return;

        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;

        // Reset to a clean baseline before applying the active state.
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
        btn.style.color = '';
        btn.removeAttribute('data-tooltip');
        delete btn.dataset.originalText;
        btn.onclick = null;

        if (ds && ds.lastResult === 'complete' && ds.acknowledged === false) {
            btn.style.color = '#43a047';
            btn.innerHTML = `Full Backfill Completed!<span id="bbgl-backfill-ack" title="Confirm" style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-left:8px;cursor:pointer;vertical-align:middle;">${ICONS.CHECK}</span>`;
            const ack = btn.querySelector('#bbgl-backfill-ack');
            if (ack) ack.onclick = (e) => {
                e.stopPropagation();
                acknowledgeBackfill();
            };
            return;
        }

        if (ds && ds.lastResult === 'partial' && ds.cooldownUntil && Date.now() < ds.cooldownUntil) {
            btn.style.opacity = '0.6';
            btn.textContent = 'Partial Scan Complete! Resume?';
            const render = () => {
                const remaining = ds.cooldownUntil - Date.now();
                if (remaining <= 0) {
                    renderBackfillButton();
                    return;
                }
                btn.setAttribute('data-tooltip', TOOLTIPS.BACKFILL_RESUME_COOLDOWN(formatCountdown(remaining)));
            };
            render();
            _backfillCountdownId = setInterval(render, 1000);
            return;
        }

        if (ds && ds.lastResult === 'partial') {
            // Cooldown elapsed: stay in the resume state until the log is fully backfilled.
            btn.textContent = 'Partial Scan Complete! Resume?';
            btn.onclick = function() {
                this.blur();
                backfillLogs(this);
            };
            return;
        }

        btn.innerHTML = '<span class="view-std">BB Backfill</span><span class="view-exp">Big Black Backfill</span>';
        btn.onclick = function() {
            this.blur();
            openBackfillModal();
        };
    }

    function setupEventListeners(root) {
        cacheDOM(root);
        const get = (id) => root.querySelector('#' + id);
        const hb = get('bbgl-header-bar');
        if (hb) hb.onclick = (e) => {
            if (e.target.closest('.bbgl-custom-icon') || e.target.closest('#bbgl-demo-exit-btn') || e.target.closest('#bbgl-pop-btn') || e.target.closest('#bbgl-demo-exit')) return;
            closePanel();
        };
        const atBtn = get('all-time-btn');
        if (atBtn) atBtn.onclick = (e) => {
            e.stopPropagation();
            calcAllTimeStats();
        };
        const cb = get('bbgl-close-btn');
        if (cb) cb.onclick = () => closePanel();
        const sb = get('bbgl-settings-btn');
        if (sb) sb.onclick = toggleSettingsView;
        const csb = root.querySelector('#bbgl-settings-view .close-settings-btn');
        if (csb) csb.onclick = toggleSettingsView;
        const debBtn = get('bbgl-demo-exit-btn'),
            deb = get('bbgl-demo-exit');
        if (deb) deb.onclick = (e) => {
            e.stopPropagation();
            localStorage.removeItem(KEYS.DEMO);
            runtime.demoMode = false;
            runtime.demoHistory = null;
            runtime.stickerData = [];
            _historyCache = null;
            DataController.invalidate();
            DBManager.loadHistory().then(loaded => {
                DataController.hydrate(loaded);
                if (userConfig.apiKey) {
                    startBackgroundSync();
                }
            }).catch(e => {
                if (userConfig.apiKey) {
                    startBackgroundSync();
                }
            });
            calendarState.selectedData = null;
            calendarState.selectedLabel = Formatter.dateLogical();
            viewState.activeViewLabel = null;
            deb.style.display = 'none';
            if (debBtn) debBtn.style.display = 'none';
            const pdeb = document.getElementById('bbgl-page-demo-exit');
            if (pdeb) pdeb.style.display = 'none';
            if (window.TooltipController) window.TooltipController.hide();
            refreshInitLock();
            refreshDemoMasks();
            if (runtime.realReturnView) {
                runtime.returnView = runtime.realReturnView;
                runtime.realReturnView = null;
            }
            const isInit = !!localStorage.getItem('bbgl_initialized');
            if (isInit) {
                switchView('settings');
            } else {
                switchView('welcome', true);
                openPrivacyModal();
            }
        };
        if (debBtn) debBtn.onclick = deb ? deb.onclick : null;
        const pb = get('bbgl-pop-btn');
        if (pb) pb.onclick = (e) => {
            e.stopPropagation();
            if (dom.panel.classList.contains('bbgl-mode-page')) return;
            viewState.expanded = !viewState.expanded;
            const p = dom.panel;
            if (viewState.expanded) {
                p.classList.add('bbgl-expanded');
                pb.innerHTML = ICONS.COMPRESS;
            } else {
                p.classList.remove('bbgl-expanded');
                pb.innerHTML = ICONS.POPOUT;
            }
            saveViewState();
            handleLayout();
            renderPanelContent();
            if (dom.topPanel.classList.contains('viewing-graph')) {
                GraphController.draw();
                setTimeout(GraphController.draw, 320);
            }
        };
        const tt = get('bbgl-tall-toggle');
        if (tt) tt.onclick = toggleTall;
        const lt = get('bbgl-ledger-toggle');
        if (lt) lt.onclick = toggleLedgerView;
        const cpb = dom.copyBtn;
        if (cpb) cpb.onclick = (e) => {
            e.stopPropagation();
            const cs = runtime.currentStats;
            if (!cs) return;
            const { sl, s } = cs;
            const txt = buildSessionText(sl, s, ['str', 'def', 'spd', 'dex']);
            navigator.clipboard.writeText(txt).then(() => {
                // Flash all four stat columns on the ledger.
                const cols = dom.ledgerView ? Array.from(dom.ledgerView.querySelectorAll('.stat-column')) : [];
                if (cols.length) flashCopied(cols);
                // Also animate the copy button itself.
                const oH = cpb.innerHTML, oC = cpb.style.color;
                cpb.innerHTML = ICONS.CHECK;
                cpb.style.color = '#69f0ae';
                cpb.style.opacity = '1';
                setTimeout(() => {
                    cpb.innerHTML = oH;
                    cpb.style.color = oC;
                    cpb.style.opacity = '';
                }, 1000);
            });
        };

        // Delegated click on the ledger view: clicking a stat label copies that stat's data.
        if (dom.ledgerView) {
            dom.ledgerView.addEventListener('click', (e) => {
                const label = e.target.closest('.bbgl-copy-label');
                if (!label) return;
                const col = label.closest('.stat-column');
                if (!col) return;
                const k = col.getAttribute('data-copy-stat');
                if (!k) return;
                const cs = runtime.currentStats;
                if (!cs) return;
                const { sl, s } = cs;
                if (!s[k]) return;
                const txt = buildSessionText(sl, s, [k]);
                navigator.clipboard.writeText(txt).then(() => flashCopied(col));
            });
        }
        const gt = get('bbgl-graph-toggle');
        if (gt) gt.onclick = toggleGraphView;
        const act = get('bbgl-achievements-toggle');
        if (act) act.onclick = toggleAchievementsView;
        const st = get('bbgl-sticker-toggle');
        if (st) st.onclick = toggleStickerView;
        const sp = get('sticker-prev-btn'),
            sn = get('sticker-next-btn'),
            ssp = get('sticker-sponsor-btn');
        if (sp) sp.onclick = (e) => {
            e.stopPropagation();
            if (runtime.currentStickerPage > 0) changeStickerPage(-1);
        };
        if (sn) sn.onclick = (e) => {
            e.stopPropagation();
            if (runtime.currentStickerPage < Math.ceil((runtime.stickerData.length || 0) / 10) - 1) changeStickerPage(1);
        };
        if (ssp) ssp.onclick = (e) => {
            e.stopPropagation();
            if (ssp.classList.contains('disabled')) return;
            if (runtime.currentStickerPage === 0) changeStickerPage(-1);
        };
        const pm = get('prev-month-btn');
        if (pm) pm.onclick = () => changeMonth(-1);
        const nm = get('next-month-btn');
        if (nm) nm.onclick = () => changeMonth(1);
        const mt = get('month-trigger');
        if (mt) mt.onclick = (e) => {
            e.stopPropagation();
            toggleMonthDropdown();
        };
        const yt = get('year-trigger');
        if (yt) yt.onclick = (e) => {
            e.stopPropagation();
            toggleYearDropdown();
        };
        const ms = get('month-stats-btn');
        if (ms) ms.onclick = (e) => {
            e.stopPropagation();
            calcPeriodStats('month');
        };
        const ys = get('year-stats-btn');
        if (ys) ys.onclick = (e) => {
            e.stopPropagation();
            calcPeriodStats('year');
        };
        const at = get('set-anim-toggle');
        if (at) {
            at.checked = userConfig.animations;
            at.onchange = () => {
                userConfig.animations = at.checked;
                saveConfig();
                if (dom.panel) dom.panel.classList.toggle('bbgl-no-animations', !userConfig.animations);
                renderPanelContent();
            };
        }
        const rt = get('set-rate-toggle');
        if (rt) {
            rt.checked = userConfig.ratesEnabled;
            rt.onchange = () => {
                userConfig.ratesEnabled = rt.checked;
                saveConfig();
                if (dom.panel) dom.panel.classList.toggle('bbgl-no-rates', !userConfig.ratesEnabled);
                if (!userConfig.ratesEnabled && graphState.mode === 'rates') {
                    graphState.mode = 'values';
                    viewState.graphMode = 'values';
                    saveViewState();
                }
                const tp = dom.topPanel;
                if (tp && tp.classList.contains('viewing-graph')) {
                    GraphController.restoreUi();
                    GraphController.draw();
                } else {
                    const sd = calendarState.selectedData;
                    renderStats(sd || getActiveHistory().today, calendarState.selectedLabel || Formatter.dateLogical());
                }
            };
        }
        const dtk = get('set-drug-tracker');
        if (dtk) {
            dtk.value = userConfig.drugTracker || 'xanax';
            dtk.onchange = () => {
                userConfig.drugTracker = dtk.value;
                saveConfig();
                const tp = dom.topPanel;
                if (!tp || !tp.classList.contains('viewing-graph')) {
                    const sd = calendarState.selectedData;
                    renderStats(sd || getActiveHistory().today, calendarState.selectedLabel || Formatter.dateLogical());
                }
            };
        }
        const agt = get('set-bestgym-toggle');
        if (agt) {
            agt.checked = userConfig.bestGym;
            agt.onchange = () => setBestGym(agt.checked);
        }
        const ags = get('set-bestgym-spec-toggle');
        if (ags) {
            ags.checked = userConfig.bestGymSpecialist;
            const agsRow = ags.closest('.bbgl-setting-row');
            if (agsRow) agsRow.classList.toggle('bbgl-row-disabled', !userConfig.bestGym);
            ags.onchange = () => {
                userConfig.bestGymSpecialist = ags.checked;
                saveConfig();
            };
        }
        const agu = get('set-bestgym-unpurch-toggle');
        if (agu) {
            agu.checked = userConfig.bestGymUnpurchased;
            const aguRow = agu.closest('.bbgl-setting-row');
            if (aguRow) aguRow.classList.toggle('bbgl-row-disabled', !userConfig.bestGym);
            agu.onchange = () => {
                userConfig.bestGymUnpurchased = agu.checked;
                saveConfig();
            };
        }
        const ls = get('set-loc-select');
        if (ls) {
            ls.value = userConfig.buttonLocation;
            ls.onchange = () => onChangeLoc(ls.value);
        }
        const ds = get('set-day-start');
        if (ds) {
            ds.value = userConfig.dayStartMode;
            ds.onchange = () => onChangeDayStart(ds.value);
        }
        const ws = get('set-week-start');
        if (ws) {
            ws.value = userConfig.weekStartMode;
            ws.onchange = () => onChangeWeekStart(ws.value);
        }
        const ai = get('set-api-key'),
            ap = get('set-api-paste');
        if (ap && ai) ap.onclick = async () => {
            try {
                const t = await navigator.clipboard.readText();
                if (t) ai.value = t.trim();
            } catch (e) {
                alert("Clipboard access denied. Please paste manually.");
            }
        };
        const ub = get('updt-settings-btn');
        if (ub && ai) ub.onclick = async function() {
            this.blur();
            const v = ai.value.trim();
            if (!/^[a-zA-Z0-9]{16}$/.test(v)) {
                alert("Invalid Format.\nA Torn API Key must be exactly 16 alphanumeric characters.");
                return;
            }
            const ot = ub.innerText;
            ub.innerText = "VERIFYING...";
            try {
                const res = await fetch(`https://api.torn.com/user/?selections=battlestats,log&log=5300&key=${v}`),
                    data = await res.json();
                if (data.error) {
                    alert(`Key Verification Failed: ${data.error.error}\n\nPlease generate a key properly configured with 'battlestats' and 'log' access.`);
                    ub.innerText = ot;
                    return;
                }
                userConfig.apiKey = v;
                saveConfig();
                ub.style.transition = "all 0.2s";
                ub.style.color = "#69f0ae";
                ub.style.borderColor = "#69f0ae";
                ub.innerText = "KEY SAVED";
                if (ub.dataset.timer) clearTimeout(ub.dataset.timer);
                ub.dataset.timer = setTimeout(() => {
                    ub.style.color = "";
                    ub.style.borderColor = "";
                    ub.innerText = ot;
                }, 2000);
            } catch (e) {
                alert("Network error during verification.");
                ub.innerText = ot;
            }
        };
        const cab = get('clear-api-btn');
        if (cab && ai) cab.onclick = function() {
            this.blur();
            userConfig.apiKey = '';
            saveConfig();
            ai.value = '';
            localStorage.removeItem(KEYS.LAST_SYNC);
            localStorage.removeItem(KEYS.BS_SYNC);
            sessionStorage.removeItem(KEYS.SESSION_CACHE);
            sessionStorage.removeItem(KEYS.SESSION);
            const ot = cab.innerText;
            cab.innerText = "WIPED";
            setTimeout(() => {
                cab.innerText = ot;
            }, 2000);
        };
        const crb = get('create-api-btn');
        if (crb) crb.onclick = function() {
            this.blur();
            window.open('https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=battlestats,log&=,,,,&logIds=56,52,54,50,23,6&title=Big%20Black%20Gym%20Log', '_blank');
        };
        const rb = get('refresh-log-btn');
        if (rb) rb.onclick = function() {
            this.blur();
            if (checkRefreshCooldown(this)) return;
            syncWithFeedback('FULL_SYNC');
        };
        const eb = get('export-btn');
        if (eb) eb.onclick = function() {
            this.blur();
            exportData();
        };
        const ib = get('import-btn');
        if (ib) ib.onclick = function() {
            this.blur();
            get('import-file').click();
        };
        const iF = get('import-file');
        if (iF) iF.onchange = (e) => importData(e.target.files[0]);
        // The backfill button's click behavior is state-dependent (open modal / resume / acknowledge),
        // so renderBackfillButton owns wiring its onclick for the current state.
        renderBackfillButton();
        const clb = get('clear-btn');
        if (clb) clb.onclick = function() {
            this.blur();
            clearData();
        };
        const wb = get('show-welcome-btn');
        if (wb) wb.onclick = function() {
            this.blur();
            runtime.welcomeReturn = 'settings';
            switchView('welcome');
        };
        const cl = get('settings-changelog-btn');
        if (cl) cl.onclick = function() {
            this.blur();
            openChangelogModal();
        };
        const pl = get('settings-privacy-btn');
        if (pl) pl.onclick = function() {
            this.blur();
            openPrivacyModal();
        };
        const sdemo = get('settings-demo-btn');
        if (sdemo) sdemo.onclick = function() {
            this.blur();
            if (runtime.demoMode) {
                const deb = document.getElementById('bbgl-demo-exit');
                if (deb) deb.click();
            } else {
                enterDemoFromSettings();
            }
        };
        const fgb = get('feature-guide-btn');
        if (fgb) fgb.onclick = function() {
            this.blur();
            openFeatureGuideModal();
        };
        const drb = get('dev-reset-btn');
        if (drb) drb.onclick = function() {
            this.blur();
            devFactoryReset();
        };
        const sa = get('swipe-area');
        if (sa) {
            let _sX = 0,
                _sY = 0;
            sa.addEventListener('touchstart', (e) => {
                _sX = e.touches[0].clientX;
                _sY = e.touches[0].clientY;
            }, {
                passive: true
            });
            sa.addEventListener('touchend', (e) => {
                if (window._bbglScrubbing) return;
                const dx = e.changedTouches[0].clientX - _sX,
                    dy = e.changedTouches[0].clientY - _sY;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) changeMonth(dx < 0 ? 1 : -1);
            }, {
                passive: true
            });
        }
        const sgSwipe = get('bbgl-sticker-container');
        if (sgSwipe) {
            let _sgX = 0,
                _sgY = 0;
            sgSwipe.addEventListener('touchstart', (e) => {
                _sgX = e.touches[0].clientX;
                _sgY = e.touches[0].clientY;
            }, {
                passive: true
            });
            sgSwipe.addEventListener('touchend', (e) => {
                if (window._bbglScrubbing) return;
                const dx = e.changedTouches[0].clientX - _sgX,
                    dy = e.changedTouches[0].clientY - _sgY;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    const dir = dx < 0 ? 1 : -1,
                        maxP = Math.ceil((runtime.stickerData.length || 0) / 10) - 1;
                    if ((dir < 0 && runtime.currentStickerPage > -1) || (dir > 0 && runtime.currentStickerPage < maxP)) changeStickerPage(dir);
                }
            }, {
                passive: true
            });
        }
        GraphController.setupControls();
        setupStickerGrid();
        refreshInitLock();
        const achPrev = get('bbgl-achievements-container') ? root.querySelector('.bbgl-ach-prev') : null;
        const achNext = get('bbgl-achievements-container') ? root.querySelector('.bbgl-ach-next') : null;
        if (achPrev) achPrev.onclick = (e) => {
            e.stopPropagation();
            gotoAchievementsPage(-1);
        };
        if (achNext) achNext.onclick = (e) => {
            e.stopPropagation();
            gotoAchievementsPage(1);
        };
        const achContainer = get('bbgl-achievements-container');
        if (achContainer) {
            let _achX = 0,
                _achY = 0;
            achContainer.addEventListener('touchstart', (e) => {
                _achX = e.touches[0].clientX;
                _achY = e.touches[0].clientY;
            }, {
                passive: true
            });
            achContainer.addEventListener('touchend', (e) => {
                if (window._bbglScrubbing) return;
                const dx = e.changedTouches[0].clientX - _achX,
                    dy = e.changedTouches[0].clientY - _achY;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                    gotoAchievementsPage(dx < 0 ? 1 : -1);
                }
            }, {
                passive: true
            });
            achContainer.addEventListener('click', (e) => {
                const colHeader = e.target.closest('.bbgl-ach-col-copy');
                if (colHeader) {
                    handleAchCopy(colHeader);
                    return;
                }
                const statCell = e.target.closest('.bbgl-ach-stat-cell');
                if (statCell) {
                    handleAchCopy(statCell);
                    return;
                }
                const group = e.target.closest('.bbgl-ach-hh-group');
                if (group) {
                    handleAchCopy(group);
                    return;
                }
                const row = e.target.closest('.bbgl-ach-section-title, .bbgl-ach-subsection-title, .bbgl-ach-row');
                if (row) handleAchCopy(row);
            });
        }
    }

    function handleStorageEvent(e) {
        if (e.key === KEYS.STATE) {
            try {
                const ns = JSON.parse(e.newValue);
                if (!ns) return;
                runtime.isSyncing = true;
                const openC = ns.isOpen !== viewState.isOpen,
                    viewC = ns.subView !== viewState.subView,
                    expandedC = ns.expanded !== viewState.expanded,
                    tallC = ns.isTall !== viewState.isTall,
                    stickerPC = ns.currentStickerPage !== viewState.currentStickerPage,
                    labelC = ns.activeViewLabel !== viewState.activeViewLabel,
                    calC = (ns.calMonth !== viewState.calMonth || ns.calYear !== viewState.calYear),
                    itemC = ns.activeItemId !== viewState.activeItemId,
                    gMC = ns.graphMode !== viewState.graphMode,
                    gSC = JSON.stringify(ns.graphStats) !== JSON.stringify(viewState.graphStats);
                viewState = ns;
                const p = dom.panel;
                if (!p) {
                    runtime.isSyncing = false;
                    return;
                }
                if (!openC && !viewC && !expandedC && !tallC && !stickerPC && !labelC && !calC && !itemC && !gMC && !gSC) {
                    runtime.isSyncing = false;
                    return;
                }
                if (!p.classList.contains('bbgl-mode-page') && openC) {
                    if (ns.isOpen && p.style.display === 'none') togglePanel(false);
                    else if (!ns.isOpen && p.style.display !== 'none') closePanel(null);
                }
                if (viewC) switchView(ns.subView);
                if (stickerPC) {
                    runtime.currentStickerPage = ns.currentStickerPage || 0;
                    if (ns.subView === 'stickers') renderStickers();
                }
                if (gMC || gSC) {
                    if (ns.graphMode) graphState.mode = (ns.graphMode === 'gains' ? 'values' : ns.graphMode) || 'values';
                    if (ns.graphStats) graphState.activeStats = ns.graphStats;
                    GraphController.restoreUi();
                    if (ns.subView === 'graph') window.requestAnimationFrame(GraphController.draw);
                }
                if (labelC) {
                    if (ns.activeViewLabel) {
                        const s = getActiveHistory();
                        let td = null;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(ns.activeViewLabel)) {
                            td = s.history.find(d => d.date === ns.activeViewLabel);
                            if (!td && s.today.date === ns.activeViewLabel) td = s.today;
                            if (td) {
                                calendarState.selectedData = td;
                                calendarState.selectedLabel = ns.activeViewLabel;
                                if (ns.subView === 'graph') {
                                    GraphController.draw();
                                    const de = dom.dateLabel;
                                    if (de) de.innerText = Formatter.datePretty(ns.activeViewLabel);
                                } else renderStats(td, ns.activeViewLabel);
                            }
                        } else {
                            calendarState.selectedLabel = ns.activeViewLabel;
                            const type = ns.activeViewLabel === 'All-Time' ? 'ALL' : (/^\d{4}$/.test(ns.activeViewLabel) ? 'YEAR' : 'MONTH'),
                                sl = DataController.getSlice(type, ns.activeViewLabel, calendarState.year);
                            calendarState.selectedData = sl;
                            if (ns.subView === 'graph') GraphController.draw();
                            else renderStats(sl, ns.activeViewLabel);
                        }
                    } else {
                        calendarState.selectedData = null;
                        calendarState.selectedLabel = null;
                        const ts = Formatter.dateLogical();
                        if (ns.subView === 'graph') {
                            GraphController.draw();
                            const de = dom.dateLabel;
                            if (de) de.innerText = Formatter.datePretty(ts);
                        } else renderStats(getActiveHistory().today, ts);
                    }
                    renderPanelContent();
                } else if (calC) {
                    if (ns.calYear) calendarState.year = ns.calYear;
                    if (ns.calMonth !== undefined && ns.calMonth !== null) calendarState.month = ns.calMonth;
                    renderPanelContent();
                }
                if (!p.classList.contains('bbgl-mode-page')) {
                    if (expandedC) {
                        if (ns.expanded) p.classList.add('bbgl-expanded');
                        else p.classList.remove('bbgl-expanded');
                        const pb = dom.popBtn;
                        if (pb) pb.innerHTML = ns.expanded ? ICONS.COMPRESS : ICONS.POPOUT;
                    }
                    if (tallC) {
                        if (ns.isTall) p.classList.add('bbgl-tall');
                        else p.classList.remove('bbgl-tall');
                        const tb = dom.tallToggle;
                        if (tb) tb.innerText = ns.isTall ? "–" : "+";
                    }
                    if (expandedC || tallC) handleLayout();
                }
                if (ns.subView === 'stickers' || ns.subView === 'viewer') {
                    const ti = ns.activeItemId ? Number(ns.activeItemId) : null;
                    if (ti && ti !== runtime.currentOpenedItemId) {
                        if (!runtime.stickerData.length) loadStickerData();
                        const i = runtime.stickerData.find(x => x.id === ti);
                        if (i) {
                            const delay = (viewC && userConfig.animations) ? 400 : 0;
                            if (delay) setTimeout(() => openItemViewer(i, false), delay);
                            else openItemViewer(i, false);
                        }
                    } else if (!ti && runtime.currentOpenedItemId !== null) closeItemViewer(false);
                }
            } catch (err) {
                Log.warn('Sync error', err);
            } finally {
                runtime.isSyncing = false;
            }
        } else if (e.key === KEYS.LAST_SYNC) _syncChannel.onmessage({
            data: {
                from: 'storage_event'
            }
        });
        else if (e.key === KEYS.DEMO) {
            if (e.newValue === '1') {
                if (!runtime.demoMode) enterDemo('external');
            } else if (runtime.demoMode) {
                const deb = dom.panel ? dom.panel.querySelector('#bbgl-demo-exit') : null;
                if (deb) deb.click();
            }
        }
    }
    async function init() {
        Perf.start('init');
        injectStyles();
        syncDevModeUI();
        const _seenVer = localStorage.getItem(KEYS.CHANGELOG_VER);
        if (SCRIPT_VERSION && typeof SCRIPT_VERSION === 'string') {
            if (!_seenVer) {
                localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
            } else if (_seenVer !== SCRIPT_VERSION) {
                localStorage.setItem(KEYS.CHANGELOG_NOTIF, '1');
            }
        }
        if (!runtime.demoMode) {
            // [TEMP — delete before full release]
            if (userConfig.configVersion < REQUIRED_CONFIG_VERSION) {
                await factoryReset();
            }
            // Self-heal the install date: if privacyAgreed is missing or unparseable (e.g. corrupted
            // by an older export/import round-trip), stamp it to now. This only governs when reward
            // (sticker/XP) gating begins — it never touches log data.
            if (!userConfig.privacyAgreed || isNaN(Date.parse(userConfig.privacyAgreed))) {
                userConfig.privacyAgreed = new Date().toISOString();
                saveConfig();
            }
            try {
                await DBManager.initDB();
                // Fast boot: load pre-built day objects directly (no series flatten, no
                // _rebuildFromSeries, no session serialization) so every page navigation stays
                // light regardless of how large the backfilled history is.
                const loaded = await DBManager.loadHistory();
                DataController.hydrate(loaded);
                GraphController.applyDefaultsIfNeeded();
                renderBackfillButton();
                if (loaded && ((_historyCache.history.length > 0) || (_historyCache.meta && _historyCache.meta.logStartDate)) && !localStorage.getItem('bbgl_initialized')) localStorage.setItem('bbgl_initialized', '1');
            } catch (e) {
                Log.warn('IndexedDB boot failed, continuing with empty state', e);
            }
        }
        window.addEventListener('storage', handleStorageEvent);
        window.addEventListener('hashchange', checkViewRouting);
        window.addEventListener('popstate', checkViewRouting);
        window.addEventListener('resize', () => {
            _topCeilingCache = null;
        });
        window.addEventListener('bbgl:dataUpdated', () => {
            renderPanelContent();
            renderBackfillButton();
        });
        let _domRaf = null;
        const domObs = new MutationObserver(function onDomMutationBatch() {
            if (_domRaf) return;
            _domRaf = requestAnimationFrame(function onDomMutationFrame() {
                _domRaf = null;
                handleDomMutation();
            });
        });
        runtime.domObs = domObs;
        runtime._domGuards = [];
        runtime._domObsArmed = true;
        domObs.observe(document.body, {
            childList: true,
            subtree: true
        });
        attachLayoutObservers();
        calendarState.selectedLabel = Formatter.dateLogical();
        window.devmode = (val) => {
            const mode = (val === 'on' || val === true);
            runtime.devMode = mode;
            sessionStorage.setItem(KEYS.DEV_MODE, mode);
            syncDevModeUI();
            Log.info(`Developer mode ${mode ? 'ENABLED' : 'DISABLED'}`);
        };
        const _bbglRedactConfig = () => {
            const c = {
                ...userConfig
            };
            if (c.apiKey) c.apiKey = c.apiKey.length >= 4 ? '***' + c.apiKey.slice(-4) : '***';
            return c;
        };
        window.BBGL = Object.freeze({
            version: SCRIPT_VERSION,
            state: () => ({
                view: {
                    ...viewState
                },
                calendar: {
                    ...calendarState
                },
                runtime: {
                    devMode: runtime.devMode,
                    demoMode: runtime.demoMode,
                    isSyncing: runtime.isSyncing,
                    apiCallTotal: runtime.apiCallTotal,
                    domObsArmed: runtime._domObsArmed === true
                }
            }),
            config: () => _bbglRedactConfig(),
            history: () => {
                const h = getActiveHistory();
                return h ? {
                    meta: h.meta,
                    today: h.today,
                    historyCount: (h.history || []).length,
                    firstDate: (h.history && h.history[0]) ? h.history[0].date : null,
                    lastDate: (h.history && h.history.length) ? h.history[h.history.length - 1].date : null
                } : null;
            },
            cache: Object.freeze({
                peek: () => ({
                    timeline: !!DataController._cache.timeline,
                    slices: Object.keys(DataController._cache.slices || {}).length,
                    dateMap: !!DataController._cache.dateMap,
                    rateArr: !!DataController._cache.rateArr,
                    stickerMap: !!DataController._cache.stickerMap,
                    unlockedCount: DataController._cache.unlockedCount
                })
            }),
            help: () => {
                console.table([{
                    command: 'BBGL.version',
                    returns: 'string',
                    description: 'Script version'
                }, {
                    command: 'BBGL.state()',
                    returns: 'object',
                    description: 'View / calendar / runtime snapshot'
                }, {
                    command: 'BBGL.config()',
                    returns: 'object',
                    description: 'User config (API key redacted)'
                }, {
                    command: 'BBGL.history()',
                    returns: 'object',
                    description: 'Active history meta + count + date range'
                }, {
                    command: 'BBGL.cache.peek()',
                    returns: 'object',
                    description: 'Which derived caches are populated'
                }, {
                    command: 'BBGL.help()',
                    returns: 'void',
                    description: 'This table'
                }, {
                    command: 'devmode("on"|"off")',
                    returns: 'void',
                    description: 'Toggle dev mode (enables Perf marks + dev UI)'
                }]);
            }
        });
        if (!runtime.demoMode) {
            startBackgroundSync();
            checkExitSync();
        }
        TooltipController.init();
        let tRaf = null,
            tSup = 0;
        const _onMouseMove = (e) => {
            if (tRaf || Date.now() < tSup) return;
            tRaf = requestAnimationFrame(() => {
                TooltipController.handleHover(e);
                tRaf = null;
            });
        };
        let _mouseMoveBound = true;
        document.addEventListener('mousemove', _onMouseMove);
        let _tX = 0,
            _tY = 0,
            _tTimer = null,
            _scrubMode = false,
            _scrubMoveBound = null;
        const _onScrubMove = (e) => {
            if (!_scrubMode) return;
            if (e.cancelable) e.preventDefault();
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            const t = TooltipController.resolve(el);
            const _sh = t ? t.getAttribute('data-tooltip-html') : null,
                _st = t ? t.getAttribute('data-tooltip') : null;
            if (t && (_sh || _st)) {
                if (TooltipController.currentTarget !== t) {
                    if (TooltipController.currentTarget) {
                        TooltipController.currentTarget.classList.remove('is-scrub-hovered');
                        if (TooltipController.currentTarget.classList.contains('bbgl-day-cell') && !TooltipController.currentTarget.classList.contains('is-viewing')) TooltipController.currentTarget.classList.remove('shimmer-active');
                    }
                    TooltipController.currentTarget = t;
                    t.classList.add('is-scrub-hovered');
                    if (t.classList.contains('bbgl-day-cell') && userConfig.animations) t.classList.add('shimmer-active');
                    TooltipController.show(_sh || '<div style="text-align:center; color:#ddd;">' + _st + '</div>', t.getBoundingClientRect());
                }
            } else {
                if (TooltipController.currentTarget) {
                    TooltipController.currentTarget.classList.remove('is-scrub-hovered');
                    if (TooltipController.currentTarget.classList.contains('bbgl-day-cell') && !TooltipController.currentTarget.classList.contains('is-viewing')) TooltipController.currentTarget.classList.remove('shimmer-active');
                    TooltipController.hide();
                }
            }
        };
        const _enterScrub = () => {
            if (_scrubMoveBound) return;
            _scrubMoveBound = _onScrubMove;
            document.addEventListener('touchmove', _scrubMoveBound, {
                passive: false
            });
        };
        const _exitScrub = () => {
            if (!_scrubMoveBound) return;
            document.removeEventListener('touchmove', _scrubMoveBound, {
                passive: false
            });
            _scrubMoveBound = null;
        };
        document.addEventListener('touchstart', (e) => {
            if (!document.body.classList.contains('is-touch-device')) {
                document.body.classList.add('is-touch-device');
                if (_mouseMoveBound) {
                    document.removeEventListener('mousemove', _onMouseMove);
                    _mouseMoveBound = false;
                }
            }
            _tX = e.touches[0].clientX;
            _tY = e.touches[0].clientY;
            _scrubMode = false;
            window._bbglScrubbing = false;
            const t = TooltipController.resolve(e.target);
            const _panel = dom.panel || document.getElementById('bbgl-page-container');
            if (_panel && _panel.contains(e.target)) {
                _tTimer = setTimeout(() => {
                    _scrubMode = true;
                    window._bbglScrubbing = true;
                    _enterScrub();
                    if (t) {
                        TooltipController.currentTarget = t;
                        t.classList.add('is-scrub-hovered');
                        if (t.classList.contains('bbgl-day-cell') && userConfig.animations) t.classList.add('shimmer-active');
                        const _th = t.getAttribute('data-tooltip-html'),
                            _tt = t.getAttribute('data-tooltip');
                        if (_th || _tt) TooltipController.show(_th || '<div style="text-align:center; color:#ddd;">' + _tt + '</div>', t.getBoundingClientRect());
                    }
                }, 400);
            }
        }, {
            passive: true
        });
        document.addEventListener('touchmove', (e) => {
            if (_scrubMode) return;
            if (_tTimer) {
                const dx = e.touches[0].clientX - _tX,
                    dy = e.touches[0].clientY - _tY;
                if (Math.sqrt(dx * dx + dy * dy) > 10) {
                    clearTimeout(_tTimer);
                    _tTimer = null;
                }
            }
        }, {
            passive: true
        });
        document.addEventListener('touchend', (e) => {
            if (_tTimer) {
                clearTimeout(_tTimer);
                _tTimer = null;
            }
            if (_scrubMode) {
                if (e.cancelable) e.preventDefault();
                if (TooltipController.currentTarget) {
                    TooltipController.currentTarget.classList.remove('is-scrub-hovered');
                    if (TooltipController.currentTarget.classList.contains('bbgl-day-cell') && !TooltipController.currentTarget.classList.contains('is-viewing')) TooltipController.currentTarget.classList.remove('shimmer-active');
                    TooltipController.hide();
                }
                _scrubMode = false;
                window._bbglScrubbing = false;
                _exitScrub();
                tSup = Date.now() + 500;
                return;
            }
            _exitScrub();
            const dx = e.changedTouches[0].clientX - _tX,
                dy = e.changedTouches[0].clientY - _tY;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                if (TooltipController.currentTarget) TooltipController.hide();
                tSup = Date.now() + 500;
                return;
            }
            const t = TooltipController.resolve(e.target);
            if (t) {
                const h = t.getAttribute('data-tooltip-html'),
                    txt = t.getAttribute('data-tooltip');
                if (h) {
                    if (TooltipController.currentTarget === t) TooltipController.hide();
                } else if (txt) {
                    if (TooltipController.currentTarget === t) TooltipController.hide();
                    else {
                        TooltipController.currentTarget = t;
                        TooltipController.show('<div style="text-align:center; color:#ddd;">' + txt + '</div>', t.getBoundingClientRect());
                    }
                }
            } else if (TooltipController.currentTarget) TooltipController.hide();
            tSup = Date.now() + 500;
        }, {
            passive: false
        });
        document.addEventListener('click', function(e) {
            if (e.target.closest('#bbgl-gym-tab')) {
                e.preventDefault();
                e.stopPropagation();
                togglePanel(true);
                return;
            }
            if (BestGymController.handleTrainClick(e)) return;
            handleGymClick(e);
        }, true);
        handleDomMutation();
        if (localStorage.getItem(KEYS.CHANGELOG_NOTIF) === '1') syncChangelogNotif(true);
        checkViewRouting();
        if (!window.location.hash.includes('gymlog')) handleLayout();
        Log.boot();
        Perf.end('init');
    }

    function installDomHooks() {
        injectStyles();
        const _oI = Node.prototype.insertBefore,
            _oA = Node.prototype.appendChild;
        let _hA = true,
            _navGymDone = false,
            _notesBtnDone = false,
            _uninstallTimer = null,
            _loadHandler = null;
        const needsNavGym = () => userConfig.buttonLocation === 'sidebar' || userConfig.buttonLocation === 'both';
        const needsNotesBtn = () => userConfig.buttonLocation === 'notes' || userConfig.buttonLocation === 'both';

        function forceUninstall() {
            if (!_hA) return;
            Node.prototype.insertBefore = _oI;
            Node.prototype.appendChild = _oA;
            _hA = false;
            if (_uninstallTimer) {
                clearTimeout(_uninstallTimer);
                _uninstallTimer = null;
            }
            if (_loadHandler) {
                window.removeEventListener('load', _loadHandler);
                _loadHandler = null;
            }
        }

        function maybeUninstall() {
            const navOk = !needsNavGym() || _navGymDone;
            const notesOk = !needsNotesBtn() || _notesBtnDone;
            if (navOk && notesOk) forceUninstall();
        }

        function handleNavGym() {
            if (_navGymDone) return;
            _navGymDone = true;
            if (needsNavGym()) Promise.resolve().then(() => {
                if (!document.getElementById(SB_MOBILE.id)) injectSidebarButton(SB_MOBILE, true);
                if (!document.getElementById(SB_DESKTOP.id)) injectSidebarButton(SB_DESKTOP, false);
            });
            maybeUninstall();
        }

        function handleNotesBtn(el) {
            if (_notesBtnDone) return;
            _notesBtnDone = true;
            if (needsNotesBtn()) Promise.resolve().then(() => injectFooterButton(el));
            maybeUninstall();
        }

        function check(n) {
            if (!_hA || !n || n.nodeType !== 1) return;
            try {
                const wantNav = needsNavGym() && !_navGymDone,
                    wantNotes = needsNotesBtn() && !_notesBtnDone;
                if (!wantNav && !wantNotes) return;
                if (wantNav && n.id === 'nav-gym') handleNavGym();
                if (wantNotes && n.id === 'notes_panel_button') handleNotesBtn(n);
                if (!n.firstElementChild) return;
                const stillWantNav = needsNavGym() && !_navGymDone,
                    stillWantNotes = needsNotesBtn() && !_notesBtnDone;
                if (!stillWantNav && !stillWantNotes) return;
                if (n.id && !n.id.startsWith('nav-') && n.id !== 'sidebar') return;
                const sel = (stillWantNav && stillWantNotes) ? '#nav-gym, #notes_panel_button' : stillWantNav ? '#nav-gym' : '#notes_panel_button';
                const hit = n.querySelector(sel);
                if (!hit) return;
                if (hit.id === 'nav-gym') handleNavGym();
                else if (hit.id === 'notes_panel_button') handleNotesBtn(hit);
            } catch (e) {}
        }
        Node.prototype.insertBefore = function(n, r) {
            const res = _oI.call(this, n, r);
            check(n);
            return res;
        };
        Node.prototype.appendChild = function(n) {
            const res = _oA.call(this, n);
            check(n);
            return res;
        };
        const startCountdown = () => {
            if (_uninstallTimer) return;
            _uninstallTimer = setTimeout(forceUninstall, 1000);
        };
        if (document.readyState === 'complete') startCountdown();
        else {
            _loadHandler = () => startCountdown();
            window.addEventListener('load', _loadHandler, {
                once: true
            });
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    setTimeout(() => {
                        if (_hA) forceUninstall();
                    }, 3000);
                }, {
                    once: true
                });
            } else {
                setTimeout(() => {
                    if (_hA) forceUninstall();
                }, 3000);
            }
        }
    }
    installDomHooks();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    //# sourceURL=BBGL.js
})();
