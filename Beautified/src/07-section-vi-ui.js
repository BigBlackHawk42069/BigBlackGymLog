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
        c.style.setProperty('--bg-url', 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Calendar%20Grid%20-%20Future.jpg)');
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
                if (isArch) rd.style.setProperty('--bg-url', 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Calendar%20Grid%20-%20Past.jpg)');
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
            let url = 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Calendar%20Grid%20-%20Past%20Green.jpg)';
            if (sl.meta.tier === 2) url = 'url(https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Calendar%20Grid%20-%20Past%20Gold.jpg)';
            else if (sl.meta.tier === 3) url = 'url(https://github.com/BigBlackHawk42069/asdfaskijdnfawef/blob/main/CalendarGrid-DiamondPast.jpg?raw=true&v=4)';
            cell.style.backgroundImage = url;
            cell.style.backgroundSize = "700% 600%";
            cell.style.backgroundPosition = `${(cIdx * (100 / 6)).toFixed(4)}% ${(rIdx * (100 / 5)).toFixed(4)}%`;
        }
        if (!isFlipped && sl.meta.tier > 0) {
            const wrap = document.createElement('div'),
                img = document.createElement('img'),
                sh = document.createElement('div');
            let tType = 'green',
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Green%20Jewels%20-%20New.png';
            if (sl.meta.tier === 2) {
                tType = 'gold';
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Gold%20Bars.png';
            } else if (sl.meta.tier === 3) {
                tType = 'diamond';
                url = 'https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/main/Diamonds.png';
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

        let firstOccupiedLeft = (pctDiamond > 0) ? dLeft : goLeft;
        if (pctGreen > firstOccupiedLeft) pctGreen = firstOccupiedLeft;
        
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
                `${refills}/${DataController.periodCalendarDays(sl)}`;
            const refillTip = `<div style="text-align:center">Refills Used` + (!isDay ? `<br><span class="tt-sub">(Refills/Days)</span>` : ``) + `</div>`;
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
    const PRIVACY_TEXT = {
        DISCLOSURE: `<strong>What API Key is Needed?</strong><p>Since the Torn API lacks a direct endpoint for training energy (E), this script requires an API key with log and battlestats access to read your training records. This is the only way to accurately calculate your energy spent. Without this level of access, the script&rsquo;s core mechanics would not be possible.</p><strong>API Call Frequency &amp; Limits</strong><p>This script makes <strong>1 call</strong> when you click Train, and a <strong>3-call reconciliation</strong> in three situations: when you leave the gym after a session, when you tap the manual Refresh button, and automatically in the background &mdash; no sooner than 2 hours after the last sync of any kind.</p><p>An optional <strong>Backfill</strong> feature is also available to import your full historical training data. Tapping the Backfill button opens a dedicated screen that fully explains how that process works and requires your explicit agreement before any scan begins.</p><strong>How Your Data Is Handled</strong><p>When accessing logs, this script only retrieves the specific training data for each stat &mdash; no other logs are read. All data retrieved from your API key is <strong>processed locally within your browser</strong>. This script <strong>does not transmit, store, or share your data externally</strong> in any way. I, as the developer, do not have access to your logs, API data, or any information generated by your use of this script.</p><strong>Transparency &amp; Verification</strong><p>For full transparency, you can verify how your data is handled by reviewing the script's source code. Specifically, you can search for the section titled "THE CHECK-IN COUNTER," which clearly shows how and where data is processed. This allows you to independently confirm that all data remains on your device.</p>`,
        ACK_INTRO: `<div style="padding:0 0 8px 0; color:#bbb; font-size:12px;">By using this script, you acknowledge and agree to the following:</div>`,
        ACK_ITEMS: ["I understand that this script requires full log access solely due to limitations in Torn's API.", "I understand this script's API usage and that it is designed to stay well within Torn's rate limits.", "I understand that all data is processed and stored locally within my own browser, and is never transmitted, stored externally, or accessible to the developer.", "I understand that I can verify these claims by reviewing the script's source code, specifically the \"THE CHECK-IN COUNTER\" section.", "I understand I can use Demo mode to test the script before registering any API Key or agreeing to this disclosure."]
    };

    function buildPrivacyModalHTML(reviewMode) {
        const ackRows = PRIVACY_TEXT.ACK_ITEMS.map((txt, i) => {
                const ctrl = reviewMode ? `<span class="bbgl-ack-check">${ICONS.CHECK}</span>` : `<input type="checkbox" id="bbgl-ack-${i + 1}">`,
                    label = reviewMode ? `<span>${txt}</span>` : `<label for="bbgl-ack-${i + 1}">${txt}</label>`;
                return `<div class="bbgl-ack-row">${ctrl}${label}</div>`;
            }).join(''),
            discSection = buildSection('Privacy Disclosure', `<div class="bbgl-modal-scrollbox">${PRIVACY_TEXT.DISCLOSURE}</div>`, 'margin-bottom:5px;'),
            ackSection = buildSection('User Acknowledgement', `<div class="bbgl-modal-scrollbox">${PRIVACY_TEXT.ACK_INTRO}${ackRows}</div>`, 'margin-bottom:8px;'),
            footer = reviewMode ? '' : `<div style="display:flex; margin:0 10px 4px 10px;">${buildButton('bbgl-privacy-demo-btn', 'DEMO', 'purple', 'flex:2; border-radius:4px 0 0 4px; margin:0;')}<span class="bbgl-agree-wrap" style="flex:1; display:flex;" data-tooltip="${TOOLTIPS.AGREE_GATE}">${buildButton('bbgl-privacy-agree-btn', 'AGREE', 'green', 'flex:1; border-radius:0 4px 4px 0; margin:0;')}</span></div>`;
        return `<div class="bbgl-modal-overlay" id="bbgl-privacy-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-privacy-close" title="Close">${ICONS.CLOSE}</div>${discSection}${ackSection}${footer}</div></div>`;
    }

    function closePrivacyModal() {
        const m = document.getElementById('bbgl-privacy-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function buildChangelogModalHTML() {
        const B = `<div style="display:flex; align-items:flex-start; margin-bottom:7px;"><span style="flex-shrink:0; width:2px; height:22px; background:rgba(160,100,255,0.45); border-radius:1px; margin-right:8px; margin-top:3px;"></span><span>`;
        const BE = `</span></div>`;
        const A = (t) => `<span style="color:#666; font-style:italic;">${t}</span>`;
        const changelogSection = buildSection('BBGL Test Phase Changelog', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:250px;"><div style="font-family:Arial,sans-serif; font-size:12px; color:#ccc; line-height:1.7;"><div style="background:rgba(255,200,0,0.07); border:1px solid rgba(255,200,0,0.2); border-radius:4px; padding:6px 9px; margin-bottom:20px; font-size:11px; color:#c8a800; font-style:italic;">&#9888; This changelog will be wiped upon final release.</div><div style="display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 12px;"><h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; color: #fff; letter-spacing: 0.5px; text-align: center;">Big Black Gym Log <span style="background: #4a1070; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 13px; vertical-align: middle; margin-left: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);">v0.9.50</span></h2><div style="font-size: 11px; color: #888; margin-top: 4px; font-style: italic; text-align: center;">Released: 2026-05-13</div></div><hr style="border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin: 16px 0;"><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">NEW FEATURES</div><div style="margin-bottom:20px;">${B}<strong>Achievements Dashboard</strong>: Added a brand new, dedicated Achievements page to enhance training satisfaction. Track long-term milestones, record-breaking gains, total energy expenditure, and consistency streaks. A summary of 'Rewards Reaped' is also available, including total happy jumps and stickers unlocked, all showcased in a beautiful, premium interface.${BE}${B}<strong>Happy Jump Rewards</strong>: High-energy "happy jumpers" can now complete and gold the weekly bar without needing 5 standard training days. A happy jump day now fills 50% of the weekly bar, meaning just 2 happy jumps will complete the bar and unlock a sticker. Three or more happy jumps will automatically earn a gold week and 2 stickers.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">IMPROVEMENTS</div><div style="margin-bottom:20px;">${B}Improved the graph UI to allow tighter value ranges, making stat growth slopes appear steeper and more visually rewarding ${A("(So Wulfie can feel like he actually does something)")}.${BE}${B}Refined the entire interface to ensure a seamless, fluid experience across all devices. Whether on desktop or mobile, the log will automatically scale to look fantastic on any screen size.${BE}${B}The Gym Log sidebar button and footer tab now load instantly alongside the page, removing any visual pop-in to improve the premium feel of the tool.${BE}${B}Centered the Gym Log icon perfectly in the notes footer tab for a cleaner, more aligned look.${BE}${B}Optimized the engine under the hood to ensure the script runs incredibly smoothly, leaving absolutely no perceptible impact on browsing speed.${BE}${B}Added a branded debug console to help troubleshoot issues more effectively whenever support is needed.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">BUG FIXES</div><div style="margin-bottom:20px;">${B}Repaired the sidebar and footer tab button and future-proofed it by not relying on Torn's changing hash names.${BE}${B}Fixed unstable graph rendering when opening the graph view. Issues like the plot shifting right, extreme text scaling, blank charts, and x-axis labels falling off-screen have been completely resolved.${BE}</div><div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1); margin: 32px 0 24px 0;"></div><div style="display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 12px;"><h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; color: #fff; letter-spacing: 0.5px; text-align: center;">Big Black Gym Log <span style="background: #4a1070; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 13px; vertical-align: middle; margin-left: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);">v0.9.21</span></h2><div style="font-size: 11px; color: #888; margin-top: 4px; font-style: italic; text-align: center;">Released: May 5, 2026</div></div><hr style="border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin: 16px 0;"><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">NEW FEATURES</div><div style="margin-bottom:20px;">${B}<strong>Graph Projection Overhaul</strong>: Completely re-engineered the graphing system to use a precise, sectional layout that clearly defines the start and end of each data bucket. Includes a new dynamic All-Time view that intelligently scales with your log, keeping your entire training history visible and detailed for years to come.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">IMPROVEMENTS</div><div style="margin-bottom:20px;">${B}Redesigned the "Copy Session Data" output with a clean, emoji-rich vertical format optimized for readability when sharing to Torn chat, Discord, etc.${BE}${B}Refined the log export structure to produce significantly smaller files that are much more readable when reviewed manually.${BE}${B}Upgraded the view-toggle icons to use high-contrast white styling with an active-state glow and scale effect to ensure clear visibility across all backgrounds ${A("(Addressing Svegarn's feedback)")}.${BE}${B}Precision-tuned the rate bridging across all time periods so the starting rate for any Week, Month, or Year view now picks up exactly where the previous period ended, rather than from an average.${BE}${B}Implemented a new "Thin-Cache" storage architecture and hardened the database engine to reduce the script's memory footprint and ensure perfectly reconciled history, which should also eliminate occasional "blank calendar" issues on refresh ${A("(Addressing Finniebal's feedback)")}.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">BUG FIXES</div><div style="margin-bottom:20px;">${B}Fixed an issue where rapid multi-clicking the Train button could result in skipped log entries; every session is now captured with full accuracy ${A("(Discovered by Svegarn)")}.${BE}</div><div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1); margin: 32px 0 24px 0;"></div><div style="display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 12px;"><h2 style="margin: 0; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; color: #fff; letter-spacing: 0.5px; text-align: center;">Big Black Gym Log <span style="background: #4a1070; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 13px; vertical-align: middle; margin-left: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);">v0.9.10</span></h2><div style="font-size: 11px; color: #888; margin-top: 4px; font-style: italic; text-align: center;">Released: April 25, 2026</div></div><hr style="border: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); margin: 16px 0;"><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">NEW FEATURES</div><div style="margin-bottom:20px;">${B}Added a Changelog Modal.${BE}${B}Added a Sponsorship Sticker Page for future supporters of the script.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">IMPROVEMENTS</div><div style="margin-bottom:20px;">${B}Improved mobile battlestat navigation by replacing static snapshot tooltips with a tap-and-hold scrubbing interaction, preserving full functionality without obstructing the calendar view. ${A("(Addressing LatinoBull&rsquo;s feedback)")}${BE}${B}Improved clarity for exiting Demo Mode with better visual cues. ${A("(Addressing Svegarn&rsquo;s feedback)")}${BE}${B}Added a tooltip to the footer icon while in page mode informing users of limited panel functionality. ${A("(Addressing Svegarn&rsquo;s feedback)")}${BE}${B}Improved data integrity with proactive integrity checks and more informative error messages.${BE}${B}Improved error messaging to provide clearer, more descriptive codes during malfunctions. ${A("(Because Wulfie is a Boomer)")}${BE}${B}Added additional error messaging across sync and storage operations to improve troubleshooting.${BE}</div><div style="font-weight:700; color:#fff; font-size:13px; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:6px;">BUG FIXES</div><div>${B}Fixed ledger rate continuity so starting rates for a new day correctly match the ending rates of the previous day.${BE}${B}Fixed image asset loading failures for users in the UK and internationally. ${A("(Addressing DonCorleone and ApexJP&rsquo;s reports)")}${BE}${B}Fixed the expanded panel compress/expand toggle icon not rendering correctly.${BE}${B}Fixed a critical data merge bug that caused errors or data corruption when importing a log with gaps in history.${BE}</div></div></div>`, 'margin-bottom:8px;');
        return `<div class="bbgl-modal-overlay" id="bbgl-changelog-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-changelog-close" title="Close">${ICONS.CLOSE}</div>${changelogSection}</div></div>`;
    }

    function closeChangelogModal() {
        const m = document.getElementById('bbgl-changelog-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function openChangelogModal() {
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

    const BACKFILL_TEXT = {
        DISCLOSURE: `<strong>What the Backfill Does</strong><p>The Big Black Log Backfill walks your Torn activity log backward in time, one window at a time, rebuilding your full training history from today all the way to the very beginning of your account. It only ever reads gym training and the specific item logs this script tracks. Nothing else.</p><strong>Torn's Cloud Limit</strong><p>Torn caps activity-log reads at <strong>50,000 rows per day</strong>, and that pool is shared across every script running against the same user ID and API key. The backfill limits itself to <strong>30,000 rows per run</strong>, with an enforced cap to back that up. The remaining <strong>20,000 rows</strong> is well above what multiple active scripts need over many days of normal use. This level of consumption only ever occurs during the initial backfill. Once your log is fully built out, this script's routine sync calls are lightweight by comparison and will never come close to this threshold again.</p><strong>How Fast It Calls</strong><p>The Torn API allows roughly <strong>100 calls per minute</strong>. To stay safely under that, the backfill deliberately paces itself at about one call every 0.7 seconds (~85/min). This, by design, trades speed for safety.</p><strong>It Runs in the Background</strong><p>Once started, the scan runs in the background. You can keep using the panel and the rest of Torn and check back on progress whenever you like. While a backfill is running, this script's other API calls are <strong>automatically paused</strong> so the scan owns the daily pool and no rate-limit errors occur. They resume on their own once the scan finishes.</p><strong>Large Logs May Take Several Days</strong><p>If your history is very large, a single run will hit the daily row limit before reaching the beginning. That is normal. The scan saves its progress, cools down for ~24 hours, and you simply <strong>resume it the next day</strong>, repeating until the whole log is backfilled.</p><strong>Partial Scans Are Still Complete</strong><p>If a run only reaches part of the way back, the data it did retrieve is <strong>100% complete for that span</strong>. Backfilled days are only shown once fully populated, so you never see a half-filled day. Just a smaller, fully accurate window that grows each time you resume.</p>`
    };

    function buildBackfillModalHTML() {
        const agreeRow = `<div class="bbgl-ack-row" style="margin-top:10px;"><input type="checkbox" id="bbgl-backfill-agree"><label for="bbgl-backfill-agree">I understand what the Backfill does, how it uses my API key, and what to expect.</label></div>`,
            infoSection = buildSection('Big Black Dicslosure', `<div class="bbgl-modal-scrollbox">${BACKFILL_TEXT.DISCLOSURE}${agreeRow}</div>`, 'margin-bottom:5px;'),
            configSection = buildSection('Backfill Configuration', `<div class="bbgl-modal-scrollbox"><div style="padding:20px; text-align:center; color:#888;">Cumming Soon...</div></div>`, 'margin-bottom:8px;'),
            footer = `<div style="display:flex; justify-content:flex-end; margin:0 10px 4px 10px;"><span class="bbgl-agree-wrap" style="flex:0 0 auto; display:inline-flex;" data-tooltip="${TOOLTIPS.BACKFILL_AGREE_GATE}">${buildButton('bbgl-backfill-start-btn', 'Start', 'green', 'margin:0; min-width:96px;')}</span></div>`;
        return `<div class="bbgl-modal-overlay" id="bbgl-backfill-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-backfill-close" title="Close">${ICONS.CLOSE}</div>${infoSection}${configSection}${footer}</div></div>`;
    }

    function closeBackfillModal() {
        const m = document.getElementById('bbgl-backfill-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function openBackfillModal() {
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
    }

    function openPrivacyModal() {
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
        if (reviewMode) return;
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
            closePrivacyModal();
            refreshInitLock();
            const wv = dom.welcomeView;
            if (wv && wv.classList.contains('active-view')) refreshInitMask(wv);
        };
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
        const body = `<div class="bbgl-author-block"><strong>By <a class="bbgl-author-link" href="https://www.torn.com/profiles.php?XID=3550896" target="_blank">BigBlackHawk</a></strong>When it comes to your stats, size matters! So stop guessing and start measuring. Prove to everyone you&rsquo;re a grower and not just a show-er.<br><br>Big Black Gym Log brings high-fidelity graphs and detailed logs to your training routine. Earn fun incentives, track your gains with high precision, and experience a tracking suite built to integrate seamlessly with Torn&rsquo;s native UI.</div><div class="bbgl-author-block" style="margin-top:0;">Please read the privacy disclosure or import an existing log below before continuing.</div>${buildButton('init-privacy-btn', 'PRIVACY DISCLOSURE', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;')}`;
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
        const note = `<div class="bbgl-author-block"><strong>Welcome back!</strong> Reinstalling or setting up on a new device? Skip the setup by importing your existing log below. BBGL is built for seamless cross-device tracking, and your progress will resume automatically if your saved API is still active.</div>`;
        const importBtn = buildButton('init-returning-import-btn', 'IMPORT LOG', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;');
        const hiddenFile = `<input type="file" id="init-import-file" accept=".json,application/json" style="display:none">`;
        return buildSection('Returning User', note + importBtn + hiddenFile, 'margin-bottom:5px;');
    }

    function getWelcomeHTML() {
        const isInit = !!localStorage.getItem('bbgl_initialized') || runtime.demoMode;
        const closeBtn = isInit ? `<div class="close-settings-btn bbgl-close-x" title="Close">${ICONS.CLOSE}</div>` : '';
        return `${closeBtn}<div class="bbgl-settings-scroll-area">${buildWelcomeIntroSection()}${buildWelcomeInitSection()}${buildWelcomeReturningSection()}</div>`;
    }

    function buildSettingsFeaturesSection() {
        const bestGymGroup = buildToggle('set-bestgym-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM}">BB Best Gym</span>`, 'bbgl-bestgym-lead') + buildToggle('set-bestgym-spec-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_SPEC}">Specialty Gyms</span>`, 'bbgl-subgroup-row') + buildToggle('set-bestgym-unpurch-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_UNPURCHASED}">Unpurchased Gyms</span>`, 'bbgl-subgroup-row bbgl-subgroup-row-last');
        const backfillBtn = buildButton('backfill-btn', '<span class="view-std">BB Log Backfill</span><span class="view-exp">Big Black Log Backfill</span>', 'purple', 'margin: 8px 10px 8px 10px; width: calc(100% - 20px); display: block;');
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
