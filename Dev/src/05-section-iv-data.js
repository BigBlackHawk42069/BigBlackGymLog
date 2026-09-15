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

        // Moves the reward cutoff forward without changing stored training history.
        async resetRewardStartDate() {
            const db = await this._ensureDb();
            if (!db) return false;
            const meta = (await this._readMeta()) || {};
            meta.rewardStartDate = Math.floor(Date.now() / 1000);
            await new Promise((resolve, reject) => {
                const tx = db.transaction(this._META_STORE, 'readwrite');
                tx.objectStore(this._META_STORE).put(meta, this._META_KEY);
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error);
            });
            _syncChannel.postMessage({ type: 'update', from: _TAB_ID });
            return true;
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
                            bbglError("⚠️ STORAGE ERROR: Browser quota exceeded.\n\nYour data could not be saved. Please export your history and then 'Clear Data' to free up space.");
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
                const metaStore = tx.objectStore(this._META_STORE);
                metaStore.clear();
                metaStore.put({ rewardStartDate: Math.floor(Date.now() / 1000) }, this._META_KEY);
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
                renderScanUI();
            } catch (e) {
                Log.warn('Cross-tab sync failed', e);
            }
        }, 200);
    };

    function defaultBackfill() {
        return {
            targets: {},
            rowsUsed: 0,
            cooldownUntil: 0,
            lastResult: null,
            stopReason: null,
            completion: null,
            acknowledged: true,
            lock: 0,
            lockOwner: null
        };
    }

    function normalizeBackfill(ds) {
        const d = defaultBackfill();
        if (ds && typeof ds === 'object') {
            if (ds.targets && typeof ds.targets === 'object') d.targets = ds.targets;
            if (typeof ds.rowsUsed === 'number') d.rowsUsed = ds.rowsUsed;
            else if (typeof ds.rowsThisWindow === 'number') d.rowsUsed = ds.rowsThisWindow;
            if (typeof ds.cooldownUntil === 'number') d.cooldownUntil = ds.cooldownUntil;
            if (ds.lastResult === 'complete' || ds.lastResult === 'partial') d.lastResult = ds.lastResult;
            if (ds.stopReason === 'paused' || ds.stopReason === 'error' || ds.stopReason === 'interrupted' || ds.stopReason === 'cap') d.stopReason = ds.stopReason;
            if (ds.completion === 'origin' || ds.completion === 'exhausted') d.completion = ds.completion;
            if (typeof ds.acknowledged === 'boolean') d.acknowledged = ds.acknowledged;
            if (typeof ds.lock === 'number') d.lock = ds.lock;
            if (typeof ds.lockOwner === 'string') d.lockOwner = ds.lockOwner;
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
            if (e.bookId !== undefined) e.bookId = parseInt(e.bookId);
            return;
        }
        e.type = 'gym';
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
        if (WIPE_BELOW_VERSION !== '0.0.0') {
            const importedVer = (j.meta && j.meta.version) ? String(j.meta.version) : '';
            if (!importedVer || compareVersions(importedVer, WIPE_BELOW_VERSION) < 0) return {
                ok: false,
                msg: "This export is from before a required data reset and can no longer be imported. Please start tracking fresh."
            };
        }
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

    // This is the only place anywhere in the script that sends your API key. Every single network
    // request the script ever makes — whether that's your training logs, your stats, or anything
    // else — passes through this one function, and it only ever talks to api.torn.com.
    async function tornGet(path, params) {
        const qs = Object.entries({ ...params, key: userConfig.apiKey })
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => `${k}=${v}`)
            .join('&');
        incrementApiCount(1);
        try {
            const res = await fetch(`https://api.torn.com/${path}?${qs}`);
            if (!res.ok) return { ok: false, http: res.status };
            const data = await res.json();
            if (data.error) return { ok: false, apiError: data.error, data };
            return { ok: true, data };
        } catch (netErr) {
            return { ok: false, netErr };
        }
    }

    function tornError(r) {
        if (r.netErr) return r.netErr;
        const e = new Error(r.apiError ? tornKeyErrorText(r.data) : `Torn returned an unexpected error (HTTP ${r.http}).`);
        e.isTornError = true;
        return e;
    }

    async function fetchWars(manual) {
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
        const lastSync = parseInt(localStorage.getItem(KEYS.WARS_SYNC) || '0');
        if (!manual && (Date.now() - lastSync) < TWENTY_FOUR_HOURS) return;
        try {
            const r = await tornGet('faction/', { selections: 'rankedwars,basic' });
            if (!r.ok) return;
            const wars = r.data.rankedwars || {};
            const myFactionId = r.data.ID || null;
            if (myFactionId) Object.values(wars).forEach(w => tagWar(w, myFactionId));
            localStorage.setItem(KEYS.WARS_DATA, JSON.stringify(wars));
            localStorage.setItem(KEYS.WARS_SYNC, Date.now().toString());
        } catch (e) {
            Log.error('Wars fetch failed', e);
        }
    }

    function tagWar(w, factionId) {
        if (!w || !w.war) return;
        if (w.war.end && w.war.winner != null) w.outcome = w.war.winner === factionId ? 'won' : 'lost';
        w.factionId = factionId;
    }

    async function fetchFactionHistory() {
        try {
            const r = await tornGet('user/', { selections: 'log', log: 6253 });
            if (!r.ok) return;
            const joinEvents = Object.values(r.data.log || {})
                .filter(e => e && e.data && e.data.faction && e.timestamp)
                .sort((a, b) => a.timestamp - b.timestamp);
            const factionHistory = joinEvents.map((e, i) => ({
                factionId: e.data.faction,
                joinedAt: e.timestamp,
                leftAt: joinEvents[i + 1] ? joinEvents[i + 1].timestamp : null
            }));
            localStorage.setItem(KEYS.FACTION_HISTORY, JSON.stringify(factionHistory));
        } catch (e) {
            Log.warn('Faction history fetch failed', e);
        }
    }

    function getFactionHistory() {
        try {
            const raw = localStorage.getItem(KEYS.FACTION_HISTORY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    async function fetchPastFactionWars() {
        const factionHistory = getFactionHistory();
        if (!factionHistory || !factionHistory.length) return;
        const pastFactions = factionHistory.filter(m => m.leftAt !== null);
        if (!pastFactions.length) return;
        let wars = {};
        try { const e = localStorage.getItem(KEYS.WARS_DATA); if (e) wars = JSON.parse(e); } catch (e) { /* start fresh */ }
        for (const membership of pastFactions) {
            try {
                const r = await tornGet(`faction/${membership.factionId}`, { selections: 'rankedwars' });
                if (!r.ok) continue;
                Object.entries(r.data.rankedwars || {}).forEach(([id, w]) => {
                    if (!w || !w.war) return;
                    tagWar(w, membership.factionId);
                    wars[id] = w;
                });
            } catch (e) {
                Log.warn('Past faction wars fetch failed for ' + membership.factionId, e);
            }
        }
        localStorage.setItem(KEYS.WARS_DATA, JSON.stringify(wars));
    }

    function wasInFactionDuringWar(factionHistory, factionId, warEnd) {
        if (!factionHistory) return true;
        const intervals = factionHistory.filter(m => m.factionId === factionId);
        if (!intervals.length) return true;
        return intervals.some(m => m.joinedAt <= warEnd && (m.leftAt === null || m.leftAt > warEnd));
    }

    // Fetches your Gym training logs, a short fixed list of item-use logs (Xanax, energy cans,
    // overdoses, etc.), and your current stats — via tornGet() above, the one place your API key is sent.
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
            manualWars = false,
            animate = false
        } = options;
        const silent = !animate;

        if (!userConfig.apiKey || userConfig.apiKey.length < 16) {
            return {
                ok: false,
                error: 'API Key is missing or too short.'
            };
        }

        const ts = Date.now();
        const meta = getActiveHistory().meta;
        const fromFor = codes => {
            const floors = codes.map(c => meta.syncFloor && meta.syncFloor[c]).filter(f => f != null);
            if (floors.length < codes.length) return undefined;
            return Math.max(0, Math.min(...floors) - SYNC_FROM_BUFFER);
        };
        const advanceFloor = (codes, tsSec) => {
            if (!meta.syncFloor) meta.syncFloor = {};
            codes.forEach(c => { meta.syncFloor[c] = tsSec; });
        };
        const logReq = codes => ({
            type: 'log',
            logCodes: codes,
            params: { selections: 'log', log: codes.join(','), from: fromFor(codes), timestamp: ts }
        });
        let reqs = [];

        if (mission === 'TRAIN') {
            reqs.push(logReq(TRAIN_CODES));
        } else {
            reqs = [{
                    type: 'battlestats',
                    // This request also pulls your basic profile info, but the only thing the script
                    // reads from it is your player name (to show on the Titles page) — nothing else.
                    params: { selections: 'battlestats,basic', timestamp: ts }
                },
                logReq(ITEM_CODES),
                logReq(TRAIN_OD_CODES)
            ];
        }

        if (mission === 'FULL_SYNC') fetchWars(manualWars);

        try {
            // Sends the actual requests using your API key, via tornGet().
            const res = await Promise.all(reqs.map(c => tornGet('user/', c.params).then(r => ({ cfg: c, r }))));
            const failed = res.find(x => !x.r.ok);
            if (failed) throw tornError(failed.r);

            let logs = {},
                bs = null;
            res.forEach(({ cfg, r }) => {
                if (r.data.log) logs = { ...logs, ...r.data.log };
                if (cfg.type === 'battlestats') bs = r.data;
            });
            if (bs && bs.name) meta.playerName = bs.name;
            if (bs && bs.player_id) meta.playerId = bs.player_id;

            const tsSec = Math.floor(ts / 1000);
            reqs.forEach(c => {
                if (c.logCodes) advanceFloor(c.logCodes, tsSec);
            });

            if (mission === 'FULL_SYNC') {
                localStorage.setItem(KEYS.LAST_SYNC, ts.toString());
                localStorage.removeItem(KEYS.PENDING_SYNC);
            }

            await DataController.processDataPayload(logs, bs, { silent });

            const _s = getActiveHistory();
            const needsEnhancers = mission === 'FULL_SYNC' && bs &&
                BS_STAT_ROWS.some(row => (bs[row.api] || 0) > (_s.today.endBreakdown[row.abbr] || 0));

            if (needsEnhancers) {
                try {
                    const r = await tornGet('user/', { ...logReq(STAT_LOGS).params, timestamp: Date.now() });
                    if (r.ok) {
                        advanceFloor(STAT_LOGS, tsSec);
                        await DataController.processDataPayload(r.data.log || {}, null, { silent });
                    }
                } catch (e) { Log.warn('Stat enhancer fetch failed', e); }
            }

            return {
                ok: true
            };

        } catch (e) {
            Log.error('Sync failed', e);
            const isQuota = e.name === 'QuotaExceededError' || (e.message && e.message.toLowerCase().includes('quota'));
            const errorMsg = isQuota ? MSG_SYNC_QUOTA :
                e.isTornError ? e.message :
                MSG_SYNC_NETWORK_ERROR;
            return {
                ok: false,
                error: errorMsg
            };
        }
    }

    async function syncWithFeedback(mission, options = {}) {
        Perf.start('syncWithFeedback');
        const btn = dom.refreshBtn;
        if (btn) {
            btn.style.opacity = "0.4";
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.innerText = "Syncing...";
        }

        const result = await universalFetch(mission, { ...options, manualWars: mission !== 'TRAIN' });

        if (result.ok) {
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
            resetRefreshBtn(btn);
        } else {
            bbglError("Sync Error: " + result.error);
            resetRefreshBtn(btn);
        }
        Perf.end('syncWithFeedback');
    }

    function heartbeatTick() {
        if (runtime.hbBusy || Date.now() < (runtime.hbRetryAfter || 0)) return;
        if (document.visibilityState !== 'visible') return;
        const panelOpen = dom.panel && dom.panel.style.display !== 'none';
        const onGymPage = window.location.href.includes('gym.php');
        if (!panelOpen && !onGymPage) return;

        const lastFull = parseInt(localStorage.getItem(KEYS.LAST_SYNC)) || 0;
        const gate = runtime._devHbIntervalMs || 1800000;

        let mission, fire;
        if (panelOpen) {
            mission = 'FULL_SYNC';
            const pending = localStorage.getItem(KEYS.PENDING_SYNC) === '1';
            const sinceLast = lastFull ? Date.now() - lastFull : Infinity;
            fire = pending || sinceLast >= gate;
        } else {
            mission = 'TRAIN';
            const lastLight = Math.max(lastFull, runtime.lastTrainLightSync || 0);
            const sinceLast = lastLight ? Date.now() - lastLight : Infinity;
            fire = sinceLast >= gate;
        }
        if (!fire) return;

        runtime.hbBusy = true;
        universalFetch(mission)
            .then(r => {
                if (!r || !r.ok) runtime.hbRetryAfter = Date.now() + 300000;
                else if (mission === 'TRAIN') runtime.lastTrainLightSync = Date.now();
            })
            .finally(() => {
                runtime.hbBusy = false;
            });
    }

    function startBackgroundSync() {
        if (runtime.bgSyncId) clearInterval(runtime.bgSyncId);
        runtime.bgSyncId = setInterval(heartbeatTick, 3000);
        heartbeatTick();
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

        const perGroupOldest = {};
        stored.series.forEach(e => {
            const code = seriesEntryCode(e);
            const g = code && BACKFILL_GROUP_OF[code];
            if (g && (perGroupOldest[g] === undefined || e.ts < perGroupOldest[g])) perGroupOldest[g] = e.ts;
        });

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

    async function persistBackfillState(ds) {
        let meta;
        if (_historyCache && _historyCache.meta) {
            meta = _historyCache.meta;
        } else {
            meta = (await DBManager.getStorage() || sanitizeStorageRecord(null)).meta;
        }
        meta.backfill = ds;
        await DBManager.saveDays(meta, []);
    }

    async function _persistBackfillSeries(ds, collected) {
        const stored = await DBManager.getStorage() || sanitizeStorageRecord(null);

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
                        if (l.energyLost != null) entry.energyLost = l.energyLost;
                        if (l.happyLost != null) entry.happyLost = l.happyLost;
                        if (l.happy) entry.happy = l.happy;
                        if (l.bookId) entry.bookId = l.bookId;
                        if (l.statKey) {
                            entry.statKey = l.statKey;
                            entry.statGain = l.statGain;
                        }
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

    function _hydrateFromStored(stored) {
        const rebuilt = DataController._rebuildFromSeries(stored.series || [], stored.meta.baselineBreakdown || ZERO_BREAKDOWN);
        _historyCache = {
            meta: stored.meta,
            history: rebuilt.history,
            today: rebuilt.today
        };
        DataController.invalidate();
    }

    async function finalizeBackfill(ds, collected) {
        _hydrateFromStored(await _persistBackfillSeries(ds, collected));
    }

    async function acknowledgeBackfill() {
        if (runtime.demoMode || runtime.backfilling) return;
        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;
        if (!ds || ds.lastResult !== 'complete' || ds.acknowledged !== false) return;
        ds.acknowledged = true;
        await finalizeBackfill(ds, []);
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent: true } }));
        renderScanUI();
    }

    async function proceedPartialBackfill() {
        if (runtime.demoMode || runtime.backfilling) return;
        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;
        if (!ds || ds.lastResult !== 'partial' || ds.acknowledged !== false) return;
        ds.acknowledged = true;
        try {
            await persistBackfillState(ds);
        } catch (e) {
            Log.warn('Backfill proceed save failed', e);
        }
        renderScanUI();
    }

    // If you cancel a Deep Log Scan, this throws away the older history it had reconstructed —
    // only what's been tracked live since you installed the script is kept.
    async function discardBackfillData(ds) {
        const stored = await DBManager.getStorage() || sanitizeStorageRecord(null);

        let cutoff = (typeof stored.meta.rewardStartDate === 'number') ? stored.meta.rewardStartDate : null;
        if (cutoff === null) {
            const p = Date.parse(userConfig.privacyAgreed);
            cutoff = isNaN(p) ? Math.floor(Date.now() / 1000) : Math.floor(p / 1000);
        }

        stored.series = stored.series.filter(e => e.ts >= cutoff);

        let curStats = null;
        try {
            const r = await tornGet('user/', { selections: 'battlestats', timestamp: Date.now() });
            if (r.ok) curStats = r.data;
        } catch (e) {
            Log.warn('Discard baseline battlestats fetch failed', e);
        }
        if (curStats) {
            const liveGain = { str: 0, def: 0, spd: 0, dex: 0 };
            stored.series.forEach(e => {
                if (e.type !== 'item' && liveGain[e.stat] !== undefined) liveGain[e.stat] += (e.gain || 0);
            });
            stored.meta.baselineBreakdown = {
                str: r2((curStats.strength || 0) - liveGain.str),
                def: r2((curStats.defense || 0) - liveGain.def),
                spd: r2((curStats.speed || 0) - liveGain.spd),
                dex: r2((curStats.dexterity || 0) - liveGain.dex)
            };
        }

        ds.targets = {};
        ensureBackfillTargets(ds);

        stored.meta.logStartDate = cutoff;

        ds.lastResult = null;
        ds.stopReason = null;
        ds.completion = null;
        ds.acknowledged = true;
        ds.lock = 0;
        ds.lockOwner = null;
        stored.meta.backfill = ds;

        await DBManager.setStorage(stored);
        _hydrateFromStored(stored);
    }

    async function _scanPage(param, cursor) {
        const r = await tornGet('user/', { selections: 'log', log: param, to: Math.floor(cursor), timestamp: Date.now() });
        if (r.netErr || r.http) {
            Log.warn('Deep scan page fetch failed', r.netErr || `HTTP ${r.http}`);
            return { halt: true };
        }
        if (r.apiError) {
            if (r.apiError.code === 14 || r.apiError.code === 5) return { halt: true };
            throw new Error(r.apiError.error);
        }
        const log = r.data.log || {};
        return { log, rowKeys: Object.keys(log) };
    }

    // Deep Log Scan: uses your API key to page back through your full training history on Torn's
    // servers. It only reads gym training logs and a short list of item logs (energy cans, Xanax,
    // overdoses, etc.) — it never reads your messages, money, or any other personal information.
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

        if (ds.cooldownUntil) {
            if (now < ds.cooldownUntil) {
                renderScanUI();
                return;
            }
            ds.cooldownUntil = 0;
            ds.rowsUsed = 0;
        }

        const freshStored = await DBManager.getStorage();
        const liveLock = freshStored && freshStored.meta && freshStored.meta.backfill && freshStored.meta.backfill.lock;
        if (liveLock && (Date.now() - liveLock) < BACKFILL.LOCK_STALE_MS) {
            renderScanUI();
            return;
        }

        const budget = Math.max(0, BACKFILL.SOFT_CAP - (ds.rowsUsed || 0));
        if (budget <= 0) {
            ds.lastResult = 'partial';
            ds.stopReason = 'cap';
            ds.acknowledged = false;
            ds.cooldownUntil = Date.now() + BACKFILL.COOLDOWN_MS;
            await persistBackfillState(ds);
            renderScanUI();
            return;
        }

        const frontiers = ensureBackfillTargets(ds);

        ds.lastResult = 'partial';
        ds.stopReason = null;
        ds.acknowledged = false;
        ds.lock = Date.now();
        ds.lockOwner = _TAB_ID;
        runtime.backfillAbort = null;
        await persistBackfillState(ds);
        runtime.backfilling = true;
        renderScanOverlay();

        await fetchFactionHistory();
        await fetchPastFactionWars();

        if (btn) {
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.85';
            btn.innerText = 'Scanning... 0';
        }

        let sessionRows = 0;
        let stoppedEarly = false;
        let capHit = false;
        let aborted = null;
        let drainDay = null;
        let pending = [];
        let lastHeartbeat = Date.now();

        const flush = async () => {
            ds.lock = Date.now();
            ds.lockOwner = _TAB_ID;
            await _persistBackfillSeries(ds, pending);
            pending = [];
            lastHeartbeat = Date.now();
        };

        try {
            while (sessionRows < BACKFILL.HARD_CAP) {
                if (runtime.backfillAbort) {
                    aborted = runtime.backfillAbort;
                    break;
                }
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

                let page = await _scanPage(param, fr.cursor);
                if (page.halt) {
                    stoppedEarly = true;
                    break;
                }

                if (page.rowKeys.length === 0) {
                    await new Promise(r => setTimeout(r, BACKFILL.THROTTLE_MS));
                    const confirm = await _scanPage(param, fr.cursor);
                    if (confirm.halt) {
                        stoppedEarly = true;
                        break;
                    }
                    if (confirm.rowKeys.length === 0) {
                        fr.complete = true;
                        continue;
                    }
                    page = confirm;
                }

                pending.push(...normalizeApiLogs(page.log));
                sessionRows += page.rowKeys.length;
                ds.rowsUsed = (ds.rowsUsed || 0) + page.rowKeys.length;

                let oldestTs = fr.cursor;
                for (const k of page.rowKeys) {
                    const t = page.log[k].timestamp;
                    if (t < oldestTs) oldestTs = t;
                }
                fr.cursor = oldestTs - 1;

                if (btn) btn.innerText = `Scanning... ${ds.rowsUsed}`;
                updateScanOverlayCount(ds.rowsUsed);

                if (drainDay === null && ds.rowsUsed >= BACKFILL.SOFT_CAP) {
                    capHit = true;
                    let maxCursor = -Infinity;
                    BACKFILL_GROUP_KEYS.forEach(g => {
                        const f = frontiers[g];
                        if (f && !f.complete && f.cursor > maxCursor) maxCursor = f.cursor;
                    });
                    if (maxCursor > -Infinity) drainDay = backfillDayStart(maxCursor);
                }

                if (pending.length >= BACKFILL.CHECKPOINT_ROWS || Date.now() - lastHeartbeat >= BACKFILL.HEARTBEAT_MS) {
                    await flush();
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

        ds.lock = 0;
        ds.lockOwner = null;

        if (aborted === 'cancel') {
            pending = [];
            runtime.backfilling = false;
            runtime.backfillAbort = null;
            try {
                await discardBackfillData(ds);
            } catch (e) {
                Log.error('Backfill discard failed', e);
            }
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent: true } }));
            renderScanUI();
            return;
        }

        const allComplete = BACKFILL_GROUP_KEYS.every(g => frontiers[g] && frontiers[g].complete);
        if (allComplete && !stoppedEarly && !aborted) {
            ds.lastResult = 'complete';
            ds.stopReason = null;
            ds.acknowledged = false;
            ds.cooldownUntil = 0;
            ds.rowsUsed = 0;
        } else {
            ds.lastResult = 'partial';
            ds.acknowledged = false;
            if (aborted === 'pause') {
                ds.stopReason = 'paused';
            } else if (capHit || (ds.rowsUsed || 0) >= BACKFILL.SOFT_CAP) {
                ds.stopReason = 'cap';
                ds.cooldownUntil = Date.now() + BACKFILL.COOLDOWN_MS;
            } else {
                ds.stopReason = 'error';
            }
        }

        try {
            await finalizeBackfill(ds, pending);
        } catch (e) {
            Log.error('Deep scan save failed', e);
        } finally {
            runtime.backfilling = false;
            runtime.backfillAbort = null;
        }

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

        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent: true } }));
        renderScanUI();
    }

    async function recoverInterruptedBackfill() {
        if (runtime.demoMode || runtime.backfilling) return;
        const s = getActiveHistory();
        const ds = s.meta && s.meta.backfill;
        if (!ds || !ds.lock) return;
        if ((Date.now() - ds.lock) <= BACKFILL.LOCK_STALE_MS) return;
        ds.lock = 0;
        ds.lockOwner = null;
        if (ds.lastResult !== 'complete') {
            ds.lastResult = 'partial';
            if (ds.stopReason !== 'cap') ds.stopReason = 'interrupted';
            ds.acknowledged = false;
        }
        try {
            await persistBackfillState(ds);
        } catch (e) {
            Log.warn('Backfill lock recovery save failed', e);
        }
    }

