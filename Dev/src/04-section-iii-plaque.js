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
    // One art file by name, at its own pin if it has one (ASSET_PINS, 02).
    const plaqueArtSrc = name => pinAsset(`${PLAQUE_ART_ROOT}${name}.webp`);
    const plaqueArtUrl = name => `url("${plaqueArtSrc(name)}")`;
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
    //
    // Light layers (.bbgl-rank-light) on the card plate and the bar name: a band in a box as wide as the
    // art, behind a matte of the surface that catches it (ensureRankMatte()). Only the band's transform
    // animates; card and bar share keyframes and the page clock.
    // R3 bronze: one warm stripe, skewed so its top leads on the way out (left to right). The travel (% of
    // the box) ends just as the bright core clears the far corner, so the ease-out happens on the metal and
    // the hold reads as the hold. Cycle: sweep out, hold, sweep back, rest (seconds).
    const BRONZE_SHEEN_BAND = 'linear-gradient(90deg, transparent 33%, rgba(255, 200, 128, .5) 42%, rgba(255, 244, 220, 1) 50%, rgba(255, 200, 128, .5) 58%, transparent 67%)';
    const BRONZE_SHEEN_TRAVEL = [-70, 70];
    const BRONZE_SHEEN_TIMING = { sweep: 5, hold: .8, rest: 5, get cycle() { return this.sweep * 2 + this.hold + this.rest; } };
    const bronzeSheenTransform = x => `translateX(${x}%) skewX(-28deg)`;
    // R4 silver: the art's brightness as a height map under a point light that drifts across and back, as
    // an SVG lighting filter (feSpecularLighting) would draw it. A live filter re-runs its lighting pass
    // whenever the light moves, so the lit art is baked instead (ensureShine()): SHINE.frames snapshots at
    // evenly spaced light positions, crossfaded by opacity (.bbgl-shine). Positions and units follow the
    // filter: light x as a share of the box width (from .5 - reach to .5 + reach), y at half height, z as a
    // share of sqrt((w² + h²) / 2); blur as a share of each side; surfaceScale and kernels per device pixel.
    // green: on the green faces and gems only (green bias g - max(r, b) from .05 to .11; grey metal stays
    // under ~.02), the filter's white light is cut by `white` and the colour is blended toward the pixel's
    // own hue at full brightness, saturated by `sat` (its smallest channel scaled by sat is taken out), by
    // gain * (N·H)^exp, at most fully. Blending can't overshoot the hue, so the green lights up toward a
    // vivid emerald (a typical face, 29,138,92, peaks at about 42,255,176) instead of washing out to white
    // or cyan. N·H only spans ~.79 (far from the light) to 1 (under it), so exp sets how local the glow is:
    // 14 gives half strength about a quarter of the width out and ~4% far away.
    const SHINE = {
        frames: 20, dur: 6.8, exp: 10, surfaceScale: .055, blur: .003, color: [229 / 255, 1, 242 / 255],
        green: { gain: .85, exp: 14, white: .8, sat: .6 },
        card: { reach: .85, z: .4, ks: .7 },
        text: { reach: 1.0625, z: .5, ks: .95 }
    };

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
    width: calc(min(100cqw, 100cqh * var(--rank-ar)) * var(--rank-scale, 1));
    height: calc(min(100cqh, 100cqw / var(--rank-ar)) * var(--rank-scale, 1));
    flex-shrink: 0;
}

/* Per-plate size, past the plaque box where the art has room around it. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque.finish-polished {
    --rank-scale: 1.08;
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

/* Light layers (see the BRONZE_ constants above): the box is masked by its matte, transparent until the
   matte is built; the band inside it moves by transform and composites normally. Used on the card plate
   and the bar name alike. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-rank-light {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
    -webkit-mask: var(--rank-matte, linear-gradient(transparent, transparent)) center / 100% 100% no-repeat;
    mask: var(--rank-matte, linear-gradient(transparent, transparent)) center / 100% 100% no-repeat;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-rank-light::before {
    content: '';
    position: absolute;
    inset: 0;
    will-change: transform;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-rank-light.is-bronze::before {
    background: ${BRONZE_SHEEN_BAND};
    transform: ${bronzeSheenTransform(BRONZE_SHEEN_TRAVEL[0])};
    animation: bbgl-bronze-sheen ${BRONZE_SHEEN_TIMING.cycle}s step-end var(--bbgl-titles-animation-delay, 0ms) infinite;
}

#bbgl-panel.bbgl-no-animations .bbgl-rank-light {
    display: none;
}

@media (prefers-reduced-motion: reduce) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-rank-light {
        display: none;
    }
}

/* R4's baked light (SHINE above): one snapshot of the fully lit art per <i>, empty until ensureShine()
   fills them. Each crossfades in on its own opacity keyframes (bbgl-shine-N, 04-section-iii-styles.js),
   so at most two are visible and only their opacity changes. The snapshots are opaque colour only; the
   stack is cut to the art's shape once, by its own image as a static mask (--shine-mask). Snapshots that
   carried the art's soft edges themselves doubled those edges mid-crossfade (two half-transparent layers
   read nearly opaque), which made small lettering pulse at every step. When filled, the set fades in over the
   plain art, which is hidden only after the fade (its visibility change is delayed to match), so nothing
   blinks out. Nodes created after the bake start in the final state, since transitions don't run on
   first style. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-shine {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0;
    transition: opacity .4s ease-out;
    -webkit-mask: var(--shine-mask) center / 100% 100% no-repeat;
    mask: var(--shine-mask) center / 100% 100% no-repeat;
}

:is(#bbgl-panel, .bbgl-level-title-tooltip) [data-shine-host] :is(.bbgl-rank-emblem, .bbgl-rank-name-img) {
    transition: visibility 0s linear .4s;
}

/* Longhands only: the snapshot images come from lower-specificity rules (ensureShine()), which a
   background shorthand here would reset. */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-shine > i {
    position: absolute;
    inset: 0;
    background-position: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    opacity: 0;
}

#bbgl-panel.bbgl-no-animations .bbgl-shine {
    display: none;
}

@media (prefers-reduced-motion: reduce) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-shine {
        display: none;
    }
}

/* R2: the dome on the top bevel is a hood over a bulb. On reveal the bulb flickers on and lights what's
   below its lip: a hot slit under the hood, a white pool spreading down (weighted by the plate's own
   brightness squared, through two intersected luminance masks, so highlights in the metal catch far
   more than its midtones and the dark window barely lifts), and a second
   layer masked by the plate minus itself shifted down a few px, which favours up-facing edges. All of
   it is cut off above the slit (the hood stays unlit), and the flicker animates only the span's opacity.
   Positions are in the R2 art's units (500 x 267; slit x 156-348, y 37-39). */
:is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light {
    --bulb-glow: 242, 246, 252;
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    -webkit-mask: linear-gradient(transparent 13.4%, #000 14%);
    mask: linear-gradient(transparent 13.4%, #000 14%);
    background:
        radial-gradient(ellipse 19.6% 1.7% at 50.4% 14.3%, rgba(255, 255, 255, .95), rgba(var(--bulb-glow), .55) 55%, transparent),
        radial-gradient(ellipse 27% 8% at 50.4% 14%, rgba(var(--bulb-glow), .5), transparent 75%);
    will-change: opacity;
    animation: bbgl-rank-bulb-on 2.5s step-end 1 both;
    animation-delay: var(--bbgl-titles-animation-delay, 0ms);
}

@supports (mask-mode: luminance) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light::before,
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light::after {
        content: '';
        position: absolute;
        inset: 0;
    }

    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light::before {
        background: radial-gradient(ellipse 64% 150% at 50.4% 13%, rgba(var(--bulb-glow), 1), rgba(var(--bulb-glow), .95) 30%, rgba(var(--bulb-glow), .75) 60%, rgba(var(--bulb-glow), .4) 85%, transparent);
        mask:
            var(--rank-emblem) 0 0 / 100% 100% no-repeat luminance,
            var(--rank-emblem) 0 0 / 100% 100% no-repeat luminance;
        mask-composite: intersect, add;
    }

    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light::after {
        --bulb-edge: calc(min(100cqh, 100cqw / var(--rank-ar)) * .011);
        background: radial-gradient(ellipse 62% 155% at 50.4% 13%, rgba(255, 255, 255, 1), rgba(var(--bulb-glow), .85) 35%, rgba(var(--bulb-glow), .55) 65%, rgba(var(--bulb-glow), .25) 88%, transparent);
        mask:
            var(--rank-emblem) 0 0 / 100% 100% no-repeat luminance,
            var(--rank-emblem) 0 var(--bulb-edge) / 100% 100% no-repeat luminance;
        mask-composite: subtract, add;
    }
}

/* Same beats as the old lightbox's power-on, as the light's opacity. */
@keyframes bbgl-rank-bulb-on {
    0%, 30%, 33%, 40%, 45%, 64%, 74% { opacity: 0; }
    30.01%, 38%, 44% { opacity: .35; }
    53%, 72% { opacity: .7; }
    76%, 100% { opacity: 1; }
}

#bbgl-panel.bbgl-no-animations .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light {
    animation: none;
}

@media (prefers-reduced-motion: reduce) {
    :is(#bbgl-panel, .bbgl-level-title-tooltip) .bbgl-title-card-rank-plaque .bbgl-rank-bulb-light {
        animation: none;
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
    // Mattes for the light layers (.bbgl-rank-light), cut once per image on a canvas: alpha is how much a
    // pixel catches that light. Luminance masks can't do this (they can't keep light off R3's dark inset,
    // brightness ~.15, without dimming its bronze, ~.25 and up), and baking them makes each layer a plain
    // alpha mask. Inputs are sRGB 0-1 brightness (l) and green bias (q = g - max(r, b)), measured on the art:
    //   bronze: zero below .2, full by .3, then weighted toward the highlights.
    // Until a matte lands (or if the image can't be read) its layer's mask stays fully transparent; when it
    // lands, the light layers on screen restart from their first frame instead of appearing mid-sweep.
    const smooth = (e0, e1, v) => { const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    const RANK_MATTES = {
        bronze: (l) => smooth(.2, .3, l) * Math.min(1, .55 + l)
    };
    const rankMatteBuilt = new Set();
    function ensureRankMatte(name, kinds) {
        kinds = kinds.filter(k => !rankMatteBuilt.has(`${k}:${name}`));
        if (!kinds.length) return;
        kinds.forEach(k => rankMatteBuilt.add(`${k}:${name}`));
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = plaqueArtSrc(name);
        img.decode().then(() => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const src = ctx.getImageData(0, 0, c.width, c.height).data;
            let css = '';
            for (const kind of kinds) {
                const out = ctx.createImageData(c.width, c.height);
                const px = out.data, f = RANK_MATTES[kind];
                for (let i = 0; i < src.length; i += 4) {
                    const r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;
                    px[i] = px[i + 1] = px[i + 2] = 255;
                    px[i + 3] = src[i + 3] * f(.2126 * r + .7152 * g + .0722 * b, g - Math.max(r, b));
                }
                ctx.putImageData(out, 0, 0);
                css += `[data-matte="${kind}:${name}"] { --rank-matte: url("${c.toDataURL('image/webp', .9)}"); }\n`;
            }
            let style = document.getElementById('bbgl-rank-matte');
            if (!style) {
                style = document.createElement('style');
                style.id = 'bbgl-rank-matte';
                (document.head || document.documentElement).appendChild(style);
            }
            style.textContent += css;
            document.querySelectorAll('.bbgl-rank-light').forEach(el =>
                el.getAnimations({ subtree: true }).forEach(anim => { anim.currentTime = 0; }));
        }).catch(() => {});
    }
    // The light layers for a finish, as markup, with their mattes requested.
    const RANK_LIGHT_KINDS = { polished: ['bronze'] };
    function rankLightHTML(finish, name) {
        const kinds = RANK_LIGHT_KINDS[finish];
        if (!kinds) return '';
        ensureRankMatte(name, kinds);
        return kinds.map(k => `<span class="bbgl-rank-light is-${k}" data-matte="${k}:${name}"></span>`).join('');
    }

    // R4's baked light. shineHTML() gives the snapshot layers for one piece of art ('card' for the plate,
    // 'text' for the bar name); the element holding that art carries data-shine-host with the same key.
    // The bake waits for the layers to be laid out, then adds one rule set for the key: the snapshots fade
    // in over the plain art (.bbgl-shine's opacity transition) and the plain art is hidden once they're
    // in. Until then, or if the image can't be read, the plain art shows unlit; there's no live filter
    // to hand over from, so nothing pops or flickers at the switch.
    // Resolution: SHINE_OVERSAMPLE times the device-pixel size (capped at the image's own width), so the
    // snapshots stay as sharp as the plain image when the browser scales them down. The filter's per-pixel
    // terms are kept at display scale: surfaceScale is multiplied by the oversampling (slopes per display
    // pixel stay the same) and the blur and light positions are already shares of the box.
    const SHINE_OVERSAMPLE = 2;
    const shineState = new Map();
    function shineHTML(kind, name) {
        const key = `${kind}:${name}`;
        ensureShine(key, kind, name);
        return `<span class="bbgl-shine" data-shine="${key}" style="--shine-mask:url('${plaqueArtSrc(name)}')">${'<i></i>'.repeat(SHINE.frames)}</span>`;
    }
    function ensureShine(key, kind, name) {
        if (shineState.has(key)) return;
        shineState.set(key, 'pending');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = plaqueArtSrc(name);
        const giveUp = () => shineState.delete(key);
        const sized = (attempts = 60) => {
            const box = [...document.querySelectorAll(`.bbgl-shine[data-shine="${key}"]`)]
                .map(el => el.getBoundingClientRect()).find(r => r.width > 0 && r.height > 0);
            if (box) return bake(box);
            if (attempts > 0) requestAnimationFrame(() => sized(attempts - 1));
            else giveUp();
        };
        const bake = box => {
            const device = box.width * (window.devicePixelRatio || 1);
            const w = Math.max(2, Math.round(Math.min(640, Math.max(device, Math.min(img.naturalWidth, device * SHINE_OVERSAMPLE)))));
            const h = Math.max(2, Math.round(w * box.height / box.width));
            const frames = shineFrames(img, w, h, SHINE[kind], w / Math.max(1, device));
            // The generator stops after every band of rows; each task runs it for ~6ms, so the bake never
            // holds the page long enough to drop a frame. The snapshots are then encoded as lossless PNG
            // (lossy webp smeared the colour edges) with toBlob, which the browser does off the main
            // thread, and read back as data URLs.
            const next = () => {
                const end = performance.now() + 6;
                let r;
                while (!(r = frames.next()).done) {
                    if (performance.now() > end) { setTimeout(next, 0); return; }
                }
                const c = document.createElement('canvas');
                c.width = w;
                c.height = h;
                const ctx = c.getContext('2d');
                Promise.all(r.value.map(data => {
                    ctx.putImageData(data, 0, 0);
                    return new Promise(res => c.toBlob(blob => {
                        if (!blob) return res(null);
                        const fr = new FileReader();
                        fr.onload = () => res(fr.result);
                        fr.onerror = () => res(null);
                        fr.readAsDataURL(blob);
                    }, 'image/png'));
                })).then(urls => urls.every(Boolean) ? publish(urls) : giveUp());
            };
            next();
        };
        const publish = urls => {
            let style = document.getElementById('bbgl-rank-shine');
            if (!style) {
                style = document.createElement('style');
                style.id = 'bbgl-rank-shine';
                (document.head || document.documentElement).appendChild(style);
            }
            // Scoped like the base rules (an ID in the selector), or they'd lose to them.
            const scope = ':is(#bbgl-panel:not(.bbgl-no-animations), .bbgl-level-title-tooltip)';
            style.textContent += `@media (prefers-reduced-motion: no-preference) {\n` +
                `${scope} .bbgl-shine[data-shine="${key}"] { opacity: 1; }\n` +
                `${scope} [data-shine-host="${key}"] :is(.bbgl-rank-emblem, .bbgl-rank-name-img) { visibility: hidden; }\n}\n` +
                urls.map((u, i) => `.bbgl-shine[data-shine="${key}"] > i:nth-child(${i + 1}) { background-image: url("${u}"); }`).join('\n') + '\n';
            shineState.set(key, 'ready');
        };
        img.decode().then(() => sized(), giveUp);
    }
    // The filter, pixel by pixel (Filter Effects feSpecularLighting / feComposite), for each light position:
    // relief = the art's luminance; surface = relief blurred; normals from a Sobel of the surface times
    // surfaceScale; specular = ks * (N·H)^exp in the lighting colour, alpha = its max; reflection = specular
    // in relief; lit = art + reflection, clamped, cut to the art's alpha. Then SHINE.green on green pixels.
    // Every snapshot is built in one pass, row by row: the light only moves sideways, so a row's half-vectors
    // depend only on the pixel's offset from the light and come from one table per row (the surface height,
    // under .06 px against a light ~100 px up, is left out). Yields null after every band of rows, so the
    // caller can slice the work, and returns the snapshots as ImageData. `oversample` is bake pixels per
    // display device pixel.
    function* shineFrames(img, w, h, o, oversample = 1) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        const src = ctx.getImageData(0, 0, w, h).data;
        const G = SHINE.green;
        const n = w * h, relief = new Float32Array(n), alpha = new Float32Array(n), green = new Float32Array(n);
        const R = new Float32Array(n), Gn = new Float32Array(n), B = new Float32Array(n);
        const gR = new Float32Array(n), gG = new Float32Array(n), gB = new Float32Array(n);
        for (let i = 0, j = 0; i < n; i++, j += 4) {
            const r = src[j] / 255, g = src[j + 1] / 255, b = src[j + 2] / 255;
            R[i] = r; Gn[i] = g; B[i] = b;
            relief[i] = .2126 * r + .7152 * g + .0722 * b;
            alpha[i] = src[j + 3] / 255;
            const t = Math.min(1, Math.max(0, (g - Math.max(r, b) - .05) / .06));
            green[i] = t * t * (3 - 2 * t);
            if (green[i] > 0) {
                // The glow's colour: this pixel's own hue at full brightness, more saturated.
                const mx = Math.max(r, g, b), mn = Math.min(r, g, b) * G.sat, k = 1 / Math.max(1e-3, mx - mn);
                gR[i] = (r - mn) * k; gG[i] = (g - mn) * k; gB[i] = (b - mn) * k;
            }
        }
        const surf = blurSeparable(relief, w, h, SHINE.blur * w, SHINE.blur * h);
        yield null;
        const nx = new Float32Array(n), ny = new Float32Array(n), nz = new Float32Array(n);
        const ss = SHINE.surfaceScale * oversample;
        for (let y = 0; y < h; y++) {
            const ym = (y > 0 ? y - 1 : 0) * w, y0 = y * w, yp = (y < h - 1 ? y + 1 : y) * w;
            for (let x = 0; x < w; x++) {
                const xm = x > 0 ? x - 1 : 0, xp = x < w - 1 ? x + 1 : x;
                const gx = surf[ym + xp] + 2 * surf[y0 + xp] + surf[yp + xp] - surf[ym + xm] - 2 * surf[y0 + xm] - surf[yp + xm];
                const gy = surf[yp + xm] + 2 * surf[yp + x] + surf[yp + xp] - surf[ym + xm] - 2 * surf[ym + x] - surf[ym + xp];
                const ax = -ss * .25 * gx, ay = -ss * .25 * gy, il = 1 / Math.sqrt(ax * ax + ay * ay + 1), i = y0 + x;
                nx[i] = ax * il; ny[i] = ay * il; nz[i] = il;
            }
        }
        yield null;
        const K = SHINE.frames, [cr, cg, cb] = SHINE.color, ks = o.ks, lz = o.z * Math.sqrt((w * w + h * h) / 2), ly = h / 2;
        const lxs = [];
        for (let k = 0; k < K; k++) lxs.push(Math.round((.5 - o.reach + 2 * o.reach * k / (K - 1)) * w));
        const dxMin = lxs[0] - (w - 1), span = lxs[K - 1] - dxMin + 1;
        const HX = new Float32Array(span), HY = new Float32Array(span), HZ = new Float32Array(span);
        const outs = lxs.map(() => new Uint8ClampedArray(n * 4));
        const band = Math.max(1, Math.floor(120000 / (w * K)));
        for (let y = 0; y < h; y++) {
            const dy = ly - y, dyz = dy * dy + lz * lz;
            for (let d = 0; d < span; d++) {
                const dx = dxMin + d, il = 1 / Math.sqrt(dx * dx + dyz);
                const hx = dx * il, hy = dy * il, hz = lz * il + 1, ih = 1 / Math.sqrt(hx * hx + hy * hy + hz * hz);
                HX[d] = hx * ih; HY[d] = hy * ih; HZ[d] = hz * ih;
            }
            for (let k = 0; k < K; k++) {
                const px = outs[k], off = lxs[k] - dxMin;
                for (let x = 0, i = y * w; x < w; x++, i++) {
                    const sa = alpha[i];
                    if (sa === 0) continue;
                    const d = off - x;
                    const nh = nx[i] * HX[d] + ny[i] * HY[d] + nz[i] * HZ[d];
                    const gw = green[i];
                    let spec = 0, glow = 0;
                    if (nh > 0) {
                        const d2 = nh * nh, d4 = d2 * d2;
                        spec = ks * d4 * d4 * d2;
                        if (gw > 0) glow = Math.min(1, G.gain * gw * Math.pow(nh, G.exp));
                    }
                    const keep = sa * (1 - glow), hue = sa * glow;
                    const rel = relief[i], white = rel * (1 - G.white * gw), j = i * 4;
                    let sr = spec * cr, sg = spec * cg, sb = spec * cb;
                    if (sr > 1) sr = 1;
                    if (sg > 1) sg = 1;
                    if (sb > 1) sb = 1;
                    let la = sa + sg * white;
                    if (la > 1) la = 1;
                    const inv = 255 / la;
                    let v = R[i] * keep + gR[i] * hue + sr * white;
                    if (v > la) v = la;
                    px[j] = v * inv + .5 | 0;
                    v = Gn[i] * keep + gG[i] * hue + sg * white;
                    if (v > la) v = la;
                    px[j + 1] = v * inv + .5 | 0;
                    v = B[i] * keep + gB[i] * hue + sb * white;
                    if (v > la) v = la;
                    px[j + 2] = v * inv + .5 | 0;
                    px[j + 3] = 255;
                }
            }
            if (y % band === band - 1) yield null;
        }
        // The shape comes from the mask (--shine-mask), so each snapshot is opaque colour: just past the
        // art's edge it takes the colour of the nearest art pixel (a few px out), so scaling and the
        // mask's soft edge never blend in a dark rim.
        const near = new Int32Array(n).fill(-1);
        for (let i = 0; i < n; i++) if (alpha[i] > 0) near[i] = i;
        for (let pass = 0; pass < 3; pass++) {
            const prev = near.slice();
            for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
                if (prev[i] >= 0) continue;
                const s = (x > 0 && prev[i - 1] >= 0) ? prev[i - 1] : (x < w - 1 && prev[i + 1] >= 0) ? prev[i + 1]
                    : (y > 0 && prev[i - w] >= 0) ? prev[i - w] : (y < h - 1 && prev[i + w] >= 0) ? prev[i + w] : -1;
                if (s >= 0) near[i] = s;
            }
        }
        for (let i = 0; i < n; i++) {
            const s = near[i];
            if (s < 0 || s === i) continue;
            for (const px of outs) {
                px[i * 4] = px[s * 4]; px[i * 4 + 1] = px[s * 4 + 1]; px[i * 4 + 2] = px[s * 4 + 2]; px[i * 4 + 3] = 255;
            }
        }
        return outs.map(px => new ImageData(px, w, h));
    }
    function blurSeparable(a, w, h, sx, sy) {
        const kernel = s => {
            const r = Math.max(1, Math.ceil(s * 3)), k = new Float32Array(2 * r + 1);
            let sum = 0;
            for (let d = -r; d <= r; d++) sum += (k[d + r] = Math.exp(-d * d / (2 * s * s)));
            return [k.map(v => v / sum), r];
        };
        const tmp = new Float32Array(a.length), out = new Float32Array(a.length);
        if (sx < .3) tmp.set(a);
        else {
            const [k, r] = kernel(sx);
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
                let acc = 0;
                for (let d = -r; d <= r; d++) { const xx = x + d; acc += k[d + r] * a[y * w + (xx < 0 ? 0 : xx >= w ? w - 1 : xx)]; }
                tmp[y * w + x] = acc;
            }
        }
        if (sy < .3) out.set(tmp);
        else {
            const [k, r] = kernel(sy);
            for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
                let acc = 0;
                for (let d = -r; d <= r; d++) { const yy = y + d; acc += k[d + r] * tmp[(yy < 0 ? 0 : yy >= h ? h - 1 : yy) * w + x]; }
                out[y * w + x] = acc;
            }
        }
        return out;
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
