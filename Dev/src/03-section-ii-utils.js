    /**
     *  [SECTION II] THE SUPPLEMENTS (Utility Belt)
     *  ========================================================================
     *  Your pre-workout, Xanax, and Creatine all in one section.
     */

    // Compares two 'x.y.z'-style version strings numerically, segment by segment
    // (plain string comparison breaks on e.g. "0.9.9" vs "0.9.75"). Returns -1/0/1.
    function compareVersions(a, b) {
        const pa = String(a).split('.').map(Number);
        const pb = String(b).split('.').map(Number);
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
            const na = pa[i] || 0;
            const nb = pb[i] || 0;
            if (na !== nb) return na < nb ? -1 : 1;
        }
        return 0;
    }

    const ACH_FMT = {
        compact:   [[1e6, 2], [1e4, 1]],    // 1m+ = 2dp, 10k+ = 1dp
        gains:     [[1e12, 4], [1e9, 3]],   // 1t+ = 4dp,  1b+ = 3dp
        enhancers: [[1e6, 3], [1e5, 2]],    // 1m+ = 3dp, 100k+ = 2dp
        rewards:   []                        // always full locale
        // sexiest streaks + happy hopping reference ACH_FMT.compact directly
    };

    // Single source of truth for the k/m/b/t/q abbreviation ladder - shared by
    // Formatter.abbr/axis here and by GraphController._calculateNiceScale
    // (08-section-vii-graph.js), which needs the same tier magnitudes to decide
    // gridline spacing.
    const ABBR_TIERS = [
        [1e15, 'q'],
        [1e12, 't'],
        [1e9, 'b'],
        [1e6, 'm'],
        [1e3, 'k']
    ];

    const Formatter = {
        number(n, d = 0) {
            return (n === undefined || n === null) ? '0' : n.toLocaleString('en-US', {
                minimumFractionDigits: d,
                maximumFractionDigits: d
            });
        },
        abbr(n, d = 1, strip = false) {
            if (!n && n !== 0) return '0';
            const abs = Math.abs(n);
            if (abs < 1000) return Math.trunc(n).toString();
            for (const [mag, suffix] of ABBR_TIERS) {
                if (abs >= mag) {
                    let dec = typeof d === 'function' ? d(mag, abs) : d;
                    let s = (n / mag).toFixed(dec);
                    if (strip) s = parseFloat(s).toString();
                    return s + suffix; // always lowercase
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
        achAbbr(n, tiers) {
            if (!tiers || !tiers.length) return this.number(n);
            const abs = Math.abs(n);
            for (const [mag, dec] of tiers) {
                if (abs >= mag) return this.abbr(n, dec);
            }
            return this.number(n);
        },
        achDual(val, expandedTiers = ACH_FMT.compact) {
            const std = this.achAbbr(val, ACH_FMT.compact);
            const exp = this.achAbbr(val, expandedTiers);
            return `<span class="view-std">${std}</span><span class="view-exp">${exp}</span>`;
        },
        ratePct(v) {
            if (Math.abs(v) < 1000) return this.number(v, 0);
            return this.abbr(v, 2, true); // strip=true; lowercase via abbr()
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
        axis(n, forceWhole = false) {
            if (n === 0) return '0';
            if (Math.abs(n) < 1000) return (Math.round(n * 10) / 10).toString();
            if (forceWhole) return this.abbr(n, 0, false, true);
            const abs = Math.abs(n);
            const tier = ABBR_TIERS.find(t => abs >= t[0]);
            if (tier && abs / tier[0] >= 100) {
                // 100+ units of the tier: a tenths decimal is more precision than a gridline
                // needs, but dropping it entirely can hide a real difference between ticks.
                // Round to the nearest half-unit instead - shows ".5" only when the value
                // actually falls there, whole otherwise (102m, 102.5m, 103m).
                const half = Math.round((n / tier[0]) * 2) / 2;
                return (Number.isInteger(half) ? half.toString() : half.toFixed(1)) + tier[1];
            }
            // Under 100 units of the tier (1.0k-99.9k, 1.0m-99.9m, ...), the tenths decimal
            // is the only precision available at that scale, so keep it.
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
    // How long the pointer has to rest on something before its hover effects start — tooltips, the
    // calendar cells' shine/post-it peel/day-number highlight, and the weekly bar's handle/sweep. Fast
    // sweeps across the grid cross each cell in well under this, so they trigger none of that work.
    const HOVER_INTENT_MS = 60;

    // Mouse hover with intent: onIntent runs once the pointer has stayed inside el for HOVER_INTENT_MS;
    // onLeave runs on mouseleave (always, so an effect that never started is simply a no-op to undo).
    function bindHoverIntent(el, onIntent, onLeave) {
        let timer = null;
        el.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                timer = null;
                onIntent();
            }, HOVER_INTENT_MS);
        });
        el.addEventListener('mouseleave', () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            onLeave();
        });
    }

    const TooltipController = {
        el: null,
        arrow: null,
        currentTarget: null,
        // The HTML currently inside the tooltip, so re-showing identical content skips the rebuild.
        _html: null,
        // Measured size per tooltip HTML: { width (the px string written to style.width), w, h, vw }.
        // show() otherwise forces two synchronous layouts per new target just to size the box, and
        // mousing across the calendar/graph revisits the same few tooltips constantly. Only valid
        // for the viewport width it was measured at, and cleared whenever something that feeds the
        // tooltip's size changes (viewport resize, web fonts finishing, --bbgl-tip-title-fs).
        _sizeCache: new Map(),
        clearSizeCache() {
            this._sizeCache.clear();
        },
        init() {
            if (this.el) return;
            this.el = document.createElement('div');
            this.el.id = 'bbgl-tooltip';
            this.arrow = document.createElement('div');
            this.arrow.id = 'bbgl-tooltip-arrow';
            this.el.appendChild(this.arrow);
            document.body.appendChild(this.el);
            window.addEventListener('resize', () => this.clearSizeCache(), { passive: true });
            if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => this.clearSizeCache());
        },
        hide() {
            this._cancelIntent();
            if (this.el) {
                this.el.style.display = 'none';
                this.currentTarget = null;
            }
        },
        show(html, rect, forceSide) {
            if (!this.el) this.init();
            if (this._html !== html) {
                this.el.innerHTML = html;
                this.el.appendChild(this.arrow);
                this._html = html;
            }
            this.el.style.display = 'block';
            this.el.className = '';
            // Stands in for #bbgl-tooltip:has(.bbgl-level-title-tooltip): set before measuring, since
            // those rules size the box. A class is cheaper than a :has() re-check on every content swap.
            if (html.includes('bbgl-level-title-tooltip')) this.el.classList.add('is-level-title');
            const gap = 12,
                edge = 5,
                view = {
                    w: window.innerWidth,
                    h: window.innerHeight
                },
                targetRight = Number.isFinite(rect.right) ? rect.right : rect.left + rect.width;
            let ttRect;
            const cached = this._sizeCache.get(html);
            if (cached && cached.vw === view.w) {
                // Same content at the same viewport width: the same width is written and the size the
                // measurement below would return is reused, so nothing forces a layout here.
                this.el.style.width = cached.width;
                ttRect = { width: cached.w, height: cached.h };
            } else {
                this.el.style.left = '0px';
                this.el.style.top = '0px';
                this.el.style.width = '';
                ttRect = this.el.getBoundingClientRect();
                this.el.style.width = Math.min(Math.ceil(ttRect.width), view.w - edge * 2) + 'px';
                ttRect = this.el.getBoundingClientRect();
                // An image still loading measures smaller than it will render; leave that content
                // uncached so the next show measures it again, exactly as before.
                const pendingImg = Array.prototype.some.call(this.el.querySelectorAll('img'), img => !img.complete);
                if (!pendingImg) {
                    if (this._sizeCache.size >= 300) this._sizeCache.clear();
                    this._sizeCache.set(html, { width: this.el.style.width, w: ttRect.width, h: ttRect.height, vw: view.w });
                }
            }
            const placements = {
                top: {
                    x: rect.left + rect.width / 2 - ttRect.width / 2,
                    y: rect.top - ttRect.height - gap
                },
                bottom: {
                    x: rect.left + rect.width / 2 - ttRect.width / 2,
                    y: rect.bottom + gap
                },
                left: {
                    x: rect.left - ttRect.width - gap,
                    y: rect.top + rect.height / 2 - ttRect.height / 2
                },
                right: {
                    x: targetRight + gap,
                    y: rect.top + rect.height / 2 - ttRect.height / 2
                }
            };
            const fits = p => p.x >= edge && p.y >= edge &&
                p.x + ttRect.width <= view.w - edge &&
                p.y + ttRect.height <= view.h - edge;
            const overflow = p =>
                Math.max(0, edge - p.x) +
                Math.max(0, p.x + ttRect.width - (view.w - edge)) +
                Math.max(0, edge - p.y) +
                Math.max(0, p.y + ttRect.height - (view.h - edge));
            const orders = {
                top: ['top', 'bottom', 'left', 'right'],
                bottom: ['bottom', 'top', 'left', 'right'],
                left: ['left', 'right', 'top', 'bottom'],
                right: ['right', 'left', 'top', 'bottom']
            };
            const preferred = orders[forceSide] ? forceSide : 'top',
                order = orders[preferred];
            let side = order.find(candidate => fits(placements[candidate]));
            if (!side) {
                side = order.reduce((best, candidate) =>
                    overflow(placements[candidate]) < overflow(placements[best]) ? candidate : best
                );
            }
            let { x, y } = placements[side];
            if (!fits(placements[side])) {
                x = Math.max(edge, Math.min(x, view.w - ttRect.width - edge));
                y = Math.max(edge, Math.min(y, view.h - ttRect.height - edge));
            }
            this.el.style.left = x + 'px';
            this.el.style.top = y + 'px';
            this.el.classList.add('pos-' + side);
            this.arrow.style.marginLeft = '';
            this.arrow.style.marginTop = '';
            if (side === 'top' || side === 'bottom') {
                const anchorX = rect.left + rect.width / 2 - x;
                this.arrow.style.left = Math.max(10, Math.min(anchorX, ttRect.width - 10)) + 'px';
                this.arrow.style.top = '';
            } else {
                const anchorY = rect.top + rect.height / 2 - y;
                this.arrow.style.top = Math.max(10, Math.min(anchorY, ttRect.height - 10)) + 'px';
                this.arrow.style.left = '';
            }
        },
        resolve(target) {
            return target.closest('[data-tooltip], [data-tooltip-html]');
        },
        // Day cells defer building their tooltip markup until it's first actually needed: the
        // calendar would otherwise generate ~1.5KB of HTML for all 42 cells on every render to
        // show one at a time (see renderCell). They carry an empty data-tooltip-html placeholder
        // so resolve()'s selector still matches, plus a _bbglTip thunk holding the real builder.
        //
        // Every read of data-tooltip-html must go through here. Reading the attribute directly
        // would see the empty placeholder, treat it as falsy, and fall through to the plain-text
        // branch — which for an interactive day cell means no tooltip at all.
        htmlFor(el) {
            if (!el) return null;
            const h = el.getAttribute('data-tooltip-html');
            if (h) return h;
            if (typeof el._bbglTip === 'function') {
                const built = el._bbglTip();
                el._bbglTip = null;
                el.setAttribute('data-tooltip-html', built);
                return built;
            }
            return h;
        },
        // Presence test for callers that only need to know whether an element has an HTML tooltip,
        // without paying to build a deferred one they aren't going to display.
        hasHtml(el) {
            return !!(el && (el.getAttribute('data-tooltip-html') || typeof el._bbglTip === 'function'));
        },
        // Hover intent (see HOVER_INTENT_MS): a new target's tooltip only appears once the pointer has
        // stayed on it that long. Sweeping across the calendar/ranks page used to rebuild, measure and
        // reposition the tooltip for every element the pointer merely crossed. The tooltip already
        // showing stays up while passing over other targets (no flicker between neighbours), and moving
        // onto nothing still hides it immediately.
        _intentTarget: null,
        _intentTimer: null,
        _cancelIntent() {
            if (this._intentTimer) clearTimeout(this._intentTimer);
            this._intentTimer = null;
            this._intentTarget = null;
        },
        handleHover(e) {
            const t = this.resolve(e.target);
            if (!t) {
                this._cancelIntent();
                if (this.currentTarget) this.hide();
                return;
            }
            if (this.currentTarget === t) {
                this._cancelIntent();
                return;
            }
            if (this._intentTarget === t) return;
            this._cancelIntent();
            this._intentTarget = t;
            this._intentTimer = setTimeout(() => {
                this._intentTimer = null;
                this._intentTarget = null;
                if (t.isConnected) this.showFor(t);
            }, HOVER_INTENT_MS);
        },
        showFor(t) {
            this.currentTarget = t;
            const h = this.htmlFor(t),
                txt = t.getAttribute('data-tooltip');
            const side = t.getAttribute('data-tooltip-side') || undefined;
            const anchorSel = t.getAttribute('data-tooltip-anchor');
            let rect;
            if (anchorSel) {
                const anchor = t.closest('.bbgl-weekly-anchor')?.querySelector(anchorSel);
                if (anchor) {
                    const r = anchor.getBoundingClientRect();
                    const activeH = parseFloat(getComputedStyle(anchor).getPropertyValue('--bbgl-handle-active-h')) || 32;
                    rect = { left: r.left, width: r.width, bottom: r.bottom, top: r.bottom - activeH, height: activeH };
                } else {
                    rect = t.getBoundingClientRect();
                }
            } else {
                rect = t.getBoundingClientRect();
            }
            if (h) this.show(h, rect, side);
            else if (txt) this.show('<div style="text-align:center; color:#ddd;">' + txt + '</div>', t.getBoundingClientRect(), side);
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
        // Self-sufficient lookup — doesn't rely on the panel ever having been opened. The dev
        // widget (and #bbgl-api-hud) is created unconditionally at boot, before this can first
        // fire, so this always finds it once and stays accurate from the first call on.
        if (!dom.apiHud) dom.apiHud = document.getElementById('bbgl-api-hud');
        if (dom.apiHud) dom.apiHud.innerHTML = `API Calls: ${runtime.apiCallTotal}`;
    }

    // ─── Error messaging ────────────────────────────────────────────────────
    // Single funnel for every user-facing error popup, so the joke code stays
    // consistent everywhere without being copy-pasted into each alert() call.
    const BBGL_ERROR_CODE = 'Error Code: 69420';
    function bbglError(msg) {
        alert(msg + `\n\n${BBGL_ERROR_CODE}`);
    }

    // Shared text for error situations, to avoid duplicating copy across call sites.
    const MSG_KEY_FORMAT_INVALID = "Invalid Format.\nA Torn API Key must be exactly 16 alphanumeric characters.";
    const MSG_CLIPBOARD_DENIED = "Clipboard access denied. Please paste manually.";
    const MSG_KEY_NETWORK_ERROR = "Network error while verifying your API key. Please try again.";
    const MSG_SYNC_NETWORK_ERROR = "Couldn't reach Torn's servers. Check your connection and try again.";
    const MSG_SYNC_QUOTA = "Sync failed because your browser ran out of local storage space. Close all open Torn tabs, clear your browser cache, and reload the page.";

    // Torn's own per-key error codes (data.error.code), mapped to plain-language
    // explanations of what's actually wrong and what to do about it, instead of
    // surfacing Torn's raw dev-facing error string. Falls back to that raw string
    // for any code not covered here, so nothing is ever silently swallowed.
    const TORN_KEY_ERROR_MAP = {
        2: "That key doesn't look valid — double-check you copied it correctly.",
        5: "Torn's API rate limit was hit. Wait a moment and try again.",
        8: "Torn has temporarily blocked API requests from your network. Wait a bit and try again.",
        10: "This key's owner is in federal jail, which disables their API key until release.",
        13: "This key's owner has been inactive too long and Torn has temporarily disabled it.",
        14: "Torn's daily API read limit has been reached for this key. Try again tomorrow.",
        16: "This key doesn't have the access level BBGL needs. Make sure it's a Custom key with Basic, Battle Stats, Log, and Faction access — not Public or Minimal.",
        18: "This key has been paused by its owner in Torn's API settings. Re-enable it there, or generate a new one."
    };
    function tornKeyErrorText(data) {
        const err = data && data.error;
        if (!err) return 'Torn rejected this key for an unknown reason.';
        return TORN_KEY_ERROR_MAP[err.code] || `Torn says: "${err.error}".`;
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

    // Classify a single day into a capsule tier purely by its own energy spent. Happy Jump bonus
    // capsules are a separate layer handled in computeWeekCapsules, not part of this.
    // Returns 'diamond' | 'gold' | 'green' | null (null = not capsule-worthy).
    function classifyDay(d) {
        const e = d.eSpent ? d.eSpent.total : 0;
        if (e >= 2000) return 'diamond';
        if (e >= 1500) return 'gold';
        if (e >= 1000) return 'green';
        return null;
    }

    // Overflow ranking — a higher tier overwrites a lower one. diamond > gold > green.
    const CAPSULE_RANK = { green: 1, gold: 2, diamond: 3 };

    // Capsule units a tier is worth when placed (diamond counts double).
    const TIER_UNITS = { green: 1, gold: 1, diamond: 2 };

    // Place one capsule unit of `color` into the 5-slot array.
    //  - Fill phase: drop into the leftmost empty slot (chronological append).
    //  - Overflow (no empty slots): overwrite the leftmost slot strictly lower in rank; a
    //    displaced higher tier (e.g. a gold bumped by a diamond) cascades down and re-seeks the
    //    next lower slot rather than vanishing — so the lowest tier always takes the loss.
    function placeCapsuleUnit(slots, color) {
        const empty = slots.indexOf(null);
        if (empty !== -1) { slots[empty] = color; return; }
        for (let i = 0; i < slots.length; i++) {
            if (CAPSULE_RANK[slots[i]] < CAPSULE_RANK[color]) {
                const displaced = slots[i];
                slots[i] = color;
                placeCapsuleUnit(slots, displaced); // cascade the bumped tier downward
                return;
            }
        }
        // nothing lower to overwrite (green overflow, or week already all-equal/higher) → dropped
    }

    // Build the 5 capsule slots for a week, chronologically. Organic days: green/gold = 1 unit,
    // diamond = 2 units (via classifyDay). Happy Jumps layer on top: the week's 1st HJ day grants
    // 2 units, its 2nd grants 3 more (two jumps alone complete a green week); a 3rd HJ doesn't add
    // units but upgrades every still-green HJ unit to gold. Each HJ day's own organic tier is spent
    // as upgrade credit on that jump's own units first, so a naturally gold/diamond HJ day still
    // gets credit instead of defaulting to green. Everything feeds the same rank-based overflow
    // above, so this composes correctly with unrelated diamond days elsewhere in the week.
    function computeWeekCapsules(days, hjDaySet = null) {
        const slots = [null, null, null, null, null];
        const hjDays = hjDaySet ? days.filter(d => hjDaySet.has(d.date)) : [];
        const jumpGold = hjDays.length >= GAME.GOLD_WEEK_JUMPS;
        const JUMP_ALLOTMENT = [2, 3]; // units granted by the week's 1st and 2nd HJ day
        days.forEach(d => {
            const jumpIdx = hjDays.indexOf(d);
            if (jumpIdx === 0 || jumpIdx === 1) {
                const jumpUnits = JUMP_ALLOTMENT[jumpIdx];
                const naturalTier = classifyDay(d);
                const upgradeUnits = Math.min(TIER_UNITS[naturalTier] || 0, jumpUnits);
                for (let i = 0; i < upgradeUnits; i++) placeCapsuleUnit(slots, naturalTier);
                for (let i = 0; i < jumpUnits - upgradeUnits; i++) placeCapsuleUnit(slots, jumpGold ? 'gold' : 'green');
            } else {
                const tier = classifyDay(d);
                if (!tier) return;
                placeCapsuleUnit(slots, tier);
                if (tier === 'diamond') placeCapsuleUnit(slots, tier);
            }
        });
        return slots;
    }

    // Week completion, derived purely from the capsule slots (the single source of truth that
    // also feeds sticker awards and weekly bonus EXP):
    //   isCompleted — all 5 capsules filled (1 sticker, green weekly bonus)
    //   isGold      — all 5 are gold-or-diamond (2 stickers, gold weekly bonus)
    //   isDiamond   — all 5 are diamond (diamond weekly bonus / diamond-week stat)
    function computeWeekCompletion(days, hjDaySet = null) {
        const capsules = computeWeekCapsules(days, hjDaySet);
        const filled = capsules.filter(c => c !== null);
        const isCompleted = filled.length === capsules.length;
        const isGold = isCompleted && filled.every(c => c === 'gold' || c === 'diamond');
        const isDiamond = isCompleted && filled.every(c => c === 'diamond');
        return { capsules, isCompleted, isGold, isDiamond };
    }

    // ─── LEVELING MATH ENGINE ────────────────────────────────────────────────
    // Two straight-line ramps (0-25% of levels to 126 EXP, 25-80% to 250 EXP), then a power-3.5
    // curve from 80% to the level-99→100 step (400 EXP). Floor: 25 EXP | P0 Peak: 400 EXP.
    // Atrophy multipliers: ×1.75 (P1) and ×2.50 (P2).
    // Every atrophy tier caps at the same literal level 100, but starts somewhere different —
    // later tiers are genuinely longer climbs (more paid level-ups), not just costlier per level.
    const LEVEL_FLOOR = 25;
    const LEVEL_P0_MAX = 400;
    const LEVEL_ATRO_MULT = [1, 1.75, 2.50];
    const LEVEL_ATRO_START = [0, -1, -10];
    const LEVEL_CAP = 100;
    const LEVEL_STEP1_END = 0.25;
    const LEVEL_STEP1_VAL = 126;
    const LEVEL_STEP2_END = 0.80;
    const LEVEL_STEP2_VAL = 250;
    const LEVEL_TAIL_POWER = 3.50;

    // level here is the level being left (cost to advance level -> level+1).
    function computeLevelExpCost(level, atrophy) {
        const start = LEVEL_ATRO_START[atrophy];
        const t = (level - start) / (LEVEL_CAP - 1 - start);
        const val1 = (LEVEL_STEP1_VAL - LEVEL_FLOOR) / (LEVEL_P0_MAX - LEVEL_FLOOR);
        const val2 = (LEVEL_STEP2_VAL - LEVEL_FLOOR) / (LEVEL_P0_MAX - LEVEL_FLOOR);
        let frac;
        if (t <= LEVEL_STEP1_END) {
            frac = val1 * (t / LEVEL_STEP1_END);
        } else if (t <= LEVEL_STEP2_END) {
            frac = val1 + (val2 - val1) * ((t - LEVEL_STEP1_END) / (LEVEL_STEP2_END - LEVEL_STEP1_END));
        } else {
            const u = (t - LEVEL_STEP2_END) / (1 - LEVEL_STEP2_END);
            frac = val2 + (1 - val2) * Math.pow(u, LEVEL_TAIL_POWER);
        }
        const base = Math.round(LEVEL_FLOOR + (LEVEL_P0_MAX - LEVEL_FLOOR) * frac);
        return Math.round(base * LEVEL_ATRO_MULT[atrophy]);
    }

    // Pre-compute the total EXP required to finish each atrophy stage.
    const LEVEL_ATRO_BUDGETS = [0, 1, 2].map(a => {
        let s = 0;
        for (let lv = LEVEL_ATRO_START[a]; lv < LEVEL_CAP; lv++) s += computeLevelExpCost(lv, a);
        return s;
    });

    // Atrophy 0/1 never show level 100 — the instant a tier's budget is exactly spent, this rolls
    // straight into the next tier's starting level instead of landing on the cap first. Level 100
    // is reachable only on atrophy 2 (see the atrophy>=3 catch below), since there is no further
    // tier to roll into.
    function calculateLevelProgress(totalExp) {
        let remaining = totalExp;
        let atrophy = 0;
        for (let a = 0; a < 3; a++) {
            const budget = LEVEL_ATRO_BUDGETS[a];
            if (remaining < budget) { atrophy = a; break; }
            remaining -= budget;
            atrophy = a + 1;
        }
        if (atrophy >= 3) return { atrophy: 2, level: LEVEL_CAP, expInLevel: 0, expToNext: 0 };
        let level = LEVEL_ATRO_START[atrophy];
        for (let lv = LEVEL_ATRO_START[atrophy]; lv < LEVEL_CAP; lv++) {
            const cost = computeLevelExpCost(lv, atrophy);
            if (remaining < cost) { level = lv; break; }
            remaining -= cost;
            level = lv + 1;
        }
        const expInLevel = level < LEVEL_CAP ? remaining : 0;
        const expToNext = level < LEVEL_CAP ? computeLevelExpCost(level, atrophy) : 0;
        return { atrophy, level, expInLevel, expToNext };
    }

    // Level-band flavor titles: five bands per atrophy tier, walking a raw-clay-to-fired-brick
    // metaphor. Columns are [atrophy0, atrophy1, atrophy2] — same band, escalating intensity per
    // tier. Bands key off the raw level number, so atrophy 1/2's earlier negative pre-zero levels
    // just fall into band 1. Level 100 is the universal finish line, but only atrophy 2 gets "Fully
    // Bricked" — atrophy 0/1 auto-roll into the next tier instead, keeping band 5's capstone title.
    //
    // `max` is inclusive and doubles as the bracket axis on the titles page (levelRankBrackets()
    // below reads widths straight off these numbers) — edit a max here and the axis re-draws
    // itself.
    const LEVEL_TITLE_BANDS = [
        { max: 19, titles: ['Dry Clay', 'Parched Clay', 'Cracked Clay'] },
        { max: 39, titles: ['Moistened Clay', 'Saturated Clay', 'Dripping Wet Clay'] },
        { max: 59, titles: ['Hand-Jerked Clay', 'Foot-Pumped Clay', 'Vacuum-Milked Clay'] },
        { max: 79, titles: ['Pit-Fired Clay', 'Scove-Fired Clay', 'Kiln-Fired Clay'] },
        // "Half Bricked" is deliberately unhyphenated so it is two WORDS. Plaque labels wrap on
        // whitespace (achRankPlaqueLabelHTML), so the hyphenated form was a single 12-character
        // token that could only render as one long line — the widest plaque on the bar, in its
        // most crowded slot. As two words it stacks like its siblings.
        { max: 99, titles: ['Half Bricked', 'Mostly Bricked', 'Competently Bricked'] }
    ];
    // The one true end state: the final atrophy tier at the level cap. Drives the "Fully Bricked"
    // title, the plaque's vitrified glaze, and the rank bar's iridescent capstone, so it lives here
    // rather than being re-spelled at each of those three call sites.
    function isFullyBricked(atrophy, level) {
        return (atrophy || 0) >= 2 && (level || 0) >= LEVEL_CAP;
    }

    function atrophyBandTitle(atrophy, level) {
        const band = LEVEL_TITLE_BANDS.find(b => level <= b.max) || LEVEL_TITLE_BANDS[LEVEL_TITLE_BANDS.length - 1];
        return band.titles[atrophy] || band.titles[0];
    }

    // The rank axis under the titles page's level bar: one bracket per band, sized by its true
    // share of the 0-LEVEL_CAP run so a 20-level band takes 20% and a 10-level band takes 10%.
    // Everything derives from LEVEL_TITLE_BANDS, so adding, removing or resizing a band re-draws
    // the axis with no other edits.
    //
    // A bracket reveals its name once you've reached it in the CURRENT atrophy tier and reads "?"
    // until then — the first is therefore always revealed, and every bracket re-hides on atrophy
    // since the whole tier's names change with it.
    function levelRankBrackets(atrophy, level) {
        const a = Math.max(0, Math.min(2, atrophy || 0));
        const out = [];
        let start = 0;
        LEVEL_TITLE_BANDS.forEach(band => {
            const span = band.max - start + 1;
            const unlocked = level >= start;
            out.push({
                start,
                end: band.max,
                span,
                widthPct: (span / LEVEL_CAP) * 100,
                unlocked,
                label: unlocked ? (band.titles[a] || band.titles[0]) : '?'
            });
            start = band.max + 1;
        });
        return out;
    }

    // The engraved rank track has no fill or colour progression: the sliding digital readout is the
    // sole position indicator. This emits only that position as a custom property.
    function rankBarProgressCSS(_atrophy, level) {
        const p = Math.max(0, Math.min(1, (level || 0) / LEVEL_CAP));
        return `--rank-fill-pct:${(p * 100).toFixed(2)}%`;
    }

    // ─── Stat Titles ────────────────────────────────────────────────────────
    // Second, independent title system appended to the rank system above. Does not reset with
    // atrophy — each of the four battle stats runs its own
    // 10-phase word ladder, unlocked by E spent on THAT stat alone (day.eSpent[stat], never the
    // pooled total). Unlocked phases stay unlocked and the player picks which two fill the title:
    // one supplies the noun (Primary), one the adjective (Secondary). Any stat can fill either
    // slot, including the same stat/phase in both.

    // Per-stat cumulative-E thresholds, index = phase. Phase 0 is free (0E) so every stat always
    // has one selectable word — the grid is never empty and a title always composes. Increments
    // are backloaded: +10k, +12.5k, +15k, +17.5k, +20k, then +30k/35k/45k/55k.
    //
    // Ten tiers, indexed 0-9 internally but displayed as 1-10 everywhere the player sees them
    // (achTitleStarHTML(), 06-section-v-logic.js) — the free tier reads as "1" rather than "0".
    const STAT_TITLE_THRESHOLDS = [0, 10000, 22500, 37500, 55000, 75000, 105000, 140000, 185000, 240000];

    // One evolving noun+adjective ladder per stat, indexed by phase (0-9).
    const STAT_TITLE_WORDS = {
        str: [
            { noun: 'Weenie', adj: 'Limp' },
            { noun: 'Noodle', adj: 'Flimsy' },
            { noun: 'Grower', adj: 'Growing' },
            { noun: 'Grip', adj: 'Gripping' },
            { noun: 'Thrust', adj: 'Thrusting' },
            { noun: 'Muscle', adj: 'Manhandling' },
            { noun: 'Fist', adj: 'Hammering' },
            { noun: 'Hunk', adj: 'Dominating' },
            { noun: 'Beast', adj: 'Unrelenting' },
            { noun: 'Stallion', adj: 'Bulging' }
        ],
        def: [
            { noun: 'Flesh', adj: 'Blistered' },
            { noun: 'Softie', adj: 'Tender' },
            { noun: 'Rubber', adj: 'Thickening' },
            { noun: 'Firmness', adj: 'Firm' },
            { noun: 'Callous', adj: 'Calloused' },
            { noun: 'Sheath', adj: 'Leathery' },
            { noun: 'Bone', adj: 'Hardened' },
            { noun: 'Slab', adj: 'Rock-Hard' },
            { noun: 'Barricade', adj: 'Impenetrable' },
            { noun: 'Fortress', adj: 'Unbreachable' }
        ],
        spd: [
            { noun: 'Delay', adj: 'Stagnant' },
            { noun: 'Sloth', adj: 'Sluggish' },
            { noun: 'Dawdler', adj: 'Meandering' },
            { noun: 'Rhythm', adj: 'Steady' },
            { noun: 'Quickie', adj: 'Quickening' },
            { noun: 'Spurt', adj: 'Frisky' },
            { noun: 'Twitch', adj: 'Frantic' },
            { noun: 'Burst', adj: 'Rapid' },
            { noun: 'Piston', adj: 'Frenzied' },
            { noun: 'Jackrabbit', adj: 'Ballistic' }
        ],
        dex: [
            { noun: 'Ruckus', adj: 'Clattering' },
            { noun: 'Noise', adj: 'Scuffling' },
            { noun: 'Whisper', adj: 'Cautious' },
            { noun: 'Ambiguity', adj: 'Quiet' },
            { noun: 'Creeper', adj: 'Creeping' },
            { noun: 'Lurker', adj: 'Prowling' },
            { noun: 'Stalker', adj: 'Elusive' },
            { noun: 'Shadow', adj: 'Covert' },
            { noun: 'Specter', adj: 'Ghostly' },
            { noun: 'Infiltrator', adj: 'Unseen' }
        ]
    };

    // Highest phase index one stat's own cumulative E clears.
    function statTitlePhaseForE(statE) {
        for (let i = STAT_TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
            if (statE >= STAT_TITLE_THRESHOLDS[i]) return i;
        }
        return 0;
    }

    // {str,def,spd,dex} of E spent -> {str,def,spd,dex} of highest unlocked phase.
    function statTitlePhases(eByStat) {
        const out = {};
        STAT_KEYS.forEach(k => {
            out[k] = statTitlePhaseForE((eByStat && eByStat[k]) || 0);
        });
        return out;
    }

    // Clamps a stored phase to its stat's complete title ladder.
    function statTitleWord(stat, phase) {
        const ladder = STAT_TITLE_WORDS[stat];
        if (!ladder) return null;
        const p = Math.max(0, Math.min(phase | 0, ladder.length - 1));
        return ladder[p] ? { noun: ladder[p].noun, adj: ladder[p].adj, phase: p } : null;
    }

    // Top 2 of the 4 battle stats by raw value, descending. Ties break on STAT_KEYS order
    // (str > def > spd > dex) so the result is always deterministic. STAT_KEYS is defined later
    // in 06-section-v-logic.js — safe to reference here since this only runs inside a function
    // body, well after the whole IIFE has finished its one top-to-bottom definition pass.
    function rankTopTwoStats(breakdown) {
        return [...STAT_KEYS]
            .sort((a, b) => (breakdown[b] || 0) - (breakdown[a] || 0))
            .slice(0, 2);
    }

    // selection = { primary: {stat, phase}, secondary: {stat, phase} }. Primary supplies the noun
    // (the identity — "Goon"), secondary the adjective modifying it ("Calloused"), so the phrase
    // reads "<secondary.adj> <primary.noun>". Both slots are free-choice from anything unlocked,
    // including the same stat and phase in both.
    function composeStatTitleParts(selection) {
        if (!selection || !selection.primary || !selection.secondary) return null;
        const noun = statTitleWord(selection.primary.stat, selection.primary.phase);
        const adj = statTitleWord(selection.secondary.stat, selection.secondary.phase);
        if (!noun || !adj) return null;
        return [{
            text: adj.adj,
            phase: adj.phase,
            stat: selection.secondary.stat
        }, {
            text: noun.noun,
            phase: noun.phase,
            stat: selection.primary.stat
        }];
    }

    // Plain text — clipboard, aria labels, anywhere markup would be wrong.
    function composeStatTitle(selection) {
        const parts = composeStatTitleParts(selection);
        return parts ? parts.map(p => p.text).join(' ') : '';
    }

    // One finished word. Shared by the composed title and the titles page's mid-pick preview so both
    // pick up the identical per-word finish rules.
    function statTitleWordHTML(text, phase) {
        const lengthClass = text.length >= 12 ? ' is-very-long' : (text.length >= 10 ? ' is-long' : '');
        return `<span class="bbgl-title-word${lengthClass}" data-title-phase="${phase}">${text}</span>`;
    }

    // Each word carries its OWN data-title-phase, so a dull Phase 1 adjective can sit next to an
    // iridescent Phase 9 noun — the finish progression in 04-section-iii-styles.js is per word,
    // not per title.
    function composeStatTitleHTML(selection) {
        const parts = composeStatTitleParts(selection);
        if (!parts) return '';
        return parts.map(p => statTitleWordHTML(p.text, p.phase)).join(' ');
    }

    // The titles page's two-click picker shows only the first word until the second click completes
    // the pair. First click fills the adjective slot (the phrase reads adjective-then-noun), so the
    // half-built title previews that word alone.
    function statTitlePickPreviewHTML(pick) {
        if (!pick) return '';
        const w = statTitleWord(pick.stat, pick.phase);
        return w ? statTitleWordHTML(w.adj, w.phase) : '';
    }

    // Clamp a stored slot to something real — known stat, phase inside the ladder and never past
    // what that stat has actually unlocked (guards hand-edited config and words being re-ordered
    // out from under a saved pick).
    function clampTitleSlot(slot, phases) {
        if (!slot || !STAT_TITLE_WORDS[slot.stat]) return null;
        const cap = phases ? (phases[slot.stat] || 0) : STAT_TITLE_THRESHOLDS.length - 1;
        return {
            stat: slot.stat,
            phase: Math.max(0, Math.min(slot.phase | 0, cap))
        };
    }

    // Earned mode's pair: the two stats that most recently unlocked a new tier (titleAutoRecent,
    // oldest first). Install seeds it with the top two battle stats, the lower one oldest so the
    // first unlock replaces it. Word order is fixed at each change — the higher battle stat supplies
    // the noun (second word) — and nothing moves between unlocks, so the title never changes mid-tier.
    //
    // titleAutoPhases is the per-stat phase high-water mark unlocks are detected against. It never
    // drops, so a transiently low E read while data loads can't register as a fresh unlock later.
    function resolveAutoTitlePair(phases, breakdown) {
        const valid = s => !!STAT_TITLE_WORDS[s];
        const byStat = (a, b) => ((breakdown[a] || 0) >= (breakdown[b] || 0)
            ? { primary: a, secondary: b }
            : { primary: b, secondary: a });
        const stored = userConfig.titleAutoPair;
        const storedPair = stored && valid(stored.primary) && valid(stored.secondary) ? stored : null;
        // Before battle stats load, rankTopTwoStats() is just STAT_KEYS order — never seed from it.
        const hasStats = STAT_KEYS.some(k => (breakdown[k] || 0) > 0);
        if (!hasStats || runtime.demoMode) {
            if (storedPair) return storedPair;
            const top = rankTopTwoStats(breakdown);
            return byStat(top[0], top[1]);
        }
        let recent = Array.isArray(userConfig.titleAutoRecent)
            ? [...new Set(userConfig.titleAutoRecent.filter(valid))].slice(-2)
            : [];
        if (recent.length < 2) {
            if (storedPair) recent = [storedPair.secondary, storedPair.primary];
            else {
                const top = rankTopTwoStats(breakdown);
                recent = [top[1], top[0]];
            }
        }
        const seen = userConfig.titleAutoPhases;
        const unlocked = seen ? STAT_KEYS.filter(k => (phases[k] || 0) > (seen[k] || 0)) : [];
        unlocked.forEach(k => { recent = recent.filter(s => s !== k).concat(k).slice(-2); });
        const pairChanged = unlocked.length > 0 || !storedPair ||
            !recent.includes(storedPair.primary) || !recent.includes(storedPair.secondary);
        const pair = pairChanged ? byStat(recent[0], recent[1]) : storedPair;
        const nextSeen = {};
        STAT_KEYS.forEach(k => { nextSeen[k] = Math.max(phases[k] || 0, (seen && seen[k]) || 0); });
        const before = JSON.stringify([userConfig.titleAutoRecent, userConfig.titleAutoPhases, userConfig.titleAutoPair]);
        userConfig.titleAutoRecent = recent;
        userConfig.titleAutoPhases = nextSeen;
        userConfig.titleAutoPair = { primary: pair.primary, secondary: pair.secondary };
        if (JSON.stringify([recent, nextSeen, userConfig.titleAutoPair]) !== before) saveConfig();
        return userConfig.titleAutoPair;
    }

    // The selection actually displayed, given per-stat E and the current stat breakdown.
    //
    // Custom mode: the saved manual pick, clamped to what's unlocked. Earned mode: the pair from
    // resolveAutoTitlePair(), each stat at its highest unlocked phase. The auto pair is tracked even
    // while a custom pick is showing, so unlocks earned meanwhile are there when the reset arrow
    // goes back to it — and the custom pick is stored separately, so resetting never destroys it.
    function resolveStatTitleSelection(eByStat, breakdown) {
        const phases = statTitlePhases(eByStat);
        const auto = resolveAutoTitlePair(phases, breakdown || {});
        const custom = userConfig.titleCustom;
        const hasCustom = !!(custom && custom.primary && custom.secondary);
        if (userConfig.titleMode === 'custom' && hasCustom) {
            const primary = clampTitleSlot(custom.primary, phases);
            const secondary = clampTitleSlot(custom.secondary, phases);
            if (primary && secondary) return { primary, secondary, phases, mode: 'custom' };
        }
        return {
            primary: { stat: auto.primary, phase: phases[auto.primary] },
            secondary: { stat: auto.secondary, phase: phases[auto.secondary] },
            phases,
            mode: 'earned'
        };
    }

    // role: 'primary' (noun slot), 'secondary' (adjective slot), or 'both'. Picking anything is what
    // switches you off the automatic pair — you never have to set the mode first, and the titles
    // page's reset arrow is how you get back.
    function applyStatTitlePick(current, stat, phase, role) {
        const slot = { stat, phase };
        const next = {
            primary: role === 'secondary' ? current.primary : slot,
            secondary: role === 'primary' ? current.secondary : slot
        };
        userConfig.titleCustom = next;
        userConfig.titleMode = 'custom';
        saveConfig();
        return next;
    }

    // Drives the titles page's reset arrow — picking a star sets 'custom' on its own.
    function setStatTitleMode(mode) {
        userConfig.titleMode = mode === 'custom' ? 'custom' : 'earned';
        saveConfig();
    }

    // Real-time daily EXP for the leveling bar (NOT the weekly progress bar).
    // Scaling tiers: 0.175/E (0-1000), 0.20/E (1001-1500), 0.050/E (1501+) — diminishing returns
    // past Gold. Flat +100 bonus at 2,000E+ (Diamond) is the payoff for pushing all the way
    // through the Gold+ slump rather than stopping partway. HJ days: burst energy (≤1000E) earns
    // at 0.25/E; extra E above continues in normal scaling bands (including the Diamond bonus).
    const LEVEL_RATE_BASE = 0.175;
    const LEVEL_RATE_GREEN = 0.20;
    const LEVEL_RATE_GOLD = 0.050;
    const LEVEL_RATE_HJ_BURST = 0.25;
    const LEVEL_RATE_DIAMOND_BONUS = 100;
    function computeDailyLevelExp(eSpent, hasTrainLog, isHJ = false) {
        if (!hasTrainLog) return 0;
        const diamondBonus = eSpent >= 2000 ? LEVEL_RATE_DIAMOND_BONUS : 0;
        if (isHJ) {
            const hjE    = Math.min(eSpent, 1000);
            const extraE = Math.max(eSpent - 1000, 0);
            const hjBase = hjE * LEVEL_RATE_HJ_BURST;
            const t2     = Math.min(extraE, 500) * LEVEL_RATE_GREEN;
            const t3     = Math.max(extraE - 500, 0) * LEVEL_RATE_GOLD;
            return Math.round(hjBase + t2 + t3 + diamondBonus);
        }
        const t1 = Math.min(eSpent, 1000) * LEVEL_RATE_BASE;
        const t2 = Math.min(Math.max(eSpent - 1000, 0), 500) * LEVEL_RATE_GREEN;
        const t3 = Math.max(eSpent - 1500, 0) * LEVEL_RATE_GOLD;
        return Math.round(t1 + t2 + t3 + diamondBonus);
    }
    // ─────────────────────────────────────────────────────────────────────────

    function getWeekKey(dateStr) {
        const d = Formatter.parse(dateStr);
        const dayIdx = d.getUTCDay();
        const offset = userConfig.weekStartMode === 'mon' ? (dayIdx === 0 ? 6 : dayIdx - 1) : dayIdx;
        const weekStart = new Date(d.getTime() - offset * 86400000);
        return Formatter.dateISO(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate());
    }

    // Week-key of the install date (rewardStartDate). Stickers are eligible for weeks with key >=
    // this — week-precision, so a backfilled day earlier in the install week still counts toward
    // that week's sticker goal. Respects the user's day-start and week-start modes. Returns null if
    // unknown (no gating) — but init() self-heals privacyAgreed so this is rare.
    function getInstallWeekKey() {
        const rewardStartDate = getActiveHistory().meta.rewardStartDate;
        if (!rewardStartDate) return null;
        return getWeekKey(Formatter.dateLogical(rewardStartDate * 1000));
    }

    // Logical date-string of the install moment (rewardStartDate), day-precision. Gates EXP
    // specifically: unlike getInstallWeekKey()'s week-level sticker gate, a backfilled day earlier
    // in the install week earns 0 EXP — only days on/after the exact install moment count. This is
    // what keeps a Clear Log + Backfill from retroactively granting career EXP for reconstructed
    // pre-install history while still letting that same week's sticker goal be met.
    function getInstallDateKey() {
        const rewardStartDate = getActiveHistory().meta.rewardStartDate;
        if (!rewardStartDate) return null;
        return Formatter.dateLogical(rewardStartDate * 1000);
    }

