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
        PENDING_SYNC: 'bbgl_pending_full_sync_v1',
        LAST_SYNC: 'bbgl_last_data_sync_v1',
        SESSION_CACHE: 'bbgl_session_cache_v1',
        DEMO: 'bbgl_demo_mode',
        SB_NOTIF: 'bbgl_sb_notif_seen',
        DEV_MODE: 'bbgl_dev_mode',
        CHANGELOG_VER: 'bbgl_changelog_seen_ver',
        REWARD_GATE_VER: 'bbgl_reward_gate_ver',
        CHANGELOG_NOTIF: 'bbgl_changelog_notif',
        WARS_SYNC: 'bbgl_wars_last_sync_v1',
        WARS_DATA: 'bbgl_wars_data_v1',
        FACTION_HISTORY: 'bbgl_faction_history_v1'
    };
    // Testing-phase reset lever: anyone whose last-seen script version (KEYS.CHANGELOG_VER)
    // is below this gets a factoryReset() on next boot (see init() in 10-section-ix-init.js).
    // Left at '0.0.0' this never fires. To force a clean install for everyone still on an
    // older version, bump this to a version below the new SCRIPT_VERSION you're about to ship.
    const WIPE_BELOW_VERSION = '0.9.90';
    // Reward reset lever: users below this version get a new reward start timestamp on next boot,
    // while their history and settings stay intact. Leave at '0.0.0' when no reset is needed.
    const REWARD_GATE_BELOW_VERSION = '0.9.92';
    // Rewrites a raw.githubusercontent.com URL to the jsDelivr CDN equivalent — raw.github
    // sets weak cache headers and throttles hotlinking, jsDelivr is a real edge CDN and free
    // for public repos.
    const cdnize = u => u.replace(
        /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?([^/]+)\//,
        'https://cdn.jsdelivr.net/gh/$1/$2@$3/'
    );
    // TEMP (dev iteration): bypassing cdnize so doc edits show up immediately with no jsDelivr purge step.
    // Re-wrap in cdnize(...) before this ships for real.
    const BASE_DOCS_URL = 'https://raw.githubusercontent.com/BigBlackHawk42069/BigBlackGymLog/DevBranch/UserDocs/';
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
        GOLD_WEEK_JUMPS: 3,
        HJ_WINDOW_SECONDS: 300, // legacy rolling-burst window, still used by the demo-mode data generator only
        HJ_QUARTER_SECONDS: 900, // real HJ windows run from an Ecstasy dose to the next :00/:15/:30/:45 happy reset
        STAT_MAP: {
            5300: 'strength',
            5301: 'defense',
            5302: 'speed',
            5303: 'dexterity'
        }
    };
    // Item-use activity-log codes we track alongside gym training. Single source of truth for the
    // log id -> display label/group/metric mapping. `group` (energy|stat|happy|od) buckets each code for
    // the grouped export totals and the happy-jump page. The per-item metric flag says what extra
    // datum to capture beyond a plain count:
    //   energy:true     -> data.energy_increased (energy cans, xanax, lsd)
    //   happy:true      -> data.happy_increased  (happy items)
    //   stat:true       -> data.<stat>_increased (stat enhancers; stat auto-detected)
    //   energyLost:true -> data.energy_decreased (ODs; stored as positive, treated as loss)
    //   happyLost:true  -> data.happy_decreased  (happy-draining ODs, e.g. ecstasy)
    // Quantity-only codes carry no flag. ITEM_LOGS is derived so the API normalizer, the request
    // groups, the export totals, and the ledger counters all agree.
    const ITEM_LOG_META = {
        8981: { label: 'Green Egg Used', group: 'energy', energy: true, short: 'Egg', achLabel: 'Green Eggs Used' },
        2290: { label: 'Xanax Taken', group: 'energy', energy: true, short: 'Xans' },
        2230: { label: 'LSD Taken', group: 'energy', energy: true, short: 'LSD' },
        2040: { label: 'Energy Can Used', group: 'energy', energy: true, short: 'Cans', achLabel: 'Energy Cans Used' },
        2190: { label: 'Hotel Coupon Used', group: 'energy', energy: true, short: 'FHC', achLabel: 'FHCs Used', achTipLabel: 'Feathery Hotel Coupons Used' },
        4900: { label: 'Points Refill Used', group: 'energy', energy: true, short: 'Refill', achLabel: 'Refills Used' },
        2120: { label: 'Parachute Used', group: 'stat', stat: true, achLabel: 'Parachutes Used' },
        2130: { label: 'Skateboard Used', group: 'stat', stat: true, achLabel: 'Skateboards Used' },
        2140: { label: 'Boxing Gloves Used', group: 'stat', stat: true },
        2150: { label: 'Dumbbells Used', group: 'stat', stat: true },
        2020: { label: 'Candy Used', group: 'happy', happy: true },
        2180: { label: 'Erotic DVD Used', group: 'happy', happy: true, achLabel: 'Erotic DVDs Used' },
        2210: { label: 'Ecstasy Taken', group: 'happy', happy: true },
        8983: { label: 'Yellow Egg Used', group: 'happy', happy: true, achLabel: 'Yellow Eggs Used' },
        2291: { label: 'Xanax OD', group: 'od', energyLost: true, short: 'Xan OD' },
        2231: { label: 'LSD OD', group: 'od', energyLost: true, short: 'LSD OD' },
        2211: { label: 'Ecstasy OD', group: 'od', happyLost: true, energyLost: true, short: 'Ex OD' },
        // Every book shares these two codes; the book itself is data.item, captured as bookId.
        2050: { label: 'Book Used', group: 'book', book: true },
        2051: { label: 'Book Finished', group: 'book', book: true }
    };
    // Every Torn book, keyed by item id (bookId = data.item on 2050/2051). `training` is set only on
    // books that affect training: stat (stat +5% on finish), gym (gym gain rate), energy, happy, or
    // repeat (Memories And Mammaries copies the last book read). `readPeriod` marks the "upon completion"
    // books, which are read over a period and only pay out when finished (2051); every other book takes
    // effect as soon as it's used (2050) and its finish log marks the end of its 31 days.
    const BOOK_META = {
        744: { name: 'Brawn Over Brains', short: '+5% Strength on finish (max 10m)', effect: 'Increases strength by 5% up to 10,000,000 upon completion.', training: 'stat', stat: 'str', readPeriod: true },
        745: { name: 'Time Is In The Mind', short: '+5% Speed on finish (max 10m)', effect: 'Increases speed by 5% up to 10,000,000 upon completion.', training: 'stat', stat: 'spd', readPeriod: true },
        746: { name: 'Keeping Your Face Handsome', short: '+5% Defense on finish (max 10m)', effect: 'Increases defense by 5% up to 10,000,000 upon completion.', training: 'stat', stat: 'def', readPeriod: true },
        747: { name: 'A Job For Your Hands', short: '+5% Dexterity on finish (max 10m)', effect: 'Increases dexterity by 5% up to 10,000,000 upon completion.', training: 'stat', stat: 'dex', readPeriod: true },
        748: { name: 'Working 9 Til 5', short: '+5% working stats (max 2,500)', effect: 'Increases all working stats by 5% up to 2,500 each upon completion.', readPeriod: true },
        749: { name: 'Making Friends, Enemies, And Cakes', short: '+100 friend, enemy & target slots', effect: 'Increases friends list, enemies list & targets list capacity by +100 upon completion.', readPeriod: true },
        750: { name: 'High School For Adults', short: 'Free merit reset', effect: 'Provides a free merit reset upon completion.', readPeriod: true },
        751: { name: 'Milk Yourself Sober', short: 'Removes drug addiction', effect: 'Removes a substantial amount of drug addiction upon completion.', readPeriod: true },
        752: { name: 'Fight Like An Asshole', short: '+25% all battle stats', effect: 'Provides a passive 25% bonus to all stats for 31 days.' },
        753: { name: 'Mind Over Matter', short: '+100% Strength', effect: 'Provides a passive 100% bonus to Strength for 31 days.' },
        754: { name: 'No Shame No Pain', short: '+100% Defense', effect: 'Provides a passive 100% bonus to Defense for 31 days.' },
        755: { name: 'Run Like The Wind', short: '+100% Speed', effect: 'Provides a passive 100% bonus to Speed for 31 days.' },
        756: { name: 'Weaseling Out Of Trouble', short: '+100% Dexterity', effect: 'Provides a passive 100% bonus to Dexterity for 31 days.' },
        757: { name: 'Get Hard Or Go Home', short: '+20% all gym gains', effect: 'Increases all gym gains by 20% for 31 days.', training: 'gym' },
        758: { name: 'Gym Grunting - Shouting To Success', short: '+30% Strength gym gains', effect: 'Increases Strength gym gains by 30% for 31 days.', training: 'gym', stat: 'str' },
        759: { name: 'Self Defense In The Workplace', short: '+30% Defense gym gains', effect: 'Increases Defense gym gains by 30% for 31 days.', training: 'gym', stat: 'def' },
        760: { name: 'Speed 3 - The Rejected Script', short: '+30% Speed gym gains', effect: 'Increases Speed gym gains by 30% for 31 days.', training: 'gym', stat: 'spd' },
        761: { name: 'Limbo Lovers 101', short: '+30% Dexterity gym gains', effect: 'Increases Dexterity gym gains by 30% for 31 days.', training: 'gym', stat: 'dex' },
        762: { name: 'The Hamburglar\'s Guide To Crime', short: '+25% crime skill & XP', effect: 'Increases crime skill & crime experience gain by 25% for 31 days.' },
        763: { name: 'What Are Old Folk Good For Anyway?', short: '+25% leveling EXP', effect: 'Increases leveling EXP gain by 25% for 31 days.' },
        764: { name: 'Medical Degree Schmedical Degree', short: '-50% hospital time', effect: 'Decreases all hospital times by 50% for 31 days.' },
        765: { name: 'No More Soap On A Rope', short: '-50% jail time', effect: 'Decreases all jail times by 50% for 31 days.' },
        766: { name: 'Mailing Yourself Abroad', short: '-25% travel time', effect: 'Decreases all travel times by 25% for 31 days.' },
        767: { name: 'Smuggling For Beginners', short: '+10 travel items', effect: 'Increases travel items by 10 for 31 days.' },
        768: { name: 'Stealthy Stealing of Underwear', short: 'Maximum stealth', effect: 'Maximum stealth for the next 31 days.' },
        769: { name: 'Shawshank Sure Ain\'t For Me!', short: 'Better busts & escapes', effect: 'Large jail bust & escape boost for the next 31 days.' },
        770: { name: 'Ignorance Is Bliss', short: 'Happy regens past max', effect: 'Happiness can regenerate above maximum for 31 days.', training: 'happy' },
        771: { name: 'Winking To Win', short: '2x contract rewards', effect: 'Doubles contract credit and money rewards for 31 days.' },
        772: { name: 'Finders Keepers', short: 'More city item spawns', effect: 'Drastically increases city item spawns for 31 days.' },
        773: { name: 'Hot Turkey', short: 'No drug addiction gain', effect: 'Gain no drug addiction for 31 days.' },
        774: { name: 'Higher Daddy, Higher!', short: '+20% energy regen', effect: 'Provides +20% energy regeneration for 31 days.', training: 'energy' },
        775: { name: 'The Real Dutch Courage', short: '2x nerve regen', effect: 'Doubles nerve regeneration for 31 days.' },
        776: { name: 'Because I\'m Happy - The Pharrell Story', short: '2x happy regen', effect: 'Doubles happiness regeneration for 31 days.', training: 'happy' },
        777: { name: 'No More Sick Days', short: '2x life regen', effect: 'Doubles life regeneration for 31 days.' },
        778: { name: 'Duke - My Story', short: 'Duke retaliates for you', effect: 'Duke will occasionally retaliate against your attackers for 31 days.' },
        779: { name: 'Self Control Is For Losers', short: '-50% consumable cooldowns', effect: 'Decreases all consumable cooldowns by 50% for 31 days.', training: 'energy' },
        780: { name: 'Going Back For More', short: '-50% medical cooldowns', effect: 'Decreases all medical cooldowns by 50% for 31 days.' },
        781: { name: 'Get Drunk And Lose Dignity', short: '2x alcohol effects', effect: 'Doubles alcohol effects for 31 days.' },
        782: { name: 'Fuelling Your Way To Failure', short: '2x energy drink effects', effect: 'Doubles energy drink effects for 31 days.', training: 'energy' },
        783: { name: 'Yes Please Diabetes', short: '2x candy effects', effect: 'Doubles candy effects for 31 days.', training: 'happy' },
        784: { name: 'Ugly Energy', short: '250 max energy', effect: 'Increases maximum energy (including energy refills) to 250 for 31 days.', training: 'energy' },
        785: { name: 'Memories And Mammaries', short: 'Repeats last book read', effect: 'Takes the same effect from the last used book for 31 days.', training: 'repeat' },
        786: { name: 'Brown-nosing The Boss', short: 'More employee effectiveness', effect: 'Greatly increases personal employee effectiveness for 31 days.' },
        787: { name: 'Running Away From Trouble', short: 'Guaranteed attack escapes', effect: 'Guaranteed attacking escape attempt success for 31 days.' }
    };
    const TRAINING_BOOKS = Object.keys(BOOK_META).map(Number).filter(id => BOOK_META[id].training);
    // Log categories requested by the custom API key link (Torn logIds).
    const API_KEY_LOG_IDS = [
        54, // Defense
        50, // Dexterity
        23, // Item Use (includes book used 2050)
        52, // Speed
        56, // Strength
        3,  // Refills (includes points refill 4900)
        33, // Books (book finished 2051)
        80  // Faction (faction application accepted 6253, read at backfill start)
    ];
    // Not requested:
    // 6  — Points (refill 4900 is covered by 3)
    const ITEM_GROUP_LABELS ={ energy: 'Energy Items', stat: 'Stat Items', happy: 'Happy Items', od: 'OD Items', book: 'Book Items' };
    const ITEM_LOGS = Object.keys(ITEM_LOG_META).map(Number);
    const itemLogsByGroup = g => ITEM_LOGS.filter(id => ITEM_LOG_META[id].group === g);
    const TRAIN_LOGS = [5300, 5301, 5302, 5303];
    // Per-group code lists for the live request architecture. battlestats is always fetched on its
    // own call (it can't share a request with `log`), and any one `log=` call may carry at most 10
    // log types — so items are split across the train-click call (energy) and the heartbeat /
    // reconciliation calls (stat + happy + od). Backfill ignores these and paginates one type at a time.
    const ENERGY_LOGS = itemLogsByGroup('energy');   // 6
    const STAT_LOGS = itemLogsByGroup('stat');        // 4
    const HAPPY_LOGS = itemLogsByGroup('happy');      // 4
    const OD_LOGS = itemLogsByGroup('od');            // 3 (xan, lsd, ex)
    const BOOK_LOGS = itemLogsByGroup('book');        // 2 (use, finish)
    const TRAIN_ENERGY_PARAM = [...TRAIN_LOGS, ...ENERGY_LOGS].join(',');   // reconcile call (10)
    const STAT_HAPPY_PARAM = [...HAPPY_LOGS, ...OD_LOGS, ...BOOK_LOGS].join(',');   // reconcile call (9)
    const STAT_ENHANCER_PARAM = STAT_LOGS.join(',');                        // conditional call (4)
    // Backfill batches its backward scan into grouped `log=` calls (<=10 types each). Stat enhancers
    // get their own group since they are excluded from the live STAT_HAPPY_PARAM call and must still
    // be scanned historically. BACKFILL_GROUP_OF maps every code back to its group.
    const BACKFILL_GROUPS = {
        trainEnergy: TRAIN_ENERGY_PARAM,
        statHappy: STAT_HAPPY_PARAM,
        statEnhancers: STAT_ENHANCER_PARAM
    };
    const BACKFILL_GROUP_KEYS = Object.keys(BACKFILL_GROUPS);
    const BACKFILL_GROUP_OF = {};
    [...TRAIN_LOGS, ...ENERGY_LOGS].forEach(c => { BACKFILL_GROUP_OF[String(c)] = 'trainEnergy'; });
    [...HAPPY_LOGS, ...OD_LOGS, ...BOOK_LOGS].forEach(c => { BACKFILL_GROUP_OF[String(c)] = 'statHappy'; });
    STAT_LOGS.forEach(c => { BACKFILL_GROUP_OF[String(c)] = 'statEnhancers'; });
    const XANAX_LOG = 2290,
        XANAX_OD_LOG = 2291,
        LSD_OD_LOG = 2231,
        EX_OD_LOG = 2211,
        ECAN_LOG = 2040,
        ECSTASY_LOG = 2210;
    // Unified TRAIN call (5): all 4 stats + Ecstasy — Ecstasy rides along because Happy Jump state
    // affects how a gain is interpreted, so it's part of what's needed for exp accuracy, not just an
    // item stat. Used both for a real click (exp bar animates) and the passive gym-page heartbeat
    // (exp bar snaps) — same shape either way, see `animate` in universalFetch.
    const TRAIN_CODES = [...TRAIN_LOGS, ECSTASY_LOG];
    // FULL_SYNC's two `log=` calls, grouped by why each is unconditional rather than by legacy
    // request shape: items (energy + happy) have no proxy signal to gate behind, and neither does OD
    // (it never moves battlestats) — so OD rides with train, which is otherwise redundant with the
    // live TRAIN call but cheap insurance (self-heals a missed/aborted TRAIN call for free).
    const ITEM_CODES = [...ENERGY_LOGS, ...HAPPY_LOGS];       // always (10)
    const TRAIN_OD_CODES = [...TRAIN_LOGS, ...OD_LOGS, ...BOOK_LOGS];   // always (9)
    // Overlap buffer (seconds) subtracted from a group's last-success time to form its `from=` bound.
    // Comfortably exceeds the 2h heartbeat so a single missed beat still re-covers the gap; dedup
    // makes the overlap harmless.
    const SYNC_FROM_BUFFER = 3 * 3600;
    // Backfill Logs: a resumable backward scan that walks the activity log to the beginning of
    // time, moving the origin floor back as it verifies complete days. Torn caps cloud-data reads
    // at 50,000 rows/day per category (shared across every log type and script the user runs).
    // SOFT_CAP leaves headroom for that; once crossed, the scan keeps paging only to finish the
    // current day across every frontier, bounded by HARD_CAP as an absolute failsafe.
    //
    // rowsUsed is a single cumulative counter across resumes/cancels; the per-run budget is
    // SOFT_CAP minus what's already spent. When exhausted, the cooldown arms to now + COOLDOWN_MS
    // (24h6m), anchored at the cap-hit itself so every counted row has aged out of Torn's rolling
    // 24h before the next scan may begin. rowsUsed resets only on a full completion or once an
    // armed cooldown has elapsed — any other stop (interrupt/crash/network/pause) leaves it clear
    // so Resume works immediately.
    //
    // Progress checkpoints every CHECKPOINT_ROWS rows and every HEARTBEAT_MS; the heartbeat lock
    // (dead after LOCK_STALE_MS) guards against two tabs scanning at once. ORIGIN_MAX_STAT
    // classifies completion: every baseline stat at/under it means the scan reached the account's
    // true origin, otherwise it merely exhausted Torn's retained logs.
    const BACKFILL = {
        SOFT_CAP: 38000,   // stop *starting* new days once crossed
        HARD_CAP: 40000,   // absolute failsafe, normally never reached, keeps us < 50k
        COOLDOWN_MS: Math.round(24.1 * 3600 * 1000),  // 24h6m; armed at cap-hit, covers Torn's rolling 24h
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
    // The sponsorship page is an ordinary stickerbook page that happens to sit BEFORE page 0, so
    // that PAGE_TITLES above (and the sticker slice arithmetic in renderStickers()) can stay plainly
    // 0-indexed rather than every page number carrying an offset. It is not a sentinel/"no page"
    // value: it's the first entry of the real page range, [STICKER_SPONSOR_PAGE, pageCount-1] — see
    // stickerPageTitle()/gotoStickerPage() in 09-section-viii-stickers.js.
    const STICKER_SPONSOR_PAGE = -1;
    const STICKER_SPONSOR_TITLE = "Sponsorship";
    const _d = s => atob(s);
    const CUSTOM_STICKERS = [
        //Sweat Equity
        {
            id: 1,
            name: "Just Checking the Mirror",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vanN0LWNoay1taXJyci53ZWJw')
        }, {
            id: 2,
            name: "Up, Down, Repeat",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdXAtZG4tcnB0LndlYnA=')
        }, {
            id: 3,
            name: "Flat Bench Therapy",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vZmx0LWJuY2gtdGhycHkud2VicA==')
        }, {
            id: 4,
            name: "Bring Home the Feed",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vYnJuZy1obS1mZWVkLndlYnA=')
        }, {
            id: 5,
            name: "Never Skip Leg Day",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vbnZyLXNrcC1sZWcud2VicA==')
        }, {
            id: 6,
            name: "Tire Rotation",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdGlyZS1yb3RuLndlYnA=')
        }, {
            id: 7,
            name: "Back End Engagement",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vYmNrLWVuZC1lbmdtdC53ZWJw')
        }, {
            id: 8,
            name: "The Upside of Exercise",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vdXBzZC1leHJjc2Uud2VicA==')
        }, {
            id: 9,
            name: "Shellshock Stretches",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vc2hsc2hrLXN0cmNoLndlYnA=')
        }, {
            id: 10,
            name: "Certified Cardio",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9HeW0vY3J0ZmQtY3JkaW8ud2VicA==')
        },
        //Casino Collection
        {
            id: 11,
            name: "Just One More Spin",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vanN0LW9uZS1zcG4ud2VicA==')
        }, {
            id: 12,
            name: "Bingo! I Think...",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vYmluZ28taS10aG5rLndlYnA=')
        }, {
            id: 13,
            name: "Lucky Shot",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vbGNreS1zaHQud2VicA==')
        }, {
            id: 14,
            name: "Holy Craps",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vaG9seS1jcnBzLndlYnA=')
        }, {
            id: 15,
            name: "Tilted in My Favor",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vdGx0ZC1teS1mdnIud2VicA==')
        }, {
            id: 16,
            name: "Choose Wisely",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vY2hzZS13c2x5LndlYnA=')
        }, {
            id: 17,
            name: "Hit Me",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vaGl0LW1lLndlYnA=')
        }, {
            id: 18,
            name: "Dead Men's Hand",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vZGVhZC1tZW5zLndlYnA=')
        }, {
            id: 19,
            name: "Trigger Warning",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vdHJnci13cm5nLndlYnA=')
        }, {
            id: 20,
            name: "Leslie's Sick Day",
            url: _d('aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0JpZ0JsYWNrSGF3azQyMDY5L2FzZGZhc2tpamRuZmF3ZWYvcmVmcy9oZWFkcy9tYWluL1NjcnB0SW1ncy9TdGlja2VyYm9vay9DYXNpbm8vbHNscy1zY2stZHkud2VicA==')
        }
    ];
    CUSTOM_STICKERS.forEach(s => { s.url = cdnize(s.url); });
    let runtime = {
        isClosing: false,
        isViewAnimating: false,
        isSyncing: false,
        backfilling: false,
        backfillAbort: null,   // null | 'pause' | 'cancel' — checked each scan-loop iteration
        apiCallTotal: 0,
        resizeObserver: null,
        // Titles page (07-section-vi-ui.js, layoutTitleBlockFrames/observeTitleBlockFrames) —
        // separate from resizeObserver above (GraphController's), so disconnecting one never
        // touches the other. Re-created every time achRefreshPageDom() rebuilds the titles page,
        // since the blocks it observes are destroyed on each innerHTML swap.
        titleFrameResizeObserver: null,
        // Pagination dot clusters docked to the SVG icon toolbar — both the achievements footer
        // and the stickerbook's own bar (07-section-vi-ui.js,
        // layoutToolbarPaginationPosition/observeToolbarPaginationPosition) — watches
        // #bbgl-top-panel, which is never destroyed, so unlike titleFrameResizeObserver above this
        // is set up exactly once rather than per DOM rebuild.
        toolbarPaginationResizeObserver: null,
        stickerSlots: [],
        stickerData: [],
        currentStickerPage: 0,
        viewerLoopId: null,
        viewerRotation: 0,
        viewerSpeed: 0.3,
        currentOpenedItemId: null,
        // Brand-mark placement on the sticker backing - see positionBrandMark()
        // in 09-section-viii-stickers.js. brandAnchor is normalised to IMAGE space;
        // brandResizeObserver re-projects it whenever the viewer box changes.
        brandAnchor: null,
        brandResizeObserver: null,
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
        // Monotonic start of the current Titles-page visit. DOM refreshes use its elapsed time as
        // a negative CSS animation delay, so replacing live data never restarts ambient effects.
        // Navigation away clears it; returning therefore begins a genuinely new animation session.
        _titlesPageAnimationStartedAt: null,
        wasVersionWiped: false,
        careerLevelExp: 0,
        statTitleE: null,
        // Half-finished stat-title pick on the titles page: {stat, phase} once the first word has
        // been clicked, null otherwise. See handleTitleStarPick() in 07-section-vi-ui.js.
        _titlePick: null,
        _devTitleOverride: null,
        _devBookOverride: null
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
        scrubRaf: null,
        handlers: {
            scrub: null,
            start: null,
            end: null,
            leave: null
        }
    };
    let viewState = {
        expanded: false,
        isOpen: false,
        subView: 'ledger',
        graphMode: 'values',
        calYear: null,
        calMonth: null,
        activeViewLabel: null,
        currentStickerPage: 0,
        achPage: 0,
        achEnhPeriodMode: false
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
        // Stat title. Two independent things, so the Earned/Custom switch can flip between them
        // without either destroying the other:
        //   titleMode    - 'earned' (highest earned title) or 'custom' (your saved pick)
        //   titleCustom  - the manual pick itself, {primary:{stat,phase}, secondary:{stat,phase}},
        //                  where primary supplies the noun and secondary the adjective. Null until
        //                  the first pick, which is also what flips titleMode to 'custom'.
        //   titleAutoPair / titleAutoRecent / titleAutoPhases - earned-mode bookkeeping: the pair
        //                  held, the two most recently unlocked stats, and the phase high-water mark
        //                  unlocks are detected against.
        // See resolveAutoTitlePair() in 03-section-ii-utils.js.
        titleMode: 'earned',
        titleCustom: null,
        titleAutoPair: null,
        titleAutoRecent: null,
        titleAutoPhases: null
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

