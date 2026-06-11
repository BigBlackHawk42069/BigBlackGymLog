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
        POINTS_DIAMOND: 600,
        POINTS_HJ_GREEN: 500,
        POINTS_HJ_GOLD: 500,
        POINTS_HJ_DIAMOND: 600,
        BONUS_WEEK_GREEN: 200,
        BONUS_WEEK_GOLD: 300,
        BONUS_WEEK_DIAMOND: 600,
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
    // Backfill batches its backward scan into these two grouped `log=` calls (<=10 types each),
    // reusing the live reconcile groups so the scan spends one request per group per page instead
    // of one per log code. BACKFILL_GROUP_OF maps every individual code back to its group so the
    // origin floor can reason about per-group completeness.
    const BACKFILL_GROUPS = {
        trainEnergy: TRAIN_ENERGY_PARAM,
        statHappy: STAT_HAPPY_PARAM
    };
    const BACKFILL_GROUP_KEYS = Object.keys(BACKFILL_GROUPS);
    const BACKFILL_GROUP_OF = {};
    [...TRAIN_LOGS, ...ENERGY_LOGS].forEach(c => { BACKFILL_GROUP_OF[String(c)] = 'trainEnergy'; });
    [...STAT_LOGS, ...HAPPY_LOGS].forEach(c => { BACKFILL_GROUP_OF[String(c)] = 'statHappy'; });
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
    // single day.
    //
    // Budget accounting is a fixed 24.2h window (WINDOW_MS) anchored at the first scan of the
    // window: rowsThisWindow accumulates across resumes, the per-run budget is SOFT_CAP minus what
    // is already spent, and the cooldown is only armed (windowStart + WINDOW_MS) when that budget
    // is exhausted. Any other stop (interrupt, crash, network) leaves the cooldown clear so Resume
    // works immediately. The 0.2h margin keeps the earliest spends provably aged out of Torn's
    // rolling 24h window on resume. Progress is checkpointed to storage every CHECKPOINT_ROWS rows
    // so an interruption never loses more than the last partial batch, and a heartbeat (refreshed
    // every HEARTBEAT_MS, considered dead after LOCK_STALE_MS) guards against two tabs scanning at
    // once. ORIGIN_MAX_STAT classifies a completed scan: if every baseline stat is at/under it the
    // scan genuinely reached the account's origin, otherwise it merely exhausted Torn's retained logs.
    const BACKFILL = {
        SOFT_CAP: 30000,   // stop *starting* new days once crossed
        HARD_CAP: 32000,   // absolute failsafe, normally never reached, keeps us < 50k
        WINDOW_MS: Math.round(24.2 * 3600 * 1000),
        THROTTLE_MS: 700,
        CHECKPOINT_ROWS: 2000,
        HEARTBEAT_MS: 15000,
        LOCK_STALE_MS: 45000,
        ORIGIN_MAX_STAT: 50
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

