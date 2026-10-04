    /**
     *  [SECTION III] THE PHYSIQUE (Assets & Styles)
     *  ========================================================================
     *  The Big & Black Part of the script.
     */
    // ─── Progressive title plaque ───────────────────────────────────────────
    // The identity card's 11 looks, step 0-10 (titlePlaqueStage(), 03-section-ii-utils.js). Split out of
    // 04-section-iii-styles.js, which it loads just ahead of; both ship verbatim. Everything here is
    // scoped to .bbgl-title-card.is-progressive, so the original card rules stay as they were and come
    // back as-is with TITLE_PLAQUE_PROGRESSIVE off.
    //
    // PLAQUE_STEPS is the whole ladder: each step lists only what changes from the one before. Cloth goes
    // canvas → felt → velvet and the board plank → oak → walnut; everything else upgrades through details.
    // The static rules (boards, lettering) go into the stylesheet as TITLE_PLAQUE_CSS. Each step's cloth
    // art is a generated, SVG-filter-lit image built the first time a card at that step renders
    // (ensurePlaqueArt), since only one or two steps are ever on screen. The art sits on its own
    // compositor layer (will-change on the ::before) so the card's other animations don't re-run its
    // filters; the text stays out of that layer, which would cost it subpixel antialiasing.
    //
    // Cloth options: fabric, fray (raw bottom edge), hem (stitch colour), nails / tacks (heads along the
    // top rail), tassels + fringe (colour pairs), goldEdge, cord (gold rope along the top), laurel,
    // filigree, sheen, embroidery (gold scroll border), bullion (twisted gold fringe), fullTassels (step
    // 10's gold pair). Board: board (a PLAQUE_WOODS key), boardNails ('iron' / 'brass'), caps (brass
    // corner caps and side rosettes); walnut boards get the gilt inlay. letters: a PLAQUE_LETTERS key,
    // plus letterStroke.
    const PLAQUE_STEPS = (() => {
        const GOLD_PAIR = ['#e2b755', '#c89a3c'];
        const steps = [
            { fabric: 'canvas', fray: true, nails: true, board: 'plank', boardNails: 'iron', letters: 'ink' },
            { fray: false, hem: '#7d6c4c' },
            { hem: '#6f5a3a' },
            { nails: false, tacks: true, board: 'oak', boardNails: 'brass' },
            {},
            { fabric: 'felt', hem: '#806578', tacks: false, letters: 'cream' },
            {},
            { fabric: 'velvet', hem: '#e9dcc0', tassels: ['#e9dcc0', '#d8c7a2'], fringe: ['#e2d3b1', '#6a2d62'], board: 'walnut', boardNails: false },
            { hem: '#d8b45a', goldEdge: true, cord: true, laurel: true, tassels: GOLD_PAIR, fringe: ['#e2b755', '#a97d2c'], board: 'walnutPolished', caps: true, letters: 'gold' },
            { filigree: true, sheen: true, board: 'walnutLacquer', letterStroke: true },
            { hem: false, tassels: false, fringe: false, embroidery: true, bullion: true, fullTassels: true }
        ];
        let prev = {};
        return steps.map(d => (prev = { ...prev, ...d }));
    })();
    // The valance canvas runs on below the sign to y = 190 for the tassels, so the ::before hangs that far
    // past the sign's 96-unit box and nothing rescales.
    const PLAQUE_VB_H = 186;
    const PLAQUE_VALANCE_INSET = `0 0 -${+((PLAQUE_VB_H / 96 - 1) * 100).toFixed(2)}% 0`;
    // One selector per step, joined: `suffix` targets a part of the card ('' for the card itself).
    const plaqueEach = (stages, suffix) => stages.map(s => `.bbgl-title-card.is-progressive[data-sign-stage="${s}"]${suffix}`).join(',\n');
    // One rule per distinct body, so steps that look the same share it. `body(step)` returns the
    // declarations, or '' for none.
    const plaqueRules = (suffix, body) => {
        const groups = new Map();
        PLAQUE_STEPS.forEach((step, s) => {
            const b = body(step);
            if (!b) return;
            if (!groups.has(b)) groups.set(b, []);
            groups.get(b).push(s);
        });
        let css = '';
        groups.forEach((stages, b) => { css += `\n${plaqueEach(stages, suffix)} {\n${b}\n}\n`; });
        return css;
    };

    // Boards, as background layers. Nail heads, corner caps and rosettes sit in the strips of board left
    // showing beside and under the rank plate (the valance covers the top).
    const PLAQUE_BRASS = ['#f6dc8a', '#c9993f', '#6a4714'];
    const PLAQUE_WOODS = {
        plank: { border: '#5a3a1c', bevel: '', grain: `repeating-linear-gradient(88deg, transparent 0 17px, rgba(60, 35, 15, .22) 18px, transparent 20px 37px),
            repeating-linear-gradient(90deg, transparent 0 4px, rgba(90, 55, 25, .2) 5px, transparent 6px 11px),
            repeating-linear-gradient(90deg, rgba(255, 235, 200, .07) 0 1px, transparent 1px 3px),
            radial-gradient(ellipse 7% 3.5% at 9% 82%, #4b2e14 0 35%, #8a6034 60%, transparent 76%),
            radial-gradient(ellipse 6% 3% at 92% 44%, #4b2e14 0 35%, #8a6034 60%, transparent 76%),
            linear-gradient(100deg, #b4854f, #cd9d66 40%, #bf8f5c 70%, #a47444)` },
        oak: { border: '#2e1a0b', bevel: 'inset 2px 2px 0 rgba(255, 215, 170, .2), inset -2px -2px 0 rgba(0, 0, 0, .42), ', grain: `repeating-linear-gradient(90deg, transparent 0 3px, rgba(40, 20, 8, .26) 3px 4px, transparent 4px 9px),
            repeating-linear-gradient(90deg, rgba(255, 210, 160, .08) 0 2px, transparent 2px 13px),
            linear-gradient(170deg, rgba(255, 235, 210, .14), transparent 35%),
            linear-gradient(100deg, #6c4323, #8a5a33 40%, #7b4e2b 70%, #5e391e)` },
        walnut: { border: '#140b07', bevel: 'inset 2px 2px 0 rgba(186, 138, 100, .18), inset -2px -2px 0 rgba(0, 0, 0, .5), ', grain: `repeating-linear-gradient(92deg, transparent 0 5px, rgba(8, 4, 2, .28) 6px, transparent 7px 13px),
            repeating-linear-gradient(88deg, rgba(176, 128, 92, .04) 0 1px, transparent 1px 3px),
            radial-gradient(ellipse 28% 120% at 24% 35%, #3a241800 45%, #140a0666 70%, transparent 78%),
            linear-gradient(100deg, #24160f, #3d281d 38%, #2f1e15 72%, #20140d)` },
        walnutPolished: { border: '#140b07', bevel: 'inset 2px 2px 0 rgba(200, 150, 110, .22), inset -2px -2px 0 rgba(0, 0, 0, .55), ', grain: `linear-gradient(165deg, rgba(255, 225, 190, .16), transparent 30%, transparent 70%, rgba(255, 225, 190, .06)),
            repeating-linear-gradient(92deg, transparent 0 5px, rgba(8, 4, 2, .3) 6px, transparent 7px 13px),
            repeating-linear-gradient(88deg, rgba(196, 140, 100, .06) 0 1px, transparent 1px 3px),
            radial-gradient(ellipse 28% 120% at 24% 35%, #4a2e1e00 45%, #140a0666 70%, transparent 78%),
            linear-gradient(100deg, #28180f, #452d20 38%, #34211a 72%, #22150e)` },
        walnutLacquer: { border: '#120904', bevel: 'inset 2px 2px 0 rgba(215, 160, 115, .26), inset -2px -2px 0 rgba(0, 0, 0, .6), ', grain: `linear-gradient(165deg, rgba(255, 230, 200, .24), rgba(255, 230, 200, .04) 26%, transparent 34%, transparent 66%, rgba(255, 230, 200, .1) 88%, transparent),
            repeating-linear-gradient(92deg, transparent 0 5px, rgba(6, 2, 0, .34) 6px, transparent 7px 13px),
            repeating-linear-gradient(88deg, rgba(210, 150, 105, .07) 0 1px, transparent 1px 3px),
            radial-gradient(ellipse 28% 120% at 24% 35%, #52321f00 45%, #120804aa 70%, transparent 78%),
            linear-gradient(100deg, #24130a, #4a2e1f 38%, #36211a 72%, #1d100a)` }
    };
    const PLAQUE_NAIL_HEADS = { iron: ['#6b6b6b', '#1e1e1e'], brass: ['#d8b35a', '#5a3d12'] };
    const plaqueBoard = step => {
        const wood = PLAQUE_WOODS[step.board], layers = [];
        if (step.boardNails) {
            const [fill, rim] = PLAQUE_NAIL_HEADS[step.boardNails];
            ['left 0 bottom 0', 'right 0 bottom 0', 'left 0 top 58%', 'right 0 top 58%'].forEach(pos =>
                layers.push(`radial-gradient(circle, #fff9 0 .6px, ${fill} 1px 1.7px, ${rim} 2.2px, transparent 2.6px) ${pos} / 6px 6px no-repeat`));
        }
        if (step.caps) {
            ['left 0 bottom 0', 'right 0 bottom 0'].forEach((pos, i) =>
                layers.push(`radial-gradient(circle at ${i ? '100%' : '0'} 100%, ${PLAQUE_BRASS[0]} 0 3px, ${PLAQUE_BRASS[1]} 6px, ${PLAQUE_BRASS[2]} 8.5px, #2a1a06 9.2px, transparent 9.8px) ${pos} / 12px 12px no-repeat`));
            ['left 0 top 58%', 'right 0 top 58%'].forEach(pos =>
                layers.push(`radial-gradient(circle, #fff6 0 .6px, ${PLAQUE_BRASS[0]} 1px, ${PLAQUE_BRASS[1]} 1.9px, ${PLAQUE_BRASS[2]} 2.5px, transparent 2.9px) ${pos} / 6px 6px no-repeat`));
        }
        layers.push(wood.grain);
        return `border-color: ${wood.border};\nbackground: ${layers.join(',\n')};\nbox-shadow: ${wood.bevel}inset 1px 1px 0 rgba(255, 230, 200, .18), inset -1px -1px 0 rgba(0, 0, 0, .55), 0 3px 5px #000b;`;
    };

    // Lettering, part of the cloth rather than lifted off it: no drop shadows, just a soft halo of the
    // letters' own colour bleeding into the fibres. Ink multiplies into the canvas; cream thread and gold
    // leaf go on through hard-light, so the cloth's tone carries into them. The face's fold lighting is a
    // layer above the text (::after), so folds run across the letters too. "The" (label) follows along.
    const PLAQUE_LETTERS = {
        ink: {
            words: 'color: rgba(40, 25, 12, .88);\n-webkit-text-fill-color: currentColor;\nmix-blend-mode: multiply;\ntext-shadow: 0 0 1px rgba(40, 25, 12, .35);',
            label: 'color: rgba(52, 32, 14, .85);\nmix-blend-mode: multiply;\ntext-shadow: 0 0 1px rgba(52, 32, 14, .3);'
        },
        cream: {
            words: 'color: #e6decc;\n-webkit-text-fill-color: currentColor;\nmix-blend-mode: hard-light;\ntext-shadow: 0 0 1px rgba(230, 222, 204, .4);',
            label: 'color: #e3d8c0;\nmix-blend-mode: hard-light;\ntext-shadow: 0 0 1px rgba(227, 216, 192, .35);'
        },
        gold: {
            words: 'background: linear-gradient(180deg, #fff4c4 0%, #f0c95e 45%, #b8862f 62%, #f3d27a 100%);\n-webkit-background-clip: text;\nbackground-clip: text;\ncolor: transparent;\n-webkit-text-fill-color: transparent;\nmix-blend-mode: hard-light;\ntext-shadow: none;\nfilter: drop-shadow(0 0 .4px rgba(240, 201, 94, .3));',
            label: 'color: #f6dc98;\nmix-blend-mode: hard-light;\ntext-shadow: 0 0 1px rgba(246, 220, 152, .3);'
        }
    };
    const TITLE_PLAQUE_CSS = `
.bbgl-title-card.is-progressive .bbgl-title-card-sign-face::before {
    inset: ${PLAQUE_VALANCE_INSET};
    will-change: transform;
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
}

.bbgl-title-card.is-progressive .bbgl-title-card-sign-face::after {
    content: '';
    position: absolute;
    inset: ${PLAQUE_VALANCE_INSET};
    pointer-events: none;
    background: var(--bbgl-plaque-light) center / 100% 100% no-repeat;
    mix-blend-mode: hard-light;
    opacity: .8;
}
` + plaqueRules('', plaqueBoard) +
        plaqueRules(' .bbgl-title-card-sign-face .bbgl-title-word', step => PLAQUE_LETTERS[step.letters].words + (step.letterStroke ? '\n-webkit-text-stroke: .02em rgba(110, 72, 18, .55);' : '')) +
        plaqueRules(' .bbgl-title-card-title-label', step => PLAQUE_LETTERS[step.letters].label) +
        plaqueRules(' .bbgl-title-card-sign-face .bbgl-title-card-empty', step => PLAQUE_LETTERS[step.letters].label) +
        // Gilt inlay line set in from the board's edge, walnut boards only. The original card leaves
        // ::after off, so this is the only thing it draws there.
        plaqueRules('::after', step => step.board.startsWith('walnut') ? "content: '';\ninset: 3px;\nborder: 1px solid rgba(214, 173, 86, .55);\nborder-radius: 2px;\nbackground: none;\nbox-shadow: 0 0 0 1px rgba(0, 0, 0, .25);\n-webkit-mask-image: none;\nmask-image: none;" : '');

    // The cloth art for one step: the valance image on the sign's ::before, and the face's fold lighting
    // for the layer over the lettering.
    const plaqueArtCSS = (() => {
        // weave: thread period, thread colours (dark, light, mid), gap colour. fold: the height map's blur,
        // light strength, noise wrinkle and its frequency. knotBase / knot: the rolls show the cloth's
        // other side in their own colour (felt) or their own cloth (velvet, lined with black felt).
        const FABRICS = {
            canvas: {
                base: '#d6cbb0', weave: { p: 2.6, thread: ['#b6a888', '#efe6cf', '#d6cab0'], gap: '#9a8c6d' },
                jitter: .6, slubs: .22, tone: .1, stains: .22, fold: { blur: 3, scale: 3.2, wrinkle: .3, wf: '.04 .03' }, frayColor: '#e4d9bf'
            },
            felt: {
                base: '#2c2d2b', knotBase: '#5e3d69', fibers: .06, fiberFreq: '.8',
                tone: .08, fold: { blur: 3.6, scale: 2.6, wrinkle: .05, wf: '.05 .05' }
            },
            velvet: {
                base: '#461441', sheen: .35, knot: { base: '#262527', sheen: 0, fibers: .06, fiberFreq: '.8' },
                tone: .2, fold: { blur: 3, scale: 5, wrinkle: .12, wf: '.03 .03' }
            }
        };
        const GOLD = ['#fff0b3', '#e2b755', '#9c6f22'];
        const TASSEL_AT = [19.5, 100.4], TASSEL_HEAD = TASSEL_AT[1] + 54;
        const f1 = n => +n.toFixed(2);
        const rng = seed => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
        const stops = (cs, offs) => cs.map((c, i) => `<stop offset="${offs[i]}" stop-color="${c}"/>`).join('');
        const fullRect = attrs => `<rect width="240" height="106" ${attrs}/>`;
        // Minimal escaping rather than encodeURIComponent (which roughly triples an SVG): single quotes
        // inside so the URL can be double-quoted, and only the characters a data URI can't carry raw.
        const svgUrl = body => `url("data:image/svg+xml,${`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 4 240 ${PLAQUE_VB_H}" preserveAspectRatio="none">${body}</svg>`.replace(/"/g, "'").replace(/%/g, '%25').replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
        // Mirrors a path across the valance's centre line.
        const mx = d => d.replace(/([MLCQHVZ])([^MLCQHVZ]*)/g, (m, c, args) => {
            const n = args.trim().split(/\s+/).filter(Boolean).map(Number);
            if (c === 'Z' || c === 'V') return c + args;
            if (c === 'H') return 'H' + n.map(x => f1(240 - x)).join(' ');
            return c + n.map((v, i) => i % 2 === 0 ? f1(240 - v) : v).join(' ');
        });
        // Points every `step` units of length along a chain of quadratics [x0, y0, cx, cy, x1, y1, ...],
        // each with the tangent's angle.
        const sampleQuads = (q, step) => {
            const poly = [[q[0], q[1]]];
            for (let i = 2; i < q.length; i += 4) {
                const [x0, y0] = poly[poly.length - 1];
                for (let k = 1; k <= 200; k++) {
                    const t = k / 200, u = 1 - t;
                    poly.push([u * u * x0 + 2 * u * t * q[i] + t * t * q[i + 2], u * u * y0 + 2 * u * t * q[i + 1] + t * t * q[i + 3]]);
                }
            }
            const len = [0];
            for (let i = 1; i < poly.length; i++) len.push(len[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
            const at = s => {
                let i = 1;
                while (i < poly.length - 1 && len[i] < s) i++;
                const t = (s - len[i - 1]) / ((len[i] - len[i - 1]) || 1);
                return [poly[i - 1][0] + (poly[i][0] - poly[i - 1][0]) * t, poly[i - 1][1] + (poly[i][1] - poly[i - 1][1]) * t];
            };
            const L = len[len.length - 1], pts = [];
            for (let s = 0; s <= L; s += step) {
                const [x, y] = at(s), [x2, y2] = at(Math.min(L, s + .5));
                pts.push([x, y, Math.atan2(y2 - y, x2 - x)]);
            }
            return pts;
        };
        // Ridges [path, width, opacity, fade] as strokes into a height map; fade ('end', 'start', 'ends')
        // runs a gradient along the stroke so the fold dies away.
        const ridges = (list, idBase) => {
            let defs = '', paths = '';
            list.forEach(([d, w, o = 1, fade], i) => {
                let stroke = '#000', op = o;
                if (fade) {
                    const n = d.match(/-?\d*\.?\d+/g).map(Number), id = `${idBase}${i}`;
                    const st = fade === 'end' ? [[0, o], [1, 0]] : fade === 'start' ? [[0, 0], [1, o]] : [[0, o], [.5, o * .2], [1, o]];
                    defs += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${n[0]}" y1="${n[1]}" x2="${n[n.length - 2]}" y2="${n[n.length - 1]}">${st.map(([off, a]) => `<stop offset="${off}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
                    stroke = `url(#${id})`; op = 1;
                }
                paths += `<path d="${d}" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
            });
            return { defs, paths };
        };
        const flipRidges = list => list.map(([d, w, o, f]) => [mx(d), w, o, f]);
        const filterBox = 'x="0" y="0" width="240" height="106" filterUnits="userSpaceOnUse"';
        const noise = (id, freq, octaves, seed, rgb, k, c) => `<filter id="${id}" ${filterBox}><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}"/><feColorMatrix values="0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  ${f1(k)} 0 0 0 ${f1(c)}"/></filter>`;
        // Folds: ridge strokes plus a little noise become a height map, lit from the top left. Diffuse
        // light at 30° elevation lands flat cloth on exactly mid-grey, so hard-light only moves the slopes.
        const foldsFilter = fo => `<filter id="folds" ${filterBox} color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${fo.blur}" result="r"/>` +
            `<feTurbulence type="fractalNoise" baseFrequency="${fo.wf}" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${fo.wrinkle} 0 0 0 0" result="na"/>` +
            `<feComposite in="r" in2="na" operator="arithmetic" k2="1" k3="1" result="h"/><feDiffuseLighting in="h" surfaceScale="${fo.scale}" diffuseConstant="1" lighting-color="#fff"><feDistantLight azimuth="235" elevation="30"/></feDiffuseLighting></filter>`;
        // Tone: blotchy darker patches. Slubs: thick and thin runs along the threads. Fibres: fine lint.
        // Stains: soft yellowed blooms.
        const materialDefs = m => {
            let d = `<linearGradient id="gold" x1="0" y1="0" x2=".2" y2="1">${stops(GOLD, [0, .5, 1])}</linearGradient>` +
                '<filter id="soft" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation=".8"/></filter>' +
                '<filter id="softWide" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>';
            if (m.weave) {
                const { p, thread: [dk, lt, md], gap } = m.weave;
                const t = p * .8, o = (p - t) / 2, r = t * .45, thread = `<stop stop-color="${dk}"/><stop offset=".45" stop-color="${lt}"/><stop offset=".75" stop-color="${md}"/><stop offset="1" stop-color="${dk}"/>`;
                d += `<linearGradient id="tv">${thread}</linearGradient><linearGradient id="th" x2="0" y2="1">${thread}</linearGradient>` +
                    `<pattern id="weave" width="${f1(2 * p)}" height="${f1(2 * p)}" patternUnits="userSpaceOnUse"><rect width="${f1(2 * p)}" height="${f1(2 * p)}" fill="${gap}"/>` +
                    // Weft rows running under, then warp segments passing over them in a checkerboard.
                    `<rect y="${f1(o)}" width="${f1(2 * p)}" height="${f1(t)}" fill="url(#th)"/><rect y="${f1(p + o)}" width="${f1(2 * p)}" height="${f1(t)}" fill="url(#th)"/>` +
                    `<rect x="${f1(o)}" y="${f1(-o)}" width="${f1(t)}" height="${f1(p + 2 * o - .2)}" rx="${f1(r)}" fill="url(#tv)"/><rect x="${f1(p + o)}" y="${f1(p - o)}" width="${f1(t)}" height="${f1(p + 2 * o - .2)}" rx="${f1(r)}" fill="url(#tv)"/></pattern>` +
                    `<filter id="jit" ${filterBox}><feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${m.jitter}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
            }
            d += noise('tone', '.025 .035', 3, 11, [0, 0, 0], m.tone * 3, -m.tone * 1.3);
            if (m.slubs) d += `<filter id="slubs" ${filterBox}><feTurbulence type="fractalNoise" baseFrequency=".015 .7" numOctaves="2" seed="5" result="h"/><feTurbulence type="fractalNoise" baseFrequency=".7 .015" numOctaves="2" seed="8" result="v"/><feComposite in="h" in2="v" operator="arithmetic" k2=".5" k3=".5"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${f1(m.slubs * 4)} 0 0 0 ${f1(-m.slubs * 1.9)}"/></filter>`;
            const fib = m.fibers ? m : m.knot && m.knot.fibers ? m.knot : null;
            if (fib) d += noise('fibers', fib.fiberFreq, 1, 2, [1, 1, 1], fib.fibers * 5, -fib.fibers * 2.4);
            if (m.stains) d += noise('stains', '.012 .016', 2, 21, [.55, .42, .18], m.stains * 6, -m.stains * 3.6);
            d += foldsFilter(m.fold);
            if (m.sheen) d += `<filter id="sheen" ${filterBox} color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="r"/><feSpecularLighting in="r" surfaceScale="9" specularConstant=".9" specularExponent="14" lighting-color="#f2b8ea"><feDistantLight azimuth="235" elevation="38"/></feSpecularLighting></filter>`;
            return d;
        };
        // The material lit by `heights`, clipped to d. A hollow piece skips the raised base, so its heights
        // (a rim) read as a trough rather than a mound. Unlit, its folds are left to the layer above.
        const cloth = (d, heights, m, id, { outline = 0, shade = 0, hollow = false, lit = true } = {}) => {
            let g = fullRect(`fill="${m.base}"`);
            if (m.weave) g += fullRect('fill="url(#weave)" filter="url(#jit)"');
            if (m.slubs) g += fullRect('filter="url(#slubs)" opacity=".8"');
            if (m.fibers) g += fullRect('filter="url(#fibers)"');
            if (m.stains) g += fullRect('filter="url(#stains)" style="mix-blend-mode:multiply"');
            g += fullRect('filter="url(#tone)"');
            const h = (hollow ? '' : `<path d="${d}" fill="#000" fill-opacity=".3"/>`) + heights;
            if (lit) g += `<g filter="url(#folds)" style="mix-blend-mode:hard-light" opacity=".8">${h}</g>`;
            if (m.sheen) g += `<g filter="url(#sheen)" style="mix-blend-mode:screen" opacity="${m.sheen}">${h}</g>`;
            if (shade) g += fullRect(`fill="#000" fill-opacity="${shade}"`);
            return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${g}<path d="${d}" fill="none" stroke="#000" stroke-opacity="${outline}" stroke-width="2" filter="url(#soft)"/></g>`;
        };
        const clipped = (clip, s) => `<g clip-path="url(#${clip})">${s}</g>`;
        const softLine = (d, color, op, w, filter = 'soft', attrs = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}" filter="url(#${filter})"${attrs}/>`;

        // Geometry, left side only; the right is mx() of it.
        const FACE = 'M17 5H223L210 78Q166 96 120 98Q74 96 30 78Z';
        // The lid: where the side drape's edge meets the roll, hugging the loop's top.
        const LID = 'M6 89.5C14.5 82.5 29 80.5 40 87';
        const LID_HEM = 'M7.5 85C15.5 78.5 28.5 76.5 38 82';
        const SIDE = 'M17 5C17 31 30 58 40 87C29 80.5 14.5 82.5 6 89.5C10 66 14 36 17 5Z';
        const SIDE_OUTER = 'M6 89.5C10 66 14 36 17 5';
        // The roll hangs to about the centre panel's lowest point; its tip is the cloth's corner, which the
        // tassels hang from. FRONT is the drape coming round in front of it, from the lid down to FOLD_EDGE,
        // the cloth's edge folding in round the board's edge (BOARD_X); the rest of the roll, inside the
        // fold, is behind the board.
        const BOARD_X = 15.5;
        const KNOT = `${LID}C44.5 91 35 97 19.5 100.5C13 97.5 7.4 94 6 89.5Z`;
        const FRONT = 'M15.5 84.5C23.3 82.1 32.5 82.5 40 87C44.5 91 35 97 19.5 100.5C16.6 99.6 15.5 97 15.5 93Z';
        const FOLD_EDGE = 'M19.5 100.5C16.6 99.6 15.5 97 15.5 93V84.5';
        // Both parts of the roll are the inside of the loop, tucked behind the drape: high along their outer
        // rims, falling away up under the drape. The lip at the fold edge keeps it reading as a turn.
        const KNOT_RIM = 'M15.5 84.5C11.9 85.6 8.7 87.3 6 89.5C7.4 94 13 97.5 19.5 100.5';
        const FRONT_RIM = 'M40 87C44.5 91 35 97 19.5 100.5';
        const HEM = 'M30 77Q74 92 120 94Q166 92 210 77';
        const HEM_EDGE_Q = [30, 78, 74, 96, 120, 98, 166, 96, 210, 78];
        const HEM_EDGE = 'M30 78Q74 96 120 98Q166 96 210 78';
        const FACE_RIDGES = [['M18 7H222', 2.4, .7], ['M34 74Q120 108 206 74', 3, .55, 'ends'], ['M36 66Q120 94 204 66', 2.4, .35, 'ends']];
        [['M36 75Q29 40 22 8', 3, .9, 'end'], ['M40 77Q40 44 44 9', 2.6, .6, 'end'], ['M43 79Q56 48 72 10', 2.2, .4, 'end']].forEach(r => FACE_RIDGES.push(r));
        FACE_RIDGES.push(...flipRidges(FACE_RIDGES.slice(3)));
        const SIDE_RIDGES = [['M19 7C21 32 28 57 35 84', 3, 1], ['M14 10C15 37 19 63 22 84', 2.4, .7, 'start'], ['M10 32C10.5 55 10 72 8.5 88', 2, .5, 'start']];
        const KNOT_RIDGES = [[KNOT_RIM, 5, 1]];
        const FRONT_RIDGES = [[FRONT_RIM, 5, 1], ['M20 99.9C17.6 99.2 16.7 96.8 16.7 93V84.8', 2.6, 1]];
        // Points along the face's bottom curve (two quadratic halves), for fringe and bullion.
        const bottomPoints = n => {
            const q = (t, a, c, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
            const pts = [];
            for (let i = 0; i <= n; i++) {
                const u = i / n, t = u < .5 ? u * 2 : (u - .5) * 2;
                pts.push(u < .5 ? [q(t, 30, 74, 120), q(t, 78, 96, 98)] : [q(t, 120, 166, 210), q(t, 98, 96, 78)]);
            }
            return pts;
        };

        // Step 10's tassel (the left one): two smooth gold cords from the roll's tip with a knot halfway,
        // then a head and skirt drawn larger than the plain tassels so they survive at real size.
        const FULL_TASSEL_DEFS = `<radialGradient id="knotGold" cx=".35" cy=".3" r=".8">${stops(['#fff0b3', '#e2b755', '#7a5418'], [0, .45, 1])}</radialGradient>` +
            `<linearGradient id="tHead">${stops(['#8a5f1a', '#fff0b3', '#e2b755', '#7a5418'], [0, .3, .6, 1])}</linearGradient>` +
            `<linearGradient id="tSkirt">${stops(['#8a5f1a', '#f0c95e', '#d9a948', '#6b4a14'], [0, .3, .65, 1])}</linearGradient>`;
        const fullTassel = () => {
            const [x, y] = TASSEL_AT, head = TASSEL_HEAD, ky = f1((y + head) / 2), r = rng(Math.round(x * 7));
            const line = `M${x} ${y}V${head}`;
            const cord = dx => `<g transform="translate(${dx} 0)"><path d="${line}" fill="none" stroke="#7a5418" stroke-width="1.15"/><path d="${line}" fill="none" stroke="#d9a948" stroke-width=".8"/><path d="${line}" fill="none" stroke="#fff0b3" stroke-opacity=".55" stroke-width=".25" transform="translate(-.2 0)"/></g>`;
            const s = softLine(line, '#000', .45, 2.6) + cord(-.55) + cord(.55) +
                `<ellipse cx="${x}" cy="${ky + .7}" rx="2.3" ry="2.1" fill="#000" fill-opacity=".45" filter="url(#soft)"/><ellipse cx="${x}" cy="${ky}" rx="2.1" ry="1.9" fill="url(#knotGold)" stroke="#5a3d12" stroke-width=".3"/>` +
                `<path d="M${x - 1.9} ${ky - .7}Q${x} ${ky + .5} ${x + 1.9} ${ky - .7}M${x - 2} ${ky + .5}Q${x} ${ky + 1.6} ${x + 2} ${ky + .5}" fill="none" stroke="#6b4a14" stroke-opacity=".7" stroke-width=".35"/>` +
                `<path d="M${x - 1} ${ky - 1.2}Q${x - .3} ${ky - 1.6} ${x + .6} ${ky - 1.4}" fill="none" stroke="#fff4c8" stroke-opacity=".85" stroke-width=".35" stroke-linecap="round"/>`;
            // Head: a dome over a waist, then a collar band. Skirt: strands fanning slightly, uneven lengths,
            // darker at the edges.
            let h = `<path d="M${x - 1.6} ${head + .4}Q${x - 2.9} ${head + 3.4} ${x - 2.2} ${head + 5.2}H${x + 2.2}Q${x + 2.9} ${head + 3.4} ${x + 1.6} ${head + .4}Q${x} ${head - .6} ${x - 1.6} ${head + .4}Z" fill="url(#tHead)" stroke="#5a3d12" stroke-width=".3"/>` +
                `<path d="M${x - 1.5} ${head + 1.6}Q${x} ${head + 1} ${x + 1.5} ${head + 1.6}" fill="none" stroke="#fff4c8" stroke-opacity=".7" stroke-width=".35"/>` +
                `<path d="M${x - 2.6} ${head + 5.2}H${x + 2.6}V${head + 6.6}H${x - 2.6}Z" fill="url(#tHead)" stroke="#5a3d12" stroke-width=".3"/><path d="M${x - 2.6} ${head + 5.9}H${x + 2.6}" stroke="#6b4a14" stroke-opacity=".6" stroke-width=".3" stroke-dasharray=".5 .5"/>`;
            const top = head + 6.6;
            let dark = '', light = '';
            for (let i = 0; i < 14; i++) {
                const u = i / 13 - .5, x0 = x + u * 5, x1 = x + u * 6.6 + (r() - .5) * .4, len = 10.2 + (r() - .5) * 1.4 - Math.abs(u) * 1.2;
                const seg = `M${f1(x0)} ${f1(top)}Q${f1(x0 + u * .6)} ${f1(top + len * .6)} ${f1(x1)} ${f1(top + len)}`;
                if (Math.abs(u) > .3 || i % 3 === 1) dark += seg; else light += seg;
            }
            h += `<path d="M${x - 2.5} ${top}L${x - 3.4} ${top + 9.6}Q${x} ${top + 10.6} ${x + 3.4} ${top + 9.6}L${x + 2.5} ${top}Z" fill="url(#tSkirt)"/>` +
                `<path d="${dark}" fill="none" stroke="#7a5418" stroke-width=".45" stroke-linecap="round"/><path d="${light}" fill="none" stroke="#f3d27a" stroke-width=".4" stroke-linecap="round"/>`;
            return s + `<g transform="translate(${x} ${head}) scale(1.35) translate(${-x} ${-head})">${h}</g>`;
        };

        const valanceSVG = o => {
            const m = FABRICS[o.fabric];
            let mirrorId = 0;
            // Draws s, then its left-right mirror as a <use> of it rather than a second copy.
            const mirror = s => { const id = `m${mirrorId++}`; return `<g id="${id}">${s}</g><use href="#${id}" transform="translate(240 0) scale(-1 1)"/>`; };
            const faceRidges = ridges(FACE_RIDGES, 'fr');
            // The top cord's gradient is in user space: an objectBoundingBox one has no height on a
            // horizontal line and doesn't render at all.
            let defs = materialDefs(m) + faceRidges.defs +
                '<linearGradient id="crease"><stop stop-color="#000" stop-opacity=".8"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
                `<linearGradient id="goldCord" gradientUnits="userSpaceOnUse" x1="0" y1="4.4" x2="0" y2="6.8">${stops(GOLD, [0, .5, 1])}</linearGradient>`;
            if (o.sheen) defs += '<linearGradient id="sheenG" x2="1">' + [[0, 0], [.3, .09], [.5, 0], [.7, .07], [1, 0]].map(([off, op]) => `<stop offset="${off}" stop-color="#fff" stop-opacity="${op}"/>`).join('') + '</linearGradient>';

            let body = cloth(FACE, faceRidges.paths, m, 'cf', { outline: .35, lit: false });
            if (o.sheen) body += `<path d="${FACE}" fill="url(#sheenG)"/>`;
            body += mirror('<path d="M18 7C22 36 38 56 46 76L35 80C33 56 20 33 18 7Z" fill="url(#crease)" filter="url(#soft)" opacity=".85"/>');
            if (o.laurel) {
                // Two sprigs meeting under the title.
                let sprig = '';
                for (let i = 0; i < 5; i++) {
                    const t = i / 4, x = 118 - t * 15, y = 92.5 - t * t * 5;
                    sprig += `<ellipse cx="${x.toFixed(1)}" cy="${(y - .9).toFixed(1)}" rx="2" ry=".8" transform="rotate(${(-25 - t * 20).toFixed(0)} ${x.toFixed(1)} ${(y - .9).toFixed(1)})" fill="url(#gold)"/>` +
                        `<ellipse cx="${(x + .6).toFixed(1)}" cy="${(y + .9).toFixed(1)}" rx="1.8" ry=".7" transform="rotate(${(15 - t * 25).toFixed(0)} ${(x + .6).toFixed(1)} ${(y + .9).toFixed(1)})" fill="url(#gold)"/>`;
                }
                body += mirror(`<path d="M119 92.6Q110 92.4 102 87.2" fill="none" stroke="#b58a34" stroke-width=".5"/>${sprig}`);
            }
            if (o.filigree) body += mirror('<path d="M22 9C31 9 35 13 32 16C30 18 27 16 29 14.5M22 9C25 13 25 17 22 20C20 22 18 20 20 18.5" fill="none" stroke="url(#gold)" stroke-width=".8" stroke-linecap="round"/><circle cx="22" cy="9" r="1" fill="url(#gold)"/>');
            if (o.hem) body += softLine(HEM, '#000', .25, 1.6, 'soft', ' transform="translate(0 .6)"') + `<path d="${HEM}" fill="none" stroke="${o.hem}" stroke-opacity=".8" stroke-width=".6" stroke-dasharray="2.4 1.6"/>`;
            if (o.embroidery) {
                let scroll = '';
                sampleQuads([36, 75.5, 74, 89.5, 120, 91.5, 166, 89.5, 204, 75.5], 8.6).forEach(([x, y, a], i) => {
                    scroll += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(a * 180 / Math.PI)}) scale(1.7 ${i % 2 ? -1.7 : 1.7})"><path d="M-2.6 0C-2.6 -1.9 0 -1.9 0 0C0 1.5 1.9 1.5 1.9 .2" fill="none" stroke="url(#gold)" stroke-width=".5" stroke-linecap="round"/><ellipse cx="-1.3" cy="-1.9" rx=".9" ry=".4" transform="rotate(-20 -1.3 -1.9)" fill="url(#gold)"/></g>`;
                });
                body += `<g filter="url(#embShadow)">${scroll}</g>`;
                defs += '<filter id="embShadow" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy=".35" stdDeviation=".25" flood-color="#000" flood-opacity=".7"/></filter>';
            }
            if (o.goldEdge) body += softLine(HEM_EDGE, '#000', .35, 2.2) + `<path d="${HEM_EDGE}" fill="none" stroke="url(#gold)" stroke-width="1.4"/><path d="${HEM_EDGE}" fill="none" stroke="#6b4a14" stroke-opacity=".45" stroke-width="1.4" stroke-dasharray=".9 1.2"/>`;
            if (o.fray) {
                // Loose threads off the raw edge: out from the cloth, drooping under their own weight.
                const r = rng(7);
                let d = '';
                sampleQuads(HEM_EDGE_Q, .9).forEach(([x, y, a]) => {
                    const nx = -Math.sin(a), ny = Math.cos(a);
                    let dx = nx, dy = ny + .8;
                    const l = Math.hypot(dx, dy); dx /= l; dy /= l;
                    const len = .7 + r() * r() * 3.2, lean = (r() - .5) * .8;
                    d += `M${f1(x - nx * .4)} ${f1(y - ny * .4)}l${f1(dx * len + lean)} ${f1(dy * len)}`;
                });
                body += softLine(HEM_EDGE, '#2a1c0e', .3, 1.2) + `<path d="${d}" stroke="${m.frayColor}" stroke-width=".45" stroke-opacity=".9"/>`;
            }
            if (o.bullion) {
                let a = '', b = '';
                bottomPoints(58).forEach(([x, y], i) => {
                    const len = i % 2 ? 4.4 : 5.2;
                    let d = `M${f1(x)} ${f1(y - .3)}`;
                    for (let k = 0; k < 4; k++) d += `l${k % 2 ? -.45 : .45} ${f1(len / 4)}`;
                    if (i % 2) b += d; else a += d;
                });
                body += softLine(a + b, '#000', .45, 1.3, 'soft', ' transform="translate(0 .6)"') +
                    `<path d="${a}" fill="none" stroke="#c89a3c" stroke-width=".9" stroke-linejoin="round"/><path d="${b}" fill="none" stroke="#a97d2c" stroke-width=".9" stroke-linejoin="round"/>` +
                    `<path d="${a}${b}" fill="none" stroke="#fff0b3" stroke-opacity=".55" stroke-width=".3" stroke-dasharray=".5 .7"/>`;
            } else if (o.fringe) {
                const pts = bottomPoints(60);
                o.fringe.forEach((c, k) => {
                    const d = pts.filter((_, i) => i % 2 === k).map(([x, y]) => `M${x.toFixed(1)} ${(y - .4).toFixed(1)}v4.2`).join('');
                    body += `<path d="${d}" stroke="${c}" stroke-width=".7"/>`;
                });
            }

            // Side drapes and rolls, one side at a time. The rolls show the cloth's other side (km).
            const km = m.knot ? { ...m, ...m.knot } : m.knotBase ? { ...m, base: m.knotBase } : m;
            const own = m.knot || m.knotBase;
            [0, 1].forEach(i => {
                const flip = d => i ? mx(d) : d;
                const side = flip(SIDE), knot = flip(KNOT), front = flip(FRONT);
                const [sr, kr, frr] = [[SIDE_RIDGES, 'sr'], [KNOT_RIDGES, 'kr'], [FRONT_RIDGES, 'fk']].map(([list, id]) => ridges(i ? flipRidges(list) : list, id + i));
                defs += sr.defs + kr.defs + frr.defs;
                const edge = i ? 240 - BOARD_X : BOARD_X, out = i ? 1 : -1;
                // Cloth behind the board: darker toward the board's edge.
                defs += `<linearGradient id="wrap${i}" gradientUnits="userSpaceOnUse" x1="${edge}" y1="0" x2="${f1(edge + out * 10)}" y2="0"><stop stop-opacity=".55"/><stop offset="1" stop-opacity=".05"/></linearGradient>`;
                body += cloth(side, sr.paths, m, `cs${i}`, { outline: .5, shade: .2 }) + `<path d="${side}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".6"/>`;
                if (o.goldEdge) body += `<path d="${side}" fill="none" stroke="url(#gold)" stroke-width=".7"/>`;
                // The side drape's outer edge falls away backwards: soft shade along it, no hard line.
                body += clipped(`cs${i}`, softLine(flip(SIDE_OUTER), '#000', .5, 7, 'softWide'));
                // The roll, inside of the fold first: darker, its mouth's edge catching a line of light.
                body += `<path d="${knot}" fill="#000" fill-opacity=".45" filter="url(#soft)" transform="translate(0 1)"/>` +
                    cloth(knot, kr.paths, km, `ck${i}`, { shade: own ? .35 : .55, hollow: true }) +
                    clipped(`ck${i}`, softLine(flip(KNOT_RIM), '#fff', .22, 1.1)) +
                    `<path d="${knot}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".5"/>` +
                    clipped(`ck${i}`, `<rect x="${i ? edge : 0}" width="${BOARD_X}" height="106" fill="url(#wrap${i})"/>`);
                // The front part's shadow thrown back into the fold: a wide soft falloff, then a tight contact
                // shadow under the edge.
                body += `<clipPath id="kc${i}"><path d="${knot}"/></clipPath>` + clipped(`kc${i}`,
                    `<path d="${front}" fill="#000" fill-opacity=".6" filter="url(#softWide)" transform="translate(${out * 3.5} .6)"/>` +
                    `<path d="${front}" fill="#000" fill-opacity=".6" filter="url(#soft)" transform="translate(${out * .9} .2)"/>`);
                // The front part, wrapping round the board's edge: a soft highlight on the turn, then a dark
                // hairline where it turns away.
                body += cloth(front, frr.paths, km, `cfr${i}`, { shade: own ? .12 : .25, hollow: true }) +
                    clipped(`cfr${i}`, softLine(flip(FRONT_RIM), '#fff', .2, 1.1) +
                        softLine(flip(FOLD_EDGE), '#fff', .16, 1.4, 'soft', ` transform="translate(${-out * 1.3} 0)"`) + softLine(flip(FOLD_EDGE), '#000', .5, .9));
                // The side drape's shadow down across the whole roll, deepest right under the lid.
                body += clipped(`kc${i}`, `<path d="${side}" fill="#000" fill-opacity=".65" filter="url(#softWide)" transform="translate(0 2.8)"/>` +
                    `<path d="${side}" fill="#000" fill-opacity=".5" filter="url(#soft)" transform="translate(0 .9)"/>`);
            });
            body += softLine(LID + mx(LID), '#000', .55, 1.4);
            if (o.hem) body += `<path d="${LID_HEM}${mx(LID_HEM)}" fill="none" stroke="${o.hem}" stroke-opacity=".6" stroke-width=".55" stroke-dasharray="2.4 1.6"/>`;
            if (o.tassels) {
                const [cord, bodyC] = o.tassels, [tx, ty] = TASSEL_AT, top = TASSEL_HEAD + 5;
                body += mirror(`<path d="M${tx} ${ty}V${top - .6}" stroke="${cord}" stroke-width=".8"/><circle cx="${tx}" cy="${top}" r="1.5" fill="${cord}"/>` +
                    `<path d="M${tx - 1.7} ${top + 1}L${tx - 3} ${top + 12.3}H${tx + 3}L${tx + 1.7} ${top + 1}Z" fill="${bodyC}"/><path d="M${tx - 1.7} ${top + 3.8}V${top + 12.1}M${tx - .6} ${top + 3.8}V${top + 12.2}M${tx + .6} ${top + 3.8}V${top + 12.2}M${tx + 1.7} ${top + 3.8}V${top + 12.1}" stroke="#000" stroke-opacity=".28" stroke-width=".3"/>` +
                    `<path d="M${tx - 2} ${top + 2.2}H${tx + 2}" stroke="${cord}" stroke-width=".9"/>`);
            }
            if (o.fullTassels) {
                defs += FULL_TASSEL_DEFS;
                body += mirror(fullTassel());
            }
            if (o.cord) body += '<path d="M16 5.6H224" stroke="#000" stroke-opacity=".4" stroke-width="3" filter="url(#soft)" transform="translate(0 .8)"/><path d="M16 5.6H224" stroke="url(#goldCord)" stroke-width="2.4" stroke-linecap="round"/><path d="M16 5.6H224" stroke="#6b4a14" stroke-opacity=".55" stroke-width="2.4" stroke-dasharray="1 1.6"/>';
            if (o.nails || o.tacks) {
                const [fill, rim] = PLAQUE_NAIL_HEADS[o.nails ? 'iron' : 'brass'];
                body += [22, 71, 120, 169, 218].map(x => `<circle cx="${x + .3}" cy="9" r="1.7" fill="#000" fill-opacity=".45" filter="url(#soft)"/><circle cx="${x}" cy="8.4" r="1.45" fill="${fill}" stroke="${rim}" stroke-width=".45"/><circle cx="${x - .4}" cy="8" r=".45" fill="#fff" fill-opacity=".5"/>`).join('');
            }
            return svgUrl(`<defs>${defs}</defs>${body}`);
        };

        // The face's fold lighting on its own, for the layer over the lettering (hard-light, so flat cloth is
        // untouched), masked off the side drapes and rolls. Depends only on the fabric.
        const lightSVG = fabric => {
            const r = ridges(FACE_RIDGES, 'fr');
            const defs = r.defs + foldsFilter(FABRICS[fabric].fold) +
                `<mask id="face" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="106"><path d="${FACE}" fill="#fff"/><path d="${SIDE}${mx(SIDE)}${KNOT}${mx(KNOT)}" fill="#000"/></mask>`;
            return svgUrl(`<defs>${defs}</defs><g mask="url(#face)"><g filter="url(#folds)"><path d="${FACE}" fill="#000" fill-opacity=".3"/>${r.paths}</g></g>`);
        };

        return s => {
            const step = PLAQUE_STEPS[s];
            return `${plaqueEach([s], ' .bbgl-title-card-sign-face::before')} { background-image: ${valanceSVG(step)}; }\n` +
                `${plaqueEach([s], '')} { --bbgl-plaque-light: ${lightSVG(step.fabric)}; }\n`;
        };
    })();
    // Adds a step's cloth art to its own style element the first time a card at that step renders.
    const plaqueArtBuilt = new Set();
    function ensurePlaqueArt(stage) {
        if (!TITLE_PLAQUE_PROGRESSIVE || plaqueArtBuilt.has(stage) || !PLAQUE_STEPS[stage]) return;
        plaqueArtBuilt.add(stage);
        let style = document.getElementById('bbgl-plaque-art');
        if (!style) {
            style = document.createElement('style');
            style.id = 'bbgl-plaque-art';
            (document.head || document.documentElement).appendChild(style);
        }
        const css = plaqueArtCSS(stage);
        style.textContent += css;
        bakePlaqueArt(stage, css);
    }
    // Chrome re-rasterizes an SVG background, filters and all, whenever anything sharing its tile
    // repaints, which made any animation on the titles page expensive. So once the card is laid out,
    // each step's art is drawn to a canvas at the ::before's device-pixel size and swapped in as a
    // bitmap. The SVG shows until then, and stays if the card never gets a size.
    function bakePlaqueArt(stage, css, attempts = 30) {
        const face = document.querySelector(`.bbgl-title-card.is-progressive[data-sign-stage="${stage}"] .bbgl-title-card-sign-face`);
        const box = face && getComputedStyle(face, '::before');
        const w = box ? parseFloat(box.width) : 0, h = box ? parseFloat(box.height) : 0;
        if (!(w > 0 && h > 0)) {
            if (attempts > 0) requestAnimationFrame(() => bakePlaqueArt(stage, css, attempts - 1));
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const cw = Math.ceil(w * dpr), ch = Math.ceil(h * dpr);
        const urls = [...new Set(css.match(/url\("data:image\/svg\+xml,[^"]*"\)/g) || [])];
        Promise.all(urls.map(u => {
            const img = new Image();
            img.src = u.slice(5, -2);
            return img.decode().then(() => {
                const c = document.createElement('canvas');
                c.width = cw;
                c.height = ch;
                c.getContext('2d').drawImage(img, 0, 0, cw, ch);
                return [u, `url("${c.toDataURL()}")`];
            });
        })).then(pairs => {
            const style = document.getElementById('bbgl-plaque-art');
            if (!style) return;
            let baked = css;
            for (const [from, to] of pairs) baked = baked.split(from).join(to);
            style.textContent = style.textContent.replace(css, () => baked);
        }).catch(() => {});
    }
