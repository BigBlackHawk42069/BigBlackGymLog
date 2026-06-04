(function() {
    'use strict';
    if (window.__BBGL_LOADED__) return;
    window.__BBGL_LOADED__ = true;

    function isDevMode() {
        return typeof runtime !== 'undefined' && runtime && runtime.devMode;
    }

    /**
     *  [SECTION I] THE DIET PLAN (Constants & State)
     *  ========================================================================
     *  No substitutions. No cheat days. This follows the plan
     *  so that you don't have to.
     */

    const SCRIPT_VERSION = '0.9.57';
    const Log = {
        _bootShown: false,
        _badge: ['%c BBGL %c', 'background:#6a1b9a;color:#fff;font-weight:700;border-radius:3px 0 0 3px;padding:2px 6px;', 'color:#999;'],
        _isDev: isDevMode,
        boot() {
            if (this._bootShown) return;
            this._bootShown = true;
            console.log(...this._badge, `v${SCRIPT_VERSION} booted`);
        },
        info(...a) {
            console.log(...this._badge, ...a);
        },
        warn(...a) {
            console.warn(...this._badge, ...a);
        },
        error(...a) {
            console.error(...this._badge, ...a);
        },
        debug(...a) {
            if (!this._isDev()) return;
            console.log(...this._badge, '[debug]', ...a);
        },
        group(label, fn) {
            if (!this._isDev()) {
                fn();
                return;
            }
            console.groupCollapsed(...this._badge, label);
            try {
                fn();
            } finally {
                console.groupEnd();
            }
        }
    };
