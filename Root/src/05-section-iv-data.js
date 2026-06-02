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
    _STORE_NAME: 'history',
    _KEY: 'main',

    // This function sets up a private database on your browser to save your history.
    initDB() {
        return new Promise((resolve, reject) => {
            if (this._db) { resolve(this._db); return; }
            Perf.start('initDB');
            const req = indexedDB.open(this._DB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this._STORE_NAME)) {
                    db.createObjectStore(this._STORE_NAME);
                }
            };
            req.onsuccess = (e) => { this._db = e.target.result; Perf.end('initDB'); resolve(this._db); };
            req.onerror = (e) => { Perf.end('initDB'); Log.error('IndexedDB open failed', e); reject(e); };
        });
    },

    // This function reads your saved gym history from your browser's private storage.
    async getStorage() {
        if (!this._db) { try { await this.initDB(); } catch (e) { } }
        return new Promise((resolve, reject) => {
            if (!this._db) { resolve(null); return; }
            try {
                const tx = this._db.transaction(this._STORE_NAME, 'readonly');
                const store = tx.objectStore(this._STORE_NAME);
                const req = store.get(this._KEY);
                req.onsuccess = () => resolve(sanitizeStorageRecord(req.result || null));
                req.onerror = (e) => { Log.error('IndexedDB read failed', e); reject(e); };
            } catch (e) { reject(e); }
        });
    },

    // This function saves your new training logs to your browser's private storage.
    async setStorage(data) {
        if (!this._db) { try { await this.initDB(); } catch (e) { } }
        return new Promise((resolve, reject) => {
            if (!this._db) { reject(new Error("Database not initialized")); return; }
            try {
                const tx = this._db.transaction(this._STORE_NAME, 'readwrite');
                const store = tx.objectStore(this._STORE_NAME);
                const req = store.put(data, this._KEY);
                tx.oncomplete = () => {
                    // This tells other open tabs that your data has been updated.
                    _syncChannel.postMessage({ type: 'update', from: _TAB_ID });
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
            } catch (e) { reject(e); }
        });
    },

    // This function permanently deletes your gym history from your browser when you click 'Clear Data'.
    async clearStorage() {
        if (!this._db) { try { await this.initDB(); } catch (e) { } }
        return new Promise((resolve, reject) => {
            if (!this._db) { resolve(); return; }
            const tx = this._db.transaction(this._STORE_NAME, 'readwrite');
            const store = tx.objectStore(this._STORE_NAME);
            const req = store.delete(this._KEY);
            req.onsuccess = () => { _syncChannel.postMessage({ type: 'update', from: _TAB_ID }); resolve(); };
            req.onerror = (e) => { Log.error('IndexedDB clear failed', e); reject(e); };
        });
    }
};

const _syncChannel = new BroadcastChannel('bbgl_sync');
_syncChannel.onmessage = async (event) => {
    if (event.data && event.data.from === _TAB_ID) return;
    if (runtime.demoMode) return;
    try {
        const stored = await DBManager.getStorage();
        DataController.syncCache(stored);
        if (dom.panel) renderPanelContent();
    } catch (e) { Log.warn('Cross-tab sync failed', e); }
};

function sanitizeStorageRecord(s) {
    if (!s || typeof s !== 'object') return { meta: { baselineBreakdown: { ...ZERO_BREAKDOWN } }, series: [] };
    if (!s.meta) s.meta = {};
    if (!s.meta.baselineBreakdown) s.meta.baselineBreakdown = { ...ZERO_BREAKDOWN };
    if (!s.series || !Array.isArray(s.series)) s.series = [];


    const k = ['str', 'def', 'spd', 'dex'];
    k.forEach(key => { if (s.meta.baselineBreakdown[key] !== undefined) s.meta.baselineBreakdown[key] = parseFloat(s.meta.baselineBreakdown[key]) || 0; });


    s.series.forEach(e => {
        if (e.ts !== undefined) e.ts = parseInt(e.ts);
        if (e.gain !== undefined) e.gain = parseFloat(e.gain);
        if (e.after !== undefined) e.after = parseFloat(e.after);
        if (e.cost !== undefined) e.cost = parseInt(e.cost);
    });

    return s;
}

// This function prepares a lightweight version of your history for quick-access caching.
function serializeForSession(cache) {
    if (!cache) return null;
    const stripDay = d => ({
        date: d.date, startTotal: d.startTotal, endTotal: d.endTotal,
        startBreakdown: d.startBreakdown, endBreakdown: d.endBreakdown,
        gains: d.gains, eSpent: d.eSpent, lastLogTimestamp: d.lastLogTimestamp
    });
    return JSON.stringify({
        meta: cache.meta,
        history: (cache.history || []).map(stripDay),
        today: cache.today ? stripDay(cache.today) : null
    });
}

function validateImportSchema(j) {
    if (!j || typeof j !== 'object') return { ok: false, msg: "Invalid file format." };
    if (!j.storage || typeof j.storage !== 'object') return { ok: false, msg: "No training data found in file." };
    const s = j.storage;
    if (s.series && !Array.isArray(s.series)) return { ok: false, msg: "Training series is malformed (not an array)." };
    if (s.meta && s.meta.baselineBreakdown) {
        const keys = Object.keys(s.meta.baselineBreakdown);
        if (!keys.includes('str') && !keys.includes('def')) return { ok: false, msg: "Baseline stats are missing or invalid." };
    }
    return { ok: true };
}

// This is the ONLY function that connects to the internet with your API key.
// It strictly contacts api.torn.com to fetch your Gym training logs (Log IDs 5300-5303) and current stats.
async function universalFetch(mission, options = {}) {
    if (runtime.demoMode) return { success: false, demo: true };
    const { specId = null } = options;


    if (!userConfig.apiKey || userConfig.apiKey.length < 16) {
        return { ok: false, error: 'API Key is missing or too short.' };
    }

    const ts = Date.now();
    let reqs = [];

    // We only request specific logs related to gym training.
    // No items, money, or personal messages are ever accessed.
    if (mission === 'TRAIN_SINGLE' && specId) {
        reqs.push({ type: 'log', id: specId, url: `https://api.torn.com/user/?selections=log&log=${specId}&key=${userConfig.apiKey}&timestamp=${ts}` });
    } else if (mission === 'BATTLESTATS_ONLY') {
        reqs.push({ type: 'battlestats', url: `https://api.torn.com/user/?selections=battlestats&key=${userConfig.apiKey}&timestamp=${ts}` });
    } else {
        reqs = [
            { type: 'log', id: 5300, url: `https://api.torn.com/user/?selections=log&log=5300&key=${userConfig.apiKey}&timestamp=${ts}` },
            { type: 'log', id: 5301, url: `https://api.torn.com/user/?selections=log&log=5301&key=${userConfig.apiKey}&timestamp=${ts}` },
            { type: 'log', id: 5302, url: `https://api.torn.com/user/?selections=log&log=5302&key=${userConfig.apiKey}&timestamp=${ts}` },
            { type: 'log', id: 5303, url: `https://api.torn.com/user/?selections=log&log=5303&key=${userConfig.apiKey}&timestamp=${ts}` },
            { type: 'battlestats', url: `https://api.torn.com/user/?selections=battlestats&key=${userConfig.apiKey}&timestamp=${ts}` }
        ];
    }

    incrementApiCount(reqs.length);

    try {
        // This safely performs the official Torn API request using your provided key.
        const res = await Promise.all(reqs.map(c => fetch(c.url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => ({ cfg: c, data: d }))));
        const errObj = res.find(r => r.data.error);
        if (errObj) {
            throw new Error(errObj.data.error.error);
        }

        let logs = {}, bs = null;
        res.forEach(r => {
            if (r.cfg.type === 'log' && r.data.log) logs = { ...logs, ...r.data.log };
            else if (r.cfg.type === 'battlestats') bs = r.data;
        });


        if (mission === 'BATTLESTATS_ONLY') {
            if (bs) {
                const d = getActiveHistory();
                let escalationNeeded = false;
                BS_STAT_ROWS.forEach(i => {
                    const apiVal = bs[i.api];
                    const localVal = d.today?.endBreakdown?.[i.abbr] || 0;
                    if (apiVal > localVal) escalationNeeded = true;
                });

                if (escalationNeeded) {
                    return universalFetch('FULL_SYNC', options);
                } else {
                    await DataController.processDataPayload({}, bs);
                }
            }
            localStorage.setItem(KEYS.BS_SYNC, ts.toString());
        } else {
            if (mission === 'FULL_SYNC') {
                localStorage.setItem(KEYS.LAST_SYNC, ts.toString());
                localStorage.setItem(KEYS.BS_SYNC, ts.toString());
            }
            await DataController.processDataPayload(logs, bs);
        }

        return { ok: true };

    } catch (e) {
        Log.error('Sync failed', e);
        const isQuota = e.name === 'QuotaExceededError' || (e.message && e.message.toLowerCase().includes('quota'));
        const errorMsg = isQuota
            ? 'Sync failed because your browser ran out of local storage space. Close all open Torn tabs, clear your browser cache, and reload the page.\n\nError Code: 69'
            : (e.message || 'Network Error');
        return { ok: false, error: errorMsg };
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
        if (btn) {
            btn.innerText = "Refreshed!"; btn.style.color = "#43a047"; btn.style.opacity = "1";
            if (btn.dataset.timerId) clearTimeout(btn.dataset.timerId);
            btn.dataset.timerId = setTimeout(() => { resetRefreshBtn(btn); }, 2000);
        }
    } else {
        alert("Sync Error: " + result.error);
        resetRefreshBtn(btn);
    }
    Perf.end('syncWithFeedback');
}

// This function runs in the background to keep your training data up to date while the page is open.
function startBackgroundSync() {
    if (runtime.bgSyncId) clearInterval(runtime.bgSyncId);
    runtime.bgSyncId = setInterval(function bgSyncTick() {
        const now = Date.now();
        const lastFull = parseInt(localStorage.getItem(KEYS.LAST_SYNC) || '0');

        if (now - lastFull > 3600000) universalFetch('FULL_SYNC');
        else universalFetch('BATTLESTATS_ONLY');
    }, 600000);
}

// This checks if your data is old and needs a refresh when you first open the gym.
function checkStaleness() {
    const lastFull = localStorage.getItem(KEYS.LAST_SYNC), now = Date.now();
    if (!lastFull || (now - parseInt(lastFull) > 3600000)) universalFetch('FULL_SYNC');
    else {
        const lastBs = localStorage.getItem(KEYS.BS_SYNC);
        if (!lastBs || (now - parseInt(lastBs) > 600000)) universalFetch('BATTLESTATS_ONLY');
    }
}

// This makes sure your final gym training logs are saved even if you navigate away from the gym page.
function checkExitSync() {
    const f = sessionStorage.getItem(KEYS.SESSION);
    if (f === 'true' && !window.location.href.includes('gym.php')) {
        universalFetch('FULL_SYNC');
        sessionStorage.removeItem(KEYS.SESSION);
    }
}


