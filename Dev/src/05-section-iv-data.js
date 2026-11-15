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
        _BF_STORE: 'backfill',
        _INBOX_STORE: 'inbox',

        // This function sets up a private database on your browser to save your history.
        // 'backfill' holds the history scan's progress, and 'inbox' holds the log lines it has
        // downloaded but not yet added to your log. Both stay in your browser like everything else.
        initDB() {
            return new Promise((resolve, reject) => {
                if (this._db) {
                    resolve(this._db);
                    return;
                }
                Perf.start('initDB');
                const req = indexedDB.open(this._DB_NAME, 3);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (db.objectStoreNames.contains('history')) db.deleteObjectStore('history');
                    if (!db.objectStoreNames.contains(this._META_STORE)) db.createObjectStore(this._META_STORE);
                    if (!db.objectStoreNames.contains(this._DAYS_STORE)) db.createObjectStore(this._DAYS_STORE);
                    if (!db.objectStoreNames.contains(this._BF_STORE)) db.createObjectStore(this._BF_STORE);
                    if (!db.objectStoreNames.contains(this._INBOX_STORE)) {
                        db.createObjectStore(this._INBOX_STORE, { keyPath: 'id' }).createIndex('group_ts', ['group', 'ts']);
                    }
                };
                // A tab still running an older version holds the database open and delays this
                // upgrade until it's closed.
                req.onblocked = () => Log.warn('IndexedDB upgrade waiting for another Torn tab to close');
                req.onsuccess = (e) => {
                    this._db = e.target.result;
                    // Let a newer version in another tab upgrade instead of blocking it; the next
                    // call here reopens.
                    this._db.onversionchange = () => {
                        this._db.close();
                        this._db = null;
                    };
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
            await this.withHistoryWrite(async () => {
                const meta = (await this._readMeta()) || {};
                meta.rewardStartDate = Math.floor(Date.now() / 1000);
                meta.historyGen = (meta.historyGen || 0) + 1;
                await new Promise((resolve, reject) => {
                    const tx = db.transaction(this._META_STORE, 'readwrite');
                    tx.objectStore(this._META_STORE).put(meta, this._META_KEY);
                    tx.oncomplete = resolve;
                    tx.onerror = () => reject(tx.error);
                });
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

        // Every change to your saved history goes through here, one at a time across all your open
        // Torn tabs, so two tabs can never overwrite each other's changes.
        withHistoryWrite(fn) {
            const locks = getWebLocks();
            return locks ? locks.request('bbgl-history-write', () => fn()) : Promise.resolve().then(fn);
        },

        // Saves your gym data to your browser's private storage.
        // opts.inLock: the caller already holds withHistoryWrite. opts.bumpGen: this write replaces
        // history other tabs may have cached, so they must reload. opts.force: a deliberate full
        // replace (import) that skips the staleness check and bumps. opts.extraStores + opts.extraOps(tx):
        // more writes that must commit in the same transaction (the backfill merge's state and inbox).
        _persist(meta, dayObjs, replaceAll, opts = {}) {
            const run = () => this._persistUnlocked(meta, dayObjs, replaceAll, opts);
            return opts.inLock ? run() : this.withHistoryWrite(run);
        },

        // historyGen guard: a tab whose cached meta is older than the stored one (another tab merged,
        // cleared or imported since it loaded) must not write, since its whole-meta put would undo
        // that change. It reloads instead and resolves 'stale'; callers re-apply their change if needed.
        _persistUnlocked(meta, dayObjs, replaceAll, opts) {
            return new Promise((resolve, reject) => {
                if (!this._db) {
                    reject(new Error("Database not initialized"));
                    return;
                }
                try {
                    let stale = false;
                    const m = meta || {};
                    const tx = this._db.transaction([this._META_STORE, this._DAYS_STORE, ...(opts.extraStores || [])], 'readwrite');
                    const dayStore = tx.objectStore(this._DAYS_STORE);
                    const metaStore = tx.objectStore(this._META_STORE);
                    const read = metaStore.get(this._META_KEY);
                    read.onsuccess = () => {
                        const storedGen = (read.result && read.result.historyGen) || 0;
                        if (!opts.force && storedGen > (m.historyGen || 0)) {
                            stale = true;
                            tx.abort();
                            return;
                        }
                        if (opts.force || opts.bumpGen) m.historyGen = storedGen + 1;
                        if (replaceAll) dayStore.clear();
                        metaStore.put(m, this._META_KEY);
                        (dayObjs || []).forEach(d => {
                            if (d && d.date) dayStore.put(d, d.date);
                        });
                        if (opts.extraOps) opts.extraOps(tx);
                    };
                    tx.oncomplete = () => {
                        _syncChannel.postMessage({
                            type: 'update',
                            from: _TAB_ID
                        });
                        resolve('ok');
                    };
                    tx.onerror = (e) => {
                        const err = e.target.error;
                        Log.error('IndexedDB write failed', err);
                        if (err && err.name === 'QuotaExceededError') {
                            bbglError("⚠️ STORAGE ERROR: Browser quota exceeded.\n\nYour data could not be saved. Please export your history and then 'Clear Data' to free up space.");
                        }
                        reject(err);
                    };
                    tx.onabort = () => {
                        if (!stale) return reject(tx.error);
                        this._reloadAfterStale().catch(e => Log.warn('Reload after stale write failed', e)).then(() => resolve('stale'));
                    };
                } catch (e) {
                    reject(e);
                }
            });
        },

        async _reloadAfterStale() {
            Log.warn('Saved history changed in another tab; reloaded it instead of saving over it');
            if (runtime.demoMode) return;
            DataController.hydrate(await this.loadHistory());
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent: true } }));
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
        async saveDays(meta, dayObjs, opts) {
            await this._ensureDb();
            return this._persist(meta, dayObjs, false, opts);
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
        async setStorage(data, opts) {
            await this._ensureDb();
            if (!this._db) throw new Error("Database not initialized");
            const meta = (data && data.meta) || {};
            const series = (data && Array.isArray(data.series)) ? data.series : [];
            const rebuilt = DataController._rebuildFromSeries(series, meta.baselineBreakdown || ZERO_BREAKDOWN);
            return this._persist(meta, [...rebuilt.history, rebuilt.today], true, opts);
        },

        // This function permanently deletes your gym history from your browser, along with any
        // history scan in progress. With keepRewards (the Clear Log button) it keeps only your reward
        // start date, sticker progress and custom notes, so a later Refill Log restores your log
        // exactly as it was. A factory reset deletes everything.
        async clearStorage(opts = {}) {
            await this._ensureDb();
            return this.withHistoryWrite(() => new Promise((resolve, reject) => {
                if (!this._db) {
                    resolve();
                    return;
                }
                const stores = [this._META_STORE, this._DAYS_STORE, this._BF_STORE, this._INBOX_STORE];
                const tx = this._db.transaction(stores, 'readwrite');
                const metaStore = tx.objectStore(this._META_STORE);
                const read = metaStore.get(this._META_KEY);
                read.onsuccess = () => {
                    const old = read.result || {};
                    const kept = { historyGen: (old.historyGen || 0) + 1 };
                    if (opts.keepRewards) {
                        if (typeof old.rewardStartDate === 'number') kept.rewardStartDate = old.rewardStartDate;
                        if (old.stickers) kept.stickers = old.stickers;
                        if (old.notes) kept.notes = old.notes;
                    }
                    metaStore.clear();
                    metaStore.put(kept, this._META_KEY);
                    tx.objectStore(this._DAYS_STORE).clear();
                    tx.objectStore(this._BF_STORE).clear();
                    tx.objectStore(this._INBOX_STORE).clear();
                };
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
            }));
        },

        // ─── History scan storage ───────────────────────────────────────────
        // Reads one record of the scan's saved progress ('state' or 'notices'), or null if there is none.
        async getBackfillRecord(key) {
            const db = await this._ensureDb();
            if (!db) return null;
            return new Promise((resolve, reject) => {
                const req = db.transaction(this._BF_STORE, 'readonly').objectStore(this._BF_STORE).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
        },

        // No saved state means no log has been started yet (a new install, or right after Clear Log).
        getBackfillState() {
            return this.getBackfillRecord('state');
        },

        async getNotices() {
            return Object.assign({ seenErrorEpoch: 0, seenCapEpoch: 0, completionSeen: false }, await this.getBackfillRecord('notices'));
        },

        // Remembers which scan messages you've already seen, so each one shows only once.
        async setNotices(patch) {
            const db = await this._ensureDb();
            if (!db) return;
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this._BF_STORE, 'readwrite');
                const store = tx.objectStore(this._BF_STORE);
                const read = store.get('notices');
                read.onsuccess = () => store.put(Object.assign({}, read.result || {}, patch), 'notices');
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        },

        // Starts over: empties the inbox and replaces the scan's state and notices in one step.
        // A null state removes it (no log started).
        async resetBackfill(state, notices) {
            const db = await this._ensureDb();
            if (!db) return;
            return new Promise((resolve, reject) => {
                const tx = db.transaction([this._BF_STORE, this._INBOX_STORE], 'readwrite');
                const store = tx.objectStore(this._BF_STORE);
                tx.objectStore(this._INBOX_STORE).clear();
                if (state) store.put(state, 'state');
                else store.delete('state');
                store.put(notices || {}, 'notices');
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        },

        // Saves one page of downloaded log lines together with the scan's progress, in a single
        // step, so the two can never disagree. Lines are stored under Torn's own log ID, so a page
        // downloaded twice just overwrites itself. If the scan was stopped (Clear Log) since it
        // started, nothing is saved and this returns false.
        async inboxCommitPage(runId, group, lines, statePatch) {
            const db = await this._ensureDb();
            if (!db) return false;
            return new Promise((resolve, reject) => {
                let stale = false;
                const tx = db.transaction([this._BF_STORE, this._INBOX_STORE], 'readwrite');
                const bf = tx.objectStore(this._BF_STORE);
                const inbox = tx.objectStore(this._INBOX_STORE);
                const read = bf.get('state');
                read.onsuccess = () => {
                    const state = read.result;
                    if (!state || state.runId !== runId) {
                        stale = true;
                        tx.abort();
                        return;
                    }
                    (lines || []).forEach(l => {
                        if (l && l.id) inbox.put(Object.assign({}, l, { group }));
                    });
                    bf.put(Object.assign(state, statePatch || {}), 'state');
                };
                tx.oncomplete = () => resolve(true);
                tx.onabort = () => (stale ? resolve(false) : reject(tx.error));
            });
        },

        // The oldest downloaded line for one log group, or null if it has none yet.
        async inboxOldest(group) {
            const db = await this._ensureDb();
            if (!db) return null;
            return new Promise((resolve, reject) => {
                const range = IDBKeyRange.bound([group, -Infinity], [group, Infinity]);
                const req = db.transaction(this._INBOX_STORE, 'readonly').objectStore(this._INBOX_STORE).index('group_ts').openCursor(range, 'next');
                req.onsuccess = () => resolve(req.result ? req.result.value : null);
                req.onerror = () => reject(req.error);
            });
        },

        // Which of these log IDs are already in the inbox, to tell a fresh page from a repeat.
        async inboxExistingIds(ids) {
            const found = new Set();
            const db = await this._ensureDb();
            if (!db || !ids.length) return found;
            return new Promise((resolve, reject) => {
                const tx = db.transaction(this._INBOX_STORE, 'readonly');
                const store = tx.objectStore(this._INBOX_STORE);
                ids.forEach(id => {
                    const req = store.getKey(id);
                    req.onsuccess = () => {
                        if (req.result !== undefined) found.add(id);
                    };
                });
                tx.oncomplete = () => resolve(found);
                tx.onerror = () => reject(tx.error);
            });
        },

        async inboxAll() {
            const db = await this._ensureDb();
            if (!db) return [];
            return new Promise((resolve, reject) => {
                const req = db.transaction(this._INBOX_STORE, 'readonly').objectStore(this._INBOX_STORE).getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => reject(req.error);
            });
        },

        async inboxCount() {
            const db = await this._ensureDb();
            if (!db) return 0;
            return new Promise((resolve, reject) => {
                const req = db.transaction(this._INBOX_STORE, 'readonly').objectStore(this._INBOX_STORE).count();
                req.onsuccess = () => resolve(req.result || 0);
                req.onerror = () => reject(req.error);
            });
        }
    };

    // Web Locks let your open Torn tabs take turns: only one tab scans your history at a time, and
    // saves to your history happen one after another. Very old browsers don't have them; the script
    // then falls back to simpler tab coordination. Nothing here leaves your browser.
    let _webLocks;
    function getWebLocks() {
        if (runtime.devMode && runtime._devForceNoWebLocks) return null;
        if (_webLocks === undefined) {
            _webLocks = null;
            try {
                _webLocks = navigator.locks || (typeof unsafeWindow !== 'undefined' && unsafeWindow.navigator && unsafeWindow.navigator.locks) || null;
            } catch (e) { /* stays null */ }
        }
        return _webLocks;
    }

    function hasWebLocks() {
        return !!getWebLocks();
    }

    const _syncChannel = new BroadcastChannel('bbgl_sync');
    let _xtabSyncTimer = null;
    _syncChannel.onmessage = (event) => {
        if (event.data && event.data.from === _TAB_ID) return;
        // Scan coordination messages, handled before the Demo check: the scan runs during Demo too.
        if (event.data && typeof event.data.type === 'string' && event.data.type.startsWith('bf:')) {
            handleBackfillMessage(event.data);
            return;
        }
        if (runtime.demoMode) return;
        if (_xtabSyncTimer) clearTimeout(_xtabSyncTimer);
        _xtabSyncTimer = setTimeout(async () => {
            _xtabSyncTimer = null;
            try {
                const loaded = await DBManager.loadHistory();
                DataController.hydrate(loaded);
                if (dom.panel && dom.panel.style.display !== 'none') renderPanelContent();
                refreshBackfillUI();
                maybeStartBackfill();
            } catch (e) {
                Log.warn('Cross-tab sync failed', e);
            }
        }, 200);
    };

    function sanitizeMeta(metaRaw) {
        const m = (metaRaw && typeof metaRaw === 'object') ? metaRaw : {};
        if (!m.baselineBreakdown) m.baselineBreakdown = {
            ...ZERO_BREAKDOWN
        };
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
                msg: "This export is from before a required data reset and can no longer be imported. Please initialize a fresh log."
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
            // Code 5 is Torn saying "too many requests": the history scan slows down so your normal
            // syncing keeps working.
            if (data.error && data.error.code === 5) noteRateLimit(false);
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
            if (!r.ok) return false;
            const joinEvents = Object.values(r.data.log || {})
                .filter(e => e && e.data && e.data.faction && e.timestamp)
                .sort((a, b) => a.timestamp - b.timestamp);
            const factionHistory = joinEvents.map((e, i) => ({
                factionId: e.data.faction,
                joinedAt: e.timestamp,
                leftAt: joinEvents[i + 1] ? joinEvents[i + 1].timestamp : null
            }));
            localStorage.setItem(KEYS.FACTION_HISTORY, JSON.stringify(factionHistory));
            return true;
        } catch (e) {
            Log.warn('Faction history fetch failed', e);
            return false;
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

            if (await DataController.processDataPayload(logs, bs, { silent }) === 'STALE' && !options._staleRetry) {
                // Another tab replaced the saved history mid-sync. This tab has reloaded it (with the
                // older sync floor), so fetch once more against it rather than wait for the next heartbeat.
                return universalFetch(mission, { ...options, _staleRetry: true });
            }

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

            // A backfill waiting on this sync (it needs logStartDate) can start now rather than on
            // the next page load.
            maybeStartBackfill();
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
        } else {
            bbglError("Sync Error: " + result.error);
            resetRefreshBtn(btn);
        }
        Perf.end('syncWithFeedback');
    }

    function heartbeatTick() {
        if (runtime.hbBusy || Date.now() < (runtime.hbRetryAfter || 0)) return;
        if (document.visibilityState !== 'visible') return;
        // A Train click's own sync (handleGymClick, 10-section-ix-init.js) is waiting out its debounce
        // or still in flight. This tick's sync is silent and fetches the same train logs, so if it
        // merged them first the level bars would snap to the new value and the click's animated sync
        // would find nothing left to animate. Hold off until that sync has landed; the full sync the
        // click left pending still runs on a later tick.
        if (runtime.trainDebouncer || runtime.trainSyncInFlight) return;
        const panelOpen = dom.panel && dom.panel.style.display !== 'none';
        const onGymPage = window.location.href.includes('gym.php');
        if (!panelOpen && !onGymPage) return;

        const lastFull = parseInt(localStorage.getItem(KEYS.LAST_SYNC)) || 0;
        const gate = 1800000;

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

    function backfillDayStart(ts) {
        return Math.floor(Formatter.parse(Formatter.dateLogical(ts * 1000)).getTime() / 1000);
    }

    // Adds downloaded log lines into a stored series, skipping any already there (gym lines by
    // time + stat + stat-after, item lines by time + log type), and keeps it in time order.
    function mergeLinesIntoSeries(stored, lines) {
        const seenGym = new Set(stored.series.filter(e => e.type !== 'item').map(e => `${e.ts}_${e.stat}_${e.after}`));
        const itemKey = e => `${e.ts}_${e.logId}`;
        const seenItem = new Set(stored.series.filter(e => e.type === 'item').map(itemKey));
        let added = 0;
        (lines || []).forEach(l => {
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
                    added++;
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
                added++;
            }
        });
        stored.series.sort((a, b) => a.ts - b.ts);
        return added;
    }

    // Starting stats = each stat's value just before its oldest stored train.
    function recomputeBaseline(stored) {
        const baseline = {
            ...((stored.meta && stored.meta.baselineBreakdown) || ZERO_BREAKDOWN)
        };
        STAT_KEYS.forEach(k => {
            const first = stored.series.find(e => e.stat === k);
            if (first) baseline[k] = r2(first.after - first.gain);
        });
        stored.meta.baselineBreakdown = baseline;
    }

    /* ==========================================================================
     *  Automatic history scan (Big Black Backfill)
     *  After you click Initialize Log or Refill Log, this pages backwards through your Torn logs,
     *  100 lines per request, using only tornGet() above. It reads the same gym and item logs the
     *  live sync reads, nothing else. Each page goes into the inbox in your browser; your calendar
     *  is built from it once at the end. Closing the tab or changing pages just pauses it: the next
     *  page you open carries on from the oldest line already saved.
     * ========================================================================== */

    const BF_LEASE_KEY = 'bbgl_bf_lease';
    const BF_KEY_ERROR_CODES = [2, 10, 13, 16, 18];

    function newBackfillState(mode) {
        const done = {};
        BACKFILL_GROUP_KEYS.forEach(g => { done[g] = false; });
        return {
            v: 1,
            runId: Math.random().toString(36).slice(2) + Date.now().toString(36),
            mode,
            status: 'scanning',
            done,
            roundStart: 0,
            rowsUsed: 0,
            cooldownUntil: 0,
            factionFetched: false,
            pendingMerge: null,
            firstMergeDone: false,
            lastError: null,
            errorEpoch: 0,
            capEpoch: 0
        };
    }

    // What an imported log is marked as: already built, nothing left to scan.
    function completedBackfillState() {
        const st = newBackfillState('initialize');
        BACKFILL_GROUP_KEYS.forEach(g => { st.done[g] = true; });
        return Object.assign(st, { status: 'complete', firstMergeDone: true });
    }

    // True while the backfill is actively scanning (not during a cap cooldown, when import and
    // export are allowed: an import then replaces the partial log and ends the backfill).
    async function backfillScanning() {
        const st = await DBManager.getBackfillState();
        return !!st && st.status === 'scanning';
    }

    // The scan state changed: refresh this tab's overlay/notices/buttons and tell the other tabs.
    function announceBackfillState() {
        _syncChannel.postMessage({ type: 'bf:state', from: _TAB_ID });
        refreshBackfillUI();
    }

    // Initialize Log (welcome screen; the first sync stamps a new reward start date) and Refill Log
    // (after Clear Log; the kept reward start date stays) both start here. The sync makes sure the
    // log exists before the scan starts, since the scan works back from its start date.
    async function startLog({ newRewardDate }) {
        await DBManager.resetBackfill(newBackfillState(newRewardDate ? 'initialize' : 'refill'), {});
        announceBackfillState();
        switchView('ledger');
        await syncWithFeedback('FULL_SYNC');
        maybeStartBackfill();
    }

    // Pause/Resume from the overlay. Saved in the scan state, so it holds in every tab and across
    // page loads until resumed; the scanning tab stops before its next call.
    async function setBackfillPaused(paused) {
        const st = await DBManager.getBackfillState();
        if (!st || !await DBManager.inboxCommitPage(st.runId, null, [], { paused })) return;
        if (paused) {
            handleBackfillMessage({ type: 'bf:pause' });
            _syncChannel.postMessage({ type: 'bf:pause', from: _TAB_ID });
        } else {
            announceBackfillState();
            maybeStartBackfill();
        }
    }

    // End Backfill: build what's been scanned (up to the last fully scanned day) and stop for good
    // until the player resumes it from Settings. Waits for the scan lock so a tab mid-page finishes
    // saving first.
    async function endBackfill() {
        let lock = null;
        for (let i = 0; i < 10 && !lock; i++) {
            lock = await acquireBackfillLock();
            if (!lock) await new Promise(r => setTimeout(r, 500));
        }
        if (!lock) return;
        try {
            const st = await DBManager.getBackfillState();
            if (!st || st.status !== 'scanning') return;
            if (!await DBManager.inboxCommitPage(st.runId, null, [], { pendingMerge: 'stop', paused: false })) return;
            Object.assign(st, { pendingMerge: 'stop', paused: false });
            await mergeInbox('stop', st);
        } finally {
            lock.release();
        }
    }

    // Resume Backfill (Settings, only after End Backfill): carries on from the oldest built day,
    // keeping finished groups, with the overlay back until the next build.
    async function resumeStoppedBackfill() {
        const st = await DBManager.getBackfillState();
        if (!st || st.status !== 'stopped') return;
        if (!await DBManager.inboxCommitPage(st.runId, null, [], { status: 'scanning', firstMergeDone: false, roundStart: 0, paused: false, lastError: null })) return;
        announceBackfillState();
        switchView('ledger');
        maybeStartBackfill();
    }

    // The date End Backfill would build back to, for the confirmation pop-up.
    async function backfillStopFloor() {
        const st = await DBManager.getBackfillState();
        const meta = await readStoredMeta();
        const existing = meta && typeof meta.logStartDate === 'number' ? meta.logStartDate : null;
        if (!st) return existing;
        const floor = computeScanFloor(await DBManager.inboxAll(), st);
        return existing !== null ? Math.min(floor, existing) : floor;
    }

    async function readStoredMeta() {
        const db = await DBManager._ensureDb();
        return db ? DBManager._readMeta() : null;
    }

    // Why the scan can't run right now, or null if it can. The first sync after Initialize or Clear
    // stamps logStartDate/rewardStartDate; the scan waits for it, since it scans back from logStartDate.
    function backfillBlockReason(st, meta) {
        if (!userConfig.apiKey || userConfig.apiKey.length < 16) return 'no API key';
        if (!localStorage.getItem('bbgl_initialized')) return 'not initialized';
        if (!st) return 'no log started';
        if (st.status === 'complete') return 'complete';
        if (st.status === 'stopped') return 'ended by the player';
        if (st.paused) return 'paused';
        if (st.status === 'cooldown' && Date.now() < st.cooldownUntil) return 'cooling down';
        if (!meta || typeof meta.logStartDate !== 'number' || typeof meta.rewardStartDate !== 'number') return 'waiting for first sync';
        return null;
    }

    // ─── Tab coordination ────────────────────────────────────────────────────
    function readLease() {
        try { return JSON.parse(localStorage.getItem(BF_LEASE_KEY)); } catch (e) { return null; }
    }

    function leaseIsMine() {
        const l = readLease();
        return !!l && l.tabId === _TAB_ID;
    }

    function writeLease() {
        localStorage.setItem(BF_LEASE_KEY, JSON.stringify({ tabId: _TAB_ID, at: Date.now() }));
    }

    // No-Web-Locks fallback: a lease in localStorage, renewed while scanning, deleted on pagehide so
    // the next page takes over at once, and treated as dead after LEASE_STALE_MS if a tab crashed.
    // Two tabs racing for it is unlikely after the write-then-read-back, and harmless if it happens:
    // inbox writes overwrite by id.
    async function acquireLease() {
        const cur = readLease();
        if (cur && cur.tabId !== _TAB_ID && Date.now() - cur.at < BACKFILL.LEASE_STALE_MS) return null;
        writeLease();
        await new Promise(r => setTimeout(r, 250));
        if (!leaseIsMine()) return null;
        const timer = setInterval(() => { if (leaseIsMine()) writeLease(); }, BACKFILL.LEASE_RENEW_MS);
        const release = () => {
            clearInterval(timer);
            window.removeEventListener('pagehide', release);
            if (leaseIsMine()) localStorage.removeItem(BF_LEASE_KEY);
        };
        window.addEventListener('pagehide', release);
        return { release, check: leaseIsMine };
    }

    // Resolves { release, check } once this tab may scan, or null. With Web Locks, a tab that finds
    // the lock taken queues for it, so it takes over the moment the scanning tab closes or navigates.
    function acquireBackfillLock() {
        const locks = getWebLocks();
        if (!locks) return acquireLease();
        const request = (opts) => new Promise(resolve => {
            let release;
            const held = new Promise(r => { release = r; });
            locks.request('bbgl-backfill', opts, lock => {
                if (!lock) {
                    resolve(null);
                    return;
                }
                resolve({ release, check: () => true });
                return held;
            }).catch(e => {
                Log.warn('Backfill lock request failed', e);
                resolve(null);
            });
        });
        return request({ ifAvailable: true }).then(lock => {
            if (lock) return lock;
            if (document.visibilityState === 'visible') _syncChannel.postMessage({ type: 'bf:want', from: _TAB_ID });
            runtime.bfWaitingLock = true;
            return request({}).finally(() => { runtime.bfWaitingLock = false; });
        });
    }

    // A wait the scan can be woken from early (stop, hand-off, Try Again).
    function bfSleep(ms) {
        return new Promise(resolve => {
            const done = () => {
                clearTimeout(timer);
                if (runtime.bfWake === done) runtime.bfWake = null;
                resolve();
            };
            const timer = setTimeout(done, ms);
            runtime.bfWake = done;
        });
    }

    function wakeBackfill() {
        if (runtime.bfWake) runtime.bfWake();
    }

    // Torn's "too many requests" (code 5) from any call in any tab: the scan backs off for a minute.
    // Live sync never waits on this.
    function noteRateLimit(fromOtherTab) {
        runtime.bfRateUntil = Date.now() + BACKFILL.RATE_BACKOFF_MS;
        if (!fromOtherTab) _syncChannel.postMessage({ type: 'bf:ratelimit', from: _TAB_ID });
    }

    // Try Again on the connection error: retry straight away, here or in whichever tab is scanning.
    function retryBackfillNow() {
        runtime.bfFailCount = 0;
        if (runtime.bfScanning) wakeBackfill();
        else {
            _syncChannel.postMessage({ type: 'bf:retry', from: _TAB_ID });
            maybeStartBackfill();
        }
    }

    function handleBackfillMessage(msg) {
        switch (msg.type) {
            case 'bf:stop':
                runtime.bfStop = true;
                wakeBackfill();
                break;
            case 'bf:state':
                refreshBackfillUI();
                maybeStartBackfill();
                break;
            case 'bf:ratelimit':
                noteRateLimit(true);
                break;
            case 'bf:progress':
                updateBackfillCount(msg.count);
                break;
            case 'bf:pause':
                runtime.bfStop = true;
                wakeBackfill();
                refreshBackfillUI();
                break;
            case 'bf:retry':
                runtime.bfFailCount = 0;
                wakeBackfill();
                break;
            case 'bf:want':
                // A tab the player is looking at wants to scan; a hidden one hands over after its
                // current page is saved (hidden tabs are throttled hard by the browser).
                if (runtime.bfScanning && hasWebLocks() && document.visibilityState === 'hidden') {
                    runtime.bfYield = true;
                    wakeBackfill();
                }
                break;
        }
    }

    // ─── Fetching one page ────────────────────────────────────────────────────
    const BF_DEV_FAILS = {
        net: { ok: false, netErr: new Error('dev: forced network failure') },
        http: { ok: false, http: 500 },
        code5: { ok: false, apiError: { code: 5, error: 'dev: forced' } },
        code8: { ok: false, apiError: { code: 8, error: 'dev: forced' } },
        code14: { ok: false, apiError: { code: 14, error: 'dev: forced' } },
        key2: { ok: false, apiError: { code: 2, error: 'dev: forced' } },
        key16: { ok: false, apiError: { code: 16, error: 'dev: forced' } },
        key18: { ok: false, apiError: { code: 18, error: 'dev: forced' } },
        unknown: { ok: false, apiError: { code: 999, error: 'dev: forced' } }
    };

    // kind: 'temporary' (retry later), 'limit' (Torn's daily read limit), 'key' (the key itself).
    function classifyScanError(r) {
        if (r.netErr) return { kind: 'temporary', code: 'net' };
        if (r.http) return { kind: 'temporary', code: `http${r.http}` };
        const c = r.apiError && r.apiError.code;
        if (c === 14) return { kind: 'limit', code: 14 };
        if (BF_KEY_ERROR_CODES.includes(c)) return { kind: 'key', code: c };
        return { kind: 'temporary', code: c };
    }

    // Asks Torn for the newest 100 lines of one log group at or before `to`.
    async function fetchScanPage(param, to) {
        const forced = runtime.devMode && runtime._devTakeBackfillFail ? runtime._devTakeBackfillFail() : null;
        const r = (forced && BF_DEV_FAILS[forced]) || await tornGet('user/', { selections: 'log', log: param, to: Math.floor(to), timestamp: Date.now() });
        if (!r.ok) return { error: classifyScanError(r) };
        const log = (r.data && r.data.log) || {};
        return { log, rowKeys: Object.keys(log) };
    }

    // ─── Building the log from the inbox ─────────────────────────────────────
    // At a cap, the oldest day the calendar can safely show: every unfinished roll has scanned past
    // all of the day before it. A roll with no inbox lines this round hasn't moved past roundStart.
    // Start-of-next-day is taken from dayStart + 26h so a DST day can't put it inside the partial day.
    function computeScanFloor(lines, st) {
        const oldest = {};
        lines.forEach(l => {
            if (oldest[l.group] === undefined || l.ts < oldest[l.group]) oldest[l.group] = l.ts;
        });
        let floor = null;
        BACKFILL_GROUP_KEYS.forEach(g => {
            if (st.done[g]) return;
            const reach = oldest[g] !== undefined ? oldest[g] : st.roundStart;
            const f = backfillDayStart(backfillDayStart(reach) + 26 * 3600);
            if (floor === null || f > floor) floor = f;
        });
        return floor;
    }

    // Adds the inbox to your saved log and rebuilds the calendar, in one save together with the
    // scan's progress, so it either all happens or none of it does. 'final' adds everything. 'cap'
    // (Torn's daily limit reached) adds only complete days, keeps finished log groups' older lines in
    // the inbox for the final merge, and drops the rest to be downloaded again after the wait.
    // If this is interrupted, pendingMerge is still set and the next page load redoes it; lines
    // already added are skipped as duplicates.
    async function mergeInbox(mode, st) {
        const runId = st.runId;
        let result = null;
        try {
            await DBManager.withHistoryWrite(async () => {
                const fresh = await DBManager.getBackfillState();
                if (!fresh || fresh.runId !== runId || fresh.pendingMerge !== mode) return;
                const lines = await DBManager.inboxAll();
                const stored = await DBManager.getStorage() || sanitizeStorageRecord(null);
                const existing = typeof stored.meta.logStartDate === 'number' ? stored.meta.logStartDate : null;

                let toMerge = lines;
                let held = [];
                let floor = null;
                // 'cap' and 'stop' (End Backfill) both build only up to the last fully scanned day.
                if (mode === 'cap' || mode === 'stop') {
                    floor = computeScanFloor(lines, fresh);
                    if (existing !== null) floor = Math.min(floor, existing);
                    toMerge = lines.filter(l => l.ts >= floor);
                    held = lines.filter(l => l.ts < floor && fresh.done[l.group]);
                }
                mergeLinesIntoSeries(stored, toMerge);
                recomputeBaseline(stored);
                if (mode === 'final' && stored.series.length) floor = backfillDayStart(stored.series[0].ts);
                if (floor !== null) stored.meta.logStartDate = existing !== null ? Math.min(floor, existing) : floor;

                const crash = runtime.devMode && runtime._devTakeMergeCrash ? runtime._devTakeMergeCrash() : null;
                if (crash === 'beforeTx') throw new Error('dev: forced merge crash before save');

                const patch = mode === 'final'
                    ? { pendingMerge: null, firstMergeDone: true, status: 'complete', lastError: null }
                    : mode === 'stop'
                    ? { pendingMerge: null, firstMergeDone: true, status: 'stopped', paused: false }
                    : { pendingMerge: null, firstMergeDone: true, status: 'cooldown', cooldownUntil: Date.now() + bfConst('COOLDOWN_MS'), capEpoch: (fresh.capEpoch || 0) + 1 };
                const nextState = Object.assign({}, fresh, patch);
                const heldIds = new Set(held.map(l => l.id));
                // Read fresh inside the history-write lock, so this can't come back 'stale'.
                await DBManager.setStorage(stored, {
                    inLock: true,
                    bumpGen: true,
                    extraStores: [DBManager._BF_STORE, DBManager._INBOX_STORE],
                    extraOps: tx => {
                        const inbox = tx.objectStore(DBManager._INBOX_STORE);
                        if (!heldIds.size) inbox.clear();
                        else lines.forEach(l => { if (!heldIds.has(l.id)) inbox.delete(l.id); });
                        tx.objectStore(DBManager._BF_STORE).put(nextState, 'state');
                    }
                });
                Object.assign(st, patch);
                if (crash === 'afterTx') throw new Error('dev: forced merge crash after save');
                result = { merged: toMerge.length, held: held.length, logStartDate: stored.meta.logStartDate };
                // During Demo the view shows demo data; leaving Demo reloads from the database.
                if (!runtime.demoMode) DataController.hydrate(await DBManager.loadHistory());
            });
        } catch (e) {
            Log.error(`Backfill ${mode} merge failed`, e);
            return false;
        }
        if (!result) return false;
        Log.info(`[backfill] ${mode} merge: ${result.merged} lines added, ${result.held} held, log starts ${new Date(result.logStartDate * 1000).toISOString()}`);
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent: true } }));
        announceBackfillState();
        return true;
    }

    // ─── The scan ────────────────────────────────────────────────────────────
    function runBackfillMerge(mode, st) {
        return mergeInbox(mode, st);
    }

    async function scanLoop(lock) {
        let st = await DBManager.getBackfillState();
        const meta = await readStoredMeta();
        const blocked = backfillBlockReason(st, meta);
        if (blocked) {
            Log.debug(`[backfill] not scanning: ${blocked}`);
            return;
        }
        const runId = st.runId;
        // Every state change is committed through inboxCommitPage, so a Clear Log (runId gone)
        // stops it from writing anything.
        const commit = async (group, lines, patch) => {
            const ok = await DBManager.inboxCommitPage(runId, group, lines, patch);
            if (ok) Object.assign(st, patch);
            return ok;
        };

        if (st.pendingMerge) {
            await runBackfillMerge(st.pendingMerge, st);
            return;
        }
        if (st.status === 'cooldown') {
            if (!await commit(null, [], { status: 'scanning', rowsUsed: 0, cooldownUntil: 0, roundStart: meta.logStartDate })) return;
        } else if (!st.roundStart) {
            // Backfill covers everything up to logStartDate; live sync covers everything after.
            if (!await commit(null, [], { roundStart: meta.logStartDate })) return;
        }
        if (!st.factionFetched && await fetchFactionHistory()) {
            await fetchPastFactionWars();
            if (!await commit(null, [], { factionFetched: true })) return;
        }

        const PAGE = BACKFILL.PAGE;
        const stepBack = {};
        let calls = 0;
        Log.info(`[backfill] scanning (run ${runId}, ${st.rowsUsed} rows used this window)`);

        const setError = async (kind, code) => {
            if (st.lastError && st.lastError.kind === kind) return true;
            const ok = await commit(null, [], { lastError: { kind, code, at: Date.now() }, errorEpoch: (st.errorEpoch || 0) + 1 });
            if (ok) announceBackfillState();
            return ok;
        };

        while (true) {
            if (runtime.bfStop || runtime.bfYield || !lock.check()) break;
            const rateWait = (runtime.bfRateUntil || 0) - Date.now();
            if (rateWait > 0) {
                await bfSleep(rateWait);
                continue;
            }
            const open = BACKFILL_GROUP_KEYS.filter(g => !st.done[g]);
            if (!open.length) {
                if (await commit(null, [], { pendingMerge: 'final' })) await runBackfillMerge('final', st);
                break;
            }
            if ((st.rowsUsed || 0) + PAGE > bfConst('CAP')) {
                if (await commit(null, [], { pendingMerge: 'cap' })) await runBackfillMerge('cap', st);
                break;
            }

            // The roll furthest behind goes next, so all three move back through time together.
            const points = {};
            for (const g of open) {
                const oldest = await DBManager.inboxOldest(g);
                points[g] = oldest ? oldest.ts : st.roundStart;
            }
            const pick = open.reduce((a, b) => (points[b] > points[a] ? b : a));
            // `to` is inclusive: the boundary line comes back again and dedupes by id. Only if a whole
            // page sits on one second does the next call step past it.
            const to = stepBack[pick] === points[pick] ? points[pick] - 1 : points[pick];

            const page = await fetchScanPage(BACKFILL_GROUPS[pick], to);
            calls++;
            if (page.error && page.error.kind === 'limit') {
                // Torn's own daily read limit (other scripts can use up the same key): same as our cap.
                Log.warn('[backfill] Torn daily read limit reached; building the log so far and waiting');
                if (await commit(null, [], { pendingMerge: 'cap' })) await runBackfillMerge('cap', st);
                break;
            }
            if (page.error && page.error.kind === 'key') {
                // Waiting won't fix a rejected key. Tell the player once, then make one attempt per
                // page load (or as soon as the key is changed) until it works again.
                Log.warn(`[backfill] API key rejected (code ${page.error.code}); pausing until next page load`);
                runtime.bfKeyBlockedFor = userConfig.apiKey;
                await setError('key', page.error.code);
                break;
            }
            const rows = page.error ? 0 : page.rowKeys.length;
            const lines = page.error ? [] : normalizeApiLogs(page.log);
            if (page.error || (rows > 0 && lines.length === 0)) {
                // Temporary: retry with growing waits. After ERROR_NOTICE_MS of failing on this page
                // load the player is told once; retries carry on either way.
                const code = page.error ? page.error.code : 'unstorable';
                const now = Date.now();
                if (!runtime.bfFailSince) runtime.bfFailSince = now;
                const noticeAt = runtime.bfFailSince + bfConst('ERROR_NOTICE_MS');
                if (now >= noticeAt && !await setError('connection', code)) break;
                const steps = BACKFILL.RETRY_STEPS_MS;
                let delay = steps[Math.min(runtime.bfFailCount || 0, steps.length - 1)];
                if (now < noticeAt) delay = Math.min(delay, noticeAt - now);
                if (runtime.devMode && runtime._devBackfillErrorWindowMs) delay = Math.min(delay, Math.max(1000, runtime._devBackfillErrorWindowMs / 4));
                runtime.bfFailCount = (runtime.bfFailCount || 0) + 1;
                Log.warn(`[backfill] page failed (${code}); retrying in ${Math.round(delay / 1000)}s`);
                await bfSleep(delay);
                continue;
            }
            const known = await DBManager.inboxExistingIds(lines.map(l => l.id));
            const fresh = lines.filter(l => !known.has(l.id)).length;
            // Empty, or a short page with nothing new (the one confirmation call after a short page,
            // which only returns the boundary line again): nothing older exists.
            const finished = rows === 0 || (rows < PAGE && fresh === 0);
            let oldestTs = Infinity;
            page.rowKeys.forEach(k => { if (page.log[k].timestamp < oldestTs) oldestTs = page.log[k].timestamp; });
            if (rows === PAGE && oldestTs >= to) stepBack[pick] = points[pick];

            const patch = { done: { ...st.done, [pick]: finished }, rowsUsed: (st.rowsUsed || 0) + rows };
            const recovered = !!st.lastError;
            if (recovered) patch.lastError = null;
            if (!await commit(pick, lines, patch)) break;
            runtime.bfFailSince = 0;
            runtime.bfFailCount = 0;
            if (recovered) announceBackfillState();
            if (!st.firstMergeDone) {
                // The overlay's line counter, here and in other tabs.
                const count = await DBManager.inboxCount();
                updateBackfillCount(count);
                _syncChannel.postMessage({ type: 'bf:progress', count, from: _TAB_ID });
            }
            Log.debug(`[backfill] ${pick} to=${to}: ${rows} rows, ${fresh} new${finished ? ', done' : ''}`);

            await bfSleep(bfConst('THROTTLE_MS'));
        }
        Log.info(`[backfill] stopped after ${calls} calls`);
    }

    async function runBackfill() {
        if (runtime.bfScanning || runtime.bfWaitingLock) return;
        if (runtime.bfKeyBlockedFor && runtime.bfKeyBlockedFor === userConfig.apiKey) return;
        const lock = await acquireBackfillLock();
        if (!lock) return;
        runtime.bfScanning = true;
        runtime.bfStop = false;
        runtime.bfYield = false;
        let yielded = false;
        try {
            await scanLoop(lock);
        } catch (e) {
            Log.error('Backfill scan failed', e);
        } finally {
            yielded = runtime.bfYield;
            runtime.bfScanning = false;
            runtime.bfYield = false;
            lock.release();
        }
        // Handed the scan to a visible tab: queue behind it, to take over again if it closes.
        if (yielded) setTimeout(() => runBackfill(), 0);
    }

    async function maybeStartBackfill() {
        if (runtime.bfScanning || runtime.bfWaitingLock || runtime.bfChecking) return;
        if (runtime.bfKeyBlockedFor && runtime.bfKeyBlockedFor === userConfig.apiKey) return;
        runtime.bfChecking = true;
        try {
            const st = await DBManager.getBackfillState();
            if (!backfillBlockReason(st, await readStoredMeta())) runBackfill();
        } catch (e) {
            Log.warn('Backfill start check failed', e);
        } finally {
            runtime.bfChecking = false;
        }
    }

    // Called once from init(). Without Web Locks there's no queue to wait in, so waiting tabs check
    // again when the lease is released (storage event) and on a slow timer.
    function startBackfillTriggers() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') return;
            // A notice that landed while this tab was hidden shows now.
            refreshBackfillUI();
            // Already queued (opened in the background): ask the scanning tab to hand over now that
            // the player is looking at this one.
            if (runtime.bfWaitingLock) _syncChannel.postMessage({ type: 'bf:want', from: _TAB_ID });
            else maybeStartBackfill();
        });
        window.addEventListener('storage', e => {
            if (e.key === BF_LEASE_KEY && !e.newValue) maybeStartBackfill();
        });
        setInterval(() => {
            if (!hasWebLocks()) maybeStartBackfill();
        }, BACKFILL.LEASE_STALE_MS);
        refreshBackfillUI();
        maybeStartBackfill();
    }

