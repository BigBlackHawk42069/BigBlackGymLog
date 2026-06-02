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
                sessionStorage.setItem(KEYS.SESSION_CACHE, serializeForSession(_historyCache));
            } else {
                _historyCache = null;
                sessionStorage.removeItem(KEYS.SESSION_CACHE);
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
                hjDaySet = new Set(),
                dHjDaySet = new Set();
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
                        if (cCost >= GAME.DIAMOND_JUMP_E) dHjDaySet.add(d);
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
                hjDaySet,
                dHjDaySet
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
            Object.keys(weekMap).sort().forEach(wk => {
                if (wk > todayWeekKey) return;
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
                const anchorMs = (s.meta.logStartDate + 86400) * 1000;
                const anchorDate = new Date(anchorMs);
                const floor = Formatter.dateISO(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());
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
            allDays.forEach(day => {
                if (day.series && day.series.length > 0) {
                    day.series.forEach(e => {
                        if (e.cost > 0) running[e.stat] = e.rate !== undefined ? e.rate : (e.gain / e.cost) * 150;
                    });
                } else {
                    STAT_KEYS.forEach(k => {
                        const cost = (day.eSpent && day.eSpent[k]) || 0;
                        const gain = day.gains ? (day.gains[k] || 0) : 0;
                        if (cost > 0) running[k] = (gain / cost) * 150;
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
            this._cache.originRates = (h.meta && h.meta.originRates) || {};
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
                        return entry.rate !== undefined ? entry.rate : r2((entry.gain / entry.cost) * 150);
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
            const e = r.meta.totalEnergy;
            const {
                hjDaySet,
                dHjDaySet
            } = this.getHappyJumpData ? this.getHappyJumpData() : {
                hjDaySet: new Set(),
                dHjDaySet: new Set()
            };
            const isHJ = r.date && hjDaySet.has(r.date);
            const isDiamondHJ = r.date && dHjDaySet && dHjDaySet.has(r.date);
            if (e >= 2000 || isDiamondHJ) r.meta.tier = 3;
            else if (e >= 1500) r.meta.tier = 2;
            else if (e >= 1000 || isHJ) r.meta.tier = 1;
            else r.meta.tier = 0;
            return r;
        },
        async processDataPayload(apiLogs, apiBattlestats) {
            let s = getActiveHistory();
            const fullApiLogs = normalizeApiLogs(apiLogs);
            let cleanLogs = fullApiLogs;

            if (cleanLogs.length > 0 && s.meta.logStartDate) {
                const minTs = Math.min(...cleanLogs.map(l => l.ts));
                if (minTs < s.meta.logStartDate) {
                    s.meta.logStartDate = minTs;
                }
            }

            if (!s.meta.logStartDate) {
                if (s.history.length > 0 || (s.today && s.today.lastLogTimestamp > 0)) {
                    const oldestTs = s.history.length > 0 ? Formatter.parse(s.history[0].date).getTime() / 1000 : s.today.lastLogTimestamp;
                    s.meta.logStartDate = oldestTs;
                }
            }
            if (s.meta.logStartDate) {
                cleanLogs = cleanLogs.filter(l => l.ts >= s.meta.logStartDate);
                try {
                    const stored = await DBManager.getStorage();
                    if (stored) {
                        if (stored.series) {
                            if (cleanLogs.length > 0) {
                                const minApiTs = cleanLogs[0].ts;
                                const maxApiTs = cleanLogs[cleanLogs.length - 1].ts;
                                const apiEntries = cleanLogs.map(l => ({
                                    ts: l.ts,
                                    stat: l.stat,
                                    gain: r2(l.gain),
                                    cost: l.cost,
                                    after: r2(l.after)
                                }));
                                const apiTsStatSet = new Set(apiEntries.map(e => `${e.ts}_${e.stat}_${e.after}`));
                                const kept = stored.series.filter(e => e.ts < minApiTs || e.ts > maxApiTs || !apiTsStatSet.has(`${e.ts}_${e.stat}_${e.after}`));
                                stored.series = [...kept, ...apiEntries].sort((a, b) => a.ts - b.ts);
                            }
                        }
                        stored.meta = {
                            ...stored.meta,
                            logStartDate: s.meta.logStartDate,
                            originRates: s.meta.originRates,
                            stickers: stored.meta.stickers || s.meta.stickers || {}
                        };
                        await DBManager.setStorage(stored);
                        const rebuilt = DataController._rebuildFromSeries(stored.series || [], stored.meta.baselineBreakdown || ZERO_BREAKDOWN);
                        _historyCache = {
                            meta: stored.meta,
                            history: rebuilt.history,
                            today: rebuilt.today
                        };
                        sessionStorage.setItem(KEYS.SESSION_CACHE, serializeForSession(_historyCache));
                    }
                } catch (e) {
                    Log.warn('Reconciliation error', e);
                }
                s = getActiveHistory();
            }
            if (!s.meta.logStartDate) this._runGenesis(cleanLogs, apiBattlestats, s);
            else this._runDailyGrind(cleanLogs, apiBattlestats, s);
            const logicalToday = Formatter.dateLogical();
            if (s.today.date !== logicalToday) {
                if (s.today.startTotal > 0 || s.today.gains.total > 0) s.history.push(s.today);
                s.today = initializeDayObject(logicalToday, s.today.endBreakdown);
            }
            if (s.meta.logStartDate) {
                if (!s.meta.originRates) s.meta.originRates = {
                    ...ZERO_BREAKDOWN
                };
                const _anchorStr = Formatter.dateLogical((s.meta.logStartDate + 86400) * 1000);
                STAT_KEYS.forEach(k => {
                    if (!s.meta.originRates[k]) {
                        for (let i = fullApiLogs.length - 1; i >= 0; i--) {
                            const l = fullApiLogs[i];
                            if (l.stat === k && l.cost > 0 && Formatter.dateLogical(l.ts * 1000) < _anchorStr) {
                                s.meta.originRates[k] = (l.gain / l.cost) * 150;
                                break;
                            }
                        }
                        if (!s.meta.originRates[k]) {
                            const oldest = fullApiLogs.find(l => l.stat === k && l.cost > 0);
                            if (oldest) s.meta.originRates[k] = (oldest.gain / oldest.cost) * 150;
                        }
                    }
                });
            }
            this.saveSmartHistory(s);
            window.dispatchEvent(new CustomEvent('bbgl:dataUpdated'));
            return 'SUCCESS';
        },
        saveSmartHistory(d) {
            const seen = new Set();
            const allSeries = [];
            const allDays = [...(d.history || [])];
            if (d.today) {
                allDays.push(d.today);
            }
            allDays.forEach(day => {
                if (day.series) {
                    day.series.forEach(e => {
                        const key = `${e.ts}_${e.stat}_${e.after}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            allSeries.push(e);
                        }
                    });
                }
            });
            allSeries.sort((a, b) => a.ts - b.ts);
            const stored = {
                meta: d.meta,
                series: allSeries
            };
            DBManager.setStorage(stored);
            sessionStorage.removeItem(KEYS.SESSION_CACHE);
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
                            synthetic: true
                        });
                    });
                }
            });
            return all.sort((a, b) => a.ts - b.ts);
        },
        _runGenesis(logs, bs, s) {
            const allLogs = [...logs].sort((a, b) => a.ts - b.ts);
            let validLogs;
            let anchorDay = null;
            if (allLogs.length > 0) {
                const statOldest = {};
                STAT_KEYS.forEach(k => {
                    const first = allLogs.find(l => l.stat === k);
                    if (first) statOldest[k] = first.ts;
                });
                const trainedStats = Object.keys(statOldest);
                if (trainedStats.length > 0) {
                    const anchorTs = Math.max(...trainedStats.map(k => statOldest[k]));
                    anchorDay = Formatter.dateLogical(anchorTs * 1000);
                    validLogs = allLogs.filter(l => Formatter.dateLogical(l.ts * 1000) >= anchorDay);
                } else {
                    validLogs = allLogs;
                }
            } else {
                validLogs = [];
            }
            if (!s.meta.originRates) s.meta.originRates = {
                ...ZERO_BREAKDOWN
            };
            STAT_KEYS.forEach(k => {
                for (let i = allLogs.length - 1; i >= 0; i--) {
                    const l = allLogs[i];
                    if (l.stat === k && l.cost > 0 && (!anchorDay || Formatter.dateLogical(l.ts * 1000) < anchorDay)) {
                        s.meta.originRates[k] = (l.gain / l.cost) * 150;
                        break;
                    }
                }
            });
            const currentStats = bs ? {
                str: bs.strength,
                def: bs.defense,
                spd: bs.speed,
                dex: bs.dexterity
            } : {
                ...ZERO_BREAKDOWN
            };
            let totalGains = {
                ...ZERO_BREAKDOWN
            };
            validLogs.forEach(l => totalGains[l.stat] += l.gain);
            let logStartTs;
            if (anchorDay) {
                const anchorDayMs = Formatter.parse(anchorDay).getTime();
                logStartTs = Math.floor((anchorDayMs - 86400000) / 1000);
            } else {
                logStartTs = validLogs.length > 0 ? validLogs[0].ts : Math.floor(Date.now() / 1000);
            }
            s.meta.logStartDate = logStartTs;
            const _br = {
                str: currentStats.str - totalGains.str,
                def: currentStats.def - totalGains.def,
                spd: currentStats.spd - totalGains.spd,
                dex: currentStats.dex - totalGains.dex
            };
            s.meta.baselineBreakdown = _br;
            let runningBreakdown = {
                ..._br
            };
            const startDayStr = anchorDay || Formatter.dateLogical(validLogs.length > 0 ? validLogs[0].ts * 1000 : Date.now());
            s.today = initializeDayObject(startDayStr, runningBreakdown);
            validLogs.forEach(l => {
                this._applyLogToState(l, s);
                runningBreakdown[l.stat] = l.after;
            });
            if (anchorDay) {
                const bufferLogs = allLogs.filter(l => {
                    const d = Formatter.dateLogical(l.ts * 1000);
                    return d < anchorDay && l.ts >= logStartTs;
                });
                if (bufferLogs.length > 0) {
                    const bufDay = initializeDayObject(Formatter.dateLogical(bufferLogs[0].ts * 1000), {
                        ...ZERO_BREAKDOWN
                    });
                    bufferLogs.forEach(l => bufDay.series.push({
                        ts: l.ts,
                        stat: l.stat,
                        gain: l.gain,
                        cost: l.cost,
                        after: l.after
                    }));
                    s.history.unshift(bufDay);
                }
            }
            if (bs) this._snapToBattlestats(bs, s);
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
                if (s.today.startTotal > 0 || s.today.gains.total > 0) s.history.push(s.today);
                s.today = initializeDayObject(logDate, s.today.endBreakdown);
            }
            s.today.gains[l.stat] += l.gain;
            s.today.gains.total += l.gain;
            s.today.eSpent[l.stat] += l.cost;
            s.today.eSpent.total += l.cost;
            s.today.endBreakdown[l.stat] = l.after;
            if (l.ts > s.today.lastLogTimestamp) s.today.lastLogTimestamp = l.ts;
            s.today.series.push({
                ts: l.ts,
                stat: l.stat,
                gain: l.gain,
                cost: l.cost,
                after: l.after
            });
            s.today.endTotal = sumStats(s.today.endBreakdown);
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
        },
        _rebuildFromSeries(seriesArr, baselineBreakdown) {
            const days = {};
            let running = {
                ...baselineBreakdown
            };
            seriesArr.forEach(e => {
                const dateKey = Formatter.dateLogical(e.ts * 1000);
                if (!days[dateKey]) days[dateKey] = initializeDayObject(dateKey, {
                    ...running
                });
                days[dateKey].gains[e.stat] += e.gain;
                days[dateKey].gains.total += e.gain;
                days[dateKey].eSpent[e.stat] += e.cost;
                days[dateKey].eSpent.total += e.cost;
                days[dateKey].endBreakdown[e.stat] = e.after;
                if (e.ts > days[dateKey].lastLogTimestamp) days[dateKey].lastLogTimestamp = e.ts;
                if (!e.synthetic) days[dateKey].series.push(e);
                running[e.stat] = e.after;
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
            return {
                history,
                today: todayObj
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
        const logStartDate = Math.floor(Formatter.parse(oldestDate).getTime() / 1000) - 86400;
        const lastRates = {};
        statKeys.forEach(k => {
            const perFiveE = simulationGain(running[k]);
            lastRates[k] = perFiveE * (DEMO_FORMULA_E_BASE / DEMO_E_PER_TRAIN);
        });
        const meta = {
            originRates: {
                ...lastRates
            },
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
        const cached = sessionStorage.getItem(KEYS.SESSION_CACHE);
        if (cached) {
            try {
                _historyCache = JSON.parse(cached);
                return _historyCache;
            } catch (e) {}
        }
        return {
            meta: {
                baselineBreakdown: {
                    ...ZERO_BREAKDOWN
                }
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
            const sn = GAME.STAT_MAP[l.log];
            if (!sn) return null;
            const ab = (sn === 'strength') ? 'str' : (sn === 'defense') ? 'def' : (sn === 'speed') ? 'spd' : 'dex';
            return {
                id: k,
                ts: l.timestamp,
                stat: ab,
                key: sn,
                gain: r2(parseFloat(l.data[`${sn}_increased`] || 0)),
                after: r2(parseFloat(l.data[`${sn}_after`] || 0)),
                cost: parseInt(l.data.energy_used || 0)
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
            },
            bestDJByStat = {
                str: null,
                def: null,
                spd: null,
                dex: null,
                total: null
            };
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
        let happyJumps = 0,
            diamondJumps = 0;
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
            if (cCost >= GAME.DIAMOND_JUMP_E) {
                diamondJumps++;
                ['str', 'def', 'spd', 'dex'].forEach(sk => {
                    const sv = cStatG[sk] || 0;
                    if (sv > 0 && (!bestDJByStat[sk] || sv > bestDJByStat[sk].value)) bestDJByStat[sk] = {
                        value: sv,
                        date: d,
                        ts: cStart,
                        cost: cCost
                    };
                });
                if (tot > 0 && (!bestDJByStat.total || tot > bestDJByStat.total.value)) bestDJByStat.total = {
                    value: tot,
                    date: d,
                    ts: cStart,
                    tsEnd: cEnd,
                    cost: cCost,
                    stats: {
                        ...cStatG
                    }
                };
            }
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
            diamondJumps,
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
            bestDiamondJump: bestDJByStat,
            longestDiamondStreak,
            longestDiamondStreakStart,
            longestDiamondStreakEnd,
            longestDiamondStreakGains
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
            runtime._achCache = computeAchievements(s);
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
        const headerStats = STATS.map(sk => `<div class="ach-stat-header ach-stat-${sk}">${STAT_LABEL[sk]}</div>`).join('');
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
        const djCount = countRow('Diamond Jumps Performed', 'Diamond Jumps', d.diamondJumps || 0, 'dj-count', 'Total number of Diamond Jumps executed (1,750E+ energy used training within a 5-minute window).');
        const djBest = bestRow('Best Diamond Jump', 'Best Diamond', d.bestDiamondJump && d.bestDiamondJump.total, 'best-dj', 'The single Diamond Jump that yielded the highest combined stat gain.');
        const rowsHTML = `<div class="bbgl-ach-hh-group" data-ach-key="happy-jumps-group">${hjCount}${hjBest}</div><div class="bbgl-ach-hh-group" data-ach-key="diamond-jumps-group">${djCount}${djBest}</div>`;
        const clipAll = `Happy Jumps Performed: ${d.happyJumps || 0}\nBest Happy Jump: ${d.bestHappyJump && d.bestHappyJump.total ? (() => { const rec = d.bestHappyJump.total; const trained = STATS.filter(sk => (rec.stats[sk] || 0) > 0); const parts = trained.map(sk => STAT_ABBR[sk] + ': +' + achFmtGain(rec.stats[sk])); parts.push('Total: +' + achFmtGain(rec.value)); return parts.join(' | '); })() : '—'}\nDiamond Jumps Performed: ${d.diamondJumps || 0}\nBest Diamond Jump: ${d.bestDiamondJump && d.bestDiamondJump.total ? (() => { const rec = d.bestDiamondJump.total; const trained = STATS.filter(sk => (rec.stats[sk] || 0) > 0); const parts = trained.map(sk => STAT_ABBR[sk] + ': +' + achFmtGain(rec.stats[sk])); parts.push('Total: +' + achFmtGain(rec.value)); return parts.join(' | '); })() : '—'}`;
        return `<div class="bbgl-ach-section bbgl-ach-section-hh"><div class="bbgl-ach-section-title" data-ach-section="happy-hopping" data-clip-section="${achEsc(clipAll)}" data-clip-title="Happy Hopping" data-tooltip="Click any stat or row to copy its data, or click this title to copy the entire section to your clipboard.">HAPPY HOPPING</div>${rowsHTML}</div>`;
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
        if (el.classList.contains('bbgl-ach-stat-cell')) {
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
            } else if (key === 'best-hj' || key === 'best-dj') {
                const isHJ = key === 'best-hj';
                const rec = isHJ ? (cache && cache.bestHappyJump && cache.bestHappyJump.total) : (cache && cache.bestDiamondJump && cache.bestDiamondJump.total);
                const label = isHJ ? 'Best Happy Jump' : 'Best Diamond Jump';
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
            } else if (gKey === 'diamond-jumps-group') {
                txt = H + NL + 'Diamond Jumps Performed: ' + (r.diamondJumps || 0) + NL + 'Best Diamond Jump: ' + fmtJ(r.bestDiamondJump && r.bestDiamondJump.total);
                flashEl = Array.from(el.children);
            }
        } else if (el.classList.contains('bbgl-ach-section-title')) {
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
                    const _cells = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-stat-cell')).filter(c => !c.querySelector('.ach-null')) : [];
                    flashEl = _cells.length ? _cells : el;
                } else if (sec === 'sexiest-streaks') {
                    const arr = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row-multi')) : [];
                    flashEl = arr.length ? arr : el;
                } else if (sec === 'rewards-reaped') {
                    const _rows = _sec ? Array.from(_sec.querySelectorAll('.bbgl-ach-row')) : [];
                    flashEl = _rows.length ? _rows : el;
                } else {
                    flashEl = el;
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
        const _flashEls = Array.isArray(flashEl) ? flashEl : [flashEl];
        navigator.clipboard.writeText(txt).then(() => {
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
        });
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
        (exportStorage.series || []).forEach(e => {
            if (typeof e.gain === 'number') e.gain = r2(e.gain);
            if (typeof e.after === 'number') e.after = r2(e.after);
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
                if (k === 'privacyAgreed' && userConfig[k]) {
                    try {
                        cleanCfg[k] = fmtReadable(new Date(userConfig[k]));
                    } catch (e) {
                        cleanCfg[k] = userConfig[k];
                    }
                } else {
                    cleanCfg[k] = userConfig[k];
                }
            }
        });
        const stickers = exportStorage?.meta?.stickers;
        if (exportStorage.meta) delete exportStorage.meta.stickers;
        let content = JSON.stringify({
            meta: {
                version: SCRIPT_VERSION,
                exportedAt: fmtReadable(now)
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
                        j.storage.series = j.storage.series.flatMap(d => (d.entries || []).filter(e => typeof e === 'object' && e !== null)).reverse();
                        j.storage.series.forEach(e => {
                            delete e.at;
                            delete e.loggedAt;
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
                    sessionStorage.setItem(KEYS.SESSION_CACHE, serializeForSession(_historyCache));
                    if (j.config && typeof j.config === 'object') {
                        ALLOWED_CONFIG_KEYS.forEach(k => {
                            if (j.config[k] !== undefined) userConfig[k] = j.config[k];
                        });
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
                result.gyms[id] = {
                    id: id,
                    btn: btn,
                    locked: locked,
                    active: active
                };
                if (active) result.active = id;
            });
            return result;
        },
        bestGymFor(stat, scan) {
            const tiers = GYM_TIERS[stat];
            if (!tiers) return null;
            const allowSpec = userConfig.bestGymSpecialist;
            let bestId = null,
                bestRank = -1;
            Object.keys(scan.gyms).forEach((key) => {
                const gym = scan.gyms[key];
                if (gym.locked) return;
                if (!allowSpec && gym.id >= 25) return;
                const rank = tiers.indexOf(gym.id);
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

