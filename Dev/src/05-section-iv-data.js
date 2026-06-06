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
            windowStart: 0,      // anchor of the current budget window (ms); 0 = no window open
            rowsThisWindow: 0,   // rows spent in the current window, accumulated across resumes
            cooldownUntil: 0,    // armed only when the window budget is exhausted
            lastResult: null,    // 'partial' | 'complete'
            completion: null,    // 'origin' | 'exhausted' (only meaningful once lastResult === 'complete')
            acknowledged: true,
            lock: 0              // heartbeat timestamp of the tab currently scanning; 0 = no scan running
        };
    }

    function normalizeBackfill(ds) {
        const d = defaultBackfill();
        if (ds && typeof ds === 'object') {
            if (ds.targets && typeof ds.targets === 'object') d.targets = ds.targets;
            if (typeof ds.windowStart === 'number') d.windowStart = ds.windowStart;
            if (typeof ds.rowsThisWindow === 'number') d.rowsThisWindow = ds.rowsThisWindow;
            if (typeof ds.cooldownUntil === 'number') d.cooldownUntil = ds.cooldownUntil;
            if (ds.lastResult === 'complete' || ds.lastResult === 'partial') d.lastResult = ds.lastResult;
            if (ds.completion === 'origin' || ds.completion === 'exhausted') d.completion = ds.completion;
            if (typeof ds.acknowledged === 'boolean') d.acknowledged = ds.acknowledged;
            if (typeof ds.lock === 'number') d.lock = ds.lock;
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

    // Seeds/repairs the two group frontiers (trainEnergy, statHappy). Any stored shape that is not
    // exactly the two-group form (e.g. the older per-code frontiers) is reseeded to "now" so the
    // scan restarts cleanly; already-stored rows are deduped on the way back, so a reseed is safe.
    function ensureBackfillTargets(ds) {
        if (!ds.targets || typeof ds.targets !== 'object') ds.targets = {};
        const fr = ds.targets.frontiers;
        const validShape = fr && typeof fr === 'object' &&
            BACKFILL_GROUP_KEYS.every(g => fr[g] && typeof fr[g].cursor === 'number') &&
            Object.keys(fr).every(k => BACKFILL_GROUP_KEYS.includes(k));
        if (!validShape) {
            ds.targets.frontiers = {};
            const seed = Math.floor(Date.now() / 1000);
            BACKFILL_GROUP_KEYS.forEach(g => {
                ds.targets.frontiers[g] = { cursor: seed, complete: false };
            });
        }
        return ds.targets.frontiers;
    }

    function seriesEntryCode(e) {
        return e.type === 'item' ? String(e.logId) : GYM_STAT_LOGS[e.stat];
    }

    function computeBackfillFloor(stored, frontiers) {
        const existing = (typeof stored.meta.logStartDate === 'number') ? stored.meta.logStartDate : null;
        if (!stored.series.length) return existing;

        // Oldest stored timestamp per scan group (gym codes -> trainEnergy, item codes per group).
        const perGroupOldest = {};
        stored.series.forEach(e => {
            const code = seriesEntryCode(e);
            const g = code && BACKFILL_GROUP_OF[code];
            if (g && (perGroupOldest[g] === undefined || e.ts < perGroupOldest[g])) perGroupOldest[g] = e.ts;
        });

        // The shallowest still-incomplete group caps how far down we can trust: its oldest scanned
        // day is only partially covered, so the first trusted day is the one after it.
        let shallowPartialDayStart = null;
        Object.keys(frontiers || {}).forEach(g => {
            const fr = frontiers[g];
            if (fr && !fr.complete && perGroupOldest[g] !== undefined) {
                const dayStart = backfillDayStart(perGroupOldest[g]);
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

    // Lightweight progress checkpoint: persists ONLY the backfill state (frontiers, window budget,
    // cooldown, heartbeat lock) to the meta store. No series merge, no day rebuild, no UI refresh —
    // cheap enough to call on every heartbeat tick.
    async function persistBackfillState(ds) {
        let meta;
        if (_historyCache && _historyCache.meta) {
            meta = _historyCache.meta;
        } else {
            const stored = await DBManager.getStorage();
            meta = (stored && stored.meta) || { baselineBreakdown: { ...ZERO_BREAKDOWN } };
        }
        meta.backfill = ds;
        await DBManager.saveDays(meta, []);
    }

    // Merges a batch of freshly scanned rows into the stored series (dedup across sessions),
    // recomputes the baseline and origin floor, and persists the rebuilt day objects + meta.
    // Does NOT touch the in-memory cache or render — that is deferred to finalizeBackfill so the UI
    // is only rebuilt once the scan stops. Returns the persisted storage record.
    async function _persistBackfillSeries(ds, collected) {
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

        if (collected && collected.length > 0) {
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
        return stored;
    }

    // Final save for a Deep Log Scan: persists any remaining rows, then rebuilds the in-memory
    // history cache and invalidates derived caches so the UI reflects the freshly scanned history.
    async function finalizeBackfill(ds, collected) {
        const stored = await _persistBackfillSeries(ds, collected);
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

    // One backward log page for a group, with a changing &timestamp cache-buster. Torn's ~29s API
    // cache is NOT keyed on `to`, so without this a rapid sequence of paged calls can return a stale
    // (even empty) earlier response; the buster guarantees each page is fresh.
    async function fetchBackfillPage(param, cursor) {
        const url = `https://api.torn.com/user/?selections=log&log=${param}&key=${userConfig.apiKey}&to=${Math.floor(cursor)}&timestamp=${Date.now()}`;
        incrementApiCount(1);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(resp.status);
        return resp.json();
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

        // Budget cooldown gate: only armed when a previous run exhausted the window's budget.
        if (ds.cooldownUntil && now < ds.cooldownUntil) {
            renderBackfillButton();
            return;
        }

        // Cross-tab guard: if another tab is mid-scan its heartbeat lock is fresh in storage. Stand
        // down quietly rather than running two scans into the same store. Read the freshest copy.
        const freshStored = await DBManager.getStorage();
        const liveLock = freshStored && freshStored.meta && freshStored.meta.backfill && freshStored.meta.backfill.lock;
        if (liveLock && (Date.now() - liveLock) < BACKFILL.LOCK_STALE_MS) {
            renderBackfillButton();
            return;
        }

        // Open or roll the budget window: a window older than WINDOW_MS has fully aged out of Torn's
        // rolling 24h, so we start fresh; otherwise this run spends only the remaining budget.
        if (!ds.windowStart || (Date.now() - ds.windowStart) >= BACKFILL.WINDOW_MS) {
            ds.windowStart = Date.now();
            ds.rowsThisWindow = 0;
        }
        const budget = Math.max(0, BACKFILL.SOFT_CAP - (ds.rowsThisWindow || 0));
        if (budget <= 0) {
            // Window already spent (e.g. resumed right at the boundary): arm the cooldown and bail.
            ds.lastResult = 'partial';
            ds.cooldownUntil = ds.windowStart + BACKFILL.WINDOW_MS;
            await persistBackfillState(ds);
            renderBackfillButton();
            return;
        }

        const frontiers = ensureBackfillTargets(ds);

        ds.lastResult = 'partial';
        ds.lock = Date.now();
        await persistBackfillState(ds);

        runtime.backfilling = true;
        if (btn) {
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.85';
            btn.innerText = 'Scanning... 0';
        }

        let sessionRows = 0;       // rows fetched this run (failsafe against HARD_CAP)
        let stoppedEarly = false;
        let capHit = false;        // window budget reached this run
        let drainDay = null;       // once the cap is hit, only finish the current day
        let pending = [];          // rows not yet flushed to storage
        let lastHeartbeat = Date.now();

        const flush = async () => {
            ds.lock = Date.now();
            await _persistBackfillSeries(ds, pending);
            pending = [];
            lastHeartbeat = Date.now();
        };

        try {
            while (sessionRows < BACKFILL.HARD_CAP) {
                // Pick the still-incomplete group with the deepest (highest) cursor, honoring the
                // drain boundary so we never start a day older than the one being finished.
                let pick = null;
                BACKFILL_GROUP_KEYS.forEach(g => {
                    const fr = frontiers[g];
                    if (!fr || fr.complete) return;
                    if (drainDay !== null && fr.cursor < drainDay) return;
                    if (pick === null || fr.cursor > frontiers[pick].cursor) pick = g;
                });
                if (pick === null) break;

                const fr = frontiers[pick];
                const param = BACKFILL_GROUPS[pick];

                let data;
                try {
                    data = await fetchBackfillPage(param, fr.cursor);
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

                let rowKeys = data.log ? Object.keys(data.log) : [];
                if (rowKeys.length === 0) {
                    // An empty page only means "nothing retrievable past here" if it is real. Confirm
                    // with one cache-busted retry before trusting it, so a stale/empty cache hit can't
                    // falsely declare this group complete.
                    await new Promise(r => setTimeout(r, BACKFILL.THROTTLE_MS));
                    let confirm;
                    try {
                        confirm = await fetchBackfillPage(param, fr.cursor);
                    } catch (netErr) {
                        Log.warn('Deep scan confirm network error', netErr);
                        stoppedEarly = true;
                        break;
                    }
                    if (confirm.error) {
                        if (confirm.error.code === 14 || confirm.error.code === 5) {
                            stoppedEarly = true;
                            break;
                        }
                        throw new Error(confirm.error.error);
                    }
                    const cKeys = confirm.log ? Object.keys(confirm.log) : [];
                    if (cKeys.length === 0) {
                        fr.complete = true;
                        continue;
                    }
                    data = confirm;
                    rowKeys = cKeys;
                }

                pending.push(...normalizeApiLogs(data.log));
                sessionRows += rowKeys.length;
                ds.rowsThisWindow = (ds.rowsThisWindow || 0) + rowKeys.length;

                let oldestTs = fr.cursor;
                for (const k of rowKeys) {
                    const t = data.log[k].timestamp;
                    if (t < oldestTs) oldestTs = t;
                }
                fr.cursor = oldestTs - 1;

                if (btn) btn.innerText = `Scanning... ${sessionRows}`;

                // Window budget reached: stop STARTING new days, drain the current one across both
                // groups so the persisted boundary is a fully complete day.
                if (drainDay === null && ds.rowsThisWindow >= BACKFILL.SOFT_CAP) {
                    capHit = true;
                    let maxCursor = -Infinity;
                    BACKFILL_GROUP_KEYS.forEach(g => {
                        const f = frontiers[g];
                        if (f && !f.complete && f.cursor > maxCursor) maxCursor = f.cursor;
                    });
                    if (maxCursor > -Infinity) drainDay = backfillDayStart(maxCursor);
                }

                if (pending.length >= BACKFILL.CHECKPOINT_ROWS) {
                    await flush();
                } else if (Date.now() - lastHeartbeat >= BACKFILL.HEARTBEAT_MS) {
                    ds.lock = Date.now();
                    await persistBackfillState(ds);
                    lastHeartbeat = Date.now();
                }

                if (sessionRows >= BACKFILL.HARD_CAP) {
                    stoppedEarly = true;
                    break;
                }
                await new Promise(r => setTimeout(r, BACKFILL.THROTTLE_MS));
            }
        } catch (e) {
            Log.error('Deep sync failed', e);
            stoppedEarly = true;
        }

        const allComplete = BACKFILL_GROUP_KEYS.every(g => frontiers[g] && frontiers[g].complete);
        if (allComplete && !stoppedEarly) {
            ds.lastResult = 'complete';
            ds.acknowledged = false;
            ds.cooldownUntil = 0;
            ds.windowStart = 0;
            ds.rowsThisWindow = 0;
        } else {
            ds.lastResult = 'partial';
            // Arm the cooldown only when the budget was actually spent. Interruptions, network
            // errors, and crashes leave it clear so Resume is immediately available.
            if (capHit || (ds.rowsThisWindow || 0) >= BACKFILL.SOFT_CAP) {
                ds.cooldownUntil = ds.windowStart + BACKFILL.WINDOW_MS;
            }
        }
        ds.lock = 0;

        try {
            await finalizeBackfill(ds, pending);
        } catch (e) {
            Log.error('Deep scan save failed', e);
        } finally {
            runtime.backfilling = false;
        }

        // Classify a completed scan now that the deepest rows (the final batch) are merged and the
        // baseline reflects them: reaching ~10 across every stat means we hit the account's true
        // origin; otherwise we merely exhausted the logs Torn still retains.
        if (ds.lastResult === 'complete') {
            const baseline = (_historyCache && _historyCache.meta && _historyCache.meta.baselineBreakdown) || ZERO_BREAKDOWN;
            const reachedOrigin = STAT_KEYS.every(k => (baseline[k] || 0) <= BACKFILL.ORIGIN_MAX_STAT);
            ds.completion = reachedOrigin ? 'origin' : 'exhausted';
            try {
                await persistBackfillState(ds);
            } catch (e) {
                Log.error('Backfill completion flag save failed', e);
            }
        }

        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
        renderBackfillButton();
    }

    // Crash/refresh recovery: on boot, a backfill heartbeat lock that has gone stale means a scan was
    // interrupted. Release the lock so Resume works (its cooldown is already correct — clear unless
    // the cap was hit). A still-fresh lock means another live tab owns the scan, so we leave it be.
    async function recoverInterruptedBackfill() {
        if (runtime.demoMode || runtime.backfilling) return;
        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;
        if (!ds || !ds.lock) return;
        if ((Date.now() - ds.lock) <= BACKFILL.LOCK_STALE_MS) return;
        ds.lock = 0;
        if (!ds.lastResult) ds.lastResult = 'partial';
        try {
            await persistBackfillState(ds);
        } catch (e) {
            Log.warn('Backfill lock recovery save failed', e);
        }
    }

