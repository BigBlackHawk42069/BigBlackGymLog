    /**
     *  [SECTION II] THE SUPPLEMENTS (Utility Belt)
     *  ========================================================================
     *  Your pre-workout, Xanax, and Creatine all in one section.
     */

    const Formatter = {
        number(n, d = 0) {
            return (n === undefined || n === null) ? '0' : n.toLocaleString('en-US', {
                minimumFractionDigits: d,
                maximumFractionDigits: d
            });
        },
        abbr(n, d = 1, upper = false, strip = false) {
            if (!n && n !== 0) return '0';
            const abs = Math.abs(n);
            if (abs < 1000) return Math.trunc(n).toString();
            const tiers = [
                [1e15, 'q'],
                [1e12, 't'],
                [1e9, 'b'],
                [1e6, 'm'],
                [1e3, 'k']
            ];
            for (const [mag, suffix] of tiers) {
                if (abs >= mag) {
                    let dec = typeof d === 'function' ? d(mag, abs) : d;
                    let s = (n / mag).toFixed(dec);
                    if (strip) s = parseFloat(s).toString();
                    return s + (upper ? suffix.toUpperCase() : suffix);
                }
            }
            return Math.floor(n).toString();
        },
        rate(n, exp = false) {
            if (!n && n !== 0) return '0';
            if (n < 1000) return this.number(n, exp ? 2 : 1);
            if (exp) return this.number(Math.floor(n), 0);
            return this.abbr(n, 1);
        },
        achGain(v) {
            const a = Math.abs(v);
            if (a < 100) return this.number(v, 1);
            if (a < 1000) return this.number(v, 0);
            return this.abbr(v, (m, abs) => m === 1e9 ? 4 : m === 1e6 ? 3 : (abs >= 1e4 ? 2 : 1), true, false);
        },
        ratePct(v) {
            if (Math.abs(v) < 1000) return this.number(v, 0);
            return this.abbr(v, 2, true, true);
        },
        dual(val, r = false) {
            let std, exp;
            if (r) {
                std = this.rate(val, false);
                exp = this.rate(val, true);
            } else {
                std = Math.abs(val) > 9999 ? this.abbr(val) : this.number(val);
                exp = (Math.abs(val) >= 1e9) ? this.abbr(val, 4) : this.number(val);
            }
            return `<span class="view-std">${std}</span><span class="view-exp">${exp}</span>`;
        },
        axis(n) {
            if (n === 0) return '0';
            if (Math.abs(n) < 1000) return (Math.round(n * 10) / 10).toString();
            return this.abbr(n, 1, false, true);
        },
        parse(s) {
            if (!s) return new Date();
            return new Date(s.includes('T') ? s : s + 'T00:00:00Z');
        },
        dateISO(y, m, d) {
            return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        },
        dateLogical(ts = null) {
            const d = ts ? new Date(ts) : new Date();
            return this.dateISO(TimeManager.year(d), TimeManager.month(d), TimeManager.date(d));
        },
        datePretty(s) {
            if (!s || s.includes('Summary')) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
        },
        dateMonthDay(s) {
            if (!s) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
        },
        dateFull(s) {
            if (!s || s.includes('Summary')) return s;
            const p = s.split('-');
            if (p.length !== 3) return s;
            const d = this.parse(s);
            return `${CONSTANTS.MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
        }
    };
    const TooltipController = {
        el: null,
        arrow: null,
        currentTarget: null,
        init() {
            if (this.el) return;
            this.el = document.createElement('div');
            this.el.id = 'bbgl-tooltip';
            this.arrow = document.createElement('div');
            this.arrow.id = 'bbgl-tooltip-arrow';
            this.el.appendChild(this.arrow);
            document.body.appendChild(this.el);
        },
        hide() {
            if (this.el) {
                this.el.style.display = 'none';
                this.currentTarget = null;
            }
        },
        show(html, rect) {
            if (!this.el) this.init();
            this.el.innerHTML = html;
            this.el.appendChild(this.arrow);
            this.el.style.display = 'block';
            this.el.className = '';
            const ttRect = this.el.getBoundingClientRect(),
                pad = 12,
                view = {
                    w: window.innerWidth,
                    h: window.innerHeight
                };
            let side = 'top';
            const fitsTop = (rect.top - ttRect.height - pad >= 0),
                fitsBot = (rect.bottom + ttRect.height + pad <= view.h);
            if (fitsTop) side = 'top';
            else if (fitsBot) side = 'bottom';
            else side = 'left';
            let x = 0,
                y = 0;
            if (side === 'top') {
                x = rect.left + (rect.width / 2) - (ttRect.width / 2);
                y = rect.top - ttRect.height - pad;
            } else if (side === 'bottom') {
                x = rect.left + (rect.width / 2) - (ttRect.width / 2);
                y = rect.bottom + pad;
            } else {
                x = rect.left - ttRect.width - pad;
                y = rect.top + (rect.height / 2) - (ttRect.height / 2);
            }
            if (x < 5) x = 5;
            if (x + ttRect.width > view.w - 5) x = view.w - ttRect.width - 5;
            if (y < 5) y = 5;
            if (y + ttRect.height > view.h - 5) y = view.h - ttRect.height - 5;
            this.el.style.left = x + 'px';
            this.el.style.top = y + 'px';
            this.el.classList.add('pos-' + side);
            this.arrow.style.marginLeft = '';
            this.arrow.style.marginTop = '';
        },
        resolve(target) {
            return target.closest('[data-tooltip], [data-tooltip-html]');
        },
        handleHover(e) {
            const t = this.resolve(e.target);
            if (!t) {
                if (this.currentTarget) this.hide();
                return;
            }
            if (this.currentTarget === t) return;
            this.currentTarget = t;
            const h = t.getAttribute('data-tooltip-html'),
                txt = t.getAttribute('data-tooltip');
            if (h) this.show(h, t.getBoundingClientRect());
            else if (txt) this.show('<div style="text-align:center; color:#ddd;">' + txt + '</div>', t.getBoundingClientRect());
            else this.hide();
        }
    };

    function resetRefreshBtn(btn) {
        if (!btn) return;
        if (btn.dataset.timerId) {
            clearTimeout(btn.dataset.timerId);
            delete btn.dataset.timerId;
        }
        btn.style.color = "";
        btn.style.opacity = "1";
        if (btn.dataset.originalText) {
            btn.innerText = btn.dataset.originalText;
            delete btn.dataset.originalText;
        }
    }

    function checkRefreshCooldown(btn) {
        const now = Date.now();
        while (_refreshClickLog.length > 0 && now - _refreshClickLog[0] > 60000) _refreshClickLog.shift();
        _refreshClickLog.push(now);
        if (_refreshClickLog.length <= 4) return false;
        btn.disabled = true;
        btn.style.opacity = '0.45';
        btn.style.color = '#666';
        if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
        let remaining = Math.ceil((60000 - (now - _refreshClickLog[0])) / 1000);
        const updateTooltip = () => {
            btn.setAttribute('data-tooltip', TOOLTIPS.REFRESH_COOLDOWN(remaining));
        };
        updateTooltip();
        const interval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(interval);
                btn.disabled = false;
                btn.style.opacity = '';
                btn.style.color = '';
                btn.removeAttribute('data-tooltip');
                if (btn.dataset.originalText) {
                    btn.innerText = btn.dataset.originalText;
                    delete btn.dataset.originalText;
                }
                _refreshClickLog.length = 0;
            } else {
                updateTooltip();
            }
        }, 1000);
        return true;
    }

    function incrementApiCount(n) {
        runtime.apiCallTotal += n;
        const hud = dom.apiHud;
        if (hud) hud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
    }

    function saveViewState() {
        if (runtime.isSyncing) return;
        localStorage.setItem(KEYS.STATE, JSON.stringify(viewState));
    }

    function saveConfig() {
        const c = {};
        ALLOWED_CONFIG_KEYS.forEach(k => {
            if (userConfig[k] !== undefined) c[k] = userConfig[k];
        });
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(c));
    }

    function getStickerState(id) {
        const states = (_historyCache && _historyCache.meta && _historyCache.meta.stickers) ? _historyCache.meta.stickers : {};
        return states[String(id)] || '--';
    }
    async function persistStickerCleared(id) {
        try {
            const stored = await DBManager.getStorage();
            if (!stored) return;
            if (!stored.meta) stored.meta = {};
            if (!stored.meta.stickers) stored.meta.stickers = {};
            const key = String(id);
            const cachedState = (_historyCache && _historyCache.meta && _historyCache.meta.stickers && _historyCache.meta.stickers[key]) || '--';
            const newState = cachedState[0] + '+';
            stored.meta.stickers[key] = newState;
            await DBManager.setStorage(stored);
            if (_historyCache) {
                if (!_historyCache.meta) _historyCache.meta = {};
                if (!_historyCache.meta.stickers) _historyCache.meta.stickers = {};
                _historyCache.meta.stickers[key] = newState;
            }
        } catch (e) {
            Log.warn('Failed to persist sticker cleared state', e);
        }
    }

    function getISOWeek(s) {
        const d = Formatter.parse(s),
            date = new Date(d.valueOf());
        date.setUTCDate(date.getUTCDate() + 3 - (date.getUTCDay() + 6) % 7);
        const w1 = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
        return 1 + Math.round(((date.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getUTCDay() + 6) % 7) / 7);
    }

    function computeWeekCompletion(days, hjDaySet = null, hjCount = 0) {
        let totGreen = 0,
            totGold = 0,
            totDiamond = 0;
            
        const jumpGold = hjCount === GAME.GOLD_WEEK_JUMPS;
        const jumpDiamond = hjCount >= GAME.DIAMOND_WEEK_JUMPS;

        days.forEach(d => {
            const e = d.eSpent ? d.eSpent.total : 0;
            const isHJ = hjDaySet ? hjDaySet.has(d.date) : false;

            if (isHJ) {
                let tier = 'GREEN';
                if (e >= 2000) tier = 'DIAMOND';
                else if (e >= 1500) tier = 'GOLD';

                if (jumpDiamond) tier = 'DIAMOND';
                else if (jumpGold && tier === 'GREEN') tier = 'GOLD';

                if (tier === 'DIAMOND') totDiamond += GAME.POINTS_HJ_DIAMOND;
                else if (tier === 'GOLD') totGold += GAME.POINTS_HJ_GOLD;
                else totGreen += GAME.POINTS_HJ_GREEN;
                return;
            }

            let base = 0;
            if (e >= 2000) base = GAME.POINTS_DIAMOND;
            else if (e >= 1500) base = GAME.POINTS_GOLD;
            else if (e >= 1000) base = GAME.POINTS_GREEN;
            
            if (base === 0) return;
            
            if (base === GAME.POINTS_DIAMOND) totDiamond += base;
            else if (base === GAME.POINTS_GOLD) totGold += base;
            else totGreen += base;
        });
        
        const total = totGreen + totGold + totDiamond;
        const goldOrBetter = totGold + totDiamond;
        return {
            isCompleted: total >= GAME.WEEKLY_GOAL,
            isGold: goldOrBetter >= GAME.WEEKLY_GOAL,
            totGreen,
            totGold,
            totDiamond,
            total
        };
    }

<<<<<<< HEAD
    // ─── LEVELING MATH ENGINE ────────────────────────────────────────────────
    // Power 2.5 curve | Floor: 200 EXP | P0 Peak: 1641 EXP
    // Atrophy multipliers: +15% and +30%
    const LEVEL_FLOOR = 200;
    const LEVEL_P0_MAX = 1641;
    const LEVEL_ATRO_MULT = [1, 1.15, 1.30];

    function computeLevelExpCost(level, atrophy) {
        const t = (level - 1) / 98;
        const base = Math.round(LEVEL_FLOOR + (LEVEL_P0_MAX - LEVEL_FLOOR) * Math.pow(t, 2.5));
        return Math.round(base * LEVEL_ATRO_MULT[atrophy]);
    }

    // Pre-compute the total EXP required to finish each atrophy stage.
    const LEVEL_ATRO_BUDGETS = [0, 1, 2].map(a => {
        let s = 0;
        for (let lv = 1; lv <= 99; lv++) s += computeLevelExpCost(lv, a);
        return s;
    });

    function calculateLevelProgress(totalExp) {
        let remaining = totalExp;
        let atrophy = 0;
        for (let a = 0; a < 3; a++) {
            if (remaining < LEVEL_ATRO_BUDGETS[a]) { atrophy = a; break; }
            remaining -= LEVEL_ATRO_BUDGETS[a];
            atrophy = a + 1;
        }
        if (atrophy >= 3) return { atrophy: 2, level: 100, expInLevel: 0, expToNext: 0 };
        let level = 1;
        for (let lv = 1; lv <= 99; lv++) {
            const cost = computeLevelExpCost(lv, atrophy);
            if (remaining < cost) { level = lv; break; }
            remaining -= cost;
            level = lv + 1;
        }
        const expInLevel = level <= 99 ? remaining : 0;
        const expToNext = level <= 99 ? computeLevelExpCost(level, atrophy) : 0;
        return { atrophy, level, expInLevel, expToNext };
    }

    // Real-time daily EXP for the leveling bar (NOT the weekly progress bar).
    // Continuous piecewise rate: 0.2 EXP/E up to Gold (1500E), then 0.6 EXP/E beyond.
    // Reproduces all old milestone totals exactly (200 @ Green, 300 @ Gold, 600 @ Diamond).
    function computeDailyLevelExp(eSpent, hasTrainLog) {
        if (!hasTrainLog) return 0;
        const base  = Math.min(eSpent, 1500) * 0.2;
        const bonus = Math.max(eSpent - 1500, 0) * 0.6;
        return Math.round(base + bonus);
    }
    // ─────────────────────────────────────────────────────────────────────────

=======
>>>>>>> parent of 2089245 (exp system)
    function getWeekKey(dateStr) {
        const d = Formatter.parse(dateStr);
        const dayIdx = d.getUTCDay();
        const offset = userConfig.weekStartMode === 'mon' ? (dayIdx === 0 ? 6 : dayIdx - 1) : dayIdx;
        const weekStart = new Date(d.getTime() - offset * 86400000);
        return Formatter.dateISO(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate());
    }

    // Week-key of the install date (privacyAgreed). Rewards (stickers now, XP later) are only
    // eligible for weeks with key >= this. Respects the user's day-start and week-start modes.
    // Returns null if unknown (no gating) — but init() self-heals privacyAgreed so this is rare.
    function getInstallWeekKey() {
        const ms = userConfig.privacyAgreed ? Date.parse(userConfig.privacyAgreed) : NaN;
        if (isNaN(ms)) return null;
        return getWeekKey(Formatter.dateLogical(ms));
    }

