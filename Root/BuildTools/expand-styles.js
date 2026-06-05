/*
 * expand-styles.js — one-time utility that expands the CSS section of
 * Beautified/src/04-section-iii-styles.js into human-readable form.
 *
 * What it preserves verbatim:
 *   - Every byte of the file outside the CSS_STYLES template literal.
 *   - The head ASCII art   (decoration-only lines at the top of the literal).
 *   - The balls ASCII art  (decoration-only lines at the bottom of the literal).
 *
 * What it transforms:
 *   - The CSS shaft between head and balls: packed lines with /*---*\/ fill
 *     comments are collapsed to a single flat CSS string, then expanded via
 *     js-beautify (CSS mode) into one-property-per-line rules.
 *   - Each expanded line is prefixed with 20 spaces so the CSS block sits at
 *     the same visual indent as the original shaft.
 *
 * The root build (build-root.js) is completely unaffected — formatStylesSection()
 * already collapses-then-repacks whatever CSS sits between head and balls.
 * The beautified build (Beautified/build.bat) is a pure concat — it carries
 * the expanded format straight through with no processing.
 *
 * Usage (run once from Root/ directory):
 *   node BuildTools/expand-styles.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { css: cssBeautify } = require('js-beautify');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const REPO      = path.join(__dirname, '..', '..');
const SRC_FILE  = path.join(REPO, 'Beautified', 'src', '04-section-iii-styles.js');

// Indent applied to every expanded CSS line inside the template literal.
// Matches CSS_PAD used by build-root.js (20 spaces = CSS_INDENT).
const CSS_PAD = ' '.repeat(20);

// ---------------------------------------------------------------------------
// isDecoLine — identical to the check in build-root.js.
// Returns true for blank lines and lines containing only /*[= ]+*/ blocks.
// ---------------------------------------------------------------------------
function isDecoLine(line) {
    const t = line.trim();
    if (t === '') return true;
    return /^(\/\*[= ]+\*\/\s*)+$/.test(t);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function expandStyles() {
    const raw  = fs.readFileSync(SRC_FILE, 'utf8');
    const text = raw.replace(/\r\n/g, '\n');

    // Locate the CSS_STYLES template literal.
    const cssOpen = text.indexOf('const CSS_STYLES = `');
    if (cssOpen === -1) {
        console.error('ERROR: could not find "const CSS_STYLES = `" in', SRC_FILE);
        process.exit(1);
    }
    const btOpen  = cssOpen + 'const CSS_STYLES = '.length; // index of opening `
    const btClose = text.indexOf('`', btOpen + 1);           // index of closing `
    if (btClose === -1) {
        console.error('ERROR: could not find closing backtick of CSS_STYLES.');
        process.exit(1);
    }

    const before = text.slice(0, btOpen + 1);   // up to and including opening `
    const after  = text.slice(btClose);          // closing ` and everything after
    const lines  = text.slice(btOpen + 1, btClose).split('\n');

    // Identify head (decoration lines at top) and balls (decoration lines at bottom).
    let sStart = 0;
    while (sStart < lines.length && isDecoLine(lines[sStart])) sStart++;
    let sEnd = lines.length - 1;
    while (sEnd >= sStart && isDecoLine(lines[sEnd])) sEnd--;

    if (sStart > sEnd) {
        console.error('ERROR: no CSS shaft found between head and balls decoration.');
        process.exit(1);
    }

    const headLines  = lines.slice(0, sStart);
    const shaftLines = lines.slice(sStart, sEnd + 1);
    const ballsLines = lines.slice(sEnd + 1);

    console.log(`  Head  : ${headLines.length} lines (lines 0–${sStart - 1})`);
    console.log(`  Shaft : ${shaftLines.length} lines to expand`);
    console.log(`  Balls : ${ballsLines.length} lines (after shaft)`);

    // Collapse shaft to a flat CSS string (same as build-root.js does internally).
    const flatCSS = shaftLines
        .map(l => l.replace(/\/\*-+\*\//g, '').trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Protect ${...} template-literal interpolations from the CSS beautifier.
    // js-beautify treats a bare { as a CSS block delimiter, which would break
    // expressions like ${CONSTANTS.COLORS.GAINS} into multi-line garbage.
    const interpolations = [];
    const guardedCSS = flatCSS.replace(/\$\{[^}]*\}/g, match => {
        const token = `BBGLPH${interpolations.length}BBGLPH`;
        interpolations.push(match);
        return token;
    });

    // Expand via js-beautify (CSS mode).
    const beautified = cssBeautify(guardedCSS, {
        indent_size          : 4,
        indent_char          : ' ',
        selector_separator_newline: true,
        end_with_newline     : false,
        newline_between_rules: true,
        space_around_combinator: true,
    });

    // Restore the protected interpolations.
    const restored = beautified.replace(/BBGLPH(\d+)BBGLPH/g,
        (_, i) => interpolations[Number(i)]);

    // Prefix every expanded line with CSS_PAD so the block sits at the same
    // visual depth as the original shaft content.
    const expandedLines = restored
        .split('\n')
        .map(l => (l.trim() === '' ? '' : CSS_PAD + l));

    // Reconstruct: before + head + blank + expanded CSS + blank + balls + after.
    const rebuilt = [
        before,
        ...headLines,
        ...expandedLines,
        ...ballsLines,
        after,
    ].join('\n');

    // Normalize CRLF → LF (consistent with build-root.js output).
    const result = rebuilt.replace(/\r\n/g, '\n');

    fs.writeFileSync(SRC_FILE, result, 'utf8');
    console.log('\nWrote ' + SRC_FILE);
    const outLines = result.split('\n').length;
    console.log(`  ${outLines} lines, ${result.length} bytes`);
    console.log('\nDone. Head and balls are preserved; CSS section is now expanded.');
    console.log('build-root.js and Beautified/build.bat require no changes.');
}

expandStyles();
