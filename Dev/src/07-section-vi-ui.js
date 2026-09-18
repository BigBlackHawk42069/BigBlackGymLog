    /**
     *  [SECTION VI] THE GYM EQUIPMENT (UI Layer)
     *  ========================================================================
     *  Whether you use it for a day or you use it for ten years:
     *  You should still get a Tetanus Booster!
     */

    const CAL_IMG_BASE = cdnize('https://raw.githubusercontent.com/BigBlackHawk42069/asdfaskijdnfawef/refs/heads/main/ScrptImgs/Calendar/');

    function buildChartSVG(sl) {
        const stats = sl && sl.stats;
        const keys = ['str', 'def', 'spd', 'dex'];
        const colors = ['#4a6070', '#7a3d36', '#8a6530', '#486644'];
        const xs = [4, 9.5, 15, 20.5];
        const maxH = 14, minH = 2;
        const vals = keys.map(k => (stats && stats[k] ? stats[k].end : 0));
        const maxVal = Math.max(...vals);
        const hs = vals.map(v => maxVal > 0 ? Math.max((v / maxVal) * maxH, minH) : maxH * 0.25);
        const lines = keys.map((k, i) => {
            return `<line x1="${xs[i]}" y1="20" x2="${xs[i]}" y2="${(20 - hs[i]).toFixed(2)}" stroke="${colors[i]}" stroke-width="5" stroke-linecap="round"/>`;
        });
        const bgLines = keys.map((k, i) =>
            `<line x1="${xs[i]}" y1="20" x2="${xs[i]}" y2="${(20 - hs[i]).toFixed(2)}" stroke="#000" stroke-width="7" stroke-linecap="round"/>`
        );
        return `<svg viewBox="0 0 24 24" fill="none">${bgLines.join('')}${lines.join('')}</svg>`;
    }



    // Weekly capsule reservoir bar.
    // The bay IS the capsule — no floating object. Empty bays: dark recess + gray terminal plates
    // at each end. Filled bays: same structure, but the middle section between the terminals
    // fills with the colour + a thin gray border encasing just the glass window area.
    // slots: ['green'|'gold'|'diamond'|'silver'|null] x5. lit=true → bright colours (complete week).
    // animated=true → per-window inner radiance glow (CSS-animated sweep, see .bbgl-cap-sweep).
    const CAP_W = 500, CAP_H = 100, CAP_N = 5;
    const CAP_PAD_X = 18, CAP_PAD_RIGHT = 8, CAP_PAD_Y = 8, CAP_GAP = 7;
    const CAP_SLOT_W = (CAP_W - CAP_PAD_X - CAP_PAD_RIGHT - (CAP_N - 1) * CAP_GAP) / CAP_N;
    const CAP_SLOT_H = CAP_H - 2 * CAP_PAD_Y;
    const CAP_TERM_W = 7;
    const CAP_RAIL_H = 3, CAP_FILL_INSET = 2;

    const BAR_TERMINAL_STOPS = BAR_METAL_PALETTE.map(([offset, color]) => `<stop offset="${offset / 100}" stop-color="${color}"/>`).join('');

    function buildTubeBrackets(x, width, paint = 'bbc-term') {
        const l = x - 2, r = x + width + 2;
        return `<path d="M${l} 70L${x} 57H${x + width}L${r} 70Z M${l} 30L${x} 43H${x + width}L${r} 30Z" fill="#050806" fill-opacity=".78"/>
            <path d="M${l} 96V74L${x} 61H${x + width}L${r} 74V96Z M${l} 4V26L${x} 39H${x + width}L${r} 26V4Z" fill="url(#${paint})"/>
            <path d="M${l} 26L${x} 39H${x + width}L${r} 26L${x + width - 1} 35H${x + 1}Z" fill="#111711" fill-opacity=".75"/>
            <path d="M${l} 74L${x} 61H${x + width}L${r} 74L${x + width - 1} 65H${x + 1}Z" fill="#a6afa1" fill-opacity=".4"/>
            <path d="M${x + 1} 34H${x + width - 1} M${x + 1} 62H${x + width - 1}" fill="none" stroke="#b4bcb4" stroke-opacity=".4" stroke-width="1"/>`;
    }

    // Gradients/patterns are pure functions of the bar's fixed dimensions above, so they're
    // identical on every call regardless of slots/lit/animated. Built once here (instead of
    // re-built by string concatenation on every buildCapsuleBar() call) and inlined into each
    // returned <svg> — paint-server url(#...) references only resolve reliably within the same
    // inline SVG fragment, so this can't be hoisted into a separate shared <svg>; it's still only
    // built once, and buildCapsuleBar()'s own memo cache means the string concatenation itself
    // only runs once per distinct bar state.
    const CAP_BAR_DEFS =
        `<defs>` +
        `<linearGradient id="bbc-joint-recess" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101211"/><stop offset=".18" stop-color="#252a26"/><stop offset=".45" stop-color="#151916"/><stop offset=".78" stop-color="#101310"/><stop offset="1" stop-color="#30362f"/></linearGradient>` +
        `<linearGradient id="bbc-joint-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset=".24" stop-color="#000" stop-opacity=".12"/><stop offset=".65" stop-color="#c1c9ba" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>` +
        `<filter id="bbc-end-bloom" x="-200%" y="-70%" width="500%" height="240%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="3 7" result="halo"/><feGaussianBlur in="SourceGraphic" stdDeviation="1 3" result="core"/><feMerge><feMergeNode in="halo"/><feMergeNode in="halo"/><feMergeNode in="core"/></feMerge></filter>` +
        `<linearGradient id="bbc-socket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080b08"/><stop offset=".5" stop-color="#111611"/><stop offset="1" stop-color="#070a07"/></linearGradient>` +
        `<linearGradient id="bbc-collar-depth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset=".16" stop-color="#fff" stop-opacity=".35"/><stop offset=".32" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient><linearGradient id="bbc-collar-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171a1c"/><stop offset=".2" stop-color="#81888b"/><stop offset=".3" stop-color="#e2e5e5"/><stop offset=".45" stop-color="#62696b"/><stop offset=".7" stop-color="#25292b"/><stop offset=".86" stop-color="#8a9192"/><stop offset="1" stop-color="#141719"/></linearGradient>` +
        `<linearGradient id="bbc-housing" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#242424"/><stop offset=".22" stop-color="#333333"/><stop offset=".55" stop-color="#202020"/><stop offset="1" stop-color="#101010"/></linearGradient>` +
        `<radialGradient id="bbc-cast-bevel" cx=".3" cy=".15" r=".85"><stop offset="0" stop-color="#777777" stop-opacity=".38"/><stop offset=".55" stop-color="#555555" stop-opacity=".16"/><stop offset="1" stop-color="#333333" stop-opacity="0"/></radialGradient>` +
        `<linearGradient id="bbc-cast-shoulder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#383838"/><stop offset=".28" stop-color="#292929"/><stop offset=".7" stop-color="#1b1b1b"/><stop offset="1" stop-color="#0e0e0e"/></linearGradient>` +
        `<linearGradient id="bbc-term" x1="0" y1="${CAP_PAD_Y}" x2="0" y2="${CAP_PAD_Y + CAP_SLOT_H}" gradientUnits="userSpaceOnUse">` +
        BAR_TERMINAL_STOPS + `</linearGradient>` +
        `<linearGradient id="bbc-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset=".23" stop-color="#fff" stop-opacity=".28"/><stop offset=".38" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>` +
        `<linearGradient id="bbc-tube-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".48"/><stop offset=".12" stop-color="#fff" stop-opacity=".08"/><stop offset=".23" stop-color="#fff" stop-opacity=".58"/><stop offset=".3" stop-color="#fff" stop-opacity=".32"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".58" stop-color="#000" stop-opacity=".08"/><stop offset=".76" stop-color="#000" stop-opacity=".22"/><stop offset=".9" stop-color="#fff" stop-opacity=".26"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>` +
        `<linearGradient id="bbc-glass-highlight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".15" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity=".52"/><stop offset=".7" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
        `<linearGradient id="bbc-recess-shadow" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>` +
        `<linearGradient id="bbc-recess-shine" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>` +
        `<linearGradient id="bbc-gD" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#004422"/><stop offset=".33" stop-color="#336611"/>` +
        `<stop offset=".66" stop-color="#006644"/><stop offset="1" stop-color="#2d5c00"/></linearGradient>` +
        `<linearGradient id="bbc-gL" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#008844"/><stop offset=".33" stop-color="#66bb22"/>` +
        `<stop offset=".66" stop-color="#00cc88"/><stop offset="1" stop-color="#44aa00"/></linearGradient>` +
        `<linearGradient id="bbc-oD" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#886600"/><stop offset=".33" stop-color="#aa7700"/>` +
        `<stop offset=".66" stop-color="#ddbb66"/><stop offset="1" stop-color="#774400"/></linearGradient>` +
        `<linearGradient id="bbc-oL" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#ffcc00"/><stop offset=".33" stop-color="#ffdd44"/>` +
        `<stop offset=".66" stop-color="#fff8cc"/><stop offset="1" stop-color="#cc8800"/></linearGradient>` +
        `<linearGradient id="bbc-dD" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#882299"/><stop offset=".33" stop-color="#3366aa"/>` +
        `<stop offset=".66" stop-color="#339966"/><stop offset="1" stop-color="#993366"/></linearGradient>` +
        `<linearGradient id="bbc-dL" x1="0" y1="1" x2="1" y2="0">` +
        `<stop offset="0" stop-color="#ee77ff"/><stop offset=".33" stop-color="#88bbff"/>` +
        `<stop offset=".66" stop-color="#77ffcc"/><stop offset="1" stop-color="#ff77cc"/></linearGradient>` +
        `<filter id="bbc-tube-glow" x="-5%" y="-15%" width="110%" height="130%" color-interpolation-filters="sRGB">` +
        `<feGaussianBlur stdDeviation="1.2 3"/>` +
        `<feComponentTransfer result="blur"><feFuncA type="linear" slope=".85"/></feComponentTransfer>` +
        `<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>` +
        `</filter>` +
        `<linearGradient id="bbc-s" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#1e1e1e"/><stop offset=".35" stop-color="#484848"/>` +
        `<stop offset=".5" stop-color="#686868"/><stop offset=".65" stop-color="#484848"/>` +
        `<stop offset="1" stop-color="#161616"/></linearGradient>` +
        `</defs>`;

    // Sweep overlay geometry (HTML, not SVG — see .bbgl-cap-sweep in CSS_STYLES for why). The
    // SVG uses viewBox="0 0 500 100" + preserveAspectRatio="none", so it stretches to exactly
    // fill its container; expressing each capsule's fill window as a PERCENTAGE of that same
    // container keeps an HTML overlay perfectly aligned with the SVG art across every panel
    // size/mode, with no JS resize tracking needed.
    //
    // Each capsule window plays TWO one-way local passes per cycle — a forward (L->R) one and a
    // backward (R->L) one — instead of one capsule-local back-and-forth. That's what actually
    // recreates "one band travels to the far end of the bar, then travels all the way back":
    // the forward pass is staggered left-to-right across all 5 capsules (CAP_WIN_DELAY_FWD_S,
    // small first, large last), then — only once every capsule has finished its forward pass —
    // the backward pass starts, staggered in REVERSE (CAP_WIN_DELAY_BWD_S: the rightmost capsule
    // goes first, the leftmost goes last), so the return trip visually starts at the right edge
    // and travels back to the left edge, mirroring the outbound trip.
    const CAP_WIN_LEFT_PCT = [];
    const CAP_WIN_DELAY_FWD_S = [];
    const CAP_WIN_DELAY_BWD_S = [];
    let CAP_WIN_WIDTH_PCT, CAP_WIN_TOP_PCT, CAP_WIN_HEIGHT_PCT;
    (() => {
        // All decoupled from the keyframes' own local-pass duration (CSS_STYLES .bbgl-cap-sweep,
        // 15% of the 4s cycle = 0.6s) on purpose. PASS_S here just needs to match that so a
        // capsule's own pass has time to fully play (fade in, hold bright, fade out) before the
        // cycle wraps; FORWARD_SPREAD_S/BACKWARD_SPREAD_S control how long each leg of the trip
        // takes, kept comfortably above the ~0.2s per-capsule step (so neighbors overlap into a
        // continuous wave, not disconnected blips) and small enough that the two legs plus their
        // passes still fit inside the cycle with idle time left over.
        const PASS_S = 0.6;
        const FORWARD_SPREAD_S = 1.2;
        const BACKWARD_SPREAD_S = 1.2;
        const PHASE1_END_S = FORWARD_SPREAD_S + PASS_S;
        for (let i = 0; i < CAP_N; i++) {
            const bx = CAP_PAD_X + i * (CAP_SLOT_W + CAP_GAP),
                gx = bx + CAP_TERM_W, gw = CAP_SLOT_W - 2 * CAP_TERM_W,
                winY = CAP_PAD_Y + CAP_RAIL_H, winH = CAP_SLOT_H - CAP_RAIL_H * 2,
                fy = winY + CAP_FILL_INSET, fh = winH - CAP_FILL_INSET * 2;
            CAP_WIN_LEFT_PCT.push(gx / CAP_W * 100);
            CAP_WIN_DELAY_FWD_S.push(gx / CAP_W * FORWARD_SPREAD_S);
            CAP_WIN_DELAY_BWD_S.push(PHASE1_END_S + (CAP_W - gx) / CAP_W * BACKWARD_SPREAD_S);
            CAP_WIN_WIDTH_PCT = gw / CAP_W * 100;
            CAP_WIN_TOP_PCT = fy / CAP_H * 100;
            CAP_WIN_HEIGHT_PCT = fh / CAP_H * 100;
        }
    })();

    // Output is a pure function of (slots, lit, animated) — memoize the built markup so
    // navigating months/re-rendering doesn't re-run the string-building loop for a bar shape
    // that's already been built.
    const _capBarCache = new Map();

    function buildCapsuleBar(slots, lit, animated) {
        const cacheKey = slots.join(',') + '|' + lit + '|' + animated;
        const cached = _capBarCache.get(cacheKey);
        if (cached) return cached;

        const W = CAP_W, H = CAP_H, n = CAP_N;
        const padX = CAP_PAD_X, padY = CAP_PAD_Y, gap = CAP_GAP;
        const slotW = CAP_SLOT_W, slotH = CAP_SLOT_H;
        const termW = CAP_TERM_W;

        const colorKey = { green: 'g', gold: 'o', diamond: 'd', silver: 's' };
        const f = (v) => v.toFixed(2);
        let out = `<rect width="16" height="100" fill="url(#bbc-housing)"/><rect x="494" width="6" height="100" rx="2" fill="url(#bbc-housing)"/><path d="M16 0H20V100H16Z M490 0H494V100H490Z" fill="url(#bbc-socket)"/>`;
        out += `<path d="M8 0H16L13 12H8Z M494 0H498L500 12H497Z" fill="url(#bbc-cast-bevel)"/>
            <path d="M8 91H14L16 100H8Z M496 91H500L498 100H494Z" fill="#171c17" fill-opacity=".4"/>
            <path d="M14 10H16L18 17V83L16 90H14Z M494 10H496V90H494L492 83V17Z" fill="url(#bbc-cast-shoulder)"/>
            <path d="M10 10H16V35H14V17H10Z M494 10H498V17H496V32H494Z" fill="url(#bbc-cast-bevel)"/>
            <path d="M16.6 15L17.8 19V81L16.6 85 M493.4 15L492.2 19V81L493.4 85" fill="none" stroke="#030603" stroke-opacity=".9" stroke-width="1.2"/>
            <path d="M15.4 18V82 M494.6 18V82" stroke="url(#bbc-cast-shoulder)" stroke-width=".8"/>`;
        // HTML overlay, not SVG: inline SVG doesn't reliably get its own GPU compositor layer for
        // transform/opacity animation, but a clipped HTML div does.
        let overlay = '';

        for (let i = 0; i < n; i++) {
            const bx = padX + i * (slotW + gap);
            const by = padY;

            out += `<path d="M${f(bx)} 75Q${f(bx + slotW / 2)} 95 ${f(bx + slotW)} 75V94H${f(bx)}Z" fill="#171a19"/><path d="M${f(bx + 3)} 78Q${f(bx + slotW / 2)} 93 ${f(bx + slotW - 3)} 78" fill="none" stroke="#535b55" stroke-width="2"/>`;

            const color = slots[i];
            if (i < n - 1) {
                out += `<rect x="${f(bx + slotW)}" y="4" width="${gap}" height="92" rx="1.5" ry="5" fill="url(#bbc-joint-recess)"/><rect x="${f(bx + slotW)}" y="4" width="${gap}" height="92" rx="1.5" ry="5" fill="url(#bbc-joint-wall)"/><path d="M${f(bx + slotW + .7)} 11Q${f(bx + slotW + gap / 2)} 5 ${f(bx + slotW + gap - .7)} 11 M${f(bx + slotW + .7)} 88Q${f(bx + slotW + gap / 2)} 94 ${f(bx + slotW + gap - .7)} 88" fill="none" stroke="#84917f" stroke-opacity=".24" stroke-width=".8"/>`;
                out += `<rect x="${f(bx + slotW - 1)}" y="${by + 19}" width="${gap + 2}" height="${slotH - 38}" rx="1" fill="url(#bbc-term)"/><path d="M${f(bx + slotW + gap / 2)} ${by + 21}v${slotH - 42}" stroke="#111" stroke-width="1.5"/>`;
                out += `<rect x="${f(bx + slotW)}" y="${by + 20}" width="${gap}" height="${slotH - 40}" rx=".8" fill="url(#bbc-collar-depth)"/>
                    <path d="M${f(bx + slotW + 1)} ${by + 22}v${slotH - 44} M${f(bx + slotW + gap - 1)} ${by + 22}v${slotH - 44}" stroke="url(#bbc-collar-rim)" stroke-width=".8"/>
                    <path d="M${f(bx + slotW + gap / 2 + .8)} ${by + 22}v${slotH - 44}" stroke="#cdd4d5" stroke-opacity=".3" stroke-width=".5"/>`;
            }

            if (!color) {
                out += `<rect class="bbgl-empty-capsule-bay" x="${f(bx)}" y="5" width="${f(slotW)}" height="90" rx="3" ry="12" fill="url(#bbc-joint-recess)" stroke="#454a47" stroke-width="1"/>
                    <rect x="${f(bx + 3)}" y="12" width="${f(slotW - 6)}" height="76" rx="3" ry="14" fill="#090c0b"/>
                    <path d="M${f(bx + 4)} 29Q${f(bx + slotW / 2)} 13 ${f(bx + slotW - 4)} 29" fill="none" stroke="#000" stroke-opacity=".7" stroke-width="8"/>
                    <path d="M${f(bx + 5)} 79Q${f(bx + slotW / 2)} 96 ${f(bx + slotW - 5)} 79" fill="none" stroke="#707a73" stroke-opacity=".4" stroke-width="2"/>`;
                for (const sx of [bx + 3, bx + slotW - 7]) {
                    out += `<rect x="${f(sx)}" y="31" width="4" height="38" rx="1" ry="7" fill="url(#bbc-collar-rim)"/>
                        <rect x="${f(sx + .8)}" y="36" width="2.4" height="28" rx=".6" ry="5" fill="#020403"/>
                        <path d="M${f(sx + 1)} 61h2" stroke="#768079" stroke-opacity=".6" stroke-width="1.5"/>`;
                }
                continue;
            }

            const gx = bx + termW, gw = slotW - 2 * termW;
            const gy = by, gh = slotH;
            const railH = CAP_RAIL_H;
            const winY = gy + railH, winH = gh - railH * 2;
            const fillInset = CAP_FILL_INSET;
            const fy = winY + fillInset, fh = winH - fillInset * 2;

            const fid = colorKey[color];
            const fillId = fid === 's' ? 's' : (fid + (lit ? 'L' : 'D'));

            // Glow filter is safe to leave static — the sweep animation lives in the HTML overlay, not here.
            if (color) {
                out += `<rect x="${f(gx - 1)}" y="${winY}" width="${f(gw + 2)}" height="${winH}" rx="3" ry="9" fill="#0b0e0c"/>`;
                if (lit && color !== 'silver') out += `<g filter="url(#bbc-tube-glow)">`;
                out += `<rect x="${f(gx)}" y="${fy}" width="${f(gw)}" height="${fh}" rx="2" ry="7" fill="url(#bbc-${fillId})"/>`;
                if (lit && color !== 'silver') out += `</g>`;
                out += `<rect x="${f(gx)}" y="${fy}" width="${f(gw)}" height="${fh}" rx="2" ry="7" fill="url(#${color === 'silver' ? 'bbc-glass' : 'bbc-tube-glass'})"/>`;
                if (color !== 'silver') {
                    out += `<rect x="${f(gx + 2)}" y="${f(fy + fh * .19)}" width="${f(gw - 4)}" height="${f(fh * .055)}" rx="1" fill="url(#bbc-glass-highlight)"/>`;
                }
            } else {
                out += `<rect x="${f(gx - 1)}" y="${winY}" width="${f(gw + 2)}" height="${winH}" rx="3" ry="9" fill="#acc5c0" fill-opacity=".06" stroke="#a2bab3" stroke-opacity=".35" stroke-width="1"/>`;
                out += `<rect x="${f(gx)}" y="${fy}" width="${f(gw)}" height="${fh}" rx="2" ry="7" fill="url(#bbc-tube-glass)" opacity=".65"/>`;
                out += `<rect x="${f(gx + 2)}" y="${f(fy + fh * .19)}" width="${f(gw - 4)}" height="${f(fh * .055)}" rx="1" fill="url(#bbc-glass-highlight)"/>`;
            }
            out += `<path d="M${f(bx)} 27H${f(bx + slotW)}V34H${f(bx)}Z M${f(bx)} 66H${f(bx + slotW)}V73H${f(bx)}Z" fill="#050806" fill-opacity=".72"/>`;
            out += `<path d="M${f(bx)} 4H${f(bx + slotW)}V30H${f(bx)}Z M${f(bx)} 70H${f(bx + slotW)}V96H${f(bx)}Z" fill="url(#bbc-term)"/>`;
            out += `<path d="M${f(bx)} 25H${f(bx + slotW)}V30H${f(bx)}Z" fill="#101610" fill-opacity=".75"/><path d="M${f(bx)} 70H${f(bx + slotW)}V75H${f(bx)}Z" fill="#a6afa1" fill-opacity=".35"/>`;
            out += `<path d="M${f(bx + 1)} 24H${f(bx + slotW - 1)} M${f(bx + 1)} 71H${f(bx + slotW - 1)}" stroke="#b4bcb4" stroke-opacity=".4" stroke-width="1"/><path d="M${f(bx + 1)} 6H${f(bx + slotW - 1)} M${f(bx + 1)} 94H${f(bx + slotW - 1)}" stroke="#080b09" stroke-opacity=".5" stroke-width="1"/>`;
            // Collars cover the glass ends.
            for (const [tx, innerX] of [[bx, gx - 1], [bx + slotW - termW, gx + gw]]) {
                out += `<rect x="${f(tx)}" y="${by}" width="${termW}" height="${slotH}" rx="1.5" ry="5" fill="url(#bbc-term)"/>`;
                const rimX = tx === bx ? tx + termW - 2 : tx;
                out += `<rect x="${f(tx)}" y="${by}" width="${termW}" height="${slotH}" rx="1.5" ry="5" fill="url(#bbc-collar-depth)"/>
                    <path d="M${f(tx + 1.4)} ${by + 5}v${slotH - 10} M${f(tx + 3.2)} ${by + 3}v${slotH - 6}" stroke="#080b0d" stroke-opacity=".5" stroke-width=".45"/>
                    <rect x="${f(rimX)}" y="${by + 3}" width="2" height="${slotH - 6}" rx=".6" ry="4" fill="url(#bbc-collar-rim)"/>
                    <path d="M${f(tx + .8)} ${by + 5}v${slotH * .23}" stroke="#edf2f3" stroke-opacity=".5" stroke-width=".55"/>`;
                out += `<rect x="${f(innerX)}" y="${by + 4}" width="1" height="${slotH - 8}" fill="#101310"/><path d="M${f(tx + 2)} ${by + 8}v${slotH - 16}" stroke="#b7bcb5" stroke-opacity=".28" stroke-width=".8"/>`;
            }
            if (lit && color && color !== 'silver') {
                const bloom = { green: '#a5ff52', gold: '#ffda61', diamond: '#b7f3e2' }[color];
                out += `<rect x="${f(gx + 1)}" y="32" width="${f(gw - 2)}" height="36" rx="3" ry="10" fill="${bloom}" opacity=".4" filter="url(#bbc-end-bloom)"/>`;
                for (const edge of [gx + .5, gx + gw - .5]) {
                    out += `<ellipse cx="${f(edge)}" cy="50" rx="3" ry="24" fill="${bloom}" opacity="1" filter="url(#bbc-end-bloom)"/>`;
                }
            }
            const clipX = bx + slotW * .35, clipW = slotW * .3;
            out += buildTubeBrackets(clipX, clipW);
            if (animated && lit && color && color !== 'silver') {
                // Keep the sweep behind the retaining brackets.
                const cl = f((clipX - 2 - gx) / gw * 100), cr = f((clipX + clipW + 2 - gx) / gw * 100);
                const ct = f((43 - fy) / fh * 100), cb = f((57 - fy) / fh * 100);
                const rt = f((34 - fy) / fh * 100), rb = f((66 - fy) / fh * 100);
                overlay += `<div class="bbgl-cap-win" style="left:${CAP_WIN_LEFT_PCT[i].toFixed(2)}%;width:${CAP_WIN_WIDTH_PCT.toFixed(2)}%;top:${CAP_WIN_TOP_PCT.toFixed(2)}%;height:${CAP_WIN_HEIGHT_PCT.toFixed(2)}%;clip-path:polygon(0 ${rt}%,${cl}% ${rt}%,${cl}% ${ct}%,${cr}% ${ct}%,${cr}% ${rt}%,100% ${rt}%,100% ${rb}%,${cr}% ${rb}%,${cr}% ${cb}%,${cl}% ${cb}%,${cl}% ${rb}%,0 ${rb}%)">` +
                    `<div class="bbgl-cap-sweep bbgl-cap-sweep-pass-fwd bbgl-cap-sweep-${color}" style="animation-delay:${CAP_WIN_DELAY_FWD_S[i].toFixed(3)}s"></div>` +
                    `<div class="bbgl-cap-sweep bbgl-cap-sweep-pass-bwd bbgl-cap-sweep-${color}" style="animation-delay:${CAP_WIN_DELAY_BWD_S[i].toFixed(3)}s"></div>` +
                    `</div>`;
            }
        }

        const svg = `<svg class="bbgl-cap-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${CAP_BAR_DEFS}${out}</svg>`;
        const html = overlay ? svg + `<div class="bbgl-cap-overlay">${overlay}</div>` : svg;
        _capBarCache.set(cacheKey, html);
        return html;
    }

    function updateSummaryCharts() {
        const mBtn = document.getElementById('month-stats-btn');
        const yBtn = document.getElementById('year-stats-btn');
        if (!mBtn || !yBtn) return;
        const y = calendarState.year, m = calendarState.month;
        mBtn.innerHTML = buildChartSVG(DataController.getSlice('MONTH', CONSTANTS.MONTHS[m], y));
        yBtn.innerHTML = buildChartSVG(DataController.getSlice('YEAR', String(y)));
        const aBtn = document.getElementById('all-time-btn');
        if (aBtn) aBtn.innerHTML = buildChartSVG(DataController.getSlice('ALL', 'All-Time'));
        
        mBtn.setAttribute('data-tooltip-html', generateRichTooltip(DataController.getSlice('MONTH', CONSTANTS.MONTHS[m], y)));
        yBtn.setAttribute('data-tooltip-html', generateRichTooltip(DataController.getSlice('YEAR', String(y))));
        if (aBtn) aBtn.setAttribute('data-tooltip-html', generateRichTooltip(DataController.getSlice('ALL', 'All-Time')));

        const activeL = viewState.activeViewLabel;
        mBtn.classList.toggle('active', activeL === CONSTANTS.MONTHS[m]);
        yBtn.classList.toggle('active', activeL === String(y));
        if (aBtn) aBtn.classList.toggle('active', activeL === 'All-Time');
    }

    // Library pages: 1 Instant Gains + Gym Boosters, 2 Energy + Happy Boosters, 3 and 4 One-Time
    // Perks + 31-Day Buffs, split evenly across the two pages.
    // See computeBookData() for when a book counts as read.
    const LIBRARY_PAGE_COUNT = 4;

    function gotoLibraryPage(p) {
        const next = Math.max(0, Math.min(LIBRARY_PAGE_COUNT - 1, p));
        if (next === (viewState.libraryPage || 0)) return;
        viewState.libraryPage = next;
        saveViewState();
        renderLibrary();
    }

    function renderLibrary() {
        const c = dom.libraryContainer;
        if (!c) return;
        const bookData = DataController.getBookData();
        const info = id => bookData.books[id] || { state: 'unread' };
        // Unread books grey out; a readPeriod book still being read shows a marker; a finished readPeriod
        // book, or any other book once used, gets the ✓.
        const stateClass = id => ({ read: ' is-read', reading: ' is-reading', unread: ' is-unread' })[info(id).state];
        // "In progress" covers both a readPeriod book still being read and any other book whose 31 days
        // are still running; ✓ once it's done.
        const PROGRESS_MARK = '<span class="bbgl-lib-reading">In progress</span>',
            READ_MARK = '<span class="bbgl-lib-check" aria-label="Read">✓</span>';
        const inProgress = (meta, d) => d.state === 'reading' ||
            (d.state === 'read' && !meta.readPeriod && (d.start != null || d.end != null) && (d.end == null || d.end > nowTs));
        const marker = id => {
            const d = info(id);
            if (d.state === 'unread') return '';
            return inProgress(BOOK_META[id], d) ? PROGRESS_MARK : READ_MARK;
        };
        // Click-to-copy for any book that has been used, read or still being read (and a section header once any of its books has).
        // Each copyable element carries data-lib-copy, a key into runtime._libCopy; headers also
        // list the rows to flash. Text follows the achievements copies: header, blank line, then
        // "Name:" with its details indented beneath.
        const LIB_H = '👑BBGL Library';
        const copyMap = {};
        runtime._libCopy = copyMap;
        const COPY_STAT = { str: 'Strength', def: 'Defense', spd: 'Speed', dex: 'Dexterity' };
        const COPY_ABBR = { str: 'Str', def: 'Def', spd: 'Spd', dex: 'Dex' };
        const nowTs = Math.floor(Date.now() / 1000);
        const fmtDay = ts => Formatter.datePretty(Formatter.dateLogical(ts * 1000));
        const copyBlock = (name, desc, meta, d) => {
            const lines = [name + ':', '  ' + desc];
            if (d.state === 'reading') {
                // A readPeriod book mid-read: nothing has paid out yet.
                lines.push('  Started: ' + (d.start != null ? fmtDay(d.start) : 'Before log'));
                lines.push('  Status: In progress');
            } else if (meta.readPeriod) {
                if (d.end != null) lines.push('  Finished: ' + fmtDay(d.end));
                if (meta.training === 'stat') lines.push('  ' + COPY_STAT[meta.stat] + ': +' + Formatter.number(d.gain || 0));
            } else {
                const from = d.start != null ? fmtDay(d.start) : 'Before log';
                const to = d.end == null || d.end > nowTs ? 'Current' : fmtDay(d.end);
                if (d.start != null || d.end != null) lines.push('  ' + from + ' – ' + to);
                const stats = d.stats || {};
                // Gym-gains books follow each gain with the book's share of it.
                const fromBook = k => d.extra ? ' (+' + Formatter.number((d.extra[k]) || 0) + ' from book)' : '';
                if (meta.training === 'gym' && meta.stat) {
                    lines.push('  ' + COPY_STAT[meta.stat] + ': +' + Formatter.number(stats[meta.stat] || 0) + fromBook(meta.stat));
                } else if (meta.training) {
                    ['str', 'def', 'spd', 'dex'].filter(k => stats[k] != null).forEach(k => lines.push('  ' + COPY_ABBR[k] + ': +' + Formatter.number(stats[k]) + fromBook(k)));
                    lines.push('  Total: +' + Formatter.number(stats.tot || 0) + fromBook('tot'));
                }
            }
            return lines.join('\n');
        };
        // Memories And Mammaries repeating a book with no tracked data (an Other Books book) has no row of
        // its own; its checklist entry describes the book it repeated instead, and both get the gold tint.
        const memInfo = info(MEMORIES_BOOK);
        const memOther = memInfo.repeats != null && BOOK_META[memInfo.repeats] && !BOOK_META[memInfo.repeats].training ? memInfo.repeats : null;
        const bookDesc = id => id === MEMORIES_BOOK && memOther != null ? 'Repeated ' + BOOK_META[memOther].name : (BOOK_META[id].short || BOOK_META[id].effect);
        const bookBlock = id => copyBlock(BOOK_META[id].name, bookDesc(id), BOOK_META[id], info(id));
        const isCopyable = id => info(id).state !== 'unread';
        // Returns the attributes for a row: registered in the copy map once the book has been used.
        const rowCopyAttrs = id => {
            if (!isCopyable(id)) return '';
            copyMap['b' + id] = LIB_H + '\n\n' + bookBlock(id);
            return ` data-lib-copy="b${id}"`;
        };
        const headerCopyAttrs = (key, title, ids) => {
            const readIds = ids.filter(isCopyable);
            if (!readIds.length) return '';
            copyMap[key] = LIB_H + '\n\n— ' + title + ' —\n' + readIds.map(bookBlock).join('\n\n');
            return ` data-lib-copy="${key}" data-lib-flash="${readIds.map(id => 'b' + id).join(' ')}" data-tooltip="Click any read book or this title to copy its data to your clipboard."`;
        };
        if (!runtime._libCopyWired) {
            runtime._libCopyWired = true;
            c.addEventListener('click', e => {
                const el = e.target.closest('[data-lib-copy]');
                if (!el || !runtime._libCopy) return;
                const txt = runtime._libCopy[el.getAttribute('data-lib-copy')];
                if (!txt) return;
                const flashKeys = (el.getAttribute('data-lib-flash') || '').split(' ').filter(Boolean);
                const targets = flashKeys.length ? flashKeys.map(k => c.querySelector(`[data-lib-copy="${k}"]`)).filter(Boolean) : [el];
                navigator.clipboard.writeText(txt).then(() => flashCopied(targets.length ? targets : el));
            });
        }
        const page = Math.max(0, Math.min(LIBRARY_PAGE_COUNT - 1, viewState.libraryPage || 0));
        const ind = document.getElementById('bbgl-lib-pagination');
        if (ind) {
            ind.innerHTML = '';
            for (let i = 0; i < LIBRARY_PAGE_COUNT; i++) {
                const d = document.createElement('div');
                d.className = 'pg-dot' + (i === page ? ' active' : '');
                d.onclick = () => gotoLibraryPage(i);
                ind.appendChild(d);
            }
        }
        retryToolbarPaginationLayout(() => dom.topPanel && dom.topPanel.classList.contains('viewing-library'));
        // Page 3: every non-training book as a two-column checklist, filled top-to-bottom.
        const GROUPS = page === 0 ? [
            ['stat', 'Instant Gains'],
            ['gym', 'Gym Boosters']
        ] : [
            ['energy', 'Energy Boosters'],
            ['happy', 'Happy Boosters']
        ];
        const STAT_NAME = { str: 'Strength', def: 'Defense', spd: 'Speed', dex: 'Dexterity', tot: 'Total' };
        const STAT_ABBR = { str: 'Str', def: 'Def', spd: 'Spd', dex: 'Dex', tot: 'Tot' };
        // One number with its stat label beside it. Both formats are emitted and CSS picks one: full
        // number and label, or abbreviated (compact, or a multi-cell group that didn't fit).
        // `extra` (gym-gains books): the book's share of `gain`, shown in parentheses beneath the cell.
        const cell = (key, gain, extra) => {
            const full = gain == null ? '—' : '+' + Formatter.number(gain);
            const abbr = gain == null ? '—' : '+' + Formatter.achAbbr(gain, ACH_FMT.gains);
            const extraHTML = gain != null && extra != null ?
                `<span class="bbgl-lib-extra"><span class="x-full">(+${Formatter.number(extra)}<span class="x-word"> from book</span>)</span><span class="x-abbr">(+${Formatter.achAbbr(extra, ACH_FMT.gains)})</span></span>` : '';
            return `<div class="bbgl-lib-cell s-${key}"><span class="bbgl-lib-val v-full">${full}</span><span class="bbgl-lib-val v-abbr">${abbr}</span><span class="bbgl-lib-stat l-full">${STAT_NAME[key]}</span><span class="bbgl-lib-stat l-abbr">${STAT_ABBR[key]}</span>${extraHTML}</div>`;
        };
        // The book's data, from computeBookData(). Stat books: the jump in their stat at payout.
        // Single-stat gym books: the extra gains on their stat. Get Hard Or Go Home, energy and happy
        // books: a cell per stat trained in the window. `d` is the book's own data, or the Memories
        // row's data for the book it repeated.
        // Only stats with a recorded gain get a cell; a book with none returns '' and shows no data.
        const dataCell = (b, d) => {
            d = d || {};
            let html = '';
            const stats = d.stats || {};
            if (b.training === 'stat') {
                if (d.gain != null) html = `<div class="bbgl-lib-cells">${cell(b.stat, d.gain)}</div>`;
            } else if (b.training === 'gym' && b.stat) {
                if (stats[b.stat] != null) html = `<div class="bbgl-lib-cells">${cell(b.stat, stats[b.stat], d.extra && d.extra[b.stat])}</div>`;
            } else if (b.training === 'gym' || b.training === 'energy' || b.training === 'happy') {
                const keys = ['str', 'def', 'spd', 'dex'].filter(k => stats[k] != null);
                if (keys.length) html = `<div class="bbgl-lib-cells is-multi">${keys.map(k => cell(k, stats[k], d.extra && d.extra[k])).join('')}</div>`;
            }
            // No data yet: an invisible stand-in the same shape as the real data (with a from-book line
            // for gym-gains books), so the title sits where it would once the book has data and rows
            // stay aligned beside ones that do.
            if (!html) {
                const extra = b.training === 'gym' ? 0 : undefined;
                return `<div class="bbgl-lib-cells is-placeholder" aria-hidden="true">${cell(b.stat || 'str', 0, extra)}</div>`;
            }
            const note = d.uncertain ? 'This gain could not be measured precisely: a train around the payout is missing from the log.' :
                d.partial ? 'May be incomplete: part of this book\'s period is before your log.' : '';
            return note ? `<div class="bbgl-lib-data-inner is-approx" data-tooltip="${achEsc(note)}">${html}</div>` : html;
        };
        const memRow = bookData.memories;
        // The book's read date or active period, shown after its title. `range` forces the from–to
        // form (Memories' own row, which is always a 31-day period).
        // `fmt` formats each timestamp: fmtDay for the short date, fmtStamp for date + time.
        const dateLine = (b, d, range, fmt = fmtDay) => {
            if (!d || d.state === 'unread') return '';
            if (d.state === 'reading') return 'Started ' + (d.start != null ? fmt(d.start) : 'before log');
            if (b.readPeriod && !range) return d.end != null ? 'Finished ' + fmt(d.end) : '';
            if (d.start == null && d.end == null) return '';
            const from = d.start != null ? fmt(d.start) : 'Before log';
            const to = d.end == null || d.end > nowTs ? 'Current' : fmt(d.end);
            return from + ' – ' + to;
        };
        // Exact time the log recorded, in the player's chosen time zone (TCT or local). The zone is
        // added once at the end of the whole line, and the year only when it isn't this year, which
        // keeps a from–to range short enough to sit beside the title.
        const thisYear = new Date().getUTCFullYear();
        const fmtStamp = ts => {
            const d = new Date(ts * 1000),
                local = TimeManager.useLocal(),
                y = local ? d.getFullYear() : d.getUTCFullYear(),
                day = `${CONSTANTS.MONTHS_SHORT[local ? d.getMonth() : d.getUTCMonth()]} ${local ? d.getDate() : d.getUTCDate()}${y !== thisYear ? ', ' + y : ''}`,
                hh = String(local ? d.getHours() : d.getUTCHours()).padStart(2, '0'),
                mm = String(local ? d.getMinutes() : d.getUTCMinutes()).padStart(2, '0');
            return day + ' ' + hh + ':' + mm;
        };
        // Both date forms are emitted; compact shows the short date, expanded and page mode the
        // exact timestamp.
        const dateHTML = (b, d, range) => {
            const short = dateLine(b, d, range);
            if (!short) return '';
            let full = dateLine(b, d, range, fmtStamp);
            // The zone follows the last timestamp: "Sep 3 09:15 TCT – Current", or at the very end.
            if (/\d:\d/.test(full)) full = / – Current$/.test(full) ? full.replace(/ – Current$/, ' ' + achTimeZoneSuffix() + ' – Current') : full + ' ' + achTimeZoneSuffix();
            return `<span class="d-short">${short}</span><span class="d-full">${full}</span>`;
        };
        // Pages 3-4: the non-training books as a two-column checklist, filled top-to-bottom and split
        // across the two pages, One-Time Perks first then 31-Day Buffs, each getting its own labeled
        // group wherever it lands. Each entry has its date above its title, like the training rows.
        if (page >= 2) {
            // Memories And Mammaries lives here rather than on a training page: when it repeats a
            // training book, its effect gets its own row at the bottom of that book's page.
            // Order groups related effects together (stat/combat, crime, medical, business/travel,
            // personal) rather than raw book-ID order, so the flat checklist reads logically.
            const OTHER_BOOKS_ORDER = [
                748, 749, 750, 751,
                753, 754, 755, 756, 752, 763, 768, 777, 780, 764, 787,
                771, 778, 762, 775, 781,
                765, 769,
                767, 766, 773, 786, 772, 785
            ];
            const allOthers = OTHER_BOOKS_ORDER.filter(id => BOOK_META[id] && (!BOOK_META[id].training || BOOK_META[id].training === 'repeat'));
            const perks = allOthers.filter(id => BOOK_META[id].readPeriod);
            const buffs = allOthers.filter(id => !BOOK_META[id].readPeriod);
            const ordered = perks.concat(buffs);
            const half = Math.ceil(ordered.length / 2);
            const pageItems = page === 2 ? ordered.slice(0, half) : ordered.slice(half);
            const repeatCls = id => memOther == null ? '' : id === MEMORIES_BOOK ? ' is-repeat' : id === memOther ? ' is-repeated' : '';
            const itemDate = id => {
                const date = dateHTML(BOOK_META[id], info(id), id === MEMORIES_BOOK);
                return `<div class="bbgl-lib-stamp"><span class="bbgl-lib-date${date ? '' : ' is-placeholder'}"${date ? '' : ' aria-hidden="true"'}>${date || '&nbsp;'}</span>${marker(id)}</div>`;
            };
            const itemHTML = id => `<div class="bbgl-lib-item${stateClass(id)}${repeatCls(id)}" data-book="${id}"${rowCopyAttrs(id)}>${itemDate(id)}<div class="bbgl-lib-name">${achEsc(BOOK_META[id].name)}</div><div class="bbgl-lib-effect">${achEsc(bookDesc(id))}</div></div>`;
            const OTHER_GROUPS = [['perks', 'One-Time Perks', perks], ['buffs', '31-Day Buffs', buffs]];
            const html = OTHER_GROUPS.map(([key, label, ids]) => {
                const items = pageItems.filter(id => ids.includes(id));
                if (!items.length) return '';
                const rowsPerCol = Math.ceil(items.length / 2);
                return `<div class="bbgl-lib-section" style="--bbgl-lib-panel-rows:${rowsPerCol}"><div class="bbgl-lib-group"${headerCopyAttrs('g' + key + page, label, items)}><span class="bbgl-lib-group-label">${label}</span></div><div class="bbgl-lib-panel"><div class="bbgl-lib-grid" style="--bbgl-lib-rows:${rowsPerCol}">${items.map(itemHTML).join('')}</div></div></div>`;
            }).join('');
            c.innerHTML = `<div class="bbgl-lib-list">${html}</div>`;
            window.requestAnimationFrame(fitLibraryCells);
            return;
        }
        // One book, centred: its date, title and effect as one tight group, then its data.
        // The title text alone is centred; its ✓ / In progress marker hangs off its end (see .bbgl-lib-title).
        const bookHTML = (cls, id, attrs, type, name, mark, effect, data, date) =>
            `<div class="bbgl-lib-row${cls}" data-book="${id}"${attrs} data-type="${type}"><div class="bbgl-lib-stamp"><span class="bbgl-lib-date${date ? '' : ' is-placeholder'}"${date ? '' : ' aria-hidden="true"'}>${date || '&nbsp;'}</span>${mark}</div><div class="bbgl-lib-text"><div class="bbgl-lib-name"><span class="bbgl-lib-title"><span class="bbgl-lib-title-text">${name}</span></span></div><div class="bbgl-lib-effect">${effect}</div></div><div class="bbgl-lib-data">${data}</div></div>`;
        const row = (id, extraCls = '') => {
            const b = BOOK_META[id];
            const repeated = memRow && memRow.repeats === id ? ' is-repeated' : '';
            return bookHTML(stateClass(id) + repeated + extraCls, id, rowCopyAttrs(id), b.training, achEsc(b.name), marker(id), achEsc(b.short || b.effect), dataCell(b, info(id)), dateHTML(b, info(id)));
        };
        // Memories And Mammaries' own row, once read, when the book it repeated is a training book:
        // its title, with the repeated book's effect measured over Memories' own period. It goes at the
        // bottom of the section holding the book it repeated and takes that book's format throughout:
        // its data, its date style, its read state and marker, and its copy text. A repeated readPeriod
        // book (a stat book) is still "being read" until Memories' period ends, when it pays out.
        let memHTML = '',
            memType = null;
        if (memRow && GROUPS.some(([type]) => type === BOOK_META[memRow.repeats].training)) {
            const mem = BOOK_META[MEMORIES_BOOK],
                rep = BOOK_META[memRow.repeats];
            const memD = Object.assign({}, memRow, { state: rep.readPeriod && memRow.end > nowTs ? 'reading' : 'read' });
            const memMark = inProgress(rep, memD) ? PROGRESS_MARK : READ_MARK;
            copyMap.bMem = LIB_H + '\n\n' + copyBlock(mem.name, 'Repeated ' + rep.name, rep, memD);
            memHTML = bookHTML(` is-${memD.state} is-repeat`, MEMORIES_BOOK, ' data-lib-copy="bMem"', rep.training, achEsc(mem.name), memMark, 'Repeated ' + achEsc(rep.name), dataCell(rep, memD), dateHTML(rep, memD));
            memType = rep.training;
        }
        // One bordered section per group: the group label runs up a spine on its left, beside the group's
        // books. Single-stat books share a two-column grid that takes one row's share of the height per
        // grid row; every other book, and a Memories row, gets a full-width row. Each section is weighted
        // by its row count so every row on the page keeps an equal share of the height.
        const html = GROUPS.map(([type, label]) => {
            // Single-stat books follow the ledger's stat order (Str, Def, Spd, Dex), left to right then
            // top to bottom; item-id order puts Speed before Defense for the stat books.
            const statRank = id => BOOK_META[id].stat ? STAT_KEYS.indexOf(BOOK_META[id].stat) : STAT_KEYS.length;
            const ids = TRAINING_BOOKS.filter(id => BOOK_META[id].training === type).sort((x, y) => statRank(x) - statRank(y));
            if (!ids.length) return '';
            const paired = ids.filter(id => BOOK_META[id].stat),
                single = ids.filter(id => !BOOK_META[id].stat),
                pairRows = Math.ceil(paired.length / 2),
                lastRowFrom = (pairRows - 1) * 2,
                mem = memType === type ? memHTML : '';
            const pairs = paired.length ? `<div class="bbgl-lib-pairs" style="--bbgl-lib-pair-rows:${pairRows}">${paired.map((id, i) => row(id, i >= lastRowFrom ? ' is-last-row' : '')).join('')}</div>` : '';
            return `<div class="bbgl-lib-section" style="--bbgl-lib-panel-rows:${pairRows + single.length + (mem ? 1 : 0)}"><div class="bbgl-lib-group" data-type="${type}"${headerCopyAttrs('g' + type, label, ids)}><span class="bbgl-lib-group-label">${label}</span></div><div class="bbgl-lib-panel">${pairs}${single.map(id => row(id)).join('')}${mem}</div></div>`;
        }).join('');
        c.innerHTML = `<div class="bbgl-lib-list">${html}</div>`;
        window.requestAnimationFrame(fitLibraryCells);
        if (!runtime._libFitObserver && window.ResizeObserver) {
            runtime._libFitObserver = new ResizeObserver(() => window.requestAnimationFrame(fitLibraryCells));
            runtime._libFitObserver.observe(c);
        }
    }

    // Multi-cell groups keep full numbers unless they don't fit their column with a little room to
    // spare; then they switch to abbreviated numbers and short labels.
    function fitLibraryCells() {
        const c = dom.libraryContainer;
        if (!c) return;
        // A group label that's longer than its spine is tall shrinks to fit.
        c.querySelectorAll('.bbgl-lib-group-label').forEach(l => {
            l.style.fontSize = '';
            const room = l.parentElement.clientHeight, need = l.scrollHeight;
            if (room > 0 && need > room) l.style.fontSize = (parseFloat(getComputedStyle(l).fontSize) * room / need).toFixed(2) + 'px';
        });
        // Other Books: an entry with a date reserves the height of its stamp's letters (~.75em, not the
        // whole line box) so its title and effect centre in the space under it.
        c.querySelectorAll('.bbgl-lib-item').forEach(it => {
            it.classList.remove('is-stamp-offset');
            it.style.removeProperty('--bbgl-lib-date-h');
            const date = it.querySelector('.bbgl-lib-date');
            if (!date || date.classList.contains('is-placeholder') || !date.offsetWidth) return;
            it.classList.add('is-stamp-offset');
            it.style.setProperty('--bbgl-lib-date-h', (parseFloat(getComputedStyle(date).fontSize) * .75).toFixed(2) + 'px');
        });
        // The corner stamp runs as far left as the card allows; once its date no longer fits that width,
        // the stamp's type shrinks to fit rather than ellipsising, down to 70% of its size.
        c.querySelectorAll('.bbgl-lib-stamp').forEach(st => {
            st.style.fontSize = '';
            const date = st.querySelector('.bbgl-lib-date');
            if (!date || date.classList.contains('is-placeholder')) return;
            // The marker is measured directly each pass: the stamp's own scrollWidth is clipped along with
            // the date, so deriving the marker's width from it reported more room than there is and the
            // shrink never ran. Two passes, because shrinking the type shrinks the marker with it.
            const markOf = () => {
                const m = st.querySelector('.bbgl-lib-check, .bbgl-lib-reading');
                return m ? m.getBoundingClientRect().width + (parseFloat(getComputedStyle(m).marginLeft) || 0) : 0;
            };
            const floor = parseFloat(getComputedStyle(st).fontSize) * .7;
            for (let pass = 0; pass < 2; pass++) {
                const avail = st.clientWidth - markOf(),
                    need = date.scrollWidth;
                if (!(avail > 0) || need <= avail + .5) break;
                const base = parseFloat(getComputedStyle(st).fontSize),
                    next = Math.max(base * (avail / need), floor);
                if (next >= base - .1) break;
                st.style.fontSize = next.toFixed(2) + 'px';
            }
        });
        c.querySelectorAll('.bbgl-lib-cells.is-multi').forEach(g => {
            g.classList.remove('is-tight');
            g.classList.add('is-measure');
            const box = g.closest('.bbgl-lib-data');
            if (box && g.scrollWidth + 8 > box.clientWidth) g.classList.add('is-tight');
            g.classList.remove('is-measure');
        });
    }

    function renderPanelContent() {
        // The Library covers the calendar; switchView() renders it once on the way out. Data
        // updates still refresh the Library itself.
        if (dom.topPanel && dom.topPanel.classList.contains('viewing-library')) {
            runtime._calendarStale = true;
            renderLibrary();
            return;
        }
        runtime._calendarStale = false;
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
        dom.panel.style.setProperty('--bbgl-header-img', `url('${SEASONAL_HEADER_IMGS[m]}')`);
        const isSummer = m >= 5 && m <= 7;
        dom.panel.style.setProperty('--bbgl-header-crop-b', isSummer ? '8px' : '0px');
        dom.panel.style.setProperty('--bbgl-header-pos-y', isSummer ? 'top' : 'bottom');
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
        c.style.setProperty('--bg-url', `url(${CAL_IMG_BASE}cal-grid-futr.webp)`);
        const todayStr = Formatter.dateLogical();
        // Per-render constants that renderCell() used to recompute for every one of the 42 cells:
        // dateLogical() allocates a Date and runs three TimeManager calls, getWarMarkers()'s memo
        // check costs a localStorage read plus a getActiveHistory() before it can even return the
        // cached map, and firstDate only ever needed the timeline's first entry. None of them can
        // change part-way through a synchronous render.
        const _tl = DataController.getTimeline();
        const cellCtx = {
            today: todayStr,
            warMarkers: getWarMarkers(),
            bookMarkers: getBookMarkers(),
            firstDate: _tl.length > 0 ? _tl[0].date : (s ? s.today.date : null)
        };
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
                if (isArch) rd.style.setProperty('--bg-url', `url(${CAL_IMG_BASE}cal-grid-past.jpg)`);
                let wdb = [];
                batch.forEach(function tickWeekCell(i, cIdx) {
                    renderCell(rd, i.y, i.m, i.d, i.g, ridx, cIdx, cellCtx);
                    wdb.push({
                        date: Formatter.dateISO(i.y, i.m, i.d),
                        data: i.p
                    });
                });
                // One .bbgl-week per row + its weekly bar, isolated (see .bbgl-week in CSS_STYLES) so
                // the bar's z-index and any hover layer stay inside this week.
                const wk = document.createElement('div');
                wk.className = 'bbgl-week';
                wk.appendChild(rd);
                injectWeeklyBar(wk, wdb);
                frag.appendChild(wk);
                batch = [];
                ridx++;
            }
        });
        c.appendChild(frag);
        // Consume any pending persisted-selection restore (set by renderCell()/injectWeeklyBar()
        // above) now that the built cells/bars are actually attached to the live DOM — calling
        // openHistory() any earlier would leave updateCellSelection()'s querySelector unable to
        // find the target, since it'd still be sitting in the detached fragment at that point.
        if (runtime._pendingHistoryRestore) {
            const { sl, label } = runtime._pendingHistoryRestore;
            runtime._pendingHistoryRestore = null;
            openHistory(sl, label);
        }
        const tp = dom.topPanel;
        if (tp) {
            if (tp.classList.contains('viewing-graph')) GraphController.draw();
            else if (tp.classList.contains('viewing-stickers')) renderStickers();
            else if (tp.classList.contains('viewing-achievements')) {
                // Most calls here are a routine data tick (heartbeat, dev Level Up, today's exp
                // climbing) with nothing about the titles page actually different — those get the
                // cheap in-place rank-readout patch instead of achRefreshPageDom()'s full rebuild
                // (see renderRankReadoutLive()/achLiveInputsFingerprint() above). Anything that
                // really changes the page (new E, a title pick, the mode toggle, switching
                // sub-pages) already calls achRefreshPageDom()/renderAchievements() directly at its
                // own call site, which also means the fingerprint here is stale for it — falling
                // through to the real rebuild is the correct outcome, not just a safe fallback.
                const canPatchLive = runtime._achPage === 0 && runtime._achCache &&
                    achLiveInputsFingerprint() === runtime._achLiveFingerprint;
                if (!canPatchLive || !renderRankReadoutLive()) renderAchievements();
            }
        }
        if (!calendarState.selectedData) renderStats(DataController.getSlice('DAY', Formatter.dateLogical()), Formatter.dateLogical());
        else renderStats(calendarState.selectedData, calendarState.selectedLabel);
        Perf.end('renderPanel');
        // Always silent here: a real Train click's animated update is driven by the
        // bbgl:dataUpdated listener (10-section-ix-init.js), which calls updateLevelBar()
        // with the correct flag BEFORE calling this function — by the time we get here,
        // _isAnimatingLevel is already set if an animation is in flight, so this call's
        // own silent branch backs off instead of stomping it. Every other caller of
        // renderPanelContent() (panel open, settings changes, etc.) is not a live-training
        // moment and should just snap to the correct value.
        updateLevelBar(true);
        updateSummaryCharts();
    }

    // Ranked-war calendar markers. Buckets each stored war's start/end timestamp into the same
    // logical date the calendar grid uses, memoized on the raw localStorage string so it only
    // recomputes when the stored war data actually changes.
    // `raw` starts as a sentinel (false) that no localStorage value can equal — otherwise an
    // absent key (getItem -> null) would match an initial null and return the uninitialized map.
    let _warMarkerCache = { raw: false, cutoff: -1, map: {} };
    // Book post-its. A book window lands on at most two days: the day it was used and the day it
    // ended. Which start marker it gets follows `training` - the tracked books on the library's
    // first two pages; which end marker it gets follows `readPeriod`, since those pay a perk out on
    // completion while every other book's end is just its 31 days running out. Memories And
    // Mammaries takes the kind of the book it repeats, the same way its library row does. Ends in
    // the future (a buff still running) aren't events yet, so they don't get a post-it.
    // The library's first two pages are built from the `stat`/`gym`/`energy`/`happy` training
    // groups; `repeat` is not one of them, so Memories falls through to the Other Books pages. Same
    // test as the allOthers filter that renders them.
    const isTrainingBook = meta => !!meta.training && meta.training !== 'repeat';

    function getBookMarkers() {
        const books = (DataController.getBookData() || {}).books || {};
        const nowTs = Math.floor(Date.now() / 1000);
        const map = {};
        const mark = (ts, key) => {
            if (ts == null || ts > nowTs) return;
            const ds = Formatter.dateLogical(ts * 1000);
            (map[ds] || (map[ds] = {}))[key] = true;
        };
        Object.keys(books).forEach(k => {
            const id = Number(k),
                d = books[id],
                meta = BOOK_META[id];
            if (!meta || !d || d.state === 'unread') return;
            // Memories And Mammaries has no effect of its own - it takes the one from the book read
            // before it - so it gets whichever post-its that book would have got, start and end
            // alike. Until the log says what it repeated, its own metadata stands, which lands it on
            // the perk side: `repeat` isn't one of the training groups the library's first two pages
            // are built from, so Memories is an Other Book there and should read as one here too.
            const eff = (id === MEMORIES_BOOK && d.repeats != null && BOOK_META[d.repeats]) || meta;
            mark(d.start, isTrainingBook(eff) ? 'trainStart' : 'perkStart');
            mark(d.end, eff.readPeriod ? 'perkReceived' : 'perkEnded');
        });
        return map;
    }

    function getWarMarkers() {
        const raw = localStorage.getItem(KEYS.WARS_DATA);
        const meta = getActiveHistory().meta;
        const cutoff = meta && meta.logStartDate ? meta.logStartDate : 0;
        if (raw === _warMarkerCache.raw && cutoff === _warMarkerCache.cutoff) return _warMarkerCache.map || {};
        const factionHistory = getFactionHistory();
        const map = {};
        if (raw) {
            try {
                const wars = JSON.parse(raw);
                Object.values(wars).forEach(w => {
                    if (!w || !w.war || !w.war.end) return;
                    if (w.war.end < cutoff) return;
                    if (!wasInFactionDuringWar(factionHistory, w.factionId, w.war.end)) return;
                    if (w.war.start && w.war.start >= cutoff) {
                        const ds = Formatter.dateLogical(w.war.start * 1000);
                        (map[ds] = map[ds] || {}).warStart = true;
                    }
                    const ds = Formatter.dateLogical(w.war.end * 1000);
                    const entry = (map[ds] = map[ds] || {});
                    if (w.outcome === 'won') entry.warWon = true;
                    else if (w.outcome === 'lost') entry.warLost = true;
                    else entry.warEnd = true;
                });
            } catch (e) { /* malformed war data — no markers */ }
        }
        _warMarkerCache = { raw, cutoff, map };
        return map;
    }

    // `ctx` carries the per-render constants hoisted out of this function by renderPanelContent()
    // (see there) — single call site, so the extra parameter stays contained.
    // Event post-it stack geometry, in % of the day cell. These pair with .bbgl-event-post-it in
    // 04-section-iii-styles.js, which is 70% tall - so a post-it's top can sit anywhere in 0-30%
    // before it hangs out of the cell. POST_IT_TOP is where a lone post-it sits and every stack
    // stays centred on it. The two limits do different jobs: POST_IT_STEP is how far apart a small
    // stack wants to sit, and POST_IT_BAND is the total spread a large one compresses into, which
    // is what actually keeps the last post-it's bottom edge inside the cell (1 + 28 + 70 = 99).
    const POST_IT_TOP = 15,
        POST_IT_STEP = 18,
        POST_IT_BAND = 28,
        POST_IT_LIFT = 0.5;

    function renderCell(cont, y, m, d, g, rIdx, cIdx, ctx) {
        const ds = Formatter.dateISO(y, m, d),
            sl = DataController.getSlice('DAY', ds),
            isFlipped = cont.classList.contains('bbgl-row-archived'),
            cell = document.createElement('div');
        cell.className = 'bbgl-day-cell' + (isFlipped ? ' is-archived' : '') + (g ? ' ghost-cell' : '');
        cell.dataset.date = ds;
        // .jewel-shine / .jewel-shine-over / .sticker-shine are opacity:0 at rest and only ever
        // shown via the .shimmer-active/.is-viewing CSS combinators (see CSS_STYLES), so eagerly
        // building them for every decorated cell cost a resting mix-blend-mode compositing layer
        // with nothing to show for it. buildShine lazily creates them (once, idempotent) the
        // first time this cell actually needs to show them; every path that can grant a cell
        // .shimmer-active/.is-viewing (this cell's own mouseenter, updateCellSelection, and the
        // touch-scrub tooltip handler in 10-section-ix-init.js) calls cell._buildShine. No
        // teardown is needed — month navigation rebuilds the whole grid via innerHTML anyway.
        let buildShine = null;
        // Hover effects wait for hover intent (bindHoverIntent, 03-section-ii-utils.js):
        // .is-hover-intent stands in for :hover in the cell's CSS (post-it peel, day-number
        // highlight), and the shine starts at the same moment — so a fast sweep across the grid
        // starts none of it.
        bindHoverIntent(cell, () => {
            cell.classList.add('is-hover-intent');
            if (userConfig.animations) {
                cell.classList.add('shimmer-active');
                if (buildShine) buildShine();
            }
        }, () => {
            cell.classList.remove('is-hover-intent');
            if (!cell.classList.contains('is-viewing')) cell.classList.remove('shimmer-active');
        });
        const isToday = (ds === ctx.today);
        if (isFlipped && sl.meta.tier > 0) {
            let url = `url(${CAL_IMG_BASE}cal-grid-grn.jpg)`;
            if (sl.meta.tier === 2) url = `url(${CAL_IMG_BASE}cal-grid-gold.jpg)`;
            else if (sl.meta.tier === 3) url = `url(${CAL_IMG_BASE}cal-grid-dmnd.webp)`;
            cell.style.backgroundImage = url;
            cell.style.backgroundSize = "700% 600%";
            cell.style.backgroundPosition = `${(cIdx * (100 / 6)).toFixed(4)}% ${(rIdx * (100 / 5)).toFixed(4)}%`;
        }
        if (!isFlipped && sl.meta.tier > 0) {
            const wrap = document.createElement('div'),
                img = document.createElement('img');
            let tType = 'green',
                url = `${CAL_IMG_BASE}rwrd-grn.webp`;
            if (sl.meta.tier === 2) {
                tType = 'gold';
                url = `${CAL_IMG_BASE}rwrd-gold.webp`;
            } else if (sl.meta.tier === 3) {
                tType = 'diamond';
                url = `${CAL_IMG_BASE}rwrd-dmnd.webp`;
            }
            wrap.className = `jewel-wrapper jewel-type-${tType}`;
            img.className = 'jewel-asset';
            img.src = url;
            wrap.appendChild(img);
            cell.appendChild(wrap);
            cell.classList.add('is-plate');
            buildShine = () => {
                if (wrap.querySelector('.jewel-shine')) return;
                const sh = document.createElement('div');
                sh.className = 'jewel-shine';
                sh.style.maskImage = `url("${url}")`;
                sh.style.webkitMaskImage = `url("${url}")`;
                // Every shine's gradient rides an inner band moved by transform (see .jewel-shine-band).
                const addBand = el => {
                    const band = document.createElement('div');
                    band.className = 'jewel-shine-band';
                    el.appendChild(band);
                };
                addBand(sh);
                if (sl.meta.tier === 2) {
                    wrap.appendChild(sh);
                } else {
                    wrap.insertBefore(sh, img);
                    const so = document.createElement('div');
                    so.className = 'jewel-shine-over';
                    so.style.setProperty('--jewel-mask', `url("${url}")`);
                    addBand(so);
                    wrap.appendChild(so);
                }
            };
        }
        const ns = document.createElement('span');
        ns.className = 'day-num';
        ns.innerText = d;
        cell.appendChild(ns);
        if (isFlipped) {
            const wm = ctx.warMarkers[ds];
            const eventImgs = [];
            if ((sl.lsdODs || 0) > 0) eventImgs.push(CAL_IMG_BASE + 'lsod.webp');
            if ((sl.xanaxODs || 0) > 0) eventImgs.push(CAL_IMG_BASE + 'xanx-od.webp');
            if ((sl.exODs || 0) > 0) eventImgs.push(CAL_IMG_BASE + 'x-od.webp');
            if (wm && wm.warStart) eventImgs.push(CAL_IMG_BASE + 'wr-strt.webp');
            if (wm && wm.warWon) eventImgs.push(CAL_IMG_BASE + 'wr-wn.webp');
            if (wm && wm.warLost) eventImgs.push(CAL_IMG_BASE + 'wr-lst.webp');
            const bm = ctx.bookMarkers[ds];
            if (bm) {
                if (bm.trainStart) eventImgs.push(CAL_IMG_BASE + 'PLACEHOLDER-train-book-started.webp');
                if (bm.perkStart) eventImgs.push(CAL_IMG_BASE + 'PLACEHOLDER-perk-book-started.webp');
                if (bm.perkEnded) eventImgs.push(CAL_IMG_BASE + 'PLACEHOLDER-book-perk-ended.webp');
                if (bm.perkReceived) eventImgs.push(CAL_IMG_BASE + 'PLACEHOLDER-book-perk-received.webp');
            }
            // The stack spreads across a fixed window in the cell rather than stepping by a fixed
            // amount, so it can't outgrow the day. Up to three it steps by POST_IT_STEP and looks
            // exactly as it always has; past that the step shrinks to keep the last one's bottom
            // edge on POST_IT_BAND's far side. The lift keeps the stack centred as it grows.
            const nEvents = eventImgs.length,
                piStep = nEvents > 1 ? Math.min(POST_IT_STEP, POST_IT_BAND / (nEvents - 1)) : 0,
                piBase = POST_IT_TOP - (nEvents - 1) * piStep * POST_IT_LIFT;
            cell.style.setProperty('--pi-base', piBase.toFixed(4) + '%');
            cell.style.setProperty('--pi-step', piStep.toFixed(4) + '%');
            eventImgs.forEach((url, i) => {
                const ep = document.createElement('div');
                ep.className = 'bbgl-event-post-it' + (eventImgs.length > 1 && i === eventImgs.length - 1 ? ' bbgl-event-post-it-top' : '');
                ep.style.backgroundImage = `url('${url}')`;
                ep.style.setProperty('--ei', i);
                ep.style.setProperty('--stack-total', eventImgs.length);
                cell.appendChild(ep);
            });
        }
        if (isFlipped && sl.meta.tier > 0) {
            const item = DataController.getStickerMap().get(ds);
            if (item) {
                const uid = Math.floor(new Date(Date.UTC(y, m, d)).getTime() / 86400000);
                const sw = document.createElement('div'),
                    si = document.createElement('img');
                sw.className = 'sticker-wrapper' + (sl.meta.tier === 3 ? ' sticker-tier-diamond' : '');
                sw.style.setProperty('--rot', `${(uid * 17) % 21 - 10}deg`);
                si.src = item.url;
                si.className = 'cell-sticker-deco';
                sw.appendChild(si);
                cell.appendChild(sw);
                // Stands in for :has(.sticker-wrapper) in the post-it peel CSS: a plain class check is far
                // cheaper for the browser to re-evaluate on every hover change than a :has() lookup.
                cell.classList.add('has-sticker');
                buildShine = () => {
                    if (sw.querySelector('.sticker-shine')) return;
                    const ss = document.createElement('div');
                    ss.className = 'sticker-shine';
                    ss.style.webkitMaskImage = `url("${item.url}")`;
                    ss.style.maskImage = `url("${item.url}")`;
                    let grad = `linear-gradient(115deg,rgba(0,200,150,0.55) 0%,rgba(0,255,180,0.65) 20%,rgba(0,255,255,0.7) 35%,rgba(255,255,255,0.75) 50%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(0,200,150,0.85) 100%)`;
                    if (sl.meta.tier === 2) grad = `linear-gradient(115deg,rgba(184,134,11,0.7) 0%,rgba(212,175,55,0.85) 11%,rgba(255,255,240,1.0) 13%,rgba(212,175,55,0.8) 15%,rgba(0,255,255,0.7) 35%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(184,134,11,0.85) 100%)`;
                    else if (sl.meta.tier === 3) grad = `linear-gradient(115deg,rgba(0,255,255,0.85) 0%,rgba(200,100,255,0.85) 5%,rgba(255,0,255,0.85) 10%,rgba(0,150,255,0.85) 15%,rgba(0,255,255,0.75) 35%,rgba(255,0,255,0.85) 65%,rgba(0,150,255,0.9) 80%,rgba(0,255,255,0.85) 85%,rgba(200,100,255,0.85) 90%,rgba(255,0,255,0.85) 95%,rgba(0,150,255,0.85) 100%)`;
                    // The gradient rides an inner band moved by transform (see .sticker-shine-band).
                    const band = document.createElement('div');
                    band.className = 'sticker-shine-band';
                    band.style.backgroundImage = grad;
                    ss.appendChild(band);
                    ss.style.mixBlendMode = "overlay";
                    if (sl.meta.tier >= 2) ss.style.filter = "brightness(1.5)";
                    sw.appendChild(ss);
                };
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
        cell._buildShine = buildShine;
        if ((calendarState.selectedLabel === ds) || (!calendarState.selectedLabel && isToday)) {
            cell.classList.add('is-viewing');
            if (buildShine) buildShine();
        }
        const isInteractive = !sl.meta.isGap || (ctx.firstDate && ds >= ctx.firstDate && ds <= ctx.today);
        if (isInteractive) {
            // Deferred until first hover/scrub. generateRichTooltip builds a ~1.5KB inline-styled
            // grid, and eagerly doing that for all 42 cells on every render produced ~60KB of
            // attribute markup to display one cell's worth at a time. The empty placeholder keeps
            // TooltipController.resolve()'s [data-tooltip-html] match intact; the thunk is
            // materialized and cached by TooltipController.htmlFor().
            cell.setAttribute('data-tooltip-html', '');
            cell._bbglTip = () => generateRichTooltip(sl);
        } else cell.setAttribute('data-tooltip', TOOLTIPS.CELL_DATE(ds));
        cell.onclick = () => {
            if (isToday) closeHistory();
            else if (isInteractive) openHistory(sl, ds);
        };
        cont.appendChild(cell);
        // Restoring a persisted selection here would call openHistory() -> updateCellSelection(),
        // which queries dom.calContainer for the matching element — but `cell` is still sitting in
        // an unattached fragment at this point (frag isn't appended to the live container until
        // renderPanelContent() finishes the whole month), so that query silently fails and the
        // element never gets marked .is-viewing even though calendarState.selectedLabel becomes
        // correct. Defer to a pending flag renderPanelContent() consumes only after attaching frag.
        if (isInteractive && viewState.activeViewLabel === ds && calendarState.selectedLabel !== ds) runtime._pendingHistoryRestore = { sl, label: ds };
    }

    function injectWeeklyBar(cont, batch) {
        const sl = DataController.getSlice('CUSTOM', batch.map(w => w.data).filter(d => d));
        sl.label = `Week ${getISOWeek(batch[0].date)}`;
        sl._weekStart = batch[0].date;
        sl._weekEnd = batch[batch.length - 1].date;
        if (sl._dailyList.length === 0) return;
        const { hjDaySet } = DataController.getHappyJumpData();
        const _wk = getWeekKey(sl._dailyList[0].date);
        const anchor = document.createElement('div');
        anchor.className = 'bbgl-weekly-anchor';
        const tr = document.createElement('div');
        tr.className = 'bbgl-weekly-track';
        tr.dataset.label = sl.label;
        tr.onclick = (e) => { e.stopPropagation(); openHistory(sl, sl.label); };
        if (calendarState.selectedLabel === sl.label) tr.classList.add('is-viewing');
        // One hover-intent binding on the anchor covers both the track and its handle tab (mouseenter/
        // mouseleave follow DOM containment, so crossing from one to the other doesn't leave the
        // anchor). .is-hover-intent on the track stands in for the old track:hover / handle:hover CSS:
        // sweeps, the handle growing, the glow — and replaces the tab's instant is-scrub-hovered.
        bindHoverIntent(anchor, () => tr.classList.add('is-hover-intent'), () => tr.classList.remove('is-hover-intent'));
        const installWeekKey = runtime.demoMode ? null : getInstallWeekKey();
        const addCenterTab = (slice) => {
            const tab = document.createElement('div');
            tab.className = 'bbgl-bar-handle';
            tab.dataset.pos = 'start';
            const tooltipHtml = generateRichTooltip(slice);
            tab.setAttribute('data-tooltip-html', tooltipHtml);
            tab.setAttribute('data-tooltip-anchor', '.bbgl-bar-handle');
            tr.setAttribute('data-tooltip-html', tooltipHtml);
            tr.setAttribute('data-tooltip-anchor', '.bbgl-bar-handle');
            tab.onclick = (e) => { e.stopPropagation(); openHistory(slice, slice.label); };
            tab.innerHTML = `<div class="bbgl-summary-inset">${buildChartSVG(slice)}</div>`;
            anchor.appendChild(tab);
        };
        // Archived / pre-install weeks: five silver placeholder capsules (no real reward data).
        if (installWeekKey && _wk < installWeekKey) {
            tr.innerHTML = buildCapsuleBar(['silver', 'silver', 'silver', 'silver', 'silver'], false, false);
            anchor.appendChild(tr);
            addCenterTab(sl);
            cont.appendChild(anchor);
            // See the matching comment in renderCell() — this element is still in an unattached
            // fragment, so calling openHistory() here would silently fail to mark it .is-viewing.
            // Defer to the pending flag renderPanelContent() consumes after attaching frag.
            if (viewState.activeViewLabel === sl.label && calendarState.selectedLabel !== sl.label) runtime._pendingHistoryRestore = { sl, label: sl.label };
            return;
        }
        const { capsules, isCompleted } = computeWeekCompletion(sl._dailyList, hjDaySet);
        if (isCompleted) tr.classList.add('track-polished');
        tr.innerHTML = buildCapsuleBar(capsules, isCompleted, isCompleted && userConfig.animations);
        anchor.appendChild(tr);
        addCenterTab(sl);
        cont.appendChild(anchor);
        // Same fragment-timing issue as above — defer instead of calling openHistory() directly.
        if (viewState.activeViewLabel === sl.label && calendarState.selectedLabel !== sl.label) runtime._pendingHistoryRestore = { sl, label: sl.label };
    }

    // Today's live (not-yet-committed) training context — install-day sub-day filtering applied
    // so only entries at/after the precise install moment count on the exact install day (mirrors
    // buildProgressionCache()'s handling of past days, 06-section-v-logic.js). Returns zeros in
    // demo mode or if there's no today data yet. Shared by getLiveLevelExp() and
    // getLiveStatTitleE() so this filtering logic exists in exactly one place.
    function getTodayTrainingContext() {
        const h = getActiveHistory();
        if (runtime.demoMode || !h || !h.today) return { todayE: 0, todayEByStat: { str: 0, def: 0, spd: 0, dex: 0 }, hasTrainLog: false, isHJ: false };
        const today = Formatter.dateLogical();
        const installDateKey = getInstallDateKey();
        const rewardStartTs = (h.meta && h.meta.rewardStartDate) || null;
        let todaySeries = h.today.series || [];
        if (installDateKey && today === installDateKey && rewardStartTs) {
            todaySeries = todaySeries.filter(s => s.ts >= rewardStartTs);
        }
        const todayE = (todaySeries === h.today.series && h.today.eSpent) ? (h.today.eSpent.total || 0) : todaySeries.filter(s => s.type === 'gym').reduce((sum, s) => sum + (s.cost || 0), 0);
        // Per-stat split of the same filtered slice, for the stat-title ladders. Always summed
        // from the series rather than read off h.today.eSpent so it can't disagree with todayE
        // above on install day, where the sub-day filter applies to one and not the other.
        const todayEByStat = { str: 0, def: 0, spd: 0, dex: 0 };
        todaySeries.forEach(s => {
            if (s.type === 'gym' && todayEByStat[s.stat] !== undefined) todayEByStat[s.stat] += (s.cost || 0);
        });
        const hasTrainLog = todaySeries.some(s => s.type === 'gym');
        const { hjDaySet } = DataController.getHappyJumpData();
        const isHJ = (todaySeries === h.today.series) ? hjDaySet.has(today) : findHappyJumps(todaySeries).length > 0;
        return { todayE, todayEByStat, hasTrainLog, isHJ };
    }

    // career EXP + today's in-progress EXP — the live total both level bars display.
    function getLiveLevelExp() {
        const { todayE, hasTrainLog, isHJ } = getTodayTrainingContext();
        return DataController.getCareerLevelExp() + computeDailyLevelExp(todayE, hasTrainLog, isHJ);
    }

    // Per-stat cumulative E for the title ladders: the cached as-of-yesterday totals plus today's
    // not-yet-committed spend, without mutating the cache.
    function getLiveStatTitleE() {
        const cached = DataController.getStatTitleE();
        const { todayEByStat } = getTodayTrainingContext();
        const out = {};
        STAT_KEYS.forEach(k => {
            out[k] = (cached[k] || 0) + (todayEByStat[k] || 0);
        });
        return out;
    }

    // The slot selection the title renders from — manual pick if there is one, otherwise the
    // auto-follow of the top two stats (resolveStatTitleSelection(), 03-section-ii-utils.js).
    function getLiveStatTitleSelection() {
        const eByStat = getLiveStatTitleE();
        // Dev-only preview override (11-section-x-devtools.js, stripped from release builds) —
        // bypasses both the stored pick and the unlocked-phase clamp, so any stat/phase pair can
        // be previewed without the training history that would really unlock it.
        if (runtime.devMode && runtime._devTitleOverride) {
            const o = runtime._devTitleOverride;
            return { primary: o.primary, secondary: o.secondary, phases: statTitlePhases(eByStat), mode: 'custom' };
        }
        const h = getActiveHistory();
        const endBreakdown = (h && h.today && h.today.endBreakdown) || {};
        return resolveStatTitleSelection(eByStat, endBreakdown);
    }

    // Re-render everywhere the composed title appears after a slot change: the level-bar tooltips
    // and, if it's the page currently on screen, the titles page's own dashboard + star highlights.
    // Reuses the last known EXP total so this can't fight the level bar's running animation.
    function refreshStatTitleUI() {
        const total = (runtime._lastLevelExp !== undefined) ? runtime._lastLevelExp : getLiveLevelExp();
        getLevelBars().forEach(b => renderLevelBar(b, total));
        if (runtime._achPage === 0 && !renderTitlePickLive()) achRefreshPageDom();
    }

    // Patches a title pick (star click, the reset arrow, the dev title override) into the titles page
    // in place: the stars' highlight classes and the identity card's title text + reset arrow, which
    // is everything a pick changes. Replaces achRefreshPageDom()'s full innerHTML rebuild and
    // geometry pass on every click. Returns false (caller does the real rebuild) when the page isn't
    // built yet or anything besides the pick differs from the last real build — stat E, the
    // enhancements period toggle, or which stars are unlocked.
    function renderTitlePickLive() {
        const container = document.getElementById('bbgl-achievements-container');
        const page = container && container.querySelector('.bbgl-titles-page');
        const label = page && page.querySelector('.bbgl-title-card-title-label');
        const value = page && page.querySelector('.bbgl-title-card-value');
        const prevFingerprint = runtime._achLiveFingerprint;
        if (!label || !value || !runtime._achCache || !prevFingerprint) return false;
        // Fingerprint is `E | selection | pending pick | period toggle` (achLiveInputsFingerprint()).
        // Only the two middle, pick-owned segments may have moved.
        const fingerprint = achLiveInputsFingerprint();
        const nonPick = fp => { const parts = fp.split('|'); return parts[0] + '|' + parts[3]; };
        if (nonPick(fingerprint) !== nonPick(prevFingerprint)) return false;

        const sel = getLiveStatTitleSelection();
        const pending = runtime._titlePick;
        const stars = Array.from(page.querySelectorAll('.bbgl-title-star'));
        // Same unlocked test achTitleStarHTML() builds with, checked before any write so a mismatch
        // can still fall back cleanly.
        const starPhase = star => parseInt(star.dataset.titlePhaseIdx, 10);
        if (stars.some(star => (starPhase(star) <= sel.phases[star.dataset.titleStat]) !== star.classList.contains('is-unlocked'))) return false;

        stars.forEach(star => {
            const role = achTitleStarRole(sel, pending, star.dataset.titleStat, starPhase(star));
            ['primary', 'secondary', 'both'].forEach(r => star.classList.toggle('is-' + r, role === r));
        });
        const { titleValue, labelExtra } = achTitleCardTitleParts(sel, pending);
        label.innerHTML = `The${labelExtra}`;
        value.innerHTML = titleValue;
        runtime._achLiveFingerprint = fingerprint;
        // A different title can change the sign's text size, which layoutTitleBlockFrames() mirrors
        // into --bbgl-tip-title-fs; everything unchanged writes nothing (setStyleVarIfChanged()).
        layoutTitlesPageGeometry();
        return true;
    }

    // Fingerprint of every titles-page input EXCEPT the live level/rank — stat E, the composed
    // title pick (committed or mid-pick), and the enhancements period toggle. achRefreshPageDom()
    // stamps this after every real rebuild (runtime._achLiveFingerprint); a routine data tick
    // (heartbeat, dev Level Up, today's exp climbing) that reproduces the SAME fingerprint has
    // nothing to show here but a level/rank change, so renderPanelContent() (below) can hand it to
    // renderRankReadoutLive() instead of paying for a full rebuild. Anything that actually changes
    // this — new E, a title pick, the mode toggle — still falls through to the real rebuild so
    // stat cards/title text can't go stale.
    function achLiveInputsFingerprint() {
        const eByStat = getLiveStatTitleE();
        const sel = getLiveStatTitleSelection();
        const pending = runtime._titlePick;
        return STAT_KEYS.map(k => Math.round(eByStat[k] || 0)).join(',') + '|' +
            sel.mode + ':' + (sel.primary ? sel.primary.stat + sel.primary.phase : '') + ':' + (sel.secondary ? sel.secondary.stat + sel.secondary.phase : '') + '|' +
            (pending ? pending.stat + pending.phase : '') + '|' +
            (viewState.achEnhPeriodMode ? 1 : 0);
    }

    // Single source for "what level/rank the live exp total currently resolves to", as a cheap
    // string key — lets renderRankReadoutLive()/achRefreshPageDom() tell whether the readout needs
    // touching at all before doing any DOM work, instead of two separate call sites each deriving
    // it (and risking drifting out of sync with each other).
    function liveRankState() {
        const { atrophy, level } = calculateLevelProgress(getLiveLevelExp());
        return { atrophy, level, key: atrophy + ':' + level };
    }

    // Patches the titles page's live rank readout — the ladder's sliding knob/plaques and the
    // identity card's current-rank badge — from the live level, in place, instead of
    // achRefreshPageDom()'s full innerHTML rebuild. That rebuild used to run on every routine data
    // tick just to move this readout, tearing the whole titles page down and rebuilding it; the
    // ladder would briefly repaint at its CSS fallback position (`top: var(--bbgl-t-rank-line-y,
    // 50%)`, 04-section-iii-styles.js) before layoutRankBarCenter() corrected it, which read as a
    // visible jump-then-settle in compact mode's tighter layout (its resting position sits much
    // further from that 50% fallback than expanded/page mode's does). Nothing else on the page
    // changes here, so nothing is torn down or recreated — the existing ResizeObserver just sees
    // whatever real size change (if any) the patch below causes. Returns false (caller should fall
    // back to the real rebuild) if the titles page isn't even in the DOM yet.
    function renderRankReadoutLive() {
        const { atrophy, level, key } = liveRankState();
        const container = document.getElementById('bbgl-achievements-container');
        const page = container && container.querySelector('.bbgl-titles-page');
        if (!page) return false;
        // The overwhelming majority of ticks that reach here are a dataUpdated firing for some
        // reason that has nothing to do with the ladder at all (backfill progress, a settings
        // change, another silent sync) while sitting on the same level — bail before touching the
        // DOM at all rather than re-parsing the same notch/label HTML and re-measuring geometry
        // that's already correct.
        if (key === runtime._achLiveRankKey) return true;
        const track = page.querySelector(':scope > .bbgl-rank-track');
        const line = track && track.querySelector('.bbgl-rank-line');
        const knob = line && line.querySelector('.bbgl-rank-knob');
        const knobLv = knob && knob.querySelector('.bbgl-rank-knob-lv');
        const titles = line && line.querySelector('.bbgl-rank-titles');
        const card = page.querySelector('.bbgl-title-card');
        const cardRank = card && card.querySelector('.bbgl-title-card-rank');
        if (!track || !line || !knob || !knobLv || !titles || !card || !cardRank) return false;

        runtime._achLiveRankKey = key;
        const bricked = isFullyBricked(atrophy, level);
        const currentRank = achCurrentRankPlaqueData(atrophy, level);

        // Same shared-clock trick achRefreshPageDom() uses: keeps runtime._titlesPageAnimationStartedAt
        // running and restamps --bbgl-titles-animation-delay to the (more negative) elapsed time BEFORE
        // the titles below are replaced, so the freshly-created nodes resume the page's existing
        // animation timeline instead of restarting their reveal/shimmer from 0.
        //
        // Stamped only on the two subtrees replaced below, not the whole container: that restyled
        // every element on this heavy page and re-timed every running animation. The exception is a
        // bricked or card finish/material flip — those switch animations on for EXISTING nodes
        // outside the replaced subtrees (the line's own is-bricked styling, the card's finish rules),
        // which need the current clock too, so they still take the container-wide stamp. The two
        // subtrees are stamped either way: a value left on them by an earlier patch would otherwise
        // shadow the container's fresh one for the nodes created inside them.
        const crossesSubtrees = line.classList.contains('is-bricked') !== bricked ||
            card.dataset.rankFinish !== currentRank.finish ||
            card.dataset.rankMaterial !== currentRank.material;
        syncTitlesPageAnimationClock(container, crossesSubtrees ? [container, titles, cardRank] : [titles, cardRank]);

        track.style.cssText = rankBarProgressCSS(atrophy, level);
        line.classList.toggle('is-bricked', bricked);
        titles.innerHTML = achTitleLabelsHTML(atrophy, level);
        knobLv.textContent = level;
        // setAttribute, not the achEsc()'d HTML-string form achBuildPageTitles() uses — this is
        // going straight through the DOM API, not through an innerHTML parse, so no attribute
        // escaping is needed.
        knob.setAttribute('data-tooltip', currentRank.tip);
        card.dataset.rankFinish = currentRank.finish;
        card.dataset.rankMaterial = currentRank.material;
        cardRank.innerHTML = `<span class="bbgl-title-card-rank-label">Rank</span>${currentRank.html}`;

        // Same synchronous re-measure achRefreshPageDom() runs right after its own DOM writes.
        // Nothing above destroys/recreates any of the elements observeTitleBlockFrames() is
        // watching, so this can't retrigger its ResizeObserver the way a full rebuild does — it
        // just accounts for any real size change (e.g. a longer rank name) the patch just caused.
        layoutTitlesPageGeometry();
        return true;
    }

    // Two-click title picking, which replaced the old Primary/Secondary/Both popover. Clicking an
    // unlocked star clears the current title and places that word first (the adjective); the next
    // click places the second (the noun) and commits the pair. Clicking the same star twice puts
    // that one word in both slots, which is what the popover's "Both" used to be.
    //
    // runtime._titlePick holds the half-finished pick and is deliberately ephemeral — never
    // persisted, and never cleared by a re-render, so a heartbeat rebuilding the page mid-pick
    // leaves the one-word preview standing.
    function handleTitleStarPick(star) {
        const stat = star.dataset.titleStat;
        const phase = parseInt(star.dataset.titlePhaseIdx, 10);
        if (!stat || !Number.isFinite(phase)) return;
        const pending = runtime._titlePick;
        if (!pending) {
            runtime._titlePick = { stat, phase };
        } else {
            // Pending word is the adjective (secondary), this one the noun (primary). Passing the
            // pending slot as `current` is what lets applyStatTitlePick() commit both at once.
            applyStatTitlePick({ primary: pending, secondary: pending }, stat, phase, 'primary');
            runtime._titlePick = null;
        }
        refreshStatTitleUI();
    }

    // Any exit from the titles page abandons a half-finished pick rather than leaving it to surprise
    // the player when they come back.
    function clearTitlePick() {
        if (!runtime._titlePick) return;
        runtime._titlePick = null;
    }

    // Writes for the titles-page geometry passes below only land when the value actually changed.
    // Even a same-value setProperty invalidates style for the element's whole subtree (for the
    // --bbgl-tip-title-fs write on <html>, the entire Torn document), makes the next offset*/client*
    // read force a full recalc + layout of this very heavy page, and can re-fire
    // titleFrameResizeObserver for a pass that had nothing to change.
    function setStyleVarIfChanged(el, name, value) {
        if (el.style.getPropertyValue(name) === value) return false;
        el.style.setProperty(name, value);
        return true;
    }

    // Sizes the titles page's measured pieces: the toolbar clearance, the identity card's title
    // width/height trim, each stat column's star size, and the level-bar tooltip's title size.
    // Reads are batched before writes. Called after the titles page DOM is (re)built
    // (achRefreshPageDom(), 06-section-v-logic.js) and on every resize (observeTitleBlockFrames()
    // below). Returns false if any stat block was still 0x0 (layout not settled yet) so the caller
    // can retry next frame instead of guessing a delay. (It used to also redraw a per-block SVG neon
    // frame; that frame was replaced by .bbgl-plate-neon and has been removed.)
    //
    // Uses offsetWidth/offsetHeight, NOT getBoundingClientRect(): this page runs a CRT-style scale
    // transform on navigation (bbgl-crt-out/-in), and getBoundingClientRect() reports the visually
    // squashed mid-transition size — which locked in a wrong shape that never self-corrected, since
    // a transform doesn't change the element's own box size. offset*/client* ignore transforms and
    // report the real layout size throughout.
    function layoutTitleBlockFrames() {
        const titlesContainer = document.querySelector('#bbgl-achievements-container.bbgl-ach-titles-page');
        const toolbar = document.getElementById('bbgl-toolbar');
        if (titlesContainer && toolbar) {
            const icons = Array.from(toolbar.querySelectorAll('#bbgl-toolbar-icons > div'))
                .filter(el => el.offsetHeight > 0);
            if (icons.length) {
                const tallest = Math.max(...icons.map(el => el.offsetHeight));
                const topPad = Math.max(0, (toolbar.offsetHeight - tallest) / 2);
                // Keep the toolbar icons' top clearance.
                setStyleVarIfChanged(titlesContainer, '--bbgl-t-toolbar-bottom', `${toolbar.offsetTop + tallest + topPad}px`);
            }
        }
        const main = document.querySelector('.bbgl-titles-main');
        if (main) {
            const height = main.clientHeight;
            const expanded = main.closest('#bbgl-panel')?.classList.contains('bbgl-expanded');
            // Tooltip card: (176px outer width - 18px border/padding) * .86 by 132px.
            setStyleVarIfChanged(main, '--bbgl-title-max-width', `${height * (158 * .86 / 132)}px`);
            const center = main.querySelector('.bbgl-titles-center');
            let cardHeight = height;
            // The two per-column spacing vars are only ever set here, on .bbgl-titles-main, and
            // inherited by the columns — so the columns use the values just computed instead of
            // reading them back through getComputedStyle (which forced a recalc after the writes).
            let paddingY = null, rowExtra = null;
            if (center) {
                const widthLoss = Math.max(0, height * .85 - center.clientWidth);
                const heightTrim = expanded
                    ? Math.min(42, height * .27, widthLoss * .55)
                    : Math.min(38, height * .24, widthLoss * .5);
                paddingY = rowExtra = Math.min(3, heightTrim * .1);
                setStyleVarIfChanged(main, '--bbgl-title-height-trim', `${heightTrim}px`);
                setStyleVarIfChanged(main, '--bbgl-stat-padding-y', `${paddingY}px`);
                setStyleVarIfChanged(main, '--bbgl-stat-row-extra', `${rowExtra}px`);
                cardHeight -= heightTrim;
            }
            // Measure every column first, then write every --bbgl-t-star. Interleaving them made each
            // column's reads force a full recalc + layout for the previous column's write.
            const starSizes = [];
            main.querySelectorAll('.bbgl-titles-corner-col').forEach(col => {
                const label = col.querySelector('.bbgl-title-block-label');
                const row = col.querySelector('.bbgl-title-star-row');
                if (!label || !row) return;
                const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
                const labelHeight = label.offsetHeight;
                const colStyle = getComputedStyle(col);
                const padY = paddingY !== null ? paddingY : (parseFloat(colStyle.getPropertyValue('--bbgl-stat-padding-y')) || 0);
                const extra = rowExtra !== null ? rowExtra : (parseFloat(colStyle.getPropertyValue('--bbgl-stat-row-extra')) || 0);
                const vertical = (cardHeight - labelHeight * 2 - 7 - padY * 4 - extra * 2) / (expanded ? 3.8 : 4);
                const emblemScale = parseFloat(colStyle.getPropertyValue('--bbgl-t-emblem-scale')) || 1.12;
                // The grid reserves clearance outside the plate's 3px overhang.
                const horizontal = (col.clientWidth - gap * 4) / (5 * emblemScale);
                starSizes.push([col, `${Math.max(1, Math.min(vertical, horizontal))}px`]);
            });
            starSizes.forEach(([col, size]) => setStyleVarIfChanged(col, '--bbgl-t-star', size));
            // The level-bar tooltip's title text copies the expanded page's size. That text is
            // min(14cqw, 25cqh) of its size-container sign (.bbgl-title-card-value .bbgl-titles-title,
            // 04-section-iii-styles.js); the tooltip lives on <body>, outside that container, so the
            // resolved px goes on the root. Only measured in expanded, so other modes keep the last
            // expanded value.
            const sign = main.closest('#bbgl-panel.bbgl-expanded') && main.querySelector('.bbgl-title-card-sign');
            if (sign && sign.clientWidth > 0 && sign.clientHeight > 0) {
                const fs = Math.min(sign.clientWidth * .14, sign.clientHeight * .25);
                // The level-bar tooltip's size depends on this, so cached tooltip sizes go stale with it.
                if (setStyleVarIfChanged(document.documentElement, '--bbgl-tip-title-fs', `${fs.toFixed(2)}px`)) TooltipController.clearSizeCache();
            }
        }
        // Not settled yet if any stat block still measures 0x0 — achRefreshPageDom()'s retry loop
        // keys off this to re-run the pass on the next frame.
        for (const block of document.querySelectorAll('.bbgl-title-block')) {
            if (!(block.offsetWidth > 0) || !(block.offsetHeight > 0)) return false;
        }
        return true;
    }

    // Returns an element's untransformed layout top in ancestor-local coordinates. offsetTop is
    // intentional here: unlike getBoundingClientRect(), it is not squashed by the titles page's
    // CRT scaleY transition. null means the expected offset-parent chain was not established yet.
    function titleLayoutTopWithin(el, ancestor) {
        let top = 0;
        let node = el;
        while (node && node !== ancestor) {
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return node === ancestor ? top : null;
    }

    // offsetTop ignores transforms, but the stat columns deliberately carry one local translateY.
    // Add every descendant transform's Y component back without reading the page's own CRT transform
    // (the walk stops before ancestor), so the result is the real resting geometry in every mode.
    function titleTranslateYWithin(el, ancestor) {
        let y = 0;
        for (let node = el; node && node !== ancestor; node = node.parentElement) {
            const transform = getComputedStyle(node).transform;
            if (!transform || transform === 'none') continue;
            try { y += new DOMMatrixReadOnly(transform).m42; } catch (_) { /* malformed/unsupported */ }
        }
        return y;
    }

    // Clearance held between the assembly and the floor of its available space. At the default
    // placement bias this is a last resort, only consumed when the space is too short to centre the
    // assembly in; at a bias of 1 it stops being an emergency measure and becomes the resting gap
    // itself — the "certain padding off the bottom" a bottom-anchored bar sits at. Overridable per
    // mode with --bbgl-t-rank-floor.
    const RANK_ASSEMBLY_FLOOR = 5;

    // Reference bias (0-1, card-bottoms to page-bottom) used ONLY to measure the label-to-groove
    // spacing before the real placement happens — moving the groove to reposition the bar would
    // otherwise rescale the label gap along with it, since the gap is a fraction of that distance.
    const RANK_SPACING_REF_BIAS = 0.8;

    // Where the finished block comes to rest in that same 0-1 space, when a mode does not say.
    // 0.5 is a true midpoint, which is what every mode did before --bbgl-t-rank-bias existed.
    const RANK_PLACEMENT_BIAS = 0.5;

    // Where the rank labels (.bbgl-rank-title) sit in the gap between the cards and the groove,
    // measured UP from the groove (0 = flush with it, 1 = flush with the cards). Biased toward the
    // line rather than a true midpoint, so labels track the groove instead of floating away as
    // --bbgl-t-rank-h grows the gap.
    const TITLE_LABEL_BIAS = 0.42;

    // Places the visible rank assembly (groove + readout) in the space below the stat cards, in
    // two passes: pass 1 freezes the
    // label-to-groove spacing at a fixed reference placement, pass 2 treats labels+groove as one
    // rigid block and places that block. Doing it in one pass (just moving the groove) would let
    // the label gap rescale with it. Clamped at both ends so a short space hugs the floor instead
    // of overflowing. Only the groove's local Y is written; the box itself stays in normal flow.
    //
    // WHERE pass 2 puts the block is --bbgl-t-rank-bias, on the same 0-1 card-bottoms-to-page-bottom
    // scale pass 1 already used. It matters because the space this solves in is not fixed: as a
    // panel narrows, the stat cards above shrink and hand their height back, which grows the region
    // from the top. Centring in a growing region means the bar climbs away from the page's bottom
    // edge and the freed height is split into dead air above and below it. A bias of 1 pins the
    // block to the floor instead, so that height stays in one piece at the top where the cards can
    // be given it back. Modes that want the old midpoint simply say nothing.
    function layoutRankBarCenter() {
        const page = document.querySelector('.bbgl-titles-page');
        const scale = page && page.querySelector('.bbgl-rank-scale');
        const line = scale && scale.querySelector('.bbgl-rank-line');
        const lowerCards = page && page.querySelectorAll('.bbgl-titles-corner-col > .bbgl-title-block:last-child');
        if (!page || !scale || !line || !lowerCards || lowerCards.length !== 2 || !(page.clientHeight > 0)) return false;

        const cardBottoms = Array.from(lowerCards, card => {
            const top = titleLayoutTopWithin(card, page);
            return top === null ? null : top + card.offsetHeight + titleTranslateYWithin(card, page);
        });
        const scaleTop = titleLayoutTopWithin(scale, page);
        if (cardBottoms.some(v => v === null) || scaleTop === null || !(scale.offsetHeight > 0)) return false;

        const paddingBottom = parseFloat(getComputedStyle(page).paddingBottom) || 0;
        // Card growth may occupy the gap without moving the rank cluster's reference bounds.
        const cardOverhang = parseFloat(getComputedStyle(page).getPropertyValue('--bbgl-t-rank-card-overhang')) || 0;
        const availableTop = scaleTop;
        const availableBottom = page.clientHeight - paddingBottom;
        if (!(availableBottom > availableTop)) return false;

        const assemblyEls = [
            line,
            ...line.querySelectorAll('.bbgl-rank-knob')
        ].filter(el => el === line || el.offsetParent !== null);
        const assemblyBounds = assemblyEls.map(el => {
            const top = titleLayoutTopWithin(el, page);
            if (top === null || !(el.offsetHeight > 0)) return null;
            const visualTop = top + titleTranslateYWithin(el, page);
            return { top: visualTop, bottom: visualTop + el.offsetHeight };
        });
        if (assemblyBounds.some(v => v === null)) return false;

        const assemblyTop = Math.min(...assemblyBounds.map(v => v.top));
        const assemblyBottom = Math.max(...assemblyBounds.map(v => v.bottom));

        const lineTop = titleLayoutTopWithin(line, page);
        if (lineTop === null) return false;
        const lineCenter = lineTop + titleTranslateYWithin(line, page) + line.offsetHeight / 2;

        const floorValue = parseFloat(getComputedStyle(scale).getPropertyValue('--bbgl-t-rank-floor'));
        const assemblyFloor = Number.isFinite(floorValue) ? floorValue : RANK_ASSEMBLY_FLOOR;

        // ─── Pass 1: freeze the label-to-groove spacing ───────────────────────
        // Solve where the groove would sit at the reference bias, purely to read off labelGap.
        // Nothing here is written; only labelGap survives into the real placement below.
        const assemblyMid = (assemblyTop + assemblyBottom) / 2;
        const refTarget = availableTop + (availableBottom - availableTop) * RANK_SPACING_REF_BIAS;
        let refDrop = refTarget - assemblyMid;
        refDrop = Math.max(refDrop, availableTop - assemblyTop);
        refDrop = Math.min(refDrop, availableBottom - assemblyFloor - assemblyBottom);
        const labelGap = Math.max(0, (lineCenter + refDrop - availableTop) * TITLE_LABEL_BIAS);

        // Labels are absolutely positioned off the groove, so they add nothing to the assembly
        // bounds above and must be folded in explicitly, or centring would ignore the part of the
        // bar the eye sees first. Only their height is read — their position is what this function
        // solves for (offsetHeight doesn't depend on the --bbgl-t-titles-y written at the end).
        const labelHeights = Array.from(line.querySelectorAll('.bbgl-rank-title'))
            .filter(el => el.offsetParent !== null && el.offsetHeight > 0)
            .map(el => el.offsetHeight);
        const labelCenter = lineCenter - labelGap;
        const blockTop = labelHeights.length
            ? Math.min(assemblyTop, labelCenter - Math.max(...labelHeights) / 2)
            : assemblyTop;
        const blockBottom = labelHeights.length
            ? Math.max(assemblyBottom, labelCenter + Math.max(...labelHeights) / 2)
            : assemblyBottom;

        // ─── Pass 2: place the rigid block ───────────────────────────────────
        // Labels and groove now move together, so this is a plain target match on the block, at the
        // same bias shape pass 1 used above. At the 0.5 default the target IS the midpoint, exactly
        // what this computed before the bias existed; at 1 the floor clamp below is what the result
        // lands on, which is precisely the bottom-anchored resting position.
        // Clamped against the block's edges, not the bare assembly's — labels reach the cards first.
        const biasValue = parseFloat(getComputedStyle(scale).getPropertyValue('--bbgl-t-rank-bias'));
        const placeBias = Number.isFinite(biasValue) ? biasValue : RANK_PLACEMENT_BIAS;
        let drop = availableTop + (availableBottom - availableTop) * placeBias - (blockTop + blockBottom) / 2;
        drop = Math.max(drop, availableTop - blockTop);
        drop = Math.min(drop, availableBottom - assemblyFloor - blockBottom);

        // Compact mode compresses the live marker slightly and spends the room on separation from
        // the cards above; CSS owns the amount, this just keeps the ceiling/floor clamps authoritative.
        const requestedNudge = parseFloat(getComputedStyle(scale).getPropertyValue('--bbgl-t-rank-nudge-y')) || 0;
        const expanded = page.closest('#bbgl-panel')?.classList.contains('bbgl-expanded');
        const main = expanded && page.querySelector('.bbgl-titles-main');
        const heightTrim = main ? parseFloat(getComputedStyle(main).getPropertyValue('--bbgl-title-height-trim')) || 0 : 0;
        drop += requestedNudge - Math.min(7, heightTrim * .18);
        drop = Math.max(drop, availableTop - blockTop);
        drop = Math.min(drop, availableBottom - assemblyFloor - blockBottom);

        const localY = lineCenter - scaleTop + drop;
        const labelDrop = parseFloat(getComputedStyle(scale).getPropertyValue('--bbgl-t-rank-label-drop')) || 0;

        // Snap the groove to whole device pixels. localY is fractional, and the line then shifts
        // by its own -50% (half of a 1px bar) and --bbgl-rank-visual-drop, so its 1px edge usually
        // straddled two pixel rows and painted as a soft line twice as thick. Read where it really
        // landed on screen and nudge by the remainder, converted back to layout px in case an
        // ancestor is scaled. Sub-pixel only; the titles ride the line, so they keep their spacing.
        // Scale is read off the WIDTH: the groove can be thinner than 1px (compact), and
        // offsetHeight rounds that up to 1, which would skew a height-based ratio. The computed
        // width, not offsetWidth, for the same reason: offsetWidth rounds to whole px.
        const dpr = window.devicePixelRatio || 1;
        // One whole device pixel in CSS px (never less than one). At a fractional scale such as
        // Windows' 125%/130% a 1px CSS line is 1.25-1.3 device px, which pixel snapping rounds to 1
        // or 2 depending on where each line lands — so identical ticks came out at two different
        // thicknesses. The groove reads this for its thickness (see .bbgl-rank-line).
        const hairChanged = setStyleVarIfChanged(scale, '--bbgl-t-hair', `${(Math.max(1, Math.round(dpr)) / dpr).toFixed(4)}px`);
        const prevY = parseFloat(scale.style.getPropertyValue('--bbgl-t-rank-line-y'));
        const snapOffAt = (top, lineScale) => (Math.round(top * dpr) / dpr - top) / (lineScale || 1);
        let finalY = localY;
        let lineHeight;
        if (!hairChanged && Number.isFinite(prevY)) {
            // Nothing that moves or resizes the groove has been written yet this pass, so its current
            // on-screen box is the layout the reads above already paid for. Predict where localY puts
            // it and snap in one write, instead of writing localY, forcing a second full layout just
            // to read it back, then writing the snapped value over it.
            const lineRect = line.getBoundingClientRect();
            const lineCssW = parseFloat(getComputedStyle(line).width);
            const lineScale = lineCssW > 0 ? lineRect.width / lineCssW : 1;
            const snapOff = snapOffAt(lineRect.top + (localY - prevY) * lineScale, lineScale);
            if (Math.abs(snapOff) > .001) finalY = localY + snapOff;
            lineHeight = line.offsetHeight;
        } else {
            // First pass (still on the 50% CSS fallback) or a DPR change resized the groove: nothing
            // to predict from, so place it and measure where it really landed.
            scale.style.setProperty('--bbgl-t-rank-line-y', `${localY.toFixed(3)}px`);
            const lineRect = line.getBoundingClientRect();
            const lineCssW = parseFloat(getComputedStyle(line).width);
            const lineScale = lineCssW > 0 ? lineRect.width / lineCssW : 1;
            const snapOff = snapOffAt(lineRect.top, lineScale);
            if (Math.abs(snapOff) > .001) finalY = localY + snapOff;
            lineHeight = line.offsetHeight;
        }
        setStyleVarIfChanged(scale, '--bbgl-t-rank-line-y', `${finalY.toFixed(3)}px`);

        // labelGap above the groove, frozen in pass 1 — expressed relative to the groove itself so
        // every later shift carries the labels along unchanged. Measured from .bbgl-rank-LINE's own
        // top edge (NOT the scale): .bbgl-rank-titles is inset:0 of the line, so that 1px box is its
        // containing block — anything scale-relative would pin to the groove regardless of the
        // value given. Negative because the labels sit entirely above the line.
        // Apply label tightening after centring so it cannot move the slider.
        const titlesY = lineHeight / 2 - labelGap + labelDrop;
        setStyleVarIfChanged(scale, '--bbgl-t-titles-y', `${titlesY.toFixed(3)}px`);
        return true;
    }


    function layoutTitlesPageGeometry() {
        const framesReady = layoutTitleBlockFrames();
        const rankReady = layoutRankBarCenter();
        return framesReady && rankReady;
    }

    // (Re)establishes the ResizeObserver watching the current title blocks and visible rank parts —
    // must be called fresh on every titles-page DOM rebuild, since achRefreshPageDom()'s innerHTML
    // swap destroys whatever this was previously observing. Watching the plaque labels themselves
    // lets a late font measurement recenter the complete assembly even though their absolute layout
    // does not change .bbgl-rank-scale's fixed border-box size. disconnect() at the top makes
    // repeated calls safe without the caller having to remember to tear down first.
    function observeTitleBlockFrames() {
        if (runtime.titleFrameResizeObserver) runtime.titleFrameResizeObserver.disconnect();
        // observe() always delivers one initial notification. It is deliberately NOT skipped even though
        // achRefreshPageDom() just ran a synchronous pass: a web font finishing (or that pass's own
        // --bbgl-t-star writes resizing a block) before the first delivery is only reported by it.
        // It stays cheap because setStyleVarIfChanged() makes a pass with nothing new write nothing,
        // so its layout reads hit an already-clean layout.
        runtime.titleFrameResizeObserver = new ResizeObserver(() => {
            // Coalesce: several deliveries before the next frame still get one geometry pass.
            if (runtime._titleGeometryRafId) return;
            runtime._titleGeometryRafId = window.requestAnimationFrame(() => {
                runtime._titleGeometryRafId = null;
                layoutTitlesPageGeometry();
            });
        });
        document.querySelectorAll('.bbgl-title-block, .bbgl-titles-page, .bbgl-rank-scale, .bbgl-rank-notch-label, .bbgl-rank-knob')
            .forEach(el => runtime.titleFrameResizeObserver.observe(el));
    }

    // Shared toolbar-relative measurement for both pagination clusters that dock against the SVG
    // icon toolbar (#bbgl-ach-footer, #bbgl-sticker-pagination-bar). The icons no longer carry
    // hand-tuned individual coordinates that had to be reduced over one by one — they are a flex
    // row inside #bbgl-toolbar-icons, so that element's own box IS the answer to "how wide is the
    // toolbar", and #bbgl-toolbar's box is the answer to "where is its centreline".
    //
    // Both wrappers are pinned to 0,0 of their parent (#bbgl-toolbar to #bbgl-top-panel,
    // #bbgl-toolbar-icons to #bbgl-toolbar), which is what lets the reads below stay in
    // #bbgl-top-panel's coordinate space with no correction. Give either one a top/left offset of
    // its own and both docked clusters silently move with it.
    //
    // #bbgl-copy-btn is excluded even though it looks similar: it's right-anchored to the panel's
    // far edge in every mode, not part of the left cluster, and including it would inflate
    // "toolbar width" and defeat the horizontal threshold below. Being outside
    // #bbgl-toolbar-icons, it now falls out of this measurement by construction.
    //
    // Uses offset*, not getBoundingClientRect(), same convention as layoutTitleBlockFrames() above.
    // Returns null if nothing has measured to a real size yet — callers should retry next frame.
    function measureToolbarCenter() {
        const topPanel = document.getElementById('bbgl-top-panel');
        if (!topPanel) return null;
        const toolbar = document.getElementById('bbgl-toolbar');
        const iconRow = document.getElementById('bbgl-toolbar-icons');
        if (!toolbar || !iconRow) return null;
        const fullWidth = topPanel.offsetWidth;
        const toolbarWidth = iconRow.offsetLeft + iconRow.offsetWidth;
        const bandHeight = toolbar.offsetHeight;
        if (!(fullWidth > 0) || !(toolbarWidth > 0) || !(bandHeight > 0)) return null;
        // Horizontal placement rule: if the toolbar's occupied width is <=25% of the panel's own
        // width, centre dead in the middle of the panel's own full width, as if the icons weren't
        // there at all — centring within just the icons' own occupied width was tried first and
        // rejected, since it puts a docked cluster directly on top of the icons rather than near
        // them. Otherwise (toolbar >25%) centre within the remaining space to the right of it.
        const threshold = fullWidth * 0.25;
        const centerX = toolbarWidth <= threshold
            ? fullWidth / 2
            : toolbarWidth + (fullWidth - toolbarWidth) / 2;
        // Vertical placement: the band's own centreline. Every child of #bbgl-toolbar is centred
        // against it (auto block margins, 04-section-iii-styles.js), so this is the icon row's
        // centre by construction rather than something averaged back out of the icons.
        const centerY = bandHeight / 2;
        return { topPanel, centerX, centerY };
    }

    // Writes --bbgl-ach-dot-x/-y onto a pagination cluster, translated into ITS OWN containing
    // block's coordinate space rather than #bbgl-top-panel's. In practice dx/dy are always 0 today
    // (both clusters are direct children of #bbgl-top-panel), but the subtraction is kept generic
    // rather than assumed away — an earlier, more-nested version of the stickerbook bar needed it,
    // or its Y-position came out negative and the bar rendered off-screen.
    function writeToolbarPaginationVars(el, center) {
        const parent = el.offsetParent;
        const dx = (parent && parent !== center.topPanel) ? parent.offsetLeft : 0;
        const dy = (parent && parent !== center.topPanel) ? parent.offsetTop : 0;
        el.style.setProperty('--bbgl-ach-dot-x', `${center.centerX - dx}px`);
        el.style.setProperty('--bbgl-ach-dot-y', `${center.centerY - dy}px`);
    }

    // Centres whichever pagination cluster is currently relevant — achievements footer or the
    // stickerbook's own bar — against the SVG icon toolbar, off one shared measurement
    // (measureToolbarCenter() above). Both are checked rather than assumed, so one call site
    // covers whichever view is active.
    //
    // Returns false if nothing relevant has measured to a real size yet — callers
    // (achRefreshPageDom()/renderStickers()) retry next frame, needed for the very first paint
    // after display:none -> flex.
    function layoutToolbarPaginationPosition() {
        const topPanel = document.getElementById('bbgl-top-panel');
        if (!topPanel) return true;
        const achFooter = topPanel.classList.contains('viewing-achievements') ? document.getElementById('bbgl-ach-footer') : null;
        const stickerBar = topPanel.classList.contains('viewing-stickers') ? document.getElementById('bbgl-sticker-pagination-bar') : null;
        const libBar = topPanel.classList.contains('viewing-library') ? document.getElementById('bbgl-lib-pagination-bar') : null;
        if (!achFooter && !stickerBar && !libBar) return true;
        const center = measureToolbarCenter();
        if (!center) return false;
        if (achFooter) writeToolbarPaginationVars(achFooter, center);
        if (stickerBar) writeToolbarPaginationVars(stickerBar, center);
        if (libBar) writeToolbarPaginationVars(libBar, center);
        return true;
    }

    // Single ResizeObserver on #bbgl-top-panel, set up once (not re-attached per DOM rebuild like
    // observeTitleBlockFrames() above) — the toolbar icons and both pagination clusters are never
    // destroyed/recreated the way .bbgl-title-block is on achRefreshPageDom()'s innerHTML swap, so
    // one persistent observer is enough. #bbgl-top-panel's own box changes on every mode switch
    // that matters here (the expanded/compact toggle, page mode's responsive width), so this
    // alone covers all of them without needing to hook every individual toggle's call site.
    function observeToolbarPaginationPosition() {
        const topPanel = document.getElementById('bbgl-top-panel');
        if (!topPanel) return;
        if (runtime.toolbarPaginationResizeObserver) runtime.toolbarPaginationResizeObserver.disconnect();
        runtime.toolbarPaginationResizeObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(layoutToolbarPaginationPosition);
        });
        runtime.toolbarPaginationResizeObserver.observe(topPanel);
    }

    // Eager call + retry-until-measured for layoutToolbarPaginationPosition() — shared by
    // achRefreshPageDom() (06-section-v-logic.js) and renderStickers()
    // (09-section-viii-stickers.js). The persistent ResizeObserver above (set up once, not here)
    // won't fire in time for the very first paint after a view's display:none -> flex, which would
    // otherwise flash the cluster at the wrong position for one frame. stillRelevant() lets a
    // retry loop notice the user has already navigated away and stop chasing a view that's no
    // longer active, same pattern layoutTitleBlockFrames()'s own retry loop uses.
    function retryToolbarPaginationLayout(stillRelevant) {
        if (layoutToolbarPaginationPosition()) return;
        let attemptsLeft = 30;
        const retry = () => {
            if (!stillRelevant()) return;
            attemptsLeft--;
            if (!layoutToolbarPaginationPosition() && attemptsLeft > 0) window.requestAnimationFrame(retry);
        };
        window.requestAnimationFrame(retry);
    }

    // Every level bar instance (panel + gym page), whichever are currently in the DOM.
    function getLevelBars() {
        return [
            ['bbgl-level-num', 'bbgl-level-fill', 'bbgl-level-container'],
            ['bbgl-gym-level-num', 'bbgl-gym-level-fill', 'bbgl-gym-level-container']
        ].map(([n, f, c]) => ({
            num: document.getElementById(n),
            fill: document.getElementById(f),
            container: document.getElementById(c)
        })).filter(b => b.num && b.fill && b.container);
    }

    function setLevelBarNumber(bar, level) {
        bar.num.textContent = 'Lv ' + level;
        bar.container.querySelectorAll('.bbgl-valve-digit').forEach(node => { node.textContent = level; });
        bar.container.dataset.level = level;
    }

    function renderLevelBar(bar, expVal) {
        const { atrophy, level, expInLevel, expToNext } = calculateLevelProgress(expVal);
        const pct = expToNext > 0 ? Math.min(100, (expInLevel / expToNext) * 100) : (level >= 100 ? 100 : 0);
        setLevelBarNumber(bar, level);
        bar.fill.style.width = ((pct / 100) * 90).toFixed(2) + '%';
        bar.fill.classList.toggle('level-full', pct >= 99.9);
        if (dom.panel) {
            dom.panel.dataset.atrophy = atrophy;
            dom.panel.dataset.level = level;
        }
        bar.container.dataset.atrophy = atrophy;
        bar.container.dataset.level = level;
        bar.container.setAttribute('data-tooltip', achLevelBarTooltipHTML(atrophy, level, pct));
    }

    // renderLevelBar() alone always animates the width change via the fill's CSS transition —
    // fine for the real click-triggered climb, wrong for anything that should just snap.
    function renderLevelBarInstant(bar, expVal) {
        bar.fill.style.transition = 'none';
        renderLevelBar(bar, expVal);
        void bar.fill.offsetWidth; // force reflow before re-enabling the CSS transition
        bar.fill.style.transition = '';
    }

    function updateLevelBar(silent) {
        const totalExp = getLiveLevelExp();

        if (runtime._lastLevelExp === undefined) {
            runtime._lastLevelExp = totalExp;
            const bars = getLevelBars();
            bars.forEach(b => renderLevelBar(b, totalExp));
            return;
        }

        const bars = getLevelBars();
        if (!bars.length) return;

        if (totalExp !== runtime._lastLevelExp) {
            // Silent updates — anything that isn't a train click (heartbeat, RESYNC, backfill,
            // post-gym exit sync) — skip the animation queue and snap straight to the value. A
            // level-up sequence playing for exp earned earlier or elsewhere reads as a bug to
            // anyone watching. If a train click's animation is already in flight, leave it
            // running rather than stomping its state; it'll catch up on a later call.
            if (silent) {
                if (!runtime._isAnimatingLevel) {
                    runtime._lastLevelExp = totalExp;
                    bars.forEach(b => renderLevelBarInstant(b, totalExp));
                }
            } else {
                runtime._targetLevelExp = totalExp;
                if (!runtime._isAnimatingLevel) {
                    runLevelAnimationQueue();
                }
            }
        } else if (!runtime._isAnimatingLevel) {
            // Exp is unchanged but bars may be newly created (e.g. panel just opened for the
            // first time this session while training was happening). Only render bars that have
            // never been initialized (empty fill width) — already-correct bars cost nothing.
            bars.forEach(b => {
                if (!b.fill.style.width) renderLevelBar(b, runtime._lastLevelExp);
            });
        }

        async function runLevelAnimationQueue() {
            runtime._isAnimatingLevel = true;
            const BASE_SPEED_MS = 1000; // 1 second for a full 100% bar
            let forcedNextTier = null; // set right after an atrophy-crossing animation plays

            while (runtime._lastLevelExp < runtime._targetLevelExp) {
                const currentProg = forcedNextTier !== null
                    ? { atrophy: forcedNextTier, level: LEVEL_ATRO_START[forcedNextTier], expInLevel: 0, expToNext: computeLevelExpCost(LEVEL_ATRO_START[forcedNextTier], forcedNextTier) }
                    : calculateLevelProgress(runtime._lastLevelExp);
                forcedNextTier = null;
                const targetProg = calculateLevelProgress(runtime._targetLevelExp);
                const currentRank = currentProg.atrophy * 1000 + (currentProg.level - LEVEL_ATRO_START[currentProg.atrophy]);
                const targetRank = targetProg.atrophy * 1000 + (targetProg.level - LEVEL_ATRO_START[targetProg.atrophy]);

                if (currentRank < targetRank && currentProg.level >= 100 && currentProg.atrophy < 2) {
                    // Already resting at a tier-complete Lv 100 (e.g. a dev/testing snap) with
                    // more exp still to apply — skip straight to the atrophy sequence instead of
                    // replaying a fill/flash for a "Lv 101" that doesn't exist.
                    await runAtrophyAnimation(currentProg.atrophy, bars);
                    forcedNextTier = currentProg.atrophy + 1;
                } else if (currentRank < targetRank) {
                    const expNeededToFill = currentProg.expToNext - currentProg.expInLevel;
                    const currentPct = parseFloat(bars[0].fill.style.width) || 0;
                    const durationMs = Math.max(150, ((100 - currentPct) / 100) * BASE_SPEED_MS);

                    bars.forEach(b => {
                        b.fill.style.transitionDuration = durationMs + 'ms';
                        b.fill.style.width = '90%';
                        b.fill.classList.add('level-full');
                    });

                    await new Promise(r => setTimeout(r, durationMs + 50));
                    bars.forEach(b => b.container.classList.add('bbgl-level-up-flash'));

                    await new Promise(r => setTimeout(r, 200));
                    const nextLevel = currentProg.level + 1;
                    bars.forEach(b => { setLevelBarNumber(b, nextLevel); });

                    await new Promise(r => setTimeout(r, 650));
                    bars.forEach(b => b.container.classList.remove('bbgl-level-up-flash'));

                    runtime._lastLevelExp += expNeededToFill;

                    if (nextLevel >= 100 && currentProg.atrophy < 2) {
                        // Tier complete — hand off to the atrophy sequence instead of the
                        // ordinary "snap fill back to 0%" reset below.
                        await runAtrophyAnimation(currentProg.atrophy, bars);
                        forcedNextTier = currentProg.atrophy + 1;
                    } else {
                        bars.forEach(b => {
                            b.fill.style.transition = 'none';
                            b.fill.style.width = '0%';
                            b.fill.classList.remove('level-full');
                            void b.fill.offsetWidth; // force reflow
                            b.fill.style.transition = '';
                        });
                    }
                } else {
                    runtime._lastLevelExp = runtime._targetLevelExp;

                    const currentPct = parseFloat(bars[0].fill.style.width) || 0;
                    const { level, expInLevel, expToNext } = calculateLevelProgress(runtime._lastLevelExp);
                    const targetPct = expToNext > 0 ? Math.min(100, (expInLevel / expToNext) * 100) : (level >= 100 ? 100 : 0);
                    const durationMs = Math.max(150, (Math.abs(targetPct - currentPct) / 100) * BASE_SPEED_MS);

                    bars.forEach(b => {
                        b.fill.style.transitionDuration = durationMs + 'ms';
                        renderLevelBar(b, runtime._lastLevelExp);
                    });

                    await new Promise(r => setTimeout(r, durationMs + 50));
                }
            }

            bars.forEach(b => { b.fill.style.transitionDuration = ''; });
            runtime._lastLevelExp = runtime._targetLevelExp;
            runtime._isAnimatingLevel = false;
        }
    }

    // Bypasses runLevelAnimationQueue() entirely — its while-loop only advances when exp goes
    // up, so an exp DROP (e.g. real -> demo's 0) leaves the bar rendered stale, and an exp jump
    // (e.g. demo's 0 -> real) replays the level-up climb one tier at a time. Demo mode enter/exit
    // both need an instant jump to whichever value is now live, so call this instead of relying
    // on updateLevelBar()'s queue.
    function snapLevelBar() {
        const totalExp = getLiveLevelExp();
        runtime._lastLevelExp = totalExp;
        runtime._targetLevelExp = totalExp;
        runtime._isAnimatingLevel = false;
        getLevelBars().forEach(b => {
            b.container.classList.remove('bbgl-level-up-flash');
            renderLevelBarInstant(b, totalExp);
        });
    }

    // Plays the tier-completion sequence: the just-finished tier's crown tucks away
    // (mole-in-hole pop), the next tier's crown rises into place (podium reveal), then
    // "Atrophied!" flashes at the climax. Leaves level/bar reset to the new tier's Lv 1 / 0%
    // so the caller's fill loop can continue animating any overflow exp on top of it.
    async function runAtrophyAnimation(fromAtrophy, bars) {
        const toAtrophy = fromAtrophy + 1;

        if (!userConfig.animations) {
            bars.forEach(b => {
                b.container.dataset.atrophy = toAtrophy;
                b.container.dataset.level = LEVEL_ATRO_START[toAtrophy];
                setLevelBarNumber(b, LEVEL_ATRO_START[toAtrophy]);
                b.fill.style.transition = 'none';
                b.fill.style.width = '0%';
                b.fill.classList.remove('level-full');
                void b.fill.offsetWidth;
                b.fill.style.transition = '';
            });
            if (dom.panel) { dom.panel.dataset.atrophy = toAtrophy; dom.panel.dataset.level = LEVEL_ATRO_START[toAtrophy]; }
            return;
        }

        const TUCK_MS = 350;
        const RISE_MS = 900;
        const FLASH_MS = 700;

        bars.forEach(b => b.container.classList.add('bbgl-crown-tuck'));
        await new Promise(r => setTimeout(r, TUCK_MS));

        bars.forEach(b => {
            b.container.classList.remove('bbgl-crown-tuck');
            b.container.dataset.atrophy = toAtrophy;
            b.container.classList.add('bbgl-crown-rise');
        });
        if (dom.panel) dom.panel.dataset.atrophy = toAtrophy;
        await new Promise(r => setTimeout(r, RISE_MS));

        bars.forEach(b => b.container.classList.add('bbgl-atrophied-flash'));
        await new Promise(r => setTimeout(r, FLASH_MS));

        bars.forEach(b => {
            b.container.classList.remove('bbgl-crown-rise', 'bbgl-atrophied-flash');
            b.container.dataset.level = LEVEL_ATRO_START[toAtrophy];
            setLevelBarNumber(b, LEVEL_ATRO_START[toAtrophy]);
            b.fill.style.transition = 'none';
            b.fill.style.width = '0%';
            b.fill.classList.remove('level-full');
            void b.fill.offsetWidth;
            b.fill.style.transition = '';
        });
        if (dom.panel) dom.panel.dataset.level = LEVEL_ATRO_START[toAtrophy];
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
                l = `Week of ${Formatter.dateMonthDay(start)}<span class="view-exp"> - ${Formatter.dateMonthDay(end)}</span>`;
            } else {
                l = isExp ? Formatter.dateFull(sl.label) : Formatter.datePretty(sl.label);
                if (!l) l = sl.label;
                if (sl.resolution === 'MONTH') {
                    l = sl.label + ' ' + calendarState.year;
                } else if (isP && sl._dailyList.length > 0 && sl.resolution !== 'ALL') {
                    const endLabel = Formatter.dateMonthDay(sl._dailyList[sl._dailyList.length - 1].date);
                    l += `<span class="view-exp"> (${Formatter.dateMonthDay(sl._dailyList[0].date)} - ${endLabel})</span>`;
                }
            }
            dEl.innerHTML = l;
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

            // 1. Primary drug (always). Avg/day parens are week+ only, shown in every panel mode
            // (including compact); daily view shows just the count (a single-day avg changes daily
            // and is confusing).
            let drugSub = '';
            if (!isDay) {
                const days = DataController.periodCalendarDays(sl);
                const drugAvg = days > 0 ? cnt(drugCode) / days : 0;
                drugSub = sl.resolution === 'ALL' ? '' : `<span class="bbgl-ic-sub">(${drugAvg.toFixed(2)})</span>`;
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
                `${refills}`;
            const refillTip = `<div style="text-align:center">Refills Used</div>`;
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
                    th = `<div class="rates-group" style="display:flex;flex-direction:column;align-items:center;line-height:1.1"><span>${sg}${Formatter.achAbbr(del, ACH_FMT.compact)}</span><span class="view-exp rate-pct" style="font-size:0.8em;opacity:0.7;margin-top:2px;margin-bottom:-2px;">(${sg}${Formatter.ratePct(pct)}%)</span></div>`;
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
        injectGymLevelBar();
        if (!dom.bestGym || !dom.bestGym.isConnected) injectBestGymToggle();
        const loc = userConfig.buttonLocation,
            showFooter = loc === 'notes' || loc === 'both',
            showSidebar = loc === 'sidebar' || loc === 'both';
        if (loc === _lastButtonLocation) {
            const gtCached = dom.gymTab && dom.gymTab.isConnected ? dom.gymTab : null;
            const sbDCached = dom.sbDesktop && dom.sbDesktop.isConnected ? dom.sbDesktop : null;
            const sbMCached = dom.sbMobile && dom.sbMobile.isConnected ? dom.sbMobile : null;
            const footerOk = !showFooter || !!gtCached;
            const sidebarOk = !showSidebar || !!sbDCached;
            if (footerOk && sidebarOk) {
                if (!gtCached) dom.gymTab = null;
                if (!sbDCached) dom.sbDesktop = null;
                if (!sbMCached) dom.sbMobile = null;
                if (showFooter && gtCached && dom.notesBtn && dom.notesBtn.isConnected && gtCached.nextSibling !== dom.notesBtn) {
                    dom.notesBtn.parentNode.insertBefore(gtCached, dom.notesBtn);
                }
                if (showSidebar) {
                    syncSidebarState();
                    if (!dom.sbMobile || !dom.sbMobile.isConnected) {
                        const mt = document.querySelector(SB_MOBILE.target);
                        if (mt) {
                            injectSidebarButton(SB_MOBILE, true);
                            dom.sbMobile = document.getElementById(SB_MOBILE.id);
                        }
                    }
                    if (!dom.sbFlyout || !dom.sbFlyout.isConnected) {
                        const ft = document.querySelector(SB_FLYOUT.target);
                        if (ft) {
                            injectSidebarButton(SB_FLYOUT, true);
                            dom.sbFlyout = document.getElementById(SB_FLYOUT.id);
                        }
                    }
                }
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
        if (!dom.sbFlyout || !dom.sbFlyout.isConnected) dom.sbFlyout = document.getElementById(SB_FLYOUT.id);
        if (showSidebar && (!dom.sbDesktop || !dom.sbMobile)) {
            if (!dom.sbDesktopTarget || !dom.sbDesktopTarget.isConnected) dom.sbDesktopTarget = document.querySelector(SB_DESKTOP.target);
            if (!dom.sbMobileTarget || !dom.sbMobileTarget.isConnected) dom.sbMobileTarget = document.querySelector(SB_MOBILE.target);
        }
        if (showSidebar && !dom.sbFlyout) {
            if (!dom.sbFlyoutTarget || !dom.sbFlyoutTarget.isConnected) dom.sbFlyoutTarget = document.querySelector(SB_FLYOUT.target);
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
            mt = dom.sbMobileTarget,
            ft = dom.sbFlyoutTarget;
        if (showSidebar) {
            if (dt && !dom.sbDesktop) {
                injectSidebarButton(SB_DESKTOP, false);
                dom.sbDesktop = document.getElementById(SB_DESKTOP.id);
            }
            if (mt && !dom.sbMobile) {
                injectSidebarButton(SB_MOBILE, true);
                dom.sbMobile = document.getElementById(SB_MOBILE.id);
            }
            if (ft && !dom.sbFlyout) {
                injectSidebarButton(SB_FLYOUT, true);
                dom.sbFlyout = document.getElementById(SB_FLYOUT.id);
            }
        } else {
            const dEl = dom.sbDesktop,
                mEl = dom.sbMobile,
                fEl = dom.sbFlyout;
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
            if (fEl) {
                fEl.remove();
                dom.sbFlyout = null;
            }
        }
        _lastButtonLocation = loc;
        if (showSidebar) syncSidebarState();
        Perf.end('handleDomMutation');
    }
    const SB_DESKTOP = {
            target: '#nav-gym[class*="area-desktop"]',
            container: 'area-desktop___vZLI8',
            link: 'desktopLink___SG2RU',
            row: 'area-row___iBD8N',
            id: 'nav-gym-log-desktop'
        },
        SB_MOBILE = {
            target: '#nav-gym[class*="area-mobile"]:not(#fly-out-panel *)',
            container: 'area-mobile___sx8BQ',
            link: 'mobileLink___xTgRa sidebarMobileLink',
            row: 'area-row___iBD8N',
            slide: 'swiper-slide slide___se7hj',
            id: 'nav-gym-log-mobile'
        },
        SB_FLYOUT = {
            target: '#fly-out-panel [id="nav-gym"]',
            container: 'area-mobile___AK1cR notList___jrp60',
            link: 'link___tg6eQ mobileLink___NbSV4',
            row: 'areaRow___Eheay',
            id: 'nav-gym-log-flyout'
        },
        GYM_LOG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" stroke="transparent" stroke-width="0" width="18" height="18" viewBox="60 20 280 215"><defs><linearGradient id="bbgl_notif_purple_grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#d896e0"></stop><stop offset="100%" stop-color="#ab47bc"></stop></linearGradient></defs><g transform="scale(1, 1.15)"><path d="${ICONS.LOGO_PATH}"></path></g></svg>`;

    function syncSidebarState() {
        const a = window.location.hash.includes('gymlog'),
            ids = [SB_DESKTOP.id, SB_MOBILE.id, SB_FLYOUT.id];
        // Inert marker — Torn no longer lights its nav icons on the active page, so nothing styles
        // this any more. Kept because it anchors the add/strip symmetry below (the else-branch
        // clears every active___* class regardless of origin). The visible selected state now
        // comes purely from Torn's own class, learned just below.
        const BBGL_ACTIVE = 'active___bbgl';
        // Torn's native highlight is keyed on its own hashed active class (one hash per build).
        // Opportunistically learn it from any genuinely-active nav item and cache it, so it can be
        // reapplied on the gym-log page. If never seen this session (e.g. a direct load straight
        // onto the gym log), the entry just shows no selected state. Learned once and stopped —
        // this probe is the only unanchored selector on this path and syncSidebarState runs on
        // every DOM mutation — so a stale hash after a Torn rebuild only costs cosmetics until reload.
        if (!runtime._sidebarActiveCls) {
            const probe = document.querySelector('[id^="nav-"][class*="active___"]');
            if (probe && !ids.includes(probe.id)) {
                const real = Array.from(probe.classList).find(c => c.startsWith('active___') && c !== BBGL_ACTIVE);
                if (real) runtime._sidebarActiveCls = real;
            }
        }
        const realActive = runtime._sidebarActiveCls;
        if (a) {
            ids.forEach(id => {
                const c = document.getElementById(id);
                if (!c) return;
                if (!c.classList.contains(BBGL_ACTIVE)) c.classList.add(BBGL_ACTIVE);
                if (realActive && !c.classList.contains(realActive)) c.classList.add(realActive);
            });
            const strip = el => Array.from(el.classList).filter(cls => cls.startsWith('active___')).forEach(cls => el.classList.remove(cls));
            if (realActive) {
                // Same scope as the fallback below (nav entries and their descendants, never our
                // own), but driven off the class bucket instead of two attribute-substring scans:
                // selectors match right-to-left, so this starts from the handful of elements that
                // actually carry Torn's active class rather than enumerating every [id^="nav-"]
                // and re-scanning each one's subtree. Runs on every mutation batch while the gym
                // log page is open, so the difference compounds.
                const ownSel = ids.map(i => '#' + i).join(',');
                document.querySelectorAll(`[id^="nav-"].${realActive}, [id^="nav-"] .${realActive}`).forEach(el => {
                    if (el.closest(ownSel)) return;
                    strip(el);
                });
            } else {
                // Hash not learned yet (nothing has been active this session). One-time path.
                document.querySelectorAll('[id^="nav-"]').forEach(navEl => {
                    if (ids.includes(navEl.id)) return;
                    [navEl, ...navEl.querySelectorAll('[class*="active___"]')].forEach(strip);
                });
            }
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
        const maxNavHeight = window.innerHeight * 0.4;
        for (const el of document.body.children) {
            if (el.id && el.id.startsWith('bbgl-')) continue;
            const style = window.getComputedStyle(el);
            if (style.position === 'fixed') {
                const rect = el.getBoundingClientRect();
                if (rect.top < 10 && rect.bottom > ceiling && (rect.bottom - rect.top) < maxNavHeight) ceiling = Math.ceil(rect.bottom);
            }
        }
        _topCeilingCache = ceiling;
        _topCeilingTs = Date.now();
        return ceiling;
    }

    // True if any node in the list is — or contains — one of Torn's open/visible window shells.
    // Hoisted out of the lifecycle observer's callback so it isn't reallocated every time
    // attachLayoutObservers() re-arms, and so the two node lists can be walked in place instead of
    // being spread into a throwaway array per mutation record.
    function _containsLayoutWindow(nodeList) {
        if (!nodeList || !nodeList.length) return false;
        for (const n of nodeList) {
            if (!n || n.nodeType !== 1) continue;
            const cn = n.className || '';
            if (typeof cn === 'string' && (cn.includes('visible___') || cn.includes('opened___'))) return true;
            // The subtree probe is the expensive half of this scan, and a node with no element
            // children cannot possibly contain a match.
            if (n.firstElementChild && n.querySelector('[class*="visible___"], [class*="opened___"]')) return true;
        }
        return false;
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

    function _syncLayoutResizeTargets(precomputedWindows) {
        if (!runtime.layoutResizeObserver) return;
        const prev = runtime._layoutResizeTargets || (runtime._layoutResizeTargets = new Set());
        const next = new Set();
        (precomputedWindows || _getLayoutWindows()).forEach(w => {
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

    // Applies (or releases, with `offset` = '') the chat-window shove. Shared by the closed-panel
    // fast path and the full pass below so the release stays byte-identical to what the full pass
    // would have written.
    function _applyChatShove(shoveTargets, offset) {
        shoveTargets.forEach(t => {
            t.style.right = offset;
            const _tr = t.style.transition || '';
            if (!_tr.includes('right')) t.style.transition = _tr ? _tr + ', right 0.2s ease-out' : 'right 0.2s ease-out';
        });
    }

    function handleLayout() {
        const p = dom.panel,
            tb = dom.gymTab,
            isPanelOpen = p && p.style.display !== 'none';
        if (!p || p.classList.contains('bbgl-mode-page')) {
            if (tb) tb.classList.toggle('bbgl-tab-active', !!isPanelOpen);
            return;
        }
        // Closed panel: the only effects that actually have to land are the tab going inactive
        // and the chat shove being released — both idempotent, so do them once per close and let
        // every later layout event fast-path out instead of re-measuring a display:none panel.
        if (!isPanelOpen) {
            if (tb) tb.classList.remove('bbgl-tab-active');
            if (!runtime._layoutClosedReset) {
                runtime._layoutClosedReset = true;
                _applyChatShove(_bbglGetChatShoveTargets(), '');
            }
            return;
        }
        runtime._layoutClosedReset = false;
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
        const visWins = _getLayoutWindows();
        _syncLayoutResizeTargets(visWins);
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
        if (tb) tb.classList.add('bbgl-tab-active');
        p.style.setProperty('max-height', `calc(100vh - ${topCeiling}px)`, 'important');
        p.style.right = pRight;
        p.style.opacity = pOpacity;
        p.style.pointerEvents = pPointer;
        // Defensive: clears a stale transform the parent container might still carry.
        const _staleParent = (shoveTargets[0] && shoveTargets[0].parentElement) || null;
        if (_staleParent && _staleParent.style.transform) _staleParent.style.transform = '';
        _applyChatShove(shoveTargets, `${totalShift}px`);
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

    // Marks the panel as resizing for the duration of its native width/height transition, so
    // backdrop-filter (expensive to animate) can be suppressed for that window via CSS
    // (see `#bbgl-panel.bbgl-resizing` in the stylesheet). Cleans up on transitionend, with a
    // timeout fallback in case the event doesn't fire (e.g. transition got interrupted).
    function markPanelResizing(p) {
        if (!p) return;
        if (p._bbglResizingCancel) p._bbglResizingCancel();
        p.classList.add('bbgl-resizing');
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            p.removeEventListener('transitionend', onEnd);
            clearTimeout(timer);
            p.classList.remove('bbgl-resizing');
            p._bbglResizingCancel = null;
        };
        const onEnd = (ev) => {
            if (ev.target === p && (ev.propertyName === 'width' || ev.propertyName === 'height')) finish();
        };
        p.addEventListener('transitionend', onEnd);
        const timer = setTimeout(finish, 350); // matches the stylesheet's .3s width/height transition + margin
        p._bbglResizingCancel = finish;
    }

    // True when every record in a MutationObserver batch happened inside BBGL's own tooltip or panel.
    // The document.body-subtree observers (domObs in 10-section-ix-init.js, watchLayoutLifecycle below)
    // exist to notice Torn rebuilding its page, but they also fired on the script's own churn — the
    // tooltip's content swap on every new hover target, shine elements built on first hover, calendar
    // and graph re-renders — and ran their checks again each time. A record's target is the node
    // whose children changed, so BBGL's own elements being added/removed by Torn (target = Torn's
    // parent) never count as "own" and still get handled.
    function _bbglMutationsAreOwn(muts) {
        for (const m of muts) {
            const t = m.target;
            const el = t && (t.nodeType === 1 ? t : t.parentElement);
            if (!el || !el.closest('#bbgl-tooltip, #bbgl-panel')) return false;
        }
        return true;
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
                // handleLayout() already enumerates the visible windows and syncs the
                // ResizeObserver off that same list. Calling _syncLayoutResizeTargets() here too
                // meant every layout event ran _getLayoutWindows() twice, and that helper reads
                // offsetWidth/offsetHeight per candidate — a forced synchronous layout per pass.
                // Chat traffic alone fires this path constantly (watchChatRoot below observes
                // #chatRoot's whole subtree), so the duplicate was not cheap.
                handleLayout();
                // The settle resync exists to re-observe windows that were still animating open
                // when the frame above measured them. With the panel closed handleLayout()
                // fast-paths out and nothing consumes a resize, so don't schedule a third pass.
                clearTimeout(runtime._layoutResyncTimer);
                runtime._layoutResyncTimer = null;
                const _p = dom.panel;
                if (_p && _p.style.display !== 'none' && !_p.classList.contains('bbgl-mode-page')) {
                    runtime._layoutResyncTimer = setTimeout(function() {
                        runtime._layoutResyncTimer = null;
                        _syncLayoutResizeTargets();
                    }, 350);
                }
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
                // Skips the scan entirely once a frame is already queued — it observes
                // document.body's whole subtree, and Torn delivers chat traffic in bursts, so
                // re-scanning every record after the first was real wasted work. Nothing is missed:
                // the queued frame reads live DOM state when it runs, not a snapshot.
                if (runtime.layoutRafId) return;
                if (_bbglMutationsAreOwn(muts)) return;
                for (const m of muts) {
                    if (m.type !== 'childList') continue;
                    if (_containsLayoutWindow(m.addedNodes) || _containsLayoutWindow(m.removedNodes)) {
                        onLayoutChange();
                        return;
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
        const ids = [SB_DESKTOP.id, SB_MOBILE.id, SB_FLYOUT.id];
        ids.forEach(id => {
            const c = document.getElementById(id);
            if (!c) return;
            if (active) c.classList.add('bbgl-sb-notif');
            else c.classList.remove('bbgl-sb-notif');
        });
    }

    function injectGymLevelBar() {
        const gymRoot = document.getElementById('gymroot');
        if (!gymRoot) return;
        if (document.getElementById('bbgl-gym-level-container')) return;
        const properties = gymRoot.querySelector('[class*="properties___"]');
        if (!properties) return;
        const gymContent = properties.closest('[class*="gymContent___"]');
        if (!gymContent) return;

        const template = document.createElement('template');
        template.innerHTML = buildLevelBarHTML(true);
        const container = template.content.firstElementChild;
        const num = container.querySelector('#bbgl-gym-level-num');
        const fill = container.querySelector('#bbgl-gym-level-fill');

        gymContent.insertAdjacentElement('beforebegin', container);

        DataController.buildProgressionCache();
        renderLevelBar({ num, fill, container }, getLiveLevelExp());
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
        // Lives in the empty top-right of the gym EXP bar's top margin, absolutely positioned
        // (#bbgl-gym-level-container .bbgl-bestgym, 04-section-iii-styles.js) so the bar's sizing
        // is untouched. handleDomMutation() injects the bar first; if it isn't there yet, the
        // next mutation retries.
        const levelContainer = document.getElementById('bbgl-gym-level-container');
        if (!levelContainer) return;
        const pill = document.createElement('div');
        pill.id = 'bbgl-bestgym';
        pill.className = 'bbgl-bestgym';
        pill.innerHTML = `<label class="bbgl-switch bbgl-switch-purple"><input type="checkbox" id="bbgl-bestgym-input"><span class="slider"></span></label><svg class="bbgl-bestgym-logo" xmlns="http://www.w3.org/2000/svg" viewBox="60 20 280 215"><g transform="scale(1, 1.15)"><path fill="currentColor" d="${ICONS.LOGO_PATH}"></path></g></svg><span class="bbgl-bestgym-label" data-tooltip-html="${TOOLTIPS.BEST_GYM}">BB Best Gym</span>`;
        const cb = pill.querySelector('#bbgl-bestgym-input');
        cb.checked = !!userConfig.bestGym;
        cb.onchange = () => setBestGym(cb.checked);
        levelContainer.appendChild(pill);
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
            const _liveContainer = Array.from(n.classList).filter(cl => !cl.startsWith('active___') && !cl.startsWith('attention___')).join(' ');
            if (_liveContainer) {
                const hasNotif = c.classList.contains('bbgl-sb-notif');
                c.className = _liveContainer;
                if (hasNotif) c.classList.add('bbgl-sb-notif');
            }
            const _liveRow = n.querySelector('[class*="area-row"], [class*="areaRow"]') || n.firstElementChild;
            if (_liveRow) r.className = _liveRow.className;
            const _scopedSiblings = n.parentNode ? Array.from(n.parentNode.children).filter(el => el !== n && el.id && el.id.startsWith('nav-') && el.id !== cfg.id && el.querySelector('a')) : [];
            const _siblingSelector = mob ? '[id^="nav-"][class*="area-mobile"]' : '[id^="nav-"][class*="area-desktop"]';
            const _allSiblings = _scopedSiblings.length ? _scopedSiblings : Array.from(document.querySelectorAll(_siblingSelector)).filter(el => el !== n && el.id !== cfg.id && el.querySelector('a'));
            const _inactiveSibling = _allSiblings.find(el => !Array.from(el.classList).some(cls => cls.startsWith('active___')));
            const _siblingSection = _inactiveSibling || _allSiblings[0];
            const _extractClass = (cn, prefixes) => (cn || '').split(/\s+/).filter(x => x && prefixes.some(p => x.startsWith(p))).join(' ');
            const _neutralLink = _siblingSection ? _siblingSection.querySelector('a') : null;
            if (_neutralLink) {
                l.className = _extractClass(_neutralLink.className, ['link___', 'desktopLink', 'mobileLink', 'sidebarMobileLink']);
                const _sw = _neutralLink.querySelector('[class*="svgIconWrap"]');
                const _di = _neutralLink.querySelector('[class*="defaultIcon"]');
                const _ln = _neutralLink.querySelector('[class*="linkName"]');
                const _liveSvgWrap = _sw ? _extractClass(_sw.className, ['svgIconWrap']) : 'svgIconWrap___AMIqR';
                const _liveDefIcon = _di ? _extractClass(_di.className, ['defaultIcon', 'mobile']) : 'defaultIcon___iiNis mobile___paLva';
                const _liveLinkName = _ln ? _extractClass(_ln.className, ['linkName']) : 'linkName___FoKha';
                l.innerHTML = `<span class="${_liveSvgWrap}"><span class="${_liveDefIcon}">${GYM_LOG_ICON}</span></span>${_ln ? `<span class="${_liveLinkName}">Gym Log</span>` : '<span>Gym Log</span>'}`;
            }
            const p = n.closest('.swiper-slide');
            if (p) {
                const s = document.createElement('div');
                s.className = cfg.slide || 'swiper-slide slide___se7hj';
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
            } else {
                n.parentNode.insertBefore(c, n.nextSibling);
            }
        });
        syncSidebarState();
    }

    function generateDayStartSelect(id, selectedVal = 'utc') {
        return `<select id="${id}" class="bbgl-native-select"><option value="utc"${selectedVal === 'utc' ? ' selected' : ''}>Torn Time (UTC)</option><option value="local"${selectedVal === 'local' ? ' selected' : ''}>Local Time</option></select>`;
    }

    function buildSection(title, bodyHTML, bodyStyle = '', titleExtraHTML = '') {
        const style = bodyStyle ? ` style="${bodyStyle}"` : '';
        return `<div class="bbgl-prefs-tab-title"><span>${title}</span>${titleExtraHTML}</div><div class="bbgl-settings-body"${style}>${bodyHTML}</div>`;
    }

    function buildRow(labelHTML, controlHTML, extraClass = '') {
        return `<div class="bbgl-setting-row${extraClass ? ' ' + extraClass : ''}">${labelHTML}${controlHTML}</div>`;
    }

    function buildToggle(id, labelHTML, extraClass = '') {
        return buildRow(labelHTML, `<label class="bbgl-switch"><input type="checkbox" id="${id}"><span class="slider"></span></label>`, extraClass);
    }

    function buildButton(id, label, modifier = '', extraStyle = '') {
        const cls = ['bbgl-btn', modifier ? `bbgl-btn-${modifier}` : ''].filter(Boolean).join(' ');
        const style = extraStyle ? ` style="${extraStyle}"` : '';
        return `<button id="${id}" class="${cls}"${style}>${label}</button>`;
    }

    // Single source of truth for "which corners are flat" in a vertical button stack (Settings
    // sections like Information/API Access). 'top' and 'bottom' round only their outer corners and
    // drop the border that would otherwise double up against the neighboring button; 'mid' is fully
    // flat on all corners. Pick the position by role, not by trial and error — that's what caused
    // buttons in the middle of a stack to render with stray rounded corners before.
    function stackBtnStyle(pos) {
        return {
            top: 'border-bottom-left-radius:0; border-bottom-right-radius:0; border-bottom:none;',
            mid: 'border-radius:0; border-bottom:none;',
            bottom: 'border-top-left-radius:0; border-top-right-radius:0;'
        }[pos];
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
        AGREE_GATE: "Check the box to confirm you've read the disclosure",
        LOCKED: "Locked",
        LEDGER_VIEW: "Ledger",
        GRAPH_VIEW: "Graph",
        STICKERBOOK: "Stickerbook",
        ACHIEVEMENTS: "Achievements",
        LIBRARY: "Library",
        COPY_SESSION: "Copy Session Data",
        ALL_TIME_SUMMARY: "All-Time Summary",
        YEARLY_SUMMARY: "Yearly Summary",
        MONTHLY_SUMMARY: "Monthly Summary",
        DEMO_EXIT: "Exit Demo Mode",
        DEMO_EXIT_HTML: "Exit Demo Mode<i>Stats shown here are for previewing the functions of the script only — they do not reflect realistic Torn growth.</i>",
        REFRESH_COOLDOWN: (remaining) => `Please wait ${remaining}s before refreshing the log again`,
        BACKFILL_RESUME_COOLDOWN: (t) => `Torn's daily row cap has been reached. Resume available in ${t}.`,
        BACKFILL_COMPLETE_ORIGIN: "Your full training history was reconstructed back to the very beginning.",
        BACKFILL_COMPLETE_EXHAUSTED: "Scan reached the end of the logs Torn still retains. Any older history is no longer available from Torn's servers.",
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
    const docCache = {};
    function fetchDoc(name) {
        if (docCache[name]) return Promise.resolve(docCache[name]);
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                // Cache-busting query param, tied to the TEMP raw.githubusercontent.com bypass in
                // BASE_DOCS_URL (see 02-section-i-constants.js) — raw.githubusercontent.com sits
                // behind its own short-lived CDN cache too, so without this a push can take a few
                // minutes to actually show up. Drop this once BASE_DOCS_URL is re-wrapped in cdnize(...).
                url: BASE_DOCS_URL + name + '.html?_=' + Date.now(),
                onload(res) {
                    if (res.status >= 200 && res.status < 300) {
                        docCache[name] = res.responseText;
                        resolve(res.responseText);
                    } else {
                        reject(new Error(`Doc fetch failed: ${res.status}`));
                    }
                },
                onerror() { reject(new Error('Doc fetch network error')); }
            });
        });
    }
    const DOC_LOADING_HTML = `<div style="padding:20px; text-align:center; color:#888;">Loading...</div>`;
    const DOC_ERROR_HTML   = `<div style="padding:20px; text-align:center; color:#888;">Could not load document. Check your connection.</div>`;

    const PRIVACY_TEXT = {
        AGREE_LABEL: "I have read and agree to this disclosure."
    };

    function buildPrivacyModalHTML(reviewMode) {
        // Agreement mode: checkbox + DEMO / AGREE footer.
        // Review mode (already agreed): scrollable disclosure + green pre-checked row + X to close. No buttons.
        const scrollbox = `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:300px;"><div id="bbgl-privacy-disc">${DOC_LOADING_HTML}</div></div>`;
        const ctrl = reviewMode ? `<span class="bbgl-ack-check bbgl-ack-agreed">${ICONS.CHECK}</span>` : `<input type="checkbox" id="bbgl-privacy-ack">`;
        const label = reviewMode ? `<span class="bbgl-ack-agreed-label">${PRIVACY_TEXT.AGREE_LABEL}</span>` : `<label for="bbgl-privacy-ack">${PRIVACY_TEXT.AGREE_LABEL}</label>`;
        const ackRow = `<div class="bbgl-ack-row" style="margin:0 10px 8px 10px;">${ctrl}${label}</div>`;
        const footer = reviewMode ? '' : `<div style="display:flex; margin:0 10px 4px 10px;">${buildButton('bbgl-privacy-demo-btn', 'DEMO', 'purple', 'flex:2; border-radius:4px 0 0 4px; margin:0;')}<span class="bbgl-agree-wrap" style="flex:1; display:flex;" data-tooltip="${TOOLTIPS.AGREE_GATE}">${buildButton('bbgl-privacy-agree-btn', 'AGREE', 'green', 'flex:1; border-radius:0 4px 4px 0; margin:0;')}</span></div>`;
        const discSection = buildSection('Big Black Dicslosure', `${scrollbox}${ackRow}`, 'margin-bottom:8px;');
        return `<div class="bbgl-modal-overlay" id="bbgl-privacy-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-privacy-close" title="Close">${ICONS.CLOSE}</div>${discSection}${footer}</div></div>`;
    }

    function closePrivacyModal() {
        const m = document.getElementById('bbgl-privacy-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function buildChangelogModalHTML() {
        const changelogSection = buildSection('BBGL Test Phase Changelog', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:300px;"><div id="bbgl-changelog-content" style="font-family:Arial,sans-serif; font-size:12px; color:#ccc; line-height:1.7;">${DOC_LOADING_HTML}</div></div>`, 'margin-bottom:8px;');
        return `<div class="bbgl-modal-overlay" id="bbgl-changelog-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-changelog-close" title="Close">${ICONS.CLOSE}</div>${changelogSection}</div></div>`;
    }

    function closeChangelogModal() {
        const m = document.getElementById('bbgl-changelog-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    async function openChangelogModal() {
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
        try {
            const changelogHTML = await fetchDoc('changelog');
            const inner = modal.querySelector('#bbgl-changelog-content');
            if (inner) inner.innerHTML = changelogHTML;
        } catch (e) {
            const inner = modal.querySelector('#bbgl-changelog-content');
            if (inner) inner.innerHTML = DOC_ERROR_HTML;
        }
    }

    function buildFeatureGuideModalHTML() {
        const guideSection = buildSection('Feature Guide', `<div class="bbgl-modal-scrollbox" style="max-height:calc(68vh - 80px); min-height:300px;"><div style="padding:20px; text-align:center; color:#888;">Cumming Soon...</div></div>`, 'margin-bottom:8px;');
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

    // Shown right after START TRACKING (post key-verification): the user chooses whether to begin
    // with an empty log or reconstruct their history via Big Black Backfill. The panel is already
    // initialized and sitting on the (empty) ledger behind this modal, so dismissing == start fresh.
    function buildBackfillChoiceModalHTML() {
        const intro = `<div style="padding:6px 4px 14px; color:#ccc; font-size:12px; line-height:1.6; text-align:center;">Start tracking now with no log history, or use Big Black Backfill to reconstruct your training history from Torn's logs. You can always get Big Black Backfilled later from the Settings.</div>`;
        const buttons = `<div style="display:flex; gap:0; margin:0 6px 2px;">${buildButton('bbgl-choice-fresh-btn', 'START EMPTY LOG', '', 'flex:1; border-radius:4px 0 0 4px; margin:0;')}${buildButton('bbgl-choice-backfill-btn', 'BIG BLACK BACKFILL', 'purple', 'flex:1; border-radius:0 4px 4px 0; margin:0;')}</div>`;
        return `<div class="bbgl-modal-overlay" id="bbgl-choice-modal"><div class="bbgl-modal-window"><div class="close-settings-btn bbgl-close-x" id="bbgl-choice-close" title="Close">${ICONS.CLOSE}</div>${buildSection('Start Tracking', intro + buttons, 'margin-bottom:8px;')}</div></div>`;
    }

    function closeBackfillChoiceModal() {
        const m = document.getElementById('bbgl-choice-modal');
        if (m && m.parentNode) m.parentNode.removeChild(m);
    }

    function openBackfillChoiceModal() {
        if (runtime.demoMode) return;
        closeBackfillChoiceModal();
        document.body.insertAdjacentHTML('beforeend', buildBackfillChoiceModalHTML());
        const modal = document.getElementById('bbgl-choice-modal');
        if (!modal) return;
        const close = () => {
            closeBackfillChoiceModal();
            switchView('ledger');
        };
        modal.querySelector('#bbgl-choice-close').onclick = close;
        modal.onclick = (e) => { if (e.target === modal) close(); };
        const fresh = modal.querySelector('#bbgl-choice-fresh-btn');
        if (fresh) fresh.onclick = function() { this.blur(); close(); };
        const bf = modal.querySelector('#bbgl-choice-backfill-btn');
        if (bf) bf.onclick = function() {
            this.blur();
            close();
            // Kick off the scan; the masked overlay takes over the panel from here.
            backfillLogs(document.getElementById('backfill-btn'));
        };
    }

    async function openPrivacyModal() {
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
        if (!reviewMode) {
            const agreeBtn = modal.querySelector('#bbgl-privacy-agree-btn'),
                agreeWrap = modal.querySelector('.bbgl-agree-wrap'),
                ackBox = modal.querySelector('#bbgl-privacy-ack');
            agreeBtn.classList.add('bbgl-btn-disabled');
            const refreshAgreeState = () => {
                if (ackBox.checked) {
                    agreeBtn.classList.remove('bbgl-btn-disabled');
                    if (agreeWrap) agreeWrap.removeAttribute('data-tooltip');
                } else {
                    agreeBtn.classList.add('bbgl-btn-disabled');
                    if (agreeWrap) agreeWrap.setAttribute('data-tooltip', TOOLTIPS.AGREE_GATE);
                }
            };
            ackBox.onchange = refreshAgreeState;
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
                if (!runtime.wasVersionWiped) {
                    localStorage.setItem(KEYS.CHANGELOG_VER, SCRIPT_VERSION);
                }
                closePrivacyModal();
                refreshInitLock();
                const wv = dom.welcomeView;
                if (wv && wv.classList.contains('active-view')) refreshInitMask(wv);
            };
        }
        const disc = modal.querySelector('#bbgl-privacy-disc');
        // In-modal doc swap: any element in a loaded doc carrying data-bbgl-doc="<name>" (e.g. a
        // "technical details" link in privacy.html pointing to "privacy-tech", and a "back" link in
        // that doc pointing to "privacy") swaps the disclosure content in place without leaving the
        // modal. Copy and link placement live entirely in the docs.
        const wireDocSwap = (container) => {
            if (!container) return;
            container.querySelectorAll('[data-bbgl-doc]').forEach(link => {
                link.style.cursor = 'pointer';
                link.onclick = async (e) => {
                    e.preventDefault();
                    const name = link.getAttribute('data-bbgl-doc');
                    if (!name) return;
                    container.innerHTML = DOC_LOADING_HTML;
                    try {
                        container.innerHTML = await fetchDoc(name);
                    } catch (err) {
                        container.innerHTML = DOC_ERROR_HTML;
                    }
                    wireDocSwap(container);
                };
            });
        };
        try {
            const disclosureHTML = await fetchDoc('privacy');
            if (disc) {
                disc.innerHTML = disclosureHTML;
                wireDocSwap(disc);
            }
        } catch (e) {
            if (disc) disc.innerHTML = DOC_ERROR_HTML;
        }
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
        snapLevelBar();
        switchView('ledger');
    }

    function enterDemoFromSettings() {
        enterDemo('settings');
    }

    function buildWelcomeIntroSection() {
        const body = `<div id="bbgl-welcome-intro-text">${DOC_LOADING_HTML}</div>${buildButton('init-privacy-btn', 'PRIVACY DISCLOSURE', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;')}`;
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
        const note = `<div id="bbgl-welcome-returning-text">${DOC_LOADING_HTML}</div>`;
        const importBtn = buildButton('init-returning-import-btn', 'IMPORT LOG', '', 'margin:0 10px 8px 10px; width: calc(100% - 20px); display:block;');
        const hiddenFile = `<input type="file" id="init-import-file" accept=".json,application/json" style="display:none">`;
        return buildSection('Returning User', note + importBtn + hiddenFile, 'margin-bottom:5px;');
    }

    async function populateWelcomeContent(wv) {
        let introHTML = DOC_ERROR_HTML, returningHTML = DOC_ERROR_HTML;
        try {
            const raw = await fetchDoc('welcome');
            const parts = raw.split('<!--RETURNING-->');
            introHTML     = parts[0] || DOC_ERROR_HTML;
            returningHTML = parts[1] || DOC_ERROR_HTML;
        } catch (e) {}
        const introEl     = wv.querySelector('#bbgl-welcome-intro-text');
        const returningEl = wv.querySelector('#bbgl-welcome-returning-text');
        if (introEl)     introEl.innerHTML = introHTML;
        if (returningEl) returningEl.innerHTML = returningHTML;
    }

    function getWelcomeHTML() {
        const isInit = !!localStorage.getItem('bbgl_initialized') || runtime.demoMode;
        const closeBtn = isInit ? `<div class="close-settings-btn bbgl-close-x" title="Close">${ICONS.CLOSE}</div>` : '';
        return `${closeBtn}<div class="bbgl-settings-scroll-area">${buildWelcomeIntroSection()}${buildWelcomeInitSection()}${buildWelcomeReturningSection()}</div>`;
    }

    // Small duplicate of the Refresh Log button, embedded in the "Big Black Features" title bar.
    // Idle label follows the panel mode (view-std/view-exp, same CSS-driven swap "BB Backfill" uses
    // above); the syncing/done states are identical text in every mode, so they skip that split.
    function buildResyncBtn() {
        const idle = `<span class="bbgl-rs-idle"><span class="view-std">RESYNC</span><span class="view-exp">RESYNC LOG</span></span>`,
            syncing = `<span class="bbgl-rs-sync" style="display:none;"><span class="view-std">...</span><span class="view-exp">Syncing...</span></span>`,
            done = `<span class="bbgl-rs-done" style="display:none;">Resynced!</span>`;
        return `<button id="resync-btn" class="bbgl-tab-title-btn">${idle}${syncing}${done}</button>`;
    }

    function buildSettingsFeaturesSection() {
        const bestGymGroup = buildToggle('set-bestgym-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM}">BB Best Gym</span>`, 'bbgl-bestgym-lead') + buildToggle('set-bestgym-spec-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_SPEC}">Specialty Gyms</span>`, 'bbgl-subgroup-row') + buildToggle('set-bestgym-unpurch-toggle', `<span data-tooltip-html="${TOOLTIPS.BEST_GYM_UNPURCHASED}">Unpurchased Gyms</span>`, 'bbgl-subgroup-row bbgl-subgroup-row-last');
        const backfillBtn = buildButton('backfill-btn', 'Big Black Backfill', 'purple', 'margin: 8px 10px 8px 10px; width: calc(100% - 20px); display: block;');
        return buildSection('Big Black Features', bestGymGroup + buildToggle('set-rate-toggle', `<span data-tooltip-html="${TOOLTIPS.RATES}">Rate Displays</span>`) + buildToggle('set-anim-toggle', `<span data-tooltip-html="${TOOLTIPS.ANIM}">Animations</span>`) + buildRow(`<span data-tooltip-html="${TOOLTIPS.DRUG_TRACKER}">Drug Use Tracker</span>`, `<select id="set-drug-tracker" class="bbgl-native-select"><option value="xanax">Xanax</option><option value="lsd">LSD</option></select>`) + `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${backfillBtn}</div>`, '', buildResyncBtn());
    }

    function buildSettingsLogFormatSection() {
        return buildSection('Log Format', buildRow(`<span data-tooltip-html="${TOOLTIPS.LOC}">Log Access</span>`, `<select id="set-loc-select" class="bbgl-native-select"><option value="notes">Footer Tab</option><option value="sidebar">Sidebar</option><option value="both">Both</option></select>`) + buildRow(`<span data-tooltip-html="${TOOLTIPS.DAY_START}">Log Timezone</span>`, generateDayStartSelect('set-day-start', userConfig.dayStartMode)) + buildRow(`<span data-tooltip-html="${TOOLTIPS.WEEK_START}">Week Start</span>`, `<select id="set-week-start" class="bbgl-native-select"><option value="sun">Sun – Sat</option><option value="mon">Mon – Sun</option></select>`));
    }

    function buildSettingsApiSection() {
        const inputHTML = buildApiEntryField('set');
        const topBtn = buildButton('create-api-btn', 'CREATE API KEY', '', `margin: 0 10px 0 10px; width: calc(100% - 20px); display: block; ${stackBtnStyle('top')}`);
        // .bbgl-btn-grid's default :first-of-type/:last-of-type rules round the *top* corners of the
        // pair (right for a row sitting at the top of its stack, e.g. Data Management's Export/Import).
        // This row sits at the *bottom* of the API Access stack, below Create, so the rounding needs
        // to flip to the bottom-outer corners instead — hence the explicit overrides here.
        const stack = `<div class="bbgl-btn-grid" style="margin: 0 10px 10px 10px;">` +
            buildButton('clear-api-btn', 'CLEAR API KEY', 'red', 'border-radius: 0 0 0 5px;') +
            buildButton('updt-settings-btn', 'REGISTER API KEY', 'green', 'border-radius: 0 0 5px 0;') +
            `</div>`;
        return buildSection('API Access', `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${inputHTML}${topBtn}${stack}</div>`, 'margin-bottom: 5px;');
    }

    function buildSettingsDataSection() {
        // Refresh Log is hidden in favor of the Resync button in the "Big Black Features" title bar,
        // but kept in the DOM/code rather than deleted — see buildResyncBtn. With it hidden, Export/
        // Import becomes the visual top of this stack, so its outer corners pick up the rounding
        // Refresh Log used to own.
        const refreshBtn = buildButton('refresh-log-btn', 'REFRESH LOG', '', 'display: none;');
        const grid = `<div class="bbgl-btn-grid" style="margin: 8px 10px 0 10px;">${buildButton('export-btn', 'EXPORT LOG', '', 'border-radius: 5px 0 0 0; border-bottom: none;')}${buildButton('import-btn', 'IMPORT LOG', '', 'border-radius: 0 5px 0 0; border-bottom: none;')}<input type="file" id="import-file" accept=".json,application/json" style="display:none"></div>`;
        const inner = refreshBtn + grid + buildButton('clear-btn', 'CLEAR LOG', 'red', 'margin: 0 10px 8px 10px; width: calc(100% - 20px); display: block; border-top-left-radius: 0; border-top-right-radius: 0;');
        return buildSection('Data Management', `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${inner}</div>`);
    }

    function buildSettingsInfoSection() {
        const authorCredit = `<div class="bbgl-settings-author-credit">By <a class="bbgl-author-link" href="https://www.torn.com/profiles.php?XID=3550896" target="_blank" rel="noopener noreferrer">BigBlackHawk</a></div>`;
        const guideBtn = buildButton('feature-guide-btn', 'FEATURE GUIDE', '', `margin: 8px 10px 0 10px; width: calc(100% - 20px); display: block; ${stackBtnStyle('top')}`);
        const stack = `<div style="margin: 0 10px 0 10px; display: flex; flex-direction: column;">` +
            buildButton('settings-changelog-btn', 'CHANGELOG', '', `width: 100%; ${stackBtnStyle('mid')}`) +
            buildButton('settings-privacy-btn', 'PRIVACY DISCLOSURE', '', `width: 100%; ${stackBtnStyle('mid')}`) +
            `</div>`;
        const demoBtn = buildButton('settings-demo-btn', runtime.demoMode ? 'EXIT DEMO' : 'DEMO MODE', 'purple', `margin: 0 10px 8px 10px; width: calc(100% - 20px); display: block; ${stackBtnStyle('bottom')}`);
        return buildSection('Information', authorCredit + guideBtn + `<div class="bbgl-mask-host bbgl-demo-maskable" data-mask-text="Not available in demo mode">${stack}</div>${demoBtn}`);
    }

    function getSettingsHTML() {
        return `<div class="close-settings-btn" title="Close Settings">${ICONS.CHECK}</div><div class="bbgl-settings-scroll-area">${buildSettingsFeaturesSection()}${buildSettingsLogFormatSection()}${buildSettingsDataSection()}${buildSettingsApiSection()}${buildSettingsInfoSection()}</div>`;
    }

    let levelTrackSvgSerial = 0;

    function buildLevelTrackSVG() {
        const gradientPrefix = `bbgl-level-${++levelTrackSvgSerial}-`;
        const defs = `<defs><linearGradient id="lvl-tube-metal" x1="0" y1="0" x2="0" y2="1">${BAR_TERMINAL_STOPS}</linearGradient><linearGradient id="lvl-tube-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset=".23" stop-color="#fff" stop-opacity=".07"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".6" stop-color="#000" stop-opacity=".06"/><stop offset=".8" stop-color="#000" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient><linearGradient id="lvl-channel-lower" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040805"/><stop offset=".55" stop-color="#11180e"/><stop offset="1" stop-color="#1b2216"/></linearGradient><radialGradient id="lvl-glass-reflection" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#dce7df" stop-opacity=".34"/><stop offset=".45" stop-color="#c1d4c7" stop-opacity=".12"/><stop offset="1" stop-color="#c1d4c7" stop-opacity="0"/></radialGradient></defs>`;
        const housingDefs = `<defs><linearGradient id="lvl-collar-depth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset=".16" stop-color="#fff" stop-opacity=".35"/><stop offset=".32" stop-color="#fff" stop-opacity=".06"/><stop offset=".7" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient><linearGradient id="lvl-collar-rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#171a1c"/><stop offset=".2" stop-color="#81888b"/><stop offset=".3" stop-color="#e2e5e5"/><stop offset=".45" stop-color="#62696b"/><stop offset=".7" stop-color="#25292b"/><stop offset=".86" stop-color="#8a9192"/><stop offset="1" stop-color="#141719"/></linearGradient><linearGradient id="lvl-smoked-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05090c" stop-opacity=".3"/><stop offset=".16" stop-color="#effaff" stop-opacity=".48"/><stop offset=".3" stop-color="#d9edf5" stop-opacity=".12"/><stop offset=".48" stop-color="#101820" stop-opacity=".08"/><stop offset=".78" stop-color="#080e14" stop-opacity=".2"/><stop offset="1" stop-color="#dceff7" stop-opacity=".3"/></linearGradient><linearGradient id="lvl-rim-reflection" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#effaff" stop-opacity=".15"/><stop offset=".18" stop-color="#fff" stop-opacity=".8"/><stop offset=".56" stop-color="#e7f6ff" stop-opacity=".5"/><stop offset="1" stop-color="#e7f6ff" stop-opacity=".12"/></linearGradient><linearGradient id="lvl-housing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#242424"/><stop offset=".22" stop-color="#333333"/><stop offset=".55" stop-color="#202020"/><stop offset="1" stop-color="#101010"/></linearGradient><linearGradient id="lvl-shoulder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#383838"/><stop offset=".28" stop-color="#292929"/><stop offset=".7" stop-color="#1b1b1b"/><stop offset="1" stop-color="#0e0e0e"/></linearGradient></defs>`;
        const body = `<rect x="25" y="23" width="450" height="54" rx="2" ry="12" fill="url(#lvl-tube-glass)"/>
                <g class="bbgl-calendar-glass">
                    <path d="M27 82H473" stroke="#000" stroke-opacity=".3" stroke-width="5"/>
                    <rect x="25" y="23" width="450" height="54" rx="2" ry="12" fill="url(#lvl-smoked-glass)"/>
                    <path d="M27 27H473" stroke="url(#lvl-rim-reflection)" stroke-width="5"/>
                    <path d="M27 74H473" stroke="#e3f3fa" stroke-opacity=".4" stroke-width="3"/>
                    <path d="M65 36H285" stroke="url(#lvl-rim-reflection)" stroke-width="3"/>
                </g>
                <rect x="72" y="25" width="338" height="24" fill="url(#lvl-glass-reflection)"/><ellipse cx="28" cy="45" rx="2" ry="16" fill="url(#lvl-glass-reflection)"/><ellipse cx="472" cy="45" rx="2" ry="16" fill="url(#lvl-glass-reflection)"/>
                <rect width="16" height="100" fill="url(#lvl-housing)"/><rect x="484" width="16" height="100" fill="url(#lvl-housing)"/>
                <path d="M16 21H20V79H16Z M480 21H484V79H480Z" fill="#080c08"/>
                <path d="M14 10H16L18 17V83L16 90H14Z M484 10H486V90H484L482 83V17Z" fill="url(#lvl-shoulder)"/>
                <path d="M16 23L18 19V81L16 77Z M484 23L482 19V81L484 77Z" fill="url(#lvl-collar-rim)"/>
                <path d="M16.2 24V76 M483.8 24V76" stroke="#050708" stroke-width=".7"/>
                <path d="M17.2 25V75 M482.8 25V75" stroke="#dce2e3" stroke-opacity=".45" stroke-width=".5"/>
                <path d="M16.5 43H18 M16.5 59H18 M482 43H483.5 M482 59H483.5" stroke="#080a0c" stroke-opacity=".75" stroke-width="2"/>
                <rect x="18" y="17" width="7" height="66" rx="1.5" ry="5" fill="url(#lvl-tube-metal)"/><rect x="475" y="17" width="7" height="66" rx="1.5" ry="5" fill="url(#lvl-tube-metal)"/>
                <rect x="18" y="17" width="7" height="66" rx="1.5" ry="5" fill="url(#lvl-collar-depth)"/><rect x="475" y="17" width="7" height="66" rx="1.5" ry="5" fill="url(#lvl-collar-depth)"/>
                <path d="M19.4 22V78 M21.2 20V80 M478.8 20V80 M480.6 22V78" stroke="#080b0d" stroke-opacity=".5" stroke-width=".45"/>
                <rect x="23" y="20" width="2" height="60" rx=".6" ry="4" fill="url(#lvl-collar-rim)"/><rect x="475" y="20" width="2" height="60" rx=".6" ry="4" fill="url(#lvl-collar-rim)"/>
                <path d="M25.5 25V75 M474.5 25V75" stroke="#050708" stroke-opacity=".8" stroke-width=".8"/>
                <path d="M18.8 22V37 M481.2 22V37" stroke="#edf2f3" stroke-opacity=".5" stroke-width=".55"/>
                <path d="M25 21V79 M475 21V79" stroke="#101310" stroke-width="1"/><path d="M20 24V76 M477 24V76" stroke="#b7bcb5" stroke-opacity=".28" stroke-width=".8"/>`;

        return `<svg class="bbgl-level-svg" viewBox="0 0 500 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0;width:100%;height:100%;z-index:3;display:block;pointer-events:none">${defs}${housingDefs}${body}</svg>`.replaceAll('lvl-', gradientPrefix);
    }

    function buildLevelBarHTML(gym = false) {
        const prefix = gym ? 'bbgl-gym-level' : 'bbgl-level';
        return `<div id="${prefix}-container" class="bbgl-exp-bar"><div id="${prefix}-flag-clip" class="bbgl-exp-flag"><span id="${prefix}-num">Lv 1</span></div><div id="${prefix}-track" class="bbgl-exp-track"><div id="${prefix}-fill"></div>${buildLevelTrackSVG()}</div>${buildLevelValveSVG(prefix)}</div>`;
    }

    function buildLevelValveSVG(prefix) {
        const id = `${prefix}-valve-${++levelTrackSvgSerial}`;
        const bolts = [[20, 12], [80, 12], [20, 26], [80, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y + .35}" r="2.05" fill="#050809"/><circle cx="${x}" cy="${y}" r="1.85" fill="url(#${id}-bevel)"/><circle cx="${x}" cy="${y - .15}" r="1.3" fill="url(#${id}-bolt)"/><path d="M${x - .6} ${y + .45}l1.2-1.2" stroke="#080d0e" stroke-width=".65"/><path d="M${x - 1.1} ${y - .3}q.2-.8 1-.85" fill="none" stroke="#ecedda" stroke-opacity=".65" stroke-width=".35"/>`).join('');
        const sockets = ['', 'translate(100 0) scale(-1 1)'].map(transform => `<g transform="${transform}">
            <path d="M24 6L18 7.6H14V28.5C18 29.5 20 31 24 32L22 27V11Z" fill="url(#${id}-shoulder)"/>
            <path d="M23 7L18 8.5H14 M14.5 27.5C18 28.5 20 30 23 31" fill="none" stroke="url(#${id}-bevel)" stroke-width=".8"/>
            <ellipse cx="14" cy="19" rx="2.8" ry="9.9" fill="url(#${id}-bevel)"/>
            <ellipse cx="13.7" cy="19" rx="1.9" ry="8.6" fill="#030708"/>
            <path d="M10 12.8H13.5C15.2 12.8 15.2 25.2 13.5 25.2H10Z" fill="url(#${id}-fitting)"/>
            <path d="M12 13.3C13.5 14 13.5 24 12 24.7" fill="none" stroke="#060b0d" stroke-width=".65"/>
            <path d="M13.6 13.2C14.8 15 14.8 23 13.6 24.8" fill="none" stroke="#ced8d1" stroke-opacity=".55" stroke-width=".55"/>
            <path d="M11.2 11.5V10.2Q11.2 7.6 14 7.6H18L24 6L22.5 7.7L18 9.7H14.5V11.5Z" fill="url(#${id}-shoulder)"/>
            <path d="M11.8 10.5V10.2Q11.8 8.3 14 8.3H18L23 6.5" fill="none" stroke="#b8c3b9" stroke-opacity=".55" stroke-width=".55"/>
            <path d="M14.5 11.1V10H18" fill="none" stroke="#080e10" stroke-width=".6"/>
            <path d="M10 14H12.5" stroke="#edf1df" stroke-opacity=".65" stroke-width=".6"/>
        </g>`).join('');
        return `<svg class="bbgl-level-valve" viewBox="0 4 100 30" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="${id}-steel" x2="0" y2="1"><stop stop-color="#c0c0b6"/><stop offset=".08" stop-color="#707675"/><stop offset=".19" stop-color="#3f4749"/><stop offset=".44" stop-color="#252c2e"/><stop offset=".66" stop-color="#171d1f"/><stop offset=".86" stop-color="#505654"/><stop offset=".94" stop-color="#858983"/><stop offset="1" stop-color="#14191a"/></linearGradient>
                <linearGradient id="${id}-fitting" x2="0" y2="1"><stop stop-color="#12191d"/><stop offset=".22" stop-color="#8e999e"/><stop offset=".34" stop-color="#c5cdd0"/><stop offset=".48" stop-color="#626e74"/><stop offset=".73" stop-color="#263036"/><stop offset=".9" stop-color="#515d63"/><stop offset="1" stop-color="#11181c"/></linearGradient>
                <linearGradient id="${id}-shoulder" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#929991"/><stop offset=".17" stop-color="#5c6869"/><stop offset=".3" stop-color="#929b97"/><stop offset=".43" stop-color="#434f51"/><stop offset=".64" stop-color="#1e292c"/><stop offset=".85" stop-color="#101719"/><stop offset="1" stop-color="#58615b"/></linearGradient>
                <radialGradient id="${id}-bolt" cx=".3" cy=".2" r=".8"><stop stop-color="#e1e3d4"/><stop offset=".3" stop-color="#9ca7a3"/><stop offset=".6" stop-color="#4c595b"/><stop offset="1" stop-color="#141d20"/></radialGradient>
                <linearGradient id="${id}-glass" x2="0" y2="1"><stop stop-color="#02090e" stop-opacity=".7"/><stop offset=".18" stop-color="#d8f1fa" stop-opacity=".26"/><stop offset=".42" stop-color="#b6d9e8" stop-opacity=".07"/><stop offset=".7" stop-color="#07151f" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient>
                <linearGradient id="${id}-bevel" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#e0e0cd"/><stop offset=".2" stop-color="#7d898b"/><stop offset=".43" stop-color="#262f32"/><stop offset=".7" stop-color="#090e10"/><stop offset=".9" stop-color="#737f80"/><stop offset="1" stop-color="#b0b8ae"/></linearGradient>
                <radialGradient id="${id}-reflection" cx=".3" cy="0" r=".8"><stop stop-color="#f2efdc" stop-opacity=".4"/><stop offset=".4" stop-color="#c8dce1" stop-opacity=".12"/><stop offset="1" stop-color="#b8d3df" stop-opacity="0"/></radialGradient>
                <radialGradient id="${id}-edge" r=".65"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#020607" stop-opacity=".25"/><stop offset="1" stop-color="#020607" stop-opacity=".8"/></radialGradient>
                <linearGradient id="${id}-glint"><stop stop-color="#fbf5d8" stop-opacity="0"/><stop offset=".25" stop-color="#fbf5d8" stop-opacity=".75"/><stop offset=".6" stop-color="#d9edf2" stop-opacity=".2"/><stop offset="1" stop-color="#d9edf2" stop-opacity="0"/></linearGradient>
                <pattern id="${id}-grain" width="5" height="3" patternUnits="userSpaceOnUse"><path d="M0 .5H3M2 2H5" stroke="#d7ddcf" stroke-opacity=".1" stroke-width=".3"/><path d="M1 1H5" stroke="#000" stroke-opacity=".2" stroke-width=".35"/></pattern>
                <clipPath id="${id}-window"><rect x="24" y="8" width="52" height="22" rx="6"/></clipPath>
            </defs>
            <g fill="url(#${id}-fitting)" stroke="#10171b" stroke-width=".8">
                <path d="M0 12H15V26H0Z M85 12H100V26H85Z"/>
                <path d="M7 9H14L18 13V25L14 29H7L5 26V12Z M86 9H93L95 12V26L93 29H86L82 25V13Z"/>
            </g>
            <path d="M1 13V25M3 13V25M8 11V27M11 11V27M89 11V27M92 11V27M97 13V25M99 13V25" stroke="#0b1216" stroke-opacity=".7" stroke-width=".8"/>
            <path d="M6 14H15M85 14H94" stroke="#d6e0e4" stroke-opacity=".5" stroke-width=".7"/>
            <path d="M24 5H76L87 12V26L76 33H24L13 26V12Z M30 8H70Q76 8 76 14V24Q76 30 70 30H30Q24 30 24 24V14Q24 8 30 8Z" fill="url(#${id}-steel)" fill-rule="evenodd" stroke="#090e11" stroke-width="1"/>
            <path d="M24 5H76L87 12V26L76 33H24L13 26V12Z M30 8H70Q76 8 76 14V24Q76 30 70 30H30Q24 30 24 24V14Q24 8 30 8Z" fill="url(#${id}-grain)" fill-rule="evenodd" stroke="none"/>
            <path d="M15 12L24 6H76L85 12 M17 27L24 32H76L83 27" fill="none" stroke="#b7c4cb" stroke-opacity=".4" stroke-width=".7"/>
            ${sockets}
            <rect x="22.6" y="6.6" width="54.8" height="24.8" rx="7.4" fill="none" stroke="url(#${id}-bevel)" stroke-width="1.8"/>
            <rect x="23.7" y="7.7" width="52.6" height="22.6" rx="6.3" fill="none" stroke="#030708" stroke-width="1.3"/>
            <rect x="24" y="8" width="52" height="22" rx="6" fill="url(#${id}-glass)" stroke="#8a9ba4" stroke-opacity=".65" stroke-width=".7"/>
            <text class="bbgl-valve-digit" x="50" y="24.5" text-anchor="middle" font-family="Orbitron, &apos;Roboto Mono&apos;, Arial, sans-serif" font-size="17" font-weight="500" fill="#edf4f7" stroke="#071015" stroke-width="1.3" paint-order="stroke">1</text>
            <g clip-path="url(#${id}-window)" pointer-events="none">
                <rect x="24" y="8" width="52" height="22" fill="url(#${id}-edge)"/>
                <path d="M24 8H76V13C58 10 43 17 24 14Z" fill="url(#${id}-reflection)"/>
                <path d="M29 9H36L47 30H42Z" fill="#e4eef0" opacity=".045"/>
                <path d="M25 17V14Q25 9 31 9H69" fill="none" stroke="url(#${id}-glint)" stroke-width="1.15"/>
                <path d="M31 28.8H69Q74.8 28.8 74.8 23" fill="none" stroke="url(#${id}-glint)" stroke-width=".8" opacity=".65"/>
                <path d="M26 22V15Q26 10.5 31 10.5H69" fill="none" stroke="#03080a" stroke-opacity=".5" stroke-width="1"/>
            </g>
            <path d="M25 5.8H75M27 32H73" stroke="url(#${id}-glint)" stroke-width=".65"/>
            ${bolts}
            <path d="M34 5V4H66V5" fill="#313b41" stroke="#9aa7ae" stroke-width=".7"/>
        </svg>`;
    }

    function getDashboardHTML() {
        const weekDays = userConfig.weekStartMode === 'mon' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekRowHTML = weekDays.map(d => `<span>${d}</span>`).join('');
        return `<div class="bbgl-header" id="bbgl-header-bar"><div class="bbgl-header-left">${ICONS.LOGO}<span class="bbgl-header-text"><span class="bbgl-short-title">Big Black Log</span><span class="bbgl-long-title">Big Black Gym Log</span></span></div><div class="bbgl-header-right"><span id="bbgl-demo-exit-btn" class="close-settings-btn bbgl-close-purple" style="display:${runtime.demoMode ? 'flex' : 'none'};" data-tooltip-html="${TOOLTIPS.DEMO_EXIT_HTML}"><span class="bbgl-demo-x-label">Demo</span>${ICONS.CLOSE}</span><span id="bbgl-settings-btn" class="bbgl-custom-icon">⚙</span><span id="bbgl-close-btn" class="bbgl-native-icon">${ICONS.MINIMIZE}</span><span id="bbgl-pop-btn" class="bbgl-native-icon">${viewState.expanded ? ICONS.COMPRESS : ICONS.POPOUT}</span></div></div><div id="bbgl-content-wrapper"><div id="bbgl-top-panel"><div id="bbgl-toolbar"><div id="bbgl-toolbar-icons"><div id="bbgl-ledger-toggle" data-tooltip="${TOOLTIPS.LEDGER_VIEW}">${ICONS.LEDGER}</div><div id="bbgl-graph-toggle" data-tooltip="${TOOLTIPS.GRAPH_VIEW}">${ICONS.GRAPH}</div><div id="bbgl-achievements-toggle" data-tooltip="${TOOLTIPS.ACHIEVEMENTS}">${ICONS.ACHIEVEMENTS}</div><div id="bbgl-library-toggle" data-tooltip="${TOOLTIPS.LIBRARY}">${ICONS.LIBRARY}</div><div id="bbgl-sticker-toggle" data-tooltip="${TOOLTIPS.STICKERBOOK}">${ICONS.STICKERBOOK}</div><div class="g-hud-sep"></div><div class="g-toggles g-mode"><div class="g-pill active" data-type="mode" data-val="values">Gains</div><div class="g-pill" data-type="mode" data-val="rates">Rates</div></div></div><div id="bbgl-item-counters"></div><div id="bbgl-copy-btn" class="copy-hist-btn" data-tooltip="${TOOLTIPS.COPY_SESSION}">${ICONS.CLIPBOARD}</div><div class="g-toggles g-stat"><div class="g-pill p-str active" data-type="stat" data-val="str">STR</div><div class="g-pill p-def" data-type="stat" data-val="def">DEF</div><div class="g-pill p-spd active" data-type="stat" data-val="spd">SPD</div><div class="g-pill p-dex" data-type="stat" data-val="dex">DEX</div><div class="g-pill p-tot" data-type="stat" data-val="total">TOT</div></div></div><div id="bbgl-sticker-title"></div><div class="ui-floating-label" id="bbgl-date-label">LOADING...</div><div class="ui-floating-summary" id="bbgl-summary-label"></div><div id="bbgl-ledger-view" class="ledger-content"></div><div id="bbgl-graph-container"><svg id="bbgl-graph-svg"></svg></div><div id="bbgl-achievements-container" class="ledger-content"></div><div id="bbgl-library-container"></div><div id="bbgl-lib-pagination-bar"><button type="button" id="lib-mini-prev-btn" class="bbgl-ach-nav bbgl-ach-prev" aria-label="Previous library page">${ICONS.CHEVRON}</button><div id="bbgl-lib-pagination"></div><button type="button" id="lib-mini-next-btn" class="bbgl-ach-nav bbgl-ach-next" aria-label="Next library page">${ICONS.CHEVRON}</button></div><div id="bbgl-ach-footer"><button type="button" class="bbgl-ach-nav bbgl-ach-prev" aria-label="Previous achievements page">${ICONS.CHEVRON}</button><div id="bbgl-ach-pageindicator"></div><button type="button" class="bbgl-ach-nav bbgl-ach-next" aria-label="Next achievements page">${ICONS.CHEVRON}</button></div><div id="bbgl-sticker-bg"></div><div id="bbgl-sticker-container"><div id="sticker-prev-btn" class="sticker-nav-btn">❮</div><div id="sticker-next-btn" class="sticker-nav-btn">❯</div><div id="bbgl-sticker-grid"></div></div><div id="bbgl-sticker-pagination-bar"><button type="button" id="sticker-mini-prev-btn" class="bbgl-ach-nav bbgl-ach-prev" aria-label="Previous sticker page">${ICONS.CHEVRON}</button><div id="bbgl-sticker-pagination"></div><button type="button" id="sticker-mini-next-btn" class="bbgl-ach-nav bbgl-ach-next" aria-label="Next sticker page">${ICONS.CHEVRON}</button></div><div class="glass-overlay"></div></div><div id="bbgl-bottom-panel"><div id="bbgl-demo-exit" style="display: ${runtime.demoMode ? 'flex' : 'none'};" data-tooltip="${TOOLTIPS.DEMO_EXIT}" data-tooltip-html="${TOOLTIPS.DEMO_EXIT_HTML}">DEMO MODE</div><div class="bbgl-header-wrapper"><div id="bbgl-header-bg" class="bbgl-header-bg"></div><div class="bbgl-month-header"><div class="title-group"><div class="title-stack"><div class="header-row header-row--alltime"><div class="stats-btn" id="all-time-btn">${ICONS.CHART}</div><div class="header-trigger" id="all-time-trigger">∞</div></div><div class="header-row header-row--year"><div class="stats-btn" id="year-stats-btn">${ICONS.CHART}</div><div class="header-trigger" id="year-trigger"></div><div id="bbgl-year-dropdown" class="bbgl-dropdown-menu"></div></div><div class="header-row header-row--month"><div class="stats-btn" id="month-stats-btn">${ICONS.CHART}</div><div class="header-trigger" id="month-trigger"></div><div id="bbgl-month-dropdown" class="bbgl-dropdown-menu"></div></div></div></div><button class="arrow-btn" id="prev-month-btn">❮</button><button class="arrow-btn" id="next-month-btn">❯</button></div><div class="bbgl-level-lens" aria-hidden="true"></div>${buildLevelBarHTML()}</div><div class="bbgl-grid-container"><div class="bbgl-week-row">${weekRowHTML}</div><div class="calendar-wrapper" id="swipe-area"><div id="bbgl-cal-container" class="bbgl-cal-container"></div></div></div></div><div id="bbgl-item-viewer"><div class="viewer-window"><div class="viewer-stage"><div class="viewer-pedestal" id="vi-pedestal-wrapper"><div class="viewer-obj" id="vi-obj-target"><div class="layer-front"></div><div class="layer-back"><div class="lb-brand"><span class="lb-brand-sm">Fully</span><span class="lb-brand-lg">Bricked</span><span class="lb-brand-sm">Fitness<sup class="lb-brand-tm">™</sup></span><span class="lb-brand-tag">Authentic</span></div></div></div></div></div></div><div class="viewer-info-overlay"><div class="vi-name" id="vi-name-target">Item Name</div></div></div><div id="bbgl-settings-view">${getSettingsHTML()}</div><div id="bbgl-welcome-view"></div></div>`;
    }

    /**
     *  [SECTION VII] THE MIRRORS (Graph & Ledger Engine)
     *  ========================================================================
     *  When you're done showing everyone your new tank top,
     *  take the time to reflect.
     */
