/*
 * build-root.js — regenerates the Root (deployable) script from Beautified/src.
 *
 * Beautified/src is the single source of truth. This transform reproduces the
 * compact "one-line-per-statement" Root format without hand-maintaining a
 * parallel codebase.
 *
 * Pipeline:
 *   1. Prepend the header (Beautified/src/00-header.js) verbatim. It is NOT
 *      parsed (parsing would strip its comments), just placed at the top.
 *   2. Concatenate the Beautified body files (01..10, 99) and parse the whole
 *      IIFE with Babel (the files are fragments of one IIFE, so only the
 *      concatenation is valid JS).
 *   3. Walk the IIFE's top-level statements:
 *        - Statements inside the Styles (04) or Data (05) sections, and the
 *          CUSTOM_STICKERS declaration, are emitted VERBATIM.
 *        - Every other statement is collapsed onto a single line (names and
 *          behavior preserved; all comments stripped EXCEPT [SECTION] headers).
 *        - A collapsed line longer than LINE_THRESHOLD is re-emitted multi-line
 *          so an IDE won't truncate it (Babel breaks only at safe points).
 *   4. Write Root/Big-Black-Gym-Log-Test.js.
 *
 * Usage:  npm install   (once)   then   node build-root.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const REPO = path.join(__dirname, '..', '..');
const BEAUT_SRC = path.join(REPO, 'Beautified', 'src');
const HEADER_FILE = path.join(BEAUT_SRC, '00-header.js');
const OUT_FILE = path.join(REPO, 'Root', 'Big-Black-Gym-Log-Test.js');

const INDENT = '    '; // 4 spaces — one level inside the IIFE
// Max width for a collapsed line. Anything longer is soft-wrapped at safe
// points (top-level commas) so an IDE won't truncate it. Tuned high so only
// genuinely huge statements break — most stay on a single line.
const LINE_WIDTH = 5000;

// Beautified body files, in concatenation order. 00-header is excluded here
// because it is prepended verbatim (see HEADER_FILE) rather than parsed.
const BODY_FILES = [
    '01-iife-open.js',
    '02-section-i-constants.js',
    '03-section-ii-utils.js',
    '04-section-iii-styles.js',
    '05-section-iv-data.js',
    '06-section-v-logic.js',
    '07-section-vi-ui.js',
    '08-section-vii-graph.js',
    '09-section-viii-stickers.js',
    '10-section-ix-init.js',
    '99-iife-close.js'
];

// Sections passed through verbatim (preserve exact formatting + comments).
const VERBATIM_FILES = new Set(['04-section-iii-styles.js', '05-section-iv-data.js']);

// Declarations passed through verbatim wherever they appear.
const VERBATIM_DECLS = new Set();

// ---------------------------------------------------------------------------
// CSS Shaft Formatter
// Runs inline on 04-section-iii-styles.js during the build pass.
// The Beautified source is left untouched; only the deployable output gets
// the clean 120-char rectangular shaft.
// ---------------------------------------------------------------------------
const CSS_INDENT = 20;
const CSS_USABLE = 120; // content width; total line = INDENT + USABLE = 140 chars
const CSS_WIDTH  = CSS_INDENT + CSS_USABLE;
const CSS_PAD    = ' '.repeat(CSS_INDENT);

function isDecoLine(line) {
    const t = line.trim();
    if (t === '') return true;
    // Matches lines containing only /*[= ]+*/ blocks and whitespace
    return /^(\/\*[= ]+\*\/\s*)+$/.test(t);
}

function formatStylesSection(raw) {
    const text = raw.replace(/\r\n/g, '\n');

    // Locate the CSS_STYLES template literal
    const cssOpen = text.indexOf('const CSS_STYLES = `');
    if (cssOpen === -1) return raw;
    const btOpen  = cssOpen + 'const CSS_STYLES = '.length; // index of opening `
    const btClose = text.indexOf('`', btOpen + 1);           // index of closing `
    if (btClose === -1) return raw;

    const before  = text.slice(0, btOpen + 1);
    const after   = text.slice(btClose);
    const lines   = text.slice(btOpen + 1, btClose).split('\n');

    // Split template lines into head art / shaft / balls art by decoration detection
    let sStart = 0;
    while (sStart < lines.length && isDecoLine(lines[sStart])) sStart++;
    let sEnd = lines.length - 1;
    while (sEnd >= sStart && isDecoLine(lines[sEnd])) sEnd--;

    if (sStart > sEnd) return raw; // no shaft — return unchanged

    const headLines  = lines.slice(0, sStart);
    const shaftLines = lines.slice(sStart, sEnd + 1);
    const ballsLines = lines.slice(sEnd + 1);

    // Strip existing fill comments and collapse to one flat CSS string
    const rawCSS = shaftLines
        .map(l => l.replace(/\/\*-+\*\//g, '').trim())
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Protect ${...} template-literal interpolations from the tokenizer below.
    // The tokenizer treats { and } as CSS block delimiters, which would split
    // an interpolation like ${ASSETS.HEADER_IMG} across units and inject fill
    // comments / stray spaces inside it (corrupting e.g. url('${...}') with a
    // trailing space). Swap each interpolation for a brace-free placeholder
    // now and restore it after packing.
    const interpolations = [];
    const guardedCSS = rawCSS.replace(/\$\{[^}]*\}/g, match => {
        const token = `BBGLPH${interpolations.length}BBGLPH`;
        interpolations.push(match);
        return token;
    });

    // Tokenize: each unit ends with ; or } (terminator stays attached)
    const units = [];
    const re = /[^;{}]*[;{}]/g;
    let lastEnd = 0, m;
    while ((m = re.exec(guardedCSS)) !== null) {
        const u = m[0].trim();
        if (u) units.push(u);
        lastEnd = re.lastIndex;
    }
    const tail = guardedCSS.slice(lastEnd).trim();
    if (tail) units.push(tail);

    // Pack units into 120-wide lines with /*---*/ right-margin fill
    const packed = [];
    let cur = '';

    function flush() {
        if (cur === '') return;
        const rem = CSS_USABLE - cur.length;
        packed.push(CSS_PAD + cur + (rem >= 5 ? '/*' + '-'.repeat(rem - 4) + '*/' : ''));
        cur = '';
    }

    for (const unit of units) {
        const ul = unit.length;
        if (cur === '') {
            if (ul > CSS_USABLE) { packed.push(CSS_PAD + unit); } // oversized: own line, no fill
            else { cur = unit; }
        } else if (cur.length + 1 + ul <= CSS_USABLE) {
            cur += ' ' + unit;
        } else if (ul > CSS_USABLE) {
            flush();
            packed.push(CSS_PAD + unit);
        } else {
            flush();
            cur = unit;
        }
    }
    flush();

    // Restore the protected interpolations now that packing is done. Lines that
    // contained one may end up slightly over CSS_USABLE; that is cosmetic and
    // matches how interpolations were handled in the original hand-built shaft.
    const body = [...headLines, ...packed, ...ballsLines].join('\n')
        .replace(/BBGLPH(\d+)BBGLPH/g, (_, i) => interpolations[Number(i)]);

    return before + body + after;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Indent only the first line; continuation lines keep their original source
// indentation (used for verbatim node slices, whose first line starts at the
// statement keyword with no leading whitespace).
function indentFirstLine(code, indent) {
    const nl = code.indexOf('\n');
    return nl === -1 ? indent + code : indent + code.slice(0, nl) + code.slice(nl);
}

function isSectionHeader(comment) {
    return comment.type === 'CommentBlock' && /\[SECTION/.test(comment.value);
}

// Soft-wrap a collapsed single-line statement at safe points (top-level commas
// only, identified via Babel's tokenizer so we never cut inside a string,
// template literal, regex, or base64 blob). Greedy: fewest lines for the width.
// Returns an array of segments (first segment keeps its leading indentation
// context; continuation segments are left-trimmed).
function softWrap(code, width) {
    if (code.length <= width) return [code];
    let tokens;
    try {
        tokens = parser.parse(code, { sourceType: 'script', tokens: true }).tokens;
    } catch (e) {
        return [code]; // can't tokenize safely — leave as one line
    }
    const breaks = tokens.filter(t => t.type && t.type.label === ',').map(t => t.end);
    if (!breaks.length) return [code];

    const segs = [];
    let start = 0;
    let lastFit = -1;
    let bi = 0;
    while (bi < breaks.length) {
        const pos = breaks[bi];
        if (pos - start <= width) {
            lastFit = pos;
            bi++;
        } else if (lastFit > start) {
            segs.push(code.slice(start, lastFit));
            start = lastFit;
            lastFit = -1;
        } else {
            // A single comma-free span already exceeds width — break here anyway.
            segs.push(code.slice(start, pos));
            start = pos;
            lastFit = -1;
            bi++;
        }
    }
    segs.push(code.slice(start));
    return segs.map((s, i) => (i === 0 ? s : s.replace(/^\s+/, '')));
}

function declaredNames(node) {
    if (node.type !== 'VariableDeclaration') return [];
    return node.declarations
        .map(d => (d.id && d.id.type === 'Identifier' ? d.id.name : null))
        .filter(Boolean);
}

// Emit CUSTOM_STICKERS with one collapsed line per category.
function emitCompactStickers(node, combined) {
    const decl = node.declarations.find(d => d.id && d.id.name === 'CUSTOM_STICKERS');
    if (!decl || !decl.init || decl.init.type !== 'ArrayExpression') {
        return indentFirstLine(combined.slice(node.start, node.end), INDENT);
    }
    const elements = decl.init.elements.filter(Boolean);
    const groups = [];
    for (const el of elements) {
        const catComment = (el.leadingComments || []).find(c => c.type === 'CommentLine');
        if (catComment) groups.push({ label: catComment.value.trim(), items: [] });
        if (!groups.length) groups.push({ label: null, items: [] });
        groups[groups.length - 1].items.push(el);
    }
    const lines = [INDENT + 'const CUSTOM_STICKERS = ['];
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i];
        if (g.label) lines.push(INDENT + '//' + g.label);
        const compact = g.items.map(el => generate(el, { concise: true, comments: false }).code).join(',');
        lines.push(INDENT + compact + (i < groups.length - 1 ? ',' : ''));
    }
    lines.push(INDENT + '];');
    return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
function build() {
    // Strip a leading BOM — Tampermonkey expects "// ==UserScript==" as the
    // literal first bytes of the file.
    const header = fs.readFileSync(HEADER_FILE, 'utf8').replace(/^﻿/, '').replace(/\s+$/, '');

    // Concatenate body files, recording each file's [start, end) char range.
    let combined = '';
    const ranges = [];
    for (const file of BODY_FILES) {
        const text = fs.readFileSync(path.join(BEAUT_SRC, file), 'utf8');
        const start = combined.length;
        combined += text;
        ranges.push({ file, start, end: combined.length });
    }

    const fileAt = pos => {
        for (const r of ranges) if (pos >= r.start && pos < r.end) return r.file;
        return null;
    };
    const rangeOf = file => ranges.find(r => r.file === file);

    // Parse the whole IIFE.
    let ast;
    try {
        ast = parser.parse(combined, { sourceType: 'script', ranges: true });
    } catch (e) {
        console.error('Parse failed:', e.message);
        if (e.loc) {
            const line = combined.split('\n')[e.loc.line - 1] || '';
            console.error('  near: ' + line.trim().slice(0, 120));
        }
        process.exit(1);
    }

    // Locate the IIFE FunctionExpression: program body is [ ExpressionStatement
    // -> CallExpression(callee = FunctionExpression) ].
    const exprStmt = ast.program.body.find(n => n.type === 'ExpressionStatement');
    if (!exprStmt) throw new Error('Could not find the IIFE expression statement.');
    let fnExpr = exprStmt.expression;
    if (fnExpr.type === 'CallExpression') fnExpr = fnExpr.callee;
    if (!fnExpr.body || !fnExpr.body.body) throw new Error('Could not find the IIFE function body.');

    const directives = fnExpr.body.directives || [];
    const stmts = fnExpr.body.body;

    const out = [];
    out.push('(function() {');

    // Directives ('use strict') first.
    for (const d of directives) {
        out.push(INDENT + "'" + d.value.value + "';");
    }

    const emittedComments = new Set();
    const emittedVerbatimFiles = new Set();

    for (const node of stmts) {
        const file = fileAt(node.start);

        // Verbatim section (Styles / Data): emit the whole file once, in place.
        // The Styles file (04) gets CSS shaft formatting applied on the way out;
        // the Data file (05) is fully verbatim.
        if (VERBATIM_FILES.has(file)) {
            if (!emittedVerbatimFiles.has(file)) {
                emittedVerbatimFiles.add(file);
                const r = rangeOf(file);
                const raw = combined.slice(r.start, r.end);
                const section = file === '04-section-iii-styles.js'
                    ? formatStylesSection(raw)
                    : raw;
                out.push('');
                out.push(section.replace(/\s+$/, ''));
                out.push('');
            }
            continue;
        }

        // Preserved [SECTION] header comments (with surrounding blank lines).
        for (const c of node.leadingComments || []) {
            if (emittedComments.has(c.start)) continue;
            if (isSectionHeader(c)) {
                emittedComments.add(c.start);
                out.push('');
                out.push(INDENT + combined.slice(c.start, c.end));
                out.push('');
            }
        }

        // CUSTOM_STICKERS: one collapsed line per category.
        if (declaredNames(node).includes('CUSTOM_STICKERS')) {
            out.push(emitCompactStickers(node, combined));
            continue;
        }

        // Verbatim declarations: keep original layout/comments.
        if (declaredNames(node).some(n => VERBATIM_DECLS.has(n))) {
            out.push(indentFirstLine(combined.slice(node.start, node.end), INDENT));
            continue;
        }

        // Collapse to a single line (comments stripped).
        const code = generate(node, { concise: true, comments: false }).code;
        const segs = softWrap(code, LINE_WIDTH);
        // First line at base indent; continuation lines one level deeper.
        out.push(segs.map((s, i) => (i === 0 ? INDENT : INDENT + INDENT) + s).join('\n'));
    }

    // IIFE close (matches 99-iife-close.js).
    out.push('');
    out.push(INDENT + '//# sourceURL=BBGL.js');
    out.push('})();');

    // Assemble: header + blank line + body. Normalize 3+ blank lines to 1.
    let body = out.join('\n').replace(/\n{3,}/g, '\n\n');
    // Normalize to uniform LF (the header file may carry CRLF).
    const result = (header + '\n\n' + body + '\n').replace(/\r\n/g, '\n');

    fs.writeFileSync(OUT_FILE, result, 'utf8');
    console.log('Wrote ' + OUT_FILE);
    console.log('  ' + result.split('\n').length + ' lines, ' + result.length + ' bytes');
}

build();
