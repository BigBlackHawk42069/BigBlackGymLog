    /**
     *  [SECTION VIII] THE GAINS (Sticker Engine)
     *  ========================================================================
     *  You may not get laid, but you'll have
     *  the sticker to prove it.
     */

    function loadStickerData() {
        const unlocked = runtime.demoMode ? 1 : DataController.getUnlockedCount() || 1;
        const it = [];
        for (let i = 1; i <= 50; i++) {
            const c = CUSTOM_STICKERS.find(s => s.id === i);
            if (c) it.push({
                type: 'image',
                ...c,
                unlocked: i <= unlocked
            });
            else it.push(null);
        }
        runtime.stickerData = it;
    }

    // Total numbered pages (the sponsor page at STICKER_SPONSOR_PAGE sits before these and is not
    // counted here).
    function stickerPageCount() {
        return Math.ceil(runtime.stickerData.length / 10);
    }

    // PAGE_TITLES stays plainly 0-indexed; only the sponsor page needs translating.
    function stickerPageTitle(p) {
        return p === STICKER_SPONSOR_PAGE ? STICKER_SPONSOR_TITLE : (PAGE_TITLES[p] || "");
    }

    // The single place page state is mutated — clamped to the real page range so no caller has to
    // carry its own bounds guard. Persisting to viewState here (rather than at each call site) is
    // what makes every control's page selection survive a panel close/reopen.
    function gotoStickerPage(p) {
        const t = Math.max(STICKER_SPONSOR_PAGE, Math.min(p, stickerPageCount() - 1));
        if (t === runtime.currentStickerPage) return;
        runtime.currentStickerPage = t;
        viewState.currentStickerPage = t;
        saveViewState();
        renderStickers();
    }

    // One dot builder for every page, sponsor included. The sponsor dot always carries
    // pg-dot-sponsor (its gold treatment is pure CSS off that class, so it reads as gold from every
    // page, not just its own) and picks up 'active' by the same rule as the numbered dots.
    function renderStickerDots() {
        const dc = dom.stickerPagination;
        if (!dc) return;
        dc.innerHTML = '';
        const cur = runtime.currentStickerPage;
        for (let i = STICKER_SPONSOR_PAGE; i < stickerPageCount(); i++) {
            const d = document.createElement('div');
            d.className = 'pg-dot' +
                (i === STICKER_SPONSOR_PAGE ? ' pg-dot-sponsor' : '') +
                (i === cur ? ' active' : '');
            d.onclick = () => gotoStickerPage(i);
            dc.appendChild(d);
        }
    }

    function renderStickers() {
        Perf.start('renderStickers');
        refreshSwipeGates();
        if (!runtime.stickerData.length) loadStickerData();
        const isSponsor = runtime.currentStickerPage === STICKER_SPONSOR_PAGE;
        const sg = document.getElementById('bbgl-sponsor-grid');
        if (sg) sg.style.display = isSponsor ? 'grid' : 'none';
        if (dom.stickerGrid) dom.stickerGrid.style.display = isSponsor ? 'none' : '';
        const te = dom.stickerTitle;
        if (te) te.innerText = stickerPageTitle(runtime.currentStickerPage);
        const tp = stickerPageCount(),
            pb = dom.stickerPrev,
            nb = dom.stickerNext;
        if (pb) {
            pb.classList.toggle('disabled', runtime.currentStickerPage <= STICKER_SPONSOR_PAGE);
            // Gold when the step it would take lands on the sponsor page.
            pb.classList.toggle('is-sponsor', runtime.currentStickerPage === 0);
        }
        if (nb) nb.classList.toggle('disabled', runtime.currentStickerPage >= tp - 1);
        renderStickerDots();
        // Docked against the SVG icon toolbar, same as the achievements pagination footer — see
        // layoutToolbarPaginationPosition() (07-section-vi-ui.js). Doesn't depend on which sticker
        // page is showing, so this runs unconditionally ahead of every return below rather than
        // being duplicated at each one.
        retryToolbarPaginationLayout(() => document.getElementById('bbgl-top-panel').classList.contains('viewing-stickers'));
        if (isSponsor) {
            const comingSoon = document.getElementById('bbgl-coming-soon');
            if (comingSoon) comingSoon.style.display = 'none';
            Perf.end('renderStickers');
            return;
        }
        const start = runtime.currentStickerPage * 10,
            pi = runtime.stickerData.slice(start, start + 10);
        if (runtime.stickerSlots.length === 0) {
            Perf.end('renderStickers');
            return;
        }
        let comingSoonDiv = document.getElementById('bbgl-coming-soon');
        if (runtime.currentStickerPage >= 2) {
            for (let i = 0; i < 10; i++) runtime.stickerSlots[i].style.display = 'none';
            if (!comingSoonDiv) {
                const g = document.getElementById('bbgl-sticker-container') || dom.stickerContainer;
                if (g) {
                    const cs = document.createElement('div');
                    cs.id = 'bbgl-coming-soon';
                    cs.className = 'bbgl-coming-soon';
                    cs.innerHTML = 'Cumming<br>Soon...';
                    g.appendChild(cs);
                }
            } else comingSoonDiv.style.display = 'block';
        } else {
            if (comingSoonDiv) comingSoonDiv.style.display = 'none';
            for (let i = 0; i < 10; i++) {
                const sl = runtime.stickerSlots[i],
                    img = sl.querySelector('.sticker-img'),
                    it = pi[i];
                sl.style.display = '';
                if (it) {
                    sl.className = 'sticker-slot active-slot';
                    if (it.unlocked) {
                        sl.classList.add('has-item');
                        sl.classList.remove('locked');
                        sl.setAttribute('data-tooltip', `${it.name}`);
                        sl.onclick = () => openItemViewer(it);
                    } else {
                        sl.classList.add('has-item', 'locked');
                        sl.setAttribute('data-tooltip', TOOLTIPS.LOCKED);
                        sl.onclick = null;
                    }
                    if (img.src !== it.url) img.src = it.url;
                } else {
                    sl.className = 'sticker-slot';
                    sl.onclick = null;
                }
            }
        }
        Perf.end('renderStickers');
    }

    function animateViewer(ts) {
        if (document.hidden || runtime.currentOpenedItemId === null || viewState.subView !== 'stickers' && viewState.subView !== 'viewer' && runtime.currentOpenedItemId === null) {
            if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
            runtime.viewerLoopId = null;
            return;
        }
        if (!runtime.lastFrameTime) runtime.lastFrameTime = ts;
        const el = ts - runtime.lastFrameTime;
        if (el > 17) {
            runtime.lastFrameTime = ts - (el % 17);
            const ped = dom.viPedestal,
                obj = dom.viObj;
            if (ped && obj) {
                runtime.viewerRotation += runtime.viewerSpeed;
                ped.style.transform = `rotateY(${runtime.viewerRotation}deg) translateZ(0)`;
                if (obj.classList.contains('is-image')) {
                    const rad = (runtime.viewerRotation * Math.PI) / 180,
                        br = (0.7 + (Math.sin(rad) * 0.3)).toFixed(2),
                        isF = Math.cos(rad) > -0.2 ? 1 : 0;
                    obj.style.setProperty('--sheen-pos', (runtime.viewerRotation * 2.5) + '% 0%');
                    obj.style.setProperty('--back-brightness', br);
                    obj.style.setProperty('--sheen-opacity', isF);
                }
            }
        }
        runtime.viewerLoopId = requestAnimationFrame(animateViewer);
    }
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && runtime.currentOpenedItemId !== null) {
            if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
            animateViewer();
        }
    });

    /**
     *  Brand-mark placement
     *  ------------------------------------------------------------------------
     *  The maker's mark (.lb-brand) is centred on the silhouette's pole of inaccessibility — the
     *  centre of the largest circle fitting entirely inside the opaque area — so it lands on the
     *  widest stretch of backing rather than the bounding-box centre (often a gap between limb and
     *  torso). Fixed size on purpose: scaling it per-sticker would stop it reading as branding.
     *
     *  Anchors are normalised to IMAGE space and cached per URL (pure image analysis); projecting
     *  into ELEMENT space depends on the live box (.layer-back masks with contain), so that half
     *  re-runs on every resize.
     */
    const _brandAnchors = new Map();

    // Two-pass chamfer distance transform over the alpha channel. Downscaled to MAX on
    // the longest edge first: the anchor only needs to be accurate to a few percent and
    // this keeps the whole pass in the low single-digit milliseconds.
    function _poleOfInaccessibility(img, MAX = 128) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        if (!iw || !ih) return null;
        const k = Math.min(1, MAX / Math.max(iw, ih)),
            w = Math.max(1, Math.round(iw * k)),
            h = Math.max(1, Math.round(ih * k)),
            cv = document.createElement('canvas');
        cv.width = w;
        cv.height = h;
        const g = cv.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, w, h);
        const px = g.getImageData(0, 0, w, h).data,
            INF = 1e9,
            D = 1,
            DG = 1.414,
            d = new Float32Array(w * h);
        // Seed: opaque pixels start unknown, transparent ones are already distance 0.
        for (let i = 0; i < w * h; i++) d[i] = px[i * 4 + 3] > 128 ? INF : 0;
        // Anything outside the bitmap counts as background (the ternaries fall back to
        // 0), so a silhouette running off the edge is measured to that edge rather than
        // treated as continuing forever.
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                if (d[i] === 0) continue;
                let m = d[i];
                m = Math.min(m, (y > 0 ? d[i - w] : 0) + D);
                m = Math.min(m, (x > 0 ? d[i - 1] : 0) + D);
                m = Math.min(m, (y > 0 && x > 0 ? d[i - w - 1] : 0) + DG);
                m = Math.min(m, (y > 0 && x < w - 1 ? d[i - w + 1] : 0) + DG);
                d[i] = m;
            }
        }
        // Backward pass completes each distance, so the running max is only valid here.
        let best = -1, bi = -1;
        for (let y = h - 1; y >= 0; y--) {
            for (let x = w - 1; x >= 0; x--) {
                const i = y * w + x;
                if (d[i] === 0) continue;
                let m = d[i];
                m = Math.min(m, (y < h - 1 ? d[i + w] : 0) + D);
                m = Math.min(m, (x < w - 1 ? d[i + 1] : 0) + D);
                m = Math.min(m, (y < h - 1 && x < w - 1 ? d[i + w + 1] : 0) + DG);
                m = Math.min(m, (y < h - 1 && x > 0 ? d[i + w - 1] : 0) + DG);
                d[i] = m;
                if (m > best) { best = m; bi = i; }
            }
        }
        if (bi < 0 || best <= 0) return null;
        return {
            x: ((bi % w) + 0.5) / w,
            y: ((bi / w | 0) + 0.5) / h,
            ar: iw / ih
        };
    }

    // jsDelivr serves these PNGs with Access-Control-Allow-Origin:*, so an anonymous
    // crossOrigin request keeps the canvas untainted and getImageData() readable. If
    // that ever stops holding, the read throws, the anchor caches as null, and the mark
    // falls back to the centre of the box.
    function _loadBrandAnchor(url) {
        if (_brandAnchors.has(url)) return Promise.resolve(_brandAnchors.get(url));
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                let a = null;
                try { a = _poleOfInaccessibility(img); }
                catch (e) { Log.debug('[brand] anchor failed for ' + url, e); }
                _brandAnchors.set(url, a);
                resolve(a);
            };
            img.onerror = () => { _brandAnchors.set(url, null); resolve(null); };
            img.src = url;
        });
    }

    // Projects runtime.brandAnchor from image space into element space. .layer-back's
    // mask is contain-fitted and centred, so the sprite occupies a letterboxed rect
    // inside the element - this reproduces that fit and expresses the result as the
    // percentages the .lb-brand rule consumes through --lb-x / --lb-y.
    function applyBrandAnchor() {
        const lb = dom.itemViewer && dom.itemViewer.querySelector('.layer-back');
        if (!lb) return;
        const a = runtime.brandAnchor;
        if (!a) {
            lb.style.removeProperty('--lb-x');
            lb.style.removeProperty('--lb-y');
            return;
        }
        const W = lb.clientWidth, H = lb.clientHeight;
        if (!W || !H) return;
        let fw, fh;
        if (W / H > a.ar) { fh = H; fw = H * a.ar; }
        else { fw = W; fh = W / a.ar; }
        const ox = (W - fw) / 2, oy = (H - fh) / 2;
        lb.style.setProperty('--lb-x', (((ox + a.x * fw) / W) * 100).toFixed(3) + '%');
        lb.style.setProperty('--lb-y', (((oy + a.y * fh) / H) * 100).toFixed(3) + '%');
    }

    function positionBrandMark(lb, it) {
        runtime.brandAnchor = null;
        applyBrandAnchor();
        if (!runtime.brandResizeObserver && typeof ResizeObserver === 'function' && dom.itemViewer) {
            runtime.brandResizeObserver = new ResizeObserver(() => applyBrandAnchor());
            runtime.brandResizeObserver.observe(dom.itemViewer);
        }
        const id = it.id;
        _loadBrandAnchor(it.url).then(a => {
            // A different sticker may have been opened while the image was decoding.
            if (runtime.currentOpenedItemId !== id) return;
            runtime.brandAnchor = a;
            applyBrandAnchor();
        });
    }

    function openItemViewer(it, sv = true) {
        if (runtime.currentOpenedItemId === it.id) return;
        if (sv) {
            viewState.activeItemId = it.id;
            saveViewState();
        }
        TooltipController.hide();
        const v = dom.itemViewer,
            bp = dom.bottomPanel,
            nm = dom.viName,
            ob = dom.viObj,
            lf = ob.querySelector('.layer-front'),
            lb = ob.querySelector('.layer-back'),
            st = document.querySelector('.viewer-stage');
        runtime.currentOpenedItemId = it.id;
        bp.style.setProperty('display', 'none', 'important');
        v.classList.add('active');
        v.style.setProperty('display', 'flex', 'important');
        let ped = dom.viPedestal;
        if (!ped) {
            ped = document.createElement('div');
            ped.id = 'vi-pedestal-wrapper';
            ped.className = 'viewer-pedestal';
            st.appendChild(ped);
            ped.appendChild(ob);
            dom.viPedestal = ped;
        }
        nm.innerText = it.name;
        if (it.type === 'image') {
            ob.classList.add('is-image');
            ob.style.setProperty('--bg-mask', `url('${it.url}')`);
            if (lf) lf.style.backgroundImage = `url('${it.url}')`;
            if (lb) {
                lb.style.webkitMaskImage = `url('${it.url}')`;
                lb.style.maskImage = `url('${it.url}')`;
            }
            positionBrandMark(lb, it);
        }
        runtime.viewerRotation = 0;
        runtime.viewerSpeed = 0.3;
        if (runtime.viewerLoopId) cancelAnimationFrame(runtime.viewerLoopId);
        requestAnimationFrame(animateViewer);
        const spdUp = () => {
                runtime.viewerSpeed = 3;
            },
            spdDn = () => {
                runtime.viewerSpeed = 0.3;
            };
        st.onmousedown = spdUp;
        st.ontouchstart = spdUp;
        st.onmouseup = spdDn;
        st.onmouseleave = spdDn;
        st.ontouchend = spdDn;
        st.ontouchcancel = spdDn;
    }

    function closeItemViewer(sv = true) {
        if (sv) {
            viewState.activeItemId = null;
            saveViewState();
        }
        runtime.currentOpenedItemId = null;
        if (runtime.viewerLoopId) {
            cancelAnimationFrame(runtime.viewerLoopId);
            runtime.viewerLoopId = null;
        }
        const v = dom.itemViewer,
            bp = dom.bottomPanel;
        if (v) {
            v.classList.remove('active');
            v.style.setProperty('display', 'none', 'important');
        }
        if (bp) {
            bp.style.removeProperty('display');
            if (getComputedStyle(bp).display === 'none') bp.style.display = 'flex';
        }
    }

    function setupStickerGrid() {
        const g = dom.stickerGrid;
        if (!g) return;
        runtime.stickerSlots = [];
        g.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const s = document.createElement('div'),
                m = document.createElement('img');
            s.className = 'sticker-slot';
            m.className = 'sticker-img';
            s.appendChild(m);
            g.appendChild(s);
            runtime.stickerSlots.push(s);
        }
        const container = dom.stickerContainer;
        if (container && !document.getElementById('bbgl-sponsor-grid')) {
            const sg = document.createElement('div');
            sg.id = 'bbgl-sponsor-grid';
            sg.style.display = 'none';
            const pts = getSponsorBurstPoints();
            for (let i = 0; i < 3; i++) {
                const slot = document.createElement('div');
                slot.className = 'sticker-slot sticker-slot-sponsor active-slot locked';
                const labelText = i === 0 ? 'Corleone Faction<br>Sticker Here ;)' : 'Your Faction<br>Sticker Here';
                slot.innerHTML = `<svg class="sponsor-sticker-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="${pts}" fill="#ffffff"/></svg><span class="sponsor-sticker-label">${labelText}</span>`;
                sg.appendChild(slot);
            }
            // #bbgl-sticker-pagination-bar is a sibling of #bbgl-sticker-container now (see its own
            // comment in 04-section-iii-styles.js for why), not a descendant of it — so there's no
            // longer an anchor to insert before within this container; the sponsor grid simply
            // appends alongside the sticker grid.
            container.appendChild(sg);
        }
        renderStickers();
    }
    let _sponsorBurstPoints = null;

    function getSponsorBurstPoints() {
        if (_sponsorBurstPoints) return _sponsorBurstPoints;
        const pts = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i * 18 - 90) * Math.PI / 180;
            const r = (i % 2 === 0) ? 48 : 36;
            const x = (50 + r * Math.cos(angle)).toFixed(2);
            const y = (50 + r * Math.sin(angle)).toFixed(2);
            pts.push(`${x},${y}`);
        }
        _sponsorBurstPoints = pts.join(' ');
        return _sponsorBurstPoints;
    }

