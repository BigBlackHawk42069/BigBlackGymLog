    /**
     *  [SECTION III] THE PHYSIQUE (Assets & Styles)
     *  ========================================================================
     *  The Big & Black Part of the script.
     */
    // ─── Progressive title plaque ───────────────────────────────────────────
    // The identity card's 11 looks, step 0-10 (titlePlaqueStage(), 03-section-ii-utils.js). Split out of
    // 04-section-iii-styles.js, which it loads just ahead of; both ship verbatim. Everything here is
    // scoped to .bbgl-title-card.is-progressive, which the card always carries.
    //
    // PLAQUE_STEPS is the whole ladder: each step lists only what changes from the one before. The board
    // (raw pine → pine → oak → walnut) and the cloth (canvas → felt → velvet) are images; the lettering
    // and the cloth's fold lighting over it are drawn here. The fold lighting is a generated SVG built the
    // first time a card at that step renders (ensurePlaqueArt), then baked to a bitmap.
    const PLAQUE_STEPS = (() => {
        const steps = [
            { fabric: 'canvas', board: 'pineRaw', letters: 'ink' },
            {},
            {},
            { board: 'pine' },
            {},
            { fabric: 'felt', board: 'oak', letters: 'cream' },
            {},
            { fabric: 'velvet', board: 'walnut' },
            { letters: 'gold' },
            { letterStroke: true },
            {}
        ];
        let prev = {};
        return steps.map(d => (prev = { ...prev, ...d }));
    })();
    // The valance runs on below the sign to y = 190 for the hanging cloth, so the ::before hangs that far
    // past the sign's 96-unit box and nothing rescales.
    const PLAQUE_VB_H = 186;
    const PLAQUE_VALANCE_INSET = `0 0 -${+((PLAQUE_VB_H / 96 - 1) * 100).toFixed(2)}% 0`;
    const PLAQUE_ART_ROOT = cdnize('https://raw.githubusercontent.com/BigBlackHawk42069/BigBlackGymLog/refs/heads/main/Assets/Achievements/web/');
    const PLAQUE_BOARD_ART = { pineRaw: 'board-pine-raw', pine: 'board-pine', oak: 'board-oak', walnut: 'board-walnut' };
    const PLAQUE_DRAPE_ART = { canvas: 'drape-canvas', felt: 'drape-felt', velvet: 'drape-velvet' };
    const plaqueArtUrl = name => `url("${PLAQUE_ART_ROOT}${name}.webp")`;
    // The images are cropped to their visible pixels. The board fills the card; the drape spans x 6-234
    // and y 5-100.5 of the fold lighting's 240 × 96-per-face-height grid, as % of the face.
    const PLAQUE_BOARD_INSET = '0';
    const PLAQUE_DRAPE_INSET = '1.04% 2.5% -0.52%';
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
    // The board image sits on the card's ::after, under the card's contents (the card is isolated).
    const TITLE_PLAQUE_CSS = `
.bbgl-title-card.is-progressive {
    background: none;
    border-color: transparent;
    box-shadow: none;
}

.bbgl-title-card.is-progressive::after {
    content: '';
    position: absolute;
    inset: ${PLAQUE_BOARD_INSET};
    z-index: -1;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: center / 100% 100% no-repeat;
    -webkit-mask-image: none;
    mask-image: none;
    opacity: 1;
    pointer-events: none;
}

.bbgl-title-card.is-progressive .bbgl-title-card-sign-face::before {
    inset: ${PLAQUE_DRAPE_INSET};
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
` + plaqueRules('::after', step => `background-image: ${plaqueArtUrl(PLAQUE_BOARD_ART[step.board])};`) +
        plaqueRules(' .bbgl-title-card-sign-face::before', step => `background-image: ${plaqueArtUrl(PLAQUE_DRAPE_ART[step.fabric])};`) +
        plaqueRules(' .bbgl-title-card-sign-face .bbgl-title-word', step => PLAQUE_LETTERS[step.letters].words + (step.letterStroke ? '\n-webkit-text-stroke: .02em rgba(110, 72, 18, .55);' : '')) +
        plaqueRules(' .bbgl-title-card-title-label', step => PLAQUE_LETTERS[step.letters].label) +
        plaqueRules(' .bbgl-title-card-sign-face .bbgl-title-card-empty', step => PLAQUE_LETTERS[step.letters].label);

    // The card's rank emblem (achRankPlaqueHTML(), 06-section-v-logic.js): one image per atrophy tier
    // and band with its lettering baked in. The card also appears in the level bar's tooltip, outside
    // the panel, so these rules are scoped to both. The plaque is a size container; the label inside it
    // takes the emblem's own proportions (--rank-ar) at the largest size that fits, so overlays drawn
    // in the plate's units and masks of the emblem (--rank-emblem) land on the art.
    const RANK_EMBLEM_CSS = `
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 96%;
    height: 96%;
    max-width: 100%;
    margin: auto;
    container-type: size;
    pointer-events: auto;
    cursor: help;
    z-index: 1;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-notch-label {
    position: relative;
    display: block;
    width: min(100cqw, 100cqh * var(--rank-ar));
    height: min(100cqh, 100cqw / var(--rank-ar));
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-emblem {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;
}

.bbgl-title-card .bbgl-title-card-rank-label {
    display: none;
}

.bbgl-rank-surface-lighting {
    position: absolute;
    pointer-events: none;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque.finish-silver .bbgl-rank-notch-label {
    filter: var(--bbgl-shield-light, none);
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque.finish-gold .bbgl-rank-notch-label {
    filter: var(--bbgl-gold-light, none);
}

#bbgl-panel.bbgl-no-animations .bbgl-title-card-rank-plaque .bbgl-rank-notch-label {
    filter: none;
}

@media (prefers-reduced-motion: reduce) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-notch-label {
        filter: none;
    }
}

/* Bronze: a band of warm light slides across the emblem, clipped to it. The band is 300% wide and moved
   by transform inside a static masked box, so it runs on the compositor. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bronze-sheen {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
    -webkit-mask: var(--rank-emblem) center / 100% 100% no-repeat;
    mask: var(--rank-emblem) center / 100% 100% no-repeat;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bronze-sheen::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 300%;
    background: linear-gradient(90deg, transparent 42%, rgba(255, 209, 141, .12) 47%, rgba(255, 235, 196, .48) 50%, rgba(255, 209, 141, .12) 53%, transparent 58%);
    mix-blend-mode: screen;
    transform: translateX(-46.666667%);
    will-change: transform;
    animation: bbgl-bronze-plaque-sheen 9s step-end infinite;
    animation-delay: var(--bbgl-titles-animation-delay, 0ms);
}

#bbgl-panel.bbgl-no-animations .bbgl-title-card-rank-plaque .bbgl-rank-bronze-sheen::before {
    animation: none;
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bronze-sheen::before {
        animation: none;
        opacity: 0;
    }
}

/* Fully Bricked's lamps: beams under the emblem, lamps over it, and the light they throw on it (masked
   to the emblem). Lamp heads, beams and spots share one 7s sweep; the right lamp runs half a cycle behind. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-lamps,
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-lamp-light {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-lamps.is-back {
    left: 50%;
    top: 50%;
    width: min(100cqw, 100cqh * var(--rank-ar));
    height: min(100cqh, 100cqw / var(--rank-ar));
    transform: translate(-50%, -50%);
    z-index: 0;
    mix-blend-mode: screen;
    opacity: .55;
    filter: blur(1px);
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-lamps.is-front {
    z-index: 4;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-lamp-light {
    z-index: 2;
    mix-blend-mode: screen;
    -webkit-mask: var(--rank-emblem) center / 100% 100% no-repeat;
    mask: var(--rank-emblem) center / 100% 100% no-repeat;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-lamp-glow {
    filter: blur(1.2px);
}

.bbgl-lamp-sweep,
.bbgl-lamp-spot {
    transform-box: view-box;
    animation: bbgl-lamp-sweep 7s ease-in-out infinite alternate;
    animation-delay: var(--bbgl-titles-animation-delay, 0ms);
}

.bbgl-lamp-spot.is-left { animation-name: bbgl-lamp-spot-left; }
.bbgl-lamp-spot.is-right { animation-name: bbgl-lamp-spot-right; }

.bbgl-lamp-sweep.is-right,
.bbgl-lamp-spot.is-right {
    animation-delay: calc(var(--bbgl-titles-animation-delay, 0ms) - 3.5s);
}

@keyframes bbgl-lamp-sweep { from { transform: rotate(-11deg); } to { transform: rotate(11deg); } }
@keyframes bbgl-lamp-spot-left { from { transform: translate(-26px, -6px); } to { transform: translate(14px, 8px); } }
@keyframes bbgl-lamp-spot-right { from { transform: translate(-14px, 8px); } to { transform: translate(26px, -6px); } }

#bbgl-panel.bbgl-no-animations :is(.bbgl-lamp-sweep, .bbgl-lamp-spot) {
    animation: none;
}

@media (prefers-reduced-motion: reduce) {
    :is(.bbgl-lamp-sweep, .bbgl-lamp-spot) { animation: none; }
}

#bbgl-panel.bbgl-compact .bbgl-title-card-rank {
    width: calc(100% - 4px);
}
`;

    // The face's fold lighting for the layer over the lettering (hard-light, so flat cloth is untouched),
    // masked off the side drapes and rolls. Depends only on the fabric.
    const plaqueArtCSS = (() => {
        // fold: the height map's blur, light strength, noise wrinkle and its frequency.
        const FOLDS = {
            canvas: { blur: 3, scale: 3.2, wrinkle: .3, wf: '.04 .03' },
            felt: { blur: 3.6, scale: 2.6, wrinkle: .05, wf: '.05 .05' },
            velvet: { blur: 3, scale: 5, wrinkle: .12, wf: '.03 .03' }
        };
        const f1 = n => +n.toFixed(2);
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
        // Ridges [path, width, opacity, fade] as strokes into a height map; fade ('end', 'ends') runs a
        // gradient along the stroke so the fold dies away.
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
        const filterBox = 'x="0" y="0" width="240" height="106" filterUnits="userSpaceOnUse"';
        // Folds: ridge strokes plus a little noise become a height map, lit from the top left. Diffuse
        // light at 30° elevation lands flat cloth on exactly mid-grey, so hard-light only moves the slopes.
        const foldsFilter = fo => `<filter id="folds" ${filterBox} color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="${fo.blur}" result="r"/>` +
            `<feTurbulence type="fractalNoise" baseFrequency="${fo.wf}" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${fo.wrinkle} 0 0 0 0" result="na"/>` +
            `<feComposite in="r" in2="na" operator="arithmetic" k2="1" k3="1" result="h"/><feDiffuseLighting in="h" surfaceScale="${fo.scale}" diffuseConstant="1" lighting-color="#fff"><feDistantLight azimuth="235" elevation="30"/></feDiffuseLighting></filter>`;

        // Geometry, left side only; the right is mx() of it. It matches the drape images.
        const FACE = 'M17 5H223L210 78Q166 96 120 98Q74 96 30 78Z';
        const SIDE = 'M17 5C17 31 30 58 40 87C29 80.5 14.5 82.5 6 89.5C10 66 14 36 17 5Z';
        const KNOT = 'M6 89.5C14.5 82.5 29 80.5 40 87C44.5 91 35 97 19.5 100.5C13 97.5 7.4 94 6 89.5Z';
        const FACE_RIDGES = [['M18 7H222', 2.4, .7], ['M34 74Q120 108 206 74', 3, .55, 'ends'], ['M36 66Q120 94 204 66', 2.4, .35, 'ends']];
        const SIDE_FOLDS = [['M36 75Q29 40 22 8', 3, .9, 'end'], ['M40 77Q40 44 44 9', 2.6, .6, 'end'], ['M43 79Q56 48 72 10', 2.2, .4, 'end']];
        FACE_RIDGES.push(...SIDE_FOLDS, ...SIDE_FOLDS.map(([d, w, o, f]) => [mx(d), w, o, f]));

        const lightSVG = fabric => {
            const r = ridges(FACE_RIDGES, 'fr');
            const defs = r.defs + foldsFilter(FOLDS[fabric]) +
                `<mask id="face" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="106"><path d="${FACE}" fill="#fff"/><path d="${SIDE}${mx(SIDE)}${KNOT}${mx(KNOT)}" fill="#000"/></mask>`;
            return svgUrl(`<defs>${defs}</defs><g mask="url(#face)"><g filter="url(#folds)"><path d="${FACE}" fill="#000" fill-opacity=".3"/>${r.paths}</g></g>`);
        };

        return s => `${plaqueEach([s], '')} { --bbgl-plaque-light: ${lightSVG(PLAQUE_STEPS[s].fabric)}; }\n`;
    })();
    // Adds a step's cloth art to its own style element the first time a card at that step renders.
    const plaqueArtBuilt = new Set();
    function ensurePlaqueArt(stage) {
        if (plaqueArtBuilt.has(stage) || !PLAQUE_STEPS[stage]) return;
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
