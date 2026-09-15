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

// Finds Happy Jumps within one day's series: an Ecstasy dose followed by >=1000E of training
// clicks before the next happy reset (:00/:15/:30/:45 UTC). The window is plain epoch math, so
// it's independent of the user's day-start-mode display setting, and — since midnight is itself
// a :00 mark — a window can never straddle two calendar days, so per-day series is sufficient.
// Shared by getHappyJumpData() (weekly capsule/EXP data) and computeAchievements() (lifetime HJ
// stats) so both stay on the same definition.
function findHappyJumps(seriesArr) {
    const doses = (seriesArr || []).filter(e => e.type === 'item' && e.logId === ECSTASY_LOG);
    if (doses.length === 0) return [];
    const clicks = (seriesArr || []).filter(e => e.type !== 'item' && e.ts && e.cost);
    const jumps = [];
    doses.forEach(dose => {
        const windowEnd = dose.ts + (GAME.HJ_QUARTER_SECONDS - (dose.ts % GAME.HJ_QUARTER_SECONDS));
        let cost = 0,
            tsEnd = dose.ts;
        const stats = { str: 0, def: 0, spd: 0, dex: 0 };
        clicks.forEach(c => {
            if (c.ts < dose.ts || c.ts >= windowEnd) return;
            cost += c.cost;
            stats[c.stat] = (stats[c.stat] || 0) + (c.gain || 0);
            if (c.ts > tsEnd) tsEnd = c.ts;
        });
        if (cost >= 1000) jumps.push({ date: Formatter.dateLogical(dose.ts * 1000), ts: dose.ts, tsEnd, cost, stats });
    });
    return jumps;
}

// Identity key for a series entry, used by the incremental/full reconcilers to drop a stored row
// once the freshly-fetched API row that supersedes it is about to take its place. Must be built
// from fields that survive an export/import round trip: Torn's own log `id` does not (dropped on
// export, see _applyLogToState's item branch) — an id-keyed item entry would never match its
// re-synced counterpart post-import, leaving both in the series as duplicates. (ts, logId) is the
// same natural key _applyLogToState and _persistBackfillSeries already dedup items on.
function seriesDedupKey(e) {
    return e.type === 'item' ? `item_${e.ts}_${e.logId}` : `${e.ts}_${e.stat}_${e.after}`;
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
        hjData: null,
        bookData: null
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
        this._cache.bookData = null;
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
        this._cache.bookData = null;
        this._cache.timeline = null;
        this._cache.dateMap = null;
        this._cache.slices = {};
    },
    getBookData() {
        if (!this._cache.bookData) this._cache.bookData = computeBookData(getActiveHistory());
        return this._cache.bookData;
    },
    // Fast hydration from a pre-built { meta, history, today } (DBManager.loadHistory()) —
    // no series flatten, no _rebuildFromSeries, no session serialization.
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
        const hjDaySet = new Set();
        this.getTimeline().forEach(day => {
            findHappyJumps(day.series).forEach(jump => hjDaySet.add(jump.date));
        });
        this._cache.hjData = { hjDaySet };
        return this._cache.hjData;
    },
    buildProgressionCache() {
        if (this._cache.stickerMap) return;
        const today = Formatter.dateLogical();
        const todayWeekKey = getWeekKey(today);
        const weekMap = {};
        this.getTimeline().forEach(day => {
            if (day.date >= today) return;
            const wk = getWeekKey(day.date);
            if (!weekMap[wk]) weekMap[wk] = [];
            weekMap[wk].push(day);
        });
        const { hjDaySet } = this.getHappyJumpData();
        const stickerMap = new Map();
        const featuredSet = new Set();
        let unlockedCount = 1;
        let careerLevelExp = 0;
        // Per-user deterministic sticker roulette: same player_id -> same picks on every device,
        // with no cross-device sync needed. Also caps repeats at 2-in-a-row where the pool allows it.
        const rouletteSeed = (getActiveHistory().meta && getActiveHistory().meta.playerId) || 0;
        let pickCounter = 0;
        const lastTwoPicks = [];
        const pickStickerIdx = mod => {
            let idx, attempt = 0;
            do {
                idx = hashMix(rouletteSeed ^ Math.imul(pickCounter, 0x9e3779b9) ^ Math.imul(attempt, 0x85ebca6b)) % mod;
                attempt++;
            } while (attempt <= 8 && lastTwoPicks.length === 2 && lastTwoPicks[0] === idx && lastTwoPicks[1] === idx);
            pickCounter++;
            lastTwoPicks.push(idx);
            if (lastTwoPicks.length > 2) lastTwoPicks.shift();
            return idx;
        };
        // Stat-title progress — cumulative E per stat, each unlocking that stat's own word ladder
        // (STAT_TITLE_THRESHOLDS, 03-section-ii-utils.js). Same reward-gating scope as
        // careerLevelExp below (skipped entirely in demo mode, respects installDateKey/
        // rewardStartTs), recomputed from the full timeline on every cache rebuild rather than
        // persisted to DB. Only the player's chosen slots live in userConfig.
        const statTitleE = { str: 0, def: 0, spd: 0, dex: 0 };
        // Reward gating: stickers (and their unlock progression) only count from the install
        // week onward. Pre-install weeks still render their bar/day counts elsewhere, but earn
        // no stickers here. EXP uses a stricter gate: full days before the install day contribute
        // 0 EXP, and on the exact install day itself, only training at/after the precise
        // rewardStartDate timestamp counts (sub-day precision) — so a Clear Log + Backfill can
        // still earn that week's sticker, but reconstructed pre-install training earlier the same
        // day (before the user actually clicked train post-install) contributes 0 EXP. Demo mode
        // is exempt (keeps its 1-sticker showcase behavior).
        const installWeekKey = runtime.demoMode ? null : getInstallWeekKey();
        const installDateKey = runtime.demoMode ? null : getInstallDateKey();
        const rewardStartTs = runtime.demoMode ? null : (getActiveHistory().meta && getActiveHistory().meta.rewardStartDate) || null;
        Object.keys(weekMap).sort().forEach(wk => {
            if (installWeekKey && wk < installWeekKey) return;
            const days = weekMap[wk].sort((a, b) => a.date.localeCompare(b.date));
            // Daily level EXP: include current week's past days (today excluded by weekMap).
            if (!runtime.demoMode) {
                days.forEach(day => {
                    if (installDateKey && day.date < installDateKey) return;
                    let daySeries = day.series || [];
                    // On the exact install day, restrict to entries at/after the precise install
                    // moment — day.date alone can't distinguish "trained at 2pm, installed at 8pm"
                    // (pre-install) from "installed at 8pm, trained at 10pm" (post-install).
                    if (installDateKey && day.date === installDateKey && rewardStartTs) {
                        daySeries = daySeries.filter(s => s.ts >= rewardStartTs);
                    }
                    const e = daySeries.filter(s => s.type === 'gym').reduce((sum, s) => sum + (s.cost || 0), 0);
                    const hasTrainLog = daySeries.some(s => s.type === 'gym');
                    const isHJ = (daySeries === day.series) ? hjDaySet.has(day.date) : findHappyJumps(daySeries).length > 0;
                    careerLevelExp += computeDailyLevelExp(e, hasTrainLog, isHJ);
                    // Per-stat, off the same gated slice `e` was summed from — day.eSpent[stat]
                    // would skip the install-day sub-day filter applied to daySeries above.
                    daySeries.forEach(s => {
                        if (s.type === 'gym' && statTitleE[s.stat] !== undefined) statTitleE[s.stat] += (s.cost || 0);
                    });
                });
            }
            if (wk >= todayWeekKey) return;
            const stickerworthyDays = days.filter(d => d.eSpent && d.eSpent.total >= 1000);
            if (!stickerworthyDays.length) return;
            const {
                isCompleted,
                isGold,
                isDiamond
            } = computeWeekCompletion(days, hjDaySet);
            const numFeatured = isGold ? 2 : (isCompleted ? 1 : 0);
            const splitIdx = Math.max(0, stickerworthyDays.length - numFeatured);
            const rouletteDays = stickerworthyDays.slice(0, splitIdx);
            const featuredDays = stickerworthyDays.slice(splitIdx);
            rouletteDays.forEach(day => {
                const idx = runtime.demoMode ? 0 : pickStickerIdx(unlockedCount);
                stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
            });
            featuredDays.forEach((day, i) => {
                const newIdx = unlockedCount + i;
                if (newIdx < CUSTOM_STICKERS.length) {
                    const idx = runtime.demoMode ? 0 : newIdx;
                    stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
                    featuredSet.add(day.date);
                } else {
                    const idx = runtime.demoMode ? 0 : pickStickerIdx(unlockedCount);
                    stickerMap.set(day.date, CUSTOM_STICKERS[idx]);
                }
            });
            unlockedCount = Math.min(unlockedCount + numFeatured, CUSTOM_STICKERS.length);
        });
        if (runtime.demoMode) unlockedCount = 1;
        this._cache.stickerMap = stickerMap;
        this._cache.featuredDays = featuredSet;
        this._cache.unlockedCount = unlockedCount;
        runtime.careerLevelExp = careerLevelExp;
        runtime.statTitleE = statTitleE;
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
    },
    getStickerMap() {
        this.buildProgressionCache();
        return this._cache.stickerMap;
    },
    getCareerLevelExp() {
        this.buildProgressionCache();
        return runtime.careerLevelExp || 0;
    },
    getStatTitleE() {
        this.buildProgressionCache();
        return runtime.statTitleE || { str: 0, def: 0, spd: 0, dex: 0 };
    },
    getUnlockedCount() {
        this.buildProgressionCache();
        return this._cache.unlockedCount || 0;
    },
    getFeaturedDays() {
        this.buildProgressionCache();
        return this._cache.featuredDays;
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
        // Origin rates: derived from the first per-entry rate on or after the timeline floor
        // (first fully-visible day) — recomputed each time rather than cached, so backfill
        // extending history backward can't leave it stale.
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
        // The energy/lost totals are derived from `series` rather than the persisted
        // itemEnergy/itemEnergyLost/itemHappyLost scalars: those scalars are written once when
        // a day is first processed and never revisited, so a day saved under an older build can
        // carry stale values forever. Deriving from series here keeps this in sync with
        // computeAchievements, which sums the same per-entry `energy` field fresh every time.
        const itemDays = sDay ? [sDay] : (dList || []);
        const items = {};
        let itemEnergy = 0;
        let odEnergyLost = 0;
        let odHappyLost = 0;
        itemDays.forEach(d => {
            if (d && d.items) Object.keys(d.items).forEach(id => {
                items[id] = (items[id] || 0) + d.items[id];
            });
            (d && d.series || []).forEach(e => {
                if (e.type !== 'item') return;
                if (e.logId === ECAN_LOG && e.energy) itemEnergy += e.energy;
                if (e.energyLost != null) odEnergyLost += e.energyLost;
                if (e.happyLost != null) odHappyLost += e.happyLost;
            });
        });
        r.items = items;
        r.xanax = items[XANAX_LOG] || 0;
        r.xanaxODs = items[XANAX_OD_LOG] || 0;
        r.lsdODs = items[LSD_OD_LOG] || 0;
        r.exODs = items[EX_OD_LOG] || 0;
        r.odEnergyLost = odEnergyLost;
        r.exHappyLost = odHappyLost;
        r.ecans = items[ECAN_LOG] || 0;
        r.ecanEnergy = itemEnergy;
        r.dayCount = sDay ? 1 : (dList ? dList.length : 0);
        return r;
    },
    async processDataPayload(apiLogs, apiBattlestats, opts = {}) {
        Perf.start('processDataPayload');
        const silent = !!opts.silent;
        let s = getActiveHistory();
        const fullApiLogs = normalizeApiLogs(apiLogs);
        let cleanLogs = fullApiLogs;
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
                window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent } }));
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
                window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent } }));
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
            // Forward-only init: baseline = current battlestats, origin = NOW (this sync).
            // No historical reconstruction — history only comes from explicit Backfill or
            // import. Anchoring to "now" (not privacyAgreed, which survives Clear Log) makes
            // a cleared log behave like a fresh install: nothing before this moment counts.
            if (apiBattlestats) {
                s.meta.baselineBreakdown = {
                    str: apiBattlestats.strength || 0,
                    def: apiBattlestats.defense || 0,
                    spd: apiBattlestats.speed || 0,
                    dex: apiBattlestats.dexterity || 0
                };
            }
            const nowTs = Math.floor(Date.now() / 1000);
            s.meta.logStartDate = nowTs;
            // rewardStartDate is the fixed rewards gate — set once at install/clear, never
            // moved by backfill. logStartDate can be pushed back; rewardStartDate stays here.
            s.meta.rewardStartDate = nowTs;
            // Drop anything older than the cutoff so the API's default window (last ~week)
            // is never ingested by the daily grind below.
            cleanLogs = cleanLogs.filter(l => l.ts >= s.meta.logStartDate);
            s.today = initializeDayObject(Formatter.dateLogical(), { ...s.meta.baselineBreakdown });
        }
        this._runDailyGrind(cleanLogs, apiBattlestats, s);
        const logicalToday = Formatter.dateLogical();
        if (s.today.date !== logicalToday) {
            if ((s.today.series && s.today.series.length > 0) || (s.today.gains && s.today.gains.total > 0)) s.history.push(s.today);
            s.today = initializeDayObject(logicalToday, s.today.endBreakdown);
        }
        this.saveSmartHistory(s);
        window.dispatchEvent(new CustomEvent('bbgl:dataUpdated', { detail: { silent } }));
        Perf.end('processDataPayload');
        return 'SUCCESS';
    },
    saveSmartHistory(d) {
        const allDays = [...(d.history || [])];
        if (d.today) allDays.push(d.today);
        // Persist the in-memory day objects directly — no flatten-to-series + rebuild
        // round-trip. saveDays puts each day record without clearing the store; normal
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
            // Same (ts, logId) dedup key as seriesDedupKey() above.
            const itemKey = `${l.ts}_${l.logId}`;
            if (!s.today.itemLogIds.includes(itemKey)) {
                s.today.itemLogIds.push(itemKey);
                s.today.items[l.logId] = (s.today.items[l.logId] || 0) + 1;
                // itemEnergy is surfaced as ecanEnergy (the "Cans (+N)" readout) so it must track
                // ONLY energy-can energy — not Xanax/LSD/refill/coupon/egg energy.
                if (l.logId === ECAN_LOG && l.energy) s.today.itemEnergy = (s.today.itemEnergy || 0) + l.energy;
                if (l.energyLost != null) s.today.itemEnergyLost = (s.today.itemEnergyLost || 0) + l.energyLost;
                if (l.happyLost != null) s.today.itemHappyLost = (s.today.itemHappyLost || 0) + l.happyLost;
                if (l.happy) s.today.itemHappy = (s.today.itemHappy || 0) + l.happy;
            }
            const entry = {
                type: 'item',
                id: l.id,
                ts: l.ts,
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
                    if (e.logId === ECAN_LOG && e.energy) days[dateKey].itemEnergy = (days[dateKey].itemEnergy || 0) + e.energy;
                    if (e.energyLost != null) days[dateKey].itemEnergyLost = (days[dateKey].itemEnergyLost || 0) + e.energyLost;
                    if (e.happyLost != null) days[dateKey].itemHappyLost = (days[dateKey].itemHappyLost || 0) + e.happyLost;
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
            const apiTsStatSet = new Set(apiEntries.map(seriesDedupKey));
            const kept = stored.series.filter(e => e.ts < minApiTs || e.ts > maxApiTs || !apiTsStatSet.has(seriesDedupKey(e)));
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
        const apiTsStatSet = new Set(apiEntries.map(seriesDedupKey));
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
                    if (e.ts < minApiTs || e.ts > maxApiTs || !apiTsStatSet.has(seriesDedupKey(e))) keptAffected.push(e);
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


// Shared mulberry32-style integer mixer — pure function of its input, no stream/closure state.
// Used both as a seeded RNG step (generateDemoData) and as a per-pick hash (sticker roulette).
function hashMix(n) {
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
}

function generateDemoData() {
    let _seed = 0x9e3779b9;

    function rand() {
        _seed += 0x6d2b79f5;
        return hashMix(_seed) / 4294967296;
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
            if (meta.energy) e.energy = (l.log === XANAX_LOG) ? 250 : parseInt(d.energy_increased || 0);
            if (meta.energyLost) e.energyLost = parseInt(d.energy_decreased ?? 0);
            if (meta.happyLost) e.happyLost = parseInt(d.happy_decreased ?? 0);
            if (meta.happy) e.happy = parseInt(d.happy_increased || 0);
            if (meta.book && d.item != null) e.bookId = parseInt(d.item);
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
    const { hjDaySet } = DataController.getHappyJumpData();
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
        trainingDays = 0,
        lifetimeEnergy = 0,
        lifetimeGains = 0;
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
    const energyItemTotals = {};
    ENERGY_LOGS.forEach(id => { energyItemTotals[id] = { count: 0, energy: 0 }; });
    const odItemTotals = {};
    OD_LOGS.forEach(id => { odItemTotals[id] = { count: 0, energyLost: 0, happyLost: 0 }; });
    const statEnhByStat = { str: { count: 0, gain: 0 }, def: { count: 0, gain: 0 }, spd: { count: 0, gain: 0 }, dex: { count: 0, gain: 0 } };
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
        lifetimeEnergy += e;
        lifetimeGains += g;
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
            ENERGY_LOGS.forEach(id => {
                const qty = day.items[id] || 0;
                if (qty > 0) energyItemTotals[id].count += qty;
            });
            OD_LOGS.forEach(id => {
                const qty = day.items[id] || 0;
                if (qty > 0) odItemTotals[id].count += qty;
            });
        }
        (day.series || []).forEach(e => {
            if (e.type === 'item' && e.happy && happyItemTotals[e.logId]) {
                happyItemTotals[e.logId].happy += e.happy;
            }
            if (e.type === 'item' && e.energy && energyItemTotals[e.logId]) {
                energyItemTotals[e.logId].energy += e.energy;
            }
            if (e.type === 'item' && e.energyLost != null && odItemTotals[e.logId]) {
                odItemTotals[e.logId].energyLost += e.energyLost;
            }
            if (e.type === 'item' && e.happyLost != null && odItemTotals[e.logId]) {
                odItemTotals[e.logId].happyLost += e.happyLost;
            }
            if (e.type === 'item' && e.statKey && statEnhByStat[e.statKey]) {
                statEnhByStat[e.statKey].count++;
                statEnhByStat[e.statKey].gain = Math.round((statEnhByStat[e.statKey].gain + (e.statGain || 0)) * 100) / 100;
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
            const wc = computeWeekCompletion(weekDayMap[wk], hjDaySet);
            if (wc.isGold) goldWeeks++;
            else if (wc.isCompleted) greenWeeks++;
            if (wc.isDiamond) diamondWeeks++;
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
    let happyJumps = 0;
    const hjWeek = {},
        hjMonth = {};
    const registerJump = (jump) => {
        const wk = getWeekKey(jump.date),
            mk = jump.date.slice(0, 7);
        happyJumps++;
        hjWeek[wk] = (hjWeek[wk] || 0) + 1;
        hjMonth[mk] = (hjMonth[mk] || 0) + 1;
        const tot = sumStats(jump.stats);
        ['str', 'def', 'spd', 'dex'].forEach(sk => {
            const sv = jump.stats[sk] || 0;
            if (sv > 0 && (!bestHJByStat[sk] || sv > bestHJByStat[sk].value)) bestHJByStat[sk] = {
                value: sv,
                date: jump.date,
                ts: jump.ts,
                cost: jump.cost
            };
        });
        if (tot > 0 && (!bestHJByStat.total || tot > bestHJByStat.total.value)) bestHJByStat.total = {
            value: tot,
            date: jump.date,
            ts: jump.ts,
            tsEnd: jump.tsEnd,
            cost: jump.cost,
            stats: {
                ...jump.stats
            }
        };
    };
    allDays.forEach(day => findHappyJumps(day.series).forEach(registerJump));
    const hjWeekBest = maxOf(hjWeek, 'weekOf'),
        hjMonthBest = maxOf(hjMonth, 'month');
    const calDays = Math.round((new Date(allDays[allDays.length - 1].date + 'T00:00:00Z') - new Date(allDays[0].date + 'T00:00:00Z')) / 86400000) + 1;
    const mxWkE = maxOf(weekE, 'weekOf'),
        mxWkG = maxOf(weekG, 'weekOf'),
        mxMnE = maxOf(monthE, 'month'),
        mxMnG = maxOf(monthG, 'month');
    const stickersUnlocked = DataController.getUnlockedCount();
    const lastDay = allDays[allDays.length - 1];
    const curBD = (lastDay && lastDay.endBreakdown) ? lastDay.endBreakdown : null;
    const currentStats = curBD ? {
        str: curBD.str || 0,
        def: curBD.def || 0,
        spd: curBD.spd || 0,
        dex: curBD.dex || 0,
        total: (curBD.str || 0) + (curBD.def || 0) + (curBD.spd || 0) + (curBD.dex || 0)
    } : null;
    return {
        baseline: (s.meta && s.meta.baselineBreakdown) ? {
            ...s.meta.baselineBreakdown
        } : null,
        currentStats,
        lifetimeEnergy,
        lifetimeGains,
        logStartDate: (s.meta && s.meta.logStartDate) || null,
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
        happyItemTotals,
        energyItemTotals,
        odItemTotals,
        statEnhByStat
    };
}

function resetTitlesPageAnimationClock(container) {
    runtime._titlesPageAnimationStartedAt = null;
    runtime._rankLightboxAnimation = null;
    const el = container || document.getElementById('bbgl-achievements-container');
    if (el) {
        el.style.removeProperty('--bbgl-titles-animation-delay');
        el.style.removeProperty('--bbgl-rank-lightbox-delay');
    }
}

// `targets` (default: the container) are the elements the two delay vars are stamped on. A full
// rebuild stamps the container, since every node under it is new. A partial patch passes just the
// subtrees it replaced: re-stamping the container would restyle the whole page and re-time every
// animation already running on it, when only the new nodes need the current elapsed time.
function syncTitlesPageAnimationClock(container, targets = [container]) {
    const now = performance.now();
    if (!Number.isFinite(runtime._titlesPageAnimationStartedAt)) {
        runtime._titlesPageAnimationStartedAt = now;
    }
    const elapsed = Math.max(0, now - runtime._titlesPageAnimationStartedAt);
    const { atrophy, level } = liveRankState();
    const unlocked = !!levelRankBrackets(atrophy, level)[1]?.unlocked;
    let lightbox = runtime._rankLightboxAnimation;
    if (!lightbox || lightbox.atrophy !== atrophy || lightbox.unlocked !== unlocked) {
        lightbox = runtime._rankLightboxAnimation = { atrophy, unlocked, startedAt: now };
    }
    // The one-shot ignition starts at unlock; routine rebuilds retain its elapsed time.
    const lightboxDelay = `${-Math.max(0, now - lightbox.startedAt)}ms`;
    targets.forEach(el => {
        el.style.setProperty('--bbgl-titles-animation-delay', `${-elapsed}ms`);
        el.style.setProperty('--bbgl-rank-lightbox-delay', lightboxDelay);
    });
}

function achRefreshPageDom() {
    const container = document.getElementById('bbgl-achievements-container');
    if (!container || !runtime._achCache) return;
    container.classList.toggle('bbgl-ach-titles-page', runtime._achPage === 0);
    // Rebuilding this page is routine: live training, level-ups, title picks and layout changes all
    // refresh its data. Anchor every new CSS animation to the start of the current page visit so
    // fresh nodes resume the shared timeline instead of visibly starting over. Moving to any other
    // achievements page ends the visit and clears the clock.
    if (runtime._achPage === 0) syncTitlesPageAnimationClock(container);
    else resetTitlesPageAnimationClock(container);
    // A half-finished title pick is deliberately NOT cleared here: it's plain runtime state rather
    // than a DOM node, so a heartbeat rebuilding this markup leaves the one-word preview standing.
    container.innerHTML = buildAchievementsPage(runtime._achPage, runtime._achCache);
    // Baseline for renderRankReadoutLive()'s fast path (07-section-vi-ui.js) — null off the titles
    // page so a later switch back to page 0 can't compare against a stale, unrelated snapshot and
    // wrongly skip the rebuild/patch it actually needs.
    runtime._achLiveFingerprint = runtime._achPage === 0 ? achLiveInputsFingerprint() : null;
    runtime._achLiveRankKey = runtime._achPage === 0 ? liveRankState().key : null;
    updateAchPageIndicator();
    // layoutTitlesPageGeometry() generates every stat block's label-gapped neon frame and centres
    // the rank assembly in the live geometric space below the lower cards; see its component passes
    // in 07-section-vi-ui.js. Running synchronously avoids a bad first paint, while the observer
    // re-attaches to the fresh elements this innerHTML swap just created. Off the titles page, just
    // drop the observer — nothing remains for it to watch until page 0 is shown again.
    if (runtime._achPage === 0) {
        const ready = layoutTitlesPageGeometry();
        observeTitleBlockFrames();
        // The synchronous pass above can still measure the layout at 0x0 the very first time
        // this page is shown — the complete titles layout isn't guaranteed to have settled to a
        // real size on the exact tick this markup lands (a plain double-rAF wasn't
        // enough in practice, so this doesn't guess a frame count at all): keep retrying on
        // successive frames until the combined geometry pass reports every piece actually got
        // measured, capped so a permanently-hidden/zero-size page can't loop forever. Without
        // this, the frames only ever got their real gap the next time something ELSE happened to
        // resize a block (e.g. the user resizing the panel), which is the bug being fixed.
        if (!ready) {
            let attemptsLeft = 30;
            const retry = () => {
                if (runtime._achPage !== 0) return; // navigated away — stop chasing it
                attemptsLeft--;
                if (!layoutTitlesPageGeometry() && attemptsLeft > 0) window.requestAnimationFrame(retry);
            };
            window.requestAnimationFrame(retry);
        }
    } else if (runtime.titleFrameResizeObserver) {
        runtime.titleFrameResizeObserver.disconnect();
    }
    // The pagination dot cluster's position (docked against the SVG icon toolbar, see
    // layoutToolbarPaginationPosition(), 07-section-vi-ui.js) doesn't depend on which ach page is
    // showing, so this runs unconditionally rather than only on page 0 like the block above.
    retryToolbarPaginationLayout(() => document.getElementById('bbgl-top-panel').classList.contains('viewing-achievements'));
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
    for (let i = 0; i < 6; i++) {
        const d = document.createElement('div');
        d.className = 'pg-dot' + (i === runtime._achPage ? ' active' : '');
        d.onclick = () => {
            if (i !== runtime._achPage) gotoAchievementsPage(i - runtime._achPage);
        };
        ind.appendChild(d);
    }
    // Scoped to the footer: the stickerbook and Library bars reuse these classes.
    const p = document.querySelector('#bbgl-ach-footer .bbgl-ach-prev'),
        n = document.querySelector('#bbgl-ach-footer .bbgl-ach-next');
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
    const container = document.getElementById('bbgl-achievements-container');
    if (!container || !runtime._achCache) return;
    const newPage = runtime._achPage + dir;
    if (newPage < 0 || newPage > 5) return;
    // Leaving the titles page abandons any half-finished title pick — see handleTitleStarPick()
    // in 07-section-vi-ui.js.
    clearTitlePick();
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
    return Formatter.achAbbr(n, ACH_FMT.gains);
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
    const isFxClass = r.statClass && r.statClass.startsWith('ach-fx-');
    const subCls = (!isFxClass && r.statClass) ? ' ' + achEsc(r.statClass) : '';
    const valCls = (isFxClass && r.statClass) ? ' ' + achEsc(r.statClass) : '';
    const valNum = r.dualHtml ? r.dualHtml : ((r.display === '—' || r.display === '\u2014') ? `<span class="ach-null">—</span>` : achEsc(r.display));
    const tip = r.tip ? ` data-tooltip="${achEsc(r.tip)}"` : '';
    const dateEl = r.clipDate ? `<div class="ach-date">${achEsc(r.clipDate)}</div>` : '';
    const subEl = r.sub ? `<span class="ach-sub${subCls}">${achEsc(r.sub)}</span>` : '';
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
    return `<div class="bbgl-ach-section"><div class="bbgl-ach-title-row"><span class="bbgl-ach-section-title" data-ach-section="${achEsc(sectionKey)}" data-clip-section="${achEsc(clipAll)}" data-clip-title="${achEsc(title)}" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">${achEsc(title)}</span></div><div class="bbgl-ach-cols"${COLS !== 4 ? ` style="grid-template-columns:repeat(${COLS},minmax(0,1fr));"` : ''}>${colsHTML}</div></div>`;
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

// Indented "date  HH:MM – HH:MM TCT" line for Happy Jump clipboard copies.
function achHJClipDate(rec) {
    return '  ' + achFmtDate(rec.date) + '  ' + achFmtTimeHMClip(rec.ts) + ' – ' + achFmtTimeHMClip(rec.tsEnd || rec.ts) + ' TCT';
}

function achFmtTimeHMS(ts) {
    const d = new Date(ts * 1000);
    const h = TimeManager.useLocal() ? d.getHours() : d.getUTCHours();
    const m = TimeManager.useLocal() ? d.getMinutes() : d.getUTCMinutes();
    const s = TimeManager.useLocal() ? d.getSeconds() : d.getUTCSeconds();
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' ' + achTimeZoneSuffix();
}

// ─── Titles page (achievements page 0) ──────────────────────────────────────
// Dedicated to the leveling side of the script, stacked top to bottom: the identity card and the
// stat-title unlock blocks share the space above, the horizontal Clay -> Fully Bricked rank track
// pins to the bottom. One layout for every panel mode (compact/expanded/page) now — only the sizing
// vars in 04-section-iii-styles.js differ between them, not the structure. Every star is one tier of
// one stat's word ladder, unlocked by E spent on that stat alone (STAT_TITLE_THRESHOLDS,
// 03-section-ii-utils.js). Words are deliberately NOT shown on the stars — the only place a word
// appears is the composed title on the card, so equipping one is how you find out what it says.
// Deliberately headerless: no section titles, so the space goes to content.

// Stamped into DB meta from the `basic` selection that rides along with the battlestats call
// (05-section-iv-data.js). Torn's own sidebar can't be scraped for this — its class names are
// hashed per build — so an em dash stands in until the first sync lands.
function achTitlePlayerName() {
    const h = getActiveHistory();
    return (h && h.meta && h.meta.playerName) || '—';
}

// Plaque words stack vertically, but never beyond two lines. For titles with three or more words,
// choose the split whose two rendered lines are closest in character length; each resulting line
// is kept intact by CSS so the browser cannot turn a three-word rank into three separate rows.
function achRankPlaqueLabelHTML(label) {
    const words = String(label || '').trim().split(/\s+/).filter(Boolean);
    // Always wrapped, even for a single word: .bbgl-rank-notch-line is what carries the z-index
    // that keeps lettering above the frame/field layer painted by .bbgl-rank-notch-fx. A bare text
    // node cannot be given a z-index, so an unwrapped label would render UNDER the inner field.
    if (words.length < 2) {
        const text = achEsc(words[0] || '');
        return `<span class="bbgl-rank-notch-line" data-rank-text="${text}">${text}</span>`;
    }
    let splitAt = 1;
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
        const leftLen = words.slice(0, i).join(' ').length;
        const rightLen = words.slice(i).join(' ').length;
        const diff = Math.abs(leftLen - rightLen);
        if (diff < bestDiff) {
            bestDiff = diff;
            splitAt = i;
        }
    }
    return [words.slice(0, splitAt), words.slice(splitAt)]
        .map(line => {
            const text = achEsc(line.join(' '));
            return `<span class="bbgl-rank-notch-line" data-rank-text="${text}">${text}</span>`;
        })
        .join('');
}

// Three nested boxes per plaque — more paint layers than two elements' pseudo-elements can supply:
//   -label  positioned wrapper; carries the drop-shadow as a FILTER (a box-shadow would be clipped
//           by the mask that cuts -face's silhouette).
//   -face   the plate: masked silhouette, metal gradient, bevel. ::before is grain/patina, ::after
//           the travelling specular sweep.
//   -fx     ornament inside -face's mask: ::before the frame band (rivets/milling), ::after the
//           recessed inner field the lettering sits on.
function achGoldCrownHTML() {
    const id = `bbgl-crown-${achGoldCrownHTML.serial = (achGoldCrownHTML.serial || 0) + 1}`;
    return `<svg class="bbgl-rank-gold-crown" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
        <defs>
            <linearGradient id="${id}-gold" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff5b5"/><stop offset=".16" stop-color="#e4b64e"/><stop offset=".3" stop-color="#fff0a4"/><stop offset=".43" stop-color="#9d6318"/><stop offset=".53" stop-color="#f8d775"/><stop offset=".64" stop-color="#fff5bb"/><stop offset=".79" stop-color="#b77a22"/><stop offset="1" stop-color="#5f350b"/></linearGradient>
            <linearGradient id="${id}-band" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff2aa"/><stop offset=".13" stop-color="#f1ca65"/><stop offset=".22" stop-color="#895015"/><stop offset=".34" stop-color="#dfad43"/><stop offset=".53" stop-color="#ffe498"/><stop offset=".77" stop-color="#d9a13b"/><stop offset=".91" stop-color="#774312"/><stop offset="1" stop-color="#f5cd70"/></linearGradient>
            <radialGradient id="${id}-stud" cx=".3" cy=".25" r=".8"><stop stop-color="#fffbd5"/><stop offset=".3" stop-color="#f9d879"/><stop offset=".65" stop-color="#b67c22"/><stop offset="1" stop-color="#57300a"/></radialGradient>
            <linearGradient id="${id}-inset" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0c0805"/><stop offset=".5" stop-color="#21160d"/><stop offset="1" stop-color="#100b07"/></linearGradient>
        </defs>
        <path d="M6 23Q25 40 40 29L47 10Q66 34 81 21L100 3L119 21Q134 34 153 10L160 29Q175 40 194 23L186 94Q100 109 14 94Z" fill="#57320d" transform="translate(0 3)"/>
        <path d="M6 23Q25 40 40 29L47 10Q66 34 81 21L100 3L119 21Q134 34 153 10L160 29Q175 40 194 23L186 94Q100 109 14 94Z" fill="url(#${id}-gold)" stroke="#fff0a3" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M13 34Q29 43 44 34L49 21Q66 41 84 29L100 14L116 29Q134 41 151 21L156 34Q171 43 187 34L180 90Q100 104 20 90Z" fill="none" stroke="#754712" stroke-width="1.6"/>
        <path d="M14 35Q29 44 44 35L49 23Q66 42 85 30L100 16L115 30Q134 42 151 23L156 35Q171 44 186 35" fill="none" stroke="#fff3b2" stroke-width=".7"/>
        <path d="M36 34Q100 28 164 34Q174 35 176 45L180 80Q180 88 170 90Q100 101 30 90Q20 88 20 80L24 45Q26 35 36 34Z" fill="url(#${id}-band)" stroke="#704010" stroke-width="1"/>
        <path d="M37 38Q100 32 163 38Q170 39 171 47L175 79Q176 84 167 86Q100 96 33 86Q24 84 25 79L29 47Q30 39 37 38Z" fill="url(#${id}-inset)" stroke="#6a400f" stroke-width="1.4"/>
        <path d="M37 39Q100 33 163 39Q169 40 170 47M28 82Q100 103 172 82" fill="none" stroke="#f1cc71" stroke-width=".65"/>
        <path d="M39 41Q100 35 161 41" fill="none" stroke="#050302" stroke-width="1.3"/>
        <g fill="none" stroke="#fff0ad" stroke-width=".8" stroke-linecap="round">
            <path d="M16 51C9 57 13 67 18 65C22 63 18 58 16 61M18 69Q11 75 17 83M184 51C191 57 187 67 182 65C178 63 182 58 184 61M182 69Q189 75 183 83"/>
            <path d="M91 25L100 17L109 25M96 26L100 22L104 26"/>
        </g>
        <path d="M14 94Q100 107 186 94L183 113Q100 124 17 113Z" fill="#603710"/>
        <path d="M14 91Q100 104 186 91L183 110Q100 121 17 110Z" fill="url(#${id}-band)" stroke="#eec26a" stroke-width=".9"/>
        <path d="M17 95Q100 108 183 95M19 108Q100 119 181 108" fill="none" stroke="#fff0a5" stroke-width=".8"/>
        <path d="M20 99Q100 111 180 99" fill="none" stroke="#815018" stroke-width=".65" stroke-dasharray="1 2"/>
        <g fill="url(#${id}-stud)" stroke="#f8d77e" stroke-width=".65">
            <circle cx="6" cy="23" r="3.5"/><circle cx="47" cy="10" r="3.5"/><circle cx="100" cy="4" r="3.5"/><circle cx="153" cy="10" r="3.5"/><circle cx="194" cy="23" r="3.5"/>
            <path d="M35 98L39 102L35 106L31 102ZM165 98L169 102L165 106L161 102Z"/>
            <circle cx="51" cy="104" r="1.4"/><circle cx="149" cy="104" r="1.4"/>
        </g>
    </svg>`;
}

function achPearlMarqueeHTML() {
    const id = `bbgl-marquee-${achPearlMarqueeHTML.serial = (achPearlMarqueeHTML.serial || 0) + 1}`;
    const points = [[83, 20], [70, 24], [56, 27], [42, 27], [28, 29], [16, 36], [12, 49], [12, 63], [12, 77], [20, 89], [33, 95], [47, 98], [61, 100]];
    const colors = ['#f6c2eb', '#b8edff', '#e5d0ff', '#ffe6ac'];
    const bulbs = points.map(([x, y], i) => [x, 200 - x].map(cx => `<g class="bbgl-marquee-bulb" style="--bulb-delay:${i * 45}ms;--bulb-color:${colors[i % colors.length]}"><circle cx="${cx}" cy="${y}" r="3" fill="#302c49" stroke="#e0d7ef" stroke-width=".6"/><circle class="bbgl-marquee-lamp" cx="${cx}" cy="${y}" r="1.65" fill="${colors[i % colors.length]}"/><circle cx="${cx - .3}" cy="${y - .4}" r=".7" fill="#fff"/></g>`).join('')).join('');
    return `<svg class="bbgl-rank-pearl-marquee" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
        <defs>
            <linearGradient id="${id}-pearl" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#fff5cf"/><stop offset=".17" stop-color="#f7c3e6"/><stop offset=".34" stop-color="#b5e8fa"/><stop offset=".48" stop-color="#fff"/><stop offset=".62" stop-color="#d3c1f1"/><stop offset=".8" stop-color="#f7d8ad"/><stop offset="1" stop-color="#b0e9ef"/></linearGradient>
            <linearGradient id="${id}-metal" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".25" stop-color="#cad4ed"/><stop offset=".43" stop-color="#635879"/><stop offset=".58" stop-color="#f9efff"/><stop offset="1" stop-color="#493d62"/></linearGradient>
            <radialGradient id="${id}-face" cx=".5" cy=".25" r=".85"><stop stop-color="#342349"/><stop offset=".55" stop-color="#141324"/><stop offset="1" stop-color="#080a16"/></radialGradient>
            <linearGradient id="${id}-beam" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#f2e5ff" stop-opacity=".48"/><stop offset=".55" stop-color="#c9eaff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        </defs>
        <path d="M100 8 C78 28 45 16 19 28 Q3 34 3 49V79Q3 98 26 102Q100 121 174 102Q197 98 197 79V49Q197 34 181 28C155 16 122 28 100 8Z" fill="#332c48" transform="translate(0 3)"/>
        <path d="M100 5 C78 25 45 13 19 25 Q3 31 3 46V76Q3 95 26 99Q100 118 174 99Q197 95 197 76V46Q197 31 181 25C155 13 122 25 100 5Z" fill="url(#${id}-pearl)" stroke="url(#${id}-metal)" stroke-width="3"/>
        <path d="M100 25 C75 37 44 28 26 38Q22 40 22 48V74Q22 84 37 88Q100 102 163 88Q178 84 178 74V48Q178 40 174 38C156 28 125 37 100 25Z" fill="url(#${id}-face)" stroke="#5e5379" stroke-width="2"/>
        <path d="M100 29C75 41 46 32 29 41 M29 80Q100 105 171 80" fill="none" stroke="url(#${id}-pearl)" stroke-opacity=".6" stroke-width=".7"/>
        ${bulbs}
        <g class="bbgl-marquee-beams" fill="url(#${id}-beam)"><path d="M25 91L105 29L160 35Z"/><path d="M175 91L95 29L40 35Z"/></g>
        <g fill="url(#${id}-metal)" stroke="#35314c" stroke-width=".7"><path d="M16 94L24 82L33 88L27 100Z"/><path d="M184 94L176 82L167 88L173 100Z"/></g>
        <path d="M23 83L31 88 M177 83L169 88" stroke="#f1f8ff" stroke-width="2"/>
        <path d="M100 1L104 10L114 11L107 18L109 28L100 23L91 28L93 18L86 11L96 10Z" fill="url(#${id}-pearl)" stroke="#fbf3ff" stroke-width=".8"/>
        <path d="M100 5V20L94 24L96 16L90 13L98 12Z" fill="#fff" opacity=".45"/>
        <path d="M67 99Q100 104 133 99L130 114Q100 120 70 114Z" fill="url(#${id}-pearl)" stroke="url(#${id}-metal)" stroke-width="1"/>
    </svg>`;
}

function achBronzePlaqueHTML() {
    const id = `bbgl-bronze-${achBronzePlaqueHTML.serial = (achBronzePlaqueHTML.serial || 0) + 1}`;
    return `<svg class="bbgl-rank-bronze-plaque" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true">
        <defs>
            <linearGradient id="${id}-rim" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#d9ad75"/><stop offset=".13" stop-color="#a57443"/><stop offset=".23" stop-color="#51321f"/><stop offset=".34" stop-color="#9f683b"/><stop offset=".48" stop-color="#d9ad75"/><stop offset=".56" stop-color="#c2945f"/><stop offset=".65" stop-color="#784a29"/><stop offset=".8" stop-color="#b58450"/><stop offset=".92" stop-color="#382317"/><stop offset="1" stop-color="#c99b64"/></linearGradient>
            <linearGradient id="${id}-face" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#d9ad75"/><stop offset=".16" stop-color="#87522e"/><stop offset=".3" stop-color="#bc8b54"/><stop offset=".42" stop-color="#634025"/><stop offset=".49" stop-color="#a16a3b"/><stop offset=".55" stop-color="#d9ad75"/><stop offset=".62" stop-color="#bb8d58"/><stop offset=".77" stop-color="#80502d"/><stop offset=".9" stop-color="#ad7b45"/><stop offset="1" stop-color="#593820"/></linearGradient>

            <radialGradient id="${id}-rust"><stop stop-color="#ae502b" stop-opacity=".65"/><stop offset=".45" stop-color="#80371f" stop-opacity=".4"/><stop offset="1" stop-color="#572817" stop-opacity="0"/></radialGradient>
            <radialGradient id="${id}-tarnish"><stop stop-color="#49291b" stop-opacity=".5"/><stop offset="1" stop-color="#683c24" stop-opacity="0"/></radialGradient>
        </defs>
        <path d="M100 3C70 3 68 6 60 17Q57 22 48 22H27Q24 33 9 37L3 67L9 98Q22 102 27 117H173Q178 102 191 98L197 67L191 37Q176 33 173 22H152Q143 22 140 17C132 6 130 3 100 3Z" fill="url(#${id}-rim)" stroke="#624029" stroke-width="1"/>
        <path d="M100 9C73 9 72 11 65 21Q60 28 49 28H32Q27 38 15 42L9 67L15 93Q27 98 32 111H168Q173 98 185 93L191 67L185 42Q173 38 168 28H151Q140 28 135 21C128 11 127 9 100 9Z" fill="url(#${id}-face)" stroke="#4c311f" stroke-width="1.7"/>
        <path d="M33 36H167Q172 44 183 47L188 68L183 92Q172 96 167 104H33Q28 96 17 92L12 68L17 47Q28 44 33 36Z" fill="#101211" stroke="#4b301d" stroke-width="2"/>
        <path d="M34 38H166Q171 46 181 49L186 68L181 90Q171 94 166 102H34Q29 94 19 90L14 68L19 49Q29 46 34 38Z" fill="none" stroke="#d0a16a" stroke-opacity=".42" stroke-width=".7"/>
        <path d="M62 25C72 14 73 12 100 12C127 12 128 14 138 25M34 109H166" fill="none" stroke="#d6a970" stroke-width="1"/>
        <g fill="url(#${id}-rust)"><ellipse cx="29" cy="39" rx="8" ry="6"/><ellipse cx="171" cy="98" rx="8" ry="6"/></g>
        <g fill="#392719" stroke="#d2a36d" stroke-width=".6"><circle cx="30" cy="34" r="1.5"/><circle cx="170" cy="34" r="1.5"/><circle cx="30" cy="102" r="1.5"/><circle cx="170" cy="102" r="1.5"/></g>
    </svg>`;
}

function achSilverShieldJewelsHTML() {
    const id = `bbgl-silver-shield-${achSilverShieldJewelsHTML.serial = (achSilverShieldJewelsHTML.serial || 0) + 1}`;
    const jewels = [[29, 30, -12], [171, 30, 12], [100, 101, 0]].map(([x, y, angle]) => `<g transform="translate(${x} ${y}) rotate(${angle}) scale(1.05)">
        <path d="M-5-10H5L9-5V5L5 10H-5L-9 5V-5Z" fill="url(#${id}-rim)" stroke="#52666a" stroke-width=".7"/>
        <path d="M-4-8H4L7-4V4L4 8H-4L-7 4V-4Z" fill="#003d29" stroke="#09271f" stroke-width=".6"/>
        <path d="M-4-8H4L3-4H-3L-7-4Z" fill="#93dcbc"/>
        <path d="M4-8L7-4V4L3 4V-4Z" fill="#087451"/>
        <path d="M7 4L4 8H-4L-3 4Z" fill="#002f23"/>
        <path d="M-7-4L-3-4V4L-4 8L-7 4Z" fill="#1a9d70"/>
        <path d="M-3-4H3V4H-3Z" fill="url(#${id}-gem)"/>
                <path d="M-4-8L-3-4L-7-4ZM4-8L3-4L7-4ZM7 4L3 4L4 8ZM-7 4L-3 4L-4 8Z" fill="#52b58e" opacity=".7"/>
        <path d="M-3-4L1-2L3 4L-1 2Z" fill="#b4edcf" opacity=".22"/>
        <path d="M3-4L1-2L-3 4L3 1Z" fill="#002e21" opacity=".55"/>
        <path d="M-2 1L0-1L1 2M-1 3L1 1" fill="none" stroke="#8cc6a7" stroke-opacity=".25" stroke-width=".2"/>
        <path d="M-4-7H2M-6-3V0" fill="none" stroke="#e0f5e9" stroke-width=".45"/>
        <path d="M-5-8L-3-7M5 8L3 7" fill="none" stroke="url(#${id}-rim)" stroke-width="1.4" stroke-linecap="round"/>
    </g>`).join('');
    return `<svg class="bbgl-rank-silver-shield-jewels" viewBox="0 0 200 120" preserveAspectRatio="none" aria-hidden="true"><defs>
            <linearGradient id="${id}-rim" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#fff"/><stop offset=".13" stop-color="#d7e3e9"/><stop offset=".23" stop-color="#536975"/><stop offset=".34" stop-color="#c7d5dd"/><stop offset=".48" stop-color="#fff"/><stop offset=".56" stop-color="#eef7fb"/><stop offset=".65" stop-color="#718995"/><stop offset=".8" stop-color="#dce9ef"/><stop offset=".92" stop-color="#435b68"/><stop offset="1" stop-color="#e6f1f6"/></linearGradient>
            <linearGradient id="${id}-gem" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#93dcbc"/><stop offset=".22" stop-color="#1a9d70"/><stop offset=".46" stop-color="#006044"/><stop offset=".52" stop-color="#52b58e"/><stop offset=".68" stop-color="#087451"/><stop offset="1" stop-color="#002f23"/></linearGradient>
    </defs><g fill="none" stroke="url(#${id}-rim)" stroke-width=".8" opacity=".8">
        <path d="M22 48C18 60 24 74 37 85C31 76 29 68 34 63C39 57 44 66 39 69C35 71 33 66 36 64M178 48C182 60 176 74 163 85C169 76 171 68 166 63C161 57 156 66 161 69C165 71 167 66 164 64"/>
        <path d="M65 99Q83 100 100 113Q117 100 135 99M83 103Q100 97 117 103M96 107L100 102L104 107L100 112Z"/>
        <path d="M72 19Q82 12 88 13M128 19Q118 12 112 13"/>
        </g>${jewels}</svg>`;
}

function achRankPlaqueHTML(cls, style, tip, revealed, label, textWrapperClass = '') {
    const nameTag = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-mill');
    const lightbox = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-machined');
    const bronzePlaque = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-polished');
    const silverShield = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-silver');
    const goldCrown = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-gold');
    const pearlMarquee = revealed && cls.split(/\s+/).includes('bbgl-title-card-rank-plaque') && cls.split(/\s+/).includes('finish-pearl');
    const lines = nameTag
        ? `<span class="bbgl-rank-notch-line" data-rank-text="${achEsc(label)}">${achEsc(label)}</span>`
        : revealed ? achRankPlaqueLabelHTML(label) : '<span class="bbgl-rank-notch-line">?</span>';
    const greeting = nameTag ? '<span class="bbgl-rank-name-tag-heading">Hello, my RANK is...</span>'
        : lightbox ? '<span class="bbgl-rank-lightbox-heading"><span>RANK</span></span>'
        : bronzePlaque ? `${achBronzePlaqueHTML()}<span class="bbgl-rank-bronze-heading">RANK</span>`
        : silverShield ? `${achSilverShieldJewelsHTML()}<span class="bbgl-rank-silver-shield-heading">RANK</span>`
        : goldCrown ? `${achGoldCrownHTML()}<span class="bbgl-rank-crown-heading">RANK</span>`
        : pearlMarquee ? `${achPearlMarqueeHTML()}<span class="bbgl-rank-marquee-heading">RANK</span>` : '';
    const letterSeats = silverShield
        ? `<span class="bbgl-shield-letter-seats" aria-hidden="true">${lines.replaceAll('bbgl-rank-notch-line', 'bbgl-shield-letter-seat')}</span>`
        : '';
    const inner = greeting + (textWrapperClass ? `<span class="${textWrapperClass}">${letterSeats}${lines}</span>` : lines);
    const styleAttr = style ? ` style="${style}"` : '';
    return `<div class="${cls}"${styleAttr} data-tooltip="${achEsc(tip)}"><span class="bbgl-rank-notch-label"><span class="bbgl-rank-notch-face"><span class="bbgl-rank-notch-fx"></span>${inner}</span></span></div>`;
}

// Shared rank tooltip for the identity-card plaque, the rank scale labels, the capstone and the
// level knob. Returns tooltip HTML; callers escape it for the attribute.
function achRankTipHTML(label, start, end, unlocked) {
    if (!unlocked) return `<strong><em>Locked</em></strong><i>Reach level ${start} to unlock</i>`;
    const range = start === end ? `Level ${start}` : `Levels ${start}-${end}`;
    return `<strong>${achEsc(label)}</strong><i>${range}</i>`;
}

// Resolves the stationary card plaque shown on the identity card.
function achCurrentRankPlaqueData(atrophy, level) {
    const finishes = ['mill', 'machined', 'polished', 'silver', 'gold', 'pearl'];
    const materials = ['iron', 'steel', 'silver', 'bright-silver', 'gold', 'diamond'];
    const brackets = levelRankBrackets(atrophy, level);
    const bricked = isFullyBricked(atrophy, level);
    let currentIdx = -1;
    brackets.forEach((b, i) => { if (b.unlocked) currentIdx = i; });

    const isCap = bricked;
    const finishIdx = isCap ? finishes.length - 1 : Math.max(0, currentIdx);
    const current = brackets[Math.max(0, currentIdx)] || brackets[0];
    const label = isCap ? 'Fully Bricked' : atrophyBandTitle(atrophy, level);
    const tip = isCap
        ? achRankTipHTML(label, LEVEL_CAP, LEVEL_CAP, true)
        : achRankTipHTML(label, current.start, current.end, true);
    const cls = [
        'bbgl-rank-notch',
        'bbgl-title-card-rank-plaque',
        `finish-${finishes[finishIdx] || 'mill'}`,
        `material-${materials[finishIdx] || 'iron'}`,
        'is-revealed',
        'is-current',
        isCap ? 'is-cap is-bricked' : ''
    ].filter(Boolean).join(' ');

    return {
        finish: finishes[finishIdx] || 'mill',
        material: materials[finishIdx] || 'iron',
        label,
        tip,
        html: achRankPlaqueHTML(cls, '', tip, true, label, 'bbgl-rank-title-text')
    };
}

function achTitleIdentityHTML(currentRank, titleValue, labelExtra = '') {
    return `<div class="bbgl-titles-center">` +
        `<div class="bbgl-title-card" data-sign-stage="0" data-rank-finish="${currentRank.finish}" data-rank-material="${currentRank.material}">` +
        `<div class="bbgl-title-card-sign"><div class="bbgl-title-card-sign-face">` +
        `<span class="bbgl-title-card-title-label">The${labelExtra}</span><span class="bbgl-title-card-value">${titleValue}</span>` +
        `</div></div><div class="bbgl-title-card-connector" aria-hidden="true"></div>` +
        `<div class="bbgl-title-card-rank"><span class="bbgl-title-card-rank-label">Rank</span>${currentRank.html}</div>` +
        `</div></div>`;
}

function achLevelBarTooltipHTML(atrophy, level, levelPct = 0) {
    const titleHtml = composeStatTitleHTML(getLiveStatTitleSelection());
    const titleValue = titleHtml
        ? `<i class="bbgl-lvl-title bbgl-titles-title">${titleHtml}</i>`
        : `<span class="bbgl-title-card-empty">Unequipped</span>`;
    const pct = Math.max(0, Math.min(100, levelPct));
    const start = Math.min(LEVEL_CAP - 20, Math.floor(level / 20) * 20);
    const end = start + 20;
    const progress = Math.max(0, Math.min(100, ((level + pct / 100 - start) / 20) * 100));
    const caption = level >= LEVEL_CAP
        ? (isFullyBricked(atrophy, level) ? 'Maximum rank' : 'Rank cycle complete')
        : 'Next rank';
    const progressHTML = `<div class="bbgl-tooltip-rank-progress"><div class="bbgl-tooltip-rank-caption">${caption}</div><div class="bbgl-tooltip-rank-track" role="progressbar" aria-label="${caption}" aria-valuemin="${start}" aria-valuemax="${end}" aria-valuenow="${Math.min(end, level + pct / 100).toFixed(2)}" style="--rank-progress:${progress.toFixed(2)}%"><span></span></div><div class="bbgl-tooltip-rank-endpoints"><span>Lv ${start}</span><span class="bbgl-tooltip-level-readout">Level ${level} &bull; ${pct.toFixed(1)}%</span><span>Lv ${end}</span></div></div>`;
    // Same corner grouping as the titles page: str+spd left, def+dex right.
    const eByStat = getLiveStatTitleE();
    const phases = getLiveStatTitleSelection().phases;
    const emblem = k => achTooltipStatEmblemHTML(k, phases[k] ?? -1, eByStat[k] || 0);
    const identity = `<div class="bbgl-tooltip-identity-row">` +
        `<div class="bbgl-tooltip-emblem-col">${emblem('str')}${emblem('spd')}</div>` +
        achTitleIdentityHTML(achCurrentRankPlaqueData(atrophy, level), titleValue) +
        `<div class="bbgl-tooltip-emblem-col">${emblem('def')}${emblem('dex')}</div></div>`;
    return `<div class="bbgl-level-title-tooltip"><div class="bbgl-titles-name bbgl-tooltip-player-name">${achEsc(achTitlePlayerName())}</div>${identity}${progressHTML}</div>`;
}

// The level-bar tooltip's per-stat emblem: the in-progress tier (the one right after the highest
// unlocked), or the top tier once all are unlocked. Fill math matches achTitleStarHTML().
function achTooltipStatEmblemHTML(stat, unlockedPhase, statE) {
    const lastPhase = STAT_TITLE_THRESHOLDS.length - 1;
    const maxed = unlockedPhase >= lastPhase;
    const phase = maxed ? lastPhase : unlockedPhase + 1;
    const need = STAT_TITLE_THRESHOLDS[phase] || 0;
    const prev = phase > 0 ? (STAT_TITLE_THRESHOLDS[phase - 1] || 0) : 0;
    const pct = maxed ? 100 : Math.max(0, Math.min(100, ((statE - prev) / Math.max(1, need - prev)) * 100));
    const readout = `T${phase + 1} &bull; ${maxed ? 'MAX' : `${Math.floor(pct)}%`}`;
    return `<div class="bbgl-tooltip-emblem ach-stat-${stat}${maxed ? ' is-unlocked' : ''}" style="--star-fill:${(pct / 100).toFixed(3)}">` +
        achStatEmblemHTML(stat, phase, pct, 'tip-') +
        `<span class="bbgl-tooltip-emblem-pct">${readout}</span></div>`;
}

// The groove's vertical marks: a short ruler tick at every second level, a tall one under each
// milestone title (0, 20, 40, 60, 80, 100), and the live (purple) tick at --rank-fill-pct, last so it
// covers a milestone at an exact unlock level. Every second level in every mode. Plain elements placed
// by percentage and styled entirely in CSS (see .bbgl-rank-tick, 04-section-iii-styles.js) — no
// layout pass. At a fractional display scale (Windows 125%/130%) a 1px tick rounds to 1 or 2 device
// pixels depending on where it lands, so they can differ slightly in thickness; accepted for now.
// Static markup, so a level change never rebuilds it.
function achRankTicksHTML() {
    let html = '';
    for (let i = 0; i <= LEVEL_CAP; i += 2) {
        const cls = i % 20 === 0 ? ' is-milestone' : '';
        html += `<i class="bbgl-rank-tick${cls}" style="left:${i * 100 / LEVEL_CAP}%"></i>`;
    }
    return `<div class="bbgl-rank-ticks">${html}<i class="bbgl-rank-tick is-live"></i></div>`;
}

// Plain-text milestone scale. Every title sits at the exact level that unlocks it rather than in a
// visual range beginning at some other coordinate: 0, 20, 40, 60, 80, then Fully Bricked at 100.
// The symmetric endpoint titles deliberately overhang the groove by half their rendered widths.
//
// Each title is boxed in its own .bbgl-rank-title-slot: six equal cells of a grid that is DELIBERATELY
// wider than the groove (see .bbgl-rank-titles, 04-section-iii-styles.js). The extra width is what the
// two end titles hang into — a track exactly as wide as the groove would put the 0% and 100% cells
// half outside it. Slot centres land on the milestones, so this is the same placement the per-title
// left:N% used to compute inline, now expressed as a box each title owns and can be clipped, wrapped
// or shrunk inside independently at narrow widths.
function achTitleLabelsHTML(atrophy, level) {
    const bricked = isFullyBricked(atrophy, level);
    // Rank-name bands own a fixed material ladder on the visible scale — atrophy changes the
    // words, the material order stays stable.
    const materials = ['iron', 'steel', 'silver', 'bright-silver', 'gold'];
    const bands = levelRankBrackets(atrophy, level).map((b, i) => {
        const cls = [
            'bbgl-rank-title',
            'is-milestone',
            `material-${materials[i] || 'iron'}`,
            i === 0 ? 'is-endpoint' : '',
            b.unlocked ? 'is-revealed' : 'is-locked'
        ].filter(Boolean).join(' ');
        const tip = achRankTipHTML(b.label, b.start, b.end, b.unlocked);
        // Same closest-split two-line wrap the plaques used (achRankPlaqueLabelHTML above) — each
        // line lands in its own .bbgl-rank-notch-line block, which is what makes it wrap instead of
        // running the whole title across one line.
        const inner = b.unlocked ? achRankPlaqueLabelHTML(b.label) : ICONS.LOCK;
        // No inline left any more: the slot's own position on the grid IS the milestone coordinate,
        // so a hardcoded percentage here would be a second, silently divergent source for it.
        return `<div class="bbgl-rank-title-slot"><div class="${cls}" data-tooltip="${achEsc(tip)}"><span class="bbgl-rank-title-text">${inner}</span></div></div>`;
    }).join('');
    const capTip = achRankTipHTML('Fully Bricked', LEVEL_CAP, LEVEL_CAP, bricked);
    // The destination is always named. Its muted/finished state carries the lock information; a
    // lock glyph here would sit on the finish divider and hide what the player is working toward.
    const capInner = achRankPlaqueLabelHTML('Fully Bricked');
    const cap = `<div class="bbgl-rank-title-slot"><div class="bbgl-rank-title is-milestone is-endpoint is-capstone material-diamond ${bricked ? 'is-revealed' : 'is-locked'}" data-tooltip="${achEsc(capTip)}"><span class="bbgl-rank-title-text">${capInner}</span></div></div>`;
    return bands + cap;
}

// One star. Only the very next locked phase can show any fill (and E progress in its tooltip);
// everything past it reads 0 and just "Locked".
//
// `phase` stays the internal 0-based index everywhere it's used as data; the tooltip's "Tier N" is
// the only place the player reads it, shifted to 1-10 there.
//
// `idScope` keeps gradient ids unique per copy: url(#id) resolves to the first match in the document,
// and a gradient's currentColor stops take the colour of wherever that gradient lives. A second
// copy sharing the ids (the level-bar tooltip's, which stays in the DOM when hidden) would repaint
// the page's emblems with its own colours.
function achStatEmblemHTML(stat, phase, pct, idScope = '') {
    const shapes = {
        str: ['M8 16H13V10H21V20H43V10H51V16H56V32H51V38H43V28H21V38H13V32H8Z', 'M16 13V35M48 13V35M24 23H40M24 25H40'],
        def: ['M32 4Q43 11 53 10L51 26Q48 37 32 44Q16 37 13 26L11 10Q21 11 32 4Z', 'M32 10V37M17 15Q24 15 32 10Q40 15 47 15L45 25Q43 32 32 38Q21 32 19 25Z'],
        spd: ['M32 4A20 20 0 1 0 32 44A20 20 0 1 0 32 4Z', 'M32 11A13 13 0 1 0 32 37A13 13 0 1 0 32 11ZM32 18A6 6 0 1 0 32 30A6 6 0 1 0 32 18Z'],
        dex: ['M41 4C48 4 49 12 43 15L42 18L35 25L40 29L47 40L42 43L33 33L28 31L23 37L12 42L9 37L19 31L25 22L32 18L26 16L17 20L14 16L25 10L36 14L37 12C34 8 36 4 41 4Z', 'M37 19L30 25L35 29M27 14L34 17M20 34L25 30']
    };
    const [outline, detail] = shapes[stat];
    const enamel = `bbgl-emblem-enamel-${idScope}${stat}-${phase}`;
    const gloss = `${enamel}-gloss`;
    return `<svg class="bbgl-stat-emblem" viewBox="0 0 64 48" aria-hidden="true"><defs><linearGradient id="${enamel}" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="currentColor"/><stop offset=".35" stop-color="currentColor"/><stop offset="1" stop-color="#141a22"/></linearGradient><linearGradient id="${gloss}" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".38" stop-color="#fff" stop-opacity=".12"/><stop offset=".43" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient></defs>` +
        `<path class="bbgl-emblem-relief" d="${outline}"/>` +
        `<path class="bbgl-emblem-body" d="${outline}" fill="url(#${enamel})"/>` +
        `<path class="bbgl-emblem-gloss" d="${outline}" fill="url(#${gloss})"/>` +
        `<path class="bbgl-emblem-detail" d="${detail}"/>` +
        (pct > 0 ? `<path class="bbgl-emblem-trace" d="${outline}" pathLength="100"/>` : '') + `</svg>`;
}

function achTitleStarHTML(stat, phase, unlockedPhase, statE, role) {
    const unlocked = phase <= unlockedPhase;
    const need = STAT_TITLE_THRESHOLDS[phase] || 0;
    const prev = phase > 0 ? (STAT_TITLE_THRESHOLDS[phase - 1] || 0) : 0;
    const span = Math.max(1, need - prev);
    const pct = unlocked ? 100 : Math.max(0, Math.min(100, ((statE - prev) / span) * 100));
    const cls = ['bbgl-title-star'];
    if (unlocked) cls.push('is-unlocked');
    else cls.push('is-locked');
    if (role) cls.push('is-' + role);
    const words = STAT_TITLE_WORDS[stat][phase];
    let tip;
    if (!unlocked) {
        const inProgress = phase === unlockedPhase + 1;
        tip = '<strong><em>Locked</em></strong>' +
            (inProgress ? `<i>${Formatter.number(Math.min(statE, need))} / ${Formatter.number(need)} E</i>` : '');
    } else {
        tip = `<strong>${words.adj} • ${words.noun}</strong><i>${achStatFull(stat)} · Tier ${phase + 1}</i>`;
    }
    return `<div class="${cls.join(' ')}" data-title-stat="${stat}" data-title-phase-idx="${phase}"${unlocked ? '' : ' data-locked="1"'} data-tooltip="${achEsc(tip)}" style="--star-fill:${(pct / 100).toFixed(3)}">` +
        achStatEmblemHTML(stat, phase, pct) +
        `</div>`;
}

// Which highlight a title star carries: '', 'primary', 'secondary' or 'both'. Shared by the full
// titles-page build and renderTitlePickLive()'s in-place patch (07-section-vi-ui.js).
function achTitleStarRole(sel, pending, stat, phase) {
    if (pending) return (pending.stat === stat && pending.phase === phase) ? 'secondary' : '';
    const isP = sel.primary && sel.primary.stat === stat && sel.primary.phase === phase;
    const isS = sel.secondary && sel.secondary.stat === stat && sel.secondary.phase === phase;
    return isP && isS ? 'both' : (isP ? 'primary' : (isS ? 'secondary' : ''));
}

// The identity card's title text (titleValue) and what follows "The" in its label (labelExtra: the
// reset arrow, or nothing). Shared by the full build and renderTitlePickLive().
function achTitleCardTitleParts(sel, pending) {
    // Mid-pick the card previews the single word placed so far; otherwise it's the committed pair.
    const titleHtml = pending ? statTitlePickPreviewHTML(pending) : composeStatTitleHTML(sel);

    // The reset only appears once there's a hand-picked title to reset — it's both the control and
    // the signal that you're off the automatic pair.
    const resetTip = 'Reset to highest earned title.';
    const resetBtn = (!pending && sel.mode === 'custom')
        ? `<button type="button" class="bbgl-title-reset" data-title-reset="1" data-tooltip="${achEsc(resetTip)}" aria-label="Reset title">${ICONS.REFRESH}</button>`
        : '';

    const titleValue = titleHtml
        ? `<i class="bbgl-lvl-title bbgl-titles-title">${titleHtml}</i>`
        : `<span class="bbgl-title-card-empty">Unequipped</span>`;
    return { titleValue, labelExtra: titleHtml ? resetBtn : '' };
}

function achBuildPageTitles() {
    const totalExp = getLiveLevelExp();
    const { atrophy, level } = calculateLevelProgress(totalExp);
    const currentRank = achCurrentRankPlaqueData(atrophy, level);

    const eByStat = getLiveStatTitleE();
    const sel = getLiveStatTitleSelection();
    const phases = sel.phases;

    // A pick in progress (one word placed, waiting on the second) owns the highlight outright: the
    // committed pair is cleared the moment the first star is clicked, so only that star lights up.
    // It takes the 'secondary' highlight because the first word IS the adjective slot.
    const pending = runtime._titlePick;
    const roleFor = (stat, phase) => achTitleStarRole(sel, pending, stat, phase);

    // One block per stat: 10 tier stars split 5 over 5, two even rows (.bbgl-title-star-row,
    // 04-section-iii-styles.js), grouped into two corner columns (str+spd left, def+dex right)
    // pinned to top/bottom around the centred identity card.
    //
    // The stat-name label stays first in the markup (it names the group) but renders straddling the
    // block's top border as cursive neon text via CSS, not DOM position. The outline is the static
    // .bbgl-plate-neon SVG (first child), whose own shape leaves the notch for the label.
    //
    // ach-stat-${k} sets --bbgl-t-win-color on the block itself; the outline and label both inherit
    // it, so the stat's colour is declared in exactly one place.
    const titleBlockHTML = k => {
        const star = i => achTitleStarHTML(k, i, phases[k], eByStat[k] || 0, roleFor(k, i));
        const top = STAT_TITLE_THRESHOLDS.slice(0, 5).map((_, i) => star(i)).join('');
        const bottom = STAT_TITLE_THRESHOLDS.slice(5).map((_, i) => star(i + 5)).join('');
        return `<div class="bbgl-title-block ach-stat-${k}">` +
            `<svg class="bbgl-plate-neon" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M4 16H23C27 16 27 2 34 2H66C73 2 73 16 77 16H96Q100 16 100 22V94Q100 100 96 100H4Q0 100 0 94V22Q0 16 4 16Z"/></svg>` +            `<div class="bbgl-title-block-label" data-tooltip="${achEsc(`Spend E training ${achStatFull(k)} to unlock new titles.`)}">${achStatFull(k)}</div>` +
            `<div class="bbgl-title-stars"><div class="bbgl-title-star-row">${top}</div><div class="bbgl-title-star-row">${bottom}</div></div></div>`;
    };
    const leftCol = `<div class="bbgl-titles-corner-col">${titleBlockHTML('str')}${titleBlockHTML('spd')}</div>`;
    const rightCol = `<div class="bbgl-titles-corner-col">${titleBlockHTML('def')}${titleBlockHTML('dex')}</div>`;

    const { titleValue, labelExtra } = achTitleCardTitleParts(sel, pending);
    const head = achTitleIdentityHTML(currentRank, titleValue, labelExtra);

    // Engraved rank scale: no shared backing plate. The thin groove is cut directly into the panel;
    // the live level rides the channel as the low-profile slider knob. rankBarProgressCSS()
    // (03-section-ii-utils.js) supplies its live readout position. Rank names render as the
    // plain-text milestone labels below (achTitleLabelsHTML()); the current rank's own plaque lives
    // on the identity card instead (achTitleIdentityHTML() above).
    const bricked = isFullyBricked(atrophy, level);
    const bar = `<div class="bbgl-rank-track" style="${rankBarProgressCSS(atrophy, level)}">` +
        `<div class="bbgl-rank-scale">` +
        `<div class="bbgl-rank-line${bricked ? ' is-bricked' : ''}">` +
        achRankTicksHTML() +
        `<div class="bbgl-rank-titles">${achTitleLabelsHTML(atrophy, level)}</div>` +
        `<div class="bbgl-rank-knob" data-tooltip="${achEsc(currentRank.tip)}"><span class="bbgl-rank-knob-lv">${level}</span></div>` +
        `</div>` +
        `</div>` +
        `</div>`;

    // Keep the rank track outside the card assembly so its space survives card resizing.
    return `<div class="bbgl-titles-page">` +
        `<div class="bbgl-titles-board"><div class="bbgl-titles-card-area"><div class="bbgl-titles-main">${leftCol}${head}${rightCol}</div></div></div>${bar}</div>`;
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
    const consRow = `<div class="bbgl-ach-row bbgl-ach-row-multi bbgl-ach-consistency-row" data-ach-key="consistency" data-tooltip="Your lifetime ratio of active training days versus total calendar days."><div class="bbgl-ach-consistency-text">Training Consistency: <span class="ach-cons-val">${achEsc(consVal)}</span> <span class="ach-cons-days">${achEsc(consDaysLong)}</span></div></div>`;
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
    const isExpanded = achIsExpandedMode();
    const countRow = (label, shortLabel, count, key, tip, tipIsHtml) => {
        const clipVal = String(count);
        const tipAttr = tipIsHtml ? `data-tooltip-html="${tip}"` : `data-tooltip="${achEsc(tip)}"`;
        return `<div class="bbgl-ach-row" ${tipAttr} data-ach-key="${key}" data-clip="${achEsc(label + ': ' + clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">${achEsc(label)}</span><span class="ach-title-short">${achEsc(shortLabel)}</span>:</span></div><div class="ach-v-wrap"><span class="ach-value">${achEsc(clipVal)}</span></div></div></div>`;
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
        const clipParts = trained.map(sk => achStatAbbr(sk) + ': +' + achFmtGain(rec.stats[sk]));
        clipParts.push('Total: +' + achFmtGain(rec.value));
        return `<div class="bbgl-ach-hh-best-row" data-tooltip="${achEsc(tip)}" data-ach-key="${key}" data-clip="${achEsc(longLabel + ' (' + dateStr + ', ' + timeStrClip + '): ' + clipParts.join(' | '))}" data-clip-date="${achEsc(dateStr + '  ' + timeStrClip)}"><div class="bbgl-ach-hh-label"><span class="ach-k"><span class="ach-title-long">${achEsc(longLabel)}</span><span class="ach-title-short">${achEsc(shortLabel)}</span></span><div class="bbgl-ach-hh-date-line">${achEsc(dateStr)}<span class="bbgl-ach-hh-time"> &nbsp; ${achEsc(timeStr)}</span></div></div><div class="bbgl-ach-hh-cells">${statCells}${totalCell}</div></div>`;
    };
    const hjCount = countRow('Happy Jumps Performed', 'Happy Jumps', d.happyJumps || 0, 'hj-count', 'Total number of Happy Jumps performed.<br><i>HJ = 1000E+ spent within 15m of using Ecstasy</i>', true);
    const hjBest = bestRow('Best Happy Jump', 'Best Jump', d.bestHappyJump && d.bestHappyJump.total, 'best-hj', 'The single Happy Jump that yielded the highest combined stat gain.');
    const rowsHTML = `<div class="bbgl-ach-hh-group" data-ach-key="happy-jumps-group">${hjCount}${hjBest}</div>`;
    let clipAll = `Happy Jumps Performed: ${d.happyJumps || 0}\nBest Happy Jump:${d.bestHappyJump && d.bestHappyJump.total ? (() => { const rec = d.bestHappyJump.total; const trained = STATS.filter(sk => (rec.stats[sk] || 0) > 0); const parts = trained.map(sk => achStatAbbr(sk) + ': +' + achFmtGain(rec.stats[sk])); parts.push('Total: +' + achFmtGain(rec.value)); return '\n  ' + parts.join('\n  ') + '\n' + achHJClipDate(rec); })() : ' +0'}`;

    let helpersHTML = '';
    if (d.happyItemTotals) {
        const hhOrder = { 2180: 1, 2210: 2, 2020: 3, 8983: 4 };
        const helpers = HAPPY_LOGS.map(id => {
            const rec = d.happyItemTotals[id] || { count: 0, happy: 0 };
            const meta = ITEM_LOG_META[id];
            const odRec = id === ECSTASY_LOG && d.odItemTotals ? d.odItemTotals[EX_OD_LOG] : null;
            const odCount = (odRec && odRec.count) || 0;
            return {
                id,
                label: meta.achLabel || meta.label,
                short: meta.short || meta.label,
                count: rec.count + odCount,
                odCount,
                happy: rec.happy
            };
        }).filter(h => h.count > 0).sort((a, b) => (hhOrder[a.id] || 99) - (hhOrder[b.id] || 99));

        if (helpers.length > 0) {
            const helperRow = (h) => {
                const tip = isExpanded ? `Amount of ${h.label} · Happy Gained` : `Amount of ${h.label}`;
                const clipVal = `${h.label}: ${h.count} (${Formatter.number(h.happy)} Happy)`;
                let html = `<div class="bbgl-ach-row" data-tooltip="${achEsc(tip)}" data-ach-key="happy-helper-${h.id}" data-clip="${achEsc(clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">${achEsc(h.label)}</span><span class="ach-title-short">${achEsc(h.short)}</span>:</span></div><div class="ach-v-wrap"><span class="ach-value">${Formatter.number(h.count)}</span><span class="ach-value ach-happy-col">+${achEsc(achFmtGain(h.happy))} <span class="ach-happy-word">H</span></span></div></div></div>`;
                if (h.id === 2210 && d.odItemTotals && d.odItemTotals[EX_OD_LOG] && d.odItemTotals[EX_OD_LOG].count > 0) {
                    const exRec = d.odItemTotals[EX_OD_LOG];
                    const countHtml = achEsc(Formatter.number(exRec.count));
                    const lostNum = exRec.happyLost > 0 ? `-${achEsc(Formatter.number(exRec.happyLost))}` : '<span class="ach-null">—</span>';
                    const eLostNum = exRec.energyLost > 0 ? `-${achEsc(Formatter.number(exRec.energyLost))}` : '<span class="ach-null">—</span>';

                    const gainedHtml = `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; line-height:1.2;">
                        <div>${lostNum} <span class="ach-happy-word ach-od-happy-word">H</span></div>
                        <div>${eLostNum} <span class="ach-enh-e-label" style="color:#c06060;">E</span></div>
                    </div>`;

                    const exOdLabel = achOdLabel(ITEM_LOG_META[EX_OD_LOG].label);
                    const exTip = isExpanded ? `Amount of ${exOdLabel} · Happy / Energy Lost` : `Amount of ${exOdLabel}`;
                    const exClip = `- ${ITEM_LOG_META[EX_OD_LOG].label}: ${exRec.count} (-${Formatter.number(exRec.happyLost)} H, -${Formatter.number(exRec.energyLost)} E)`;
                    html += `<div class="bbgl-ach-row bbgl-ach-od-row bbgl-subgroup-row bbgl-subgroup-row-last" data-tooltip="${achEsc(exTip)}" data-ach-key="happy-od-${EX_OD_LOG}" data-clip="${achEsc(exClip)}"><div class="ach-row-main" style="align-items:flex-start;"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">− ODs:</span><span class="ach-title-short">− ODs:</span></span></div><div class="ach-v-wrap" style="align-items:flex-start;"><span class="ach-value" style="padding-top:1px;">${countHtml}</span><span class="ach-value ach-happy-col ach-enh-od">${gainedHtml}</span></div></div></div>`;
                }
                return html;
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
            const clipHelpers = helpers.map(h => {
                let line = `${h.label}: ${h.count} (${Formatter.number(h.happy)} Happy)`;
                if (h.id === ECSTASY_LOG && h.odCount > 0) {
                    const exRec = d.odItemTotals[EX_OD_LOG];
                    line += `\n  - ODs: ${h.odCount} (-${Formatter.number(exRec.happyLost || 0)} H, -${Formatter.number(exRec.energyLost || 0)} E)`;
                }
                return line;
            }).join('\n\n');
            clipAll += '\n\n— Happy Helpers —\n' + clipHelpers;
            helpersHTML = `<div class="bbgl-ach-cols" style="grid-template-columns:repeat(${colCount},minmax(0,1fr)); padding-top:1px; padding-bottom:0;">${cols.join('')}</div>`;
        }
    }

    return `<div class="bbgl-ach-section bbgl-ach-section-hh"><div class="bbgl-ach-title-row"><span class="bbgl-ach-section-title" data-ach-section="happy-hopping" data-clip-section="${achEsc(clipAll)}" data-clip-title="Happy Hopping" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">HAPPY HOPPING</span></div>${rowsHTML}${helpersHTML}</div>`;
}

// ─── Books: read state, active windows and the gains attributed to each ─────────
// Built from the book log entries (2050 used / 2051 finished, bookId = the item) and the gym series.
//   state    'unread' | 'reading' (used, not finished) | 'read' (finished; Memories is read on use)
//   stats    { str?, def?, spd?, dex?, tot } for window books — only stats trained in the window
//   gain     number for stat books — the jump in that stat at payout
//   partial  the window started before the log
//   uncertain  a stat jump that doesn't match the book's +5% (a train missing around it)
// Gym-gains books report only the extra from the book, assuming the bonus multiplies:
// extra = gain × bonus / (1 + bonus). Memories And Mammaries (785) takes the effect of the book
// read before it: a 31-day window from its use, or a stat payout 31 days after its use.
const BOOK_USE_LOG = 2050,
    BOOK_FINISH_LOG = 2051,
    MEMORIES_BOOK = 785,
    BOOK_PERIOD_SECONDS = 31 * 86400;

function computeBookData(s) {
    const days = [...(s.history || []), s.today].filter(Boolean);
    const books = [],
        gym = [],
        enhancers = [];
    days.forEach(day => {
        (day.series || []).forEach(e => {
            if (e.type === 'item') {
                if ((e.logId === BOOK_USE_LOG || e.logId === BOOK_FINISH_LOG) && e.bookId) books.push(e);
                else if (e.statKey) enhancers.push(e);
            } else if (!e.synthetic && e.stat) {
                gym.push(e);
            }
        });
    });
    books.sort((a, b) => a.ts - b.ts);
    gym.sort((a, b) => a.ts - b.ts);
    enhancers.sort((a, b) => a.ts - b.ts);
    const nowTs = Math.floor(Date.now() / 1000);
    const logStart = (s.meta && s.meta.logStartDate) || 0;

    // Windows: one per book; Memories gets its own, copying the book read before it.
    const windows = {};
    let memories = null,
        lastRead = null;
    books.forEach(e => {
        if (e.logId === BOOK_USE_LOG) {
            if (e.bookId === MEMORIES_BOOK) {
                if (!memories) memories = { start: e.ts, end: e.ts + BOOK_PERIOD_SECONDS, repeats: lastRead };
                return;
            }
            if (!windows[e.bookId]) windows[e.bookId] = { start: e.ts, end: null };
            lastRead = e.bookId;
        } else if (e.bookId !== MEMORIES_BOOK) {
            const w = windows[e.bookId];
            if (w && w.end == null) w.end = e.ts;
            else if (!w) {
                windows[e.bookId] = { start: null, end: e.ts, partial: true };
                if (lastRead == null) lastRead = e.bookId;
            }
        }
    });

    // Per-stat gains from trains in [a, b), scaled by `factor`. Only stats trained appear.
    const sumGains = (a, b, onlyStat, factor) => {
        const out = {};
        let tot = 0;
        gym.forEach(e => {
            if ((a != null && e.ts < a) || e.ts >= b) return;
            if (onlyStat && e.stat !== onlyStat) return;
            const g = (e.gain || 0) * factor;
            out[e.stat] = (out[e.stat] || 0) + g;
            tot += g;
        });
        Object.keys(out).forEach(k => { out[k] = r2(out[k]); });
        out.tot = r2(tot);
        return out;
    };
    // The jump in `stat` at `T`: the stat's value just after T (the next train's before-value, or
    // today's live value) minus its value just before T (the last train's after-value), less any
    // stat enhancer gains on that stat in between.
    const statJump = (stat, T) => {
        let prev = null,
            next = null;
        for (const e of gym) {
            if (e.stat !== stat) continue;
            if (e.ts <= T) prev = e;
            else { next = e; break; }
        }
        if (!prev) return null;
        const before = prev.after;
        const afterVal = next ? next.after - next.gain : ((s.today.endBreakdown && s.today.endBreakdown[stat]) || 0);
        const until = next ? next.ts : nowTs + 1;
        const se = enhancers.reduce((a, e) => (e.statKey === stat && e.ts > prev.ts && e.ts < until) ? a + (e.statGain || 0) : a, 0);
        const gain = r2(afterVal - before - se);
        if (!(gain > 0)) return null;
        const expected = Math.min(before * 0.05, 10000000);
        return { gain, uncertain: Math.abs(gain - expected) > expected * 0.1 + 1 };
    };
    // The data a book produces over one window, by its training type.
    const effectData = (meta, start, end, finishTs) => {
        const out = { partial: (start == null) || (start < logStart) };
        if (meta.training === 'stat') {
            if (finishTs == null || finishTs > nowTs) return out;
            const j = statJump(meta.stat, finishTs);
            if (j) { out.gain = j.gain; out.uncertain = j.uncertain; }
            out.partial = false;
            return out;
        }
        if (meta.training === 'gym') {
            const bonus = meta.stat ? 0.3 : 0.2;
            out.stats = sumGains(start, Math.min(end, nowTs + 1), meta.stat || null, bonus / (1 + bonus));
        } else if (meta.training === 'energy' || meta.training === 'happy') {
            out.stats = sumGains(start, Math.min(end, nowTs + 1), null, 1);
        }
        return out;
    };

    const result = {};
    Object.keys(BOOK_META).map(Number).forEach(id => {
        const meta = BOOK_META[id];
        if (id === MEMORIES_BOOK) {
            result[id] = memories ? { state: 'read', start: memories.start, end: memories.end } : { state: 'unread' };
            return;
        }
        const w = windows[id];
        if (!w) {
            result[id] = { state: 'unread' };
            return;
        }
        const finished = w.end != null;
        const entry = { state: finished ? 'read' : 'reading', start: w.start, end: w.end };
        if (meta.training) Object.assign(entry, effectData(meta, w.start, finished ? w.end : nowTs + 1, w.end));
        result[id] = entry;
    });
    // Memories' own row: the repeated book's effect over Memories' window (training books only).
    let memoriesRow = null;
    if (memories && memories.repeats != null) {
        const repMeta = BOOK_META[memories.repeats];
        if (repMeta && repMeta.training && repMeta.training !== 'repeat') {
            memoriesRow = Object.assign({ repeats: memories.repeats, start: memories.start, end: memories.end }, effectData(repMeta, memories.start, memories.end, memories.end));
        }
    }
    return { books: result, memories: memoriesRow };
}

function computeEnhancersForPeriod(sl) {
    const energyItemTotals = {};
    ENERGY_LOGS.forEach(id => { energyItemTotals[id] = { count: 0, energy: 0 }; });
    const odItemTotals = {};
    OD_LOGS.forEach(id => { odItemTotals[id] = { count: 0, energyLost: 0, happyLost: 0 }; });
    const statEnhByStat = {
        str: { count: 0, gain: 0 }, def: { count: 0, gain: 0 },
        spd: { count: 0, gain: 0 }, dex: { count: 0, gain: 0 }
    };
    const days = (sl._dailyList && sl._dailyList.length > 0)
        ? sl._dailyList
        : (sl.date ? [DataController.getDateMap()[sl.date]] : []);
    days.forEach(day => {
        if (!day) return;
        if (day.items) {
            ENERGY_LOGS.forEach(id => {
                const qty = day.items[id] || 0;
                if (qty > 0) energyItemTotals[id].count += qty;
            });
            OD_LOGS.forEach(id => {
                const qty = day.items[id] || 0;
                if (qty > 0) odItemTotals[id].count += qty;
            });
        }
        (day.series || []).forEach(e => {
            if (e.type === 'item' && e.energy && energyItemTotals[e.logId])
                energyItemTotals[e.logId].energy += e.energy;
            if (e.type === 'item' && e.energyLost != null && odItemTotals[e.logId])
                odItemTotals[e.logId].energyLost += e.energyLost;
            if (e.type === 'item' && e.happyLost != null && odItemTotals[e.logId])
                odItemTotals[e.logId].happyLost += e.happyLost;
            if (e.type === 'item' && e.statKey && statEnhByStat[e.statKey]) {
                statEnhByStat[e.statKey].count++;
                statEnhByStat[e.statKey].gain = Math.round((statEnhByStat[e.statKey].gain + (e.statGain || 0)) * 100) / 100;
            }
        });
    });
    return { energyItemTotals, odItemTotals, statEnhByStat };
}

function achBuildPageOverview(d) {
    const NULL = '<span class="ach-null">—</span>';
    const enh = d.statEnhByStat || {};
    const enrg = d.energyItemTotals || {};
    const od = d.odItemTotals || {};
    const STAT_ABBR = { str: 'Str', def: 'Def', spd: 'Spd', dex: 'Dex' };
    const isExpanded = achIsExpandedMode();

    const STAT_ENH_MAP = { 2150: 'str', 2130: 'spd', 2140: 'def', 2120: 'dex' };
    const LEFT_COL = [2150, 2130, 2290, 2040, 4900];
    const RIGHT_COL = [2140, 2120, 2230, 2190, 8981];
    const OD_AFTER = { 2290: XANAX_OD_LOG, 2230: LSD_OD_LOG };

    const buildRow = (id) => {
        const meta = ITEM_LOG_META[id];
        const label = meta.achLabel || meta.label;
        const tipLabel = meta.achTipLabel || label;
        const sk = STAT_ENH_MAP[id];
        let countHtml, gainedHtml, clipVal, tip;

        if (sk) {
            const rec = enh[sk] || { count: 0, gain: 0 };
            countHtml = rec.count > 0 ? achEsc(Formatter.number(rec.count)) : NULL;
            // Stat label always shows; number is — when no data
            const gainNum = rec.gain > 0 ? `+${achEsc(Formatter.achAbbr(rec.gain, ACH_FMT.enhancers))}` : NULL;
            gainedHtml = `${gainNum} <span class="ach-stat-${sk}">${STAT_ABBR[sk]}</span>`;
            clipVal = `${label}: ${rec.count} (${STAT_ABBR[sk]}: +${Formatter.achAbbr(rec.gain, ACH_FMT.enhancers)})`;
            tip = isExpanded ? `Amount of ${tipLabel} · ${achStatFull(sk)} Gained` : `Amount of ${tipLabel}`;
        } else {
            const rec = enrg[id] || { count: 0, energy: 0 };
            const odId = OD_AFTER[id];
            const odCount = (odId && od[odId] && od[odId].count) || 0;
            const totalTaken = rec.count + odCount;
            countHtml = totalTaken > 0 ? achEsc(Formatter.number(totalTaken)) : NULL;
            const gainNum = rec.energy > 0 ? `+${achEsc(Formatter.achAbbr(rec.energy, ACH_FMT.enhancers))}` : NULL;
            gainedHtml = `${gainNum} <span class="ach-enh-e-label">E</span>`;
            clipVal = `${label}: ${totalTaken} (+${Formatter.achAbbr(rec.energy, ACH_FMT.enhancers)} Energy)`;
            tip = isExpanded ? `Amount of ${tipLabel} · Energy Gained` : `Amount of ${tipLabel}`;
        }

        const key = `enh-${id}`;
        return `<div class="bbgl-ach-row bbgl-ach-enh-row" data-tooltip="${achEsc(tip)}" data-ach-key="${key}" data-clip="${achEsc(clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">${achEsc(label)}:</span><span class="ach-title-short">${achEsc(label)}:</span></span></div><div class="ach-v-wrap"><span class="ach-value">${countHtml}</span><span class="ach-value ach-enh-gained">${gainedHtml}</span></div></div></div>`;
    };

    const buildODSubRow = (odId) => {
        const meta = ITEM_LOG_META[odId];
        const rec = od[odId] || { count: 0, energyLost: 0 };
        const countHtml = rec.count > 0 ? achEsc(Formatter.number(rec.count)) : NULL;
        const lostNum = rec.energyLost > 0 ? `-${achEsc(Formatter.number(rec.energyLost))}` : NULL;
        const gainedHtml = `${lostNum} <span class="ach-enh-e-label">E</span>`;
        const odLabel = achOdLabel(meta.label);
        const tip = isExpanded ? `Amount of ${odLabel} · Energy Lost` : `Amount of ${odLabel}`;
        const clipVal = `- ${meta.label}: ${rec.count} (-${Formatter.number(rec.happyLost || 0)} H, -${Formatter.number(rec.energyLost || 0)} E)`;
        const key = `enh-${odId}`;
        return `<div class="bbgl-ach-row bbgl-ach-enh-row bbgl-ach-od-row bbgl-subgroup-row bbgl-subgroup-row-last" data-tooltip="${achEsc(tip)}" data-ach-key="${key}" data-clip="${achEsc(clipVal)}"><div class="ach-row-main"><div class="ach-k-stack"><span class="ach-k"><span class="ach-title-long">− ODs:</span><span class="ach-title-short">− ODs:</span></span></div><div class="ach-v-wrap"><span class="ach-value">${countHtml}</span><span class="ach-value ach-enh-gained ach-enh-od">${gainedHtml}</span></div></div></div>`;
    };

    const buildColHTML = (col) => col.map(id => {
        let html = buildRow(id);
        // OD sub-row is dynamic: only rendered when at least one OD occurred in the period.
        const odId = OD_AFTER[id];
        if (odId && od[odId] && od[odId].count > 0) html += buildODSubRow(odId);
        return html;
    }).join('');

    const leftHTML = buildColHTML(LEFT_COL);
    const rightHTML = buildColHTML(RIGHT_COL);

    const clipAll = [...LEFT_COL, ...RIGHT_COL].map(id => {
        const meta = ITEM_LOG_META[id];
        const label = meta.achLabel || meta.label;
        const sk = STAT_ENH_MAP[id];
        if (sk) {
            const rec = enh[sk] || { count: 0, gain: 0 };
            if (!rec.count) return null;
            return `${label}: ${rec.count} (${STAT_ABBR[sk]}: +${Formatter.achAbbr(rec.gain, ACH_FMT.enhancers)})`;
        }
        const rec = enrg[id] || { count: 0, energy: 0 };
        const odId = OD_AFTER[id];
        const odCount = (odId && od[odId] && od[odId].count) || 0;
        if (!(rec.count + odCount)) return null;
        let line = `${label}: ${rec.count + odCount} (+${Formatter.achAbbr(rec.energy, ACH_FMT.enhancers)} Energy)`;
        if (odCount > 0) line += `\n  - ODs: ${odCount} (-${Formatter.number(od[odId].happyLost || 0)} H, -${Formatter.number(od[odId].energyLost || 0)} E)`;
        return line;
    }).filter(Boolean).join('\n\n') || '0';

    const cols =`<div class="bbgl-ach-col">${leftHTML}</div><div class="bbgl-ach-col">${rightHTML}</div>`;
    const isPeriod = !!viewState.achEnhPeriodMode;
    const switchHTML = `<div class="bbgl-enh-mode-switch" data-tooltip-html="<b>Changes the data scope displayed on this page.</b><br><i><b>All-Time</b> shows totals across your entire log history. <b>Selected</b> shows data for the selected period on the calendar.</i>" data-tooltip-side="left"><span class="bbgl-enh-sw-opt${isPeriod ? '' : ' active'}" data-mode="alltime">All-Time</span><span class="bbgl-enh-sw-opt${isPeriod ? ' active' : ''}" data-mode="selected">Selected</span></div>`;
    return `<div class="bbgl-ach-section bbgl-ach-section-energy"><div class="bbgl-ach-title-row"><span class="bbgl-ach-section-title" data-ach-section="endocrine-enhancers" data-clip-section="${achEsc(clipAll)}" data-clip-title="Endocrine Enhancers" data-tooltip="Click any row to copy its data, or click this title to copy the entire section to your clipboard.">ENDOCRINE ENHANCERS</span>${switchHTML}</div><div class="bbgl-ach-cols" style="grid-template-columns:repeat(2,minmax(0,1fr));">${cols}</div></div>`;
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
            rawVal: opts.rawVal !== undefined ? opts.rawVal : (opts.dualHtml && typeof value === 'number' ? achLedgerClip(value) : '0')
        };
        if (opts.display !== undefined || opts.rawVal !== undefined || value === null || value === undefined || typeof value !== 'number') {
            const display = opts.display !== undefined ? opts.display : achFmtVal(value);
            const rawVal = opts.rawVal !== undefined ? opts.rawVal : (opts.display !== undefined ? String(opts.display).replace(/<[^>]+>/g, '') : (value !== null && value !== undefined ? achFmtVal(value) : '0'));
            return {
                ...base,
                dualHtml: '',
                display,
                rawVal
            };
        }
        return {
            ...base,
            dualHtml: Formatter.achDual(value, ACH_FMT.gains),
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
            dualHtml: Formatter.achDual(v, ACH_FMT.gains) + ' E',
            rawVal: achLedgerClip(v) + ' E'
        }) : mk(label, null, {
            ...o,
            display: '\u2014',
            rawVal: '0 E'
        });
        return mk(label, v, o);
    };
    const achUnit = (n, sing, plur) => n ? n + '<span class="ach-unit"> ' + (n === 1 ? sing : plur) + '</span>' : '\u2014';
    if (pageIdx === 0) {
        return achBuildPageTitles();
    } else if (pageIdx === 1) {
        return achBuildPage0(d);
    } else if (pageIdx === 2) {
        return achBuildPage1(d);
    } else if (pageIdx === 3) {
        const overviewD = viewState.achEnhPeriodMode
            ? computeEnhancersForPeriod(calendarState.selectedData || DataController.getSlice('DAY', Formatter.dateLogical()))
            : d;
        return achBuildPageOverview(overviewD);
    } else if (pageIdx === 4) {
        return achBuildPage2(d);
    } else {
        const consistRows = [mk('Best Training Streak', d.longestStreak, {
            key: 'training-streak',
            dualHtml: achUnit(d.longestStreak, 'Day', 'Days'),
            rawVal: d.longestStreak ? d.longestStreak + (d.longestStreak === 1 ? ' Day' : ' Days') : '0 Days',
            clipDate: achFmtStreakRange(d.longestStreakStart, d.longestStreakEnd),
            tip: 'Longest streak of active training days'
        }), mk('Best Green Streak', d.longestGoalStreak, {
            key: 'green-streak',
            dualHtml: achUnit(d.longestGoalStreak, 'Day', 'Days'),
            rawVal: d.longestGoalStreak ? d.longestGoalStreak + (d.longestGoalStreak === 1 ? ' Day' : ' Days') : '0 Days',
            clipDate: achFmtStreakRange(d.longestGoalStreakStart, d.longestGoalStreakEnd),
            tip: 'Longest streak of achieving at least Green (1000E+)'
        }), mk('Best Gold Streak', d.longestGoldStreak, {
            key: 'gold-streak',
            dualHtml: achUnit(d.longestGoldStreak, 'Day', 'Days'),
            rawVal: d.longestGoldStreak ? d.longestGoldStreak + (d.longestGoldStreak === 1 ? ' Day' : ' Days') : '0 Days',
            clipDate: achFmtStreakRange(d.longestGoldStreakStart, d.longestGoldStreakEnd),
            tip: 'Longest streak of achieving Gold (1500E+)'
        }), mk('Consistency Rate', null, {
            key: 'consistency',
            display: d.trainingRestRatio || '\u2014',
            rawVal: d.trainingRestRatio || '0',
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

const achFmtGain = v => Formatter.achAbbr(v, ACH_FMT.compact);

function achStatAbbr(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function achStatFull(s) {
    return {
        str: 'Strength',
        def: 'Defense',
        spd: 'Speed',
        dex: 'Dexterity'
    }[s] || s;
}

// Expanded mode has room to show what an item-use tooltip's count actually gains; compact/page
// mode just get the bare "Amount of X" phrasing. Checked against the live DOM (not viewState)
// since achievements content re-renders on every mode toggle anyway (see achRefreshPageDom callers).
function achIsExpandedMode() {
    const p = document.getElementById('bbgl-panel');
    return !!(p && p.classList.contains('bbgl-expanded'));
}

// "Xanax OD" -> "Xanax Overdoses", etc. — every OD item's ITEM_LOG_META label ends in " OD".
function achOdLabel(label) {
    return label.replace(/ OD$/, ' Overdoses');
}

function achFmtGainsLine(g) {
    const ORDER = ['str', 'def', 'spd', 'dex'];
    return ORDER.filter(k => g && g[k] > 0).map(k => achStatAbbr(k) + ': +' + achFmtGain(g[k])).join('\n    ');
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
    const line1 = indent + STAT_FULL[stat] + ': +' + Formatter.number(rec.value) + (baStr ? ' | ' + baStr : '');
    const line2 = indent + '  ' + dateStr;
    return line1 + '\n' + line2;
}

function handleAchCopy(el) {
    if (el.closest && el.closest('.bbgl-ach-section-energy')) {
        const row = el.closest('.bbgl-ach-enh-row');
        const title = el.closest('.bbgl-ach-section-title');
        if (title) {
            const clip = title.getAttribute('data-clip-section');
            const clipTitle = title.getAttribute('data-clip-title') || 'Endocrine Enhancers';
            if (clip) {
                const txt = '👑BBGL Achievements\n\n— ' + clipTitle + ' —\n' + clip;
                const cols = el.closest('.bbgl-ach-section-energy').querySelector('.bbgl-ach-cols');
                navigator.clipboard.writeText(txt).then(() => flashCopied(cols || el.closest('.bbgl-ach-section-energy')));
            }
            return;
        }
        if (row) {
            const clip = row.getAttribute('data-clip');
            if (clip) { navigator.clipboard.writeText('👑BBGL Achievements\n\n' + clip).then(() => flashCopied(row)); }
        }
        return;
    }
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
            const hasAny = ['best-train', 'best-day', 'best-week', 'best-month'].some(mkey => (r.perStatBest[PS_MAP_L[mkey]] || {})[sk]);
            if (hasAny) {
                const blocks = ['best-train', 'best-day', 'best-week', 'best-month'].map(mkey => {
                    const block = achFmtStatBlock(mkey, (r.perStatBest[PS_MAP_L[mkey]] || {})[sk], sk, I);
                    return TITLE_MAP_L[mkey] + ':' + (block ? NL + block : ' +0');
                });
                txt = achClipSection(H, 'Greatest Gains (' + achStatFull(sk) + ')', blocks);
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
            txt = H + NL + NL + TITLE_MAP[key] + ':' + NL + block;
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
                    len = ent[1] || 0,
                    g = ent[2],
                    st = ent[3],
                    en = ent[4];
                const v = stat === 'total' ? ['str', 'def', 'spd', 'dex'].reduce((a, k) => a + (g[k] || 0), 0) : (g[stat] || 0);
                txt = H + NL + NL + label + ' — ' + SF[stat] + ': ' + len + (len === 1 ? ' Day' : ' Days') + NL + I + SF[stat] + ': +' + Formatter.number(v) + (st && en ? NL + I + Formatter.datePretty(st) + ' – ' + Formatter.datePretty(en) : '');
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
                txt = H + NL + NL + label + ' — ' + HHSF[stat] + ': +' + achFmtGain(v) + NL + achHJClipDate(rec);
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
            if (!rec || !rec.stats) return ' +0';
            const tr = GSTS.filter(sk => (rec.stats[sk] || 0) > 0);
            const pts = tr.map(sk => achStatAbbr(sk) + ': +' + achFmtGain(rec.stats[sk]));
            pts.push('Total: +' + achFmtGain(rec.value));
            return NL + I + pts.join(NL + I) + NL + achHJClipDate(rec);
        };
        if (gKey === 'happy-jumps-group') {
            txt = H + NL + NL + 'Happy Jumps Performed: ' + (r.happyJumps || 0) + NL + 'Best Happy Jump:' + fmtJ(r.bestHappyJump && r.bestHappyJump.total);
            flashEl = Array.from(el.children);
        }
    } else if (el.classList.contains('bbgl-ach-section-title') || el.classList.contains('bbgl-ach-subsection-title')) {
        const sec = el.getAttribute('data-ach-section'),
            r = cache,
            title = el.getAttribute('data-clip-title') || '';
        const gain = (label, rec, getBA, getDate) => {
            if (!rec) return label + ': +0';
            const ba = getBA(rec),
                baStr = achFmtBA(ba);
            const line1 = label + ': ' + achStatFull(rec.stat) + ' +' + Formatter.number(rec.value) + (baStr ? ' | ' + baStr : '');
            return line1 + NL + I + getDate(rec);
        };
        const eRow = (label, rec, getDate) => !rec ? label + ': 0 E' : label + ': ' + Formatter.number(rec.value) + ' E' + NL + I + getDate(rec);
        const streak = (label, len, gains, start, end) => {
            if (!len) return label + ': 0 Days';
            const gLine = gains ? achFmtGainsLine(gains) : '';
            const tot = gains ? ((gains.str || 0) + (gains.def || 0) + (gains.spd || 0) + (gains.dex || 0)) : 0;
            let s = label + ': ' + len + (len === 1 ? ' Day' : ' Days') + NL;
            if (gLine) s += I + 'Gains:' + NL + '    ' + gLine + NL;
            if (tot) s += I + 'Total Gains: +' + Formatter.number(tot) + NL;
            if (start && end) s += I + Formatter.datePretty(start) + ' \u2013 ' + Formatter.datePretty(end);
            return s;
        };
        let blocks;
        if (sec === 'greatest-gains') {
            const buildMulti = (label, mkey) => {
                const mRecs = (r && r.perStatBest) ? r.perStatBest[PS_MAP[mkey]] : null;
                if (!mRecs) return label + ': +0';
                const mLines = ['str', 'def', 'spd', 'dex'].map(sk => achFmtStatBlock(mkey, mRecs[sk], sk, I)).filter(Boolean);
                if (!mLines.length) return label + ': +0';
                return label + ':' + NL + mLines.join(NL);
            };
            blocks = [buildMulti('Best Train', 'best-train'), buildMulti('Best Day', 'best-day'), buildMulti('Best Week', 'best-week'), buildMulti('Best Month', 'best-month')];
        } else if (sec === 'expended-energy') blocks = [eRow('Best Day', r.mostEInOneDay, rec => Formatter.datePretty(rec.date)), eRow('Best Week', r.mostEInOneWeek, rec => achFmtWeekCopy(rec.weekOf)), eRow('Best Month', r.mostEInOneMonth, rec => rec.month)];
        else if (sec === 'consistency-kept') blocks = [streak('Best Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd), streak('Best Green Streak', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd), streak('Best Gold Streak', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd), 'Consistency: ' + (r.trainingRestRatio || '0') + ' | ' + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Days Trained', 'Happy Jumps: ' + (r.happyJumps || 0)];
        else if (sec === 'sexiest-streaks') blocks = [streak('Best Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd), streak('Best Green Streak', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd), streak('Best Gold Streak', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd), streak('Best Diamond Streak', r.longestDiamondStreak, r.longestDiamondStreakGains, r.longestDiamondStreakStart, r.longestDiamondStreakEnd), 'Consistency: ' + (r.trainingRestRatio || '0') + ' | ' + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Calendar Days Trained'];
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
                txt = H + NL + NL + mTitle + ':' + (mLines.length ? NL + mLines.join(NL) : NL + '+0');
            }
        } else if (key === 'most-e-day' && r.mostEInOneDay) {
            const rec = r.mostEInOneDay;
            txt = H + NL + NL + 'Most Energy Used Training in a Single Day:' + NL + Formatter.number(rec.value) + ' E' + NL + I + Formatter.datePretty(rec.date);
        } else if (key === 'most-e-week' && r.mostEInOneWeek) {
            const rec = r.mostEInOneWeek;
            txt = H + NL + NL + 'Most Energy Used Training in a Single Week:' + NL + Formatter.number(rec.value) + ' E' + NL + I + achFmtWeekCopy(rec.weekOf);
        } else if (key === 'most-e-month' && r.mostEInOneMonth) {
            const rec = r.mostEInOneMonth;
            txt = H + NL + NL + 'Most Energy Used Training in a Single Month:' + NL + Formatter.number(rec.value) + ' E' + NL + I + rec.month;
        } else if (key === 'training-streak' || key === 'green-streak' || key === 'gold-streak' || key === 'diamond-streak') {
            const SK = {
                'training-streak': ['Longest Training Streak', r.longestStreak, r.longestStreakGains, r.longestStreakStart, r.longestStreakEnd],
                'green-streak': ['Longest Green Streak (1,000 E+)', r.longestGoalStreak, r.longestGoalStreakGains, r.longestGoalStreakStart, r.longestGoalStreakEnd],
                'gold-streak': ['Longest Gold Streak (1,500 E+)', r.longestGoldStreak, r.longestGoldStreakGains, r.longestGoldStreakStart, r.longestGoldStreakEnd],
                'diamond-streak': ['Longest Diamond Streak (2,000 E+)', r.longestDiamondStreak, r.longestDiamondStreakGains, r.longestDiamondStreakStart, r.longestDiamondStreakEnd]
            }[key];
            const label = SK[0],
                len = SK[1] || 0,
                gains = SK[2],
                st = SK[3],
                en = SK[4];
            const gLine = gains ? achFmtGainsLine(gains) : '';
            const tot = gains ? ((gains.str || 0) + (gains.def || 0) + (gains.spd || 0) + (gains.dex || 0)) : 0;
            txt = H + NL + NL + label + ': ' + len + (len === 1 ? ' Day' : ' Days');
            if (gLine) txt += NL + I + 'Gains:' + NL + '    ' + gLine;
            if (tot) txt += NL + I + 'Total Gains: +' + Formatter.number(tot);
            if (st && en) txt += NL + I + Formatter.datePretty(st) + ' \u2013 ' + Formatter.datePretty(en);
        } else if (key === 'consistency') {
            txt = H + NL + NL + 'Training Consistency: ' + (r.trainingRestRatio || '0') + NL + (r.trainingDays || 0) + '/' + (r.calDays || 0) + ' Days Trained';
        } else if (key === 'happy-jumps') {
            txt = H + NL + NL + 'Happy Jumps: ' + (r.happyJumps || 0);
        } else if (key === 'green-days') {
            txt = H + NL + NL + 'Green Days: ' + (r.greenDays || 0);
        } else if (key === 'green-weeks') {
            txt = H + NL + NL + 'Green Weeks: ' + (r.greenWeeks || 0);
        } else if (key === 'gold-days') {
            txt = H + NL + NL + 'Gold Days: ' + (r.goldDays || 0);
        } else if (key === 'gold-weeks') {
            txt = H + NL + NL + 'Gold Weeks: ' + (r.goldWeeks || 0);
        } else if (key === 'diamond-days') {
            txt = H + NL + NL + 'Diamond Days: ' + (r.diamondDays || 0);
        } else if (key === 'diamond-weeks') {
            txt = H + NL + NL + 'Diamond Weeks: ' + (r.diamondWeeks || 0);
        } else if (key === 'stickers') {
            txt = H + NL + NL + 'Stickers Unlocked: ' + (r.stickersUnlocked || 0) + '/' + CUSTOM_STICKERS.length;
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
    const statEmoji = { str: '💪', def: '🛡️', spd: '🎯', dex: '🤺' };
    const statNames = { str: 'Strength', def: 'Defense', spd: 'Speed', dex: 'Dexterity' };
    let ds = '';
    if (sl._dailyList && sl._dailyList.length > 1)
        ds = `${Formatter.dateFull(sl._dailyList[0].date)} - ${Formatter.dateFull(sl._dailyList[sl._dailyList.length - 1].date)}`;
    else
        ds = Formatter.dateFull(sl.date);
    const isSingle = keys.length === 1;
    const eCost = isSingle ? s[keys[0]].cost : s.total.cost;
    // The lazy line is reserved for a period that is fully in the past with no training in any stat;
    // anything else (today, or a stat that just wasn't trained) reads as 0 E / +0.
    const lastDate = (sl._dailyList && sl._dailyList.length) ? sl._dailyList[sl._dailyList.length - 1].date : sl.date;
    const isLazy = !(s.total.cost > 0) && !!lastDate && lastDate < Formatter.dateLogical();
    const eTxt = isLazy ? '🛌 I was a lazy POS.' : `⚡${Formatter.number(eCost || 0)} E`;
    const statLines = keys
        .filter(k => isSingle || s[k].gain > 0 || s[k].cost > 0)
        .map(k => `${statEmoji[k]}${statNames[k]}: +${Formatter.achAbbr(s[k].gain, ACH_FMT.gains)} (${Formatter.achAbbr(s[k].start, ACH_FMT.gains)} \u2192 ${Formatter.achAbbr(s[k].end, ACH_FMT.gains)})`);
    return ['👑Big Black Gym Log', '', `${ds} |${eTxt}`, ...statLines].join('\n');
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
            bbglError("Export Error: Local database is inaccessible or empty. Cannot export data.\n\nRecommendation: Please refresh the page and try again. If you are using Private Browsing or have strict storage limits enabled, you may need to disable them for Torn.com to allow the Gym Log to save and export data.");
            return;
        }
    } catch (e) {
        bbglError("Export Error: " + (e.message || "Failed to read local database.") + "\n\nRecommendation: Please refresh the page. Ensure your browser is not blocking local storage for Torn.com.");
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
    DataController.buildProgressionCache();
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
            if (e.energyLost != null) entry.eLost = e.energyLost;
            if (e.happy) entry.happy = e.happy;
            if (e.bookId) entry.book = e.bookId;
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
    // syncFloor is device-local live-sync state (stale/wrong on another device or session), so it
    // is never carried in the export itself — importData() re-seeds it from the imported series'
    // own newest entry instead, which is what actually anchors the first post-import sync at the
    // right seam (06-section-v-logic.js, importData).
    if (exportStorage.meta) delete exportStorage.meta.syncFloor;
    let rankedWars;
    try {
        const warsRaw = localStorage.getItem(KEYS.WARS_DATA);
        if (warsRaw) {
            const wars = JSON.parse(warsRaw);
            const logCutoff = exportStorage.meta && exportStorage.meta.logStartDate ? exportStorage.meta.logStartDate : 0;
            const factionHistory = getFactionHistory();
            rankedWars = Object.entries(wars)
                .filter(([, w]) => w.war && w.war.end && w.war.end >= logCutoff &&
                    wasInFactionDuringWar(factionHistory, w.factionId, w.war.end))
                .map(([id, w]) => ({
                    id,
                    start: w.war && w.war.start,
                    end: w.war && w.war.end,
                    winner: w.war && w.war.winner
                }));
        }
    } catch (e) { /* skip */ }
    let content = JSON.stringify({
        meta: {
            version: SCRIPT_VERSION,
            exportedAt: fmtReadable(now),
            itemTotals,
            ...(rankedWars ? { rankedWars } : {})
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
    } catch (e) { }
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
            const importedVer = (j && j.meta && j.meta.version) ? String(j.meta.version) : '';
            const val = validateImportSchema(j);
            if (!val.ok) {
                if (!silent) bbglError(`Import Failed: ${val.msg}`);
                if (onDone) onDone(false);
                return;
            }
            if (j.storage) {
                j.storage = sanitizeStorageRecord(j.storage);
                if (REWARD_GATE_BELOW_VERSION !== '0.0.0' &&
                    (!importedVer || compareVersions(importedVer, REWARD_GATE_BELOW_VERSION) < 0)) {
                    j.storage.meta.rewardStartDate = Math.floor(Date.now() / 1000);
                    localStorage.setItem(KEYS.REWARD_GATE_VER, REWARD_GATE_BELOW_VERSION);
                }
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
                                if (e.book !== undefined) out.bookId = e.book;
                                return out;
                            }
                        }
                        delete e.at;
                        delete e.loggedAt;
                        return e;
                    });
                    // sanitizeStorageRecord() above ran before this flatten, so its entry pass only
                    // saw day-group wrappers, never the entries inside them. Re-run it now that the
                    // real entries exist — this is what restores `type: 'gym'` on the gym rows the
                    // export format leaves untagged, without which every imported day scores 0 EXP.
                    j.storage.series.forEach(sanitizeEntry);
                }
                const importedMeta = j.storage.meta || {};
                let stickers = importedMeta.stickers || j._s;
                if (typeof stickers === 'string') {
                    try {
                        stickers = JSON.parse(stickers);
                    } catch (e) { }
                }
                if (!stickers) stickers = {};
                j.storage.meta.stickers = stickers;
                // syncFloor is dropped on export (device-local live-sync state, stale on another
                // device/session) — but leaving it unset makes the first post-import sync omit
                // `from=` entirely, and Torn's log endpoint without `from=` is NOT a full-history
                // dump (that's exactly what the Backfill engine exists to page around); it's a
                // recent, effectively row-capped slice. Anything between the import's last entry
                // and that slice's start would silently never get fetched by anything. Anchor every
                // live-sync code (BACKFILL_GROUP_OF's key set — every code TRAIN_CODES/ITEM_CODES/
                // TRAIN_OD_CODES/STAT_LOGS can ever request) to the import's own newest entry, so the
                // next sync's `from=` picks up exactly at the seam instead of guessing wrong or
                // skipping it. Stored raw (no buffer subtracted here) to match advanceFloor's own
                // convention — fromFor() is what always backs off by SYNC_FROM_BUFFER at read time,
                // regardless of how a floor was written; subtracting it here too would just double it.
                const lastTs = j.storage.series.reduce((max, s) => s.ts > max ? s.ts : max, 0);
                if (lastTs > 0) {
                    j.storage.meta.syncFloor = {};
                    Object.keys(BACKFILL_GROUP_OF).forEach(c => { j.storage.meta.syncFloor[c] = lastTs; });
                }
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
                } catch (e) { }
                DataController.invalidate();
                calendarState.selectedData = null;
                calendarState.selectedLabel = null;
                viewState.activeViewLabel = null;
                ok = true;
                if (!silent) renderPanelContent();
                if (!silent) alert("Training Data Imported Successfully.");
            } else if (!silent) bbglError("Error: No valid training data found.");
        } catch (err) {
            if (!silent) bbglError("Error importing file: " + (err.message === "Database not initialized" ? "Database not initialized.\n\nRecommendation: Refresh the page and ensure your browser is not blocking local storage for Torn.com." : "Invalid JSON format."));
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
                bbglError(`Saved API key is no longer valid: ${tornKeyErrorText(data)}\n\nPlease enter a new key to continue.`);
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
            bbglError(MSG_KEY_NETWORK_ERROR);
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
        // Clear Log behaves like a fresh install but must NOT re-prompt onboarding: keep the
        // API key (KEYS.CONFIG) and the 'bbgl_initialized' flag so the welcome screen stays
        // skipped. (privacyAgreed lives in CONFIG and is auto-stamped on boot regardless.)
        const keep = [KEYS.CONFIG, KEYS.STATE, 'bbgl_initialized'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && k.startsWith('bbgl_') && k !== KEYS.STORAGE && !keep.includes(k)) localStorage.removeItem(k);
        }
        sessionStorage.removeItem(KEYS.SESSION_CACHE);
        DataController.invalidate();
        _historyCache = null;
        calendarState.selectedData = null;
        calendarState.selectedLabel = null;
        viewState.activeViewLabel = null;
        runtime.apiCallTotal = 0;
        runtime.stickerSlots = [];
        runtime.careerLevelExp = 0;
        runtime.statTitleE = null;
        runtime._lastLevelExp = undefined;
        runtime._targetLevelExp = undefined;
        runtime._isAnimatingLevel = false;
        renderPanelContent();
        alert("History cleared.");
    }
}
// Wipes local data/config back to a fresh-install state. Called manually from Dev Tools
// and automatically by the WIPE_BELOW_VERSION reset lever in init() (10-section-ix-init.js).
async function factoryReset() {
    await DBManager.clearStorage();
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('bbgl_')) localStorage.removeItem(k);
    }
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
    const _fresh = { apiKey: '', dayStartMode: 'utc', weekStartMode: 'mon', animations: true, buttonLocation: 'both', ratesEnabled: true, bestGym: true, bestGymSpecialist: true, bestGymUnpurchased: true, drugTracker: 'xanax', privacyAgreed: '' };
    ALLOWED_CONFIG_KEYS.forEach(k => { userConfig[k] = _fresh[k] !== undefined ? _fresh[k] : userConfig[k]; });
    saveConfig();
    localStorage.setItem(KEYS.CHANGELOG_NOTIF, '1');
    runtime.wasVersionWiped = true;
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
        } catch (e) { }
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
