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
                const _or = (h.meta && h.meta.originRates) || {};
                st.forEach(s => {
                    sr[s] = _or[s] || 0;
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
                            ur[s] = e.rate !== undefined ? e.rate : (e.gain / e.cost) * 150;
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
                                rates[s] = e.rate !== undefined ? e.rate : (e.gain / e.cost) * 150;
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
                        if (fLog && fLog.cost > 0) sr[s] = (fLog.gain / fLog.cost) * 150;
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
                                r[s] = e.rate !== undefined ? e.rate : (e.gain / e.cost) * 150;
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
                                        liveRates[s] = e.rate !== undefined ? e.rate : (e.gain / e.cost) * 150;
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
                xParams: xp
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
                const mIdx = calendarState.month,
                    year = calendarState.year || new Date().getUTCFullYear();
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
